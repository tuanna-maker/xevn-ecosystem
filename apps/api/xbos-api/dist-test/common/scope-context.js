"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizePortalScopeRequest = normalizePortalScopeRequest;
exports.resolveScopeContext = resolveScopeContext;
exports.resolveTenantOnlyContext = resolveTenantOnlyContext;
const common_1 = require("@nestjs/common");
const api_exception_1 = require("./api.exception");
const internal_auth_1 = require("./internal-auth");
const tenant_constants_1 = require("./tenant.constants");
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
/**
 * Portal/CC may echo operating bucket `main` as `x-tenant-id` while JWT carries `xevn`
 * (ADR-GROUP-CEO-MAIN-HOLDING-SCOPE — same pattern as hrm-api scope-context).
 */
function normalizePortalScopeRequest(claimTenantId, _claimCompanyId, requested) {
    const reqTenant = requested.tenantId?.trim();
    const reqCompany = requested.companyId?.trim();
    if (claimTenantId?.trim().toLowerCase() === tenant_constants_1.MASTER_TENANT_ID &&
        reqTenant?.toLowerCase() === tenant_constants_1.MEMBER_DEFAULT_COMPANY_ID) {
        return { tenantId: tenant_constants_1.MASTER_TENANT_ID, companyId: reqCompany };
    }
    return { tenantId: reqTenant, companyId: reqCompany };
}
/**
 * Resolve both tenantId AND companyId — dùng cho endpoints cần đầy đủ scope.
 */
function resolveScopeContext(authorization, requested) {
    const jwtPayload = (0, internal_auth_1.getVerifiedInternalJwtPayload)(authorization);
    const claimTenantId = jwtPayload
        ? readClaim(jwtPayload, 'tenantId', 'tenant_id', 'tid')
        : undefined;
    const claimCompanyId = jwtPayload
        ? readClaim(jwtPayload, 'companyId', 'company_id', 'cid')
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
        claimCompanyId !== normalizedRequest.companyId) {
        throw new api_exception_1.ApiException('SCOPE_CONTEXT_MISMATCH', 'companyId mismatches token scope', common_1.HttpStatus.CONFLICT, {
            field: 'companyId',
            token: claimCompanyId,
            request: normalizedRequest.companyId,
        });
    }
    return { tenantId, companyId };
}
/**
 * Resolve chỉ tenantId — dùng cho catalog / tenant-level endpoints không cần companyId.
 * companyId sẽ fallback về tenantId nếu không cung cấp (tương thích ngược với ScopeContext shape).
 */
function resolveTenantOnlyContext(authorization, requested) {
    const jwtPayload = (0, internal_auth_1.getVerifiedInternalJwtPayload)(authorization);
    const claimTenantId = jwtPayload
        ? readClaim(jwtPayload, 'tenantId', 'tenant_id', 'tid')
        : undefined;
    const claimCompanyId = jwtPayload
        ? readClaim(jwtPayload, 'companyId', 'company_id', 'cid')
        : undefined;
    const normalizedRequest = normalizePortalScopeRequest(claimTenantId, claimCompanyId, requested);
    const tenantId = assertScopeId(claimTenantId ?? normalizedRequest.tenantId, 'tenantId');
    // companyId optional: nếu không có, fallback về tenantId (group scope)
    const companyId = (claimCompanyId ?? normalizedRequest.companyId ?? tenantId).trim();
    return { tenantId, companyId };
}
