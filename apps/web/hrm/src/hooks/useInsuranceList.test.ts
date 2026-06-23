import { describe, expect, it } from 'vitest';
import {
  findEmployeeForInsuranceRow,
  mapApiInsuranceToListItem,
  normalizeInsuranceEmployeeId,
} from './useInsuranceList';

const baseEmployee = {
  id: 'emp-1',
  company_id: 'main',
  employee_code: 'LOG-0003',
  email: 'nv@xe.vn',
  full_name: 'Lê Văn An',
  job_title_key: 'staff',
  status: 'active' as const,
  hired_at: null,
  archived_at: null,
  custom_fields: {},
  created_at: '2025-01-01T00:00:00.000Z',
  updated_at: '2025-01-01T00:00:00.000Z',
};

describe('normalizeInsuranceEmployeeId', () => {
  it('returns undefined for empty values', () => {
    expect(normalizeInsuranceEmployeeId(null)).toBeUndefined();
    expect(normalizeInsuranceEmployeeId('  ')).toBeUndefined();
  });

  it('trims valid ids', () => {
    expect(normalizeInsuranceEmployeeId(' emp-1 ')).toBe('emp-1');
  });
});

describe('findEmployeeForInsuranceRow', () => {
  it('resolves by employee_code when row employee_id is missing (J-HRM-04)', () => {
    const found = findEmployeeForInsuranceRow(
      {
        id: 'ins-1',
        company_id: 'main',
        employee_id: '',
        provider: 'BHXH',
        policy_number: 'BH-001',
        expiry_date: '2026-12-31',
        status: 'active',
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-02T00:00:00.000Z',
        employee_code: 'LOG-0003',
        employee_name: 'Lê Văn An',
      },
      [baseEmployee],
    );
    expect(found?.id).toBe('emp-1');
  });
});

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
      baseEmployee,
    );
    expect(mapped.employee_code).toBe('LOG-0003');
    expect(mapped.employee_id).toBe('emp-1');
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

  it('falls back employee_id from workforce row when API omits it', () => {
    const mapped = mapApiInsuranceToListItem(
      {
        id: 'ins-3',
        company_id: 'main',
        employee_id: '',
        provider: 'BHXH',
        policy_number: 'BH-003',
        expiry_date: '2026-12-31',
        status: 'active',
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
        employee_code: 'LOG-0003',
        employee_name: 'Lê Văn An',
      },
      baseEmployee,
    );
    expect(mapped.employee_id).toBe('emp-1');
  });
});
