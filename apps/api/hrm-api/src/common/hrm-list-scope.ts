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
 *
 * @CODE-MEMORY-CHANGE 2026-08-04
 * WorkItem: D-U84-REC-REQ-TMDV-JD-CATALOG-ASSERT-01
 * change_mode: FIX
 * What: resolveHrmSettingsCatalogCompanyId — Group CEO + member OU slug (trsport/…) → holding
 *       catalog partition (parity FE U39 settings picker main→holding).
 * Why:  QA U78-U84-PRIMARY-REC-REQ-TMDV — picker shows DRIVER_LEAD (holding) but JD assert
 *       used persist company_id=trsport → HRM-REC-JD-POS.
 * must_keep: main→holding for group rollup; member-tenant main unchanged; holding SoT
 *
 * @CODE-MEMORY-CHANGE 2026-08-04
 * WorkItem: U78-U84-ATT-ADJ-TMDV-SCOPE-PARITY-01
 * change_mode: FIX
 * What: expandHrmTextCompanyIds — always add Plane B′ UUID (+ inverse slug) for every
 *       operating slug/UUID already in scope (Group CEO OU=trsport list vs UUID rows).
 * Why:  QA R1 — GET update-requests?company_id=trsport → 0 while row company_id=trsport UUID.
 * must_keep: JWT claim slug+uuid expansion; holding↔main map; no LE UUID invent
 *
 * @CODE-MEMORY-CHANGE 2026-08-04
 * WorkItem: PO-UC-TC-W4-BE-AU-MEMBER-MAIN-SCOPE-01
 * change_mode: FIX
 * What: Lock ADR §5 — member JWT (tenant≠xevn, companyId=main) list scope stays
 *       companyIds=['main'] + memberTenantId; NEVER GROUP_MEMBER_SLUGS / holding rollup.
 *       Cross-tenant xevn/main and company_id=holding remain SCOPE_CONTEXT_MISMATCH (409).
 * Why:  QA R-W4-B1-AU-MEMBER-MAIN-200 misread own-bucket 200 as holding leak; TC expect
 *       403/409 for own main conflicts ADR-GROUP-CEO-MAIN-HOLDING-SCOPE §5 + RBAC ladder.
 * SRS:  ADR-GROUP-CEO-MAIN-HOLDING-SCOPE §5 · ADR-HRM-RBAC-SCOPE-LADDER § member main
 * must_keep: Group CEO main→five-slug rollup; member own main 200; holding/xevn 409
 *
 * @CODE-MEMORY-CHANGE 2026-08-22
 * WorkItem: SA-HRM-TENANT-ONLY-SCOPE-01
 * change_mode: SPEC_ACK (no runtime change until HRM-TENANT-ONLY-SCOPE-BE-01)
 * What: Sponsor lock — deprecate OU slug partition; target scope = tenantIds[] + company_id=main.
 *       Group CEO rollup → tenant_id IN (registry members), not company_id IN GROUP_MEMBER_SLUGS.
 * Why:  CEO Visun 0 rows (data xevn/logistics vs JWT visun/main); OU ≠ menu RBAC.
 * Ref:  docs/architecture/ADR-HRM-TENANT-ONLY-SCOPE-20260822.md
 *       docs/program/specs/SA-HRM-TENANT-ONLY-SCOPE-SPEC-01.md §2–§4
 * must_keep: HRM_TENANT_ONLY_SCOPE=false → legacy OU rollup unchanged until Phase 1 merge;
 *       resolveHrmSettingsCatalogCompanyId main→holding; JWT companyId=main; 409 default
 *
 * @CODE-MEMORY-CHANGE 2026-08-22
 * WorkItem: HRM-TENANT-ONLY-SCOPE-BE-01
 * change_mode: IMPLEMENT
 * What: resolveHrmListScope tenantOnlyMode + tenantIds; pushEmployeeListScopeFilters bridge SQL;
 *       assertResourceInHrmScope tenant guard; export isHrmTenantOnlyScopeEnabled.
 * Why:  Phases 1–5 SA-HRM-TENANT-ONLY-SCOPE — partition by tenant_id not OU slug.
 * Ref:  docs/program/specs/SA-HRM-TENANT-ONLY-SCOPE-SPEC-01.md
 * must_keep: Flag OFF = legacy GROUP_MEMBER_SLUGS; settings catalog main→holding unchanged
 */
import { HttpStatus } from '@nestjs/common';
import { ApiException } from './api.exception';
import { getVerifiedInternalJwtPayload } from './internal-auth';
import {
  HRM_GROUP_ROLLUP_TENANT_IDS,
  HRM_TENANT_DISPLAY_NAMES,
  isHrmTenantLegacyBridgeEnabled,
  isHrmTenantOnlyScopeEnabled,
  legacyOuSlugsForTenantIds,
  resolveTenantIdFromLegacyOuOrTenant,
} from './hrm-tenant-scope';

export {
  isHrmTenantLegacyBridgeEnabled,
  isHrmTenantOnlyScopeEnabled,
} from './hrm-tenant-scope';

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
export const HRM_COMPANY_UUID_BY_SLUG: Record<
  (typeof HRM_GROUP_MEMBER_COMPANY_SLUGS)[number],
  string
> = {
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
export function resolveHrmCompanyUuidForSlug(
  companySlug: string,
): string | null {
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
  const mapped =
    HRM_COMPANY_UUID_BY_SLUG[trimmed as keyof typeof HRM_COMPANY_UUID_BY_SLUG];
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
  /** Tenant-only partition (ADR-HRM-TENANT-ONLY-SCOPE). */
  tenantOnlyMode?: boolean;
  /** Resolved tenant_id list for SQL filters when tenantOnlyMode. */
  tenantIds?: string[];
};

/** Optional request context when JWT is absent (internal API key + portal proxy). */
export type HrmListScopeContext = {
  tenantId?: string;
};

function readClaim(
  payload: Record<string, unknown>,
  ...keys: string[]
): string | undefined {
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

function readJwtPayload(
  authorization: string | undefined,
): Record<string, unknown> | null {
  return getVerifiedInternalJwtPayload(authorization);
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
  const claimSlug = readClaim(
    payload,
    'companyId',
    'company_id',
    'cid',
  )?.toLowerCase();
  if (!claimSlug) {
    return slug;
  }
  const roleCode = (
    readClaim(payload, 'roleCode', 'role_code', 'role') ?? ''
  ).toLowerCase();
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
 * Also expand Plane B′ registry slug↔UUID for every id already in scope (Group CEO OU narrow).
 */
export function expandHrmTextCompanyIds(
  scope: HrmListScope,
  authorization: string | undefined,
  requestedCompanyId?: string,
): string[] {
  const out = new Set(
    scope.companyIds.map((id) => id.trim().toLowerCase()).filter(Boolean),
  );
  // Xử lý: slug list filter phải thấy row UUID (Plane B′) — CEO OU=trsport vs persist UUID.
  for (const id of [...out]) {
    if (id === HRM_PILOT_OPERATING_COMPANY_ID) {
      out.add('holding');
      out.add(HRM_COMPANY_UUID_BY_SLUG.holding);
      continue;
    }
    const mapped =
      HRM_COMPANY_UUID_BY_SLUG[id as keyof typeof HRM_COMPANY_UUID_BY_SLUG];
    if (mapped) {
      out.add(mapped.toLowerCase());
      continue;
    }
    if (UUID_RE.test(id)) {
      const asSlug = resolveHrmCompanySlugForId(id);
      if (asSlug && asSlug !== id) {
        out.add(asSlug);
      }
    }
  }
  const payload = readJwtPayload(authorization);
  if (!payload) {
    return [...out];
  }
  const claimUuid = readClaim(
    payload,
    'company_uuid',
    'companyUuid',
  )?.toLowerCase();
  const claimSlug = readClaim(
    payload,
    'companyId',
    'company_id',
    'cid',
  )?.toLowerCase();
  const req = requestedCompanyId?.trim().toLowerCase() ?? '';
  if (claimUuid && claimSlug) {
    if (
      !req ||
      req === claimSlug ||
      req === claimUuid ||
      out.has(claimSlug) ||
      out.has(claimUuid)
    ) {
      out.add(claimSlug);
      out.add(claimUuid);
    }
  }
  return [...out];
}

/**
 * Resolves SQL list filters for HRM operational APIs when JWT uses companyId=main.
 * Group CEO (master + group_ceo + main) rolls up GROUP_MEMBER_SLUGS per ADR / BA CARD rules.
 * When HRM_TENANT_ONLY_SCOPE: rollup via tenant_id IN (member registry) + company_id=main.
 */
export function resolveHrmListScope(
  authorization: string | undefined,
  requestedCompanyId: string,
  context?: HrmListScopeContext,
): HrmListScope {
  const jwtPayload = getVerifiedInternalJwtPayload(authorization);
  const tenantId =
    (jwtPayload
      ? readClaim(jwtPayload, 'tenantId', 'tenant_id', 'tid')
      : undefined) ??
    context?.tenantId?.trim() ??
    '';
  const roleCode = (
    jwtPayload
      ? (readClaim(jwtPayload, 'roleCode', 'role_code', 'role') ?? '')
      : ''
  ).toLowerCase();
  const claimCompany = jwtPayload
    ? (readClaim(jwtPayload, 'companyId', 'company_id', 'cid') ??
      requestedCompanyId)
    : requestedCompanyId;

  const requested = requestedCompanyId.trim().toLowerCase();
  const tenantOnly = isHrmTenantOnlyScopeEnabled();

  const groupCeoMasterBucket = isGroupCeoMasterOperatingBucket(
    jwtPayload,
    tenantId,
    claimCompany,
    roleCode,
  );

  const isGroupRollup =
    tenantId === MASTER_TENANT_ID &&
    requested === HRM_PILOT_OPERATING_COMPANY_ID &&
    groupCeoMasterBucket;

  /** Group catalog rows persist under `holding`; portal query must not narrow to xevn-only tenant slice. */
  const isGroupHoldingRollup =
    tenantId === MASTER_TENANT_ID && requested === 'holding' && groupCeoMasterBucket;

  const serviceGroupMain =
    !jwtPayload &&
    tenantId === MASTER_TENANT_ID &&
    requested === HRM_PILOT_OPERATING_COMPANY_ID;

  if (tenantOnly) {
    if (isGroupRollup || isGroupHoldingRollup || serviceGroupMain) {
      return {
        companyIds: [HRM_PILOT_OPERATING_COMPANY_ID],
        masterTenantPartition: true,
        tenantOnlyMode: true,
        tenantIds: [...HRM_GROUP_ROLLUP_TENANT_IDS],
      };
    }

    if (
      tenantId &&
      tenantId !== MASTER_TENANT_ID &&
      requested === HRM_PILOT_OPERATING_COMPANY_ID
    ) {
      return {
        companyIds: [HRM_PILOT_OPERATING_COMPANY_ID],
        masterTenantPartition: false,
        memberTenantId: tenantId,
        tenantOnlyMode: true,
        tenantIds: [tenantId],
      };
    }

    const narrowTenant = resolveTenantIdFromLegacyOuOrTenant(requested);
    if (
      narrowTenant &&
      narrowTenant !== MASTER_TENANT_ID &&
      tenantId === MASTER_TENANT_ID &&
      groupCeoMasterBucket
    ) {
      return {
        companyIds: [HRM_PILOT_OPERATING_COMPANY_ID],
        masterTenantPartition: false,
        tenantOnlyMode: true,
        tenantIds: [narrowTenant],
      };
    }

    if (tenantId && tenantId !== MASTER_TENANT_ID) {
      return {
        companyIds: [HRM_PILOT_OPERATING_COMPANY_ID],
        masterTenantPartition: false,
        memberTenantId: tenantId,
        tenantOnlyMode: true,
        tenantIds: [tenantId],
      };
    }

    return {
      companyIds: [requestedCompanyId],
      masterTenantPartition: false,
      tenantOnlyMode: true,
      tenantIds: tenantId ? [tenantId] : [],
    };
  }

  if (isGroupRollup || isGroupHoldingRollup || serviceGroupMain) {
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

/**
 * Payroll periods TEXT `company_id` — group CEO list/get must see `holding` rows and legacy `main` orphans.
 * Create path maps main→holding via resolveHrmPersistCompanyIdText; reads still match pre-fix rows.
 */
export function expandPayrollPeriodCompanyIds(scope: HrmListScope): string[] {
  const ids = [...scope.companyIds];
  if (
    scope.masterTenantPartition &&
    !ids.includes(HRM_PILOT_OPERATING_COMPANY_ID)
  ) {
    ids.push(HRM_PILOT_OPERATING_COMPANY_ID);
  }
  return ids;
}

/**
 * Payroll eligibility closed-sheet probe — period operating unit only (BR-BP-TS-02).
 * Unlike group list rollup, must NOT match a closed sheet from another member slug (e.g. trsport)
 * when the payroll period is holding/main. Includes main↔holding parity + pilot UUID aliases.
 */
export function expandPayrollAttendanceSheetCompanyIds(
  periodCompanyId: string,
): string[] {
  const normalized = periodCompanyId.trim().toLowerCase();
  if (!normalized) {
    return [];
  }
  const out = new Set<string>([normalized]);
  if (normalized === HRM_PILOT_OPERATING_COMPANY_ID) {
    out.add('holding');
    out.add(HRM_COMPANY_UUID_BY_SLUG.holding);
  } else if (normalized === 'holding') {
    out.add(HRM_PILOT_OPERATING_COMPANY_ID);
    out.add(HRM_COMPANY_UUID_BY_SLUG.holding);
  }
  const mapped =
    HRM_COMPANY_UUID_BY_SLUG[
      normalized as keyof typeof HRM_COMPANY_UUID_BY_SLUG
    ];
  if (mapped) {
    out.add(mapped.toLowerCase());
  }
  if (UUID_RE.test(normalized)) {
    const asSlug = resolveHrmCompanySlugForId(normalized);
    if (asSlug && asSlug !== normalized) {
      out.add(asSlug);
      if (asSlug === 'holding') {
        out.add(HRM_PILOT_OPERATING_COMPANY_ID);
      }
    }
  }
  return [...out];
}

/** Append `company_id` predicate; supports single slug, group rollup IN list, or HrmListScope (tenant-only tables). */
export function pushCompanyIdFilter(
  filters: string[],
  values: unknown[],
  companyIdsOrScope: string[] | HrmListScope,
): void {
  if (!Array.isArray(companyIdsOrScope)) {
    pushHrmTableScopeFilters(filters, values, companyIdsOrScope);
    return;
  }
  const companyIds = companyIdsOrScope;
  if (companyIds.length === 1) {
    values.push(companyIds[0]);
    filters.push(`company_id = $${values.length}::text`);
    return;
  }
  values.push(companyIds);
  filters.push(`company_id = ANY($${values.length}::text[])`);
}

/** Tenant-only scope for tables with explicit `tenant_id` column (departments, payroll_periods, recruitment, …). */
export function pushHrmTableScopeFilters(
  filters: string[],
  values: unknown[],
  scope: HrmListScope,
  options?: { tableAlias?: string },
): void {
  if (scope.tenantOnlyMode && scope.tenantIds?.length) {
    pushTenantOnlyTableScopeFilters(filters, values, scope, options);
    return;
  }
  const companyIds = expandPayrollPeriodCompanyIds(scope);
  const alias = options?.tableAlias?.trim();
  if (alias) {
    if (companyIds.length === 1) {
      values.push(companyIds[0]);
      filters.push(`${alias}.company_id = $${values.length}::text`);
      return;
    }
    values.push(companyIds);
    filters.push(`${alias}.company_id = ANY($${values.length}::text[])`);
    return;
  }
  pushCompanyIdFilter(filters, values, companyIds);
}

/**
 * Departments list — tenant-only plus legacy OU rows (company_id=logistics, tenant_id null)
 * until backfill completes. Avoids hiding pre-migrate department rows for member CEOs.
 */
export function pushDepartmentTableScopeFilters(
  filters: string[],
  values: unknown[],
  scope: HrmListScope,
): void {
  if (!scope.tenantOnlyMode || !scope.tenantIds?.length) {
    pushCompanyIdFilter(filters, values, scope.companyIds);
    return;
  }
  const tenantIds = scope.tenantIds;
  const legacyOus = legacyOuSlugsForTenantIds(tenantIds);
  values.push(tenantIds);
  const tenantParam = values.length;
  values.push(HRM_PILOT_OPERATING_COMPANY_ID);
  const mainParam = values.length;

  if (legacyOus.length > 0) {
    values.push(legacyOus);
    const ouParam = values.length;
    filters.push(`(
      (NULLIF(TRIM(tenant_id), '') = ANY($${tenantParam}::text[])
        AND company_id = $${mainParam}::text)
      OR (
        (tenant_id IS NULL OR TRIM(tenant_id) = '')
        AND company_id = ANY($${ouParam}::text[])
      )
    )`);
    return;
  }

  filters.push(
    `NULLIF(TRIM(tenant_id), '') = ANY($${tenantParam}::text[]) AND company_id = $${mainParam}::text`,
  );
}

/** Payroll period list — tenant-only uses tenant_id column; legacy uses OU slug expansion. */
export function pushPayrollPeriodScopeFilters(
  filters: string[],
  values: unknown[],
  scope: HrmListScope,
): void {
  if (scope.tenantOnlyMode && scope.tenantIds?.length) {
    pushHrmTableScopeFilters(filters, values, scope);
    return;
  }
  pushCompanyIdFilter(filters, values, expandPayrollPeriodCompanyIds(scope));
}

function pushTenantOnlyTableScopeFilters(
  filters: string[],
  values: unknown[],
  scope: HrmListScope,
  options?: { tableAlias?: string },
): void {
  const col = (name: string) =>
    options?.tableAlias ? `${options.tableAlias}.${name}` : name;
  const tenantIds = scope.tenantIds ?? [];
  if (!tenantIds.length) {
    filters.push('FALSE');
    return;
  }
  const legacyOus = isHrmTenantLegacyBridgeEnabled()
    ? legacyOuSlugsForTenantIds(tenantIds)
    : [];
  values.push(tenantIds);
  const tenantParam = values.length;
  values.push(HRM_PILOT_OPERATING_COMPANY_ID);
  const mainParam = values.length;

  if (legacyOus.length > 0) {
    values.push(legacyOus);
    const ouParam = values.length;
    filters.push(`(
      (NULLIF(TRIM(${col('tenant_id')}), '') = ANY($${tenantParam}::text[])
        AND ${col('company_id')} = $${mainParam}::text)
      OR (
        COALESCE(NULLIF(TRIM(${col('tenant_id')}), ''), '${MASTER_TENANT_ID}') = '${MASTER_TENANT_ID}'
        AND ${col('company_id')} = ANY($${ouParam}::text[])
      )
    )`);
    return;
  }

  filters.push(
    `NULLIF(TRIM(${col('tenant_id')}), '') = ANY($${tenantParam}::text[]) AND ${col('company_id')} = $${mainParam}::text`,
  );
}

/** Resolved tenant_id for INSERT on tenant-scoped tables when HRM_TENANT_ONLY_SCOPE is ON. */
export function resolveHrmPersistTenantId(
  authorization: string | undefined,
  requestedCompanyId: string,
  context?: HrmListScopeContext,
): string | null {
  const scope = resolveHrmListScope(authorization, requestedCompanyId, context);
  if (!scope.tenantOnlyMode) {
    return null;
  }
  if (scope.memberTenantId) {
    return scope.memberTenantId;
  }
  const narrow = resolveTenantIdFromLegacyOuOrTenant(requestedCompanyId);
  if (narrow && scope.tenantIds?.includes(narrow)) {
    return narrow;
  }
  if (scope.tenantIds?.length === 1) {
    return scope.tenantIds[0];
  }
  return scope.tenantIds?.[0] ?? MASTER_TENANT_ID;
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
    const mapped =
      HRM_COMPANY_UUID_BY_SLUG[
        trimmed as keyof typeof HRM_COMPANY_UUID_BY_SLUG
      ];
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
  return (
    HRM_COMPANY_UUID_BY_SLUG[
      trimmed as keyof typeof HRM_COMPANY_UUID_BY_SLUG
    ] ?? trimmed
  );
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
  if (scope.tenantOnlyMode) {
    const persisted = HRM_PILOT_OPERATING_COMPANY_ID;
    const allowedTenants = new Set(
      (scope.tenantIds ?? []).map((id) => id.trim().toLowerCase()),
    );
    const tenantId = resolveHrmPersistTenantId(authorization, raw, context);
    // Empty tenantIds = unresolved service/internal scope — do not false-positive 409.
    if (
      tenantId &&
      allowedTenants.size > 0 &&
      !allowedTenants.has(tenantId.trim().toLowerCase())
    ) {
      throw new ApiException(
        'HRM-SCOPE-409',
        'Resource tenant_id is outside token scope',
        HttpStatus.CONFLICT,
      );
    }
    return persisted;
  }
  const persisted =
    raw === HRM_PILOT_OPERATING_COMPANY_ID && scope.masterTenantPartition
      ? 'holding'
      : raw;

  const allowed = new Set(
    scope.companyIds.map((id) => id.trim().toLowerCase()),
  );
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
  if (scope.tenantOnlyMode && scope.tenantIds?.length) {
    pushTenantOnlyEmployeeScopeFilters(filters, values, scope, options);
    return;
  }
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
    filters.push(
      `NULLIF(TRIM(custom_fields->>'tenant_id'), '') = $${values.length}`,
    );
  }
}

/** Tenant-only SQL: migrated rows (tenant_id + main) OR legacy OU bridge on xevn partition. */
function pushTenantOnlyEmployeeScopeFilters(
  filters: string[],
  values: unknown[],
  scope: HrmListScope,
  options?: { skipTenantPartition?: boolean },
): void {
  if (options?.skipTenantPartition) {
    values.push(HRM_PILOT_OPERATING_COMPANY_ID);
    filters.push(`company_id = $${values.length}::text`);
    return;
  }
  const tenantIds = scope.tenantIds ?? [];
  if (!tenantIds.length) {
    filters.push('FALSE');
    return;
  }
  const legacyOus = legacyOuSlugsForTenantIds(tenantIds);
  values.push(tenantIds);
  const tenantParam = values.length;
  values.push(HRM_PILOT_OPERATING_COMPANY_ID);
  const mainParam = values.length;

  const useLegacyBridge =
    isHrmTenantLegacyBridgeEnabled() && legacyOus.length > 0;

  if (useLegacyBridge) {
    values.push(legacyOus);
    const ouParam = values.length;
    filters.push(`(
      (NULLIF(TRIM(custom_fields->>'tenant_id'), '') = ANY($${tenantParam}::text[])
        AND company_id = $${mainParam}::text)
      OR (
        COALESCE(NULLIF(TRIM(custom_fields->>'tenant_id'), ''), '${MASTER_TENANT_ID}') = '${MASTER_TENANT_ID}'
        AND company_id = ANY($${ouParam}::text[])
      )
    )`);
    return;
  }

  filters.push(
    `NULLIF(TRIM(custom_fields->>'tenant_id'), '') = ANY($${tenantParam}::text[]) AND company_id = $${mainParam}::text`,
  );
}

/** Attendance / leave rows may use UUID company_id; scope via workforce employee_ids. */
export function pushWorkforceEmployeeScopeFilter(
  filters: string[],
  values: unknown[],
  scope: HrmListScope,
  employeeIdColumn = 'employee_id',
): void {
  if (scope.tenantOnlyMode && scope.tenantIds?.length) {
    const tenantIds = scope.tenantIds;
    const legacyOus = isHrmTenantLegacyBridgeEnabled()
      ? legacyOuSlugsForTenantIds(tenantIds)
      : [];
    values.push(tenantIds);
    const tenantParam = values.length;
    values.push(HRM_PILOT_OPERATING_COMPANY_ID);
    const mainParam = values.length;

    if (isHrmTenantLegacyBridgeEnabled() && legacyOus.length > 0) {
      values.push(legacyOus);
      const ouParam = values.length;
      filters.push(
        `${employeeIdColumn} IN (
          SELECT id FROM public.employees
          WHERE (
            (NULLIF(TRIM(custom_fields->>'tenant_id'), '') = ANY($${tenantParam}::text[])
              AND company_id = $${mainParam}::text)
            OR (
              COALESCE(NULLIF(TRIM(custom_fields->>'tenant_id'), ''), '${MASTER_TENANT_ID}') = '${MASTER_TENANT_ID}'
              AND company_id = ANY($${ouParam}::text[])
            )
          ) AND archived_at IS NULL
        )`,
      );
      return;
    }

    filters.push(
      `${employeeIdColumn} IN (
        SELECT id FROM public.employees
        WHERE NULLIF(TRIM(custom_fields->>'tenant_id'), '') = ANY($${tenantParam}::text[])
          AND company_id = $${mainParam}::text
          AND archived_at IS NULL
      )`,
    );
    return;
  }

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
 *
 * Group CEO + member OU filter (`trsport`, …): still holding catalog SoT — FE U39
 * `resolveHrmSpreadsheetScope` anchors settings picker to `main`→holding even when
 * operational rows persist under the member slug (JD / leave / employees).
 */
export function resolveHrmSettingsCatalogCompanyId(
  authorization: string | undefined,
  tenantId: string,
  companyId: string,
): string {
  const normalized = resolveHrmCompanySlugForId(companyId);
  const tenant = tenantId.trim().toLowerCase();
  const scope = resolveHrmListScope(authorization, normalized, {
    tenantId: tenant,
  });
  if (
    tenant === MASTER_TENANT_ID &&
    normalized === HRM_PILOT_OPERATING_COMPANY_ID &&
    scope.masterTenantPartition
  ) {
    return 'holding';
  }
  // Group CEO OU narrow (companyId=trsport) — catalog SoT remains holding (picker parity).
  if (tenant === MASTER_TENANT_ID) {
    const jwtPayload = getVerifiedInternalJwtPayload(authorization);
    if (jwtPayload) {
      const claimCompany =
        readClaim(jwtPayload, 'companyId', 'company_id', 'cid') ?? '';
      const roleCode =
        readClaim(jwtPayload, 'roleCode', 'role_code', 'role') ?? '';
      if (
        isGroupCeoMasterOperatingBucket(
          jwtPayload,
          tenant,
          claimCompany,
          roleCode,
        ) &&
        (HRM_GROUP_MEMBER_COMPANY_SLUGS as readonly string[]).includes(
          normalized,
        )
      ) {
        return 'holding';
      }
    }
  }
  return normalized;
}

function readResourceTenantId(
  resource:
    | { custom_fields?: Record<string, unknown> | null }
    | null
    | undefined,
): string {
  const raw = resource?.custom_fields?.tenant_id;
  return typeof raw === 'string' ? raw.trim() : '';
}

/**
 * Tenant-only migrated rows: group CEO rollup persists `main`→`holding` (resolveHrmPersistCompanyIdText)
 * while list SQL expands main↔holding (expandHrmTextCompanyIds). Row guard must accept both without
 * requiring HRM_TENANT_ONLY_LEGACY_BRIDGE for the master partition.
 */
function isMasterTenantPartitionCompanyId(
  companyId: string,
  scope: HrmListScope,
): boolean {
  if (companyId === HRM_PILOT_OPERATING_COMPANY_ID) {
    return true;
  }
  if (!scope.masterTenantPartition) {
    return false;
  }
  const holdingUuid = HRM_COMPANY_UUID_BY_SLUG.holding.toLowerCase();
  return companyId === 'holding' || companyId === holdingUuid;
}

function buildAllowedCompanyKeys(scope: HrmListScope): {
  slugs: Set<string>;
  uuids: Set<string>;
} {
  const slugs = new Set(scope.companyIds.map((id) => id.trim().toLowerCase()));
  if (scope.masterTenantPartition) {
    slugs.add(HRM_PILOT_OPERATING_COMPANY_ID);
    slugs.add('holding');
  }
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
    | {
        company_id?: string | null;
        custom_fields?: Record<string, unknown> | null;
        tenant_id?: string | null;
      }
    | null
    | undefined,
  scope: HrmListScope,
  options?: { notFoundCode?: string; mismatchCode?: string },
): void {
  const notFoundCode = options?.notFoundCode ?? 'HRM-SCOPE-404';
  const mismatchCode = options?.mismatchCode ?? 'HRM-SCOPE-409';
  const companyId = resource?.company_id?.trim().toLowerCase();
  if (!companyId) {
    throw new ApiException(
      notFoundCode,
      'Resource not found',
      HttpStatus.NOT_FOUND,
    );
  }

  const rowTenant =
    readResourceTenantId(resource) ||
    (typeof resource?.tenant_id === 'string' ? resource.tenant_id.trim() : '');

  if (scope.tenantOnlyMode && scope.tenantIds?.length) {
    const allowedTenants = new Set(
      scope.tenantIds.map((id) => id.trim().toLowerCase()),
    );
    const legacyOus = isHrmTenantLegacyBridgeEnabled()
      ? new Set(
          legacyOuSlugsForTenantIds(scope.tenantIds).map((s) =>
            s.toLowerCase(),
          ),
        )
      : new Set<string>();
    const effectiveTenant = rowTenant || MASTER_TENANT_ID;
    const migratedMatch =
      allowedTenants.has(effectiveTenant) &&
      isMasterTenantPartitionCompanyId(companyId, scope);
    const legacyMatch =
      effectiveTenant === MASTER_TENANT_ID && legacyOus.has(companyId);
    if (!migratedMatch && !legacyMatch) {
      throw new ApiException(
        mismatchCode,
        'Resource tenant_id is outside token scope',
        HttpStatus.CONFLICT,
      );
    }
    return;
  }

  const { slugs: allowedSlugs, uuids: allowedUuids } =
    buildAllowedCompanyKeys(scope);
  const companyAllowed =
    allowedSlugs.has(companyId) || allowedUuids.has(companyId);
  if (!companyAllowed) {
    throw new ApiException(
      mismatchCode,
      'Resource company_id is outside token scope',
      HttpStatus.CONFLICT,
    );
  }

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
