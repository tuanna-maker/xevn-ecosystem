import { xbosFetch, xbosGetData } from './xbosHttp';
import type { WorkflowDefinitionApiRow } from './workflowMapper';
import {
  apiRowToWorkflowInstanceListItem,
  type WorkflowInstanceListItem,
} from './workflowInstanceMapper';

function scopeInit(
  tenantIdHint?: string | null,
  companyIdHint?: string | null,
  withBody = false,
) {
  return {
    tenantId: tenantIdHint ?? undefined,
    companyId: companyIdHint ?? undefined,
    headers: withBody ? { 'Content-Type': 'application/json' } : undefined,
  };
}

export async function listWorkflowDefinitions(
  tenantIdHint?: string | null,
  companyIdHint?: string | null,
): Promise<WorkflowDefinitionApiRow[]> {
  const init = scopeInit(tenantIdHint, companyIdHint);
  const data = await xbosGetData<{ items?: WorkflowDefinitionApiRow[] }>('/workflow-engine/definitions', {
    scope: 'workflow-engine.definitions.list',
    ...init,
  });
  return data?.items ?? [];
}

export async function saveWorkflowDefinition(
  payload: Record<string, unknown>,
  definitionId?: string,
  tenantIdHint?: string | null,
  companyIdHint?: string | null,
): Promise<WorkflowDefinitionApiRow> {
  const init = scopeInit(tenantIdHint, companyIdHint, true);
  const path = definitionId
    ? `/workflow-engine/definitions/${encodeURIComponent(definitionId)}`
    : '/workflow-engine/definitions';
  const envelope = await xbosFetch<{ data?: WorkflowDefinitionApiRow }>(path, {
    method: definitionId ? 'PUT' : 'POST',
    scope: definitionId ? 'workflow-engine.definitions.update' : 'workflow-engine.definitions.create',
    ...init,
    body: JSON.stringify(payload),
  });
  if (!envelope?.data) throw new Error('workflow save returned empty payload');
  return envelope.data;
}

export async function listWorkflowInstances(
  tenantIdHint?: string | null,
  companyIdHint?: string | null,
  status?: string,
): Promise<WorkflowInstanceListItem[]> {
  const init = scopeInit(tenantIdHint, companyIdHint);
  const q = status ? `?status=${encodeURIComponent(status)}` : '';
  const data = await xbosGetData<{ items?: Record<string, unknown>[] }>(`/workflow-engine/instances${q}`, {
    scope: 'workflow-engine.instances.list',
    ...init,
  });
  return (data?.items ?? []).map((row) => apiRowToWorkflowInstanceListItem(row));
}

export type WorkflowStepTaskRow = {
  id: string;
  instance_id?: string;
  step_key?: string;
  status?: string;
  assignee_user_id?: string | null;
  due_at?: string | null;
  business_type?: string;
  business_id?: string;
  workflow_name?: string;
  workflow_code?: string;
  company_id?: string;
  tenant_id?: string;
};

export async function listWorkflowTasks(
  tenantIdHint?: string | null,
  status = 'pending',
  assigneeUserId?: string,
): Promise<WorkflowStepTaskRow[]> {
  const search = new URLSearchParams();
  if (tenantIdHint) search.set('tenantId', tenantIdHint);
  if (status) search.set('status', status);
  if (assigneeUserId) search.set('assigneeUserId', assigneeUserId);
  const q = search.toString() ? `?${search.toString()}` : '';
  const data = await xbosGetData<{ items?: WorkflowStepTaskRow[] }>(`/workflow-engine/tasks${q}`, {
    scope: 'workflow-engine.tasks.list',
    tenantId: tenantIdHint ?? undefined,
  });
  return data?.items ?? [];
}

export async function listReportingRoutes(tenantIdHint?: string | null, companyIdHint?: string | null) {
  const init = scopeInit(tenantIdHint, companyIdHint);
  const data = await xbosGetData<{ items?: unknown[] }>('/workflow-engine/reporting-routes', {
    scope: 'workflow-engine.reporting-routes',
    ...init,
  });
  return data?.items ?? [];
}

export async function fetchWorkflowInstanceDetail(
  instanceId: string,
  tenantIdHint?: string | null,
  companyIdHint?: string | null,
): Promise<Record<string, unknown> | null> {
  const init = scopeInit(tenantIdHint, companyIdHint);
  try {
    const data = await xbosGetData<Record<string, unknown>>(
      `/workflow-engine/instances/${encodeURIComponent(instanceId)}/detail`,
      { scope: 'workflow-engine.instances.detail', ...init },
    );
    return data ?? null;
  } catch {
    return null;
  }
}

export async function completeWorkflowTask(
  taskId: string,
  payload: Record<string, unknown> = { outcome: 'approved' },
  tenantIdHint?: string | null,
): Promise<unknown> {
  const init = scopeInit(tenantIdHint, null, true);
  const envelope = await xbosFetch<{ data?: unknown }>(
    `/workflow-engine/tasks/${encodeURIComponent(taskId)}/complete`,
    {
      method: 'POST',
      scope: 'workflow-engine.tasks.complete',
      ...init,
      body: JSON.stringify(payload),
    },
  );
  return envelope?.data;
}
