import { resolveHrmOperationalCompanyId } from '../../integrations/commandCenterScope';
import { IdentityScopeContext } from '../../integrations/identityScope';
import { buildApiAuthHeaders } from '../../integrations/authSession';
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

/** EX-SA01-P1-03 — list/embed queries always use operational `main`, never `holding`. */
function hrmListScope(scope: IdentityScopeContext): IdentityScopeContext {
  return {
    tenantId: scope.tenantId,
    companyId: resolveHrmOperationalCompanyId(scope.tenantId, scope.companyId),
  };
}

async function request<T>(path: string, init: RequestInit, scope?: IdentityScopeContext): Promise<T> {
  const headers: Record<string, string> = {
    ...buildApiAuthHeaders(),
    'Content-Type': 'application/json',
    'x-request-id': crypto.randomUUID(),
  };
  if (!headers.Authorization && SERVICE_JWT_TOKEN) {
    headers.Authorization = `Bearer ${SERVICE_JWT_TOKEN}`;
  } else if (!headers.Authorization && INTERNAL_API_KEY) {
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
  const listScope = hrmListScope(scope);
  const search = new URLSearchParams({
    company_id: listScope.companyId,
    tenant_id: scope.tenantId,
    status: 'pending',
    page_size: '10',
  });
  return request<{ total: number; data: EmployeeMetadataQueueItem[] }>(
    `/api/hrm/employee-metadata/change-requests?${search.toString()}`,
    { method: 'GET' },
    listScope,
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

export type HrmEmployeeApiRow = {
  id: string;
  employee_code: string;
  full_name: string;
  email: string;
  job_title_key: string | null;
  status: string;
  hired_at: string | null;
};

const HRM_LIST_MAX_PAGE_SIZE = 100;

export async function listHrmEmployees(scope: IdentityScopeContext) {
  const listScope = hrmListScope(scope);
  const q = new URLSearchParams({
    company_id: listScope.companyId,
    page_size: String(HRM_LIST_MAX_PAGE_SIZE),
  });
  return request<{ total: number; data: HrmEmployeeApiRow[] }>(
    `/api/hrm/employees?${q.toString()}`,
    { method: 'GET' },
    listScope,
  );
}

export type HrmPayslipApiRow = {
  id: string;
  employee_code: string;
  employee_name: string;
  period_label: string;
  gross_amount: number;
  deduction_amount: number;
  net_amount: number;
  status: string;
};

export async function listHrmPayslips(scope: IdentityScopeContext) {
  const listScope = hrmListScope(scope);
  const q = new URLSearchParams({ company_id: listScope.companyId });
  return request<{ total: number; data: HrmPayslipApiRow[] }>(
    `/api/hrm/payroll/payslips?${q.toString()}`,
    { method: 'GET' },
    listScope,
  );
}

export type HrmFleetVehicleRow = {
  id: string;
  license_plate: string;
  fleet_fields: Record<string, unknown>;
  status: string;
};

export async function listHrmFleetVehicles(scope: IdentityScopeContext, limit = 500) {
  const q = new URLSearchParams({ limit: String(limit) });
  return request<{ total: number; data: HrmFleetVehicleRow[] }>(
    `/api/hrm/fleet/vehicles?${q.toString()}`,
    { method: 'GET' },
    scope,
  );
}

export type HrmJobRequisitionRow = {
  id: string;
  title: string;
  department?: string | null;
  status: string;
  headcount?: number;
};

export type HrmAttendanceRecordRow = {
  id: string;
  employee_id: string;
  attendance_date: string;
  status: string;
};

export type HrmContractRow = {
  id: string;
  employee_id?: string;
  contract_type?: string;
  status: string;
  end_date?: string | null;
};

/** BR-INS-01 — dedicated BHXH list (P1-EX-BE-02 shaped fields). */
export type HrmInsuranceApiRow = {
  id: string;
  company_id: string;
  employee_id: string;
  provider: string;
  policy_number: string;
  expiry_date: string;
  status: string;
  social_insurance_number?: string | null;
  health_insurance_number?: string | null;
  employee_name?: string | null;
  employee_code?: string | null;
  department?: string | null;
  effective_date?: string | null;
};

export async function listHrmJobRequisitions(scope: IdentityScopeContext) {
  const listScope = hrmListScope(scope);
  const q = new URLSearchParams({ company_id: listScope.companyId });
  return request<{ total: number; data: HrmJobRequisitionRow[] }>(
    `/api/hrm/recruitment/requisitions?${q.toString()}`,
    { method: 'GET' },
    listScope,
  );
}

export async function listHrmAttendanceRecords(scope: IdentityScopeContext) {
  const listScope = hrmListScope(scope);
  const q = new URLSearchParams({ company_id: listScope.companyId });
  return request<{ total: number; data: HrmAttendanceRecordRow[] }>(
    `/api/hrm/attendance/records?${q.toString()}`,
    { method: 'GET' },
    listScope,
  );
}

export async function listHrmContracts(scope: IdentityScopeContext) {
  const listScope = hrmListScope(scope);
  const q = new URLSearchParams({ company_id: listScope.companyId });
  return request<{ total: number; data: HrmContractRow[] }>(
    `/api/hrm/contracts-insurance/contracts?${q.toString()}`,
    { method: 'GET' },
    listScope,
  );
}

export async function listHrmInsurance(scope: IdentityScopeContext) {
  const listScope = hrmListScope(scope);
  const q = new URLSearchParams({ company_id: listScope.companyId });
  return request<{ total: number; data: HrmInsuranceApiRow[] }>(
    `/api/hrm/contracts-insurance/insurance?${q.toString()}`,
    { method: 'GET' },
    listScope,
  );
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const HRM_OPS_COMPANY_UUID =
  import.meta.env.VITE_HRM_OPERATIONS_COMPANY_ID ?? '10000000-0000-4000-8000-000000000001';

function resolveHrmCompanyId(scope: IdentityScopeContext): string {
  const listScope = hrmListScope(scope);
  return UUID_RE.test(listScope.companyId) ? listScope.companyId : HRM_OPS_COMPANY_UUID;
}

export type HrmOperationsTaskRow = {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  due_date: string | null;
};

export type HrmServiceRequestRow = {
  id: string;
  employee_name: string;
  service_type: string;
  department: string | null;
  request_date: string;
  status: string;
};

export type HrmOperationsSummary = {
  attendance_records: number;
  payroll_periods: number;
  job_requisitions: number;
  tasks: number;
};

export async function listHrmOperationsTasks(scope: IdentityScopeContext) {
  const listScope = hrmListScope(scope);
  const companyId = resolveHrmCompanyId(listScope);
  const q = new URLSearchParams({ company_id: companyId, page_size: '50' });
  return request<{ total: number; data: HrmOperationsTaskRow[] }>(
    `/api/hrm/operations/tasks?${q.toString()}`,
    { method: 'GET' },
    listScope,
  );
}

export async function listHrmServiceRequests(scope: IdentityScopeContext) {
  const listScope = hrmListScope(scope);
  const companyId = resolveHrmCompanyId(listScope);
  const q = new URLSearchParams({ company_id: companyId, page_size: '50' });
  return request<{ total: number; data: HrmServiceRequestRow[] }>(
    `/api/hrm/operations/service-requests?${q.toString()}`,
    { method: 'GET' },
    listScope,
  );
}

export async function getHrmOperationsSummary(scope: IdentityScopeContext) {
  const listScope = hrmListScope(scope);
  const companyId = resolveHrmCompanyId(listScope);
  const q = new URLSearchParams({ company_id: companyId, tenant_id: listScope.tenantId });
  return request<HrmOperationsSummary>(
    `/api/hrm/operations/reports/summary?${q.toString()}`,
    { method: 'GET' },
    listScope,
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
