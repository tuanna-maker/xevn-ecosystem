/**
 * PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-BE-01 —
 * ensureSchema · open ST catalog · EFF EMP wins REF · invent KEY · CHECK DROP · scope_parity
 */
import { ApiException } from '../common/api.exception';
import { signServiceJwt } from '../common/jwt-sign';
import { HrmDbService } from '../db/hrm-db.service';
import { HRM_EMP_STATUS_KEY } from './emp-employment-status.constants';
import { EmpEmploymentStatusService } from './emp-employment-status.service';

const ST_ID = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';

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
    id: ST_ID,
    company_id: 'holding',
    status_key: 'hr_st_custom_09',
    name_vi: 'Trạng thái tùy chỉnh 09',
    sort_order: 100,
    is_workforce_active: true,
    is_terminal: false,
    requires_reason: false,
    counts_toward_headcount: true,
    legacy_alias_keys_json: null,
    metadata_json: null,
    status: 'active',
    archived_at: null,
    created_at: '2026-08-08T00:00:00Z',
    updated_at: '2026-08-08T00:00:00Z',
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
  queryImpl: (
    sql: string,
    params?: unknown[],
  ) => Promise<{ rows: unknown[] }> | { rows: unknown[] },
): HrmDbService {
  const query = jest
    .fn()
    .mockImplementation(async (sql: string, params?: unknown[]) => {
      return queryImpl(sql, params);
    });
  return {
    query,
    withTransaction: jest.fn(
      async (fn: (q: typeof query) => Promise<unknown>) => fn(query),
    ),
  } as unknown as HrmDbService;
}

describe('EmpEmploymentStatusService (PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-BE-01)', () => {
  it('VAL-EMP-ST-CAT ensureSchema ADD emp_employment_status + CHKs; FORBIDDEN closed status_key IN', async () => {
    const sqls: string[] = [];
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        sqls.push(String(sql));
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new EmpEmploymentStatusService(db);
    await svc.ensureSchema();
    expect(
      sqls.some((q) =>
        q.includes('CREATE TABLE IF NOT EXISTS public.emp_employment_status'),
      ),
    ).toBe(true);
    expect(
      sqls.some((q) =>
        q.includes('uq_emp_employment_status_company_key_active'),
      ),
    ).toBe(true);
    expect(
      sqls.some((q) => q.includes('ix_emp_employment_status_effective')),
    ).toBe(true);
    expect(sqls.some((q) => q.includes('chk_emp_st_key_format'))).toBe(true);
    expect(sqls.every((q) => !q.includes('status_key IN ('))).toBe(true);
    expect(
      sqls.every(
        (q) => !q.includes("CHECK (status IN ('active', 'inactive'))"),
      ),
    ).toBe(true);
  });

  it('VAL-EMP-ST-CAT-01: create open N+1 key hr_st_custom_09', async () => {
    const db = mockDb(async (sql: string) => {
      if (schemaPassthrough(sql)) return { rows: [] };
      const s = String(sql);
      if (
        s.includes('FROM public.emp_employment_status') &&
        s.includes('archived_at IS NULL')
      ) {
        return { rows: [] };
      }
      if (s.includes('INSERT INTO public.emp_employment_status')) {
        return { rows: [baseRow()] };
      }
      return { rows: [] };
    });
    const svc = new EmpEmploymentStatusService(db);
    const row = await svc.upsertEmploymentStatus(
      {
        companyId: 'holding',
        statusKey: 'hr_st_custom_09',
        nameVi: 'Trạng thái tùy chỉnh 09',
      },
      groupCeoToken(),
    );
    expect(row.statusKey).toBe('hr_st_custom_09');
    expect(row.source).toBe('emp_native');
  });

  it('VAL-EMP-ST-CAT-03: invalid slug → HRM-PLT-CAT-CODE-INVALID', async () => {
    const db = mockDb(async (sql: string) => {
      if (schemaPassthrough(sql)) return { rows: [] };
      return { rows: [] };
    });
    const svc = new EmpEmploymentStatusService(db);
    await expect(
      svc.upsertEmploymentStatus(
        { companyId: 'holding', statusKey: '9Bad Key', nameVi: 'x' },
        groupCeoToken(),
      ),
    ).rejects.toMatchObject({ code: 'HRM-PLT-CAT-CODE-INVALID' });
  });

  it('VAL-EMP-ST-CAT-02: duplicate active key → HRM-PLT-CAT-CODE-CONFLICT', async () => {
    const db = mockDb(async (sql: string) => {
      if (schemaPassthrough(sql)) return { rows: [] };
      const s = String(sql);
      if (
        s.includes('FROM public.emp_employment_status') &&
        s.includes('archived_at IS NULL')
      ) {
        return { rows: [] };
      }
      if (s.includes('INSERT INTO public.emp_employment_status')) {
        throw new Error(
          'duplicate key value violates unique constraint uq_emp_employment_status_company_key_active',
        );
      }
      return { rows: [] };
    });
    const svc = new EmpEmploymentStatusService(db);
    await expect(
      svc.upsertEmploymentStatus(
        { companyId: 'holding', statusKey: 'hr_st_custom_09', nameVi: 'x' },
        groupCeoToken(),
      ),
    ).rejects.toMatchObject({ code: 'HRM-PLT-CAT-CODE-CONFLICT' });
  });

  it('VAL-EMP-ST-CAT-04: soft-retire sets archived_at', async () => {
    const db = mockDb(async (sql: string) => {
      if (schemaPassthrough(sql)) return { rows: [] };
      const s = String(sql);
      if (
        s.includes('SELECT') &&
        s.includes('FROM public.emp_employment_status') &&
        s.includes('id = $1')
      ) {
        return { rows: [baseRow()] };
      }
      if (s.includes('UPDATE') && s.includes('archived_at = NOW()')) {
        return {
          rows: [
            baseRow({ status: 'retired', archived_at: '2026-08-08T01:00:00Z' }),
          ],
        };
      }
      return { rows: [] };
    });
    const svc = new EmpEmploymentStatusService(db);
    const row = await svc.retireEmploymentStatus(
      ST_ID,
      'holding',
      groupCeoToken(),
    );
    expect(row.status).toBe('retired');
    expect(row.archivedAt).toBeTruthy();
  });

  it('VAL-EMP-ST-ALS-01: EFF EMP wins group REF on same status_key', async () => {
    const settings = {
      getEffectiveItemsForKey: jest
        .fn()
        .mockResolvedValue([
          { status: 'active', code: 'probation', label: 'REF Thử việc' },
        ]),
    };
    const db = mockDb(async (sql: string) => {
      if (schemaPassthrough(sql)) return { rows: [] };
      if (String(sql).includes('FROM public.emp_employment_status')) {
        return {
          rows: [
            baseRow({
              status_key: 'probation',
              name_vi: 'EMP Thử việc override',
            }),
          ],
        };
      }
      return { rows: [] };
    });
    const svc = new EmpEmploymentStatusService(db, settings);
    const eff = await svc.listEffective(
      { company_id: 'holding' },
      groupCeoToken(),
    );
    expect(eff.total).toBe(1);
    expect(eff.data[0].nameVi).toBe('EMP Thử việc override');
    expect(eff.data[0].source).toBe('emp_override');
  });

  it('VAL-EMP-ST-CNS-01: invent status when EFF>0 → HRM-EMP-STATUS-KEY', async () => {
    const db = mockDb(async (sql: string) => {
      if (schemaPassthrough(sql)) return { rows: [] };
      if (String(sql).includes('FROM public.emp_employment_status')) {
        return { rows: [baseRow({ status_key: 'active' })] };
      }
      return { rows: [] };
    });
    const svc = new EmpEmploymentStatusService(db);
    await expect(
      svc.assertStatusInEffectiveCatalog({
        companyId: 'holding',
        status: 'invent_unknown_st',
        authorization: groupCeoToken(),
      }),
    ).rejects.toMatchObject({ code: HRM_EMP_STATUS_KEY });
  });

  it('VAL-EMP-ST-CAT-09: empty EFF → soft allow invent skip', async () => {
    const db = mockDb(async (sql: string) => {
      if (schemaPassthrough(sql)) return { rows: [] };
      return { rows: [] };
    });
    const svc = new EmpEmploymentStatusService(db);
    const hit = await svc.assertStatusInEffectiveCatalog({
      companyId: 'holding',
      status: 'anything_goes',
      authorization: groupCeoToken(),
    });
    expect(hit).toBeNull();
  });

  it('VAL-EMP-ST-CNS-05: alias in legacy_alias_keys_json resolves to canonical', async () => {
    const db = mockDb(async (sql: string) => {
      if (schemaPassthrough(sql)) return { rows: [] };
      if (String(sql).includes('FROM public.emp_employment_status')) {
        return {
          rows: [
            baseRow({
              status_key: 'on_leave',
              legacy_alias_keys_json: ['leave', 'on-leave'],
            }),
          ],
        };
      }
      return { rows: [] };
    });
    const svc = new EmpEmploymentStatusService(db);
    const hit = await svc.assertStatusInEffectiveCatalog({
      companyId: 'holding',
      status: 'leave',
      authorization: groupCeoToken(),
    });
    expect(hit?.statusKey).toBe('on_leave');
  });

  it('VAL-EMP-ST-SCP-01 / CAT-06: get-by-id OOS member → scope reject', async () => {
    const db = mockDb(async (sql: string) => {
      if (schemaPassthrough(sql)) return { rows: [] };
      if (
        String(sql).includes('FROM public.emp_employment_status') &&
        String(sql).includes('id = $1')
      ) {
        return { rows: [baseRow({ company_id: 'holding' })] };
      }
      return { rows: [] };
    });
    const svc = new EmpEmploymentStatusService(db);
    await expect(
      svc.getEmploymentStatusById(
        ST_ID,
        'trsport',
        memberCeoToken(),
        'xe-du-lich',
      ),
    ).rejects.toBeInstanceOf(ApiException);
  });
});
