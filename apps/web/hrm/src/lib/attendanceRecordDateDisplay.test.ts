import { describe, expect, it } from 'vitest';
import { formatAttendanceRecordDateDisplay } from './attendanceRecordDateDisplay';

describe('formatAttendanceRecordDateDisplay', () => {
  it('formats yyyy-MM-dd attendance_date', () => {
    expect(formatAttendanceRecordDateDisplay('2026-08-04')).toBe('04/08/2026');
  });

  it('formats ISO datetime attendance_date via date prefix', () => {
    expect(formatAttendanceRecordDateDisplay('2026-08-04T00:00:00.000Z')).toBe('04/08/2026');
  });

  it('does not throw on locale garbage «Tue Aug 04» (QA crash repro)', () => {
    expect(() =>
      formatAttendanceRecordDateDisplay('Tue Aug 04', null),
    ).not.toThrow();
    expect(formatAttendanceRecordDateDisplay('Tue Aug 04', null)).toBe('—');
  });

  it('falls back to check_in_at ISO when attendance_date is locale garbage', () => {
    expect(
      formatAttendanceRecordDateDisplay('Tue Aug 04', '2026-08-04T01:30:00.000Z'),
    ).toBe('04/08/2026');
  });

  it('does not throw when concatenating T00:00:00 would crash date-fns format', () => {
    // Former crash: format(new Date(attendance_date + 'T00:00:00'), 'dd/MM/yyyy')
    const bad = 'Tue Aug 04';
    expect(Number.isNaN(new Date(`${bad}T00:00:00`).getTime())).toBe(true);
    expect(formatAttendanceRecordDateDisplay(bad, '2026-08-04T08:00:00+07:00')).toBe(
      '04/08/2026',
    );
  });

  it('returns em dash for empty / null', () => {
    expect(formatAttendanceRecordDateDisplay(null)).toBe('—');
    expect(formatAttendanceRecordDateDisplay(undefined)).toBe('—');
    expect(formatAttendanceRecordDateDisplay('')).toBe('—');
    expect(formatAttendanceRecordDateDisplay('   ', null)).toBe('—');
  });
});
