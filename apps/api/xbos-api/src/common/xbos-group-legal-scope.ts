import { HttpStatus } from '@nestjs/common';
import { ApiException } from './api.exception';
import { getVerifiedInternalJwtPayload } from './internal-auth';
import { normalizePortalScopeRequest, resolveScopeContext } from './scope-context';
import { MEMBER_DEFAULT_COMPANY_ID } from './tenant.constants';

export const XBOS_MASTER_TENANT_ID = 'xevn';
export const XBOS_GROUP_OPERATING_MAIN = 'main';
export const XBOS_GROUP_LEGAL_HOLDING = 'holding';

function readClaim(payload: Record<string, unknown>, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return undefined;
}

export function isGroupCeoOnMasterTenant(
  claimTenantId: string | undefined,
  roleCode: string,
): boolean {
  return (
    claimTenantId === XBOS_MASTER_TENANT_ID &&
    (roleCode === 'group_ceo' || roleCode.startsWith('group_'))
  );
}

/**
 * Group CEO JWT on `main` reads XBOS legal-entity partition under `holding`
 * (catalog get/list, org-foundation, platform-audit — ADR-GROUP-CEO-MAIN-HOLDING-SCOPE §4).
 * Writes that require strict JWT match must still use `resolveScopeContext`.
 */
export function resolveXbosGroupLegalReadScopeContext(
  authorization: string | undefined,
  requested: { tenantId?: string; companyId?: string },
): { tenantId: string; companyId: string } {
  const jwtPayload = getVerifiedInternalJwtPayload(authorization) as Record<string, unknown> | null;
  const claimTenantId = jwtPayload ? readClaim(jwtPayload, 'tenantId', 'tenant_id', 'tid') : undefined;
  const claimCompanyId = jwtPayload ? readClaim(jwtPayload, 'companyId', 'company_id', 'cid') : undefined;
  const normalized = normalizePortalScopeRequest(claimTenantId, claimCompanyId, requested);
  const roleCode = (jwtPayload ? readClaim(jwtPayload, 'roleCode', 'role_code', 'role') ?? '' : '').toLowerCase();
  const requestedTenant = normalized.tenantId?.trim().toLowerCase();
  const requestedCompanyId = normalized.companyId?.trim().toLowerCase();
  const requestedCompany = normalized.companyId?.trim();
  const claimCompany = claimCompanyId?.trim().toLowerCase();

  // Group CEO reads member legal-entity rows with registry tenant slug headers (edit preload / list).
  if (
    isGroupCeoOnMasterTenant(claimTenantId, roleCode) &&
    claimCompany === XBOS_GROUP_OPERATING_MAIN &&
    requestedTenant &&
    requestedTenant !== XBOS_MASTER_TENANT_ID &&
    requestedTenant !== XBOS_GROUP_OPERATING_MAIN
  ) {
    resolveScopeContext(authorization, {
      tenantId: claimTenantId,
      companyId: claimCompanyId,
    });
    return {
      tenantId: assertScopeSlug(requestedTenant, 'tenantId'),
      companyId: assertScopeSlug(requestedCompany ?? MEMBER_DEFAULT_COMPANY_ID, 'companyId'),
    };
  }

  if (
    isGroupCeoOnMasterTenant(claimTenantId, roleCode) &&
    claimCompany === XBOS_GROUP_OPERATING_MAIN &&
    (!requestedCompanyId ||
      requestedCompanyId === XBOS_GROUP_OPERATING_MAIN ||
      requestedCompanyId === XBOS_GROUP_LEGAL_HOLDING)
  ) {
    const scope = resolveScopeContext(authorization, {
      tenantId: normalized.tenantId ?? claimTenantId,
      companyId: XBOS_GROUP_OPERATING_MAIN,
    });
    return { tenantId: scope.tenantId, companyId: XBOS_GROUP_LEGAL_HOLDING };
  }

  return resolveScopeContext(authorization, normalized);
}

function assertScopeSlug(value: string | undefined, field: 'tenantId' | 'companyId'): string {
  if (!value?.trim()) {
    throw new ApiException(
      field === 'tenantId' ? 'SCOPE_TENANT_REQUIRED' : 'SCOPE_COMPANY_REQUIRED',
      `${field} is required`,
      HttpStatus.BAD_REQUEST,
      { field },
    );
  }
  const trimmed = value.trim();
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]{1,62}$/.test(trimmed)) {
    throw new ApiException(
      field === 'tenantId' ? 'SCOPE_TENANT_INVALID' : 'SCOPE_COMPANY_INVALID',
      `${field} format is invalid`,
      HttpStatus.BAD_REQUEST,
      { field, value: trimmed },
    );
  }
  return trimmed;
}

/**
 * Group CEO mutates member legal-entity rows under registry tenant slug + default company
 * (Command Center company_member_units — ADR-GROUP-CEO-MAIN-HOLDING-SCOPE).
 * Validates bearer via JWT claims only; does not 409 when claim xevn/main and request xe-tmdv/main.
 */
export function resolveXbosGroupLegalMutationScopeContext(
  authorization: string | undefined,
  requested: { tenantId?: string; companyId?: string },
): { tenantId: string; companyId: string } {
  const jwtPayload = getVerifiedInternalJwtPayload(authorization) as Record<string, unknown> | null;
  const claimTenantId = jwtPayload ? readClaim(jwtPayload, 'tenantId', 'tenant_id', 'tid') : undefined;
  const claimCompanyId = jwtPayload ? readClaim(jwtPayload, 'companyId', 'company_id', 'cid') : undefined;
  const roleCode = (jwtPayload ? readClaim(jwtPayload, 'roleCode', 'role_code', 'role') ?? '' : '').toLowerCase();

  resolveScopeContext(authorization, {
    tenantId: claimTenantId,
    companyId: claimCompanyId,
  });

  const normalized = normalizePortalScopeRequest(claimTenantId, claimCompanyId, requested);
  const requestedTenant = normalized.tenantId?.trim().toLowerCase();
  const requestedCompany = normalized.companyId?.trim().toLowerCase();
  const claimCompany = claimCompanyId?.trim().toLowerCase();

  if (
    isGroupCeoOnMasterTenant(claimTenantId, roleCode) &&
    claimCompany === XBOS_GROUP_OPERATING_MAIN &&
    (!requestedCompany ||
      requestedCompany === XBOS_GROUP_OPERATING_MAIN ||
      requestedCompany === XBOS_GROUP_LEGAL_HOLDING) &&
    (!requestedTenant || requestedTenant === XBOS_MASTER_TENANT_ID)
  ) {
    return { tenantId: XBOS_MASTER_TENANT_ID, companyId: XBOS_GROUP_LEGAL_HOLDING };
  }

  if (
    isGroupCeoOnMasterTenant(claimTenantId, roleCode) &&
    claimCompany === XBOS_GROUP_OPERATING_MAIN &&
    requestedTenant &&
    requestedTenant !== XBOS_MASTER_TENANT_ID &&
    requestedTenant !== XBOS_GROUP_OPERATING_MAIN
  ) {
    return {
      tenantId: assertScopeSlug(requestedTenant, 'tenantId'),
      companyId: assertScopeSlug(requestedCompany ?? MEMBER_DEFAULT_COMPANY_ID, 'companyId'),
    };
  }

  return resolveScopeContext(authorization, normalized);
}

export function isLegalEntityUuid(value: string | undefined): boolean {
  const id = value?.trim();
  return !!id && /^[0-9a-f-]{36}$/i.test(id);
}

export type LegalEntityPartition = { tenantId: string; companyId: string };

/**
 * Group CEO on master may read any member legal-entity row; member CEOs only their tenant.
 * Used by RACI matrix path `companies/{legalEntityUuid}/…` (UC-CC-03 / BE-W5).
 */
export function assertJwtMayReadLegalEntityPartition(
  authorization: string | undefined,
  jwtScope: { tenantId: string; companyId: string },
  partition: LegalEntityPartition,
): void {
  const jwtPayload = getVerifiedInternalJwtPayload(authorization) as Record<string, unknown> | null;
  const roleCode = (jwtPayload ? readClaim(jwtPayload, 'roleCode', 'role_code', 'role') ?? '' : '').toLowerCase();
  const claimTenantId = jwtScope.tenantId.trim().toLowerCase();

  if (isGroupCeoOnMasterTenant(claimTenantId, roleCode)) {
    return;
  }

  if (partition.tenantId.trim().toLowerCase() !== claimTenantId) {
    throw new ApiException('SCOPE_CONTEXT_MISMATCH', 'tenantId mismatches token scope', HttpStatus.CONFLICT, {
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
export function resolveRaciMatrixJwtScope(
  authorization: string | undefined,
  requested: { tenantId?: string; companyId?: string },
): { tenantId: string; companyId: string } {
  const jwtPayload = getVerifiedInternalJwtPayload(authorization) as Record<string, unknown> | null;
  const claimTenantId = jwtPayload ? readClaim(jwtPayload, 'tenantId', 'tenant_id', 'tid') : undefined;
  const claimCompanyId = jwtPayload ? readClaim(jwtPayload, 'companyId', 'company_id', 'cid') : undefined;
  const roleCode = (jwtPayload ? readClaim(jwtPayload, 'roleCode', 'role_code', 'role') ?? '' : '').toLowerCase();

  if (isGroupCeoOnMasterTenant(claimTenantId, roleCode)) {
    return resolveScopeContext(authorization, {
      tenantId: claimTenantId ?? requested.tenantId,
      companyId: claimCompanyId ?? requested.companyId ?? XBOS_GROUP_OPERATING_MAIN,
    });
  }

  return resolveScopeContext(authorization, requested);
}
