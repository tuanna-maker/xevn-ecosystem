import { describe, expect, it } from 'vitest';
import type { HrmInsuranceRecord } from '@/integrations/hrmApi';

function mapApiInsuranceRow(row: HrmInsuranceRecord) {
  const status = row.status === 'cancelled' || row.status === 'expired' ? 'expired' : 'active';
  return {
    id: row.id,
    provider: row.provider,
    policy_number: row.policy_number,
    status,
  };
}

describe('useEmployeeInsurance mapping', () => {
  it('maps Nest insurance record for profile tab', () => {
    const mapped = mapApiInsuranceRow({
      id: 'ins-1',
      company_id: 'main',
      employee_id: 'emp-1',
      provider: 'BHXH VN',
      policy_number: 'POL-99',
      expiry_date: '2026-12-31',
      status: 'active',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    });
    expect(mapped.provider).toBe('BHXH VN');
    expect(mapped.status).toBe('active');
  });
});
