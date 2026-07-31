/**
 * @CODE-MEMORY
 * Screen:     Attendance update / manager cards — update_type
 * UC:         MOB-UX-15d · M-F-07 · AC-U72-MOB-GLOBAL
 * BR:         U72
 * SRS:        d-mob-u72-label-scan-01 §3 M-F-07
 * TechSpec:   display-label-no-raw-key.mdc
 * Purpose:    Map API update_type → VI; unknown wire token → «—» (cấm snake→spaces English).
 * WorkItem:   D-MOB-U72-LABEL-FE-01
 * Coded:      2026-07-27
 * Callers:    ManagerApprovals · profileTask · UpdateRequests
 * Callees:    (none)
 * must_keep:  check_in_out / both → Giờ vào và ra; seed:/HRM- → Chỉnh sửa chấm công
 * LastVerified: utils/__tests__/attendanceUpdateTypes.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-07-27
 * WorkItem: D-MOB-U72-LABEL-FE-01
 * change_mode: FIX
 * What: Unknown wire update_type → «—» (was underscore→space)
 * Why: U72 M-F-07
 * must_keep: known ATTENDANCE_CHANGE_TYPE_VI; U65 · HOLD_DEPLOY
 */

/** Vietnamese labels for attendance update / change types — MOB-UX-15d. */
const ATTENDANCE_CHANGE_TYPE_VI: Record<string, string> = {
  check_in: 'Giờ vào',
  check_out: 'Giờ ra',
  check_in_out: 'Giờ vào và ra',
  both: 'Giờ vào và ra',
  break: 'Nghỉ giữa ca',
  forgot_check: 'Quên chấm công',
  forgot_check_in: 'Quên giờ vào',
  forgot_check_out: 'Quên giờ ra',
  in: 'Giờ vào',
  out: 'Giờ ra',
};

const EM_DASH = '—';

function looksLikeWireToken(raw: string): boolean {
  return /^[a-z][a-z0-9_]*$/i.test(raw);
}

/** Map API `update_type` / seed tokens to user-facing Vietnamese. */
export function resolveAttendanceChangeTypeVi(updateType: string | null | undefined): string {
  const raw = updateType?.trim() ?? '';
  if (!raw) return 'Chỉnh sửa chấm công';

  const key = raw.toLowerCase();
  const mapped = ATTENDANCE_CHANGE_TYPE_VI[key];
  if (mapped) return mapped;

  if (key.includes('seed:') || key.startsWith('hrm-')) return 'Chỉnh sửa chấm công';

  // Localized / human copy (spaces or non-ASCII) — keep.
  if (!looksLikeWireToken(raw)) return raw;

  // Unknown English/snake wire token — never underscore→space.
  return EM_DASH;
}

/** Alias used by profile task card and manager attendance cards. */
export function resolveUpdateTypeLabel(updateType: string | null | undefined): string {
  return resolveAttendanceChangeTypeVi(updateType);
}
