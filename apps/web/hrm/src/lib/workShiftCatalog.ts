/**
 * @CODE-MEMORY
 * Screen:     Attendance → Đơn từ → Đổi ca — picker ca làm việc (F-ATT-CAT-SHIFT EFF)
 * UC:         UC-HRM-ATT-SHIFT-CHANGE · VAL-ATT-SHIFT-CNS-02 · AC-PLT-ATT-SHIFT-01
 * BR:         BR-PLT-04 — consumer bind Nest work_shifts; cấm FE invent code khi active>0
 * SRS:        docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-SA-01.md (Option B · ADR D1)
 * API_DESIGN: GET /api/hrm/attendance/work-shifts/effective (display-ready code/name/times/coeff)
 * Purpose:    Map effective work-shift rows → picker options + resolve nhãn hiển thị.
 *             Bootstrap fallback 5-id CHỈ khi Nest active=0 (empty UX — U65 no seed).
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-FE-01
 * Coded:      2026-08-08
 * Callers:    useWorkShiftsEffective · ShiftChangeRequestTab
 * Callees:    (pure) — không gọi API
 * must_keep:  submit gửi Nest `code` (HRM-ATT-SHIFT-KEY BE hiệu lực) · fallback chỉ khi empty ·
 *             cấm invent FE ATT-CODE HOLD · attendance_uat_ready=false · U65
 * SOLID:      Constants/helpers thuần SRP — UI bind display-ready từ BE, không join/công thức FE
 * solid_convention_ack: FE chỉ format nhãn; không bịa danh mục khi Nest có dữ liệu
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-att-shift-catalog-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-ATT-01-CLUSTER-FE-01
 * change_mode: UPGRADE
 * What: CNS empty = CTA admin (no bootstrap seed as SoT). WORK_SHIFT_BOOTSTRAP_FALLBACK retained
 *       as legacy constant only — ShiftChangeRequestTab MUST NOT use when EFF=0 (AC-ATT-01-EMPTY).
 * Why: UC-BP-ATT-01 · BA O5 · U65 zero-seed · R-ATT-01-CNS-FE
 * must_keep: active>0 submit Nest code · HRM-ATT-SHIFT-KEY · ≠ ATT-01 DONE · Nest /core 0
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-att-01-cluster-fe-01.md
 */

/** Option chuẩn cho picker đổi ca — value bind = `code` (Nest key). */
export interface WorkShiftPickerOption {
  /** Nest work_shifts.code — dùng làm value + submit (KEY assert). */
  code: string;
  /** Nhãn hiển thị (Nest name hoặc fallback i18n). */
  name: string;
  /** Khung giờ "HH:MM - HH:MM" để hiển thị + lưu current/requested_shift_time. */
  time: string;
}

/** Row tối thiểu cần để map (subset của effective record). */
export interface WorkShiftEffectiveLike {
  code?: string | null;
  name?: string | null;
  start_time?: string | null;
  end_time?: string | null;
}

/**
 * Bootstrap fallback — LEGACY only (pre ATT-01 empty CTA).
 * CNS Đổi ca MUST NOT use when EFF=0 — show CTA to Danh sách ca instead (U65 · AC-ATT-01-EMPTY).
 * Kept for label resolve of historical stored codes only — NOT SoT, NOT seed.
 */
export interface WorkShiftBootstrapFallbackItem {
  code: string;
  i18nKey: string;
  time: string;
}

/** @deprecated ATT-01 — do not use as CNS picker SoT when EFF empty; empty CTA instead. */
export const WORK_SHIFT_BOOTSTRAP_FALLBACK: readonly WorkShiftBootstrapFallbackItem[] = [
  { code: 'morning', i18nKey: 'shiftChange.shifts.morning', time: '06:00 - 14:00' },
  { code: 'afternoon', i18nKey: 'shiftChange.shifts.afternoon', time: '14:00 - 22:00' },
  { code: 'night', i18nKey: 'shiftChange.shifts.night', time: '22:00 - 06:00' },
  { code: 'office', i18nKey: 'shiftChange.shifts.office', time: '08:00 - 17:00' },
  { code: 'flexible', i18nKey: 'shiftChange.shifts.flexible', time: '09:00 - 18:00' },
] as const;

/** Honesty — FE không flip UAT attendance từ slice này. */
export const WORK_SHIFT_UAT_HONESTY = false;

/** Ghép khung giờ hiển thị từ start/end (an toàn khi thiếu). */
export function formatWorkShiftTime(
  startTime: string | null | undefined,
  endTime: string | null | undefined,
): string {
  const start = (startTime ?? '').trim();
  const end = (endTime ?? '').trim();
  if (start && end) return `${start} - ${end}`;
  return start || end || '';
}

/** Map một effective row → picker option (value = code, không invent). */
export function workShiftToPickerOption(row: WorkShiftEffectiveLike): WorkShiftPickerOption {
  const code = String(row.code ?? '').trim();
  const name = String(row.name ?? '').trim() || code;
  return { code, name, time: formatWorkShiftTime(row.start_time, row.end_time) };
}

/** Map danh sách effective rows → options (bỏ row thiếu code). */
export function workShiftsToPickerOptions(
  rows: readonly WorkShiftEffectiveLike[],
): WorkShiftPickerOption[] {
  return rows.map(workShiftToPickerOption).filter((o) => Boolean(o.code));
}

/**
 * Resolve nhãn hiển thị từ giá trị đã lưu (code Nest hoặc nhãn legacy).
 * Ưu tiên khớp code → trả name; không khớp → trả nguyên giá trị đã lưu (không invent).
 */
export function resolveWorkShiftLabel(
  options: readonly WorkShiftPickerOption[],
  codeOrValue: string | null | undefined,
): string {
  const raw = (codeOrValue ?? '').trim();
  if (!raw) return '—';
  const hit = options.find((o) => o.code.toLowerCase() === raw.toLowerCase());
  return hit ? hit.name : raw;
}
