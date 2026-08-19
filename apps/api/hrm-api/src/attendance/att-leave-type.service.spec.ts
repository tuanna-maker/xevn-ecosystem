/**
 * PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-BE-01 —
 * ensureSchema · open catalog · effective union ATT wins · scope_parity U19
 */
import { ApiException } from '../common/api.exception';
import { signServiceJwt } from '../common/jwt-sign';
import { HrmDbService } from '../db/hrm-db.service';
import { AttLeaveTypeService } from './att-leave-type.service';
import { ATT_LEAVE_TYPES_GROUP_REF_KEY } from './att-leave-type.constants';
import { HRM_SC_LEAVE_KEY } from '../settings-catalogs/hrm-settings-master-keys';

const LVT_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

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
    id: LVT_ID,
    company_id: 'holding',
    leave_type_key: 'hr_custom_09',
    name_vi: 'Phép HR tùy chỉnh 09',
    category: 'other',
    is_paid: true,
    allows_carry_over: false,
    allows_advance: false,
    insurance_regime_flag: false,
    company_topup_flag: false,
    counts_toward_timesheet: true,
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

describe('AttLeaveTypeService (PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-BE-01)', () => {
  it('HRM-SC-01: group REF partition key aligns settings-catalogs leave_types', () => {
    expect(ATT_LEAVE_TYPES_GROUP_REF_KEY).toBe(HRM_SC_LEAVE_KEY);
  });

  it('ensureSchema ADD att_leave_type + CHKs; FORBIDDEN closed leave_type_key IN', async () => {
    const sqls: string[] = [];
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        sqls.push(String(sql));
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new AttLeaveTypeService(db);
    await svc.ensureSchema();
    expect(sqls.some((q) => q.includes('CREATE TABLE IF NOT EXISTS public.att_leave_type'))).toBe(
      true,
    );
    expect(sqls.some((q) => q.includes('uq_att_leave_type_company_key_active'))).toBe(true);
    expect(sqls.some((q) => q.includes('chk_att_leave_type_key_format'))).toBe(true);
    expect(sqls.some((q) => q.includes('chk_att_leave_type_category'))).toBe(true);
    expect(sqls.every((q) => !q.includes("leave_type_key IN ("))).toBe(true);
    expect(sqls.every((q) => !q.includes("leave_type_key IN ('annual'"))).toBe(true);
    expect(sqls.every((q) => !q.includes("'LVT_01'"))).toBe(true);
  });

  it('VAL-ATT-LVT-02: reject uppercase / invalid format (not closed enum)', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (schemaPassthrough(sql)) return { rows: [] };
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new AttLeaveTypeService(db);
    await expect(
      svc.upsertLeaveType(
        {
          companyId: 'holding',
          leaveTypeKey: 'Annual',
          nameVi: 'Phép năm',
          category: 'annual',
        },
        groupCeoToken(),
      ),
    ).rejects.toMatchObject({ code: 'HRM-PLT-CAT-CODE-INVALID' });
  });

  it('VAL-ATT-LVT-04: open catalog accepts hr_custom_09 (9th+)', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (schemaPassthrough(sql)) return { rows: [] };
        const s = String(sql);
        if (s.includes('FROM public.att_leave_type') && s.includes('archived_at IS NULL')) {
          return { rows: [] };
        }
        if (s.includes('INSERT INTO public.att_leave_type')) {
          return { rows: [baseRow()] };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new AttLeaveTypeService(db);
    const row = await svc.upsertLeaveType(
      {
        companyId: 'holding',
        leaveTypeKey: 'hr_custom_09',
        nameVi: 'Phép HR tùy chỉnh 09',
        category: 'other',
      },
      groupCeoToken(),
    );
    expect(row.leaveTypeKey).toBe('hr_custom_09');
    expect(row.source).toBe('att_native');
  });

  it('scope_parity: list id → getById 200 (group CEO main→holding)', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string, params?: unknown[]) => {
        if (schemaPassthrough(sql)) return { rows: [] };
        const s = String(sql);
        if (s.includes('FROM public.att_leave_type') && s.includes('ORDER BY leave_type_key')) {
          expect(JSON.stringify(params ?? [])).toMatch(/holding|main/);
          return { rows: [baseRow()] };
        }
        if (s.includes('FROM public.att_leave_type') && s.includes('id = $1')) {
          return { rows: [baseRow()] };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new AttLeaveTypeService(db);
    const auth = groupCeoToken();
    const list = await svc.listLeaveTypes({ company_id: 'main' }, auth);
    expect(list.data).toHaveLength(1);
    const detail = await svc.getLeaveTypeById(LVT_ID, 'main', auth);
    expect(detail.id).toBe(LVT_ID);
    expect(detail.leaveTypeKey).toBe('hr_custom_09');
  });

  it('scope_parity: member CEO cannot get holding leave type (OOS)', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (schemaPassthrough(sql)) return { rows: [] };
        if (String(sql).includes('FROM public.att_leave_type') && String(sql).includes('id = $1')) {
          return { rows: [baseRow({ company_id: 'holding' })] };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new AttLeaveTypeService(db);
    await expect(
      svc.getLeaveTypeById(LVT_ID, 'main', memberCeoToken()),
    ).rejects.toBeInstanceOf(ApiException);
  });

  it('F-ATT-CAT-EFF-01: ATT wins collision over group REF', async () => {
    const settings = {
      getEffectiveItemsForKey: jest.fn().mockResolvedValue([
        {
          status: 'active',
          code: 'annual',
          label: 'Phép năm REF',
          metadata: { category: 'annual', is_paid: true },
        },
        {
          status: 'active',
          code: 'ref_only',
          label: 'Chỉ REF',
          metadata: { category: 'other' },
        },
      ]),
    };
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (schemaPassthrough(sql)) return { rows: [] };
        if (String(sql).includes('FROM public.att_leave_type')) {
          return {
            rows: [
              baseRow({
                leave_type_key: 'annual',
                name_vi: 'Phép năm ATT native',
                category: 'annual',
              }),
            ],
          };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new AttLeaveTypeService(db, settings);
    const effective = await svc.listEffective({ company_id: 'holding' }, groupCeoToken(), {
      tenantId: 'xevn',
    });
    expect(effective.total).toBe(2);
    const annual = effective.data.find((r) => r.leaveTypeKey === 'annual');
    expect(annual?.nameVi).toBe('Phép năm ATT native');
    expect(annual?.source).toBe('att_override');
    const refOnly = effective.data.find((r) => r.leaveTypeKey === 'ref_only');
    expect(refOnly?.source).toBe('group_ref');
  });

  it('VAL-ATT-LVT-08: assert unknown when effective >0 → HRM-LEAVE-TYPE-UNKNOWN', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (schemaPassthrough(sql)) return { rows: [] };
        if (String(sql).includes('FROM public.att_leave_type')) {
          return { rows: [baseRow({ leave_type_key: 'annual', name_vi: 'Phép năm' })] };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new AttLeaveTypeService(db);
    await expect(
      svc.assertLeaveTypeInEffectiveCatalog({
        companyId: 'holding',
        leaveType: 'not_in_catalog',
        authorization: groupCeoToken(),
        tenantId: 'xevn',
      }),
    ).rejects.toMatchObject({ code: 'HRM-LEAVE-TYPE-UNKNOWN' });
  });

  it('empty effective catalog soft-allows (U65 — no fake starter)', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (schemaPassthrough(sql)) return { rows: [] };
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new AttLeaveTypeService(db);
    const hit = await svc.assertLeaveTypeInEffectiveCatalog({
      companyId: 'holding',
      leaveType: 'anything',
      authorization: groupCeoToken(),
    });
    expect(hit).toBeNull();
  });

  it('retire soft-deletes — status=retired + archived_at (no hard DELETE)', async () => {
    const sqls: string[] = [];
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        sqls.push(String(sql));
        if (schemaPassthrough(sql)) return { rows: [] };
        const s = String(sql);
        if (s.includes('FROM public.att_leave_type') && s.includes('id = $1')) {
          return { rows: [baseRow()] };
        }
        if (s.includes('UPDATE public.att_leave_type') && s.includes("status = 'retired'")) {
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
    const svc = new AttLeaveTypeService(db);
    const row = await svc.retireLeaveType(LVT_ID, 'holding', groupCeoToken());
    expect(row.status).toBe('retired');
    expect(row.archivedAt).toBeTruthy();
    expect(sqls.every((q) => !q.includes('DELETE FROM public.att_leave_type'))).toBe(true);
  });
});
