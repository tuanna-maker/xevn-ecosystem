"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XBOS_GROUP_LEGAL_HOLDING = exports.XBOS_GROUP_OPERATING_MAIN = exports.XBOS_MASTER_TENANT_ID = void 0;
exports.isGroupCeoOnMasterTenant = isGroupCeoOnMasterTenant;
exports.resolveXbosGroupLegalReadScopeContext = resolveXbosGroupLegalReadScopeContext;
exports.resolveXbosGroupLegalMutationScopeContext = resolveXbosGroupLegalMutationScopeContext;
exports.isLegalEntityUuid = isLegalEntityUuid;
exports.assertJwtMayReadLegalEntityPartition = assertJwtMayReadLegalEntityPartition;
exports.resolveRaciMatrixJwtScope = resolveRaciMatrixJwtScope;
const common_1 = require("@nestjs/common");
const api_exception_1 = require("./api.exception");
const internal_auth_1 = require("./internal-auth");
const scope_context_1 = require("./scope-context");
const tenant_constants_1 = require("./tenant.constants");
exports.XBOS_MASTER_TENANT_ID = 'xevn';
exports.XBOS_GROUP_OPERATING_MAIN = 'main';
exports.XBOS_GROUP_LEGAL_HOLDING = 'holding';
function readClaim(payload, ...keys) {
    for (const key of keys) {
        const value = payload[key];
        if (typeof value === 'string' && value.trim()) {
            return value.trim();
        }
    }
    return undefined;
}
function isGroupCeoOnMasterTenant(claimTenantId, roleCode) {
    return (claimTenantId === exports.XBOS_MASTER_TENANT_ID &&
        (roleCode === 'group_ceo' || roleCode.startsWith('group_')));
}
/**
 * Group CEO JWT on `main` reads XBOS legal-entity partition under `holding`
 * (catalog get/list, org-foundation, platform-audit — ADR-GROUP-CEO-MAIN-HOLDING-SCOPE §4).
 * Writes that require strict JWT match must still use `resolveScopeContext`.
 */
function resolveXbosGroupLegalReadScopeContext(authorization, requested) {
    const jwtPayload = (0, internal_auth_1.getVerifiedInternalJwtPayload)(authorization);
    const claimTenantId = jwtPayload ? readClaim(jwtPayload, 'tenantId', 'tenant_id', 'tid') : undefined;
    const claimCompanyId = jwtPayload ? readClaim(jwtPayload, 'companyId', 'company_id', 'cid') : undefined;
    const normalized = (0, scope_context_1.normalizePortalScopeRequest)(claimTenantId, claimCompanyId, requested);
    const roleCode = (jwtPayload ? readClaim(jwtPayload, 'roleCode', 'role_code', 'role') ?? '' : '').toLowerCase();
    const requestedTenant = normalized.tenantId?.trim().toLowerCase();
    const requestedCompanyId = normalized.companyId?.trim().toLowerCase();
    const requestedCompany = normalized.companyId?.trim();
    const claimCompany = claimCompanyId?.trim().toLowerCase();
    // Group CEO reads member legal-entity rows with registry tenant slug headers (edit preload / list).
    if (isGroupCeoOnMasterTenant(claimTenantId, roleCode) &&
        claimCompany === exports.XBOS_GROUP_OPERATING_MAIN &&
        requestedTenant &&
        requestedTenant !== exports.XBOS_MASTER_TENANT_ID &&
        requestedTenant !== exports.XBOS_GROUP_OPERATING_MAIN) {
        (0, scope_context_1.resolveScopeContext)(authorization, {
            tenantId: claimTenantId,
            companyId: claimCompanyId,
        });
        return {
            tenantId: assertScopeSlug(requestedTenant, 'tenantId'),
            companyId: assertScopeSlug(requestedCompany ?? tenant_constants_1.MEMBER_DEFAULT_COMPANY_ID, 'companyId'),
        };
    }
    if (isGroupCeoOnMasterTenant(claimTenantId, roleCode) &&
        claimCompany === exports.XBOS_GROUP_OPERATING_MAIN &&
        (!requestedCompanyId ||
            requestedCompanyId === exports.XBOS_GROUP_OPERATING_MAIN ||
            requestedCompanyId === exports.XBOS_GROUP_LEGAL_HOLDING)) {
        const scope = (0, scope_context_1.resolveScopeContext)(authorization, {
            tenantId: normalized.tenantId ?? claimTenantId,
            companyId: exports.XBOS_GROUP_OPERATING_MAIN,
        });
        return { tenantId: scope.tenantId, companyId: exports.XBOS_GROUP_LEGAL_HOLDING };
    }
    return (0, scope_context_1.resolveScopeContext)(authorization, normalized);
}
function assertScopeSlug(value, field) {
    if (!value?.trim()) {
        throw new api_exception_1.ApiException(field === 'tenantId' ? 'SCOPE_TENANT_REQUIRED' : 'SCOPE_COMPANY_REQUIRED', `${field} is required`, common_1.HttpStatus.BAD_REQUEST, { field });
    }
    const trimmed = value.trim();
    if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]{1,62}$/.test(trimmed)) {
        throw new api_exception_1.ApiException(field === 'tenantId' ? 'SCOPE_TENANT_INVALID' : 'SCOPE_COMPANY_INVALID', `${field} format is invalid`, common_1.HttpStatus.BAD_REQUEST, { field, value: trimmed });
    }
    return trimmed;
}
/**
 * Group CEO mutates member legal-entity rows under registry tenant slug + default company
 * (Command Center company_member_units — ADR-GROUP-CEO-MAIN-HOLDING-SCOPE).
 * Validates bearer via JWT claims only; does not 409 when claim xevn/main and request xe-tmdv/main.
 */
function resolveXbosGroupLegalMutationScopeContext(authorization, requested) {
    const jwtPayload = (0, internal_auth_1.getVerifiedInternalJwtPayload)(authorization);
    const claimTenantId = jwtPayload ? readClaim(jwtPayload, 'tenantId', 'tenant_id', 'tid') : undefined;
    const claimCompanyId = jwtPayload ? readClaim(jwtPayload, 'companyId', 'company_id', 'cid') : undefined;
    const roleCode = (jwtPayload ? readClaim(jwtPayload, 'roleCode', 'role_code', 'role') ?? '' : '').toLowerCase();
    (0, scope_context_1.resolveScopeContext)(authorization, {
        tenantId: claimTenantId,
        companyId: claimCompanyId,
    });
    const normalized = (0, scope_context_1.normalizePortalScopeRequest)(claimTenantId, claimCompanyId, requested);
    const requestedTenant = normalized.tenantId?.trim().toLowerCase();
    const requestedCompany = normalized.companyId?.trim().toLowerCase();
    const claimCompany = claimCompanyId?.trim().toLowerCase();
    if (isGroupCeoOnMasterTenant(claimTenantId, roleCode) &&
        claimCompany === exports.XBOS_GROUP_OPERATING_MAIN &&
        (!requestedCompany ||
            requestedCompany === exports.XBOS_GROUP_OPERATING_MAIN ||
            requestedCompany === exports.XBOS_GROUP_LEGAL_HOLDING) &&
        (!requestedTenant || requestedTenant === exports.XBOS_MASTER_TENANT_ID)) {
        return { tenantId: exports.XBOS_MASTER_TENANT_ID, companyId: exports.XBOS_GROUP_LEGAL_HOLDING };
    }
    if (isGroupCeoOnMasterTenant(claimTenantId, roleCode) &&
        claimCompany === exports.XBOS_GROUP_OPERATING_MAIN &&
        requestedTenant &&
        requestedTenant !== exports.XBOS_MASTER_TENANT_ID &&
        requestedTenant !== exports.XBOS_GROUP_OPERATING_MAIN) {
        return {
            tenantId: assertScopeSlug(requestedTenant, 'tenantId'),
            companyId: assertScopeSlug(requestedCompany ?? tenant_constants_1.MEMBER_DEFAULT_COMPANY_ID, 'companyId'),
        };
    }
    return (0, scope_context_1.resolveScopeContext)(authorization, normalized);
}
function isLegalEntityUuid(value) {
    const id = value?.trim();
    return !!id && /^[0-9a-f-]{36}$/i.test(id);
}
/**
 * Group CEO on master may read any member legal-entity row; member CEOs only their tenant.
 * Used by RACI matrix path `companies/{legalEntityUuid}/…` (UC-CC-03 / BE-W5).
 */
function assertJwtMayReadLegalEntityPartition(authorization, jwtScope, partition) {
    const jwtPayload = (0, internal_auth_1.getVerifiedInternalJwtPayload)(authorization);
    const roleCode = (jwtPayload ? readClaim(jwtPayload, 'roleCode', 'role_code', 'role') ?? '' : '').toLowerCase();
    const claimTenantId = jwtScope.tenantId.trim().toLowerCase();
    if (isGroupCeoOnMasterTenant(claimTenantId, roleCode)) {
        return;
    }
    if (partition.tenantId.trim().toLowerCase() !== claimTenantId) {
        throw new api_exception_1.ApiException('SCOPE_CONTEXT_MISMATCH', 'tenantId mismatches token scope', common_1.HttpStatus.CONFLICT, {
            field: 'tenantId',
            token: jwtScope.tenantId,
            request: partition.tenantId,
        });
    }
}
/**
 * Resolve JWT gate for RACI matrix/coverage when path key is a legal-entity UUID.
 * Path UUID must not be compared to JWT `companyId=main` (C-QC02-04).
 */
function resolveRaciMatrixJwtScope(authorization, requested) {
    const jwtPayload = (0, internal_auth_1.getVerifiedInternalJwtPayload)(authorization);
    const claimTenantId = jwtPayload ? readClaim(jwtPayload, 'tenantId', 'tenant_id', 'tid') : undefined;
    const claimCompanyId = jwtPayload ? readClaim(jwtPayload, 'companyId', 'company_id', 'cid') : undefined;
    const roleCode = (jwtPayload ? readClaim(jwtPayload, 'roleCode', 'role_code', 'role') ?? '' : '').toLowerCase();
    if (isGroupCeoOnMasterTenant(claimTenantId, roleCode)) {
        return (0, scope_context_1.resolveScopeContext)(authorization, {
            tenantId: claimTenantId ?? requested.tenantId,
            companyId: claimCompanyId ?? requested.companyId ?? exports.XBOS_GROUP_OPERATING_MAIN,
        });
    }
    return (0, scope_context_1.resolveScopeContext)(authorization, requested);
}
