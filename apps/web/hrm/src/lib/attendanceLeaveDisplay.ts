/**
 * @CODE-MEMORY
 * Screen: HRM Chấm công → Weekly grid + Bản ghi (records table)
 * UC: AC-ATT-LV-SHEET-01 · FR-UC-BP-ATT-10 «Công nghỉ phép»
 * BR: INV-4 storm · OS 28 display-ready
 * SRS: docs/program/specs/PO-HRM-ATT-LEAVE-FUNNEL-SPEC-01.md §4 F-ATT-LEAVE-FUNNEL-03 · §6–§7
 * TechSpec: GET /attendance/records EXPAND status_label · leave_type_label (BE-01)
 * Purpose: Bind leave display labels từ records DTO — không GET leave-requests, không poll thêm.
 * WorkItem: PO-HRM-ATT-LEAVE-FUNNEL-FE-01
 * Coded: 2026-08-06
 * Callers: attendanceDashboardAggregator.recordToShift · AttendanceRecordsTable.getStatusBadge · toUiRecord
 * Callees: none (pure)
 * must_keep: J-HRM-06b ≤2 GET/10s · no Option C FE leave join · WAIVE_L2 · attendance_uat_ready=false
 * Impact: Hardcode «Nghỉ phép» bỏ status_label → AC-ATT-LV-SHEET-01 FAIL / type label mất
 * LastVerified: attendanceLeaveDisplay.test.ts
 */

export type AttendanceLeaveDisplaySource = {
  status?: string | null;
  status_label?: string | null;
  leave_type_label?: string | null;
};

const FALLBACK_LEAVE_STATUS = 'Nghỉ phép';

/**
 * Weekly cell + Bản ghi badge label when status=leave.
 * Prefer BE status_label; append leave_type_label when distinct (OS 28 — no FE catalog join).
 */
export function resolveAttendanceLeaveDisplayLabel(
  record: AttendanceLeaveDisplaySource,
  fallbackStatusLabel?: string,
): string {
  const status = (record.status ?? '').trim().toLowerCase();
  if (status !== 'leave' && status !== 'on_leave') {
    const generic = record.status_label?.trim();
    return generic || fallbackStatusLabel || (record.status ?? '') || '—';
  }

  const statusLabel =
    record.status_label?.trim() || fallbackStatusLabel?.trim() || FALLBACK_LEAVE_STATUS;
  const typeLabel = record.leave_type_label?.trim() || '';
  if (typeLabel && typeLabel !== statusLabel) {
    return `${statusLabel} · ${typeLabel}`;
  }
  return typeLabel || statusLabel;
}

/** True when record is a leave funnel day marker (status leave / on_leave alias or catalog leave key). */
export function isAttendanceLeaveStatus(
  status: string | null | undefined,
  record?: { leave_request_id?: string | null }
): boolean {
  const s = (status ?? '').trim().toLowerCase();
  if (
    s === 'leave' ||
    s === 'on_leave' ||
    s === 'an' ||
    s === 'om' ||
    s === 'ts' ||
    s === 'tt' ||
    s === 'kl' ||
    s === 'nb' ||
    s === 'dt'
  ) {
    return true;
  }
  return !!record?.leave_request_id;
}
