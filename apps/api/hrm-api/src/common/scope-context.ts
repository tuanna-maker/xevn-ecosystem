import { HttpStatus } from '@nestjs/common';
import { ApiException } from './api.exception';
import { HRM_PILOT_OPERATING_COMPANY_ID, MASTER_TENANT_ID } from './hrm-list-scope';
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

/** Mobile JWT: companyId slug + company_uuid; attendance APIs key rows by UUID. */
function companyScopeMatches(
  claimCompanyId: string | undefined,
  claimCompanyUuid: string | undefined,
  requestedCompanyId: string | undefined,
): boolean {
  if (!claimCompanyId || !requestedCompanyId) {
    return true;
  }
  const claim = claimCompanyId.trim();
  const requested = requestedCompanyId.trim();
  if (claim === requested) {
    return true;
  }
  const claimUuid = claimCompanyUuid?.trim();
  if (claimUuid && isUuid(claimUuid) && isUuid(requested)) {
    return normalizeUuid(claimUuid) === normalizeUuid(requested);
  }
  return false;
}

function readClaim(payload: Record<string, unknown>, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return undefined;
}

function assertScopeId(value: string | undefined, field: 'tenantId' | 'companyId'): string {
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

  const normalizedRequest = normalizePortalScopeRequest(claimTenantId, claimCompanyId, requested);

  const tenantId = assertScopeId(claimTenantId ?? normalizedRequest.tenantId, 'tenantId');
  const companyId = assertScopeId(claimCompanyId ?? normalizedRequest.companyId, 'companyId');

  if (claimTenantId && normalizedRequest.tenantId && claimTenantId !== normalizedRequest.tenantId) {
    throw new ApiException('SCOPE_CONTEXT_MISMATCH', 'tenantId mismatches token scope', HttpStatus.CONFLICT, {
      field: 'tenantId',
      token: claimTenantId,
      request: normalizedRequest.tenantId,
    });
  }
  if (
    claimCompanyId &&
    normalizedRequest.companyId &&
    !companyScopeMatches(claimCompanyId, claimCompanyUuid, normalizedRequest.companyId)
  ) {
    throw new ApiException('SCOPE_CONTEXT_MISMATCH', 'companyId mismatches token scope', HttpStatus.CONFLICT, {
      field: 'companyId',
      token: claimCompanyId,
      request: normalizedRequest.companyId,
      ...(claimCompanyUuid ? { tokenCompanyUuid: claimCompanyUuid } : {}),
    });
  }

  return { tenantId, companyId };
}
