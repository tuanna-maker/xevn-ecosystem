import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mapApiContractToProfileRow } from './useEmployeeContracts';

vi.mock('@/lib/hrmDataMode', () => ({
  shouldSkipSupabaseDataFetches: vi.fn(() => true),
  isHrmApiDataMode: vi.fn(() => true),
}));

describe('mapApiContractToProfileRow', () => {
  it('maps Nest contract fields to profile row shape', () => {
    const row = mapApiContractToProfileRow({
      id: 'con-abc-12345',
      company_id: 'main',
      employee_id: 'emp-1',
      contract_type: 'fixed_term',
      start_date: '2025-01-01',
      end_date: '2026-01-01',
      status: 'active',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-02T00:00:00Z',
    });
    expect(row.contract_code).toContain('HD-');
    expect(row.effective_date).toBe('2025-01-01');
    expect(row.status).toBe('active');
  });

  it('maps terminated status for profile badge', () => {
    const row = mapApiContractToProfileRow({
      id: 'con-2',
      company_id: 'main',
      employee_id: 'emp-1',
      contract_type: 'permanent',
      start_date: '2024-01-01',
      end_date: '2025-01-01',
      status: 'terminated',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-06-01T00:00:00Z',
    });
    expect(row.status).toBe('terminated');
  });
});
