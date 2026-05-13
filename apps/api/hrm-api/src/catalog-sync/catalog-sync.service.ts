import { Injectable } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { HttpStatus } from '@nestjs/common';
import { fetchWithTimeoutAndRetry } from '../common/http-retry-fetch';
import { HrmDbService } from '../db/hrm-db.service';
import { defaultCompanyIdFromEnv, masterTenantIdFromEnv } from '../common/tenant-scope-env';

export interface HrmSyncedCatalog {
  tenantId: string;
  companyId: string;
  key: string;
  source: 'xbos';
  version: number;
  checksum: string;
  syncedAt: string;
  payload: unknown;
}

@Injectable()
export class CatalogSyncService {
  private readonly xbosApiUrl = process.env.XBOS_API_URL ?? 'http://localhost:3002';
  constructor(private readonly db: HrmDbService) {}

  /** Server-to-server auth for XBOS `config-sync` (internal key or configured `INTERNAL_API_KEY`). */
  buildXbosUpstreamHeaders(): Record<string, string> {
    const key =
      process.env.INTERNAL_API_KEY ??
      (process.env.NODE_ENV !== 'production' ? 'xevn-dev-internal-key' : '');
    const headers: Record<string, string> = {};
    if (key) {
      headers['x-internal-api-key'] = key;
    }
    return headers;
  }

  private normalizeScopeId(rawScopeId: string, label: 'tenantId' | 'companyId'): string {
    const normalized = rawScopeId.trim().toLowerCase();
    if (!/^[a-z0-9][a-z0-9_-]{1,62}$/.test(normalized)) {
      throw new ApiException('HRM-SYNC-003', `Invalid ${label} format`, HttpStatus.BAD_REQUEST);
    }
    return normalized;
  }

  private async ensureSchema() {
    const rawTenant = masterTenantIdFromEnv();
    const rawCompany = defaultCompanyIdFromEnv();
    if (!rawTenant || !rawCompany) {
      throw new ApiException(
        'HRM-SYNC-CONF',
        'Set MASTER_TENANT_ID or DEFAULT_TENANT_ID and DEFAULT_COMPANY_ID (or DEFAULT_COMPANY_HEADER_ID) for catalog DDL bootstrap.',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
    const tenantDdl = this.normalizeScopeId(rawTenant, 'tenantId');
    const companyDdl = this.normalizeScopeId(rawCompany, 'companyId');
    const tenantSql = tenantDdl.replace(/'/g, "''");
    const companySql = companyDdl.replace(/'/g, "''");
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.synced_catalogs (
        id BIGSERIAL PRIMARY KEY,
        tenant_id TEXT NOT NULL DEFAULT '${tenantSql}',
        company_id TEXT NOT NULL DEFAULT '${companySql}',
        catalog_key TEXT NOT NULL,
        source_system TEXT NOT NULL,
        payload JSONB NOT NULL,
        version INT NOT NULL DEFAULT 1,
        checksum TEXT NOT NULL DEFAULT '',
        synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await this.db.query(
      `ALTER TABLE public.synced_catalogs ADD COLUMN IF NOT EXISTS tenant_id TEXT NOT NULL DEFAULT '${tenantSql}';`,
    );
    await this.db.query(
      `ALTER TABLE public.synced_catalogs ADD COLUMN IF NOT EXISTS company_id TEXT NOT NULL DEFAULT '${companySql}';`,
    );
    await this.db.query(`ALTER TABLE public.synced_catalogs DROP CONSTRAINT IF EXISTS synced_catalogs_catalog_key_key;`);
    await this.db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_synced_catalogs_scope_key
      ON public.synced_catalogs (tenant_id, company_id, catalog_key);
    `);
    await this.db.query(`ALTER TABLE public.synced_catalogs ADD COLUMN IF NOT EXISTS version INT NOT NULL DEFAULT 1;`);
    await this.db.query(`ALTER TABLE public.synced_catalogs ADD COLUMN IF NOT EXISTS checksum TEXT NOT NULL DEFAULT '';`);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.sync_audit_logs (
        id BIGSERIAL PRIMARY KEY,
        catalog_key TEXT NOT NULL,
        source_system TEXT NOT NULL,
        action TEXT NOT NULL,
        payload JSONB NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
  }

  async pullCatalogFromXbos(catalogKey: string, tenantId: string, companyId: string) {
    await this.ensureSchema();
    const normalizedTenantId = this.normalizeScopeId(tenantId, 'tenantId');
    const normalizedCompanyId = this.normalizeScopeId(companyId, 'companyId');
    const url = `${this.xbosApiUrl}/api/xbos/config-sync/catalog/${catalogKey}?target=hrm&tenantId=${encodeURIComponent(normalizedTenantId)}&companyId=${encodeURIComponent(normalizedCompanyId)}`;
    let response: Response;
    try {
      response = await fetchWithTimeoutAndRetry(url, {
        method: 'GET',
        headers: this.buildXbosUpstreamHeaders(),
      });
    } catch (e) {
      if (e instanceof ApiException) throw e;
      const aborted =
        (e instanceof DOMException && e.name === 'AbortError') ||
        (e instanceof Error && e.name === 'AbortError');
      if (aborted) {
        throw new ApiException('HRM-SYNC-001', 'XBOS API request timed out', HttpStatus.BAD_GATEWAY);
      }
      const msg = e instanceof Error ? e.message : 'XBOS API unreachable';
      throw new ApiException('HRM-SYNC-001', msg, HttpStatus.BAD_GATEWAY);
    }
    if (!response.ok) {
      throw new ApiException(
        'HRM-SYNC-001',
        `XBOS API error ${response.status}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
    const body = (await response.json()) as {
      success: boolean;
      data?: { data?: unknown };
      error?: string;
    };
    const remotePayload = body.data && typeof body.data === 'object' && 'data' in body.data
      ? body.data.data
      : body.data;
    if (!body.success || !remotePayload) {
      throw new ApiException(
        'HRM-SYNC-002',
        body.error ?? 'Catalog unavailable from XBOS',
        HttpStatus.NOT_FOUND,
      );
    }
    const checksum = Buffer.from(JSON.stringify(remotePayload)).toString('base64');
    await this.db.query(
      `
      INSERT INTO public.synced_catalogs (tenant_id, company_id, catalog_key, source_system, payload, version, checksum, synced_at)
      VALUES ($1, $2, $3, 'xbos', $4::jsonb, 1, $5, NOW())
      ON CONFLICT (tenant_id, company_id, catalog_key)
      DO UPDATE SET
        source_system = EXCLUDED.source_system,
        payload = EXCLUDED.payload,
        version = public.synced_catalogs.version + 1,
        checksum = EXCLUDED.checksum,
        synced_at = NOW()
    `,
      [normalizedTenantId, normalizedCompanyId, catalogKey, JSON.stringify(remotePayload), checksum],
    );
    await this.db.query(
      `
      INSERT INTO public.sync_audit_logs (catalog_key, source_system, action, payload)
      VALUES ($1, 'xbos', 'pull_upsert', $2::jsonb)
    `,
      [catalogKey, JSON.stringify(remotePayload)],
    );
    const rowRes = await this.db.query<{
      catalog_key: string;
      source_system: 'xbos';
      version: number;
      checksum: string;
      synced_at: string;
      payload: unknown;
    }>(
      `
      SELECT catalog_key, source_system, version, checksum, synced_at, payload
      FROM public.synced_catalogs
      WHERE catalog_key = $1 AND tenant_id = $2 AND company_id = $3
    `,
      [catalogKey, normalizedTenantId, normalizedCompanyId],
    );
    const row = rowRes.rows[0];
    const record: HrmSyncedCatalog = {
      tenantId: normalizedTenantId,
      companyId: normalizedCompanyId,
      key: row.catalog_key,
      source: row.source_system,
      version: row.version,
      checksum: row.checksum,
      syncedAt: row.synced_at,
      payload: row.payload,
    };
    return record;
  }

  async getSyncedCatalog(catalogKey: string, tenantId: string, companyId: string) {
    await this.ensureSchema();
    const normalizedTenantId = this.normalizeScopeId(tenantId, 'tenantId');
    const normalizedCompanyId = this.normalizeScopeId(companyId, 'companyId');
    const res = await this.db.query<{
      catalog_key: string;
      source_system: 'xbos';
      version: number;
      checksum: string;
      synced_at: string;
      payload: unknown;
    }>(
      `
      SELECT catalog_key, source_system, version, checksum, synced_at, payload
      FROM public.synced_catalogs
      WHERE catalog_key = $1 AND tenant_id = $2 AND company_id = $3
    `,
      [catalogKey, normalizedTenantId, normalizedCompanyId],
    );
    const item = res.rows[0];
    if (!item) {
      throw new ApiException(
        'HRM-SYNC-002',
        `Catalog '${catalogKey}' not synced in HRM`,
        HttpStatus.NOT_FOUND,
      );
    }
    return {
      tenantId: normalizedTenantId,
      companyId: normalizedCompanyId,
      key: item.catalog_key,
      source: item.source_system,
      version: item.version,
      checksum: item.checksum,
      syncedAt: item.synced_at,
      payload: item.payload,
    } as HrmSyncedCatalog;
  }

  async listSyncedCatalogs(tenantId: string, companyId: string) {
    await this.ensureSchema();
    const normalizedTenantId = this.normalizeScopeId(tenantId, 'tenantId');
    const normalizedCompanyId = this.normalizeScopeId(companyId, 'companyId');
    const res = await this.db.query<{
      catalog_key: string;
      source_system: 'xbos';
      version: number;
      checksum: string;
      synced_at: string;
      payload: unknown;
    }>(
      `
      SELECT catalog_key, source_system, version, checksum, synced_at, payload
      FROM public.synced_catalogs
      WHERE tenant_id = $1 AND company_id = $2
      ORDER BY catalog_key
    `,
      [normalizedTenantId, normalizedCompanyId],
    );
    const data = res.rows.map(
      (row: {
        catalog_key: string;
        source_system: 'xbos';
        version: number;
        checksum: string;
        synced_at: string;
        payload: unknown;
      }) =>
        ({
          tenantId: normalizedTenantId,
          companyId: normalizedCompanyId,
          key: row.catalog_key,
          source: row.source_system,
          version: row.version,
          checksum: row.checksum,
          syncedAt: row.synced_at,
          payload: row.payload,
        }) as HrmSyncedCatalog,
    );
    return { total: data.length, data };
  }

  /**
   * Lists catalogs assigned to HRM on XBOS (live). Used by settings UI to bulk-pull into `synced_catalogs`.
   */
  async listRemoteCatalogsFromXbos(tenantId: string, companyId: string) {
    const normalizedTenantId = this.normalizeScopeId(tenantId, 'tenantId');
    const normalizedCompanyId = this.normalizeScopeId(companyId, 'companyId');
    const url = `${this.xbosApiUrl}/api/xbos/config-sync/catalogs?target=hrm&tenantId=${encodeURIComponent(normalizedTenantId)}&companyId=${encodeURIComponent(normalizedCompanyId)}`;
    let response: Response;
    try {
      response = await fetchWithTimeoutAndRetry(url, {
        method: 'GET',
        headers: this.buildXbosUpstreamHeaders(),
      });
    } catch (e) {
      if (e instanceof ApiException) throw e;
      const aborted =
        (e instanceof DOMException && e.name === 'AbortError') ||
        (e instanceof Error && e.name === 'AbortError');
      if (aborted) {
        throw new ApiException('HRM-SYNC-001', 'XBOS API request timed out', HttpStatus.BAD_GATEWAY);
      }
      const msg = e instanceof Error ? e.message : 'XBOS API unreachable';
      throw new ApiException('HRM-SYNC-001', msg, HttpStatus.BAD_GATEWAY);
    }
    if (!response.ok) {
      throw new ApiException(
        'HRM-SYNC-001',
        `XBOS API error ${response.status}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
    const body = (await response.json()) as {
      success: boolean;
      data?: { total?: number; target?: string; tenantId?: string; companyId?: string; data?: unknown[] };
      error?: string;
    };
    if (!body.success || !body.data) {
      throw new ApiException(
        'HRM-SYNC-002',
        body.error ?? 'Catalog list unavailable from XBOS',
        HttpStatus.NOT_FOUND,
      );
    }
    return {
      total: body.data.total ?? 0,
      target: body.data.target ?? 'hrm',
      tenantId: body.data.tenantId ?? normalizedTenantId,
      companyId: body.data.companyId ?? normalizedCompanyId,
      data: Array.isArray(body.data.data) ? body.data.data : [],
    };
  }
}
