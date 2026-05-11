import { ApiException } from '../common/api.exception';
import { HrmDbService } from '../db/hrm-db.service';
import { OperationsService } from './operations.service';

describe('OperationsService', () => {
  let service: OperationsService;
  let db: jest.Mocked<HrmDbService>;

  beforeEach(() => {
    db = {
      query: jest.fn(),
      onModuleDestroy: jest.fn(),
    } as unknown as jest.Mocked<HrmDbService>;
    db.query.mockResolvedValue({ rows: [] } as never);
    service = new OperationsService(db);
  });

  it('throws deterministic not found when updating missing task', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [] } as never)
      .mockResolvedValueOnce({ rows: [] } as never);

    await expect(
      service.updateTaskStatus('16f5e2c5-8fbb-4500-8c82-623950f7055e', { status: 'done' }),
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
    expect(db.query).toHaveBeenLastCalledWith(expect.stringContaining('LIMIT $2 OFFSET $3'), [
      '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      5,
      5,
    ]);
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
});
