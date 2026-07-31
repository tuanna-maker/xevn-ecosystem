import type { HrmSpreadsheetScope } from '@/integrations/hrmApi';
import {
  coerceHrmListCompanyId,
  HRM_GROUP_LIST_ALIASES,
  HRM_LIST_DEFAULT_COMPANY_ID,
  HRM_MASTER_TENANT_ID,
} from '@/lib/hrmListScope';
import { getPortalAccessToken, hasPortalSession } from '@/lib/portalAuthBridge';

function readBase64Url(input: string): string {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = `${base64}${'='.repeat((4 - (base64.length % 4)) % 4)}`;
  return atob(padded);
}

function parseJwtClaims(token: string | undefined): Record<string, unknown> {
  if (!token) return {};
  const parts = token.split('.');
  if (parts.length < 2 || !parts[1]) return {};
  try {
    return JSON.parse(readBase64Url(parts[1])) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function pickClaim(claims: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = claims[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return null;
}

export function getPortalJwtCompanyId(): string | null {
  const claims = parseJwtClaims(getPortalAccessToken() ?? undefined);
  const company = pickClaim(claims, ['companyId', 'company_id', 'activeCompanyId', 'active_company_id']);
  if (!company || HRM_GROUP_LIST_ALIASES.has(company)) return null;
  if (company === HRM_LIST_DEFAULT_COMPANY_ID || company === 'holding') return null;
  return company;
}

export function getPortalJwtTenantId(): string | null {
  const claims = parseJwtClaims(getPortalAccessToken() ?? undefined);
  return pickClaim(claims, ['tenantId', 'tenant_id', 'tid']);
}

/** Portal JWT role for context chips (UC-HRM-SCOPE-05 / AC-CD-F3-01). */
export function getPortalJwtRoleCode(): string | null {
  const claims = parseJwtClaims(getPortalAccessToken() ?? undefined);
  return pickClaim(claims, ['roleCode', 'role_code', 'role']);
}

/**
 * Spreadsheet / settings-catalog scope aligned with portal JWT (e.g. companyId=main).
 * Prevents SCOPE_CONTEXT_MISMATCH (409) when iframe query companyId ≠ token.
 */
export function resolveHrmSpreadsheetScope(
  currentCompanyId?: string | null,
  search = typeof window !== 'undefined' ? window.location.search : '',
): HrmSpreadsheetScope | null {
  const urlParams = new URLSearchParams(search);
  const qsCompanyId = urlParams.get('companyId')?.trim();
  const qsTenantId = urlParams.get('tenantId')?.trim();
  const tenantFromEnv = import.meta.env.VITE_HRM_SCOPE_TENANT_ID?.trim();
  const jwtCompany = getPortalJwtCompanyId();
  const jwtTenant = getPortalJwtTenantId();

  // Catalog/settings on group embed always anchor to JWT rollup `main` (U39 — not operating-unit filter).
  if (hasPortalSession() && jwtTenant === HRM_MASTER_TENANT_ID) {
    return {
      tenantId: jwtTenant,
      companyId: HRM_LIST_DEFAULT_COMPANY_ID,
    };
  }

  const storedCompany =
    (typeof localStorage !== 'undefined' ? localStorage.getItem('hrm_current_company_id') : null) ||
    (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('hrm_current_company_id') : null);

  const hintCompany =
    (currentCompanyId && currentCompanyId !== 'all' ? currentCompanyId : null) ||
    (qsCompanyId && qsCompanyId !== 'all' ? qsCompanyId : null) ||
    (storedCompany && storedCompany !== 'all' ? storedCompany : null);

  const rawCompanyId =
    (hasPortalSession() && jwtCompany ? jwtCompany : null) ||
    (hintCompany && !HRM_GROUP_LIST_ALIASES.has(hintCompany) ? hintCompany : null) ||
    import.meta.env.VITE_HRM_SCOPE_COMPANY_ID?.trim() ||
    null;

  const companyId = rawCompanyId ? coerceHrmListCompanyId(rawCompanyId) : null;
  if (!companyId) return null;

  const tenantId =
    qsTenantId ||
    jwtTenant ||
    tenantFromEnv ||
    (typeof localStorage !== 'undefined' ? localStorage.getItem('hrm_current_tenant_id') : null) ||
    (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('hrm_current_tenant_id') : null) ||
    companyId;

  return { tenantId, companyId };
}
