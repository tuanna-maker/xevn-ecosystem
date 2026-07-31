/**
 * @CODE-MEMORY
 * Screen:     Attendance history timeline pills
 * UC:         ZenHR Z-P09 / J-MOB-35 · M-F-08 · AC-U72-MOB-GLOBAL
 * BR:         U72
 * SRS:        d-mob-u72-label-scan-01 §3 M-F-08
 * TechSpec:   display-label-no-raw-key.mdc
 * Purpose:    Map attendance row status → Đúng giờ / Đi muộn / Vắng / Nghỉ; unknown → «—».
 * WorkItem:   D-MOB-U72-LABEL-FE-01
 * Coded:      2026-07-27
 * Callers:    AttendanceHistoryScreen
 * Callees:    StatusTone tokens
 * must_keep:  present/late/absent/leave known maps; pending+check_in → late
 * LastVerified: utils/__tests__/attendanceTimelineBadge.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-07-27
 * WorkItem: D-MOB-U72-LABEL-FE-01
 * change_mode: FIX
 * What: Unknown attendance status → label «—» + neutral tone (was raw)
 * Why: U72 M-F-08
 * must_keep: known timeline kinds; U65 · HOLD_DEPLOY
 */

import type { StatusTone } from '../theme/tokens';

/** ZenHR Z-P09 / J-MOB-35 — timeline badge kinds for attendance history rows. */
export type AttendanceTimelineBadgeKind = 'on_time' | 'late' | 'absent' | 'leave';

export type AttendanceTimelineBadge = {
  kind: AttendanceTimelineBadgeKind;
  label: string;
  tone: StatusTone;
  /** Status key passed to StatusBadge (tone/label override raw API text). */
  status: string;
};

export type AttendanceTimelineRow = {
  status?: string | null;
  check_in_at?: string | null;
  attendance_date?: string | null;
};

const EM_DASH = '—';

/**
 * Maps HRM attendance record status to ZenHR-style timeline pill (Đúng giờ / Đi muộn / Vắng mặt).
 * Aligns with dashboardEss late detection: pending + check_in_at → late.
 */
export function resolveAttendanceTimelineBadge(row: AttendanceTimelineRow): AttendanceTimelineBadge {
  const raw = row.status?.trim().toLowerCase() ?? '';

  if (raw === 'late' || raw === 'early_leave' || raw === 'early') {
    return { kind: 'late', label: 'Đi muộn', tone: 'warning', status: 'late' };
  }
  if (raw === 'absent') {
    return { kind: 'absent', label: 'Vắng mặt', tone: 'danger', status: 'absent' };
  }
  if (raw === 'present' || raw === 'approved' || raw === 'ok') {
    return { kind: 'on_time', label: 'Đúng giờ', tone: 'success', status: 'present' };
  }
  if (raw === 'leave' || raw === 'on_leave') {
    return { kind: 'leave', label: 'Nghỉ phép', tone: 'info', status: 'leave' };
  }
  if (raw === 'pending') {
    if (row.check_in_at?.trim()) {
      return { kind: 'late', label: 'Đi muộn', tone: 'warning', status: 'late' };
    }
    return { kind: 'absent', label: 'Vắng mặt', tone: 'danger', status: 'absent' };
  }

  if (!raw) {
    return { kind: 'absent', label: 'Vắng mặt', tone: 'danger', status: 'absent' };
  }

  return { kind: 'on_time', label: EM_DASH, tone: 'neutral', status: 'draft' };
}
