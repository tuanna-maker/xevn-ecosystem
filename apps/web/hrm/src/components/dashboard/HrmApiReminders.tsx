import { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import {
  approveLeaveRequest,
  listHrmInboxNotifications,
  listLeaveRequests,
  type HrmInboxNotification,
  type HrmLeaveRequest,
} from '@/integrations/hrmApi';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

function inboxSummary(n: HrmInboxNotification): string {
  if (n.event_type === 'leave_request.created') return 'Đơn nghỉ mới (HRM API)';
  if (n.event_type === 'leave_request.approved') return 'Đơn nghỉ đã duyệt';
  if (n.event_type === 'leave_request.rejected') return 'Đơn nghỉ bị từ chối';
  if (n.event_type === 'service_request.created') return 'Yêu cầu dịch vụ mới';
  if (n.event_type === 'service_request.approved') return 'Yêu cầu dịch vụ đã duyệt';
  if (n.event_type === 'service_request.rejected') return 'Yêu cầu dịch vụ bị từ chối';
  return n.event_type;
}

export function HrmApiReminders() {
  const queryClient = useQueryClient();
  const { currentCompanyId, memberships, profile } = useAuth();
  const employeeId = useMemo(
    () => memberships.find((m) => m.company_id === currentCompanyId)?.employee_id ?? null,
    [memberships, currentCompanyId],
  );
  const hrmOrigin = import.meta.env.VITE_HRM_API_ORIGIN?.trim();
  const enabled = Boolean(hrmOrigin && currentCompanyId && employeeId);

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
    try {
      await approveLeaveRequest(id, { reviewer_name: reviewerName, reviewer_employee_id: employeeId ?? undefined });
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
      <p className="text-xs font-semibold uppercase text-slate-600 dark:text-slate-300">HRM API (Postgres dev)</p>
      {workflowInbox.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Thông báo trong DB / inbox</p>
          {workflowInbox.slice(0, 5).map((row) => (
            <p key={row.id} className="text-xs text-slate-700 dark:text-slate-200">
              {inboxSummary(row)} — {new Date(row.created_at).toLocaleString('vi-VN')}
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
                {(row.employee_name ?? '?') as string} — {row.leave_type} ({row.start_date} → {row.end_date})
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
