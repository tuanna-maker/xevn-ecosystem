import type { WorkflowGraphStep } from '../data/workflow-graph';

export type WorkflowInstanceListItem = {
  id: string;
  definitionId: string;
  workflowCode: string;
  workflowName: string;
  status: string;
  businessType: string;
  businessId: string;
  createdAt: string;
};

export type WorkflowInstanceDetailPayload = {
  instance: Record<string, unknown>;
  tasks: Record<string, unknown>[];
};

export type WorkflowStepRuntimeStatus = 'pending' | 'completed' | 'rejected';

export function apiRowToWorkflowInstanceListItem(row: Record<string, unknown>): WorkflowInstanceListItem {
  return {
    id: String(row.id ?? ''),
    definitionId: String(row.definition_id ?? row.definitionId ?? ''),
    workflowCode: String(row.workflow_code ?? row.workflowCode ?? ''),
    workflowName: String(row.workflow_name ?? row.workflowName ?? ''),
    status: String(row.status ?? 'pending'),
    businessType: String(row.business_type ?? row.businessType ?? ''),
    businessId: String(row.business_id ?? row.businessId ?? ''),
    createdAt: String(row.created_at ?? row.createdAt ?? ''),
  };
}

export function normalizeWorkflowInstanceDetail(
  raw: Record<string, unknown> | null,
): WorkflowInstanceDetailPayload | null {
  if (!raw || typeof raw !== 'object') return null;
  const tasks = Array.isArray(raw.tasks)
    ? (raw.tasks as Record<string, unknown>[])
    : Array.isArray(raw.steps)
      ? (raw.steps as Record<string, unknown>[])
      : [];
  const instance =
    raw.instance && typeof raw.instance === 'object'
      ? (raw.instance as Record<string, unknown>)
      : raw;
  return { instance, tasks };
}

export function buildStepRuntimeStatusMap(
  tasks: Record<string, unknown>[],
): Record<string, WorkflowStepRuntimeStatus> {
  const out: Record<string, WorkflowStepRuntimeStatus> = {};
  for (const task of tasks) {
    const key = String(task.step_key ?? task.stepKey ?? '').trim();
    if (!key) continue;
    const status = String(task.status ?? 'pending').toLowerCase();
    if (status === 'completed' || status === 'rejected' || status === 'pending') {
      out[key] = status;
    } else {
      out[key] = 'pending';
    }
  }
  return out;
}

/** Match graph step id, step_key, or order-based keys from runtime tasks. */
export function resolveStepRuntimeStatus(
  step: WorkflowGraphStep,
  statusByKey: Record<string, WorkflowStepRuntimeStatus>,
): WorkflowStepRuntimeStatus | undefined {
  const direct = statusByKey[step.id];
  if (direct) return direct;
  const byOrder = statusByKey[`step-${step.order}`];
  if (byOrder) return byOrder;
  const byOrderPadded = statusByKey[`step_${step.order}`];
  if (byOrderPadded) return byOrderPadded;
  return undefined;
}

export function countInstancesByDefinitionId(
  items: WorkflowInstanceListItem[],
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const item of items) {
    if (!item.definitionId) continue;
    counts[item.definitionId] = (counts[item.definitionId] ?? 0) + 1;
  }
  return counts;
}

export function workflowInstanceStatusLabelVi(status: string): string {
  switch (status) {
    case 'completed':
      return 'Hoàn thành';
    case 'rejected':
      return 'Từ chối';
    case 'pending':
      return 'Đang chờ';
    case 'running':
      return 'Đang chạy';
    default:
      return status || '—';
  }
}
