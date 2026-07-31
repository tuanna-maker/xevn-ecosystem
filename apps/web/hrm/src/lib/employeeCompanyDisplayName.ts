/**
 * @CODE-MEMORY
 * Screen:     /employees — cột «Thông tin công ty»
 * UC:         UC-HRM-21 · J-HRM-02 · AC-EMP-COL-01..07
 * BR:         BR-EMP-COL-01 · BR-EMP-COL-02
 * SRS:        docs/qa/evidence/ba-hrm-emp-company-col-01-20260722.md · docs/hrm/SRS.md UC-HRM-21
 * TechSpec:   Plane A legal entity / ĐVTV SoT; BE company_display_name when present
 * Purpose:    Resolve nhãn cột công ty từ API/LE SoT — cấm «Khối … X.E» làm nhãn cuối.
 * WorkItem:   D-HRM-EMP-COMPANY-COL-FE-01
 * Coded:      2026-07-22
 * Callers:    Employees.tsx getCompanyName
 * Callees:    resolveOperatingUnitDisplayName (optional non-Khối path)
 * Impact:     Fallback Khối → lệch ĐVTV / CompanyManagement
 * must_keep:  Fail-closed «—» khi chỉ còn Khối; prefer company_display_name
 * SOLID:      Pure resolve — no React / fetch
 * LastVerified: employeeCompanyDisplayName.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-07-28
 * WorkItem: D-MOB-UUID-BPRIME-FE-01
 * change_mode: FIX
 * What: OU map lookup via resolveHrmCompanySlugForDisplay (Plane B′ UUID → slug); LE UUID → «—»
 * Why: QC residual P2 — never print raw company UUID in HRM embed labels
 * must_keep: Khối fail-closed; prefer company_display_name; dual-plane BE untouched
 */

import { resolveHrmCompanySlugForDisplay } from './hrmMetadataCompany';

/** Legacy Plane B chart interim labels — must not surface on company column. */
export const HRM_LEGACY_KHOI_DISPLAY_NAMES: ReadonlySet<string> = new Set([
  'Khối Vận tải X.E',
  'Khối Logistics X.E',
  'Khối Tài chính X.E',
  'Khối Dịch vụ X.E',
]);

export function isLegacyKhoiDisplayName(name: string | null | undefined): boolean {
  const trimmed = name?.trim() ?? '';
  if (!trimmed) return false;
  if (HRM_LEGACY_KHOI_DISPLAY_NAMES.has(trimmed)) return true;
  return /^Khối\s+/u.test(trimmed);
}

/** Accept only non-empty, non-Khối display strings. */
export function asLegalCompanyDisplayName(name: string | null | undefined): string | null {
  const trimmed = name?.trim() ?? '';
  if (!trimmed || isLegacyKhoiDisplayName(trimmed)) return null;
  return trimmed;
}

export type ResolveEmployeeCompanyColumnInput = {
  companyId: string | null | undefined;
  /** BE enrich field when ready (BE-HRM-EMP-COMPANY-COL-01). */
  companyDisplayName?: string | null;
  /** Alias some payloads may use. */
  companyName?: string | null;
  /** Live map from GET /operating-units (LE SoT after BE sync). */
  operatingUnitLabelMap?: Map<string, string>;
  /** Membership / portal company.name fallback. */
  membershipCompanyName?: string | null;
};

/**
 * Plane A / ĐVTV label for employees list company column.
 * Prefer API company_display_name → non-Khối OU map → membership name → «—».
 */
export function resolveEmployeeCompanyColumnLabel(
  input: ResolveEmployeeCompanyColumnInput,
): string {
  const fromApi =
    asLegalCompanyDisplayName(input.companyDisplayName) ??
    asLegalCompanyDisplayName(input.companyName);
  if (fromApi) return fromApi;

  const slug = resolveHrmCompanySlugForDisplay(input.companyId);
  if (slug && input.operatingUnitLabelMap?.size) {
    const fromMap = asLegalCompanyDisplayName(input.operatingUnitLabelMap.get(slug));
    if (fromMap) return fromMap;
  }

  const fromMembership = asLegalCompanyDisplayName(input.membershipCompanyName);
  if (fromMembership) return fromMembership;

  return '—';
}
