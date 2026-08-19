/**
 * PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-BE-01 —
 * ensureSchema · open ET catalog · EFF EMP wins REF · scope_parity · hyphen normalize
 */
import { ApiException } from '../common/api.exception';
import { signServiceJwt } from '../common/jwt-sign';
import { HrmDbService } from '../db/hrm-db.service';
import { EmpEmploymentTypeService } from './emp-employment-type.service';

const ET_ID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';

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

function baseRow(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: ET_ID,
    company_id: 'holding',
    employment_type_key: 'seasonal_temp',
    name_vi: 'Thời vụ tùy chỉnh',
    sort_order: 100,
    counts_toward_headcount: true,
    eligible_for_si: true,
    is_contingent: false,
    metadata_json: null,
    status: 'active',
    archived_at: null,
    created_at: '2026-08-07T00:00:00Z',
    updated_at: '2026-08-07T00:00:00Z',
    ...overrides,
  };
}

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

describe('EmpEmploymentTypeService (PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-BE-01)', () => {
  it('ensureSchema ADD emp_employment_type + CHKs; FORBIDDEN closed employment_type_key IN', async () => {
    const sqls: string[] = [];
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        sqls.push(String(sql));
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new EmpEmploymentTypeService(db);
    await svc.ensureSchema();
    expect(
      sqls.some((q) => q.includes('CREATE TABLE IF NOT EXISTS public.emp_employment_type')),
    ).toBe(true);
    expect(sqls.some((q) => q.includes('uq_emp_employment_type_company_key_active'))).toBe(true);
    expect(sqls.some((q) => q.includes('chk_emp_et_key_format'))).toBe(true);
    expect(sqls.every((q) => !q.includes("employment_type_key IN ("))).toBe(true);
    expect(sqls.every((q) => !q.includes("'full_time'"))).toBe(true);
  });

  it('VAL-EMP-ET-01: hyphen→underscore normalize (full-time → full_time)', async () => {
    const db = mockDb(async (sql: string) => {
      if (schemaPassthrough(sql)) return { rows: [] };
      const s = String(sql);
      if (s.includes('FROM public.emp_employment_type') && s.includes('archived_at IS NULL')) {
        return { rows: [] };
      }
      if (s.includes('INSERT INTO public.emp_employment_type')) {
        return { rows: [baseRow({ employment_type_key: 'full_time' })] };
      }
      if (s.includes('FROM public.hrm_merge_tokens')) return { rows: [] };
      if (s.includes('INSERT INTO public.hrm_merge_tokens')) return { rows: [] };
      return { rows: [] };
    });
    const svc = new EmpEmploymentTypeService(db);
    const row = await svc.upsertEmploymentType(
      {
        companyId: 'holding',
        employmentTypeKey: 'full-time',
        nameVi: 'Toàn thời gian',
      },
      groupCeoToken(),
    );
    expect(row.employmentTypeKey).toBe('full_time');
  });

  it('VAL-EMP-ET-02: reject invalid format (uppercase)', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (schemaPassthrough(sql)) return { rows: [] };
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new EmpEmploymentTypeService(db);
    await expect(
      svc.upsertEmploymentType(
        {
          companyId: 'holding',
          employmentTypeKey: 'FullTime',
          nameVi: 'Full',
        },
        groupCeoToken(),
      ),
    ).rejects.toMatchObject({ code: 'HRM-PLT-CAT-CODE-INVALID' });
  });

  it('VAL-EMP-ET-04: open catalog accepts 5th+ seasonal_temp (no 4-option ceiling)', async () => {
    const db = mockDb(async (sql: string) => {
      if (schemaPassthrough(sql)) return { rows: [] };
      const s = String(sql);
      if (s.includes('FROM public.emp_employment_type') && s.includes('archived_at IS NULL')) {
        return { rows: [] };
      }
      if (s.includes('INSERT INTO public.emp_employment_type')) {
        return { rows: [baseRow()] };
      }
      if (s.includes('FROM public.hrm_merge_tokens')) return { rows: [] };
      if (s.includes('INSERT INTO public.hrm_merge_tokens')) return { rows: [] };
      return { rows: [] };
    });
    const svc = new EmpEmploymentTypeService(db);
    const row = await svc.upsertEmploymentType(
      {
        companyId: 'holding',
        employmentTypeKey: 'seasonal_temp',
        nameVi: 'Thời vụ tùy chỉnh',
      },
      groupCeoToken(),
    );
    expect(row.employmentTypeKey).toBe('seasonal_temp');
    expect(row.source).toBe('emp_native');
  });

  it('scope_parity: list id → getById 200 (group CEO main→holding)', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string, params?: unknown[]) => {
        if (schemaPassthrough(sql)) return { rows: [] };
        const s = String(sql);
        if (s.includes('FROM public.emp_employment_type') && s.includes('ORDER BY sort_order')) {
          expect(JSON.stringify(params ?? [])).toMatch(/holding|main/);
          return { rows: [baseRow()] };
        }
        if (s.includes('FROM public.emp_employment_type') && s.includes('id = $1')) {
          return { rows: [baseRow()] };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new EmpEmploymentTypeService(db);
    const auth = groupCeoToken();
    const list = await svc.listEmploymentTypes({ company_id: 'main' }, auth);
    expect(list.data).toHaveLength(1);
    const detail = await svc.getEmploymentTypeById(ET_ID, 'main', auth);
    expect(detail.id).toBe(ET_ID);
  });

  it('scope_parity VAL-EMP-ET-10: member CEO OOS → reject', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (schemaPassthrough(sql)) return { rows: [] };
        if (
          String(sql).includes('FROM public.emp_employment_type') &&
          String(sql).includes('id = $1')
        ) {
          return { rows: [baseRow({ company_id: 'holding' })] };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new EmpEmploymentTypeService(db);
    await expect(
      svc.getEmploymentTypeById(ET_ID, 'main', memberCeoToken()),
    ).rejects.toBeInstanceOf(ApiException);
  });

  it('F-EMP-CAT-EFF-02 VAL-EMP-ET-08: EMP wins collision over group REF', async () => {
    const settings = {
      getEffectiveItemsForKey: jest.fn().mockResolvedValue([
        {
          status: 'active',
          code: 'full_time',
          label: 'REF Full-time',
        },
        {
          status: 'active',
          code: 'part_time',
          label: 'REF Part-time',
        },
      ]),
    };
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (schemaPassthrough(sql)) return { rows: [] };
        if (String(sql).includes('FROM public.emp_employment_type') && String(sql).includes('ORDER BY')) {
          return {
            rows: [
              baseRow({
                employment_type_key: 'full_time',
                name_vi: 'EMP Full-time override',
              }),
            ],
          };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new EmpEmploymentTypeService(db, settings);
    const eff = await svc.listEffective({ company_id: 'holding' }, groupCeoToken());
    expect(eff.total).toBe(2);
    const full = eff.data.find((r) => r.employmentTypeKey === 'full_time');
    expect(full?.nameVi).toBe('EMP Full-time override');
    expect(full?.source).toBe('emp_override');
    const part = eff.data.find((r) => r.employmentTypeKey === 'part_time');
    expect(part?.source).toBe('group_ref');
  });

  it('VAL-EMP-ET-07: assert UNKNOWN when catalog >0 and key missing', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (schemaPassthrough(sql)) return { rows: [] };
        if (String(sql).includes('FROM public.emp_employment_type') && String(sql).includes('ORDER BY')) {
          return { rows: [baseRow()] };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new EmpEmploymentTypeService(db);
    await expect(
      svc.assertEmploymentTypeInEffectiveCatalog({
        companyId: 'holding',
        employmentType: 'not_in_catalog',
        authorization: groupCeoToken(),
      }),
    ).rejects.toMatchObject({ code: 'HRM-EMP-ET-UNKNOWN' });
  });

  it('VAL-EMP-ET-05: retire soft — no hard DELETE', async () => {
    const retired = baseRow({
      status: 'retired',
      archived_at: '2026-08-07T12:00:00Z',
    });
    const db = mockDb(async (sql: string) => {
      if (schemaPassthrough(sql)) return { rows: [] };
      const s = String(sql);
      if (s.includes('FROM public.emp_employment_type') && s.includes('id = $1')) {
        return { rows: [baseRow()] };
      }
      if (s.includes('UPDATE public.emp_employment_type') && s.includes("status = 'retired'")) {
        expect(s).not.toMatch(/DELETE/i);
        return { rows: [retired] };
      }
      if (s.includes('UPDATE public.hrm_merge_tokens')) {
        expect(s).not.toMatch(/DELETE/i);
        return { rows: [] };
      }
      return { rows: [] };
    });
    const svc = new EmpEmploymentTypeService(db);
    const row = await svc.retireEmploymentType(ET_ID, 'main', groupCeoToken());
    expect(row.status).toBe('retired');
  });
});
