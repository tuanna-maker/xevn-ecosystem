/**
 * @CODE-MEMORY
 * Screen:     Dashboard — Nhắc việc HRM (leave pending + inbox)
 * UC:         UC/FR-HRM-U72-LABEL-01 · AC-FD-06
 * BR:         BR-CO-LABEL-01 · BR-U72-NULL-01
 * SRS:        docs/hrm/SRS_FIELD_DISPLAY.md §2 F-06
 * Purpose:    leave_type hiển thị catalog label; unknown → «—»
 * WorkItem:   D-HRM-U72-LABEL-FE-01
 * Coded:      2026-07-27
 * must_keep:  approveLeaveRequest path; LeaveTab leaveTypeDisplayLabel parity
 *
 * @CODE-MEMORY-CHANGE 2026-07-27
 * WorkItem: D-HRM-U72-LABEL-FE-01
 * change_mode: FIX
 * What: resolveLeaveTypeDisplayLabel (+ catalog options); unknown → «—»
 * Why: BA F-06 / AC-FD-06
 * SRS/BR: SRS_FIELD_DISPLAY.md F-06 · FR-HRM-U72-LABEL-01
 *
 * @CODE-MEMORY-CHANGE 2026-08-04 PO-UC-TC-W4-FE-AT12-L1-APPROVE-SCOPE-01
 * change_mode: FIX
 * What: onApproveLeave passes currentCompanyId into approveLeaveRequest (mutate scope)
 * Why: AT-12 L1 parity — dashboard remind Duyệt must not send x-company-id=main
 * must_keep: leave_type label; list pending path; U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-08-04 PO-UC-TC-W4-FE-NT01-INBOX-MARK-READ-01
 * change_mode: ADD
 * What: inbox summary via lib/hrmInboxNotificationDisplay (shared with /notifications)
 * Why: HRM-NT-01 single display map; mark-read invalidates hrm-inbox + hrm-api-reminders
 *
 * @CODE-MEMORY-CHANGE 2026-08-11 PO-HRM-LEAVE-TYPES-CONSUMER-ATT-FE-01
 * change_mode: FIX
 * What: Pending-leave labels via useAttLeaveTypesEffective (F-ATT-CAT-EFF-01); drop settings MD catalog SoT
 * Why: AC-SET-CONSUMER-LV-ATT-01 · BR-SET-CONSUMER-LV-SOT-02 · parity LeaveTab
 * must_keep: approveLeaveRequest scope; ATTLVTSOTQC1; U65 no seed; settings_catalog_e2e_ready=false
 */
import { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useAttLeaveTypesEffective } from '@/hooks/useAttLeaveTypesEffective';
import {
  approveLeaveRequest,
  listHrmInboxNotifications,
  listLeaveRequests,
  type HrmLeaveRequest,
} from '@/integrations/hrmApi';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { inboxNotificationSummary } from '@/lib/hrmInboxNotificationDisplay';
import { isHrmNestApiReachable } from '@/lib/hrmDataMode';

export function HrmApiReminders() {
  const queryClient = useQueryClient();
  const { currentCompanyId, memberships, profile } = useAuth();
  const employeeId = useMemo(
    () => memberships.find((m) => m.company_id === currentCompanyId)?.employee_id ?? null,
    [memberships, currentCompanyId],
  );
  const enabled = Boolean(isHrmNestApiReachable() && currentCompanyId && employeeId);

  const { leaveTypeDisplayLabel } = useAttLeaveTypesEffective({ enabled });

  const q = useQuery({
    queryKey: ['hrm-api-reminders', currentCompanyId, employeeId],
    queryFn: async () => {
      const [inboxRes, leaveRes] = await Promise.all([
        listHrmInboxNotifications({
          company_id: currentCompanyId!,
          employee_id: employeeId!,
          limit: 15,
        }),
        listLeaveRequests({ company_id: currentCompanyId!, status: 'pending' }),
      ]);
      return {
        inbox: inboxRes.data ?? [],
        pendingLeaves: leaveRes.data ?? [],
      };
    },
    enabled,
    refetchInterval: 45_000,
  });

  const reviewerName = profile?.full_name?.trim() || 'Web HRM';

  const onApproveLeave = async (id: string) => {
    if (!currentCompanyId) {
      toast.error('Thiếu phạm vi công ty để duyệt');
      return;
    }
    try {
      await approveLeaveRequest(
        id,
        { reviewer_name: reviewerName, reviewer_employee_id: employeeId ?? undefined },
        currentCompanyId,
      );
      toast.success('Đã duyệt đơn nghỉ');
      void queryClient.invalidateQueries({ queryKey: ['hrm-api-reminders', currentCompanyId, employeeId] });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Duyệt thất bại');
    }
  };

  if (!enabled) return null;
  if (q.isLoading || q.isError || !q.data) return null;

  const { inbox, pendingLeaves } = q.data;
  const workflowInbox = inbox.filter(
    (i) => i.event_type.startsWith('leave_request.') || i.event_type.startsWith('service_request.'),
  );
  if (!pendingLeaves.length && !workflowInbox.length) return null;

  return (
    <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/40">
      <p className="text-sm font-semibold uppercase tracking-wide text-xevn-textSecondary">Nhắc việc HRM</p>
      {workflowInbox.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Thông báo gần đây</p>
          {workflowInbox.slice(0, 5).map((row) => (
            <p key={row.id} className="text-xs text-slate-700 dark:text-slate-200">
              {inboxNotificationSummary(row)} — {new Date(row.created_at).toLocaleString('vi-VN')}
            </p>
          ))}
        </div>
      )}
      {pendingLeaves.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-amber-800 dark:text-amber-200">
            Đơn nghỉ chờ duyệt ({pendingLeaves.length})
          </p>
          {pendingLeaves.map((row: HrmLeaveRequest) => (
            <div
              key={row.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded border border-amber-200/80 bg-amber-50/80 p-2 text-xs dark:border-amber-800 dark:bg-amber-950/40"
            >
              <span className="text-slate-800 dark:text-slate-100">
                {(row.employee_name ?? '?') as string} — {leaveTypeDisplayLabel(row.leave_type)} ({row.start_date} → {row.end_date})
              </span>
              <Button size="sm" variant="default" className="h-7 text-xs" onClick={() => void onApproveLeave(row.id)}>
                Duyệt
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
