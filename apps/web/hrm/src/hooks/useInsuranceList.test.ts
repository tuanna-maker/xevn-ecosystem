import { describe, expect, it } from 'vitest';
import { mapApiInsuranceToListItem } from './useInsuranceList';

describe('mapApiInsuranceToListItem', () => {
  it('maps Nest insurance row with employee context', () => {
    const mapped = mapApiInsuranceToListItem(
      {
        id: 'ins-1',
        company_id: 'main',
        employee_id: 'emp-1',
        provider: 'BHXH',
        policy_number: 'BH-001',
        expiry_date: '2026-12-31',
        status: 'active',
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-02T00:00:00.000Z',
      },
      {
        id: 'emp-1',
        company_id: 'main',
        employee_code: 'NV001',
        email: 'nv@xe.vn',
        full_name: 'Nguyen Van A',
        job_title_key: 'staff',
        status: 'active',
        hired_at: null,
        archived_at: null,
        custom_fields: {},
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
      },
    );
    expect(mapped.employee_code).toBe('NV001');
    expect(mapped.health_insurance_number).toBe('BH-001');
    expect(mapped.status).toBe('active');
  });

  it('prefers employee fields embedded on insurance list API row', () => {
    const mapped = mapApiInsuranceToListItem({
      id: 'ins-2',
      company_id: 'main',
      employee_id: 'emp-2',
      provider: 'PVI',
      policy_number: 'PVI-1',
      expiry_date: '2027-01-01',
      status: 'active',
      created_at: '2025-01-01T00:00:00.000Z',
      updated_at: '2025-01-01T00:00:00.000Z',
      employee_code: 'NV002',
      employee_name: 'Tran B',
      department: 'HR',
    } as Parameters<typeof mapApiInsuranceToListItem>[0]);
    expect(mapped.employee_code).toBe('NV002');
    expect(mapped.employee_name).toBe('Tran B');
    expect(mapped.department).toBe('HR');
  });
});
