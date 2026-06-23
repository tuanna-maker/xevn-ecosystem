import { describe, expect, it } from 'vitest';
import {
  buildAttendanceMarkedDates,
  filterRowsByDate,
  monthIsoBounds,
  resolveAttendanceDayMarkerColor,
  toIsoDateLocal,
} from '../attendanceCalendarMarkers';
import { colors } from '../../theme/tokens';

describe('resolveAttendanceDayMarkerColor', () => {
  it('maps badge kinds to SET F-4 token colors', () => {
    expect(resolveAttendanceDayMarkerColor('on_time')).toBe(colors.success);
    expect(resolveAttendanceDayMarkerColor('late')).toBe(colors.warning);
    expect(resolveAttendanceDayMarkerColor('absent')).toBe(colors.danger);
    expect(resolveAttendanceDayMarkerColor('leave')).toBe(colors.info);
  });
});

describe('monthIsoBounds', () => {
  it('returns first and last day of month', () => {
    expect(monthIsoBounds(2026, 6)).toEqual({ from: '2026-06-01', to: '2026-06-30' });
    expect(monthIsoBounds(2026, 2)).toEqual({ from: '2026-02-01', to: '2026-02-28' });
  });
});

describe('buildAttendanceMarkedDates', () => {
  it('colors days from API status via timeline badge mapper', () => {
    const marked = buildAttendanceMarkedDates(
      [
        { attendance_date: '2026-06-08', status: 'present' },
        { attendance_date: '2026-06-09', status: 'late' },
        { attendance_date: '2026-06-10', status: 'absent' },
      ],
      { today: '2026-06-08', selectedDate: '2026-06-09' },
    );
    expect(marked['2026-06-08']?.customStyles?.container?.backgroundColor).toBe(colors.success);
    expect(marked['2026-06-09']?.customStyles?.container?.backgroundColor).toBe(colors.warning);
    expect(marked['2026-06-10']?.customStyles?.container?.backgroundColor).toBe(colors.danger);
    expect(marked['2026-06-09']?.customStyles?.container?.borderColor).toBe(colors.primary);
  });

  it('highlights today with primary ring when no record', () => {
    const marked = buildAttendanceMarkedDates([], { today: '2026-06-08' });
    expect(marked['2026-06-08']?.customStyles?.container?.borderColor).toBe(colors.primary);
  });
});

describe('filterRowsByDate', () => {
  it('returns rows matching tapped day', () => {
    const rows = [
      { id: '1', attendance_date: '2026-06-08', status: 'present' },
      { id: '2', attendance_date: '2026-06-09', status: 'late' },
    ];
    expect(filterRowsByDate(rows, '2026-06-09')).toEqual([rows[1]]);
    expect(filterRowsByDate(rows, null)).toEqual(rows);
  });
});

describe('toIsoDateLocal', () => {
  it('formats local date without timezone drift', () => {
    expect(toIsoDateLocal(new Date(2026, 5, 8))).toBe('2026-06-08');
  });
});
