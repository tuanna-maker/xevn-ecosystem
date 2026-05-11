import { SettingsCatalogsService } from './settings-catalogs.service';
import { CatalogSyncService } from '../catalog-sync/catalog-sync.service';
import { HrmDbService } from '../db/hrm-db.service';

describe('SettingsCatalogsService', () => {
  const db = {
    query: jest.fn(),
  } as unknown as HrmDbService;

  const catalogSync = {
    listSyncedCatalogs: jest.fn(),
    listRemoteCatalogsFromXbos: jest.fn(),
    pullCatalogFromXbos: jest.fn(),
  } as unknown as CatalogSyncService;

  let service: SettingsCatalogsService;

  beforeEach(() => {
    jest.resetAllMocks();
    service = new SettingsCatalogsService(db, catalogSync);
    (db.query as jest.Mock).mockImplementation(async (sql: string) => {
      if (sql.includes('FROM public.hrm_catalog_extension_items')) {
        return {
          rows: [
            {
              catalog_key: 'positions',
              code: 'pm',
              label: 'PM local',
              unit: null,
              status: 'active',
            },
          ],
        };
      }
      return { rows: [] };
    });
  });

  it('merges XBOS payload items with HRM extensions', async () => {
    (catalogSync.listSyncedCatalogs as jest.Mock).mockResolvedValue({
      total: 1,
      data: [
        {
          tenantId: 'xevn',
          companyId: 'holding',
          key: 'positions',
          source: 'xbos',
          version: 2,
          checksum: 'x',
          syncedAt: '2026-01-01T00:00:00.000Z',
          payload: {
            key: 'positions',
            name: 'Positions',
            domain: 'hr',
            items: [{ code: 'dev', label: 'Developer', status: 'active' }],
          },
        },
      ],
    });

    const out = await service.getOverview('xevn', 'holding');
    expect(out.catalogs).toHaveLength(1);
    expect(out.catalogs[0].xbosItems).toHaveLength(1);
    expect(out.catalogs[0].hrmExtensionItems).toHaveLength(1);
    expect(out.catalogs[0].effectiveItems.map((i) => i.code).sort()).toEqual(['dev', 'pm']);
  });
});
