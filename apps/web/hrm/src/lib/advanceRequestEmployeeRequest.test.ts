import { describe, expect, it } from 'vitest';
import { buildCreateAdvanceRequestEmployeeBody } from './advanceRequestEmployeeRequest';

describe('buildCreateAdvanceRequestEmployeeBody (PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-FE-01)', () => {
  it('maps DTO employee_code / employee_name / advance_amount', () => {
    expect(
      buildCreateAdvanceRequestEmployeeBody({
        employee_code: 'HLD-0001',
        employee_name: 'Nguyễn Văn A',
        advance_amount: 1_500_000,
      }),
    ).toEqual({
      employee_code: 'HLD-0001',
      employee_name: 'Nguyễn Văn A',
      advance_amount: 1_500_000,
    });
  });

  it('omits null optional fields and strips company_id/request_id if present on input cast', () => {
    const body = buildCreateAdvanceRequestEmployeeBody({
      employee_id: '3796d949-4513-45c0-88fa-33030a062b17',
      employee_code: '  HLD-0001  ',
      employee_name: '  An  ',
      department: null,
      position: '',
      advance_amount: '2000000',
      note: null,
    });
    expect(body).toEqual({
      employee_id: '3796d949-4513-45c0-88fa-33030a062b17',
      employee_code: 'HLD-0001',
      employee_name: 'An',
      advance_amount: 2_000_000,
    });
    expect(body).not.toHaveProperty('company_id');
    expect(body).not.toHaveProperty('request_id');
    expect(JSON.stringify(body)).not.toMatch(/company_id|request_id/);
  });

  it('coerces non-finite advance_amount to 0 (BE still validates ≥0)', () => {
    expect(
      buildCreateAdvanceRequestEmployeeBody({
        employee_code: 'X',
        employee_name: 'Y',
        advance_amount: Number.NaN,
      }).advance_amount,
    ).toBe(0);
  });
});
