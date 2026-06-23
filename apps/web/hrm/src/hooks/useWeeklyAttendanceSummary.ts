import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { listAttendanceRecords } from '@/integrations/hrmApi';

type WeeklySheetContext = {
  start_date: string;
  end_date: string;
  name: string;
} | null;

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
  const [weeklyRows, setWeeklyRows] = useState<WeeklyAttendanceRow[]>([]);
  const [recordRows, setRecordRows] = useState<AttendanceRecordTableRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const range = useMemo(() => resolveWeeklyDateRange(sheet), [sheet]);

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

  const fetchWeeklyData = useCallback(async () => {
    if (!enabled || !currentCompanyId) {
      setWeeklyRows([]);
      setRecordRows([]);
      setLoadError(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setLoadError(null);
      const response = await listAttendanceRecords({
        company_id: currentCompanyId,
        from_date: range.from,
        to_date: range.to,
        page: 1,
        page_size: clampHrmPageSize(500),
      });
      const apiRecords = response.data ?? [];
      setWeeklyRows(
        buildWeeklyAttendanceRows(apiRecords, employeesById, range, (key, fallback) =>
          t(key, fallback ?? key),
        operatingUnitLabelMap),
      );
      setRecordRows(mapAttendanceRecordsToTableRows(apiRecords, employeesById, operatingUnitLabelMap));
    } catch (error) {
      console.error('Error fetching weekly attendance summary:', error);
      setWeeklyRows([]);
      setRecordRows([]);
      setLoadError(error instanceof Error ? error.message : 'Failed to load attendance data');
    } finally {
      setIsLoading(false);
    }
  }, [currentCompanyId, enabled, employeesById, operatingUnitLabelMap, range, t]);

  useEffect(() => {
    void fetchWeeklyData();
  }, [fetchWeeklyData]);

  return {
    weeklyRows,
    recordRows,
    range,
    departmentOptions,
    isLoading,
    loadError,
    refetch: fetchWeeklyData,
  };
}
