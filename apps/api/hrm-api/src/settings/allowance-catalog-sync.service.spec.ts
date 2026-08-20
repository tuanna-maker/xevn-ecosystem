/**
 * PO-HRM-ALLOWANCE-CATALOG-SYNC-BE-01
 * Jest VAL-ALLOW-01..15 + ensureSchema + scope_parity + sync TX rollback + PAY guard
 */
import { ApiException } from '../common/api.exception';
import { signServiceJwt } from '../common/jwt-sign';
import { HrmDbService } from '../db/hrm-db.service';
import { PayrollCatalogService } from '../payroll/payroll-catalog.service';
import { MERGE_TOKEN_ORIGINS } from '../merge-tokens/merge-token.constants';
import { resolveCatalogFamily } from '../settings-catalogs/hrm-settings-master-keys';
import { AllowanceCatalogSyncService } from './allowance-catalog-sync.service';
import {
  HRM_ALLOW_CAT_409_CODE,
  HRM_ALLOW_CAT_409_DUAL_WRITE,
  HRM_ALLOW_CAT_409_LINKED,
  HRM_ALLOW_CAT_CODE_INVALID,
  HRM_ALLOW_CAT_NATURE_MISMATCH,
  HRM_ALLOW_CAT_404,
  HRM_ALLOW_CAT_500_SYNC,
  HRM_PAY_FORMULA_404_DEF,
  isAllowanceDeductionComponentType,
  mergeTokenKeyForEntry,
} from './allowance-catalog.constants';

const PC_ID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const SC_ID = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
const FORMULA_ID = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee';

function groupCeoToken() {
  return `Bearer ${signServiceJwt({
    sub: 'ceo@xe.vn',
    tenantId: 'xevn',
    companyId: 'main',
    roleCode: 'group_ceo',
  })}`;
}

function memberCeoToken() {
  return `Bearer ${signServiceJwt({
    sub: 'du-lich.ceo@xe.vn',
    tenantId: 'xe-du-lich',
    companyId: 'main',
    roleCode: 'subsidiary_ceo',
  })}`;
}

function basePc(overrides: Record<string, unknown> = {}) {
  return {
    id: PC_ID,
    company_id: 'holding',
    code: 'PC_DIEU_XE',
    name_vi: 'Phụ cấp điều xe',
    entry_kind: 'allowance',
    nature: 'income',
    value_type: 'currency',
    is_taxable: false,
    is_insurance_base: false,
    calc_mode: 'fixed',
    default_value: 500000,
    min_value: null,
    max_value: null,
    default_formula_definition_id: null,
    salary_component_id: SC_ID,
    component_code: 'PC_DIEU_XE',
    description: null,
    sort_order: 10,
    status: 'active',
    is_system: false,
    archived_at: null,
    created_at: '2026-08-07T00:00:00Z',
    updated_at: '2026-08-07T00:00:00Z',
    created_by: null,
    updated_by: null,
    sc_component_type: 'phu_cap',
    sc_name: 'Phụ cấp điều xe',
    formula_code: null,
    formula_version: null,
    formula_status: null,
    ...overrides,
  };
}

describe('AllowanceCatalogSyncService (PO-HRM-ALLOWANCE-CATALOG-SYNC-BE-01)', () => {
  it('ensureSchema ADD hrm_allowance_deduction_types + CHKs; FORBIDDEN closed code IN', async () => {
    const sqls: string[] = [];
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        sqls.push(String(sql));
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new AllowanceCatalogSyncService(db);
    await svc.ensureSchemaPublic();
    const joined = sqls.join('\n');
    expect(joined).toMatch(
      /CREATE TABLE IF NOT EXISTS public\.hrm_allowance_deduction_types/i,
    );
    expect(joined).toMatch(/chk_allow_entry_kind/i);
    expect(joined).toMatch(/chk_allow_code_format/i);
    expect(joined).not.toMatch(/CHECK\s*\(\s*code\s+IN\s*\(/i);
  });

  it('CATALOG_FAMILIES resolves allowance_deduction aliases', () => {
    expect(resolveCatalogFamily('phu_cap_khau_tru').storageKey).toBe(
      'allowance_deduction_types',
    );
    expect(resolveCatalogFamily('allowance_types').familyId).toBe(
      'allowance_deduction',
    );
  });

  it('VAL-ALLOW-02: invalid slug → HRM-ALLOW-CAT-CODE-INVALID', async () => {
    const db = {
      query: jest.fn().mockResolvedValue({ rows: [] }),
      withTransaction: jest.fn(),
    } as unknown as HrmDbService;
    const svc = new AllowanceCatalogSyncService(db);
    await expect(
      svc.createType(
        {
          companyId: 'holding',
          code: 'bad code!',
          nameVi: 'X',
          entryKind: 'allowance',
        },
        groupCeoToken(),
        'xevn',
      ),
    ).rejects.toMatchObject({ code: HRM_ALLOW_CAT_CODE_INVALID });
  });

  it('VAL-ALLOW-03: entryKind/nature mismatch', async () => {
    const db = {
      query: jest.fn().mockResolvedValue({ rows: [] }),
      withTransaction: jest.fn(),
    } as unknown as HrmDbService;
    const svc = new AllowanceCatalogSyncService(db);
    await expect(
      svc.createType(
        {
          companyId: 'holding',
          code: 'PC_DIEU_XE',
          nameVi: 'PC',
          entryKind: 'allowance',
          nature: 'deduction',
        },
        groupCeoToken(),
        'xevn',
      ),
    ).rejects.toMatchObject({ code: HRM_ALLOW_CAT_NATURE_MISMATCH });
  });

  it('VAL-ALLOW-01: duplicate active code → 409 CODE', async () => {
    const db = {
      query: jest.fn().mockResolvedValue({ rows: [] }),
      withTransaction: jest.fn().mockImplementation(async (fn) => {
        const query = jest.fn().mockImplementation(async (sql: string) => {
          if (
            String(sql).includes('FROM public.hrm_allowance_deduction_types') &&
            String(sql).includes('lower(code)')
          ) {
            return { rows: [{ id: PC_ID }] };
          }
          return { rows: [] };
        });
        return fn(query);
      }),
    } as unknown as HrmDbService;
    const svc = new AllowanceCatalogSyncService(db);
    await expect(
      svc.createType(
        {
          companyId: 'holding',
          code: 'PC_DIEU_XE',
          nameVi: 'PC',
          entryKind: 'allowance',
        },
        groupCeoToken(),
        'xevn',
      ),
    ).rejects.toMatchObject({ code: HRM_ALLOW_CAT_409_CODE });
  });

  it('VAL-ALLOW-04: bad formula FK → HRM-PAY-FORMULA-404-DEF', async () => {
    const db = {
      query: jest.fn().mockResolvedValue({ rows: [] }),
      withTransaction: jest.fn().mockImplementation(async (fn) => {
        const query = jest.fn().mockImplementation(async (sql: string) => {
          const s = String(sql);
          if (
            s.includes('FROM public.hrm_allowance_deduction_types') &&
            s.includes('lower(code)')
          ) {
            return { rows: [] };
          }
          if (s.includes('FROM public.pay_formula_definitions')) {
            return { rows: [] };
          }
          return { rows: [] };
        });
        return fn(query);
      }),
    } as unknown as HrmDbService;
    const svc = new AllowanceCatalogSyncService(db);
    await expect(
      svc.createType(
        {
          companyId: 'holding',
          code: 'PC_DIEU_XE',
          nameVi: 'PC',
          entryKind: 'allowance',
          defaultFormulaDefinitionId: FORMULA_ID,
        },
        groupCeoToken(),
        'xevn',
      ),
    ).rejects.toMatchObject({ code: HRM_PAY_FORMULA_404_DEF });
  });

  it('VAL-ALLOW-06 scope_parity: list id under main → getById 200 (holding)', async () => {
    const row = basePc();
    const db = {
      query: jest
        .fn()
        .mockImplementation(async (sql: string, params?: unknown[]) => {
          const s = String(sql);
          if (
            s.includes('CREATE TABLE') ||
            s.includes('ALTER TABLE') ||
            s.includes('CREATE INDEX') ||
            s.includes('DO $$')
          ) {
            return { rows: [] };
          }
          if (
            s.includes('FROM public.hrm_allowance_deduction_types pc') &&
            s.includes('ORDER BY')
          ) {
            expect(JSON.stringify(params ?? [])).toMatch(/holding|main/);
            return { rows: [row] };
          }
          if (
            s.includes('FROM public.hrm_allowance_deduction_types pc') &&
            s.includes('LIMIT 1')
          ) {
            return { rows: [row] };
          }
          return { rows: [] };
        }),
    } as unknown as HrmDbService;
    const svc = new AllowanceCatalogSyncService(db);
    const auth = groupCeoToken();
    const list = await svc.listTypes({ company_id: 'main' }, auth, 'xevn');
    expect(list.items).toHaveLength(1);
    expect(list.payroll_e2e_ready).toBe(false);
    const detail = await svc.getById(PC_ID, 'main', auth, 'xevn');
    expect(detail.id).toBe(PC_ID);
    expect(detail.companyId).toBe('holding');
  });

  it('VAL-ALLOW-12: member CEO cannot get holding PC row', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        const s = String(sql);
        if (
          s.includes('CREATE TABLE') ||
          s.includes('ALTER') ||
          s.includes('DO $$') ||
          s.includes('CREATE INDEX')
        ) {
          return { rows: [] };
        }
        if (s.includes('LIMIT 1')) return { rows: [] };
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new AllowanceCatalogSyncService(db);
    await expect(
      svc.getById(PC_ID, 'main', memberCeoToken(), 'xe-du-lich'),
    ).rejects.toMatchObject({
      code: HRM_ALLOW_CAT_404,
    });
  });

  it('VAL-ALLOW-09/10: sync TX rollback on token fail → HRM-ALLOW-CAT-500-SYNC', async () => {
    const db = {
      query: jest.fn().mockResolvedValue({ rows: [] }),
      withTransaction: jest.fn().mockImplementation(async (fn) => {
        const query = jest.fn().mockImplementation(async (sql: string) => {
          const s = String(sql);
          if (
            s.includes('FROM public.hrm_allowance_deduction_types') &&
            s.includes('lower(code)')
          ) {
            return { rows: [] };
          }
          if (s.includes('INSERT INTO public.hrm_allowance_deduction_types')) {
            return { rows: [basePc({ salary_component_id: null })] };
          }
          if (s.includes('salary_components')) {
            if (s.includes('RETURNING id')) return { rows: [{ id: SC_ID }] };
            return { rows: [] };
          }
          if (s.includes('hrm_merge_tokens') && s.includes('INSERT')) {
            throw new Error('token register boom');
          }
          return { rows: [] };
        });
        try {
          return await fn(query);
        } catch (e) {
          throw e;
        }
      }),
    } as unknown as HrmDbService;
    const svc = new AllowanceCatalogSyncService(db);
    await expect(
      svc.createType(
        {
          companyId: 'holding',
          code: 'PC_DIEU_XE',
          nameVi: 'PC',
          entryKind: 'allowance',
        },
        groupCeoToken(),
        'xevn',
      ),
    ).rejects.toMatchObject({ code: HRM_ALLOW_CAT_500_SYNC });
    expect(db.withTransaction).toHaveBeenCalled();
  });

  it('VAL-ALLOW-14/15: create sync returns salaryComponentId + mergeTokenKey', async () => {
    const db = {
      query: jest.fn().mockResolvedValue({ rows: [] }),
      withTransaction: jest.fn().mockImplementation(async (fn) => {
        const query = jest.fn().mockImplementation(async (sql: string) => {
          const s = String(sql);
          if (
            s.includes('FROM public.hrm_allowance_deduction_types') &&
            s.includes('lower(code)')
          ) {
            return { rows: [] };
          }
          if (s.includes('INSERT INTO public.hrm_allowance_deduction_types')) {
            return { rows: [basePc({ salary_component_id: null })] };
          }
          if (
            s.includes('FROM public.salary_components') &&
            s.includes('lower(code)')
          ) {
            return { rows: [] };
          }
          if (s.includes('INSERT INTO public.salary_components')) {
            return { rows: [{ id: SC_ID }] };
          }
          if (
            s.includes('UPDATE public.salary_components') &&
            s.includes('RETURNING id')
          ) {
            return { rows: [{ id: SC_ID }] };
          }
          if (
            s.includes('FROM public.hrm_merge_tokens') &&
            s.includes('lower(token_key)')
          ) {
            return { rows: [] };
          }
          if (s.includes('INSERT INTO public.hrm_merge_tokens')) {
            return { rows: [] };
          }
          if (
            s.includes('UPDATE public.hrm_allowance_deduction_types') &&
            s.includes('salary_component_id')
          ) {
            return { rows: [] };
          }
          return { rows: [] };
        });
        return fn(query);
      }),
    } as unknown as HrmDbService;
    const svc = new AllowanceCatalogSyncService(db);
    const out = await svc.createType(
      {
        companyId: 'holding',
        code: 'PC_DIEU_XE',
        nameVi: 'Phụ cấp điều xe',
        entryKind: 'allowance',
      },
      groupCeoToken(),
      'xevn',
    );
    expect(out.salaryComponentId).toBe(SC_ID);
    expect(out.sync.mergeTokenKey).toBe(
      mergeTokenKeyForEntry('allowance', 'PC_DIEU_XE'),
    );
    expect(out.payroll_e2e_ready).toBe(false);
  });

  it('VAL-ALLOW-07: retire with policy lines → 200 + policyOrphanWarn', async () => {
    const db = {
      query: jest.fn().mockResolvedValue({ rows: [] }),
      withTransaction: jest.fn().mockImplementation(async (fn) => {
        const query = jest.fn().mockImplementation(async (sql: string) => {
          const s = String(sql);
          if (
            s.includes('SELECT * FROM public.hrm_allowance_deduction_types')
          ) {
            return { rows: [basePc()] };
          }
          if (s.includes('hrm_position_compensation_policy_lines')) {
            return { rows: [{ c: '2' }] };
          }
          if (
            s.includes('UPDATE public.hrm_allowance_deduction_types') &&
            s.includes("status = 'retired'")
          ) {
            return {
              rows: [
                basePc({
                  status: 'retired',
                  archived_at: '2026-08-07T01:00:00Z',
                }),
              ],
            };
          }
          return { rows: [] };
        });
        return fn(query);
      }),
    } as unknown as HrmDbService;
    const svc = new AllowanceCatalogSyncService(db);
    const out = await svc.retireType(PC_ID, 'main', groupCeoToken(), 'xevn');
    expect(out.status).toBe('retired');
    expect(out.policyOrphanWarn?.activePolicyLineCount).toBe(2);
  });

  it('D-ALLOW-CAT-QA-01 / VAL-ALLOW-09: policy-line COUNT fail uses SAVEPOINT — retire still 200 (no aborted TX)', async () => {
    let txAborted = false;
    const sqlLog: string[] = [];
    const db = {
      query: jest.fn().mockResolvedValue({ rows: [] }),
      withTransaction: jest.fn().mockImplementation(async (fn) => {
        const query = jest.fn().mockImplementation(async (sql: string) => {
          const s = String(sql);
          sqlLog.push(s.trim().slice(0, 80));
          if (/^SAVEPOINT\s+/i.test(s.trim())) {
            return { rows: [] };
          }
          if (/^ROLLBACK\s+TO\s+SAVEPOINT/i.test(s.trim())) {
            txAborted = false;
            return { rows: [] };
          }
          if (/^RELEASE\s+SAVEPOINT/i.test(s.trim())) {
            return { rows: [] };
          }
          if (txAborted) {
            throw new Error(
              'current transaction is aborted, commands ignored until end of transaction block',
            );
          }
          if (
            s.includes('SELECT * FROM public.hrm_allowance_deduction_types')
          ) {
            return { rows: [basePc()] };
          }
          if (s.includes('hrm_position_compensation_policy_lines')) {
            txAborted = true;
            throw Object.assign(
              new Error(
                'relation "public.hrm_position_compensation_policy_lines" does not exist',
              ),
              { code: '42P01' },
            );
          }
          if (
            s.includes('UPDATE public.hrm_allowance_deduction_types') &&
            s.includes("status = 'retired'")
          ) {
            return {
              rows: [
                basePc({
                  status: 'retired',
                  archived_at: '2026-08-07T01:00:00Z',
                }),
              ],
            };
          }
          if (
            s.includes('UPDATE public.salary_components') &&
            s.includes('is_active = FALSE')
          ) {
            return { rows: [] };
          }
          return { rows: [] };
        });
        return fn(query);
      }),
    } as unknown as HrmDbService;
    const svc = new AllowanceCatalogSyncService(db);
    const out = await svc.retireType(PC_ID, 'main', groupCeoToken(), 'xevn');
    expect(out.status).toBe('retired');
    expect(out.policyOrphanWarn).toBeUndefined();
    expect(
      sqlLog.some((s) => /SAVEPOINT\s+allow_cat_policy_line_count/i.test(s)),
    ).toBe(true);
    expect(
      sqlLog.some((s) =>
        /ROLLBACK\s+TO\s+SAVEPOINT\s+allow_cat_policy_line_count/i.test(s),
      ),
    ).toBe(true);
    expect(sqlLog.some((s) => s.includes("status = 'retired'"))).toBe(true);
    expect(sqlLog.some((s) => s.includes('is_active = FALSE'))).toBe(true);
    expect(txAborted).toBe(false);
  });

  it('VAL-ALLOW-05 helper: phu_cap|khau_tru detected as PC/KT class', () => {
    expect(isAllowanceDeductionComponentType('phu_cap')).toBe(true);
    expect(isAllowanceDeductionComponentType('khau_tru')).toBe(true);
    expect(isAllowanceDeductionComponentType('luong')).toBe(false);
  });
});

describe('PayrollCatalogService dual-write guard (VAL-ALLOW-11/13)', () => {
  it('VAL-ALLOW-13: POST PAY phu_cap → HRM-ALLOW-CAT-409-DUAL-WRITE', async () => {
    const db = {
      query: jest.fn().mockResolvedValue({ rows: [] }),
    } as unknown as HrmDbService;
    const settings = {
      assertCodeInEffectiveCatalog: jest
        .fn()
        .mockResolvedValue({ code: 'phu_cap' }),
    };
    const svc = new PayrollCatalogService(db, settings as never);
    await expect(
      svc.createSalaryComponent(
        {
          company_id: 'holding',
          code: 'PC_ORPHAN',
          name: 'Orphan PC',
          component_type: 'phu_cap',
        },
        groupCeoToken(),
      ),
    ).rejects.toMatchObject({ code: HRM_ALLOW_CAT_409_DUAL_WRITE });
  });

  it('VAL-ALLOW-11: DELETE linked SC → HRM-ALLOW-CAT-409-LINKED', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        const s = String(sql);
        if (
          s.includes('CREATE TABLE') ||
          s.includes('ALTER') ||
          s.includes('CREATE INDEX')
        ) {
          return { rows: [] };
        }
        if (
          s.includes('FROM public.hrm_allowance_deduction_types') &&
          s.includes('salary_component_id')
        ) {
          return { rows: [{ id: PC_ID }] };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new PayrollCatalogService(db);
    await expect(
      svc.deleteSalaryComponent(SC_ID, 'holding', groupCeoToken()),
    ).rejects.toMatchObject({
      code: HRM_ALLOW_CAT_409_LINKED,
    });
  });

  it('PAY-native LUONG_CO_BAN create not blocked by dual-write guard', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        const s = String(sql);
        if (
          s.includes('CREATE TABLE') ||
          s.includes('ALTER') ||
          s.includes('CREATE INDEX')
        ) {
          return { rows: [] };
        }
        if (
          s.includes('FROM public.salary_components') &&
          s.includes('lower(code)')
        ) {
          return { rows: [] };
        }
        if (s.includes('INSERT INTO public.salary_components')) {
          return {
            rows: [
              {
                id: SC_ID,
                company_id: 'holding',
                code: 'LUONG_CO_BAN_X',
                name: 'Lương',
                component_type: 'luong',
                nature: 'income',
                value_type: 'currency',
                is_taxable: true,
                is_insurance_base: true,
                formula: null,
                default_value: 0,
                archived_at: null,
                is_system: false,
              },
            ],
          };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const settings = {
      assertCodeInEffectiveCatalog: jest
        .fn()
        .mockResolvedValue({ code: 'luong' }),
    };
    const svc = new PayrollCatalogService(db, settings as never);
    const out = await svc.createSalaryComponent(
      {
        company_id: 'holding',
        code: 'LUONG_CO_BAN_X',
        name: 'Lương',
        component_type: 'luong',
      },
      groupCeoToken(),
    );
    expect(out.code).toBe('LUONG_CO_BAN_X');
    expect(out.payroll_e2e_ready).toBe(false);
  });
});

describe('MergeToken origin EXPAND allowance_catalog', () => {
  it('constants include allowance_catalog', () => {
    expect(MERGE_TOKEN_ORIGINS).toContain('allowance_catalog');
  });
});
