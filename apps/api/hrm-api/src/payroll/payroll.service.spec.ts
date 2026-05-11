import { ApiException } from '../common/api.exception';
import { HrmDbService } from '../db/hrm-db.service';
import { PayrollService } from './payroll.service';

describe('PayrollService', () => {
  let service: PayrollService;
  let db: jest.Mocked<HrmDbService>;

  beforeEach(() => {
    db = {
      query: jest.fn(),
      onModuleDestroy: jest.fn(),
    } as unknown as jest.Mocked<HrmDbService>;
    db.query.mockResolvedValue({ rows: [] } as never);
    service = new PayrollService(db);
  });

  it('throws deterministic overlap error when period overlaps', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [] } as never)
      .mockResolvedValueOnce({ rows: [] } as never)
      .mockResolvedValueOnce({ rows: [{ id: 'existing' }] } as never);

    await expect(
      service.createPayrollPeriod({
        company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
        period_label: '2026-04',
        start_date: '2026-04-01',
        end_date: '2026-04-30',
      }),
    ).rejects.toMatchObject<ApiException>({ code: 'HRM-PAY-002' });
  });

  it('throws deterministic process error when not found', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [] } as never)
      .mockResolvedValueOnce({ rows: [] } as never)
      .mockResolvedValueOnce({ rows: [] } as never);

    await expect(service.processPayrollPeriod('f76f23f7-3683-4120-81b7-5126ee997b8e')).rejects.toMatchObject<
      ApiException
    >({ code: 'HRM-PAY-404' });
  });

  it('throws deterministic close transition error when period is not processing', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [] } as never)
      .mockResolvedValueOnce({ rows: [] } as never)
      .mockResolvedValueOnce({ rows: [{ id: 'p1', status: 'draft' }] } as never);

    await expect(service.closePayrollPeriod('f76f23f7-3683-4120-81b7-5126ee997b8e')).rejects.toMatchObject<
      ApiException
    >({ code: 'HRM-PAY-004' });
  });

  it('lists payroll periods with status filter', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [] } as never)
      .mockResolvedValueOnce({ rows: [] } as never)
      .mockResolvedValueOnce({
        rows: [
          {
            id: 'p1',
            company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
            period_label: '2026-04',
            start_date: '2026-04-01',
            end_date: '2026-04-30',
            status: 'processing',
            created_by: 'qa',
            processed_at: '2026-04-30T10:00:00.000Z',
            closed_at: null,
            created_at: '2026-04-01T00:00:00.000Z',
            updated_at: '2026-04-30T10:00:00.000Z',
          },
        ],
      } as never);

    const result = await service.listPayrollPeriods({
      company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      status: 'processing',
    });

    expect(result.total).toBe(1);
    expect(result.data[0]).toMatchObject({ id: 'p1', status: 'processing' });
    expect(db.query).toHaveBeenLastCalledWith(expect.stringContaining('status = $2'), [
      '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      'processing',
    ]);
  });
});
