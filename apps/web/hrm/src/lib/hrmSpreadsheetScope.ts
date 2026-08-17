/**
 * @CODE-MEMORY
 * Screen:     HRM embed scope headers (catalog vs operating-unit mutate)
 * UC:         UC-HRM-09 · TC-HIM-ATT-TMDV-AP-001 · ADR-GROUP-CEO-MAIN-HOLDING-SCOPE
 * Purpose:    resolveHrmSpreadsheetScope neo catalog/settings về `main` trên JWT tenant tập đoàn;
 *             resolveHrmMutateCompanyScope dùng cho approve/reject — ưu tiên company membership
 *             (vd. trsport) để tránh x-company-id: main → 409 SCOPE_CONTEXT_MISMATCH.
 * WorkItem:   U78-U84-ATT-ADJ-TMDV-AP-COMPANY-HEADER-01
 * Coded:      2026-08-04
 * must_keep:  early-return catalog main cho settings; mutate helper for ATT + leave approve/reject
 * LastVerified: hrmSpreadsheetScope.test.ts · hrmApi.approveLeaveRequest.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-08-04 U78-U84-ATT-ADJ-TMDV-AP-COMPANY-HEADER-01
 * change_mode: FIX
 * What: ADD resolveHrmMutateCompanyScope — member JWT/OU hint → x-company-id (không ép main)
 * Why: QA R1 mgr Duyệt attendance update-request 409; L1 + x-company-id=trsport → 201
 * must_keep: resolveHrmSpreadsheetScope catalog main rollup; ISO create compose
 *
 * @CODE-MEMORY-CHANGE 2026-08-04 PO-UC-TC-W4-FE-AT12-L1-APPROVE-SCOPE-01
 * change_mode: FIX
 * What: leave approve/reject consumers use resolveHrmMutateCompanyScope (parity ATT update)
 * Why: QA AT-12 R3 HRM-LEAVE-409 x-company-id=main
 * must_keep: spreadsheet catalog main early-return; list leave query; U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-08-04 PO-UC-TC-W4-FE-AT12-L1-CREATE-CATALOG-01
 * change_mode: FIX
 * What: ADD resolveHrmSettingsCatalogScope — member/holding JWT → OU partition (trsport|holding);
 *       Group CEO main vẫn spreadsheet main→BE holding. Settings GET/sync + Leave picker dùng helper này.
 * Why: QC R-W4-AT12-L1-CREATE-CATALOG — member JWT + spreadsheet main đọc partition `main` trống;
 *      create assert leave_types trên `trsport` → picker empty / U65 create blocked
 * must_keep: resolveHrmSpreadsheetScope early-return main; AT-12 L1 approve; pull≠apply/clone; U65 no seed
 */
import type { HrmSpreadsheetScope } from '@/integrations/hrmApi';
import {
  coerceHrmListCompanyId,
  HRM_GROUP_LIST_ALIASES,
  HRM_LIST_DEFAULT_COMPANY_ID,
  HRM_MASTER_TENANT_ID,
  isHrmOperatingUnitSlug,
  normalizeHrmApiListCompanyId,
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

/**
 * JWT company for settings-catalog GET/sync partition (parity BE resolveHrmSettingsCatalogCompanyId).
 * Keeps `holding` and member OU slugs; returns null for rollup `main` (caller uses spreadsheet main).
 */
export function getPortalJwtCatalogCompanyId(): string | null {
  const claims = parseJwtClaims(getPortalAccessToken() ?? undefined);
  const company = pickClaim(claims, ['companyId', 'company_id', 'activeCompanyId', 'active_company_id']);
  if (!company || company === 'all') return null;
  const lower = company.trim().toLowerCase();
  if (lower === HRM_LIST_DEFAULT_COMPANY_ID) return null;
  if (lower === 'holding' || isHrmOperatingUnitSlug(lower)) return lower;
  return null;
}

/**
 * ESS me/payslips* — JWT company for query/header scope.
 * Preserves `holding` (no coerce→main); keeps `main` for CEO 403 HRM-PAY-403-ESS.
 * WorkItem: PO-HRM-AMIS-PARITY-PAY-ESS-FE-02 · D-PAY-ESS-FE-SCOPE-COERCE
 */
export function getPortalJwtEssCompanyId(): string | null {
  const claims = parseJwtClaims(getPortalAccessToken() ?? undefined);
  const company = pickClaim(claims, ['companyId', 'company_id', 'activeCompanyId', 'active_company_id']);
  if (!company || company === 'all') return null;
  return normalizeHrmApiListCompanyId(company);
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

/**
 * Settings-catalog GET / sync-from-xbos scope (Leave picker, Master Data, Danh mục).
 * Member/holding JWT must hit OU partition (`trsport` / `holding`) — BE keeps that partition
 * (not widened to holding SoT). Spreadsheet early-return `main` would read empty `main` rows
 * while leave create asserts `leave_types` on the JWT OU.
 * Group CEO (`main`) keeps {@link resolveHrmSpreadsheetScope} → BE maps main→holding.
 */
export function resolveHrmSettingsCatalogScope(
  currentCompanyId?: string | null,
  search = typeof window !== 'undefined' ? window.location.search : '',
): HrmSpreadsheetScope | null {
  const jwtTenant = getPortalJwtTenantId();
  const catalogCompany = getPortalJwtCatalogCompanyId();
  if (hasPortalSession() && jwtTenant === HRM_MASTER_TENANT_ID && catalogCompany) {
    return {
      tenantId: jwtTenant,
      companyId: normalizeHrmApiListCompanyId(catalogCompany),
    };
  }
  return resolveHrmSpreadsheetScope(currentCompanyId, search);
}

/**
 * Scope headers for operating-unit mutate (approve / reject / delete).
 * Does **not** force catalog rollup `main` when JWT tenant is master — that early-return
 * in {@link resolveHrmSpreadsheetScope} caused mgr FE Duyệt to send `x-company-id: main`
 * while membership is `trsport` → SCOPE_CONTEXT_MISMATCH.
 */
export function resolveHrmMutateCompanyScope(
  companyIdHint?: string | null,
  search = typeof window !== 'undefined' ? window.location.search : '',
): HrmSpreadsheetScope | null {
  const urlParams = new URLSearchParams(search);
  const qsCompanyId = urlParams.get('companyId')?.trim();
  const qsTenantId = urlParams.get('tenantId')?.trim();
  const tenantFromEnv = import.meta.env.VITE_HRM_SCOPE_TENANT_ID?.trim();
  const jwtCompany = getPortalJwtCompanyId();
  const jwtTenant = getPortalJwtTenantId();

  const storedCompany =
    (typeof localStorage !== 'undefined' ? localStorage.getItem('hrm_current_company_id') : null) ||
    (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('hrm_current_company_id') : null);

  const hintCompany =
    (companyIdHint && companyIdHint !== 'all' ? companyIdHint : null) ||
    (qsCompanyId && qsCompanyId !== 'all' ? qsCompanyId : null) ||
    (storedCompany && storedCompany !== 'all' ? storedCompany : null);

  const rawCompanyId =
    (jwtCompany ? jwtCompany : null) ||
    (hintCompany && !HRM_GROUP_LIST_ALIASES.has(hintCompany) ? hintCompany : null) ||
    import.meta.env.VITE_HRM_SCOPE_COMPANY_ID?.trim() ||
    null;

  if (!rawCompanyId) {
    if (hasPortalSession() && jwtTenant === HRM_MASTER_TENANT_ID) {
      return {
        tenantId: jwtTenant,
        companyId: HRM_LIST_DEFAULT_COMPANY_ID,
      };
    }
    return null;
  }

  const companyId = normalizeHrmApiListCompanyId(rawCompanyId);
  const tenantId =
    qsTenantId ||
    jwtTenant ||
    tenantFromEnv ||
    (typeof localStorage !== 'undefined' ? localStorage.getItem('hrm_current_tenant_id') : null) ||
    (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('hrm_current_tenant_id') : null) ||
    HRM_MASTER_TENANT_ID;

  return { tenantId, companyId };
}
