/**
 * PO-HRM-MVP-GD1-REC-01-CLUSTER-BE-02 — regression R-REC-HC-PUT-LOCKED-WIPE (P0).
 * AC-REC-HC-01-EX-04 / BR-REC-01-LOCK: PUT on an approved plan without allow_override must
 * return 409 HRM-HC-CELL-LOCKED and leave the grid (departments/positions/cells) fully intact,
 * so spawn-eligible cells survive. allow_override keeps writing (BA O3).
 */
import { ApiException } from '../common/api.exception';
import { signServiceJwt } from '../common/jwt-sign';
import { HrmDbService } from '../db/hrm-db.service';
import { RecruitmentCatalogService } from './recruitment-catalog.service';
import {
  HRM_HC_CELL_LOCKED,
  HRM_HC_VAL_400,
} from './recruitment-plan-headcount';

const PLAN_ID = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';
const CELL_ID = '11111111-2222-4333-8444-555555555555';
const DEPT_ID = 'dddddddd-eeee-4fff-8aaa-bbbbbbbbbbbb';
const POS_ID = 'cccccccc-dddd-4eee-8fff-aaaaaaaaaaaa';

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

/** In-memory grid so a stray DELETE is observable, not just counted in SQL text. */
function makeStore(
  planStatus: string,
  cellLifecycle: 'open' | 'need_hire_approved' = 'need_hire_approved',
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
    requisitions: [] as Array<Record<string, unknown>>,
  };

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
      state.requisitions.push({ id: String(params[0]) });
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
    if (sql.includes('FROM public.job_requisitions')) return { rows: [] };
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

function bumpNeedHirePayload(
  needHire: number,
  extra?: Record<string, unknown>,
) {
  return {
    company_id: 'main',
    departments: [
      {
        name: 'HCNS',
        department_key: 'hr',
        positions: [
          {
            name: 'NV',
            position_key: 'staff',
            months: [
              {
                month: 3,
                cell_status: 'need_hire',
                headcount_need_hire: needHire,
                headcount_current: 1,
              },
            ],
          },
        ],
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

describe('REC-01 cluster BE-02 — locked PUT must not wipe grid (R-REC-HC-PUT-LOCKED-WIPE)', () => {
  it('approved plan + PUT without allow_override → 409 CELL-LOCKED and grid untouched', async () => {
    const { state, db, svc } = makeStore('approved');
    const auth = groupCeoToken();

    let thrown: unknown;
    try {
      await svc.upsertRecruitmentPlan(PLAN_ID, bumpNeedHirePayload(7), auth);
    } catch (error) {
      thrown = error;
    }
    expectApiCode(thrown, HRM_HC_CELL_LOCKED);

    // No destructive statement reached the DB, and no transaction was opened.
    expect(
      state.sqls.some((s) =>
        s.includes('DELETE FROM public.recruitment_plan_departments'),
      ),
    ).toBe(false);
    expect(
      state.sqls.some((s) => s.includes('UPDATE public.recruitment_plans')),
    ).toBe(false);
    expect(db.withTransaction).not.toHaveBeenCalled();

    // Grid still present in store.
    expect(state.depts).toHaveLength(1);
    expect(state.positions).toHaveLength(1);

    // getById still returns the same positions + need_hire_approved cell.
    const detail = (await svc.getRecruitmentPlanById(
      PLAN_ID,
      'main',
      auth,
    )) as {
      departments: Array<{
        positions: Array<{
          months: Array<{
            cell_id: string;
            need_hire: number;
            lifecycle_status: string;
          }>;
        }>;
      }>;
    };
    expect(detail.departments).toHaveLength(1);
    expect(detail.departments[0].positions).toHaveLength(1);
    const cell = detail.departments[0].positions[0].months[0];
    expect(cell.cell_id).toBe(CELL_ID);
    expect(cell.need_hire).toBe(2);
    expect(cell.lifecycle_status).toBe('need_hire_approved');

    // Spawn still eligible after the rejected PUT.
    const spawn = await svc.spawnRecruitmentPlanRequests(PLAN_ID, 'main', auth);
    expect(spawn.created).toHaveLength(1);
    expect(spawn.created[0].headcount_cell_id).toBe(CELL_ID);
    expect(spawn.created[0].headcount).toBe(2);
  });

  it('allow_override still replaces the approved cell (BA O3)', async () => {
    const { state, db, svc } = makeStore('approved');
    const auth = groupCeoToken();

    await svc.upsertRecruitmentPlan(
      PLAN_ID,
      bumpNeedHirePayload(7, { allow_override: true }),
      auth,
    );

    expect(db.withTransaction).toHaveBeenCalledTimes(1);
    expect(state.depts).toHaveLength(1);
    expect(state.positions).toHaveLength(1);
    const cells = state.positions[0].months_data as Array<{
      headcount_need_hire: number;
    }>;
    expect(cells[0].headcount_need_hire).toBe(7);
  });

  it('non-locked PUT (draft plan) replaces grid inside one transaction', async () => {
    const { state, db, svc } = makeStore('draft', 'open');
    const auth = groupCeoToken();

    await svc.upsertRecruitmentPlan(PLAN_ID, bumpNeedHirePayload(4), auth);

    expect(db.withTransaction).toHaveBeenCalledTimes(1);
    expect(
      state.sqls.some((s) =>
        s.includes('DELETE FROM public.recruitment_plan_departments'),
      ),
    ).toBe(true);
    expect(state.positions).toHaveLength(1);
    const cells = state.positions[0].months_data as Array<{
      headcount_need_hire: number;
    }>;
    expect(cells[0].headcount_need_hire).toBe(4);
  });

  it('validation reject (require_twelve) also leaves grid intact', async () => {
    const { state, db, svc } = makeStore('draft', 'open');
    const auth = groupCeoToken();

    let thrown: unknown;
    try {
      await svc.upsertRecruitmentPlan(
        PLAN_ID,
        bumpNeedHirePayload(4, { require_twelve: true }),
        auth,
      );
    } catch (error) {
      thrown = error;
    }
    expectApiCode(thrown, HRM_HC_VAL_400);
    expect(db.withTransaction).not.toHaveBeenCalled();
    expect(state.positions).toHaveLength(1);
    const cells = state.positions[0].months_data as Array<{
      headcount_need_hire: number;
    }>;
    expect(cells[0].headcount_need_hire).toBe(2);
  });

  it('create rejects invalid grid before inserting the plan header', async () => {
    const { state, svc } = makeStore('draft');
    const auth = groupCeoToken();

    let thrown: unknown;
    try {
      await svc.createRecruitmentPlan(
        {
          company_id: 'main',
          title: 'ĐB lỗi',
          departments: [
            {
              name: 'HCNS',
              department_key: 'hr',
              positions: [
                {
                  name: 'NV',
                  position_key: 'staff',
                  months: [
                    {
                      month: 1,
                      cell_status: 'need_hire',
                      headcount_need_hire: 0,
                    },
                  ],
                },
              ],
            },
          ],
        },
        auth,
      );
    } catch (error) {
      thrown = error;
    }
    expectApiCode(thrown, HRM_HC_VAL_400);
    expect(
      state.sqls.some((s) =>
        s.includes('INSERT INTO public.recruitment_plans'),
      ),
    ).toBe(false);
  });
});
