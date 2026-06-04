import { afterEach, describe, expect, it, vi } from 'vitest';

const getEmployeeById = vi.fn();
const shouldSkipSupabaseDataFetches = vi.fn();

vi.mock('@/integrations/hrmApi', () => ({
  getEmployeeById: (...args: unknown[]) => getEmployeeById(...args),
}));

vi.mock('@/lib/hrmDataMode', () => ({
  shouldSkipSupabaseDataFetches: (...args: unknown[]) => shouldSkipSupabaseDataFetches(...args),
  HRM_API_MAX_PAGE_SIZE: 100,
}));

import { loadEmployee, mapHrmEmployeeRecord, resolveEmployeeFetchCompanyIds } from './useEmployee';
import type { HrmEmployeeRecord } from '@/integrations/hrmApi';

const sampleRow: HrmEmployeeRecord = {
  id: 'emp-uuid-1',
  company_id: 'holding',
  employee_code: 'NV001',
  email: 'nv001@xe.vn',
  full_name: 'Nguyen Van A',
  job_title_key: 'staff',
  status: 'active',
  hired_at: '2024-01-15',
  archived_at: null,
  custom_fields: {},
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-02T00:00:00.000Z',
};

describe('mapHrmEmployeeRecord', () => {
  it('maps Nest employee row to UI Employee shape', () => {
    const mapped = mapHrmEmployeeRecord(sampleRow);
    expect(mapped.id).toBe('emp-uuid-1');
    expect(mapped.full_name).toBe('Nguyen Van A');
  });
});

describe('loadEmployee', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('fetches via HRM API when skip Supabase flag is true', async () => {
    shouldSkipSupabaseDataFetches.mockReturnValue(true);
    getEmployeeById.mockResolvedValue(sampleRow);

    const result = await loadEmployee('emp-uuid-1', {
      memberships: [{ company_id: 'holding' }],
      currentCompanyId: 'holding',
      search: '?portal=1',
    });

    expect(getEmployeeById).toHaveBeenCalledWith('emp-uuid-1', ['main']);
    expect(result.error).toBeNull();
    expect(result.employee?.full_name).toBe('Nguyen Van A');
  });

  it('uses main scope in embed mode from portal query', async () => {
    shouldSkipSupabaseDataFetches.mockReturnValue(true);
    getEmployeeById.mockResolvedValue(sampleRow);

    const result = await loadEmployee('emp-uuid-1', {
      memberships: [{ company_id: 'xevn' }],
      currentCompanyId: 'xevn',
      search: '?portal=1&companyId=main',
    });

    expect(getEmployeeById).toHaveBeenCalledWith('emp-uuid-1', ['main']);
    expect(result.error).toBeNull();
    expect(result.employee?.id).toBe('emp-uuid-1');
  });

  it('returns not found when API mode returns null', async () => {
    shouldSkipSupabaseDataFetches.mockReturnValue(true);
    getEmployeeById.mockResolvedValue(null);

    const result = await loadEmployee('missing-id', {
      memberships: [{ company_id: 'holding' }],
      currentCompanyId: 'holding',
    });

    expect(getEmployeeById).toHaveBeenCalled();
    expect(result.employee).toBeNull();
    expect(result.error).toBe('Không tìm thấy nhân viên');
  });

  it('resolves main scope when auth memberships are empty in embed mode', () => {
    const ids = resolveEmployeeFetchCompanyIds(
      { memberships: [], currentCompanyId: null },
      '?portal=1&companyId=main',
    );
    expect(ids).toEqual(['main']);
  });
});
