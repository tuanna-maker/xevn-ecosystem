/**
 * @CODE-MEMORY
 * Screen:     /attendance — Nghỉ phép (LeaveTab) · Dashboard leave widgets
 * UC:          UF-HRM-05 · J-HRM-06
 * BR:          BR-ATT-LEAVE-01
 * SRS:         docs/hrm/SRS.md (attendance leave requests)
 * TechSpec:    docs/hrm/TECHSPEC.md attendance leave-requests
 * Purpose:     Load leave requests via React Query (stable queryKey).
 *              Prevents fetch storm from unstable toast/`h` callback deps
 *              that previously re-triggered useEffect → RATE-429.
 * WorkItem:    D-HRM-ATT-LEAVE-FETCH-STORM
 * Coded:       2026-07-17
 *
 * Callers:
 *   - components/attendance/LeaveTab.tsx → useLeaveRequests()
 *   - hooks/useLeaveRequestsData.ts → shared query key
 *
 * Callees:
 *   - listLeaveRequests / createLeaveRequest / approveLeaveRequest / rejectLeaveRequest
 *
 * FE-Actions:
 *   | User action     | Handler        | Lib / API              |
 *   |-----------------|----------------|------------------------|
 *   | Open Nghỉ phép  | useQuery       | listLeaveRequests      |
 *   | Create / approve| mutation + inv | create/approve/reject  |
 *
 * must_keep:   mapApiLeaveRequestToUi; portal Nest API (no Supabase);
 *              soft-nav; leave picker typeahead HLD-0006 (CD-FB-07)
 * SOLID:       RQ read path; mutations invalidate shared key (singleflight)
 * LastVerified: apps/web/hrm/src/hooks/useLeaveRequests.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-07-19 CD-FB-07-LEAVE-CREATE-COMPANY-UUID
 *   POST leave-requests requires @IsUUID() company_id — map employee/OU slug
 *   (holding|main) → UUID via resolveHrmMetadataCompanyUuid before create.
 *   Prefer employee.company_id over portal rollup slug. Do not reopen TEXT resolver.
 *
 * @CODE-MEMORY-CHANGE 2026-07-21 FE-HRM-G-AT10-02-TOAST-01
 *   Map HRM-LEAVE-VAL-OVERLAP (409) + HRM-LEAVE-VAL-BALANCE (400) via toErrorMessage
 *   on create toast (FR-HRM-AT-10 #5/#6). Happy create path unchanged.
 *
 * @CODE-MEMORY-CHANGE 2026-07-27 D-HRM-LEAVE-REQ-CREATE-FE-01
 * change_mode: FIX
 * What: POST company_id = TEXT slug (holding/main partition) via resolveHrmLeaveCreateCompanyId
 * Why: G-AT10-01 + Settings catalog partition; QA residual P1 UUID body while BE accepts slug
 * must_keep: leave_type catalog SoT; create→201 path; VAL toast codes; no Settings MD reopen
 */
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  approveLeaveRequest,
  createLeaveRequest,
  listLeaveRequests,
  rejectLeaveRequest,
  type HrmLeaveRequest,
} from '@/integrations/hrmApi';
import { toErrorMessage } from '@/lib/apiError';
import { coerceHrmListCompanyId } from '@/lib/hrmListScope';
import { resolveHrmLeaveCreateCompanyId } from '@/lib/hrmMetadataCompany';

export interface LeaveRequest {
  id: string; company_id: string; employee_id: string; employee_code: string; employee_name: string;
  department: string | null; position: string | null; leave_type: string; start_date: string; end_date: string;
  total_days: number; reason: string | null; handover_to: string | null; handover_tasks: string | null;
  approver_id: string | null; approver_name: string | null; status: string; approved_at: string | null;
  rejected_reason: string | null; attachment_url: string | null; notes: string | null;
  created_at: string; updated_at: string;
}

export interface LeaveRequestFormData {
  /** Employee's company slug or UUID — preferred over portal rollup `main`; payload maps to TEXT slug. */
  company_id?: string;
  employee_id: string; employee_code: string; employee_name: string; department?: string; position?: string;
  leave_type: string; start_date: string; end_date: string; total_days: number; reason?: string;
  handover_to?: string; handover_tasks?: string; approver_name?: string;
}

/**
 * Build Nest POST body for leave create (G-AT10-01).
 * Prefer employee company_id (OU/home company), then portal scope — TEXT slug for Settings partition.
 */
export function buildLeaveCreatePayload(
  data: LeaveRequestFormData,
  scopeCompanyId: string | null | undefined,
): Record<string, unknown> | null {
  const companyId = resolveHrmLeaveCreateCompanyId(
    data.company_id?.trim() || scopeCompanyId,
  );
  if (!companyId) return null;
  return {
    company_id: companyId,
    employee_id: data.employee_id,
    employee_code: data.employee_code,
    employee_name: data.employee_name,
    department: data.department,
    position: data.position,
    leave_type: data.leave_type,
    start_date: data.start_date,
    end_date: data.end_date,
    total_days: data.total_days,
    reason: data.reason,
    handover_to: data.handover_to,
    handover_tasks: data.handover_tasks,
  };
}

export const LEAVE_REQUESTS_QUERY_KEY = 'leave-requests' as const;

export function buildLeaveRequestsQueryKey(
  companyId: string | null | undefined,
  statusFilter?: string,
): readonly unknown[] {
  return [LEAVE_REQUESTS_QUERY_KEY, companyId ?? null, statusFilter ?? ''] as const;
}

export function buildLeaveRequestsQuery(companyId: string, statusFilter?: string) {
  return {
    company_id: coerceHrmListCompanyId(companyId),
    ...(statusFilter ? { status: statusFilter } : {}),
  };
}

export function mapApiLeaveRequestToUi(row: HrmLeaveRequest): LeaveRequest {
  const totalDays = Number.parseFloat(String(row.total_days ?? 0));
  const reviewedAt = row.reviewed_at;
  return {
    id: row.id,
    company_id: row.company_id,
    employee_id: row.employee_id,
    employee_code: row.employee_code?.trim() || 'N/A',
    employee_name: row.employee_name?.trim() || row.employee_code?.trim() || 'N/A',
    department: row.department,
    position: row.position,
    leave_type: row.leave_type,
    start_date: row.start_date,
    end_date: row.end_date,
    total_days: Number.isFinite(totalDays) ? totalDays : 0,
    reason: row.reason,
    handover_to: row.handover_to,
    handover_tasks: row.handover_tasks,
    approver_id: row.approver_employee_id,
    approver_name: row.reviewed_by,
    status: row.status,
    approved_at: row.status === 'approved' ? reviewedAt : null,
    rejected_reason: row.rejected_reason,
    attachment_url: null,
    notes: null,
    created_at: row.requested_at,
    updated_at: reviewedAt ?? row.requested_at,
  };
}

export function useLeaveRequests(opts?: { enabled?: boolean; statusFilter?: string }) {
  const enabled = opts?.enabled !== false;
  const statusFilter = opts?.statusFilter;
  const { currentCompanyId, profile, memberships } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const toastedErrorRef = useRef<unknown>(null);

  const reviewerName = profile?.full_name?.trim() || 'Web HRM';
  const reviewerEmployeeId = useMemo(
    () => memberships.find((m) => m.company_id === currentCompanyId)?.employee_id ?? undefined,
    [memberships, currentCompanyId],
  );

  const queryKey = buildLeaveRequestsQueryKey(currentCompanyId, statusFilter);

  const query = useQuery({
    queryKey,
    queryFn: async (): Promise<LeaveRequest[]> => {
      if (!currentCompanyId) return [];
      const response = await listLeaveRequests(
        buildLeaveRequestsQuery(currentCompanyId, statusFilter),
      );
      return (response.data ?? []).map(mapApiLeaveRequestToUi);
    },
    enabled: enabled && !!currentCompanyId,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  useEffect(() => {
    if (!query.isError || !query.error) {
      toastedErrorRef.current = null;
      return;
    }
    if (toastedErrorRef.current === query.error) return;
    toastedErrorRef.current = query.error;
    console.error('Error fetching leave requests:', query.error);
    toast({
      title: t('messages.error'),
      description: t('hk.leave.fetchError'),
      variant: 'destructive',
    });
  }, [query.isError, query.error, toast, t]);

  const invalidateLeaveRequests = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: [LEAVE_REQUESTS_QUERY_KEY] });
  }, [queryClient]);

  const fetchRequests = useCallback(async () => {
    await query.refetch();
  }, [query]);

  const createRequest = async (data: LeaveRequestFormData): Promise<LeaveRequest | null> => {
    if (!currentCompanyId) return null;
    const payload = buildLeaveCreatePayload(data, currentCompanyId);
    if (!payload) {
      toast({
        title: t('messages.error'),
        description: t('hk.leave.createError'),
        variant: 'destructive',
      });
      return null;
    }
    try {
      const created = await createLeaveRequest(payload);
      const mapped = mapApiLeaveRequestToUi(created);
      await invalidateLeaveRequests();
      toast({ title: t('messages.success'), description: t('hk.leave.createSuccess') });
      return mapped;
    } catch (error: unknown) {
      console.error('Error creating leave request:', error);
      toast({
        title: t('messages.error'),
        description: toErrorMessage(error, t('hk.leave.createError')),
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateRequest = async (id: string, data: Partial<LeaveRequest>): Promise<boolean> => {
    queryClient.setQueryData<LeaveRequest[]>(queryKey, (prev) =>
      (prev ?? []).map((r) => (r.id === id ? { ...r, ...data } : r)),
    );
    return true;
  };

  const approveRequest = async (id: string): Promise<boolean> => {
    try {
      const updated = await approveLeaveRequest(id, {
        reviewer_name: reviewerName,
        reviewer_employee_id: reviewerEmployeeId,
      });
      const mapped = mapApiLeaveRequestToUi(updated);
      queryClient.setQueryData<LeaveRequest[]>(queryKey, (prev) =>
        (prev ?? []).map((r) => (r.id === id ? mapped : r)),
      );
      return true;
    } catch (error: unknown) {
      console.error('Error approving leave request:', error);
      toast({ title: t('messages.error'), description: t('hk.leave.updateError'), variant: 'destructive' });
      return false;
    }
  };

  const rejectRequest = async (id: string, reason?: string): Promise<boolean> => {
    try {
      const updated = await rejectLeaveRequest(id, {
        reviewer_name: reviewerName,
        reviewer_employee_id: reviewerEmployeeId,
        rejected_reason: reason,
      });
      const mapped = mapApiLeaveRequestToUi(updated);
      queryClient.setQueryData<LeaveRequest[]>(queryKey, (prev) =>
        (prev ?? []).map((r) => (r.id === id ? mapped : r)),
      );
      return true;
    } catch (error: unknown) {
      console.error('Error rejecting leave request:', error);
      toast({ title: t('messages.error'), description: t('hk.leave.updateError'), variant: 'destructive' });
      return false;
    }
  };

  const deleteRequest = async (_id: string): Promise<boolean> => {
    toast({
      title: t('messages.error'),
      description: t('hk.leave.deleteError'),
      variant: 'destructive',
    });
    return false;
  };

  return {
    requests: query.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    fetchRequests,
    createRequest,
    updateRequest,
    approveRequest,
    rejectRequest,
    deleteRequest,
    queryKey,
  };
}
