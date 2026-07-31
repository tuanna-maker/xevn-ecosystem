/**
 * @CODE-MEMORY
 * Screen:     Shared date display (EmployeeSalary payDate + HRM lists)
 * Purpose:    Dual-export SoT from `@xevn/ui` + payroll-specific helpers.
 * WorkItem:   D-UX-VI-FORMAT-SHARED-01 (lift) · D-HRM-EMP-SALARY-INVALID-DATE-01
 * Coded:      2026-07-20
 * must_keep:  null/invalid → «—»; period_label MM/yyyy giữ nguyên văn
 * LastVerified: formatDisplayDate.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-07-20
 * WorkItem: D-UX-VI-FORMAT-SHARED-01
 * change_mode: ADD
 * What: Re-export formatDisplayDate from packages/ui; keep payslip helpers local
 * Why: Project-wide VI date SoT without breaking EmployeeSalary payDate path
 */

export {
  formatDisplayDate,
  VI_DATE_DISPLAY_PATTERN,
  VI_DATETIME_DISPLAY_PATTERN,
} from '@xevn/ui';

import { formatDisplayDate } from '@xevn/ui';

/**
 * Nhãn cột «Ngày chi trả» trên EmployeeSalary — map từ payslip.period_label.
 * Không gọi format(new Date(...)) trực tiếp.
 */
export function payslipPayDateLabel(periodLabel: string | null | undefined): string {
  return formatDisplayDate(periodLabel);
}

/** Pure row mapper for payroll history cell — used by vitest + EmployeeSalary. */
export function formatPayrollPayDateCell(payDate: string | null | undefined): string {
  return payslipPayDateLabel(payDate);
}
