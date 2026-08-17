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
 *
 * @CODE-MEMORY-CHANGE 2026-08-03 R-SPINE-LV04-ATTACH-FE-01
 * change_mode: ADD
 * What: LeaveRequestFormData + buildLeaveCreatePayload bind optional attachment_url (relative /api/hrm/files/)
 * Why: FR-UC-H03 · BR-LEAVE-ATT-01 · LV-04 web ốm≥3 attach; QA SPINE-02 BLOCKED no FE control
 * must_keep: company_id TEXT slug; VAL toast; LeaveOverviewRecentPanel mount GWC; U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-08-04 PO-UC-TC-W4-FE-AT12-L1-APPROVE-SCOPE-01
 * change_mode: FIX
 * What: approve/reject pass currentCompanyId → resolveHrmMutateCompanyScope → x-company-id
 * Why: QA AT-12 R3 mgr Duyệt 409 HRM-LEAVE-409 (header main vs token trsport)
 * must_keep: list leave company_id query; create payload; Chờ duyệt CTA; ATT-07; U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-ATT-LEAVE-CANCEL-FE-01
 * change_mode: FIX
 * What: cancelRequest → cancelLeaveRequest POST; invalidate leave + weekly attendance + balance
 * Why: AC-ATT-LV-SHEET-02 — stub deleteRequest blocked reverse after approve (R-ATT-LV-SHEET-02)
 * must_keep: approve materialize; 409 LOCKED toast via toErrorMessage; Option A; U65; attendance_uat_ready=false
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-ATT-08-CLUSTER-FE-01
 * change_mode: UPGRADE
 * What: RETAIN list/create/approve/reject/cancel on physical /attendance/leave-requests* —
 *       client total_days ≠ ATT-08 DONE; preview-deduction owned by AttLeavePreviewDeductionPanel;
 *       Nest /core DENY · CFG≠ATT-02 DONE · ≠ ATT-09/03b · PAY OUT · printable false.
 * Why: UC-BP-ATT-08 · API-01 F.1 · BA O1–O12 · FE RETAIN peers parallel BE residual
 * must_keep: ATT02QC1-MSLQZUK7 · PLT/CORE · soft≠CORE-06 · U65 · C-SLICE · no seed
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-ATT-08-CLUSTER-FE-02
 * change_mode: UPGRADE
 * What: RETAIN createLeaveRequest — ALIGN total_days from preview deductible_units (LeaveTab);
 *       toErrorMessage surfaces HRM-VAL-400 calendar inflate; Nest /core DENY.
 * Why: BE-01 READY · AC-ATT-08-ALIGN · R-ATT-08-PREVIEW-FE CLOSED
 * must_keep: physical /attendance/* · ≠ ATT-09 DONE · PAY OUT · printable false · U65
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-ATT-09-CLUSTER-FE-01
 * change_mode: UPGRADE
 * What: Map statusLabelVi display-ready; invalidate leave-balance(+panel) after create/approve/reject;
 *       FE type-block leave_type change when pending (AC-ATT-09-TYPE-BLOCK); Nest /core DENY;
 *       DENY invent att_leave_hold · claim soft/ATT-08=ATT-09 DONE · ATT UAT · CFG=ATT-02.
 * Why: UC-BP-ATT-09 · BR-BP-LV-06 · F-ATT-LEAVE-02/03 · API-01 RETAIN · J-HRM-ATT-09-01..06
 * must_keep: ATT08QC1-MSLSL36C preview · ATT02QC1-MSLQZUK7 · PLT/CORE · printable false ·
 *            PAY OUT · U65 · C-SLICE · physical /attendance/*
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-ATT-09-CLUSTER-FE-02
 * change_mode: UPGRADE
 * What: createRequest returns LeaveCreateOutcome on API path — parseAtt09OverlapConflictId for 409 TYPE-BLOCK UX.
 * Why: R-ATT-09-TYPE-BLOCK-UI · J-05 overlap ≠ toast-only
 * must_keep: FE-01 invalidate balance · toast on error · hold/settle paths
 *
 * @CODE-MEMORY-CHANGE 2026-08-10 PO-HRM-MVP-GD1-ATT-04B-CLUSTER-FE-01
 * change_mode: UPGRADE
 * What: parseAtt04bBalanceReject on create → LeaveCreateOutcome.balanceReject · optional balance_resolution payload
 * Why: J-HRM-ATT-04B-03 GATE-REJECT · F-ATT-LEAVE-02 · ≠ FR-04b DONE
 * must_keep: ATT04QC1 · ATT09 pending_days · Nest /core DENY · U65
 *
 * @CODE-MEMORY-CHANGE 2026-08-10 PO-HRM-MVP-GD1-ATT-07-CLUSTER-FE-01
 * change_mode: UPGRADE
 * What: Toast dayBranches summary on sick POST 201 when BE returns dayBranches[].
 * Why: J-HRM-ATT-07-03/04 · F-ATT-SICK-DAY-BRANCH · ≠ FR-07 DONE alone
 * must_keep: ATT06QC1 · physical /attendance/* · U65
 */
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  approveLeaveRequest,
  cancelLeaveRequest,
  createLeaveRequest,
  listLeaveRequests,
  rejectLeaveRequest,
  type HrmLeaveRequest,
} from '@/integrations/hrmApi';
import { toErrorMessage } from '@/lib/apiError';
import {
  assertAtt09LeaveTypeUpdateAllowed,
  att09TypeBlockMessage,
  parseAtt09OverlapConflictId,
  resolveAtt09StatusLabelVi,
} from '@/lib/attLeave09Ring';
import {
  att04bBalanceRejectBannerMessage,
  buildAtt04bCreateExtras,
  parseAtt04bBalanceReject,
  type Att04bBalanceRejectDetail,
  type Att04bBalanceResolution,
} from '@/lib/attLeave04bRing';
import { coerceHrmListCompanyId } from '@/lib/hrmListScope';
import { resolveHrmLeaveCreateCompanyId } from '@/lib/hrmMetadataCompany';
import { toLeaveAttachmentUrlForApi } from '@/lib/leaveAttachment';
import {
  formatSickDayBranchesSummary,
  parseLeaveCreateDayBranches,
} from '@/lib/attLeave07Ring';
import { LEAVE_BALANCE_QUERY_KEY } from '@/hooks/useLeaveBalance';
import { LEAVE_BALANCE_PANEL_QUERY_KEY } from '@/hooks/useLeaveBalancesByType';
import { WEEKLY_ATTENDANCE_QUERY_KEY } from '@/hooks/useWeeklyAttendanceSummary';

export interface LeaveRequest {
  id: string; company_id: string; employee_id: string; employee_code: string; employee_name: string;
  department: string | null; position: string | null; leave_type: string; start_date: string; end_date: string;
  total_days: number; reason: string | null; handover_to: string | null; handover_tasks: string | null;
  approver_id: string | null; approver_name: string | null; status: string; approved_at: string | null;
  rejected_reason: string | null; attachment_url: string | null; notes: string | null;
  created_at: string; updated_at: string;
  /** Display-ready VI status (R-ATT-09-DISP) — prefer BE status_label. */
  statusLabelVi: string;
  leave_type_label?: string | null;
}

export interface LeaveRequestFormData {
  /** Employee's company slug or UUID — preferred over portal rollup `main`; payload maps to TEXT slug. */
  company_id?: string;
  employee_id: string; employee_code: string; employee_name: string; department?: string; position?: string;
  leave_type: string; start_date: string; end_date: string; total_days: number; reason?: string;
  handover_to?: string; handover_tasks?: string; approver_name?: string;
  /** Relative `/api/hrm/files/{scope}/…` after leave-attachment upload (BR-LEAVE-ATT-01). */
  attachment_url?: string;
  /** F-ATT-LEAVE-02 GAP — when ATT_04B_BALANCE_RESOLUTION_API_LIVE (BR-BP-LV-07 branch). */
  balance_resolution?: Att04bBalanceResolution;
}

/** Create outcome — overlap 409 or balance 400 for TYPE-BLOCK / GATE-REJECT UX. */
export type LeaveCreateOutcome =
  | { ok: true; request: LeaveRequest }
  | {
      ok: false;
      overlapConflictId: string | null;
      balanceReject?: Att04bBalanceRejectDetail | null;
      error: unknown;
    };

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
  const attachmentUrl = toLeaveAttachmentUrlForApi(data.attachment_url);
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
    ...(attachmentUrl ? { attachment_url: attachmentUrl } : {}),
    ...buildAtt04bCreateExtras(data.balance_resolution ?? null),
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
  const beStatusLabel =
    row.statusLabelVi ?? row.status_label ?? row.status_label_vi ?? null;
  return {
    id: row.id,
    company_id: row.company_id,
    employee_id: row.employee_id,
    employee_code: row.employee_code?.trim() || 'N/A',
    employee_name: row.employee_name?.trim() || row.employee_code?.trim() || 'N/A',
    department: row.department,
    position: row.position,
    leave_type: row.leave_type,
    leave_type_label: row.leave_type_label ?? null,
    start_date: row.start_date,
    end_date: row.end_date,
    total_days: Number.isFinite(totalDays) ? totalDays : 0,
    reason: row.reason,
    handover_to: row.handover_to,
    handover_tasks: row.handover_tasks,
    approver_id: row.approver_employee_id,
    approver_name: row.reviewed_by,
    status: row.status,
    statusLabelVi: resolveAtt09StatusLabelVi(row.status, beStatusLabel),
    approved_at: row.status === 'approved' ? reviewedAt : null,
    rejected_reason: row.rejected_reason,
    attachment_url: toLeaveAttachmentUrlForApi(row.attachment_url) ?? null,
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

  /** ATT-09 — panel pending↑ available↓ after hold/settle/release (F5 path). */
  const invalidateLeaveBalances = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: [LEAVE_BALANCE_QUERY_KEY] }),
      queryClient.invalidateQueries({ queryKey: [LEAVE_BALANCE_PANEL_QUERY_KEY] }),
    ]);
  }, [queryClient]);

  const fetchRequests = useCallback(async () => {
    await query.refetch();
  }, [query]);

  const createRequest = async (
    data: LeaveRequestFormData,
  ): Promise<LeaveRequest | LeaveCreateOutcome | null> => {
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
      // F-ATT-LEAVE-02 — POST /attendance/leave-requests → lockPending when tracked.
      const created = await createLeaveRequest(payload);
      const mapped = mapApiLeaveRequestToUi(created);
      const dayBranches = parseLeaveCreateDayBranches(created);
      await Promise.all([invalidateLeaveRequests(), invalidateLeaveBalances()]);
      const branchNote = dayBranches?.length
        ? formatSickDayBranchesSummary(dayBranches)
        : null;
      toast({
        title: t('messages.success'),
        description: branchNote
          ? `${t('hk.leave.createSuccess')} ${branchNote}`
          : t('hk.leave.createSuccess'),
      });
      return mapped;
    } catch (error: unknown) {
      console.error('Error creating leave request:', error);
      const balanceReject = parseAtt04bBalanceReject(error);
      if (balanceReject) {
        toast({
          title: t('messages.error'),
          description: att04bBalanceRejectBannerMessage(balanceReject),
          variant: 'destructive',
        });
        return {
          ok: false,
          overlapConflictId: null,
          balanceReject,
          error,
        };
      }
      toast({
        title: t('messages.error'),
        description: toErrorMessage(error, t('hk.leave.createError')),
        variant: 'destructive',
      });
      return {
        ok: false,
        overlapConflictId: parseAtt09OverlapConflictId(error),
        error,
      };
    }
  };

  const updateRequest = async (id: string, data: Partial<LeaveRequest>): Promise<boolean> => {
    const current = (queryClient.getQueryData<LeaveRequest[]>(queryKey) ?? []).find(
      (r) => r.id === id,
    );
    if (current && data.leave_type != null) {
      const gate = assertAtt09LeaveTypeUpdateAllowed(
        current.status,
        current.leave_type,
        data.leave_type,
      );
      if (!gate.allowed) {
        toast({
          title: t('messages.error'),
          description: att09TypeBlockMessage(),
          variant: 'destructive',
        });
        return false;
      }
    }
    queryClient.setQueryData<LeaveRequest[]>(queryKey, (prev) =>
      (prev ?? []).map((r) => (r.id === id ? { ...r, ...data } : r)),
    );
    return true;
  };

  const approveRequest = async (id: string): Promise<boolean> => {
    if (!currentCompanyId) return false;
    try {
      // F-ATT-LEAVE-03 — settle pending→used.
      const updated = await approveLeaveRequest(
        id,
        {
          reviewer_name: reviewerName,
          reviewer_employee_id: reviewerEmployeeId,
        },
        currentCompanyId,
      );
      const mapped = mapApiLeaveRequestToUi(updated);
      queryClient.setQueryData<LeaveRequest[]>(queryKey, (prev) =>
        (prev ?? []).map((r) => (r.id === id ? mapped : r)),
      );
      await invalidateLeaveBalances();
      return true;
    } catch (error: unknown) {
      console.error('Error approving leave request:', error);
      toast({ title: t('messages.error'), description: t('hk.leave.updateError'), variant: 'destructive' });
      return false;
    }
  };

  const rejectRequest = async (id: string, reason?: string): Promise<boolean> => {
    if (!currentCompanyId) return false;
    try {
      // F-ATT-LEAVE-03 — release 100% pending.
      const updated = await rejectLeaveRequest(
        id,
        {
          reviewer_name: reviewerName,
          reviewer_employee_id: reviewerEmployeeId,
          rejected_reason: reason,
        },
        currentCompanyId,
      );
      const mapped = mapApiLeaveRequestToUi(updated);
      queryClient.setQueryData<LeaveRequest[]>(queryKey, (prev) =>
        (prev ?? []).map((r) => (r.id === id ? mapped : r)),
      );
      await invalidateLeaveBalances();
      return true;
    } catch (error: unknown) {
      console.error('Error rejecting leave request:', error);
      toast({ title: t('messages.error'), description: t('hk.leave.updateError'), variant: 'destructive' });
      return false;
    }
  };

  const cancelRequest = async (id: string, reason?: string): Promise<boolean> => {
    if (!currentCompanyId) return false;
    try {
      const updated = await cancelLeaveRequest(
        id,
        {
          reviewer_name: reviewerName,
          reviewer_employee_id: reviewerEmployeeId,
          rejected_reason: reason,
        },
        currentCompanyId,
      );
      const mapped = mapApiLeaveRequestToUi(updated);
      queryClient.setQueryData<LeaveRequest[]>(queryKey, (prev) =>
        (prev ?? []).map((r) => (r.id === id ? mapped : r)),
      );
      await Promise.all([
        invalidateLeaveRequests(),
        queryClient.invalidateQueries({ queryKey: [WEEKLY_ATTENDANCE_QUERY_KEY] }),
        queryClient.invalidateQueries({ queryKey: [LEAVE_BALANCE_QUERY_KEY] }),
        queryClient.invalidateQueries({ queryKey: [LEAVE_BALANCE_PANEL_QUERY_KEY] }),
      ]);
      toast({
        title: t('messages.success'),
        description: t('hk.leave.cancelSuccess', { defaultValue: t('hk.leave.deleteSuccess') }),
      });
      return true;
    } catch (error: unknown) {
      console.error('Error cancelling leave request:', error);
      toast({
        title: t('messages.error'),
        description: toErrorMessage(
          error,
          t('hk.leave.cancelError', { defaultValue: t('hk.leave.deleteError') }),
        ),
        variant: 'destructive',
      });
      return false;
    }
  };

  /** @deprecated Prefer cancelRequest — soft cancel via Nest POST …/cancel (no hard delete). */
  const deleteRequest = cancelRequest;

  return {
    requests: query.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    fetchRequests,
    createRequest,
    updateRequest,
    approveRequest,
    rejectRequest,
    cancelRequest,
    deleteRequest,
    queryKey,
  };
}
