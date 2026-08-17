import { describe, expect, it } from 'vitest';
import {
  HDSD_MUTATE_TEST_IDS,
  hdsdLeaveListApproveTestId,
  hdsdLeaveListCancelTestId,
  hdsdLeaveOverviewReasonTestId,
  hdsdShareholderNameTestId,
  hdsdShareholderSaveTestId,
  isContractsViewDialogOpen,
} from './hdsdMutateTestIds';

describe('hdsdMutateTestIds (D-HDSD-MUTATE-FE-DEPS-02)', () => {
  it('exposes stable HDSD mutate entry-point test ids', () => {
    expect(HDSD_MUTATE_TEST_IDS.employeesCreateBtn).toBe('hdsd-employees-create-btn');
    expect(HDSD_MUTATE_TEST_IDS.employeeFormDialog).toBe('hdsd-employee-form-dialog');
    expect(HDSD_MUTATE_TEST_IDS.employeeFormSubmit).toBe('hdsd-employee-form-submit');
    expect(HDSD_MUTATE_TEST_IDS.employeeFormManagerPicker).toBe(
      'hdsd-employee-form-manager-picker',
    );
    expect(HDSD_MUTATE_TEST_IDS.contractsFormSubmit).toBe('hdsd-contracts-form-submit');
    expect(HDSD_MUTATE_TEST_IDS.contractsFormReady).toBe('hdsd-contracts-form-ready');
    expect(HDSD_MUTATE_TEST_IDS.contractsFormEmployee).toBe('hdsd-contracts-form-employee');
    expect(HDSD_MUTATE_TEST_IDS.contractsFormContractType).toBe(
      'hdsd-contracts-form-contract-type',
    );
    expect(HDSD_MUTATE_TEST_IDS.contractsViewBtn).toBe('hdsd-contracts-view-btn');
    expect(HDSD_MUTATE_TEST_IDS.contractsViewDialog).toBe('hdsd-contracts-view-dialog');
    expect(HDSD_MUTATE_TEST_IDS.contractsViewDialogOpen).toBe(
      'hdsd-contracts-view-dialog-open',
    );
    expect(HDSD_MUTATE_TEST_IDS.requisitionCreateBtn).toBe('hdsd-requisition-create-btn');
    expect(HDSD_MUTATE_TEST_IDS.requisitionFormReady).toBe('hdsd-requisition-form-ready');
    expect(HDSD_MUTATE_TEST_IDS.requisitionJobTemplate).toBe('hdsd-requisition-job-template');
    expect(HDSD_MUTATE_TEST_IDS.requisitionSubmitWf).toBe('hdsd-requisition-submit-wf');
    expect(HDSD_MUTATE_TEST_IDS.requisitionPostCreateSubmit).toBe(
      'hdsd-requisition-post-create-submit',
    );
    expect(HDSD_MUTATE_TEST_IDS.leaveReasonInput).toBe('hdsd-leave-reason');
    expect(HDSD_MUTATE_TEST_IDS.leaveOverviewRecent).toBe('hdsd-leave-overview-recent');
    expect(HDSD_MUTATE_TEST_IDS.leaveOverviewReasonPrefix).toBe('hdsd-leave-overview-reason');
    expect(HDSD_MUTATE_TEST_IDS.leaveAttachmentInput).toBe('hdsd-leave-attachment-input');
    expect(HDSD_MUTATE_TEST_IDS.leaveAttachmentHint).toBe('hdsd-leave-attachment-hint');
    expect(HDSD_MUTATE_TEST_IDS.leaveListApproveBtn).toBe('hdsd-leave-list-approve');
    expect(HDSD_MUTATE_TEST_IDS.leaveListCancelBtn).toBe('hdsd-leave-list-cancel');
    expect(HDSD_MUTATE_TEST_IDS.leaveCancelConfirmBtn).toBe('hdsd-leave-cancel-confirm');
    expect(HDSD_MUTATE_TEST_IDS.leaveSyncCatalogBtn).toBe('hdsd-leave-sync-catalog');
    expect(HDSD_MUTATE_TEST_IDS.jdLibraryRefreshBtn).toBe('hdsd-jd-library-refresh-btn');
    expect(HDSD_MUTATE_TEST_IDS.jdLibraryAddBtn).toBe('hdsd-jd-library-add-btn');
    expect(HDSD_MUTATE_TEST_IDS.jdLibraryEmpty).toBe('hdsd-jd-library-empty');
    expect(HDSD_MUTATE_TEST_IDS.jdLibraryRow).toBe('hdsd-jd-library-row');
    expect(HDSD_MUTATE_TEST_IDS.jdFormDialog).toBe('hdsd-jd-form-dialog');
    expect(HDSD_MUTATE_TEST_IDS.jdFormTitle).toBe('hdsd-jd-form-title');
    expect(HDSD_MUTATE_TEST_IDS.jdFormCode).toBe('hdsd-jd-form-code');
    expect(HDSD_MUTATE_TEST_IDS.jdFormPosition).toBe('hdsd-jd-form-position');
    expect(HDSD_MUTATE_TEST_IDS.jdFormSubmit).toBe('hdsd-jd-form-submit');
    expect(HDSD_MUTATE_TEST_IDS.candidateCreateBtn).toBe('hdsd-candidate-create-btn');
    expect(HDSD_MUTATE_TEST_IDS.candidateFormDialog).toBe('hdsd-candidate-form-dialog');
    expect(HDSD_MUTATE_TEST_IDS.candidateFormYctd).toBe('hdsd-candidate-form-yctd');
    expect(HDSD_MUTATE_TEST_IDS.candidateFormPosition).toBe('hdsd-candidate-form-position');
    expect(HDSD_MUTATE_TEST_IDS.candidateFormEmptyYctd).toBe('hdsd-candidate-form-empty-yctd');
    expect(HDSD_MUTATE_TEST_IDS.candidateFormOpenYctdCta).toBe(
      'hdsd-candidate-form-open-yctd-cta',
    );
    expect(HDSD_MUTATE_TEST_IDS.candidateFormSubmit).toBe('hdsd-candidate-form-submit');
    expect(HDSD_MUTATE_TEST_IDS.candidateListYctd).toBe('hdsd-candidate-list-yctd');
    expect(HDSD_MUTATE_TEST_IDS.candidateListPosition).toBe('hdsd-candidate-list-position');
    expect(HDSD_MUTATE_TEST_IDS.candidateFilterSource).toBe('hdsd-candidate-filter-source');
    expect(HDSD_MUTATE_TEST_IDS.candidateFilterSourceOptionPrefix).toBe(
      'hdsd-candidate-filter-source-option',
    );
    expect(HDSD_MUTATE_TEST_IDS.recCompareOpenBtn).toBe('hdsd-rec-compare-open-btn');
    expect(HDSD_MUTATE_TEST_IDS.recCompareDialog).toBe('hdsd-rec-compare-dialog');
    expect(HDSD_MUTATE_TEST_IDS.recCompareYctdPicker).toBe('hdsd-rec-compare-yctd-picker');
    expect(HDSD_MUTATE_TEST_IDS.recCompareYctdEmpty).toBe('hdsd-rec-compare-yctd-empty');
    expect(HDSD_MUTATE_TEST_IDS.recCompareUvEmpty).toBe('hdsd-rec-compare-uv-empty');
    expect(HDSD_MUTATE_TEST_IDS.recCompareUvNotEval).toBe('hdsd-rec-compare-uv-not-eval');
    expect(HDSD_MUTATE_TEST_IDS.recCompareMaxNHint).toBe('hdsd-rec-compare-max-n-hint');
    expect(HDSD_MUTATE_TEST_IDS.workTimelineRoot).toBe('hdsd-work-timeline-root');
    expect(HDSD_MUTATE_TEST_IDS.workTimelinePositionPicker).toBe(
      'hdsd-work-timeline-position-picker',
    );
    expect(HDSD_MUTATE_TEST_IDS.decisionsFormEmployee).toBe('hdsd-decisions-form-employee');
    expect(HDSD_MUTATE_TEST_IDS.decisionsFormCode).toBe('hdsd-decisions-form-code');
    expect(HDSD_MUTATE_TEST_IDS.decisionsFormTitle).toBe('hdsd-decisions-form-title');
    expect(HDSD_MUTATE_TEST_IDS.decisionsFormPosition).toBe('hdsd-decisions-form-position');
    expect(HDSD_MUTATE_TEST_IDS.decisionsFormStatus).toBe('hdsd-decisions-form-status');
    expect(HDSD_MUTATE_TEST_IDS.decisionsFormType).toBe('hdsd-decisions-form-type');
    expect(HDSD_MUTATE_TEST_IDS.insuranceActionSubmit).toBe('hdsd-insurance-action-submit');
    expect(HDSD_MUTATE_TEST_IDS.insuranceEnrollmentsRoot).toBe(
      'hdsd-insurance-enrollments-root',
    );
    expect(HDSD_MUTATE_TEST_IDS.profileOpenInsuranceTab).toBe(
      'hdsd-profile-open-insurance-tab',
    );
    expect(HDSD_MUTATE_TEST_IDS.hireReadinessBanner).toBe('hdsd-hire-readiness-banner');
  });

  it('builds per-row shareholder / leave overview ids', () => {
    expect(hdsdShareholderSaveTestId('sh-1')).toBe('hdsd-shareholder-save-sh-1');
    expect(hdsdShareholderNameTestId('sh-1')).toBe('hdsd-shareholder-name-sh-1');
    expect(hdsdLeaveOverviewReasonTestId('lr-9')).toBe('hdsd-leave-overview-reason-lr-9');
    expect(hdsdLeaveListApproveTestId('lr-9')).toBe('hdsd-leave-list-approve-lr-9');
    expect(hdsdLeaveListCancelTestId('lr-9')).toBe('hdsd-leave-list-cancel-lr-9');
  });
});

describe('isContractsViewDialogOpen (PO-HRM-E2E-LINK-EMP-FE-J03-01)', () => {
  it('returns true when iframe latch is present', () => {
    const nodes = new Map<string, Element>([
      [
        `[data-testid="${HDSD_MUTATE_TEST_IDS.contractsViewDialogOpen}"]`,
        document.createElement('span'),
      ],
    ]);
    expect(isContractsViewDialogOpen((sel) => nodes.get(sel) ?? null)).toBe(true);
  });

  it('returns true when portaled DialogContent testid is present', () => {
    const nodes = new Map<string, Element>([
      [
        `[data-testid="${HDSD_MUTATE_TEST_IDS.contractsViewDialog}"]`,
        document.createElement('div'),
      ],
    ]);
    expect(isContractsViewDialogOpen((sel) => nodes.get(sel) ?? null)).toBe(true);
  });

  it('returns false when neither latch nor dialog mount exists', () => {
    expect(isContractsViewDialogOpen(() => null)).toBe(false);
  });

  it('prefers latch over missing dialog node', () => {
    const latch = document.createElement('span');
    expect(
      isContractsViewDialogOpen((sel) =>
        sel.includes('view-dialog-open') ? latch : null,
      ),
    ).toBe(true);
  });
});
