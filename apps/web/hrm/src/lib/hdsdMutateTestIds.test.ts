import { describe, expect, it } from 'vitest';
import {
  HDSD_MUTATE_TEST_IDS,
  hdsdLeaveOverviewReasonTestId,
  hdsdShareholderNameTestId,
  hdsdShareholderSaveTestId,
} from './hdsdMutateTestIds';

describe('hdsdMutateTestIds (D-HDSD-MUTATE-FE-DEPS-02)', () => {
  it('exposes stable HDSD mutate entry-point test ids', () => {
    expect(HDSD_MUTATE_TEST_IDS.employeesCreateBtn).toBe('hdsd-employees-create-btn');
    expect(HDSD_MUTATE_TEST_IDS.employeeFormDialog).toBe('hdsd-employee-form-dialog');
    expect(HDSD_MUTATE_TEST_IDS.employeeFormSubmit).toBe('hdsd-employee-form-submit');
    expect(HDSD_MUTATE_TEST_IDS.contractsFormSubmit).toBe('hdsd-contracts-form-submit');
    expect(HDSD_MUTATE_TEST_IDS.contractsFormReady).toBe('hdsd-contracts-form-ready');
    expect(HDSD_MUTATE_TEST_IDS.contractsFormEmployee).toBe('hdsd-contracts-form-employee');
    expect(HDSD_MUTATE_TEST_IDS.contractsFormContractType).toBe(
      'hdsd-contracts-form-contract-type',
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
  });

  it('builds per-row shareholder / leave overview ids', () => {
    expect(hdsdShareholderSaveTestId('sh-1')).toBe('hdsd-shareholder-save-sh-1');
    expect(hdsdShareholderNameTestId('sh-1')).toBe('hdsd-shareholder-name-sh-1');
    expect(hdsdLeaveOverviewReasonTestId('lr-9')).toBe('hdsd-leave-overview-reason-lr-9');
  });
});
