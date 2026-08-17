/**
 * @CODE-MEMORY-CHANGE
 * WorkItem: R-SPINE-WEB-APPROVE-UX-01 · 2026-08-03
 * change_mode: FIX
 * What: hrm_leave drawer primary action «Duyệt» (aria + visible); non-leave giữ «Hoàn thành»
 * Why: QA harness looked for Duyệt after open leave task — was Xử lý nhanh/Hoàn thành only
 * must_keep: isActionableWorkflowInboxTask gate; ACT-CC-WF-REJECT; U65 zero-seed
 */
import { X } from 'lucide-react';
import { NavTransitionShell } from '../../components/common/NavTransitionShell';
import { CapabilityActionButton } from '../../components/command-center/CapabilityActionButton';
import type { UnifiedTask } from '../../data/command-center-mock';
import { inboxApproveActionLabelVi, isHrmLeaveInboxTask } from '../../integrations/commandCenterInboxApi';
import type { WorkflowInstanceDetailPayload } from '../../integrations/workflowInstanceMapper';
import { workflowInstanceStatusLabelVi } from '../../integrations/workflowInstanceMapper';
import { isActionableWorkflowInboxTask } from '../../modules/hrm/inboxDeepLink';

type WorkflowTaskDetailDrawerProps = {
  open: boolean;
  task: UnifiedTask | null;
  detail: WorkflowInstanceDetailPayload | null;
  loading: boolean;
  detailLoadFailed: boolean;
  busy: boolean;
  inboxFromApi: boolean;
  onClose: () => void;
  onApprove: () => void;
  /** Parent shows AlertDialog (ACT-CC-WF-REJECT) before POST reject. */
  onRejectRequest: () => void;
};

function stepLabel(row: Record<string, unknown>, index: number): string {
  const key = row.step_key ?? row.stepKey ?? row.hat_key;
  if (key) return String(key);
  return `Bước ${index + 1}`;
}

export function WorkflowTaskDetailDrawer({
  open,
  task,
  detail,
  loading,
  detailLoadFailed,
  busy,
  inboxFromApi,
  onClose,
  onApprove,
  onRejectRequest,
}: WorkflowTaskDetailDrawerProps) {
  if (!open || !task) return null;

  const instance = detail?.instance;
  const steps = detail?.tasks ?? [];
  const actionable = isActionableWorkflowInboxTask(task);
  const leaveTask = isHrmLeaveInboxTask(task);
  /** Leave HDSD = «Duyệt»; other WF drawer keeps «Hoàn thành» (CH04). */
  const approveLabel = leaveTask ? inboxApproveActionLabelVi(task) : 'Hoàn thành';
  const approveAria = leaveTask ? approveLabel : 'Xử lý nhanh';
  const completeRuntime = {
    busy,
    blocked: loading || !inboxFromApi || !actionable,
    blockedReasonVi: !inboxFromApi
      ? 'Hộp thư chưa tải từ workflow-engine — kiểm tra XBOS API (28002) hoặc bật mock dev.'
      : !actionable
        ? 'Đang gắn mã nhiệm vụ (task id) — không dùng instance id để Xử lý.'
        : undefined,
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex justify-end bg-black/30"
      role="dialog"
      aria-modal
      aria-labelledby="inbox-task-detail-title"
    >
      <button type="button" className="flex-1 cursor-default" aria-label="Đóng" onClick={onClose} />
      <aside className="flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-xl">
        <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div id="inbox-task-detail-title">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Chi tiết nhiệm vụ</p>
            <h2 className="text-lg font-semibold text-slate-900">{task.title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Đóng panel"
          >
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="relative flex-1 overflow-y-auto text-sm text-slate-700">
          {loading ? (
            <NavTransitionShell variant="drawer" className="min-h-full" label="Đang tải chi tiết workflow…" />
          ) : detailLoadFailed ? (
            <div className="px-5 py-4">
              <p className="text-rose-700" role="alert">
                Không tải được chi tiết từ{' '}
                <code className="rounded bg-slate-100 px-1 text-xs">GET …/instances/:id/detail</code>. Kiểm tra
                xbos-api và instance id.
              </p>
            </div>
          ) : (
            <>
              <p>
                <span className="font-medium">Instance:</span> {task.sourceId}
              </p>
              {instance?.status ? (
                <p className="mt-2">
                  <span className="font-medium">Trạng thái:</span>{' '}
                  {workflowInstanceStatusLabelVi(String(instance.status))}
                </p>
              ) : null}
              <p className="mt-2">
                <span className="font-medium">Người nhận:</span> {task.assigneeName || 'Chưa gán'}
              </p>
              {task.subtitle ? <p className="mt-1 text-slate-500">{task.subtitle}</p> : null}
              {steps.length > 0 ? (
                <ul className="mt-4 space-y-2" aria-label="Các bước workflow">
                  {steps.map((s, i) => {
                    const row = s as Record<string, unknown>;
                    const status = String(row.status ?? 'pending');
                    return (
                      <li key={String(row.id ?? i)} className="rounded-lg border border-slate-100 px-3 py-2">
                        <span className="font-medium">{stepLabel(row, i)}</span>
                        <span className="ml-2 text-slate-500">{workflowInstanceStatusLabelVi(status)}</span>
                        {row.assignee_user_id ? (
                          <span className="mt-1 block text-xs text-xevn-textMuted">
                            Gán: {String(row.assignee_user_id)}
                          </span>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="mt-4 text-slate-500">Không có bước workflow chi tiết.</p>
              )}
            </>
          )}
        </div>
        <footer className="flex gap-2 border-t border-slate-100 px-5 py-4">
          <CapabilityActionButton
            capabilityCode="ACT-CC-WF-REJECT"
            variant="secondary"
            runtime={completeRuntime}
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            onClick={onRejectRequest}
          >
            Từ chối
          </CapabilityActionButton>
          <CapabilityActionButton
            capabilityCode="BTN-A1-INBOX-QUICK"
            accessibleName={approveAria}
            data-testid={leaveTask ? 'hdsd-cc-leave-approve' : 'cc-inbox-task-approve'}
            runtime={completeRuntime}
            className="flex-1 rounded-lg bg-[#1E40AF] px-3 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50"
            onClick={onApprove}
          >
            {approveLabel}
          </CapabilityActionButton>
        </footer>
      </aside>
    </div>
  );
}
