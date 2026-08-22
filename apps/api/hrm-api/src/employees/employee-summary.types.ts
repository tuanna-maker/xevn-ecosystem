export type EmployeeSummaryDepartmentRow = {
  department: string;
  count: number;
  avg_salary: number | null;
};

/** Per operating-slug headcount (Plane B) — never XBOS legal-entity UUID. */
export type EmployeeSummaryCompanyRow = {
  company_id: string;
  total: number;
  active_count: number;
  inactive_count: number;
  archived_count: number;
};

/** Per tenant_id headcount (tenant-only scope). */
export type EmployeeSummaryTenantRow = {
  tenant_id: string;
  total: number;
  active_count: number;
  inactive_count: number;
  archived_count: number;
};

export type EmployeeSummarySalaryRange = {
  key: string;
  min: number;
  max: number | null;
  count: number;
};

export type EmployeeSummaryRecentHire = {
  id: string;
  employee_code: string;
  full_name: string;
  status: string;
  hired_at: string | null;
  avatar_url: string | null;
};

export type EmployeeSummaryResult = {
  company_id: string;
  total: number;
  active_count: number;
  inactive_count: number;
  archived_count: number;
  /** VAL-D-06 — false unless include=compensation_summary (not public-ring SoT). */
  compensation_summary_included: boolean;
  payroll: {
    total: number;
    employees_with_salary: number;
  };
  by_department: EmployeeSummaryDepartmentRow[];
  /** Operating-slug breakdown — same resolveHrmListScope as list (AC-CO-EMP / D-HRM-CO-EMP-COUNT-BE-01). */
  by_company: EmployeeSummaryCompanyRow[];
  /** Tenant breakdown when HRM_TENANT_ONLY_SCOPE (ADR-HRM-TENANT-ONLY-SCOPE). */
  by_tenant?: EmployeeSummaryTenantRow[];
  salary_ranges: EmployeeSummarySalaryRange[];
  new_hires: {
    last_30_days: number;
    recent: EmployeeSummaryRecentHire[];
  };
};
