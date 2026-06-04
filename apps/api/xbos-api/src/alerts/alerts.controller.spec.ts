import { HttpStatus } from '@nestjs/common';
import { signServiceJwt } from '../common/jwt-sign';
import { AlertsController } from './alerts.controller';
import { AlertsService } from './alerts.service';
import { ApiException } from '../common/api.exception';

describe('AlertsController', () => {
  const serviceMock = {
    ingestViolation: jest.fn().mockResolvedValue({
      eventId: 'evt-1',
      duplicate: false,
      occurredAtUtc: '2026-03-25T09:15:00.000Z',
      moduleCode: 'trsport',
      severity: 'high',
      portalAlertId: 'alert-1',
    }),
  } as unknown as AlertsService;

  let controller: AlertsController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new AlertsController(serviceMock);
    process.env.SERVICE_JWT_SECRET = 'xevn-dev-jwt-secret';
    process.env.NODE_ENV = 'test';
  });

  it('UC-XBOS-07: returns XBOS-ALERT-202 on violation ingest', async () => {
    const token = signServiceJwt({ tenantId: 'xevn', companyId: 'holding', sub: 'svc' });
    const res = await controller.violationIngest(
      {
        tenantId: 'xevn',
        moduleCode: 'TRSPORT',
        occurredAt: '2026-03-25T09:15:00Z',
        entityRef: { routeId: 'r1' },
        ruleId: 'RULE-1',
        severity: 'high',
        metricSnapshot: { value: 1 },
        correlationId: 'corr-1',
      },
      `Bearer ${token}`,
      'xevn-dev-internal-key',
    );
    expect(res.code).toBe('XBOS-ALERT-202');
    expect(serviceMock.ingestViolation).toHaveBeenCalledWith(
      expect.objectContaining({ tenantId: 'xevn', moduleCode: 'TRSPORT' }),
    );
  });

  it('rejects unauthorized ingest with XBOS-AUTH-001', async () => {
    await expect(
      controller.violationIngest(
        {
          tenantId: 'xevn',
          moduleCode: 'TRSPORT',
          occurredAt: '2026-03-25T09:15:00Z',
          entityRef: {},
          ruleId: 'R',
          severity: 'low',
          metricSnapshot: {},
          correlationId: 'c',
        },
        undefined,
        undefined,
      ),
    ).rejects.toMatchObject<ApiException>({
      code: 'XBOS-AUTH-001',
      status: HttpStatus.UNAUTHORIZED,
    });
    expect(serviceMock.ingestViolation).not.toHaveBeenCalled();
  });
});
