/**
 * @CODE-MEMORY 2026-08-06 PO-HRM-E2E-LINK-PAY-HIRE-FE-03
 * Screen: HRM → Tiền lương → Tính lương → Lập bảng lương (PayrollBatchesTab)
 * UC / BR: AC-PAY-HIRE-04 · UF-HRM-06 / J-HRM-07
 * Purpose: Radix Select cấm SelectItem value=""; sentinel `__none__` ↔ API template_id undefined
 * WorkItem: PO-HRM-E2E-LINK-PAY-HIRE-FE-03
 * Coded: 2026-08-06
 * Callers: PayrollBatchesTab → create batch template picker / handleCreateBatch
 * Callees: createPayrollPeriod template_id (optional UUID)
 * must_keep: FE-02 batches surface + eligibility wire; không đổi enroll API contract
 * SOLID: tách map sentinel khỏi tab UI
 * LastVerified: docs/qa/evidence/po-hrm-e2e-link-pay-hire-fe-03.md
 */

/** Radix Select forbids SelectItem value=""; sentinel maps to omitted template_id. */
export const PAYROLL_TEMPLATE_NONE_SENTINEL = '__none__';

export function templateFormValue(templateId: string | null | undefined): string {
  if (!templateId || templateId === PAYROLL_TEMPLATE_NONE_SENTINEL) {
    return PAYROLL_TEMPLATE_NONE_SENTINEL;
  }
  return templateId;
}

export function templateApiValue(formTemplateId: string | undefined): string | undefined {
  if (!formTemplateId || formTemplateId === PAYROLL_TEMPLATE_NONE_SENTINEL) {
    return undefined;
  }
  return formTemplateId;
}
