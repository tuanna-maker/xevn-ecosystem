/**
 * @CODE-MEMORY
 * Screen:     /payroll · Tính lương → Tạm ứng → Thêm NV
 * UC:         VAL-INP-ADV-01 · F-PAY-ADV-EMP-01
 * BR:         CreateAdvanceRequestEmployeeDto — employee_code/name/advance_amount required
 * SRS:        docs/qa/evidence/po-hrm-amis-parity-pay-input-pack-qa-02.md · AC VAL-INP-ADV-01
 * TechSpec:   Nest POST /payroll/advance-requests/:requestId/employees (HRM-ADV-201)
 * Purpose:    Whitelist body POST thêm NV vào bảng tạm ứng — company_id chỉ trên query.
 * WorkItem:   PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-FE-01
 * Coded:      2026-08-07
 * Callers:    hrmApi.createAdvanceRequestEmployee · useAdvanceRequests.addEmployee
 * Callees:    POST /api/hrm/payroll/advance-requests/:id/employees
 * must_keep:  U65 no seed · payroll_e2e_ready=false · không đưa company_id/request_id vào body
 * SOLID:      Lib DTO thuần — tách khỏi hrmApi để vitest không kéo requestHrm
 * LastVerified: advanceRequestEmployeeRequest.test.ts
 */

export type CreateAdvanceRequestEmployeeBody = {
  employee_id?: string;
  employee_code: string;
  employee_name: string;
  department?: string;
  position?: string;
  advance_amount: number;
  note?: string;
};

export type AdvanceRequestEmployeeInput = {
  employee_id?: string | null;
  employee_code: string;
  employee_name: string;
  department?: string | null;
  position?: string | null;
  advance_amount: number | string;
  note?: string | null;
};

/** Strip FE transport fields; map null → omit optional. */
export function buildCreateAdvanceRequestEmployeeBody(
  input: AdvanceRequestEmployeeInput,
): CreateAdvanceRequestEmployeeBody {
  const employee_code = String(input.employee_code ?? '').trim();
  const employee_name = String(input.employee_name ?? '').trim();
  const advance_amount = Number(input.advance_amount);
  const body: CreateAdvanceRequestEmployeeBody = {
    employee_code,
    employee_name,
    advance_amount: Number.isFinite(advance_amount) ? advance_amount : 0,
  };
  const employeeId = input.employee_id?.trim();
  if (employeeId) body.employee_id = employeeId;
  const department = input.department?.trim();
  if (department) body.department = department;
  const position = input.position?.trim();
  if (position) body.position = position;
  const note = input.note?.trim();
  if (note) body.note = note;
  return body;
}
