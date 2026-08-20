"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MASTER_TENANT_ID = exports.HRM_COMPANY_UUID_BY_SLUG = exports.HRM_PILOT_OPERATING_COMPANY_ID = exports.HRM_GROUP_MEMBER_COMPANY_SLUGS = void 0;
exports.resolveHrmCompanyUuidForSlug = resolveHrmCompanyUuidForSlug;
exports.resolveHrmCompanySlugForId = resolveHrmCompanySlugForId;
exports.normalizePayrollListCompanyId = normalizePayrollListCompanyId;
exports.normalizeHomeSummaryCompanyId = normalizeHomeSummaryCompanyId;
exports.expandHrmTextCompanyIds = expandHrmTextCompanyIds;
exports.resolveHrmListScope = resolveHrmListScope;
exports.pushCompanyIdFilter = pushCompanyIdFilter;
exports.pushCompanyIdUuidFilter = pushCompanyIdUuidFilter;
exports.resolveHrmOperationsPersistCompanyId = resolveHrmOperationsPersistCompanyId;
exports.resolveHrmPersistCompanyIdText = resolveHrmPersistCompanyIdText;
exports.pushCompanyIdTextColumnFilter = pushCompanyIdTextColumnFilter;
exports.pushEmployeeListScopeFilters = pushEmployeeListScopeFilters;
exports.pushWorkforceEmployeeScopeFilter = pushWorkforceEmployeeScopeFilter;
exports.resolveHrmSettingsCatalogCompanyId = resolveHrmSettingsCatalogCompanyId;
exports.assertResourceInHrmScope = assertResourceInHrmScope;
const common_1 = require("@nestjs/common");
const api_exception_1 = require("./api.exception");
const internal_auth_1 = require("./internal-auth");
exports.HRM_GROUP_MEMBER_COMPANY_SLUGS = [
    'holding',
    'trsport',
    'logistics',
    'finance',
    'services',
];
exports.HRM_PILOT_OPERATING_COMPANY_ID = 'main';
exports.HRM_COMPANY_UUID_BY_SLUG = {
    holding: '10000000-0000-4000-8000-000000000001',
    trsport: '10000000-0000-4000-8000-000000000002',
    logistics: '10000000-0000-4000-8000-000000000003',
    finance: '10000000-0000-4000-8000-000000000004',
    services: '10000000-0000-4000-8000-000000000005',
};
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function resolveHrmCompanyUuidForSlug(companySlug) {
    const trimmed = companySlug.trim().toLowerCase();
    if (!trimmed) {
        return null;
    }
    if (UUID_RE.test(trimmed)) {
        return trimmed;
    }
    if (trimmed === exports.HRM_PILOT_OPERATING_COMPANY_ID) {
        return exports.HRM_COMPANY_UUID_BY_SLUG.holding;
    }
    const mapped = exports.HRM_COMPANY_UUID_BY_SLUG[trimmed];
    return mapped ?? null;
}
function resolveHrmCompanySlugForId(companyId) {
    const trimmed = companyId.trim().toLowerCase();
    if (!trimmed || !UUID_RE.test(trimmed)) {
        return trimmed;
    }
    const wanted = normalizeUuid(trimmed);
    for (const slug of exports.HRM_GROUP_MEMBER_COMPANY_SLUGS) {
        if (normalizeUuid(exports.HRM_COMPANY_UUID_BY_SLUG[slug]) === wanted) {
            return slug;
        }
    }
    return trimmed;
}
exports.MASTER_TENANT_ID = 'xevn';
function readClaim(payload, ...keys) {
    for (const key of keys) {
        const value = payload[key];
        if (typeof value === 'string' && value.trim()) {
            return value.trim();
        }
    }
    return undefined;
}
function normalizeUuid(value) {
    return value.trim().toLowerCase();
}
function readJwtPayload(authorization) {
    return (0, internal_auth_1.getVerifiedInternalJwtPayload)(authorization);
}
function normalizePayrollListCompanyId(authorization, requestedCompanyId) {
    const requested = requestedCompanyId.trim();
    if (!requested || requested === exports.HRM_PILOT_OPERATING_COMPANY_ID) {
        return requested;
    }
    const payload = readJwtPayload(authorization);
    if (!payload) {
        return requested;
    }
    const claimUuid = readClaim(payload, 'company_uuid', 'companyUuid');
    const claimSlug = readClaim(payload, 'companyId', 'company_id', 'cid');
    if (claimUuid &&
        claimSlug &&
        UUID_RE.test(requested) &&
        normalizeUuid(claimUuid) === normalizeUuid(requested)) {
        return claimSlug;
    }
    return requested;
}
function normalizeHomeSummaryCompanyId(authorization, requestedCompanyId) {
    const slug = normalizePayrollListCompanyId(authorization, requestedCompanyId);
    const payload = readJwtPayload(authorization);
    if (!payload) {
        return slug;
    }
    const claimSlug = readClaim(payload, 'companyId', 'company_id', 'cid')?.toLowerCase();
    if (!claimSlug) {
        return slug;
    }
    const roleCode = (readClaim(payload, 'roleCode', 'role_code', 'role') ?? '').toLowerCase();
    const isGroupRollupClaim = claimSlug === exports.HRM_PILOT_OPERATING_COMPANY_ID ||
        roleCode === 'group_ceo' ||
        roleCode.startsWith('group_');
    if (!isGroupRollupClaim &&
        (slug === 'holding' || slug === exports.HRM_PILOT_OPERATING_COMPANY_ID) &&
        claimSlug !== 'holding' &&
        exports.HRM_GROUP_MEMBER_COMPANY_SLUGS.includes(claimSlug)) {
        return claimSlug;
    }
    return slug;
}
function expandHrmTextCompanyIds(scope, authorization, requestedCompanyId) {
    const out = new Set(scope.companyIds.map((id) => id.trim().toLowerCase()).filter(Boolean));
    const payload = readJwtPayload(authorization);
    if (!payload) {
        return [...out];
    }
    const claimUuid = readClaim(payload, 'company_uuid', 'companyUuid')?.toLowerCase();
    const claimSlug = readClaim(payload, 'companyId', 'company_id', 'cid')?.toLowerCase();
    const req = requestedCompanyId?.trim().toLowerCase() ?? '';
    if (claimUuid && claimSlug) {
        if (!req || req === claimSlug || req === claimUuid || out.has(claimSlug) || out.has(claimUuid)) {
            out.add(claimSlug);
            out.add(claimUuid);
        }
    }
    return [...out];
}
function resolveHrmListScope(authorization, requestedCompanyId, context) {
    const jwtPayload = (0, internal_auth_1.getVerifiedInternalJwtPayload)(authorization);
    const tenantId = (jwtPayload ? readClaim(jwtPayload, 'tenantId', 'tenant_id', 'tid') : undefined) ??
        context?.tenantId?.trim() ??
        '';
    const roleCode = (jwtPayload ? readClaim(jwtPayload, 'roleCode', 'role_code', 'role') ?? '' : '').toLowerCase();
    const claimCompany = jwtPayload
        ? readClaim(jwtPayload, 'companyId', 'company_id', 'cid') ?? requestedCompanyId
        : requestedCompanyId;
    const isGroupRollup = tenantId === exports.MASTER_TENANT_ID &&
        requestedCompanyId === exports.HRM_PILOT_OPERATING_COMPANY_ID &&
        claimCompany === exports.HRM_PILOT_OPERATING_COMPANY_ID &&
        (roleCode === 'group_ceo' || roleCode.startsWith('group_'));
    const serviceGroupMain = !jwtPayload &&
        tenantId === exports.MASTER_TENANT_ID &&
        requestedCompanyId === exports.HRM_PILOT_OPERATING_COMPANY_ID;
    if (isGroupRollup || serviceGroupMain) {
        return {
            companyIds: [...exports.HRM_GROUP_MEMBER_COMPANY_SLUGS],
            masterTenantPartition: true,
        };
    }
    if (tenantId &&
        tenantId !== exports.MASTER_TENANT_ID &&
        requestedCompanyId === exports.HRM_PILOT_OPERATING_COMPANY_ID) {
        return {
            companyIds: [exports.HRM_PILOT_OPERATING_COMPANY_ID],
            masterTenantPartition: false,
            memberTenantId: tenantId,
        };
    }
    return {
        companyIds: [requestedCompanyId],
        masterTenantPartition: false,
    };
}
function pushCompanyIdFilter(filters, values, companyIds) {
    if (companyIds.length === 1) {
        values.push(companyIds[0]);
        filters.push(`company_id = $${values.length}::text`);
        return;
    }
    values.push(companyIds);
    filters.push(`company_id = ANY($${values.length}::text[])`);
}
function companyIdsToUuidList(companyIds) {
    return companyIds.map((id) => {
        const trimmed = id.trim().toLowerCase();
        if (UUID_RE.test(trimmed)) {
            return trimmed;
        }
        if (trimmed === exports.HRM_PILOT_OPERATING_COMPANY_ID) {
            return exports.HRM_COMPANY_UUID_BY_SLUG.holding;
        }
        const mapped = exports.HRM_COMPANY_UUID_BY_SLUG[trimmed];
        return mapped ?? trimmed;
    });
}
function pushCompanyIdUuidFilter(filters, values, companyIds) {
    const uuids = companyIdsToUuidList(companyIds);
    if (uuids.length === 1) {
        values.push(uuids[0]);
        filters.push(`company_id = $${values.length}::uuid`);
        return;
    }
    values.push(uuids);
    filters.push(`company_id = ANY($${values.length}::uuid[])`);
}
function resolveHrmOperationsPersistCompanyId(authorization, requestedCompanyId, context) {
    const scope = resolveHrmListScope(authorization, requestedCompanyId, context);
    if (scope.masterTenantPartition) {
        return exports.HRM_COMPANY_UUID_BY_SLUG.holding;
    }
    const trimmed = requestedCompanyId.trim();
    if (UUID_RE.test(trimmed)) {
        return trimmed.toLowerCase();
    }
    return exports.HRM_COMPANY_UUID_BY_SLUG[trimmed] ?? trimmed;
}
function resolveHrmPersistCompanyIdText(authorization, requestedCompanyId, context) {
    const raw = resolveHrmCompanySlugForId(requestedCompanyId);
    const scope = resolveHrmListScope(authorization, raw, context);
    const persisted = raw === exports.HRM_PILOT_OPERATING_COMPANY_ID && scope.masterTenantPartition ? 'holding' : raw;
    const allowed = new Set(scope.companyIds.map((id) => id.trim().toLowerCase()));
    if (!allowed.has(persisted)) {
        throw new api_exception_1.ApiException('HRM-SCOPE-409', 'Resource company_id is outside token scope', common_1.HttpStatus.CONFLICT);
    }
    return persisted;
}
function pushCompanyIdTextColumnFilter(filters, values, companyIds) {
    if (companyIds.length === 1) {
        values.push(companyIds[0]);
        filters.push(`company_id::text = $${values.length}`);
        return;
    }
    values.push(companyIds);
    filters.push(`company_id::text = ANY($${values.length}::text[])`);
}
function pushEmployeeListScopeFilters(filters, values, scope, options) {
    pushCompanyIdFilter(filters, values, scope.companyIds);
    if (options?.skipTenantPartition) {
        return;
    }
    if (scope.masterTenantPartition) {
        values.push(exports.MASTER_TENANT_ID);
        const tenantParam = values.length;
        filters.push(`COALESCE(NULLIF(TRIM(custom_fields->>'tenant_id'), ''), $${tenantParam}) = $${tenantParam}`);
    }
    else if (scope.memberTenantId) {
        values.push(scope.memberTenantId);
        filters.push(`NULLIF(TRIM(custom_fields->>'tenant_id'), '') = $${values.length}`);
    }
}
function pushWorkforceEmployeeScopeFilter(filters, values, scope, employeeIdColumn = 'employee_id') {
    if (scope.masterTenantPartition) {
        values.push(exports.MASTER_TENANT_ID);
        const tenantParam = values.length;
        values.push([...scope.companyIds]);
        const slugParam = values.length;
        filters.push(`${employeeIdColumn} IN (
        SELECT id FROM public.employees
        WHERE COALESCE(NULLIF(TRIM(custom_fields->>'tenant_id'), ''), $${tenantParam}) = $${tenantParam}
          AND company_id = ANY($${slugParam}::text[])
      )`);
        return;
    }
    if (scope.memberTenantId) {
        values.push(scope.memberTenantId);
        const tenantParam = values.length;
        values.push(exports.HRM_PILOT_OPERATING_COMPANY_ID);
        const companyParam = values.length;
        filters.push(`${employeeIdColumn} IN (
        SELECT id FROM public.employees
        WHERE NULLIF(TRIM(custom_fields->>'tenant_id'), '') = $${tenantParam}
          AND company_id = $${companyParam}
      )`);
        return;
    }
    if (scope.companyIds.length === 1) {
        values.push(scope.companyIds[0]);
        const slugParam = values.length;
        filters.push(`${employeeIdColumn} IN (
        SELECT id FROM public.employees
        WHERE company_id = $${slugParam}::text AND archived_at IS NULL
      )`);
        return;
    }
    values.push([...scope.companyIds]);
    const slugParam = values.length;
    filters.push(`${employeeIdColumn} IN (
      SELECT id FROM public.employees
      WHERE company_id = ANY($${slugParam}::text[]) AND archived_at IS NULL
    )`);
}
function resolveHrmSettingsCatalogCompanyId(authorization, tenantId, companyId) {
    const normalized = resolveHrmCompanySlugForId(companyId);
    const scope = resolveHrmListScope(authorization, normalized, { tenantId });
    if (tenantId.trim().toLowerCase() === exports.MASTER_TENANT_ID &&
        normalized === exports.HRM_PILOT_OPERATING_COMPANY_ID &&
        scope.masterTenantPartition) {
        return 'holding';
    }
    return normalized;
}
function readResourceTenantId(resource) {
    const raw = resource?.custom_fields?.tenant_id;
    return typeof raw === 'string' ? raw.trim() : '';
}
function buildAllowedCompanyKeys(scope) {
    const slugs = new Set(scope.companyIds.map((id) => id.trim().toLowerCase()));
    if (scope.memberTenantId) {
        const uuids = new Set();
        for (const id of scope.companyIds) {
            const trimmed = id.trim();
            if (UUID_RE.test(trimmed)) {
                uuids.add(normalizeUuid(trimmed));
            }
        }
        return { slugs, uuids };
    }
    return { slugs, uuids: new Set(companyIdsToUuidList(scope.companyIds)) };
}
function assertResourceInHrmScope(resource, scope, options) {
    const notFoundCode = options?.notFoundCode ?? 'HRM-SCOPE-404';
    const mismatchCode = options?.mismatchCode ?? 'HRM-SCOPE-409';
    const companyId = resource?.company_id?.trim().toLowerCase();
    if (!companyId) {
        throw new api_exception_1.ApiException(notFoundCode, 'Resource not found', common_1.HttpStatus.NOT_FOUND);
    }
    const { slugs: allowedSlugs, uuids: allowedUuids } = buildAllowedCompanyKeys(scope);
    const companyAllowed = allowedSlugs.has(companyId) || allowedUuids.has(companyId);
    if (!companyAllowed) {
        throw new api_exception_1.ApiException(mismatchCode, 'Resource company_id is outside token scope', common_1.HttpStatus.CONFLICT);
    }
    const rowTenant = readResourceTenantId(resource);
    if (scope.memberTenantId) {
        if (!rowTenant || rowTenant !== scope.memberTenantId) {
            throw new api_exception_1.ApiException(mismatchCode, 'Resource tenant_id is outside token scope', common_1.HttpStatus.CONFLICT);
        }
        return;
    }
    if (scope.masterTenantPartition) {
        const effectiveTenant = rowTenant || exports.MASTER_TENANT_ID;
        if (effectiveTenant !== exports.MASTER_TENANT_ID) {
            throw new api_exception_1.ApiException(mismatchCode, 'Resource tenant_id is outside token scope', common_1.HttpStatus.CONFLICT);
        }
    }
}
//# sourceMappingURL=hrm-list-scope.js.map