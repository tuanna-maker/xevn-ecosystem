import { supabase } from "@/integrations/supabase/client";
import { ApiClientError } from "@/lib/apiError";

const HRM_API_ORIGIN = (import.meta.env.VITE_HRM_API_ORIGIN ?? "").replace(/\/$/, "");
const SERVICE_JWT_TOKEN = import.meta.env.VITE_SERVICE_JWT_TOKEN;
const INTERNAL_API_KEY = import.meta.env.DEV ? import.meta.env.VITE_INTERNAL_API_KEY : undefined;

type HrmEnvelope<T> = {
  success: boolean;
  code: string;
  message: string;
  data?: T;
  details?: unknown;
};

export type HrmSpreadsheetScope = {
  tenantId: string;
  companyId: string;
};

type HrmHeaderOptions = {
  /** Omit for `FormData` / binary so the runtime sets `Content-Type` (multipart boundary). */
  omitContentType?: boolean;
  /** Required for spreadsheet import preview/commit when the caller JWT has no tenant/company claims. */
  scope?: HrmSpreadsheetScope;
};

function inferRuntimeScope(): HrmSpreadsheetScope | undefined {
  if (typeof window === "undefined") return undefined;
  const rawCompanyId =
    localStorage.getItem("hrm_current_company_id") ||
    sessionStorage.getItem("hrm_current_company_id") ||
    undefined;
  const companyId =
    rawCompanyId && rawCompanyId !== "all"
      ? rawCompanyId
      : (import.meta.env.VITE_HRM_SCOPE_COMPANY_ID?.trim() || "holding");
  if (!companyId) return undefined;
  const tenantId =
    localStorage.getItem("hrm_current_tenant_id") ||
    sessionStorage.getItem("hrm_current_tenant_id") ||
    import.meta.env.VITE_HRM_SCOPE_TENANT_ID?.trim() ||
    companyId;
  return { tenantId, companyId };
}

async function headers(opts?: HrmHeaderOptions) {
  const baseHeaders: Record<string, string> = {
    "x-request-id": crypto.randomUUID(),
  };
  if (!opts?.omitContentType) {
    baseHeaders["Content-Type"] = "application/json";
  }

  const { data } = await supabase.auth.getSession();
  const sessionToken = data.session?.access_token;
  if (sessionToken) {
    baseHeaders.Authorization = `Bearer ${sessionToken}`;
  } else if (SERVICE_JWT_TOKEN) {
    baseHeaders.Authorization = `Bearer ${SERVICE_JWT_TOKEN}`;
  } else if (INTERNAL_API_KEY) {
    // Dev-only fallback when no JWT token is provisioned in local environment.
    baseHeaders["x-internal-api-key"] = INTERNAL_API_KEY;
  }

  const effectiveScope = opts?.scope ?? inferRuntimeScope();
  if (effectiveScope) {
    baseHeaders["x-tenant-id"] = effectiveScope.tenantId;
    baseHeaders["x-company-id"] = effectiveScope.companyId;
  }
  return baseHeaders;
}

async function parseHrmJson<T>(res: Response): Promise<{ data: T; envelope: HrmEnvelope<T> }> {
  let body: HrmEnvelope<T> | undefined;
  try {
    body = (await res.json()) as HrmEnvelope<T>;
  } catch {
    // ignore parse error for non-json body
  }

  if (!res.ok) {
    throw new ApiClientError({
      status: res.status,
      code: body?.code,
      message: body?.message ?? `HRM API request failed (${res.status})`,
      details: body?.details,
    });
  }

  if (!body) {
    throw new ApiClientError({
      status: res.status,
      code: "HRM-EMPTY-BODY",
      message: "Empty response body",
    });
  }
  if (body.success === false) {
    throw new ApiClientError({
      status: res.status,
      code: body.code,
      message: body.message ?? "HRM API request failed",
      details: body.details,
    });
  }
  if (body.success === true && body.data === undefined) {
    throw new ApiClientError({
      status: res.status,
      code: "HRM-NO-DATA",
      message: body.message ?? "API returned success without data",
      details: body.details,
    });
  }

  return { data: (body.data ?? ({} as T)) as T, envelope: body as HrmEnvelope<T> };
}

const DEFAULT_HRM_FETCH_MS = 30_000;

type RequestHrmOptions = HrmHeaderOptions & { timeoutMs?: number };

async function requestHrm<T>(path: string, init: RequestInit, opts?: RequestHrmOptions): Promise<T> {
  const timeoutMs = opts?.timeoutMs ?? DEFAULT_HRM_FETCH_MS;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const userSignal = init.signal;
  if (userSignal) {
    if (userSignal.aborted) controller.abort();
    else userSignal.addEventListener("abort", () => controller.abort(), { once: true });
  }
  try {
    const res = await fetch(`${HRM_API_ORIGIN}${path}`, {
      ...init,
      signal: controller.signal,
      headers: await headers(opts),
    });
    const { data } = await parseHrmJson<T>(res);
    return data;
  } finally {
    clearTimeout(timer);
  }
}

export type EmployeeSpreadsheetImportPreview = {
  kind: "employee_import";
  headersDetected: string[];
  canonicalHeaders: readonly string[];
  rowCount: number;
  previewRows: Record<string, string>[];
  truncated: boolean;
  errors: Array<{ row: number; field?: string; code: string; message?: string }>;
  dryRun: boolean;
};

export type EmployeeSpreadsheetImportCommitResult = {
  importedCount: number;
  ids: string[];
  errors: Array<{ row: number; field?: string; code: string; message?: string }>;
};

/** Server-side parse + validation preview (`SHEET-200`); no DB writes. */
export async function previewEmployeeSpreadsheetImport(file: File, scope: HrmSpreadsheetScope) {
  const form = new FormData();
  form.append("file", file);
  form.append("kind", "employee_import");
  form.append("dryRun", "true");
  const res = await fetch(`${HRM_API_ORIGIN}/api/hrm/spreadsheet/import/preview`, {
    method: "POST",
    headers: await headers({ omitContentType: true, scope }),
    body: form,
  });
  const { data } = await parseHrmJson<EmployeeSpreadsheetImportPreview>(res);
  return data;
}

/** Persists rows via `EmployeesService` per README (no cross-row transaction). */
export async function commitEmployeeSpreadsheetImport(file: File, scope: HrmSpreadsheetScope) {
  const form = new FormData();
  form.append("file", file);
  form.append("kind", "employee_import");
  const res = await fetch(`${HRM_API_ORIGIN}/api/hrm/spreadsheet/import/commit`, {
    method: "POST",
    headers: await headers({ omitContentType: true, scope }),
    body: form,
  });
  const { data } = await parseHrmJson<EmployeeSpreadsheetImportCommitResult>(res);
  return data;
}

/** Official template from `SpreadsheetModule` (auth only; no tenant/company scope on controller). */
export async function downloadEmployeeImportTemplate(format: "csv" | "xlsx" = "xlsx"): Promise<Blob> {
  const res = await fetch(
    `${HRM_API_ORIGIN}/api/hrm/spreadsheet/templates/employee_import?format=${encodeURIComponent(format)}`,
    { method: "GET", headers: await headers({ omitContentType: true }) },
  );
  if (!res.ok) {
    let body: HrmEnvelope<unknown> | undefined;
    try {
      body = (await res.json()) as HrmEnvelope<unknown>;
    } catch {
      /* ignore */
    }
    throw new ApiClientError({
      status: res.status,
      code: body?.code,
      message: body?.message ?? `HRM API request failed (${res.status})`,
      details: body?.details,
    });
  }
  return res.blob();
}

export async function listSyncedCatalogs() {
  return requestHrm<{ total: number; data: unknown[] }>("/api/hrm/catalog-sync", {
    method: "GET",
  });
}

export type HrmSettingsCatalogItem = {
  code: string;
  label: string;
  unit: string | null;
  status: "active" | "draft";
  origin: "xbos" | "hrm";
};

export type HrmSettingsCatalogOverviewRow = {
  catalogKey: string;
  name: string | null;
  domain: string | null;
  xbosVersion: number | null;
  xbosSyncedAt: string | null;
  xbosItems: HrmSettingsCatalogItem[];
  hrmExtensionItems: HrmSettingsCatalogItem[];
  effectiveItems: HrmSettingsCatalogItem[];
};

export async function getSettingsCatalogsOverview(scope: HrmSpreadsheetScope) {
  const res = await fetch(`${HRM_API_ORIGIN}/api/hrm/settings-catalogs`, {
    method: "GET",
    headers: await headers({ scope }),
  });
  const { data } = await parseHrmJson<{ catalogs: HrmSettingsCatalogOverviewRow[] }>(res);
  return data;
}

export async function syncSettingsCatalogsFromXbos(scope: HrmSpreadsheetScope) {
  const res = await fetch(`${HRM_API_ORIGIN}/api/hrm/settings-catalogs/sync-from-xbos`, {
    method: "POST",
    headers: await headers({ scope }),
    body: "{}",
  });
  const { data } = await parseHrmJson<{ pulledKeys: string[] }>(res);
  return data;
}

export async function appendSettingsCatalogExtensionItems(
  catalogKey: string,
  items: Array<{ code: string; label: string; unit?: string; status?: "active" | "draft" }>,
  scope: HrmSpreadsheetScope,
) {
  const h = await headers({ scope });
  const res = await fetch(
    `${HRM_API_ORIGIN}/api/hrm/settings-catalogs/${encodeURIComponent(catalogKey)}/extension-items`,
    {
      method: "POST",
      headers: h,
      body: JSON.stringify({ items }),
    },
  );
  const { data, envelope } = await parseHrmJson<{
    upserted?: number;
    submitted?: number;
    batchId?: string;
    status?: string;
    message?: string;
  }>(res);
  return { ...data, message: envelope.message ?? data?.message };
}

export async function requestSettingsCatalogFieldRemoval(
  catalogKey: string,
  payload: { code: string; label?: string; reason?: string; requested_by_name?: string; requested_by_email?: string },
  scope: HrmSpreadsheetScope,
) {
  const res = await fetch(
    `${HRM_API_ORIGIN}/api/hrm/settings-catalogs/${encodeURIComponent(catalogKey)}/removal-requests`,
    {
      method: 'POST',
      headers: await headers({ scope }),
      body: JSON.stringify(payload),
    },
  );
  const { data } = await parseHrmJson<{
    requestId: string;
    status: string;
    leadershipEmails: string[];
    createdAt: string;
    message: string;
  }>(res);
  return data;
}

export async function createPlatformAdmin(payload: {
  email: string;
  password: string;
  full_name?: string;
}) {
  return requestHrm<{ success: boolean; user_id: string }>("/api/hrm/admin/platform-admin", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createCompanyAdmin(payload: {
  company_id: string;
  email: string;
  password: string;
  full_name?: string;
  role?: string;
}) {
  return requestHrm<{ success: boolean; user_id: string; is_existing_user: boolean }>("/api/hrm/admin/company-admin", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export type HrmAttendanceStatus = "pending" | "present" | "absent" | "leave";

export type HrmAttendanceRecord = {
  id: string;
  company_id: string;
  employee_id: string;
  attendance_date: string;
  check_in_at: string | null;
  check_out_at: string | null;
  status: HrmAttendanceStatus;
  note: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export async function listAttendanceRecords(params: {
  company_id: string;
  employee_id?: string;
  status?: HrmAttendanceStatus;
  from_date?: string;
  to_date?: string;
  page?: number;
  page_size?: number;
}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });
  return requestHrm<{ total: number; page: number; page_size: number; data: HrmAttendanceRecord[] }>(
    `/api/hrm/attendance/records?${search.toString()}`,
    { method: "GET" },
  );
}

export async function createAttendanceRecord(payload: {
  company_id: string;
  employee_id: string;
  attendance_date: string;
  check_in_at?: string;
  check_out_at?: string;
  status?: HrmAttendanceStatus;
  note?: string;
  created_by?: string;
}) {
  return requestHrm<HrmAttendanceRecord>("/api/hrm/attendance/records", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateAttendanceStatus(recordId: string, payload: {
  status: HrmAttendanceStatus;
  note?: string;
  updated_by?: string;
}) {
  return requestHrm<HrmAttendanceRecord>(`/api/hrm/attendance/records/${recordId}/status`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export type HrmPayrollPeriodStatus = "draft" | "processed" | "closed";

export type HrmPayrollPeriod = {
  id: string;
  company_id: string;
  period_label: string;
  start_date: string;
  end_date: string;
  status: HrmPayrollPeriodStatus;
  created_by: string | null;
  processed_at: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
};

export async function listPayrollPeriods(params: { company_id: string; status?: string }) {
  const search = new URLSearchParams();
  search.set("company_id", params.company_id);
  if (params.status) search.set("status", params.status);
  return requestHrm<{ total: number; data: HrmPayrollPeriod[] }>(`/api/hrm/payroll/periods?${search.toString()}`, {
    method: "GET",
  });
}

export async function createPayrollPeriod(payload: {
  company_id: string;
  period_label: string;
  start_date: string;
  end_date: string;
  created_by?: string;
}) {
  return requestHrm<HrmPayrollPeriod>("/api/hrm/payroll/periods", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function processPayrollPeriod(periodId: string) {
  return requestHrm<HrmPayrollPeriod>(`/api/hrm/payroll/periods/${periodId}/process`, {
    method: "POST",
  });
}

export async function closePayrollPeriod(periodId: string) {
  return requestHrm<HrmPayrollPeriod>(`/api/hrm/payroll/periods/${periodId}/close`, {
    method: "POST",
  });
}

export type HrmPayslipRow = {
  id: string;
  employee_id: string;
  employee_code: string;
  employee_name: string;
  gross_amount: string;
  deduction_amount: string;
  net_amount: string;
  status: string;
  period_label: string;
};

export async function listPayrollPayslips(params: { company_id: string; period_id?: string }) {
  const search = new URLSearchParams();
  search.set("company_id", params.company_id);
  if (params.period_id) search.set("period_id", params.period_id);
  return requestHrm<{ total: number; data: HrmPayslipRow[] }>(
    `/api/hrm/payroll/payslips?${search.toString()}`,
    { method: "GET" },
  );
}

export async function getPayrollReconciliationSummary(companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", companyId);
  return requestHrm<{ draft: number; processed: number; closed: number }>(
    `/api/hrm/payroll/reports/reconciliation?${search.toString()}`,
    { method: "GET" },
  );
}

export type HrmJobRequisition = {
  id: string;
  company_id: string;
  title: string;
  department: string;
  employment_type: string;
  status: "open" | "closed" | "on_hold";
  created_at: string;
  updated_at: string;
};

export type HrmRecruitmentCandidate = {
  id: string;
  company_id: string;
  requisition_id: string;
  full_name: string;
  email: string;
  source: string;
  status: "new" | "screening" | "interview" | "offer" | "hired" | "rejected";
  created_at: string;
  updated_at: string;
};

export type HrmRecruitmentInterview = {
  id: string;
  company_id: string;
  candidate_id: string;
  scheduled_at: string;
  interviewer: string;
  status: "scheduled" | "passed" | "failed" | "cancelled";
  created_at: string;
  updated_at: string;
};

export async function listJobRequisitions(params: {
  company_id: string;
  page?: number;
  page_size?: number;
}) {
  const search = new URLSearchParams();
  search.set("company_id", params.company_id);
  if (params.page) search.set("page", String(params.page));
  if (params.page_size) search.set("page_size", String(params.page_size));
  return requestHrm<{ total: number; page: number; page_size: number; data: HrmJobRequisition[] }>(
    `/api/hrm/recruitment/requisitions?${search.toString()}`,
    { method: "GET" },
  );
}

export async function createJobRequisition(payload: {
  company_id: string;
  title: string;
  department: string;
  employment_type: string;
}) {
  return requestHrm<HrmJobRequisition>("/api/hrm/recruitment/requisitions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function listRecruitmentCandidates(params: {
  company_id: string;
  requisition_id?: string;
  page?: number;
  page_size?: number;
}) {
  const search = new URLSearchParams();
  search.set("company_id", params.company_id);
  if (params.requisition_id) search.set("requisition_id", params.requisition_id);
  if (params.page) search.set("page", String(params.page));
  if (params.page_size) search.set("page_size", String(params.page_size));
  return requestHrm<{ total: number; page: number; page_size: number; data: HrmRecruitmentCandidate[] }>(
    `/api/hrm/recruitment/candidates?${search.toString()}`,
    { method: "GET" },
  );
}

export async function createRecruitmentCandidate(payload: {
  company_id: string;
  requisition_id: string;
  full_name: string;
  email: string;
  source: string;
}) {
  return requestHrm<HrmRecruitmentCandidate>("/api/hrm/recruitment/candidates", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function scheduleRecruitmentInterview(payload: {
  company_id: string;
  candidate_id: string;
  scheduled_at: string;
  interviewer: string;
}) {
  return requestHrm<HrmRecruitmentInterview>("/api/hrm/recruitment/interviews", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateRecruitmentInterviewStatus(interviewId: string, payload: {
  status: "scheduled" | "passed" | "failed" | "cancelled";
}) {
  return requestHrm<HrmRecruitmentInterview>(`/api/hrm/recruitment/interviews/${interviewId}/status`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export type HrmContractRecord = {
  id: string;
  company_id: string;
  employee_id: string;
  contract_type: string;
  start_date: string;
  end_date: string;
  status: "active" | "expired" | "terminated";
  created_at: string;
  updated_at: string;
};

export type HrmInsuranceRecord = {
  id: string;
  company_id: string;
  employee_id: string;
  provider: string;
  policy_number: string;
  expiry_date: string;
  status: "active" | "expired" | "cancelled";
  created_at: string;
  updated_at: string;
};

export type HrmEmployeeRecord = {
  id: string;
  company_id: string;
  employee_code: string;
  email: string;
  full_name: string;
  job_title_key: string | null;
  status: "active" | "inactive";
  hired_at: string | null;
  archived_at: string | null;
  custom_fields: Record<string, string>;
  created_at: string;
  updated_at: string;
};

export async function listEmployees(params: {
  company_id: string;
  keyword?: string;
  status?: string;
  include_archived?: boolean;
  page?: number;
  page_size?: number;
}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });
  return requestHrm<{ total: number; page: number; page_size: number; data: HrmEmployeeRecord[] }>(
    `/api/hrm/employees?${search.toString()}`,
    { method: "GET" },
  );
}

export async function createEmployee(payload: {
  company_id: string;
  employee_code: string;
  email: string;
  full_name: string;
  job_title_key?: string;
  hired_at?: string;
  custom_fields?: Record<string, string>;
}) {
  return requestHrm<HrmEmployeeRecord>("/api/hrm/employees", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateEmployee(employeeId: string, payload: {
  email?: string;
  full_name?: string;
  job_title_key?: string;
  hired_at?: string;
  custom_fields?: Record<string, string>;
}) {
  return requestHrm<HrmEmployeeRecord>(`/api/hrm/employees/${employeeId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function archiveEmployee(employeeId: string) {
  return requestHrm<HrmEmployeeRecord>(`/api/hrm/employees/${employeeId}/archive`, {
    method: "POST",
  });
}

export async function restoreEmployee(employeeId: string) {
  return requestHrm<HrmEmployeeRecord>(`/api/hrm/employees/${employeeId}/restore`, {
    method: "POST",
  });
}

export async function createEmployeeContract(payload: {
  company_id: string;
  employee_id: string;
  contract_type: string;
  start_date: string;
  end_date: string;
}) {
  return requestHrm<HrmContractRecord>("/api/hrm/contracts-insurance/contracts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createInsuranceRecord(payload: {
  company_id: string;
  employee_id: string;
  provider: string;
  policy_number: string;
  expiry_date: string;
}) {
  return requestHrm<HrmInsuranceRecord>("/api/hrm/contracts-insurance/insurance", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function listExpiringContracts(params: { company_id: string; days?: number }) {
  const search = new URLSearchParams();
  search.set("company_id", params.company_id);
  if (params.days) search.set("days", String(params.days));
  return requestHrm<{ total: number; days: number; data: HrmContractRecord[] }>(
    `/api/hrm/contracts-insurance/contracts/expiring?${search.toString()}`,
    { method: "GET" },
  );
}

export async function listExpiringInsurance(params: { company_id: string; days?: number }) {
  const search = new URLSearchParams();
  search.set("company_id", params.company_id);
  if (params.days) search.set("days", String(params.days));
  return requestHrm<{ total: number; days: number; data: HrmInsuranceRecord[] }>(
    `/api/hrm/contracts-insurance/insurance/expiring?${search.toString()}`,
    { method: "GET" },
  );
}

export async function listEmployeeContracts(params: {
  company_id: string;
  employee_id?: string;
  status?: "active" | "expired" | "terminated";
}) {
  const search = new URLSearchParams();
  search.set("company_id", params.company_id);
  if (params.employee_id) search.set("employee_id", params.employee_id);
  if (params.status) search.set("status", params.status);
  return requestHrm<{ total: number; data: HrmContractRecord[] }>(
    `/api/hrm/contracts-insurance/contracts?${search.toString()}`,
    { method: "GET" },
  );
}

export async function updateEmployeeContract(
  contractId: string,
  payload: Partial<{ contract_type: string; start_date: string; end_date: string; status: "active" | "expired" | "terminated" }>,
) {
  return requestHrm<HrmContractRecord>(`/api/hrm/contracts-insurance/contracts/${contractId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteEmployeeContract(contractId: string) {
  return requestHrm<{ id: string }>(`/api/hrm/contracts-insurance/contracts/${contractId}`, {
    method: "DELETE",
  });
}

export type HrmOperationsTask = {
  id: string;
  company_id: string;
  title: string;
  description: string | null;
  priority: "low" | "medium" | "high";
  status: "todo" | "in_progress" | "done" | "blocked";
  due_date: string | null;
  created_at: string;
  updated_at: string;
};

export async function listOperationsTasks(params: { company_id: string; page?: number; page_size?: number }) {
  const search = new URLSearchParams();
  search.set("company_id", params.company_id);
  if (params.page) search.set("page", String(params.page));
  if (params.page_size) search.set("page_size", String(params.page_size));
  return requestHrm<{ total: number; page: number; page_size: number; data: HrmOperationsTask[] }>(
    `/api/hrm/operations/tasks?${search.toString()}`,
    { method: "GET" },
  );
}

export async function createOperationsTask(payload: {
  company_id: string;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  due_date?: string;
}) {
  return requestHrm<HrmOperationsTask>("/api/hrm/operations/tasks", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateOperationsTaskStatus(taskId: string, payload: {
  status: "todo" | "in_progress" | "done" | "blocked";
}) {
  return requestHrm<HrmOperationsTask>(`/api/hrm/operations/tasks/${taskId}/status`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function getOperationsSummary(companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", companyId);
  return requestHrm<{
    attendance_records: number;
    payroll_periods: number;
    job_requisitions: number;
    tasks: number;
  }>(`/api/hrm/operations/reports/summary?${search.toString()}`, {
    method: "GET",
  });
}

export type HrmEmployeeMetadataChangeRequest = {
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
  status: "pending" | "approved" | "rejected" | "cancelled";
  decided_by: string | null;
  decided_note: string | null;
  decided_at: string | null;
  submitted_at: string;
  updated_at: string;
};

export async function listEmployeeMetadataChangeRequests(params: {
  company_id: string;
  employee_id?: string;
  legal_entity_id?: string;
  status?: string;
  field_key?: string;
  page?: number;
  page_size?: number;
}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });
  return requestHrm<{ total: number; page: number; page_size: number; data: HrmEmployeeMetadataChangeRequest[] }>(
    `/api/hrm/employee-metadata/change-requests?${search.toString()}`,
    { method: "GET" },
  );
}

export async function submitEmployeeMetadataChangeRequest(payload: {
  company_id: string;
  employee_id: string;
  legal_entity_id?: string;
  field_key: string;
  current_value?: unknown;
  requested_value: unknown;
  reason?: string;
  actor_user_id?: string;
  actor_name?: string;
  workflow_code?: string;
  source_catalog_key?: string;
}) {
  return requestHrm<HrmEmployeeMetadataChangeRequest>("/api/hrm/employee-metadata/change-requests", {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      current_value: JSON.stringify(payload.current_value ?? null),
      requested_value: JSON.stringify(payload.requested_value),
    }),
  });
}

export async function approveEmployeeMetadataChangeRequest(
  changeRequestId: string,
  payload?: { actor_user_id?: string; actor_name?: string; note?: string },
) {
  return requestHrm<HrmEmployeeMetadataChangeRequest>(
    `/api/hrm/employee-metadata/change-requests/${changeRequestId}/approve`,
    { method: "POST", body: JSON.stringify(payload ?? {}) },
  );
}

export async function rejectEmployeeMetadataChangeRequest(
  changeRequestId: string,
  payload?: { actor_user_id?: string; actor_name?: string; note?: string },
) {
  return requestHrm<HrmEmployeeMetadataChangeRequest>(
    `/api/hrm/employee-metadata/change-requests/${changeRequestId}/reject`,
    { method: "POST", body: JSON.stringify(payload ?? {}) },
  );
}

export type HrmAttendanceUpdateRequest = {
  id: string;
  company_id: string;
  employee_id: string;
  employee_code: string;
  employee_name: string;
  department: string | null;
  position: string | null;
  attendance_date: string;
  update_type: string;
  current_check_in: string | null;
  current_check_out: string | null;
  requested_check_in: string | null;
  requested_check_out: string | null;
  reason: string;
  evidence_url: string | null;
  approver_name: string | null;
  status: string;
  approved_at: string | null;
  rejected_reason: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export async function listAttendanceUpdateRequests(params: {
  company_id: string;
  status?: string;
}) {
  const search = new URLSearchParams();
  search.set("company_id", params.company_id);
  if (params.status) search.set("status", params.status);
  return requestHrm<{ total: number; data: HrmAttendanceUpdateRequest[] }>(
    `/api/hrm/attendance/update-requests?${search.toString()}`,
    { method: "GET" },
  );
}

export async function createAttendanceUpdateRequest(payload: Record<string, unknown>) {
  return requestHrm<HrmAttendanceUpdateRequest>("/api/hrm/attendance/update-requests", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateAttendanceUpdateRequest(requestId: string, payload: Record<string, unknown>) {
  return requestHrm<HrmAttendanceUpdateRequest>(`/api/hrm/attendance/update-requests/${requestId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function approveAttendanceUpdateRequest(requestId: string, payload?: {
  approver_name?: string;
}) {
  return requestHrm<HrmAttendanceUpdateRequest>(`/api/hrm/attendance/update-requests/${requestId}/approve`, {
    method: "POST",
    body: JSON.stringify(payload ?? {}),
  });
}

export async function rejectAttendanceUpdateRequest(requestId: string, payload?: {
  approver_name?: string;
  rejected_reason?: string;
}) {
  return requestHrm<HrmAttendanceUpdateRequest>(`/api/hrm/attendance/update-requests/${requestId}/reject`, {
    method: "POST",
    body: JSON.stringify(payload ?? {}),
  });
}

export async function deleteAttendanceUpdateRequest(requestId: string) {
  return requestHrm<{ id: string }>(`/api/hrm/attendance/update-requests/${requestId}`, {
    method: "DELETE",
  });
}

export type HrmLeaveRequest = {
  id: string;
  company_id: string;
  employee_id: string;
  employee_code: string | null;
  employee_name: string | null;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string | null;
  status: string;
  requested_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  department: string | null;
  position: string | null;
  total_days: string;
  handover_to: string | null;
  handover_tasks: string | null;
  approver_employee_id: string | null;
  rejected_reason: string | null;
};

export async function listLeaveRequests(params: { company_id: string; status?: string }) {
  const search = new URLSearchParams();
  search.set("company_id", params.company_id);
  if (params.status) search.set("status", params.status);
  return requestHrm<{ data: HrmLeaveRequest[] }>(
    `/api/hrm/attendance/leave-requests?${search.toString()}`,
    { method: "GET" },
  );
}

export async function createLeaveRequest(payload: Record<string, unknown>) {
  return requestHrm<HrmLeaveRequest>("/api/hrm/attendance/leave-requests", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function approveLeaveRequest(
  requestId: string,
  payload: { reviewer_name: string; reviewer_employee_id?: string },
) {
  return requestHrm<HrmLeaveRequest>(`/api/hrm/attendance/leave-requests/${requestId}/approve`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function rejectLeaveRequest(
  requestId: string,
  payload: { reviewer_name: string; reviewer_employee_id?: string; rejected_reason?: string },
) {
  return requestHrm<HrmLeaveRequest>(`/api/hrm/attendance/leave-requests/${requestId}/reject`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export type HrmInboxNotification = {
  id: string;
  company_id: string;
  event_type: string;
  payload: unknown;
  recipient_employee_id: string | null;
  read_at: string | null;
  created_at: string;
};

export async function listHrmInboxNotifications(params: {
  company_id: string;
  employee_id: string;
  limit?: number;
}) {
  const search = new URLSearchParams();
  search.set("company_id", params.company_id);
  search.set("employee_id", params.employee_id);
  if (params.limit != null) search.set("limit", String(params.limit));
  return requestHrm<{ total: number; data: HrmInboxNotification[] }>(
    `/api/hrm/notifications/inbox?${search.toString()}`,
    { method: "GET" },
  );
}

export type HrmServiceRequest = {
  id: string;
  company_id: string;
  service_type: string;
  employee_id: string | null;
  employee_name: string;
  employee_code: string | null;
  department: string | null;
  request_date: string;
  status: string;
  notes: string | null;
  meal_type: string | null;
  meal_date: string | null;
  meal_quantity: number | null;
  vehicle_purpose: string | null;
  vehicle_destination: string | null;
  vehicle_date: string | null;
  vehicle_time_start: string | null;
  vehicle_time_end: string | null;
  vehicle_passengers: number | null;
  supply_items: unknown;
  supply_urgency: string | null;
  approved_by: string | null;
  approved_at: string | null;
  rejected_reason: string | null;
  created_at: string;
  updated_at: string;
};

export async function listServiceRequests(params: { company_id: string; service_type?: string }) {
  const search = new URLSearchParams();
  search.set("company_id", params.company_id);
  if (params.service_type) search.set("service_type", params.service_type);
  return requestHrm<HrmServiceRequest[]>(`/api/hrm/operations/service-requests?${search.toString()}`, {
    method: "GET",
  });
}

export async function createServiceRequest(payload: Record<string, unknown>) {
  return requestHrm<HrmServiceRequest>("/api/hrm/operations/service-requests", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateServiceRequest(requestId: string, payload: Record<string, unknown>) {
  return requestHrm<HrmServiceRequest>(`/api/hrm/operations/service-requests/${requestId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteServiceRequest(requestId: string) {
  return requestHrm<{ id: string }>(`/api/hrm/operations/service-requests/${requestId}`, {
    method: "DELETE",
  });
}

export async function approveServiceRequest(requestId: string, payload?: { approved_by?: string }) {
  return requestHrm<HrmServiceRequest>(`/api/hrm/operations/service-requests/${requestId}/approve`, {
    method: "POST",
    body: JSON.stringify(payload ?? {}),
  });
}

export async function rejectServiceRequest(requestId: string, payload?: {
  approved_by?: string;
  rejected_reason?: string;
}) {
  return requestHrm<HrmServiceRequest>(`/api/hrm/operations/service-requests/${requestId}/reject`, {
    method: "POST",
    body: JSON.stringify(payload ?? {}),
  });
}

export type HrmPerformanceCycle = {
  id: string;
  company_id: string;
  cycle_name: string;
  start_date: string;
  end_date: string;
  status: "draft" | "active" | "closed";
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type HrmPerformanceEvaluation = {
  id: string;
  company_id: string;
  employee_id: string;
  cycle_id: string;
  score: number;
  summary: string;
  reviewer: string;
  created_at: string;
  updated_at: string;
};

export async function listPerformanceCycles(params: { company_id: string; status?: "draft" | "active" | "closed" }) {
  const search = new URLSearchParams();
  search.set("company_id", params.company_id);
  if (params.status) search.set("status", params.status);
  return requestHrm<{ total: number; data: HrmPerformanceCycle[] }>(`/api/hrm/performance/cycles?${search.toString()}`, {
    method: "GET",
  });
}

export async function createPerformanceCycle(payload: {
  company_id: string;
  cycle_name: string;
  start_date: string;
  end_date: string;
  created_by: string;
}) {
  return requestHrm<HrmPerformanceCycle>("/api/hrm/performance/cycles", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function listPerformanceEvaluations(params: { company_id: string; employee_id?: string; cycle_id?: string }) {
  const search = new URLSearchParams();
  search.set("company_id", params.company_id);
  if (params.employee_id) search.set("employee_id", params.employee_id);
  if (params.cycle_id) search.set("cycle_id", params.cycle_id);
  return requestHrm<{ total: number; data: HrmPerformanceEvaluation[] }>(
    `/api/hrm/performance/evaluations?${search.toString()}`,
    { method: "GET" },
  );
}

export async function createPerformanceEvaluation(payload: {
  company_id: string;
  employee_id: string;
  cycle_id: string;
  score: number;
  summary: string;
  reviewer: string;
}) {
  return requestHrm<HrmPerformanceEvaluation>("/api/hrm/performance/evaluations", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
