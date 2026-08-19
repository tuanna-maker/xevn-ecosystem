/**
 * @CODE-MEMORY
 * WorkItem: PO-HRM-MVP-GD1-REC-08-CLUSTER-BE-01
 * Purpose: Jest — O2/O3/O5/O6/O7/O9 formulas · funnel keys · empty_guide · C&B absent · scope parity
 * DENY: seed · honesty flip · Option B rollup
 */
import { ApiException } from '../common/api.exception';
import {
  FUNNEL_KEYS,
  HRM_REC_DASH_METHOD_405,
  HRM_REC_DASH_PERIOD_400,
  OPEN_YCTD_STATUS_SET,
} from './recruitment-dashboard.constants';
import {
  assertNoForbiddenFields,
  cellCountsForPlannedNeed,
  completionPct,
  deriveMetrics,
  earliestEtaYm,
  emptyFunnel,
  gapCount,
  mapStageToBucket,
  parseDashboardPeriod,
  sumO2NeedHire,
} from './recruitment-dashboard.formulas';
import { RecruitmentDashboardService } from './recruitment-dashboard.service';

describe('PO-HRM-MVP-GD1-REC-08-CLUSTER-BE-01 formulas', () => {
  describe('period VAL-01', () => {
    it('accepts year xor from+to', () => {
      const y = parseDashboardPeriod({ year: 2026 });
      expect(y.year).toBe(2026);
      expect(y.months).toHaveLength(12);
      const r = parseDashboardPeriod({ from: '2026-03', to: '2026-05' });
      expect(r.months).toEqual(['2026-03', '2026-04', '2026-05']);
    });

    it('rejects missing / dual / invalid → HRM-REC-DASH-PERIOD-400', () => {
      expect(() => parseDashboardPeriod({})).toThrow(ApiException);
      try {
        parseDashboardPeriod({});
      } catch (e) {
        expect((e as ApiException).code).toBe(HRM_REC_DASH_PERIOD_400);
      }
      expect(() => parseDashboardPeriod({ year: 2026, from: '2026-01', to: '2026-02' })).toThrow(
        ApiException,
      );
      expect(() => parseDashboardPeriod({ from: '2026-06', to: '2026-01' })).toThrow(ApiException);
    });
  });

  describe('O2 planned_need cells', () => {
    it('counts need_hire_approved ≥1 only', () => {
      expect(
        cellCountsForPlannedNeed({
          lifecycle_status: 'need_hire_approved',
          need_hire: 3,
        }),
      ).toBe(true);
      expect(
        cellCountsForPlannedNeed({ lifecycle_status: 'open', need_hire: 5 }),
      ).toBe(false);
      expect(
        cellCountsForPlannedNeed({
          lifecycle_status: 'need_hire_approved',
          need_hire: 0,
        }),
      ).toBe(false);
      const sum = sumO2NeedHire(
        [
          { lifecycle_status: 'need_hire_approved', need_hire: 2, month: 3 },
          { lifecycle_status: 'open', need_hire: 9, month: 3 },
          { lifecycle_status: 'need_hire_approved', need_hire: 1, month: 4 },
        ],
        new Set(['2026-03', '2026-04']),
        2026,
      );
      expect(sum).toBe(3);
    });
  });

  describe('O3/O4 funnel map', () => {
    it('hired→onboard synonym; reject excluded; 5 keys always', () => {
      expect(mapStageToBucket('hired', [])).toBe('onboard');
      expect(mapStageToBucket('onboarding', [])).toBe('onboard');
      expect(mapStageToBucket('rejected', [])).toBe('terminal_reject');
      expect(mapStageToBucket('screening', [])).toBe('screening');
      expect(mapStageToBucket('new', [])).toBe('cv');
      const funnel = emptyFunnel();
      for (const k of FUNNEL_KEYS) {
        expect(funnel[k]).toBe(0);
      }
      expect(Object.keys(funnel).sort()).toEqual([...FUNNEL_KEYS].sort());
    });

    it('catalog EFF>0: is_hired_outcome / is_reject_outcome win', () => {
      const catalog = [
        { stageKey: 'done', isHiredOutcome: true, isRejectOutcome: false, nameVi: 'Đã tuyển' },
        { stageKey: 'drop', isHiredOutcome: false, isRejectOutcome: true, nameVi: 'Loại' },
        { stageKey: 'weird', isHiredOutcome: false, isRejectOutcome: false, nameVi: 'Lạ' },
      ];
      expect(mapStageToBucket('done', catalog)).toBe('onboard');
      expect(mapStageToBucket('drop', catalog)).toBe('terminal_reject');
      expect(mapStageToBucket('weird', catalog)).toBe('unmapped');
    });
  });

  describe('O5/O9 gap pct status ETA', () => {
    it('completion_pct null when planned_need=0; gap max(0,..)', () => {
      expect(completionPct(0, 5)).toBeNull();
      expect(completionPct(10, 3)).toBe(30);
      expect(gapCount(10, 12)).toBe(0);
      expect(gapCount(10, 4)).toBe(6);
    });

    it('enough_people_status decision table O9', () => {
      expect(
        deriveMetrics({
          hasO2Cells: false,
          plannedNeed: 0,
          filledCount: 0,
          inPipelineCount: 0,
          openYctdCount: 0,
          etaYm: null,
        }).enough_people_status,
      ).toBe('no_plan');
      expect(
        deriveMetrics({
          hasO2Cells: true,
          plannedNeed: 5,
          filledCount: 5,
          inPipelineCount: 0,
          openYctdCount: 0,
          etaYm: null,
        }).enough_people_status,
      ).toBe('enough');
      expect(
        deriveMetrics({
          hasO2Cells: true,
          plannedNeed: 10,
          filledCount: 2,
          inPipelineCount: 3,
          openYctdCount: 1,
          etaYm: '2026-09',
        }).enough_people_status,
      ).toBe('in_progress');
      expect(
        deriveMetrics({
          hasO2Cells: true,
          plannedNeed: 10,
          filledCount: 1,
          inPipelineCount: 0,
          openYctdCount: 0,
          etaYm: null,
        }).enough_people_status,
      ).toBe('at_risk');
    });

    it('O5 earliest open YCTD target_month with remaining>0', () => {
      expect(
        earliestEtaYm([
          {
            status: 'open_for_hire',
            headcount: 2,
            filled_count: 2,
            target_month: '2026-08-01',
          },
          {
            status: 'open_for_hire',
            headcount: 3,
            filled_count: 0,
            target_month: '2026-11-01',
          },
          {
            status: 'open_for_hire',
            headcount: 1,
            filled_count: 0,
            target_month: '2026-09-01',
          },
          { status: 'draft', headcount: 5, filled_count: 0, target_month: '2026-01-01' },
        ]),
      ).toBe('2026-09');
      expect(OPEN_YCTD_STATUS_SET).toEqual(
        expect.arrayContaining(['open_for_hire', 'open', 'approved']),
      );
    });
  });

  describe('O10 C&B omit', () => {
    it('assertNoForbiddenFields passes clean DTO; fails on salary', () => {
      const clean = {
        planned_need: 1,
        filled_count: 0,
        funnel: emptyFunnel(),
        empty_guide: null,
      };
      expect(() => assertNoForbiddenFields(clean)).not.toThrow();
      expect(() =>
        assertNoForbiddenFields({ ...clean, offer_salary: 20000000 }),
      ).toThrow(/FORBIDDEN/);
      expect(() => assertNoForbiddenFields({ cost_vnd: 1 })).toThrow(/FORBIDDEN/);
    });
  });
});

describe('PO-HRM-MVP-GD1-REC-08-CLUSTER-BE-01 service', () => {
  function makeDb(handlers: Array<(sql: string, params: unknown[]) => { rows: unknown[] }>) {
    return {
      query: jest.fn(async (sql: string, params: unknown[] = []) => {
        for (const h of handlers) {
          const r = h(String(sql), params);
          if (r) return r;
        }
        return { rows: [] };
      }),
    };
  }

  it('empty_guide + no_plan when no approved O2 cells; funnel keys present; no C&B', async () => {
    const db = makeDb([
      (sql) => {
        if (sql.includes('recruitment_plans')) return { rows: [] };
        if (sql.includes('job_requisitions')) return { rows: [] };
        if (sql.includes('recruitment_candidates')) return { rows: [] };
        return { rows: [] };
      },
    ]);
    const pipeline = {
      listEffective: jest.fn().mockResolvedValue({ total: 0, data: [], hiredOutcomeKey: null }),
      ensureSchema: jest.fn().mockResolvedValue(undefined),
    };
    const svc = new RecruitmentDashboardService(db as never, pipeline as never);
    const dto = await svc.getDashboard({ company_id: 'holding', year: '2026' }, undefined);
    expect(dto.enough_people_status).toBe('no_plan');
    expect(dto.empty_guide?.code).toBe('NO_APPROVED_HEADCOUNT');
    expect(dto.completion_pct).toBeNull();
    expect(dto.planned_need).toBe(0);
    for (const k of FUNNEL_KEYS) {
      expect(dto.funnel[k]).toBe(0);
    }
    expect(() => assertNoForbiddenFields(dto)).not.toThrow();
    expect(JSON.stringify(dto)).not.toMatch(/offer_salary|c_and_b_|cost_/i);
  });

  it('O2+O3+O6: KH from cells only; out_of_plan fills TT; O7 mode_warn', async () => {
    const planRows = [
      {
        plan_id: 'p1',
        plan_year: 2026,
        plan_status: 'approved',
        company_id: 'holding',
        department_key: 'ops',
        department_name: 'Vận hành',
        position_key: 'drv',
        position_name: 'Tài xế',
        months_data: [
          {
            month: 8,
            cell_status: 'need_hire',
            lifecycle_status: 'need_hire_approved',
            headcount_need_hire: 4,
            need_hire: 4,
            headcount_current: 0,
          },
        ],
      },
    ];
    const yctdRows = [
      {
        id: 'y1',
        company_id: 'holding',
        title: 'In plan',
        status: 'open_for_hire',
        headcount: 2,
        headcount_mode: 'in_plan',
        headcount_cell_id: 'c1',
        target_month: '2026-08-01',
        department_key: 'ops',
        position_key: 'drv',
      },
      {
        id: 'y2',
        company_id: 'holding',
        title: 'Out of plan',
        status: 'open_for_hire',
        headcount: 1,
        headcount_mode: 'out_of_plan',
        headcount_cell_id: null,
        target_month: '2026-08-01',
        department_key: 'ops',
        position_key: 'drv',
      },
      {
        id: 'y3',
        company_id: 'holding',
        title: 'Legacy null mode',
        status: 'open_for_hire',
        headcount: 1,
        headcount_mode: null,
        headcount_cell_id: null,
        target_month: '2026-08-01',
        department_key: 'ops',
        position_key: 'drv',
      },
    ];
    const candRows = [
      { id: 'a1', company_id: 'holding', requisition_id: 'y1', status: 'hired' },
      { id: 'a2', company_id: 'holding', requisition_id: 'y2', status: 'hired' },
      { id: 'a3', company_id: 'holding', requisition_id: 'y1', status: 'interview' },
      { id: 'a4', company_id: 'holding', requisition_id: 'y3', status: 'screening' },
    ];
    const db = makeDb([
      (sql) => {
        if (sql.includes('recruitment_plans')) return { rows: planRows };
        if (sql.includes('FROM public.job_requisitions')) return { rows: yctdRows };
        if (sql.includes('recruitment_candidates')) return { rows: candRows };
        return { rows: [] };
      },
    ]);
    const pipeline = {
      listEffective: jest.fn().mockResolvedValue({ total: 0, data: [], hiredOutcomeKey: null }),
      ensureSchema: jest.fn().mockResolvedValue(undefined),
    };
    const svc = new RecruitmentDashboardService(db as never, pipeline as never);
    const dto = await svc.getDashboard(
      { company_id: 'holding', year: '2026', include: 'yctd' },
      undefined,
    );
    // O2: KH=4 from cell only — out_of_plan does not inflate
    expect(dto.planned_need).toBe(4);
    // O3+O6: filled includes out_of_plan hire
    expect(dto.filled_count).toBe(2);
    expect(dto.in_pipeline_count).toBe(2);
    expect(dto.funnel.onboard).toBe(2);
    expect(dto.funnel.interview).toBe(1);
    expect(dto.funnel.screening).toBe(1);
    expect(dto.gap_count).toBe(2);
    expect(dto.completion_pct).toBe(50);
    expect(dto.enough_people_status).toBe('in_progress');
    expect(dto.empty_guide).toBeNull();
    const legacy = dto.by_yctd.find((r) => r.requisition_id === 'y3');
    expect(legacy?.mode_warn).toBe(true);
    const oop = dto.by_yctd.find((r) => r.requisition_id === 'y2');
    expect(oop?.headcount_mode).toBe('out_of_plan');
    expect(() => assertNoForbiddenFields(dto)).not.toThrow();
  });

  it('scope_parity: summary + drill use resolveHrmListScope company filter (same SQL companyIds)', async () => {
    const seen: string[] = [];
    const db = {
      query: jest.fn(async (sql: string, params: unknown[] = []) => {
        seen.push(String(sql));
        if (String(sql).includes('job_requisitions')) {
          // Capture company filter param
          expect(params.length).toBeGreaterThan(0);
        }
        return { rows: [] };
      }),
    };
    const pipeline = {
      listEffective: jest.fn().mockResolvedValue({ total: 0, data: [], hiredOutcomeKey: null }),
      ensureSchema: jest.fn().mockResolvedValue(undefined),
    };
    const svc = new RecruitmentDashboardService(db as never, pipeline as never);
    await svc.getDashboard({ company_id: 'holding', year: '2026' }, undefined);
    await svc.getDashboardYctd({ company_id: 'holding', year: '2026' }, undefined);
    const planSqls = seen.filter((s) => s.includes('recruitment_plans'));
    const yctdSqls = seen.filter((s) => s.includes('job_requisitions'));
    expect(planSqls.length).toBeGreaterThanOrEqual(2);
    expect(yctdSqls.length).toBeGreaterThanOrEqual(2);
    // Both paths filter company_id
    expect(planSqls.every((s) => s.includes('company_id'))).toBe(true);
    expect(yctdSqls.every((s) => s.includes('company_id'))).toBe(true);
  });

  it('METHOD-405 deny mutate', () => {
    const svc = new RecruitmentDashboardService({ query: jest.fn() } as never, {
      listEffective: jest.fn(),
      ensureSchema: jest.fn(),
    } as never);
    try {
      svc.denyMutate();
      fail('expected throw');
    } catch (e) {
      expect((e as ApiException).code).toBe(HRM_REC_DASH_METHOD_405);
      expect((e as ApiException).getStatus()).toBe(405);
    }
  });
});
