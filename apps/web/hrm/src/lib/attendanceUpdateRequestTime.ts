/**
 * @CODE-MEMORY
 * Screen:     /hr/attendance → Quản lý đơn → Đề nghị cập nhật công → Thêm đề nghị
 * UC:         UC-HRM-09 · FN-REQ-UPD-CRUD · HIM §5.5 · TC-HIM-ATT-TMDV-HP-001
 * BR:         BE attendance_update_requests.requested_check_in/out = TIMESTAMPTZ
 * SRS:        docs/hrm/SRS.md § attendance update requests
 * TechSpec:   POST /api/hrm/attendance/update-requests · CreateAttendanceUpdateRequestDto
 * Purpose:    Ghép attendance_date + HH:mm (ô type=time) thành ISO timestamptz trước POST —
 *             tránh 500 HRM-SYS-001 khi Postgres nhận "08:00". Hiển thị form vẫn HH:mm;
 *             ngày UI vẫn dd/MM/yyyy.
 * WorkItem:   U78-U84-ATT-ADJ-TMDV-TIME-WIRE-01
 * Coded:      2026-08-04
 * Callers:    AttendanceUpdateRequestTab → handleAddRequest
 * Callees:    none (pure)
 * must_keep:  leave submit times; list/approve flows; không silent swallow 500
 * SOLID:      tách compose khỏi tab — test được, không đụng approve/list
 * LastVerified: attendanceUpdateRequestTime.test.ts
 */

const HHMM_RE = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/;
const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})/;
const ISO_DATETIME_RE = /^\d{4}-\d{2}-\d{2}T/;

function toYmd(attendanceDate: string | Date): string | null {
  if (attendanceDate instanceof Date) {
    if (!Number.isFinite(attendanceDate.getTime())) return null;
    const y = attendanceDate.getFullYear();
    const m = String(attendanceDate.getMonth() + 1).padStart(2, '0');
    const d = String(attendanceDate.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  const match = ISO_DATE_RE.exec(String(attendanceDate).trim());
  if (!match) return null;
  return `${match[1]}-${match[2]}-${match[3]}`;
}

/**
 * Compose calendar day + wall-clock HH:mm → ISO string for TIMESTAMPTZ columns.
 * Interprets HH:mm in the browser local timezone (vi-VN operators).
 * Passes through values that already look like ISO datetimes.
 */
export function composeAttendanceDateTimeIso(
  attendanceDate: string | Date,
  hhmm: string | null | undefined,
): string | undefined {
  const trimmed = hhmm?.trim();
  if (!trimmed) return undefined;

  if (ISO_DATETIME_RE.test(trimmed)) {
    const parsed = new Date(trimmed);
    if (!Number.isFinite(parsed.getTime())) return undefined;
    return parsed.toISOString();
  }

  const timeMatch = HHMM_RE.exec(trimmed);
  if (!timeMatch) return undefined;

  const ymd = toYmd(attendanceDate);
  if (!ymd) return undefined;

  const hh = Number(timeMatch[1]);
  const mm = Number(timeMatch[2]);
  const ss = Number(timeMatch[3] ?? '0');
  if (hh > 23 || mm > 59 || ss > 59) return undefined;

  const [y, mo, da] = ymd.split('-').map(Number);
  const local = new Date(y, mo - 1, da, hh, mm, ss, 0);
  if (!Number.isFinite(local.getTime())) return undefined;
  return local.toISOString();
}

export type AttendanceUpdateTimePayload = {
  requested_check_in?: string;
  requested_check_out?: string;
};

/** Build requested_* fields for create payload (omit side by update_type). */
export function buildAttendanceUpdateRequestTimeFields(args: {
  attendanceDate: string | Date;
  updateType: string;
  requestedCheckIn?: string;
  requestedCheckOut?: string;
}): AttendanceUpdateTimePayload {
  const out: AttendanceUpdateTimePayload = {};
  if (args.updateType !== 'check_out') {
    const checkIn = composeAttendanceDateTimeIso(args.attendanceDate, args.requestedCheckIn);
    if (checkIn) out.requested_check_in = checkIn;
  }
  if (args.updateType !== 'check_in') {
    const checkOut = composeAttendanceDateTimeIso(args.attendanceDate, args.requestedCheckOut);
    if (checkOut) out.requested_check_out = checkOut;
  }
  return out;
}

/** List/detail display — keep HH:mm for operators; never show raw epoch junk. */
export function formatAttendanceRequestedTimeDisplay(value: string | null | undefined): string {
  const trimmed = value?.trim();
  if (!trimmed) return '—';
  if (HHMM_RE.test(trimmed) && !trimmed.includes('T')) {
    const m = HHMM_RE.exec(trimmed);
    if (!m) return trimmed;
    return `${m[1].padStart(2, '0')}:${m[2]}`;
  }
  const d = new Date(trimmed);
  if (!Number.isFinite(d.getTime())) return '—';
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
