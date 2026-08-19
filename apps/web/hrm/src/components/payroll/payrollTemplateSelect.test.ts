import { describe, expect, it } from 'vitest';
import {
  PAYROLL_TEMPLATE_NONE_SENTINEL,
  templateApiValue,
  templateFormValue,
} from './payrollTemplateSelect';

describe('payrollTemplateSelect (PO-HRM-E2E-LINK-PAY-HIRE-FE-03)', () => {
  it('never uses empty string as form Select value', () => {
    expect(templateFormValue(null)).toBe(PAYROLL_TEMPLATE_NONE_SENTINEL);
    expect(templateFormValue(undefined)).toBe(PAYROLL_TEMPLATE_NONE_SENTINEL);
    expect(templateFormValue('')).toBe(PAYROLL_TEMPLATE_NONE_SENTINEL);
    expect(templateFormValue(PAYROLL_TEMPLATE_NONE_SENTINEL)).toBe(PAYROLL_TEMPLATE_NONE_SENTINEL);
    expect(PAYROLL_TEMPLATE_NONE_SENTINEL.length).toBeGreaterThan(0);
  });

  it('preserves real template UUID in form value', () => {
    const id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
    expect(templateFormValue(id)).toBe(id);
  });

  it('maps sentinel / empty to API undefined', () => {
    expect(templateApiValue(PAYROLL_TEMPLATE_NONE_SENTINEL)).toBeUndefined();
    expect(templateApiValue('')).toBeUndefined();
    expect(templateApiValue(undefined)).toBeUndefined();
  });

  it('maps real template id to API value', () => {
    const id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
    expect(templateApiValue(id)).toBe(id);
  });
});
