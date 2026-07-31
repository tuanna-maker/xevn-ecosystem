/**
 * @CODE-MEMORY
 * Screen: HRM → Đồng bộ danh mục XBOS (catalog-sync)
 * UC: UC-HRM-06 · UC-HRM-07 · UC-HRM-08 · FR-HRM-06
 * BR: BR-HRM-SC-SYNC-01 · BR-HRM-SC-ALIAS-01
 * SRS: docs/hrm/SRS.md · UC-HRM-06 Diễn biến pull
 * TechSpec: docs/hrm/TECHSPEC.md §11.4 · §14.8
 * API_DESIGN: docs/hrm/API_DESIGN_HRM_SETTINGS_E1B.md §7
 * Purpose: Pull/list/get L1 synced_catalogs từ XBOS config-sync; không invent L0.
 * WorkItem: (baseline) catalog-sync
 * Coded: 2026-05
 * Callers: catalog-sync.controller · settings-catalogs.service
 * Callees: XBOS /api/xbos/config-sync · public.synced_catalogs
 * must_keep: service JWT S2S; unique (tenant, company, catalog_key); empty honest
 * SOLID: Sync I/O tách khỏi Settings merge
 * LastVerified: catalog-sync.controller.spec.ts
 *
 * @CODE-MEMORY-CHANGE 2026-07-28
 * WorkItem: D-BE-ERP-E1B-ALIAS-KEYS-01
 * change_mode: ADD
 * What: pull/{key} + get local — alias try-list (decision_types→hr_decision_types);
 *   getSyncedCatalogExact for family merge; store under actual remote key; resolvedFrom.
 * SRS: FR-HRM-SC-DEC-01 · UC-HRM-06 · BA_ERP_E1B_SRS_01 AC-SET-UI-05
 * must_keep: no new sync URL; no DDL rename; no invent L0
 * LastVerified: d-be-erp-e1b-alias-keys-01.spec.ts
 */
import { existsSync } from 'node:fs';
import { Injectable } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { HttpStatus } from '@nestjs/common';
import { extractBearerToken, getVerifiedInternalJwtPayload } from '../common/internal-auth';
import { signServiceJwt } from '../common/jwt-sign';
import { fetchWithTimeoutAndRetry } from '../common/http-retry-fetch';
import { HrmDbService } from '../db/hrm-db.service';
import { defaultCompanyIdFromEnv, masterTenantIdFromEnv } from '../common/tenant-scope-env';
import {
  catalogAliasTryList,
  normalizeMasterCatalogKey,
} from '../settings-catalogs/hrm-settings-master-keys';

export interface HrmSyncedCatalog {
  tenantId: string;
  companyId: string;
  key: string;
  source: 'xbos';
  version: number;
  checksum: string;
  syncedAt: string;
  payload: unknown;
  /** Present when pull/get resolved via an alias different from the requested key. */
  resolvedFrom?: string;
}

export interface HrmCatalogSyncStatus {
  tenantId: string;
  companyId: string;
  key: 'status';
  source: 'hrm';
  status: 'connected';
  hasSyncedCatalogs: boolean;
  totalSyncedCatalogs: number;
  lastSyncedAt: string | null;
}

const XBOS_DOCKER_HOSTS = ['xbos-be', 'xevn-xbos-be-dev'] as const;

/** UF-HRM-10 — docker/VPS must reach xbos-be (28002), not localhost:3002. */
export function resolveXbosApiBaseUrl(): string {
  const explicit = process.env.XBOS_API_URL?.trim();
  if (explicit) {
    const normalized = explicit.replace(/\/+$/, '');
    if (!normalized.includes('localhost') && !normalized.includes('127.0.0.1')) {
      return normalized;
    }
  }
  const composeDefault = process.env.XEVN_XBOS_API_URL?.trim();
  if (composeDefault) {
    return composeDefault.replace(/\/+$/, '');
  }
  const port = process.env.XBOS_BE_PORT?.trim() || '28002';
  let inDocker = false;
  try {
    inDocker = existsSync('/.dockerenv');
  } catch {
    inDocker = false;
  }
  if (inDocker || process.env.DOCKER === '1' || process.env.KUBERNETES_SERVICE_HOST) {
    return `http://${XBOS_DOCKER_HOSTS[0]}:${port}`;
  }
  return `http://127.0.0.1:${port}`;
}

@Injectable()
export class CatalogSyncService {
  private get xbosApiUrl(): string {
    return resolveXbosApiBaseUrl();
  }
  constructor(private readonly db: HrmDbService) {}

  /** Server-to-server auth for XBOS `config-sync` (service JWT + internal key). */
  buildXbosUpstreamHeaders(
    authorization?: string,
    scope?: { tenantId: string; companyId: string },
  ): Record<string, string> {
    const key =
      process.env.INTERNAL_API_KEY ??
      (process.env.NODE_ENV !== 'production' ? 'xevn-dev-internal-key' : '');
    const headers: Record<string, string> = {};
    if (key) {
      headers['x-internal-api-key'] = key;
    }
    const callerBearer = extractBearerToken(authorization);
    let bearer: string | undefined;

    // UF-HRM-10 / SYNC-401: config-sync on xbos-be requires internal JWT — portal login tokens fail XBOS-AUTH-001.
    if (scope) {
      try {
        bearer = signServiceJwt({
          sub: 'hrm-be',
          svc: 'catalog-sync',
          tenantId: scope.tenantId,
          companyId: scope.companyId,
          roles: ['service'],
        });
      } catch {
        if (callerBearer && getVerifiedInternalJwtPayload(`Bearer ${callerBearer}`)) {
          bearer = callerBearer;
        }
      }
    } else if (callerBearer) {
      bearer = callerBearer;
    }

    if (bearer) {
      headers.Authorization = `Bearer ${bearer}`;
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

  /**
   * Pull one exact XBOS key into synced_catalogs (no alias resolve).
   * @CODE-MEMORY method · UC-HRM-06
   */
  private async pullExactCatalogFromXbos(
    catalogKey: string,
    normalizedTenantId: string,
    normalizedCompanyId: string,
    authorization?: string,
  ): Promise<HrmSyncedCatalog> {
    const url = `${this.xbosApiUrl}/api/xbos/config-sync/catalog/${encodeURIComponent(catalogKey)}?target=hrm&tenantId=${encodeURIComponent(normalizedTenantId)}&companyId=${encodeURIComponent(normalizedCompanyId)}`;
    let response: Response;
    try {
      response = await fetchWithTimeoutAndRetry(url, {
        method: 'GET',
        headers: this.buildXbosUpstreamHeaders(authorization, {
          tenantId: normalizedTenantId,
          companyId: normalizedCompanyId,
        }),
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
      if (response.status === 404) {
        throw new ApiException(
          'HRM-SYNC-002',
          `Catalog '${catalogKey}' unavailable from XBOS`,
          HttpStatus.NOT_FOUND,
        );
      }
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
    const remotePayload =
      body.data && typeof body.data === 'object' && 'data' in body.data
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
      [
        normalizedTenantId,
        normalizedCompanyId,
        catalogKey,
        JSON.stringify(remotePayload),
        checksum,
      ],
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
    return {
      tenantId: normalizedTenantId,
      companyId: normalizedCompanyId,
      key: row.catalog_key,
      source: row.source_system,
      version: row.version,
      checksum: row.checksum,
      syncedAt: row.synced_at,
      payload: row.payload,
    };
  }

  /**
   * Pull with E1-B alias try-list (API_DESIGN §7.1). Stores under actual remote key.
   * @CODE-MEMORY method · UC-HRM-06 · FR-HRM-SC-DEC-01 alias
   */
  async pullCatalogFromXbos(
    catalogKey: string,
    tenantId: string,
    companyId: string,
    authorization?: string,
  ): Promise<HrmSyncedCatalog> {
    await this.ensureSchema();
    const normalizedTenantId = this.normalizeScopeId(tenantId, 'tenantId');
    const normalizedCompanyId = this.normalizeScopeId(companyId, 'companyId');
    const requested = normalizeMasterCatalogKey(catalogKey);
    const tryList = catalogAliasTryList(requested);
    let lastMiss: ApiException | null = null;
    let lastUpstream: ApiException | null = null;

    for (const key of tryList) {
      try {
        const record = await this.pullExactCatalogFromXbos(
          key,
          normalizedTenantId,
          normalizedCompanyId,
          authorization,
        );
        if (key !== requested) {
          return { ...record, resolvedFrom: requested };
        }
        return record;
      } catch (e) {
        if (e instanceof ApiException && e.code === 'HRM-SYNC-002') {
          lastMiss = e;
          continue;
        }
        if (e instanceof ApiException && e.code === 'HRM-SYNC-001') {
          // Keep trying aliases on soft upstream miss patterns; hard fail after all keys.
          lastUpstream = e;
          continue;
        }
        throw e;
      }
    }

    if (lastMiss) {
      throw new ApiException(
        'HRM-SYNC-002',
        `Catalog unavailable from XBOS for aliases [${tryList.join(', ')}]`,
        HttpStatus.NOT_FOUND,
      );
    }
    throw (
      lastUpstream ??
      new ApiException(
        'HRM-SYNC-002',
        `Catalog unavailable from XBOS for aliases [${tryList.join(', ')}]`,
        HttpStatus.NOT_FOUND,
      )
    );
  }

  /** Exact L1 lookup — no alias resolve (family merge callers). Returns null if missing. */
  async getSyncedCatalogExact(
    catalogKey: string,
    tenantId: string,
    companyId: string,
  ): Promise<HrmSyncedCatalog | null> {
    await this.ensureSchema();
    const normalizedTenantId = this.normalizeScopeId(tenantId, 'tenantId');
    const normalizedCompanyId = this.normalizeScopeId(companyId, 'companyId');
    const key = normalizeMasterCatalogKey(catalogKey);
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
      [key, normalizedTenantId, normalizedCompanyId],
    );
    const item = res.rows[0];
    if (!item) {
      return null;
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
    };
  }

  /** Alias-aware get — try storageKey then aliases (API_DESIGN §7.2). */
  async getSyncedCatalog(catalogKey: string, tenantId: string, companyId: string) {
    const requested = normalizeMasterCatalogKey(catalogKey);
    const tryList = catalogAliasTryList(requested);
    for (const key of tryList) {
      const row = await this.getSyncedCatalogExact(key, tenantId, companyId);
      if (row) {
        if (key !== requested) {
          return { ...row, resolvedFrom: requested };
        }
        return row;
      }
    }
    throw new ApiException(
      'HRM-SYNC-002',
      `Catalog '${catalogKey}' not synced in HRM (tried: ${tryList.join(', ')})`,
      HttpStatus.NOT_FOUND,
    );
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

  async getCatalogSyncStatus(tenantId: string, companyId: string): Promise<HrmCatalogSyncStatus> {
    const catalogs = await this.listSyncedCatalogs(tenantId, companyId);
    const lastSyncedAt =
      catalogs.data.reduce<string | null>((latest, item) => {
        if (!latest) return item.syncedAt;
        return item.syncedAt > latest ? item.syncedAt : latest;
      }, null) ?? null;

    return {
      tenantId,
      companyId,
      key: 'status',
      source: 'hrm',
      status: 'connected',
      hasSyncedCatalogs: catalogs.total > 0,
      totalSyncedCatalogs: catalogs.total,
      lastSyncedAt,
    };
  }

  /**
   * Lists catalogs assigned to HRM on XBOS (live). Used by settings UI to bulk-pull into `synced_catalogs`.
   */
  async listRemoteCatalogsFromXbos(tenantId: string, companyId: string, authorization?: string) {
    const normalizedTenantId = this.normalizeScopeId(tenantId, 'tenantId');
    const normalizedCompanyId = this.normalizeScopeId(companyId, 'companyId');
    const url = `${this.xbosApiUrl}/api/xbos/config-sync/catalogs?target=hrm&tenantId=${encodeURIComponent(normalizedTenantId)}&companyId=${encodeURIComponent(normalizedCompanyId)}`;
    let response: Response;
    try {
      response = await fetchWithTimeoutAndRetry(url, {
        method: 'GET',
        headers: this.buildXbosUpstreamHeaders(authorization, {
          tenantId: normalizedTenantId,
          companyId: normalizedCompanyId,
        }),
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
