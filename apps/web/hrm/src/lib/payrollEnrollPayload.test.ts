import { describe, expect, it } from 'vitest';
import {
  buildPayrollEnrollPayload,
  serializePayrollEnrollBody,
} from './payrollEnrollPayload';

describe('payrollEnrollPayload', () => {
  it('builds explicit enroll without company_id', () => {
    const body = buildPayrollEnrollPayload(['emp-a', 'emp-b']);
    expect(body).toEqual({
      mode: 'explicit',
      employee_ids: ['emp-a', 'emp-b'],
    });
    expect(body).not.toHaveProperty('company_id');
  });

  it('serialize strips company_id from polluted input', () => {
    const raw = serializePayrollEnrollBody({
      mode: 'explicit',
      employee_ids: ['emp-1'],
    });
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    expect(parsed).toEqual({ mode: 'explicit', employee_ids: ['emp-1'] });
    expect(parsed).not.toHaveProperty('company_id');
  });

  it('serialize auto_eligible mode without extra fields', () => {
    const raw = serializePayrollEnrollBody({ mode: 'auto_eligible' });
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    expect(parsed).toEqual({ mode: 'auto_eligible' });
    expect(parsed).not.toHaveProperty('company_id');
  });
});
