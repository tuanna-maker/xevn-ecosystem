/**
 * @CODE-MEMORY
 * Screen:     /payroll · Tính lương → Tạm ứng (AdvanceRequestsTab)
 * UC:         UC-HRM-PAY · UX-06 / P0-c
 * BR:         UX-PRODUCT-RULES §3.4 — modal+form atomic reset
 * SRS:        docs/program/UX-UI-ERP-ANALYSIS.md §5 P0-c
 * TechSpec:   _vibe-team-os/UX-PRODUCT-RULES.md §3.4
 * Purpose:    Form SoT cho dialog «Tạo bảng tạm ứng» live — empty defaults +
 *             open/close atomic (Esc/Hủy/overlay không giữ giá trị cũ).
 * WorkItem:   D-UX-P0C-ADVANCE-LIVE-WIRE-01
 * Coded:      2026-07-28
 * Callers:    AdvanceRequestsTab · vitest advanceRequestFormUi.test.ts
 * Callees:    (pure — không API)
 * FE-Actions: | Mở/đóng Add | resolveAdvanceAddDialogOpenChange | reset form |
 * Impact:     Thiếu reset trên onOpenChange → QA DEF-P0C-ADV-01 stale reopen
 * must_keep:  shape API createRequest (name/salary_period/department/position);
 *             không đổi payrollDomainUi AdvanceFormData (orphan Payroll shell)
 * SOLID:      Pure helpers tách khỏi tab — test UX-06 không mount React
 * LastVerified: docs/qa/evidence/d-ux-p0c-advance-live-wire-01-20260728.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-03
 * WorkItem: PO-E2E-SPINE-01-FE-VITE-PAY-CON-01
 * change_mode: FIX
 * What: Restore advanceRequestFormUi từ stash 43c479a (Payroll form helper chain)
 * Why: Bulk restore payroll FE gaps after Vite SalaryComponentsTab miss
 * must_keep: atomic open/close shape; orphan Payroll shell AdvanceFormData
 */

export type AdvanceRequestFormData = {
  name: string;
  salary_period: string;
  department: string;
  position: string;
};

/** Default kỳ lương: `{monthPrefix}{M}/{YYYY}` (vd. «Tháng 7/2026»). */
export function createEmptyAdvanceRequestFormData(
  monthPrefix: string,
  now: Date = new Date(),
): AdvanceRequestFormData {
  return {
    name: '',
    salary_period: `${monthPrefix}${now.getMonth() + 1}/${now.getFullYear()}`,
    department: '',
    position: '',
  };
}

/**
 * UX-06: mở hoặc đóng dialog Add đều trả form sạch (mirror tax/salary OPEN/CLOSE).
 * Cancel button / Esc / overlay → cùng transition này.
 */
export function resolveAdvanceAddDialogOpenChange(
  open: boolean,
  monthPrefix: string,
  now: Date = new Date(),
): { showAddDialog: boolean; formData: AdvanceRequestFormData } {
  return {
    showAddDialog: open,
    formData: createEmptyAdvanceRequestFormData(monthPrefix, now),
  };
}
