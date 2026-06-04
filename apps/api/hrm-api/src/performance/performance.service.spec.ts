import { ApiException } from '../common/api.exception';
import { signServiceJwt } from '../common/jwt-sign';
import { HrmDbService } from '../db/hrm-db.service';
import { PerformanceService } from './performance.service';

describe('PerformanceService', () => {
  let service: PerformanceService;
  let db: jest.Mocked<HrmDbService>;

  beforeEach(() => {
    db = {
      query: jest.fn(),
      onModuleDestroy: jest.fn(),
    } as unknown as jest.Mocked<HrmDbService>;
    db.query.mockResolvedValue({ rows: [] } as never);
    service = new PerformanceService(db);
  });

  it('listCycles uses group rollup for group CEO with company_id=main', async () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    db.query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM public.performance_cycles')) {
        return {
          rows: [
            {
              id: 'cycle-1',
              company_id: 'holding',
              cycle_name: '2026 H1',
              start_date: '2026-01-01',
              end_date: '2026-06-30',
              status: 'active',
              created_by: 'hrbp-1',
              created_at: '2026-01-01T00:00:00.000Z',
              updated_at: '2026-01-01T00:00:00.000Z',
            },
          ],
        } as never;
      }
      return { rows: [] } as never;
    });

    const result = await service.listCycles({ company_id: 'main' }, `Bearer ${token}`);

    expect(result.total).toBe(1);
    expect(result.data[0].company_id).toBe('holding');
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('company_id = ANY'),
      expect.arrayContaining([expect.any(Array)]),
    );
  });

  it('listEvaluations uses group rollup for group CEO with company_id=main', async () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    db.query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM public.performance_evaluations')) {
        return {
          rows: [
            {
              id: 'eval-1',
              company_id: 'holding',
              employee_id: '11111111-1111-4111-8111-111111111111',
              cycle_id: 'cycle-1',
              score: 88,
              summary: 'Strong delivery',
              reviewer: 'mgr-1',
              created_at: '2026-01-01T00:00:00.000Z',
              updated_at: '2026-01-01T00:00:00.000Z',
            },
          ],
        } as never;
      }
      return { rows: [] } as never;
    });

    const result = await service.listEvaluations({ company_id: 'main' }, `Bearer ${token}`);

    expect(result.total).toBe(1);
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('company_id = ANY'),
      expect.arrayContaining([expect.any(Array)]),
    );
  });

  it('createEvaluation finds holding cycle when group CEO uses company_id=main', async () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const cycleId = '633e95b7-cf1b-469f-a0f8-4c91f3f35f80';
    db.query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM public.performance_cycles WHERE') && sql.includes('LIMIT 1')) {
        return { rows: [{ id: cycleId, company_id: 'holding' }] } as never;
      }
      if (sql.includes('INSERT INTO public.performance_evaluations')) {
        return {
          rows: [
            {
              id: 'eval-1',
              company_id: 'holding',
              employee_id: '11111111-1111-4111-8111-111111111111',
              cycle_id: cycleId,
              score: 90,
              summary: 'Excellent',
              reviewer: 'mgr-1',
              created_at: '2026-01-01T00:00:00.000Z',
              updated_at: '2026-01-01T00:00:00.000Z',
            },
          ],
        } as never;
      }
      return { rows: [] } as never;
    });

    const result = await service.createEvaluation(
      {
        company_id: 'main',
        employee_id: '11111111-1111-4111-8111-111111111111',
        cycle_id: cycleId,
        score: 90,
        summary: 'Excellent',
        reviewer: 'mgr-1',
      },
      `Bearer ${token}`,
    );

    expect(result.company_id).toBe('holding');
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('company_id = ANY'),
      expect.arrayContaining([cycleId, expect.any(Array)]),
    );
  });

  it('throws deterministic not-found when performance cycle missing', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [] } as never)
      .mockResolvedValueOnce({ rows: [] } as never)
      .mockResolvedValueOnce({ rows: [] } as never)
      .mockResolvedValueOnce({ rows: [] } as never);

    await expect(
      service.createEvaluation({
        company_id: 'holding',
        employee_id: '11111111-1111-4111-8111-111111111111',
        cycle_id: '633e95b7-cf1b-469f-a0f8-4c91f3f35f80',
        score: 90,
        summary: 'Excellent',
        reviewer: 'mgr-1',
      }),
    ).rejects.toMatchObject<ApiException>({ code: 'HRM-PERF-404' });
  });
});
