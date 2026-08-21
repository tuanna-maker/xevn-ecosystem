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
 * LastVerified: catalog-sync.controller.spec.ts · catalog-sync-display.spec.ts
 *
 * @CODE-MEMORY-CHANGE 2026-07-28
 * WorkItem: D-BE-ERP-E1B-ALIAS-KEYS-01
 * change_mode: ADD
 * What: pull/{key} + get local — alias try-list (decision_types→hr_decision_types);
 *   getSyncedCatalogExact for family merge; store under actual remote key; resolvedFrom.
 * SRS: FR-HRM-SC-DEC-01 · UC-HRM-06 · BA_ERP_E1B_SRS_01 AC-SET-UI-05
 * must_keep: no new sync URL; no DDL rename; no invent L0
 * LastVerified: d-be-erp-e1b-alias-keys-01.spec.ts
 *
 * @CODE-MEMORY-CHANGE 2026-08-03
 * WorkItem: W1-B-03-TC-CAT
 * change_mode: UPGRADE
 * What: Display-ready pull/list/get — top-level name/domain/items(status_label/tone)
 *   + published_version; upsert version = XBOS publisher version (FR-UC-B04 khóa mang).
 * SRS: docs/brand-new-documents-20270801/SRS_NEW.md · FR-UC-B04 #5–6
 * API: API_CONTRACT_NEW.md §2.3–2.4 · OS 28 display-ready
 * must_keep: payload JSONB for settings-catalogs; XBOS SoT; empty honest; no invent L0
 * LastVerified: catalog-sync-display.spec.ts · catalog-sync.controller.spec.ts
 *
 * @CODE-MEMORY-CHANGE 2026-08-04
 * WorkItem: PO-UC-TC-W4-BE-SYNC-XBOSS-500
 * change_mode: FIX
 * What: Upstream unreachable → fail-fast HRM-SYNC-001 (502), không đốt alias try-list;
 *   safe JSON parse; persist miss → ApiException (không TypeError 500).
 * SRS: UC-HRM-06 · XBOS-DM-HRM-10 (pull ≠ apply ≠ clone)
 * must_keep: service JWT S2S; empty honest; Leave L2 untouched; ≠ apply-to-members/clone
 * LastVerified: catalog-sync-upstream.spec.ts · settings-catalogs.service.spec.ts syncAll
 *
 * @CODE-MEMORY-CHANGE 2026-08-04
 * WorkItem: PO-UC-TC-W4-BE-AT12-L1-CREATE-CATALOG-PULL
 * change_mode: FIX
 * What: Member OU (trsport/…) sync/pull đọc XBOS publish SoT `holding`, ghi
 *   `synced_catalogs` dưới partition OU — leave_types picker sau sync ≥1.
 *   Không apply-to-members / không clone / không seed.
 * SRS: UC-HRM-06 · XBOS-DM-HRM-10 · HRM-AT-12 create precond leave_types
 * must_keep: holding sync unchanged; pull ≠ apply ≠ clone; Leave L2 untouched; U65
 * LastVerified: catalog-sync-upstream.spec.ts · settings-catalogs.service.spec.ts
 *
 * @CODE-MEMORY-CHANGE 2026-08-04
 * WorkItem: PO-MFD-M2-ATT-SETTINGS-CATALOG-500-01
 * change_mode: FIX
 * What: listSyncedCatalogs filters invalid catalog_key before map (overview must not 500).
 * must_keep: valid keys unchanged; pull≠apply≠clone
 */
import { existsSync } from 'node:fs';
import { Injectable } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { HttpStatus } from '@nestjs/common';
import {
  extractBearerToken,
  getVerifiedInternalJwtPayload,
} from '../common/internal-auth';
import { signServiceJwt } from '../common/jwt-sign';
import { fetchWithTimeoutAndRetry } from '../common/http-retry-fetch';
import { HrmDbService } from '../db/hrm-db.service';
import {
  HRM_GROUP_MEMBER_COMPANY_SLUGS,
  MASTER_TENANT_ID,
} from '../common/hrm-list-scope';
import {
  defaultCompanyIdFromEnv,
  masterTenantIdFromEnv,
} from '../common/tenant-scope-env';
import {
  catalogAliasTryList,
  normalizeMasterCatalogKey,
  isValidCatalogKeyFormat,
} from '../settings-catalogs/hrm-settings-master-keys';
import {
  buildSyncedCatalogDisplayReady,
  extractPublishedVersion,
  type HrmSyncedCatalogItemDisplay,
} from './catalog-sync-display';

/**
 * XBOS catalog publish SoT for master tenant lives under `holding`.
 * Member OU HRM partitions (trsport/…) pull FROM holding and STORE under the OU slug.
 * Not apply-to-members / not clone — still POST sync-from-xbos / pull/:key.
 */
export function resolveXbosCatalogPublishSourceCompanyId(
  tenantId: string,
  hrmStoreCompanyId: string,
): string {
  const tenant = tenantId.trim().toLowerCase();
  const store = hrmStoreCompanyId.trim().toLowerCase();
  if (
    tenant === MASTER_TENANT_ID &&
    store !== 'holding' &&
    (HRM_GROUP_MEMBER_COMPANY_SLUGS as readonly string[]).includes(store)
  ) {
    return 'holding';
  }
  return store;
}

export interface HrmSyncedCatalog {
  tenantId: string;
  companyId: string;
  key: string;
  source: 'xbos';
  /** Publisher version (XBOS) when pull stores remote version; else row version. */
  version: number;
  /** FR-UC-B04 khóa mang — same as version after W1-B-03 pull path. */
  published_version: number;
  checksum: string;
  syncedAt: string;
  name: string | null;
  domain: string | null;
  /** OS 28 — FE-bindable items (code/label/status_label); no payload join. */
  items: HrmSyncedCatalogItemDisplay[];
  item_count: number;
  /** Raw XBOS snapshot — must_keep for settings-catalogs L1 merge. */
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

/** Network / timeout class — map to HRM-SYNC-001 (502), never bare 500. */
const UPSTREAM_NETWORK_RE =
  /fetch failed|ECONNREFUSED|ECONNRESET|ECONNABORTED|ENOTFOUND|ETIMEDOUT|socket hang up|timed out|AbortError|network/i;

/** Map transport failures to stable XBOS upstream code (UC-HRM-06). */
export function mapXbosUpstreamException(error: unknown): ApiException {
  if (error instanceof ApiException) return error;
  const aborted =
    (error instanceof DOMException && error.name === 'AbortError') ||
    (error instanceof Error && error.name === 'AbortError');
  if (aborted) {
    return new ApiException(
      'HRM-SYNC-001',
      'XBOS API request timed out',
      HttpStatus.BAD_GATEWAY,
    );
  }
  const msg = error instanceof Error ? error.message : 'XBOS API unreachable';
  if (UPSTREAM_NETWORK_RE.test(msg)) {
    return new ApiException(
      'HRM-SYNC-001',
      msg || 'XBOS API unreachable',
      HttpStatus.BAD_GATEWAY,
    );
  }
  return new ApiException(
    'HRM-SYNC-001',
    msg || 'XBOS API unreachable',
    HttpStatus.BAD_GATEWAY,
  );
}

/** UF-HRM-10 — docker/VPS must reach xbos-be (28002), not localhost:3002. */
export function resolveXbosApiBaseUrl(): string {
  const explicit = process.env.XBOS_API_URL?.trim();
  if (explicit) {
    const normalized = explicit.replace(/\/+$/, '');
    if (
      !normalized.includes('localhost') &&
      !normalized.includes('127.0.0.1')
    ) {
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
  if (
    inDocker ||
    process.env.DOCKER === '1' ||
    process.env.KUBERNETES_SERVICE_HOST
  ) {
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
        if (
          callerBearer &&
          getVerifiedInternalJwtPayload(`Bearer ${callerBearer}`)
        ) {
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

  private normalizeScopeId(
    rawScopeId: string,
    label: 'tenantId' | 'companyId',
  ): string {
    const normalized = rawScopeId.trim().toLowerCase();
    if (!/^[a-z0-9][a-z0-9_-]{1,62}$/.test(normalized)) {
      throw new ApiException(
        'HRM-SYNC-003',
        `Invalid ${label} format`,
        HttpStatus.BAD_REQUEST,
      );
    }
    return normalized;
  }

  /** OS 28 — assemble display-ready view model; keep payload for L1 consumers. */
  private mapSyncedCatalogRow(input: {
    tenantId: string;
    companyId: string;
    key: string;
    source: 'xbos';
    version: number;
    checksum: string;
    syncedAt: string;
    payload: unknown;
    resolvedFrom?: string;
  }): HrmSyncedCatalog {
    const display = buildSyncedCatalogDisplayReady(
      input.payload,
      input.version,
    );
    const version = display.published_version;
    return {
      tenantId: input.tenantId,
      companyId: input.companyId,
      key: input.key,
      source: input.source,
      version,
      published_version: display.published_version,
      checksum: input.checksum,
      syncedAt: input.syncedAt,
      name: display.name,
      domain: display.domain,
      items: display.items,
      item_count: display.item_count,
      payload: input.payload,
      ...(input.resolvedFrom ? { resolvedFrom: input.resolvedFrom } : {}),
    };
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
    await this.db.query(
      `ALTER TABLE public.synced_catalogs DROP CONSTRAINT IF EXISTS synced_catalogs_catalog_key_key;`,
    );
    await this.db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_synced_catalogs_scope_key
      ON public.synced_catalogs (tenant_id, company_id, catalog_key);
    `);
    await this.db.query(
      `ALTER TABLE public.synced_catalogs ADD COLUMN IF NOT EXISTS version INT NOT NULL DEFAULT 1;`,
    );
    await this.db.query(
      `ALTER TABLE public.synced_catalogs ADD COLUMN IF NOT EXISTS checksum TEXT NOT NULL DEFAULT '';`,
    );
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
    // Xử lý: member OU store=trsport → đọc XBOS holding SoT; persist vẫn dưới OU.
    const xbosSourceCompanyId = resolveXbosCatalogPublishSourceCompanyId(
      normalizedTenantId,
      normalizedCompanyId,
    );
    const url = `${this.xbosApiUrl}/api/xbos/config-sync/catalog/${encodeURIComponent(catalogKey)}?target=hrm&tenantId=${encodeURIComponent(normalizedTenantId)}&companyId=${encodeURIComponent(xbosSourceCompanyId)}`;
    const upstreamHeaders = this.buildXbosUpstreamHeaders(authorization, {
      tenantId: normalizedTenantId,
      companyId: xbosSourceCompanyId,
    });
    // Xử lý: concurrent bulk pull đôi khi deadlock (XBOS-SYS-001) — retry 5xx trước khi fail.
    let response: Response | undefined;
    let lastStatus = 0;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        response = await fetchWithTimeoutAndRetry(url, {
          method: 'GET',
          headers: upstreamHeaders,
        });
      } catch (e) {
        throw mapXbosUpstreamException(e);
      }
      if (response.ok || response.status === 404 || response.status < 500) {
        break;
      }
      lastStatus = response.status;
      await new Promise((resolve) => setTimeout(resolve, 120 * (attempt + 1)));
    }
    if (!response) {
      throw new ApiException(
        'HRM-SYNC-001',
        `XBOS API error ${lastStatus || 502}`,
        HttpStatus.BAD_GATEWAY,
      );
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
    let body: {
      success: boolean;
      data?: { data?: unknown };
      error?: string;
    };
    try {
      body = (await response.json()) as {
        success: boolean;
        data?: { data?: unknown };
        error?: string;
      };
    } catch {
      throw new ApiException(
        'HRM-SYNC-001',
        'XBOS API returned invalid JSON',
        HttpStatus.BAD_GATEWAY,
      );
    }
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
    const checksum = Buffer.from(JSON.stringify(remotePayload)).toString(
      'base64',
    );
    // FR-UC-B04 — store XBOS publisher version (khóa mang), not local pull counter.
    const publishedVersion = extractPublishedVersion(remotePayload, 1);
    await this.db.query(
      `
      INSERT INTO public.synced_catalogs (tenant_id, company_id, catalog_key, source_system, payload, version, checksum, synced_at)
      VALUES ($1, $2, $3, 'xbos', $4::jsonb, $6, $5, NOW())
      ON CONFLICT (tenant_id, company_id, catalog_key)
      DO UPDATE SET
        source_system = EXCLUDED.source_system,
        payload = EXCLUDED.payload,
        version = EXCLUDED.version,
        checksum = EXCLUDED.checksum,
        synced_at = NOW()
    `,
      [
        normalizedTenantId,
        normalizedCompanyId,
        catalogKey,
        JSON.stringify(remotePayload),
        checksum,
        publishedVersion,
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
    if (!row) {
      throw new ApiException(
        'HRM-SYNC-001',
        `Failed to persist catalog '${catalogKey}' after XBOS pull`,
        HttpStatus.BAD_GATEWAY,
      );
    }
    return this.mapSyncedCatalogRow({
      tenantId: normalizedTenantId,
      companyId: normalizedCompanyId,
      key: row.catalog_key,
      source: row.source_system,
      version: row.version,
      checksum: row.checksum,
      syncedAt: row.synced_at,
      payload: row.payload,
    });
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
        // Hard upstream (timeout / refused / 5xx) — fail-fast; do not burn alias try-list.
        if (e instanceof ApiException && e.code === 'HRM-SYNC-001') {
          throw e;
        }
        throw mapXbosUpstreamException(e);
      }
    }

    throw (
      lastMiss ??
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
    return this.mapSyncedCatalogRow({
      tenantId: normalizedTenantId,
      companyId: normalizedCompanyId,
      key: item.catalog_key,
      source: item.source_system,
      version: item.version,
      checksum: item.checksum,
      syncedAt: item.synced_at,
      payload: item.payload,
    });
  }

  /** Alias-aware get — try storageKey then aliases (API_DESIGN §7.2). */
  async getSyncedCatalog(
    catalogKey: string,
    tenantId: string,
    companyId: string,
  ) {
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
    const data = res.rows
      .filter((row: { catalog_key: string }) =>
        isValidCatalogKeyFormat(row.catalog_key),
      )
      .map(
        (row: {
          catalog_key: string;
          source_system: 'xbos';
          version: number;
          checksum: string;
          synced_at: string;
          payload: unknown;
        }) =>
          this.mapSyncedCatalogRow({
            tenantId: normalizedTenantId,
            companyId: normalizedCompanyId,
            key: row.catalog_key.trim().toLowerCase(),
            source: row.source_system,
            version: row.version,
            checksum: row.checksum,
            syncedAt: row.synced_at,
            payload: row.payload,
          }),
      );
    return { total: data.length, data };
  }

  async getCatalogSyncStatus(
    tenantId: string,
    companyId: string,
  ): Promise<HrmCatalogSyncStatus> {
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
  async listRemoteCatalogsFromXbos(
    tenantId: string,
    companyId: string,
    authorization?: string,
  ) {
    const normalizedTenantId = this.normalizeScopeId(tenantId, 'tenantId');
    const normalizedCompanyId = this.normalizeScopeId(companyId, 'companyId');
    // Xử lý: list keys từ XBOS holding SoT khi HRM store partition là member OU.
    const xbosSourceCompanyId = resolveXbosCatalogPublishSourceCompanyId(
      normalizedTenantId,
      normalizedCompanyId,
    );
    const url = `${this.xbosApiUrl}/api/xbos/config-sync/catalogs?target=hrm&tenantId=${encodeURIComponent(normalizedTenantId)}&companyId=${encodeURIComponent(xbosSourceCompanyId)}`;
    let response: Response;
    try {
      response = await fetchWithTimeoutAndRetry(url, {
        method: 'GET',
        headers: this.buildXbosUpstreamHeaders(authorization, {
          tenantId: normalizedTenantId,
          companyId: xbosSourceCompanyId,
        }),
      });
    } catch (e) {
      throw mapXbosUpstreamException(e);
    }
    if (!response.ok) {
      throw new ApiException(
        'HRM-SYNC-001',
        `XBOS API error ${response.status}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
    let body: {
      success: boolean;
      data?: {
        total?: number;
        target?: string;
        tenantId?: string;
        companyId?: string;
        data?: unknown[];
      };
      error?: string;
    };
    try {
      body = (await response.json()) as {
        success: boolean;
        data?: {
          total?: number;
          target?: string;
          tenantId?: string;
          companyId?: string;
          data?: unknown[];
        };
        error?: string;
      };
    } catch {
      throw new ApiException(
        'HRM-SYNC-001',
        'XBOS API returned invalid JSON',
        HttpStatus.BAD_GATEWAY,
      );
    }
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
