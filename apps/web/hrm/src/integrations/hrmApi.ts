import { ApiClientError } from "@/lib/apiError";
import { clampHrmPageSize, HRM_API_MAX_PAGE_SIZE } from "@/lib/hrmDataMode";
import { coerceHrmListCompanyId, normalizeHrmApiListCompanyId } from "@/lib/hrmListScope";
import { buildSettingsCatalogItemPayload } from "@/lib/hrmSettingsCatalogItem";
import { resolveHrmMetadataCompanyUuid, serializeMetadataJsonValue } from "@/lib/hrmMetadataCompany";
import { getHrmPortalMode } from "@/lib/hrmPortalMode";
import { resolveHrmSpreadsheetScope } from "@/lib/hrmSpreadsheetScope";
import { safeRandomUuid } from "@/lib/safeRandomUuid";
import { getPortalAccessToken, getPortalSessionUser, waitForPortalAccessToken } from "@/lib/portalAuthBridge";

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
  const storedCompany =
    localStorage.getItem("hrm_current_company_id") ||
    sessionStorage.getItem("hrm_current_company_id");
  const scopeHint = storedCompany?.trim() ? coerceHrmListCompanyId(storedCompany) : storedCompany;
  return resolveHrmSpreadsheetScope(scopeHint, window.location.search) ?? undefined;
}

async function headers(opts?: HrmHeaderOptions) {
  const baseHeaders: Record<string, string> = {
    "x-request-id": safeRandomUuid(),
  };
  if (!opts?.omitContentType) {
    baseHeaders["Content-Type"] = "application/json";
  }

  const portalMode =
    typeof window !== "undefined" && getHrmPortalMode(window.location.search);
  let portalToken = getPortalAccessToken();
  if (!portalToken && portalMode) {
    portalToken = await waitForPortalAccessToken(5000);
  }
  if (portalToken) {
    baseHeaders.Authorization = `Bearer ${portalToken}`;
    baseHeaders["x-access-token"] = portalToken;
    baseHeaders["x-portal-access-token"] = portalToken;
    const portalUser = getPortalSessionUser();
    if (portalUser?.userId) {
      baseHeaders["x-user-id"] = portalUser.userId;
    }
  }
  if (!baseHeaders.Authorization) {
    if (SERVICE_JWT_TOKEN) {
      baseHeaders.Authorization = `Bearer ${SERVICE_JWT_TOKEN}`;
    } else if (INTERNAL_API_KEY) {
      baseHeaders["x-internal-api-key"] = INTERNAL_API_KEY;
    }
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
    body: JSON.stringify({ company_id: normalizeHrmApiListCompanyId(scope.companyId) }),
  });
  const { data } = await parseHrmJson<{ pulledKeys: string[] }>(res);
  return data;
}

export async function upsertSettingsCatalogItem(
  input: {
    companyId: string;
    catalogKey: string;
    code: string;
    label: string;
    itemValue?: string;
  },
  scope: HrmSpreadsheetScope,
) {
  const body = buildSettingsCatalogItemPayload(input);
  const res = await fetch(`${HRM_API_ORIGIN}/api/hrm/settings-catalogs/items`, {
    method: "POST",
    headers: await headers({ scope }),
    body: JSON.stringify(body),
  });
  const { data } = await parseHrmJson<{ upserted?: number; item_key?: string; category_key?: string }>(res);
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
    if (value === undefined || value === null || value === "") return;
    if (key === "page_size") {
      search.set(key, String(clampHrmPageSize(Number(value))));
      return;
    }
    if (key === "company_id" && typeof value === "string") {
      setListCompanyId(search, value);
      return;
    }
    search.set(key, String(value));
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
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
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
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
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
    body: JSON.stringify({
      ...payload,
      company_id: normalizeHrmApiListCompanyId(payload.company_id),
    }),
  });
}

export async function getJobRequisition(requisitionId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmJobRequisition>(
    `/api/hrm/recruitment/requisitions/${encodeURIComponent(requisitionId)}?${search.toString()}`,
    { method: "GET" },
  );
}

export async function updateJobRequisition(
  requisitionId: string,
  companyId: string,
  payload: { status: HrmJobRequisition["status"] },
) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  const path = `/api/hrm/recruitment/requisitions/${encodeURIComponent(requisitionId)}?${search.toString()}`;
  const body = JSON.stringify(payload);
  try {
    return await requestHrm<HrmJobRequisition>(path, { method: "PATCH", body });
  } catch (err: unknown) {
    if (err instanceof ApiClientError && err.status === 404) {
      return requestHrm<HrmJobRequisition>(path, { method: "PUT", body });
    }
    throw err;
  }
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

export type HrmJobPostingRow = {
  id: string;
  company_id: string;
  title: string;
  department: string | null;
  position: string;
  employment_type: string;
  work_location: string | null;
  salary_min: number | null;
  salary_max: number | null;
  is_salary_visible: boolean;
  description: string | null;
  requirements: string | null;
  benefits: string | null;
  headcount: number;
  applied_count: number;
  status: string;
  deadline: string | null;
  priority: string;
  created_at: string;
  updated_at: string;
};

export type HrmCandidatePoolRow = {
  id: string;
  company_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  stage: string;
  source: string | null;
  applied_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type HrmCandidateApplicationRow = {
  id: string;
  candidate_id: string;
  job_posting_id: string;
  company_id: string;
  applied_date: string | null;
  stage: string;
  rating: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type HrmRecruitmentPlanPositionRow = {
  id: string;
  department_id: string;
  company_id: string;
  name: string;
  months_data: unknown;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type HrmRecruitmentPlanDepartmentRow = {
  id: string;
  plan_id: string;
  company_id: string;
  name: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
  positions?: HrmRecruitmentPlanPositionRow[];
};

export type HrmRecruitmentPlanRow = {
  id: string;
  company_id: string;
  title: string;
  start_month: number;
  end_month: number;
  year: number;
  note: string | null;
  status: string;
  creator_name: string | null;
  created_at: string;
  updated_at: string;
  departments?: HrmRecruitmentPlanDepartmentRow[];
};

export async function listJobPostings(params: { company_id: string; status?: string }) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  if (params.status) search.set("status", params.status);
  return requestHrm<{ total: number; data: HrmJobPostingRow[] }>(
    `/api/hrm/recruitment/job-postings?${search.toString()}`,
    { method: "GET" },
  );
}

export async function createJobPosting(payload: {
  company_id: string;
  title: string;
  position: string;
  department?: string;
  employment_type?: string;
  work_location?: string;
  salary_min?: number;
  salary_max?: number;
  is_salary_visible?: boolean;
  description?: string;
  requirements?: string;
  benefits?: string;
  headcount?: number;
  deadline?: string;
  priority?: string;
  status?: string;
}) {
  return requestHrm<HrmJobPostingRow>("/api/hrm/recruitment/job-postings", {
    method: "POST",
    body: JSON.stringify({ ...payload, company_id: normalizeHrmApiListCompanyId(payload.company_id) }),
  });
}

export async function deleteJobPosting(jobPostingId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<{ id: string }>(
    `/api/hrm/recruitment/job-postings/${jobPostingId}?${search.toString()}`,
    { method: "DELETE" },
  );
}

export async function listCandidatesPool(params: { company_id: string; stage?: string }) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  if (params.stage) search.set("stage", params.stage);
  return requestHrm<{ total: number; data: HrmCandidatePoolRow[] }>(
    `/api/hrm/recruitment/candidates-pool?${search.toString()}`,
    { method: "GET" },
  );
}

export async function createCandidatePool(payload: {
  company_id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  position?: string | null;
  source?: string | null;
  stage?: string;
  rating?: number | null;
  applied_date?: string | null;
  expected_start_date?: string | null;
  nationality?: string | null;
  hometown?: string | null;
  marital_status?: string | null;
  notes?: string | null;
  requisition_id?: string | null;
}) {
  return requestHrm<HrmCandidatePoolRow>("/api/hrm/recruitment/candidates", {
    method: "POST",
    body: JSON.stringify({ ...payload, company_id: normalizeHrmApiListCompanyId(payload.company_id) }),
  });
}

export async function updateCandidatePool(
  candidateId: string,
  companyId: string,
  payload: Partial<{
    full_name: string;
    email: string;
    phone: string | null;
    position: string | null;
    source: string | null;
    stage: string;
    rating: number | null;
    applied_date: string | null;
    expected_start_date: string | null;
    nationality: string | null;
    hometown: string | null;
    marital_status: string | null;
    notes: string | null;
  }>,
) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmCandidatePoolRow>(
    `/api/hrm/recruitment/candidates-pool/${candidateId}?${search.toString()}`,
    { method: "PATCH", body: JSON.stringify(payload) },
  );
}

export async function deleteCandidatePool(candidateId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<{ id: string }>(
    `/api/hrm/recruitment/candidates-pool/${candidateId}?${search.toString()}`,
    { method: "DELETE" },
  );
}

export async function listCandidateApplications(params: {
  company_id: string;
  job_posting_id?: string;
}) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  if (params.job_posting_id) search.set("job_posting_id", params.job_posting_id);
  return requestHrm<{ total: number; data: HrmCandidateApplicationRow[] }>(
    `/api/hrm/recruitment/candidate-applications?${search.toString()}`,
    { method: "GET" },
  );
}

export async function listRecruitmentPlans(companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<{ total: number; data: HrmRecruitmentPlanRow[] }>(
    `/api/hrm/recruitment/recruitment-plans?${search.toString()}`,
    { method: "GET" },
  );
}

export async function updateRecruitmentPlanStatus(
  planId: string,
  companyId: string,
  status: string,
) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmRecruitmentPlanRow>(
    `/api/hrm/recruitment/recruitment-plans/${planId}/status?${search.toString()}`,
    { method: "PATCH", body: JSON.stringify({ status }) },
  );
}

export type HrmEmployeeInsuranceRow = {
  id: string;
  employee_id: string;
  company_id: string;
  type: string;
  provider: string;
  policy_number: string | null;
  start_date: string | null;
  end_date: string | null;
  contribution: number;
  employer_contribution: number;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export async function listEmployeeInsurances(params: { company_id: string; employee_id: string }) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  search.set("employee_id", params.employee_id);
  return requestHrm<{ total: number; data: HrmEmployeeInsuranceRow[] }>(
    `/api/hrm/employee-insurances?${search.toString()}`,
    { method: "GET" },
  );
}

export async function createEmployeeInsurance(payload: {
  company_id: string;
  employee_id: string;
  type?: string;
  provider: string;
  policy_number?: string;
  start_date?: string;
  end_date?: string;
  contribution?: number;
  employer_contribution?: number;
  status?: string;
  notes?: string;
}) {
  return requestHrm<HrmEmployeeInsuranceRow>("/api/hrm/employee-insurances", {
    method: "POST",
    body: JSON.stringify({ ...payload, company_id: normalizeHrmApiListCompanyId(payload.company_id) }),
  });
}

export async function updateEmployeeInsurance(
  insuranceId: string,
  payload: Partial<{
    company_id: string;
    type: string;
    provider: string;
    policy_number: string;
    start_date: string;
    end_date: string;
    contribution: number;
    employer_contribution: number;
    status: string;
    notes: string;
  }>,
) {
  return requestHrm<HrmEmployeeInsuranceRow>(`/api/hrm/employee-insurances/${insuranceId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteEmployeeInsurance(insuranceId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<{ id: string }>(
    `/api/hrm/employee-insurances/${insuranceId}?${search.toString()}`,
    { method: "DELETE" },
  );
}

export type HrmEmployeeBenefitRow = {
  id: string;
  employee_id: string;
  company_id: string;
  name: string;
  category: string;
  value: number;
  unit: string | null;
  frequency: string;
  start_date: string | null;
  end_date: string | null;
  status: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export async function listEmployeeBenefits(params: { company_id: string; employee_id: string }) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  search.set("employee_id", params.employee_id);
  return requestHrm<{ total: number; data: HrmEmployeeBenefitRow[] }>(
    `/api/hrm/employee-benefits?${search.toString()}`,
    { method: "GET" },
  );
}

export async function createEmployeeBenefit(payload: {
  company_id: string;
  employee_id: string;
  name: string;
  category?: string;
  value: number;
  unit?: string;
  frequency?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
  description?: string;
}) {
  return requestHrm<HrmEmployeeBenefitRow>("/api/hrm/employee-benefits", {
    method: "POST",
    body: JSON.stringify({ ...payload, company_id: normalizeHrmApiListCompanyId(payload.company_id) }),
  });
}

export async function updateEmployeeBenefit(
  benefitId: string,
  payload: Partial<{
    company_id: string;
    name: string;
    category: string;
    value: number;
    unit: string;
    frequency: string;
    start_date: string;
    end_date: string;
    status: string;
    description: string;
  }>,
) {
  return requestHrm<HrmEmployeeBenefitRow>(`/api/hrm/employee-benefits/${benefitId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteEmployeeBenefit(benefitId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<{ id: string }>(
    `/api/hrm/employee-benefits/${benefitId}?${search.toString()}`,
    { method: "DELETE" },
  );
}

export type HrmEmployeeKpiRow = {
  id: string;
  employee_id: string;
  company_id: string;
  kpi_name: string;
  kpi_type: string | null;
  target_value: number | null;
  actual_value: number | null;
  unit: string | null;
  weight: number | null;
  period_start: string | null;
  period_end: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export async function listEmployeeKpis(params: { company_id: string; employee_id: string }) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  search.set("employee_id", params.employee_id);
  return requestHrm<{ total: number; data: HrmEmployeeKpiRow[] }>(
    `/api/hrm/employee-kpis?${search.toString()}`,
    { method: "GET" },
  );
}

export async function createEmployeeKpi(payload: {
  company_id: string;
  employee_id: string;
  kpi_name: string;
  kpi_type?: string;
  target_value?: number;
  actual_value?: number | null;
  unit?: string;
  weight?: number;
  period_start?: string;
  period_end?: string;
  status?: string;
  notes?: string;
}) {
  return requestHrm<HrmEmployeeKpiRow>("/api/hrm/employee-kpis", {
    method: "POST",
    body: JSON.stringify({ ...payload, company_id: normalizeHrmApiListCompanyId(payload.company_id) }),
  });
}

export async function deleteEmployeeKpi(kpiId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<{ id: string }>(`/api/hrm/employee-kpis/${kpiId}?${search.toString()}`, {
    method: "DELETE",
  });
}

export type HrmSalaryTemplateRow = {
  id: string;
  company_id: string;
  code: string;
  name: string;
  description: string | null;
  is_default: boolean;
  status: string;
  created_at: string;
  updated_at: string;
};

export async function listSalaryTemplates(params: { company_id: string; status?: string }) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  if (params.status) search.set("status", params.status);
  return requestHrm<{ total: number; data: HrmSalaryTemplateRow[] }>(
    `/api/hrm/payroll/salary-templates?${search.toString()}`,
    { method: "GET" },
  );
}

export async function createSalaryTemplate(payload: {
  company_id: string;
  code: string;
  name: string;
  description?: string;
  is_default?: boolean;
}) {
  return requestHrm<HrmSalaryTemplateRow>("/api/hrm/payroll/salary-templates", {
    method: "POST",
    body: JSON.stringify({ ...payload, company_id: normalizeHrmApiListCompanyId(payload.company_id) }),
  });
}

export async function updateSalaryTemplate(
  templateId: string,
  payload: {
    company_id: string;
    code?: string;
    name?: string;
    description?: string;
    is_default?: boolean;
    status?: string;
  },
) {
  return requestHrm<HrmSalaryTemplateRow>(`/api/hrm/payroll/salary-templates/${templateId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteSalaryTemplate(templateId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<{ id: string }>(
    `/api/hrm/payroll/salary-templates/${templateId}?${search.toString()}`,
    { method: "DELETE" },
  );
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
  employee_name?: string | null;
  employee_code?: string | null;
  department?: string | null;
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
  employee_name?: string | null;
  employee_code?: string | null;
  department?: string | null;
  social_insurance_number?: string | null;
  health_insurance_number?: string | null;
  unemployment_insurance_number?: string | null;
  social_insurance_rate?: number | null;
  health_insurance_rate?: number | null;
  unemployment_insurance_rate?: number | null;
  base_salary?: number | null;
  effective_date?: string | null;
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
  avatar_url?: string | null;
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
  const search = buildListSearchParams(params);
  return requestHrm<{ total: number; page: number; page_size: number; data: HrmEmployeeRecord[] }>(
    `/api/hrm/employees?${search.toString()}`,
    { method: "GET" },
  );
}

/** Paginate employees list — respects Nest @Max(100) page_size cap. */
export async function listAllEmployees(params: {
  company_id: string;
  keyword?: string;
  status?: string;
  include_archived?: boolean;
  page_size?: number;
}): Promise<{ total: number; data: HrmEmployeeRecord[] }> {
  const all: HrmEmployeeRecord[] = [];
  let page = 1;
  let total = 0;
  const pageSize = clampHrmPageSize(params.page_size ?? HRM_API_MAX_PAGE_SIZE);
  for (;;) {
    const res = await listEmployees({ ...params, page, page_size: pageSize });
    total = res.total ?? all.length;
    const batch = res.data ?? [];
    all.push(...batch);
    if (batch.length === 0 || all.length >= total) break;
    page += 1;
  }
  return { total, data: all };
}

function setListCompanyId(search: URLSearchParams, companyId: string) {
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
}

function buildListSearchParams(
  params: Record<string, string | number | boolean | undefined | null>,
): URLSearchParams {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (key === "page_size") {
      search.set(key, String(clampHrmPageSize(Number(value))));
      return;
    }
    if (key === "company_id" && typeof value === "string") {
      setListCompanyId(search, value);
      return;
    }
    search.set(key, String(value));
  });
  return search;
}

/** Scope fallback for embed J-HRM-02 — main first, then other company_ids. */
export async function getEmployeeById(
  employeeId: string,
  companyIds: string[],
): Promise<HrmEmployeeRecord | null> {
  const id = employeeId.trim();
  if (!id) return null;

  const scopes = [
    ...new Set(
      [...companyIds]
        .filter(Boolean)
        .map((c) => normalizeHrmApiListCompanyId(c))
        .sort((a, b) => {
          if (a === "main") return -1;
          if (b === "main") return 1;
          return 0;
        }),
    ),
  ];

  let lastError: unknown;
  for (const companyId of scopes) {
    const search = new URLSearchParams();
    setListCompanyId(search, companyId);
    try {
      const res = await fetch(
        `${HRM_API_ORIGIN}/api/hrm/employees/${encodeURIComponent(id)}?${search.toString()}`,
        { method: "GET", headers: await headers() },
      );
      const { data, envelope } = await parseHrmJson<HrmEmployeeRecord>(res);
      if (data?.id?.toLowerCase() === id.toLowerCase()) {
        return data;
      }
      return data ?? null;
    } catch (err: unknown) {
      lastError = err;
      if (err instanceof ApiClientError) {
        const status = err.status ?? 0;
        if (status === 400 || status === 404 || status === 409) continue;
      }
      throw err;
    }
  }

  if (lastError instanceof ApiClientError && (lastError.status === 404 || lastError.status === 409)) {
    return null;
  }
  return null;
}

export async function createEmployee(payload: {
  company_id: string;
  employee_code: string;
  email: string;
  full_name: string;
  job_title_key?: string;
  hired_at?: string;
  avatar_url?: string | null;
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
  avatar_url?: string | null;
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

/** BR-INS-01 embed / insurance module list (`GET /api/hrm/contracts-insurance/insurance`). */
export async function listInsuranceRecords(params: {
  company_id: string;
  employee_id?: string;
  status?: string;
  page?: number;
  page_size?: number;
}) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  if (params.employee_id) search.set("employee_id", params.employee_id);
  if (params.status) search.set("status", params.status);
  if (params.page) search.set("page", String(params.page));
  if (params.page_size) search.set("page_size", String(clampHrmPageSize(params.page_size)));
  return requestHrm<{ total: number; page?: number; page_size?: number; data: HrmInsuranceRecord[] }>(
    `/api/hrm/contracts-insurance/insurance?${search.toString()}`,
    { method: "GET" },
  );
}

/** Paginate through full insurance list (BR-INS-01 — matches menu-density total). */
export async function listAllInsuranceRecords(params: {
  company_id: string;
  employee_id?: string;
  status?: string;
}): Promise<{ total: number; data: HrmInsuranceRecord[] }> {
  const all: HrmInsuranceRecord[] = [];
  let page = 1;
  let total = 0;
  const pageSize = clampHrmPageSize();
  for (;;) {
    const res = await listInsuranceRecords({ ...params, page, page_size: pageSize });
    total = res.total ?? all.length;
    const batch = res.data ?? [];
    all.push(...batch);
    if (batch.length === 0 || all.length >= total) break;
    page += 1;
  }
  return { total, data: all };
}

export async function listEmployeeContracts(params: {
  company_id: string;
  employee_id?: string;
  status?: "active" | "expired" | "terminated";
  page?: number;
  page_size?: number;
}) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  if (params.employee_id) search.set("employee_id", params.employee_id);
  if (params.status) search.set("status", params.status);
  if (params.page) search.set("page", String(params.page));
  if (params.page_size) search.set("page_size", String(clampHrmPageSize(params.page_size)));
  return requestHrm<{ total: number; page?: number; page_size?: number; data: HrmContractRecord[] }>(
    `/api/hrm/contracts-insurance/contracts?${search.toString()}`,
    { method: "GET" },
  );
}

/** Paginate through full contract list for dashboard / reports consumers. */
export async function listAllEmployeeContracts(params: {
  company_id: string;
  employee_id?: string;
  status?: "active" | "expired" | "terminated";
}): Promise<{ total: number; data: HrmContractRecord[] }> {
  const all: HrmContractRecord[] = [];
  let page = 1;
  let total = 0;
  const pageSize = clampHrmPageSize();
  for (;;) {
    const res = await listEmployeeContracts({ ...params, page, page_size: pageSize });
    total = res.total ?? all.length;
    const batch = res.data ?? [];
    all.push(...batch);
    if (batch.length === 0 || all.length >= total) break;
    page += 1;
  }
  return { total, data: all };
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
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  if (params.page) search.set("page", String(params.page));
  if (params.page_size) search.set("page_size", String(clampHrmPageSize(params.page_size)));
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
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
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
  const companyUuid = resolveHrmMetadataCompanyUuid(payload.company_id);
  if (!companyUuid) {
    throw new ApiClientError({
      status: 400,
      code: 'HRM-META-SCOPE',
      message: 'Không xác định được company_id UUID cho yêu cầu metadata',
    });
  }
  return requestHrm<HrmEmployeeMetadataChangeRequest>("/api/hrm/employee-metadata/change-requests", {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      company_id: companyUuid,
      current_value: serializeMetadataJsonValue(payload.current_value ?? null),
      requested_value: serializeMetadataJsonValue(payload.requested_value),
    }),
  });
}

export async function approveEmployeeMetadataChangeRequest(
  changeRequestId: string,
  payload?: { actor_user_id?: string; actor_name?: string; note?: string },
  scope?: HrmSpreadsheetScope,
) {
  return requestHrm<HrmEmployeeMetadataChangeRequest>(
    `/api/hrm/employee-metadata/change-requests/${changeRequestId}/approve`,
    { method: "POST", body: JSON.stringify(payload ?? {}) },
    scope ? { scope } : undefined,
  );
}

export async function rejectEmployeeMetadataChangeRequest(
  changeRequestId: string,
  payload?: { actor_user_id?: string; actor_name?: string; note?: string },
  scope?: HrmSpreadsheetScope,
) {
  return requestHrm<HrmEmployeeMetadataChangeRequest>(
    `/api/hrm/employee-metadata/change-requests/${changeRequestId}/reject`,
    { method: "POST", body: JSON.stringify(payload ?? {}) },
    scope ? { scope } : undefined,
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

export type HrmDecideAttendanceRequestPayload = {
  reviewer_name: string;
  reviewer_employee_id?: string;
  rejected_reason?: string;
};

function attendanceRequestListParams(params: {
  company_id: string;
  status?: string;
  employee_id?: string;
}) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  if (params.status) search.set("status", params.status);
  if (params.employee_id) search.set("employee_id", params.employee_id);
  return search;
}

export type HrmOvertimeRequest = {
  id: string;
  company_id: string;
  employee_id: string;
  employee_code: string;
  employee_name: string;
  department: string | null;
  position: string | null;
  overtime_date: string;
  start_time: string;
  end_time: string;
  total_hours: number;
  overtime_type: string;
  coefficient: number | null;
  reason: string;
  compensation_type: string | null;
  approver_id: string | null;
  approver_name: string | null;
  status: string;
  approved_at: string | null;
  rejected_reason: string | null;
  actual_hours: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export async function listOvertimeRequests(params: {
  company_id: string;
  status?: string;
  employee_id?: string;
}) {
  const search = attendanceRequestListParams(params);
  return requestHrm<{ total: number; data: HrmOvertimeRequest[] }>(
    `/api/hrm/attendance/overtime-requests?${search.toString()}`,
    { method: "GET" },
  );
}

export async function createOvertimeRequest(payload: Record<string, unknown>) {
  return requestHrm<HrmOvertimeRequest>("/api/hrm/attendance/overtime-requests", {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      company_id: normalizeHrmApiListCompanyId(String(payload.company_id ?? "")),
    }),
  });
}

export async function approveOvertimeRequest(
  requestId: string,
  payload: HrmDecideAttendanceRequestPayload,
) {
  return requestHrm<HrmOvertimeRequest>(
    `/api/hrm/attendance/overtime-requests/${requestId}/approve`,
    { method: "POST", body: JSON.stringify(payload) },
  );
}

export async function rejectOvertimeRequest(
  requestId: string,
  payload: HrmDecideAttendanceRequestPayload,
) {
  return requestHrm<HrmOvertimeRequest>(
    `/api/hrm/attendance/overtime-requests/${requestId}/reject`,
    { method: "POST", body: JSON.stringify(payload) },
  );
}

export async function deleteOvertimeRequest(requestId: string) {
  return requestHrm<{ id: string; deleted?: boolean }>(
    `/api/hrm/attendance/overtime-requests/${requestId}`,
    { method: "DELETE" },
  );
}

export type HrmBusinessTripRequest = {
  id: string;
  company_id: string;
  employee_id: string;
  employee_code: string;
  employee_name: string;
  department: string | null;
  position: string | null;
  destination: string;
  start_date: string;
  end_date: string;
  total_days: number;
  purpose: string;
  transportation: string | null;
  accommodation: string | null;
  estimated_cost: number | null;
  advance_amount: number | null;
  companions: string | null;
  contact_info: string | null;
  approver_id: string | null;
  approver_name: string | null;
  status: string;
  approved_at: string | null;
  rejected_reason: string | null;
  actual_cost: number | null;
  expense_report_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export async function listBusinessTripRequests(params: {
  company_id: string;
  status?: string;
  employee_id?: string;
}) {
  const search = attendanceRequestListParams(params);
  return requestHrm<{ total: number; data: HrmBusinessTripRequest[] }>(
    `/api/hrm/attendance/business-trip-requests?${search.toString()}`,
    { method: "GET" },
  );
}

export async function createBusinessTripRequest(payload: Record<string, unknown>) {
  return requestHrm<HrmBusinessTripRequest>("/api/hrm/attendance/business-trip-requests", {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      company_id: normalizeHrmApiListCompanyId(String(payload.company_id ?? "")),
    }),
  });
}

export async function approveBusinessTripRequest(
  requestId: string,
  payload: HrmDecideAttendanceRequestPayload,
) {
  return requestHrm<HrmBusinessTripRequest>(
    `/api/hrm/attendance/business-trip-requests/${requestId}/approve`,
    { method: "POST", body: JSON.stringify(payload) },
  );
}

export async function rejectBusinessTripRequest(
  requestId: string,
  payload: HrmDecideAttendanceRequestPayload,
) {
  return requestHrm<HrmBusinessTripRequest>(
    `/api/hrm/attendance/business-trip-requests/${requestId}/reject`,
    { method: "POST", body: JSON.stringify(payload) },
  );
}

export async function deleteBusinessTripRequest(requestId: string) {
  return requestHrm<{ id: string; deleted?: boolean }>(
    `/api/hrm/attendance/business-trip-requests/${requestId}`,
    { method: "DELETE" },
  );
}

export type HrmLateEarlyRequest = {
  id: string;
  company_id: string;
  employee_id: string;
  employee_code: string;
  employee_name: string;
  department: string | null;
  position: string | null;
  request_date: string;
  request_type: string;
  late_time: string | null;
  late_minutes: number | null;
  early_time: string | null;
  early_minutes: number | null;
  reason: string;
  approver_id: string | null;
  approver_name: string | null;
  status: string;
  approved_at: string | null;
  rejected_reason: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export async function listLateEarlyRequests(params: {
  company_id: string;
  status?: string;
  employee_id?: string;
}) {
  const search = attendanceRequestListParams(params);
  return requestHrm<{ total: number; data: HrmLateEarlyRequest[] }>(
    `/api/hrm/attendance/late-early-requests?${search.toString()}`,
    { method: "GET" },
  );
}

export async function createLateEarlyRequest(payload: Record<string, unknown>) {
  return requestHrm<HrmLateEarlyRequest>("/api/hrm/attendance/late-early-requests", {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      company_id: normalizeHrmApiListCompanyId(String(payload.company_id ?? "")),
    }),
  });
}

export async function approveLateEarlyRequest(
  requestId: string,
  payload: HrmDecideAttendanceRequestPayload,
) {
  return requestHrm<HrmLateEarlyRequest>(
    `/api/hrm/attendance/late-early-requests/${requestId}/approve`,
    { method: "POST", body: JSON.stringify(payload) },
  );
}

export async function rejectLateEarlyRequest(
  requestId: string,
  payload: HrmDecideAttendanceRequestPayload,
) {
  return requestHrm<HrmLateEarlyRequest>(
    `/api/hrm/attendance/late-early-requests/${requestId}/reject`,
    { method: "POST", body: JSON.stringify(payload) },
  );
}

export async function deleteLateEarlyRequest(requestId: string) {
  return requestHrm<{ id: string; deleted?: boolean }>(
    `/api/hrm/attendance/late-early-requests/${requestId}`,
    { method: "DELETE" },
  );
}

export type HrmShiftChangeRequest = {
  id: string;
  company_id: string;
  employee_id: string;
  employee_code: string;
  employee_name: string;
  department: string | null;
  position: string | null;
  change_date: string;
  change_type: string;
  current_shift: string;
  current_shift_time: string | null;
  requested_shift: string;
  requested_shift_time: string | null;
  swap_with_employee_id: string | null;
  swap_with_employee_name: string | null;
  swap_with_employee_code: string | null;
  reason: string;
  approver_id: string | null;
  approver_name: string | null;
  status: string;
  approved_at: string | null;
  rejected_reason: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export async function listShiftChangeRequests(params: {
  company_id: string;
  status?: string;
  employee_id?: string;
}) {
  const search = attendanceRequestListParams(params);
  return requestHrm<{ total: number; data: HrmShiftChangeRequest[] }>(
    `/api/hrm/attendance/shift-change-requests?${search.toString()}`,
    { method: "GET" },
  );
}

export async function createShiftChangeRequest(payload: Record<string, unknown>) {
  return requestHrm<HrmShiftChangeRequest>("/api/hrm/attendance/shift-change-requests", {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      company_id: normalizeHrmApiListCompanyId(String(payload.company_id ?? "")),
    }),
  });
}

export async function approveShiftChangeRequest(
  requestId: string,
  payload: HrmDecideAttendanceRequestPayload,
) {
  return requestHrm<HrmShiftChangeRequest>(
    `/api/hrm/attendance/shift-change-requests/${requestId}/approve`,
    { method: "POST", body: JSON.stringify(payload) },
  );
}

export async function rejectShiftChangeRequest(
  requestId: string,
  payload: HrmDecideAttendanceRequestPayload,
) {
  return requestHrm<HrmShiftChangeRequest>(
    `/api/hrm/attendance/shift-change-requests/${requestId}/reject`,
    { method: "POST", body: JSON.stringify(payload) },
  );
}

export async function deleteShiftChangeRequest(requestId: string) {
  return requestHrm<{ id: string; deleted?: boolean }>(
    `/api/hrm/attendance/shift-change-requests/${requestId}`,
    { method: "DELETE" },
  );
}

export type HrmAdvanceRequest = {
  id: string;
  company_id: string;
  name: string;
  salary_period: string;
  department: string | null;
  position: string | null;
  employee_count: number;
  total_amount: number;
  status: string;
  current_approval_level: number;
  approval_steps: unknown[] | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type HrmAdvanceRequestEmployee = {
  id: string;
  company_id: string;
  request_id: string;
  employee_id: string | null;
  employee_code: string;
  employee_name: string;
  department: string | null;
  position: string | null;
  advance_amount: number;
  note: string | null;
  created_at: string;
  updated_at: string;
};

export async function listAdvanceRequests(params: { company_id: string; status?: string }) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  if (params.status) search.set("status", params.status);
  return requestHrm<{ total: number; data: HrmAdvanceRequest[] }>(
    `/api/hrm/payroll/advance-requests?${search.toString()}`,
    { method: "GET" },
  );
}

export async function createAdvanceRequest(payload: Record<string, unknown>) {
  return requestHrm<HrmAdvanceRequest>("/api/hrm/payroll/advance-requests", {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      company_id: normalizeHrmApiListCompanyId(String(payload.company_id ?? "")),
    }),
  });
}

export async function listAdvanceRequestEmployees(requestId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<{ total: number; data: HrmAdvanceRequestEmployee[] }>(
    `/api/hrm/payroll/advance-requests/${requestId}/employees?${search.toString()}`,
    { method: "GET" },
  );
}

export type HrmDecideAdvanceRequestPayload = {
  reviewer_name: string;
  reviewer_employee_id?: string;
  rejected_reason?: string;
};

export async function approveAdvanceRequest(
  requestId: string,
  payload: HrmDecideAdvanceRequestPayload,
) {
  return requestHrm<HrmAdvanceRequest>(
    `/api/hrm/payroll/advance-requests/${requestId}/approve`,
    { method: "POST", body: JSON.stringify(payload) },
  );
}

export async function rejectAdvanceRequest(
  requestId: string,
  payload: HrmDecideAdvanceRequestPayload,
) {
  return requestHrm<HrmAdvanceRequest>(
    `/api/hrm/payroll/advance-requests/${requestId}/reject`,
    { method: "POST", body: JSON.stringify(payload) },
  );
}

export async function markAdvanceRequestPaid(
  requestId: string,
  payload: HrmDecideAdvanceRequestPayload,
) {
  return requestHrm<HrmAdvanceRequest>(
    `/api/hrm/payroll/advance-requests/${requestId}/mark-paid`,
    { method: "POST", body: JSON.stringify(payload) },
  );
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

export type HrmAttendanceOverview = {
  stats: {
    lateEarlyToday: number;
    lateEarlyChange: number;
    actualLeaveThisWeek: number;
    actualLeaveChange: number;
    plannedLeaveNextWeek: number;
    plannedLeaveChange: number;
  };
  monthlyLeaveData: Array<{ month: string; value: number }>;
  departmentLeaveData: Array<{ name: string; value: number }>;
  leaveTypeData: Array<{ name: string; value: number; color: string }>;
  lateEarlyList: Array<{ name: string; dept: string; count: number }>;
};

export async function fetchAttendanceOverview(params: { company_id: string; year?: number }) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  if (params.year != null) search.set("year", String(params.year));
  return requestHrm<HrmAttendanceOverview>(
    `/api/hrm/attendance/overview?${search.toString()}`,
    { method: "GET" },
  );
}

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

export type HrmDecisionRecord = {
  id: string;
  company_id: string;
  decision_code: string;
  decision_type: string;
  title: string;
  content: string | null;
  employee_id: string | null;
  employee_name: string;
  employee_code: string | null;
  department: string | null;
  position: string | null;
  effective_date: string | null;
  expiry_date: string | null;
  signer_name: string | null;
  signer_position: string | null;
  signing_date: string | null;
  file_url: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export async function listHrDecisions(params: {
  company_id: string;
  decision_type?: string;
  status?: string;
}) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  if (params.decision_type) search.set("decision_type", params.decision_type);
  if (params.status) search.set("status", params.status);
  return requestHrm<{ total: number; data: HrmDecisionRecord[] }>(
    `/api/hrm/decisions?${search.toString()}`,
    { method: "GET" },
  );
}

export async function createHrDecision(payload: {
  company_id: string;
  decision_code: string;
  decision_type: string;
  title: string;
  content?: string;
  employee_id?: string;
  employee_name: string;
  employee_code?: string;
  department?: string;
  position?: string;
  effective_date?: string;
  expiry_date?: string;
  signer_name?: string;
  signer_position?: string;
  signing_date?: string;
  file_url?: string;
  status?: string;
  notes?: string;
}) {
  return requestHrm<HrmDecisionRecord>("/api/hrm/decisions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateHrDecision(
  decisionId: string,
  payload: Partial<{
    company_id: string;
    decision_code: string;
    decision_type: string;
    title: string;
    content?: string;
    employee_id?: string;
    employee_name: string;
    employee_code?: string;
    department?: string;
    position?: string;
    effective_date?: string;
    expiry_date?: string;
    signer_name?: string;
    signer_position?: string;
    signing_date?: string;
    file_url?: string;
    status?: string;
    notes?: string;
  }>,
) {
  return requestHrm<HrmDecisionRecord>(`/api/hrm/decisions/${decisionId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteHrDecision(decisionId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<{ id: string }>(`/api/hrm/decisions/${decisionId}?${search.toString()}`, {
    method: "DELETE",
  });
}

export type HrmSalaryComponentRow = Record<string, unknown> & {
  id: string;
  company_id: string;
  code: string;
  name: string;
  category?: Record<string, unknown> | null;
};

export async function listSalaryComponents(companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<{ total: number; data: HrmSalaryComponentRow[] }>(
    `/api/hrm/payroll/salary-components?${search.toString()}`,
    { method: "GET" },
  );
}

export async function listSalaryComponentCategories(companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<{ total: number; data: Record<string, unknown>[] }>(
    `/api/hrm/payroll/salary-component-categories?${search.toString()}`,
    { method: "GET" },
  );
}

export async function createSalaryComponent(payload: Record<string, unknown>) {
  return requestHrm<HrmSalaryComponentRow>("/api/hrm/payroll/salary-components", {
    method: "POST",
    body: JSON.stringify({ ...payload, company_id: normalizeHrmApiListCompanyId(String(payload.company_id ?? "")) }),
  });
}

export async function updateSalaryComponent(
  componentId: string,
  companyId: string,
  payload: Record<string, unknown>,
) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmSalaryComponentRow>(
    `/api/hrm/payroll/salary-components/${componentId}?${search.toString()}`,
    { method: "PATCH", body: JSON.stringify(payload) },
  );
}

export async function deleteSalaryComponent(componentId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<{ id: string }>(
    `/api/hrm/payroll/salary-components/${componentId}?${search.toString()}`,
    { method: "DELETE" },
  );
}

export async function createSalaryComponentCategory(payload: Record<string, unknown>) {
  return requestHrm<Record<string, unknown>>("/api/hrm/payroll/salary-component-categories", {
    method: "POST",
    body: JSON.stringify({ ...payload, company_id: normalizeHrmApiListCompanyId(String(payload.company_id ?? "")) }),
  });
}

export async function deleteSalaryComponentCategory(categoryId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<{ id: string }>(
    `/api/hrm/payroll/salary-component-categories/${categoryId}?${search.toString()}`,
    { method: "DELETE" },
  );
}

export type HrmPaymentBatchRow = Record<string, unknown> & { id: string; company_id: string };

export async function listPaymentBatches(companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<{ total: number; data: HrmPaymentBatchRow[] }>(
    `/api/hrm/payroll/payment-batches?${search.toString()}`,
    { method: "GET" },
  );
}

export async function listPaymentBatchRecords(batchId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<{ total: number; data: Record<string, unknown>[] }>(
    `/api/hrm/payroll/payment-batches/${batchId}/records?${search.toString()}`,
    { method: "GET" },
  );
}

export async function addPaymentBatchRecord(
  batchId: string,
  companyId: string,
  payload: {
    employee_code: string;
    employee_name: string;
    amount: number;
    department?: string | null;
    bank_name?: string | null;
    bank_account?: string | null;
    payroll_record_id?: string | null;
    employee_id?: string | null;
    notes?: string | null;
  },
) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<Record<string, unknown>>(
    `/api/hrm/payroll/payment-batches/${batchId}/records?${search.toString()}`,
    { method: "POST", body: JSON.stringify(payload) },
  );
}

export async function processPaymentBatchRecord(
  batchId: string,
  recordId: string,
  companyId: string,
  payload?: { transaction_ref?: string; notes?: string },
) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<Record<string, unknown>>(
    `/api/hrm/payroll/payment-batches/${batchId}/records/${recordId}/process?${search.toString()}`,
    { method: "POST", body: JSON.stringify(payload ?? {}) },
  );
}

export async function processPaymentBatch(
  batchId: string,
  companyId: string,
  payload?: { notes?: string },
) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<Record<string, unknown>>(
    `/api/hrm/payroll/payment-batches/${batchId}/process?${search.toString()}`,
    { method: "POST", body: JSON.stringify(payload ?? {}) },
  );
}

export async function createPaymentBatch(payload: Record<string, unknown>) {
  return requestHrm<HrmPaymentBatchRow>("/api/hrm/payroll/payment-batches", {
    method: "POST",
    body: JSON.stringify({ ...payload, company_id: normalizeHrmApiListCompanyId(String(payload.company_id ?? "")) }),
  });
}

export async function updatePaymentBatch(
  batchId: string,
  companyId: string,
  payload: Record<string, unknown>,
) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmPaymentBatchRow>(
    `/api/hrm/payroll/payment-batches/${batchId}?${search.toString()}`,
    { method: "PATCH", body: JSON.stringify(payload) },
  );
}

export async function deletePaymentBatch(batchId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<{ id: string }>(
    `/api/hrm/payroll/payment-batches/${batchId}?${search.toString()}`,
    { method: "DELETE" },
  );
}

export type HrmWorkShiftRow = Record<string, unknown> & { id: string; company_id: string };

export async function listWorkShifts(companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<{ total: number; data: HrmWorkShiftRow[] }>(
    `/api/hrm/attendance/work-shifts?${search.toString()}`,
    { method: "GET" },
  );
}

export async function createWorkShift(payload: Record<string, unknown>) {
  return requestHrm<HrmWorkShiftRow>("/api/hrm/attendance/work-shifts", {
    method: "POST",
    body: JSON.stringify({ ...payload, company_id: normalizeHrmApiListCompanyId(String(payload.company_id ?? "")) }),
  });
}

export async function updateWorkShift(shiftId: string, companyId: string, payload: Record<string, unknown>) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmWorkShiftRow>(
    `/api/hrm/attendance/work-shifts/${shiftId}?${search.toString()}`,
    { method: "PATCH", body: JSON.stringify(payload) },
  );
}

export async function deleteWorkShift(shiftId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<{ id: string }>(
    `/api/hrm/attendance/work-shifts/${shiftId}?${search.toString()}`,
    { method: "DELETE" },
  );
}

export type HrmAttendanceSheetRow = Record<string, unknown> & { id: string; company_id: string };

export async function listAttendanceSheets(companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<{ total: number; data: HrmAttendanceSheetRow[] }>(
    `/api/hrm/attendance/attendance-sheets?${search.toString()}`,
    { method: "GET" },
  );
}

export async function createAttendanceSheet(payload: Record<string, unknown>) {
  return requestHrm<HrmAttendanceSheetRow>("/api/hrm/attendance/attendance-sheets", {
    method: "POST",
    body: JSON.stringify({ ...payload, company_id: normalizeHrmApiListCompanyId(String(payload.company_id ?? "")) }),
  });
}

export async function updateAttendanceSheet(
  sheetId: string,
  companyId: string,
  payload: Record<string, unknown>,
) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmAttendanceSheetRow>(
    `/api/hrm/attendance/attendance-sheets/${sheetId}?${search.toString()}`,
    { method: "PATCH", body: JSON.stringify(payload) },
  );
}

export async function deleteAttendanceSheet(sheetId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<{ id: string }>(
    `/api/hrm/attendance/attendance-sheets/${sheetId}?${search.toString()}`,
    { method: "DELETE" },
  );
}

export async function updateJobPosting(
  jobPostingId: string,
  companyId: string,
  payload: Record<string, unknown>,
) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmJobPostingRow>(
    `/api/hrm/recruitment/job-postings/${jobPostingId}?${search.toString()}`,
    { method: "PATCH", body: JSON.stringify(payload) },
  );
}

export async function updateCandidatePoolStage(
  candidateId: string,
  companyId: string,
  stage: string,
) {
  return updateCandidatePool(candidateId, companyId, { stage });
}

export async function createRecruitmentPlan(payload: Record<string, unknown>) {
  return requestHrm<HrmRecruitmentPlanRow>("/api/hrm/recruitment/recruitment-plans", {
    method: "POST",
    body: JSON.stringify({ ...payload, company_id: normalizeHrmApiListCompanyId(String(payload.company_id ?? "")) }),
  });
}

export async function deleteRecruitmentPlan(planId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<{ id: string }>(
    `/api/hrm/recruitment/recruitment-plans/${planId}?${search.toString()}`,
    { method: "DELETE" },
  );
}

export type HrmInterviewCatalogRow = Record<string, unknown> & {
  id: string;
  company_id: string;
  candidate_name: string;
};

export async function listInterviewsCatalog(companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<{ total: number; data: HrmInterviewCatalogRow[] }>(
    `/api/hrm/recruitment/interviews-catalog?${search.toString()}`,
    { method: "GET" },
  );
}

export async function createInterviewCatalog(payload: Record<string, unknown>) {
  return requestHrm<HrmInterviewCatalogRow>("/api/hrm/recruitment/interviews-catalog", {
    method: "POST",
    body: JSON.stringify({ ...payload, company_id: normalizeHrmApiListCompanyId(String(payload.company_id ?? "")) }),
  });
}

export async function updateInterviewCatalog(
  interviewId: string,
  companyId: string,
  payload: Record<string, unknown>,
) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmInterviewCatalogRow>(
    `/api/hrm/recruitment/interviews-catalog/${interviewId}?${search.toString()}`,
    { method: "PATCH", body: JSON.stringify(payload) },
  );
}

export async function deleteInterviewCatalog(interviewId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<{ id: string }>(
    `/api/hrm/recruitment/interviews-catalog/${interviewId}?${search.toString()}`,
    { method: "DELETE" },
  );
}

function employeeProfileQuery(companyId: string) {
  const search = new URLSearchParams();
  setListCompanyId(search, companyId);
  return search;
}

type ProfileListResult<T> = { total: number; data: T[] };

export async function listEmployeeSkills(employeeId: string, companyId: string) {
  return requestHrm<ProfileListResult<Record<string, unknown>>>(
    `/api/hrm/employees/${encodeURIComponent(employeeId)}/skills?${employeeProfileQuery(companyId).toString()}`,
    { method: "GET" },
  );
}

export async function createEmployeeSkill(employeeId: string, companyId: string, payload: Record<string, unknown>) {
  return requestHrm<Record<string, unknown>>(
    `/api/hrm/employees/${encodeURIComponent(employeeId)}/skills?${employeeProfileQuery(companyId).toString()}`,
    { method: "POST", body: JSON.stringify(payload) },
  );
}

export async function updateEmployeeSkill(
  employeeId: string,
  skillId: string,
  companyId: string,
  payload: Record<string, unknown>,
) {
  return requestHrm<Record<string, unknown>>(
    `/api/hrm/employees/${encodeURIComponent(employeeId)}/skills/${skillId}?${employeeProfileQuery(companyId).toString()}`,
    { method: "PATCH", body: JSON.stringify(payload) },
  );
}

export async function deleteEmployeeSkill(employeeId: string, skillId: string, companyId: string) {
  return requestHrm<{ id: string }>(
    `/api/hrm/employees/${encodeURIComponent(employeeId)}/skills/${skillId}?${employeeProfileQuery(companyId).toString()}`,
    { method: "DELETE" },
  );
}

export async function listEmployeeWorkTimeline(employeeId: string, companyId: string) {
  return requestHrm<ProfileListResult<Record<string, unknown>>>(
    `/api/hrm/employees/${encodeURIComponent(employeeId)}/work-timeline?${employeeProfileQuery(companyId).toString()}`,
    { method: "GET" },
  );
}

export async function createEmployeeWorkTimelineItem(
  employeeId: string,
  companyId: string,
  payload: Record<string, unknown>,
) {
  return requestHrm<Record<string, unknown>>(
    `/api/hrm/employees/${encodeURIComponent(employeeId)}/work-timeline?${employeeProfileQuery(companyId).toString()}`,
    { method: "POST", body: JSON.stringify(payload) },
  );
}

export async function updateEmployeeWorkTimelineItem(
  employeeId: string,
  itemId: string,
  companyId: string,
  payload: Record<string, unknown>,
) {
  return requestHrm<Record<string, unknown>>(
    `/api/hrm/employees/${encodeURIComponent(employeeId)}/work-timeline/${itemId}?${employeeProfileQuery(companyId).toString()}`,
    { method: "PATCH", body: JSON.stringify(payload) },
  );
}

export async function deleteEmployeeWorkTimelineItem(employeeId: string, itemId: string, companyId: string) {
  return requestHrm<{ id: string }>(
    `/api/hrm/employees/${encodeURIComponent(employeeId)}/work-timeline/${itemId}?${employeeProfileQuery(companyId).toString()}`,
    { method: "DELETE" },
  );
}

export async function listEmployeeResumeFiles(employeeId: string, companyId: string) {
  return requestHrm<ProfileListResult<Record<string, unknown>>>(
    `/api/hrm/employees/${encodeURIComponent(employeeId)}/resume-files?${employeeProfileQuery(companyId).toString()}`,
    { method: "GET" },
  );
}

export async function createEmployeeResumeFile(employeeId: string, companyId: string, payload: Record<string, unknown>) {
  return requestHrm<Record<string, unknown>>(
    `/api/hrm/employees/${encodeURIComponent(employeeId)}/resume-files?${employeeProfileQuery(companyId).toString()}`,
    { method: "POST", body: JSON.stringify(payload) },
  );
}

export async function deleteEmployeeResumeFile(employeeId: string, fileId: string, companyId: string) {
  return requestHrm<{ id: string }>(
    `/api/hrm/employees/${encodeURIComponent(employeeId)}/resume-files/${fileId}?${employeeProfileQuery(companyId).toString()}`,
    { method: "DELETE" },
  );
}

export async function listEmployeeRewards(employeeId: string, companyId: string) {
  return requestHrm<ProfileListResult<Record<string, unknown>>>(
    `/api/hrm/employees/${encodeURIComponent(employeeId)}/rewards?${employeeProfileQuery(companyId).toString()}`,
    { method: "GET" },
  );
}

export async function listEmployeeDiscipline(employeeId: string, companyId: string) {
  return requestHrm<ProfileListResult<Record<string, unknown>>>(
    `/api/hrm/employees/${encodeURIComponent(employeeId)}/discipline?${employeeProfileQuery(companyId).toString()}`,
    { method: "GET" },
  );
}

export async function createEmployeeReward(employeeId: string, companyId: string, payload: Record<string, unknown>) {
  return requestHrm<Record<string, unknown>>(
    `/api/hrm/employees/${encodeURIComponent(employeeId)}/rewards?${employeeProfileQuery(companyId).toString()}`,
    { method: "POST", body: JSON.stringify(payload) },
  );
}

export async function updateEmployeeReward(
  employeeId: string,
  rewardId: string,
  companyId: string,
  payload: Record<string, unknown>,
) {
  return requestHrm<Record<string, unknown>>(
    `/api/hrm/employees/${encodeURIComponent(employeeId)}/rewards/${rewardId}?${employeeProfileQuery(companyId).toString()}`,
    { method: "PATCH", body: JSON.stringify(payload) },
  );
}

export async function deleteEmployeeReward(employeeId: string, rewardId: string, companyId: string) {
  return requestHrm<{ id: string }>(
    `/api/hrm/employees/${encodeURIComponent(employeeId)}/rewards/${rewardId}?${employeeProfileQuery(companyId).toString()}`,
    { method: "DELETE" },
  );
}

export async function createEmployeeDiscipline(employeeId: string, companyId: string, payload: Record<string, unknown>) {
  return requestHrm<Record<string, unknown>>(
    `/api/hrm/employees/${encodeURIComponent(employeeId)}/discipline?${employeeProfileQuery(companyId).toString()}`,
    { method: "POST", body: JSON.stringify(payload) },
  );
}

export async function updateEmployeeDiscipline(
  employeeId: string,
  disciplineId: string,
  companyId: string,
  payload: Record<string, unknown>,
) {
  return requestHrm<Record<string, unknown>>(
    `/api/hrm/employees/${encodeURIComponent(employeeId)}/discipline/${disciplineId}?${employeeProfileQuery(companyId).toString()}`,
    { method: "PATCH", body: JSON.stringify(payload) },
  );
}

export async function deleteEmployeeDiscipline(employeeId: string, disciplineId: string, companyId: string) {
  return requestHrm<{ id: string }>(
    `/api/hrm/employees/${encodeURIComponent(employeeId)}/discipline/${disciplineId}?${employeeProfileQuery(companyId).toString()}`,
    { method: "DELETE" },
  );
}

export async function listEmployeeTraining(employeeId: string, companyId: string) {
  return requestHrm<ProfileListResult<Record<string, unknown>>>(
    `/api/hrm/employees/${encodeURIComponent(employeeId)}/training?${employeeProfileQuery(companyId).toString()}`,
    { method: "GET" },
  );
}

export async function createEmployeeTraining(employeeId: string, companyId: string, payload: Record<string, unknown>) {
  return requestHrm<Record<string, unknown>>(
    `/api/hrm/employees/${encodeURIComponent(employeeId)}/training?${employeeProfileQuery(companyId).toString()}`,
    { method: "POST", body: JSON.stringify(payload) },
  );
}

export async function updateEmployeeTraining(
  employeeId: string,
  trainingId: string,
  companyId: string,
  payload: Record<string, unknown>,
) {
  return requestHrm<Record<string, unknown>>(
    `/api/hrm/employees/${encodeURIComponent(employeeId)}/training/${trainingId}?${employeeProfileQuery(companyId).toString()}`,
    { method: "PATCH", body: JSON.stringify(payload) },
  );
}

export async function deleteEmployeeTraining(employeeId: string, trainingId: string, companyId: string) {
  return requestHrm<{ id: string }>(
    `/api/hrm/employees/${encodeURIComponent(employeeId)}/training/${trainingId}?${employeeProfileQuery(companyId).toString()}`,
    { method: "DELETE" },
  );
}

export async function inviteEmployees(payload: {
  company_id: string;
  employees: Array<{ email: string; full_name?: string; employee_id?: string }>;
}) {
  return requestHrm<{
    success: boolean;
    total: number;
    invited: number;
    failed: number;
    results: Array<{ email: string; success: boolean; error?: string }>;
  }>("/api/hrm/admin/invite-employee", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function listAdminCompanies() {
  return requestHrm<{ total: number; data: Array<{ id: string; name: string; code: string | null }> }>(
    "/api/hrm/admin/companies",
    { method: "GET" },
  );
}

export async function listCompanyMemberships(companyId?: string) {
  const search = new URLSearchParams();
  if (companyId) setListCompanyId(search, companyId);
  const qs = search.toString();
  return requestHrm<{ total: number; data: Record<string, unknown>[] }>(
    `/api/hrm/admin/company-memberships${qs ? `?${qs}` : ""}`,
    { method: "GET" },
  );
}

export async function upsertCompanyMembership(payload: {
  email: string;
  full_name: string;
  role: string;
  company_id: string;
  employee_id?: string | null;
  status?: string;
}) {
  return requestHrm<Record<string, unknown>>("/api/hrm/admin/company-memberships", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateCompanyMembership(
  membershipId: string,
  payload: { role?: string; employee_id?: string | null; status?: string; full_name?: string; email?: string },
) {
  return requestHrm<Record<string, unknown>>(`/api/hrm/admin/company-memberships/${membershipId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteCompanyMembership(membershipId: string) {
  return requestHrm<{ id: string }>(`/api/hrm/admin/company-memberships/${membershipId}`, { method: "DELETE" });
}

export type HrmCandidateApplicationEnriched = HrmCandidateApplicationRow & {
  candidates: {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
    position: string | null;
    stage: string | null;
    rating: number | null;
    avatar_url: string | null;
    applied_date: string | null;
    source: string | null;
  };
};

export async function createCandidateApplication(payload: {
  company_id: string;
  candidate_id: string;
  job_posting_id: string;
  stage?: string;
}) {
  return requestHrm<HrmCandidateApplicationRow>("/api/hrm/recruitment/candidate-applications", {
    method: "POST",
    body: JSON.stringify({ ...payload, company_id: normalizeHrmApiListCompanyId(payload.company_id) }),
  });
}

export async function deleteCandidateApplication(applicationId: string, companyId: string) {
  const search = new URLSearchParams();
  setListCompanyId(search, companyId);
  return requestHrm<{ id: string }>(
    `/api/hrm/recruitment/candidate-applications/${applicationId}?${search.toString()}`,
    { method: "DELETE" },
  );
}

export async function updateCandidateApplicationStage(applicationId: string, companyId: string, stage: string) {
  const search = new URLSearchParams();
  setListCompanyId(search, companyId);
  return requestHrm<HrmCandidateApplicationRow>(
    `/api/hrm/recruitment/candidate-applications/${applicationId}/stage?${search.toString()}`,
    { method: "PATCH", body: JSON.stringify({ stage }) },
  );
}

export async function listHeadcountProposals(companyId: string) {
  const search = new URLSearchParams();
  setListCompanyId(search, companyId);
  return requestHrm<{ total: number; data: Record<string, unknown>[] }>(
    `/api/hrm/recruitment/headcount-proposals?${search.toString()}`,
    { method: "GET" },
  );
}

export async function createHeadcountProposal(payload: Record<string, unknown>) {
  return requestHrm<Record<string, unknown>>("/api/hrm/recruitment/headcount-proposals", {
    method: "POST",
    body: JSON.stringify({ ...payload, company_id: normalizeHrmApiListCompanyId(String(payload.company_id ?? "")) }),
  });
}

export async function updateHeadcountProposalStatus(
  proposalId: string,
  companyId: string,
  status: string,
  rejectedReason?: string,
) {
  const search = new URLSearchParams();
  setListCompanyId(search, companyId);
  return requestHrm<Record<string, unknown>>(
    `/api/hrm/recruitment/headcount-proposals/${proposalId}/status?${search.toString()}`,
    { method: "PATCH", body: JSON.stringify({ status, rejected_reason: rejectedReason }) },
  );
}

export async function listCandidateEvaluations(params: { company_id: string; candidate_id?: string }) {
  const search = new URLSearchParams();
  setListCompanyId(search, params.company_id);
  if (params.candidate_id) search.set("candidate_id", params.candidate_id);
  return requestHrm<{ total: number; data: Record<string, unknown>[] }>(
    `/api/hrm/recruitment/candidate-evaluations?${search.toString()}`,
    { method: "GET" },
  );
}

export async function createCandidateEvaluation(payload: Record<string, unknown>) {
  return requestHrm<Record<string, unknown>>("/api/hrm/recruitment/candidate-evaluations", {
    method: "POST",
    body: JSON.stringify({ ...payload, company_id: normalizeHrmApiListCompanyId(String(payload.company_id ?? "")) }),
  });
}

export async function deleteCandidateEvaluation(evaluationId: string, companyId: string) {
  const search = new URLSearchParams();
  setListCompanyId(search, companyId);
  return requestHrm<{ id: string }>(
    `/api/hrm/recruitment/candidate-evaluations/${evaluationId}?${search.toString()}`,
    { method: "DELETE" },
  );
}

export async function listEvaluationCriteriaTemplates(companyId: string) {
  const search = new URLSearchParams();
  setListCompanyId(search, companyId);
  return requestHrm<{ total: number; data: Record<string, unknown>[] }>(
    `/api/hrm/recruitment/evaluation-criteria-templates?${search.toString()}`,
    { method: "GET" },
  );
}

export async function replaceEvaluationCriteriaTemplates(companyId: string, templates: Record<string, unknown>[]) {
  return requestHrm<{ total: number; data: Record<string, unknown>[] }>(
    "/api/hrm/recruitment/evaluation-criteria-templates/replace",
    {
      method: "POST",
      body: JSON.stringify({ company_id: normalizeHrmApiListCompanyId(companyId), templates }),
    },
  );
}

export async function listDepartments(params: { company_id: string }) {
  const search = new URLSearchParams();
  setListCompanyId(search, params.company_id);
  return requestHrm<{ total: number; data: Record<string, unknown>[] }>(
    `/api/hrm/departments?${search.toString()}`,
    { method: "GET" },
  );
}

export async function createDepartment(payload: {
  company_id: string;
  name: string;
  code?: string;
  description?: string;
  parent_id?: string;
  level?: number;
  sort_order?: number;
}) {
  return requestHrm<Record<string, unknown>>("/api/hrm/departments", {
    method: "POST",
    body: JSON.stringify({ ...payload, company_id: normalizeHrmApiListCompanyId(payload.company_id) }),
  });
}

// --- P1-QUAL-FE-W3 catalog extensions ---

export async function listSalesData(params: { company_id: string; period_month?: number; period_year?: number }) {
  const search = new URLSearchParams();
  setListCompanyId(search, params.company_id);
  if (params.period_month) search.set("period_month", String(params.period_month));
  if (params.period_year) search.set("period_year", String(params.period_year));
  return requestHrm<{ total: number; data: Record<string, unknown>[] }>(`/api/hrm/sales-data?${search}`, { method: "GET" });
}

export async function createSalesData(payload: Record<string, unknown>) {
  return requestHrm<Record<string, unknown>>("/api/hrm/sales-data", {
    method: "POST",
    body: JSON.stringify({ ...payload, company_id: normalizeHrmApiListCompanyId(String(payload.company_id ?? "")) }),
  });
}

export async function updateSalesData(id: string, companyId: string, payload: Record<string, unknown>) {
  const search = new URLSearchParams();
  setListCompanyId(search, companyId);
  return requestHrm<Record<string, unknown>>(`/api/hrm/sales-data/${id}?${search}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteSalesData(id: string, companyId: string) {
  const search = new URLSearchParams();
  setListCompanyId(search, companyId);
  return requestHrm<{ id: string }>(`/api/hrm/sales-data/${id}?${search}`, { method: "DELETE" });
}

export async function syncSalesData(companyId: string) {
  const search = new URLSearchParams();
  setListCompanyId(search, companyId);
  return requestHrm<{ synced: number; company_id: string }>(`/api/hrm/sales-data/sync?${search}`, { method: "POST" });
}

export async function listBonusPolicies(companyId: string) {
  const search = new URLSearchParams();
  setListCompanyId(search, companyId);
  return requestHrm<{ total: number; data: Record<string, unknown>[] }>(`/api/hrm/bonus-policies?${search}`, { method: "GET" });
}

export async function createBonusPolicy(payload: Record<string, unknown>) {
  return requestHrm<Record<string, unknown>>("/api/hrm/bonus-policies", {
    method: "POST",
    body: JSON.stringify({ ...payload, company_id: normalizeHrmApiListCompanyId(String(payload.company_id ?? "")) }),
  });
}

export async function updateBonusPolicy(id: string, companyId: string, payload: Record<string, unknown>) {
  const search = new URLSearchParams();
  setListCompanyId(search, companyId);
  return requestHrm<Record<string, unknown>>(`/api/hrm/bonus-policies/${id}?${search}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteBonusPolicy(id: string, companyId: string) {
  const search = new URLSearchParams();
  setListCompanyId(search, companyId);
  return requestHrm<{ id: string }>(`/api/hrm/bonus-policies/${id}?${search}`, { method: "DELETE" });
}

export async function listBonusPolicyParticipants(policyId: string, companyId: string) {
  const search = new URLSearchParams();
  setListCompanyId(search, companyId);
  return requestHrm<{ total: number; data: Record<string, unknown>[] }>(
    `/api/hrm/bonus-policies/${policyId}/participants?${search}`,
    { method: "GET" },
  );
}

export async function createBonusPolicyParticipant(payload: Record<string, unknown>) {
  return requestHrm<Record<string, unknown>>("/api/hrm/bonus-policies/participants", {
    method: "POST",
    body: JSON.stringify({ ...payload, company_id: normalizeHrmApiListCompanyId(String(payload.company_id ?? "")) }),
  });
}

export async function listInsurancePolicyParticipants(companyId: string) {
  const search = new URLSearchParams();
  setListCompanyId(search, companyId);
  return requestHrm<{ total: number; data: Record<string, unknown>[] }>(
    `/api/hrm/insurance-policy-participants?${search}`,
    { method: "GET" },
  );
}

export async function createInsurancePolicyParticipant(payload: Record<string, unknown>) {
  return requestHrm<Record<string, unknown>>("/api/hrm/insurance-policy-participants", {
    method: "POST",
    body: JSON.stringify({ ...payload, company_id: normalizeHrmApiListCompanyId(String(payload.company_id ?? "")) }),
  });
}

export async function updateInsurancePolicyParticipant(id: string, companyId: string, payload: Record<string, unknown>) {
  const search = new URLSearchParams();
  setListCompanyId(search, companyId);
  return requestHrm<Record<string, unknown>>(`/api/hrm/insurance-policy-participants/${id}?${search}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteInsurancePolicyParticipant(id: string, companyId: string) {
  const search = new URLSearchParams();
  setListCompanyId(search, companyId);
  return requestHrm<{ id: string }>(`/api/hrm/insurance-policy-participants/${id}?${search}`, { method: "DELETE" });
}

export async function listTaxPolicyParticipants(companyId: string) {
  const search = new URLSearchParams();
  setListCompanyId(search, companyId);
  return requestHrm<{ total: number; data: Record<string, unknown>[] }>(
    `/api/hrm/tax-policy-participants?${search}`,
    { method: "GET" },
  );
}

export async function createTaxPolicyParticipant(payload: Record<string, unknown>) {
  return requestHrm<Record<string, unknown>>("/api/hrm/tax-policy-participants", {
    method: "POST",
    body: JSON.stringify({ ...payload, company_id: normalizeHrmApiListCompanyId(String(payload.company_id ?? "")) }),
  });
}

export async function updateTaxPolicyParticipant(id: string, companyId: string, payload: Record<string, unknown>) {
  const search = new URLSearchParams();
  setListCompanyId(search, companyId);
  return requestHrm<Record<string, unknown>>(`/api/hrm/tax-policy-participants/${id}?${search}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteTaxPolicyParticipant(id: string, companyId: string) {
  const search = new URLSearchParams();
  setListCompanyId(search, companyId);
  return requestHrm<{ id: string }>(`/api/hrm/tax-policy-participants/${id}?${search}`, { method: "DELETE" });
}

export async function listFaceData(companyId: string) {
  const search = new URLSearchParams();
  setListCompanyId(search, companyId);
  return requestHrm<{ total: number; data: Record<string, unknown>[] }>(`/api/hrm/face-data?${search}`, { method: "GET" });
}

export async function upsertFaceData(payload: Record<string, unknown>) {
  return requestHrm<Record<string, unknown>>("/api/hrm/face-data", {
    method: "POST",
    body: JSON.stringify({ ...payload, company_id: normalizeHrmApiListCompanyId(String(payload.company_id ?? "")) }),
  });
}

export async function deleteFaceData(employeeId: string, companyId: string) {
  const search = new URLSearchParams();
  setListCompanyId(search, companyId);
  return requestHrm<{ employee_id: string }>(`/api/hrm/face-data/${employeeId}?${search}`, { method: "DELETE" });
}

export async function getCompanySubscription(companyId: string) {
  const search = new URLSearchParams();
  setListCompanyId(search, companyId);
  return requestHrm<Record<string, unknown>>(`/api/hrm/company-subscription?${search}`, { method: "GET" });
}

export async function upgradeCompanySubscription(companyId: string, payload: Record<string, unknown>) {
  const search = new URLSearchParams();
  setListCompanyId(search, companyId);
  return requestHrm<Record<string, unknown>>(`/api/hrm/company-subscription/upgrade?${search}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function listGuideContent(companyId?: string) {
  const search = new URLSearchParams();
  if (companyId) setListCompanyId(search, companyId);
  const q = search.toString();
  return requestHrm<{ total: number; data: Record<string, unknown>[] }>(
    `/api/hrm/guide-content${q ? `?${q}` : ""}`,
    { method: "GET" },
  );
}

export async function upsertGuideContent(payload: Record<string, unknown>) {
  return requestHrm<Record<string, unknown>>("/api/hrm/guide-content", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function deleteGuideContent(payload: { section_id: string; step_index: number | null; company_id?: string }) {
  return requestHrm<{ ok: boolean }>("/api/hrm/guide-content", {
    method: "DELETE",
    body: JSON.stringify(payload),
  });
}

export async function listSalaryTemplateComponents(templateId: string, companyId: string) {
  const search = new URLSearchParams();
  setListCompanyId(search, companyId);
  return requestHrm<{ total: number; data: Record<string, unknown>[] }>(
    `/api/hrm/payroll/salary-templates/${templateId}/components?${search}`,
    { method: "GET" },
  );
}

export async function addSalaryTemplateComponent(
  templateId: string,
  payload: { company_id: string; component_id: string; default_value?: number; is_required?: boolean; sort_order?: number },
) {
  return requestHrm<Record<string, unknown>>(`/api/hrm/payroll/salary-templates/${templateId}/components`, {
    method: "POST",
    body: JSON.stringify({ ...payload, company_id: normalizeHrmApiListCompanyId(payload.company_id) }),
  });
}

export async function updateSalaryTemplateComponentRow(
  componentRowId: string,
  companyId: string,
  payload: Record<string, unknown>,
) {
  const search = new URLSearchParams();
  setListCompanyId(search, companyId);
  return requestHrm<Record<string, unknown>>(`/api/hrm/payroll/salary-template-components/${componentRowId}?${search}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function removeSalaryTemplateComponentRow(componentRowId: string, companyId: string) {
  const search = new URLSearchParams();
  setListCompanyId(search, companyId);
  return requestHrm<{ id: string }>(`/api/hrm/payroll/salary-template-components/${componentRowId}?${search}`, {
    method: "DELETE",
  });
}

export async function duplicateSalaryTemplate(templateId: string, companyId: string) {
  const search = new URLSearchParams();
  setListCompanyId(search, companyId);
  return requestHrm<HrmSalaryTemplateRow>(`/api/hrm/payroll/salary-templates/${templateId}/duplicate?${search}`, {
    method: "POST",
  });
}

export async function listEmployeeAssets(employeeId: string, companyId: string) {
  return requestHrm<ProfileListResult<Record<string, unknown>>>(
    `/api/hrm/employees/${encodeURIComponent(employeeId)}/assets?${employeeProfileQuery(companyId).toString()}`,
    { method: "GET" },
  );
}

export async function createEmployeeAsset(employeeId: string, companyId: string, payload: Record<string, unknown>) {
  return requestHrm<Record<string, unknown>>(
    `/api/hrm/employees/${encodeURIComponent(employeeId)}/assets?${employeeProfileQuery(companyId).toString()}`,
    { method: "POST", body: JSON.stringify(payload) },
  );
}

export async function updateEmployeeAsset(
  employeeId: string,
  assetId: string,
  companyId: string,
  payload: Record<string, unknown>,
) {
  return requestHrm<Record<string, unknown>>(
    `/api/hrm/employees/${encodeURIComponent(employeeId)}/assets/${assetId}?${employeeProfileQuery(companyId).toString()}`,
    { method: "PATCH", body: JSON.stringify(payload) },
  );
}

export async function deleteEmployeeAsset(employeeId: string, assetId: string, companyId: string) {
  return requestHrm<{ id: string }>(
    `/api/hrm/employees/${encodeURIComponent(employeeId)}/assets/${assetId}?${employeeProfileQuery(companyId).toString()}`,
    { method: "DELETE" },
  );
}

export async function uploadHrmFile(file: File, feature: string): Promise<string> {
  const scope = inferRuntimeScope();
  if (!scope?.companyId) {
    throw new ApiClientError({
      status: 400,
      code: "HRM-FILE-400",
      message: "Operating company scope is required for file upload",
    });
  }
  const search = new URLSearchParams();
  search.set("feature", feature);
  setListCompanyId(search, scope.companyId);
  const form = new FormData();
  form.append("file", file);
  const origin = HRM_API_ORIGIN;
  const res = await fetch(`${origin}/api/hrm/files/upload?${search.toString()}`, {
    method: "POST",
    headers: await headers({ omitContentType: true, scope }),
    body: form,
  });
  const { data } = await parseHrmJson<{ url: string }>(res);
  const url = data?.url ?? "";
  if (!url) {
    throw new ApiClientError({ status: res.status, code: "HRM-FILE-NO-URL", message: "Upload succeeded without URL" });
  }
  return url.startsWith("http") ? url : `${origin}${url}`;
}
