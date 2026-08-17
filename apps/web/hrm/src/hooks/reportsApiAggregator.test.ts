import { describe, expect, it } from 'vitest';
import {
  buildContractReportFromApi,
  buildLeaveReportFromApi,
  buildRecruitmentReportFromApi,
  buildTurnoverReportFromApi,
  mapOperationsSummaryReport,
  mapPayrollReconciliation,
  mapRecruitmentReportFromNestDashboard,
} from './reportsApiAggregator';
import type { HrmRecruitmentDashboardDto } from '@/integrations/hrmApi';

describe('reportsApiAggregator (portal API mode)', () => {
  it('maps operations summary (HRM-OP-04)', () => {
    expect(
      mapOperationsSummaryReport({
        attendance_records: 12,
        payroll_periods: 3,
        job_requisitions: 2,
        tasks: 5,
      }),
    ).toEqual({
      attendanceRecords: 12,
      payrollPeriods: 3,
      jobRequisitions: 2,
      tasks: 5,
    });
  });

  it('maps recruitment report from Nest dashboard DTO (O8)', () => {
    const dto: HrmRecruitmentDashboardDto = {
      period: { year: 2026, from: null, to: null },
      planned_need: 10,
      filled_count: 3,
      in_pipeline_count: 4,
      open_yctd_count: 2,
      gap_count: 7,
      completion_pct: 30,
      enough_people_status: 'in_progress',
      enough_people_eta: '2026-08',
      enough_people_eta_label: 'Dự kiến đủ người: 08/2026',
      funnel: { cv: 1, screening: 1, interview: 1, offer: 1, onboard: 3 },
      funnel_labels: {
        cv: 'Hồ sơ / CV',
        screening: 'Sàng lọc',
        interview: 'Phỏng vấn',
        offer: 'Offer',
        onboard: 'Onboard / Đã tuyển',
      },
      by_month: [],
      by_org_unit: [],
      by_yctd: [],
      empty_guide: null,
    };
    const report = mapRecruitmentReportFromNestDashboard(dto);
    expect(report.planned_need).toBe(10);
    expect(report.filled_count).toBe(3);
    expect(report.completion_pct).toBe(30);
    expect(report.funnel.onboard).toBe(3);
  });

  it('DENY legacy buildRecruitmentReportFromApi (throws)', () => {
    expect(() => buildRecruitmentReportFromApi()).toThrow(/Nest GET/);
  });

  it('builds contract and leave aggregates', () => {
    const contracts = buildContractReportFromApi(
      [
        {
          id: 'c1',
          company_id: 'main',
          employee_id: 'e1',
          contract_type: 'indefinite',
          start_date: '2026-01-01',
          end_date: '2027-01-01',
          status: 'active',
          created_at: '2026-01-01',
          updated_at: '2026-01-01',
        },
      ],
      0,
      2026,
    );
    expect(contracts.activeContracts).toBe(1);

    const leave = buildLeaveReportFromApi(
      [
        {
          id: 'l1',
          company_id: 'main',
          employee_id: 'e1',
          employee_code: 'NV001',
          employee_name: 'Test',
          leave_type: 'annual',
          start_date: '2026-05-10',
          end_date: '2026-05-12',
          reason: null,
          status: 'approved',
          requested_at: '2026-05-01',
          reviewed_at: null,
          reviewed_by: null,
          department: 'IT',
          position: null,
          total_days: '3',
          handover_to: null,
          handover_tasks: null,
          approver_employee_id: null,
          rejected_reason: null,
        },
      ],
      2026,
    );
    expect(leave.approvedRequests).toBe(1);
    expect(leave.totalDays).toBe(3);
  });

  it('builds turnover from employees API rows', () => {
    const turnover = buildTurnoverReportFromApi(
      [
        {
          id: 'e1',
          company_id: 'main',
          employee_code: 'NV001',
          email: 'a@xe.vn',
          full_name: 'Active',
          job_title_key: 'dev',
          status: 'active',
          hired_at: '2024-01-01',
          archived_at: null,
          custom_fields: { department: 'IT' },
          created_at: '2024-01-01',
          updated_at: '2026-01-01',
        },
      ],
      2026,
      new Date('2026-05-25'),
    );
    expect(turnover.totalActive).toBe(1);
    expect(turnover.tenureDistribution.length).toBe(5);
  });

  it('uses totalActiveOverride so page-1 length ≠ scope headcount (D-HRM-RPT-TURNOVER-PAGE-01)', () => {
    const pageRows = Array.from({ length: 95 }, (_, i) => ({
      id: `e${i}`,
      company_id: 'main',
      employee_code: `NV${i}`,
      email: `u${i}@xe.vn`,
      full_name: `Emp ${i}`,
      job_title_key: 'dev',
      status: 'active' as const,
      hired_at: '2024-01-01',
      archived_at: null,
      custom_fields: { department: 'IT' },
      created_at: '2024-01-01',
      updated_at: '2026-01-01',
    }));
    const turnover = buildTurnoverReportFromApi(pageRows, 2026, new Date('2026-05-25'), {
      totalActiveOverride: 1107,
    });
    expect(turnover.totalActive).toBe(1107);
    expect(pageRows.length).toBe(95);
  });

  it('maps payroll reconciliation for HRM-PR-06', () => {
    expect(mapPayrollReconciliation({ draft: 10, processed: 10, closed: 60 })).toEqual({
      draft: 10,
      processed: 10,
      closed: 60,
    });
    expect(mapPayrollReconciliation(null)).toBeNull();
  });
});
