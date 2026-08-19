/**
 * @CODE-MEMORY
 * Screen: HRM → Chấm công → Dữ liệu chấm công → Dialog «Chỉnh sửa»
 * UC: HRM-AT-03 · matrix #13 edit · J-HRM-06
 * Purpose: Hiển thị ngày bản ghi an toàn — không throw RangeError khi API trả
 *          attendance_date dạng «Tue Aug 04» thay vì yyyy-MM-dd.
 * WorkItem: PO-MFD-M2-ATT-RECORDS-EDIT-01-R2-FE
 * Coded: 2026-08-04
 * Callers: AttendanceRecordsTable edit Dialog
 * Callees: formatDisplayDate (@xevn/ui)
 * must_keep: never throw; «—» khi không parse được; ưu tiên yyyy-MM-dd rồi check_in_at ISO
 * Note: BE nên normalize attendance_date → yyyy-MM-dd trong list DTO (không sửa BE ở wave này)
 * LastVerified: attendanceRecordDateDisplay.test.ts
 */

import { formatDisplayDate } from '@/lib/formatDisplayDate';

const ISO_DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const ISO_DATE_PREFIX = /^(\d{4}-\d{2}-\d{2})/;

function dateOnlyFromIsoLike(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = String(value).trim();
  if (!trimmed) return null;
  if (ISO_DATE_ONLY.test(trimmed)) return trimmed;
  const prefix = ISO_DATE_PREFIX.exec(trimmed);
  return prefix ? prefix[1] : null;
}

/**
 * Safe dd/MM/yyyy for attendance edit/list display.
 * Never throws — rejects ambiguous locale strings (e.g. «Tue Aug 04») unless
 * check_in_at (or ISO attendance_date) supplies a real calendar date.
 */
export function formatAttendanceRecordDateDisplay(
  attendanceDate: string | null | undefined,
  checkInAt?: string | null,
): string {
  try {
    const fromAttendance = dateOnlyFromIsoLike(attendanceDate);
    if (fromAttendance) {
      const label = formatDisplayDate(fromAttendance);
      if (label !== '—') return label;
    }

    const fromCheckIn = dateOnlyFromIsoLike(checkInAt);
    if (fromCheckIn) {
      const label = formatDisplayDate(fromCheckIn);
      if (label !== '—') return label;
    }

    // Last resort: full ISO datetime on check_in_at (timezone-aware parse in formatDisplayDate)
    if (checkInAt && String(checkInAt).includes('T')) {
      const label = formatDisplayDate(checkInAt, 'dd/MM/yyyy');
      if (label !== '—') return label;
    }

    return '—';
  } catch {
    return '—';
  }
}
