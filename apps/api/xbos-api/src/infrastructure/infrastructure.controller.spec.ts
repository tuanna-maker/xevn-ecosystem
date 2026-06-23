import { Test, TestingModule } from '@nestjs/testing';
import { createHmac } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import { InfrastructureController } from './infrastructure.controller';
import { InfrastructureService } from './infrastructure.service';

function createInternalJwt(payload: Record<string, unknown>) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const secret = process.env.SERVICE_JWT_SECRET ?? 'xevn-dev-jwt-secret';
  const sig = createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${sig}`;
}

describe('InfrastructureController (UC-XBOS-INF)', () => {
  let controller: InfrastructureController;

  const serviceMock = {
    getSettings: jest.fn().mockResolvedValue({
      foundationCategories: [],
      customFieldDefsByEntity: { legal_entity: [{ code: 'tax_id', label: 'MST' }] },
    }),
    getSummary: jest.fn().mockResolvedValue({
      health: 'ok',
      foundationCategoriesCount: 2,
      sitesCount: 1,
      customFieldsCount: 3,
    }),
    upsertSettings: jest.fn().mockResolvedValue({
      foundationCategories: [],
      customFieldDefsByEntity: { legal_entity: [{ code: 'tax_id', label: 'MST' }] },
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env.INTERNAL_API_KEY = 'test-key';
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InfrastructureController],
      providers: [{ provide: InfrastructureService, useValue: serviceMock }],
    }).compile();
    controller = module.get<InfrastructureController>(InfrastructureController);
  });

  it('rejects unauthenticated settings read', async () => {
    await expect(controller.getSettings(undefined, undefined, undefined, undefined)).rejects.toMatchObject<
      ApiException
    >({ code: 'XBOS-AUTH-001' });
    expect(serviceMock.getSettings).not.toHaveBeenCalled();
  });

  it('UC-XBOS-INF-01: loads infrastructure settings', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'holding',
    });
    const result = await controller.getSettings('xevn', 'holding', `Bearer ${token}`, undefined);
    expect(result.code).toBe('XBOS-INFRA-200');
    expect(serviceMock.getSettings).toHaveBeenCalledWith('xevn', 'holding');
  });

  it('UC-XBOS-INF-02: upserts meta field templates via settings', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'holding',
    });
    const result = await controller.upsertSettings(
      { customFieldDefsByEntity: { legal_entity: [{ code: 'tax_id', label: 'MST' }] } },
      'xevn',
      'holding',
      `Bearer ${token}`,
      undefined,
    );
    expect(result.code).toBe('XBOS-INFRA-201');
    expect(serviceMock.upsertSettings).toHaveBeenCalledWith(
      'xevn',
      'holding',
      expect.objectContaining({ customFieldDefsByEntity: expect.any(Object) }),
    );
  });

  it('UC-XBOS-INF-02b: upserts foundationCategories and sites arrays (FE save flow)', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'holding',
    });
    const body = {
      foundationCategories: [{ id: 'fcat-1', code: 'HT-01', nameVi: 'Cat', appliesToCompanyIds: ['holding'] }],
      sites: [{ id: 'inf-1', siteCode: 'KHO-01', name: 'Site', operatingEntityId: 'holding' }],
    };
    const result = await controller.upsertSettings(body, 'xevn', 'holding', `Bearer ${token}`, undefined);
    expect(result.code).toBe('XBOS-INFRA-201');
    expect(serviceMock.upsertSettings).toHaveBeenCalledWith('xevn', 'holding', body);
  });

  it('UC-XBOS-INF-03: returns infrastructure summary with health fields', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'holding',
    });
    const result = await controller.getSummary('xevn', 'holding', `Bearer ${token}`, undefined);
    expect(result.code).toBe('XBOS-INFRA-210');
    expect(result.data).toEqual(expect.objectContaining({ health: 'ok' }));
  });
});
