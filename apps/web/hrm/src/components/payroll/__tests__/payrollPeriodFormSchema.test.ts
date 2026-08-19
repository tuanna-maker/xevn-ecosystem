import { describe, expect, it } from 'vitest';
import {
  parsePayrollPeriodForm,
  type PayrollPeriodFormMessages,
} from '../payrollPeriodFormSchema';

const messages: PayrollPeriodFormMessages = {
  nameRequired: 'nameRequired',
  monthInvalid: 'monthInvalid',
  yearInvalid: 'yearInvalid',
  paySheetTemplateRequired: 'paySheetTemplateRequired',
};

const valid = {
  name: 'Bảng lương T7/2026',
  period_month: 7,
  period_year: 2026,
  pay_sheet_template_id: '11111111-1111-4111-8111-111111111111',
};

describe('payrollPeriodFormSchema (D-FE-ERP-E2-01)', () => {
  it('accepts valid period payload', () => {
    expect(parsePayrollPeriodForm(valid, messages).success).toBe(true);
  });

  it('rejects missing name', () => {
    expect(
      parsePayrollPeriodForm({ ...valid, name: '  ' }, messages).error?.flatten()
        .fieldErrors.name?.[0],
    ).toBe('nameRequired');
  });

  it('rejects invalid month / year', () => {
    expect(
      parsePayrollPeriodForm({ ...valid, period_month: 0 }, messages).error?.flatten()
        .fieldErrors.period_month?.[0],
    ).toBe('monthInvalid');
    expect(
      parsePayrollPeriodForm({ ...valid, period_year: 1999 }, messages).error?.flatten()
        .fieldErrors.period_year?.[0],
    ).toBe('yearInvalid');
  });

  it('rejects missing pay_sheet_template_id (AC-PAY-TPL-03)', () => {
    expect(
      parsePayrollPeriodForm({ ...valid, pay_sheet_template_id: '__pay_sheet_tpl_none__' }, messages)
        .success,
    ).toBe(false);
    expect(
      parsePayrollPeriodForm({ ...valid, pay_sheet_template_id: '' }, messages).error?.flatten()
        .fieldErrors.pay_sheet_template_id?.[0],
    ).toBe('paySheetTemplateRequired');
  });
});
