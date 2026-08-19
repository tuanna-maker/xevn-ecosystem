/**
 * D-HRM-SETTINGS-MD-POS-SEED-BE-01 — G-ORPH-BE-03 retire hardcode SoT
 * Runtime SoT = XBOS/Settings POS catalogs; tenant-position seed = bootstrap-only.
 */
import { SettingsCatalogsService } from './settings-catalogs.service';
import { CatalogSyncService } from '../catalog-sync/catalog-sync.service';
import { HrmDbService } from '../db/hrm-db.service';
import { XbosCatalogWorkflowBridge } from './xbos-catalog-workflow.bridge';
import {
  buildEmptyPositionFieldDefs,
  isTenantPositionSeedEnvAllowed,
} from './tenant-position-catalog';

describe('D-HRM-SETTINGS-MD-POS-SEED-BE-01 tenant-position seed gate', () => {
  const db = {
    query: jest.fn(),
    withTransaction: jest.fn(),
  } as unknown as HrmDbService;
  const catalogSync = {
    listSyncedCatalogs: jest.fn(),
    getSyncedCatalog: jest.fn(),
  } as unknown as CatalogSyncService;
  const xbosWorkflow = {
    startCatalogExtensionWorkflow: jest.fn().mockResolvedValue(undefined),
  } as unknown as XbosCatalogWorkflowBridge;

  let service: SettingsCatalogsService;
  const prevEnv = process.env.HRM_ALLOW_TENANT_POSITION_SEED;

  beforeEach(() => {
    jest.resetAllMocks();
    delete process.env.HRM_ALLOW_TENANT_POSITION_SEED;
    service = new SettingsCatalogsService(db, catalogSync, xbosWorkflow);
    (db.query as jest.Mock).mockResolvedValue({ rows: [] });
    (db.withTransaction as jest.Mock).mockImplementation(
      async (fn: (q: typeof db.query) => Promise<unknown>) => fn(db.query),
    );
    (catalogSync.getSyncedCatalog as jest.Mock).mockRejectedValue(new Error('not synced'));
  });

  afterEach(() => {
    if (prevEnv === undefined) {
      delete process.env.HRM_ALLOW_TENANT_POSITION_SEED;
    } else {
      process.env.HRM_ALLOW_TENANT_POSITION_SEED = prevEnv;
    }
  });

  it('isTenantPositionSeedEnvAllowed defaults false', () => {
    expect(isTenantPositionSeedEnvAllowed({})).toBe(false);
    expect(isTenantPositionSeedEnvAllowed({ HRM_ALLOW_TENANT_POSITION_SEED: '1' })).toBe(true);
  });

  it('buildEmptyPositionFieldDefs has empty select units (honest empty)', () => {
    const defs = buildEmptyPositionFieldDefs();
    expect(defs).toEqual([
      { code: 'department', label: 'Phòng ban', unit: 'select:', status: 'active' },
      { code: 'position', label: 'Chức danh', unit: 'select:', status: 'active' },
    ]);
  });

  it('seedTenantPositionCatalog forbidden without HRM_ALLOW_TENANT_POSITION_SEED', async () => {
    await expect(service.seedTenantPositionCatalog('xe-vietnam', 'xe-vietnam')).rejects.toMatchObject({
      response: { code: 'HRM-CAT-POS-SEED-FORBIDDEN' },
    });
  });

  it('seedTenantPositionCatalogAllTenants forbidden without env allow', async () => {
    await expect(service.seedTenantPositionCatalogAllTenants()).rejects.toMatchObject({
      response: { code: 'HRM-CAT-POS-SEED-FORBIDDEN' },
    });
  });

  it('seedTenantPositionCatalog CONFLICT when job_titles already have active items', async () => {
    process.env.HRM_ALLOW_TENANT_POSITION_SEED = '1';
    (catalogSync.getSyncedCatalog as jest.Mock).mockImplementation(async (key: string) => {
      if (key === 'job_titles') {
        return {
          key: 'job_titles',
          version: 1,
          syncedAt: '2026-07-25T00:00:00.000Z',
          payload: {
            key: 'job_titles',
            items: [{ code: 'ceo', label: 'Giám đốc', status: 'active' }],
          },
        };
      }
      throw new Error('missing');
    });

    await expect(service.seedTenantPositionCatalog('xe-vietnam', 'xe-vietnam')).rejects.toMatchObject({
      response: { code: 'HRM-CAT-POS-SEED-SOT-EXISTS' },
    });
  });

  it('seedTenantPositionCatalog bootstrap OK when env allow + empty POS SoT', async () => {
    process.env.HRM_ALLOW_TENANT_POSITION_SEED = '1';
    let insertParams: unknown[] | undefined;
    (db.query as jest.Mock).mockImplementation(async (sql: string, params?: unknown[]) => {
      if (sql.includes('INSERT INTO public.hrm_catalog_extension_items')) {
        insertParams = params;
      }
      return { rows: [] };
    });

    const out = await service.seedTenantPositionCatalog('xe-vietnam', 'xe-vietnam');
    expect(out.source).toBe('bootstrap_hardcode');
    expect(out.sot).toBe('deprecated_use_xbos_settings');
    expect(out.departmentOptions).toBeGreaterThan(0);
    expect(out.positionOptions).toBeGreaterThan(0);
    expect(out.upserted).toBeGreaterThan(0);
    expect(insertParams?.[2]).toBe('hrm_employee_basic_fields');
    expect(insertParams?.[3]).toEqual(expect.arrayContaining(['department', 'position']));
  });

  it('seedEmployeeProfileTemplate does not embed hardcode position options', async () => {
    const insertCalls: unknown[][] = [];
    (db.query as jest.Mock).mockImplementation(async (sql: string, params?: unknown[]) => {
      if (sql.includes('INSERT INTO public.hrm_catalog_extension_items')) {
        insertCalls.push(params ?? []);
      }
      return { rows: [] };
    });

    await service.seedEmployeeProfileTemplate('xe-vietnam', 'xe-vietnam');
    const basic = insertCalls.find((p) => p[2] === 'hrm_employee_basic_fields');
    expect(basic).toBeDefined();
    const codes = basic?.[3] as string[];
    const units = basic?.[5] as Array<string | null>;
    const deptIdx = codes.indexOf('department');
    const posIdx = codes.indexOf('position');
    expect(units[deptIdx]).toBe('select:');
    expect(units[posIdx]).toBe('select:');
  });

  it('countActivePosMasterItems sums active across POS keys', async () => {
    // Spy avoids family-alias re-count across HRM_SC_POS_KEYS (6 aliases → same SoT).
    jest.spyOn(service, 'getEffectiveItemsForKey').mockImplementation(async (_t, _c, key) => {
      if (key === 'job_titles') {
        return [
          { code: 'a', label: 'A', status: 'active' },
          { code: 'b', label: 'B', status: 'draft' },
        ];
      }
      if (key === 'departments') {
        return [{ code: 'hcns', label: 'HCNS', status: 'active' }];
      }
      return [];
    });

    const n = await service.countActivePosMasterItems('xevn', 'holding');
    expect(n).toBe(2);
  });
});
