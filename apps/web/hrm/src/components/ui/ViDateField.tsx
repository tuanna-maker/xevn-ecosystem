/**
 * @CODE-MEMORY
 * Screen:     Shared HRM calendar date entry
 * UC:         UC-UX-DATE-02
 * BR:         BR-UX-DATE-02
 * SRS:        docs/program/UX_VI_DATE_NUMBER_FORMAT_AC.md §3
 * TechSpec:   packages/ui ViDateInput (SoT)
 * Purpose:    HRM-styled dd/MM/yyyy text entry; value/onValueChange use ISO yyyy-MM-dd for API.
 * WorkItem:   D-UX-VI-FORMAT-HRM-DATE-02
 * Coded:      2026-07-20
 * Callers:    EmployeeContracts, LeaveTab, payroll/insurance forms, EmployeeFormDialog, ViDatePickerField
 * Callees:    ViDateInput (@xevn/ui)
 * must_keep:  API payloads remain ISO yyyy-MM-dd; display dd/MM/yyyy when valid
 * SOLID:      Presentation wrapper only — no business parse beyond SoT
 * LastVerified: src/components/ui/__tests__/viDateField.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-07-22
 * WorkItem: FID-P0-FE-DATE-01
 * change_mode: ADD
 * What: Callers thêm ViDatePickerField (text + Calendar) — wrapper này vẫn SoT text
 * Why: Sheet/company cần picker mở trong Dialog; parse 1/1/2026 → 2026-01-01 giữ ở @xevn/ui
 * must_keep: Không đổi contract ISO; không pale theme churn
 */

import { ViDateInput, type ViDateInputProps } from '@xevn/ui';
import { cn } from '@/lib/utils';

const INPUT_SURFACE =
  'flex h-10 w-full rounded-input border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm';

export type ViDateFieldProps = ViDateInputProps;

/** Date field with Input surface styles — ISO store, vi-VN display. */
export function ViDateField({ className, ...props }: ViDateFieldProps) {
  return <ViDateInput className={cn(INPUT_SURFACE, className)} {...props} />;
}
