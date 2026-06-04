import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchAttendanceOverview } from '@/integrations/hrmApi';
import type { HrmAttendanceOverview } from '@/integrations/hrmApi';

export type OverviewStats = HrmAttendanceOverview['stats'];
export type MonthlyLeaveData = HrmAttendanceOverview['monthlyLeaveData'][number];
export type DepartmentLeaveData = HrmAttendanceOverview['departmentLeaveData'][number];
export type LeaveTypeData = HrmAttendanceOverview['leaveTypeData'][number];
export type LateEarlyPerson = HrmAttendanceOverview['lateEarlyList'][number];

const EMPTY_OVERVIEW: HrmAttendanceOverview = {
  stats: {
    lateEarlyToday: 0,
    lateEarlyChange: 0,
    actualLeaveThisWeek: 0,
    actualLeaveChange: 0,
    plannedLeaveNextWeek: 0,
    plannedLeaveChange: 0,
  },
  monthlyLeaveData: [],
  departmentLeaveData: [],
  leaveTypeData: [],
  lateEarlyList: [],
};

/** One Nest call — avoids parallel list storms that trigger RATE-429 on local dev. */
export function useAttendanceOverview(year?: number, opts?: { enabled?: boolean }) {
  const enabled = opts?.enabled !== false;
  const [isLoading, setIsLoading] = useState(true);
  const [payload, setPayload] = useState<HrmAttendanceOverview>(EMPTY_OVERVIEW);
  const { currentCompanyId } = useAuth();
  const selectedYear = year || new Date().getFullYear();

  const fetchOverview = useCallback(async () => {
    if (!enabled || !currentCompanyId) {
      setPayload(EMPTY_OVERVIEW);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const data = await fetchAttendanceOverview({
        company_id: currentCompanyId,
        year: selectedYear,
      });
      setPayload(data);
    } catch (error) {
      console.error('Error fetching attendance overview:', error);
      setPayload(EMPTY_OVERVIEW);
    } finally {
      setIsLoading(false);
    }
  }, [currentCompanyId, selectedYear, enabled]);

  useEffect(() => {
    void fetchOverview();
  }, [fetchOverview]);

  return {
    isLoading,
    stats: payload.stats,
    monthlyLeaveData: payload.monthlyLeaveData,
    departmentLeaveData: payload.departmentLeaveData,
    leaveTypeData: payload.leaveTypeData,
    lateEarlyList: payload.lateEarlyList,
    refetch: fetchOverview,
  };
}
