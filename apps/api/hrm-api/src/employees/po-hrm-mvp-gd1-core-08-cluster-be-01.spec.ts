/**
 * PO-HRM-MVP-GD1-CORE-08-CLUSTER-BE-01 — F-CORE-RD-01 UPGRADE
 * UC-BP-CORE-08 · API-01 · DATA §4–§5 · U19 · U65 no seed
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ApiException } from '../common/api.exception';
import { signServiceJwt } from '../common/jwt-sign';
import { HrmDbService } from '../db/hrm-db.service';
import { EmployeesService } from './employees.service';
import {
  EmployeeRewardDisciplineService,
  HRM_CORE_RD_DUAL_PERIOD_409,
  HRM_CORE_RD_EMP_INACTIVE_409,
  HRM_CORE_RD_ENFORCE_409,
  HRM_CORE_RD_LOCKED_PERIOD_409,
  HRM_CORE_RD_PERIOD_404,
  HRM_CORE_RD_VAL_400,
} from './employee-reward-discipline.service';

function groupCeoAuth(): string {
  return `Bearer ${signServiceJwt({
    sub: 'ceo@xe.vn',
    tenantId: 'xevn',
    companyId: 'main',
    roleCode: 'group_ceo',
  })}`;
}

describe('PO-HRM-MVP-GD1-CORE-08-CLUSTER-BE-01', () => {
  const employeeId = '16f5e2c5-8fbb-4500-8c82-623950f7055e';
  const rewardId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  const periodOpenId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
  const periodOpen2Id = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
  const periodLockedId = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
  const query = { company_id: 'main' };

  let service: EmployeeRewardDisciplineService;
  let db: jest.Mocked<HrmDbService>;
  let employees: { getEmployeeById: jest.Mock };
  let lastInserted: Record<string, unknown> | null = null;
  let caseRow: Record<string, unknown>;

  beforeEach(() => {
    lastInserted = null;
    caseRow = {
      id: rewardId,
      employee_id: employeeId,
      company_id: 'holding',
      reward_date: '2026-08-01',
      reward_type: 'bonus',
      title: 'Thưởng quý',
      amount: 1000000,
      status: 'pending',
      payroll_link_status: 'pending_period',
      payroll_period_id: periodOpenId,
      payroll_period_ref: '2026-08',
      description: null,
      decision_number: null,
      issued_by: null,
      notes: null,
      payslip_id: null,
      archived_at: null,
      enforced_at: null,
      enforced_by: null,
      cancelled_at: null,
      cancelled_by: null,
      link_updated_at: null,
      created_at: '2026-08-09T00:00:00.000Z',
      updated_at: '2026-08-09T00:00:00.000Z',
    };

    db = {
      query: jest.fn(),
      onModuleDestroy: jest.fn(),
    } as unknown as jest.Mocked<HrmDbService>;

    employees = {
      getEmployeeById: jest.fn().mockResolvedValue({
        id: employeeId,
        company_id: 'holding',
        status: 'active',
      }),
    };

    db.query.mockImplementation(async (sql: string, params?: unknown[]) => {
      const s = String(sql);
      if (
        s.includes('CREATE TABLE') ||
        s.includes('CREATE INDEX') ||
        s.includes('ALTER TABLE') ||
        s.includes('DO $$')
      ) {
        return { rows: [] } as never;
      }
      if (s.includes('FROM public.payroll_periods')) {
        const id = String(params?.[0] ?? '');
        if (id === periodOpenId) {
          return {
            rows: [
              {
                id: periodOpenId,
                company_id: 'holding',
                status: 'draft',
                period_label: '2026-08',
              },
            ],
          } as never;
        }
        if (id === periodOpen2Id) {
          return {
            rows: [
              {
                id: periodOpen2Id,
                company_id: 'holding',
                status: 'open',
                period_label: '2026-09',
              },
            ],
          } as never;
        }
        if (id === periodLockedId) {
          return {
            rows: [
              {
                id: periodLockedId,
                company_id: 'holding',
                status: 'closed',
                period_label: '2026-07',
              },
            ],
          } as never;
        }
        return { rows: [] } as never;
      }
      if (s.includes('INSERT INTO public.employee_rewards')) {
        lastInserted = {
          id: String(params?.[0]),
          employee_id: employeeId,
          company_id: 'holding',
          reward_date: params?.[3],
          reward_type: params?.[4],
          title: params?.[5],
          amount: params?.[6],
          status: params?.[7],
          payroll_link_status: params?.[8],
          payroll_period_id: params?.[9],
          payroll_period_ref: params?.[10],
          description: params?.[11] ?? null,
          decision_number: params?.[12] ?? null,
          issued_by: params?.[13] ?? null,
          notes: params?.[14] ?? null,
          archived_at: null,
          created_at: '2026-08-09T00:00:00.000Z',
          updated_at: '2026-08-09T00:00:00.000Z',
        };
        return { rows: [lastInserted] } as never;
      }
      if (s.includes('INSERT INTO public.employee_discipline')) {
        return {
          rows: [
            {
              id: String(params?.[0]),
              employee_id: employeeId,
              company_id: 'holding',
              discipline_date: params?.[3],
              discipline_type: params?.[4],
              title: params?.[5],
              penalty_amount: params?.[6],
              status: params?.[7],
              payroll_link_status: params?.[8],
              payroll_period_id: params?.[9],
              payroll_period_ref: params?.[10],
              archived_at: null,
              created_at: '2026-08-09T00:00:00.000Z',
              updated_at: '2026-08-09T00:00:00.000Z',
            },
          ],
        } as never;
      }
      if (
        s.includes('FROM public.employee_rewards') &&
        s.includes('SELECT *') &&
        s.includes('LIMIT 1')
      ) {
        return { rows: [{ ...caseRow }] } as never;
      }
      if (
        s.includes('FROM public.employee_rewards') &&
        s.includes('ORDER BY updated_at DESC')
      ) {
        return { rows: [{ ...caseRow }] } as never;
      }
      if (
        s.includes('UPDATE public.employee_rewards') &&
        s.includes('status = $3')
      ) {
        caseRow = {
          ...caseRow,
          status: params?.[2],
          payroll_link_status: params?.[3],
          payroll_period_id: params?.[4],
          payroll_period_ref: params?.[5],
          enforced_at: '2026-08-09T01:00:00.000Z',
          enforced_by: params?.[6],
        };
        return { rows: [{ ...caseRow }] } as never;
      }
      if (
        s.includes('UPDATE public.employee_rewards') &&
        s.includes("status = 'cancelled'")
      ) {
        caseRow = {
          ...caseRow,
          status: 'cancelled',
          payroll_link_status: 'none',
          cancelled_at: '2026-08-09T02:00:00.000Z',
          cancelled_by: params?.[2],
        };
        return { rows: [{ ...caseRow }] } as never;
      }
      if (
        s.includes('UPDATE public.employee_rewards') &&
        s.includes('archived_at = NOW()')
      ) {
        return { rows: [{ id: rewardId }] } as never;
      }
      if (s.includes('UPDATE public.employee_rewards')) {
        return {
          rows: [{ ...caseRow, updated_at: '2026-08-09T03:00:00.000Z' }],
        } as never;
      }
      return { rows: [] } as never;
    });

    service = new EmployeeRewardDisciplineService(
      db,
      employees as unknown as EmployeesService,
    );
  });

  it('ensureSchema ADD payroll_link cols on BOTH dual tables', async () => {
    await service.ensureSchema();
    const sqls = db.query.mock.calls.map((c) => String(c[0]));
    expect(
      sqls.some(
        (s) =>
          s.includes('employee_rewards') && s.includes('payroll_link_status'),
      ),
    ).toBe(true);
    expect(
      sqls.some(
        (s) =>
          s.includes('employee_discipline') &&
          s.includes('payroll_link_status'),
      ),
    ).toBe(true);
    expect(sqls.some((s) => s.includes('payroll_period_id'))).toBe(true);
    expect(sqls.some((s) => s.includes('archived_at'))).toBe(true);
    expect(
      sqls.some(
        (s) =>
          s.includes('CREATE TABLE') && s.includes('hrm_reward_discipline'),
      ),
    ).toBe(false);
  });

  it('create money without period → HRM-CORE-RD-VAL-400', async () => {
    await expect(
      service.createReward(
        employeeId,
        query,
        {
          title: 'Bonus',
          reward_type: 'bonus',
          reward_date: '2026-08-01',
          amount: 500000,
        },
        groupCeoAuth(),
      ),
    ).rejects.toMatchObject({ code: HRM_CORE_RD_VAL_400 });
  });

  it('create note-only → pending + payroll_link_status=none', async () => {
    const row = await service.createReward(
      employeeId,
      query,
      {
        title: 'Ghi nhận',
        reward_type: 'note',
        reward_date: '2026-08-01',
        amount: 0,
      },
      groupCeoAuth(),
    );
    expect(row.status).toBe('pending');
    expect(row.payroll_link_status).toBe('none');
    expect(row.status_label).toBe('Chờ');
    expect(lastInserted?.payroll_period_id).toBeNull();
  });

  it('create amount>0 + open period → pending_period display-ready', async () => {
    const row = await service.createReward(
      employeeId,
      query,
      {
        title: 'Thưởng quý',
        reward_type: 'bonus',
        reward_date: '2026-08-01',
        amount: 1000000,
        payroll_period_id: periodOpenId,
      },
      groupCeoAuth(),
    );
    expect(row.status).toBe('pending');
    expect(row.payroll_link_status).toBe('pending_period');
    expect(row.payroll_period_id).toBe(periodOpenId);
    expect(row.amount_display).toBeTruthy();
    expect(String(row.amount_display)).toMatch(/1/);
  });

  it('enforce → in_force + linked (U19 get parity)', async () => {
    const enforced = await service.enforceReward(
      rewardId,
      employeeId,
      query,
      {},
      groupCeoAuth(),
    );
    expect(enforced.status).toBe('in_force');
    expect(enforced.payroll_link_status).toBe('linked');
    expect(enforced.status_label).toBe('Đang thi hành');

    const got = await service.getReward(
      rewardId,
      employeeId,
      query,
      groupCeoAuth(),
    );
    expect(got.id).toBe(rewardId);
    expect(got.payroll_link_status).toBe('linked');

    const listed = await service.listRewards(employeeId, query, groupCeoAuth());
    expect(listed.data.some((r) => r.id === rewardId)).toBe(true);
  });

  it('enforce amount>0 missing period → HRM-CORE-RD-ENFORCE-409', async () => {
    caseRow.payroll_period_id = null;
    caseRow.payroll_link_status = 'none';
    await expect(
      service.enforceReward(rewardId, employeeId, query, {}, groupCeoAuth()),
    ).rejects.toMatchObject({
      code: HRM_CORE_RD_ENFORCE_409,
    });
  });

  it('enforce locked period → HRM-CORE-RD-LOCKED-PERIOD-409', async () => {
    caseRow.payroll_period_id = periodLockedId;
    await expect(
      service.enforceReward(rewardId, employeeId, query, {}, groupCeoAuth()),
    ).rejects.toMatchObject({
      code: HRM_CORE_RD_LOCKED_PERIOD_409,
    });
  });

  it('dual open period reassign → HRM-CORE-RD-DUAL-PERIOD-409', async () => {
    await expect(
      service.enforceReward(
        rewardId,
        employeeId,
        query,
        { payroll_period_id: periodOpen2Id },
        groupCeoAuth(),
      ),
    ).rejects.toMatchObject({ code: HRM_CORE_RD_DUAL_PERIOD_409 });
  });

  it('cancel-enforce unlocked → cancelled + none', async () => {
    caseRow.status = 'in_force';
    caseRow.payroll_link_status = 'linked';
    const cancelled = await service.cancelEnforceReward(
      rewardId,
      employeeId,
      query,
      groupCeoAuth(),
    );
    expect(cancelled.status).toBe('cancelled');
    expect(cancelled.payroll_link_status).toBe('none');
    expect(cancelled.status_label).toBe('Hủy');
  });

  it('cancel on locked period → HRM-CORE-RD-LOCKED-PERIOD-409', async () => {
    caseRow.payroll_period_id = periodLockedId;
    caseRow.payroll_link_status = 'linked';
    await expect(
      service.cancelEnforceReward(rewardId, employeeId, query, groupCeoAuth()),
    ).rejects.toMatchObject({ code: HRM_CORE_RD_LOCKED_PERIOD_409 });
  });

  it('inactive employee create → HRM-CORE-RD-EMP-INACTIVE-409', async () => {
    employees.getEmployeeById.mockResolvedValueOnce({
      id: employeeId,
      company_id: 'holding',
      status: 'inactive',
    });
    await expect(
      service.createReward(
        employeeId,
        query,
        {
          title: 'X',
          reward_type: 'bonus',
          reward_date: '2026-08-01',
          amount: 0,
        },
        groupCeoAuth(),
      ),
    ).rejects.toMatchObject({ code: HRM_CORE_RD_EMP_INACTIVE_409 });
  });

  it('unknown period → HRM-CORE-RD-PERIOD-404', async () => {
    await expect(
      service.createReward(
        employeeId,
        query,
        {
          title: 'Bonus',
          reward_type: 'bonus',
          reward_date: '2026-08-01',
          amount: 1000,
          payroll_period_id: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
        },
        groupCeoAuth(),
      ),
    ).rejects.toMatchObject({ code: HRM_CORE_RD_PERIOD_404 });
  });

  it('PATCH status=in_force uses same enforce gates (ALT-04)', async () => {
    const updated = await service.updateReward(
      rewardId,
      employeeId,
      query,
      { status: 'in_force' },
      groupCeoAuth(),
    );
    expect(updated.status).toBe('in_force');
    expect(updated.payroll_link_status).toBe('linked');
  });

  it('soft archive delete preferred', async () => {
    const res = await service.deleteReward(
      rewardId,
      employeeId,
      query,
      groupCeoAuth(),
    );
    expect(res).toEqual({ id: rewardId, archived: true });
    const sqls = db.query.mock.calls.map((c) => String(c[0]));
    expect(sqls.some((s) => s.includes('archived_at = NOW()'))).toBe(true);
  });

  it('DENY Nest /core RD dual invent · DENY pay_reward_link mandatory · DENY payslip_line CORE', () => {
    const src = readFileSync(
      join(__dirname, 'employee-reward-discipline.service.ts'),
      'utf8',
    );
    const ctrl = readFileSync(
      join(__dirname, 'employees.controller.ts'),
      'utf8',
    );
    expect(src).not.toMatch(/INSERT\s+INTO\s+.*pay_reward_link/i);
    expect(src).not.toMatch(/INSERT\s+INTO\s+.*payslip_line/i);
    expect(src).not.toMatch(
      /CREATE\s+TABLE\s+IF\s+NOT\s+EXISTS\s+public\.hrm_reward_discipline/i,
    );
    expect(ctrl).not.toMatch(/@Controller\(['"]core['"]\)/);
    expect(ctrl).toMatch(/rewards\/:rewardId\/enforce/);
    expect(ctrl).toMatch(/discipline\/:disciplineId\/cancel-enforce/);
  });

  it('ApiException codes are mintable', () => {
    const ex = new ApiException(HRM_CORE_RD_VAL_400, 'x', 400);
    expect(ex.code).toBe(HRM_CORE_RD_VAL_400);
  });
});
