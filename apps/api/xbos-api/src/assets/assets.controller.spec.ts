import { Test, TestingModule } from '@nestjs/testing';
import { createHmac } from 'node:crypto';
import { AssetsController } from './assets.controller';
import { AssetsService } from './assets.service';
import { ApiException } from '../common/api.exception';

function toBase64Url(input: string) {
  return Buffer.from(input).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function signToken(payload: Record<string, unknown>) {
  const header = toBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = toBase64Url(JSON.stringify(payload));
  const signingInput = `${header}.${body}`;
  const signature = createHmac('sha256', process.env.SERVICE_JWT_SECRET ?? 'xevn-dev-jwt-secret')
    .update(signingInput)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
  return `${signingInput}.${signature}`;
}

describe('AssetsController (UC-XBOS-AST)', () => {
  let controller: AssetsController;

  const serviceMock = {
    createAsset: jest.fn().mockResolvedValue({ assetId: 'asset-1' }),
    listAssets: jest.fn().mockResolvedValue({ total: 0, page: 1, limit: 20, data: [] }),
    getAssetById: jest.fn().mockResolvedValue({ assetId: 'asset-1' }),
    updateAsset: jest.fn().mockResolvedValue({ assetId: 'asset-1', version: 2 }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env.INTERNAL_API_KEY = 'test-key';
    process.env.SERVICE_JWT_SECRET = 'xevn-dev-jwt-secret';
    process.env.SERVICE_JWT_AUDIENCE = 'xevn-api';
    process.env.SERVICE_JWT_ISSUER = 'xevn-internal';
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssetsController],
      providers: [{ provide: AssetsService, useValue: serviceMock }],
    }).compile();
    controller = module.get<AssetsController>(AssetsController);
  });

  it('rejects create without internal auth', async () => {
    await expect(
      controller.createAsset(
        {
          tenantId: 'tn-1',
          companyId: 'cp-1',
          assetCode: 'TRUCK-001',
          assetName: 'Truck 1',
          assetType: 'vehicle',
          ownerModule: 'operations',
        },
        'operations',
        undefined,
        undefined,
      ),
    ).rejects.toThrow('Unauthorized internal access');
  });

  it('UC-XBOS-AST-01: create returns ASSET-REG-201', async () => {
    const token = signToken({ mod: 'operations', aud: 'xevn-api', iss: 'xevn-internal' });
    const createResult = await controller.createAsset(
      {
        tenantId: 'tn-1',
        companyId: 'cp-1',
        assetCode: 'TRUCK-001',
        assetName: 'Truck 1',
        assetType: 'vehicle',
        ownerModule: 'operations',
      },
      'operations',
      `Bearer ${token}`,
      undefined,
    );
    const listResult = await controller.listAssets(
      { tenantId: 'tn-1', companyId: 'cp-1' },
      `Bearer ${token}`,
      undefined,
    );
    expect(createResult.code).toBe('ASSET-REG-201');
    expect(listResult.code).toBe('ASSET-REG-200');
  });

  it('UC-XBOS-AST-02: update asset lifecycle via PATCH', async () => {
    const token = signToken({ mod: 'operations', aud: 'xevn-api', iss: 'xevn-internal' });
    const result = await controller.updateAsset(
      'asset-1',
      'tn-1',
      'cp-1',
      { assetName: 'Updated truck', status: 'active' },
      'operations',
      `Bearer ${token}`,
      undefined,
    );
    expect(result.code).toBe('ASSET-REG-200');
    expect(serviceMock.updateAsset).toHaveBeenCalledWith('asset-1', 'tn-1', 'cp-1', expect.any(Object), 'operations');
  });

  it('canonicalizes token module claim for create', async () => {
    const token = signToken({ mod: 'hrm', aud: 'xevn-api', iss: 'xevn-internal' });
    await controller.createAsset(
      {
        tenantId: 'tn-1',
        companyId: 'cp-1',
        assetCode: 'TRUCK-001',
        assetName: 'Truck 1',
        assetType: 'vehicle',
        ownerModule: 'hrm-admin',
      },
      'hrm-admin',
      `Bearer ${token}`,
      undefined,
    );
    expect(serviceMock.createAsset).toHaveBeenCalledWith(expect.any(Object), 'hrm-admin');
  });

  it('rejects header/token module mismatch with ASSET-MOD-409', async () => {
    const token = signToken({ mod: 'hrm', aud: 'xevn-api', iss: 'xevn-internal' });
    await expect(
      controller.updateAsset(
        'asset-1',
        'tn-1',
        'cp-1',
        { assetName: 'Updated' },
        'operations',
        `Bearer ${token}`,
        undefined,
      ),
    ).rejects.toMatchObject<ApiException>({ code: 'ASSET-MOD-409' });
  });

  it('rejects missing scope with deterministic scope code', async () => {
    const token = signToken({ mod: 'operations', aud: 'xevn-api', iss: 'xevn-internal' });
    await expect(
      controller.getAssetById('asset-1', undefined, 'cp-1', `Bearer ${token}`, undefined),
    ).rejects.toMatchObject<ApiException>({ code: 'SCOPE_TENANT_REQUIRED' });
    expect(serviceMock.getAssetById).not.toHaveBeenCalled();
  });

  it('rejects claim/request scope mismatch before write mutation', async () => {
    const token = signToken({
      mod: 'operations',
      tenantId: 'tn-claim',
      companyId: 'cp-claim',
      aud: 'xevn-api',
      iss: 'xevn-internal',
    });

    await expect(
      controller.createAsset(
        {
          tenantId: 'tn-request',
          companyId: 'cp-claim',
          assetCode: 'TRUCK-002',
          assetName: 'Truck mismatch',
          assetType: 'vehicle',
          ownerModule: 'operations',
        },
        'operations',
        `Bearer ${token}`,
        undefined,
      ),
    ).rejects.toMatchObject<ApiException>({ code: 'SCOPE_CONTEXT_MISMATCH' });
    expect(serviceMock.createAsset).not.toHaveBeenCalled();
  });
});
