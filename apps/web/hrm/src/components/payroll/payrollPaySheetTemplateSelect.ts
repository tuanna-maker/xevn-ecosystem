/**
 * @CODE-MEMORY
 * Screen:     /payroll · tab Đợt tính lương — dialog Tạo kỳ (mẫu bảng lương)
 * UC:         FR-UC-BP-PAY-06 · AC-PAY-TPL-03
 * BR:         pack≠mẫu · RJ-PAY-ENROLL-01 — salary-templates enroll ≠ pay-sheet-templates
 * SRS:        docs/program/specs/PO-HRM-AMIS-PARITY-PAY-TPL-API-01.md §6 F-PAY-PERIOD-01
 * Purpose:    Radix Select sentinel + map form ↔ paySheetTemplateId on POST /payroll/periods
 * WorkItem:   PO-HRM-AMIS-PARITY-PAY-PERIOD-BIND-FE-01
 * Coded:      2026-08-07
 * Callers:    PayrollBatchesTab · payrollPeriodFormSchema
 * Callees:    createPayrollPeriod paySheetTemplateId
 * must_keep:  Cấm map salary_templates pack id; payroll_e2e_ready=false
 * SOLID:      Tách khỏi payrollTemplateSelect (enroll pack legacy)
 * LastVerified: docs/qa/evidence/po-hrm-amis-parity-pay-period-bind-fe-01.md
 */

/** Radix Select forbids SelectItem value=""; sentinel = chưa chọn mẫu kỳ. */
export const PAY_SHEET_TPL_PERIOD_NONE_SENTINEL = '__pay_sheet_tpl_none__';

export function paySheetTemplateFormValue(templateId: string | null | undefined): string {
  if (!templateId || templateId === PAY_SHEET_TPL_PERIOD_NONE_SENTINEL) {
    return PAY_SHEET_TPL_PERIOD_NONE_SENTINEL;
  }
  return templateId;
}

/** Returns UUID for POST paySheetTemplateId — never salary_templates pack id. */
export function paySheetTemplateApiValue(formTemplateId: string | undefined): string | undefined {
  if (!formTemplateId || formTemplateId === PAY_SHEET_TPL_PERIOD_NONE_SENTINEL) {
    return undefined;
  }
  return formTemplateId;
}

export function formatPaySheetTemplatePickerLabel(opts: {
  code?: string | null;
  name?: string | null;
}): string {
  const code = opts.code?.trim();
  const name = opts.name?.trim();
  if (code && name) return `${code} — ${name}`;
  return name || code || '—';
}
