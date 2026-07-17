/**
 * @CODE-MEMORY
 * Screen:     /dashboard — leave request summary widgets
 * UC:          UF-HRM-05
 * Purpose:     Dashboard leave rows via shared leave-requests React Query key
 *              (singleflight with LeaveTab / useLeaveRequests).
 * WorkItem:    D-HRM-ATT-LEAVE-FETCH-STORM
 * Coded:       2026-07-17
 * LastVerified: apps/web/hrm/src/hooks/useLeaveRequestsData.test.ts
 */
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { listLeaveRequests, type HrmLeaveRequest } from '@/integrations/hrmApi';
import {
  buildLeaveRequestsQuery,
  buildLeaveRequestsQueryKey,
  mapApiLeaveRequestToUi,
} from '@/hooks/useLeaveRequests';

export interface LeaveRequestData {
  id: string;
  employee_id: string;
  employee_name: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string | null;
  status: string;
}

/** Re-export for existing callers / tests. */
export { buildLeaveRequestsQuery } from '@/hooks/useLeaveRequests';

export function mapApiLeaveRequestToDashboardRow(row: HrmLeaveRequest): LeaveRequestData {
  const totalDays = Number.parseFloat(String(row.total_days ?? 0));
  return {
    id: row.id,
    employee_id: row.employee_id,
    employee_name: row.employee_name?.trim() || row.employee_code?.trim() || 'N/A',
    leave_type: row.leave_type,
    start_date: row.start_date,
    end_date: row.end_date,
    total_days: Number.isFinite(totalDays) ? totalDays : 0,
    reason: row.reason,
    status: row.status,
  };
}

export function useLeaveRequestsData(statusFilter?: string) {
  const { currentCompanyId } = useAuth();
  const queryKey = buildLeaveRequestsQueryKey(currentCompanyId, statusFilter);

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      if (!currentCompanyId) return [];
      const response = await listLeaveRequests(
        buildLeaveRequestsQuery(currentCompanyId, statusFilter),
      );
      return (response.data ?? []).map(mapApiLeaveRequestToUi);
    },
    enabled: !!currentCompanyId,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const leaveRequests = useMemo<LeaveRequestData[]>(
    () =>
      (query.data ?? []).map((row) => ({
        id: row.id,
        employee_id: row.employee_id,
        employee_name: row.employee_name,
        leave_type: row.leave_type,
        start_date: row.start_date,
        end_date: row.end_date,
        total_days: row.total_days,
        reason: row.reason,
        status: row.status,
      })),
    [query.data],
  );

  return { leaveRequests, isLoading: query.isLoading };
}
