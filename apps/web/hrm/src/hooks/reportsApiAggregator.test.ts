import { describe, expect, it } from 'vitest';
import {
  buildContractReportFromApi,
  buildLeaveReportFromApi,
  buildRecruitmentReportFromApi,
  buildTurnoverReportFromApi,
  mapOperationsSummaryReport,
} from './reportsApiAggregator';

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

  it('builds recruitment report from Nest candidates', () => {
    const report = buildRecruitmentReportFromApi(
      [
        {
          id: '1',
          company_id: 'main',
          requisition_id: 'r1',
          full_name: 'A',
          email: 'a@xe.vn',
          source: 'web',
          status: 'hired',
          created_at: '2026-03-01T00:00:00Z',
          updated_at: '2026-03-01T00:00:00Z',
        },
        {
          id: '2',
          company_id: 'main',
          requisition_id: 'r1',
          full_name: 'B',
          email: 'b@xe.vn',
          source: 'referral',
          status: 'rejected',
          created_at: '2026-04-01T00:00:00Z',
          updated_at: '2026-04-01T00:00:00Z',
        },
      ],
      2026,
    );
    expect(report.totalCandidates).toBe(2);
    expect(report.hiredCount).toBe(1);
    expect(report.rejectedCount).toBe(1);
    expect(report.sourceStats.length).toBeGreaterThan(0);
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
});
