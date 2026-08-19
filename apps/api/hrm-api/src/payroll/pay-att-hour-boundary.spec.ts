import { ApiException } from '../common/api.exception';
import {
  __setPayAttHourCrossreadViolationForTests,
  assertPayrollAttHourBoundaryLocked,
  HRM_PAY_BOUNDARY_403,
  registerPayAttHourCrossreadAttempt,
} from './pay-att-hour-boundary';

describe('R-PAY-01-BOUNDARY — assertPayrollAttHourBoundaryLocked', () => {
  const prevEnv = process.env.HRM_PAY_ALLOW_ATT_HTTP_CROSSREAD;

  afterEach(() => {
    __setPayAttHourCrossreadViolationForTests(false);
    if (prevEnv === undefined) {
      delete process.env.HRM_PAY_ALLOW_ATT_HTTP_CROSSREAD;
    } else {
      process.env.HRM_PAY_ALLOW_ATT_HTTP_CROSSREAD = prevEnv;
    }
  });

  it('passes when no cross-read flag and env gate off', () => {
    expect(() => assertPayrollAttHourBoundaryLocked()).not.toThrow();
  });

  it('throws HRM-PAY-BOUNDARY-403 when env misconfig enables ATT HTTP cross-read', () => {
    process.env.HRM_PAY_ALLOW_ATT_HTTP_CROSSREAD = '1';
    expect(() => assertPayrollAttHourBoundaryLocked()).toThrow(
      expect.objectContaining<ApiException>({ code: HRM_PAY_BOUNDARY_403 }),
    );
  });

  it('throws HRM-PAY-BOUNDARY-403 when registerPayAttHourCrossreadAttempt marks violation', () => {
    registerPayAttHourCrossreadAttempt('leave-requests');
    expect(() => assertPayrollAttHourBoundaryLocked()).toThrow(
      expect.objectContaining<ApiException>({ code: HRM_PAY_BOUNDARY_403 }),
    );
  });
});
