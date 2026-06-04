import { HttpStatus } from '@nestjs/common';
import { ApiException } from './api.exception';
import { getVerifiedInternalJwtPayload } from './internal-auth';
import { MASTER_TENANT_ID, MEMBER_DEFAULT_COMPANY_ID } from './tenant.constants';

type ScopeContext = {
  tenantId: string;
  companyId: string;
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
 * Portal/CC may echo operating bucket `main` as `x-tenant-id` while JWT carries `xevn`
 * (ADR-GROUP-CEO-MAIN-HOLDING-SCOPE — same pattern as hrm-api scope-context).
 */
export function normalizePortalScopeRequest(
  claimTenantId: string | undefined,
  _claimCompanyId: string | undefined,
  requested: { tenantId?: string; companyId?: string },
): { tenantId?: string; companyId?: string } {
  const reqTenant = requested.tenantId?.trim();
  const reqCompany = requested.companyId?.trim();
  if (
    claimTenantId?.trim().toLowerCase() === MASTER_TENANT_ID &&
    reqTenant?.toLowerCase() === MEMBER_DEFAULT_COMPANY_ID
  ) {
    return { tenantId: MASTER_TENANT_ID, companyId: reqCompany };
  }
  return { tenantId: reqTenant, companyId: reqCompany };
}

/**
 * Resolve both tenantId AND companyId — dùng cho endpoints cần đầy đủ scope.
 */
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
    claimCompanyId !== normalizedRequest.companyId
  ) {
    throw new ApiException('SCOPE_CONTEXT_MISMATCH', 'companyId mismatches token scope', HttpStatus.CONFLICT, {
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
export function resolveTenantOnlyContext(
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

  const normalizedRequest = normalizePortalScopeRequest(claimTenantId, claimCompanyId, requested);

  const tenantId = assertScopeId(claimTenantId ?? normalizedRequest.tenantId, 'tenantId');
  // companyId optional: nếu không có, fallback về tenantId (group scope)
  const companyId = (claimCompanyId ?? normalizedRequest.companyId ?? tenantId).trim();

  return { tenantId, companyId };
}
