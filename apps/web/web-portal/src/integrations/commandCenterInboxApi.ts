import type { UnifiedTask, PortalStatusNormalized } from '../data/command-center-mock';
import { MASTER_TENANT_ID } from '../constants/tenant';
import { resolveWorkflowBusinessTypeLabel } from '../utils/workflowDisplayLabels';
import { getStoredUser } from './authSession';
import { listWorkflowTasks, type WorkflowStepTaskRow } from './workflowEngineApi';

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
  const title =
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
): Promise<UnifiedTask[]> {
  const assignee = assigneeUserId ?? resolveInboxAssigneeUserId();
  const rows = await listWorkflowTasks(tenantId, 'pending', assignee);
  return rows.map(mapWorkflowTaskToUnifiedTask);
}
