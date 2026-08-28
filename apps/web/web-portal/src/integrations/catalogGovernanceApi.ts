import { MASTER_TENANT_ID } from '../constants/tenant';
import { buildApiAuthHeaders } from './authSession';

function headers(userId?: string) {
  const h = buildApiAuthHeaders(userId);
  h['x-tenant-id'] = MASTER_TENANT_ID;
  h['x-company-id'] = MASTER_TENANT_ID;
  return h;
}

export type CatalogApprovalTask = {
  id: string;
  instance_id: string;
  step_key: string;
  hat_key: string;
  assignee_user_id: string;
  status: string;
  business_id: string;
  business_type: string;
  workflow_code: string;
  workflow_name: string;
  context?: Record<string, unknown>;
  created_at: string;
};

export async function seedXeDuLichCatalogWorkflow() {
  const res = await fetch('/api/xbos/catalog-governance/workflows/seed-xe-du-lich-catalog', {
    method: 'POST',
    headers: headers(),
    body: '{}',
  });
  if (!res.ok) throw new Error('seed workflow failed');
  return res.json();
}

export async function fetchCatalogApprovalInbox(assigneeUserId: string) {
  const q = new URLSearchParams({ 
    assigneeUserId,
    tenantId: MASTER_TENANT_ID,
    companyId: MASTER_TENANT_ID
  });
  const res = await fetch(`/api/xbos/catalog-governance/inbox?${q}`, { headers: headers(assigneeUserId) });
  if (!res.ok) throw new Error('inbox load failed');
  const json = await res.json();
  return (json?.data?.items ?? []) as CatalogApprovalTask[];
}

export async function fetchCatalogApprovalDetail(instanceId: string) {
  const res = await fetch(`/api/xbos/catalog-governance/instances/${encodeURIComponent(instanceId)}`, {
    headers: headers(),
  });
  if (!res.ok) throw new Error('detail load failed');
  const json = await res.json();
  return json?.data as {
    instance: Record<string, unknown>;
    tasks: Record<string, unknown>[];
    batchDetail: { batchId: string; items: Array<Record<string, unknown>> };
  };
}

export async function approveCatalogTask(taskId: string, reviewerUserId: string, reviewNote?: string) {
  const res = await fetch(`/api/xbos/catalog-governance/tasks/${encodeURIComponent(taskId)}/approve`, {
    method: 'POST',
    headers: headers(reviewerUserId),
    body: JSON.stringify({ review_note: reviewNote ?? null }),
  });
  if (!res.ok) throw new Error('approve failed');
  return res.json();
}

export async function rejectCatalogTask(taskId: string, reviewerUserId: string, reviewNote?: string) {
  const res = await fetch(`/api/xbos/catalog-governance/tasks/${encodeURIComponent(taskId)}/reject`, {
    method: 'POST',
    headers: headers(reviewerUserId),
    body: JSON.stringify({ review_note: reviewNote ?? null }),
  });
  if (!res.ok) throw new Error('reject failed');
  return res.json();
}
