import { Test, TestingModule } from '@nestjs/testing';
import { createHmac } from 'node:crypto';
import { ConfigSyncController } from './config-sync.controller';
import { ConfigSyncService } from './config-sync.service';

function createInternalJwt(payload: Record<string, unknown>) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const secret = process.env.SERVICE_JWT_SECRET ?? 'xevn-dev-jwt-secret';
  const sig = createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${sig}`;
}

describe('ConfigSyncController', () => {
  let controller: ConfigSyncController;

  const serviceMock = {
    bootstrapXevnGroupConfig: jest.fn().mockResolvedValue({ seeded_catalogs: 3 }),
    publishCatalog: jest.fn().mockResolvedValue({ key: 'job_titles', version: 2 }),
    getCatalogForTarget: jest.fn().mockResolvedValue({ key: 'job_titles' }),
    listCatalogsForTarget: jest.fn().mockResolvedValue({ total: 1, target: 'hrm', data: [] }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env.INTERNAL_API_KEY = 'test-key';
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConfigSyncController],
      providers: [{ provide: ConfigSyncService, useValue: serviceMock }],
    }).compile();
    controller = module.get<ConfigSyncController>(ConfigSyncController);
  });

  it('rejects bootstrap without auth/internal key', async () => {
    await expect(controller.bootstrapXevn(undefined, undefined)).rejects.toThrow(
      'Unauthorized bootstrap access',
    );
    expect(serviceMock.bootstrapXevnGroupConfig).not.toHaveBeenCalled();
  });

  it('allows bootstrap with internal key and returns envelope', async () => {
    const result = await controller.bootstrapXevn(undefined, 'test-key');
    expect(result.success).toBe(true);
    expect(result.code).toBe('XBOS-CFG-200');
  });

  it('requires auth for catalog publish', async () => {
    await expect(
      controller.publishCatalog(
        'job_titles',
        {
          tenantId: 'xevn',
          companyId: 'vtc',
          name: 'Job Titles',
          domain: 'human_resources',
          assignedTo: ['hrm'],
          items: [{ code: 'CEO', label: 'CEO', status: 'active' }],
        },
        undefined,
        undefined,
      ),
    ).rejects.toThrow('Unauthorized bootstrap access');
    expect(serviceMock.publishCatalog).not.toHaveBeenCalled();
  });

  it('publishes catalog with deterministic response code', async () => {
    const result = await controller.publishCatalog(
      'job_titles',
      {
        tenantId: 'xevn',
        companyId: 'vtc',
        name: 'Job Titles',
        domain: 'human_resources',
        assignedTo: ['hrm'],
        items: [{ code: 'CEO', label: 'CEO', status: 'active' }],
      },
      undefined,
      'test-key',
    );
    expect(result.success).toBe(true);
    expect(result.code).toBe('XBOS-CFG-203');
  });

  it('rejects invalid target values', async () => {
    await expect(controller.getCatalogForSystem('job_titles', 'bad-target', 'xevn', 'vtc', undefined, 'test-key')).rejects.toThrow(
      'Invalid target. Use hrm, xbos, or web-portal',
    );
  });

  it('returns deterministic codes for get/list', async () => {
    const one = await controller.getCatalogForSystem('job_titles', 'hrm', 'xevn', 'vtc', undefined, 'test-key');
    const many = await controller.listCatalogsForSystem('hrm', 'xevn', 'vtc', undefined, 'test-key');
    expect(one.code).toBe('XBOS-CFG-201');
    expect(many.code).toBe('XBOS-CFG-202');
  });

  it('rejects missing scope before service read', async () => {
    await expect(
      controller.getCatalogForSystem('job_titles', 'hrm', 'xevn', '', undefined, 'test-key'),
    ).rejects.toThrow('companyId is required');
    expect(serviceMock.getCatalogForTarget).not.toHaveBeenCalled();
  });

  it('rejects scope mismatch before service read', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'vtc',
    });
    await expect(
      controller.getCatalogForSystem('job_titles', 'hrm', 'xevn', 'other-company', `Bearer ${token}`, undefined),
    ).rejects.toThrow('companyId mismatches token scope');
    expect(serviceMock.getCatalogForTarget).not.toHaveBeenCalled();
  });
});
