import { createHmac } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import { HrmDbService } from '../db/hrm-db.service';
import { OperationsService } from './operations.service';

function createInternalJwt(payload: Record<string, unknown>) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const secret = process.env.SERVICE_JWT_SECRET ?? 'xevn-dev-jwt-secret';
  const sig = createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  return `Bearer ${header}.${body}.${sig}`;
}

describe('OperationsService', () => {
  let service: OperationsService;
  let db: jest.Mocked<HrmDbService>;

  beforeEach(() => {
    db = {
      query: jest.fn(),
      onModuleDestroy: jest.fn(),
    } as unknown as jest.Mocked<HrmDbService>;
    db.query.mockResolvedValue({ rows: [] } as never);
    service = new OperationsService(db, {
      onServiceRequestCreated: jest.fn().mockResolvedValue(undefined),
      onServiceRequestDecided: jest.fn().mockResolvedValue(undefined),
    } as never);
  });

  it('throws deterministic not found when updating missing task', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [] } as never)
      .mockResolvedValueOnce({ rows: [] } as never)
      .mockResolvedValueOnce({ rows: [] } as never);

    await expect(
      service.updateTaskStatus(
        '16f5e2c5-8fbb-4500-8c82-623950f7055e',
        { status: 'done' },
        '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      ),
    ).rejects.toMatchObject<ApiException>({ code: 'HRM-OPS-404' });
  });

  it('lists tasks with deterministic pagination envelope', async () => {
    db.query.mockImplementation((sql: string) => {
      if (sql.includes('SELECT COUNT(*)::text AS total FROM public.hrm_tasks')) {
        return Promise.resolve({ rows: [{ total: '1' }] } as never);
      }
      if (sql.includes('FROM public.hrm_tasks') && sql.includes('LIMIT')) {
        return Promise.resolve({
          rows: [
            {
              id: 't1',
              company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
              title: 'Verify onboarding checklist',
              description: 'Ops handover',
              priority: 'high',
              status: 'todo',
              due_date: '2026-04-30',
              created_at: '2026-04-23T00:00:00.000Z',
              updated_at: '2026-04-23T00:00:00.000Z',
            },
          ],
        } as never);
      }
      return Promise.resolve({ rows: [] } as never);
    });

    const result = await service.listTasks({
      company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      page: 2,
      page_size: 5,
    });

    expect(result.total).toBe(1);
    expect(result.page).toBe(2);
    expect(result.page_size).toBe(5);
    expect(result.data[0]).toMatchObject({ id: 't1', priority: 'high' });
    const listCall = db.query.mock.calls.find((c) => String(c[0]).includes('LIMIT'));
    expect(listCall?.[0]).toContain('company_id = $1::uuid');
    expect(listCall?.[1]).toEqual(['78b8a663-f5e5-4f4d-a020-b8f950ec2037', 5, 5]);
  });

  it('listTasks rolls up company_id=main via UUID IN (group CEO)', async () => {
    const captured: string[] = [];
    db.query.mockImplementation((sql: string) => {
      captured.push(sql);
      return Promise.resolve({ rows: [{ total: '0' }] } as never);
    });

    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });

    await service.listTasks({ company_id: 'main' }, token);

    const listSql = captured.find((s) => s.includes('FROM public.hrm_tasks') && s.includes('LIMIT')) ?? '';
    expect(listSql).toContain('company_id = ANY');
    expect(listSql).toContain('::uuid[]');
  });

  it('listServiceRequests rolls up company_id=main for internal key + tenant xevn', async () => {
    const captured: string[] = [];
    db.query.mockImplementation((sql: string) => {
      captured.push(sql);
      return Promise.resolve({ rows: [] } as never);
    });

    await service.listServiceRequests({ company_id: 'main' }, undefined, 'xevn');

    const sql = captured.find((s) => s.includes('FROM public.service_requests')) ?? '';
    expect(sql).toContain('company_id = ANY');
    expect(sql).toContain('::uuid[]');
  });

  it('createTask maps company_id=main to holding UUID for group CEO', async () => {
    db.query.mockResolvedValue({
      rows: [
        {
          id: 't-new',
          company_id: '10000000-0000-4000-8000-000000000001',
          title: 'Rollup task',
          description: null,
          priority: 'medium',
          status: 'todo',
          due_date: null,
          created_at: '2026-05-25T00:00:00.000Z',
          updated_at: '2026-05-25T00:00:00.000Z',
        },
      ],
    } as never);

    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });

    await service.createTask(
      { company_id: 'main', title: 'Rollup task', priority: 'medium' },
      token,
      'xevn',
    );

    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO public.hrm_tasks'),
      expect.arrayContaining(['10000000-0000-4000-8000-000000000001']),
    );
  });

  it('returns deterministic summary counts', async () => {
    db.query.mockImplementation((sql: string) => {
      if (sql.includes('FROM public.attendance_records')) {
        return Promise.resolve({ rows: [{ total: '10' }] } as never);
      }
      if (sql.includes('FROM public.payroll_periods')) {
        return Promise.resolve({ rows: [{ total: '2' }] } as never);
      }
      if (sql.includes('FROM public.job_requisitions')) {
        return Promise.resolve({ rows: [{ total: '3' }] } as never);
      }
      if (sql.includes('FROM public.hrm_tasks')) {
        return Promise.resolve({ rows: [{ total: '4' }] } as never);
      }
      if (sql.includes('FROM public.service_requests')) {
        return Promise.resolve({ rows: [{ total: '6' }] } as never);
      }
      return Promise.resolve({ rows: [] } as never);
    });

    const summary = await service.getSummary('78b8a663-f5e5-4f4d-a020-b8f950ec2037');
    expect(summary).toEqual({
      attendance_records: 10,
      payroll_periods: 2,
      job_requisitions: 3,
      tasks: 4,
      service_requests: 6,
    });
  });

  it('updateTaskStatus rejects task outside rollup UUID scope (P1-02)', async () => {
    db.query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM public.hrm_tasks WHERE id')) {
        return {
          rows: [{ company_id: '99999999-9999-4999-8999-999999999999' }],
        } as never;
      }
      return { rows: [] } as never;
    });

    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });

    await expect(
      service.updateTaskStatus(
        '16f5e2c5-8fbb-4500-8c82-623950f7055e',
        { status: 'done' },
        'main',
        token,
        'xevn',
      ),
    ).rejects.toMatchObject<ApiException>({ code: 'HRM-OPS-409' });
  });

  it('UC-HRM-20 rolls up company_id=main via slug-safe SQL (group CEO)', async () => {
    const captured: string[] = [];
    db.query.mockImplementation((sql: string) => {
      captured.push(sql);
      return Promise.resolve({ rows: [{ total: '0' }] } as never);
    });

    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });

    await service.getSummary('main', token, 'xevn');

    const payrollSql = captured.find((s) => s.includes('FROM public.payroll_periods')) ?? '';
    expect(payrollSql).toContain('company_id = ANY');
    expect(payrollSql).not.toContain('::uuid');
    const taskSql = captured.find((s) => s.includes('FROM public.hrm_tasks')) ?? '';
    expect(taskSql).toContain('company_id = ANY');
    expect(taskSql).toContain('::uuid[]');
  });
});
