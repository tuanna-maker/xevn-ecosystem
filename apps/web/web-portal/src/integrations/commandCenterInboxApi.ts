/**
 * @CODE-MEMORY-CHANGE
 * WorkItem: R-SPINE-WEB-APPROVE-UX-01 · 2026-08-03
 * change_mode: ADD
 * What: map businessType=hrm_leave + helpers isHrmLeaveInboxTask / inboxApproveActionLabelVi («Duyệt»)
 * Why: QC GWC — CC leave tasks visible but Duyệt not actionable (label was Xử lý nhanh / aria mismatch)
 * must_keep: U65 zero-seed; cardId=task id; recruitment inbox labels unchanged
 */
import type { UnifiedTask, PortalStatusNormalized } from '../data/command-center-mock';
import { MASTER_TENANT_ID } from '../constants/tenant';
import { resolveWorkflowBusinessTypeLabel } from '../utils/workflowDisplayLabels';
import { getStoredUser } from './authSession';
import { listWorkflowTasks, type WorkflowStepTaskRow } from './workflowEngineApi';

/** True when inbox card is HRM leave approval (FE-origin or WF). */
export function isHrmLeaveInboxTask(task: {
  businessType?: string;
  subtitle?: string;
  title?: string;
}): boolean {
  const bt = (task.businessType ?? '').trim().toLowerCase();
  if (bt === 'hrm_leave' || bt.endsWith('_leave')) return true;
  const blob = `${task.subtitle ?? ''} ${task.title ?? ''}`.toLowerCase();
  return blob.includes('nghỉ phép') || blob.includes('hrm_leave');
}

/** HDSD/QA look for «Duyệt» on leave; other WF keep «Xử lý nhanh». */
export function inboxApproveActionLabelVi(task: {
  businessType?: string;
  subtitle?: string;
  title?: string;
}): string {
  return isHrmLeaveInboxTask(task) ? 'Duyệt' : 'Xử lý nhanh';
}

/** Logged-in portal user id (email) for workflow inbox assignee filter. */
export function resolveInboxAssigneeUserId(): string | undefined {
  const stored = getStoredUser();
  const fromUserId = stored?.userId?.trim();
  if (fromUserId) return fromUserId;
  // QA harness / legacy login payloads may persist `{ email }` without userId.
  const fromEmail = (stored as { email?: string } | null)?.email?.trim();
  if (fromEmail) return fromEmail;
  const dev =
    typeof import.meta.env.VITE_DEV_USER_ID === 'string' ? import.meta.env.VITE_DEV_USER_ID.trim() : '';
  return dev || undefined;
}

function mapBusinessTypeToModule(businessType: string): string {
  const key = businessType.toLowerCase();
  if (key.includes('hrm') || key.includes('hr') || key.includes('payroll')) return 'hrm';
  if (key.includes('finance') || key.includes('account')) return 'finance';
  if (key.includes('fleet') || key.includes('logistics')) return 'fleet';
  if (key.includes('catalog') || key.includes('xbos')) return 'x-bos';
  return 'business';
}

function mapStatus(status: string | undefined): PortalStatusNormalized {
  if (status === 'completed') return 'DONE';
  if (status === 'pending') return 'PENDING_APPROVAL';
  if (status === 'in_progress') return 'IN_PROGRESS';
  return 'OPEN';
}

export function mapWorkflowTaskToUnifiedTask(row: WorkflowStepTaskRow): UnifiedTask {
  const businessType = String(row.business_type ?? 'workflow');
  const typeLabel = resolveWorkflowBusinessTypeLabel(businessType);
  const workflowName = row.workflow_name?.trim();
  // PO-E2E-SPINE-01-BE-INBOX-01 — BE display-ready subject_title / display_title (YCTD stamp)
  const displayReady = row.display_title?.trim() || row.subject_title?.trim() || '';
  const title =
    displayReady ||
    workflowName ||
    (businessType.toLowerCase() === 'hrm_leave'
      ? `Yêu cầu ${typeLabel.toLowerCase()}`
      : String(row.step_key ?? 'Nhiệm vụ phê duyệt'));
  return {
    cardId: String(row.id),
    sourceSystem: 'xbos-workflow',
    sourceId: String(row.instance_id ?? row.id),
    dedupeKey: `wf-task-${row.id}`,
    statusNormalized: mapStatus(row.status),
    orgUnitId: String(row.company_id ?? row.tenant_id ?? ''),
    moduleCode: mapBusinessTypeToModule(businessType),
    title,
    subtitle: typeLabel,
    businessType,
    assigneeUserId: String(row.assignee_user_id ?? ''),
    assigneeName: String(row.assignee_user_id ?? 'Chưa gán'),
    workflowHatKey: row.hat_key ? String(row.hat_key) : undefined,
    dueAt: row.due_at ? String(row.due_at) : undefined,
    priority: 'medium',
  };
}

/** Inbox hội tụ từ workflow step tasks (pending). */
export async function fetchCommandCenterInboxTasks(
  tenantId = MASTER_TENANT_ID,
  assigneeUserId?: string,
  companyId?: string | null,
): Promise<UnifiedTask[]> {
  const assignee = assigneeUserId ?? resolveInboxAssigneeUserId();
  const rows = await listWorkflowTasks(tenantId, 'pending', assignee, companyId);
  return rows.map(mapWorkflowTaskToUnifiedTask);
}
