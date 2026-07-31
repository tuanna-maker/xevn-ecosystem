/**
 * @CODE-MEMORY
 * Screen:     N/A (BE shared scope) — HRM list/persist company scope ladder
 * UC:         HRM-OP-01 / HRM-OP-02 / HRM-OP-04 · ADR-HRM-RBAC-SCOPE-LADDER §4
 * BR:         DATA_LINKAGE §6 Plane B′ · BA-DUAL-PLANE-AUDIT-02 §2#1
 * SRS:        docs/client-delivery/hrm/SRS_HRM_KHACH.md §3.45–3.48 · FR-HRM-OP-01..04
 * TechSpec:   docs/hrm/TECHSPEC.md §16.5 · docs/hrm/DB_DESIGN_HRM_OPERATIONS.md (UUID persist + slug map)
 * Purpose:    Chuẩn hóa phạm vi list/persist HRM: slug TEXT (Plane B), UUID pilot map (Plane B′),
 *             cấm dùng XBOS legal-entity UUID (Plane A) như khóa vận hành.
 * WorkItem:   D-HRM-OP-DUAL-PLANE-GUARD-01
 * Coded:      2026-07-27
 *
 * Callers:
 *   - operations/operations.service.ts → resolveHrmOperationsPersistCompanyId / pushCompanyIdUuidFilter
 *   - attendance / home / metadata (UUID-column siblings) → cùng helper map
 *
 * Callees:
 *   - getVerifiedInternalJwtPayload → JWT claims
 *
 * BE-Chain:
 *   slug|main → HRM_COMPANY_UUID_BY_SLUG → company_id UUID columns (hrm_tasks, service_requests)
 *   LE UUID ∉ map → HRM-PLANE-409 (fail-closed, không silent 0)
 *
 * Impact:     Bỏ guard → persist/list LE UUID → aggregate OP-04 giả 0 / lệch Plane B′
 * must_keep:  Fleet/Payroll TEXT company_id; resolveHrmListScope slug siblings; CO-HC by_company slug
 * SOLID:      Scope map tập trung — Operations/ATT/MD không nhân bản UUID ladder
 * LastVerified: common/hrm-list-scope.spec.ts · operations/be-hrm-op-dual-plane-guard-01.spec.ts
 *
 * @CODE-MEMORY-CHANGE 2026-07-27
 * WorkItem: D-HRM-OP-DUAL-PLANE-GUARD-01
 * change_mode: ADD
 * What: Thêm isHrmMappedCompanyUuid / assertHrmMappedCompanyUuidOrThrow; fail-closed UUID ∉ map
 *       trên resolveHrmOperationsPersistCompanyId. OP list/summary dùng assertOperationsCompanyWire.
 *       companyIdsToUuidList giữ pass-through UUID (home/inbox must_keep) — anti-LE list ở OP service.
 * Why:  BA dual-plane P1 — LE UUID ≠ map → empty/0 silent undercount trên OP persist/list/OP-04.
 * SRS:  FR-HRM-OP-01 #4 · FR-HRM-OP-02 #2 · FR-HRM-OP-04 #4/#5/#7
 * TechSpec: DB_DESIGN_HRM_OPERATIONS · API_DESIGN_HRM_OPERATIONS (slug→UUID map)
 * must_keep: Happy slug→map UUID; TEXT spine siblings; CO-HC by_company; home UUID filter callers
 *
 * @CODE-MEMORY-CHANGE 2026-07-27
 * WorkItem: D-HRM-MD-DUAL-PLANE-GUARD-01
 * change_mode: ADD
 * What: Metadata service reuse assertHrmMappedCompanyUuidOrThrow / isHrmMappedCompanyUuid
 *       (persist + list/audit/decide wire). Không harden companyIdsToUuidList / resolveHrmCompanyUuidForSlug
 *       pass-through (home/inbox/employees must_keep).
 * Why:  BA dual-plane residual #2 · G-MD-PLANE-01 — LE trên employee_metadata_* → empty/miss.
 * SRS:  FR-HRM-MD-01 #6/#7 · UC-HRM-26
 * TechSpec: DB_DESIGN_HRM_W2_SLICE §C · API_DESIGN_HRM_W2_SLICE C1/C2
 * must_keep: OP GWC · CO-HC · home UUID pass-through · slug map happy path
 */
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

/** Plane B′ set — only these UUIDs may hit UUID `company_id` columns via OP/ATT map helpers. */
const HRM_MAPPED_COMPANY_UUID_SET: ReadonlySet<string> = new Set(
  Object.values(HRM_COMPANY_UUID_BY_SLUG).map((id) => id.trim().toLowerCase()),
);

/**
 * True when value is a Plane B′ pilot UUID (∈ HRM_COMPANY_UUID_BY_SLUG).
 * XBOS legal-entity UUIDs (Plane A) return false.
 */
export function isHrmMappedCompanyUuid(value: string): boolean {
  const trimmed = value.trim().toLowerCase();
  return UUID_RE.test(trimmed) && HRM_MAPPED_COMPANY_UUID_SET.has(trimmed);
}

/**
 * Fail-closed: reject XBOS LE / unknown UUID that is not in the pilot map.
 * Happy path: returns normalized mapped UUID.
 */
export function assertHrmMappedCompanyUuidOrThrow(
  value: string,
  options?: { code?: string; message?: string },
): string {
  const trimmed = value.trim().toLowerCase();
  if (!isHrmMappedCompanyUuid(trimmed)) {
    throw new ApiException(
      options?.code ?? 'HRM-PLANE-409',
      options?.message ??
        'company_id UUID is not an HRM pilot mapped UUID (XBOS legal-entity id rejected)',
      HttpStatus.CONFLICT,
    );
  }
  return trimmed;
}

/** UF-HRM-11 — employee list + metadata submit expose legal UUID for slug partitions. */
export function resolveHrmCompanyUuidForSlug(companySlug: string): string | null {
  const trimmed = companySlug.trim().toLowerCase();
  if (!trimmed) {
    return null;
  }
  if (UUID_RE.test(trimmed)) {
    return trimmed;
  }
  if (trimmed === HRM_PILOT_OPERATING_COMPANY_ID) {
    return HRM_COMPANY_UUID_BY_SLUG.holding;
  }
  const mapped = HRM_COMPANY_UUID_BY_SLUG[trimmed as keyof typeof HRM_COMPANY_UUID_BY_SLUG];
  return mapped ?? null;
}

/**
 * Inverse of resolveHrmCompanyUuidForSlug for TEXT ladders (leave_requests, settings catalog).
 * Pilot legal UUID → operating slug; unknown UUID left as-is; slugs unchanged.
 */
export function resolveHrmCompanySlugForId(companyId: string): string {
  const trimmed = companyId.trim().toLowerCase();
  if (!trimmed || !UUID_RE.test(trimmed)) {
    return trimmed;
  }
  const wanted = normalizeUuid(trimmed);
  for (const slug of HRM_GROUP_MEMBER_COMPANY_SLUGS) {
    if (normalizeUuid(HRM_COMPANY_UUID_BY_SLUG[slug]) === wanted) {
      return slug;
    }
  }
  return trimmed;
}

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

function normalizeUuid(value: string): string {
  return value.trim().toLowerCase();
}

function readJwtPayload(authorization: string | undefined): Record<string, unknown> | null {
  return getVerifiedInternalJwtPayload(authorization) as Record<string, unknown> | null;
}

/** Documented portal Group CEO — mobile standalone login row uses company_id=holding (ADR §3.1). */
export const PORTAL_GROUP_CEO_LOGIN_EMAIL = 'ceo@xe.vn';

/**
 * Group CEO on master tenant — operational bucket `main` (portal JWT) or `holding` employee row (mobile login).
 * ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · D-HRM-W2A-SCOPE-PARITY-01.
 */
export function isGroupCeoMasterOperatingBucket(
  jwtPayload: Record<string, unknown> | null,
  tenantId: string,
  claimCompanyId: string,
  roleCode: string,
): boolean {
  if (tenantId.trim().toLowerCase() !== MASTER_TENANT_ID) {
    return false;
  }
  const claim = claimCompanyId.trim().toLowerCase();
  if (claim !== HRM_PILOT_OPERATING_COMPANY_ID && claim !== 'holding') {
    return false;
  }
  const role = roleCode.trim().toLowerCase();
  if (role === 'group_ceo' || role.startsWith('group_')) {
    return true;
  }
  if (claim === 'holding' && jwtPayload) {
    const sub = readClaim(jwtPayload, 'sub')?.toLowerCase();
    if (sub === PORTAL_GROUP_CEO_LOGIN_EMAIL) {
      return true;
    }
  }
  return false;
}

/**
 * Payroll periods/payslips store `company_id` as TEXT slugs (`holding`, …).
 * Mobile sends legal `company_uuid` on the query — map back to JWT slug for list scope.
 */
export function normalizePayrollListCompanyId(
  authorization: string | undefined,
  requestedCompanyId: string,
): string {
  const requested = requestedCompanyId.trim();
  if (!requested || requested === HRM_PILOT_OPERATING_COMPANY_ID) {
    return requested;
  }
  const payload = readJwtPayload(authorization);
  if (!payload) {
    return requested;
  }
  const claimUuid = readClaim(payload, 'company_uuid', 'companyUuid');
  const claimSlug = readClaim(payload, 'companyId', 'company_id', 'cid');
  if (
    claimUuid &&
    claimSlug &&
    UUID_RE.test(requested) &&
    normalizeUuid(claimUuid) === normalizeUuid(requested)
  ) {
    return claimSlug;
  }
  return requested;
}

/**
 * GET /home/summary — mobile may send legal `company_uuid` or rollup `holding` while JWT
 * carries a member operating slug (`trsport`, …). Map UUID → JWT slug; avoid holding rollup
 * for member-company viewers (D-MOB-HOME-SUMMARY-400-01 / J-MOB-37).
 */
export function normalizeHomeSummaryCompanyId(
  authorization: string | undefined,
  requestedCompanyId: string,
): string {
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
  const isGroupRollupClaim =
    claimSlug === HRM_PILOT_OPERATING_COMPANY_ID ||
    roleCode === 'group_ceo' ||
    roleCode.startsWith('group_');
  if (
    !isGroupRollupClaim &&
    (slug === 'holding' || slug === HRM_PILOT_OPERATING_COMPANY_ID) &&
    claimSlug !== 'holding' &&
    (HRM_GROUP_MEMBER_COMPANY_SLUGS as readonly string[]).includes(claimSlug)
  ) {
    return claimSlug;
  }
  return slug;
}

/**
 * Attendance update-requests may persist `company_id` as slug or derived UUID TEXT.
 * Include JWT slug + company_uuid so dev-portal/mobile and pilot slug probes stay aligned.
 */
export function expandHrmTextCompanyIds(
  scope: HrmListScope,
  authorization: string | undefined,
  requestedCompanyId?: string,
): string[] {
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
    isGroupCeoMasterOperatingBucket(jwtPayload, tenantId, claimCompany, roleCode);

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
      // Pass-through UUID for non-OP callers (home/inbox). OP list/summary fail-closed via
      // OperationsService.assertOperationsCompanyWire + persist assertHrmMappedCompanyUuidOrThrow.
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
    // Xử lý: persist UUID chỉ chấp nhận Plane B′ map — reject LE (FR-HRM-OP-01 #4).
    return assertHrmMappedCompanyUuidOrThrow(trimmed);
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
  // Pilot UUID → slug before TEXT persist (G-AT10-01); FE may send employee.company_id UUID.
  const raw = resolveHrmCompanySlugForId(requestedCompanyId);
  const scope = resolveHrmListScope(authorization, raw, context);
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
  if (scope.companyIds.length === 1) {
    values.push(scope.companyIds[0]);
    const slugParam = values.length;
    filters.push(
      `${employeeIdColumn} IN (
        SELECT id FROM public.employees
        WHERE company_id = $${slugParam}::text AND archived_at IS NULL
      )`,
    );
    return;
  }
  values.push([...scope.companyIds]);
  const slugParam = values.length;
  filters.push(
    `${employeeIdColumn} IN (
      SELECT id FROM public.employees
      WHERE company_id = ANY($${slugParam}::text[]) AND archived_at IS NULL
    )`,
  );
}

/**
 * Group employee-import catalogs are stored under `holding` while portal JWT uses `main`.
 * Maps overview/sync scope for group CEO rollup on master tenant.
 * Also maps pilot legal UUID → slug (parity leave create assert vs Settings GET).
 */
export function resolveHrmSettingsCatalogCompanyId(
  authorization: string | undefined,
  tenantId: string,
  companyId: string,
): string {
  const normalized = resolveHrmCompanySlugForId(companyId);
  const scope = resolveHrmListScope(authorization, normalized, { tenantId });
  if (
    tenantId.trim().toLowerCase() === MASTER_TENANT_ID &&
    normalized === HRM_PILOT_OPERATING_COMPANY_ID &&
    scope.masterTenantPartition
  ) {
    return 'holding';
  }
  return normalized;
}

function readResourceTenantId(resource: { custom_fields?: Record<string, unknown> | null } | null | undefined): string {
  const raw = resource?.custom_fields?.tenant_id;
  return typeof raw === 'string' ? raw.trim() : '';
}

function buildAllowedCompanyKeys(scope: HrmListScope): { slugs: Set<string>; uuids: Set<string> } {
  const slugs = new Set(scope.companyIds.map((id) => id.trim().toLowerCase()));
  if (scope.memberTenantId) {
    const uuids = new Set<string>();
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

/** Row-level scope guard for mutate-by-id (P1-01 / P1-02 / U28-R2 tenant partition). */
export function assertResourceInHrmScope(
  resource:
    | { company_id?: string | null; custom_fields?: Record<string, unknown> | null }
    | null
    | undefined,
  scope: HrmListScope,
  options?: { notFoundCode?: string; mismatchCode?: string },
): void {
  const notFoundCode = options?.notFoundCode ?? 'HRM-SCOPE-404';
  const mismatchCode = options?.mismatchCode ?? 'HRM-SCOPE-409';
  const companyId = resource?.company_id?.trim().toLowerCase();
  if (!companyId) {
    throw new ApiException(notFoundCode, 'Resource not found', HttpStatus.NOT_FOUND);
  }
  const { slugs: allowedSlugs, uuids: allowedUuids } = buildAllowedCompanyKeys(scope);
  const companyAllowed = allowedSlugs.has(companyId) || allowedUuids.has(companyId);
  if (!companyAllowed) {
    throw new ApiException(
      mismatchCode,
      'Resource company_id is outside token scope',
      HttpStatus.CONFLICT,
    );
  }

  const rowTenant = readResourceTenantId(resource);
  if (scope.memberTenantId) {
    if (!rowTenant || rowTenant !== scope.memberTenantId) {
      throw new ApiException(
        mismatchCode,
        'Resource tenant_id is outside token scope',
        HttpStatus.CONFLICT,
      );
    }
    return;
  }
  if (scope.masterTenantPartition) {
    const effectiveTenant = rowTenant || MASTER_TENANT_ID;
    if (effectiveTenant !== MASTER_TENANT_ID) {
      throw new ApiException(
        mismatchCode,
        'Resource tenant_id is outside token scope',
        HttpStatus.CONFLICT,
      );
    }
  }
}
