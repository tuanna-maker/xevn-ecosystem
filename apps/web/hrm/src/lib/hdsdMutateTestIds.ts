/**
 * @CODE-MEMORY
 * Screen:     HDSD U65 browser mutate harness hooks (HRM SoftDel / HĐ / YCTD / Leave)
 * UC:         UF-HRM-02/05/07 · TC-HRM-HDSD-025 SoftDel
 * BR:         Stable data-testid for FE-only smoke (U65)
 * SRS:        docs/qa/USER_FLOW_OPERABILITY_MATRIX.md SoftDel/mutate
 * TechSpec:   HRM list mutate + form ready markers
 * Purpose:    Export HDSD_MUTATE_TEST_IDS — không đổi string sau khi matrix/smoke dùng.
 * WorkItem:   D-HDSD-MUTATE-FE-02 · D-HDSD-MUTATE-FE-DEPS-02
 * Coded:      2026-07-30
 * Callers:    Employees · EmployeeFormDialog · Contracts · JobRequisitionsTab · LeaveTab
 * Callees:    none (const map)
 * must_keep:  SoftDel menu isolation · string ids ổn định · U65 no seed
 * SOLID:      Pure constants module
 * LastVerified: hdsdMutateTestIds.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-08-01 D-HDSD-MUTATE-FE-DEPS-02
 * change_mode: ADD
 * What: Reconstruct module after Vite 500 (file absent on :8088 / wide-revert)
 * Why: QA-HDSD-MUTATE-SOFTDEL-BH-8088-SMOKE-02 — Employees import resolve fail
 * must_keep: SoftDel · BH policy_id picker · TC-041 · U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-08-01 D-REC-13-S2-SUBMIT-INBOX-01
 * change_mode: ADD
 * What: requisitionSubmitWf + post-create submit CTA test ids (J-REC-WF-02)
 * Why: R-REC-13-S2-SUBMIT-INBOX — harness must click Gửi duyệt QT after create
 * must_keep: SoftDel/BH/leave ids unchanged · U65 no seed
 */
/**
 * Stable data-testid / aria hooks for HDSD U65 browser mutate harness (UF-XBOS-05 · UF-HRM-02/05/07/09).
 * WorkItem: D-HDSD-MUTATE-FE-02 · D-HDSD-MUTATE-FE-04 · D-HDSD-MUTATE-FE-DEPS-02
 */
export const HDSD_MUTATE_TEST_IDS = {
  employeesCreateBtn: 'hdsd-employees-create-btn',
  employeeFormDialog: 'hdsd-employee-form-dialog',
  employeeFormSubmit: 'hdsd-employee-form-submit',
  contractsCreateBtn: 'hdsd-contracts-create-btn',
  contractsFormDialog: 'hdsd-contracts-form-dialog',
  contractsFormEmployee: 'hdsd-contracts-form-employee',
  contractsFormContractType: 'hdsd-contracts-form-contract-type',
  contractsFormReady: 'hdsd-contracts-form-ready',
  contractsFormSubmit: 'hdsd-contracts-form-submit',
  requisitionCreateBtn: 'hdsd-requisition-create-btn',
  requisitionFormDialog: 'hdsd-requisition-form-dialog',
  requisitionJobTemplate: 'hdsd-requisition-job-template',
  requisitionTitle: 'hdsd-requisition-title',
  requisitionDepartment: 'hdsd-requisition-department',
  requisitionHeadcount: 'hdsd-requisition-headcount',
  requisitionEmploymentType: 'hdsd-requisition-employment-type',
  requisitionFormReady: 'hdsd-requisition-form-ready',
  requisitionFormSubmit: 'hdsd-requisition-form-submit',
  /** Post-create / row «Gửi duyệt QT» — POST …/requisitions/:id/submit-workflow */
  requisitionSubmitWf: 'hdsd-requisition-submit-wf',
  /** Banner after YCTD create offering immediate submit (SoT S2). */
  requisitionPostCreateSubmit: 'hdsd-requisition-post-create-submit',
  leaveOverviewRecent: 'hdsd-leave-overview-recent',
  leaveOverviewReasonPrefix: 'hdsd-leave-overview-reason',
  leaveReasonInput: 'hdsd-leave-reason',
} as const;

export function hdsdShareholderSaveTestId(rowId: string): string {
  return `hdsd-shareholder-save-${rowId}`;
}

export function hdsdShareholderNameTestId(rowId: string): string {
  return `hdsd-shareholder-name-${rowId}`;
}

export function hdsdLeaveOverviewReasonTestId(rowId: string): string {
  return `${HDSD_MUTATE_TEST_IDS.leaveOverviewReasonPrefix}-${rowId}`;
}

export function hdsdRequisitionSubmitWfTestId(rowId: string): string {
  return `${HDSD_MUTATE_TEST_IDS.requisitionSubmitWf}-${rowId}`;
}
