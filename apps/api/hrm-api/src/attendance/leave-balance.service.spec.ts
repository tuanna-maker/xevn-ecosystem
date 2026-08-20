import { ApiException } from '../common/api.exception';
import { signServiceJwt } from '../common/jwt-sign';
import { HrmDbService } from '../db/hrm-db.service';
import { LeaveBalanceService } from './leave-balance.service';

const EMPLOYEE_ID = '11111111-1111-4111-8111-111111111111';
const OTHER_EMPLOYEE_ID = '22222222-2222-4222-8222-222222222222';
const COMPANY_SLUG = 'holding';

describe('LeaveBalanceService', () => {
  let service: LeaveBalanceService;
  let db: jest.Mocked<HrmDbService>;

  beforeEach(() => {
    db = {
      query: jest.fn(),
      onModuleDestroy: jest.fn(),
    } as unknown as jest.Mocked<HrmDbService>;
    db.query.mockResolvedValue({ rows: [] } as never);
    service = new LeaveBalanceService(db);
  });

  function mockEmployeeLoad() {
    db.query.mockImplementation((sql: string) => {
      if (
        typeof sql === 'string' &&
        sql.includes(
          'CREATE TABLE IF NOT EXISTS public.employee_leave_balances',
        )
      ) {
        return Promise.resolve({ rows: [] } as never);
      }
      if (typeof sql === 'string' && sql.includes('FROM public.employees e')) {
        return Promise.resolve({
          rows: [
            {
              id: EMPLOYEE_ID,
              company_id: COMPANY_SLUG,
              custom_fields: {},
            },
          ],
        } as never);
      }
      return Promise.resolve({ rows: [] } as never);
    });
  }

  it('VAL-W7-LBAL-03: returns zeros with source default when no balance row', async () => {
    mockEmployeeLoad();
    const token = signServiceJwt({
      sub: 'uat.nv0001@xe.vn',
      tenantId: 'xevn',
      companyId: 'holding',
      employee_id: EMPLOYEE_ID,
      roles: ['employee'],
    });

    const result = await service.getLeaveBalance(
      {
        company_id: 'holding',
        employee_id: EMPLOYEE_ID,
        year: 2026,
      },
      `Bearer ${token}`,
      'xevn',
    );

    expect(result.source).toBe('default');
    expect(result.available_days).toBe(0);
    expect(result.used_days).toBe(0);
    expect(result.balance_year).toBe(2026);
    expect(result.leave_type).toBe('annual');
    expect(result.leave_type_label).toBe('Phép năm');
  });

  it('returns employee_leave_balances row with available_days = remaining', async () => {
    db.query.mockImplementation((sql: string) => {
      if (typeof sql === 'string' && sql.includes('employee_leave_balances')) {
        if (sql.includes('CREATE TABLE')) {
          return Promise.resolve({ rows: [] } as never);
        }
        return Promise.resolve({
          rows: [
            {
              id: 'bal-1',
              company_id: COMPANY_SLUG,
              employee_id: EMPLOYEE_ID,
              leave_type: 'annual',
              balance_year: 2026,
              entitled_days: '12',
              used_days: '3',
              pending_days: '1',
              updated_at: '2026-06-07T04:00:00.000Z',
            },
          ],
        } as never);
      }
      if (typeof sql === 'string' && sql.includes('FROM public.employees e')) {
        return Promise.resolve({
          rows: [
            { id: EMPLOYEE_ID, company_id: COMPANY_SLUG, custom_fields: {} },
          ],
        } as never);
      }
      return Promise.resolve({ rows: [] } as never);
    });

    const token = signServiceJwt({
      sub: 'uat.nv0001@xe.vn',
      tenantId: 'xevn',
      companyId: 'holding',
      employee_id: EMPLOYEE_ID,
      roles: ['employee'],
    });

    const result = await service.getLeaveBalance(
      {
        company_id: 'holding',
        employee_id: EMPLOYEE_ID,
        leave_type: 'annual',
        year: 2026,
      },
      `Bearer ${token}`,
      'xevn',
    );

    expect(result.source).toBe('employee_leave_balances');
    expect(result.entitled_days).toBe(12);
    expect(result.used_days).toBe(3);
    expect(result.pending_days).toBe(1);
    expect(result.advanced_days).toBe(0);
    expect(result.remaining_days).toBe(8);
    expect(result.available_days).toBe(8);
    expect(result.period).toBe(2026);
    expect(result.leave_type_label).toBe('Phép năm');
  });

  it('ATT-04b: advanced_days reduces available_days on ledger row', async () => {
    db.query.mockImplementation((sql: string) => {
      if (typeof sql === 'string' && sql.includes('employee_leave_balances')) {
        if (sql.includes('CREATE TABLE') || sql.includes('ALTER TABLE')) {
          return Promise.resolve({ rows: [] } as never);
        }
        return Promise.resolve({
          rows: [
            {
              id: 'bal-adv',
              company_id: COMPANY_SLUG,
              employee_id: EMPLOYEE_ID,
              leave_type: 'annual',
              balance_year: 2026,
              entitled_days: '12',
              used_days: '2',
              pending_days: '1',
              advanced_days: '3',
              updated_at: '2026-08-10T00:00:00.000Z',
            },
          ],
        } as never);
      }
      if (typeof sql === 'string' && sql.includes('FROM public.employees e')) {
        return Promise.resolve({
          rows: [
            { id: EMPLOYEE_ID, company_id: COMPANY_SLUG, custom_fields: {} },
          ],
        } as never);
      }
      return Promise.resolve({ rows: [] } as never);
    });

    const result = await service.getLeaveBalance(
      {
        company_id: 'holding',
        employee_id: EMPLOYEE_ID,
        leave_type: 'annual',
        year: 2026,
      },
      undefined,
      'xevn',
    );

    expect(result.advanced_days).toBe(3);
    expect(result.available_days).toBe(6);
  });

  it('VAL-W7-LBAL-02: rejects foreign employee_id for non-HR JWT', async () => {
    mockEmployeeLoad();
    const token = signServiceJwt({
      sub: 'uat.nv0001@xe.vn',
      tenantId: 'xevn',
      companyId: 'holding',
      employee_id: EMPLOYEE_ID,
      roles: ['employee'],
    });

    await expect(
      service.getLeaveBalance(
        {
          company_id: 'holding',
          employee_id: OTHER_EMPLOYEE_ID,
          year: 2026,
        },
        `Bearer ${token}`,
        'xevn',
      ),
    ).rejects.toMatchObject<ApiException>({ code: 'HRM-LEAVE-403' });
  });

  it('uses workforce scope filter for employee lookup on company_id=main', async () => {
    db.query.mockImplementation((sql: string) => {
      if (typeof sql === 'string' && sql.includes('CREATE TABLE')) {
        return Promise.resolve({ rows: [] } as never);
      }
      if (typeof sql === 'string' && sql.includes('FROM public.employees e')) {
        return Promise.resolve({
          rows: [
            { id: EMPLOYEE_ID, company_id: COMPANY_SLUG, custom_fields: {} },
          ],
        } as never);
      }
      return Promise.resolve({ rows: [] } as never);
    });

    await service.getLeaveBalance(
      {
        company_id: 'main',
        employee_id: EMPLOYEE_ID,
        year: 2026,
      },
      undefined,
      'xevn',
    );

    const employeeSql = db.query.mock.calls.find(
      ([sql]) =>
        typeof sql === 'string' && sql.includes('FROM public.employees e'),
    )?.[0] as string;
    expect(employeeSql).toContain('e.id IN');
  });

  it('PCOMP-W7-MOB-LEAVE-BAL: company_uuid query normalizes to holding slug workforce scope', async () => {
    const holdingUuid = '6efaa5d6-a4a8-4bfd-805a-3c4f003e4013';
    db.query.mockImplementation((sql: string) => {
      if (typeof sql === 'string' && sql.includes('CREATE TABLE')) {
        return Promise.resolve({ rows: [] } as never);
      }
      if (typeof sql === 'string' && sql.includes('FROM public.employees e')) {
        return Promise.resolve({
          rows: [
            { id: EMPLOYEE_ID, company_id: COMPANY_SLUG, custom_fields: {} },
          ],
        } as never);
      }
      if (
        typeof sql === 'string' &&
        sql.includes('FROM public.employee_leave_balances')
      ) {
        return Promise.resolve({
          rows: [
            {
              id: 'bal-uuid',
              company_id: COMPANY_SLUG,
              employee_id: EMPLOYEE_ID,
              leave_type: 'annual',
              balance_year: 2026,
              entitled_days: '12',
              used_days: '3',
              pending_days: '1',
              updated_at: '2026-06-07T04:00:00.000Z',
            },
          ],
        } as never);
      }
      return Promise.resolve({ rows: [] } as never);
    });

    const token = signServiceJwt({
      sub: 'uat.nv0001@xe.vn',
      tenantId: 'xevn',
      companyId: 'holding',
      company_uuid: holdingUuid,
      employee_id: EMPLOYEE_ID,
      roles: ['employee'],
    });

    const result = await service.getLeaveBalance(
      {
        company_id: holdingUuid,
        employee_id: EMPLOYEE_ID,
        leave_type: 'annual',
        year: 2026,
      },
      `Bearer ${token}`,
      'xevn',
    );

    const employeeSql = db.query.mock.calls.find(
      ([sql]) =>
        typeof sql === 'string' && sql.includes('FROM public.employees e'),
    )?.[0] as string;
    expect(employeeSql).toContain('e.id IN');
    expect(employeeSql).not.toMatch(/e\.company_id\s*=\s*\$\d+::uuid/);
    expect(result.source).toBe('employee_leave_balances');
    expect(result.available_days).toBe(8);
  });

  it('reads custom_fields leave_balance_annual interim fallback', async () => {
    db.query.mockImplementation((sql: string) => {
      if (typeof sql === 'string' && sql.includes('CREATE TABLE')) {
        return Promise.resolve({ rows: [] } as never);
      }
      if (typeof sql === 'string' && sql.includes('FROM public.employees e')) {
        return Promise.resolve({
          rows: [
            {
              id: EMPLOYEE_ID,
              company_id: COMPANY_SLUG,
              custom_fields: { leave_balance_annual: '10' },
            },
          ],
        } as never);
      }
      if (
        typeof sql === 'string' &&
        sql.includes('FROM public.employee_leave_balances')
      ) {
        return Promise.resolve({ rows: [] } as never);
      }
      return Promise.resolve({ rows: [] } as never);
    });

    const result = await service.getLeaveBalance(
      {
        company_id: 'holding',
        employee_id: EMPLOYEE_ID,
        year: 2026,
      },
      undefined,
      'xevn',
    );

    expect(result.source).toBe('custom_fields');
    expect(result.entitled_days).toBe(10);
    expect(result.available_days).toBe(10);
  });

  it('ATT-05b: panel returns 5 MVP types; missing rows → default 0 (empty hợp lệ)', async () => {
    db.query.mockImplementation((sql: string) => {
      if (typeof sql === 'string' && sql.includes('CREATE TABLE')) {
        return Promise.resolve({ rows: [] } as never);
      }
      if (typeof sql === 'string' && sql.includes('FROM public.employees e')) {
        return Promise.resolve({
          rows: [
            { id: EMPLOYEE_ID, company_id: COMPANY_SLUG, custom_fields: {} },
          ],
        } as never);
      }
      if (
        typeof sql === 'string' &&
        sql.includes('FROM public.employee_leave_balances')
      ) {
        return Promise.resolve({
          rows: [
            {
              id: 'bal-a',
              company_id: COMPANY_SLUG,
              employee_id: EMPLOYEE_ID,
              leave_type: 'annual',
              balance_year: 2026,
              entitled_days: '12',
              used_days: '2',
              pending_days: '1',
              updated_at: '2026-08-05T02:00:00.000Z',
            },
            {
              id: 'bal-c',
              company_id: COMPANY_SLUG,
              employee_id: EMPLOYEE_ID,
              leave_type: 'compensatory',
              balance_year: 2026,
              entitled_days: '3',
              used_days: '0',
              pending_days: '0',
              updated_at: '2026-08-05T02:00:00.000Z',
            },
          ],
        } as never);
      }
      return Promise.resolve({ rows: [] } as never);
    });

    const token = signServiceJwt({
      sub: 'uat.nv0001@xe.vn',
      tenantId: 'xevn',
      companyId: 'holding',
      employee_id: EMPLOYEE_ID,
      roles: ['employee'],
    });

    const panel = await service.getLeaveBalancePanel(
      { company_id: 'holding', employee_id: EMPLOYEE_ID, year: 2026 },
      `Bearer ${token}`,
      'xevn',
    );

    expect(panel.items).toHaveLength(5);
    expect(panel.items.map((i) => i.leave_type)).toEqual([
      'annual',
      'seniority',
      'compensatory',
      'carry_over',
      'advance',
    ]);
    const annual = panel.items.find((i) => i.leave_type === 'annual');
    expect(annual?.available_days).toBe(9);
    expect(annual?.leave_type_label).toBe('Phép năm');
    const seniority = panel.items.find((i) => i.leave_type === 'seniority');
    expect(seniority?.source).toBe('default');
    expect(seniority?.available_days).toBe(0);
    expect(seniority?.leave_type_label).toBe('Phép thâm niên');
    expect(
      panel.items.find((i) => i.leave_type === 'carry_over')?.leave_type_label,
    ).toBe('Phép chuyển kỳ');
    expect(
      panel.items.find((i) => i.leave_type === 'advance')?.leave_type_label,
    ).toBe('Ứng phép');
  });

  it('ATT-05b: panel rejects foreign employee for non-HR JWT (scope parity)', async () => {
    mockEmployeeLoad();
    const token = signServiceJwt({
      sub: 'uat.nv0001@xe.vn',
      tenantId: 'xevn',
      companyId: 'holding',
      employee_id: EMPLOYEE_ID,
      roles: ['employee'],
    });

    await expect(
      service.getLeaveBalancePanel(
        { company_id: 'holding', employee_id: OTHER_EMPLOYEE_ID, year: 2026 },
        `Bearer ${token}`,
        'xevn',
      ),
    ).rejects.toMatchObject<ApiException>({ code: 'HRM-LEAVE-403' });
  });

  describe('PO-HRM-MVP-GD1-ATT-09-CLUSTER-BE-02 upsertTrackedEntitlement', () => {
    it('HR upserts employee_leave_balances row with entitled≥N (U65 product path)', async () => {
      mockEmployeeLoad();
      db.query.mockImplementation((sql: string, params?: unknown[]) => {
        if (typeof sql === 'string' && sql.includes('CREATE TABLE')) {
          return Promise.resolve({ rows: [] } as never);
        }
        if (
          typeof sql === 'string' &&
          sql.includes('FROM public.employees e')
        ) {
          return Promise.resolve({
            rows: [
              { id: EMPLOYEE_ID, company_id: COMPANY_SLUG, custom_fields: {} },
            ],
          } as never);
        }
        if (
          typeof sql === 'string' &&
          sql.includes('FROM public.employee_leave_balances') &&
          sql.includes('LIMIT 1')
        ) {
          return Promise.resolve({ rows: [] } as never);
        }
        if (
          typeof sql === 'string' &&
          sql.includes('INSERT INTO public.employee_leave_balances')
        ) {
          return Promise.resolve({
            rows: [
              {
                id: 'bal-1',
                company_id: COMPANY_SLUG,
                employee_id: EMPLOYEE_ID,
                leave_type: 'annual',
                balance_year: 2026,
                entitled_days: '12',
                used_days: '0',
                pending_days: '0',
                updated_at: '2026-08-09T00:00:00.000Z',
              },
            ],
          } as never);
        }
        return Promise.resolve({ rows: [] } as never);
      });

      const token = signServiceJwt({
        sub: 'ceo@xe.vn',
        tenantId: 'xevn',
        companyId: 'main',
        roleCode: 'group_ceo',
      });

      const result = await service.upsertTrackedEntitlement(
        {
          company_id: 'main',
          employee_id: EMPLOYEE_ID,
          leave_type: 'annual',
          balance_year: 2026,
          entitled_days: 12,
        },
        `Bearer ${token}`,
        'xevn',
      );

      expect(result.source).toBe('employee_leave_balances');
      expect(result.entitled_days).toBe(12);
      expect(result.available_days).toBe(12);
      const insert = db.query.mock.calls.find((c) =>
        String(c[0]).includes('INSERT INTO public.employee_leave_balances'),
      );
      expect(insert).toBeDefined();
    });

    it('rejects entitled below used+pending with HRM-LEAVE-BAL-409', async () => {
      mockEmployeeLoad();
      db.query.mockImplementation((sql: string) => {
        if (typeof sql === 'string' && sql.includes('CREATE TABLE')) {
          return Promise.resolve({ rows: [] } as never);
        }
        if (
          typeof sql === 'string' &&
          sql.includes('FROM public.employees e')
        ) {
          return Promise.resolve({
            rows: [
              { id: EMPLOYEE_ID, company_id: COMPANY_SLUG, custom_fields: {} },
            ],
          } as never);
        }
        if (
          typeof sql === 'string' &&
          sql.includes('FROM public.employee_leave_balances')
        ) {
          return Promise.resolve({
            rows: [
              {
                id: 'bal-1',
                company_id: COMPANY_SLUG,
                employee_id: EMPLOYEE_ID,
                leave_type: 'annual',
                balance_year: 2026,
                entitled_days: '10',
                used_days: '3',
                pending_days: '2',
                updated_at: '2026-08-09T00:00:00.000Z',
              },
            ],
          } as never);
        }
        return Promise.resolve({ rows: [] } as never);
      });

      const token = signServiceJwt({
        sub: 'ceo@xe.vn',
        tenantId: 'xevn',
        companyId: 'main',
        roleCode: 'group_ceo',
      });

      await expect(
        service.upsertTrackedEntitlement(
          {
            company_id: 'main',
            employee_id: EMPLOYEE_ID,
            entitled_days: 4,
          },
          `Bearer ${token}`,
          'xevn',
        ),
      ).rejects.toMatchObject<ApiException>({ code: 'HRM-LEAVE-BAL-409' });
    });
  });

  it('ATT-06 BE-02: compensatory entitled from holding row when employee.company_id is pilot UUID', async () => {
    const HOLDING_UUID = '10000000-0000-4000-8000-000000000001';
    db.query.mockImplementation((sql: string, params?: unknown[]) => {
      if (
        typeof sql === 'string' &&
        sql.includes(
          'CREATE TABLE IF NOT EXISTS public.employee_leave_balances',
        )
      ) {
        return Promise.resolve({ rows: [] } as never);
      }
      if (typeof sql === 'string' && sql.includes('FROM public.employees e')) {
        return Promise.resolve({
          rows: [
            { id: EMPLOYEE_ID, company_id: HOLDING_UUID, custom_fields: {} },
          ],
        } as never);
      }
      if (
        typeof sql === 'string' &&
        sql.includes('FROM public.employee_leave_balances')
      ) {
        const keys = params?.[0] as string[];
        expect(keys).toEqual(expect.arrayContaining(['holding', HOLDING_UUID]));
        return Promise.resolve({
          rows: [
            {
              id: 'bal-comp',
              company_id: 'holding',
              employee_id: EMPLOYEE_ID,
              leave_type: 'compensatory',
              balance_year: 2026,
              entitled_days: '0.5',
              used_days: '0',
              pending_days: '0',
              advanced_days: '0',
              updated_at: '2026-08-10T00:00:00.000Z',
            },
          ],
        } as never);
      }
      return Promise.resolve({ rows: [] } as never);
    });

    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });

    const result = await service.getLeaveBalance(
      {
        company_id: 'main',
        employee_id: EMPLOYEE_ID,
        leave_type: 'compensatory',
        year: 2026,
      },
      `Bearer ${token}`,
      'xevn',
    );

    expect(result.entitled_days).toBe(0.5);
    expect(result.source).toBe('employee_leave_balances');
  });
});
