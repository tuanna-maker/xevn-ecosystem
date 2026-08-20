"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CatalogSyncService = void 0;
exports.resolveXbosApiBaseUrl = resolveXbosApiBaseUrl;
const node_fs_1 = require("node:fs");
const common_1 = require("@nestjs/common");
const api_exception_1 = require("../common/api.exception");
const common_2 = require("@nestjs/common");
const internal_auth_1 = require("../common/internal-auth");
const jwt_sign_1 = require("../common/jwt-sign");
const http_retry_fetch_1 = require("../common/http-retry-fetch");
const hrm_db_service_1 = require("../db/hrm-db.service");
const tenant_scope_env_1 = require("../common/tenant-scope-env");
const XBOS_DOCKER_HOSTS = ['xbos-be', 'xevn-xbos-be-dev'];
function resolveXbosApiBaseUrl() {
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
        inDocker = (0, node_fs_1.existsSync)('/.dockerenv');
    }
    catch {
        inDocker = false;
    }
    if (inDocker || process.env.DOCKER === '1' || process.env.KUBERNETES_SERVICE_HOST) {
        return `http://${XBOS_DOCKER_HOSTS[0]}:${port}`;
    }
    return `http://127.0.0.1:${port}`;
}
let CatalogSyncService = class CatalogSyncService {
    db;
    get xbosApiUrl() {
        return resolveXbosApiBaseUrl();
    }
    constructor(db) {
        this.db = db;
    }
    buildXbosUpstreamHeaders(authorization, scope) {
        const key = process.env.INTERNAL_API_KEY ??
            (process.env.NODE_ENV !== 'production' ? 'xevn-dev-internal-key' : '');
        const headers = {};
        if (key) {
            headers['x-internal-api-key'] = key;
        }
        const callerBearer = (0, internal_auth_1.extractBearerToken)(authorization);
        let bearer;
        if (scope) {
            try {
                bearer = (0, jwt_sign_1.signServiceJwt)({
                    sub: 'hrm-be',
                    svc: 'catalog-sync',
                    tenantId: scope.tenantId,
                    companyId: scope.companyId,
                    roles: ['service'],
                });
            }
            catch {
                if (callerBearer && (0, internal_auth_1.getVerifiedInternalJwtPayload)(`Bearer ${callerBearer}`)) {
                    bearer = callerBearer;
                }
            }
        }
        else if (callerBearer) {
            bearer = callerBearer;
        }
        if (bearer) {
            headers.Authorization = `Bearer ${bearer}`;
        }
        return headers;
    }
    normalizeScopeId(rawScopeId, label) {
        const normalized = rawScopeId.trim().toLowerCase();
        if (!/^[a-z0-9][a-z0-9_-]{1,62}$/.test(normalized)) {
            throw new api_exception_1.ApiException('HRM-SYNC-003', `Invalid ${label} format`, common_2.HttpStatus.BAD_REQUEST);
        }
        return normalized;
    }
    async ensureSchema() {
        const rawTenant = (0, tenant_scope_env_1.masterTenantIdFromEnv)();
        const rawCompany = (0, tenant_scope_env_1.defaultCompanyIdFromEnv)();
        if (!rawTenant || !rawCompany) {
            throw new api_exception_1.ApiException('HRM-SYNC-CONF', 'Set MASTER_TENANT_ID or DEFAULT_TENANT_ID and DEFAULT_COMPANY_ID (or DEFAULT_COMPANY_HEADER_ID) for catalog DDL bootstrap.', common_2.HttpStatus.SERVICE_UNAVAILABLE);
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
        await this.db.query(`ALTER TABLE public.synced_catalogs ADD COLUMN IF NOT EXISTS tenant_id TEXT NOT NULL DEFAULT '${tenantSql}';`);
        await this.db.query(`ALTER TABLE public.synced_catalogs ADD COLUMN IF NOT EXISTS company_id TEXT NOT NULL DEFAULT '${companySql}';`);
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
    async pullCatalogFromXbos(catalogKey, tenantId, companyId, authorization) {
        await this.ensureSchema();
        const normalizedTenantId = this.normalizeScopeId(tenantId, 'tenantId');
        const normalizedCompanyId = this.normalizeScopeId(companyId, 'companyId');
        const url = `${this.xbosApiUrl}/api/xbos/config-sync/catalog/${catalogKey}?target=hrm&tenantId=${encodeURIComponent(normalizedTenantId)}&companyId=${encodeURIComponent(normalizedCompanyId)}`;
        let response;
        try {
            response = await (0, http_retry_fetch_1.fetchWithTimeoutAndRetry)(url, {
                method: 'GET',
                headers: this.buildXbosUpstreamHeaders(authorization, {
                    tenantId: normalizedTenantId,
                    companyId: normalizedCompanyId,
                }),
            });
        }
        catch (e) {
            if (e instanceof api_exception_1.ApiException)
                throw e;
            const aborted = (e instanceof DOMException && e.name === 'AbortError') ||
                (e instanceof Error && e.name === 'AbortError');
            if (aborted) {
                throw new api_exception_1.ApiException('HRM-SYNC-001', 'XBOS API request timed out', common_2.HttpStatus.BAD_GATEWAY);
            }
            const msg = e instanceof Error ? e.message : 'XBOS API unreachable';
            throw new api_exception_1.ApiException('HRM-SYNC-001', msg, common_2.HttpStatus.BAD_GATEWAY);
        }
        if (!response.ok) {
            throw new api_exception_1.ApiException('HRM-SYNC-001', `XBOS API error ${response.status}`, common_2.HttpStatus.BAD_GATEWAY);
        }
        const body = (await response.json());
        const remotePayload = body.data && typeof body.data === 'object' && 'data' in body.data
            ? body.data.data
            : body.data;
        if (!body.success || !remotePayload) {
            throw new api_exception_1.ApiException('HRM-SYNC-002', body.error ?? 'Catalog unavailable from XBOS', common_2.HttpStatus.NOT_FOUND);
        }
        const checksum = Buffer.from(JSON.stringify(remotePayload)).toString('base64');
        await this.db.query(`
      INSERT INTO public.synced_catalogs (tenant_id, company_id, catalog_key, source_system, payload, version, checksum, synced_at)
      VALUES ($1, $2, $3, 'xbos', $4::jsonb, 1, $5, NOW())
      ON CONFLICT (tenant_id, company_id, catalog_key)
      DO UPDATE SET
        source_system = EXCLUDED.source_system,
        payload = EXCLUDED.payload,
        version = public.synced_catalogs.version + 1,
        checksum = EXCLUDED.checksum,
        synced_at = NOW()
    `, [normalizedTenantId, normalizedCompanyId, catalogKey, JSON.stringify(remotePayload), checksum]);
        await this.db.query(`
      INSERT INTO public.sync_audit_logs (catalog_key, source_system, action, payload)
      VALUES ($1, 'xbos', 'pull_upsert', $2::jsonb)
    `, [catalogKey, JSON.stringify(remotePayload)]);
        const rowRes = await this.db.query(`
      SELECT catalog_key, source_system, version, checksum, synced_at, payload
      FROM public.synced_catalogs
      WHERE catalog_key = $1 AND tenant_id = $2 AND company_id = $3
    `, [catalogKey, normalizedTenantId, normalizedCompanyId]);
        const row = rowRes.rows[0];
        const record = {
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
    async getSyncedCatalog(catalogKey, tenantId, companyId) {
        await this.ensureSchema();
        const normalizedTenantId = this.normalizeScopeId(tenantId, 'tenantId');
        const normalizedCompanyId = this.normalizeScopeId(companyId, 'companyId');
        const res = await this.db.query(`
      SELECT catalog_key, source_system, version, checksum, synced_at, payload
      FROM public.synced_catalogs
      WHERE catalog_key = $1 AND tenant_id = $2 AND company_id = $3
    `, [catalogKey, normalizedTenantId, normalizedCompanyId]);
        const item = res.rows[0];
        if (!item) {
            throw new api_exception_1.ApiException('HRM-SYNC-002', `Catalog '${catalogKey}' not synced in HRM`, common_2.HttpStatus.NOT_FOUND);
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
    async listSyncedCatalogs(tenantId, companyId) {
        await this.ensureSchema();
        const normalizedTenantId = this.normalizeScopeId(tenantId, 'tenantId');
        const normalizedCompanyId = this.normalizeScopeId(companyId, 'companyId');
        const res = await this.db.query(`
      SELECT catalog_key, source_system, version, checksum, synced_at, payload
      FROM public.synced_catalogs
      WHERE tenant_id = $1 AND company_id = $2
      ORDER BY catalog_key
    `, [normalizedTenantId, normalizedCompanyId]);
        const data = res.rows.map((row) => ({
            tenantId: normalizedTenantId,
            companyId: normalizedCompanyId,
            key: row.catalog_key,
            source: row.source_system,
            version: row.version,
            checksum: row.checksum,
            syncedAt: row.synced_at,
            payload: row.payload,
        }));
        return { total: data.length, data };
    }
    async getCatalogSyncStatus(tenantId, companyId) {
        const catalogs = await this.listSyncedCatalogs(tenantId, companyId);
        const lastSyncedAt = catalogs.data.reduce((latest, item) => {
            if (!latest)
                return item.syncedAt;
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
    async listRemoteCatalogsFromXbos(tenantId, companyId, authorization) {
        const normalizedTenantId = this.normalizeScopeId(tenantId, 'tenantId');
        const normalizedCompanyId = this.normalizeScopeId(companyId, 'companyId');
        const url = `${this.xbosApiUrl}/api/xbos/config-sync/catalogs?target=hrm&tenantId=${encodeURIComponent(normalizedTenantId)}&companyId=${encodeURIComponent(normalizedCompanyId)}`;
        let response;
        try {
            response = await (0, http_retry_fetch_1.fetchWithTimeoutAndRetry)(url, {
                method: 'GET',
                headers: this.buildXbosUpstreamHeaders(authorization, {
                    tenantId: normalizedTenantId,
                    companyId: normalizedCompanyId,
                }),
            });
        }
        catch (e) {
            if (e instanceof api_exception_1.ApiException)
                throw e;
            const aborted = (e instanceof DOMException && e.name === 'AbortError') ||
                (e instanceof Error && e.name === 'AbortError');
            if (aborted) {
                throw new api_exception_1.ApiException('HRM-SYNC-001', 'XBOS API request timed out', common_2.HttpStatus.BAD_GATEWAY);
            }
            const msg = e instanceof Error ? e.message : 'XBOS API unreachable';
            throw new api_exception_1.ApiException('HRM-SYNC-001', msg, common_2.HttpStatus.BAD_GATEWAY);
        }
        if (!response.ok) {
            throw new api_exception_1.ApiException('HRM-SYNC-001', `XBOS API error ${response.status}`, common_2.HttpStatus.BAD_GATEWAY);
        }
        const body = (await response.json());
        if (!body.success || !body.data) {
            throw new api_exception_1.ApiException('HRM-SYNC-002', body.error ?? 'Catalog list unavailable from XBOS', common_2.HttpStatus.NOT_FOUND);
        }
        return {
            total: body.data.total ?? 0,
            target: body.data.target ?? 'hrm',
            tenantId: body.data.tenantId ?? normalizedTenantId,
            companyId: body.data.companyId ?? normalizedCompanyId,
            data: Array.isArray(body.data.data) ? body.data.data : [],
        };
    }
};
exports.CatalogSyncService = CatalogSyncService;
exports.CatalogSyncService = CatalogSyncService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [hrm_db_service_1.HrmDbService])
], CatalogSyncService);
//# sourceMappingURL=catalog-sync.service.js.map