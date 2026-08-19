/**
 * PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-EXT-BE-01 —
 * VAL-EMP-TOK-05 / 05b / 05c · F-EMP-TOK-03 · AC-PLT-EMP-TOK-04*
 * Option B′ · U65 no seed · honesty ready=false
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { HttpStatus } from '@nestjs/common';
import { SettingsCatalogsService } from '../settings-catalogs/settings-catalogs.service';
import { CatalogSyncService } from '../catalog-sync/catalog-sync.service';
import { XbosCatalogWorkflowBridge } from '../settings-catalogs/xbos-catalog-workflow.bridge';
import { HRM_SC_LEAVE_REF_EXTENSION_FORBIDDEN } from '../settings-catalogs/hrm-settings-leave-type-sot';
import type { HrmDbService } from '../db/hrm-db.service';
import {
  EMP_EXTENSION_MERGE_TOKEN_ORIGIN,
  EMP_EXTENSION_MERGE_TOKEN_RING,
  isEmpExtensionFieldCatalogKey,
  mergeTokenKeyForEmpExtension,
  shouldSkipEmpExtensionCoreColumn,
  upsertEmpExtensionFieldMergeToken,
} from './emp-merge-token-register';

function schemaPassthrough(sql: string): boolean {
  const s = String(sql);
  return (
    s.includes('CREATE TABLE') ||
    s.includes('CREATE INDEX') ||
    s.includes('CREATE UNIQUE') ||
    s.includes('ALTER TABLE') ||
    s.includes('DO $$')
  );
}

function mockDb(
  queryImpl: (sql: string, params?: unknown[]) => Promise<{ rows: unknown[] }> | { rows: unknown[] },
): HrmDbService {
  const query = jest.fn().mockImplementation(async (sql: string, params?: unknown[]) => {
    return queryImpl(sql, params);
  });
  return {
    query,
    withTransaction: jest.fn(async (fn: (q: typeof query) => Promise<unknown>) => fn(query)),
  } as unknown as HrmDbService;
}

describe('PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-EXT-BE-01', () => {
  it('allow-list + aliases recognize EMP field catalogs', () => {
    expect(isEmpExtensionFieldCatalogKey('hrm_employee_basic_fields')).toBe(true);
    expect(isEmpExtensionFieldCatalogKey('employee_personal_fields')).toBe(true);
    expect(isEmpExtensionFieldCatalogKey('hrm_employee_work_fields')).toBe(true);
    expect(isEmpExtensionFieldCatalogKey('employee_finance_fields')).toBe(true);
    expect(isEmpExtensionFieldCatalogKey('leave_types')).toBe(false);
    expect(isEmpExtensionFieldCatalogKey('job_titles')).toBe(false);
    expect(isEmpExtensionFieldCatalogKey('hrm_employee_contact_fields')).toBe(false);
  });

  it('key builder custom.emp.<code> + core column skip', () => {
    expect(mergeTokenKeyForEmpExtension('Fleet-Badge')).toBe('custom.emp.fleet_badge');
    expect(shouldSkipEmpExtensionCoreColumn('full_name')).toBe(true);
    expect(shouldSkipEmpExtensionCoreColumn('fleet_badge')).toBe(false);
  });

  it('VAL-EMP-TOK-05: allow-list extension active save → custom.emp.* origin=extension_field', async () => {
    const tokenInserts: unknown[][] = [];
    const db = mockDb(async (sql: string, params?: unknown[]) => {
      if (schemaPassthrough(sql)) return { rows: [] };
      const s = String(sql);
      if (s.includes('INSERT INTO public.hrm_catalog_extension_items')) {
        return { rows: [] };
      }
      if (s.includes('FROM public.hrm_merge_tokens') && s.includes('SELECT id, version')) {
        return { rows: [] };
      }
      if (s.includes('INSERT INTO public.hrm_merge_tokens')) {
        tokenInserts.push(params ?? []);
        return { rows: [] };
      }
      return { rows: [] };
    });

    const service = new SettingsCatalogsService(
      db,
      {
        listSyncedCatalogs: jest.fn(),
        getSyncedCatalogExact: jest.fn().mockResolvedValue(null),
      } as unknown as CatalogSyncService,
      { startCatalogExtensionWorkflow: jest.fn() } as unknown as XbosCatalogWorkflowBridge,
    );

    const out = await service.appendExtensionItems('xevn', 'holding', 'hrm_employee_basic_fields', [
      { code: 'fleet_badge', label: 'Mã thẻ đội xe', unit: 'text', status: 'active' },
    ]);

    expect(out.upserted).toBe(1);
    expect(db.withTransaction).toHaveBeenCalled();
    expect(tokenInserts).toHaveLength(1);
    expect(tokenInserts[0][2]).toBe('custom.emp.fleet_badge');
    expect(tokenInserts[0][3]).toBe('custom.emp.fleet_badge');
    expect(tokenInserts[0][4]).toBe(EMP_EXTENSION_MERGE_TOKEN_RING);
    expect(tokenInserts[0][5]).toBe('EMP');
    expect(tokenInserts[0][6]).toBe('Mã thẻ đội xe');
    expect(tokenInserts[0][7]).toBe(EMP_EXTENSION_MERGE_TOKEN_ORIGIN);
    expect(tokenInserts[0][8]).toBe('fleet_badge');
  });

  it('VAL-EMP-TOK-05: alias catalog employee_work_fields also registers', async () => {
    const tokenInserts: unknown[][] = [];
    const db = mockDb(async (sql: string, params?: unknown[]) => {
      if (schemaPassthrough(sql)) return { rows: [] };
      if (String(sql).includes('INSERT INTO public.hrm_merge_tokens')) {
        tokenInserts.push(params ?? []);
      }
      return { rows: [] };
    });
    const service = new SettingsCatalogsService(
      db,
      {} as CatalogSyncService,
      {} as XbosCatalogWorkflowBridge,
    );
    await service.appendExtensionItems('xevn', 'holding', 'employee_work_fields', [
      { code: 'shift_pod', label: 'Pod ca', status: 'active' },
    ]);
    expect(tokenInserts[0]?.[2]).toBe('custom.emp.shift_pod');
  });

  it('VAL-EMP-TOK-05r: retire allow-list item soft-retires token', async () => {
    const retireCalls: unknown[][] = [];
    const db = mockDb(async (sql: string, params?: unknown[]) => {
      if (schemaPassthrough(sql)) return { rows: [] };
      const s = String(sql);
      if (s.includes('UPDATE public.hrm_catalog_extension_items') && s.includes("status = 'draft'")) {
        return { rows: [{ code: 'fleet_badge', catalog_key: 'hrm_employee_basic_fields' }] };
      }
      if (s.includes('UPDATE public.hrm_merge_tokens') && s.includes("status = 'retired'")) {
        retireCalls.push(params ?? []);
        return { rows: [] };
      }
      return { rows: [] };
    });
    const service = new SettingsCatalogsService(
      db,
      {} as CatalogSyncService,
      {} as XbosCatalogWorkflowBridge,
    );
    const out = await service.deleteCatalogItem('xevn', {
      company_id: 'holding',
      category_key: 'hrm_employee_basic_fields',
      item_key: 'fleet_badge',
    });
    expect(out.status).toBe('draft');
    expect(retireCalls).toHaveLength(1);
    expect(retireCalls[0][1]).toBe('custom.emp.fleet_badge');
  });

  it('VAL-EMP-TOK-05: core column full_name does not invent custom.emp.full_name', async () => {
    const tokenInserts: unknown[][] = [];
    const query = jest.fn().mockImplementation(async (sql: string, params?: unknown[]) => {
      if (schemaPassthrough(sql)) return { rows: [] };
      if (String(sql).includes('INSERT INTO public.hrm_merge_tokens')) {
        tokenInserts.push(params ?? []);
      }
      return { rows: [] };
    });
    const key = await upsertEmpExtensionFieldMergeToken(query, {
      companyId: 'holding',
      code: 'full_name',
      labelVi: 'Họ tên',
      active: true,
    });
    expect(key).toBeNull();
    expect(tokenInserts).toHaveLength(0);
  });

  it('VAL-EMP-TOK-05b: non-allow-list extension save on leave_types → forbidden, must use attendance leave-types API', async () => {
    const tokenSql: string[] = [];
    const db = mockDb(async (sql: string) => {
      if (schemaPassthrough(sql)) return { rows: [] };
      if (String(sql).includes('hrm_merge_tokens')) {
        tokenSql.push(String(sql));
      }
      return { rows: [] };
    });
    const service = new SettingsCatalogsService(
      db,
      {} as CatalogSyncService,
      {} as XbosCatalogWorkflowBridge,
    );
    // leave_types là REF tập đoàn (PO-HRM-SETTINGS-ATT-LVT-SOT-BE-01 đã sealed) —
    // extension-item silent-upsert qua settings-catalogs bị cấm; phải mutate qua
    // /api/hrm/attendance/leave-types (att_leave_type).
    await expect(
      service.appendExtensionItems('xevn', 'holding', 'leave_types', [
        { code: 'annual_extra', label: 'Phép thêm', status: 'active' },
      ]),
    ).rejects.toMatchObject({
      code: HRM_SC_LEAVE_REF_EXTENSION_FORBIDDEN,
      status: HttpStatus.CONFLICT,
    });
    expect(db.withTransaction).not.toHaveBeenCalled();
    expect(tokenSql).toHaveLength(0);
  });

  it('VAL-EMP-TOK-05t: token upsert fail rolls back via withTransaction throw', async () => {
    const db = mockDb(async (sql: string) => {
      if (schemaPassthrough(sql)) return { rows: [] };
      if (String(sql).includes('INSERT INTO public.hrm_catalog_extension_items')) {
        return { rows: [] };
      }
      if (String(sql).includes('FROM public.hrm_merge_tokens')) {
        return { rows: [] };
      }
      if (String(sql).includes('INSERT INTO public.hrm_merge_tokens')) {
        throw new Error('simulated token insert fail');
      }
      return { rows: [] };
    });
    const service = new SettingsCatalogsService(
      db,
      {} as CatalogSyncService,
      {} as XbosCatalogWorkflowBridge,
    );
    await expect(
      service.appendExtensionItems('xevn', 'holding', 'hrm_employee_finance_fields', [
        { code: 'cost_center_ext', label: 'Cost center mở rộng', status: 'active' },
      ]),
    ).rejects.toThrow(/simulated token insert fail/);
    expect(db.withTransaction).toHaveBeenCalled();
  });

  it('VAL-EMP-TOK-05c: employees.service update path has no merge-token register import', () => {
    const src = readFileSync(
      join(__dirname, '../employees/employees.service.ts'),
      'utf8',
    );
    expect(src).not.toMatch(/emp-merge-token-register|upsertEmpExtensionFieldMergeToken|custom\.emp/);
    expect(src).toContain('custom_fields = $');
  });
});
