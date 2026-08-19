/**
 * @CODE-MEMORY
 * Screen:     /settings · DEC CFG — catalog loại quyết định (F-DEC-CAT-TYP/EFF)
 * UC:         AC-PLT-DEC-01..06 · BR-PLT-02/04/05/06 · BR-PLT-DEC-*
 * BR:         DYNAMIC-LOCK — format-only decisionTypeKey · open catalog N+ · HRD_* case allowed · soft-delete
 * SRS:        docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-VERTICAL-SA-01.md §5
 * API_DESIGN: F-DEC-CAT-TYP-01/02 · F-DEC-CAT-EFF-01
 * Purpose:    Helper mở catalog DEC decision types — nhãn vi-VN + validate slug (không enum appointment/HRD_*).
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-FE-01
 * Coded:      2026-08-07
 * Callers:    DecDecisionTypeSettingsPanel · useDecDecisionTypesEffective · Decisions.tsx
 * Callees:    (pure) — không gọi API
 * must_keep:  starter ≠ trần · HRD_* case VALID · cấm FE hardcode closed SoT · soft-delete · U65 · decisions UAT=false
 * SOLID:      Constants/helpers SRP — UI bind display-ready từ BE
 * solid_convention_ack: FE chỉ format + nhãn; flags personBound/WH từ BE effective — không invent closed enum
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-dec-fe-01.md
 */

import type { CatalogPickerOption } from '@/lib/catalogSearchPicker';

/** Format-only — khớp BE HR_DECISION_TYPE_KEY_FORMAT; cho phép A–Z (HRD_01). */
export const DEC_DECISION_TYPE_KEY_FORMAT = /^[a-zA-Z][a-zA-Z0-9_]*$/;

export const DEC_DECISION_TYPE_SOURCE_LABELS: Record<string, string> = {
  dec_native: 'DEC (đơn vị)',
  group_ref: 'Danh mục tập đoàn',
  dec_override: 'DEC ghi đè REF',
};

/** Honesty — FE không flip decisions / QSĐ module UAT. */
export const DEC_DECISION_TYPE_UAT_HONESTY = false;

/**
 * BE assertKeyFormat = trim only (no forced lowercase).
 * Space / leading digit → invalid; HRD_01 / HRD_QA_* → VALID.
 */
export function normalizeDecDecisionTypeKey(raw: string): string {
  return raw.trim();
}

export function isValidDecDecisionTypeKeyFormat(raw: string): boolean {
  const key = normalizeDecDecisionTypeKey(raw);
  return Boolean(key) && DEC_DECISION_TYPE_KEY_FORMAT.test(key);
}

export function decDecisionTypeSourceLabel(source: string | null | undefined): string {
  const s = (source ?? '').trim();
  return DEC_DECISION_TYPE_SOURCE_LABELS[s] ?? (s || '—');
}

export function formatDecDecisionTypeDisplay(
  decisionTypeKey: string,
  nameVi: string | null | undefined,
): string {
  const key = decisionTypeKey.trim();
  const label = (nameVi ?? '').trim();
  if (label) return `${label} (${key})`;
  return key || '—';
}

export function decDecisionTypeToPickerOption(row: {
  decisionTypeKey: string;
  nameVi: string;
}): CatalogPickerOption {
  const value = row.decisionTypeKey.trim();
  const label = (row.nameVi ?? '').trim() || value;
  return { value, label, code: value };
}

export function decDecisionTypesToPickerOptions(
  rows: readonly { decisionTypeKey: string; nameVi: string }[],
): CatalogPickerOption[] {
  return rows.map(decDecisionTypeToPickerOption);
}

/** Retire history — hiển thị key khi mã không còn trong effective. */
export function resolveDecDecisionTypeLabel(
  options: readonly CatalogPickerOption[],
  code: string | null | undefined,
): string {
  const key = (code ?? '').trim();
  if (!key) return '—';
  const hit = options.find((o) => o.value === key || o.code === key);
  if (hit?.label?.trim()) return hit.label.trim();
  return key;
}

/** Append history option when editing archived/retired key not in effective. */
export function withDecDecisionTypeHistoryOption(
  options: readonly CatalogPickerOption[],
  currentKey: string | null | undefined,
): CatalogPickerOption[] {
  const key = (currentKey ?? '').trim();
  if (!key) return [...options];
  if (options.some((o) => o.value === key || o.code === key)) return [...options];
  return [...options, { value: key, label: key, code: key }];
}
