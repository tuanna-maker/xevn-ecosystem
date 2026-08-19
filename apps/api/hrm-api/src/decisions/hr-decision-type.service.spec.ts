/**
 * PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-BE-01 —
 * ensureSchema · open catalog · effective union DEC wins · scope_parity U19 · VAL-DEC-CAT/CNS
 */
import { ApiException } from '../common/api.exception';
import { signServiceJwt } from '../common/jwt-sign';
import { HrmDbService } from '../db/hrm-db.service';
import { DecisionsService } from './decisions.service';
import { HrDecisionTypeService } from './hr-decision-type.service';

const TYP_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const TYP_ID_2 = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';

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
    id: TYP_ID,
    company_id: 'holding',
    decision_type_key: 'hr_custom_dec_09',
    name_vi: 'QSĐ HR tùy chỉnh 09',
    sort_order: 100,
    is_person_bound: false,
    writes_work_history: false,
    wh_event_type: null,
    requires_position_key: false,
    legacy_alias_keys_json: null,
    color_token: null,
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

describe('HrDecisionTypeService (PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-BE-01)', () => {
  it('ensureSchema ADD hr_decision_type + CHKs; FORBIDDEN closed decision_type_key IN', async () => {
    const sqls: string[] = [];
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        sqls.push(String(sql));
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new HrDecisionTypeService(db);
    await svc.ensureSchema();
    expect(sqls.some((q) => q.includes('CREATE TABLE IF NOT EXISTS public.hr_decision_type'))).toBe(
      true,
    );
    expect(sqls.some((q) => q.includes('uq_hr_decision_type_company_key_active'))).toBe(true);
    expect(sqls.some((q) => q.includes('chk_hr_decision_type_key_format'))).toBe(true);
    expect(sqls.some((q) => q.includes('chk_hr_decision_type_wh_flags'))).toBe(true);
    expect(sqls.every((q) => !q.includes("decision_type_key IN ("))).toBe(true);
    expect(sqls.every((q) => !q.includes("'HRD_01'"))).toBe(true);
    expect(sqls.every((q) => !q.includes("decision_type IN ("))).toBe(true);
  });

  it('VAL-DEC-CAT-03: reject invalid slug format (spaces / leading digit)', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (schemaPassthrough(sql)) return { rows: [] };
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new HrDecisionTypeService(db);
    await expect(
      svc.upsertDecisionType(
        {
          companyId: 'holding',
          decisionTypeKey: '9bad',
          nameVi: 'Bad',
        },
        groupCeoToken(),
      ),
    ).rejects.toMatchObject({ code: 'HRM-PLT-CAT-CODE-INVALID' });
    await expect(
      svc.upsertDecisionType(
        {
          companyId: 'holding',
          decisionTypeKey: 'has space',
          nameVi: 'Bad',
        },
        groupCeoToken(),
      ),
    ).rejects.toMatchObject({ code: 'HRM-PLT-CAT-CODE-INVALID' });
  });

  it('VAL-DEC-CAT-01: open catalog accepts hr_custom_dec_09 and HRD_01 (not ceiling)', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (schemaPassthrough(sql)) return { rows: [] };
        const s = String(sql);
        if (s.includes('FROM public.hr_decision_type') && s.includes('archived_at IS NULL')) {
          return { rows: [] };
        }
        if (s.includes('INSERT INTO public.hr_decision_type')) {
          return { rows: [baseRow()] };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new HrDecisionTypeService(db);
    const row = await svc.upsertDecisionType(
      {
        companyId: 'holding',
        decisionTypeKey: 'hr_custom_dec_09',
        nameVi: 'QSĐ HR tùy chỉnh 09',
      },
      groupCeoToken(),
    );
    expect(row.decisionTypeKey).toBe('hr_custom_dec_09');
    expect(row.source).toBe('dec_native');

    const db2 = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (schemaPassthrough(sql)) return { rows: [] };
        const s = String(sql);
        if (s.includes('FROM public.hr_decision_type') && s.includes('archived_at IS NULL')) {
          return { rows: [] };
        }
        if (s.includes('INSERT INTO public.hr_decision_type')) {
          return {
            rows: [
              baseRow({
                decision_type_key: 'HRD_01',
                name_vi: 'Bổ nhiệm',
                is_person_bound: true,
                writes_work_history: true,
                wh_event_type: 'appointment',
                requires_position_key: true,
              }),
            ],
          };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc2 = new HrDecisionTypeService(db2);
    const hrd = await svc2.upsertDecisionType(
      {
        companyId: 'holding',
        decisionTypeKey: 'HRD_01',
        nameVi: 'Bổ nhiệm',
        isPersonBound: true,
        writesWorkHistory: true,
        whEventType: 'appointment',
      },
      groupCeoToken(),
    );
    expect(hrd.decisionTypeKey).toBe('HRD_01');
    expect(hrd.writesWorkHistory).toBe(true);
  });

  it('VAL-DEC-CAT-06/07: writesWorkHistory without person_bound / whEventType → HRM-VAL-400', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (schemaPassthrough(sql)) return { rows: [] };
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new HrDecisionTypeService(db);
    await expect(
      svc.upsertDecisionType(
        {
          companyId: 'holding',
          decisionTypeKey: 'wh_bad',
          nameVi: 'Bad WH',
          writesWorkHistory: true,
          isPersonBound: false,
          whEventType: 'appointment',
        },
        groupCeoToken(),
      ),
    ).rejects.toMatchObject({ code: 'HRM-VAL-400' });
    await expect(
      svc.upsertDecisionType(
        {
          companyId: 'holding',
          decisionTypeKey: 'wh_bad2',
          nameVi: 'Bad WH2',
          writesWorkHistory: true,
          isPersonBound: true,
        },
        groupCeoToken(),
      ),
    ).rejects.toMatchObject({ code: 'HRM-VAL-400' });
  });

  it('scope_parity: list id → getById 200 (group CEO main→holding)', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string, params?: unknown[]) => {
        if (schemaPassthrough(sql)) return { rows: [] };
        const s = String(sql);
        if (s.includes('FROM public.hr_decision_type') && s.includes('ORDER BY sort_order')) {
          expect(JSON.stringify(params ?? [])).toMatch(/holding|main/);
          return { rows: [baseRow()] };
        }
        if (s.includes('FROM public.hr_decision_type') && s.includes('id = $1')) {
          return { rows: [baseRow()] };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new HrDecisionTypeService(db);
    const auth = groupCeoToken();
    const list = await svc.listDecisionTypes({ company_id: 'main' }, auth);
    expect(list.data).toHaveLength(1);
    const detail = await svc.getDecisionTypeById(TYP_ID, 'main', auth);
    expect(detail.id).toBe(TYP_ID);
    expect(detail.decisionTypeKey).toBe('hr_custom_dec_09');
  });

  it('VAL-DEC-SCP-01: member CEO cannot get holding decision type (OOS)', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (schemaPassthrough(sql)) return { rows: [] };
        if (String(sql).includes('FROM public.hr_decision_type') && String(sql).includes('id = $1')) {
          return { rows: [baseRow({ company_id: 'holding' })] };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new HrDecisionTypeService(db);
    await expect(
      svc.getDecisionTypeById(TYP_ID, 'main', memberCeoToken()),
    ).rejects.toBeInstanceOf(ApiException);
  });

  it('F-DEC-CAT-EFF-01: DEC wins collision over group REF', async () => {
    const settings = {
      getEffectiveItemsForKey: jest.fn().mockResolvedValue([
        {
          status: 'active',
          code: 'HRD_01',
          label: 'Bổ nhiệm REF',
          metadata: { is_person_bound: true, writes_work_history: true, wh_event_type: 'appointment' },
        },
        {
          status: 'active',
          code: 'ref_only',
          label: 'Chỉ REF',
          metadata: {},
        },
      ]),
    };
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (schemaPassthrough(sql)) return { rows: [] };
        if (String(sql).includes('FROM public.hr_decision_type')) {
          return {
            rows: [
              baseRow({
                decision_type_key: 'HRD_01',
                name_vi: 'Bổ nhiệm DEC native',
                is_person_bound: true,
                writes_work_history: true,
                wh_event_type: 'appointment',
                requires_position_key: true,
              }),
            ],
          };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new HrDecisionTypeService(db, settings);
    const effective = await svc.listEffective({ company_id: 'holding' }, groupCeoToken(), {
      tenantId: 'xevn',
    });
    expect(effective.total).toBe(2);
    const hrd = effective.data.find((r) => r.decisionTypeKey.toLowerCase() === 'hrd_01');
    expect(hrd?.nameVi).toBe('Bổ nhiệm DEC native');
    expect(hrd?.source).toBe('dec_override');
    const refOnly = effective.data.find((r) => r.decisionTypeKey === 'ref_only');
    expect(refOnly?.source).toBe('group_ref');
    expect(effective.personBoundKeys).toContain('hrd_01');
    expect(effective.workHistoryNeoKeys).toContain('hrd_01');
  });

  it('VAL-DEC-CNS-01: assert unknown when effective >0 → HRM-DEC-TYPE-UNKNOWN', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (schemaPassthrough(sql)) return { rows: [] };
        if (String(sql).includes('FROM public.hr_decision_type')) {
          return { rows: [baseRow({ decision_type_key: 'HRD_01', name_vi: 'Bổ nhiệm' })] };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new HrDecisionTypeService(db);
    await expect(
      svc.assertDecisionTypeInEffectiveCatalog({
        companyId: 'holding',
        decisionType: 'not_in_catalog',
        authorization: groupCeoToken(),
        tenantId: 'xevn',
      }),
    ).rejects.toMatchObject({ code: 'HRM-DEC-TYPE-UNKNOWN' });
  });

  it('empty effective catalog soft-allows (U65 — no fake starter)', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (schemaPassthrough(sql)) return { rows: [] };
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new HrDecisionTypeService(db);
    const hit = await svc.assertDecisionTypeInEffectiveCatalog({
      companyId: 'holding',
      decisionType: 'anything',
      authorization: groupCeoToken(),
    });
    expect(hit).toBeNull();
  });

  it('VAL-DEC-CAT-04: retire soft-deletes — status=retired + archived_at (no hard DELETE)', async () => {
    const sqls: string[] = [];
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        sqls.push(String(sql));
        if (schemaPassthrough(sql)) return { rows: [] };
        const s = String(sql);
        if (s.includes('FROM public.hr_decision_type') && s.includes('id = $1')) {
          return { rows: [baseRow()] };
        }
        if (s.includes('UPDATE public.hr_decision_type') && s.includes("status = 'retired'")) {
          return {
            rows: [
              baseRow({
                status: 'retired',
                archived_at: '2026-08-07T12:00:00Z',
              }),
            ],
          };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new HrDecisionTypeService(db);
    const row = await svc.retireDecisionType(TYP_ID, 'holding', groupCeoToken());
    expect(row.status).toBe('retired');
    expect(row.archivedAt).toBeTruthy();
    expect(sqls.every((q) => !q.includes('DELETE FROM public.hr_decision_type'))).toBe(true);
  });

  it('VAL-DEC-CAT-10: retire last WH-producing type → HRM-DEC-TYP-WH-REQUIRED', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (schemaPassthrough(sql)) return { rows: [] };
        const s = String(sql);
        if (s.includes('FROM public.hr_decision_type') && s.includes('id = $1')) {
          return {
            rows: [
              baseRow({
                writes_work_history: true,
                is_person_bound: true,
                wh_event_type: 'appointment',
                requires_position_key: true,
              }),
            ],
          };
        }
        if (s.includes('COUNT(*)') && s.includes('writes_work_history')) {
          return { rows: [{ c: '0' }] };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new HrDecisionTypeService(db);
    await expect(
      svc.retireDecisionType(TYP_ID, 'holding', groupCeoToken()),
    ).rejects.toMatchObject({ code: 'HRM-DEC-TYP-WH-REQUIRED' });
  });

  it('VAL-DEC-CAT-10 peer: retire WH type when another WH peer remains → soft OK', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (schemaPassthrough(sql)) return { rows: [] };
        const s = String(sql);
        if (s.includes('FROM public.hr_decision_type') && s.includes('id = $1')) {
          return {
            rows: [
              baseRow({
                id: TYP_ID,
                writes_work_history: true,
                is_person_bound: true,
                wh_event_type: 'appointment',
              }),
            ],
          };
        }
        if (s.includes('COUNT(*)') && s.includes('writes_work_history')) {
          return { rows: [{ c: '1' }] };
        }
        if (s.includes('UPDATE public.hr_decision_type') && s.includes("status = 'retired'")) {
          return {
            rows: [
              baseRow({
                id: TYP_ID,
                status: 'retired',
                archived_at: '2026-08-07T12:00:00Z',
                writes_work_history: true,
              }),
            ],
          };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new HrDecisionTypeService(db);
    const row = await svc.retireDecisionType(TYP_ID, 'holding', groupCeoToken());
    expect(row.status).toBe('retired');
    expect(TYP_ID_2).toBeTruthy(); // peer id reserved for docs
  });
});

describe('DecisionsService consumer wire (VAL-DEC-CNS / R-PLT-DEC-01)', () => {
  it('VAL-DEC-CNS-01: create with catalog >0 unknown type → HRM-DEC-TYPE-UNKNOWN', async () => {
    const catalog = {
      assertDecisionTypeInEffectiveCatalog: jest.fn().mockRejectedValue(
        Object.assign(new ApiException('HRM-DEC-TYPE-UNKNOWN', 'unknown', 400), {
          code: 'HRM-DEC-TYPE-UNKNOWN',
        }),
      ),
    } as unknown as HrDecisionTypeService;
    const db = {
      query: jest.fn().mockResolvedValue({ rows: [] }),
    } as unknown as HrmDbService;
    const svc = new DecisionsService(db, undefined, catalog);
    await expect(
      svc.createDecision({
        company_id: 'holding',
        decision_type: 'free_text_junk',
        employee_name: 'A',
        position_key: 'NV_KD',
      }),
    ).rejects.toMatchObject({ code: 'HRM-DEC-TYPE-UNKNOWN' });
  });

  it('VAL-DEC-CNS-02: person-bound catalog flag missing employee_id → HRM-DEC-EMP-REQUIRED', async () => {
    const catalog = {
      assertDecisionTypeInEffectiveCatalog: jest.fn().mockResolvedValue({
        id: TYP_ID,
        companyId: 'holding',
        decisionTypeKey: 'HRD_01',
        nameVi: 'Bổ nhiệm',
        sortOrder: 10,
        isPersonBound: true,
        writesWorkHistory: true,
        whEventType: 'appointment',
        requiresPositionKey: true,
        legacyAliasKeys: null,
        colorToken: null,
        metadata: null,
        status: 'active',
        source: 'dec_native',
        catalogKind: 'hr_decision_type',
        archivedAt: null,
        updatedAt: '2026-08-07T00:00:00Z',
        createdAt: '2026-08-07T00:00:00Z',
      }),
    } as unknown as HrDecisionTypeService;
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (schemaPassthrough(sql)) return { rows: [] };
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new DecisionsService(db, undefined, catalog);
    await expect(
      svc.createDecision({
        company_id: 'holding',
        decision_type: 'HRD_01',
        employee_name: 'A',
        position_key: 'NV_KD',
      }),
    ).rejects.toMatchObject({ code: 'HRM-DEC-EMP-REQUIRED' });
  });

  it('VAL-DEC-CNS-03: !is_person_bound allows null employee_id', async () => {
    const catalog = {
      assertDecisionTypeInEffectiveCatalog: jest.fn().mockResolvedValue({
        id: TYP_ID,
        companyId: 'holding',
        decisionTypeKey: 'org_notice',
        nameVi: 'Thông báo tổ chức',
        sortOrder: 50,
        isPersonBound: false,
        writesWorkHistory: false,
        whEventType: null,
        requiresPositionKey: false,
        legacyAliasKeys: null,
        colorToken: null,
        metadata: null,
        status: 'active',
        source: 'dec_native',
        catalogKind: 'hr_decision_type',
        archivedAt: null,
        updatedAt: '2026-08-07T00:00:00Z',
        createdAt: '2026-08-07T00:00:00Z',
      }),
    } as unknown as HrDecisionTypeService;
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (schemaPassthrough(sql)) return { rows: [] };
        if (String(sql).includes('INSERT INTO public.hr_decisions')) {
          return {
            rows: [
              {
                id: 'dec-1',
                company_id: 'holding',
                decision_code: 'DEC-1',
                decision_type: 'org_notice',
                title: 't',
                content: null,
                employee_id: null,
                employee_name: 'Org',
                employee_code: null,
                department: null,
                department_key: null,
                position: null,
                position_key: null,
                effective_date: null,
                expiry_date: null,
                signer_name: null,
                signer_position: null,
                signer_position_key: null,
                signing_date: null,
                file_url: null,
                status: 'draft',
                notes: null,
                created_at: '2026-08-07',
                updated_at: '2026-08-07',
              },
            ],
          };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new DecisionsService(db, undefined, catalog);
    const out = await svc.createDecision({
      company_id: 'holding',
      decision_type: 'org_notice',
      employee_name: 'Org',
    });
    expect(out.decision_type).toBe('org_notice');
    expect(out.employee_id).toBeNull();
  });
});
