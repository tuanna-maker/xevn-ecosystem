/**
 * PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-BE-01 —
 * ensureSchema · open OT catalog · EFF · invent KEY · scope_parity · empty soft-skip
 * VAL-ATT-OT-CNS-01/05 · VAL-ATT-OT-CAT-*
 */
import { ApiException } from '../common/api.exception';
import { signServiceJwt } from '../common/jwt-sign';
import { HrmDbService } from '../db/hrm-db.service';
import {
  HRM_ATT_OT_404,
  HRM_ATT_OT_TYPE_KEY,
  HRM_ATT_OT_VAL,
} from './att-ot-type.constants';
import { AttOtTypeService } from './att-ot-type.service';

const OT_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

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
    id: OT_ID,
    company_id: 'holding',
    code: 'comp_time',
    name_vi: 'Nghỉ bù tăng ca',
    name_en: null,
    default_coeff: 1.5,
    sort_order: 100,
    color: null,
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
    s.includes('DO $$') ||
    s.includes('DROP CONSTRAINT')
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

describe('AttOtTypeService (PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-BE-01)', () => {
  it('VAL-ATT-OT-CAT ensureSchema ADD att_ot_type + CHKs; FORBIDDEN closed weekday|weekend|holiday IN', async () => {
    const sqls: string[] = [];
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        sqls.push(String(sql));
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new AttOtTypeService(db);
    await svc.ensureSchema();
    expect(
      sqls.some((q) =>
        q.includes('CREATE TABLE IF NOT EXISTS public.att_ot_type'),
      ),
    ).toBe(true);
    expect(
      sqls.some((q) => q.includes('uq_att_ot_type_company_code_active')),
    ).toBe(true);
    expect(sqls.some((q) => q.includes('ix_att_ot_type_effective'))).toBe(true);
    expect(sqls.some((q) => q.includes('chk_att_ot_type_code_format'))).toBe(
      true,
    );
    expect(sqls.some((q) => q.includes('chk_att_ot_type_default_coeff'))).toBe(
      true,
    );
    expect(
      sqls.some((q) => q.includes("status IN ('active','inactive')")),
    ).toBe(true);
    expect(sqls.every((q) => !q.includes('code IN ('))).toBe(true);
    expect(sqls.every((q) => !q.includes("CHECK (code IN ('weekday'"))).toBe(
      true,
    );
  });

  it('VAL-ATT-OT-CAT-01 / AC-01d: admin CREATE open N+1 code comp_time + display-ready defaultCoeff', async () => {
    const db = mockDb(async (sql: string) => {
      if (schemaPassthrough(sql)) return { rows: [] };
      const s = String(sql);
      if (
        s.includes('FROM public.att_ot_type') &&
        s.includes('archived_at IS NULL')
      ) {
        return { rows: [] };
      }
      if (s.includes('INSERT INTO public.att_ot_type')) {
        return { rows: [baseRow()] };
      }
      return { rows: [] };
    });
    const svc = new AttOtTypeService(db);
    const row = await svc.upsertOtType(
      {
        companyId: 'holding',
        code: 'comp_time',
        nameVi: 'Nghỉ bù tăng ca',
        defaultCoeff: 1.5,
      },
      groupCeoToken(),
    );
    expect(row.code).toBe('comp_time');
    expect(row.nameVi).toBe('Nghỉ bù tăng ca');
    expect(row.defaultCoeff).toBe(1.5);
    expect(row.defaultCoefficient).toBe(1.5);
    expect(row.catalogKind).toBe('att_ot_type');
  });

  it('VAL-ATT-OT-CAT-03: bad code format → HRM-ATT-OT-VAL', async () => {
    const db = mockDb(async () => ({ rows: [] }));
    const svc = new AttOtTypeService(db);
    await expect(
      svc.upsertOtType(
        { companyId: 'holding', code: 'Night Shift', nameVi: 'Ca đêm' },
        groupCeoToken(),
      ),
    ).rejects.toMatchObject({ code: HRM_ATT_OT_VAL });
  });

  it('VAL-ATT-OT-CAT-08: defaultCoeff < 0 → HRM-ATT-OT-VAL', async () => {
    const db = mockDb(async () => ({ rows: [] }));
    const svc = new AttOtTypeService(db);
    await expect(
      svc.upsertOtType(
        {
          companyId: 'holding',
          code: 'night',
          nameVi: 'Ca đêm',
          defaultCoeff: -1,
        },
        groupCeoToken(),
      ),
    ).rejects.toMatchObject({ code: HRM_ATT_OT_VAL });
  });

  it('VAL-ATT-OT-CNS-01: invent overtime_type when EFF>0 → HRM-ATT-OT-TYPE-KEY', async () => {
    const db = mockDb(async (sql: string) => {
      if (schemaPassthrough(sql)) return { rows: [] };
      if (String(sql).includes('FROM public.att_ot_type')) {
        return {
          rows: [baseRow({ code: 'weekday', name_vi: 'Tăng ca ngày thường' })],
        };
      }
      return { rows: [] };
    });
    const svc = new AttOtTypeService(db);
    await expect(
      svc.assertOtTypeInEffectiveCatalog({
        companyId: 'holding',
        overtimeType: 'invent_ot_xyz',
        authorization: groupCeoToken(),
      }),
    ).rejects.toMatchObject({ code: HRM_ATT_OT_TYPE_KEY, status: 400 });
  });

  it('VAL-ATT-OT-CNS-05 / AC-01c: empty EFF soft-skip invent assert', async () => {
    const db = mockDb(async (sql: string) => {
      if (schemaPassthrough(sql)) return { rows: [] };
      if (String(sql).includes('FROM public.att_ot_type')) {
        return { rows: [] };
      }
      return { rows: [] };
    });
    const svc = new AttOtTypeService(db);
    const hit = await svc.assertOtTypeInEffectiveCatalog({
      companyId: 'holding',
      overtimeType: 'weekday',
      authorization: groupCeoToken(),
    });
    expect(hit).toBeNull();
  });

  it('VAL-ATT-OT-CNS-01 happy: overtime_type ∈ EFF → display-ready hit', async () => {
    const db = mockDb(async (sql: string) => {
      if (schemaPassthrough(sql)) return { rows: [] };
      if (String(sql).includes('FROM public.att_ot_type')) {
        return {
          rows: [
            baseRow({
              code: 'weekend',
              name_vi: 'Tăng ca ngày nghỉ',
              default_coeff: 2,
            }),
          ],
        };
      }
      return { rows: [] };
    });
    const svc = new AttOtTypeService(db);
    const hit = await svc.assertOtTypeInEffectiveCatalog({
      companyId: 'holding',
      overtimeType: 'weekend',
      authorization: groupCeoToken(),
    });
    expect(hit?.code).toBe('weekend');
    expect(hit?.nameVi).toBe('Tăng ca ngày nghỉ');
    expect(hit?.defaultCoeff).toBe(2);
  });

  it('VAL-ATT-OT-CAT-04: soft-retire → inactive + archived_at; listEffective hides', async () => {
    const db = mockDb(async (sql: string) => {
      if (schemaPassthrough(sql)) return { rows: [] };
      const s = String(sql);
      if (
        s.includes('UPDATE public.att_ot_type') &&
        s.includes(`status = 'inactive'`)
      ) {
        return {
          rows: [
            baseRow({
              status: 'inactive',
              archived_at: '2026-08-08T12:00:00Z',
            }),
          ],
        };
      }
      if (
        s.includes('FROM public.att_ot_type WHERE id') ||
        (s.includes('SELECT') && s.includes('WHERE id = $1::uuid'))
      ) {
        return { rows: [baseRow()] };
      }
      if (
        s.includes('FROM public.att_ot_type') &&
        s.includes(`status = 'active'`)
      ) {
        return { rows: [] };
      }
      return { rows: [] };
    });
    const svc = new AttOtTypeService(db);
    const retired = await svc.retireOtType(OT_ID, 'holding', groupCeoToken());
    expect(retired.status).toBe('inactive');
    expect(retired.archivedAt).toBeTruthy();
    const eff = await svc.listEffective(
      { company_id: 'holding' },
      groupCeoToken(),
    );
    expect(eff.total).toBe(0);
  });

  it('VAL-ATT-OT-CAT-06 / U19 scope_parity: member cannot get holding row', async () => {
    const db = mockDb(async (sql: string) => {
      if (schemaPassthrough(sql)) return { rows: [] };
      if (String(sql).includes('WHERE id = $1::uuid')) {
        return { rows: [baseRow({ company_id: 'holding' })] };
      }
      return { rows: [] };
    });
    const svc = new AttOtTypeService(db);
    await expect(
      svc.getOtTypeById(OT_ID, 'main', memberCeoToken(), 'xe-du-lich'),
    ).rejects.toBeInstanceOf(ApiException);
    try {
      await svc.getOtTypeById(OT_ID, 'main', memberCeoToken(), 'xe-du-lich');
    } catch (e) {
      const ex = e as ApiException;
      expect([HRM_ATT_OT_404, 'HRM-ATT-OT-409', 'HRM-SCOPE-409']).toContain(
        ex.code,
      );
    }
  });

  it('listOtTypes default active exposes nameVi + defaultCoeff', async () => {
    const db = mockDb(async (sql: string) => {
      if (schemaPassthrough(sql)) return { rows: [] };
      if (String(sql).includes('FROM public.att_ot_type')) {
        return {
          rows: [
            baseRow({
              code: 'night',
              name_vi: 'Tăng ca đêm',
              default_coeff: '2.50',
            }),
          ],
        };
      }
      return { rows: [] };
    });
    const svc = new AttOtTypeService(db);
    const list = await svc.listOtTypes(
      { company_id: 'holding' },
      groupCeoToken(),
    );
    expect(list.total).toBe(1);
    expect(list.data[0].nameVi).toBe('Tăng ca đêm');
    expect(list.data[0].defaultCoeff).toBe(2.5);
  });
});
