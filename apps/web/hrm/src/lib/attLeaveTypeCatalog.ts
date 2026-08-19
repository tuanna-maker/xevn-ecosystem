/**
 * @CODE-MEMORY
 * Screen:     /settings · ATT CFG — catalog loại phép (F-ATT-CAT-LVT/EFF)
 * UC:         AC-PLT-ATT-01..02 · BR-PLT-02/04/05/06
 * BR:         DYNAMIC-LOCK — format-only leaveTypeKey · open catalog #9+ · soft-delete retire
 * SRS:        docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-VERTICAL-SA-01.md §5
 * API_DESIGN: F-ATT-CAT-LVT-01/02 · F-ATT-CAT-EFF-01
 * Purpose:    Helper mở catalog ATT leave types — nhãn vi-VN + validate slug (không enum LVT_01..04).
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-FE-01
 * Coded:      2026-08-07
 * Callers:    AttLeaveTypeSettingsPanel · useAttLeaveTypesEffective · LeaveTab
 * Callees:    (pure) — không gọi API
 * must_keep:  starter ≠ trần · cấm FE hardcode LVT_01..04 SoT · work_shifts ops untouched · U65
 * SOLID:      Constants/helpers SRP — UI bind display-ready từ BE
 * solid_convention_ack: FE chỉ format + nhãn; attendance_uat_ready=false
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-att-fe-01.md
 */

import type { CatalogPickerOption } from '@/lib/catalogSearchPicker';

/** Format-only — khớp BE ATT_LEAVE_TYPE_KEY_FORMAT; KHÔNG phải danh sách đóng. */
export const ATT_LEAVE_TYPE_KEY_FORMAT = /^[a-z][a-z0-9_]*$/;

export const ATT_LEAVE_TYPE_CATEGORIES = [
  'annual',
  'seniority',
  'ot_comp',
  'carry_over',
  'advance',
  'sick',
  'unpaid',
  'other',
] as const;
export type AttLeaveTypeCategory = (typeof ATT_LEAVE_TYPE_CATEGORIES)[number];

export const ATT_LEAVE_TYPE_CATEGORY_LABELS: Record<AttLeaveTypeCategory, string> = {
  annual: 'Phép năm',
  seniority: 'Thâm niên',
  ot_comp: 'Nghỉ bù OT',
  carry_over: 'Chuyển năm',
  advance: 'Ứng phép',
  sick: 'Ốm / BHXH',
  unpaid: 'Không lương',
  other: 'Khác',
};

export const ATT_LEAVE_TYPE_SOURCE_LABELS: Record<string, string> = {
  att_native: 'ATT (đơn vị)',
  group_ref: 'Danh mục tập đoàn',
  att_override: 'ATT ghi đè REF',
};

/** Honesty — FE không flip UAT attendance. */
export const ATT_LEAVE_TYPE_UAT_HONESTY = false;

export function isValidAttLeaveTypeKeyFormat(raw: string): boolean {
  const key = raw.trim();
  return Boolean(key) && ATT_LEAVE_TYPE_KEY_FORMAT.test(key);
}

export function normalizeAttLeaveTypeKey(raw: string): string {
  return raw.trim().toLowerCase();
}

export function attLeaveTypeCategoryLabel(category: string | null | undefined): string {
  const c = (category ?? '').trim().toLowerCase();
  if ((ATT_LEAVE_TYPE_CATEGORIES as readonly string[]).includes(c)) {
    return ATT_LEAVE_TYPE_CATEGORY_LABELS[c as AttLeaveTypeCategory];
  }
  return c || '—';
}

export function attLeaveTypeSourceLabel(source: string | null | undefined): string {
  const s = (source ?? '').trim();
  return ATT_LEAVE_TYPE_SOURCE_LABELS[s] ?? (s || '—');
}

export function formatAttLeaveTypeDisplay(
  leaveTypeKey: string,
  nameVi: string | null | undefined,
): string {
  const key = leaveTypeKey.trim();
  const label = (nameVi ?? '').trim();
  if (label) return `${label} (${key})`;
  return key || '—';
}

/** Map effective/list row → CatalogSearchPicker option (value = leaveTypeKey). */
export function attLeaveTypeToPickerOption(row: {
  leaveTypeKey: string;
  nameVi: string;
}): CatalogPickerOption {
  const value = row.leaveTypeKey.trim();
  const label = (row.nameVi ?? '').trim() || value;
  return { value, label, code: value };
}

export function attLeaveTypesToPickerOptions(
  rows: readonly { leaveTypeKey: string; nameVi: string }[],
): CatalogPickerOption[] {
  return rows.map(attLeaveTypeToPickerOption);
}
