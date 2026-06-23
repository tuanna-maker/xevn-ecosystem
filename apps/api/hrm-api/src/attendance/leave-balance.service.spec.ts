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
      if (typeof sql === 'string' && sql.includes('CREATE TABLE IF NOT EXISTS public.employee_leave_balances')) {
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
          rows: [{ id: EMPLOYEE_ID, company_id: COMPANY_SLUG, custom_fields: {} }],
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
    expect(result.remaining_days).toBe(8);
    expect(result.available_days).toBe(8);
    expect(result.period).toBe(2026);
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
          rows: [{ id: EMPLOYEE_ID, company_id: COMPANY_SLUG, custom_fields: {} }],
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
      ([sql]) => typeof sql === 'string' && sql.includes('FROM public.employees e'),
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
          rows: [{ id: EMPLOYEE_ID, company_id: COMPANY_SLUG, custom_fields: {} }],
        } as never);
      }
      if (typeof sql === 'string' && sql.includes('FROM public.employee_leave_balances')) {
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
      ([sql]) => typeof sql === 'string' && sql.includes('FROM public.employees e'),
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
      if (typeof sql === 'string' && sql.includes('FROM public.employee_leave_balances')) {
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
});
