/**
 * @CODE-MEMORY
 * Screen:     /settings · EMP CFG — catalog loại hình thuê (F-EMP-CAT-ET/EFF)
 * UC:         AC-PLT-EMP-04/05 · BR-PLT-02/04/05/06
 * BR:         DYNAMIC-LOCK — format-only employmentTypeKey · hyphen→underscore · open 5th+ · soft-delete
 * SRS:        docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-VERTICAL-SA-01.md §5
 * API_DESIGN: F-EMP-CAT-ET-01/02 · F-EMP-CAT-EFF-02
 * Purpose:    Helper mở catalog EMP employment types — nhãn vi-VN + normalize (không enum 4-option).
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-FE-01
 * Coded:      2026-08-07
 * Callers:    EmpEmploymentTypeSettingsPanel · useEmpEmploymentTypesEffective · EmployeeFormDialog
 * Callees:    (pure) — không gọi API
 * must_keep:  starter ≠ trần · cấm FE hardcode full_time|part_time|contract|intern SoT · soft-delete · U65
 * SOLID:      Constants/helpers SRP — UI bind display-ready từ BE
 * solid_convention_ack: FE chỉ format + hyphen normalize; hrm_personnel_uat_ready=false
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-fe-01.md
 */

import type { CatalogPickerOption } from '@/lib/catalogSearchPicker';

/** Format-only — khớp BE EMP_EMPLOYMENT_TYPE_KEY_FORMAT after hyphen→underscore. */
export const EMP_EMPLOYMENT_TYPE_KEY_FORMAT = /^[a-z][a-z0-9_]*$/;

export const EMP_EMPLOYMENT_TYPE_SOURCE_LABELS: Record<string, string> = {
  emp_native: 'EMP (đơn vị)',
  group_ref: 'Danh mục tập đoàn',
  emp_override: 'EMP ghi đè REF',
};

/** Honesty — FE không flip UAT personnel / e2e linkage. */
export const EMP_EMPLOYMENT_TYPE_UAT_HONESTY = false;

/**
 * FE normalize — hyphen→underscore + lowercase (pattern Loại phép).
 * `full-time` → `full_time`; `FULL_TIME` → `full_time`.
 */
export function normalizeEmpEmploymentTypeKey(raw: string): string {
  return raw.trim().replace(/-/g, '_').toLowerCase();
}

export function isValidEmpEmploymentTypeKeyFormat(raw: string): boolean {
  const key = normalizeEmpEmploymentTypeKey(raw);
  return Boolean(key) && EMP_EMPLOYMENT_TYPE_KEY_FORMAT.test(key);
}

export function empEmploymentTypeSourceLabel(source: string | null | undefined): string {
  const s = (source ?? '').trim();
  return EMP_EMPLOYMENT_TYPE_SOURCE_LABELS[s] ?? (s || '—');
}

export function formatEmpEmploymentTypeDisplay(
  employmentTypeKey: string,
  nameVi: string | null | undefined,
): string {
  const key = employmentTypeKey.trim();
  const label = (nameVi ?? '').trim();
  if (label) return `${label} (${key})`;
  return key || '—';
}

export function empEmploymentTypeToPickerOption(row: {
  employmentTypeKey: string;
  nameVi: string;
}): CatalogPickerOption {
  const value = row.employmentTypeKey.trim();
  const label = (row.nameVi ?? '').trim() || value;
  return { value, label, code: value };
}

export function empEmploymentTypesToPickerOptions(
  rows: readonly { employmentTypeKey: string; nameVi: string }[],
): CatalogPickerOption[] {
  return rows.map(empEmploymentTypeToPickerOption);
}

/**
 * Retire / history — mã cũ (kể cả full-time hyphen) vẫn hiện key/nhãn khi không còn active.
 * Không invent closed enum SoT.
 */
export function resolveEmpEmploymentTypeLabel(
  options: readonly CatalogPickerOption[],
  code: string | null | undefined,
): string {
  const raw = (code ?? '').trim();
  if (!raw) return '—';
  const normalized = normalizeEmpEmploymentTypeKey(raw);
  const hit = options.find(
    (o) => o.value === raw || o.code === raw || o.value === normalized || o.code === normalized,
  );
  if (hit?.label?.trim()) return hit.label.trim();
  return raw;
}

/** Ensure historical value remains selectable on edit after retire (BR-PLT-04). */
export function ensureHistoricalEmploymentTypeOption(
  options: readonly CatalogPickerOption[],
  currentValue: string | null | undefined,
): CatalogPickerOption[] {
  const raw = (currentValue ?? '').trim();
  if (!raw) return [...options];
  const normalized = normalizeEmpEmploymentTypeKey(raw);
  const exists = options.some(
    (o) => o.value === raw || o.code === raw || o.value === normalized || o.code === normalized,
  );
  if (exists) return [...options];
  return [...options, { value: raw, label: raw, code: raw }];
}
