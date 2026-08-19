/**
 * @CODE-MEMORY 2026-08-06 PO-HRM-E2E-LINK-PAY-HIRE-FE-04
 * Screen: HRM → Tiền lương → Tính lương → Thêm nhân viên (PayrollBatchesTab)
 * UC / BR: AC-PAY-HIRE-04 · UF-HRM-06 / J-HRM-07
 * Purpose: Whitelist enroll POST body — scope từ JWT/header; BE DTO cấm company_id trong body
 * WorkItem: PO-HRM-E2E-LINK-PAY-HIRE-FE-04
 * Coded: 2026-08-06
 * Callers: hrmApi.enrollPayrollPeriod · usePayrollBatches.addRecord
 * Callees: POST /api/hrm/payroll/periods/:id/enroll
 * must_keep: FE-02 batches surface · FE-03 template sentinel · eligibility wire
 * SOLID: lib transport DTO — không phụ thuộc hrmApi (tránh circular)
 * LastVerified: payrollEnrollPayload.test.ts
 */

export type PayrollEnrollRequestBody =
  | { mode: 'explicit'; employee_ids: string[] }
  | { mode: 'auto_eligible' };

export function buildPayrollEnrollPayload(employeeIds: string[]): PayrollEnrollRequestBody {
  return {
    mode: 'explicit',
    employee_ids: [...employeeIds],
  };
}

/** Strip mọi field ngoài whitelist trước khi JSON.stringify — tránh HRM-VAL-001 company_id. */
export function serializePayrollEnrollBody(payload: PayrollEnrollRequestBody): string {
  if (payload.mode === 'auto_eligible') {
    return JSON.stringify({ mode: 'auto_eligible' as const });
  }
  return JSON.stringify(buildPayrollEnrollPayload(payload.employee_ids ?? []));
}
