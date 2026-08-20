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
exports.TenantScopeService = void 0;
const common_1 = require("@nestjs/common");
const pilot_membership_bootstrap_1 = require("../auth/pilot-membership.bootstrap");
const api_exception_1 = require("../common/api.exception");
const xbos_group_legal_scope_1 = require("../common/xbos-group-legal-scope");
const tenant_constants_1 = require("../common/tenant.constants");
const xbos_db_service_1 = require("../db/xbos-db.service");
const org_foundation_service_1 = require("../org-foundation/org-foundation.service");
let TenantScopeService = class TenantScopeService {
    db;
    org;
    constructor(db, org) {
        this.db = db;
        this.org = org;
    }
    async assertMembership(userId, tenantId) {
        const { rows } = await this.db.query(`SELECT 1 FROM public.xbos_user_tenant_membership
       WHERE user_id = $1 AND tenant_id = $2 AND status = 'active' LIMIT 1`, [userId, tenantId]);
        if (!rows[0]) {
            throw new api_exception_1.ApiException('XBOS-TENANT-403', 'User has no access to this tenant', common_1.HttpStatus.FORBIDDEN, {
                userId,
                tenantId,
            });
        }
    }
    async listAccessible(userId) {
        const { rows } = await this.db.query(`SELECT m.tenant_id, m.role_code, t.name, t.short_name, t.tenant_kind, t.default_company_id
       FROM public.xbos_user_tenant_membership m
       JOIN public.xbos_tenant_registry t ON t.tenant_id = m.tenant_id
       WHERE m.user_id = $1 AND m.status = 'active' AND t.status = 'active'
       ORDER BY CASE WHEN t.tenant_kind = 'master' THEN 0 ELSE 1 END, t.name`, [userId]);
        return rows.map((r) => {
            const tenantId = String(r.tenant_id);
            return {
                tenantId,
                name: String(r.name),
                shortName: String(r.short_name),
                tenantKind: r.tenant_kind,
                roleCode: String(r.role_code),
                companyId: String(r.default_company_id || tenant_constants_1.MEMBER_DEFAULT_COMPANY_ID),
                isMaster: (0, tenant_constants_1.isMasterTenant)(tenantId),
            };
        });
    }
    /** Tenant master: tổng hợp org holding + pháp nhân thành viên (J-XBOS-07 / group-org-overview). */
    async groupOrgOverview(userId) {
        const accessible = await this.listAccessible(userId);
        const master = accessible.find((t) => t.isMaster);
        if (!master) {
            throw new api_exception_1.ApiException('XBOS-TENANT-403', 'Group overview requires master tenant membership', common_1.HttpStatus.FORBIDDEN);
        }
        const roleByTenantId = new Map(accessible.map((t) => [t.tenantId, t.roleCode]));
        const rawTrees = await this.org.listGroupOrgTreesForUser(userId);
        const trees = rawTrees.map((entry) => ({
            tenantId: entry.tenantId,
            name: entry.name,
            roleCode: entry.tenantId === tenant_constants_1.GROUP_HOLDING_ROOT_ID
                ? master.roleCode
                : roleByTenantId.get(entry.memberTenantId ?? '') ?? 'member',
            tree: entry.tree,
        }));
        return { masterTenantId: tenant_constants_1.MASTER_TENANT_ID, memberships: accessible, trees };
    }
    /**
     * Pháp nhân tập đoàn + từng tenant thành viên (seed từ JSON/Excel MTCV).
     * Group CEO: master tenant membership OR verified JWT on xevn with group_* role (ADR scope).
     */
    async groupMemberUnits(userId, jwtContext) {
        let accessible = await this.listAccessible(userId);
        let masterMembership = accessible.find((t) => t.isMaster);
        const roleCode = (jwtContext?.roleCode ?? '').trim().toLowerCase();
        const jwtGroupCeo = (0, xbos_group_legal_scope_1.isGroupCeoOnMasterTenant)(jwtContext?.tenantId, roleCode);
        if (!masterMembership && jwtGroupCeo) {
            await (0, pilot_membership_bootstrap_1.ensurePilotMembershipForUser)(this.db, userId);
            accessible = await this.listAccessible(userId);
            masterMembership = accessible.find((t) => t.isMaster);
        }
        if (!masterMembership && !jwtGroupCeo) {
            throw new api_exception_1.ApiException('XBOS-TENANT-403', 'Group member units require master tenant membership', common_1.HttpStatus.FORBIDDEN);
        }
        return this.org.listGroupMemberUnits();
    }
    resolveCompanyIdForTenant(tenantId, companyHint) {
        if ((0, tenant_constants_1.isMasterTenant)(tenantId)) {
            return companyHint?.trim() || tenant_constants_1.MASTER_TENANT_ID;
        }
        return tenant_constants_1.MEMBER_DEFAULT_COMPANY_ID;
    }
};
exports.TenantScopeService = TenantScopeService;
exports.TenantScopeService = TenantScopeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [xbos_db_service_1.XbosDbService,
        org_foundation_service_1.OrgFoundationService])
], TenantScopeService);
