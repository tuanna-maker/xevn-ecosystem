/**
 * @CODE-MEMORY
 * Screen:     /attendance → Tổng quan · Dashboard pulse
 * UC:         matrix C1 overview · GET /attendance/overview
 * BR:         One Nest round-trip; year query when provided
 * SRS:        docs/hrm/SRS.md attendance overview pulse
 * TechSpec:   AttendanceOverviewQueryDto company_id + year
 * Purpose:    Load KPI/charts overview; expose loading/error cho UI fail-closed.
 * WorkItem:   PO-MFD-M2-ATT-OVERVIEW-01
 * Coded:      2026-08-04
 * Callers:    Attendance.tsx · Dashboard.tsx
 * Callees:    fetchAttendanceOverview
 * must_keep:  Không storm parallel leave/late lists; không invent period param
 *
 * @CODE-MEMORY-CHANGE 2026-08-04 PO-MFD-M2-ATT-OVERVIEW-01
 * change_mode: FIX
 * What: Surface `error` + clear on retry; year refetch already via selectedYear
 * Why: QA cần empty/error honest khi overview GET fail; filter năm wire từ page
 */
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchAttendanceOverview } from '@/integrations/hrmApi';
import type { HrmAttendanceOverview } from '@/integrations/hrmApi';
import { ApiClientError } from '@/lib/apiError';

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

function overviewErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError) {
    return error.message || error.code || 'Không tải được tổng quan chấm công';
  }
  if (error instanceof Error && error.message) return error.message;
  return 'Không tải được tổng quan chấm công';
}

/** One Nest call — avoids parallel list storms that trigger RATE-429 on local dev. */
export function useAttendanceOverview(year?: number, opts?: { enabled?: boolean }) {
  const enabled = opts?.enabled !== false;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payload, setPayload] = useState<HrmAttendanceOverview>(EMPTY_OVERVIEW);
  const { currentCompanyId } = useAuth();
  const selectedYear = year || new Date().getFullYear();

  const fetchOverview = useCallback(async () => {
    if (!enabled || !currentCompanyId) {
      setPayload(EMPTY_OVERVIEW);
      setError(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchAttendanceOverview({
        company_id: currentCompanyId,
        year: selectedYear,
      });
      setPayload(data);
    } catch (err) {
      console.error('Error fetching attendance overview:', err);
      setPayload(EMPTY_OVERVIEW);
      setError(overviewErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [currentCompanyId, selectedYear, enabled]);

  useEffect(() => {
    void fetchOverview();
  }, [fetchOverview]);

  return {
    isLoading,
    error,
    year: selectedYear,
    stats: payload.stats,
    monthlyLeaveData: payload.monthlyLeaveData,
    departmentLeaveData: payload.departmentLeaveData,
    leaveTypeData: payload.leaveTypeData,
    lateEarlyList: payload.lateEarlyList,
    refetch: fetchOverview,
  };
}
