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
exports.BusinessMasterService = exports.COMMAND_CENTER_CATALOG_KINDS = exports.BUSINESS_MASTER_ALLOWED_DOMAINS = void 0;
const common_1 = require("@nestjs/common");
const api_exception_1 = require("../common/api.exception");
const xbos_db_service_1 = require("../db/xbos-db.service");
const tenant_constants_1 = require("../common/tenant.constants");
/** Legacy partitions before group-CEO holding alignment (P4 seed + early saves). */
const DEPT_SYSTEM_TEMPLATE_LEGACY_COMPANY_IDS = [
    tenant_constants_1.MEMBER_DEFAULT_COMPANY_ID,
    'xevn',
];
/** UC-ECO-MASTER-01 / UC-XBOS-08 — tenant+company scoped master domains. */
exports.BUSINESS_MASTER_ALLOWED_DOMAINS = [
    'companies',
    'kpi_metrics',
    'positions',
    'vendors',
    'expense_categories',
    'organizations',
    'customers',
    'partners',
    'dept_system_templates',
    'command_center_catalogs',
    'kpi_policies',
    'kpi_sparkline_snapshots',
    'department_catalog',
    'departments',
    'geographic_regions',
    'kpi_formulas',
];
const allowedDomains = new Set(exports.BUSINESS_MASTER_ALLOWED_DOMAINS);
const domainAliases = {
    departments: 'department_catalog',
};
/** Command Center catalog partitions — portal stores `{ rows: [...] }` per kind. */
exports.COMMAND_CENTER_CATALOG_KINDS = ['regulations', 'measurements', 'pricing'];
let BusinessMasterService = class BusinessMasterService {
    db;
    constructor(db) {
        this.db = db;
    }
    async ensureSchema() {
        await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.xbos_business_master_entries (
        tenant_id TEXT NOT NULL,
        company_id TEXT NOT NULL,
        domain TEXT NOT NULL,
        item_id TEXT NOT NULL,
        payload JSONB NOT NULL DEFAULT '{}'::jsonb,
        status TEXT NOT NULL DEFAULT 'active',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (tenant_id, company_id, domain, item_id)
      );
    `);
        await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_xbos_business_master_domain_scope
      ON public.xbos_business_master_entries (tenant_id, company_id, domain, updated_at DESC);
    `);
    }
    assertDomain(domain) {
        const normalized = (domain || '').trim().toLowerCase();
        const resolved = domainAliases[normalized] ?? normalized;
        if (!allowedDomains.has(resolved)) {
            throw new api_exception_1.ApiException('XBOS-MASTER-400', 'Invalid business master domain', common_1.HttpStatus.BAD_REQUEST, {
                domain,
            });
        }
        return resolved;
    }
    defaultCompanies(tenantId, companyId) {
        return [
            {
                id: 'all',
                code: 'ALL',
                name: 'Toàn tập đoàn',
                shortName: 'All',
                employeeCount: 0,
                revenue: 0,
                status: 'active',
                address: 'N/A',
                establishedDate: '2020-01-01',
                entityLevel: 'parent',
                parentEntityId: null,
                tenantId,
                companyId,
            },
            {
                id: companyId,
                code: companyId.toUpperCase(),
                name: `Đơn vị ${companyId.toUpperCase()}`,
                shortName: companyId.toUpperCase(),
                employeeCount: 0,
                revenue: 0,
                status: 'active',
                address: 'N/A',
                establishedDate: '2020-01-01',
                entityLevel: 'subsidiary',
                parentEntityId: null,
                tenantId,
                companyId,
            },
        ];
    }
    /** UC-ECO-MASTER-01 — read-only domain catalog for portal/settings probes. */
    listDomainCatalog() {
        return exports.BUSINESS_MASTER_ALLOWED_DOMAINS.map((domain) => ({
            domain,
            aliases: domain === 'department_catalog' ? ['departments'] : [],
            readPath: `/business-master/${domain}/items`,
        }));
    }
    /** UF-XBOS-14 — portal/probe GET list must surface row.code at top level (partition + flat rows). */
    flattenCommandCenterCatalogList(partitions) {
        const flattened = [];
        for (const partition of partitions) {
            flattened.push(partition);
            for (const row of this.readCcCatalogRows(partition)) {
                const code = String(row.code ?? row.key ?? row.priceCode ?? '').trim();
                if (!code)
                    continue;
                flattened.push({
                    ...partition,
                    id: code,
                    ...row,
                    code,
                    category: partition.id,
                    status: String(row.status ?? 'active'),
                });
            }
        }
        return flattened;
    }
    async list(tenantId, companyId, domainRaw) {
        await this.ensureSchema();
        const domain = this.assertDomain(domainRaw);
        const primary = await this.listRows(tenantId, companyId, domain);
        if (domain === 'companies' && primary.length === 0) {
            return this.defaultCompanies(tenantId, companyId);
        }
        if (domain === 'command_center_catalogs') {
            return this.flattenCommandCenterCatalogList(primary);
        }
        if (domain !== 'dept_system_templates') {
            return primary;
        }
        const merged = new Map();
        for (const item of primary) {
            merged.set(item.id, item);
        }
        for (const legacyCompanyId of DEPT_SYSTEM_TEMPLATE_LEGACY_COMPANY_IDS) {
            if (legacyCompanyId === companyId)
                continue;
            const legacyRows = await this.listRows(tenantId, legacyCompanyId, domain);
            for (const item of legacyRows) {
                if (!merged.has(item.id))
                    merged.set(item.id, item);
            }
        }
        return Array.from(merged.values()).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }
    mapRow(row) {
        return {
            id: row.item_id,
            ...(typeof row.payload === 'object' && row.payload ? row.payload : {}),
            status: row.status,
            tenantId: row.tenant_id,
            companyId: row.company_id,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }
    async listRows(tenantId, companyId, domain) {
        const res = await this.db.query(`
      SELECT tenant_id, company_id, domain, item_id, payload, status, created_at, updated_at
      FROM public.xbos_business_master_entries
      WHERE tenant_id = $1 AND company_id = $2 AND domain = $3 AND status <> 'deleted'
      ORDER BY updated_at DESC
      `, [tenantId, companyId, domain]);
        return res.rows.map((row) => this.mapRow(row));
    }
    isCommandCenterCatalogKind(value) {
        return exports.COMMAND_CENTER_CATALOG_KINDS.includes(value.trim().toLowerCase());
    }
    readCcCatalogRows(payload) {
        if (!payload || typeof payload !== 'object') {
            return [];
        }
        const rows = payload.rows;
        return Array.isArray(rows)
            ? rows.filter((row) => !!row && typeof row === 'object')
            : [];
    }
    /** UF-XBOS-14 — autosave row merges into category partition (regulations/measurements/pricing). */
    async upsertCommandCenterCatalogRow(tenantId, companyId, itemId, payload) {
        const body = payload && typeof payload === 'object' ? payload : {};
        const categoryRaw = String(body.category ?? body.kind ?? 'regulations').trim().toLowerCase();
        if (!this.isCommandCenterCatalogKind(categoryRaw)) {
            throw new api_exception_1.ApiException('XBOS-MASTER-400', 'command_center_catalogs row upsert requires category regulations|measurements|pricing', common_1.HttpStatus.BAD_REQUEST, { category: categoryRaw });
        }
        const rowCode = String(body.code ?? itemId).trim();
        if (!rowCode) {
            throw new api_exception_1.ApiException('XBOS-MASTER-422', 'code is required', common_1.HttpStatus.BAD_REQUEST);
        }
        const existingRows = await this.listRows(tenantId, companyId, 'command_center_catalogs');
        const partition = existingRows.find((entry) => entry.id === categoryRaw);
        const mergedRows = [...this.readCcCatalogRows(partition)];
        const nextRow = {
            ...body,
            code: rowCode,
            title: body.title ?? body.label ?? body.name ?? rowCode,
            status: body.status ?? 'active',
        };
        const rowIndex = mergedRows.findIndex((row) => String(row.code ?? row.key ?? row.priceCode ?? '').trim().toLowerCase() === rowCode.toLowerCase());
        if (rowIndex >= 0) {
            mergedRows[rowIndex] = { ...mergedRows[rowIndex], ...nextRow };
        }
        else {
            mergedRows.push(nextRow);
        }
        return this.persistMasterEntry(tenantId, companyId, 'command_center_catalogs', categoryRaw, {
            rows: mergedRows,
        });
    }
    async persistMasterEntry(tenantId, companyId, domain, itemId, payload) {
        const res = await this.db.query(`
      INSERT INTO public.xbos_business_master_entries (
        tenant_id, company_id, domain, item_id, payload, status, updated_at
      )
      VALUES ($1, $2, $3, $4, $5::jsonb, 'active', NOW())
      ON CONFLICT (tenant_id, company_id, domain, item_id)
      DO UPDATE SET
        payload = EXCLUDED.payload,
        status = 'active',
        updated_at = NOW()
      RETURNING tenant_id, company_id, domain, item_id, payload, status, created_at, updated_at
      `, [tenantId, companyId, domain, itemId, JSON.stringify(payload ?? {})]);
        return res.rows[0];
    }
    async upsert(tenantId, companyId, domainRaw, itemId, payload) {
        await this.ensureSchema();
        const domain = this.assertDomain(domainRaw);
        const normalizedItemId = (itemId || '').trim();
        if (!normalizedItemId) {
            throw new api_exception_1.ApiException('XBOS-MASTER-422', 'itemId is required', common_1.HttpStatus.BAD_REQUEST);
        }
        if (domain === 'command_center_catalogs') {
            const body = payload && typeof payload === 'object' ? payload : {};
            const hasPartitionRows = Array.isArray(body.rows);
            if (this.isCommandCenterCatalogKind(normalizedItemId) || hasPartitionRows) {
                return this.persistMasterEntry(tenantId, companyId, domain, normalizedItemId, payload);
            }
            return this.upsertCommandCenterCatalogRow(tenantId, companyId, normalizedItemId, payload);
        }
        return this.persistMasterEntry(tenantId, companyId, domain, normalizedItemId, payload);
    }
    async remove(tenantId, companyId, domainRaw, itemId) {
        await this.ensureSchema();
        const domain = this.assertDomain(domainRaw);
        await this.db.query(`
      UPDATE public.xbos_business_master_entries
      SET status = 'deleted', updated_at = NOW()
      WHERE tenant_id = $1 AND company_id = $2 AND domain = $3 AND item_id = $4
      `, [tenantId, companyId, domain, itemId]);
        return { deleted: true };
    }
};
exports.BusinessMasterService = BusinessMasterService;
exports.BusinessMasterService = BusinessMasterService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [xbos_db_service_1.XbosDbService])
], BusinessMasterService);
