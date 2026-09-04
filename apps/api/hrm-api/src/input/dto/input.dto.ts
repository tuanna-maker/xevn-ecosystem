/**
 * @CODE-MEMORY
 * Screen:     HRM · Nhập liệu lương · Input Data Hub
 * UC:         UC-E3-01, UC-E3-02, UC-E3-03
 * SRS:        docs/hrm/SRS_HRM_PAYROLL_POLICY_ENGINE_v1.md §5
 * Purpose:    DTOs + constants for Input Data Hub module.
 * WorkItem:   HRM-POLICY-E3-01
 * Coded:      2026-08-22
 * FORBIDDEN:  DB calls in this file
 */

/** Các loại dữ liệu import hợp lệ */
export const INPUT_TYPES = [
  "TRIP_LOG",
  "REVENUE_CLDV",
  "MAINTENANCE_COST",
  "FREIGHT_REVENUE",
  "DPHH_REVENUE",
  "HOTLINE_STATS",
  "BRANCH_STATS",
] as const;

export type InputType = typeof INPUT_TYPES[number];

/** Trạng thái import batch */
export type ImportStatus =
  | "PENDING"
  | "VALIDATED"
  | "APPROVED"
  | "ERROR"
  | "SUPERSEDED";

/** Trạng thái mỗi row */
export type RowStatus = "OK" | "ERROR" | "WARNING" | "OVERRIDDEN";

/** Manual override cho 1 row */
export class OverrideRowDto {
  employee_id?: string;
  data?: Record<string, unknown>;
}

/** DB row shape — pay_input_imports */
export type ImportRow = {
  id: string;
  tenant_id: string;
  period_month: string;
  input_type: InputType;
  version: number;
  status: ImportStatus;
  file_url: string | null;
  file_name: string | null;
  total_rows: number;
  error_rows: number;
  uploaded_by: string;
  validated_at: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
};

/** DB row shape — pay_input_rows */
export type InputDataRow = {
  id: string;
  import_id: string;
  employee_id: string | null;
  raw_employee_ref: string;
  row_number: number;
  data: Record<string, unknown>;
  row_status: RowStatus;
  error_message: string | null;
  overridden_by: string | null;
  overridden_at: string | null;
  created_at: string;
};

/** Parsed row từ Excel — common interface cho mọi parser */
export type ParsedRow = {
  row_number: number;
  raw_employee_ref: string;
  data: Record<string, unknown>;
  parse_error?: string;
};
