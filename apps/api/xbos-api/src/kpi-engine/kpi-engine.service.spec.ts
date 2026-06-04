import { HttpStatus } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { KpiEngineService } from './kpi-engine.service';

describe('KpiEngineService', () => {
  const dbMock = { query: jest.fn() };
  let service: KpiEngineService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new KpiEngineService(dbMock as never);
  });

  describe('evaluate (UC-XBOS-KPI-01)', () => {
    it('returns excellent band when actual meets target', () => {
      const result = service.evaluate({ target: 100, actual: 95 });
      expect(result.band).toBe('excellent');
      expect(result.score).toBeGreaterThan(0);
    });

    it('returns critical band below critical threshold', () => {
      const result = service.evaluate({ target: 100, actual: 50, criticalThreshold: 60 });
      expect(result.band).toBe('critical');
      expect(result.penaltyAmount).toBeGreaterThan(0);
    });

    it('rejects missing numeric target with XBOS-VAL-003', () => {
      try {
        service.evaluate({ target: NaN, actual: 10 });
        fail('expected validation error');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiException);
        expect((error as ApiException).code).toBe('XBOS-VAL-003');
        expect((error as ApiException).getStatus()).toBe(HttpStatus.BAD_REQUEST);
      }
    });
  });

  describe('evaluateBatch (UC-XBOS-KPI-02)', () => {
    it('evaluates each item with index', () => {
      const rows = service.evaluateBatch([
        { target: 100, actual: 90 },
        { target: 10, actual: 2, criticalThreshold: 5 },
      ]);
      expect(rows).toHaveLength(2);
      expect(rows[0].index).toBe(0);
      expect(rows[1].band).toBe('critical');
    });
  });

  describe('rollup (UC-XBOS-KPI-03)', () => {
    it('uses group SQL for holding company scope', async () => {
      dbMock.query.mockResolvedValue({ rows: [] });
      await service.rollup('xevn', 'holding');
      expect(dbMock.query).toHaveBeenCalledWith(
        expect.stringContaining('SUM(actual_value)'),
        expect.arrayContaining(['xevn', expect.arrayContaining(['holding', 'main'])]),
      );
    });

    it('uses single-company SQL for main scope', async () => {
      dbMock.query.mockResolvedValue({ rows: [] });
      await service.rollup('xevn', 'main');
      expect(dbMock.query).toHaveBeenCalledWith(
        expect.stringContaining('company_id = $2'),
        ['xevn', 'main', expect.any(String), expect.any(String)],
      );
    });
  });

  describe('publishPortalAlert (UC-XBOS-KPI-04)', () => {
    it('inserts alert and returns id', async () => {
      dbMock.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ id: 'alert-1' }] });
      const result = await service.publishPortalAlert({
        tenantId: 'xevn',
        companyId: 'main',
        moduleCode: 'kpi-engine',
        level: 'warning',
        title: 'KPI warning: OTIF',
        sourceSystem: 'xbos',
      });
      expect(result.id).toBe('alert-1');
    });
  });
});
