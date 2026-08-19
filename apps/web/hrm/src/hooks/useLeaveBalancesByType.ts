/**
 * @CODE-MEMORY
 * Screen:     Attendance → LeaveTab — panel quỹ phép theo loại (ATT-05b)
 * UC:         UC-BP-ATT-05b · UC-HRM-ATT-LEAVE-01
 * BR:         BR-BP-LV-PANEL-01
 * SRS:        docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md · FR-UC-BP-ATT-05b
 * TechSpec:   docs/architecture/ADR-HRM-ATTENDANCE-CFG-PERSIST-20260804.md · GET /attendance/leave-balance/panel
 * Purpose:    Một GET panel 5 loại MVP — hiển thị quỹ trước/khi nộp đơn; zeros hợp lệ; không N×GET.
 * WorkItem:   PO-HRM-ATT-03d-05b-FE-01
 * Coded:      2026-08-05
 * Callers:    LeaveTab
 * Callees:    fetchLeaveBalancePanel · parseLeaveBalancePanelPayload
 * must_keep:  coerceHrmListCompanyId; không invent số; U65 no seed; stub honesty
 * SOLID:      Hook orchestration; parse ở leaveBalance lib
 * LastVerified: lib/leaveBalance.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-ATT-03d-05b-FE-01 (RE-KICK)
 * change_mode: UPGRADE
 * What: Đổi N× GET leave-balance → GET leave-balance/panel (BE READY_FOR_QA)
 * Why: FR-UC-BP-ATT-05b — tránh spinner storm; empty=zeros OK
 * must_keep: companyId scope=token; single-type hook vẫn dùng cho loại ngoài MVP
 */
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchLeaveBalancePanel } from '@/integrations/hrmApi';
import { coerceHrmListCompanyId } from '@/lib/hrmListScope';
import {
  findLeaveBalanceInPanel,
  MVP_LEAVE_BALANCE_TYPE_CODES,
  type LeaveBalancePanelPayload,
  type LeaveBalancePayload,
} from '@/lib/leaveBalance';

export const LEAVE_BALANCE_PANEL_QUERY_KEY = 'leave-balance-panel' as const;

export function buildLeaveBalancePanelQueryKey(
  companyId: string | null | undefined,
  employeeId: string | null | undefined,
  year: number,
): readonly unknown[] {
  return [LEAVE_BALANCE_PANEL_QUERY_KEY, companyId ?? null, employeeId ?? null, year] as const;
}

export type UseLeaveBalancesByTypeOptions = {
  employeeId: string | null | undefined;
  /** Reserved — panel BE luôn trả 5 MVP; catalog không mở rộng panel này. */
  leaveTypeCodes?: readonly string[] | null;
  year?: number;
  enabled?: boolean;
};

export type LeaveBalanceByTypeRow = {
  leave_type: string;
  balance: LeaveBalancePayload | null;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
};

export function useLeaveBalancesByType(opts: UseLeaveBalancesByTypeOptions) {
  const { currentCompanyId } = useAuth();
  const year = opts.year ?? new Date().getFullYear();
  const employeeId = opts.employeeId?.trim() || '';
  const enabled =
    opts.enabled !== false && Boolean(currentCompanyId) && Boolean(employeeId);

  const query = useQuery({
    queryKey: buildLeaveBalancePanelQueryKey(currentCompanyId, employeeId, year),
    enabled,
    queryFn: async (): Promise<LeaveBalancePanelPayload> => {
      const company_id = coerceHrmListCompanyId(currentCompanyId!);
      return fetchLeaveBalancePanel({
        company_id,
        employee_id: employeeId,
        year,
      });
    },
    staleTime: 30_000,
    retry: (failureCount: number, error: unknown) => {
      if (failureCount >= 1) return false;
      const status = (error as { status?: number })?.status;
      if (status === 403 || status === 404) return false;
      return true;
    },
  });

  const rows: LeaveBalanceByTypeRow[] = useMemo(() => {
    if (!enabled) return [];
    if (query.isLoading && !query.data) {
      return MVP_LEAVE_BALANCE_TYPE_CODES.map((leave_type) => ({
        leave_type,
        balance: null,
        isLoading: true,
        isError: false,
        error: undefined,
      }));
    }
    if (query.isError && !query.data) {
      return MVP_LEAVE_BALANCE_TYPE_CODES.map((leave_type) => ({
        leave_type,
        balance: null,
        isLoading: false,
        isError: true,
        error: query.error,
      }));
    }
    const panel = query.data;
    if (!panel) return [];
    // Prefer BE item order; fill missing MVP slots with honest zero-shaped null → UI shows —
    const byType = new Map(
      panel.items.map((item) => [item.leave_type.trim().toLowerCase(), item] as const),
    );
    return MVP_LEAVE_BALANCE_TYPE_CODES.map((leave_type) => {
      const balance = byType.get(leave_type) ?? null;
      return {
        leave_type,
        balance,
        isLoading: false,
        isError: false,
        error: undefined,
      };
    });
  }, [enabled, query.data, query.error, query.isError, query.isLoading]);

  const typeCodes = useMemo(() => rows.map((r) => r.leave_type), [rows]);

  return {
    rows,
    typeCodes,
    panel: query.data ?? null,
    isLoading: enabled && query.isLoading && !query.data,
    isError: enabled && query.isError && !query.data,
    error: query.error,
    isFetched: !enabled || query.isFetched,
    queryKeyPrefix: LEAVE_BALANCE_PANEL_QUERY_KEY,
    getBalanceForType: (leaveType: string) =>
      findLeaveBalanceInPanel(query.data, leaveType),
    refetchAll: () => query.refetch(),
  };
}
