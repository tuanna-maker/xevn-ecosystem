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
exports.OperatingUnitsService = void 0;
const common_1 = require("@nestjs/common");
const hrm_list_scope_1 = require("../common/hrm-list-scope");
const hrm_db_service_1 = require("../db/hrm-db.service");
const hrm_company_display_name_1 = require("./hrm-company-display-name");
const hrm_operating_unit_registry_1 = require("./hrm-operating-unit-registry");
let OperatingUnitsService = class OperatingUnitsService {
    db;
    constructor(db) {
        this.db = db;
    }
    resolveVisibleSlugs(scope) {
        if (scope.masterTenantPartition) {
            return [...hrm_list_scope_1.HRM_GROUP_MEMBER_COMPANY_SLUGS];
        }
        if (scope.memberTenantId) {
            return [];
        }
        const allowed = new Set(scope.companyIds.map((id) => id.trim().toLowerCase()));
        return hrm_list_scope_1.HRM_GROUP_MEMBER_COMPANY_SLUGS.filter((slug) => allowed.has(slug));
    }
    async listOperatingUnits(authorization, context) {
        await (0, hrm_company_display_name_1.ensureCompanySlugMapLegalDisplayNames)(async (sql, params) => this.db.query(sql, params ?? []));
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, hrm_list_scope_1.HRM_PILOT_OPERATING_COMPANY_ID, context);
        const visibleSlugs = this.resolveVisibleSlugs(scope);
        if (!visibleSlugs.length) {
            return [];
        }
        const res = await this.db.query(`SELECT company_slug, display_name
       FROM public.company_slug_map
       WHERE tenant_id = $1 AND company_slug = ANY($2::text[])
       ORDER BY company_slug ASC;`, [hrm_list_scope_1.MASTER_TENANT_ID, visibleSlugs]);
        const labelBySlug = new Map(res.rows.map((row) => [row.company_slug.trim().toLowerCase(), row.display_name]));
        return visibleSlugs
            .map((slug) => {
            const key = slug;
            const display_name_vi = (0, hrm_company_display_name_1.resolveCompanyDisplayNameVi)(slug, labelBySlug.get(slug) ?? null) ?? '';
            return {
                operating_slug: key,
                display_name_vi,
                rollup_order: (0, hrm_operating_unit_registry_1.rollupOrderForSlug)(slug),
            };
        })
            .sort((a, b) => a.rollup_order - b.rollup_order);
    }
};
exports.OperatingUnitsService = OperatingUnitsService;
exports.OperatingUnitsService = OperatingUnitsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [hrm_db_service_1.HrmDbService])
], OperatingUnitsService);
//# sourceMappingURL=operating-units.service.js.map