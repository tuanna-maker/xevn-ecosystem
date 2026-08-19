/**
 * D-BE-ERP-E1B-ALIAS-KEYS-01 — resolveCatalogFamily + DEC family merge + pull try-list.
 * @see docs/hrm/API_DESIGN_HRM_SETTINGS_E1B.md §0–§7
 */
import {
  HRM_E1B_MASTER_SURFACE_KEYS,
  HRM_SC_DEC_ALIASES,
  HRM_SC_DEC_KEY,
  HRM_SC_DEC_STORAGE_KEY,
  catalogAliasTryList,
  isE1bMasterCatalogKey,
  resolveCatalogFamily,
} from './hrm-settings-master-keys';
import { SettingsCatalogsService } from './settings-catalogs.service';
import { CatalogSyncService } from '../catalog-sync/catalog-sync.service';
import { HrmDbService } from '../db/hrm-db.service';
import { XbosCatalogWorkflowBridge } from './xbos-catalog-workflow.bridge';
import { ApiException } from '../common/api.exception';
import { HttpStatus } from '@nestjs/common';

describe('D-BE-ERP-E1B-ALIAS-KEYS-01', () => {
  describe('resolveCatalogFamily', () => {
    it('DEC: decision_types and hr_decision_types share family dec_types', () => {
      const a = resolveCatalogFamily('decision_types');
      const b = resolveCatalogFamily('hr_decision_types');
      expect(a.familyId).toBe('dec_types');
      expect(b.familyId).toBe('dec_types');
      expect(a.storageKey).toBe(HRM_SC_DEC_STORAGE_KEY);
      expect(b.storageKey).toBe(HRM_SC_DEC_STORAGE_KEY);
      expect([...a.aliases].sort()).toEqual([...HRM_SC_DEC_ALIASES].sort());
    });

    it('pull try-list prefers hr_decision_types first', () => {
      expect(catalogAliasTryList('decision_types')[0]).toBe('hr_decision_types');
      expect(catalogAliasTryList(HRM_SC_DEC_KEY)).toContain('decision_types');
    });

    it('E1-B surface allow-list has ≥10 logical buckets (aliases expand count)', () => {
      const families = new Set(
        HRM_E1B_MASTER_SURFACE_KEYS.map((k) => resolveCatalogFamily(k).familyId),
      );
      // pos, org, leave, dec, contract, emp, shift, grade, rec, pay_nature, pay_comp, pay_tpl
      expect(families.size).toBeGreaterThanOrEqual(10);
      expect(isE1bMasterCatalogKey('contract_types')).toBe(true);
      expect(isE1bMasterCatalogKey('pay_types')).toBe(true);
      expect(isE1bMasterCatalogKey('hrm_employee_basic_fields')).toBe(false);
    });

    it('does not treat work_shifts as catalog alias (no dual-write)', () => {
      const fam = resolveCatalogFamily('work_shifts');
      expect(fam.familyId).toBe('self:work_shifts');
      expect(resolveCatalogFamily('shifts').familyId).toBe('shift');
    });
  });

  describe('SettingsCatalogsService DEC family merge', () => {
    const db = { query: jest.fn() } as unknown as HrmDbService;
    const catalogSync = {
      getSyncedCatalogExact: jest.fn(),
      getSyncedCatalog: jest.fn(),
      listSyncedCatalogs: jest.fn(),
    } as unknown as CatalogSyncService;
    const xbosWorkflow = {
      startCatalogExtensionWorkflow: jest.fn(),
    } as unknown as XbosCatalogWorkflowBridge;

    let service: SettingsCatalogsService;

    beforeEach(() => {
      jest.resetAllMocks();
      service = new SettingsCatalogsService(db, catalogSync, xbosWorkflow);
      (db.query as jest.Mock).mockImplementation(async (sql: string) => {
        // DDL / ensure schema
        if (
          sql.includes('CREATE TABLE') ||
          sql.includes('CREATE UNIQUE INDEX') ||
          sql.includes('CREATE INDEX') ||
          sql.includes('ALTER TABLE')
        ) {
          return { rows: [] };
        }
        if (
          sql.includes('FROM public.hrm_catalog_extension_items') &&
          sql.includes('catalog_key = $3')
        ) {
          return { rows: [] };
        }
        return { rows: [] };
      });
    });

    it('getEffectiveItemsForKey(decision_types) merges L1 hr_decision_types items', async () => {
      (catalogSync.getSyncedCatalogExact as jest.Mock).mockImplementation(async (key: string) => {
        if (key === 'hr_decision_types') {
          return {
            key: 'hr_decision_types',
            payload: {
              key: 'hr_decision_types',
              name: 'Loại quyết định',
              items: [
                { code: 'appointment', label: 'Bổ nhiệm', status: 'active' },
                { code: 'transfer', label: 'Điều chuyển', status: 'active' },
                { code: 'discipline', label: 'Kỷ luật', status: 'active' },
              ],
            },
          };
        }
        return null;
      });

      const viaFr = await service.getEffectiveItemsForKey('xevn', 'holding', 'decision_types');
      const viaLive = await service.getEffectiveItemsForKey(
        'xevn',
        'holding',
        'hr_decision_types',
      );

      expect(viaFr).toHaveLength(3);
      expect(viaLive).toHaveLength(3);
      expect(viaFr.map((i) => i.code).sort()).toEqual([
        'appointment',
        'discipline',
        'transfer',
      ]);
      expect(viaLive.map((i) => i.code).sort()).toEqual(viaFr.map((i) => i.code).sort());
    });

    it('assertCodeInEffectiveCatalog accepts code when only hr_decision_types L1 exists', async () => {
      (catalogSync.getSyncedCatalogExact as jest.Mock).mockImplementation(async (key: string) => {
        if (key === 'hr_decision_types') {
          return {
            key: 'hr_decision_types',
            payload: {
              items: [{ code: 'appointment', label: 'Bổ nhiệm', status: 'active' }],
            },
          };
        }
        return null;
      });

      const hit = await service.assertCodeInEffectiveCatalog({
        tenantId: 'xevn',
        companyId: 'holding',
        catalogKey: HRM_SC_DEC_KEY,
        code: 'appointment',
        errorCode: 'HRM-DEC-TYPE',
      });
      expect(hit.code).toBe('appointment');
      expect(hit.origin).toBe('xbos');
    });

    it('listPickerItems returns storageKey + aliases for DEC', async () => {
      (catalogSync.getSyncedCatalogExact as jest.Mock).mockImplementation(async (key: string) => {
        if (key === 'hr_decision_types') {
          return {
            key: 'hr_decision_types',
            payload: {
              items: [{ code: 'appointment', label: 'Bổ nhiệm', status: 'active' }],
            },
          };
        }
        return null;
      });

      const out = await service.listPickerItems('xevn', 'holding', 'decision_types');
      expect(out.catalog_key).toBe('hr_decision_types');
      expect(out.family_id).toBe('dec_types');
      expect(out.aliases).toEqual(expect.arrayContaining(['hr_decision_types', 'decision_types']));
      expect(out.total).toBe(1);
    });
  });

  describe('CatalogSyncService pull alias try-list', () => {
    const originalFetch = global.fetch;

    afterEach(() => {
      global.fetch = originalFetch;
    });

    it('pullCatalogFromXbos(decision_types) succeeds via hr_decision_types', async () => {
      const db = { query: jest.fn().mockResolvedValue({ rows: [] }) } as unknown as HrmDbService;
      const svc = new CatalogSyncService(db);

      process.env.MASTER_TENANT_ID = 'xevn';
      process.env.DEFAULT_COMPANY_ID = 'holding';

      const fetchMock = jest.fn(async (url: string) => {
        if (String(url).includes('/catalog/decision_types')) {
          return {
            ok: false,
            status: 404,
            json: async () => ({ success: false }),
          } as Response;
        }
        if (String(url).includes('/catalog/hr_decision_types')) {
          return {
            ok: true,
            status: 200,
            json: async () => ({
              success: true,
              data: {
                data: {
                  key: 'hr_decision_types',
                  items: [{ code: 'appointment', label: 'Bổ nhiệm' }],
                },
              },
            }),
          } as Response;
        }
        return { ok: false, status: 500, json: async () => ({}) } as Response;
      });
      global.fetch = fetchMock as unknown as typeof fetch;

      (db.query as jest.Mock).mockImplementation(async (sql: string) => {
        if (sql.includes('SELECT catalog_key') && sql.includes('synced_catalogs')) {
          return {
            rows: [
              {
                catalog_key: 'hr_decision_types',
                source_system: 'xbos',
                version: 1,
                checksum: 'x',
                synced_at: new Date().toISOString(),
                payload: { key: 'hr_decision_types', items: [] },
              },
            ],
          };
        }
        return { rows: [] };
      });

      const record = await svc.pullCatalogFromXbos('decision_types', 'xevn', 'holding');
      expect(record.key).toBe('hr_decision_types');
      expect(record.resolvedFrom).toBe('decision_types');
      expect(fetchMock).toHaveBeenCalled();
    });

    it('getSyncedCatalog(decision_types) finds exact hr_decision_types row', async () => {
      const db = {
        query: jest.fn().mockImplementation(async (sql: string, params?: unknown[]) => {
          if (
            sql.includes('CREATE TABLE') ||
            sql.includes('ALTER TABLE') ||
            sql.includes('CREATE UNIQUE') ||
            sql.includes('CREATE INDEX')
          ) {
            return { rows: [] };
          }
          if (sql.includes('FROM public.synced_catalogs') && params?.[0] === 'decision_types') {
            return { rows: [] };
          }
          if (sql.includes('FROM public.synced_catalogs') && params?.[0] === 'hr_decision_types') {
            return {
              rows: [
                {
                  catalog_key: 'hr_decision_types',
                  source_system: 'xbos',
                  version: 2,
                  checksum: 'abc',
                  synced_at: '2026-07-28T00:00:00.000Z',
                  payload: { items: [{ code: 'appointment', label: 'Bổ nhiệm' }] },
                },
              ],
            };
          }
          return { rows: [] };
        }),
      } as unknown as HrmDbService;

      process.env.MASTER_TENANT_ID = 'xevn';
      process.env.DEFAULT_COMPANY_ID = 'holding';
      const svc = new CatalogSyncService(db);
      const row = await svc.getSyncedCatalog('decision_types', 'xevn', 'holding');
      expect(row.key).toBe('hr_decision_types');
      expect(row.resolvedFrom).toBe('decision_types');
    });

    it('pull throws HRM-SYNC-002 when all aliases miss', async () => {
      const db = { query: jest.fn().mockResolvedValue({ rows: [] }) } as unknown as HrmDbService;
      process.env.MASTER_TENANT_ID = 'xevn';
      process.env.DEFAULT_COMPANY_ID = 'holding';
      const svc = new CatalogSyncService(db);
      global.fetch = jest.fn(async () => ({
        ok: false,
        status: 404,
        json: async () => ({ success: false }),
      })) as unknown as typeof fetch;

      await expect(svc.pullCatalogFromXbos('decision_types', 'xevn', 'holding')).rejects.toMatchObject({
        code: 'HRM-SYNC-002',
      });
      try {
        await svc.pullCatalogFromXbos('decision_types', 'xevn', 'holding');
      } catch (e) {
        expect(e).toBeInstanceOf(ApiException);
        expect((e as ApiException).getStatus()).toBe(HttpStatus.NOT_FOUND);
      }
    });
  });
});
