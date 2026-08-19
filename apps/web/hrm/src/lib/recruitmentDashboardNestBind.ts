/**
 * @CODE-MEMORY
 * Screen:     Tuyển dụng → Dashboard / Reports (recruitment)
 * UC:         UC-BP-REC-08 · FR-UC-BP-REC-08
 * BR:         BR-REC-08-BE-FORMULA · O4/O8/O9/O10 · DENY FE domain aggregation
 * SRS:        SRS_HRM_ENTERPRISE.md FR-UC-BP-REC-08
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-REC-08-CLUSTER-API-01.md §7 · §11
 * Purpose:    Display-only helpers — bind Nest DTO fields to UI labels/chart rows.
 *             Không tính planned_need / gap / completion_pct / ETA (BE owns).
 * WorkItem:   PO-HRM-MVP-GD1-REC-08-CLUSTER-FE-01
 * Coded:      2026-08-09
 * Callers:    RecruitmentNestDashboardPanel · reportsApiAggregator · vitest
 * Callees:    hrmApi HrmRecruitmentDashboardDto types
 * FEActions:  map funnel keys · format % · status label · chart rows from by_* arrays
 * Impact:     Invent formula here = FAIL AC-REC-08-09 / O8
 * must_keep:  5 funnel keys always · null % → «—» · no cost/VND
 * SOLID:      Pure display adapters — no I/O, no domain SoT
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-rec-08-cluster-fe-01.md
 */

import type {
  HrmRecDashFunnelKey,
  HrmRecruitmentDashboardDto,
  HrmRecDashOrgUnitSlice,
  HrmRecDashMonthSlice,
} from '@/integrations/hrmApi';

export const REC_DASH_FUNNEL_KEYS: readonly HrmRecDashFunnelKey[] = [
  'cv',
  'screening',
  'interview',
  'offer',
  'onboard',
] as const;

export const REC_DASH_CHART_COLORS = [
  '#1E40AF',
  '#22c55e',
  '#f59e0b',
  '#06b6d4',
  '#6366f1',
  '#ec4899',
  '#84cc16',
  '#ef4444',
] as const;

export const ENOUGH_PEOPLE_STATUS_LABEL_VI: Record<string, string> = {
  no_plan: 'Chưa có định biên đã duyệt',
  enough: 'Đã đủ người theo kế hoạch',
  in_progress: 'Đang tuyển',
  at_risk: 'Còn thiếu — chưa có YCTD/pipeline mở',
};

export type RecDashBarChartRow = {
  name: string;
  value: number;
  color: string;
};

export type RecDashLineChartRow = {
  month: string;
  value: number;
  planned_need?: number;
  filled_count?: number;
};

/** Bind Nest funnel — always 5 keys; missing → 0 (no FE invent). */
export function bindRecDashFunnelCounts(
  dto: Pick<HrmRecruitmentDashboardDto, 'funnel'> | null | undefined,
): Record<HrmRecDashFunnelKey, number> {
  const funnel = dto?.funnel;
  return {
    cv: Math.max(0, funnel?.cv ?? 0),
    screening: Math.max(0, funnel?.screening ?? 0),
    interview: Math.max(0, funnel?.interview ?? 0),
    offer: Math.max(0, funnel?.offer ?? 0),
    onboard: Math.max(0, funnel?.onboard ?? 0),
  };
}

export function bindRecDashFunnelLabels(
  dto: Pick<HrmRecruitmentDashboardDto, 'funnel_labels'> | null | undefined,
): Record<HrmRecDashFunnelKey, string> {
  const labels = dto?.funnel_labels;
  return {
    cv: labels?.cv?.trim() || 'Hồ sơ / CV',
    screening: labels?.screening?.trim() || 'Sàng lọc',
    interview: labels?.interview?.trim() || 'Phỏng vấn',
    offer: labels?.offer?.trim() || 'Offer',
    onboard: labels?.onboard?.trim() || 'Onboard / Đã tuyển',
  };
}

/** Display-ready % — null when planned_need=0 (O9); never FE divide. */
export function formatRecDashCompletionPct(pct: number | null | undefined): string {
  if (pct == null || !Number.isFinite(pct)) return '—';
  return `${Math.round(pct)}%`;
}

export function formatRecDashCount(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return '—';
  return String(Math.max(0, Math.floor(value)));
}

export function enoughPeopleStatusLabelVi(status: string | null | undefined): string {
  const key = (status ?? '').trim();
  return ENOUGH_PEOPLE_STATUS_LABEL_VI[key] ?? (key || '—');
}

/** Chart rows from Nest by_month — values are BE filled_count (display only). */
export function bindRecDashMonthChartRows(
  slices: HrmRecDashMonthSlice[] | null | undefined,
): RecDashLineChartRow[] {
  if (!slices?.length) return [];
  return slices.map((row) => {
    const ym = row.month?.trim() || '';
    const label =
      /^\d{4}-\d{2}$/.test(ym) ? `${ym.slice(5, 7)}/${ym.slice(0, 4)}` : ym || '—';
    return {
      month: label,
      value: Math.max(0, row.filled_count ?? 0),
      planned_need: Math.max(0, row.planned_need ?? 0),
      filled_count: Math.max(0, row.filled_count ?? 0),
    };
  });
}

/** Chart rows from Nest by_org_unit — filled_count display only. */
export function bindRecDashOrgUnitChartRows(
  slices: HrmRecDashOrgUnitSlice[] | null | undefined,
): RecDashBarChartRow[] {
  if (!slices?.length) return [];
  return [...slices]
    .sort((a, b) => (b.filled_count ?? 0) - (a.filled_count ?? 0))
    .map((row, index) => ({
      name: row.label?.trim() || row.company_id || '—',
      value: Math.max(0, row.filled_count ?? 0),
      color: REC_DASH_CHART_COLORS[index % REC_DASH_CHART_COLORS.length],
    }));
}

/**
 * Reports subset (O8) — map Nest DTO → display fields.
 * DENY second formula from candidates/job_postings.
 */
export type RecruitmentNestReportSubset = {
  planned_need: number;
  filled_count: number;
  in_pipeline_count: number;
  open_yctd_count: number;
  gap_count: number;
  completion_pct: number | null;
  enough_people_status: string;
  enough_people_eta: string | null;
  enough_people_eta_label: string;
  funnel: Record<HrmRecDashFunnelKey, number>;
  funnel_labels: Record<HrmRecDashFunnelKey, string>;
  by_month: HrmRecDashMonthSlice[];
};

export function mapRecruitmentReportFromDashboardDto(
  dto: HrmRecruitmentDashboardDto,
): RecruitmentNestReportSubset {
  return {
    planned_need: Math.max(0, dto.planned_need ?? 0),
    filled_count: Math.max(0, dto.filled_count ?? 0),
    in_pipeline_count: Math.max(0, dto.in_pipeline_count ?? 0),
    open_yctd_count: Math.max(0, dto.open_yctd_count ?? 0),
    gap_count: Math.max(0, dto.gap_count ?? 0),
    completion_pct: dto.completion_pct == null ? null : dto.completion_pct,
    enough_people_status: String(dto.enough_people_status ?? ''),
    enough_people_eta: dto.enough_people_eta,
    enough_people_eta_label: dto.enough_people_eta_label?.trim() || 'Chưa xác định thời điểm đủ người',
    funnel: bindRecDashFunnelCounts(dto),
    funnel_labels: bindRecDashFunnelLabels(dto),
    by_month: Array.isArray(dto.by_month) ? dto.by_month : [],
  };
}
