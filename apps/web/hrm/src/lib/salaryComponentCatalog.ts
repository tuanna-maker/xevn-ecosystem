/**
 * @CODE-MEMORY
 * Screen:     /payroll · /settings · EMP Đãi ngộ — Nest salary_components picker SoT
 * UC:         AC-PLT-PAY-01/01b/01c · AC-PAY-COMP-01 · BR-PLT-02/04/05 · L-PAY-AC-01..04
 * BR:         Option B — Nest F-PLT-PAY-COMP-01 = code SoT consumers; Settings extension ≠ sole SoT
 * SRS:        docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-BA-01.md §4–§6
 * API_DESIGN: F-PLT-PAY-COMP-01 GET /api/hrm/payroll/salary-components
 * Purpose:    Pure helpers — Nest row → CatalogPickerOption; empty Nest = empty picker (no invent/seed).
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-CNS-FE-01
 * Coded:      2026-08-07
 * Callers:    useSalaryComponentsEffective · SalaryComponentsTab · PayFormulaAuthorPanel · EmployeeCompensationPanel · PaySheetTemplateSettingsPanel
 * Callees:    (pure) — không gọi API
 * must_keep:  payroll_e2e_ready=false · DENY formula LIVE · U65 no seed · admin CREATE N+1 retained (L-PAY-AC-01)
 * SOLID:      Catalog display/membership SRP — UI bind display-ready từ Nest
 * solid_convention_ack: FE không invent net/formula; Settings salary_components ≠ sole picker SoT
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-pay-catalog-cns-fe-01.md
 */

import type { CatalogPickerOption } from '@/lib/catalogSearchPicker';

/** Honesty — FE không flip payroll module / formula LIVE từ catalog rebind. */
export const PAY_SALARY_COMPONENT_UAT_HONESTY = false;

/** VI — Nest active = 0 (AC-PLT-PAY-01b). */
export const PAY_SALARY_COMPONENT_EMPTY_NEST_HINT =
  'Chưa có thành phần lương Nest. Tạo tại Payroll → Thành phần lương (admin) trước khi gắn mẫu / đãi ngộ / công thức.';

/** VI — Settings extension không phải SoT picker (L-PAY-AC-02). */
export const PAY_SALARY_COMPONENT_SETTINGS_NOT_SOT_NOTE =
  'Danh mục chuẩn = Nest salary_components (GET /api/hrm/payroll/salary-components). Cài đặt extension không phải SoT picker.';

export type NestSalaryComponentLike = {
  id?: string | null;
  code?: string | null;
  name?: string | null;
  is_active?: boolean | null;
  isActive?: boolean | null;
};

export function nestSalaryComponentCode(row: NestSalaryComponentLike | null | undefined): string {
  return String(row?.code ?? '').trim();
}

export function nestSalaryComponentLabel(row: NestSalaryComponentLike | null | undefined): string {
  const code = nestSalaryComponentCode(row);
  const name = String(row?.name ?? '').trim();
  if (name && code) return `${name} (${code})`;
  return name || code || '—';
}

export function isNestSalaryComponentActive(row: NestSalaryComponentLike | null | undefined): boolean {
  if (row == null) return false;
  if (typeof row.is_active === 'boolean') return row.is_active;
  if (typeof row.isActive === 'boolean') return row.isActive;
  return true;
}

/** Active Nest rows → picker options (value = code). Inactive hidden (BR-PLT-04). */
export function nestSalaryComponentsToPickerOptions(
  rows: readonly NestSalaryComponentLike[],
  opts?: { includeInactive?: boolean },
): CatalogPickerOption[] {
  const includeInactive = opts?.includeInactive === true;
  const out: CatalogPickerOption[] = [];
  const seen = new Set<string>();
  for (const row of rows) {
    if (!includeInactive && !isNestSalaryComponentActive(row)) continue;
    const code = nestSalaryComponentCode(row);
    if (!code || seen.has(code)) continue;
    seen.add(code);
    const name = String(row.name ?? '').trim() || code;
    out.push({ value: code, label: name, code });
  }
  return out;
}

/** Active Nest rows → picker by UUID id (pay-sheet-template lines). */
export function nestSalaryComponentsToIdPickerOptions(
  rows: readonly NestSalaryComponentLike[],
  opts?: { includeInactive?: boolean },
): CatalogPickerOption[] {
  const includeInactive = opts?.includeInactive === true;
  const out: CatalogPickerOption[] = [];
  for (const row of rows) {
    if (!includeInactive && !isNestSalaryComponentActive(row)) continue;
    const id = String(row.id ?? '').trim();
    const code = nestSalaryComponentCode(row);
    if (!id || !code) continue;
    out.push({
      value: id,
      label: nestSalaryComponentLabel(row),
      code,
    });
  }
  return out;
}

export function resolveNestSalaryComponentLabel(
  options: readonly CatalogPickerOption[],
  code: string | null | undefined,
): string {
  const key = (code ?? '').trim();
  if (!key) return '—';
  const hit = options.find((o) => o.value === key || o.code === key);
  if (hit?.label?.trim()) return hit.label.trim();
  return key;
}

/** Membership check — Nest active set (AC-PAY-COMP-01 / VAL-PAY-CNS-*). */
export function isCodeInNestSalaryCatalog(
  options: readonly CatalogPickerOption[],
  code: string | null | undefined,
): boolean {
  const key = (code ?? '').trim();
  if (!key) return false;
  return options.some((o) => o.value === key || o.code === key);
}

/** History/edit — keep retired code selectable when not in effective. */
export function withNestSalaryComponentHistoryOption(
  options: readonly CatalogPickerOption[],
  currentCode: string | null | undefined,
): CatalogPickerOption[] {
  const key = (currentCode ?? '').trim();
  if (!key) return [...options];
  if (options.some((o) => o.value === key || o.code === key)) return [...options];
  return [...options, { value: key, label: key, code: key }];
}

/** Formula soft warn (VAL-PAY-CNS-07) — Nest >0 và mã ∉ catalog. */
export function nestSalaryComponentSoftWarn(
  nestActiveCount: number,
  code: string | null | undefined,
  options: readonly CatalogPickerOption[],
): string | null {
  if (nestActiveCount <= 0) return null;
  const key = (code ?? '').trim();
  if (!key) return null;
  if (isCodeInNestSalaryCatalog(options, key)) return null;
  return `Mã «${key}» chưa có trong Nest salary_components — chọn từ danh mục (AC-PAY-COMP-01).`;
}

/**
 * AC-PAY-COMP-01 — when effective catalog count > 0, every bind code must ∈ Nest.
 * Returns alien codes (deduped) — empty = OK.
 */
export function collectAlienNestSalaryComponentCodes(
  codes: readonly (string | null | undefined)[],
  options: readonly CatalogPickerOption[],
  catalogActiveCount: number,
): string[] {
  if (catalogActiveCount <= 0) return [];
  const alien = new Set<string>();
  for (const raw of codes) {
    const key = (raw ?? '').trim();
    if (!key) continue;
    if (!isCodeInNestSalaryCatalog(options, key)) alien.add(key);
  }
  return [...alien];
}

/** VI message for FE block before mutate (maps BE HRM-SC-COMP-KEY family). */
export function comp01RejectMessageVi(alienCodes: readonly string[]): string {
  if (alienCodes.length === 0) return '';
  const list = alienCodes.map((c) => `«${c}»`).join(', ');
  return `Mã thành phần ${list} không có trong danh mục Nest hiệu lực — chỉ chọn từ picker (AC-PAY-COMP-01 · HRM-SC-COMP-KEY).`;
}
