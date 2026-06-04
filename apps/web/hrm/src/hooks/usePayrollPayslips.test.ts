import { describe, expect, it } from 'vitest';
import { buildPayrollPayslipsQuery } from './usePayrollPayslips';

describe('buildPayrollPayslipsQuery', () => {
  it('scopes payslip list by company from portal context', () => {
    expect(buildPayrollPayslipsQuery('main')).toEqual({ company_id: 'main', period_id: undefined });
    expect(buildPayrollPayslipsQuery('main', 'period-1')).toEqual({
      company_id: 'main',
      period_id: 'period-1',
    });
  });
});
