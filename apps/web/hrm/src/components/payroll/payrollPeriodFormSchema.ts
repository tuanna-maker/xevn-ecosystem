/**
 * @CODE-MEMORY
 * Screen:     /payroll · tab Đợt tính lương — dialog Tạo kỳ
 * UC:         UC-HRM-31 · FR-HRM-PAY-CLEAN-E2-01
 * BR:         BR-HRM-PAY-E2-03 — Zod required trước Network
 * SRS:        docs/program/deltas/BA_ERP_E2_SRS_01_20260728.md · AC-E2-ZOD-01 · VAL-E2-03
 * TechSpec:   docs/hrm/API_DESIGN_HRM_ERP_E2.md §5 periods
 * Purpose:    Schema Zod thuần cho form tạo kỳ lương (name + tháng/năm).
 * WorkItem:   D-FE-ERP-E2-01
 * Coded:      2026-07-28
 * Callers:    PayrollBatchesTab.tsx · vitest payrollPeriodFormSchema.test.ts
 * Callees:    zod
 * FE-Actions: | Tạo kỳ | safeParse trước createBatch | FormMessage / toast |
 * Impact:     Submit thiếu name/tháng → POST invalid lọt Network
 * must_keep:  Pure factory; không seed; HOLD_DEPLOY
 * SOLID:      Pure schema — message inject từ caller
 * LastVerified: docs/qa/evidence/d-fe-erp-e2-01-20260728.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-07
 * WorkItem: PO-HRM-AMIS-PARITY-PAY-PERIOD-BIND-FE-01
 * change_mode: ADD
 * What: pay_sheet_template_id required — AC-PAY-TPL-03 chọn mẫu active khi tạo kỳ
 * Why: Cấm nhầm salary_templates enroll pack · bind snapshot on create
 * must_keep: pure Zod; U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-08-03
 * WorkItem: PO-E2E-SPINE-01-FE-VITE-PAY-CON-01
 * change_mode: FIX
 * What: Restore payrollPeriodFormSchema từ stash 43c479a (PayrollBatchesTab Zod)
 * Why: Bulk restore payroll FE gaps — Vite Payroll mount chain
 * must_keep: pure Zod; no seed
 */

import { z } from 'zod';
import { PAY_SHEET_TPL_PERIOD_NONE_SENTINEL } from '@/components/payroll/payrollPaySheetTemplateSelect';

export type PayrollPeriodFormMessages = {
  nameRequired: string;
  monthInvalid: string;
  yearInvalid: string;
  paySheetTemplateRequired: string;
};

export function createPayrollPeriodFormSchema(messages: PayrollPeriodFormMessages) {
  return z.object({
    name: z.string().trim().min(1, messages.nameRequired),
    period_month: z
      .number({ invalid_type_error: messages.monthInvalid })
      .int()
      .min(1, messages.monthInvalid)
      .max(12, messages.monthInvalid),
    period_year: z
      .number({ invalid_type_error: messages.yearInvalid })
      .int()
      .min(2000, messages.yearInvalid)
      .max(2100, messages.yearInvalid),
    pay_sheet_template_id: z
      .string()
      .trim()
      .min(1, messages.paySheetTemplateRequired)
      .refine((v) => v !== PAY_SHEET_TPL_PERIOD_NONE_SENTINEL, messages.paySheetTemplateRequired)
      .pipe(z.string().uuid(messages.paySheetTemplateRequired)),
  });
}

export type PayrollPeriodFormValues = z.infer<
  ReturnType<typeof createPayrollPeriodFormSchema>
>;

export function parsePayrollPeriodForm(
  values: unknown,
  messages: PayrollPeriodFormMessages,
) {
  return createPayrollPeriodFormSchema(messages).safeParse(values);
}
