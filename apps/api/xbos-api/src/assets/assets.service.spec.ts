import { HttpStatus } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { AssetsService } from './assets.service';
import { XbosDbService } from '../db/xbos-db.service';

describe('AssetsService', () => {
  const db = {
    query: jest.fn(),
  } as unknown as XbosDbService;

  let service: AssetsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AssetsService(db);
    db.query = jest.fn().mockResolvedValue({ rows: [] });
  });

  it('rejects field update outside ownership matrix', async () => {
    (db.query as jest.Mock).mockImplementation((sql: string) => {
      if (sql.includes('SELECT *') && sql.includes('FROM public.asset_registry')) {
        return Promise.resolve({
          rows: [
            {
              asset_id: 'a1',
              tenant_id: 'tn-1',
              company_id: 'cp-1',
              asset_code: 'A-1',
              asset_name: 'Asset 1',
              asset_type: 'vehicle',
              vin: null,
              chassis_no: null,
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
      return Promise.resolve({ rows: [] });
    });

    await expect(
      service.updateAsset('a1', 'tn-1', 'cp-1', { financialProfile: { acquisitionCost: 123 } }, 'operations'),
    ).rejects.toMatchObject<ApiException>({
      code: 'ASSET-OWN-001',
      status: HttpStatus.FORBIDDEN,
    });
  });

  it('writes lifecycle audit on create', async () => {
    (db.query as jest.Mock).mockImplementation((sql: string) => {
      if (sql.includes('INSERT INTO public.asset_registry')) {
        return Promise.resolve({
          rows: [
            {
              asset_id: 'a2',
              tenant_id: 'tn-1',
              company_id: 'cp-1',
              asset_code: 'TRUCK-001',
              asset_name: 'Truck 1',
              asset_type: 'vehicle',
              vin: null,
              chassis_no: null,
              status: 'active',
              owner_module: 'operations',
              metadata: {},
              version: 1,
              created_by: 'ops-user',
              updated_by: 'ops-user',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ],
        });
      }
      return Promise.resolve({ rows: [] });
    });

    await service.createAsset(
      {
        tenantId: 'tn-1',
        companyId: 'cp-1',
        assetCode: 'TRUCK-001',
        assetName: 'Truck 1',
        assetType: 'vehicle',
        ownerModule: 'operations',
        actorId: 'ops-user',
      },
      'operations',
    );

    const auditCall = (db.query as jest.Mock).mock.calls.find((call) =>
      String(call[0]).includes('INSERT INTO public.asset_lifecycle_audit'),
    );
    expect(auditCall).toBeDefined();
    expect(auditCall?.[1][3]).toBe('create');
    expect(auditCall?.[1][4]).toBe('operations');
  });
});
