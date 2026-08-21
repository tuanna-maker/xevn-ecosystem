import { HttpStatus } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { signServiceJwt } from '../common/jwt-sign';
import { AttendanceRequestsService } from './attendance-requests.service';
import {
  AttOtCompLeavePolicyService,
  computeOtCompCreditedDays,
} from './att-ot-comp-leave-policy.service';

describe('PO-HRM-MVP-GD1-ATT-06-CLUSTER-BE-01', () => {
  it('ensureSchema ADD att_ot_comp_leave_policy + att_ot_comp_accrual_ledger; DENY att_leave_hold', async () => {
    const sqlLog: string[] = [];
    const db = {
      query: jest.fn().mockImplementation((sql: string) => {
        sqlLog.push(String(sql));
        return Promise.resolve({ rows: [] });
      }),
      withTransaction: jest.fn(),
    };
    const svc = new AttOtCompLeavePolicyService(db as never);
    await svc.ensureSchema();
    const blob = sqlLog.join('\n');
    expect(blob).toContain('att_ot_comp_leave_policy');
    expect(blob).toContain('att_ot_comp_accrual_ledger');
    expect(blob).toContain('uq_att_ot_comp_accrual_ledger_ot_credited');
    expect(blob).not.toContain('att_leave_hold');
  });

  it('computeOtCompCreditedDays rounds to half-day 0.5 steps', () => {
    expect(computeOtCompCreditedDays(4, 8)).toBe(0.5);
    expect(computeOtCompCreditedDays(8, 8)).toBe(1);
    expect(computeOtCompCreditedDays(12, 8)).toBe(1.5);
  });

  it('accrueOnApprovedOvertime skips when policy mode OFF (R-ATT-06-OFF-MID)', async () => {
    const policySvc = new AttOtCompLeavePolicyService({
      query: jest.fn().mockImplementation((sql: string) => {
        const s = String(sql);
        if (s.includes('att_ot_comp_leave_policy')) {
          return Promise.resolve({
            rows: [
              {
                id: 'p1',
                company_id: 'holding',
                mode_enabled: false,
                hours_per_leave_day: 8,
                comp_balance_key: 'compensatory',
                maps_comp_codes: null,
                status: 'active',
                effective_from: null,
                archived_at: null,
                created_at: '',
                updated_at: '',
              },
            ],
          });
        }
        return Promise.resolve({ rows: [] });
      }),
      withTransaction: jest.fn(),
    } as never);
    await policySvc.ensureSchema();
    const out = await policySvc.accrueOnApprovedOvertime({
      id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      company_id: 'holding',
      employee_id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      status: 'approved',
      total_hours: 8,
      compensation_type: 'compensatory_leave',
    });
    expect(out).toBeNull();
  });

  it('accrueOnApprovedOvertime idempotent replay on existing credited ledger', async () => {
    const ledgerId = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
    const queryMock = jest.fn().mockImplementation((sql: string) => {
      const s = String(sql);
      if (s.includes('att_ot_comp_leave_policy')) {
        return Promise.resolve({
          rows: [
            {
              id: 'p1',
              company_id: 'holding',
              mode_enabled: true,
              hours_per_leave_day: 8,
              comp_balance_key: 'compensatory',
              maps_comp_codes: null,
              status: 'active',
              effective_from: null,
              archived_at: null,
              created_at: '',
              updated_at: '',
            },
          ],
        });
      }
      if (
        s.includes('att_ot_comp_accrual_ledger') &&
        s.includes('ledger_status')
      ) {
        return Promise.resolve({
          rows: [
            {
              id: ledgerId,
              company_id: 'holding',
              overtime_request_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
              employee_id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
              balance_year: 2026,
              compensation_type: 'compensatory_leave',
              ot_hours: 8,
              hours_per_leave_day: 8,
              credited_days: 1,
              ledger_status: 'credited',
              created_at: '',
            },
          ],
        });
      }
      return Promise.resolve({ rows: [] });
    });
    const policySvc = new AttOtCompLeavePolicyService({
      query: queryMock,
      withTransaction: jest.fn(),
    } as never);
    await policySvc.ensureSchema();
    const out = await policySvc.accrueOnApprovedOvertime({
      id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      company_id: 'holding',
      employee_id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      status: 'approved',
      total_hours: 8,
      compensation_type: 'compensatory_leave',
    });
    expect(out?.idempotent_replay).toBe(true);
    expect(out?.ledger_id).toBe(ledgerId);
    expect(out?.credited_days).toBe(1);
  });

  it('approveOvertimeRequest draft guard: rejected OT cannot approve (AC-ATT-06-DRAFT-GUARD)', async () => {
    const queryMock = jest.fn().mockImplementation((sql: string) => {
      const s = String(sql);
      if (s.includes('FROM public.overtime_requests')) {
        return Promise.resolve({
          rows: [
            {
              id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
              company_id: 'holding',
              employee_id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
              status: 'rejected',
              total_hours: 4,
              compensation_type: 'compensatory_leave',
              overtime_date: '2026-08-01',
            },
          ],
        });
      }
      if (s.includes('CREATE TABLE')) return Promise.resolve({ rows: [] });
      return Promise.resolve({ rows: [] });
    });
    const svc = new AttendanceRequestsService({ query: queryMock } as never);
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    await expect(
      svc.approveOvertimeRequest(
        'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        { reviewer_name: 'CEO' },
        'main',
        `Bearer ${token}`,
        'xevn',
      ),
    ).rejects.toMatchObject({ code: 'HRM-ATT-REQ-404' });
  });

  it('approveOvertimeRequest scope parity: credits use OT row company_id (holding)', async () => {
    const requestId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    const accrueMock = jest.fn().mockResolvedValue({
      credited_days: 1,
      balance_year: 2026,
      ledger_id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
      idempotent_replay: false,
    });
    const policySvc = {
      accrueOnApprovedOvertime: accrueMock,
      ensureSchema: jest.fn(),
    };
    const queryMock = jest
      .fn()
      .mockImplementation((sql: string, params?: unknown[]) => {
        const s = String(sql);
        if (
          s.includes('FROM public.overtime_requests') &&
          s.includes('SELECT id')
        ) {
          return Promise.resolve({
            rows: [
              {
                id: requestId,
                company_id: 'holding',
                employee_id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
                status: 'pending',
                total_hours: 8,
                compensation_type: 'compensatory_leave',
                overtime_date: '2026-08-01',
              },
            ],
          });
        }
        if (s.includes('SET status = $2') && s.includes('overtime_requests')) {
          return Promise.resolve({
            rows: [
              {
                id: requestId,
                company_id: 'holding',
                employee_id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
                status: 'approved',
                total_hours: 8,
                compensation_type: 'compensatory_leave',
                overtime_date: '2026-08-01',
              },
            ],
          });
        }
        if (s.includes('SELECT company_id FROM public.overtime_requests')) {
          return Promise.resolve({ rows: [{ company_id: 'holding' }] });
        }
        if (s.includes('CREATE TABLE')) return Promise.resolve({ rows: [] });
        return Promise.resolve({ rows: [] });
      });
    const svc = new AttendanceRequestsService(
      { query: queryMock } as never,
      undefined,
      undefined,
      undefined,
      policySvc as never,
    );
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const row = await svc.approveOvertimeRequest(
      requestId,
      { reviewer_name: 'CEO' },
      'main',
      `Bearer ${token}`,
      'xevn',
    );
    expect(row.status).toBe('approved');
    expect(accrueMock).toHaveBeenCalledWith(
      expect.objectContaining({ company_id: 'holding', status: 'approved' }),
    );
    expect(
      (row as { accrual?: { credited_days: number } }).accrual?.credited_days,
    ).toBe(1);
  });

  it('approveOvertimeRequest idempotent double-approve returns accrual replay', async () => {
    const requestId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    const accrueMock = jest.fn().mockResolvedValue({
      credited_days: 1,
      balance_year: 2026,
      ledger_id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
      idempotent_replay: true,
    });
    const queryMock = jest.fn().mockImplementation((sql: string) => {
      const s = String(sql);
      if (
        s.includes('FROM public.overtime_requests') &&
        s.includes('SELECT id')
      ) {
        return Promise.resolve({
          rows: [
            {
              id: requestId,
              company_id: 'holding',
              employee_id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
              status: 'approved',
              total_hours: 8,
              compensation_type: 'compensatory_leave',
              overtime_date: '2026-08-01',
            },
          ],
        });
      }
      if (s.includes('CREATE TABLE')) return Promise.resolve({ rows: [] });
      return Promise.resolve({ rows: [] });
    });
    const svc = new AttendanceRequestsService(
      { query: queryMock } as never,
      undefined,
      undefined,
      undefined,
      { accrueOnApprovedOvertime: accrueMock } as never,
    );
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const row = await svc.approveOvertimeRequest(
      requestId,
      { reviewer_name: 'CEO' },
      'main',
      `Bearer ${token}`,
      'xevn',
    );
    expect(
      (row as { accrual?: { idempotent_replay: boolean } }).accrual
        ?.idempotent_replay,
    ).toBe(true);
    const updateApprove = queryMock.mock.calls.find((c) =>
      String(c[0]).includes('SET status = $2'),
    );
    expect(updateApprove).toBeUndefined();
  });

  it('putPolicy rejects annual comp_balance_key merge (AC-ATT-06-≠-MERGE-BUCKETS)', async () => {
    const db = {
      query: jest.fn().mockResolvedValue({ rows: [] }),
      withTransaction: jest.fn(),
    };
    const svc = new AttOtCompLeavePolicyService(db as never);
    await svc.ensureSchema();
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'holding',
      roleCode: 'group_ceo',
    });
    await expect(
      svc.putPolicy(
        {
          mode_enabled: true,
          hours_per_leave_day: 8,
          comp_balance_key: 'annual',
        },
        `Bearer ${token}`,
        'xevn',
      ),
    ).rejects.toBeInstanceOf(ApiException);
    await expect(
      svc.putPolicy(
        {
          mode_enabled: true,
          hours_per_leave_day: 8,
          comp_balance_key: 'annual',
        },
        `Bearer ${token}`,
        'xevn',
      ),
    ).rejects.toMatchObject({
      code: 'HRM-ATT-OT-COMP-POLICY-RATIO',
      status: HttpStatus.BAD_REQUEST,
    });
  });
});
