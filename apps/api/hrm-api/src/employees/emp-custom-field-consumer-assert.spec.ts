/**
 * PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-CUSTOM-FIELD-BE-01
 * VAL-EMP-CF-CNS-01 invent KEY · 02 empty skip · 03 retired · 06 scope_parity
 */
import { ApiException } from '../common/api.exception';
import { signServiceJwt } from '../common/jwt-sign';
import { HrmDbQueryFn } from '../db/hrm-db.service';
import {
  assertEmpCustomFieldsAgainstEffectiveCatalog,
  collectEmpCustomFieldInventCandidates,
  countEffectiveActiveEmpExtensionDefs,
  HRM_EMP_CUSTOM_FIELD_KEY,
  isEmpCustomFieldBuiltinKey,
} from './emp-custom-field-consumer-assert';
import { EmployeesService } from './employees.service';
import { HrmDbService } from '../db/hrm-db.service';

type ExtRow = {
  tenant_id: string;
  company_id: string;
  catalog_key: string;
  code: string;
  status: string;
};

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

function makeExtQuery(rows: ExtRow[]): HrmDbQueryFn {
  return (async (sql: string, params?: unknown[]) => {
    const s = String(sql);
    const tenantId = String(params?.[0] ?? '');
    const companyIds = (params?.[1] as string[]) ?? [];
    const catalogKeys = ((params?.[2] as string[]) ?? []).map((k) =>
      k.toLowerCase(),
    );
    const active = rows.filter(
      (r) =>
        r.tenant_id === tenantId &&
        companyIds.includes(r.company_id) &&
        catalogKeys.includes(r.catalog_key.toLowerCase()) &&
        r.status.toLowerCase() === 'active',
    );
    if (s.includes('COUNT(DISTINCT')) {
      const codes = new Set(active.map((r) => r.code.toLowerCase()));
      return { rows: [{ c: String(codes.size) }] };
    }
    if (s.includes('SELECT DISTINCT lower(code)')) {
      const codes = [...new Set(active.map((r) => r.code.toLowerCase()))];
      return { rows: codes.map((code) => ({ code })) };
    }
    return { rows: [] };
  }) as HrmDbQueryFn;
}

describe('emp-custom-field-consumer-assert — VAL-EMP-CF-CNS-*', () => {
  const activeRows: ExtRow[] = [
    {
      tenant_id: 'xevn',
      company_id: 'holding',
      catalog_key: 'hrm_employee_basic_fields',
      code: 'basic_01',
      status: 'active',
    },
    {
      tenant_id: 'xevn',
      company_id: 'main',
      catalog_key: 'hrm_employee_personal_fields',
      code: 'national_id',
      status: 'active',
    },
    {
      tenant_id: 'xevn',
      company_id: 'holding',
      catalog_key: 'hrm_employee_basic_fields',
      code: 'retired_field',
      status: 'draft',
    },
  ];

  it('isEmpCustomFieldBuiltinKey skips tenant_id / department / core columns', () => {
    expect(isEmpCustomFieldBuiltinKey('tenant_id')).toBe(true);
    expect(isEmpCustomFieldBuiltinKey('department')).toBe(true);
    expect(isEmpCustomFieldBuiltinKey('employee_code')).toBe(true);
    expect(isEmpCustomFieldBuiltinKey('zz_invent_emp_cf')).toBe(false);
  });

  it('collectEmpCustomFieldInventCandidates retains history keys (CNS-03)', () => {
    expect(
      collectEmpCustomFieldInventCandidates(
        { tenant_id: 'xevn', retired_field: 'keep', zz_new: 'x' },
        { tenant_id: 'xevn', retired_field: 'old' },
      ),
    ).toEqual(['zz_new']);
  });

  it('VAL-EMP-CF-CNS-01: invent unknown extension when EFF>0 → HRM-EMP-CUSTOM-FIELD-KEY', async () => {
    const query = makeExtQuery(activeRows);
    await expect(
      assertEmpCustomFieldsAgainstEffectiveCatalog({
        query,
        companyId: 'holding',
        customFields: {
          tenant_id: 'xevn',
          zz_invent_emp_cf_msjcubjb: 'invent-gap',
        },
        authorization: groupCeoToken(),
        tenantId: 'xevn',
      }),
    ).rejects.toMatchObject({
      code: HRM_EMP_CUSTOM_FIELD_KEY,
    });
  });

  it('VAL-EMP-CF-CNS-01b: known EFF code passes', async () => {
    const query = makeExtQuery(activeRows);
    await expect(
      assertEmpCustomFieldsAgainstEffectiveCatalog({
        query,
        companyId: 'holding',
        customFields: { tenant_id: 'xevn', basic_01: 'ok' },
        authorization: groupCeoToken(),
        tenantId: 'xevn',
      }),
    ).resolves.toBeUndefined();
  });

  it('VAL-EMP-CF-CNS-02: empty EFF → invent assert skip', async () => {
    const query = makeExtQuery([]);
    await expect(
      assertEmpCustomFieldsAgainstEffectiveCatalog({
        query,
        companyId: 'holding',
        customFields: { zz_invent_when_empty: 'x' },
        authorization: groupCeoToken(),
        tenantId: 'xevn',
      }),
    ).resolves.toBeUndefined();
    expect(
      await countEffectiveActiveEmpExtensionDefs(
        query,
        'holding',
        groupCeoToken(),
        'xevn',
      ),
    ).toBe(0);
  });

  it('VAL-EMP-CF-CNS-03: retired (draft) code treated as invent KEY when EFF>0', async () => {
    const query = makeExtQuery(activeRows);
    await expect(
      assertEmpCustomFieldsAgainstEffectiveCatalog({
        query,
        companyId: 'holding',
        customFields: { retired_field: 'new-write' },
        authorization: groupCeoToken(),
        tenantId: 'xevn',
      }),
    ).rejects.toMatchObject({ code: HRM_EMP_CUSTOM_FIELD_KEY });
  });

  it('VAL-EMP-CF-CNS-03b: history retain retired key on re-save (no KEY)', async () => {
    const query = makeExtQuery(activeRows);
    await expect(
      assertEmpCustomFieldsAgainstEffectiveCatalog({
        query,
        companyId: 'holding',
        customFields: { retired_field: 'keep' },
        previousCustomFields: { retired_field: 'keep' },
        authorization: groupCeoToken(),
        tenantId: 'xevn',
      }),
    ).resolves.toBeUndefined();
  });

  it('VAL-EMP-CF-CNS-06 scope_parity: group CEO main/holding sees holding+main catalog; member tenant isolated', async () => {
    const query = makeExtQuery(activeRows);
    const groupCount = await countEffectiveActiveEmpExtensionDefs(
      query,
      'holding',
      groupCeoToken(),
      'xevn',
    );
    expect(groupCount).toBeGreaterThan(0);

    const memberCount = await countEffectiveActiveEmpExtensionDefs(
      query,
      'main',
      memberCeoToken(),
      'xe-du-lich',
    );
    expect(memberCount).toBe(0);

    await expect(
      assertEmpCustomFieldsAgainstEffectiveCatalog({
        query,
        companyId: 'main',
        customFields: { zz_member_invent: 'x' },
        authorization: memberCeoToken(),
        tenantId: 'xe-du-lich',
      }),
    ).resolves.toBeUndefined();
  });

  it('must_keep EXT-04c: assert does not touch hrm_merge_tokens', async () => {
    const calls: string[] = [];
    const base = makeExtQuery(activeRows);
    const query: HrmDbQueryFn = async (sql, params) => {
      calls.push(String(sql));
      return base(sql, params);
    };
    await assertEmpCustomFieldsAgainstEffectiveCatalog({
      query,
      companyId: 'holding',
      customFields: { basic_01: 'v' },
      authorization: groupCeoToken(),
      tenantId: 'xevn',
    }).catch(() => undefined);
    expect(calls.every((s) => !s.includes('hrm_merge_tokens'))).toBe(true);
  });
});

describe('EmployeesService wire — F-EMP-CF-CNS-01', () => {
  it('update rejects invent when EFF>0 (VAL-EMP-CF-CNS-01 service path)', async () => {
    const employeeId = '0500220b-f289-40df-b07e-86316285439b';
    const existing = {
      id: employeeId,
      company_id: 'holding',
      employee_code: 'UAT-0100',
      email: 'uat.nv0100@xe.vn',
      full_name: 'UAT Emp',
      job_title_key: null,
      manager_id: null,
      status: 'active',
      hired_at: null,
      archived_at: null,
      avatar_url: null,
      custom_fields: { tenant_id: 'xevn' },
      created_at: '2026-08-01T00:00:00.000Z',
      updated_at: '2026-08-01T00:00:00.000Z',
    };
    const db = {
      query: jest.fn(async (sql: string) => {
        const s = String(sql);
        if (s.includes('FROM public.employees') && s.includes('WHERE')) {
          return { rows: [existing] };
        }
        if (s.includes('hrm_catalog_extension_items') && s.includes('COUNT')) {
          return { rows: [{ c: '2' }] };
        }
        if (
          s.includes('hrm_catalog_extension_items') &&
          s.includes('SELECT DISTINCT')
        ) {
          return { rows: [{ code: 'basic_01' }, { code: 'national_id' }] };
        }
        return { rows: [] };
      }),
      onModuleDestroy: jest.fn(),
    } as unknown as HrmDbService;
    const service = new EmployeesService(db);

    await expect(
      service.updateEmployee(
        employeeId,
        {
          custom_fields: {
            tenant_id: 'xevn',
            zz_invent_emp_cf_msjcubjb: 'invent-gap',
          },
        },
        'holding',
        groupCeoToken(),
        { tenantId: 'xevn' },
      ),
    ).rejects.toMatchObject({ code: HRM_EMP_CUSTOM_FIELD_KEY });

    const writes = (db.query as jest.Mock).mock.calls.filter((c) =>
      String(c[0]).includes('UPDATE public.employees'),
    );
    expect(writes).toHaveLength(0);
  });
});
