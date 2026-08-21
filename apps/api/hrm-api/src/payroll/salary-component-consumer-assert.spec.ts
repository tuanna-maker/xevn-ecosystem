/**
 * PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-CNS-BE-01
 * VAL-PAY-CNS-01..05 + VAL-PAY-CNS-03 scope_parity — consumer invent when Nest SC active >0
 */
import { ApiException } from '../common/api.exception';
import { signServiceJwt } from '../common/jwt-sign';
import { HrmDbQueryFn } from '../db/hrm-db.service';
import { HRM_SC_COMP_KEY } from './payroll-catalog.constants';
import {
  assertComponentCodeInEffectiveCatalog,
  assertComponentIdInEffectiveCatalog,
  countEffectiveActiveSalaryComponents,
} from './salary-component-consumer-assert';

const COMP_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const COMP_RETIRED_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const COMP_HOLDING_ID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';

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

type ScRow = {
  id: string;
  company_id: string;
  code: string;
  is_active: boolean;
  archived_at: string | null;
};

function makeQuery(rows: ScRow[]): HrmDbQueryFn {
  return (async (sql: string, params?: unknown[]) => {
    const s = String(sql);
    if (s.includes('COUNT(*)')) {
      const ids = (params?.[0] as string[]) ?? [];
      const n = rows.filter(
        (r) => ids.includes(r.company_id) && r.is_active && !r.archived_at,
      ).length;
      return { rows: [{ c: String(n) }] };
    }
    if (s.includes('id = $1::uuid')) {
      const id = String(params?.[0]);
      const ids = (params?.[1] as string[]) ?? [];
      const hit = rows.find(
        (r) =>
          r.id === id &&
          ids.includes(r.company_id) &&
          r.is_active &&
          !r.archived_at,
      );
      return {
        rows: hit
          ? [
              {
                id: hit.id,
                code: hit.code,
                company_id: hit.company_id,
                is_active: hit.is_active,
              },
            ]
          : [],
      };
    }
    if (s.includes('lower(code) = lower($2::text)')) {
      const ids = (params?.[0] as string[]) ?? [];
      const code = String(params?.[1] ?? '');
      const hit = rows.find(
        (r) =>
          ids.includes(r.company_id) &&
          r.code.toLowerCase() === code.toLowerCase() &&
          r.is_active &&
          !r.archived_at,
      );
      return {
        rows: hit
          ? [
              {
                id: hit.id,
                code: hit.code,
                company_id: hit.company_id,
                is_active: hit.is_active,
              },
            ]
          : [],
      };
    }
    return { rows: [] };
  }) as HrmDbQueryFn;
}

describe('PAY catalog consumer assert (PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-CNS-BE-01)', () => {
  const activeHolding: ScRow = {
    id: COMP_HOLDING_ID,
    company_id: 'holding',
    code: 'LUONG_CO_BAN',
    is_active: true,
    archived_at: null,
  };
  const activeMain: ScRow = {
    id: COMP_ID,
    company_id: 'main',
    code: 'BASIC',
    is_active: true,
    archived_at: null,
  };
  const retired: ScRow = {
    id: COMP_RETIRED_ID,
    company_id: 'holding',
    code: 'RETIRED_TP',
    is_active: false,
    archived_at: '2026-08-07T00:00:00Z',
  };

  it('VAL-PAY-CNS-01 template invent OOS id → HRM-SC-COMP-KEY when Nest active >0', async () => {
    const query = makeQuery([activeHolding]);
    await expect(
      assertComponentIdInEffectiveCatalog({
        query,
        companyId: 'main',
        componentId: '00000000-0000-4000-8000-000000000099',
        authorization: groupCeoToken(),
      }),
    ).rejects.toMatchObject({ code: HRM_SC_COMP_KEY });
  });

  it('VAL-PAY-CNS-02 compensation invent unknown code → HRM-SC-COMP-KEY', async () => {
    const query = makeQuery([activeHolding]);
    await expect(
      assertComponentCodeInEffectiveCatalog({
        query,
        companyId: 'holding',
        componentCode: 'UNKNOWN_PC',
        authorization: groupCeoToken(),
      }),
    ).rejects.toMatchObject({ code: HRM_SC_COMP_KEY });
  });

  it('VAL-PAY-CNS-03 scope_parity — list↔assert same companyIds; group CEO main sees holding', async () => {
    const queryParams: unknown[][] = [];
    const base = makeQuery([activeHolding]);
    const query: HrmDbQueryFn = async (sql: string, params?: unknown[]) => {
      queryParams.push([...(params ?? [])]);
      return base(sql, params);
    };

    const hit = await assertComponentCodeInEffectiveCatalog({
      query,
      companyId: 'main',
      componentCode: 'LUONG_CO_BAN',
      authorization: groupCeoToken(),
    });
    expect(hit?.code).toBe('LUONG_CO_BAN');
    expect(hit?.companyId).toBe('holding');

    // COUNT + membership SELECT must share identical company_id ANY($1) scope (U19).
    expect(queryParams.length).toBeGreaterThanOrEqual(2);
    const countScope = queryParams[0][0] as string[];
    const memberScope = queryParams[1][0] as string[];
    expect(countScope).toEqual(expect.arrayContaining(['holding', 'main']));
    expect(memberScope).toEqual(countScope);

    // Member CEO scope without Nest rows → soft allow (empty catalog) — not a scope drift.
    // When member has Nest>0 locally, holding-only code must still KEY (OOS invent class).
    const memberLocal: ScRow = {
      id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
      company_id: 'main',
      code: 'MEMBER_ONLY',
      is_active: true,
      archived_at: null,
    };
    const memberQuery = makeQuery([activeHolding, memberLocal]);
    await expect(
      assertComponentCodeInEffectiveCatalog({
        query: memberQuery,
        companyId: 'main',
        componentCode: 'LUONG_CO_BAN',
        authorization: memberCeoToken(),
      }),
    ).rejects.toMatchObject({ code: HRM_SC_COMP_KEY });
  });

  it('VAL-PAY-CNS-04 period/pack invent code when Nest >0 → HRM-SC-COMP-KEY', async () => {
    const query = makeQuery([activeMain]);
    await expect(
      assertComponentCodeInEffectiveCatalog({
        query,
        companyId: 'main',
        componentCode: 'INVENT_PACK_X',
        authorization: groupCeoToken(),
      }),
    ).rejects.toMatchObject({ code: HRM_SC_COMP_KEY });
  });

  it('VAL-PAY-CNS-05 retired code rejected on new consumer write', async () => {
    const query = makeQuery([activeHolding, retired]);
    const count = await countEffectiveActiveSalaryComponents(
      query,
      'holding',
      groupCeoToken(),
    );
    expect(count).toBe(1);
    await expect(
      assertComponentCodeInEffectiveCatalog({
        query,
        companyId: 'holding',
        componentCode: 'RETIRED_TP',
        authorization: groupCeoToken(),
      }),
    ).rejects.toMatchObject({ code: HRM_SC_COMP_KEY });
  });

  it('AC-PLT-PAY-01b empty Nest soft-allows invent code (no seed)', async () => {
    const query = makeQuery([]);
    const hit = await assertComponentCodeInEffectiveCatalog({
      query,
      companyId: 'holding',
      componentCode: 'ANY_INVENT',
      authorization: groupCeoToken(),
    });
    expect(hit).toBeNull();
  });

  it('known active code passes membership', async () => {
    const query = makeQuery([activeHolding]);
    const hit = await assertComponentCodeInEffectiveCatalog({
      query,
      companyId: 'holding',
      componentCode: 'luong_co_ban',
      authorization: groupCeoToken(),
    });
    expect(hit).toMatchObject({ code: 'LUONG_CO_BAN', id: COMP_HOLDING_ID });
  });

  it('documents HRM-COMP-004 as 1:1 peer alias of HRM-SC-COMP-KEY', () => {
    // Taxonomy lock — consumers emit HRM-SC-COMP-KEY; legacy HRM-COMP-004 = same class.
    expect(HRM_SC_COMP_KEY).toBe('HRM-SC-COMP-KEY');
    expect(new ApiException(HRM_SC_COMP_KEY, 'x', 422).code).toBe(
      'HRM-SC-COMP-KEY',
    );
  });
});
