/**
 * PO-HRM-MVP-GD1-REC-HC-OVERRIDE-CELLID-BE-01 — residual R-REC-HC-OVERRIDE-CELLID (P2).
 * BA-01 Option A LOCKED: PUT allow_override that OMITS cell_id must REUSE the existing cell_id
 * by natural key (BR-REC-HC-CELL-STABLE) so the YCTD headcount_cell_id link survives
 * (BR-BP-HC-04). Mint happens only on first create for a natural key (BR-REC-HC-CELL-MINT-ONCE).
 * A payload cell_id that differs from the existing identity for the same natural key is rejected
 * with 409 HRM-HC-CELL-ID-MISMATCH. must_keep: 409 HRM-HC-CELL-LOCKED + no grid wipe (BE-02),
 * spawn idempotency, O3 no silent YCTD overwrite.
 */
import { ApiException } from '../common/api.exception';
import { signServiceJwt } from '../common/jwt-sign';
import { HrmDbService } from '../db/hrm-db.service';
import { RecruitmentCatalogService } from './recruitment-catalog.service';
import {
  HRM_HC_CELL_ID_MISMATCH,
  HRM_HC_CELL_LOCKED,
} from './recruitment-plan-headcount';

const PLAN_ID = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';
const CELL_ID = '11111111-2222-4333-8444-555555555555';
const FOREIGN_CELL_ID = '99999999-8888-4777-8666-555555555000';
const DEPT_ID = 'dddddddd-eeee-4fff-8aaa-bbbbbbbbbbbb';
const POS_ID = 'cccccccc-dddd-4eee-8fff-aaaaaaaaaaaa';
const YCTD_ID = '77777777-6666-4555-8444-333333333333';

type DeptRow = {
  id: string;
  plan_id: string;
  company_id: string;
  name: string;
  department_key: string | null;
  sort_order: number;
};

type PosRow = {
  id: string;
  department_id: string;
  company_id: string;
  name: string;
  position_key: string | null;
  months_data: unknown;
  sort_order: number;
};

type ReqRow = {
  id: string;
  company_id: string;
  headcount: number;
  headcount_cell_id: string;
  headcount_mode: string;
};

function groupCeoToken() {
  return `Bearer ${signServiceJwt({
    sub: 'ceo@xe.vn',
    tenantId: 'xevn',
    companyId: 'main',
    roleCode: 'group_ceo',
  })}`;
}

function schemaOk(sql: string): boolean {
  return (
    sql.includes('CREATE TABLE') ||
    sql.includes('CREATE INDEX') ||
    sql.includes('CREATE UNIQUE') ||
    sql.includes('ALTER TABLE') ||
    sql.includes('DO $$')
  );
}

function storedCell(lifecycle: 'open' | 'need_hire_approved') {
  return {
    cell_id: CELL_ID,
    month: 3,
    cell_status: 'need_hire',
    lifecycle_status: lifecycle,
    headcount_need_hire: 2,
    headcount_current: 1,
    headcount_projected: null,
  };
}

/** In-memory grid + YCTD store so cell_id reuse and link continuity are observable. */
function makeStore(
  planStatus: string,
  cellLifecycle: 'open' | 'need_hire_approved' = 'need_hire_approved',
  opts?: { seedYctdHeadcount?: number },
) {
  const state = {
    plan: {
      id: PLAN_ID,
      company_id: 'holding',
      title: 'ĐB 2026',
      year: 2026,
      status: planStatus,
      activation_mode: 'on_approve',
    },
    depts: [
      {
        id: DEPT_ID,
        plan_id: PLAN_ID,
        company_id: 'holding',
        name: 'HCNS',
        department_key: 'hr',
        sort_order: 0,
      },
    ] as DeptRow[],
    positions: [
      {
        id: POS_ID,
        department_id: DEPT_ID,
        company_id: 'holding',
        name: 'NV',
        position_key: 'staff',
        months_data: [storedCell(cellLifecycle)],
        sort_order: 0,
      },
    ] as PosRow[],
    sqls: [] as string[],
    requisitions: [] as ReqRow[],
  };

  if (opts?.seedYctdHeadcount !== undefined) {
    state.requisitions.push({
      id: YCTD_ID,
      company_id: 'holding',
      headcount: opts.seedYctdHeadcount,
      headcount_cell_id: CELL_ID,
      headcount_mode: 'in_plan',
    });
  }

  const matchesId = (param: unknown, id: string): boolean =>
    Array.isArray(param) ? param.includes(id) : param === id;

  const query = jest.fn(async (sqlRaw: string, params: unknown[] = []) => {
    const sql = String(sqlRaw);
    state.sqls.push(sql);
    if (schemaOk(sql)) return { rows: [] };

    if (sql.includes('DELETE FROM public.recruitment_plan_departments')) {
      const removed = state.depts
        .filter((d) => d.plan_id === params[0])
        .map((d) => d.id);
      state.depts = state.depts.filter((d) => d.plan_id !== params[0]);
      state.positions = state.positions.filter(
        (p) => !removed.includes(p.department_id),
      );
      return { rows: [] };
    }
    if (sql.includes('INSERT INTO public.recruitment_plan_departments')) {
      state.depts.push({
        id: String(params[0]),
        plan_id: String(params[1]),
        company_id: String(params[2]),
        name: String(params[3]),
        department_key: (params[4] as string | null) ?? null,
        sort_order: Number(params[5]),
      });
      return { rows: [] };
    }
    if (sql.includes('INSERT INTO public.recruitment_plan_positions')) {
      state.positions.push({
        id: String(params[0]),
        department_id: String(params[1]),
        company_id: String(params[2]),
        name: String(params[3]),
        position_key: (params[4] as string | null) ?? null,
        months_data: JSON.parse(String(params[5])),
        sort_order: Number(params[6]),
      });
      return { rows: [] };
    }
    if (sql.includes('INSERT INTO public.recruitment_plans')) {
      state.plan = {
        ...state.plan,
        id: String(params[0]),
        company_id: String(params[1]),
      };
      return { rows: [] };
    }
    if (sql.includes('INSERT INTO public.job_requisitions')) {
      state.requisitions.push({
        id: String(params[0]),
        company_id: String(params[1]),
        headcount: Number(params[4]),
        headcount_cell_id: String(params[5]),
        headcount_mode: 'in_plan',
      });
      return { rows: [] };
    }
    if (sql.includes('UPDATE public.recruitment_plans')) return { rows: [] };
    if (sql.includes('FROM public.recruitment_plans WHERE id = $1')) {
      return { rows: [state.plan] };
    }
    if (sql.includes('FROM public.recruitment_plan_departments')) {
      return {
        rows: state.depts.filter((d) => matchesId(params[0], d.plan_id)),
      };
    }
    if (sql.includes('FROM public.recruitment_plan_positions')) {
      return {
        rows: state.positions.filter((p) =>
          matchesId(params[0], p.department_id),
        ),
      };
    }
    if (sql.includes('FROM public.job_requisitions')) {
      const cellId = String(params[1] ?? '');
      const rows = state.requisitions
        .filter(
          (r) =>
            r.company_id === String(params[0]) &&
            r.headcount_mode === 'in_plan' &&
            r.headcount_cell_id === cellId,
        )
        .map((r) => ({ id: r.id, headcount: r.headcount }));
      return { rows };
    }
    return { rows: [] };
  });

  const db = {
    query,
    withTransaction: jest.fn(
      async (fn: (q: typeof query) => Promise<unknown>) => fn(query),
    ),
  };

  const bridge = { ensureSchema: jest.fn().mockResolvedValue(undefined) };
  const svc = new RecruitmentCatalogService(
    db as unknown as HrmDbService,
    bridge as never,
  );
  return { state, db, svc };
}

type PositionInput = {
  name: string;
  position_key: string;
  month: number;
  needHire: number;
  cell_id?: string;
};

function putPayload(
  positions: PositionInput[],
  extra?: Record<string, unknown>,
) {
  return {
    company_id: 'main',
    departments: [
      {
        name: 'HCNS',
        department_key: 'hr',
        positions: positions.map((p) => ({
          name: p.name,
          position_key: p.position_key,
          months: [
            {
              ...(p.cell_id !== undefined ? { cell_id: p.cell_id } : {}),
              month: p.month,
              cell_status: 'need_hire',
              headcount_need_hire: p.needHire,
              headcount_current: 1,
            },
          ],
        })),
      },
    ],
    ...extra,
  };
}

function expectApiCode(error: unknown, code: string) {
  expect(error).toBeInstanceOf(ApiException);
  expect((error as ApiException).getResponse()).toEqual(
    expect.objectContaining({ code }),
  );
}

async function readCell(svc: RecruitmentCatalogService, auth: string) {
  const detail = (await svc.getRecruitmentPlanById(PLAN_ID, 'main', auth)) as {
    departments: Array<{
      positions: Array<{
        position_key: string | null;
        months: Array<{
          cell_id: string;
          need_hire: number;
          lifecycle_status: string;
        }>;
      }>;
    }>;
  };
  return detail;
}

describe('REC-HC override cell_id — stable identity reuse (R-REC-HC-OVERRIDE-CELLID)', () => {
  it('AC-REC-HC-CELL-01/01c — approved + override OMIT cell_id → reuse same cell_id; YCTD link intact; O3 no overwrite', async () => {
    const { state, db, svc } = makeStore('approved', 'need_hire_approved', {
      seedYctdHeadcount: 2,
    });
    const auth = groupCeoToken();

    await svc.upsertRecruitmentPlan(
      PLAN_ID,
      putPayload(
        [{ name: 'NV', position_key: 'staff', month: 3, needHire: 7 }],
        {
          allow_override: true,
        },
      ),
      auth,
    );

    expect(db.withTransaction).toHaveBeenCalledTimes(1);
    // Persisted cell reuses the original identity — NOT a fresh mint.
    const cells = state.positions[0].months_data as Array<{
      cell_id: string;
      headcount_need_hire: number;
    }>;
    expect(cells[0].cell_id).toBe(CELL_ID);
    expect(cells[0].headcount_need_hire).toBe(7);

    // GET after 2xx shows same cell_id.
    const detail = await readCell(svc, auth);
    expect(detail.departments[0].positions[0].months[0].cell_id).toBe(CELL_ID);

    // Re-spawn finds the pre-existing YCTD by the SAME cell_id → skipped_duplicate, no orphan row.
    const spawn = await svc.spawnRecruitmentPlanRequests(PLAN_ID, 'main', auth);
    expect(spawn.created).toHaveLength(0);
    expect(spawn.skipped_duplicate).toHaveLength(1);
    expect(spawn.skipped_duplicate[0].headcount_cell_id).toBe(CELL_ID);
    // O3 drift warn (2 → 7) but YCTD headcount is NOT silently overwritten.
    expect(spawn.drift_warnings?.[0]?.headcount_cell_id).toBe(CELL_ID);
    const yctd = state.requisitions.find((r) => r.id === YCTD_ID);
    expect(yctd?.headcount).toBe(2);
    // Exactly one YCTD for this cell — BR-BP-HC-04 intact.
    expect(
      state.requisitions.filter((r) => r.headcount_cell_id === CELL_ID),
    ).toHaveLength(1);
  });

  it('AC-REC-HC-CELL-ALT-02 — draft/unlocked + OMIT cell_id + NK hit → reuse without override', async () => {
    const { state, svc } = makeStore('draft', 'open');
    const auth = groupCeoToken();

    await svc.upsertRecruitmentPlan(
      PLAN_ID,
      putPayload([
        { name: 'NV', position_key: 'staff', month: 3, needHire: 5 },
      ]),
      auth,
    );

    const cells = state.positions[0].months_data as Array<{
      cell_id: string;
      headcount_need_hire: number;
    }>;
    expect(cells[0].cell_id).toBe(CELL_ID);
    expect(cells[0].headcount_need_hire).toBe(5);
  });

  it('AC-REC-HC-CELL-01b — explicit echo cell_id === existing → 2xx reuse', async () => {
    const { state, svc } = makeStore('approved', 'need_hire_approved');
    const auth = groupCeoToken();

    await svc.upsertRecruitmentPlan(
      PLAN_ID,
      putPayload(
        [
          {
            name: 'NV',
            position_key: 'staff',
            month: 3,
            needHire: 6,
            cell_id: CELL_ID,
          },
        ],
        {
          allow_override: true,
        },
      ),
      auth,
    );

    const cells = state.positions[0].months_data as Array<{
      cell_id: string;
      headcount_need_hire: number;
    }>;
    expect(cells[0].cell_id).toBe(CELL_ID);
    expect(cells[0].headcount_need_hire).toBe(6);
  });

  it('AC-REC-HC-CELL-EX-02 — override + FOREIGN cell_id on same NK → 409 CELL-ID-MISMATCH, grid intact', async () => {
    const { state, db, svc } = makeStore('approved', 'need_hire_approved');
    const auth = groupCeoToken();

    let thrown: unknown;
    try {
      await svc.upsertRecruitmentPlan(
        PLAN_ID,
        putPayload(
          [
            {
              name: 'NV',
              position_key: 'staff',
              month: 3,
              needHire: 7,
              cell_id: FOREIGN_CELL_ID,
            },
          ],
          { allow_override: true },
        ),
        auth,
      );
    } catch (error) {
      thrown = error;
    }
    expectApiCode(thrown, HRM_HC_CELL_ID_MISMATCH);

    // Rejected BEFORE the destructive replace transaction.
    expect(db.withTransaction).not.toHaveBeenCalled();
    expect(
      state.sqls.some((s) =>
        s.includes('DELETE FROM public.recruitment_plan_departments'),
      ),
    ).toBe(false);
    const cells = state.positions[0].months_data as Array<{ cell_id: string }>;
    expect(cells[0].cell_id).toBe(CELL_ID);
  });

  it('AC-REC-HC-CELL-EX-01 — locked + OMIT cell_id + NO override → 409 CELL-LOCKED, grid + identity intact (must_keep)', async () => {
    const { state, db, svc } = makeStore('approved', 'need_hire_approved');
    const auth = groupCeoToken();

    let thrown: unknown;
    try {
      await svc.upsertRecruitmentPlan(
        PLAN_ID,
        putPayload([
          { name: 'NV', position_key: 'staff', month: 3, needHire: 9 },
        ]),
        auth,
      );
    } catch (error) {
      thrown = error;
    }
    expectApiCode(thrown, HRM_HC_CELL_LOCKED);

    expect(db.withTransaction).not.toHaveBeenCalled();
    expect(state.depts).toHaveLength(1);
    expect(state.positions).toHaveLength(1);
    const cells = state.positions[0].months_data as Array<{
      cell_id: string;
      headcount_need_hire: number;
    }>;
    expect(cells[0].cell_id).toBe(CELL_ID);
    expect(cells[0].headcount_need_hire).toBe(2);
  });

  it('AC-REC-HC-CELL-ALT-03 — new natural key mints a fresh cell_id while existing NK reuses', async () => {
    const { state, svc } = makeStore('draft', 'open');
    const auth = groupCeoToken();

    await svc.upsertRecruitmentPlan(
      PLAN_ID,
      putPayload([
        { name: 'NV', position_key: 'staff', month: 3, needHire: 4 },
        { name: 'NV cấp cao', position_key: 'staff2', month: 3, needHire: 2 },
      ]),
      auth,
    );

    const detail = await readCell(svc, auth);
    const staff = detail.departments[0].positions.find(
      (p) => p.position_key === 'staff',
    );
    const staff2 = detail.departments[0].positions.find(
      (p) => p.position_key === 'staff2',
    );
    // Existing NK keeps its identity.
    expect(staff?.months[0].cell_id).toBe(CELL_ID);
    // Brand-new NK mints a valid, distinct surrogate (MINT-ONCE).
    const mintedId = staff2?.months[0].cell_id ?? '';
    expect(mintedId).not.toBe('');
    expect(mintedId).not.toBe(CELL_ID);
    expect(mintedId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });
});
