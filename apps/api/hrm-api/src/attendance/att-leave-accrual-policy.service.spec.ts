/**
 * PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-BE-01 —
 * ensureSchema · invent KEY · soft-retire hide · list active · orphan type · scope_parity
 */
import { ApiException } from '../common/api.exception';
import { signServiceJwt } from '../common/jwt-sign';
import { HrmDbService } from '../db/hrm-db.service';
import { AttLeaveAccrualPolicyService } from './att-leave-accrual-policy.service';
import { AttLeaveTypeService } from './att-leave-type.service';
import {
  HRM_ATT_LVRULE_KEY,
  HRM_ATT_LVRULE_TYPE,
} from './att-leave-accrual-policy.constants';
import { HRM_LEAVE_TYPE_UNKNOWN } from './att-leave-type.constants';

const POL_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
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

function basePolicy(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: POL_ID,
    company_id: 'holding',
    leave_type_key: 'annual',
    version: 1,
    effective_from: '2026-01-01',
    effective_to: null,
    accrual_mode: 'year_start_grant',
    annual_days: '12',
    unit: 'day',
    allow_negative: false,
    carry_over_expire_rule: null,
    carry_cap_days: null,
    max_balance_days: null,
    advance_max_days: null,
    advance_cap_percent: null,
    metadata_json: null,
    status: 'active',
    archived_at: null,
    created_at: '2026-08-08T00:00:00Z',
    updated_at: '2026-08-08T00:00:00Z',
    leave_type_name_vi: 'Phép năm',
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

describe('AttLeaveAccrualPolicyService (PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-BE-01)', () => {
  it('ensureSchema ADD att_leave_accrual_policy + UQ/IX/CHKs; FORBIDDEN closed leave_type_key IN', async () => {
    const sqls: string[] = [];
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        sqls.push(String(sql));
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new AttLeaveAccrualPolicyService(db);
    await svc.ensureSchema();
    expect(
      sqls.some((q) =>
        q.includes(
          'CREATE TABLE IF NOT EXISTS public.att_leave_accrual_policy',
        ),
      ),
    ).toBe(true);
    expect(
      sqls.some((q) =>
        q.includes('uq_att_leave_accrual_policy_company_key_version_active'),
      ),
    ).toBe(true);
    expect(
      sqls.some((q) =>
        q.includes('ix_att_leave_accrual_policy_resolve_effective'),
      ),
    ).toBe(true);
    expect(sqls.every((q) => !q.includes('leave_type_key IN ('))).toBe(true);
    expect(
      sqls.every(
        (q) => !q.includes('DELETE FROM public.att_leave_accrual_policy'),
      ),
    ).toBe(true);
  });

  it('VAL-ATT-LVRULE-CNS-01: invent policy_id when active>0 → HRM-ATT-LVRULE-KEY', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (schemaPassthrough(sql)) return { rows: [] };
        const s = String(sql);
        if (s.includes('COUNT(*)') && s.includes('att_leave_accrual_policy')) {
          return { rows: [{ c: '1' }] };
        }
        if (
          s.includes('FROM public.att_leave_accrual_policy') &&
          s.includes('p.id')
        ) {
          return { rows: [] };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new AttLeaveAccrualPolicyService(db);
    await expect(
      svc.assertLeaveAccrualPolicyForConsumer({
        companyId: 'holding',
        leaveTypeKey: 'annual',
        policyId: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
        authorization: groupCeoToken(),
        tenantId: 'xevn',
      }),
    ).rejects.toMatchObject({ code: HRM_ATT_LVRULE_KEY });
  });

  it('VAL-ATT-LVRULE-CNS-01: malformed policyId (non-UUID) when active>0 → HRM-ATT-LVRULE-KEY (no ::uuid 500)', async () => {
    const idSelects: string[] = [];
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (schemaPassthrough(sql)) return { rows: [] };
        const s = String(sql);
        if (s.includes('COUNT(*)') && s.includes('att_leave_accrual_policy')) {
          return { rows: [{ c: '1' }] };
        }
        if (
          s.includes('FROM public.att_leave_accrual_policy') &&
          s.includes('p.id')
        ) {
          idSelects.push(s);
          return { rows: [] };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new AttLeaveAccrualPolicyService(db);
    await expect(
      svc.assertLeaveAccrualPolicyForConsumer({
        companyId: 'holding',
        leaveTypeKey: 'annual',
        policyId: 'not-a-uuid',
        authorization: groupCeoToken(),
        tenantId: 'xevn',
      }),
    ).rejects.toMatchObject({ code: HRM_ATT_LVRULE_KEY });
    // Guard must fire before the ::uuid cast query (deterministic 400, never a DB 500).
    expect(idSelects).toHaveLength(0);
  });

  it('VAL-ATT-LVRULE-CNS-01: invent ad-hoc annualDays when active>0 → HRM-ATT-LVRULE-KEY', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (schemaPassthrough(sql)) return { rows: [] };
        const s = String(sql);
        if (s.includes('COUNT(*)') && s.includes('att_leave_accrual_policy')) {
          return { rows: [{ c: '2' }] };
        }
        if (s.includes('FROM public.att_leave_accrual_policy')) {
          return { rows: [] };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new AttLeaveAccrualPolicyService(db);
    await expect(
      svc.assertLeaveAccrualPolicyForConsumer({
        companyId: 'holding',
        leaveTypeKey: 'annual',
        accrualMode: 'year_start_grant',
        annualDays: 99,
        authorization: groupCeoToken(),
      }),
    ).rejects.toMatchObject({ code: HRM_ATT_LVRULE_KEY });
  });

  it('VAL-ATT-LVRULE-CNS-05: active=0 soft-skips invent (U65 no seed)', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (schemaPassthrough(sql)) return { rows: [] };
        if (String(sql).includes('COUNT(*)')) {
          return { rows: [{ c: '0' }] };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new AttLeaveAccrualPolicyService(db);
    const hit = await svc.assertLeaveAccrualPolicyForConsumer({
      companyId: 'holding',
      leaveTypeKey: 'annual',
      policyId: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
      authorization: groupCeoToken(),
    });
    expect(hit).toBeNull();
  });

  it('LVRULE-KEY ≠ HRM-LEAVE-TYPE-UNKNOWN (orthogonal stamps)', () => {
    expect(HRM_ATT_LVRULE_KEY).toBe('HRM-ATT-LVRULE-KEY');
    expect(HRM_ATT_LVRULE_KEY).not.toBe(HRM_LEAVE_TYPE_UNKNOWN);
    expect(HRM_ATT_LVRULE_TYPE).not.toBe(HRM_LEAVE_TYPE_UNKNOWN);
  });

  it('VAL-ATT-LVRULE-02: admin orphan leave_type_key → HRM-ATT-LVRULE-TYPE', async () => {
    const leaveTypes = {
      listEffective: jest.fn().mockResolvedValue({
        total: 1,
        data: [
          {
            leaveTypeKey: 'annual',
            nameVi: 'Phép năm',
            status: 'active',
          },
        ],
      }),
    } as unknown as AttLeaveTypeService;
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (schemaPassthrough(sql)) return { rows: [] };
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new AttLeaveAccrualPolicyService(db, leaveTypes);
    await expect(
      svc.createPolicy(
        {
          companyId: 'holding',
          leaveTypeKey: 'orphan_type_xx',
          accrualMode: 'year_start_grant',
          annualDays: 12,
          effectiveFrom: '2026-01-01',
        },
        groupCeoToken(),
        'xevn',
      ),
    ).rejects.toMatchObject({ code: HRM_ATT_LVRULE_TYPE });
  });

  it('AC-01d: admin CREATE N+1 with EFF leave type → display-ready', async () => {
    const leaveTypes = {
      listEffective: jest.fn().mockResolvedValue({
        total: 1,
        data: [
          { leaveTypeKey: 'annual', nameVi: 'Phép năm', status: 'active' },
        ],
      }),
    } as unknown as AttLeaveTypeService;
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (schemaPassthrough(sql)) return { rows: [] };
        const s = String(sql);
        if (s.includes('MAX(version)')) {
          return { rows: [{ m: '1' }] };
        }
        if (
          s.includes('SELECT id::text AS id') &&
          s.includes("status = 'active'")
        ) {
          return { rows: [] };
        }
        if (s.includes('INSERT INTO public.att_leave_accrual_policy')) {
          return { rows: [basePolicy({ version: 2 })] };
        }
        if (
          s.includes('FROM public.att_leave_accrual_policy') &&
          s.includes('id = $1')
        ) {
          return {
            rows: [
              basePolicy({
                version: 2,
                leave_type_name_vi: 'Phép năm',
              }),
            ],
          };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new AttLeaveAccrualPolicyService(db, leaveTypes);
    const row = await svc.createPolicy(
      {
        companyId: 'holding',
        leaveTypeKey: 'annual',
        accrualMode: 'year_start_grant',
        annualDays: 12,
        effectiveFrom: '2026-01-01',
      },
      groupCeoToken(),
      'xevn',
    );
    expect(row.leaveTypeKey).toBe('annual');
    expect(row.leaveTypeNameVi).toBe('Phép năm');
    expect(row.accrualModeLabel).toBeTruthy();
    expect(row.statusLabel).toBeTruthy();
    expect(row.version).toBe(2);
    expect(row.catalogKind).toBe('att_leave_accrual_policy');
  });

  it('ATT-04b: createPolicy persists advance cap fields on DTO', async () => {
    const leaveTypes = {
      listEffective: jest.fn().mockResolvedValue({
        total: 1,
        data: [
          { leaveTypeKey: 'annual', nameVi: 'Phép năm', status: 'active' },
        ],
      }),
    } as unknown as AttLeaveTypeService;
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (schemaPassthrough(sql)) return { rows: [] };
        const s = String(sql);
        if (s.includes('MAX(version)')) {
          return { rows: [{ m: '1' }] };
        }
        if (
          s.includes('SELECT id::text AS id') &&
          s.includes("status = 'active'")
        ) {
          return { rows: [] };
        }
        if (s.includes('INSERT INTO public.att_leave_accrual_policy')) {
          return {
            rows: [
              basePolicy({
                advance_max_days: '5',
                advance_cap_percent: '30',
              }),
            ],
          };
        }
        if (
          s.includes('FROM public.att_leave_accrual_policy') &&
          s.includes('id = $1')
        ) {
          return {
            rows: [
              basePolicy({
                advance_max_days: '5',
                advance_cap_percent: '30',
                leave_type_name_vi: 'Phép năm',
              }),
            ],
          };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new AttLeaveAccrualPolicyService(db, leaveTypes);
    const row = await svc.createPolicy(
      {
        companyId: 'holding',
        leaveTypeKey: 'annual',
        accrualMode: 'year_start_grant',
        annualDays: 12,
        effectiveFrom: '2026-01-01',
        advanceMaxDays: 5,
        advanceCapPercent: 30,
      },
      groupCeoToken(),
      'xevn',
    );
    expect(row.advanceMaxDays).toBe(5);
    expect(row.advanceCapPercent).toBe(30);
    const insertCall = (db.query as jest.Mock).mock.calls.find((c) =>
      String(c[0]).includes('INSERT INTO public.att_leave_accrual_policy'),
    );
    expect(insertCall?.[1]).toEqual(expect.arrayContaining([5, 30]));
  });

  it('list default hides retired; include_inactive shows them (AC-01e)', async () => {
    const sqls: string[] = [];
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        sqls.push(String(sql));
        if (schemaPassthrough(sql)) return { rows: [] };
        return { rows: [basePolicy()] };
      }),
    } as unknown as HrmDbService;
    const svc = new AttLeaveAccrualPolicyService(db);
    await svc.listPolicies({ company_id: 'holding' }, groupCeoToken(), 'xevn');
    const listSql = sqls.find((q) => q.includes('ORDER BY p.leave_type_key'));
    expect(listSql).toContain("p.status = 'active'");
    expect(listSql).toContain('p.archived_at IS NULL');

    sqls.length = 0;
    await svc.listPolicies(
      { company_id: 'holding', include_inactive: 'true' },
      groupCeoToken(),
      'xevn',
    );
    const inactiveSql = sqls.find((q) =>
      q.includes('ORDER BY p.leave_type_key'),
    );
    expect(inactiveSql).toBeTruthy();
    expect(inactiveSql).not.toContain("p.status = 'active'");
  });

  it('soft-retire sets status=retired + archived_at; resolve hides (AC-01e)', async () => {
    const sqls: string[] = [];
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        sqls.push(String(sql));
        if (schemaPassthrough(sql)) return { rows: [] };
        const s = String(sql);
        if (s.includes('FROM public.att_leave_accrual_policy WHERE id = $1')) {
          return { rows: [basePolicy()] };
        }
        if (s.includes("status = 'retired'") && s.includes('UPDATE')) {
          return { rows: [] };
        }
        if (
          s.includes('FROM public.att_leave_accrual_policy p') &&
          s.includes('id = $1')
        ) {
          return {
            rows: [
              basePolicy({
                status: 'retired',
                archived_at: '2026-08-08T12:00:00Z',
              }),
            ],
          };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new AttLeaveAccrualPolicyService(db);
    const retired = await svc.retirePolicy(
      POL_ID,
      'holding',
      groupCeoToken(),
      'xevn',
    );
    expect(retired.status).toBe('retired');
    expect(retired.archivedAt).toBeTruthy();
    expect(
      sqls.every(
        (q) => !q.includes('DELETE FROM public.att_leave_accrual_policy'),
      ),
    ).toBe(true);

    // resolveEffective must filter active only
    sqls.length = 0;
    const db2 = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        sqls.push(String(sql));
        if (schemaPassthrough(sql)) return { rows: [] };
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc2 = new AttLeaveAccrualPolicyService(db2);
    const eff = await svc2.resolveEffective(
      { company_id: 'holding', leave_type_key: 'annual', as_of: '2026-06-01' },
      groupCeoToken(),
      'xevn',
    );
    expect(eff.total).toBe(0);
    expect(eff.data).toBeNull();
    const resolveSql = sqls.find((q) => q.includes('ORDER BY p.version DESC'));
    expect(resolveSql).toContain("p.status = 'active'");
    expect(resolveSql).toContain('p.archived_at IS NULL');
  });

  it('U19 scope_parity: get-by-id holding under group main rollup', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (schemaPassthrough(sql)) return { rows: [] };
        if (String(sql).includes('id = $1')) {
          return { rows: [basePolicy({ company_id: 'holding' })] };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new AttLeaveAccrualPolicyService(db);
    const row = await svc.getPolicyById(
      POL_ID,
      'main',
      groupCeoToken(),
      'xevn',
    );
    expect(row.companyId).toBe('holding');
    expect(row.leaveTypeNameVi).toBe('Phép năm');
  });

  it('U19 scope_parity: member OOS get-by-id rejects', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (schemaPassthrough(sql)) return { rows: [] };
        if (String(sql).includes('id = $1')) {
          return { rows: [basePolicy({ company_id: 'holding' })] };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new AttLeaveAccrualPolicyService(db);
    await expect(
      svc.getPolicyById(POL_ID, 'main', memberCeoToken(), 'xe-du-lich'),
    ).rejects.toBeInstanceOf(ApiException);
  });

  it('F-ATT-LVRULE-04 empty resolve 200-class (no seed)', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (schemaPassthrough(sql)) return { rows: [] };
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new AttLeaveAccrualPolicyService(db);
    const eff = await svc.resolveEffective(
      { company_id: 'holding', leave_type_key: 'annual' },
      groupCeoToken(),
    );
    expect(eff).toEqual({ total: 0, data: null });
  });

  it('consumer published policy_id membership passes when active>0', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (schemaPassthrough(sql)) return { rows: [] };
        const s = String(sql);
        if (s.includes('COUNT(*)')) {
          return { rows: [{ c: '1' }] };
        }
        if (s.includes('FROM public.att_leave_accrual_policy')) {
          return { rows: [basePolicy()] };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new AttLeaveAccrualPolicyService(db);
    const hit = await svc.assertLeaveAccrualPolicyForConsumer({
      companyId: 'holding',
      leaveTypeKey: 'annual',
      policyId: POL_ID,
      authorization: groupCeoToken(),
    });
    expect(hit?.id).toBe(POL_ID);
    expect(hit?.accrualMode).toBe('year_start_grant');
  });
});
