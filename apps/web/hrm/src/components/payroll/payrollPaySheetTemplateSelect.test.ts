import { describe, expect, it } from 'vitest';
import {
  PAY_SHEET_TPL_PERIOD_NONE_SENTINEL,
  formatPaySheetTemplatePickerLabel,
  paySheetTemplateApiValue,
  paySheetTemplateFormValue,
} from './payrollPaySheetTemplateSelect';

describe('payrollPaySheetTemplateSelect (PO-HRM-AMIS-PARITY-PAY-PERIOD-BIND-FE-01)', () => {
  it('maps sentinel ↔ omitted paySheetTemplateId', () => {
    expect(paySheetTemplateFormValue(null)).toBe(PAY_SHEET_TPL_PERIOD_NONE_SENTINEL);
    expect(paySheetTemplateApiValue(PAY_SHEET_TPL_PERIOD_NONE_SENTINEL)).toBeUndefined();
    expect(paySheetTemplateApiValue('11111111-1111-4111-8111-111111111111')).toBe(
      '11111111-1111-4111-8111-111111111111',
    );
  });

  it('formats picker label code — name', () => {
    expect(formatPaySheetTemplatePickerLabel({ code: 'tpl_main', name: 'Mẫu tập đoàn' })).toBe(
      'tpl_main — Mẫu tập đoàn',
    );
  });
});
