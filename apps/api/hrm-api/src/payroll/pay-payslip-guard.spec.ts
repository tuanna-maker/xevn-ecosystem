import { assertNoPayPayslipAmountOverrideInBody } from './pay-payslip-guard';
import { ApiException } from '../common/api.exception';

describe('pay-payslip-guard', () => {
  it('assertNoPayPayslipAmountOverrideInBody rejects net_amount', () => {
    expect(() =>
      assertNoPayPayslipAmountOverrideInBody({ net_amount: 1 }),
    ).toThrow(ApiException);
    try {
      assertNoPayPayslipAmountOverrideInBody({ grossAmount: 2 });
    } catch (e) {
      expect((e as ApiException).code).toBe('HRM-PAY-PAYSLIP-403');
    }
  });

  it('allows payment_status only bodies', () => {
    expect(() =>
      assertNoPayPayslipAmountOverrideInBody({
        payment_status: 'paid',
        note: 'ok',
      }),
    ).not.toThrow();
  });
});
