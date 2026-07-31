import { SettingsCatalogsService } from './settings-catalogs.service';
import { CatalogSyncService } from '../catalog-sync/catalog-sync.service';
import { HrmDbService } from '../db/hrm-db.service';
import { XbosCatalogWorkflowBridge } from './xbos-catalog-workflow.bridge';

describe('SettingsCatalogsService', () => {
  const db = {
    query: jest.fn(),
  } as unknown as HrmDbService;

  const catalogSync = {
    listSyncedCatalogs: jest.fn(),
    listRemoteCatalogsFromXbos: jest.fn(),
    pullCatalogFromXbos: jest.fn(),
    getSyncedCatalogExact: jest.fn().mockResolvedValue(null),
    getSyncedCatalog: jest.fn().mockRejectedValue(new Error('not synced')),
  } as unknown as CatalogSyncService;

  const xbosWorkflow = {
    startCatalogExtensionWorkflow: jest.fn().mockResolvedValue(undefined),
  } as unknown as XbosCatalogWorkflowBridge;

  let service: SettingsCatalogsService;

  beforeEach(() => {
    jest.resetAllMocks();
    service = new SettingsCatalogsService(db, catalogSync, xbosWorkflow);
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

  describe('appendExtensionItems batch upsert (D-U34-GHR-SYNC-SLOW-01)', () => {
    it('upserts all items in a single INSERT query via unnest', async () => {
      const insertCalls: Array<{ sql: string; params: unknown[] }> = [];
      (db.query as jest.Mock).mockImplementation(async (sql: string, params?: unknown[]) => {
        if (sql.includes('INSERT INTO public.hrm_catalog_extension_items')) {
          insertCalls.push({ sql, params: params ?? [] });
        }
        return { rows: [] };
      });

      const items = [
        { code: 'field_a', label: 'Field A', unit: 'u1' },
        { code: 'field_b', label: 'Field B', status: 'draft' as const },
        { code: 'field_c', label: 'Field C' },
      ];

      const out = await service.appendExtensionItems(
        'XeVN',
        'HOLDING',
        'hrm_employee_basic_fields',
        items,
      );

      expect(out.upserted).toBe(3);
      expect(insertCalls).toHaveLength(1);
      expect(insertCalls[0].sql).toContain('unnest');
      expect(insertCalls[0].sql).toContain('ON CONFLICT');
      expect(insertCalls[0].params).toEqual([
        'xevn',
        'holding',
        'hrm_employee_basic_fields',
        ['field_a', 'field_b', 'field_c'],
        ['Field A', 'Field B', 'Field C'],
        ['u1', null, null],
        ['active', 'draft', 'active'],
      ]);
    });

    it('returns upserted 0 for empty items without INSERT', async () => {
      let insertCount = 0;
      (db.query as jest.Mock).mockImplementation(async (sql: string) => {
        if (sql.includes('INSERT INTO public.hrm_catalog_extension_items')) {
          insertCount += 1;
        }
        return { rows: [] };
      });

      const out = await service.appendExtensionItems('xevn', 'holding', 'positions', []);
      expect(out.upserted).toBe(0);
      expect(insertCount).toBe(0);
    });
  });

  describe('getExtensionBatchDetail catalog scope (PCOMP-W3-BE-05 / P0-4)', () => {
    const batchId = '11111111-1111-4111-8111-111111111111';

    it('returns batch items when tenant and catalog partition match', async () => {
      (db.query as jest.Mock).mockImplementation(async (sql: string) => {
        if (sql.includes('LIMIT 1')) {
          return { rows: [{ tenant_id: 'xevn', company_id: 'holding' }] };
        }
        if (sql.includes('ORDER BY catalog_key')) {
          return {
            rows: [
              {
                id: 'req-1',
                batch_id: batchId,
                tenant_id: 'xevn',
                company_id: 'holding',
                catalog_key: 'job_titles',
                code: 'ext_a',
                label: 'Ext A',
                unit: null,
                status: 'pending',
              },
            ],
          };
        }
        return { rows: [] };
      });

      const out = await service.getExtensionBatchDetail(batchId, 'xevn', 'holding');
      expect(out.batchId).toBe(batchId);
      expect(out.items).toHaveLength(1);
    });

    it('throws HRM-SET-404 when batch does not exist', async () => {
      (db.query as jest.Mock).mockResolvedValue({ rows: [] });
      await expect(service.getExtensionBatchDetail(batchId, 'xevn', 'holding')).rejects.toMatchObject({
        response: { code: 'HRM-SET-404' },
      });
    });

    it('throws HRM-SET-409 when batch company_id is outside catalog partition', async () => {
      (db.query as jest.Mock).mockImplementation(async (sql: string) => {
        if (sql.includes('LIMIT 1')) {
          return { rows: [{ tenant_id: 'xevn', company_id: 'trsport' }] };
        }
        return { rows: [] };
      });
      await expect(
        service.getExtensionBatchDetail(batchId, 'xevn', 'holding', undefined),
      ).rejects.toMatchObject({
        response: { code: 'HRM-SET-409' },
      });
    });

    it('throws HRM-SET-409 when batch tenant_id mismatches caller tenant', async () => {
      (db.query as jest.Mock).mockImplementation(async (sql: string) => {
        if (sql.includes('LIMIT 1')) {
          return { rows: [{ tenant_id: 'xe-du-lich', company_id: 'main' }] };
        }
        return { rows: [] };
      });
      await expect(service.getExtensionBatchDetail(batchId, 'xevn', 'holding')).rejects.toMatchObject({
        response: { code: 'HRM-SET-409' },
      });
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
