"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveKpiRollupScopeContext = resolveKpiRollupScopeContext;
const internal_auth_1 = require("../common/internal-auth");
const scope_context_1 = require("../common/scope-context");
const MASTER_TENANT_ID = 'xevn';
const GROUP_OPERATING_MAIN = 'main';
const GROUP_LEGAL_HOLDING = 'holding';
function readClaim(payload, ...keys) {
    for (const key of keys) {
        const value = payload[key];
        if (typeof value === 'string' && value.trim()) {
            return value.trim();
        }
    }
    return undefined;
}
/** Group CEO JWT on `main` may request KPI rollup for `holding` (ADR M01 / view-completeness probe). */
function resolveKpiRollupScopeContext(authorization, requested) {
    const jwtPayload = (0, internal_auth_1.getVerifiedInternalJwtPayload)(authorization);
    const claimTenantId = jwtPayload ? readClaim(jwtPayload, 'tenantId', 'tenant_id', 'tid') : undefined;
    const claimCompanyId = jwtPayload ? readClaim(jwtPayload, 'companyId', 'company_id', 'cid') : undefined;
    const normalized = (0, scope_context_1.normalizePortalScopeRequest)(claimTenantId, claimCompanyId, requested);
    const roleCode = (jwtPayload ? readClaim(jwtPayload, 'roleCode', 'role_code', 'role') ?? '' : '').toLowerCase();
    const requestedCompanyId = normalized.companyId?.trim().toLowerCase();
    const claimCompany = claimCompanyId?.trim().toLowerCase();
    const isGroupCeoOnMaster = claimTenantId === MASTER_TENANT_ID &&
        (roleCode === 'group_ceo' || roleCode.startsWith('group_'));
    if (isGroupCeoOnMaster &&
        claimCompany === GROUP_OPERATING_MAIN &&
        requestedCompanyId === GROUP_LEGAL_HOLDING) {
        const scope = (0, scope_context_1.resolveScopeContext)(authorization, {
            tenantId: normalized.tenantId ?? claimTenantId,
            companyId: GROUP_OPERATING_MAIN,
        });
        return { tenantId: scope.tenantId, companyId: GROUP_LEGAL_HOLDING };
    }
    return (0, scope_context_1.resolveScopeContext)(authorization, normalized);
}
