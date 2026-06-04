import { Test, TestingModule } from '@nestjs/testing';
import { createHmac } from 'node:crypto';
import { KpiEngineController } from './kpi-engine.controller';
import { KpiEngineService } from './kpi-engine.service';

function createInternalJwt(payload: Record<string, unknown>) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const secret = process.env.SERVICE_JWT_SECRET ?? 'xevn-dev-jwt-secret';
  const sig = createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${sig}`;
}

describe('KpiEngineController', () => {
  let controller: KpiEngineController;

  const serviceMock = {
    evaluate: jest.fn().mockReturnValue({
      score: 92,
      band: 'excellent',
      rewardAmount: 0,
      penaltyAmount: 0,
      netAmount: 0,
      ratio: 0.92,
    }),
    evaluateBatch: jest.fn().mockReturnValue([{ index: 0, score: 80, band: 'warning' }]),
    rollup: jest.fn().mockResolvedValue({
      tenantId: 'xevn',
      companyId: 'main',
      rollupMode: 'single',
      series: [],
    }),
    listPortalAlerts: jest.fn().mockResolvedValue([]),
    publishPortalAlert: jest.fn().mockResolvedValue({ id: 'alert-uuid' }),
    emitKpiBandAlert: jest.fn().mockResolvedValue({ id: 'alert-kpi' }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env.INTERNAL_API_KEY = 'test-key';
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KpiEngineController],
      providers: [{ provide: KpiEngineService, useValue: serviceMock }],
    }).compile();
    controller = module.get<KpiEngineController>(KpiEngineController);
  });

  it('rejects evaluate without auth', async () => {
    await expect(controller.evaluate({ target: 100, actual: 90 }, undefined, undefined)).rejects.toThrow(
      'Unauthorized internal access',
    );
    expect(serviceMock.evaluate).not.toHaveBeenCalled();
  });

  it('returns XBOS-KPI-200 for evaluate with internal key', async () => {
    const result = await controller.evaluate({ target: 100, actual: 90 }, undefined, 'test-key');
    expect(result.code).toBe('XBOS-KPI-200');
    expect(serviceMock.evaluate).toHaveBeenCalled();
  });

  it('returns XBOS-KPI-201 for evaluate-batch', async () => {
    const result = await controller.evaluateBatch(
      { items: [{ target: 100, actual: 80 }] },
      undefined,
      'test-key',
    );
    expect(result.code).toBe('XBOS-KPI-201');
  });

  it('rejects rollup scope mismatch before service (holding JWT vs main query)', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'holding',
    });
    await expect(
      controller.rollup('xevn', 'main', undefined, undefined, `Bearer ${token}`, undefined),
    ).rejects.toThrow('companyId mismatches token scope');
    expect(serviceMock.rollup).not.toHaveBeenCalled();
  });

  it('rollup allows group CEO JWT main with holding query (view-completeness)', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    await controller.rollup('xevn', 'holding', undefined, undefined, `Bearer ${token}`, 'test-key');
    expect(serviceMock.rollup).toHaveBeenCalledWith('xevn', 'holding', undefined, undefined);
  });

  it('rollup allows group CEO with portal tenantId=main and holding query (HTTPS J-CC-03)', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    await controller.rollup(
      'main',
      'holding',
      undefined,
      undefined,
      `Bearer ${token}`,
      'test-key',
      'main',
      'main',
    );
    expect(serviceMock.rollup).toHaveBeenCalledWith('xevn', 'holding', undefined, undefined);
  });

  it('rollup passes JWT-aligned holding scope to service', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'holding',
    });
    await controller.rollup('xevn', 'holding', undefined, undefined, `Bearer ${token}`, 'test-key');
    expect(serviceMock.rollup).toHaveBeenCalledWith('xevn', 'holding', undefined, undefined);
  });

  it('rollup passes JWT-aligned main scope to service', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'main',
    });
    await controller.rollup('xevn', 'main', undefined, undefined, `Bearer ${token}`, 'test-key');
    expect(serviceMock.rollup).toHaveBeenCalledWith('xevn', 'main', undefined, undefined);
  });

  it('UC-XBOS-DASH-01 UC-XBOS-DASH-02: executive KPI rollup returns XBOS-KPI-202', async () => {
    const result = await controller.rollup('xevn', 'main', undefined, undefined, undefined, 'test-key');
    expect(result.code).toBe('XBOS-KPI-202');
  });

  it('UC-XBOS-CC-05 UC-XBOS-DASH-03: portal alerts and KPI policy list returns XBOS-KPI-203', async () => {
    const result = await controller.portalAlerts('xevn', 'main', '10', undefined, 'test-key');
    expect(result.code).toBe('XBOS-KPI-203');
    expect(serviceMock.listPortalAlerts).toHaveBeenCalledWith('xevn', 10, 'main');
  });

  it('publishes portal alert with scoped company (UC-XBOS-KPI-04)', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'main',
    });
    const result = await controller.publishPortalAlert(
      {
        moduleCode: 'kpi-engine',
        level: 'warning',
        title: 'OTIF below target',
        tenantId: 'xevn',
        companyId: 'main',
      },
      `Bearer ${token}`,
      'test-key',
    );
    expect(result.code).toBe('XBOS-KPI-204');
    expect(serviceMock.publishPortalAlert).toHaveBeenCalledWith(
      expect.objectContaining({ tenantId: 'xevn', companyId: 'main' }),
    );
  });

  it('rejects publish portal alert when JWT main drifts to holding query', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'main',
    });
    await expect(
      controller.publishPortalAlert(
        {
          moduleCode: 'kpi-engine',
          level: 'critical',
          title: 'Drift',
          tenantId: 'xevn',
          companyId: 'holding',
        },
        `Bearer ${token}`,
        undefined,
      ),
    ).rejects.toThrow('companyId mismatches token scope');
    expect(serviceMock.publishPortalAlert).not.toHaveBeenCalled();
  });
});
