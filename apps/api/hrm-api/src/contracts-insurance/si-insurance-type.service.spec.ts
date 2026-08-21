/**
 * PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-BE-01 —
 * ensureSchema · open catalog · effective union SI wins · scope_parity U19 · VAL-SI-CAT/CNS
 */
import { ApiException } from '../common/api.exception';
import { signServiceJwt } from '../common/jwt-sign';
import { HrmDbService } from '../db/hrm-db.service';
import { SiInsuranceTypeService } from './si-insurance-type.service';

const TYPE_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

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
    id: TYPE_ID,
    company_id: 'holding',
    insurance_type_key: 'hr_ins_custom_09',
    name_vi: 'Loại BH HR tùy chỉnh 09',
    sort_order: 100,
    is_statutory: false,
    eligible_for_rate_cfg: true,
    requires_policy: false,
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

describe('SiInsuranceTypeService (PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-BE-01)', () => {
  it('ensureSchema ADD si_insurance_type + CHKs; FORBIDDEN closed insurance_type_key IN', async () => {
    const sqls: string[] = [];
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        sqls.push(String(sql));
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new SiInsuranceTypeService(db);
    await svc.ensureSchema();
    expect(
      sqls.some((q) =>
        q.includes('CREATE TABLE IF NOT EXISTS public.si_insurance_type'),
      ),
    ).toBe(true);
    expect(
      sqls.some((q) => q.includes('uq_si_ins_type_company_key_active')),
    ).toBe(true);
    expect(sqls.some((q) => q.includes('chk_si_ins_type_key_format'))).toBe(
      true,
    );
    expect(
      sqls.some((q) => q.includes('ix_si_ins_type_company_effective')),
    ).toBe(true);
    expect(sqls.every((q) => !q.includes('insurance_type_key IN ('))).toBe(
      true,
    );
    expect(sqls.every((q) => !q.includes("'BHXH'"))).toBe(true);
  });

  it('VAL-SI-CAT-03: reject spaces / leading digit (format only)', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (schemaPassthrough(sql)) return { rows: [] };
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new SiInsuranceTypeService(db);
    await expect(
      svc.upsertInsuranceType(
        {
          companyId: 'holding',
          insuranceTypeKey: '9bad',
          nameVi: 'Bad',
        },
        groupCeoToken(),
      ),
    ).rejects.toMatchObject({ code: 'HRM-PLT-CAT-CODE-INVALID' });
  });

  it('VAL-SI-CAT-01: open catalog accepts hr_ins_custom_09 and BHXH (uppercase OK)', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (schemaPassthrough(sql)) return { rows: [] };
        const s = String(sql);
        if (
          s.includes('FROM public.si_insurance_type') &&
          s.includes('archived_at IS NULL')
        ) {
          return { rows: [] };
        }
        if (s.includes('INSERT INTO public.si_insurance_type')) {
          return { rows: [baseRow()] };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new SiInsuranceTypeService(db);
    const row = await svc.upsertInsuranceType(
      {
        companyId: 'holding',
        insuranceTypeKey: 'hr_ins_custom_09',
        nameVi: 'Loại BH HR tùy chỉnh 09',
      },
      groupCeoToken(),
    );
    expect(row.insuranceTypeKey).toBe('hr_ins_custom_09');
    expect(row.source).toBe('si_native');

    const db2 = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (schemaPassthrough(sql)) return { rows: [] };
        const s = String(sql);
        if (
          s.includes('FROM public.si_insurance_type') &&
          s.includes('archived_at IS NULL')
        ) {
          return { rows: [] };
        }
        if (s.includes('INSERT INTO public.si_insurance_type')) {
          return {
            rows: [baseRow({ insurance_type_key: 'BHXH', is_statutory: true })],
          };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc2 = new SiInsuranceTypeService(db2);
    const bhxh = await svc2.upsertInsuranceType(
      {
        companyId: 'holding',
        insuranceTypeKey: 'BHXH',
        nameVi: 'Bảo hiểm xã hội',
        isStatutory: true,
      },
      groupCeoToken(),
    );
    expect(bhxh.insuranceTypeKey).toBe('BHXH');
  });

  it('VAL-SI-CAT-06 / VAL-SI-SCP-01: list id → getById 200 (group CEO main→holding)', async () => {
    const db = {
      query: jest
        .fn()
        .mockImplementation(async (sql: string, params?: unknown[]) => {
          if (schemaPassthrough(sql)) return { rows: [] };
          const s = String(sql);
          if (
            s.includes('FROM public.si_insurance_type') &&
            s.includes('ORDER BY sort_order')
          ) {
            expect(JSON.stringify(params ?? [])).toMatch(/holding|main/);
            return { rows: [baseRow()] };
          }
          if (
            s.includes('FROM public.si_insurance_type') &&
            s.includes('id = $1')
          ) {
            return { rows: [baseRow()] };
          }
          return { rows: [] };
        }),
    } as unknown as HrmDbService;
    const svc = new SiInsuranceTypeService(db);
    const auth = groupCeoToken();
    const list = await svc.listInsuranceTypes({ company_id: 'main' }, auth);
    expect(list.data).toHaveLength(1);
    const detail = await svc.getInsuranceTypeById(TYPE_ID, 'main', auth);
    expect(detail.id).toBe(TYPE_ID);
    expect(detail.insuranceTypeKey).toBe('hr_ins_custom_09');
  });

  it('VAL-SI-CAT-06: member CEO cannot get holding type (OOS)', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (schemaPassthrough(sql)) return { rows: [] };
        if (
          String(sql).includes('FROM public.si_insurance_type') &&
          String(sql).includes('id = $1')
        ) {
          return { rows: [baseRow({ company_id: 'holding' })] };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new SiInsuranceTypeService(db);
    await expect(
      svc.getInsuranceTypeById(TYPE_ID, 'main', memberCeoToken()),
    ).rejects.toBeInstanceOf(ApiException);
  });

  it('VAL-SI-ALS-01: SI wins collision over group REF insurance_types', async () => {
    const settings = {
      getEffectiveItemsForKey: jest.fn().mockResolvedValue([
        {
          status: 'active',
          code: 'BHXH',
          label: 'BHXH REF',
          metadata: { is_statutory: true },
        },
        {
          status: 'active',
          code: 'ref_only',
          label: 'Chỉ REF',
        },
      ]),
    };
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (schemaPassthrough(sql)) return { rows: [] };
        if (String(sql).includes('FROM public.si_insurance_type')) {
          return {
            rows: [
              baseRow({
                insurance_type_key: 'BHXH',
                name_vi: 'BHXH SI native',
                is_statutory: true,
              }),
            ],
          };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new SiInsuranceTypeService(db, settings);
    const effective = await svc.listEffective(
      { company_id: 'holding' },
      groupCeoToken(),
      {
        tenantId: 'xevn',
      },
    );
    expect(effective.total).toBe(2);
    const bhxh = effective.data.find((r) => r.insuranceTypeKey === 'BHXH');
    expect(bhxh?.nameVi).toBe('BHXH SI native');
    expect(bhxh?.source).toBe('si_override');
    const refOnly = effective.data.find(
      (r) => r.insuranceTypeKey === 'ref_only',
    );
    expect(refOnly?.source).toBe('group_ref');
  });

  it('VAL-SI-CNS-01: assert invent when effective >0 → HRM-INS-TYPE-KEY', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (schemaPassthrough(sql)) return { rows: [] };
        if (String(sql).includes('FROM public.si_insurance_type')) {
          return {
            rows: [baseRow({ insurance_type_key: 'BHXH', name_vi: 'BHXH' })],
          };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new SiInsuranceTypeService(db);
    await expect(
      svc.assertInsuranceTypeInEffectiveCatalog({
        companyId: 'holding',
        insuranceType: 'not_in_catalog',
        authorization: groupCeoToken(),
        tenantId: 'xevn',
      }),
    ).rejects.toMatchObject({ code: 'HRM-INS-TYPE-KEY' });
  });

  it('VAL-SI-CNS-07: alias in legacy_alias_keys_json resolves to canonical', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (schemaPassthrough(sql)) return { rows: [] };
        if (String(sql).includes('FROM public.si_insurance_type')) {
          return {
            rows: [
              baseRow({
                insurance_type_key: 'BHXH',
                name_vi: 'BHXH',
                legacy_alias_keys_json: ['social'],
              }),
            ],
          };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new SiInsuranceTypeService(db);
    const hit = await svc.assertInsuranceTypeInEffectiveCatalog({
      companyId: 'holding',
      insuranceType: 'social',
      authorization: groupCeoToken(),
      tenantId: 'xevn',
    });
    expect(hit?.insuranceTypeKey).toBe('BHXH');
  });

  it('VAL-SI-CAT-09: empty effective soft-allows (U65 — no fake starter)', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (schemaPassthrough(sql)) return { rows: [] };
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new SiInsuranceTypeService(db);
    const hit = await svc.assertInsuranceTypeInEffectiveCatalog({
      companyId: 'holding',
      insuranceType: 'anything',
      authorization: groupCeoToken(),
    });
    expect(hit).toBeNull();
  });

  it('VAL-SI-CAT-04/05: retire soft-deletes — no hard DELETE', async () => {
    const sqls: string[] = [];
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        sqls.push(String(sql));
        if (schemaPassthrough(sql)) return { rows: [] };
        const s = String(sql);
        if (
          s.includes('FROM public.si_insurance_type') &&
          s.includes('id = $1')
        ) {
          return { rows: [baseRow()] };
        }
        if (
          s.includes('UPDATE public.si_insurance_type') &&
          s.includes("status = 'retired'")
        ) {
          return {
            rows: [
              baseRow({
                status: 'retired',
                archived_at: '2026-08-08T12:00:00Z',
              }),
            ],
          };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new SiInsuranceTypeService(db);
    const row = await svc.retireInsuranceType(
      TYPE_ID,
      'holding',
      groupCeoToken(),
    );
    expect(row.status).toBe('retired');
    expect(row.archivedAt).toBeTruthy();
    expect(
      sqls.every((q) => !q.includes('DELETE FROM public.si_insurance_type')),
    ).toBe(true);
  });

  it('rate-cfg gate: eligible_for_rate_cfg=false → HRM-INS-TYPE-KEY', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (schemaPassthrough(sql)) return { rows: [] };
        if (String(sql).includes('FROM public.si_insurance_type')) {
          return {
            rows: [
              baseRow({
                insurance_type_key: 'commercial_x',
                eligible_for_rate_cfg: false,
              }),
            ],
          };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new SiInsuranceTypeService(db);
    await expect(
      svc.assertInsuranceTypeInEffectiveCatalog({
        companyId: 'holding',
        insuranceType: 'commercial_x',
        authorization: groupCeoToken(),
        requireEligibleForRateCfg: true,
      }),
    ).rejects.toMatchObject({ code: 'HRM-INS-TYPE-KEY' });
  });
});
