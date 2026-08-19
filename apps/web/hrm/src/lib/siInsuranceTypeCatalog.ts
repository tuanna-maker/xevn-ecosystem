/**
 * @CODE-MEMORY
 * Screen:     /settings · SI CFG — catalog loại BH (F-SI-CAT-TYP/EFF)
 * UC:         AC-PLT-SI-INS-01..01d · BR-PLT-02/04/05/06 · FR-UC-BP-CORE-10
 * BR:         DYNAMIC-LOCK — format-only insuranceTypeKey · open catalog N+ · soft-delete
 * SRS:        docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-BA-01.md §6
 * API_DESIGN: F-SI-CAT-TYP-01/02 · F-SI-CAT-EFF-01
 * Purpose:    Helper mở catalog SI insurance types — nhãn vi-VN + validate slug (không enum BHXH/BHYT).
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-FE-01
 * Coded:      2026-08-08
 * Callers:    SiInsuranceTypeSettingsPanel · useSiInsuranceTypesEffective · policy/enrollment/rate-cfg
 * Callees:    (pure) — không gọi API
 * must_keep:  starter ≠ trần · cấm FE hardcode closed SoT · enrollment ONE SoT · CTR seals · U65 · printable/personnel false
 * SOLID:      Constants/helpers SRP — UI bind display-ready từ BE
 * solid_convention_ack: FE chỉ format + nhãn; contracts_printable_ready=false · hrm_personnel_uat_ready=false
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-si-ins-catalog-fe-01.md
 */

import type { CatalogPickerOption } from '@/lib/catalogSearchPicker';

/** Format-only — khớp BE SI_INSURANCE_TYPE_KEY_FORMAT; cho phép A–Z (BHXH). */
export const SI_INSURANCE_TYPE_KEY_FORMAT = /^[a-zA-Z][a-zA-Z0-9_]*$/;

export const SI_INSURANCE_TYPE_SOURCE_LABELS: Record<string, string> = {
  si_native: 'SI (đơn vị)',
  group_ref: 'Danh mục tập đoàn',
  si_override: 'SI ghi đè REF',
};

/** Honesty — FE không flip printable / personnel / module SI UAT. */
export const SI_INSURANCE_TYPE_UAT_HONESTY = false;

/**
 * BE assertKeyFormat = trim only (no forced lowercase).
 * Space / leading digit → invalid; BHXH / hr_custom_si_09 → VALID.
 */
export function normalizeSiInsuranceTypeKey(raw: string): string {
  return raw.trim();
}

export function isValidSiInsuranceTypeKeyFormat(raw: string): boolean {
  const key = normalizeSiInsuranceTypeKey(raw);
  return Boolean(key) && SI_INSURANCE_TYPE_KEY_FORMAT.test(key);
}

export function siInsuranceTypeSourceLabel(source: string | null | undefined): string {
  const s = (source ?? '').trim();
  return SI_INSURANCE_TYPE_SOURCE_LABELS[s] ?? (s || '—');
}

export function formatSiInsuranceTypeDisplay(
  insuranceTypeKey: string,
  nameVi: string | null | undefined,
): string {
  const key = insuranceTypeKey.trim();
  const label = (nameVi ?? '').trim();
  if (label) return `${label} (${key})`;
  return key || '—';
}

export function siInsuranceTypeToPickerOption(row: {
  insuranceTypeKey: string;
  nameVi: string;
}): CatalogPickerOption {
  const value = row.insuranceTypeKey.trim();
  const label = (row.nameVi ?? '').trim() || value;
  return { value, label, code: value };
}

export function siInsuranceTypesToPickerOptions(
  rows: readonly { insuranceTypeKey: string; nameVi: string }[],
): CatalogPickerOption[] {
  return rows.map(siInsuranceTypeToPickerOption);
}

/** Rate-cfg consumer — chỉ mã eligible_for_rate_cfg (default true). */
export function siInsuranceTypesToRateCfgPickerOptions(
  rows: readonly {
    insuranceTypeKey: string;
    nameVi: string;
    eligibleForRateCfg?: boolean;
  }[],
): CatalogPickerOption[] {
  return rows
    .filter((r) => r.eligibleForRateCfg !== false)
    .map(siInsuranceTypeToPickerOption);
}

/** Retire history — hiển thị key khi mã không còn trong effective. */
export function resolveSiInsuranceTypeLabel(
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
export function withSiInsuranceTypeHistoryOption(
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
