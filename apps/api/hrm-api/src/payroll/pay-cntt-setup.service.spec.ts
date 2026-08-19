/**
 * PO-HRM-PAY-CNTT-BE-01
 * Jest: ensureSchema · scope_parity list↔get · profile 422 hook helpers
 */
import { ApiException } from '../common/api.exception';
import { signServiceJwt } from '../common/jwt-sign';
import { HrmDbService } from '../db/hrm-db.service';
import {
  HRM_PAY_INP_PROFILE_422,
  HRM_PAY_POL_409_CODE,
} from './pay-cntt-setup.constants';
import {
  assertSourceKindAllowedByProfile,
  parseSetupContextFromSnapshot,
} from './pay-cntt-setup.helpers';
import { ensurePayCnttSetupSchema, PayCnttSetupService } from './pay-cntt-setup.service';

const POLICY_ID = '11111111-1111-4111-8111-111111111111';
const PROFILE_ID = '22222222-2222-4222-8222-222222222222';
const OTHER_POLICY_ID = '33333333-3333-4333-8333-333333333333';

type PolicyRow = {
  id: string;
  company_id: string;
  code: string;
  name_vi: string;
  status: string;
  scope: string;
  business_line_tag: string | null;
  effective_from: string;
  effective_to: string | null;
  policy_doc_refs_json: unknown;
  rate_params_json: unknown;
  archived_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
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

function basePolicy(overrides: Partial<PolicyRow> = {}): PolicyRow {
  return {
    id: POLICY_ID,
    company_id: 'holding',
    code: 'pol_dphh_2025',
    name_vi: 'Gói chính sách ĐPHH',
    status: 'active',
    scope: 'RIENG',
    business_line_tag: 'DPHH',
    effective_from: '2026-01-01',
    effective_to: null,
    policy_doc_refs_json: [],
    rate_params_json: { kpi_threshold_1500: 1500 },
    archived_at: null,
    created_by: 'ceo@xe.vn',
    updated_by: 'ceo@xe.vn',
    created_at: '2026-08-11T00:00:00Z',
    updated_at: '2026-08-11T00:00:00Z',
    ...overrides,
  };
}

function createMockDb() {
  const sqls: string[] = [];
  const policies = new Map<string, PolicyRow>();
  policies.set(POLICY_ID, basePolicy());
  policies.set(
    OTHER_POLICY_ID,
    basePolicy({ id: OTHER_POLICY_ID, company_id: 'xe-du-lich', code: 'pol_member' }),
  );

  const db = {
    query: jest.fn(async (sql: string, params?: unknown[]) => {
      sqls.push(sql);
      const s = sql.replace(/\s+/g, ' ').trim();

      if (s.includes('CREATE TABLE IF NOT EXISTS public.pay_policy_pack')) {
        return { rows: [] };
      }
      if (s.includes('CREATE TABLE IF NOT EXISTS public.pay_input_pack_profile')) {
        return { rows: [] };
      }
      if (s.includes('ALTER TABLE public.pay_sheet_templates')) {
        return { rows: [] };
      }
      if (s.includes('FROM public.pay_policy_pack') && s.includes('id = $1')) {
        const id = String(params?.[0]);
        const row = policies.get(id);
        if (!row) return { rows: [] };
        if (s.includes('ANY')) {
          const allowed = (params?.[1] as string[]) ?? [];
          if (!allowed.includes(row.company_id)) return { rows: [] };
        } else if (params?.[1] && row.company_id !== params[1]) {
          return { rows: [] };
        }
        return { rows: [row] };
      }
      if (s.includes('INSERT INTO public.pay_policy_pack')) {
        const code = String(params?.[2]);
        const dup = [...policies.values()].some(
          (p) => p.company_id === params?.[1] && p.code === code && !p.archived_at,
        );
        if (dup) throw new Error('uq_pay_policy_pack_company_code_active');
        const row = basePolicy({
          id: String(params?.[0]),
          company_id: String(params?.[1]),
          code,
          name_vi: String(params?.[3]),
        });
        policies.set(row.id, row);
        return { rows: [row] };
      }
      if (s.includes('FROM public.pay_policy_pack') && s.includes('ORDER BY')) {
        return { rows: [basePolicy()] };
      }
      return { rows: [] };
    }),
  } as unknown as HrmDbService;

  return { db, sqls, policies };
}

describe('pay-cntt-setup.helpers', () => {
  it('parseSetupContextFromSnapshot reads allowedSourceKinds', () => {
    const ctx = parseSetupContextFromSnapshot({
      template_id: 't1',
      setupContext: {
        allowedSourceKinds: ['manual', 'kpi'],
        inputPackProfileCode: 'INP_TDHK_KPI',
      },
    });
    expect(ctx?.allowedSourceKinds).toEqual(['manual', 'kpi']);
  });

  it('assertSourceKindAllowedByProfile throws HRM-PAY-INP-PROFILE-422', () => {
    expect(() =>
      assertSourceKindAllowedByProfile('revenue', {
        allowedSourceKinds: ['manual', 'kpi'],
      }),
    ).toThrow(ApiException);
    try {
      assertSourceKindAllowedByProfile('revenue', { allowedSourceKinds: ['manual', 'kpi'] });
    } catch (e) {
      expect((e as ApiException).code).toBe(HRM_PAY_INP_PROFILE_422);
    }
  });

  it('assertSourceKindAllowedByProfile passes when no profile snapshot', () => {
    expect(() => assertSourceKindAllowedByProfile('revenue', null)).not.toThrow();
  });
});

describe('PayCnttSetupService (PO-HRM-PAY-CNTT-BE-01)', () => {
  it('ensureSchema ADD pay_policy_pack + pay_input_pack_profile + template FK cols', async () => {
    const { db, sqls } = createMockDb();
    await ensurePayCnttSetupSchema(db);
    expect(sqls.some((q) => q.includes('CREATE TABLE IF NOT EXISTS public.pay_policy_pack'))).toBe(
      true,
    );
    expect(
      sqls.some((q) => q.includes('CREATE TABLE IF NOT EXISTS public.pay_input_pack_profile')),
    ).toBe(true);
    expect(sqls.some((q) => q.includes('policy_pack_id'))).toBe(true);
    expect(sqls.some((q) => /CHECK\s*\(\s*scope\s+IN\s*\(\s*'CHUNG'/i.test(q))).toBe(true);
    expect(sqls.some((q) => /CHECK\s*\(\s*code\s+IN/i.test(q))).toBe(false);
  });

  it('scope_parity: group CEO list holding policy; member CEO get-by-id → 404', async () => {
    const { db } = createMockDb();
    const svc = new PayCnttSetupService(db);
    const listed = await svc.listPolicyPacks({ company_id: 'main' }, groupCeoToken());
    expect(listed.items.length).toBeGreaterThan(0);

    await expect(
      svc.getPolicyPackById(POLICY_ID, 'main', memberCeoToken()),
    ).rejects.toMatchObject({ code: 'HRM-PAY-POL-404' });
  });

  it('createPolicyPack duplicate code → HRM-PAY-POL-409-CODE', async () => {
    const { db } = createMockDb();
    const svc = new PayCnttSetupService(db);
    await svc.createPolicyPack(
      {
        company_id: 'holding',
        code: 'pol_dup',
        nameVi: 'Dup',
        effectiveFrom: '2026-01-01',
      },
      groupCeoToken(),
    );
    await expect(
      svc.createPolicyPack(
        {
          company_id: 'holding',
          code: 'pol_dup',
          nameVi: 'Dup 2',
          effectiveFrom: '2026-01-01',
        },
        groupCeoToken(),
      ),
    ).rejects.toMatchObject({ code: HRM_PAY_POL_409_CODE });
  });
});
