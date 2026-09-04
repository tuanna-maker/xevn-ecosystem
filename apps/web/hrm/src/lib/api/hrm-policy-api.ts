/**
 * @CODE-MEMORY
 * Purpose:    Thin API client for HRM Policy Engine endpoints.
 *             All fetch calls go through here — no direct fetch() in components.
 * WorkItem:   HRM-POLICY-FE-API
 * Coded:      2026-08-22
 * must_keep:  HRM_API_BASE from env; always pass Authorization header;
 *             all errors throw { statusCode, message }
 */

const HRM_API = (typeof window !== "undefined" && (window as Window & { __HRM_API__?: string }).__HRM_API__)
  || import.meta?.env?.VITE_HRM_API_BASE
  || "/api/hrm";

function getToken(): string {
  return localStorage.getItem("hrm_token") ?? "";
}

function parseJwtPayload(token: string | null): any {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

function getTenantId(): string {
  if (typeof window === "undefined") return "";
  // 1. Extract from JWT access token payload
  const token = getToken();
  const payload = parseJwtPayload(token);
  if (payload?.tenant_id) return payload.tenant_id;
  if (payload?.tenantId) return payload.tenantId;

  // 2. Extract from URL path segment (e.g. /xe-vietnam/command-center/hrm/payroll)
  const pathParts = window.location.pathname.split("/").filter(Boolean);
  if (
    pathParts.length > 0 &&
    !["hr", "payroll", "api", "admin", "login", "auth"].includes(pathParts[0])
  ) {
    return pathParts[0];
  }

  // 3. Fallback to localStorage session scope
  return (
    localStorage.getItem("hrm_current_tenant_id") ||
    localStorage.getItem("tenant_id") ||
    ""
  );
}

function getCompanyId(): string {
  if (typeof window === "undefined") return "";
  // 1. Extract from JWT access token payload
  const token = getToken();
  const payload = parseJwtPayload(token);
  if (payload?.company_id) return payload.company_id;
  if (payload?.companyId) return payload.companyId;

  // 2. Fallback to localStorage session scope
  return (
    localStorage.getItem("hrm_current_company_id") ||
    localStorage.getItem("company_id") ||
    ""
  );
}

async function apiFetch<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(`${HRM_API}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
      "x-tenant-id": getTenantId(),
      "x-company-id": getCompanyId(),
      ...(opts.headers ?? {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw { statusCode: res.status, message: err.message ?? res.statusText };
  }
  return res.json() as Promise<T>;
}

// ─── TYPES ───────────────────────────────────────────────────────────────────

export type PolicyStatus = "DRAFT" | "ACTIVE" | "ARCHIVED" | "SUPERSEDED";

export type PolicyGroup = {
  id: string;
  code: string;
  name_vi: string;
  icon: string | null;
  color_hex: string | null;
  sort_order: number;
  is_platform: boolean;
  active_policy_count: number;
};

export type PolicyAssignment = {
  id: string;
  policy_id: string;
  target_type: "job_title" | "department" | "employee" | "contract" | "pay_group" | "all";
  target_key: string | null;
  target_id: string | null;
  priority: number;
  effective_from: string;
  effective_to: string | null;
  created_by: string | null;
  created_at: string;
};

export type LookupItem = { key: string; label: string };

export type Policy = {
  id: string;
  name: string;
  pay_group_code: string;
  group_id: string | null;
  group_code: string | null;
  group_name_vi: string | null;
  group_icon: string | null;
  group_color_hex: string | null;
  status: PolicyStatus;
  version: number;
  effective_from: string;
  effective_to: string | null;
  description: string | null;
  created_at: string;
  components?: PolicyComponent[];
  component_count?: number;
  assignment_count?: number;
};

export type PolicyComponent = {
  id: string;
  policy_id: string;
  component_type: string;
  name: string;
  sort_order: number;
  is_deduction: boolean;
  input_source: string;
  params: Record<string, unknown>;
};

export type Grade = {
  id: string;
  grade_code: string;
  grade_name: string;
  pay_group_code: string;
  steps: GradeStep[];
};

export type GradeStep = {
  id: string;
  step_number: number;
  monthly_salary_vnd: string;
  min_seniority_months: number;
};

export type InputImport = {
  id: string;
  input_type: string;
  period_month: string;
  status: string;
  total_rows: number;
  matched_rows: number;
  error_rows: number;
  original_filename: string;
  created_at: string;
};

export type InputRow = {
  id: string;
  import_id: string;
  row_number: number;
  employee_id: string | null;
  match_status: string;
  data: Record<string, unknown>;
};

export type PayrollBatch = {
  id: string;
  period_month: string;
  status: string;
  employee_count: number;
  total_gross_vnd: string | null;
  total_net_vnd: string | null;
  created_at: string;
};

export type Payslip = {
  record_id: string;
  employee_id: string;
  period_month: string;
  gross_vnd: string;
  net_vnd: string;
  status: string;
  components: PayslipComponent[];
  warnings: string[];
};

export type PayslipComponent = {
  component_type: string;
  name: string;
  is_deduction: boolean;
  amount_vnd: string;
  breakdown: { label: string; value: string }[];
  warnings: string[];
  skipped: boolean;
};

// ─── POLICY API ──────────────────────────────────────────────────────────────

export const PolicyGroupAPI = {
  list: () =>
    apiFetch<{ data: PolicyGroup[] }>("/pay-policy-groups").then((r) => r.data),
};

export const PolicyAPI = {
  list: (params?: { status?: string; pay_group_code?: string; group_id?: string; search?: string }) => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set("status", params.status);
    if (params?.pay_group_code) qs.set("pay_group_code", params.pay_group_code);
    if (params?.group_id) qs.set("group_id", params.group_id);
    if (params?.search) qs.set("search", params.search);
    return apiFetch<{ data: Policy[]; total: number }>(`/pay-policies?${qs}`).then((r) => r);
  },
  get: (id: string) => apiFetch<Policy>(`/pay-policies/${id}`),
  create: (body: {
    name: string;
    pay_group_code: string;
    group_id?: string;
    effective_from: string;
    effective_to?: string;
    description?: string;
  }) =>
    apiFetch<{ policy_id: string; status: string }>("/pay-policies", { method: "POST", body: JSON.stringify(body) }),
  update: (id: string, body: { name?: string; effective_from?: string; description?: string; status?: string }) =>
    apiFetch(`/pay-policies/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  toggleStatus: (id: string) =>
    apiFetch(`/pay-policies/${id}/toggle-status`, { method: "POST" }),
  addComponent: (policyId: string, body: Omit<PolicyComponent, "id" | "policy_id">) =>
    apiFetch(`/pay-policies/${policyId}/components`, { method: "POST", body: JSON.stringify(body) }),
  updateComponent: (policyId: string, compId: string, body: Partial<Pick<PolicyComponent, "name" | "params" | "sort_order" | "is_deduction">>) =>
    apiFetch(`/pay-policies/${policyId}/components/${compId}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteComponent: (policyId: string, compId: string) =>
    apiFetch(`/pay-policies/${policyId}/components/${compId}`, { method: "DELETE" }),
  reorder: (policyId: string, orderedIds: string[]) =>
    apiFetch(`/pay-policies/${policyId}/components/reorder`, { method: "PUT", body: JSON.stringify({ ordered_ids: orderedIds }) }),
  activate: (id: string) => apiFetch<{ policy_id: string; status: string }>(`/pay-policies/${id}/activate`, { method: "POST" }),
  clone: (id: string, body: { name: string; effective_from: string }) =>
    apiFetch(`/pay-policies/${id}/clone`, { method: "POST", body: JSON.stringify(body) }),
  delete: (id: string) =>
    apiFetch<{ success: boolean }>(`/pay-policies/${id}`, { method: "DELETE" }),
};

export const PolicyAssignmentAPI = {
  list: (policyId: string) =>
    apiFetch<{ data: PolicyAssignment[] }>(`/pay-policies/${policyId}/assignments`).then((r) => r.data),
  create: (policyId: string, body: {
    target_type: string;
    target_key?: string;
    target_id?: string;
    priority?: number;
    effective_from: string;
    effective_to?: string;
  }) =>
    apiFetch<PolicyAssignment>(`/pay-policies/${policyId}/assignments`, { method: "POST", body: JSON.stringify(body) }),
  delete: (policyId: string, assignmentId: string) =>
    apiFetch<{ deleted: boolean }>(`/pay-policies/${policyId}/assignments/${assignmentId}`, { method: "DELETE" }),
};

export const LookupAPI = {
  positions: (search?: string) =>
    apiFetch<{ data: LookupItem[] }>(`/lookup/positions${search ? `?search=${encodeURIComponent(search)}` : ""}`).then((r) => r.data),
  departments: (search?: string) =>
    apiFetch<{ data: LookupItem[] }>(`/lookup/departments${search ? `?search=${encodeURIComponent(search)}` : ""}`).then((r) => r.data),
  payGroups: () =>
    apiFetch<{ data: LookupItem[] }>("/lookup/pay-groups").then((r) => r.data),
};

// ─── GRADE API ───────────────────────────────────────────────────────────────

export const GradeAPI = {
  list: () => apiFetch<{ data: Grade[] }>("/grades").then((r) => r.data),
  listAssignments: (employeeId: string) => apiFetch<{ data: unknown[] }>(`/employees/${employeeId}/grade-history`).then((r) => r.data),
  assign: (employeeId: string, body: { grade_code: string; step_number: number; effective_from: string }) =>
    apiFetch(`/employees/${employeeId}/grade-assignment`, { method: "POST", body: JSON.stringify(body) }),
};

// ─── INPUT API ───────────────────────────────────────────────────────────────

export const InputAPI = {
  list: (period: string) => apiFetch<{ data: InputImport[] }>(`/payroll-inputs/${period}`).then((r) => r.data),
  upload: async (period: string, inputType: string, file: File): Promise<InputImport> => {
    const form = new FormData();
    form.append("file", file);
    form.append("period_month", period);
    form.append("input_type", inputType);
    const res = await fetch(`${HRM_API}/payroll-inputs/import`, {
      method: "POST",
      headers: { Authorization: `Bearer ${getToken()}` },
      body: form,
    });
    if (!res.ok) throw await res.json().catch(() => ({ message: res.statusText }));
    return res.json();
  },
  getRows: (importId: string, page = 1, limit = 50) =>
    apiFetch<{ data: InputRow[]; total: number }>(`/payroll-inputs/imports/${importId}/rows?page=${page}&limit=${limit}`),
  approve: (importId: string) => apiFetch(`/payroll-inputs/imports/${importId}/approve`, { method: "POST" }),
};

// ─── BATCH API ───────────────────────────────────────────────────────────────

export const BatchAPI = {
  run: (period: string) =>
    apiFetch<{ batch_id: string; employee_count: number; warnings: string[] }>("/payroll-batch/run", {
      method: "POST", body: JSON.stringify({ period_month: period }),
    }),
  approve: (batchId: string) => apiFetch(`/payroll-batch/${batchId}/approve`, { method: "POST" }),
  getPayslip: (employeeId: string, period: string) =>
    apiFetch<Payslip>(`/payroll-batch/payslip/${employeeId}?period_month=${period}`),
};


export const SettingsAPI = {
  getMasterDataFields: () =>
    apiFetch<LookupItem[]>("/settings/master-data-fields").catch(() => [
      { key: "contract_type", label: "Loại hợp đồng" },
      { key: "department", label: "Phòng ban" },
      { key: "position", label: "Chức danh" },
      { key: "province", label: "Tỉnh định biên" },
      { key: "work_location", label: "Địa điểm làm việc" },
      { key: "seniority_months", label: "Thâm niên (tháng)" },
      { key: "performance_kpi", label: "Điểm KPI (%)" },
    ]),
};
