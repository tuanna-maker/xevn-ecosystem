import { describe, expect, it } from 'vitest';
import {
  buildWeeklyAttendanceRows,
  buildWeeklyDayHeaderFallback,
  formatOverviewYearSubtitle,
  formatWeeklyRangeSubtitle,
  formatWeeklyRangeTitleLabels,
  mapAttendanceRecordsToTableRows,
  resolveAttendanceUnitLabel,
  resolveWeeklyDateRange,
  sumLeaveTypeValues,
} from './attendanceDashboardAggregator';
import type { HrmAttendanceRecord } from '@/integrations/hrmApi';

describe('attendanceDashboardAggregator', () => {
  const employees = new Map([
    [
      'emp-1',
      {
        employee_code: 'NV001',
        full_name: 'Nguyễn Văn A',
        department: 'Phòng Nhân sự',
        position: 'Nhân viên',
      },
    ],
  ]);

  const records: HrmAttendanceRecord[] = [
    {
      id: 'r1',
      company_id: 'main',
      employee_id: 'emp-1',
      attendance_date: '2026-06-02',
      check_in_at: '2026-06-02T08:05:00.000Z',
      check_out_at: '2026-06-02T17:00:00.000Z',
      status: 'present',
      note: null,
      created_by: null,
      created_at: '2026-06-02T08:05:00.000Z',
      updated_at: '2026-06-02T17:00:00.000Z',
    },
    {
      id: 'r2',
      company_id: 'main',
      employee_id: 'emp-1',
      attendance_date: '2026-06-03',
      check_in_at: null,
      check_out_at: null,
      status: 'leave',
      note: null,
      created_by: null,
      created_at: '2026-06-03T00:00:00.000Z',
      updated_at: '2026-06-03T00:00:00.000Z',
    },
  ];

  it('does not include hardcoded demo branch names in weekly rows', () => {
    const range = resolveWeeklyDateRange({
      start_date: '2026-06-02',
      end_date: '2026-06-08',
    });
    const rows = buildWeeklyAttendanceRows(records, employees, range);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.department).toBe('Phòng Nhân sự');
    expect(JSON.stringify(rows)).not.toMatch(/CÔNG TY DEMO|Chi nhánh Đà Nẵng|SAIGON NEWPORT/i);
  });

  it('maps attendance records to table rows without 2021 mock dates', () => {
    const tableRows = mapAttendanceRecordsToTableRows(records, employees);
    expect(tableRows[0]?.date).toBe('02/06/2026');
    expect(tableRows.some((row) => row.date.includes('2021'))).toBe(false);
    expect(tableRows[0]?.unit).toBe('Phòng Nhân sự');
  });

  it('sums leave type chart values for center label', () => {
    expect(
      sumLeaveTypeValues([
        { value: 4 },
        { value: 2 },
        { value: 1 },
      ]),
    ).toBe(7);
  });

  it('formats overview subtitle from selected year', () => {
    expect(formatOverviewYearSubtitle(2026)).toBe('(01/01/2026 - 31/12/2026)');
    expect(formatOverviewYearSubtitle(2026)).not.toContain('2021');
  });

  it('resolves operating slug to live display name for chart unit labels', () => {
    const labels = new Map<string, string>([['trsport', 'Khối Vận tải X.E']]);
    const employeesWithSlug = new Map([
      [
        'emp-2',
        {
          employee_code: 'NV002',
          full_name: 'Trần Thị B',
          department: 'trsport',
          position: 'Nhân viên',
        },
      ],
    ]);
    const slugRecords: HrmAttendanceRecord[] = [
      {
        id: 'r3',
        company_id: 'main',
        employee_id: 'emp-2',
        attendance_date: '2026-06-02',
        check_in_at: '2026-06-02T08:00:00.000Z',
        check_out_at: '2026-06-02T17:00:00.000Z',
        status: 'present',
        note: null,
        created_by: null,
        created_at: '2026-06-02T08:00:00.000Z',
        updated_at: '2026-06-02T17:00:00.000Z',
      },
    ];
    const range = resolveWeeklyDateRange({
      start_date: '2026-06-02',
      end_date: '2026-06-08',
    });
    const rows = buildWeeklyAttendanceRows(slugRecords, employeesWithSlug, range, undefined, labels);
    expect(rows[0]?.department).toBe('Khối Vận tải X.E');
    expect(resolveAttendanceUnitLabel('trsport', labels)).toBe('Khối Vận tải X.E');
    expect(JSON.stringify(rows)).not.toMatch(/1OFFICE/i);
  });
});

describe('weekly attendance invalid dates (D-HRM-ATT-INVALID-DATE-01)', () => {
  const invalidFromToCases: Array<{ from: string | null | undefined; to: string | null | undefined }> = [
    { from: null, to: null },
    { from: undefined, to: undefined },
    { from: '', to: '' },
    { from: 'not-a-date', to: 'also-bad' },
    { from: '07/2026', to: '08/2026' },
    { from: '2026-07', to: '2026-08' },
    { from: 'Invalid Date', to: 'Invalid Date' },
    { from: '   ', to: 'garbage' },
  ];

  it('formatWeeklyRangeTitleLabels never throws (former crash at Attendance ~1926)', () => {
    for (const pair of invalidFromToCases) {
      expect(() => formatWeeklyRangeTitleLabels(pair.from, pair.to)).not.toThrow();
    }
    expect(formatWeeklyRangeTitleLabels(null, null)).toEqual({ start: '—', end: '—' });
    expect(formatWeeklyRangeTitleLabels('not-a-date', 'also-bad')).toEqual({
      start: '—',
      end: '—',
    });
    expect(formatWeeklyRangeTitleLabels('07/2026', '08/2026')).toEqual({
      start: '07/2026',
      end: '08/2026',
    });
    expect(formatWeeklyRangeTitleLabels('2026-06-02', '2026-06-08')).toEqual({
      start: '02/06/2026',
      end: '08/06/2026',
    });
  });

  it('formatWeeklyRangeSubtitle never throws on invalid from/to', () => {
    for (const pair of invalidFromToCases) {
      expect(() =>
        formatWeeklyRangeSubtitle(pair.from ?? '', pair.to ?? ''),
      ).not.toThrow();
    }
    expect(formatWeeklyRangeSubtitle('not-a-date', 'x')).toBe('(— - —)');
  });

  it('resolveWeeklyDateRange prefers current week clipped to month sheet', () => {
    const anchor = new Date(2026, 6, 21); // Tue 2026-07-21
    const range = resolveWeeklyDateRange(
      { start_date: '2026-07-01', end_date: '2026-07-31' },
      anchor,
    );
    expect(range.from).toBe('2026-07-20');
    expect(range.to).toBe('2026-07-26');
    expect(range.days).toHaveLength(7);
  });

  it('resolveWeeklyDateRange falls back when sheet dates are invalid', () => {
    const anchor = new Date(2026, 5, 3); // Wed 2026-06-03
    const range = resolveWeeklyDateRange(
      { start_date: 'not-a-date', end_date: 'also-bad' },
      anchor,
    );
    expect(range.from).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(range.to).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(range.days.length).toBeGreaterThan(0);
    expect(() => buildWeeklyDayHeaderFallback(range.days)).not.toThrow();
    expect(() => formatWeeklyRangeTitleLabels(range.from, range.to)).not.toThrow();
  });

  it('buildWeeklyDayHeaderFallback skips Invalid Date entries', () => {
    const invalid = new Date('not-a-date');
    const valid = new Date(2026, 5, 2);
    const headers = buildWeeklyDayHeaderFallback([invalid, valid]);
    expect(headers).toHaveLength(1);
    expect(headers[0]?.date).toBe('02');
  });

  it('mapAttendanceRecordsToTableRows never throws on bad attendance_date', () => {
    const bad: HrmAttendanceRecord[] = [
      {
        id: 'bad-1',
        company_id: 'main',
        employee_id: 'emp-1',
        attendance_date: 'not-a-date',
        check_in_at: null,
        check_out_at: null,
        status: 'present',
        note: null,
        created_by: null,
        created_at: '2026-06-02T00:00:00.000Z',
        updated_at: '2026-06-02T00:00:00.000Z',
      },
    ];
    expect(() => mapAttendanceRecordsToTableRows(bad, new Map())).not.toThrow();
    expect(mapAttendanceRecordsToTableRows(bad, new Map())[0]?.date).toBe('—');
  });
});
