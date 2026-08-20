import { SettingsCatalogsService } from './settings-catalogs.service';
import { CatalogSyncService } from '../catalog-sync/catalog-sync.service';
import { HrmDbService } from '../db/hrm-db.service';
import { XbosCatalogWorkflowBridge } from './xbos-catalog-workflow.bridge';

/**
 * D-HRM-SET-ITEM-PERSIST-01 / UF-HRM-10 / HRM-SC-03
 * Write + read must share company_id=holding for group CEO portal main.
 */
describe('D-HRM-SET-ITEM-PERSIST-01 settings catalog item write+read', () => {
  const db = { query: jest.fn() } as unknown as HrmDbService;
  const catalogSync = {
    listSyncedCatalogs: jest.fn(),
  } as unknown as CatalogSyncService;
  const xbosWorkflow = {
    startCatalogExtensionWorkflow: jest.fn().mockResolvedValue(undefined),
  } as unknown as XbosCatalogWorkflowBridge;

  let service: SettingsCatalogsService;
  /** In-memory store keyed by tenant|company|catalog|code — simulates DB partition. */
  const extensionStore = new Map<
    string,
    {
      catalog_key: string;
      code: string;
      label: string;
      unit: string | null;
      status: string;
      company_id: string;
    }
  >();

  function storeKey(
    tenant: string,
    company: string,
    catalog: string,
    code: string,
  ) {
    return `${tenant}|${company}|${catalog}|${code}`.toLowerCase();
  }

  beforeEach(() => {
    jest.resetAllMocks();
    extensionStore.clear();
    service = new SettingsCatalogsService(db, catalogSync, xbosWorkflow);

    (catalogSync.listSyncedCatalogs as jest.Mock).mockResolvedValue({
      total: 1,
      data: [
        {
          key: 'activity_capability_map',
          version: 1,
          syncedAt: '2026-07-17T00:00:00.000Z',
          payload: {
            name: 'Activity capability map',
            domain: 'hrm',
            items: [{ code: 'ACM_01', label: 'HRM', status: 'active' }],
          },
        },
      ],
    });

    (db.query as jest.Mock).mockImplementation(
      async (sql: string, params?: unknown[]) => {
        if (
          sql.includes('CREATE TABLE') ||
          sql.includes('CREATE INDEX') ||
          sql.includes('ALTER TABLE')
        ) {
          return { rows: [] };
        }
        if (sql.includes('INSERT INTO public.hrm_catalog_extension_items')) {
          const tenantId = String(params?.[0] ?? '');
          const companyId = String(params?.[1] ?? '');
          const catalogKey = String(params?.[2] ?? '');
          const codes = (params?.[3] as string[]) ?? [];
          const labels = (params?.[4] as string[]) ?? [];
          const units = (params?.[5] as Array<string | null>) ?? [];
          const statuses = (params?.[6] as string[]) ?? [];
          for (let i = 0; i < codes.length; i += 1) {
            const key = storeKey(tenantId, companyId, catalogKey, codes[i]);
            extensionStore.set(key, {
              catalog_key: catalogKey,
              code: codes[i],
              label: labels[i],
              unit: units[i] ?? null,
              status: statuses[i] ?? 'active',
              company_id: companyId,
            });
          }
          return { rows: [] };
        }
        if (
          sql.includes('SELECT catalog_key, code, label, unit, status') &&
          sql.includes('hrm_catalog_extension_items')
        ) {
          const tenantId = String(params?.[0] ?? '').toLowerCase();
          const companyId = String(params?.[1] ?? '').toLowerCase();
          const prefix = `${tenantId}|${companyId}|`;
          const filtered = [...extensionStore.entries()]
            .filter(([k]) => k.startsWith(prefix))
            .map(([, v]) => v);
          return { rows: filtered };
        }
        if (sql.includes('FROM public.hrm_catalog_extension_requests')) {
          return { rows: [] };
        }
        return { rows: [] };
      },
    );
  });

  it('upsert under holding then getOverview(holding) returns hrmExtensionItems (create)', async () => {
    const write = await service.upsertCatalogItem('xevn', {
      company_id: 'holding',
      category_key: 'activity_capability_map',
      item_key: 'QAFE071710',
      item_name: 'QA FE Retest 0717',
    });
    expect(write.upserted).toBe(1);

    const overview = await service.getOverview('xevn', 'holding');
    const row = overview.catalogs.find(
      (c) => c.catalogKey === 'activity_capability_map',
    );
    expect(row?.hrmExtensionItems).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'QAFE071710',
          label: 'QA FE Retest 0717',
          origin: 'hrm',
        }),
      ]),
    );
    expect(row?.effectiveItems).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'QAFE071710',
          label: 'QA FE Retest 0717',
        }),
        expect.objectContaining({
          code: 'ACM_01',
          label: 'HRM',
          origin: 'xbos',
        }),
      ]),
    );
  });

  it('edit ACM_01 under holding overrides XBOS label in effectiveItems', async () => {
    await service.upsertCatalogItem('xevn', {
      company_id: 'holding',
      category_key: 'activity_capability_map',
      item_key: 'ACM_01',
      item_name: 'HRM-QA-EDIT-16137',
    });

    const overview = await service.getOverview('xevn', 'holding');
    const row = overview.catalogs.find(
      (c) => c.catalogKey === 'activity_capability_map',
    );
    expect(row?.hrmExtensionItems).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'ACM_01',
          label: 'HRM-QA-EDIT-16137',
          origin: 'hrm',
        }),
      ]),
    );
    const effectiveAcm = row?.effectiveItems.find((i) => i.code === 'ACM_01');
    expect(effectiveAcm).toMatchObject({
      label: 'HRM-QA-EDIT-16137',
      origin: 'hrm',
    });
  });

  it('write to company_id=main is invisible on overview holding (documents pre-fix partition bug)', async () => {
    await service.upsertCatalogItem('xevn', {
      company_id: 'main',
      category_key: 'activity_capability_map',
      item_key: 'ORPHAN_MAIN',
      item_name: 'Should not appear on holding read',
    });

    const overviewHolding = await service.getOverview('xevn', 'holding');
    const row = overviewHolding.catalogs.find(
      (c) => c.catalogKey === 'activity_capability_map',
    );
    expect(row?.hrmExtensionItems ?? []).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'ORPHAN_MAIN' }),
      ]),
    );

    const overviewMain = await service.getOverview('xevn', 'main');
    const mainRow = overviewMain.catalogs.find(
      (c) => c.catalogKey === 'activity_capability_map',
    );
    expect(mainRow?.hrmExtensionItems).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'ORPHAN_MAIN' }),
      ]),
    );
  });
});
