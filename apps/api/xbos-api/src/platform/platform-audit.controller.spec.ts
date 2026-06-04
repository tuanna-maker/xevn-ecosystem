import { Test, TestingModule } from '@nestjs/testing';
import { createHmac } from 'node:crypto';
import { PlatformAuditController } from './platform-audit.controller';
import { PlatformAuditService } from './platform-audit.service';

function createInternalJwt(payload: Record<string, unknown>) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const secret = process.env.SERVICE_JWT_SECRET ?? 'xevn-dev-jwt-secret';
  const sig = createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${sig}`;
}

describe('PlatformAuditController (UC-XBOS-06)', () => {
  let controller: PlatformAuditController;
  const serviceMock = {
    listEvents: jest.fn().mockResolvedValue({ total: 1, items: [{ action: 'config_catalog.publish' }] }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env.INTERNAL_API_KEY = 'test-key';
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlatformAuditController],
      providers: [{ provide: PlatformAuditService, useValue: serviceMock }],
    }).compile();
    controller = module.get(PlatformAuditController);
  });

  it('rejects unauthenticated audit list', async () => {
    await expect(
      controller.listEvents('xevn', 'holding', undefined, undefined, undefined, undefined, undefined),
    ).rejects.toThrow('Unauthorized audit access');
    expect(serviceMock.listEvents).not.toHaveBeenCalled();
  });

  it('maps group CEO JWT main query to holding for audit reads', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const res = await controller.listEvents(
      'xevn',
      'main',
      undefined,
      undefined,
      '25',
      `Bearer ${token}`,
      undefined,
    );
    expect(res.code).toBe('XBOS-AUDIT-200');
    expect(serviceMock.listEvents).toHaveBeenCalledWith(
      expect.objectContaining({ tenantId: 'xevn', companyId: 'holding', limit: 25 }),
    );
  });

  it('XBOS-DM-14: audit history list returns XBOS-AUDIT-200', async () => {
    const res = await controller.listEvents(
      'xevn',
      'holding',
      undefined,
      undefined,
      '25',
      undefined,
      'test-key',
    );
    expect(res.code).toBe('XBOS-AUDIT-200');
    expect(serviceMock.listEvents).toHaveBeenCalledWith(
      expect.objectContaining({ tenantId: 'xevn', companyId: 'holding', limit: 25 }),
    );
  });
});
