import { HttpStatus } from '@nestjs/common';
import { ApiException } from './api.exception';
import {
  HRM_COMPANY_UUID_BY_SLUG,
  HRM_GROUP_MEMBER_COMPANY_SLUGS,
  HRM_PILOT_OPERATING_COMPANY_ID,
  isGroupCeoMasterOperatingBucket,
  MASTER_TENANT_ID,
} from './hrm-list-scope';
import { getVerifiedInternalJwtPayload } from './internal-auth';

type ScopeContext = {
  tenantId: string;
  companyId: string;
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value: string): boolean {
  return UUID_RE.test(value.trim());
}

function normalizeUuid(value: string): string {
  return value.trim().toLowerCase();
}

/**
 * Group CEO on master JWT `main` may narrow HRM lists to one operating slug (ADR §4).
 * Request `company_id=holding|trsport|…` while header/JWT stays `main` — not a mismatch.
 */
function isGroupCeoMemberSlugNarrowFilter(
  claimTenantId: string | undefined,
  claimCompanyId: string | undefined,
  roleCode: string | undefined,
  requestedCompanyId: string | undefined,
): boolean {
  if (!claimTenantId || !claimCompanyId || !requestedCompanyId) {
    return false;
  }
  if (claimTenantId.trim() !== MASTER_TENANT_ID) {
    return false;
  }
  if (claimCompanyId.trim() !== HRM_PILOT_OPERATING_COMPANY_ID) {
    return false;
  }
  const role = (roleCode ?? '').trim().toLowerCase();
  if (role !== 'group_ceo' && !role.startsWith('group_')) {
    return false;
  }
  const requested = requestedCompanyId.trim().toLowerCase();
  return (HRM_GROUP_MEMBER_COMPANY_SLUGS as readonly string[]).includes(
    requested,
  );
}

/** UF-HRM-11 — group CEO on main may submit metadata with employee company_uuid from list. */
function isGroupCeoPilotCompanyUuid(
  claimTenantId: string | undefined,
  claimCompanyId: string | undefined,
  roleCode: string | undefined,
  requestedCompanyId: string,
): boolean {
  if (!claimTenantId || !claimCompanyId || !requestedCompanyId) {
    return false;
  }
  if (claimTenantId.trim() !== MASTER_TENANT_ID) {
    return false;
  }
  if (claimCompanyId.trim() !== HRM_PILOT_OPERATING_COMPANY_ID) {
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
  return Object.values(HRM_COMPANY_UUID_BY_SLUG).some(
    (uuid) => normalizeUuid(uuid) === requested,
  );
}

/**
 * Mobile standalone login: JWT companyId=holding (employee row) + request `main` (operating bucket).
 * ADR-GROUP-CEO-MAIN-HOLDING-SCOPE §3.1 · D-HRM-W2A-SCOPE-PARITY-01.
 */
function isGroupCeoHoldingJwtMainRequest(
  jwtPayload: Record<string, unknown> | null | undefined,
  claimTenantId: string | undefined,
  claimCompanyId: string | undefined,
  roleCode: string | undefined,
  requestedCompanyId: string | undefined,
): boolean {
  if (!claimTenantId || !claimCompanyId || !requestedCompanyId) {
    return false;
  }
  if (requestedCompanyId.trim() !== HRM_PILOT_OPERATING_COMPANY_ID) {
    return false;
  }
  if (claimCompanyId.trim().toLowerCase() !== 'holding') {
    return false;
  }
  return isGroupCeoMasterOperatingBucket(
    jwtPayload ?? null,
    claimTenantId,
    claimCompanyId,
    roleCode ?? '',
  );
}

/**
 * Portal spreadsheet scope often forces `x-company-id=main` for any xevn portal session
 * (FE resolveHrmSpreadsheetScope). Member/manager JWT still carries operating slug
 * (`trsport`, …). Treat header main/holding as the JWT claim — narrow, never widen.
 * Do NOT rewrite when claim is holding/main (W2A group-CEO holding↔main must stay).
 * U78-U84-ATT-ADJ-TMDV-SCOPE-PARITY-01 — mgr approve without SCOPE_CONTEXT_MISMATCH.
 */
function normalizeMemberPortalMainHeader(
  claimCompanyId: string | undefined,
  roleCode: string | undefined,
  requestedCompanyId: string | undefined,
): string | undefined {
  if (!claimCompanyId || !requestedCompanyId) {
    return requestedCompanyId;
  }
  const claim = claimCompanyId.trim().toLowerCase();
  const requested = requestedCompanyId.trim().toLowerCase();
  const role = (roleCode ?? '').trim().toLowerCase();
  if (role === 'group_ceo' || role.startsWith('group_')) {
    return requestedCompanyId;
  }
  // Only subsidiary OUs (not holding) — preserves D-HRM-W2A holding JWT + main semantics.
  const isSubsidiaryOu =
    (HRM_GROUP_MEMBER_COMPANY_SLUGS as readonly string[]).includes(claim) &&
    claim !== 'holding';
  if (
    isSubsidiaryOu &&
    (requested === HRM_PILOT_OPERATING_COMPANY_ID || requested === 'holding')
  ) {
    return claimCompanyId.trim();
  }
  return requestedCompanyId;
}

/** Mobile JWT: companyId slug + company_uuid; attendance APIs key rows by UUID. */
function companyScopeMatches(
  claimCompanyId: string | undefined,
  claimCompanyUuid: string | undefined,
  requestedCompanyId: string | undefined,
  scopeGate?: {
    claimTenantId?: string;
    roleCode?: string;
    jwtPayload?: Record<string, unknown> | null;
  },
): boolean {
  if (!claimCompanyId || !requestedCompanyId) {
    return true;
  }
  const claim = claimCompanyId.trim();
  const requested = requestedCompanyId.trim();
  if (claim === requested) {
    return true;
  }
  if (
    isGroupCeoHoldingJwtMainRequest(
      scopeGate?.jwtPayload,
      scopeGate?.claimTenantId,
      claim,
      scopeGate?.roleCode,
      requested,
    )
  ) {
    return true;
  }
  if (
    isGroupCeoMemberSlugNarrowFilter(
      scopeGate?.claimTenantId,
      claim,
      scopeGate?.roleCode,
      requested,
    )
  ) {
    return true;
  }
  if (
    scopeGate &&
    isGroupCeoPilotCompanyUuid(
      scopeGate.claimTenantId,
      claim,
      scopeGate.roleCode,
      requested,
    )
  ) {
    return true;
  }
  const claimUuid = claimCompanyUuid?.trim();
  if (claimUuid && isUuid(claimUuid) && isUuid(requested)) {
    return normalizeUuid(claimUuid) === normalizeUuid(requested);
  }
  // Plane B′ registry: slug claim ↔ mapped UUID request (attendance_update_requests persist UUID).
  if (isUuid(requested)) {
    const mapped =
      HRM_COMPANY_UUID_BY_SLUG[
        claim.toLowerCase() as keyof typeof HRM_COMPANY_UUID_BY_SLUG
      ];
    if (mapped && normalizeUuid(mapped) === normalizeUuid(requested)) {
      return true;
    }
  } else if (claimUuid && isUuid(claimUuid)) {
    const mapped =
      HRM_COMPANY_UUID_BY_SLUG[
        requested.toLowerCase() as keyof typeof HRM_COMPANY_UUID_BY_SLUG
      ];
    if (mapped && normalizeUuid(mapped) === normalizeUuid(claimUuid)) {
      return true;
    }
  }
  return false;
}

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

function assertScopeId(
  value: string | undefined,
  field: 'tenantId' | 'companyId',
): string {
  if (!value) {
    throw new ApiException(
      field === 'tenantId' ? 'SCOPE_TENANT_REQUIRED' : 'SCOPE_COMPANY_REQUIRED',
      `${field} is required`,
      HttpStatus.BAD_REQUEST,
      { field },
    );
  }
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]{1,62}$/.test(value)) {
    throw new ApiException(
      field === 'tenantId' ? 'SCOPE_TENANT_INVALID' : 'SCOPE_COMPANY_INVALID',
      `${field} format is invalid`,
      HttpStatus.BAD_REQUEST,
      { field, value },
    );
  }
  return value;
}

/**
 * Portal/embed sometimes sends `x-tenant-id: main` when the operating company bucket is `main`
 * (ADR-GROUP-CEO-MAIN-HOLDING-SCOPE). Map to master tenant `xevn` only for group JWT on master.
 */
function normalizePortalScopeRequest(
  claimTenantId: string | undefined,
  claimCompanyId: string | undefined,
  requested: { tenantId?: string; companyId?: string },
): { tenantId?: string; companyId?: string } {
  const reqTenant = requested.tenantId?.trim();
  const reqCompany = requested.companyId?.trim();
  if (
    claimTenantId === MASTER_TENANT_ID &&
    reqTenant === HRM_PILOT_OPERATING_COMPANY_ID &&
    (!reqCompany ||
      reqCompany === HRM_PILOT_OPERATING_COMPANY_ID ||
      (claimCompanyId && reqCompany === claimCompanyId))
  ) {
    return { tenantId: MASTER_TENANT_ID, companyId: reqCompany };
  }
  return { tenantId: reqTenant, companyId: reqCompany };
}

export function resolveScopeContext(
  authorization: string | undefined,
  requested: { tenantId?: string; companyId?: string },
): ScopeContext {
  const jwtPayload = getVerifiedInternalJwtPayload(authorization);
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

  const portalNormalized = normalizePortalScopeRequest(
    claimTenantId,
    claimCompanyId,
    requested,
  );
  const normalizedRequest = {
    tenantId: portalNormalized.tenantId,
    companyId: normalizeMemberPortalMainHeader(
      claimCompanyId,
      roleCode,
      portalNormalized.companyId,
    ),
  };

  const tenantId = assertScopeId(
    claimTenantId ?? normalizedRequest.tenantId,
    'tenantId',
  );
  let companyId = assertScopeId(
    claimCompanyId ?? normalizedRequest.companyId,
    'companyId',
  );
  if (
    isGroupCeoHoldingJwtMainRequest(
      jwtPayload,
      claimTenantId,
      claimCompanyId,
      roleCode,
      normalizedRequest.companyId,
    )
  ) {
    companyId = HRM_PILOT_OPERATING_COMPANY_ID;
  }

  if (
    claimTenantId &&
    normalizedRequest.tenantId &&
    claimTenantId !== normalizedRequest.tenantId
  ) {
    throw new ApiException(
      'SCOPE_CONTEXT_MISMATCH',
      'tenantId mismatches token scope',
      HttpStatus.CONFLICT,
      {
        field: 'tenantId',
        token: claimTenantId,
        request: normalizedRequest.tenantId,
      },
    );
  }
  if (
    claimCompanyId &&
    normalizedRequest.companyId &&
    !companyScopeMatches(
      claimCompanyId,
      claimCompanyUuid,
      normalizedRequest.companyId,
      {
        claimTenantId,
        roleCode,
        jwtPayload: jwtPayload,
      },
    )
  ) {
    throw new ApiException(
      'SCOPE_CONTEXT_MISMATCH',
      'companyId mismatches token scope',
      HttpStatus.CONFLICT,
      {
        field: 'companyId',
        token: claimCompanyId,
        request: normalizedRequest.companyId,
        ...(claimCompanyUuid ? { tokenCompanyUuid: claimCompanyUuid } : {}),
      },
    );
  }

  // Member portal main→claim: return operating slug so mutate guards match JWT (not header main).
  if (
    normalizedRequest.companyId &&
    claimCompanyId &&
    normalizedRequest.companyId.trim().toLowerCase() ===
      claimCompanyId.trim().toLowerCase() &&
    requested.companyId &&
    (requested.companyId.trim().toLowerCase() ===
      HRM_PILOT_OPERATING_COMPANY_ID ||
      requested.companyId.trim().toLowerCase() === 'holding')
  ) {
    companyId = claimCompanyId.trim();
  }

  return { tenantId, companyId };
}
