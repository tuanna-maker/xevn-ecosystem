import type { MarkedDates } from 'react-native-calendars/src/types';
import { colors } from '../theme/tokens';
import {
  resolveAttendanceTimelineBadge,
  type AttendanceTimelineBadgeKind,
  type AttendanceTimelineRow,
} from './attendanceTimelineBadge';

export type AttendanceCalendarRow = AttendanceTimelineRow & {
  id?: string;
  attendance_date: string;
};

/** SET F-4 / AC-UI-CAL-02 — marker fill from API status via timeline badge mapper. */
export function resolveAttendanceDayMarkerColor(kind: AttendanceTimelineBadgeKind): string {
  switch (kind) {
    case 'on_time':
      return colors.success;
    case 'late':
      return colors.warning;
    case 'absent':
      return colors.danger;
    case 'leave':
      return colors.info;
    default:
      return colors.neutral;
  }
}

export function toIsoDateLocal(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** First/last ISO date for calendar month (month 1–12). */
export function monthIsoBounds(year: number, month: number): { from: string; to: string } {
  const fromDate = new Date(year, month - 1, 1);
  const toDate = new Date(year, month, 0);
  return { from: toIsoDateLocal(fromDate), to: toIsoDateLocal(toDate) };
}

export function parseYearMonth(isoMonth: string): { year: number; month: number } {
  const [y, m] = isoMonth.split('-').map(Number);
  return { year: y, month: m };
}

/**
 * Builds react-native-calendars `markedDates` with custom day fills.
 * Selected day gets primary ring; today gets primary border when not selected.
 */
export function buildAttendanceMarkedDates(
  rows: AttendanceCalendarRow[],
  options?: { selectedDate?: string | null; today?: string },
): MarkedDates {
  const today = options?.today ?? toIsoDateLocal(new Date());
  const selected = options?.selectedDate?.trim() || null;
  const marked: MarkedDates = {};

  for (const row of rows) {
    const dateKey = row.attendance_date?.slice(0, 10);
    if (!dateKey || !/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) continue;
    const badge = resolveAttendanceTimelineBadge(row);
    const fill = resolveAttendanceDayMarkerColor(badge.kind);
    const isSelected = selected === dateKey;
    const isToday = today === dateKey;

    marked[dateKey] = {
      customStyles: {
        container: {
          backgroundColor: fill,
          borderRadius: 18,
          borderWidth: isSelected || isToday ? 2 : 0,
          borderColor: isSelected ? colors.primary : isToday ? colors.primary : 'transparent',
        },
        text: {
          color: '#FFFFFF',
          fontWeight: '600',
        },
      },
    };
  }

  if (selected && !marked[selected]) {
    marked[selected] = {
      customStyles: {
        container: {
          backgroundColor: colors.surface,
          borderRadius: 18,
          borderWidth: 2,
          borderColor: colors.primary,
        },
        text: {
          color: colors.text,
          fontWeight: '600',
        },
      },
    };
  }

  if (!selected && today && !marked[today]) {
    marked[today] = {
      customStyles: {
        container: {
          backgroundColor: colors.surface,
          borderRadius: 18,
          borderWidth: 2,
          borderColor: colors.primary,
        },
        text: {
          color: colors.primary,
          fontWeight: '700',
        },
      },
    };
  }

  return marked;
}

export function filterRowsByDate<T extends { attendance_date: string }>(
  rows: T[],
  dateKey: string | null | undefined,
): T[] {
  if (!dateKey) return rows;
  return rows.filter((r) => r.attendance_date.slice(0, 10) === dateKey);
}
