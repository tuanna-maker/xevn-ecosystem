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
exports.InfrastructureService = void 0;
const common_1 = require("@nestjs/common");
const api_exception_1 = require("../common/api.exception");
const xbos_db_service_1 = require("../db/xbos-db.service");
const platform_audit_service_1 = require("../platform/platform-audit.service");
const MASTER_TENANT_ID = process.env.MASTER_TENANT_ID?.trim().toLowerCase() || 'xevn';
let InfrastructureService = class InfrastructureService {
    db;
    platformAudit;
    constructor(db, platformAudit) {
        this.db = db;
        this.platformAudit = platformAudit;
    }
    async ensureSchema() {
        await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.xbos_infrastructure_settings (
        tenant_id TEXT NOT NULL,
        company_id TEXT NOT NULL,
        foundation_categories JSONB NOT NULL DEFAULT '[]'::jsonb,
        sites JSONB NOT NULL DEFAULT '[]'::jsonb,
        block_title_overrides_by_entity JSONB NOT NULL DEFAULT '{}'::jsonb,
        custom_blocks_by_entity JSONB NOT NULL DEFAULT '{}'::jsonb,
        custom_field_defs_by_entity JSONB NOT NULL DEFAULT '{}'::jsonb,
        foundation_categories_count INT NOT NULL DEFAULT 0,
        sites_count INT NOT NULL DEFAULT 0,
        custom_fields_count INT NOT NULL DEFAULT 0,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (tenant_id, company_id)
      );
    `);
        await this.db.query(`
      ALTER TABLE public.xbos_infrastructure_settings
      ADD COLUMN IF NOT EXISTS foundation_categories_count INT NOT NULL DEFAULT 0;
    `);
        await this.db.query(`
      ALTER TABLE public.xbos_infrastructure_settings
      ADD COLUMN IF NOT EXISTS sites_count INT NOT NULL DEFAULT 0;
    `);
        await this.db.query(`
      ALTER TABLE public.xbos_infrastructure_settings
      ADD COLUMN IF NOT EXISTS custom_fields_count INT NOT NULL DEFAULT 0;
    `);
        await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_xbos_infra_scope_updated_at
      ON public.xbos_infrastructure_settings (tenant_id, company_id, updated_at DESC);
    `);
    }
    normalizeTenantId(tenantId) {
        const normalized = tenantId.trim().toLowerCase();
        return normalized.length > 0 ? normalized : MASTER_TENANT_ID;
    }
    normalizeCompanyId(companyId) {
        const normalized = companyId.trim().toLowerCase();
        return normalized.length > 0 ? normalized : 'holding';
    }
    defaultPayload(tenantId, companyId) {
        const nowIso = new Date().toISOString();
        return {
            tenantId,
            companyId,
            foundationCategories: [
                {
                    id: 'fcat-core',
                    code: 'HT-LOG-CS',
                    nameVi: 'Danh mục hạ tầng logistics cơ sở (Origin)',
                    description: 'Khối thông tin chuẩn cho kho, bãi, văn phòng điều hành, ICD.',
                    appliesToCompanyIds: [companyId],
                },
            ],
            sites: [
                {
                    id: 'inf-hq-001',
                    siteCode: 'KHO-HQ-01',
                    name: 'Kho trung tâm XEVN HQ',
                    facilityType: 'warehouse',
                    operatingEntityId: companyId,
                    capacitySummary: '1.200 pallet',
                    status: 'active',
                    gpsCoords: '10.7800,106.7000',
                    addressDetail: 'Kho trung tâm tập đoàn XEVN',
                    hotline: '19006868',
                    directManager: 'Nguyen Van Van Hanh',
                    leaseLegalEndDate: '2030-12-31',
                    areaSqm: '8000',
                    palletOrVehicleMax: '1200',
                    ownerLegalEntityId: companyId,
                    customFields: {},
                },
            ],
            blockTitleOverridesByEntity: {
                [companyId]: {
                    general: 'Khối Thông tin chung',
                    location: 'Khối Vị trí và liên hệ',
                    capacity: 'Khối Năng lực (Capacity)',
                },
            },
            customBlocksByEntity: {
                [companyId]: [],
            },
            customFieldDefsByEntity: {
                [companyId]: [],
            },
            stats: {
                foundationCategories: 1,
                sites: 1,
                customFields: 0,
            },
            updatedAt: nowIso,
        };
    }
    mapRow(row) {
        const foundationCategories = Array.isArray(row.foundation_categories) ? row.foundation_categories : [];
        const sites = Array.isArray(row.sites) ? row.sites : [];
        const customFieldsCountFromJson = this.countCustomFields(row.custom_field_defs_by_entity);
        return {
            tenantId: row.tenant_id,
            companyId: row.company_id,
            foundationCategories,
            sites,
            blockTitleOverridesByEntity: row.block_title_overrides_by_entity ?? {},
            customBlocksByEntity: row.custom_blocks_by_entity ?? {},
            customFieldDefsByEntity: row.custom_field_defs_by_entity ?? {},
            stats: {
                foundationCategories: Math.max(Number(row.foundation_categories_count ?? 0), foundationCategories.length),
                sites: Math.max(Number(row.sites_count ?? 0), sites.length),
                customFields: Math.max(Number(row.custom_fields_count ?? 0), customFieldsCountFromJson),
            },
            updatedAt: row.updated_at,
        };
    }
    countCustomFields(customFieldDefsByEntity) {
        if (!customFieldDefsByEntity || typeof customFieldDefsByEntity !== 'object')
            return 0;
        const map = customFieldDefsByEntity;
        return Object.values(map).reduce((sum, value) => {
            if (!Array.isArray(value))
                return sum;
            return sum + value.length;
        }, 0);
    }
    async getSettings(tenantIdRaw, companyIdRaw) {
        await this.ensureSchema();
        const tenantId = this.normalizeTenantId(tenantIdRaw);
        const companyId = this.normalizeCompanyId(companyIdRaw);
        const found = await this.db.query(`
      SELECT *
      FROM public.xbos_infrastructure_settings
      WHERE tenant_id = $1 AND company_id = $2
      `, [tenantId, companyId]);
        if (found.rows[0])
            return this.mapRow(found.rows[0]);
        const seeded = this.defaultPayload(tenantId, companyId);
        await this.upsertSettings(tenantId, companyId, seeded);
        return seeded;
    }
    async upsertSettings(tenantIdRaw, companyIdRaw, payload) {
        await this.ensureSchema();
        const tenantId = this.normalizeTenantId(tenantIdRaw);
        const companyId = this.normalizeCompanyId(companyIdRaw);
        const foundationCategories = payload.foundationCategories ?? [];
        const sites = payload.sites ?? [];
        const blockTitleOverridesByEntity = payload.blockTitleOverridesByEntity ?? {};
        const customBlocksByEntity = payload.customBlocksByEntity ?? {};
        const customFieldDefsByEntity = payload.customFieldDefsByEntity ?? {};
        const foundationCategoriesCount = Array.isArray(foundationCategories) ? foundationCategories.length : 0;
        const sitesCount = Array.isArray(sites) ? sites.length : 0;
        const customFieldsCount = this.countCustomFields(customFieldDefsByEntity);
        const res = await this.db.query(`
      INSERT INTO public.xbos_infrastructure_settings (
        tenant_id,
        company_id,
        foundation_categories,
        sites,
        block_title_overrides_by_entity,
        custom_blocks_by_entity,
        custom_field_defs_by_entity,
        foundation_categories_count,
        sites_count,
        custom_fields_count,
        updated_at
      )
      VALUES ($1, $2, $3::jsonb, $4::jsonb, $5::jsonb, $6::jsonb, $7::jsonb, $8, $9, $10, NOW())
      ON CONFLICT (tenant_id, company_id)
      DO UPDATE SET
        foundation_categories = EXCLUDED.foundation_categories,
        sites = EXCLUDED.sites,
        block_title_overrides_by_entity = EXCLUDED.block_title_overrides_by_entity,
        custom_blocks_by_entity = EXCLUDED.custom_blocks_by_entity,
        custom_field_defs_by_entity = EXCLUDED.custom_field_defs_by_entity,
        foundation_categories_count = EXCLUDED.foundation_categories_count,
        sites_count = EXCLUDED.sites_count,
        custom_fields_count = EXCLUDED.custom_fields_count,
        updated_at = NOW()
      RETURNING *
      `, [
            tenantId,
            companyId,
            JSON.stringify(foundationCategories),
            JSON.stringify(sites),
            JSON.stringify(blockTitleOverridesByEntity),
            JSON.stringify(customBlocksByEntity),
            JSON.stringify(customFieldDefsByEntity),
            foundationCategoriesCount,
            sitesCount,
            customFieldsCount,
        ]);
        const row = res.rows[0];
        if (!row) {
            throw new api_exception_1.ApiException('XBOS-INFRA-500', 'Cannot upsert infrastructure settings', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        await this.platformAudit.emit({
            tenantId,
            companyId,
            action: 'infrastructure.settings.upsert',
            entityType: 'xbos_infrastructure_settings',
            entityId: `${tenantId}:${companyId}`,
            payload: {
                foundationCategoriesCount,
                sitesCount,
                updatedAt: row.updated_at,
            },
        });
        return this.mapRow(row);
    }
    async getSummary(tenantIdRaw, companyIdRaw) {
        const settings = await this.getSettings(tenantIdRaw, companyIdRaw);
        return {
            tenantId: settings.tenantId,
            companyId: settings.companyId,
            stats: settings.stats,
            updatedAt: settings.updatedAt,
        };
    }
};
exports.InfrastructureService = InfrastructureService;
exports.InfrastructureService = InfrastructureService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [xbos_db_service_1.XbosDbService,
        platform_audit_service_1.PlatformAuditService])
], InfrastructureService);
