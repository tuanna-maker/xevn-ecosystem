import {
  eachDayOfInterval,
  endOfWeek,
  format,
  parseISO,
  startOfWeek,
} from 'date-fns';
import { vi } from 'date-fns/locale';
import type { HrmAttendanceRecord } from '@/integrations/hrmApi';

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

export function resolveWeeklyDateRange(
  sheet?: { start_date: string; end_date: string } | null,
  anchor = new Date(),
): { from: string; to: string; days: Date[] } {
  if (sheet?.start_date && sheet?.end_date) {
    const start = parseISO(sheet.start_date);
    const end = parseISO(sheet.end_date);
    const days = eachDayOfInterval({ start, end }).slice(0, 7);
    return {
      from: sheet.start_date,
      to: sheet.end_date,
      days,
    };
  }

  const weekStart = startOfWeek(anchor, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(anchor, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd }).slice(0, 7);
  return {
    from: format(weekStart, 'yyyy-MM-dd'),
    to: format(weekEnd, 'yyyy-MM-dd'),
    days,
  };
}

export function formatWeeklyRangeSubtitle(from: string, to: string): string {
  const start = parseISO(from);
  const end = parseISO(to);
  return `(${format(start, 'dd/MM/yyyy')} - ${format(end, 'dd/MM/yyyy')})`;
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
  const key = DAY_LABEL_KEYS[date.getDay()];
  const fallback = format(date, 'EEEE', { locale: vi });
  return t ? t(`common.weekDays.${key}`, fallback) : fallback;
}

function recordToShift(record: HrmAttendanceRecord): WeeklyShiftCell {
  if (record.status === 'leave') {
    return { name: 'Nghỉ phép', type: 'leave' };
  }
  if (record.status === 'absent') {
    return { name: 'Vắng mặt', type: 'leave' };
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
  const dayKeys = range.days.map((day) => format(day, 'yyyy-MM-dd'));
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
        days: range.days.map((day) => ({
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

    return {
      id: record.id,
      attendanceCode: String(index + 1),
      employeeCode: employee?.employee_code ?? '—',
      name: employee?.full_name ?? record.employee_id,
      position: employee?.position ?? '—',
      unit: resolveAttendanceUnitLabel(employee?.department, operatingUnitLabels) ?? '—',
      date: format(parseISO(record.attendance_date), 'dd/MM/yyyy'),
      time,
    };
  });
}
