import { Test, TestingModule } from '@nestjs/testing';
import { createHmac, randomUUID } from 'node:crypto';
import { AssetsController } from './assets.controller';
import { AssetsService } from './assets.service';
import { XbosDbService } from '../db/xbos-db.service';
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

type AssetIdentity = {
  assetId: string;
  tenantId: string;
  companyId: string;
  assetCode: string;
  vin: string | null;
  chassisNo: string | null;
};

describe('AssetsController+Service live create path', () => {
  let controller: AssetsController;
  let identities: AssetIdentity[];

  const dbMock = {
    query: jest.fn(),
  };

  beforeEach(async () => {
    process.env.INTERNAL_API_KEY = 'test-key';
    process.env.SERVICE_JWT_SECRET = 'xevn-dev-jwt-secret';
    process.env.SERVICE_JWT_AUDIENCE = 'xevn-api';
    process.env.SERVICE_JWT_ISSUER = 'xevn-internal';

    identities = [];
    dbMock.query.mockReset();
    dbMock.query.mockImplementation((sql: string, params?: unknown[]) => {
      if (sql.includes('SELECT *') && sql.includes('FROM public.asset_registry') && sql.includes('asset_id = $1')) {
        const [assetId, tenantId, companyId] = params as string[];
        const found = identities.find(
          (candidate) =>
            candidate.assetId === assetId && candidate.tenantId === tenantId && candidate.companyId === companyId,
        );
        if (!found) {
          return Promise.resolve({ rows: [] });
        }
        return Promise.resolve({
          rows: [
            {
              asset_id: found.assetId,
              tenant_id: found.tenantId,
              company_id: found.companyId,
              asset_code: found.assetCode,
              asset_name: 'Scope test asset',
              asset_type: 'vehicle',
              vin: found.vin,
              chassis_no: found.chassisNo,
              status: 'active',
              owner_module: 'operations',
              metadata: {},
              version: 1,
              created_by: 'system',
              updated_by: 'system',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ],
        });
      }

      if (!sql.includes('INSERT INTO public.asset_registry')) {
        return Promise.resolve({ rows: [] });
      }

      const tenantId = String(params?.[0] ?? '');
      const companyId = String(params?.[1] ?? '');
      const assetCode = String(params?.[2] ?? '');
      const vin = (params?.[5] as string | null | undefined) ?? null;
      const chassisNo = (params?.[6] as string | null | undefined) ?? null;

      const sameScope = (candidate: AssetIdentity) =>
        candidate.tenantId === tenantId && candidate.companyId === companyId;

      if (identities.some((candidate) => sameScope(candidate) && candidate.assetCode === assetCode)) {
        return Promise.reject({
          code: '23505',
          constraint: 'asset_registry_tenant_id_company_id_asset_code_key',
          detail: `Key (tenant_id, company_id, asset_code)=(${tenantId}, ${companyId}, ${assetCode}) already exists.`,
        });
      }
      if (vin && identities.some((candidate) => sameScope(candidate) && candidate.vin === vin)) {
        return Promise.reject({
          code: '23505',
          constraint: 'uq_asset_registry_tenant_company_vin',
          detail: `Key (tenant_id, company_id, vin)=(${tenantId}, ${companyId}, ${vin}) already exists.`,
        });
      }
      if (chassisNo && identities.some((candidate) => sameScope(candidate) && candidate.chassisNo === chassisNo)) {
        return Promise.reject({
          code: '23505',
          constraint: 'uq_asset_registry_tenant_company_chassis',
          detail: `Key (tenant_id, company_id, chassis_no)=(${tenantId}, ${companyId}, ${chassisNo}) already exists.`,
        });
      }

      const assetId = randomUUID();
      identities.push({ assetId, tenantId, companyId, assetCode, vin, chassisNo });
      return Promise.resolve({
        rows: [
          {
            asset_id: assetId,
            tenant_id: tenantId,
            company_id: companyId,
            asset_code: assetCode,
            asset_name: String(params?.[3] ?? ''),
            asset_type: String(params?.[4] ?? ''),
            vin,
            chassis_no: chassisNo,
            status: String(params?.[7] ?? 'active'),
            owner_module: String(params?.[8] ?? 'operations'),
            metadata: {},
            version: 1,
            created_by: String(params?.[10] ?? 'system'),
            updated_by: String(params?.[10] ?? 'system'),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
      });
    });

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssetsController],
      providers: [
        AssetsService,
        {
          provide: XbosDbService,
          useValue: dbMock,
        },
      ],
    }).compile();
    controller = module.get<AssetsController>(AssetsController);
  });

  it('maps DB unique_violation to ASSET-REG-409 with field-aware details', async () => {
    const token = signToken({ mod: 'operations', aud: 'xevn-api', iss: 'xevn-internal' });
    const baseDto = {
      tenantId: 'tn-1',
      companyId: 'cp-1',
      assetCode: 'TRUCK-001',
      assetName: 'Truck 1',
      assetType: 'vehicle',
      ownerModule: 'operations' as const,
    };

    await controller.createAsset(baseDto, 'operations', `Bearer ${token}`, undefined);

    await expect(
      controller.createAsset(baseDto, 'operations', `Bearer ${token}`, undefined),
    ).rejects.toMatchObject<ApiException>({
      code: 'ASSET-REG-409',
      details: expect.objectContaining({
        conflictFields: ['assetCode'],
        scope: { tenantId: 'tn-1', companyId: 'cp-1' },
      }),
    });
    expect(identities).toHaveLength(1);
  });

  it('proves reject branch keeps DB state immutable before/after duplicate create', async () => {
    const token = signToken({ mod: 'operations', aud: 'xevn-api', iss: 'xevn-internal' });
    const baseDto = {
      tenantId: 'tn-immut',
      companyId: 'cp-immut',
      assetCode: 'TRUCK-IMMUT-001',
      assetName: 'Truck Immutable',
      assetType: 'vehicle',
      ownerModule: 'operations' as const,
    };

    await controller.createAsset(baseDto, 'operations', `Bearer ${token}`, undefined);
    const beforeRejectState = JSON.stringify(identities);

    await expect(
      controller.createAsset(baseDto, 'operations', `Bearer ${token}`, undefined),
    ).rejects.toMatchObject<ApiException>({
      code: 'ASSET-REG-409',
      details: expect.objectContaining({
        conflictFields: ['assetCode'],
        scope: { tenantId: 'tn-immut', companyId: 'cp-immut' },
      }),
    });

    const afterRejectState = JSON.stringify(identities);
    expect(afterRejectState).toBe(beforeRejectState);
    expect(identities).toHaveLength(1);
  });

  it('keeps uniqueness scoped to tenant+company in live create path', async () => {
    const token = signToken({ mod: 'operations', aud: 'xevn-api', iss: 'xevn-internal' });
    const first = await controller.createAsset(
      {
        tenantId: 'tn-1',
        companyId: 'cp-1',
        assetCode: 'TRUCK-002',
        assetName: 'Truck Scope A',
        assetType: 'vehicle',
        ownerModule: 'operations',
      },
      'operations',
      `Bearer ${token}`,
      undefined,
    );

    const second = await controller.createAsset(
      {
        tenantId: 'tn-1',
        companyId: 'cp-2',
        assetCode: 'TRUCK-002',
        assetName: 'Truck Scope B',
        assetType: 'vehicle',
        ownerModule: 'operations',
      },
      'operations',
      `Bearer ${token}`,
      undefined,
    );

    expect(first.code).toBe('ASSET-REG-201');
    expect(second.code).toBe('ASSET-REG-201');
  });

  it('executes cross-company forbidden read and returns ASSET-REG-404', async () => {
    const token = signToken({ mod: 'operations', aud: 'xevn-api', iss: 'xevn-internal' });
    const created = await controller.createAsset(
      {
        tenantId: 'tn-1',
        companyId: 'cp-1',
        assetCode: 'TRUCK-003',
        assetName: 'Truck Scope C',
        assetType: 'vehicle',
        ownerModule: 'operations',
      },
      'operations',
      `Bearer ${token}`,
      undefined,
    );

    const ownScopeRead = await controller.getAssetById(
      created.data.assetId,
      'tn-1',
      'cp-1',
      `Bearer ${token}`,
      undefined,
    );
    expect(ownScopeRead.code).toBe('ASSET-REG-200');

    await expect(
      controller.getAssetById(created.data.assetId, 'tn-1', 'cp-2', `Bearer ${token}`, undefined),
    ).rejects.toMatchObject<ApiException>({ code: 'ASSET-REG-404' });
  });
});
