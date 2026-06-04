/**
 * Command Center / XBOS query scope — ADR-GROUP-CEO-MAIN-HOLDING-SCOPE (TM C2).
 * JWT stays `main`; KPI rollup query uses `holding` for group CEO on master tenant.
 */
import { isMasterTenant, MASTER_TENANT_ID, MEMBER_DEFAULT_COMPANY_ID } from '../constants/tenant';
import { getStoredAccessToken } from './authSession';
import { getJwtCompanyId, getJwtTenantId, isGroupCompanyId, resolveIdentityScope } from './identityScope';
import { matchXbosApiScopeMode, type XbosApiScopeMode } from './xbosApiScopeRouteTable';

/** XBOS legal-entity / catalog seed partition (not HRM operational lists). */
export const XBOS_GROUP_HOLDING_COMPANY_ID = 'holding';

function readBase64Url(input: string): string {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = `${base64}${'='.repeat((4 - (base64.length % 4)) % 4)}`;
  return atob(padded);
}

function parseJwtClaims(): Record<string, unknown> {
  const portal = getStoredAccessToken();
  const service = import.meta.env.VITE_SERVICE_JWT_TOKEN;
  const token =
    portal ?? (typeof service === 'string' && service.trim() ? service.trim() : undefined);
  if (!token) return {};
  const parts = token.split('.');
  if (parts.length < 2 || !parts[1]) return {};
  try {
    return JSON.parse(readBase64Url(parts[1])) as Record<string, unknown>;
  } catch {
    return {};
  }
}

/** Read role from JWT claims (testable). */
export function getJwtRoleCodeFromClaims(claims: Record<string, unknown>): string | null {
  for (const key of ['roleCode', 'role_code', 'role', 'activeRole']) {
    const value = claims[key];
    if (typeof value === 'string' && value.trim()) return value.trim().toLowerCase();
  }
  return null;
}

export function getJwtRoleCode(): string | null {
  return getJwtRoleCodeFromClaims(parseJwtClaims());
}

export function isGroupLeadershipRole(roleCode: string | null | undefined): boolean {
  if (!roleCode) return false;
  const r = roleCode.toLowerCase();
  return r === 'group_ceo' || r.startsWith('group_');
}

/**
 * Group CEO on master tenant (`ceo@xe.vn` pattern).
 */
export function isGroupCeoOnMasterTenant(tenantIdHint?: string | null): boolean {
  const tenantId = (tenantIdHint ?? getJwtTenantId() ?? MASTER_TENANT_ID).trim().toLowerCase();
  if (!isMasterTenant(tenantId)) return false;
  return isGroupLeadershipRole(getJwtRoleCode());
}

function isMasterTenantSlugUsedAsCompany(tenantId: string, companyId: string): boolean {
  return companyId.trim().toLowerCase() === tenantId.trim().toLowerCase();
}

/** HRM embed + operational REST — always JWT-aligned `main` (no holding alias). */
export function resolveHrmOperationalCompanyId(
  tenantIdHint?: string | null,
  companyIdHint?: string | null,
): string {
  const { tenantId, companyId } = resolveIdentityScope(tenantIdHint, companyIdHint);
  if (
    isMasterTenant(tenantId) &&
    (isGroupCompanyId(companyId) || isMasterTenantSlugUsedAsCompany(tenantId, companyId))
  ) {
    return MEMBER_DEFAULT_COMPANY_ID;
  }
  return companyId;
}

/**
 * KPI rollup query `companyId` — group CEO may pass `holding` while JWT remains `main`.
 * Perimeter builds: keep query `main` so rollup matches JWT (avoids 409 when BE lacks holding bridge).
 */
export function resolveXbosKpiRollupCompanyId(
  tenantIdHint?: string | null,
  companyIdHint?: string | null,
): string {
  const { tenantId, companyId } = resolveIdentityScope(tenantIdHint, companyIdHint);
  const useHoldingPartition = import.meta.env.VITE_KPI_ROLLUP_USE_HOLDING === 'true';
  if (
    useHoldingPartition &&
    isMasterTenant(tenantId) &&
    companyId === MEMBER_DEFAULT_COMPANY_ID &&
    isGroupCeoOnMasterTenant(tenantId)
  ) {
    return XBOS_GROUP_HOLDING_COMPANY_ID;
  }
  return companyId;
}

/**
 * Strict XBOS modules (workflow, assets, position-rbac, …) — never send `holding` on x-company-id.
 */
export function resolveXbosStrictCompanyId(
  tenantIdHint?: string | null,
  companyIdHint?: string | null,
): string {
  const { companyId } = resolveIdentityScope(tenantIdHint, companyIdHint);
  if (isGroupCompanyId(companyId) || companyId === XBOS_GROUP_HOLDING_COMPANY_ID) {
    return MEMBER_DEFAULT_COMPANY_ID;
  }
  return companyId;
}

/**
 * Group-legal-read surfaces — JWT `main`; BE maps to holding partition (ADR §4).
 */
export function resolveXbosGroupLegalReadCompanyId(
  tenantIdHint?: string | null,
  companyIdHint?: string | null,
): string {
  return resolveIdentityScope(tenantIdHint, companyIdHint).companyId;
}

/** Resolve `x-company-id` / query `companyId` from API path per route table. */
export function resolveXbosApiCompanyIdForPath(
  apiPath: string,
  tenantIdHint?: string | null,
  companyIdHint?: string | null,
): string {
  return resolveXbosApiCompanyIdForMode(
    matchXbosApiScopeMode(apiPath),
    tenantIdHint,
    companyIdHint,
  );
}

export function resolveXbosApiCompanyIdForMode(
  mode: XbosApiScopeMode,
  tenantIdHint?: string | null,
  companyIdHint?: string | null,
): string {
  switch (mode) {
    case 'kpi-rollup':
      return resolveXbosKpiRollupCompanyId(tenantIdHint, companyIdHint);
    case 'group-legal-read':
      return resolveXbosGroupLegalReadCompanyId(tenantIdHint, companyIdHint);
    case 'strict':
    default:
      return resolveXbosStrictCompanyId(tenantIdHint, companyIdHint);
  }
}

export function describeScopePlaneForUi(): string {
  const company = getJwtCompanyId() ?? MEMBER_DEFAULT_COMPANY_ID;
  const rollup = resolveXbosKpiRollupCompanyId();
  if (company === rollup) {
    return `JWT companyId=${company}`;
  }
  return `JWT companyId=${company} · KPI rollup query=${rollup}`;
}
