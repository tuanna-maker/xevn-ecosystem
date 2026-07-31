import { describe, expect, it } from 'vitest';
import {
  isHrmCockpitApiDeferredView,
  mapHrmDashboardPayrollSummary,
  mapHrmDashboardStats,
  mapHrmInsuranceEmbedRows,
  mapHrmRecruitmentFunnelCounts,
  shouldLoadMetadataQueue,
} from './hrmWorkspaceEmbedApi';

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

  it('aggregates payslips for dashboard payroll card (BR-MOCK-01 / PCOMP-W2-FE-01)', () => {
    const empty = mapHrmDashboardPayrollSummary(null);
    expect(empty.hasData).toBe(false);
    expect(empty.grossFormatted).toBe('—');
    expect(empty.statusLabel).toBe('Chưa có phiếu lương');

    const emptyArr = mapHrmDashboardPayrollSummary([]);
    expect(emptyArr.hasData).toBe(false);

    const summary = mapHrmDashboardPayrollSummary([
      {
        id: 'p1',
        employee_code: 'NV001',
        employee_name: 'A',
        period_label: '2026-03',
        gross_amount: 10_000_000,
        deduction_amount: 1_000_000,
        net_amount: 9_000_000,
        status: 'processed',
      },
      {
        id: 'p2',
        employee_code: 'NV002',
        employee_name: 'B',
        period_label: '2026-03',
        gross_amount: 5_000_000,
        deduction_amount: 500_000,
        net_amount: 4_500_000,
        status: 'processed',
      },
    ]);
    expect(summary.hasData).toBe(true);
    expect(summary.periodLabel).toBe('2026-03');
    expect(summary.statusLabel).toBe('processed');
    expect(summary.payslipCount).toBe(2);
    expect(summary.grossFormatted).toContain('15');
    expect(summary.deductionsFormatted).toContain('1');
    expect(summary.netFormatted).toContain('13');
  });

  it('marks only deferred cockpit views as API-unavailable (M-CC-01 residual)', () => {
    expect(isHrmCockpitApiDeferredView('hrm_ai')).toBe(true);
    expect(isHrmCockpitApiDeferredView('processes')).toBe(true);
    expect(isHrmCockpitApiDeferredView('tasks')).toBe(false);
    expect(isHrmCockpitApiDeferredView('decisions')).toBe(false);
    expect(isHrmCockpitApiDeferredView('internal_services')).toBe(false);
    expect(isHrmCockpitApiDeferredView('dashboard')).toBe(false);
  });

  it('aggregates F6 recruitment funnel from live candidate stages (AC-CD-F6-03)', () => {
    const counts = mapHrmRecruitmentFunnelCounts([
      { stage: 'applied' },
      { stage: 'new' },
      { stage: 'screening' },
      { stage: 'interview' },
      { stage: 'offer' },
      { stage: 'hired' },
      { stage: 'rejected' },
    ]);
    expect(counts.new).toBe(2);
    expect(counts.screening).toBe(1);
    expect(counts.interview).toBe(1);
    expect(counts.offer).toBe(1);
    expect(counts.hired).toBe(1);
    expect(counts.rejected).toBe(1);
    expect(counts.total).toBe(7);
  });
});
