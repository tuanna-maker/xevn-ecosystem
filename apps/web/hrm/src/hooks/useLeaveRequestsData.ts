import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { listLeaveRequests, type HrmLeaveRequest } from '@/integrations/hrmApi';
import { coerceHrmListCompanyId } from '@/lib/hrmListScope';

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

export function buildLeaveRequestsQuery(companyId: string, statusFilter?: string) {
  return {
    company_id: coerceHrmListCompanyId(companyId),
    ...(statusFilter ? { status: statusFilter } : {}),
  };
}

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
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequestData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentCompanyId) {
      setLeaveRequests([]);
      setIsLoading(false);
      return;
    }

    const fetchLeaveRequests = async () => {
      setIsLoading(true);
      try {
        const response = await listLeaveRequests(
          buildLeaveRequestsQuery(currentCompanyId, statusFilter),
        );
        setLeaveRequests((response.data ?? []).map(mapApiLeaveRequestToDashboardRow));
      } catch (error) {
        console.error('Error fetching leave requests:', error);
        setLeaveRequests([]);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchLeaveRequests();
  }, [currentCompanyId, statusFilter]);

  return { leaveRequests, isLoading };
}
