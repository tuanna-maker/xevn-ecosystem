import { ApiException } from '../common/api.exception';
import { HrmDbService } from '../db/hrm-db.service';
import { AttendanceService } from './attendance.service';

describe('AttendanceService', () => {
  let service: AttendanceService;
  let db: jest.Mocked<HrmDbService>;

  beforeEach(() => {
    db = {
      query: jest.fn(),
      onModuleDestroy: jest.fn(),
    } as unknown as jest.Mocked<HrmDbService>;
    db.query.mockResolvedValue({ rows: [] } as never);
    service = new AttendanceService(db);
  });

  it('throws deterministic create error when insert fails', async () => {
    db.query.mockImplementation((sql: string) => {
      if (sql.includes('INSERT INTO public.attendance_records')) {
        return Promise.reject(new Error('duplicate key') as never);
      }
      return Promise.resolve({ rows: [] } as never);
    });

    await expect(
      service.createRecord({
        company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
        employee_id: 'f76f23f7-3683-4120-81b7-5126ee997b8e',
        attendance_date: '2026-04-22',
      }),
    ).rejects.toMatchObject<ApiException>({ code: 'HRM-ATT-001' });
  });

  it('throws deterministic not found when updating missing record', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [] } as never)
      .mockResolvedValueOnce({ rows: [] } as never)
      .mockResolvedValueOnce({ rows: [] } as never)
      .mockResolvedValueOnce({ rows: [] } as never)
      .mockResolvedValueOnce({ rows: [] } as never);

    await expect(
      service.updateStatus('f76f23f7-3683-4120-81b7-5126ee997b8e', { status: 'present' }),
    ).rejects.toMatchObject<ApiException>({ code: 'HRM-ATT-404' });
  });

  it('returns paginated records with deterministic filters', async () => {
    db.query.mockImplementation((sql: string) => {
      if (sql.includes('SELECT COUNT(*)::text AS total FROM public.attendance_records')) {
        return Promise.resolve({ rows: [{ total: '1' }] } as never);
      }
      if (sql.includes('FROM public.attendance_records') && sql.includes('LIMIT')) {
        return Promise.resolve({
          rows: [
            {
              id: 'r1',
              company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
              employee_id: 'f76f23f7-3683-4120-81b7-5126ee997b8e',
              attendance_date: '2026-04-22',
              check_in_at: null,
              check_out_at: null,
              status: 'present',
              note: null,
              created_by: 'qa',
              created_at: '2026-04-22T00:00:00.000Z',
              updated_at: '2026-04-22T00:00:00.000Z',
            },
          ],
        } as never);
      }
      return Promise.resolve({ rows: [] } as never);
    });

    const result = await service.listRecords({
      company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      employee_id: 'f76f23f7-3683-4120-81b7-5126ee997b8e',
      status: 'present',
      from_date: '2026-04-01',
      to_date: '2026-04-30',
      page: 2,
      page_size: 10,
    });

    expect(result.total).toBe(1);
    expect(result.page).toBe(2);
    expect(result.page_size).toBe(10);
    expect(result.data[0]).toMatchObject({ id: 'r1', status: 'present' });
    expect(db.query).toHaveBeenLastCalledWith(expect.stringContaining('LIMIT $6 OFFSET $7'), expect.any(Array));
  });
});
