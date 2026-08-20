import { Test, TestingModule } from '@nestjs/testing';
import { createHmac } from 'node:crypto';
import { CatalogSyncController } from './catalog-sync.controller';
import { CatalogSyncService } from './catalog-sync.service';

function createInternalJwt(payload: Record<string, unknown>) {
  const header = Buffer.from(
    JSON.stringify({ alg: 'HS256', typ: 'JWT' }),
  ).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const secret = process.env.SERVICE_JWT_SECRET ?? 'xevn-dev-jwt-secret';
  const sig = createHmac('sha256', secret)
    .update(`${header}.${body}`)
    .digest('base64url');
  return `${header}.${body}.${sig}`;
}

describe('CatalogSyncController', () => {
  let controller: CatalogSyncController;

  const serviceMock = {
    pullCatalogFromXbos: jest.fn().mockResolvedValue({ key: 'job_titles' }),
    getSyncedCatalog: jest.fn().mockResolvedValue({ key: 'job_titles' }),
    listSyncedCatalogs: jest
      .fn()
      .mockResolvedValue({ total: 1, data: [{ key: 'job_titles' }] }),
    getCatalogSyncStatus: jest.fn().mockResolvedValue({
      key: 'status',
      status: 'connected',
      hasSyncedCatalogs: false,
      totalSyncedCatalogs: 0,
      lastSyncedAt: null,
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env.INTERNAL_API_KEY = 'test-key';
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CatalogSyncController],
      providers: [{ provide: CatalogSyncService, useValue: serviceMock }],
    }).compile();
    controller = module.get<CatalogSyncController>(CatalogSyncController);
  });

  it('requires either bearer token or internal key', async () => {
    await expect(
      controller.listLocalCatalogs(undefined, undefined),
    ).rejects.toThrow('Unauthorized sync access');
    expect(serviceMock.listSyncedCatalogs).not.toHaveBeenCalled();
  });

  it('UC-HRM-06: allows sync with internal key', async () => {
    const result = await controller.pullFromXbos(
      'job_titles',
      'xevn',
      'vtc',
      undefined,
      undefined,
      undefined,
      'test-key',
    );
    expect(result.success).toBe(true);
    expect(result.code).toBe('HRM-SYNC-200');
  });

  it('UC-HRM-07: get local catalog returns HRM-SYNC-201', async () => {
    const one = await controller.getLocalCatalog(
      'job_titles',
      'xevn',
      'vtc',
      undefined,
      undefined,
      undefined,
      'test-key',
    );
    expect(one.code).toBe('HRM-SYNC-201');
  });

  it('UC-HRM-08: list local catalogs returns HRM-SYNC-202', async () => {
    const many = await controller.listLocalCatalogs(
      'xevn',
      'vtc',
      undefined,
      undefined,
      undefined,
      'test-key',
    );
    expect(many.code).toBe('HRM-SYNC-202');
  });

  it('UC-HRM-08A: catalog sync status returns deterministic HRM-SYNC-203 envelope', async () => {
    const status = await controller.getCatalogSyncStatus(
      'xevn',
      'main',
      undefined,
      undefined,
      undefined,
      'test-key',
    );
    expect(status.code).toBe('HRM-SYNC-203');
    expect(status.data).toEqual(
      expect.objectContaining({
        key: 'status',
        status: 'connected',
        hasSyncedCatalogs: false,
        totalSyncedCatalogs: 0,
      }),
    );
    expect(serviceMock.getCatalogSyncStatus).toHaveBeenCalledWith(
      'xevn',
      'holding',
    );
  });

  it('rejects missing scope before service mutation', async () => {
    expect(() =>
      controller.pullFromXbos(
        'job_titles',
        'xevn',
        '',
        undefined,
        undefined,
        undefined,
        'test-key',
      ),
    ).toThrow('companyId is required');
    expect(serviceMock.pullCatalogFromXbos).not.toHaveBeenCalled();
  });

  it('rejects scope mismatch before service read', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'vtc',
    });
    await expect(
      controller.listLocalCatalogs(
        'xevn',
        'vtc',
        undefined,
        undefined,
        `Bearer ${token}`,
        'test-key',
      ),
    ).resolves.toBeDefined();
    await expect(
      controller.listLocalCatalogs(
        'xevn',
        'other-company',
        undefined,
        undefined,
        `Bearer ${token}`,
        undefined,
      ),
    ).rejects.toThrow('companyId mismatches token scope');
    expect(serviceMock.listSyncedCatalogs).toHaveBeenCalledTimes(1);
  });

  it('J-XBOS-02: group CEO main maps to holding partition for list', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    await controller.listLocalCatalogs(
      'xevn',
      'main',
      undefined,
      undefined,
      `Bearer ${token}`,
      undefined,
    );
    expect(serviceMock.listSyncedCatalogs).toHaveBeenCalledWith(
      'xevn',
      'holding',
    );
  });

  it('J-XBOS-02: group CEO accepts holding query alias for pull', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    await controller.pullFromXbos(
      'contract_types',
      undefined,
      undefined,
      'xevn',
      'holding',
      `Bearer ${token}`,
      undefined,
    );
    expect(serviceMock.pullCatalogFromXbos).toHaveBeenCalledWith(
      'contract_types',
      'xevn',
      'holding',
      `Bearer ${token}`,
    );
  });

  it('J-XBOS-02: group CEO accepts holding header for list and pull', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const auth = `Bearer ${token}`;
    await controller.listLocalCatalogs(
      'xevn',
      'holding',
      undefined,
      undefined,
      auth,
      undefined,
    );
    expect(serviceMock.listSyncedCatalogs).toHaveBeenCalledWith(
      'xevn',
      'holding',
    );
    await controller.pullFromXbos(
      'contract_types',
      'xevn',
      'holding',
      undefined,
      undefined,
      auth,
      undefined,
    );
    expect(serviceMock.pullCatalogFromXbos).toHaveBeenCalledWith(
      'contract_types',
      'xevn',
      'holding',
      auth,
    );
  });
});
