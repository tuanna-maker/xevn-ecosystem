import { describe, expect, it } from 'vitest';
import type { HrmEmployeeInsuranceRow } from '@/integrations/hrmApi';
import { mapInsuranceEnrollmentRow } from './useEmployeeInsurance';

describe('useEmployeeInsurance — PO-HRM-E2E-LINK-EMP-FE-03', () => {
  it('maps enrollment_id === id for actions (BE-02 parity)', () => {
    const row: HrmEmployeeInsuranceRow = {
      id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2',
      enrollment_id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2',
      employee_id: '22222222-2222-4222-8222-222222222222',
      company_id: 'main',
      type: 'social',
      provider: 'BHXH',
      policy_number: 'POL-1',
      start_date: '2026-01-01',
      end_date: null,
      contribution: 0,
      employer_contribution: 0,
      status: 'active',
      notes: null,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
      periods: [
        {
          id: 'p1',
          effective_from: '2026-01-01',
          effective_to: null,
          period_status: 'applying',
          contribution: 0,
          employer_contribution: 0,
        },
      ],
    };
    const mapped = mapInsuranceEnrollmentRow(row);
    expect(mapped.id).toBe(row.id);
    expect(mapped.enrollment_id).toBe(row.id);
    expect(mapped.contribution).toBe(0);
    expect(mapped.employer_contribution).toBe(0);
    expect(mapped.statusLabelVi).toBe('Hoạt động');
    expect(mapped.periods).toEqual(row.periods);
  });

  it('falls back to id when enrollment_id omitted', () => {
    const mapped = mapInsuranceEnrollmentRow({
      id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
      employee_id: 'emp-1',
      company_id: 'main',
      type: 'health',
      provider: 'BHYT',
      policy_number: null,
      start_date: null,
      end_date: null,
      contribution: 100,
      employer_contribution: 200,
      status: 'active',
      notes: null,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    });
    expect(mapped.enrollment_id).toBe('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1');
    expect(mapped.id).toBe(mapped.enrollment_id);
    expect(mapped.statusLabelVi).toBe('Hoạt động');
  });

  it('prefers BE statusLabelVi when present (R-CORE-10-DISP)', () => {
    const mapped = mapInsuranceEnrollmentRow({
      id: 'cccccccc-cccc-4ccc-8ccc-ccccccccccc3',
      employee_id: 'emp-2',
      company_id: 'main',
      type: 'social',
      provider: 'BHXH',
      policy_number: null,
      start_date: '2026-01-01',
      end_date: null,
      contribution: 0,
      employer_contribution: 0,
      status: 'suspended',
      statusLabelVi: 'Tạm hoãn (BE)',
      notes: null,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    });
    expect(mapped.status).toBe('suspended');
    expect(mapped.statusLabelVi).toBe('Tạm hoãn (BE)');
  });
});
