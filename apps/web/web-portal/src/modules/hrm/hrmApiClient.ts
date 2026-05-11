import { IdentityScopeContext } from '../../integrations/identityScope';
import {
  mapCaughtFetchError,
  mapFailedHttpResponse,
  mapInvalidSuccessEnvelope,
  type HrmApiEnvelope,
} from './hrmApiErrors';

export { HrmApiClientError } from './hrmApiErrors';

const HRM_API_ORIGIN = (import.meta.env.VITE_HRM_API_ORIGIN ?? '').replace(/\/$/, '');
const SERVICE_JWT_TOKEN = import.meta.env.VITE_SERVICE_JWT_TOKEN;
const INTERNAL_API_KEY = import.meta.env.DEV
  ? import.meta.env.VITE_INTERNAL_API_KEY ?? 'xevn-dev-internal-key'
  : undefined;
const REQUEST_TIMEOUT_MS = 10_000;

async function request<T>(path: string, init: RequestInit, scope?: IdentityScopeContext): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-request-id': crypto.randomUUID(),
  };
  if (SERVICE_JWT_TOKEN) {
    headers.Authorization = `Bearer ${SERVICE_JWT_TOKEN}`;
  } else if (INTERNAL_API_KEY) {
    headers['x-internal-api-key'] = INTERNAL_API_KEY;
  }
  if (scope) {
    headers['x-tenant-id'] = scope.tenantId;
    headers['x-company-id'] = scope.companyId;
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(`${HRM_API_ORIGIN}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        ...headers,
        ...(init.headers ?? {}),
      },
    });
  } catch (error) {
    throw mapCaughtFetchError(error);
  } finally {
    window.clearTimeout(timeoutId);
  }

  const body = (await res.json().catch(() => null)) as HrmApiEnvelope<T> | null;
  if (!res.ok) {
    throw mapFailedHttpResponse(res.status, body);
  }
  if (!body || !body.success || body.data === undefined) {
    throw mapInvalidSuccessEnvelope(res.status, body);
  }
  return body.data as T;
}

export type EmployeeMetadataQueueItem = {
  id: string;
  company_id: string;
  employee_id: string;
  legal_entity_id: string | null;
  field_key: string;
  current_value: unknown;
  requested_value: unknown;
  reason: string | null;
  actor_user_id: string | null;
  actor_name: string | null;
  workflow_code: string | null;
  source_catalog_key: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  decided_by: string | null;
  decided_note: string | null;
  decided_at: string | null;
  submitted_at: string;
  updated_at: string;
};

export async function listEmployeeMetadataQueue(scope: IdentityScopeContext) {
  const search = new URLSearchParams({
    company_id: scope.companyId,
    tenant_id: scope.tenantId,
    status: 'pending',
    page_size: '10',
  });
  return request<{ total: number; data: EmployeeMetadataQueueItem[] }>(
    `/api/hrm/employee-metadata/change-requests?${search.toString()}`,
    { method: 'GET' },
    scope,
  );
}

export async function approveEmployeeMetadataRequest(changeRequestId: string, payload?: {
  actor_user_id?: string;
  actor_name?: string;
  note?: string;
}, scope?: IdentityScopeContext) {
  return request<EmployeeMetadataQueueItem>(
    `/api/hrm/employee-metadata/change-requests/${changeRequestId}/approve`,
    {
      method: 'POST',
      body: JSON.stringify(payload ?? {}),
    },
    scope,
  );
}

export async function rejectEmployeeMetadataRequest(changeRequestId: string, payload?: {
  actor_user_id?: string;
  actor_name?: string;
  note?: string;
}, scope?: IdentityScopeContext) {
  return request<EmployeeMetadataQueueItem>(
    `/api/hrm/employee-metadata/change-requests/${changeRequestId}/reject`,
    {
      method: 'POST',
      body: JSON.stringify(payload ?? {}),
    },
    scope,
  );
}
