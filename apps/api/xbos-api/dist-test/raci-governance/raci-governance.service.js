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
exports.RaciGovernanceService = void 0;
const common_1 = require("@nestjs/common");
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const api_exception_1 = require("../common/api.exception");
const tenant_constants_1 = require("../common/tenant.constants");
const xbos_db_service_1 = require("../db/xbos-db.service");
const platform_audit_service_1 = require("../platform/platform-audit.service");
let RaciGovernanceService = class RaciGovernanceService {
    db;
    platformAudit;
    seedCache = null;
    constructor(db, platformAudit) {
        this.db = db;
        this.platformAudit = platformAudit;
    }
    async onModuleInit() {
        try {
            await this.ensureSeedCatalogLoaded();
        }
        catch (err) {
            console.warn('[raci-governance] seed bootstrap skipped:', err instanceof Error ? err.message : err);
        }
    }
    loadSeedFile() {
        if (this.seedCache)
            return this.seedCache;
        const path = (0, node_path_1.resolve)(process.cwd(), 'data/raci-catalog.seed.json');
        const alt = (0, node_path_1.resolve)(__dirname, '../../data/raci-catalog.seed.json');
        const file = (0, node_fs_1.existsSync)(path) ? path : alt;
        if (!(0, node_fs_1.existsSync)(file))
            return null;
        const raw = JSON.parse((0, node_fs_1.readFileSync)(file, 'utf8'));
        this.seedCache = { version_label: raw.version_label, activities: raw.activities ?? [] };
        return this.seedCache;
    }
    async ensureSeedCatalogLoaded() {
        const seed = this.loadSeedFile();
        if (!seed?.activities.length)
            return;
        const count = await this.db.query(`SELECT COUNT(*)::text AS n FROM public.raci_activity_catalog LIMIT 1`);
        if (Number(count.rows[0]?.n ?? 0) > 0)
            return;
        const tenantId = process.env.SEED_TENANT_ID?.trim() ||
            process.env.MASTER_TENANT_ID?.trim() ||
            tenant_constants_1.MASTER_TENANT_ID;
        const ver = await this.db.query(`INSERT INTO public.raci_catalog_version (tenant_id, version_label, source_ref, status)
       VALUES ($1, $2, 'raci-catalog.seed.json', 'active')
       ON CONFLICT (tenant_id, version_label) DO UPDATE SET source_ref = EXCLUDED.source_ref
       RETURNING id`, [tenantId, seed.version_label]);
        const versionId = ver.rows[0].id;
        for (const a of seed.activities) {
            await this.db.query(`INSERT INTO public.raci_activity_catalog (
          tenant_id, catalog_version_id, activity_code, domain_code, domain_label,
          seq_no, name, default_matrix
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb)
        ON CONFLICT (tenant_id, catalog_version_id, activity_code) DO NOTHING`, [
                tenantId,
                versionId,
                a.activity_code,
                a.domain_code,
                a.domain_label,
                a.seq_no,
                a.name,
                JSON.stringify(a.default_matrix ?? {}),
            ]);
        }
    }
    /** Group RACI catalog SoT lives under master tenant; member partitions reuse it. */
    catalogTenantForLookup(tenantId) {
        const normalized = tenantId.trim().toLowerCase();
        return normalized === tenant_constants_1.MASTER_TENANT_ID ? normalized : tenant_constants_1.MASTER_TENANT_ID;
    }
    async queryCatalogRowsFromDb(tenantId, domainCode) {
        const params = [tenantId];
        let domainFilter = '';
        if (domainCode) {
            params.push(domainCode);
            domainFilter = ` AND a.domain_code = $2`;
        }
        const res = await this.db.query(`SELECT a.id, a.activity_code, a.domain_code, a.domain_label, a.seq_no, a.name, a.default_matrix
       FROM public.raci_activity_catalog a
       INNER JOIN public.raci_catalog_version v ON v.id = a.catalog_version_id AND v.status = 'active'
       WHERE a.tenant_id = $1${domainFilter}
       ORDER BY a.domain_code, a.seq_no`, params);
        return res.rows;
    }
    catalogRowsFromSeedFile(domainCode) {
        const seed = this.loadSeedFile();
        if (!seed)
            return [];
        return seed.activities
            .filter((a) => !domainCode || a.domain_code === domainCode)
            .map((a) => ({
            ...a,
            id: `seed-${a.activity_code}`,
            default_matrix: a.default_matrix ?? {},
        }));
    }
    resolveCatalogActivityId(catalog, rawActivityId) {
        const id = rawActivityId.trim();
        if (!id.startsWith('seed-'))
            return id;
        const activityCode = id.slice('seed-'.length);
        const row = catalog.find((c) => c.activity_code === activityCode);
        return row?.id ?? id;
    }
    async listCatalogRows(tenantId, domainCode) {
        const catalogTenant = this.catalogTenantForLookup(tenantId);
        const dbRows = await this.queryCatalogRowsFromDb(catalogTenant, domainCode);
        if (dbRows.length)
            return dbRows;
        if (catalogTenant !== tenantId.trim().toLowerCase()) {
            const tenantRows = await this.queryCatalogRowsFromDb(tenantId.trim().toLowerCase(), domainCode);
            if (tenantRows.length)
                return tenantRows;
        }
        return this.catalogRowsFromSeedFile(domainCode);
    }
    async listCatalog(tenantId, domainCode) {
        const rows = await this.listCatalogRows(tenantId, domainCode);
        const domains = [...new Set(rows.map((r) => r.domain_code))].map((code) => ({
            domain_code: code,
            domain_label: rows.find((r) => r.domain_code === code)?.domain_label ?? code,
            count: rows.filter((r) => r.domain_code === code).length,
        }));
        return { domains, activities: rows, total: rows.length };
    }
    async getCompanyMatrix(tenantId, companyId, domainCode) {
        const catalog = await this.listCatalogRows(tenantId, domainCode);
        const overrides = await this.db.query(`SELECT activity_id::text, org_column_id, raci_letters
       FROM public.company_raci_matrix_cell
       WHERE tenant_id = $1 AND company_id = $2`, [tenantId, companyId]);
        const overrideMap = new Map();
        for (const o of overrides.rows) {
            const actId = this.resolveCatalogActivityId(catalog, o.activity_id);
            overrideMap.set(`${actId}:${o.org_column_id}`, o.raci_letters);
        }
        const rows = catalog.map((a) => {
            const matrix = { ...(a.default_matrix ?? {}) };
            for (const [col, letters] of Object.entries(matrix)) {
                const key = `${a.id}:${col}`;
                if (overrideMap.has(key))
                    matrix[col] = overrideMap.get(key);
            }
            for (const [key, letters] of overrideMap.entries()) {
                const [actId, col] = key.split(':');
                if (actId === a.id && !(col in matrix))
                    matrix[col] = letters;
            }
            return {
                activity_id: a.id,
                activity_code: a.activity_code,
                domain_code: a.domain_code,
                domain_label: a.domain_label,
                seq_no: a.seq_no,
                name: a.name,
                matrix,
                has_override: [...overrideMap.keys()].some((k) => k.startsWith(`${a.id}:`)),
            };
        });
        return { company_id: companyId, rows };
    }
    async listCapabilities(tenantId, activityCode) {
        const params = [tenantId];
        let filter = '';
        if (activityCode) {
            params.push(activityCode);
            filter = ' AND c.activity_code = $2';
        }
        const res = await this.db.query(`SELECT cap.id, c.activity_code, c.name AS activity_name, cap.module_code, cap.feature_code,
              cap.permission_code, cap.workflow_id, cap.api_route, cap.raci_letter_required, cap.status
       FROM public.raci_ecosystem_capability cap
       INNER JOIN public.raci_activity_catalog c ON c.id = cap.activity_id
       WHERE cap.tenant_id = $1${filter}
       ORDER BY c.activity_code, cap.module_code`, params);
        if (res.rows.length)
            return { items: res.rows };
        const samplesPath = (0, node_path_1.resolve)(__dirname, '../../data/raci-capability-samples.json');
        if (!(0, node_fs_1.existsSync)(samplesPath))
            return { items: [] };
        const samples = JSON.parse((0, node_fs_1.readFileSync)(samplesPath, 'utf8'));
        const filtered = activityCode
            ? samples.filter((s) => s.activity_code === activityCode)
            : samples;
        return { items: filtered };
    }
    async getCoverage(tenantId, companyId) {
        const catalog = await this.listCatalogRows(tenantId);
        const caps = await this.listCapabilities(tenantId);
        const capCodes = new Set(caps.items.map((c) => c.activity_code).filter(Boolean));
        const mapped = catalog.filter((a) => capCodes.has(a.activity_code)).length;
        const matrix = await this.getCompanyMatrix(tenantId, companyId);
        const withLetters = matrix.rows.filter((r) => Object.values(r.matrix).some((v) => String(v).trim().length > 0)).length;
        return {
            company_id: companyId,
            activities_total: catalog.length,
            activities_with_capability_map: mapped,
            activities_with_matrix_letters: withLetters,
            capability_coverage_pct: catalog.length ? Math.round((mapped / catalog.length) * 100) : 0,
        };
    }
    async upsertMatrixCell(tenantId, companyId, body) {
        const letters = (body.raci_letters ?? '').trim().replace(/\s+/g, '').toUpperCase();
        if (!/^[RACI]*$/.test(letters)) {
            throw new api_exception_1.ApiException('XBOS-RACI-400', 'Invalid RACI letters', common_1.HttpStatus.BAD_REQUEST);
        }
        if (body.activity_id.startsWith('seed-')) {
            throw new api_exception_1.ApiException('XBOS-RACI-503', 'Catalog chưa đồng bộ DB — chạy pnpm seed:raci:catalog', common_1.HttpStatus.SERVICE_UNAVAILABLE);
        }
        const prev = await this.db.query(`SELECT raci_letters FROM public.company_raci_matrix_cell
       WHERE tenant_id = $1 AND company_id = $2 AND activity_id = $3 AND org_column_id = $4`, [tenantId, companyId, body.activity_id, body.org_column_id]);
        const oldLetters = prev.rows[0]?.raci_letters ?? null;
        const res = await this.db.query(`INSERT INTO public.company_raci_matrix_cell (
        tenant_id, company_id, activity_id, org_column_id, raci_letters, source, updated_by
      ) VALUES ($1,$2,$3,$4,$5,'company_override',$6)
      ON CONFLICT (tenant_id, company_id, activity_id, org_column_id) DO UPDATE SET
        raci_letters = EXCLUDED.raci_letters,
        updated_by = EXCLUDED.updated_by,
        updated_at = NOW()
      RETURNING *`, [tenantId, companyId, body.activity_id, body.org_column_id, letters, body.actor_id ?? null]);
        await this.db.query(`INSERT INTO public.raci_matrix_audit_log (
        tenant_id, company_id, activity_id, org_column_id, old_letters, new_letters, actor_id
      ) VALUES ($1,$2,$3,$4,$5,$6,$7)`, [
            tenantId,
            companyId,
            body.activity_id,
            body.org_column_id,
            oldLetters,
            letters,
            body.actor_id ?? null,
        ]);
        await this.platformAudit.emit({
            actor: body.actor_id ?? undefined,
            tenantId,
            companyId,
            action: 'raci.cell.update',
            entityType: 'company_raci_matrix_cell',
            entityId: `${body.activity_id}:${body.org_column_id}`,
            payload: { oldLetters, newLetters: letters },
        });
        return res.rows[0];
    }
};
exports.RaciGovernanceService = RaciGovernanceService;
exports.RaciGovernanceService = RaciGovernanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [xbos_db_service_1.XbosDbService,
        platform_audit_service_1.PlatformAuditService])
], RaciGovernanceService);
