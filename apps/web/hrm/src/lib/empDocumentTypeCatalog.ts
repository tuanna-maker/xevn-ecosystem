/**
 * @CODE-MEMORY
 * Screen:     /settings · EMP CFG — catalog loại giấy tờ (F-EMP-CAT-DOC/EFF)
 * UC:         AC-PLT-EMP-02/03 · BR-PLT-02/04/05
 * BR:         DYNAMIC-LOCK — format-only documentTypeKey · open catalog N+ · soft-delete retire
 * SRS:        docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-VERTICAL-SA-01.md §5
 * API_DESIGN: F-EMP-CAT-DOC-01/02 · F-EMP-CAT-EFF-01
 * Purpose:    Helper mở catalog EMP document types — nhãn vi-VN + validate slug (không enum cccd/cv/…).
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-FE-01
 * Coded:      2026-08-07
 * Callers:    EmpDocumentTypeSettingsPanel · useEmpDocumentTypesEffective
 * Callees:    (pure) — không gọi API
 * must_keep:  starter ≠ trần · cấm FE hardcode CCCD closed SoT · soft-delete · U65 · hrm_personnel_uat_ready=false
 * SOLID:      Constants/helpers SRP — UI bind display-ready từ BE
 * solid_convention_ack: FE chỉ format + nhãn; không invent closed document enum
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-fe-01.md
 */

import type { CatalogPickerOption } from '@/lib/catalogSearchPicker';

/** Format-only — khớp BE EMP_DOCUMENT_TYPE_KEY_FORMAT; KHÔNG phải danh sách đóng. */
export const EMP_DOCUMENT_TYPE_KEY_FORMAT = /^[a-z][a-z0-9_]*$/;

export const EMP_DOCUMENT_TYPE_SOURCE_LABELS: Record<string, string> = {
  emp_native: 'EMP (đơn vị)',
  group_ref: 'Danh mục tập đoàn',
  emp_override: 'EMP ghi đè REF',
};

/** Honesty — FE không flip UAT personnel. */
export const EMP_DOCUMENT_TYPE_UAT_HONESTY = false;

/**
 * FE normalize — lowercase slug (pattern Loại phép / UAT Thêm→Lưu).
 * BE stores lowercase keys after format pass.
 */
export function normalizeEmpDocumentTypeKey(raw: string): string {
  return raw.trim().toLowerCase();
}

export function isValidEmpDocumentTypeKeyFormat(raw: string): boolean {
  const key = normalizeEmpDocumentTypeKey(raw);
  return Boolean(key) && EMP_DOCUMENT_TYPE_KEY_FORMAT.test(key);
}

export function empDocumentTypeSourceLabel(source: string | null | undefined): string {
  const s = (source ?? '').trim();
  return EMP_DOCUMENT_TYPE_SOURCE_LABELS[s] ?? (s || '—');
}

export function formatEmpDocumentTypeDisplay(
  documentTypeKey: string,
  nameVi: string | null | undefined,
): string {
  const key = documentTypeKey.trim();
  const label = (nameVi ?? '').trim();
  if (label) return `${label} (${key})`;
  return key || '—';
}

export function empDocumentTypeToPickerOption(row: {
  documentTypeKey: string;
  nameVi: string;
}): CatalogPickerOption {
  const value = row.documentTypeKey.trim();
  const label = (row.nameVi ?? '').trim() || value;
  return { value, label, code: value };
}

export function empDocumentTypesToPickerOptions(
  rows: readonly { documentTypeKey: string; nameVi: string }[],
): CatalogPickerOption[] {
  return rows.map(empDocumentTypeToPickerOption);
}

/** Retire history — hiển thị key khi mã không còn trong effective. */
export function resolveEmpDocumentTypeLabel(
  options: readonly CatalogPickerOption[],
  code: string | null | undefined,
): string {
  const key = (code ?? '').trim();
  if (!key) return '—';
  const hit = options.find((o) => o.value === key || o.code === key);
  if (hit?.label?.trim()) return hit.label.trim();
  return key;
}
