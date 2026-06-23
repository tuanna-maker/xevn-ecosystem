import { SettingsCatalogsService } from './settings-catalogs.service';
import { CatalogSyncService } from '../catalog-sync/catalog-sync.service';
import { HrmDbService } from '../db/hrm-db.service';
import { XbosCatalogWorkflowBridge } from './xbos-catalog-workflow.bridge';

/** UF-XBOS-15 — extension-items POST HRM-SET-209 visible on GET catalogs */
describe('P1-WEB-ACCEPTANCE-BE-FIX-01 UF-XBOS-15 extension items', () => {
  const db = { query: jest.fn() } as unknown as HrmDbService;
  const catalogSync = {
    listSyncedCatalogs: jest.fn().mockResolvedValue({ total: 0, data: [] }),
  } as unknown as CatalogSyncService;
  const xbosWorkflow = {
    startCatalogWorkflowIfConfigured: jest.fn().mockResolvedValue(null),
  } as unknown as XbosCatalogWorkflowBridge;

  let service: SettingsCatalogsService;

  beforeEach(() => {
    jest.resetAllMocks();
    (catalogSync.listSyncedCatalogs as jest.Mock).mockResolvedValue({ total: 0, data: [] });
    service = new SettingsCatalogsService(db, catalogSync, xbosWorkflow);
    (db.query as jest.Mock).mockImplementation(async (sql: string) => {
      if (sql.includes('CREATE TABLE')) {
        return { rows: [] };
      }
      if (sql.includes('FROM public.hrm_catalog_extension_items')) {
        return {
          rows: [
            {
              catalog_key: 'positions',
              code: 'qa_uf15_test',
              label: 'QA UF15',
              unit: null,
              status: 'draft',
            },
          ],
        };
      }
      if (sql.includes('FROM public.hrm_catalog_extension_requests')) {
        return { rows: [] };
      }
      return { rows: [] };
    });
  });

  it('getOverview exposes catalog_key and extension_items aliases for positions', async () => {
    const out = await service.getOverview('xevn', 'holding');
    const pos = out.catalogs.find((c) => c.catalogKey === 'positions');
    expect(pos).toBeDefined();
    expect(pos?.catalog_key).toBe('positions');
    expect(pos?.extension_items).toEqual(
      expect.arrayContaining([expect.objectContaining({ code: 'qa_uf15_test' })]),
    );
  });

  it('submitExtensionItemsForApproval dual-writes draft extension_items', async () => {
    const appendSpy = jest.spyOn(service, 'appendExtensionItems').mockResolvedValue({ upserted: 1 });

    await service.submitExtensionItemsForApproval('xevn', 'holding', 'positions', [
      { code: 'qa_uf15_new', label: 'QA UF15 New', status: 'active' },
    ]);

    expect(appendSpy).toHaveBeenCalledWith(
      'xevn',
      'holding',
      'positions',
      expect.arrayContaining([expect.objectContaining({ code: 'qa_uf15_new', status: 'active' })]),
    );
  });
});
