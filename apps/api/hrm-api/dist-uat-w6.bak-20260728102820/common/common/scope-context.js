"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveScopeContext = resolveScopeContext;
const common_1 = require("@nestjs/common");
const api_exception_1 = require("./api.exception");
const hrm_list_scope_1 = require("./hrm-list-scope");
const internal_auth_1 = require("./internal-auth");
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function isUuid(value) {
    return UUID_RE.test(value.trim());
}
function normalizeUuid(value) {
    return value.trim().toLowerCase();
}
function isGroupCeoMemberSlugNarrowFilter(claimTenantId, claimCompanyId, roleCode, requestedCompanyId) {
    if (!claimTenantId || !claimCompanyId || !requestedCompanyId) {
        return false;
    }
    if (claimTenantId.trim() !== hrm_list_scope_1.MASTER_TENANT_ID) {
        return false;
    }
    if (claimCompanyId.trim() !== hrm_list_scope_1.HRM_PILOT_OPERATING_COMPANY_ID) {
        return false;
    }
    const role = (roleCode ?? '').trim().toLowerCase();
    if (role !== 'group_ceo' && !role.startsWith('group_')) {
        return false;
    }
    const requested = requestedCompanyId.trim().toLowerCase();
    return hrm_list_scope_1.HRM_GROUP_MEMBER_COMPANY_SLUGS.includes(requested);
}
function isGroupCeoPilotCompanyUuid(claimTenantId, claimCompanyId, roleCode, requestedCompanyId) {
    if (!claimTenantId || !claimCompanyId || !requestedCompanyId) {
        return false;
    }
    if (claimTenantId.trim() !== hrm_list_scope_1.MASTER_TENANT_ID) {
        return false;
    }
    if (claimCompanyId.trim() !== hrm_list_scope_1.HRM_PILOT_OPERATING_COMPANY_ID) {
        return false;
    }
    const role = (roleCode ?? '').trim().toLowerCase();
    if (role !== 'group_ceo' && !role.startsWith('group_')) {
        return false;
    }
    if (!isUuid(requestedCompanyId)) {
        return false;
    }
    const requested = normalizeUuid(requestedCompanyId);
    return Object.values(hrm_list_scope_1.HRM_COMPANY_UUID_BY_SLUG).some((uuid) => normalizeUuid(uuid) === requested);
}
function companyScopeMatches(claimCompanyId, claimCompanyUuid, requestedCompanyId, scopeGate) {
    if (!claimCompanyId || !requestedCompanyId) {
        return true;
    }
    const claim = claimCompanyId.trim();
    const requested = requestedCompanyId.trim();
    if (claim === requested) {
        return true;
    }
    if (isGroupCeoMemberSlugNarrowFilter(scopeGate?.claimTenantId, claim, scopeGate?.roleCode, requested)) {
        return true;
    }
    if (scopeGate &&
        isGroupCeoPilotCompanyUuid(scopeGate.claimTenantId, claim, scopeGate.roleCode, requested)) {
        return true;
    }
    const claimUuid = claimCompanyUuid?.trim();
    if (claimUuid && isUuid(claimUuid) && isUuid(requested)) {
        return normalizeUuid(claimUuid) === normalizeUuid(requested);
    }
    return false;
}
function readClaim(payload, ...keys) {
    for (const key of keys) {
        const value = payload[key];
        if (typeof value === 'string' && value.trim()) {
            return value.trim();
        }
    }
    return undefined;
}
function assertScopeId(value, field) {
    if (!value) {
        throw new api_exception_1.ApiException(field === 'tenantId' ? 'SCOPE_TENANT_REQUIRED' : 'SCOPE_COMPANY_REQUIRED', `${field} is required`, common_1.HttpStatus.BAD_REQUEST, { field });
    }
    if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]{1,62}$/.test(value)) {
        throw new api_exception_1.ApiException(field === 'tenantId' ? 'SCOPE_TENANT_INVALID' : 'SCOPE_COMPANY_INVALID', `${field} format is invalid`, common_1.HttpStatus.BAD_REQUEST, { field, value });
    }
    return value;
}
function normalizePortalScopeRequest(claimTenantId, claimCompanyId, requested) {
    const reqTenant = requested.tenantId?.trim();
    const reqCompany = requested.companyId?.trim();
    if (claimTenantId === hrm_list_scope_1.MASTER_TENANT_ID &&
        reqTenant === hrm_list_scope_1.HRM_PILOT_OPERATING_COMPANY_ID &&
        (!reqCompany ||
            reqCompany === hrm_list_scope_1.HRM_PILOT_OPERATING_COMPANY_ID ||
            (claimCompanyId && reqCompany === claimCompanyId))) {
        return { tenantId: hrm_list_scope_1.MASTER_TENANT_ID, companyId: reqCompany };
    }
    return { tenantId: reqTenant, companyId: reqCompany };
}
function resolveScopeContext(authorization, requested) {
    const jwtPayload = (0, internal_auth_1.getVerifiedInternalJwtPayload)(authorization);
    const claimTenantId = jwtPayload
        ? readClaim(jwtPayload, 'tenantId', 'tenant_id', 'tid')
        : undefined;
    const claimCompanyId = jwtPayload
        ? readClaim(jwtPayload, 'companyId', 'company_id', 'cid')
        : undefined;
    const claimCompanyUuid = jwtPayload
        ? readClaim(jwtPayload, 'company_uuid', 'companyUuid')
        : undefined;
    const roleCode = jwtPayload
        ? readClaim(jwtPayload, 'roleCode', 'role_code', 'role')
        : undefined;
    const normalizedRequest = normalizePortalScopeRequest(claimTenantId, claimCompanyId, requested);
    const tenantId = assertScopeId(claimTenantId ?? normalizedRequest.tenantId, 'tenantId');
    const companyId = assertScopeId(claimCompanyId ?? normalizedRequest.companyId, 'companyId');
    if (claimTenantId && normalizedRequest.tenantId && claimTenantId !== normalizedRequest.tenantId) {
        throw new api_exception_1.ApiException('SCOPE_CONTEXT_MISMATCH', 'tenantId mismatches token scope', common_1.HttpStatus.CONFLICT, {
            field: 'tenantId',
            token: claimTenantId,
            request: normalizedRequest.tenantId,
        });
    }
    if (claimCompanyId &&
        normalizedRequest.companyId &&
        !companyScopeMatches(claimCompanyId, claimCompanyUuid, normalizedRequest.companyId, {
            claimTenantId,
            roleCode,
        })) {
        throw new api_exception_1.ApiException('SCOPE_CONTEXT_MISMATCH', 'companyId mismatches token scope', common_1.HttpStatus.CONFLICT, {
            field: 'companyId',
            token: claimCompanyId,
            request: normalizedRequest.companyId,
            ...(claimCompanyUuid ? { tokenCompanyUuid: claimCompanyUuid } : {}),
        });
    }
    return { tenantId, companyId };
}
//# sourceMappingURL=scope-context.js.map