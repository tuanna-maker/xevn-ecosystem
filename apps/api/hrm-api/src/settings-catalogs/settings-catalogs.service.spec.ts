import { HttpStatus } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { SettingsCatalogsService } from './settings-catalogs.service';
import { CatalogSyncService } from '../catalog-sync/catalog-sync.service';
import { HrmDbService } from '../db/hrm-db.service';
import { XbosCatalogWorkflowBridge } from './xbos-catalog-workflow.bridge';

describe('SettingsCatalogsService', () => {
  const db = {
    query: jest.fn(),
    withTransaction: jest.fn(),
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
    (db.withTransaction as jest.Mock).mockImplementation(
      async (fn: (q: typeof db.query) => Promise<unknown>) => fn(db.query),
    );
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
      // F-EMP-TOK-03 — allow-list path uses same TX
      expect(db.withTransaction).toHaveBeenCalled();
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
    const positions = out.catalogs.find((c) => c.catalogKey === 'positions');
    expect(positions).toBeDefined();
    expect(positions!.xbosItems).toHaveLength(1);
    expect(positions!.hrmExtensionItems).toHaveLength(1);
    expect(positions!.effectiveItems.map((i) => i.code).sort()).toEqual(['dev', 'pm']);
    // O4 + allowance synthesize open keys when unsynced (honest empty / PC table).
    expect(out.catalogs.some((c) => c.catalogKey === 'salary_components')).toBe(true);
    expect(out.catalogs.some((c) => c.catalogKey === 'allowance_deduction_types')).toBe(true);
  });

  describe('getOverview salary_components O4 (PO-HRM-E2E-LINK-PAY-CFG-O4-SC-KEY-BE-01)', () => {
    it('synthesizes empty salary_components when XBOS/extension absent — Select can FE-append', async () => {
      (catalogSync.listSyncedCatalogs as jest.Mock).mockResolvedValue({ total: 0, data: [] });
      (db.query as jest.Mock).mockImplementation(async (sql: string) => {
        if (sql.includes('FROM public.hrm_catalog_extension_items')) {
          return { rows: [] };
        }
        if (sql.includes('hrm_catalog_extension_requests')) {
          return { rows: [] };
        }
        return { rows: [] };
      });

      const out = await service.getOverview('xevn', 'holding');
      const sc = out.catalogs.find((c) => c.catalogKey === 'salary_components');
      expect(sc).toBeDefined();
      expect(sc!.familyId).toBe('pay_comp');
      expect(sc!.name).toBe('Thành phần lương (danh mục)');
      expect(sc!.effectiveItems).toEqual([]);
      expect(sc!.xbosItems).toEqual([]);
      expect(sc!.hrmExtensionItems).toEqual([]);
      expect(sc!.aliases).toEqual(expect.arrayContaining(['salary_components', 'payroll_components']));
    });

    it('does not duplicate salary_components when extension already present', async () => {
      (catalogSync.listSyncedCatalogs as jest.Mock).mockResolvedValue({ total: 0, data: [] });
      (db.query as jest.Mock).mockImplementation(async (sql: string) => {
        if (sql.includes('FROM public.hrm_catalog_extension_items')) {
          return {
            rows: [
              {
                catalog_key: 'salary_components',
                code: 'PC_AN_TRUA',
                label: 'Phụ cấp ăn trưa',
                unit: null,
                status: 'active',
              },
            ],
          };
        }
        if (sql.includes('hrm_catalog_extension_requests')) {
          return { rows: [] };
        }
        return { rows: [] };
      });

      const out = await service.getOverview('xevn', 'holding');
      const scRows = out.catalogs.filter((c) => c.familyId === 'pay_comp');
      expect(scRows).toHaveLength(1);
      expect(scRows[0].effectiveItems.map((i) => i.code)).toEqual(['PC_AN_TRUA']);
    });
  });

  describe('getOverview corrupt catalog keys (PO-MFD-M2-ATT-SETTINGS-CATALOG-500-01)', () => {
    it('skips blank/null synced keys — returns 200-shaped overview not throw', async () => {
      (catalogSync.listSyncedCatalogs as jest.Mock).mockResolvedValue({
        total: 2,
        data: [
          {
            tenantId: 'xevn',
            companyId: 'holding',
            key: '',
            source: 'xbos',
            version: 1,
            checksum: 'x',
            syncedAt: '2026-01-01T00:00:00.000Z',
            payload: { items: [] },
          },
          {
            tenantId: 'xevn',
            companyId: 'holding',
            key: 'leave_types',
            source: 'xbos',
            version: 1,
            checksum: 'y',
            syncedAt: '2026-01-01T00:00:00.000Z',
            payload: {
              items: [{ code: 'LVT_01', label: 'Phép năm', status: 'active' }],
            },
          },
        ],
      });
      (db.query as jest.Mock).mockImplementation(async (sql: string) => {
        if (sql.includes('FROM public.hrm_catalog_extension_items')) {
          return { rows: [] };
        }
        if (sql.includes('hrm_catalog_extension_requests')) {
          return { rows: [] };
        }
        return { rows: [] };
      });

      const out = await service.getOverview('xevn', 'holding');
      const keys = out.catalogs.map((c) => c.catalogKey);
      expect(keys).toContain('leave_types');
      expect(keys).toContain('salary_components');
      expect(keys).toContain('allowance_deduction_types');
      expect(keys).not.toContain('');
    });
  });

  describe('listPickerItems invalid catalogKey', () => {
    it('throws HRM-SET-001 400 for invalid :catalogKey (deterministic, not HRM-SYS-001)', async () => {
      await expect(
        service.listPickerItems('xevn', 'holding', 'not valid key!', { status: 'active' }),
      ).rejects.toMatchObject({
        response: { code: 'HRM-SET-001' },
        status: HttpStatus.BAD_REQUEST,
      });
    });
  });

  describe('syncAllFromXbos (PO-UC-TC-W4-BE-SYNC-XBOSS-500)', () => {
    it('happy path pulls remote keys in parallel batches', async () => {
      (catalogSync.listRemoteCatalogsFromXbos as jest.Mock).mockResolvedValue({
        total: 2,
        data: [{ key: 'job_titles' }, { key: 'departments' }],
      });
      (catalogSync.pullCatalogFromXbos as jest.Mock).mockResolvedValue({ key: 'ok' });

      const out = await service.syncAllFromXbos('xevn', 'holding', 'Bearer t');
      expect(out.pulledKeys).toEqual(['job_titles', 'departments']);
      expect(out.skippedKeys).toEqual([]);
      expect(catalogSync.pullCatalogFromXbos).toHaveBeenCalledTimes(2);
      expect(catalogSync.pullCatalogFromXbos).toHaveBeenCalledWith(
        'job_titles',
        'xevn',
        'holding',
        'Bearer t',
      );
    });

    it('maps XBOS unreachable (list) to HRM-SYNC-001 502 — never bare Error 500', async () => {
      (catalogSync.listRemoteCatalogsFromXbos as jest.Mock).mockRejectedValue(
        new TypeError('fetch failed'),
      );
      await expect(service.syncAllFromXbos('xevn', 'holding')).rejects.toMatchObject({
        code: 'HRM-SYNC-001',
        status: HttpStatus.BAD_GATEWAY,
      });
    });

    it('soft-skips transient XBOS 5xx mid-pull so other keys still return', async () => {
      (catalogSync.listRemoteCatalogsFromXbos as jest.Mock).mockResolvedValue({
        total: 2,
        data: [{ key: 'leave_types' }, { key: 'candidate_statuses' }],
      });
      (catalogSync.pullCatalogFromXbos as jest.Mock).mockImplementation(async (key: string) => {
        if (key === 'candidate_statuses') {
          throw new ApiException('HRM-SYNC-001', 'XBOS API error 500', HttpStatus.BAD_GATEWAY);
        }
        return { key };
      });
      const out = await service.syncAllFromXbos('xevn', 'trsport');
      expect(out.pulledKeys).toEqual(['leave_types']);
      expect(out.skippedKeys).toEqual(['candidate_statuses']);
    });

    it('propagates non-5xx HRM-SYNC-001 from mid-pull as 502', async () => {
      (catalogSync.listRemoteCatalogsFromXbos as jest.Mock).mockResolvedValue({
        total: 1,
        data: [{ key: 'job_titles' }],
      });
      (catalogSync.pullCatalogFromXbos as jest.Mock).mockRejectedValue(
        new ApiException('HRM-SYNC-001', 'XBOS API request timed out', HttpStatus.BAD_GATEWAY),
      );
      await expect(service.syncAllFromXbos('xevn', 'holding')).rejects.toMatchObject({
        code: 'HRM-SYNC-001',
        status: HttpStatus.BAD_GATEWAY,
      });
    });

    it('skips soft HRM-SYNC-002 misses and still returns pulled keys', async () => {
      (catalogSync.listRemoteCatalogsFromXbos as jest.Mock).mockResolvedValue({
        total: 2,
        data: [{ key: 'job_titles' }, { key: 'ghost_catalog' }],
      });
      (catalogSync.pullCatalogFromXbos as jest.Mock).mockImplementation(async (key: string) => {
        if (key === 'ghost_catalog') {
          throw new ApiException('HRM-SYNC-002', 'missing', HttpStatus.NOT_FOUND);
        }
        return { key };
      });
      const out = await service.syncAllFromXbos('xevn', 'holding');
      expect(out.pulledKeys).toEqual(['job_titles']);
      expect(out.skippedKeys).toEqual(['ghost_catalog']);
    });
  });
});
