/**
 * @CODE-MEMORY
 * Screen: XBOS config-sync catalog GET/list · Command Center org/legal read
 * UC: XBOS-DM-LOG-09 · ADR-GROUP-CEO-MAIN-HOLDING-SCOPE §4
 * BR: Group CEO JWT `main` may read holding + GROUP_MEMBER company partitions
 * SRS: docs/architecture/ADR-GROUP-CEO-MAIN-HOLDING-SCOPE.md §4 config-sync
 * TechSpec: docs/logistics/TECHSPEC_M03_DM_LOG_P1.md §2 (clone dest verify)
 * Purpose: Resolve scope đọc XBOS cho Group CEO — alias main→holding và cho phép
 *   đọc partition công ty thành viên (logistics/…) sau clone-bundle (parity clone vs GET).
 * WorkItem: PO-UC-TC-W3-BE-LOG09-SCOPE
 * Coded: 2026-08-04
 * Callers: config-sync.controller get/list/apply/clone · org-foundation · platform-audit
 * Callees: resolveScopeContext · normalizePortalScopeRequest
 * Impact: Thiếu slug thành viên → GET catalog?companyId=logistics 409 dù clone OK
 * must_keep: AUTH-003 member block · strict resolveScopeContext for non-group · main→holding
 * SOLID: Scope helper tách khỏi controller; không đụng publish write path
 * LastVerified: xbos-group-legal-scope.spec.ts · config-sync.controller.spec.ts
 *
 * @CODE-MEMORY-CHANGE
 * WorkItem: PO-UC-TC-W3-BE-LOG09-SCOPE · 2026-08-04
 * Change: ADD XBOS_GROUP_MEMBER_COMPANY_SLUGS — Group CEO main may GET catalog
 *   on logistics|trsport|finance|services|holding without SCOPE_CONTEXT_MISMATCH
 * must_keep: main/omitted → holding; member CEO no alias; random slug still 409
 */
import { HttpStatus } from '@nestjs/common';
import { ApiException } from './api.exception';
import { getVerifiedInternalJwtPayload } from './internal-auth';
import { normalizePortalScopeRequest, resolveScopeContext } from './scope-context';
import { MEMBER_DEFAULT_COMPANY_ID } from './tenant.constants';

export const XBOS_MASTER_TENANT_ID = 'xevn';
export const XBOS_GROUP_OPERATING_MAIN = 'main';
export const XBOS_GROUP_LEGAL_HOLDING = 'holding';

/** Master-tenant operating company slugs (ADR §4 / HRM GROUP_MEMBER_SLUGS parity). */
export const XBOS_GROUP_MEMBER_COMPANY_SLUGS = [
  'holding',
  'trsport',
  'logistics',
  'finance',
  'services',
] as const;

export type XbosGroupMemberCompanySlug = (typeof XBOS_GROUP_MEMBER_COMPANY_SLUGS)[number];

export function isXbosGroupMemberCompanySlug(companyId: string | undefined): boolean {
  const normalized = companyId?.trim().toLowerCase();
  return (
    !!normalized &&
    (XBOS_GROUP_MEMBER_COMPANY_SLUGS as readonly string[]).includes(normalized)
  );
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
 * Group CEO JWT on `main` reads XBOS legal-entity / catalog partitions:
 * - omitted|main → holding (ADR §4 default)
 * - holding|logistics|trsport|finance|services → that partition (LOG-09 dest verify)
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

  // Group CEO on master: catalog/org reads across GROUP_MEMBER partitions (clone dest = logistics).
  if (
    isGroupCeoOnMasterTenant(claimTenantId, roleCode) &&
    claimCompany === XBOS_GROUP_OPERATING_MAIN &&
    (!requestedTenant ||
      requestedTenant === XBOS_MASTER_TENANT_ID ||
      requestedTenant === XBOS_GROUP_OPERATING_MAIN)
  ) {
    resolveScopeContext(authorization, {
      tenantId: claimTenantId,
      companyId: claimCompanyId,
    });
    if (!requestedCompanyId || requestedCompanyId === XBOS_GROUP_OPERATING_MAIN) {
      return { tenantId: XBOS_MASTER_TENANT_ID, companyId: XBOS_GROUP_LEGAL_HOLDING };
    }
    if (isXbosGroupMemberCompanySlug(requestedCompanyId)) {
      return {
        tenantId: XBOS_MASTER_TENANT_ID,
        companyId: assertScopeSlug(requestedCompany, 'companyId'),
      };
    }
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
