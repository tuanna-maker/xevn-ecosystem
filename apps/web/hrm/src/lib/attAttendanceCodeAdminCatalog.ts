/**
 * @CODE-MEMORY
 * Screen:     /settings · ATT CFG — admin catalog mã chấm công (F-ATT-CAT-CODE)
 * UC:         AC-PLT-ATT-CODE-01* · BR-PLT-04/05 · R-PLT-ATT-FE-ADMIN-01 (sponsor unlock)
 * BR:         DYNAMIC-LOCK — format-only code · open catalog N+ · soft-delete retire
 * SRS:        docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-FE-ADMIN-NOTES-SA-01.md §5.2
 * API_DESIGN: F-ATT-CAT-CODE-01/02 · PUT/POST /attendance/attendance-codes · retire
 * Purpose:    Helper admin ATT attendance-code — nhãn vi-VN + validate slug (không enum closed-4).
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-OT-FE-ADMIN-BUILD-FE-01
 * Coded:      2026-08-09
 * Callers:    AttAttendanceCodeSettingsPanel
 * Callees:    (pure) — không gọi API
 * must_keep:  Nest SoT only · no dual-write Settings · LVRULE HOLD · consumer FE CLOSED · U65 · honesty false
 * SOLID:      Constants/helpers SRP — UI bind display-ready từ BE
 * solid_convention_ack: FE chỉ format + nhãn; attendance_uat_ready=false
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-att-code-ot-fe-admin-build-fe-01.md
 */

/** Format-only — khớp BE ATT_ATTENDANCE_CODE_KEY_FORMAT; KHÔNG phải danh sách đóng. */
export const ATT_ATTENDANCE_CODE_ADMIN_KEY_FORMAT = /^[a-z][a-z0-9_]*$/;

export const ATT_ATTENDANCE_CODE_COUNTS_AS = [
  'work',
  'paid_leave',
  'unpaid_leave',
  'holiday',
  'absent',
  'other',
] as const;
export type AttAttendanceCodeCountsAs = (typeof ATT_ATTENDANCE_CODE_COUNTS_AS)[number];

export const ATT_ATTENDANCE_CODE_COUNTS_AS_LABELS: Record<AttAttendanceCodeCountsAs, string> = {
  work: 'Công làm việc',
  paid_leave: 'Nghỉ có lương',
  unpaid_leave: 'Nghỉ không lương',
  holiday: 'Ngày lễ',
  absent: 'Vắng',
  other: 'Khác',
};

export const ATT_ATTENDANCE_CODE_SOURCE_LABELS: Record<string, string> = {
  att_native: 'ATT (đơn vị)',
  group_ref: 'Danh mục tập đoàn',
  att_override: 'ATT ghi đè REF',
};

/** Honesty — FE không flip UAT attendance. */
export const ATT_ATTENDANCE_CODE_ADMIN_UAT_HONESTY = false;

export function isValidAttAttendanceCodeKeyFormat(raw: string): boolean {
  const key = raw.trim().toLowerCase();
  return Boolean(key) && ATT_ATTENDANCE_CODE_ADMIN_KEY_FORMAT.test(key);
}

export function normalizeAttAttendanceCodeKey(raw: string): string {
  return raw.trim().toLowerCase();
}

export function attAttendanceCodeCountsAsLabel(countsAs: string | null | undefined): string {
  const c = (countsAs ?? '').trim().toLowerCase();
  if ((ATT_ATTENDANCE_CODE_COUNTS_AS as readonly string[]).includes(c)) {
    return ATT_ATTENDANCE_CODE_COUNTS_AS_LABELS[c as AttAttendanceCodeCountsAs];
  }
  return c || '—';
}

export function attAttendanceCodeSourceLabel(source: string | null | undefined): string {
  const s = (source ?? '').trim();
  return ATT_ATTENDANCE_CODE_SOURCE_LABELS[s] ?? (s || '—');
}

export function formatAttAttendanceCodeDisplay(
  code: string,
  nameVi: string | null | undefined,
  symbol?: string | null,
): string {
  const key = code.trim();
  const label = (nameVi ?? '').trim();
  const sym = (symbol ?? '').trim();
  if (label && sym) return `${sym} — ${label} (${key})`;
  if (label) return `${label} (${key})`;
  return key || '—';
}

export function parseAttAttendanceCodeDayWeight(raw: string): number | null {
  const n = Number.parseFloat(raw.trim().replace(',', '.'));
  if (!Number.isFinite(n) || n <= 0 || n > 1) return null;
  return n;
}

export function parseAttAttendanceCodeLegacyAliases(raw: string): string[] {
  return raw
    .split(/[,;\s]+/)
    .map((s) => s.trim().toLowerCase())
    .filter((s) => Boolean(s) && ATT_ATTENDANCE_CODE_ADMIN_KEY_FORMAT.test(s));
}
