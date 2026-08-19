import {
  isPeriodPayrollLocked,
  mapPayslipStatusForApi,
  paymentStatusLabelVi,
} from './pay-payslip-lifecycle.helpers';

describe('pay-payslip-lifecycle.helpers', () => {
  it('maps processed to calculated for API', () => {
    expect(mapPayslipStatusForApi('processed')).toBe('calculated');
    expect(mapPayslipStatusForApi('published')).toBe('published');
  });

  it('detects period lock via closed or payroll_locked', () => {
    expect(isPeriodPayrollLocked({ status: 'draft', payroll_locked: false })).toBe(false);
    expect(isPeriodPayrollLocked({ status: 'closed', payroll_locked: false })).toBe(true);
    expect(isPeriodPayrollLocked({ status: 'processed', payroll_locked: true })).toBe(true);
  });

  it('emits vi-VN payment status labels', () => {
    expect(paymentStatusLabelVi('paid')).toBe('Đã thanh toán');
    expect(paymentStatusLabelVi('unpaid')).toBe('Chưa thanh toán');
  });
});
