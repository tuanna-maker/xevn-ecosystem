/**
 * @CODE-MEMORY
 * Screen: Command Center — workflow-engine definitions / inbox tasks
 * UC: UC-CC-P0-06 · UC-XBOS-CC-06 · UF-XBOS-08
 * SRS: docs/qa/professional/by-uc/UC-CC-P0-06.md · UC-XBOS-CC-06.md
 * TechSpec: workflow-engine tasks complete/reject · definitions PUT
 * Purpose: Client XBOS workflow-engine — list/save definitions, inbox tasks, approve/reject.
 * WorkItem: PO-UC-TC-W4-DEV-FE-INB-X-COMPANY-01
 * Coded: 2026-08-04
 * Callers: CommandCenterPage · CommandCenterInboxPage · commandCenterInboxApi
 * Callees: xbosHttp · commandCenterScope (strict x-company-id)
 * must_keep: leave approve XBOS-WF-200 path · DEPT VAL-014 · Leave L2 not invented
 * LastVerified: workflowEngineApi.inbox.test.ts
 *
 * @CODE-MEMORY-CHANGE
 * WorkItem: PO-UC-TC-W4-DEV-FE-INB-X-COMPANY-01 · 2026-08-04
 * change_mode: FIX
 * What: scopeInit luôn resolve x-company-id (strict) — complete/reject/list tasks parity với definitions PUT
 * Why: QA R-W4E1-INB-X-COMPANY — Playwright capture null header trên POST …/tasks/:id/complete
 * must_keep: applyWorkflowInboxTaskDecision approve path; không seed; không invent Leave L2
 */

import { getStoredUser } from './authSession';
import { resolveXbosStrictCompanyId } from './commandCenterScope';
import { coalesceGet } from './requestCoalescer';
import { xbosFetch, xbosGetData } from './xbosHttp';
import type { WorkflowDefinitionApiRow } from './workflowMapper';
import {
  apiRowToWorkflowInstanceListItem,
  type WorkflowInstanceListItem,
} from './workflowInstanceMapper';

/** Always set companyId so xbosHttp emits x-company-id (strict — never holding). */
function scopeInit(
  tenantIdHint?: string | null,
  companyIdHint?: string | null,
  withBody = false,
) {
  return {
    tenantId: tenantIdHint ?? undefined,
    companyId: resolveXbosStrictCompanyId(tenantIdHint, companyIdHint),
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
  hat_key?: string;
  status?: string;
  assignee_user_id?: string | null;
  due_at?: string | null;
  business_type?: string;
  business_id?: string;
  workflow_name?: string;
  workflow_code?: string;
  company_id?: string;
  tenant_id?: string;
  /** BE display-ready — YCTD/leave subject for this-wave Inbox match (PO-E2E-SPINE-01-BE-INBOX-01) */
  subject_title?: string | null;
  display_title?: string | null;
};

export async function listWorkflowTasks(
  tenantIdHint?: string | null,
  status = 'pending',
  assigneeUserId?: string,
  companyIdHint?: string | null,
): Promise<WorkflowStepTaskRow[]> {
  const search = new URLSearchParams();
  if (tenantIdHint) search.set('tenantId', tenantIdHint);
  if (status) search.set('status', status);
  if (assigneeUserId) search.set('assigneeUserId', assigneeUserId);
  const q = search.toString() ? `?${search.toString()}` : '';
  const init = scopeInit(tenantIdHint, companyIdHint);
  // In-flight dedupe only (no stale cache) — the inbox reloads after approve/reject must stay fresh.
  const data = await coalesceGet<{ items?: WorkflowStepTaskRow[] }>(
    `workflow-engine.tasks.list:${tenantIdHint ?? ''}:${status}:${assigneeUserId ?? ''}:${init.companyId}`,
    () =>
      xbosGetData<{ items?: WorkflowStepTaskRow[] }>(`/workflow-engine/tasks${q}`, {
        scope: 'workflow-engine.tasks.list',
        ...init,
      }),
  );
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

export function buildWorkflowTaskActionPayload(
  input: { workflowHatKey?: string },
  outcome: 'approved' | 'rejected',
  userId?: string,
): Record<string, unknown> {
  const uid =
    userId?.trim() ||
    getStoredUser()?.userId?.trim() ||
    (typeof import.meta.env.VITE_DEV_USER_ID === 'string' ? import.meta.env.VITE_DEV_USER_ID.trim() : '') ||
    'ceo@xe.vn';
  const payload: Record<string, unknown> = {
    outcome,
    userId: uid,
  };
  if (input.workflowHatKey) payload.hatKey = input.workflowHatKey;
  if (outcome === 'rejected') payload.reason = 'rejected_from_portal';
  return payload;
}

export async function completeWorkflowTask(
  taskId: string,
  payload: Record<string, unknown> = { outcome: 'approved' },
  tenantIdHint?: string | null,
  companyIdHint?: string | null,
): Promise<unknown> {
  const init = scopeInit(tenantIdHint, companyIdHint, true);
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

export async function rejectWorkflowTask(
  taskId: string,
  payload: Record<string, unknown> = { reason: 'rejected_from_portal' },
  tenantIdHint?: string | null,
  companyIdHint?: string | null,
): Promise<unknown> {
  const init = scopeInit(tenantIdHint, companyIdHint, true);
  const envelope = await xbosFetch<{ data?: unknown }>(
    `/workflow-engine/tasks/${encodeURIComponent(taskId)}/reject`,
    {
      method: 'POST',
      scope: 'workflow-engine.tasks.reject',
      ...init,
      body: JSON.stringify(payload),
    },
  );
  return envelope?.data;
}

/** Approve or reject a workflow step task (real API — P0-CRUD-06 / BR-INBOX-01). */
export async function applyWorkflowInboxTaskDecision(
  task: { cardId: string; workflowHatKey?: string },
  outcome: 'approved' | 'rejected',
  tenantIdHint?: string | null,
  userId?: string,
  companyIdHint?: string | null,
): Promise<unknown> {
  const payload = buildWorkflowTaskActionPayload(task, outcome, userId);
  if (outcome === 'rejected') {
    return rejectWorkflowTask(task.cardId, payload, tenantIdHint, companyIdHint);
  }
  return completeWorkflowTask(task.cardId, payload, tenantIdHint, companyIdHint);
}
