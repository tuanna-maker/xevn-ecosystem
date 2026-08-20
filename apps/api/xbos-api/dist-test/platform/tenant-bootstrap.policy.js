"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MASTER_BOOTSTRAP_COMPANY_ID = void 0;
exports.assertMasterGroupBootstrapScope = assertMasterGroupBootstrapScope;
exports.resolveMemberBootstrapCompanyId = resolveMemberBootstrapCompanyId;
exports.assertCrossTenantCleanupAllowed = assertCrossTenantCleanupAllowed;
exports.assertTenantScopedDeleteSql = assertTenantScopedDeleteSql;
const common_1 = require("@nestjs/common");
const api_exception_1 = require("../common/api.exception");
const tenant_constants_1 = require("../common/tenant.constants");
/** Group catalog bootstrap plane (UC-ECO-MASTER-02 / SRS §8.2). */
exports.MASTER_BOOTSTRAP_COMPANY_ID = 'holding';
/**
 * UC-ECO-MASTER-02 — group default catalogs must stay on master tenant `xevn` + `holding`
 * so member tenant rows are never overwritten by bootstrap.
 */
function assertMasterGroupBootstrapScope(scope) {
    const tenantId = scope.tenantId.trim().toLowerCase();
    const companyId = scope.companyId.trim().toLowerCase();
    if (!(0, tenant_constants_1.isMasterTenant)(tenantId) || companyId !== exports.MASTER_BOOTSTRAP_COMPANY_ID) {
        throw new api_exception_1.ApiException('XBOS-TENANT-400', 'Group catalog bootstrap is limited to master tenant holding scope', common_1.HttpStatus.BAD_REQUEST, {
            tenantId,
            companyId,
            expectedTenant: tenant_constants_1.MASTER_TENANT_ID,
            expectedCompany: exports.MASTER_BOOTSTRAP_COMPANY_ID,
        });
    }
}
/** Member tenants use `main` as default company partition (SRS §10). */
function resolveMemberBootstrapCompanyId(tenantId, companyHint) {
    if ((0, tenant_constants_1.isMasterTenant)(tenantId)) {
        return companyHint?.trim().toLowerCase() || exports.MASTER_BOOTSTRAP_COMPANY_ID;
    }
    return tenant_constants_1.MEMBER_DEFAULT_COMPANY_ID;
}
/**
 * UC-ECO-MASTER-02 — cross-tenant destructive cleanup requires an explicit admin protection flag.
 */
function assertCrossTenantCleanupAllowed(options) {
    if (!options.explicitAdminFlag) {
        throw new api_exception_1.ApiException('XBOS-TENANT-409', 'Cross-tenant cleanup requires explicit admin protection flag', common_1.HttpStatus.CONFLICT, { targetTenantId: options.targetTenantId.trim().toLowerCase() });
    }
}
/** Validates seed/SQL helpers only touch one tenant partition. */
function assertTenantScopedDeleteSql(sql, tenantId) {
    const normalized = sql.replace(/\s+/g, ' ').toLowerCase();
    if (!normalized.includes('where tenant_id')) {
        throw new Error('Tenant-scoped delete must filter by tenant_id');
    }
    if (!normalized.includes('$1') && !normalized.includes(tenantId.toLowerCase())) {
        throw new Error('Tenant-scoped delete must bind target tenant');
    }
}
