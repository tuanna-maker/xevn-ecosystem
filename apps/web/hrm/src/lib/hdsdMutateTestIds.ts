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
 *
 * @CODE-MEMORY-CHANGE 2026-08-03 R-SPINE-LV04-ATTACH-FE-01
 * change_mode: ADD
 * What: leaveAttachmentInput + leaveAttachmentHint test ids for LV-04 ốm≥3 attach
 * Why: QA SPINE-02 LV-04 BLOCKED — harness needs file input / giấy bác sĩ label
 * must_keep: SoftDel/BH/leave reason + overview ids · U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-08-03 R-SPINE-MGR-HIER-01-FE
 * change_mode: ADD
 * What: employeeFormManagerPicker test id for UC-H01 QL trực tiếp
 * Why: Option B browser harness — set manager → Lưu → F5
 * must_keep: SoftDel/leave overview/attach ids · U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-08-03 R-SPINE-WEB-APPROVE-UX-01
 * change_mode: ADD
 * What: leaveListApproveBtn + leaveListApprovePrefix for list-row Duyệt (HDSD / WEB_APPROVE)
 * Why: QA APPROVE_LIST_BUTTONS count=0 on requests tab — Duyệt only on separate approval tab
 * must_keep: SoftDel/attach/overview ids · U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-08-04 PO-UC-TC-W4-FE-AT12-L1-CREATE-CATALOG-01
 * change_mode: ADD
 * What: leaveSyncCatalogBtn — Đồng bộ XBOS từ Leave create empty-state
 * Why: R-W4-AT12-L1-CREATE-CATALOG U65 FE sync (cấm seed leave_types)
 * must_keep: leaveListApprove / attach / SoftDel ids · U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-08-06 PO-HRM-JD-DYNAMIC-FE-02
 * change_mode: FIX
 * What: jdForm* + jdLibrary* stable HDSD ids (writer + Thư viện JD)
 * Why: QA FE-HDSD-JD-TESTIDS — keys referenced in FE-01 but absent → data-testid=undefined
 * must_keep: SoftDel/BH/leave/requisition ids · U65 no seed · Settings jd-settings-* literals unchanged
 *
 * @CODE-MEMORY-CHANGE 2026-08-06 PO-HRM-REC-UV-YCTD-FE-01
 * change_mode: ADD
 * What: candidateCreateBtn + candidateForm* YCTD/position/submit test ids (UF-REC-UV-01..07)
 * Why: QA plan AC-REC-UV-01..04 — browser harness needs stable hooks; no free-text position SoT
 * must_keep: SoftDel/BH/leave/requisition/jd ids · U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-08-06 PO-HRM-REC-UV-YCTD-CMP-FE-01
 * change_mode: ADD
 * What: recCompare* test ids for So sánh theo YCTD (UF-REC-CMP-01..06 · J-HRM-REC-CMP-01)
 * Why: QA browser harness AC-REC-CMP — picker/empty/max-N/chưa đánh giá
 * must_keep: SoftDel/BH/leave/requisition/jd/candidateForm ids · U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-08-06 PO-HRM-E2E-LINK-EMP-FE-01
 * change_mode: ADD
 * What: WH / QSĐ / SI timeline / HTP-05 test ids for U65 browser EMP linkage
 * Why: EMP-FE-01 AC-WH-PICK · AC-DEC-WH · AC-SI-TL · AC-HTP-05 harness hooks
 * must_keep: SoftDel/BH/leave/JD/candidate/compare ids · U65 no seed · honesty flags false
 *
 * @CODE-MEMORY-CHANGE 2026-08-06 PO-HRM-E2E-LINK-EMP-FE-03
 * change_mode: ADD
 * What: insuranceEnrollmentsRoot + profileOpenInsuranceTab (D5 nested HR group path)
 * Why: R-EMP-SI-FE-ACTION-UI — QA must open Insurance tab then see timeline root/actions
 * must_keep: existing insuranceTimeline* / SoftDel / decisions form ids · U65
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-E2E-LINK-EMP-FE-J03-01
 * change_mode: ADD
 * What: contractsViewBtn + contractsViewDialog + contractsViewDialogOpen + isContractsViewDialogOpen
 * Why: R-J03-DIALOG — Eye/detail parent-portaled; iframe latch so J-HRM-03 dialog≠false
 * must_keep: contractsForm* create/edit CRUD · SoftDel · U65 · print-spine ids untouched
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-ATT-LEAVE-CANCEL-FE-01
 * change_mode: ADD
 * What: leaveListCancelBtn/Prefix + leaveCancelConfirmBtn — Hủy đơn (AC-ATT-LV-SHEET-02)
 * Why: HDSD harness cancel/reverse after approve when sheet open
 * must_keep: leaveListApprove / SoftDel / attach ids · U65 no seed · attendance_uat_ready=false
 *
 * @CODE-MEMORY-CHANGE 2026-08-11 PO-HRM-REC-CHANNELS-CONSUMER-AC-REC-02-FILTER-01
 * change_mode: ADD
 * What: candidateFilterSource + option prefix — list tab nguồn filter (AC-REC-02)
 * Why: QA retest #4 — Playwright cannot target SelectTrigger without stable testid
 * must_keep: candidateForm* / list YCTD-position ids · U65 no seed
 */
/**
 * Stable data-testid / aria hooks for HDSD U65 browser mutate harness (UF-XBOS-05 · UF-HRM-02/05/07/09).
 * WorkItem: D-HDSD-MUTATE-FE-02 · D-HDSD-MUTATE-FE-04 · D-HDSD-MUTATE-FE-DEPS-02
 */
export const HDSD_MUTATE_TEST_IDS = {
  employeesCreateBtn: 'hdsd-employees-create-btn',
  employeeFormDialog: 'hdsd-employee-form-dialog',
  employeeFormSubmit: 'hdsd-employee-form-submit',
  /** UC-H01 «Quản lý trực tiếp» combobox trigger */
  employeeFormManagerPicker: 'hdsd-employee-form-manager-picker',
  contractsCreateBtn: 'hdsd-contracts-create-btn',
  contractsFormDialog: 'hdsd-contracts-form-dialog',
  contractsFormEmployee: 'hdsd-contracts-form-employee',
  contractsFormContractType: 'hdsd-contracts-form-contract-type',
  contractsFormReady: 'hdsd-contracts-form-ready',
  contractsFormSubmit: 'hdsd-contracts-form-submit',
  /** J-HRM-03 — list Eye / open chi tiết HĐ (accessible control). */
  contractsViewBtn: 'hdsd-contracts-view-btn',
  /** J-HRM-03 — view DialogContent (parent-portaled in CC embed). */
  contractsViewDialog: 'hdsd-contracts-view-dialog',
  /** J-HRM-03 — iframe-safe open latch (mirrors hdsd-contracts-form-dialog-open). */
  contractsViewDialogOpen: 'hdsd-contracts-view-dialog-open',
  requisitionCreateBtn: 'hdsd-requisition-create-btn',
  requisitionFormDialog: 'hdsd-requisition-form-dialog',
  requisitionJobTemplate: 'hdsd-requisition-job-template',
  requisitionTitle: 'hdsd-requisition-title',
  requisitionDepartment: 'hdsd-requisition-department',
  requisitionHeadcount: 'hdsd-requisition-headcount',
  requisitionEmploymentType: 'hdsd-requisition-employment-type',
  requisitionJobGrade: 'hdsd-requisition-job-grade',
  requisitionFormReady: 'hdsd-requisition-form-ready',
  requisitionFormSubmit: 'hdsd-requisition-form-submit',
  /** Post-create / row «Gửi duyệt QT» — POST …/requisitions/:id/submit-workflow */
  requisitionSubmitWf: 'hdsd-requisition-submit-wf',
  /** Banner after YCTD create offering immediate submit (SoT S2). */
  requisitionPostCreateSubmit: 'hdsd-requisition-post-create-submit',
  leaveOverviewRecent: 'hdsd-leave-overview-recent',
  leaveOverviewReasonPrefix: 'hdsd-leave-overview-reason',
  leaveReasonInput: 'hdsd-leave-reason',
  /** Leave create — đính kèm giấy bác sĩ (ốm ≥3 ngày · BR-LEAVE-ATT-01). */
  leaveAttachmentInput: 'hdsd-leave-attachment-input',
  leaveAttachmentHint: 'hdsd-leave-attachment-hint',
  /** Leave list/approval — Duyệt pending (R-SPINE-WEB-APPROVE-UX-01). */
  leaveListApproveBtn: 'hdsd-leave-list-approve',
  leaveListApprovePrefix: 'hdsd-leave-list-approve',
  /** Leave list — Hủy đơn pending|approved (AC-ATT-LV-SHEET-02 reverse). */
  leaveListCancelBtn: 'hdsd-leave-list-cancel',
  leaveListCancelPrefix: 'hdsd-leave-list-cancel',
  leaveCancelConfirmBtn: 'hdsd-leave-cancel-confirm',
  /** Leave create — Đồng bộ leave_types từ XBOS khi catalog trống (OU scope). */
  leaveSyncCatalogBtn: 'hdsd-leave-sync-catalog',
  /** ATT leave-type Settings (F-ATT-CAT-LVT) — AC-PLT-ATT-01. */
  attLeaveTypeSave: 'hdsd-att-leave-type-save',
  attLeaveTypeKey: 'hdsd-att-leave-type-key',
  attLeaveTypeName: 'hdsd-att-leave-type-name',
  attLeaveTypeReload: 'hdsd-att-leave-type-reload',
  /** EMP document-type Settings (F-EMP-CAT-DOC) — AC-PLT-EMP-02. */
  empDocumentTypeSave: 'hdsd-emp-document-type-save',
  empDocumentTypeKey: 'hdsd-emp-document-type-key',
  empDocumentTypeName: 'hdsd-emp-document-type-name',
  empDocumentTypeReload: 'hdsd-emp-document-type-reload',
  /** EMP employment-type Settings (F-EMP-CAT-ET) — AC-PLT-EMP-04. */
  empEmploymentTypeSave: 'hdsd-emp-employment-type-save',
  empEmploymentTypeKey: 'hdsd-emp-employment-type-key',
  empEmploymentTypeName: 'hdsd-emp-employment-type-name',
  empEmploymentTypeReload: 'hdsd-emp-employment-type-reload',
  empEmploymentTypePicker: 'hdsd-emp-employment-type-picker',
  /** EMP employment-status + status-reason Settings (F-EMP-CAT-ST/STR) — AC-PLT-EMP-STATUS. */
  empEmploymentStatusSave: 'hdsd-emp-employment-status-save',
  empEmploymentStatusKey: 'hdsd-emp-employment-status-key',
  empEmploymentStatusName: 'hdsd-emp-employment-status-name',
  empEmploymentStatusReload: 'hdsd-emp-employment-status-reload',
  empEmploymentStatusEffectivePicker: 'hdsd-emp-employment-status-effective-picker',
  empStatusReasonSave: 'hdsd-emp-status-reason-save',
  empStatusReasonKey: 'hdsd-emp-status-reason-key',
  empStatusReasonName: 'hdsd-emp-status-reason-name',
  empStatusReasonReload: 'hdsd-emp-status-reason-reload',
  empStatusReasonEffectivePicker: 'hdsd-emp-status-reason-effective-picker',
  /** DEC decision-type Settings (F-DEC-CAT-TYP) — AC-PLT-DEC. */
  decDecisionTypeSave: 'hdsd-dec-decision-type-save',
  decDecisionTypeKey: 'hdsd-dec-decision-type-key',
  decDecisionTypeName: 'hdsd-dec-decision-type-name',
  decDecisionTypeReload: 'hdsd-dec-decision-type-reload',
  decDecisionTypeEffectivePicker: 'hdsd-dec-decision-type-effective-picker',
  /** SI insurance-type Settings (F-SI-CAT-TYP) — AC-PLT-SI-INS-01d. */
  siInsuranceTypeSave: 'hdsd-si-insurance-type-save',
  siInsuranceTypeKey: 'hdsd-si-insurance-type-key',
  siInsuranceTypeName: 'hdsd-si-insurance-type-name',
  siInsuranceTypeReload: 'hdsd-si-insurance-type-reload',
  siInsuranceTypeEffectivePicker: 'hdsd-si-insurance-type-effective-picker',
  /** SI insurer Settings (F-SI-CAT-INS) — AC-PLT-SI-INSURER-01d. */
  siInsurerSave: 'hdsd-si-insurer-save',
  siInsurerKey: 'hdsd-si-insurer-key',
  siInsurerName: 'hdsd-si-insurer-name',
  siInsurerReload: 'hdsd-si-insurer-reload',
  siInsurerEffectivePicker: 'hdsd-si-insurer-effective-picker',
  /** REC pipeline-stage Settings (F-REC-CAT-STG) — AC-PLT-REC-02. */
  recPipelineStageSave: 'hdsd-rec-pipeline-stage-save',
  recPipelineStageKey: 'hdsd-rec-pipeline-stage-key',
  recPipelineStageName: 'hdsd-rec-pipeline-stage-name',
  recPipelineStageReload: 'hdsd-rec-pipeline-stage-reload',
  /** Thư viện JD — list mutate hooks (HDSD CH07 · TC-REC-JD-*). */
  jdLibraryRefreshBtn: 'hdsd-jd-library-refresh-btn',
  jdLibraryAddBtn: 'hdsd-jd-library-add-btn',
  jdLibraryEmpty: 'hdsd-jd-library-empty',
  jdLibraryRow: 'hdsd-jd-library-row',
  /** Thêm/Sửa JD writer dialog (J-HRM-JD-02 · hdsd-jd-form-*). */
  jdFormDialog: 'hdsd-jd-form-dialog',
  jdFormTitle: 'hdsd-jd-form-title',
  jdFormCode: 'hdsd-jd-form-code',
  jdFormPosition: 'hdsd-jd-form-position',
  jdFormSubmit: 'hdsd-jd-form-submit',
  /** Thêm ứng viên — YCTD required + position derived (FR-UC-BP-REC-05a). */
  candidateCreateBtn: 'hdsd-candidate-create-btn',
  candidateFormDialog: 'hdsd-candidate-form-dialog',
  candidateFormYctd: 'hdsd-candidate-form-yctd',
  candidateFormPosition: 'hdsd-candidate-form-position',
  candidateFormEmptyYctd: 'hdsd-candidate-form-empty-yctd',
  candidateFormOpenYctdCta: 'hdsd-candidate-form-open-yctd-cta',
  candidateFormSubmit: 'hdsd-candidate-form-submit',
  candidateListYctd: 'hdsd-candidate-list-yctd',
  candidateListPosition: 'hdsd-candidate-list-position',
  /** Candidates list — filter theo nguồn catalog (AC-REC-02). */
  candidateFilterSource: 'hdsd-candidate-filter-source',
  candidateFilterSourceOptionPrefix: 'hdsd-candidate-filter-source-option',
  /** So sánh UV theo YCTD — FR-UC-BP-REC-06b (PO-HRM-REC-UV-YCTD-CMP-FE-01). */
  recCompareOpenBtn: 'hdsd-rec-compare-open-btn',
  recCompareDialog: 'hdsd-rec-compare-dialog',
  recCompareYctdPicker: 'hdsd-rec-compare-yctd-picker',
  recCompareYctdEmpty: 'hdsd-rec-compare-yctd-empty',
  recCompareUvEmpty: 'hdsd-rec-compare-uv-empty',
  recCompareUvRow: 'hdsd-rec-compare-uv-row',
  recCompareUvNotEval: 'hdsd-rec-compare-uv-not-eval',
  recCompareSelectedCount: 'hdsd-rec-compare-selected-count',
  recCompareMatrix: 'hdsd-rec-compare-matrix',
  recCompareMaxNHint: 'hdsd-rec-compare-max-n-hint',
  /** EMP-FE-01 — Work timeline create/edit */
  workTimelineRoot: 'hdsd-work-timeline-root',
  workTimelineAddBtn: 'hdsd-work-timeline-add-btn',
  workTimelineFormDialog: 'hdsd-work-timeline-form-dialog',
  workTimelinePositionPicker: 'hdsd-work-timeline-position-picker',
  workTimelineDepartmentPicker: 'hdsd-work-timeline-department-picker',
  workTimelineSubmit: 'hdsd-work-timeline-submit',
  workTimelineDecisionBadgePrefix: 'hdsd-work-timeline-decision',
  /** EMP-FE-01/02 — Decisions person-bound + HDSD create path */
  decisionsFormCode: 'hdsd-decisions-form-code',
  decisionsFormTitle: 'hdsd-decisions-form-title',
  decisionsFormType: 'hdsd-decisions-form-type',
  decisionsFormEmployee: 'hdsd-decisions-form-employee',
  decisionsFormPosition: 'hdsd-decisions-form-position',
  decisionsFormStatus: 'hdsd-decisions-form-status',
  decisionsFormSubmit: 'hdsd-decisions-form-submit',
  decisionsEffectiveWhHint: 'hdsd-decisions-effective-wh-hint',
  /** EMP-FE-01 — Insurance timeline actions */
  insuranceTimelineRoot: 'hdsd-insurance-timeline-root',
  insuranceActionBtnPrefix: 'hdsd-insurance-action',
  insuranceActionDialog: 'hdsd-insurance-action-dialog',
  insuranceActionSubmit: 'hdsd-insurance-action-submit',
  insurancePeriodsList: 'hdsd-insurance-periods-list',
  /** EMP-FE-03 — Profile Insurance enrollments mount + open nested tab CTA */
  insuranceEnrollmentsRoot: 'hdsd-insurance-enrollments-root',
  profileOpenInsuranceTab: 'hdsd-profile-open-insurance-tab',
  /** EMP-FE-01 — HTP-05 readiness */
  hireReadinessBanner: 'hdsd-hire-readiness-banner',
} as const;

export function hdsdWorkTimelineDecisionTestId(itemId: string): string {
  return `${HDSD_MUTATE_TEST_IDS.workTimelineDecisionBadgePrefix}-${itemId}`;
}

export function hdsdInsuranceActionTestId(action: string, insuranceId: string): string {
  return `${HDSD_MUTATE_TEST_IDS.insuranceActionBtnPrefix}-${action}-${insuranceId}`;
}

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

export function hdsdLeaveListApproveTestId(rowId: string): string {
  return `${HDSD_MUTATE_TEST_IDS.leaveListApprovePrefix}-${rowId}`;
}

export function hdsdLeaveListCancelTestId(rowId: string): string {
  return `${HDSD_MUTATE_TEST_IDS.leaveListCancelPrefix}-${rowId}`;
}

/**
 * J-HRM-03 — detect contract view dialog open across iframe + parent portal.
 * Prefer latch in iframe document; also accept portaled DialogContent testid.
 */
export function isContractsViewDialogOpen(
  query: (selector: string) => Element | null,
): boolean {
  const latch = query(`[data-testid="${HDSD_MUTATE_TEST_IDS.contractsViewDialogOpen}"]`);
  if (latch) return true;
  const dialog = query(`[data-testid="${HDSD_MUTATE_TEST_IDS.contractsViewDialog}"]`);
  return Boolean(dialog);
}
