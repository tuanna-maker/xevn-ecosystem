/**
 * @CODE-MEMORY
 * Screen:     HRM /hr/... Chấm công — weekly summary + records table
 * Purpose:    Aggregate attendance API rows into weekly grid / table; safe VI date labels.
 * WorkItem:   D-HRM-ATT-INVALID-DATE-01
 * Coded:      2026-07-20
 * SRS:        docs/program/UX_VI_DATE_NUMBER_FORMAT_AC.md · BR-UX-DATE-*
 * must_keep:  null/invalid sheet/API dates → «—» / fallback week; never format() on Invalid Date
 * LastVerified: attendanceDashboardAggregator.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-07-20
 * WorkItem: D-HRM-ATT-INVALID-DATE-01
 * change_mode: UPGRADE
 * What: Guard resolveWeeklyDateRange, formatWeeklyRangeSubtitle, weekly title labels, table date cells
 * Why: Sponsor RangeError Invalid time value at Attendance renderWeeklyAttendance (format on bad from/to)
 *
 * @CODE-MEMORY-CHANGE 2026-07-21
 * WorkItem: D-HRM-ATT-SHEET-EMPTY-RELOAD-LOOP-01
 * change_mode: UPGRADE
 * What: resolveWeeklyDateRange — prefer current week clipped to sheet; align from/to with displayed days
 * Why: Month sheet fetched full period but grid only first 7 days → empty grid despite records 200
 *
 * @CODE-MEMORY-CHANGE 2026-08-06
 * WorkItem: PO-HRM-ATT-LEAVE-FUNNEL-FE-01
 * change_mode: ADD
 * What: recordToShift + mapAttendanceRecordsToTableRows bind status_label / leave_type_label when status=leave
 * Why: F-ATT-LEAVE-FUNNEL-03 — AC-ATT-LV-SHEET-01 weekly/Bản ghi thấy phép từ GET records (no Option C leave join)
 * must_keep: J-HRM-06b no extra poll; 06c sign; empty honesty; WAIVE_L2; attendance_uat_ready=false
 */

import {
  eachDayOfInterval,
  endOfWeek,
  format,
  isValid,
  parseISO,
  startOfWeek,
} from 'date-fns';
import { vi } from 'date-fns/locale';
import { formatDisplayDate } from '@/lib/formatDisplayDate';
import {
  isAttendanceLeaveStatus,
  resolveAttendanceLeaveDisplayLabel,
} from '@/lib/attendanceLeaveDisplay';
import type { HrmAttendanceRecord } from '@/integrations/hrmApi';

function isValidDate(value: Date): boolean {
  return isValid(value) && !Number.isNaN(value.getTime());
}

function parseSheetBoundary(raw: string): Date | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  // Prefer ISO date-only; parseISO('yyyy-MM-dd') is local midnight in date-fns
  const parsed = /^\d{4}-\d{2}-\d{2}/.test(trimmed)
    ? parseISO(trimmed.slice(0, 10))
    : new Date(trimmed);
  return isValidDate(parsed) ? parsed : null;
}

export type WeeklyShiftCell = {
  shift?: string;
  name?: string;
  status?: string;
  time?: string;
  type?: string;
};

export type WeeklyAttendanceDay = {
  dayLabel: string;
  date: string;
  dateIso: string;
  shifts: WeeklyShiftCell[];
};

export type WeeklyAttendanceRow = {
  id: string;
  name: string;
  code: string;
  department: string | null;
  days: WeeklyAttendanceDay[];
};

export type AttendanceRecordTableRow = {
  id: string;
  attendanceCode: string;
  employeeCode: string;
  name: string;
  position: string;
  unit: string;
  date: string;
  time: string;
  status: string;
  /** Display-ready from BE (F-ATT-LEAVE-FUNNEL-03). */
  status_label: string | null;
  leave_type_label: string | null;
  /** Combined leave cell/badge label when status=leave. */
  leave_display_label: string | null;
};

export type EmployeeLookup = {
  employee_code: string;
  full_name: string;
  department?: string | null;
  position?: string | null;
};

const DAY_LABEL_KEYS = ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'] as const;

function toTimeLabel(value?: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value.length >= 16 ? value.slice(11, 16) : value;
  }
  return format(date, 'HH:mm');
}

function buildTimeRange(checkIn?: string | null, checkOut?: string | null): string {
  const inTime = toTimeLabel(checkIn);
  const outTime = toTimeLabel(checkOut);
  if (inTime && outTime) return `${inTime} - ${outTime}`;
  if (inTime) return inTime;
  return '';
}

function currentWeekRange(anchor = new Date()): { from: string; to: string; days: Date[] } {
  const weekStart = startOfWeek(anchor, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(anchor, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd }).slice(0, 7);
  return {
    from: format(weekStart, 'yyyy-MM-dd'),
    to: format(weekEnd, 'yyyy-MM-dd'),
    days,
  };
}

function buildRangeFromDays(days: Date[]): { from: string; to: string; days: Date[] } | null {
  if (days.length === 0 || !days.every(isValidDate)) return null;
  const first = days[0]!;
  const last = days[days.length - 1]!;
  return {
    from: format(first, 'yyyy-MM-dd'),
    to: format(last, 'yyyy-MM-dd'),
    days,
  };
}

/**
 * Resolve the ≤7-day window for weekly grid + records GET.
 * Prefer the current calendar week clipped into the sheet period so mid-month
 * sheets are not stuck on the first week (empty grid while API returns later days).
 * When the anchor week is outside the sheet, fall back to the first ≤7 days of the sheet.
 * `from`/`to` always match displayed `days` (API filter aligned with columns).
 */
export function resolveWeeklyDateRange(
  sheet?: { start_date: string; end_date: string } | null,
  anchor = new Date(),
): { from: string; to: string; days: Date[] } {
  if (sheet?.start_date && sheet?.end_date) {
    const start = parseSheetBoundary(sheet.start_date);
    const end = parseSheetBoundary(sheet.end_date);
    if (start && end && start.getTime() <= end.getTime()) {
      try {
        const weekStart = startOfWeek(anchor, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(anchor, { weekStartsOn: 1 });
        const clippedStart = weekStart < start ? start : weekStart;
        const clippedEnd = weekEnd > end ? end : weekEnd;

        if (clippedStart.getTime() <= clippedEnd.getTime()) {
          const clipped = buildRangeFromDays(
            eachDayOfInterval({ start: clippedStart, end: clippedEnd }).slice(0, 7),
          );
          if (clipped) return clipped;
        }

        const firstWeek = buildRangeFromDays(
          eachDayOfInterval({ start, end }).slice(0, 7),
        );
        if (firstWeek) return firstWeek;
      } catch {
        // fall through to current week
      }
    }
  }

  return currentWeekRange(anchor);
}

/** Title labels for weekly view — never throws on bad API/period strings. */
export function formatWeeklyRangeTitleLabels(
  from: string | null | undefined,
  to: string | null | undefined,
): { start: string; end: string } {
  return {
    start: formatDisplayDate(from),
    end: formatDisplayDate(to),
  };
}

export function formatWeeklyRangeSubtitle(from: string, to: string): string {
  const { start, end } = formatWeeklyRangeTitleLabels(from, to);
  return `(${start} - ${end})`;
}

/** Fallback column headers when weekly API rows are empty — skip Invalid Date days. */
export function buildWeeklyDayHeaderFallback(
  days: Date[],
): Array<{ dayLabel: string; date: string }> {
  return days.filter(isValidDate).map((day) => ({
    dayLabel: format(day, 'EEEE', { locale: vi }),
    date: format(day, 'dd'),
  }));
}

export function formatOverviewYearSubtitle(year: number): string {
  return `(01/01/${year} - 31/12/${year})`;
}

export function sumLeaveTypeValues(
  rows: Array<{ value: number }>,
): number {
  return rows.reduce((sum, row) => sum + (row.value || 0), 0);
}

/** Resolve department or operating slug to live display label (G-INT-02). */
export function resolveAttendanceUnitLabel(
  raw: string | null | undefined,
  operatingUnitLabels?: Map<string, string>,
): string | null {
  const trimmed = raw?.trim();
  if (!trimmed) return null;
  return operatingUnitLabels?.get(trimmed) ?? trimmed;
}

function dayLabelFor(date: Date, t?: (key: string, fallback?: string) => string): string {
  if (!isValidDate(date)) return '—';
  const key = DAY_LABEL_KEYS[date.getDay()];
  const fallback = format(date, 'EEEE', { locale: vi });
  return t ? t(`common.weekDays.${key}`, fallback) : fallback;
}

function recordToShift(record: HrmAttendanceRecord): WeeklyShiftCell {
  if (isAttendanceLeaveStatus(record.status, record)) {
    return {
      name: resolveAttendanceLeaveDisplayLabel(record),
      type: 'leave',
      status: 'leave',
    };
  }
  if (record.status === 'absent' || record.status === 'x') {
    return {
      name: record.status_label?.trim() || 'Vắng mặt',
      type: 'leave',
      status: 'absent',
    };
  }

  const time = buildTimeRange(record.check_in_at, record.check_out_at);
  const checkInMinutes = record.check_in_at ? toMinutes(record.check_in_at) : null;
  const status =
    checkInMinutes != null && checkInMinutes > 8 * 60 + 5 ? 'late' : 'full';

  return {
    shift: 'HC',
    status,
    time,
  };
}

function toMinutes(value: string): number | null {
  const time = toTimeLabel(value);
  if (!time.includes(':')) return null;
  const [h, m] = time.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

export function buildWeeklyAttendanceRows(
  records: HrmAttendanceRecord[],
  employeesById: Map<string, EmployeeLookup>,
  range: { days: Date[] },
  t?: (key: string, fallback?: string) => string,
  operatingUnitLabels?: Map<string, string>,
): WeeklyAttendanceRow[] {
  const validDays = range.days.filter(isValidDate);
  const dayKeys = validDays.map((day) => format(day, 'yyyy-MM-dd'));
  const rowsByEmployee = new Map<string, WeeklyAttendanceRow>();

  for (const record of records) {
    const dayIndex = dayKeys.indexOf(record.attendance_date);
    if (dayIndex < 0) continue;

    const employee = employeesById.get(record.employee_id);
    if (!rowsByEmployee.has(record.employee_id)) {
      rowsByEmployee.set(record.employee_id, {
        id: record.employee_id,
        name: employee?.full_name ?? record.employee_id,
        code: employee?.employee_code ?? '—',
        department: resolveAttendanceUnitLabel(employee?.department, operatingUnitLabels),
        days: validDays.map((day) => ({
          dayLabel: dayLabelFor(day, t),
          date: format(day, 'dd'),
          dateIso: format(day, 'yyyy-MM-dd'),
          shifts: [],
        })),
      });
    }

    const row = rowsByEmployee.get(record.employee_id)!;
    row.days[dayIndex].shifts.push(recordToShift(record));
  }

  return Array.from(rowsByEmployee.values()).sort((a, b) =>
    a.name.localeCompare(b.name, 'vi'),
  );
}

export function mapAttendanceRecordsToTableRows(
  records: HrmAttendanceRecord[],
  employeesById: Map<string, EmployeeLookup>,
  operatingUnitLabels?: Map<string, string>,
): AttendanceRecordTableRow[] {
  return records.map((record, index) => {
    const employee = employeesById.get(record.employee_id);
    const checkIn = toTimeLabel(record.check_in_at);
    const checkOut = toTimeLabel(record.check_out_at);
    const time = checkOut ? `${checkIn || '--:--'} - ${checkOut}` : checkIn || '--:--';

    const leaveDisplay = isAttendanceLeaveStatus(record.status, record)
      ? resolveAttendanceLeaveDisplayLabel(record)
      : null;

    return {
      id: record.id,
      attendanceCode: String(index + 1),
      employeeCode: employee?.employee_code ?? '—',
      name: employee?.full_name ?? record.employee_id,
      position: employee?.position ?? '—',
      unit: resolveAttendanceUnitLabel(employee?.department, operatingUnitLabels) ?? '—',
      date: formatDisplayDate(record.attendance_date),
      time,
      status: record.status,
      status_label: record.status_label?.trim() || null,
      leave_type_label: record.leave_type_label?.trim() || null,
      leave_display_label: leaveDisplay,
    };
  });
}
