import { describe, expect, it } from 'vitest';
import { mapHrmDashboardStats, mapHrmInsuranceEmbedRows, shouldLoadMetadataQueue } from './hrmWorkspaceEmbedApi';

describe('hrmWorkspaceEmbedApi (UC-HRM-20/26)', () => {
  it('maps operations summary and employee counts for dashboard', () => {
    const rows = mapHrmDashboardStats(1000, 980, {
      attendance_records: 12000,
      payroll_periods: 60,
      job_requisitions: 8,
      tasks: 25,
    });
    expect(rows[0]?.value).toBe('1000');
    expect(rows[2]?.value).toBe('12000');
    expect(rows[3]?.value).toBe('8');
  });

  it('maps insurance API rows to BHXH embed columns (BR-INS-01 / BE-02)', () => {
    const rows = mapHrmInsuranceEmbedRows([
      {
        id: 'ins-1',
        company_id: 'main',
        employee_id: 'emp-9',
        employee_code: 'NV0009',
        employee_name: 'Nguyen Van A',
        provider: 'BHXH',
        policy_number: 'BH-001',
        social_insurance_number: 'BHXH-2026-0001',
        expiry_date: '2026-12-31',
        effective_date: '2026-01-01',
        status: 'active',
      },
    ]);
    expect(rows[0]?.ref).toBe('BHXH-2026-0001');
    expect(rows[0]?.regime).toBe('BHXH');
    expect(rows[0]?.employee).toBe('NV0009 · Nguyen Van A');
    expect(rows[0]?.period).toBe('2026-01-01');
  });

  it('loads metadata queue on dashboard, employees, and decisions embed views', () => {
    expect(shouldLoadMetadataQueue('dashboard')).toBe(true);
    expect(shouldLoadMetadataQueue('employees')).toBe(true);
    expect(shouldLoadMetadataQueue('decisions')).toBe(true);
    expect(shouldLoadMetadataQueue('payroll')).toBe(false);
  });
});
