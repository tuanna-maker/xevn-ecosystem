"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeHrmCatalogSyncRequestCompanyId = normalizeHrmCatalogSyncRequestCompanyId;
exports.resolveHrmCatalogSyncScope = resolveHrmCatalogSyncScope;
const hrm_list_scope_1 = require("./hrm-list-scope");
const internal_auth_1 = require("./internal-auth");
const scope_context_1 = require("./scope-context");
function readClaim(payload, ...keys) {
    for (const key of keys) {
        const value = payload[key];
        if (typeof value === 'string' && value.trim()) {
            return value.trim();
        }
    }
    return undefined;
}
function normalizeHrmCatalogSyncRequestCompanyId(authorization, requestedCompanyId) {
    if (!requestedCompanyId?.trim()) {
        return requestedCompanyId;
    }
    const requested = requestedCompanyId.trim().toLowerCase();
    if (requested !== 'holding') {
        return requestedCompanyId.trim();
    }
    const jwtPayload = (0, internal_auth_1.getVerifiedInternalJwtPayload)(authorization);
    if (!jwtPayload) {
        return requestedCompanyId.trim();
    }
    const claimTenantId = readClaim(jwtPayload, 'tenantId', 'tenant_id', 'tid');
    const claimCompanyId = readClaim(jwtPayload, 'companyId', 'company_id', 'cid');
    if (claimTenantId === hrm_list_scope_1.MASTER_TENANT_ID &&
        claimCompanyId === hrm_list_scope_1.HRM_PILOT_OPERATING_COMPANY_ID) {
        return hrm_list_scope_1.HRM_PILOT_OPERATING_COMPANY_ID;
    }
    return requestedCompanyId.trim();
}
function resolveHrmCatalogSyncScope(authorization, requested) {
    const tenantId = requested.tenantId?.trim();
    const companyId = normalizeHrmCatalogSyncRequestCompanyId(authorization, requested.companyId);
    const scope = (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId });
    const catalogCompanyId = (0, hrm_list_scope_1.resolveHrmSettingsCatalogCompanyId)(authorization, scope.tenantId, scope.companyId);
    return { tenantId: scope.tenantId, catalogCompanyId };
}
//# sourceMappingURL=hrm-catalog-sync-scope.js.map