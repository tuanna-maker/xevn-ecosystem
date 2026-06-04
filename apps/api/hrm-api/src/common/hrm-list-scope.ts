import { HttpStatus } from '@nestjs/common';
import { ApiException } from './api.exception';
import { getVerifiedInternalJwtPayload } from './internal-auth';

/** Operating unit slugs for master UAT workforce — ADR-HRM-RBAC-SCOPE-LADDER §3. */
export const HRM_GROUP_MEMBER_COMPANY_SLUGS = [
  'holding',
  'trsport',
  'logistics',
  'finance',
  'services',
] as const;

/** Portal / HRM JWT operating bucket for group and member CEOs. */
export const HRM_PILOT_OPERATING_COMPANY_ID = 'main';

/** Pilot UUIDs for `hrm_tasks` / `service_requests` (seed-full-ecosystem). */
export const HRM_COMPANY_UUID_BY_SLUG: Record<(typeof HRM_GROUP_MEMBER_COMPANY_SLUGS)[number], string> = {
  holding: '10000000-0000-4000-8000-000000000001',
  trsport: '10000000-0000-4000-8000-000000000002',
  logistics: '10000000-0000-4000-8000-000000000003',
  finance: '10000000-0000-4000-8000-000000000004',
  services: '10000000-0000-4000-8000-000000000005',
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Master tenant registry slug — portal JWT for group CEO. */
export const MASTER_TENANT_ID = 'xevn';

export type HrmListScope = {
  companyIds: string[];
  /** Group CEO on master: restrict employees to master tenant partition. */
  masterTenantPartition: boolean;
  /** Member subsidiary CEO: filter employees by custom_fields tenant. */
  memberTenantId?: string;
};

/** Optional request context when JWT is absent (internal API key + portal proxy). */
export type HrmListScopeContext = {
  tenantId?: string;
};

function readClaim(payload: Record<string, unknown>, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return undefined;
}

/**
 * Resolves SQL list filters for HRM operational APIs when JWT uses companyId=main.
 * Group CEO (master + group_ceo + main) rolls up GROUP_MEMBER_SLUGS per ADR / BA CARD rules.
 */
export function resolveHrmListScope(
  authorization: string | undefined,
  requestedCompanyId: string,
  context?: HrmListScopeContext,
): HrmListScope {
  const jwtPayload = getVerifiedInternalJwtPayload(authorization) as Record<string, unknown> | null;
  const tenantId =
    (jwtPayload ? readClaim(jwtPayload, 'tenantId', 'tenant_id', 'tid') : undefined) ??
    context?.tenantId?.trim() ??
    '';
  const roleCode = (jwtPayload ? readClaim(jwtPayload, 'roleCode', 'role_code', 'role') ?? '' : '').toLowerCase();
  const claimCompany = jwtPayload
    ? readClaim(jwtPayload, 'companyId', 'company_id', 'cid') ?? requestedCompanyId
    : requestedCompanyId;

  const isGroupRollup =
    tenantId === MASTER_TENANT_ID &&
    requestedCompanyId === HRM_PILOT_OPERATING_COMPANY_ID &&
    claimCompany === HRM_PILOT_OPERATING_COMPANY_ID &&
    (roleCode === 'group_ceo' || roleCode.startsWith('group_'));

  const serviceGroupMain =
    !jwtPayload &&
    tenantId === MASTER_TENANT_ID &&
    requestedCompanyId === HRM_PILOT_OPERATING_COMPANY_ID;

  if (isGroupRollup || serviceGroupMain) {
    return {
      companyIds: [...HRM_GROUP_MEMBER_COMPANY_SLUGS],
      masterTenantPartition: true,
    };
  }

  if (
    tenantId &&
    tenantId !== MASTER_TENANT_ID &&
    requestedCompanyId === HRM_PILOT_OPERATING_COMPANY_ID
  ) {
    return {
      companyIds: [HRM_PILOT_OPERATING_COMPANY_ID],
      masterTenantPartition: false,
      memberTenantId: tenantId,
    };
  }

  return {
    companyIds: [requestedCompanyId],
    masterTenantPartition: false,
  };
}

/** Append `company_id` predicate; supports single slug or group rollup IN list. */
export function pushCompanyIdFilter(
  filters: string[],
  values: unknown[],
  companyIds: string[],
): void {
  if (companyIds.length === 1) {
    values.push(companyIds[0]);
    filters.push(`company_id = $${values.length}::text`);
    return;
  }
  values.push(companyIds);
  filters.push(`company_id = ANY($${values.length}::text[])`);
}

function companyIdsToUuidList(companyIds: string[]): string[] {
  return companyIds.map((id) => {
    const trimmed = id.trim().toLowerCase();
    if (UUID_RE.test(trimmed)) {
      return trimmed;
    }
    if (trimmed === HRM_PILOT_OPERATING_COMPANY_ID) {
      return HRM_COMPANY_UUID_BY_SLUG.holding;
    }
    const mapped = HRM_COMPANY_UUID_BY_SLUG[trimmed as keyof typeof HRM_COMPANY_UUID_BY_SLUG];
    return mapped ?? trimmed;
  });
}

/** `company_id UUID` tables — maps slugs (`main` rollup → member UUIDs). */
export function pushCompanyIdUuidFilter(
  filters: string[],
  values: unknown[],
  companyIds: string[],
): void {
  const uuids = companyIdsToUuidList(companyIds);
  if (uuids.length === 1) {
    values.push(uuids[0]);
    filters.push(`company_id = $${values.length}::uuid`);
    return;
  }
  values.push(uuids);
  filters.push(`company_id = ANY($${values.length}::uuid[])`);
}

/** Persists writes when portal sends `company_id=main` (group CEO → holding UUID). */
export function resolveHrmOperationsPersistCompanyId(
  authorization: string | undefined,
  requestedCompanyId: string,
  context?: HrmListScopeContext,
): string {
  const scope = resolveHrmListScope(authorization, requestedCompanyId, context);
  if (scope.masterTenantPartition) {
    return HRM_COMPANY_UUID_BY_SLUG.holding;
  }
  const trimmed = requestedCompanyId.trim();
  if (UUID_RE.test(trimmed)) {
    return trimmed.toLowerCase();
  }
  return HRM_COMPANY_UUID_BY_SLUG[trimmed as keyof typeof HRM_COMPANY_UUID_BY_SLUG] ?? trimmed;
}

/**
 * Persist write paths for TEXT `company_id` tables when portal sends `company_id=main`.
 * - Group CEO rollup (`main`) must write into `holding` partition so list scope (holding + member slugs) can read it.
 * - Never widens access: if resolved persisted company_id is not inside list scope, throw conflict.
 */
export function resolveHrmPersistCompanyIdText(
  authorization: string | undefined,
  requestedCompanyId: string,
  context?: HrmListScopeContext,
): string {
  const scope = resolveHrmListScope(authorization, requestedCompanyId, context);
  const raw = requestedCompanyId.trim().toLowerCase();
  const persisted =
    raw === HRM_PILOT_OPERATING_COMPANY_ID && scope.masterTenantPartition ? 'holding' : raw;

  const allowed = new Set(scope.companyIds.map((id) => id.trim().toLowerCase()));
  if (!allowed.has(persisted)) {
    throw new ApiException(
      'HRM-SCOPE-409',
      'Resource company_id is outside token scope',
      HttpStatus.CONFLICT,
    );
  }
  return persisted;
}

/** Same as pushCompanyIdFilter but for UUID columns (portal slug `main` / `holding`). */
export function pushCompanyIdTextColumnFilter(
  filters: string[],
  values: unknown[],
  companyIds: string[],
): void {
  if (companyIds.length === 1) {
    values.push(companyIds[0]);
    filters.push(`company_id::text = $${values.length}`);
    return;
  }
  values.push(companyIds);
  filters.push(`company_id::text = ANY($${values.length}::text[])`);
}

export function pushEmployeeListScopeFilters(
  filters: string[],
  values: unknown[],
  scope: HrmListScope,
  options?: { skipTenantPartition?: boolean },
): void {
  pushCompanyIdFilter(filters, values, scope.companyIds);
  if (options?.skipTenantPartition) {
    return;
  }
  if (scope.masterTenantPartition) {
    values.push(MASTER_TENANT_ID);
    const tenantParam = values.length;
    filters.push(
      `COALESCE(NULLIF(TRIM(custom_fields->>'tenant_id'), ''), $${tenantParam}) = $${tenantParam}`,
    );
  } else if (scope.memberTenantId) {
    values.push(scope.memberTenantId);
    filters.push(`NULLIF(TRIM(custom_fields->>'tenant_id'), '') = $${values.length}`);
  }
}

/** Attendance / leave rows may use UUID company_id; scope via workforce employee_ids. */
export function pushWorkforceEmployeeScopeFilter(
  filters: string[],
  values: unknown[],
  scope: HrmListScope,
  employeeIdColumn = 'employee_id',
): void {
  if (scope.masterTenantPartition) {
    values.push(MASTER_TENANT_ID);
    const tenantParam = values.length;
    values.push([...scope.companyIds]);
    const slugParam = values.length;
    filters.push(
      `${employeeIdColumn} IN (
        SELECT id FROM public.employees
        WHERE COALESCE(NULLIF(TRIM(custom_fields->>'tenant_id'), ''), $${tenantParam}) = $${tenantParam}
          AND company_id = ANY($${slugParam}::text[])
      )`,
    );
    return;
  }
  if (scope.memberTenantId) {
    values.push(scope.memberTenantId);
    const tenantParam = values.length;
    values.push(HRM_PILOT_OPERATING_COMPANY_ID);
    const companyParam = values.length;
    filters.push(
      `${employeeIdColumn} IN (
        SELECT id FROM public.employees
        WHERE NULLIF(TRIM(custom_fields->>'tenant_id'), '') = $${tenantParam}
          AND company_id = $${companyParam}
      )`,
    );
    return;
  }
  pushCompanyIdFilter(filters, values, scope.companyIds);
}

/**
 * Group employee-import catalogs are stored under `holding` while portal JWT uses `main`.
 * Maps overview/sync scope for group CEO rollup on master tenant.
 */
export function resolveHrmSettingsCatalogCompanyId(
  authorization: string | undefined,
  tenantId: string,
  companyId: string,
): string {
  const scope = resolveHrmListScope(authorization, companyId, { tenantId });
  if (
    tenantId.trim().toLowerCase() === MASTER_TENANT_ID &&
    companyId.trim().toLowerCase() === HRM_PILOT_OPERATING_COMPANY_ID &&
    scope.masterTenantPartition
  ) {
    return 'holding';
  }
  return companyId.trim().toLowerCase();
}

/** Row-level scope guard for mutate-by-id (P1-01 / P1-02). Accepts TEXT slugs and UUID company_id columns. */
export function assertResourceInHrmScope(
  resource: { company_id?: string | null } | null | undefined,
  scope: HrmListScope,
  options?: { notFoundCode?: string; mismatchCode?: string },
): void {
  const notFoundCode = options?.notFoundCode ?? 'HRM-SCOPE-404';
  const mismatchCode = options?.mismatchCode ?? 'HRM-SCOPE-409';
  const companyId = resource?.company_id?.trim().toLowerCase();
  if (!companyId) {
    throw new ApiException(notFoundCode, 'Resource not found', HttpStatus.NOT_FOUND);
  }
  const allowedSlugs = new Set(scope.companyIds.map((id) => id.trim().toLowerCase()));
  const allowedUuids = new Set(companyIdsToUuidList(scope.companyIds));
  if (allowedSlugs.has(companyId) || allowedUuids.has(companyId)) {
    return;
  }
  throw new ApiException(
    mismatchCode,
    'Resource company_id is outside token scope',
    HttpStatus.CONFLICT,
  );
}
