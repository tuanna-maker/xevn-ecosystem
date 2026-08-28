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

async function apiFetch<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const tenantId = 
    (typeof localStorage !== 'undefined' ? localStorage.getItem('hrm_current_tenant_id') : null) ||
    "xevn";
  const companyId = 
    (typeof localStorage !== 'undefined' ? localStorage.getItem('hrm_current_company_id') : null) ||
    "company_1";

  const res = await fetch(`${HRM_API}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
      "x-tenant-id": tenantId,
      "x-company-id": companyId,
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

export type Policy = {
  id: string;
  name: string;
  pay_group_code: string;
  status: PolicyStatus;
  version: number;
  effective_from: string;
  effective_to: string | null;
  description: string | null;
  created_at: string;
  components?: PolicyComponent[];
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

// ─── SETTINGS API ──────────────────────────────────────────────────────────────
export const SettingsAPI = {
  getMasterDataFields: () => {
    // Gọi API Settings/Catalogs để lấy cấu hình động thay vì fix cứng.
    // Tạm thời endpoint /settings/fields chưa deploy, trả về mock data để tránh lỗi 404 ở console
    return Promise.resolve([
        { 
          value: 'contract_type', label: 'Loại Hợp đồng', type: 'select', 
          options: [
            {value: 'Chính thức', label: 'Chính thức'}, 
            {value: 'Thử việc', label: 'Thử việc'}, 
            {value: 'Khoán việc', label: 'Khoán việc'}, 
            {value: 'Xác định thời hạn', label: 'Xác định thời hạn'},
            {value: 'HĐ Không thời hạn', label: 'HĐ Không thời hạn'},
            {value: 'HĐ Xác định thời hạn 1-3 năm', label: 'HĐ Xác định thời hạn 1-3 năm'}
          ] 
        },
        { 
          value: 'resident_status', label: 'Tình trạng cư trú', type: 'select', 
          options: [
            {value: 'Cá nhân cư trú', label: 'Cá nhân cư trú'}, 
            {value: 'Cá nhân không cư trú', label: 'Cá nhân không cư trú'}
          ] 
        },
        { value: 'employee_group', label: 'Nhóm nhân sự', type: 'text' },
        { value: 'nationality', label: 'Quốc tịch', type: 'text' },
        { value: 'position', label: 'Vị trí công việc', type: 'text' }
      ]);
  }
};

// ─── POLICY API ──────────────────────────────────────────────────────────────

export const PolicyAPI = {
  list: (params?: { status?: string; pay_group_code?: string }) => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set("status", params.status);
    if (params?.pay_group_code) qs.set("pay_group_code", params.pay_group_code);
    return apiFetch<{ data: Policy[] }>(`/pay-policies?${qs}`).then((r) => r.data);
  },
  get: (id: string) => apiFetch<Policy>(`/pay-policies/${id}`),
  create: (body: { name: string; pay_group_code: string; effective_from: string; description?: string }) =>
    apiFetch<{ policy_id: string; status: string }>("/pay-policies", { method: "POST", body: JSON.stringify(body) }),
  update: (id: string, body: { name?: string; effective_from?: string; description?: string }) =>
    apiFetch<{ success: boolean }>(`/pay-policies/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  addComponent: (policyId: string, body: Omit<PolicyComponent, "id" | "policy_id">) =>
    apiFetch(`/pay-policies/${policyId}/components`, { method: "POST", body: JSON.stringify(body) }),
  deleteComponent: (policyId: string, componentId: string) =>
    apiFetch<{ success: boolean }>(`/pay-policies/${policyId}/components/${componentId}`, { method: "DELETE" }),
  reorder: (policyId: string, orderedIds: string[]) =>
    apiFetch(`/pay-policies/${policyId}/components/reorder`, { method: "PUT", body: JSON.stringify({ ordered_ids: orderedIds }) }),
  toggleStatus: (id: string) =>
    apiFetch<{ policy_id: string; status: string }>(`/pay-policies/${id}/toggle-status`, { method: "POST" }),
  clone: (id: string, body: { name: string; effective_from: string }) =>
    apiFetch(`/pay-policies/${id}/clone`, { method: "POST", body: JSON.stringify(body) }),
  delete: (id: string) =>
    apiFetch<{ success: boolean }>(`/pay-policies/${id}`, { method: "DELETE" }),
  assignToTarget: (policyId: string, body: { target_type: 'employee' | 'pay_group' | 'department' | 'position', target_ids: string[], effective_from: string }) =>
    apiFetch(`/pay-policies/${policyId}/assign`, { method: "POST", body: JSON.stringify(body) }),
};

export const PolicyGroupAPI = {
  list: () => apiFetch<{ data: any[] }>("/pay-policy-groups").then((r) => r.data),
};

// ─── GRADE API ───────────────────────────────────────────────────────────────

export const GradeAPI = {
  list: () => apiFetch<Grade[]>("/payroll/pay-grades").then((r) => (Array.isArray(r) ? r : (r as any).data || []) as Grade[]),
  upsert: (body: Omit<Grade, 'id'> & { id?: string }) => 
    apiFetch("/grades", { method: "POST", body: JSON.stringify(body) }),
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
    apiFetch<any>("/payroll/batch", {
      method: "POST", body: JSON.stringify({ period_month: period }),
    }).then((r: any) => (r.data || r) as { batch_id: string; employee_count: number; warnings: string[] }),
  approve: (batchId: string) =>
    apiFetch<any>(`/payroll/batch/${batchId}/approve`, { method: "POST" }).then((r: any) => r.data || r),
  getPayslip: (employeeId: string, period: string) =>
    apiFetch<any>(`/payroll/batch/payslip/${employeeId}?period_month=${period}`).then((r: any) => (r.data || r) as Payslip),
};
