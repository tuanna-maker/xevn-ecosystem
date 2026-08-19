/**
 * PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-BE-01 —
 * ensureSchema · open catalog · effective union SI wins · scope_parity U19 · VAL-SI-INR-CAT/CNS/ALS
 */
import { ApiException } from '../common/api.exception';
import { signServiceJwt } from '../common/jwt-sign';
import { HrmDbService } from '../db/hrm-db.service';
import { SiInsurerService } from './si-insurer.service';

const INSURER_ID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';

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
    id: INSURER_ID,
    company_id: 'holding',
    insurer_key: 'hr_insurer_custom_09',
    name_vi: 'Nhà BH HR tùy chỉnh 09',
    sort_order: 100,
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

describe('SiInsurerService (PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-BE-01)', () => {
  it('ensureSchema ADD si_insurer + CHKs; FORBIDDEN closed insurer_key IN; FORBIDDEN touch si_insurance_type', async () => {
    const sqls: string[] = [];
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        sqls.push(String(sql));
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new SiInsurerService(db);
    await svc.ensureSchema();
    expect(sqls.some((q) => q.includes('CREATE TABLE IF NOT EXISTS public.si_insurer'))).toBe(
      true,
    );
    expect(sqls.some((q) => q.includes('uq_si_insurer_company_key_active'))).toBe(true);
    expect(sqls.some((q) => q.includes('chk_si_insurer_key_format'))).toBe(true);
    expect(sqls.some((q) => q.includes('ix_si_insurer_company_effective'))).toBe(true);
    expect(sqls.every((q) => !q.includes('insurer_key IN ('))).toBe(true);
    expect(sqls.every((q) => !q.includes('si_insurance_type'))).toBe(true);
    expect(sqls.every((q) => !q.includes("'VSS'"))).toBe(true);
  });

  it('VAL-SI-INR-CAT-03: reject spaces / leading digit (format only)', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (schemaPassthrough(sql)) return { rows: [] };
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new SiInsurerService(db);
    await expect(
      svc.upsertInsurer(
        {
          companyId: 'holding',
          insurerKey: '9bad',
          nameVi: 'Bad',
        },
        groupCeoToken(),
      ),
    ).rejects.toMatchObject({ code: 'HRM-PLT-CAT-CODE-INVALID' });
  });

  it('VAL-SI-INR-CAT-01: open catalog accepts hr_insurer_custom_09 and VSS (uppercase OK)', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (schemaPassthrough(sql)) return { rows: [] };
        const s = String(sql);
        if (s.includes('FROM public.si_insurer') && s.includes('archived_at IS NULL')) {
          return { rows: [] };
        }
        if (s.includes('INSERT INTO public.si_insurer')) {
          return { rows: [baseRow()] };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new SiInsurerService(db);
    const row = await svc.upsertInsurer(
      {
        companyId: 'holding',
        insurerKey: 'hr_insurer_custom_09',
        nameVi: 'Nhà BH HR tùy chỉnh 09',
      },
      groupCeoToken(),
    );
    expect(row.insurerKey).toBe('hr_insurer_custom_09');
    expect(row.source).toBe('si_native');

    const db2 = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (schemaPassthrough(sql)) return { rows: [] };
        const s = String(sql);
        if (s.includes('FROM public.si_insurer') && s.includes('archived_at IS NULL')) {
          return { rows: [] };
        }
        if (s.includes('INSERT INTO public.si_insurer')) {
          return { rows: [baseRow({ insurer_key: 'VSS' })] };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc2 = new SiInsurerService(db2);
    const vss = await svc2.upsertInsurer(
      {
        companyId: 'holding',
        insurerKey: 'VSS',
        nameVi: 'BHXH Việt Nam',
      },
      groupCeoToken(),
    );
    expect(vss.insurerKey).toBe('VSS');
  });

  it('VAL-SI-INR-CAT-06 / VAL-SI-INR-SCP-01: list id → getById 200 (group CEO main→holding)', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string, params?: unknown[]) => {
        if (schemaPassthrough(sql)) return { rows: [] };
        const s = String(sql);
        if (s.includes('FROM public.si_insurer') && s.includes('ORDER BY sort_order')) {
          expect(JSON.stringify(params ?? [])).toMatch(/holding|main/);
          return { rows: [baseRow()] };
        }
        if (s.includes('FROM public.si_insurer') && s.includes('id = $1')) {
          return { rows: [baseRow()] };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new SiInsurerService(db);
    const auth = groupCeoToken();
    const list = await svc.listInsurers({ company_id: 'main' }, auth);
    expect(list.data).toHaveLength(1);
    const detail = await svc.getInsurerById(INSURER_ID, 'main', auth);
    expect(detail.id).toBe(INSURER_ID);
    expect(detail.insurerKey).toBe('hr_insurer_custom_09');
  });

  it('VAL-SI-INR-CAT-06: member CEO cannot get holding insurer (OOS)', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (schemaPassthrough(sql)) return { rows: [] };
        if (String(sql).includes('FROM public.si_insurer') && String(sql).includes('id = $1')) {
          return { rows: [baseRow({ company_id: 'holding' })] };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new SiInsurerService(db);
    await expect(
      svc.getInsurerById(INSURER_ID, 'main', memberCeoToken()),
    ).rejects.toBeInstanceOf(ApiException);
  });

  it('VAL-SI-INR-ALS-01: SI wins collision over group REF insurers', async () => {
    const settings = {
      getEffectiveItemsForKey: jest.fn().mockResolvedValue([
        {
          status: 'active',
          code: 'VSS',
          label: 'VSS REF',
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
        if (String(sql).includes('FROM public.si_insurer')) {
          return {
            rows: [
              baseRow({
                insurer_key: 'VSS',
                name_vi: 'VSS SI native',
              }),
            ],
          };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new SiInsurerService(db, settings);
    const effective = await svc.listEffective({ company_id: 'holding' }, groupCeoToken(), {
      tenantId: 'xevn',
    });
    expect(effective.total).toBe(2);
    const vss = effective.data.find((r) => r.insurerKey === 'VSS');
    expect(vss?.nameVi).toBe('VSS SI native');
    expect(vss?.source).toBe('si_override');
    const refOnly = effective.data.find((r) => r.insurerKey === 'ref_only');
    expect(refOnly?.source).toBe('group_ref');
  });

  it('VAL-SI-INR-CNS-01: assert invent when effective >0 → HRM-INS-INSURER-KEY', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (schemaPassthrough(sql)) return { rows: [] };
        if (String(sql).includes('FROM public.si_insurer')) {
          return { rows: [baseRow({ insurer_key: 'VSS', name_vi: 'VSS' })] };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new SiInsurerService(db);
    await expect(
      svc.assertInsurerInEffectiveCatalog({
        companyId: 'holding',
        insurerKey: 'not_in_catalog',
        authorization: groupCeoToken(),
        tenantId: 'xevn',
      }),
    ).rejects.toMatchObject({ code: 'HRM-INS-INSURER-KEY' });
  });

  it('VAL-SI-INR-CNS-06: alias in legacy_alias_keys_json resolves to canonical', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (schemaPassthrough(sql)) return { rows: [] };
        if (String(sql).includes('FROM public.si_insurer')) {
          return {
            rows: [
              baseRow({
                insurer_key: 'VSS',
                name_vi: 'VSS',
                legacy_alias_keys_json: ['BHXH_VN'],
              }),
            ],
          };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new SiInsurerService(db);
    const hit = await svc.assertInsurerInEffectiveCatalog({
      companyId: 'holding',
      insurerKey: 'BHXH_VN',
      authorization: groupCeoToken(),
      tenantId: 'xevn',
    });
    expect(hit?.insurerKey).toBe('VSS');
  });

  it('VAL-SI-INR-CAT-09: empty effective soft-allows (U65 — no fake starter)', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (schemaPassthrough(sql)) return { rows: [] };
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new SiInsurerService(db);
    const hit = await svc.assertInsurerInEffectiveCatalog({
      companyId: 'holding',
      insurerKey: 'anything',
      authorization: groupCeoToken(),
    });
    expect(hit).toBeNull();
  });

  it('VAL-SI-INR-CAT-04/05: retire soft-deletes — no hard DELETE', async () => {
    const sqls: string[] = [];
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        sqls.push(String(sql));
        if (schemaPassthrough(sql)) return { rows: [] };
        const s = String(sql);
        if (s.includes('FROM public.si_insurer') && s.includes('id = $1')) {
          return { rows: [baseRow()] };
        }
        if (s.includes('UPDATE public.si_insurer') && s.includes("status = 'retired'")) {
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
    const svc = new SiInsurerService(db);
    const retired = await svc.retireInsurer(INSURER_ID, 'holding', groupCeoToken());
    expect(retired.status).toBe('retired');
    expect(retired.archivedAt).toBeTruthy();
    expect(sqls.every((q) => !q.includes('DELETE FROM public.si_insurer'))).toBe(true);
  });

  it('VAL-SI-INR-CNS-07: invent insurer KEY ≠ type KEY taxonomy', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (schemaPassthrough(sql)) return { rows: [] };
        if (String(sql).includes('FROM public.si_insurer')) {
          return { rows: [baseRow({ insurer_key: 'VSS' })] };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new SiInsurerService(db);
    try {
      await svc.assertInsurerInEffectiveCatalog({
        companyId: 'holding',
        insurerKey: 'invent_type_looking',
        authorization: groupCeoToken(),
      });
      fail('expected ApiException');
    } catch (err) {
      expect(err).toMatchObject({ code: 'HRM-INS-INSURER-KEY' });
      expect((err as { code: string }).code).not.toBe('HRM-INS-TYPE-KEY');
    }
  });
});
