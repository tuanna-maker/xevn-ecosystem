/**
 * @CODE-MEMORY
 * Screen:     /attendance — Bảng chấm công · weekly grid
 * UC:         UC-HRM-23 · UF-HRM-05
 * BR:         BR-ATT-SHEET-01
 * SRS:        docs/hrm/SRS.md UC-HRM-23
 * TechSpec:   docs/hrm/TECHSPEC.md attendance sheets / records
 * Purpose:    Load attendance records for selected sheet week; aggregate into weekly grid.
 * WorkItem:   D-HRM-ATT-SHEET-EMPTY-RELOAD-LOOP-01
 * Coded:      2026-07-21
 *
 * Callers:
 *   - pages/Attendance.tsx → useWeeklyAttendanceSummary({ enabled, sheet, employees })
 *
 * Callees:
 *   - listAttendanceRecords · buildWeeklyAttendanceRows · mapAttendanceRecordsToTableRows
 *
 * must_keep:
 *   - React Query singleflight (no useEffect→fetch on unstable object deps)
 *   - Manual refetch only (no refetchInterval / window-focus storm)
 *   - formatDisplayDate path via aggregator (Invalid time closed)
 * SOLID: RQ read + memoized aggregate (employees Map change does not re-hit API)
 * LastVerified: apps/web/hrm/src/hooks/useWeeklyAttendanceSummary.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-07-21
 * WorkItem: D-HRM-ATT-SHEET-EMPTY-RELOAD-LOOP-01
 * change_mode: UPGRADE
 * What: Replace useEffect(fetchWeeklyData) thrash with RQ; stabilize sheet range on primitives
 * Why: Sponsor :8088 create sheet → weekly spinner forever + «Tải lại» auto-spin (0 console)
 *
 * @CODE-MEMORY-CHANGE 2026-08-06
 * WorkItem: PO-HRM-ATT-LEAVE-FUNNEL-FE-01
 * change_mode: ADD
 * What: Confirm weekly still single listAttendanceRecords query; leave labels from aggregator (no leave-requests GET)
 * Why: F-ATT-LEAVE-FUNNEL-03 · INV-4 must_keep J-HRM-06b storm ≤2 GET/10s
 * must_keep: no refetchInterval; no Option C; attendance_uat_ready=false
 */
import { useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useHrmOperatingUnitFilter } from '@/contexts/HrmOperatingUnitFilterContext';
import { clampHrmPageSize } from '@/lib/hrmDataMode';
import {
  buildWeeklyAttendanceRows,
  mapAttendanceRecordsToTableRows,
  resolveWeeklyDateRange,
  resolveAttendanceUnitLabel,
  type AttendanceRecordTableRow,
  type EmployeeLookup,
  type WeeklyAttendanceRow,
} from '@/lib/attendanceDashboardAggregator';
import { listAttendanceRecords, type HrmAttendanceRecord } from '@/integrations/hrmApi';

export type WeeklySheetContext = {
  start_date: string;
  end_date: string;
  name: string;
} | null;

export const WEEKLY_ATTENDANCE_QUERY_KEY = 'weekly-attendance-summary' as const;

export function buildWeeklyAttendanceQueryKey(
  companyId: string | null | undefined,
  from: string,
  to: string,
): readonly unknown[] {
  return [WEEKLY_ATTENDANCE_QUERY_KEY, companyId ?? null, from, to] as const;
}

export function useWeeklyAttendanceSummary(opts: {
  enabled: boolean;
  sheet?: WeeklySheetContext;
  employees: Array<{
    id: string;
    employee_code: string;
    full_name: string;
    department?: string | null;
    position?: string | null;
  }>;
}) {
  const { enabled, sheet, employees } = opts;
  const { currentCompanyId } = useAuth();
  const { operatingUnitLabelMap } = useHrmOperatingUnitFilter();
  const { t } = useTranslation();

  // Primitive deps only — inline `{ start_date, end_date }` from parent must not thrash.
  const sheetStart = sheet?.start_date ?? null;
  const sheetEnd = sheet?.end_date ?? null;

  const range = useMemo(
    () =>
      resolveWeeklyDateRange(
        sheetStart && sheetEnd ? { start_date: sheetStart, end_date: sheetEnd } : null,
      ),
    [sheetStart, sheetEnd],
  );

  const employeesById = useMemo(() => {
    const map = new Map<string, EmployeeLookup>();
    for (const emp of employees) {
      map.set(emp.id, {
        employee_code: emp.employee_code,
        full_name: emp.full_name,
        department: emp.department ?? null,
        position: emp.position ?? null,
      });
    }
    return map;
  }, [employees]);

  const departmentOptions = useMemo(() => {
    const names = new Set<string>();
    for (const emp of employees) {
      const dept = resolveAttendanceUnitLabel(emp.department, operatingUnitLabelMap);
      if (dept) names.add(dept);
    }
    return Array.from(names).sort((a, b) => a.localeCompare(b, 'vi'));
  }, [employees, operatingUnitLabelMap]);

  const queryKey = buildWeeklyAttendanceQueryKey(currentCompanyId, range.from, range.to);

  const query = useQuery({
    queryKey,
    queryFn: async (): Promise<HrmAttendanceRecord[]> => {
      if (!currentCompanyId) return [];
      const response = await listAttendanceRecords({
        company_id: currentCompanyId,
        from_date: range.from,
        to_date: range.to,
        page: 1,
        page_size: 50000,
      });
      return response.data ?? [];
    },
    enabled: enabled && !!currentCompanyId,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const weeklyRows: WeeklyAttendanceRow[] = useMemo(() => {
    if (!enabled) return [];
    return buildWeeklyAttendanceRows(
      query.data ?? [],
      employeesById,
      range,
      (key, fallback) => t(key, fallback ?? key),
      operatingUnitLabelMap,
    );
  }, [enabled, employeesById, operatingUnitLabelMap, query.data, range, t]);

  const recordRows: AttendanceRecordTableRow[] = useMemo(() => {
    if (!enabled) return [];
    return mapAttendanceRecordsToTableRows(
      query.data ?? [],
      employeesById,
      operatingUnitLabelMap,
    );
  }, [enabled, employeesById, operatingUnitLabelMap, query.data]);

  const refetch = useCallback(async () => {
    if (!enabled) return;
    await query.refetch();
  }, [enabled, query]);

  const loadError =
    query.isError && query.error
      ? query.error instanceof Error
        ? query.error.message
        : 'Failed to load attendance data'
      : null;

  // Initial load only — keep table/empty visible during manual refetch (button spin).
  const isLoading = enabled && query.isLoading && !query.data;

  return {
    weeklyRows,
    recordRows,
    range,
    departmentOptions,
    isLoading,
    isFetching: query.isFetching,
    loadError,
    refetch,
    queryKey,
  };
}
