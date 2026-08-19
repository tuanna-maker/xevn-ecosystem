/**
 * PO-HRM-MVP-GD1-REC-01-CLUSTER-BE-01 — scope_parity list=get=spawn + HC-S1..S4.
 * U19: group CEO company_id=main finds holding plan; spawn same scope.
 */
import { ApiException } from '../common/api.exception';
import { signServiceJwt } from '../common/jwt-sign';
import { HrmDbService } from '../db/hrm-db.service';
import { RecruitmentCatalogService } from './recruitment-catalog.service';
import { HRM_HC_SPAWN_PLAN_NOT_APPROVED } from './recruitment-plan-headcount';

const PLAN_ID = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';
const CELL_ID = '11111111-2222-4333-8444-555555555555';
const DEPT_ID = 'dddddddd-eeee-4fff-8aaa-bbbbbbbbbbbb';
const POS_ID = 'cccccccc-dddd-4eee-8fff-aaaaaaaaaaaa';

function groupCeoToken() {
  return `Bearer ${signServiceJwt({
    sub: 'ceo@xe.vn',
    tenantId: 'xevn',
    companyId: 'main',
    roleCode: 'group_ceo',
  })}`;
}

function memberToken() {
  return `Bearer ${signServiceJwt({
    sub: 'du-lich.ceo@xe.vn',
    tenantId: 'xe-du-lich',
    companyId: 'main',
    roleCode: 'subsidiary_ceo',
  })}`;
}

function schemaOk(sql: string): boolean {
  const s = String(sql);
  return (
    s.includes('CREATE TABLE') ||
    s.includes('CREATE INDEX') ||
    s.includes('CREATE UNIQUE') ||
    s.includes('ALTER TABLE') ||
    s.includes('DO $$')
  );
}

describe('REC-01 cluster BE scope_parity + spawn (PO-HRM-MVP-GD1-REC-01-CLUSTER-BE-01)', () => {
  it('list id under holding → getById 200 with group CEO main (U19)', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string, params?: unknown[]) => {
        const s = String(sql);
        if (schemaOk(s)) return { rows: [] };
        if (s.includes('FROM public.recruitment_plans WHERE') && s.includes('ORDER BY')) {
          expect(s).toMatch(/company_id/);
          return {
            rows: [
              {
                id: PLAN_ID,
                company_id: 'holding',
                title: 'ĐB 2026',
                year: 2026,
                status: 'pending',
              },
            ],
          };
        }
        if (s.includes('FROM public.recruitment_plans WHERE id = $1')) {
          expect(params?.[0]).toBe(PLAN_ID);
          return {
            rows: [
              {
                id: PLAN_ID,
                company_id: 'holding',
                title: 'ĐB 2026',
                year: 2026,
                status: 'pending',
              },
            ],
          };
        }
        if (s.includes('FROM public.recruitment_plan_departments')) {
          return { rows: [{ id: DEPT_ID, plan_id: PLAN_ID, company_id: 'holding', name: 'HCNS', department_key: 'hr', sort_order: 0 }] };
        }
        if (s.includes('FROM public.recruitment_plan_positions')) {
          return {
            rows: [
              {
                id: POS_ID,
                department_id: DEPT_ID,
                company_id: 'holding',
                name: 'NV',
                position_key: 'staff',
                months_data: [
                  {
                    cell_id: CELL_ID,
                    month: 1,
                    cell_status: 'need_hire',
                    lifecycle_status: 'open',
                    headcount_need_hire: 2,
                    headcount_current: 5,
                    headcount_projected: null,
                  },
                ],
                sort_order: 0,
              },
            ],
          };
        }
        return { rows: [] };
      }),
    };
    const bridge = { ensureSchema: jest.fn().mockResolvedValue(undefined) };
    const svc = new RecruitmentCatalogService(db as unknown as HrmDbService, bridge as never);
    const auth = groupCeoToken();
    const list = await svc.listRecruitmentPlans('main', auth);
    expect(list.total).toBe(1);
    expect(list.data[0].id).toBe(PLAN_ID);
    const months = (list.data[0] as { departments: Array<{ positions: Array<{ months: Array<{ need_hire: number }> }> }> })
      .departments[0].positions[0].months;
    expect(months[0].need_hire).toBe(2);

    const detail = await svc.getRecruitmentPlanById(PLAN_ID, 'main', auth);
    expect(detail.id).toBe(PLAN_ID);
    expect((detail as { company_id: string }).company_id).toBe('holding');
  });

  it('member scope cannot get holding plan (409/404 scope)', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        const s = String(sql);
        if (schemaOk(s)) return { rows: [] };
        if (s.includes('FROM public.recruitment_plans WHERE id = $1')) {
          return {
            rows: [{ id: PLAN_ID, company_id: 'holding', title: 'ĐB', year: 2026, status: 'pending' }],
          };
        }
        return { rows: [] };
      }),
    };
    const bridge = { ensureSchema: jest.fn().mockResolvedValue(undefined) };
    const svc = new RecruitmentCatalogService(db as unknown as HrmDbService, bridge as never);
    await expect(svc.getRecruitmentPlanById(PLAN_ID, 'main', memberToken())).rejects.toBeInstanceOf(
      ApiException,
    );
  });

  it('HC-S1: spawn on non-approved plan → HRM-HC-SPAWN-PLAN-NOT-APPROVED', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        const s = String(sql);
        if (schemaOk(s)) return { rows: [] };
        if (s.includes('FROM public.recruitment_plans WHERE id = $1')) {
          return {
            rows: [
              {
                id: PLAN_ID,
                company_id: 'holding',
                title: 'ĐB',
                year: 2026,
                status: 'pending_approval',
                activation_mode: null,
              },
            ],
          };
        }
        return { rows: [] };
      }),
    };
    const bridge = { ensureSchema: jest.fn().mockResolvedValue(undefined) };
    const svc = new RecruitmentCatalogService(db as unknown as HrmDbService, bridge as never);
    try {
      await svc.spawnRecruitmentPlanRequests(PLAN_ID, 'main', groupCeoToken());
      fail('expected throw');
    } catch (e) {
      expect(e).toBeInstanceOf(ApiException);
      expect((e as ApiException).getResponse()).toEqual(
        expect.objectContaining({ code: HRM_HC_SPAWN_PLAN_NOT_APPROVED }),
      );
    }
  });

  it('HC-S3/S4: approved plan spawns YCTD then skip duplicate', async () => {
    let inserted = false;
    const db = {
      query: jest.fn().mockImplementation(async (sql: string, params?: unknown[]) => {
        const s = String(sql);
        if (schemaOk(s)) return { rows: [] };
        if (s.includes('FROM public.recruitment_plans WHERE id = $1')) {
          return {
            rows: [
              {
                id: PLAN_ID,
                company_id: 'holding',
                title: 'ĐB 2026',
                year: 2026,
                status: 'approved',
                activation_mode: 'on_approve',
              },
            ],
          };
        }
        if (s.includes('FROM public.recruitment_plan_departments')) {
          return {
            rows: [
              {
                id: DEPT_ID,
                plan_id: PLAN_ID,
                company_id: 'holding',
                name: 'HCNS',
                department_key: 'hr',
                sort_order: 0,
              },
            ],
          };
        }
        if (s.includes('FROM public.recruitment_plan_positions')) {
          return {
            rows: [
              {
                id: POS_ID,
                department_id: DEPT_ID,
                company_id: 'holding',
                name: 'NV',
                position_key: 'staff',
                months_data: [
                  {
                    cell_id: CELL_ID,
                    month: 3,
                    cell_status: 'need_hire',
                    lifecycle_status: 'need_hire_approved',
                    headcount_need_hire: 2,
                    headcount_current: 1,
                    headcount_projected: null,
                  },
                ],
                sort_order: 0,
              },
            ],
          };
        }
        if (s.includes('FROM public.job_requisitions') && s.includes('headcount_mode')) {
          if (!inserted) return { rows: [] };
          return { rows: [{ id: 'req-1', headcount: 2 }] };
        }
        if (s.includes('INSERT INTO public.job_requisitions')) {
          expect(params).toEqual(
            expect.arrayContaining([
              expect.any(String),
              'holding',
              expect.any(String),
              expect.any(String),
              2,
              CELL_ID,
              '2026-03-01',
              PLAN_ID,
              'hr',
              'staff',
            ]),
          );
          inserted = true;
          return { rows: [] };
        }
        return { rows: [] };
      }),
    };
    const bridge = { ensureSchema: jest.fn().mockResolvedValue(undefined) };
    const svc = new RecruitmentCatalogService(db as unknown as HrmDbService, bridge as never);
    const auth = groupCeoToken();
    const first = await svc.spawnRecruitmentPlanRequests(PLAN_ID, 'main', auth);
    expect(first.created).toHaveLength(1);
    expect(first.created[0].headcount_cell_id).toBe(CELL_ID);
    expect(first.created[0].headcount).toBe(2);
    expect(first.skipped_duplicate).toHaveLength(0);

    const second = await svc.spawnRecruitmentPlanRequests(PLAN_ID, 'main', auth);
    expect(second.created).toHaveLength(0);
    expect(second.skipped_duplicate).toHaveLength(1);
    expect(second.skipped_duplicate[0].existing_requisition_id).toBe('req-1');
  });

  it('ensureSchema ADD spawn UQ + plan cols (no rec_headcount_* invent)', async () => {
    const sqls: string[] = [];
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        sqls.push(String(sql));
        return { rows: [] };
      }),
    };
    const bridge = { ensureSchema: jest.fn().mockResolvedValue(undefined) };
    const svc = new RecruitmentCatalogService(db as unknown as HrmDbService, bridge as never);
    await svc.listRecruitmentPlans('holding', groupCeoToken());
    const joined = sqls.join('\n');
    expect(joined).toMatch(/uq_job_requisitions_spawn_cell/);
    expect(joined).toMatch(/headcount_cell_id/);
    expect(joined).toMatch(/submitted_by_dept_key/);
    expect(joined).toMatch(/department_key/);
    expect(joined).toMatch(/position_key/);
    expect(joined).not.toMatch(/CREATE TABLE IF NOT EXISTS public\.rec_headcount_plan/);
  });
});
