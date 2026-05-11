import { Test, TestingModule } from '@nestjs/testing';
import { createHmac } from 'node:crypto';
import { CatalogSyncController } from './catalog-sync.controller';
import { CatalogSyncService } from './catalog-sync.service';

function createInternalJwt(payload: Record<string, unknown>) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const secret = process.env.SERVICE_JWT_SECRET ?? 'xevn-dev-jwt-secret';
  const sig = createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${sig}`;
}

describe('CatalogSyncController', () => {
  let controller: CatalogSyncController;

  const serviceMock = {
    pullCatalogFromXbos: jest.fn().mockResolvedValue({ key: 'job_titles' }),
    getSyncedCatalog: jest.fn().mockResolvedValue({ key: 'job_titles' }),
    listSyncedCatalogs: jest.fn().mockResolvedValue({ total: 1, data: [{ key: 'job_titles' }] }),
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
    await expect(controller.listLocalCatalogs(undefined, undefined)).rejects.toThrow('Unauthorized sync access');
    expect(serviceMock.listSyncedCatalogs).not.toHaveBeenCalled();
  });

  it('allows sync with internal key', async () => {
    const result = await controller.pullFromXbos('job_titles', 'xevn', 'vtc', undefined, 'test-key');
    expect(result.success).toBe(true);
    expect(result.code).toBe('HRM-SYNC-200');
  });

  it('returns deterministic code for get/list', async () => {
    const one = await controller.getLocalCatalog('job_titles', 'xevn', 'vtc', undefined, 'test-key');
    const many = await controller.listLocalCatalogs('xevn', 'vtc', undefined, 'test-key');
    expect(one.code).toBe('HRM-SYNC-201');
    expect(many.code).toBe('HRM-SYNC-202');
  });

  it('rejects missing scope before service mutation', async () => {
    expect(() => controller.pullFromXbos('job_titles', 'xevn', '', undefined, 'test-key')).toThrow(
      'companyId is required',
    );
    expect(serviceMock.pullCatalogFromXbos).not.toHaveBeenCalled();
  });

  it('rejects scope mismatch before service read', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'vtc',
    });
    await expect(controller.listLocalCatalogs('xevn', 'vtc', `Bearer ${token}`, 'test-key')).resolves.toBeDefined();
    await expect(
      controller.listLocalCatalogs('xevn', 'other-company', `Bearer ${token}`, undefined),
    ).rejects.toThrow('companyId mismatches token scope');
    expect(serviceMock.listSyncedCatalogs).toHaveBeenCalledTimes(1);
  });
});
