import type { UnifiedTask, PortalStatusNormalized } from '../data/command-center-mock';
import { MASTER_TENANT_ID } from '../constants/tenant';
import { listWorkflowTasks, type WorkflowStepTaskRow } from './workflowEngineApi';

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
  return {
    cardId: String(row.id),
    sourceSystem: 'xbos-workflow',
    sourceId: String(row.instance_id ?? row.id),
    dedupeKey: `wf-task-${row.id}`,
    statusNormalized: mapStatus(row.status),
    orgUnitId: String(row.company_id ?? row.tenant_id ?? ''),
    moduleCode: mapBusinessTypeToModule(businessType),
    title: String(row.workflow_name ?? row.step_key ?? 'Nhiệm vụ phê duyệt'),
    subtitle: businessType,
    assigneeUserId: String(row.assignee_user_id ?? ''),
    assigneeName: String(row.assignee_user_id ?? 'Chưa gán'),
    dueAt: row.due_at ? String(row.due_at) : undefined,
    priority: 'medium',
  };
}

/** Inbox hội tụ từ workflow step tasks (pending). */
export async function fetchCommandCenterInboxTasks(
  tenantId = MASTER_TENANT_ID,
  assigneeUserId?: string,
): Promise<UnifiedTask[]> {
  const devUser =
    assigneeUserId ??
    (typeof import.meta.env.VITE_DEV_USER_ID === 'string' ? import.meta.env.VITE_DEV_USER_ID : undefined);
  const rows = await listWorkflowTasks(tenantId, 'pending', devUser);
  return rows.map(mapWorkflowTaskToUnifiedTask);
}
