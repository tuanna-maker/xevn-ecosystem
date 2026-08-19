import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  WEEKLY_ATTENDANCE_QUERY_KEY,
  buildWeeklyAttendanceQueryKey,
} from './useWeeklyAttendanceSummary';
import { resolveWeeklyDateRange } from '@/lib/attendanceDashboardAggregator';

const hooksDir = dirname(fileURLToPath(import.meta.url));

describe('D-HRM-ATT-SHEET-EMPTY-RELOAD-LOOP-01 — weekly fetch stability', () => {
  it('weekly summary uses React Query with stable company+range queryKey (no useEffect fetch thrash)', () => {
    const source = readFileSync(join(hooksDir, 'useWeeklyAttendanceSummary.ts'), 'utf8');
    expect(source).toContain('useQuery');
    expect(source).toContain('WEEKLY_ATTENDANCE_QUERY_KEY');
    expect(source).toContain('refetchOnWindowFocus: false');
    expect(source).not.toContain('useEffect(() => {');
    expect(source).not.toContain('void fetchWeeklyData()');
    expect(source).toContain('sheetStart');
    expect(source).toContain('sheetEnd');
  });

  it('builds stable weekly attendance query keys for singleflight', () => {
    expect(WEEKLY_ATTENDANCE_QUERY_KEY).toBe('weekly-attendance-summary');
    expect(buildWeeklyAttendanceQueryKey('main', '2026-07-20', '2026-07-26')).toEqual([
      'weekly-attendance-summary',
      'main',
      '2026-07-20',
      '2026-07-26',
    ]);
  });

  it('Attendance page memoizes weekly sheet context (no inline object thrash)', () => {
    const pagesDir = join(hooksDir, '..', 'pages');
    const source = readFileSync(join(pagesDir, 'Attendance.tsx'), 'utf8');
    expect(source).toContain('weeklySheetContext');
    expect(source).toContain('isFetchingWeeklyAttendance');
    expect(source).not.toContain(
      'sheet: selectedSheet\n      ? {\n          start_date: selectedSheet.start_date',
    );
  });

  it('July month sheet on mid-month anchor uses current week clipped into period', () => {
    const anchor = new Date(2026, 6, 21); // Tue 2026-07-21
    const range = resolveWeeklyDateRange(
      { start_date: '2026-07-01', end_date: '2026-07-31' },
      anchor,
    );
    expect(range.from).toBe('2026-07-20');
    expect(range.to).toBe('2026-07-26');
    expect(range.days).toHaveLength(7);
  });

  it('sheet period outside anchor week falls back to first ≤7 days (aligned from/to)', () => {
    const anchor = new Date(2026, 6, 21); // Jul 21 — outside Jun sheet
    const range = resolveWeeklyDateRange(
      { start_date: '2026-06-02', end_date: '2026-06-08' },
      anchor,
    );
    expect(range.from).toBe('2026-06-02');
    expect(range.to).toBe('2026-06-08');
    expect(range.days).toHaveLength(7);
  });
});
