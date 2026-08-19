/**
 * @CODE-MEMORY
 * Screen:     /settings · SI CFG — catalog nhà BH (F-SI-CAT-INS/EFF)
 * UC:         AC-PLT-SI-INSURER-01..01d · BR-PLT-02/04/05/06 · FR-UC-BP-CORE-10 · E3 AC-INS-02
 * BR:         DYNAMIC-LOCK — format-only insurerKey · open catalog N+ · soft-delete
 * SRS:        docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-BA-01.md §6
 * API_DESIGN: F-SI-CAT-INS-01/02 · F-SI-CAT-INS-EFF-01
 * Purpose:    Helper mở catalog SI insurers — nhãn vi-VN + validate slug (không enum VSS/BaoViet).
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-FE-01
 * Coded:      2026-08-08
 * Callers:    SiInsurerSettingsPanel · useSiInsurersEffective · policy/records pickers
 * Callees:    (pure) — không gọi API
 * must_keep:  starter ≠ trần · cấm FE hardcode closed SoT · SI type L1 RETAIN · enrollment/CTR seals · U65 · printable/personnel false
 * SOLID:      Constants/helpers SRP — UI bind display-ready từ BE
 * solid_convention_ack: FE chỉ format + nhãn; contracts_printable_ready=false · hrm_personnel_uat_ready=false
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-si-insurer-catalog-fe-01.md
 */

import type { CatalogPickerOption } from '@/lib/catalogSearchPicker';

/** Format-only — khớp BE SI_INSURER_KEY_FORMAT; cho phép VSS / BaoViet. */
export const SI_INSURER_KEY_FORMAT = /^[a-zA-Z][a-zA-Z0-9_]*$/;

export const SI_INSURER_SOURCE_LABELS: Record<string, string> = {
  si_native: 'SI (đơn vị)',
  group_ref: 'Danh mục tập đoàn',
  si_override: 'SI ghi đè REF',
};

/** Honesty — FE không flip printable / personnel / module SI UAT. */
export const SI_INSURER_UAT_HONESTY = false;

/**
 * BE assertKeyFormat = trim only (no forced lowercase).
 * Space / leading digit → invalid; VSS / hr_insurer_custom_09 → VALID.
 */
export function normalizeSiInsurerKey(raw: string): string {
  return raw.trim();
}

export function isValidSiInsurerKeyFormat(raw: string): boolean {
  const key = normalizeSiInsurerKey(raw);
  return Boolean(key) && SI_INSURER_KEY_FORMAT.test(key);
}

export function siInsurerSourceLabel(source: string | null | undefined): string {
  const s = (source ?? '').trim();
  return SI_INSURER_SOURCE_LABELS[s] ?? (s || '—');
}

export function formatSiInsurerDisplay(
  insurerKey: string,
  nameVi: string | null | undefined,
): string {
  const key = insurerKey.trim();
  const label = (nameVi ?? '').trim();
  if (label) return `${label} (${key})`;
  return key || '—';
}

export function siInsurerToPickerOption(row: {
  insurerKey: string;
  nameVi: string;
}): CatalogPickerOption {
  const value = row.insurerKey.trim();
  const label = (row.nameVi ?? '').trim() || value;
  return { value, label, code: value };
}

export function siInsurersToPickerOptions(
  rows: readonly { insurerKey: string; nameVi: string }[],
): CatalogPickerOption[] {
  return rows.map(siInsurerToPickerOption);
}

/** Retire history — hiển thị key khi mã không còn trong effective. */
export function resolveSiInsurerLabel(
  options: readonly CatalogPickerOption[],
  code: string | null | undefined,
): string {
  const needle = (code ?? '').trim();
  if (!needle) return '—';
  const hit = options.find(
    (o) => o.value === needle || o.value.toLowerCase() === needle.toLowerCase(),
  );
  return hit?.label ?? needle;
}

/** When editing a retired/archived key, keep it selectable for history. */
export function withSiInsurerHistoryOption(
  options: readonly CatalogPickerOption[],
  historyKey: string | null | undefined,
): CatalogPickerOption[] {
  const key = (historyKey ?? '').trim();
  if (!key) return [...options];
  if (options.some((o) => o.value === key || o.value.toLowerCase() === key.toLowerCase())) {
    return [...options];
  }
  return [...options, { value: key, label: key, code: key }];
}
