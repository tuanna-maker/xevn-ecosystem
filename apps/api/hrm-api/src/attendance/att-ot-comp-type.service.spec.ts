/**
 * PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-BE-01 -
 * ensureSchema · open OT compensation catalog · EFF · invent KEY HRM-ATT-OT-COMP-KEY ·
 * scope_parity U19 · empty soft-skip · orthogonal to att_ot_type.
 * VAL-ATT-COMP-CNS-01/05/06/08 · VAL-ATT-OTC-CAT-*
 */
import { ApiException } from '../common/api.exception';
import { signServiceJwt } from '../common/jwt-sign';
import { HrmDbService } from '../db/hrm-db.service';
import {
  HRM_ATT_OTC_404,
  HRM_ATT_OTC_VAL,
  HRM_ATT_OT_COMP_KEY,
} from './att-ot-comp-type.constants';
import { AttOtCompTypeService } from './att-ot-comp-type.service';

const OTC_ID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';

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
    id: OTC_ID,
    company_id: 'holding',
    code: 'salary',
    name_vi: 'Trả lương',
    name_en: null,
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

describe('AttOtCompTypeService (PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-BE-01)', () => {
  it('VAL-ATT-OTC-CAT ensureSchema ADD att_ot_comp_type + CHKs; FORBIDDEN closed salary|compensatory_leave IN; no formula column', async () => {
    const sqls: string[] = [];
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        sqls.push(String(sql));
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new AttOtCompTypeService(db);
    await svc.ensureSchema();
    expect(
      sqls.some((q) =>
        q.includes('CREATE TABLE IF NOT EXISTS public.att_ot_comp_type'),
      ),
    ).toBe(true);
    expect(
      sqls.some((q) => q.includes('uq_att_ot_comp_type_company_code_active')),
    ).toBe(true);
    expect(sqls.some((q) => q.includes('ix_att_ot_comp_type_effective'))).toBe(
      true,
    );
    expect(
      sqls.some((q) => q.includes('chk_att_ot_comp_type_code_format')),
    ).toBe(true);
    expect(
      sqls.some((q) => q.includes("status IN ('active','inactive')")),
    ).toBe(true);
    // open catalog - no closed enum, orthogonal to att_ot_type
    expect(sqls.every((q) => !q.includes('code IN ('))).toBe(true);
    expect(sqls.every((q) => !q.includes("CHECK (code IN ('salary'"))).toBe(
      true,
    );
    expect(sqls.every((q) => !q.includes('att_ot_type'))).toBe(true);
    // no payroll formula column (L-ATT-OTC-10 formula HOLD)
    expect(sqls.every((q) => !q.includes('default_coeff'))).toBe(true);
  });

  it('VAL-ATT-OTC-CAT-01 / AC-01d: admin CREATE open N+1 code banked_hours (beyond starter two)', async () => {
    const db = mockDb(async (sql: string) => {
      if (schemaPassthrough(sql)) return { rows: [] };
      const s = String(sql);
      if (
        s.includes('FROM public.att_ot_comp_type') &&
        s.includes('archived_at IS NULL')
      ) {
        return { rows: [] };
      }
      if (s.includes('INSERT INTO public.att_ot_comp_type')) {
        return {
          rows: [baseRow({ code: 'banked_hours', name_vi: 'Giờ tích luỹ' })],
        };
      }
      return { rows: [] };
    });
    const svc = new AttOtCompTypeService(db);
    const row = await svc.upsertOtCompType(
      { companyId: 'holding', code: 'banked_hours', nameVi: 'Giờ tích luỹ' },
      groupCeoToken(),
    );
    expect(row.code).toBe('banked_hours');
    expect(row.nameVi).toBe('Giờ tích luỹ');
    expect(row.catalogKind).toBe('att_ot_comp_type');
  });

  it('VAL-ATT-OTC-CAT-03: bad code format -> HRM-ATT-OTC-VAL', async () => {
    const db = mockDb(async () => ({ rows: [] }));
    const svc = new AttOtCompTypeService(db);
    await expect(
      svc.upsertOtCompType(
        { companyId: 'holding', code: 'Compensatory Leave', nameVi: 'Nghỉ bù' },
        groupCeoToken(),
      ),
    ).rejects.toMatchObject({ code: HRM_ATT_OTC_VAL });
  });

  it('VAL-ATT-COMP-CNS-01 / AC-01b: invent compensation_type when EFF>0 -> HRM-ATT-OT-COMP-KEY (400)', async () => {
    const db = mockDb(async (sql: string) => {
      if (schemaPassthrough(sql)) return { rows: [] };
      if (String(sql).includes('FROM public.att_ot_comp_type')) {
        return { rows: [baseRow({ code: 'salary', name_vi: 'Trả lương' })] };
      }
      return { rows: [] };
    });
    const svc = new AttOtCompTypeService(db);
    await expect(
      svc.assertCompTypeInEffectiveCatalog({
        companyId: 'holding',
        compensationType: 'invent_comp_xyz',
        authorization: groupCeoToken(),
      }),
    ).rejects.toMatchObject({ code: HRM_ATT_OT_COMP_KEY, status: 400 });
  });

  it('VAL-ATT-COMP-CNS-05 / AC-01c: empty EFF soft-skip invent assert (U65 no seed)', async () => {
    const db = mockDb(async (sql: string) => {
      if (schemaPassthrough(sql)) return { rows: [] };
      if (String(sql).includes('FROM public.att_ot_comp_type')) {
        return { rows: [] };
      }
      return { rows: [] };
    });
    const svc = new AttOtCompTypeService(db);
    const hit = await svc.assertCompTypeInEffectiveCatalog({
      companyId: 'holding',
      compensationType: 'salary',
      authorization: groupCeoToken(),
    });
    expect(hit).toBeNull();
  });

  it('optional compensation_type: undefined/empty -> soft skip (default salary retained)', async () => {
    const db = mockDb(async (sql: string) => {
      if (schemaPassthrough(sql)) return { rows: [] };
      if (String(sql).includes('FROM public.att_ot_comp_type')) {
        return { rows: [baseRow()] };
      }
      return { rows: [] };
    });
    const svc = new AttOtCompTypeService(db);
    const hitUndef = await svc.assertCompTypeInEffectiveCatalog({
      companyId: 'holding',
      compensationType: undefined,
      authorization: groupCeoToken(),
    });
    expect(hitUndef).toBeNull();
    const hitEmpty = await svc.assertCompTypeInEffectiveCatalog({
      companyId: 'holding',
      compensationType: '   ',
      authorization: groupCeoToken(),
    });
    expect(hitEmpty).toBeNull();
  });

  it('VAL-ATT-COMP-CNS-01 happy: compensation_type in EFF -> display-ready hit with name_vi', async () => {
    const db = mockDb(async (sql: string) => {
      if (schemaPassthrough(sql)) return { rows: [] };
      if (String(sql).includes('FROM public.att_ot_comp_type')) {
        return {
          rows: [baseRow({ code: 'compensatory_leave', name_vi: 'Nghỉ bù' })],
        };
      }
      return { rows: [] };
    });
    const svc = new AttOtCompTypeService(db);
    const hit = await svc.assertCompTypeInEffectiveCatalog({
      companyId: 'holding',
      compensationType: 'compensatory_leave',
      authorization: groupCeoToken(),
    });
    expect(hit?.code).toBe('compensatory_leave');
    expect(hit?.nameVi).toBe('Nghỉ bù');
  });

  it('VAL-ATT-OTC-CAT-04: soft-retire -> inactive + archived_at; listEffective hides', async () => {
    const db = mockDb(async (sql: string) => {
      if (schemaPassthrough(sql)) return { rows: [] };
      const s = String(sql);
      if (
        s.includes('UPDATE public.att_ot_comp_type') &&
        s.includes("status = 'inactive'")
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
        s.includes('FROM public.att_ot_comp_type WHERE id') ||
        (s.includes('SELECT') && s.includes('WHERE id = $1::uuid'))
      ) {
        return { rows: [baseRow()] };
      }
      if (
        s.includes('FROM public.att_ot_comp_type') &&
        s.includes("status = 'active'")
      ) {
        return { rows: [] };
      }
      return { rows: [] };
    });
    const svc = new AttOtCompTypeService(db);
    const retired = await svc.retireOtCompType(
      OTC_ID,
      'holding',
      groupCeoToken(),
    );
    expect(retired.status).toBe('inactive');
    expect(retired.archivedAt).toBeTruthy();
    const eff = await svc.listEffective(
      { company_id: 'holding' },
      groupCeoToken(),
    );
    expect(eff.total).toBe(0);
  });

  it('VAL-ATT-OTC-SCP-01 / U19 scope_parity: member cannot get holding row', async () => {
    const db = mockDb(async (sql: string) => {
      if (schemaPassthrough(sql)) return { rows: [] };
      if (String(sql).includes('WHERE id = $1::uuid')) {
        return { rows: [baseRow({ company_id: 'holding' })] };
      }
      return { rows: [] };
    });
    const svc = new AttOtCompTypeService(db);
    await expect(
      svc.getOtCompTypeById(OTC_ID, 'main', memberCeoToken(), 'xe-du-lich'),
    ).rejects.toBeInstanceOf(ApiException);
    try {
      await svc.getOtCompTypeById(
        OTC_ID,
        'main',
        memberCeoToken(),
        'xe-du-lich',
      );
    } catch (e) {
      const ex = e as ApiException;
      expect([HRM_ATT_OTC_404, 'HRM-ATT-OTC-409', 'HRM-SCOPE-409']).toContain(
        ex.code,
      );
    }
  });

  it('listOtCompTypes default active exposes nameVi (display-ready)', async () => {
    const db = mockDb(async (sql: string) => {
      if (schemaPassthrough(sql)) return { rows: [] };
      if (String(sql).includes('FROM public.att_ot_comp_type')) {
        return {
          rows: [
            baseRow({
              code: 'mixed_pay_leave',
              name_vi: 'Kết hợp lương + nghỉ',
            }),
          ],
        };
      }
      return { rows: [] };
    });
    const svc = new AttOtCompTypeService(db);
    const list = await svc.listOtCompTypes(
      { company_id: 'holding' },
      groupCeoToken(),
    );
    expect(list.total).toBe(1);
    expect(list.data[0].nameVi).toBe('Kết hợp lương + nghỉ');
    expect(list.data[0].code).toBe('mixed_pay_leave');
  });
});
