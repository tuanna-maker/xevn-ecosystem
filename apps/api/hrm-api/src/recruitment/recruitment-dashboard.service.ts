/**
 * @CODE-MEMORY
 * Screen:     HRM → Tuyển dụng → Dashboard («bao giờ đủ người»)
 * UC:         UC-BP-REC-08 · FR-UC-BP-REC-08 Diễn biến #1–#3
 * BR:         O1–O10 · BR-REC-08-* · VAL-REC-DASH-01..19
 * SRS:        docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-REC-08
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-REC-08-CLUSTER-API-01.md F-REC-DASH-01/02
 *             docs/program/specs/PO-HRM-MVP-GD1-REC-08-CLUSTER-BA-01.md §2.1
 *             docs/program/specs/PO-HRM-MVP-GD1-REC-08-CLUSTER-SA-01.md D-S1..D-S10 Option A
 * Purpose:    Nest on-the-fly read-model: KH from approved months_data cells (O2);
 *             TT/funnel from recruitment_candidates×YCTD + catalog→bucket; display-ready DTO.
 * WorkItem:   PO-HRM-MVP-GD1-REC-08-CLUSTER-BE-01
 * Coded:      2026-08-09
 * Callers:    recruitment.controller.ts GET dashboard*
 * Callees:    HrmDbService · RecPipelineStageService · resolveHrmListScope · formulas
 * FEActions:  filter kỳ → GET dashboard → bind · drill yctd → detail YCTD
 * BEChain:    plans cells + job_requisitions + recruitment_candidates + rec_pipeline_stage EFF
 * Impact:     Wrong scope → cross-tenant leak; FE formula = SOLID FAIL; C&B leak = O10 FAIL
 * must_keep:  REC-01 cell O2 · REC-02 OPEN set · resolveHrmListScope U19 · soft-delete · no Option B table
 * SOLID:      Read-model SRP — Nest owns formulas; FE display-only; no /rec dual controller
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-rec-08-cluster-be-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-REC-08-CLUSTER-BE-01
 * change_mode: ADD
 * What: RecruitmentDashboardService Option A on-the-fly GET-only dashboard + yctd drill
 * Why: API-01 CONFIRMED · BA O1–O10 · SA D-S1 LOCKED — FE aggregator DENY
 * must_keep: REC-01/02 seals · TARGET-MONTH CLOSED · U19 · U65 no seed · honesty false
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-REC-08-BUILD-FIX-BE-01
 * change_mode: FIX (hẹp — chỉ import path, không đổi hành vi)
 * What: `HrmListScopeContext` nhập từ `../common/hrm-list-scope` (nơi khai báo type)
 *       thay vì `../common/hrm-list-scope-context` (module này chỉ export hàm
 *       `toHrmListScopeContext`, không re-export type) → TS2724 làm `nest build` exit 1.
 * Why:  QA-01 (REC08QA-MSKX5N59) + QA-02 (REC02BODQA2-MSKX3U8H) phải content-seal dist
 *       vì không build sạch được. Cùng convention với recruitment.service.ts.
 * must_keep: DTO field names FE đang bind · scope resolver U19 · REC-01/02 seals
 */
import { HttpStatus, Injectable } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import {
  type HrmListScope,
  type HrmListScopeContext,
  expandPayrollPeriodCompanyIds,
  resolveHrmListScope,
} from '../common/hrm-list-scope';
import { HrmDbService } from '../db/hrm-db.service';
import type { RecruitmentDashboardQueryDto } from './dto/recruitment-dashboard.query.dto';
import {
  isPlanApprovedStatus,
  projectMonthsForApi,
} from './recruitment-plan-headcount';
import {
  EMPTY_GUIDE_NO_PLAN,
  FUNNEL_KEYS,
  HRM_REC_DASH_METHOD_405,
  type FunnelKey,
} from './recruitment-dashboard.constants';
import {
  buildFunnelLabels,
  deriveMetrics,
  earliestEtaYm,
  emptyFunnel,
  isOpenYctdStatus,
  mapStageToBucket,
  parseDashboardPeriod,
  parseIncludeYctd,
  parsePage,
  parsePageSize,
  sumO2NeedHire,
  targetMonthToYm,
  type DashboardPeriod,
  type FunnelCounts,
  type StageCatalogHint,
} from './recruitment-dashboard.formulas';
import { RecPipelineStageService } from './rec-pipeline-stage.service';
import { isLegacyUnclassifiedMode } from './yctd-requisition-gates';

type PlanCellRow = {
  plan_id: string;
  plan_year: number;
  plan_status: string;
  company_id: string;
  department_key: string | null;
  department_name: string | null;
  position_key: string | null;
  position_name: string | null;
  months_data: unknown;
};

type YctdRow = {
  id: string;
  company_id: string;
  title: string;
  status: string;
  headcount: number;
  headcount_mode: string | null;
  headcount_cell_id: string | null;
  target_month: string | null;
  department_key: string | null;
  position_key: string | null;
};

type CandRow = {
  id: string;
  company_id: string;
  requisition_id: string;
  status: string;
};

export type DashboardYctdItem = {
  requisition_id: string;
  title: string;
  status: string;
  headcount_mode: string | null;
  mode_warn: boolean;
  headcount: number;
  filled_count: number;
  in_pipeline_count: number;
  remaining: number;
  target_month: string | null;
  headcount_cell_id: string | null;
  department_key: string | null;
  position_key: string | null;
  company_id: string;
};

export type RecruitmentDashboardDto = {
  period: { year: number | null; from: string | null; to: string | null };
  scope: { company_ids: string[]; rollup: boolean };
  planned_need: number;
  filled_count: number;
  in_pipeline_count: number;
  open_yctd_count: number;
  gap_count: number;
  completion_pct: number | null;
  enough_people_status: string;
  enough_people_eta: string | null;
  enough_people_eta_label: string;
  funnel: FunnelCounts;
  funnel_labels: Record<FunnelKey, string>;
  by_month: Array<
    Record<string, unknown> & {
      month: string;
      planned_need: number;
      filled_count: number;
      in_pipeline_count: number;
      gap_count: number;
      completion_pct: number | null;
    }
  >;
  by_org_unit: Array<
    Record<string, unknown> & {
      company_id: string;
      department_key: string | null;
      label: string;
      planned_need: number;
      filled_count: number;
      in_pipeline_count: number;
      gap_count: number;
      completion_pct: number | null;
    }
  >;
  by_yctd: DashboardYctdItem[];
  empty_guide: typeof EMPTY_GUIDE_NO_PLAN | null;
  total?: number;
  page?: number;
  page_size?: number;
};

@Injectable()
export class RecruitmentDashboardService {
  constructor(
    private readonly db: HrmDbService,
    private readonly pipelineStages: RecPipelineStageService,
  ) {}

  denyMutate(): never {
    throw new ApiException(
      HRM_REC_DASH_METHOD_405,
      'Dashboard tuyển dụng chỉ hỗ trợ GET',
      HttpStatus.METHOD_NOT_ALLOWED,
    );
  }

  async getDashboard(
    query: RecruitmentDashboardQueryDto,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ): Promise<RecruitmentDashboardDto> {
    return this.build(query, authorization, scopeContext, {
      includeYctd: parseIncludeYctd(query.include),
      drillOnly: false,
    });
  }

  async getDashboardYctd(
    query: RecruitmentDashboardQueryDto,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ): Promise<{
    items: DashboardYctdItem[];
    total: number;
    page: number;
    page_size: number;
    period: { year: number | null; from: string | null; to: string | null };
    scope: { company_ids: string[]; rollup: boolean };
  }> {
    const full = await this.build(query, authorization, scopeContext, {
      includeYctd: true,
      drillOnly: true,
    });
    const page = parsePage(query.page, 1);
    const pageSize = parsePageSize(query.page_size, 50, 200);
    const start = (page - 1) * pageSize;
    const items = full.by_yctd.slice(start, start + pageSize);
    return {
      items,
      total: full.by_yctd.length,
      page,
      page_size: pageSize,
      period: full.period,
      scope: full.scope,
    };
  }

  private async build(
    query: RecruitmentDashboardQueryDto,
    authorization: string | undefined,
    scopeContext: HrmListScopeContext | undefined,
    opts: { includeYctd: boolean; drillOnly: boolean },
  ): Promise<RecruitmentDashboardDto> {
    await this.pipelineStages.ensureSchema();
    const period = parseDashboardPeriod({
      year: query.year,
      from: query.from,
      to: query.to,
    });
    const companyHint = (query.company_id ?? '').trim() || 'main';
    const scope = resolveHrmListScope(authorization, companyHint, scopeContext);
    const readCompanyIds = this.dashboardReadCompanyIds(scope);
    const periodMonths = new Set(period.months);
    const deptKey = query.department_key?.trim() || '';
    const posKey = query.position_key?.trim() || '';

    const [cells, yctds, catalog] = await Promise.all([
      this.loadO2Cells(readCompanyIds, period, deptKey, posKey),
      this.loadYctds(readCompanyIds, deptKey, posKey),
      this.loadCatalogHints(authorization, companyHint, scopeContext?.tenantId),
    ]);

    const hasO2Cells = cells.o2Count > 0;
    const plannedNeed = cells.plannedNeed;

    const candidates = await this.loadCandidates(
      readCompanyIds,
      yctds.map((y) => y.id),
    );

    const candByReq = new Map<string, CandRow[]>();
    for (const c of candidates) {
      const list = candByReq.get(c.requisition_id) ?? [];
      list.push(c);
      candByReq.set(c.requisition_id, list);
    }

    const funnel = emptyFunnel();
    let filledTotal = 0;
    let pipelineTotal = 0;

    const yctdStats = yctds.map((y) => {
      const apps = candByReq.get(y.id) ?? [];
      let filled = 0;
      let pipeline = 0;
      for (const app of apps) {
        const bucket = mapStageToBucket(app.status, catalog);
        if (bucket === 'terminal_reject') continue;
        if (bucket === 'onboard') {
          filled += 1;
          funnel.onboard += 1;
          continue;
        }
        pipeline += 1;
        if (bucket !== 'unmapped' && FUNNEL_KEYS.includes(bucket)) {
          funnel[bucket as FunnelKey] += 1;
        }
      }
      filledTotal += filled;
      pipelineTotal += pipeline;
      return { yctd: y, filled, pipeline };
    });

    const openYctdCount = yctds.filter((y) =>
      isOpenYctdStatus(y.status),
    ).length;
    const etaYm = earliestEtaYm(
      yctdStats.map(({ yctd, filled }) => ({
        status: yctd.status,
        headcount: yctd.headcount,
        filled_count: filled,
        target_month: yctd.target_month,
      })),
    );

    const metrics = deriveMetrics({
      hasO2Cells,
      plannedNeed,
      filledCount: filledTotal,
      inPipelineCount: pipelineTotal,
      openYctdCount,
      etaYm,
    });

    const byYctdAll = this.buildDrillRows(yctdStats, periodMonths);
    const byMonth = this.buildByMonth(
      period,
      cells.cellDetails,
      yctdStats,
      catalog,
    );
    const byOrgUnit = this.buildByOrgUnit(cells.cellDetails, yctdStats);

    const empty_guide = !hasO2Cells ? { ...EMPTY_GUIDE_NO_PLAN } : null;

    const dto: RecruitmentDashboardDto = {
      period: { year: period.year, from: period.from, to: period.to },
      scope: {
        company_ids: [...readCompanyIds],
        rollup: readCompanyIds.length > 1,
      },
      planned_need: metrics.planned_need,
      filled_count: metrics.filled_count,
      in_pipeline_count: metrics.in_pipeline_count,
      open_yctd_count: metrics.open_yctd_count,
      gap_count: metrics.gap_count,
      completion_pct: metrics.completion_pct,
      enough_people_status: metrics.enough_people_status,
      enough_people_eta:
        metrics.enough_people_status === 'no_plan'
          ? null
          : metrics.enough_people_eta,
      enough_people_eta_label: metrics.enough_people_eta_label,
      funnel,
      funnel_labels: buildFunnelLabels(catalog),
      by_month: byMonth,
      by_org_unit: byOrgUnit,
      by_yctd: opts.includeYctd || opts.drillOnly ? byYctdAll : [],
      empty_guide,
    };
    return dto;
  }

  /** Group CEO rollup reads include legacy `main` rows (peer recruitment.service / payroll). */
  private dashboardReadCompanyIds(scope: HrmListScope): string[] {
    return expandPayrollPeriodCompanyIds(scope);
  }

  private buildDrillRows(
    yctdStats: Array<{ yctd: YctdRow; filled: number; pipeline: number }>,
    periodMonths: Set<string>,
  ): DashboardYctdItem[] {
    const items: DashboardYctdItem[] = [];
    for (const { yctd, filled, pipeline } of yctdStats) {
      const ym = targetMonthToYm(yctd.target_month);
      const inPeriod = ym != null && periodMonths.has(ym);
      const openNull = ym == null && isOpenYctdStatus(yctd.status);
      if (!inPeriod && !openNull) continue;
      const headcount = Math.max(0, Math.trunc(Number(yctd.headcount ?? 0)));
      items.push({
        requisition_id: yctd.id,
        title: yctd.title,
        status: yctd.status,
        headcount_mode: yctd.headcount_mode,
        mode_warn: isLegacyUnclassifiedMode(yctd.headcount_mode),
        headcount,
        filled_count: filled,
        in_pipeline_count: pipeline,
        remaining: Math.max(headcount - filled, 0),
        target_month: ym,
        headcount_cell_id: yctd.headcount_cell_id,
        department_key: yctd.department_key,
        position_key: yctd.position_key,
        company_id: yctd.company_id,
      });
    }
    return items;
  }

  private buildByMonth(
    period: DashboardPeriod,
    cellDetails: Array<{
      monthKey: string;
      need: number;
      company_id: string;
      department_key: string | null;
    }>,
    yctdStats: Array<{ yctd: YctdRow; filled: number; pipeline: number }>,
    _catalog: StageCatalogHint[],
  ) {
    return period.months.map((mk) => {
      const planned = cellDetails
        .filter((c) => c.monthKey === mk)
        .reduce((s, c) => s + c.need, 0);
      let filled = 0;
      let pipeline = 0;
      for (const { yctd, filled: f, pipeline: p } of yctdStats) {
        const ym = targetMonthToYm(yctd.target_month);
        if (ym === mk) {
          filled += f;
          pipeline += p;
        }
      }
      const gap = Math.max(planned - filled, 0);
      return {
        month: mk,
        planned_need: planned,
        filled_count: filled,
        in_pipeline_count: pipeline,
        gap_count: gap,
        completion_pct:
          planned <= 0
            ? null
            : Math.min(100, Math.round((100 * filled) / planned)),
      };
    });
  }

  private buildByOrgUnit(
    cellDetails: Array<{
      monthKey: string;
      need: number;
      company_id: string;
      department_key: string | null;
      department_name: string | null;
    }>,
    yctdStats: Array<{ yctd: YctdRow; filled: number; pipeline: number }>,
  ) {
    const map = new Map<
      string,
      {
        company_id: string;
        department_key: string | null;
        label: string;
        planned_need: number;
        filled_count: number;
        in_pipeline_count: number;
      }
    >();
    const keyOf = (companyId: string, dept: string | null) =>
      `${companyId}::${(dept ?? '').toLowerCase()}`;

    for (const c of cellDetails) {
      const k = keyOf(c.company_id, c.department_key);
      const cur = map.get(k) ?? {
        company_id: c.company_id,
        department_key: c.department_key,
        label: c.department_name?.trim() || c.department_key || c.company_id,
        planned_need: 0,
        filled_count: 0,
        in_pipeline_count: 0,
      };
      cur.planned_need += c.need;
      map.set(k, cur);
    }
    for (const { yctd, filled, pipeline } of yctdStats) {
      const k = keyOf(yctd.company_id, yctd.department_key);
      const cur = map.get(k) ?? {
        company_id: yctd.company_id,
        department_key: yctd.department_key,
        label: yctd.department_key || yctd.company_id,
        planned_need: 0,
        filled_count: 0,
        in_pipeline_count: 0,
      };
      cur.filled_count += filled;
      cur.in_pipeline_count += pipeline;
      map.set(k, cur);
    }
    return Array.from(map.values()).map((row) => ({
      ...row,
      gap_count: Math.max(row.planned_need - row.filled_count, 0),
      completion_pct:
        row.planned_need <= 0
          ? null
          : Math.min(
              100,
              Math.round((100 * row.filled_count) / row.planned_need),
            ),
    }));
  }

  private async loadCatalogHints(
    authorization: string | undefined,
    companyId: string,
    tenantId?: string,
  ): Promise<StageCatalogHint[]> {
    try {
      const eff = await this.pipelineStages.listEffective(
        { company_id: companyId },
        authorization,
        { tenantId },
      );
      return (eff.data ?? []).map((r) => ({
        stageKey: r.stageKey,
        nameVi: r.nameVi,
        isHiredOutcome: r.isHiredOutcome,
        isRejectOutcome: r.isRejectOutcome,
      }));
    } catch {
      return [];
    }
  }

  private async loadO2Cells(
    companyIds: string[],
    period: DashboardPeriod,
    deptKey: string,
    posKey: string,
  ): Promise<{
    plannedNeed: number;
    o2Count: number;
    cellDetails: Array<{
      monthKey: string;
      need: number;
      company_id: string;
      department_key: string | null;
      department_name: string | null;
    }>;
  }> {
    const filters: string[] = [`lower(pl.status) = 'approved'`];
    const values: unknown[] = [];
    if (companyIds.length === 1) {
      values.push(companyIds[0]);
      filters.push(`pl.company_id = $${values.length}::text`);
    } else {
      values.push(companyIds);
      filters.push(`pl.company_id = ANY($${values.length}::text[])`);
    }

    // Year filter: when year param, match plan.year; when from/to, match any plan year overlapping months
    const years = new Set(
      period.months
        .map((m) => Number(m.slice(0, 4)))
        .filter((y) => Number.isFinite(y)),
    );
    if (period.year != null) {
      values.push(period.year);
      filters.push(`pl.year = $${values.length}`);
    } else if (years.size > 0) {
      values.push([...years]);
      filters.push(`pl.year = ANY($${values.length}::int[])`);
    }

    const res = await this.db.query<PlanCellRow>(
      `SELECT pl.id::text AS plan_id, pl.year AS plan_year, pl.status AS plan_status,
              pl.company_id::text AS company_id,
              d.department_key, d.name AS department_name,
              pos.position_key, pos.name AS position_name,
              pos.months_data
       FROM public.recruitment_plans pl
       JOIN public.recruitment_plan_departments d ON d.plan_id = pl.id
       JOIN public.recruitment_plan_positions pos ON pos.department_id = d.id
       WHERE ${filters.join(' AND ')};`,
      values,
    );

    const periodMonths = new Set(period.months);
    let plannedNeed = 0;
    let o2Count = 0;
    const cellDetails: Array<{
      monthKey: string;
      need: number;
      company_id: string;
      department_key: string | null;
      department_name: string | null;
    }> = [];

    for (const row of res.rows) {
      if (
        deptKey &&
        String(row.department_key ?? '')
          .trim()
          .toLowerCase() !== deptKey.toLowerCase()
      ) {
        continue;
      }
      if (
        posKey &&
        String(row.position_key ?? '')
          .trim()
          .toLowerCase() !== posKey.toLowerCase()
      ) {
        continue;
      }
      if (!isPlanApprovedStatus(row.plan_status)) continue;
      const cells = projectMonthsForApi(row.months_data, true);
      const need = sumO2NeedHire(
        cells.map((c) => ({ ...c, year: row.plan_year })),
        periodMonths,
        Number(row.plan_year),
      );
      for (const c of cells) {
        const life = String(c.lifecycle_status ?? '').toLowerCase();
        const qty = Math.trunc(
          Number(c.need_hire ?? c.headcount_need_hire ?? 0),
        );
        if (life !== 'need_hire_approved' || qty < 1) continue;
        const mk = `${row.plan_year}-${c.month < 10 ? `0${c.month}` : c.month}`;
        if (!periodMonths.has(mk)) continue;
        o2Count += 1;
        cellDetails.push({
          monthKey: mk,
          need: qty,
          company_id: row.company_id,
          department_key: row.department_key,
          department_name: row.department_name,
        });
      }
      plannedNeed += need;
    }

    return { plannedNeed, o2Count, cellDetails };
  }

  private async loadYctds(
    companyIds: string[],
    deptKey: string,
    posKey: string,
  ): Promise<YctdRow[]> {
    const filters: string[] = ['r.archived_at IS NULL'];
    const values: unknown[] = [];
    if (companyIds.length === 1) {
      values.push(companyIds[0]);
      filters.push(`r.company_id = $${values.length}::text`);
    } else {
      values.push(companyIds);
      filters.push(`r.company_id = ANY($${values.length}::text[])`);
    }
    if (deptKey) {
      values.push(deptKey.toLowerCase());
      filters.push(`lower(COALESCE(r.department_key, '')) = $${values.length}`);
    }
    if (posKey) {
      values.push(posKey.toLowerCase());
      filters.push(
        `lower(COALESCE(NULLIF(r.position_key, ''), '')) = $${values.length}`,
      );
    }
    const res = await this.db.query<YctdRow>(
      `SELECT r.id::text AS id, r.company_id::text AS company_id, r.title, r.status,
              COALESCE(r.headcount, 0)::int AS headcount,
              r.headcount_mode, r.headcount_cell_id::text AS headcount_cell_id,
              r.target_month::text AS target_month,
              r.department_key, r.position_key
       FROM public.job_requisitions r
       WHERE ${filters.join(' AND ')}
       ORDER BY r.created_at DESC;`,
      values,
    );
    return res.rows;
  }

  private async loadCandidates(
    companyIds: string[],
    requisitionIds: string[],
  ): Promise<CandRow[]> {
    if (requisitionIds.length === 0) return [];
    const filters: string[] = [];
    const values: unknown[] = [];
    if (companyIds.length === 1) {
      values.push(companyIds[0]);
      filters.push(`c.company_id = $${values.length}::text`);
    } else {
      values.push(companyIds);
      filters.push(`c.company_id = ANY($${values.length}::text[])`);
    }
    values.push(requisitionIds);
    filters.push(`c.requisition_id = ANY($${values.length}::uuid[])`);
    const res = await this.db.query<CandRow>(
      `SELECT c.id::text AS id, c.company_id::text AS company_id,
              c.requisition_id::text AS requisition_id, c.status
       FROM public.recruitment_candidates c
       WHERE ${filters.join(' AND ')};`,
      values,
    );
    return res.rows;
  }
}
