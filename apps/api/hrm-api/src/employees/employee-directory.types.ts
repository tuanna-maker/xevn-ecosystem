export type EmployeeRow = {
  id: string;
  company_id: string;
  employee_code: string;
  email: string;
  full_name: string;
  job_title_key: string | null;
  manager_id: string | null;
  status: string;
  hired_at: string | null;
  archived_at: string | null;
  avatar_url: string | null;
  /** Soft reverse hire link (REC-07) — display-ready on public DTO; no hard FK. */
  candidate_id?: string | null;
  custom_fields: Record<string, string> | null;
  created_at: string;
  updated_at: string;
};
