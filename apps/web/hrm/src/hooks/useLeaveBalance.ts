/**
 * @CODE-MEMORY
 * Screen:     Attendance → LeaveTab — GET leave-balance
 * UC:         UC-HRM-ATT-LEAVE-01
 * SRS:        docs/hrm/SRS.md
 * TechSpec:   docs/hrm/TECHSPEC.md GET /attendance/leave-balance
 * Purpose:    Load số dư phép theo employee_id + leave_type khi có scope công ty.
 * WorkItem:   PO-MFD-M2-ATT-WIRE-BALANCE-01
 * Coded:      2026-08-04
 * Callers:    LeaveTab
 * must_keep:  coerceHrmListCompanyId; không fetch khi thiếu employeeId; U65 no seed
 * LastVerified: lib/leaveBalance.test.ts
 */
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { fetchLeaveBalance } from '@/integrations/hrmApi';
import { coerceHrmListCompanyId } from '@/lib/hrmListScope';
import type { LeaveBalancePayload } from '@/lib/leaveBalance';

export const LEAVE_BALANCE_QUERY_KEY = 'leave-balance' as const;

export function buildLeaveBalanceQueryKey(
  companyId: string | null | undefined,
  employeeId: string | null | undefined,
  leaveType: string,
  year: number,
): readonly unknown[] {
  return [LEAVE_BALANCE_QUERY_KEY, companyId ?? null, employeeId ?? null, leaveType, year] as const;
}

export type UseLeaveBalanceOptions = {
  employeeId: string | null | undefined;
  leaveType?: string;
  year?: number;
  enabled?: boolean;
};

export function useLeaveBalance(opts: UseLeaveBalanceOptions) {
  const { currentCompanyId } = useAuth();
  const leaveType = (opts.leaveType ?? 'annual').trim() || 'annual';
  const year = opts.year ?? new Date().getFullYear();
  const employeeId = opts.employeeId?.trim() || '';
  const enabled =
    opts.enabled !== false && Boolean(currentCompanyId) && Boolean(employeeId);

  const query = useQuery({
    queryKey: buildLeaveBalanceQueryKey(currentCompanyId, employeeId, leaveType, year),
    enabled,
    queryFn: async (): Promise<LeaveBalancePayload> => {
      const company_id = coerceHrmListCompanyId(currentCompanyId!);
      return fetchLeaveBalance({
        company_id,
        employee_id: employeeId,
        leave_type: leaveType,
        year,
      });
    },
    staleTime: 30_000,
    retry: (failureCount, error) => {
      if (failureCount >= 1) return false;
      const status = (error as { status?: number })?.status;
      if (status === 403 || status === 404) return false;
      return true;
    },
  });

  return {
    balance: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isFetched: query.isFetched,
  };
}
