/**
 * @CODE-MEMORY
 * Screen:     HRM → Tuyển dụng → Dashboard formulas (pure)
 * UC:         UC-BP-REC-08
 * BR:         O2/O3/O4/O5/O6/O7/O9 · API-01 §4.1–§4.4
 * SRS:        FR-UC-BP-REC-08
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-REC-08-CLUSTER-API-01.md §4
 * Purpose:    Pure Nest-owned formulas — period parse, stage→bucket, KH O2, gap/%/status/ETA.
 * WorkItem:   PO-HRM-MVP-GD1-REC-08-CLUSTER-BE-01
 * Coded:      2026-08-09
 * Callers:    recruitment-dashboard.service.ts · *.spec.ts
 * Callees:    recruitment-dashboard.constants.ts
 * Impact:     FE must NOT recompute — wrong bucket map = funnel FAIL
 * must_keep:  hired→onboard synonym · completion_pct null when planned=0 · O6 out_of_plan ≠ KH
 * SOLID:      Pure functions SRP — no DB
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-rec-08-cluster-be-01.md
 */
import { HttpStatus } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import {
  DEFAULT_FUNNEL_LABELS_VI,
  EMPTY_GUIDE_NO_PLAN,
  ETA_LABEL_UNKNOWN,
  FUNNEL_KEYS,
  HRM_REC_DASH_PERIOD_400,
  HRM_REC_DASH_VAL_400,
  OPEN_YCTD_STATUS_SET,
  type EnoughPeopleStatus,
  type FunnelKey,
} from './recruitment-dashboard.constants';

export type DashboardPeriod = {
  year: number | null;
  from: string | null;
  to: string | null;
  /** Inclusive yyyy-MM keys in range. */
  months: string[];
};

export type StageCatalogHint = {
  stageKey: string;
  nameVi?: string | null;
  isHiredOutcome?: boolean;
  isRejectOutcome?: boolean;
};

export type StageBucket = FunnelKey | 'terminal_reject' | 'unmapped';

export type FunnelCounts = Record<FunnelKey, number>;

export type MetricSlice = {
  planned_need: number;
  filled_count: number;
  in_pipeline_count: number;
  open_yctd_count: number;
  gap_count: number;
  completion_pct: number | null;
  enough_people_status: EnoughPeopleStatus;
  enough_people_eta: string | null;
  enough_people_eta_label: string;
};

const YM_RE = /^(\d{4})-(\d{2})$/;

function padMonth(m: number): string {
  return m < 10 ? `0${m}` : String(m);
}

export function monthKey(year: number, month: number): string {
  return `${year}-${padMonth(month)}`;
}

export function parseYearMonth(raw: string): { year: number; month: number } | null {
  const m = YM_RE.exec(String(raw ?? '').trim());
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  if (!Number.isFinite(year) || month < 1 || month > 12) return null;
  return { year, month };
}

/** Expand inclusive from..to (yyyy-MM) into month keys. */
export function expandMonthRange(from: string, to: string): string[] {
  const a = parseYearMonth(from);
  const b = parseYearMonth(to);
  if (!a || !b) return [];
  const out: string[] = [];
  let y = a.year;
  let mo = a.month;
  while (y < b.year || (y === b.year && mo <= b.month)) {
    out.push(monthKey(y, mo));
    mo += 1;
    if (mo > 12) {
      mo = 1;
      y += 1;
    }
    if (out.length > 240) break;
  }
  return out;
}

/**
 * VAL-01 — require year XOR (from+to). Invalid → HRM-REC-DASH-PERIOD-400.
 */
export function parseDashboardPeriod(query: {
  year?: string | number | null;
  from?: string | null;
  to?: string | null;
}): DashboardPeriod {
  const yearRaw =
    query.year !== undefined && query.year !== null && String(query.year).trim() !== ''
      ? Number(query.year)
      : NaN;
  const hasYear = Number.isFinite(yearRaw) && yearRaw >= 2000 && yearRaw <= 2100;
  const from = query.from?.trim() || '';
  const to = query.to?.trim() || '';
  const hasRange = Boolean(from || to);

  if (hasYear && hasRange) {
    throw new ApiException(
      HRM_REC_DASH_PERIOD_400,
      'Chọn year hoặc from+to — không gửi đồng thời',
      HttpStatus.BAD_REQUEST,
    );
  }
  if (!hasYear && !hasRange) {
    throw new ApiException(
      HRM_REC_DASH_PERIOD_400,
      'Thiếu kỳ lọc — cần year hoặc from+to (yyyy-MM)',
      HttpStatus.BAD_REQUEST,
    );
  }
  if (hasYear) {
    const y = Math.trunc(yearRaw);
    return {
      year: y,
      from: null,
      to: null,
      months: Array.from({ length: 12 }, (_, i) => monthKey(y, i + 1)),
    };
  }
  if (!from || !to) {
    throw new ApiException(
      HRM_REC_DASH_PERIOD_400,
      'from và to (yyyy-MM) bắt buộc khi không dùng year',
      HttpStatus.BAD_REQUEST,
    );
  }
  const a = parseYearMonth(from);
  const b = parseYearMonth(to);
  if (!a || !b) {
    throw new ApiException(
      HRM_REC_DASH_PERIOD_400,
      'from/to phải dạng yyyy-MM',
      HttpStatus.BAD_REQUEST,
    );
  }
  if (a.year > b.year || (a.year === b.year && a.month > b.month)) {
    throw new ApiException(
      HRM_REC_DASH_PERIOD_400,
      'from phải ≤ to',
      HttpStatus.BAD_REQUEST,
    );
  }
  return { year: null, from, to, months: expandMonthRange(from, to) };
}

export function isOpenYctdStatus(status: string | null | undefined): boolean {
  const s = String(status ?? '')
    .trim()
    .toLowerCase();
  return (OPEN_YCTD_STATUS_SET as readonly string[]).includes(s);
}

/** DATE / ISO / yyyy-MM → yyyy-MM or null. */
export function targetMonthToYm(raw: string | Date | null | undefined): string | null {
  if (raw == null) return null;
  if (raw instanceof Date && !Number.isNaN(raw.getTime())) {
    return monthKey(raw.getUTCFullYear(), raw.getUTCMonth() + 1);
  }
  const s = String(raw).trim();
  if (!s) return null;
  const ym = parseYearMonth(s.slice(0, 7));
  if (ym) return monthKey(ym.year, ym.month);
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) {
    return monthKey(d.getUTCFullYear(), d.getUTCMonth() + 1);
  }
  return null;
}

/**
 * API-01 §4.1 catalog → bucket map.
 * EFF=0 → synonym on status only. EFF>0 → catalog flags + synonyms; unknown → unmapped.
 */
export function mapStageToBucket(
  stageRaw: string | null | undefined,
  catalog: StageCatalogHint[] | null | undefined,
): StageBucket {
  const key = String(stageRaw ?? '')
    .trim()
    .toLowerCase() || 'new';
  const eff = Array.isArray(catalog) ? catalog : [];
  const byKey = new Map(eff.map((r) => [r.stageKey.trim().toLowerCase(), r]));

  const applySynonyms = (k: string): StageBucket | null => {
    if (k === 'hired' || k === 'onboard' || k === 'onboarding') return 'onboard';
    if (k === 'rejected' || k === 'withdrawn' || k === 'reject') return 'terminal_reject';
    if (k === 'screening' || k === 'screen' || k === 'hr_screen') return 'screening';
    if (k === 'interview' || k === 'interviewing' || k === 'technical_interview') return 'interview';
    if (k === 'offer' || k === 'offered') return 'offer';
    if (k === 'new' || k === 'applied' || k === 'cv' || k === 'cv_received' || k === 'resume') {
      return 'cv';
    }
    return null;
  };

  if (eff.length === 0) {
    return applySynonyms(key) ?? 'unmapped';
  }

  const hit = byKey.get(key);
  if (hit) {
    if (hit.isHiredOutcome) return 'onboard';
    if (hit.isRejectOutcome) return 'terminal_reject';
  }
  // Priority 1–2 synonyms even without catalog hit
  if (key === 'hired' || key === 'onboard' || key === 'onboarding') return 'onboard';
  if (key === 'rejected' || key === 'withdrawn' || key === 'reject') return 'terminal_reject';
  if (hit) {
    const syn = applySynonyms(key);
    if (syn && syn !== 'unmapped') return syn;
    return 'unmapped';
  }
  const syn = applySynonyms(key);
  return syn ?? 'unmapped';
}

export function emptyFunnel(): FunnelCounts {
  return { cv: 0, screening: 0, interview: 0, offer: 0, onboard: 0 };
}

export function buildFunnelLabels(catalog: StageCatalogHint[] | null | undefined): Record<FunnelKey, string> {
  const labels: Record<FunnelKey, string> = { ...DEFAULT_FUNNEL_LABELS_VI };
  const eff = Array.isArray(catalog) ? catalog : [];
  for (const row of eff) {
    const bucket = mapStageToBucket(row.stageKey, [row]);
    if (bucket === 'terminal_reject' || bucket === 'unmapped') continue;
    const name = row.nameVi?.trim();
    if (name && FUNNEL_KEYS.includes(bucket)) {
      // Prefer first catalog label per bucket
      if (labels[bucket] === DEFAULT_FUNNEL_LABELS_VI[bucket]) {
        labels[bucket] = name;
      }
    }
  }
  return labels;
}

/** O2 — cell enters planned_need. */
export function cellCountsForPlannedNeed(cell: {
  lifecycle_status?: string | null;
  need_hire?: number | null;
  headcount_need_hire?: number | null;
  month?: number | null;
}): boolean {
  const life = String(cell.lifecycle_status ?? '')
    .trim()
    .toLowerCase();
  if (life !== 'need_hire_approved') return false;
  const qty = Math.trunc(Number(cell.need_hire ?? cell.headcount_need_hire ?? 0));
  return Number.isFinite(qty) && qty >= 1;
}

export function sumO2NeedHire(
  cells: Array<{
    lifecycle_status?: string | null;
    need_hire?: number | null;
    headcount_need_hire?: number | null;
    month?: number | null;
    year?: number | null;
  }>,
  periodMonths: Set<string>,
  planYear: number,
): number {
  let sum = 0;
  for (const cell of cells) {
    if (!cellCountsForPlannedNeed(cell)) continue;
    const m = Math.trunc(Number(cell.month ?? 0));
    if (m < 1 || m > 12) continue;
    const y = cell.year != null ? Math.trunc(Number(cell.year)) : planYear;
    const key = monthKey(y, m);
    if (!periodMonths.has(key)) continue;
    sum += Math.trunc(Number(cell.need_hire ?? cell.headcount_need_hire ?? 0));
  }
  return sum;
}

export function gapCount(plannedNeed: number, filledCount: number): number {
  return Math.max(Math.trunc(plannedNeed) - Math.trunc(filledCount), 0);
}

/** O9 — null when planned_need=0. */
export function completionPct(plannedNeed: number, filledCount: number): number | null {
  if (Math.trunc(plannedNeed) <= 0) return null;
  return Math.min(100, Math.round((100 * Math.trunc(filledCount)) / Math.trunc(plannedNeed)));
}

/**
 * O9 / §4.3 enough_people_status.
 * noPlanCells = no approved ĐB / no O2 cells → no_plan.
 */
export function enoughPeopleStatus(input: {
  hasO2Cells: boolean;
  plannedNeed: number;
  gap: number;
  openYctdCount: number;
  inPipelineCount: number;
}): EnoughPeopleStatus {
  if (!input.hasO2Cells || input.plannedNeed <= 0) {
    // Spec: no_plan when empty_guide; planned_need=0 with no O2 → no_plan
    if (!input.hasO2Cells) return 'no_plan';
  }
  if (input.plannedNeed > 0 && input.gap === 0) return 'enough';
  if (input.gap > 0 && (input.openYctdCount > 0 || input.inPipelineCount > 0)) {
    return 'in_progress';
  }
  if (input.gap > 0 && input.openYctdCount === 0 && input.inPipelineCount === 0) {
    return 'at_risk';
  }
  if (input.plannedNeed <= 0) return 'no_plan';
  return 'in_progress';
}

export function formatEtaLabel(etaYm: string | null, status: EnoughPeopleStatus): string {
  if (status === 'enough' || status === 'no_plan') {
    if (!etaYm) return ETA_LABEL_UNKNOWN;
  }
  if (!etaYm) return ETA_LABEL_UNKNOWN;
  const p = parseYearMonth(etaYm);
  if (!p) return ETA_LABEL_UNKNOWN;
  return `Dự kiến đủ người: ${padMonth(p.month)}/${p.year}`;
}

export function deriveMetrics(input: {
  hasO2Cells: boolean;
  plannedNeed: number;
  filledCount: number;
  inPipelineCount: number;
  openYctdCount: number;
  etaYm: string | null;
}): MetricSlice {
  const planned_need = Math.max(0, Math.trunc(input.plannedNeed));
  const filled_count = Math.max(0, Math.trunc(input.filledCount));
  const in_pipeline_count = Math.max(0, Math.trunc(input.inPipelineCount));
  const open_yctd_count = Math.max(0, Math.trunc(input.openYctdCount));
  const gap_count = gapCount(planned_need, filled_count);
  const completion_pct = completionPct(planned_need, filled_count);
  const enough_people_status = enoughPeopleStatus({
    hasO2Cells: input.hasO2Cells,
    plannedNeed: planned_need,
    gap: gap_count,
    openYctdCount: open_yctd_count,
    inPipelineCount: in_pipeline_count,
  });
  const enough_people_eta =
    enough_people_status === 'enough' || enough_people_status === 'no_plan'
      ? input.etaYm
      : input.etaYm;
  // When enough/no_plan, ETA may still be null; label uses UNKNOWN when null + not enough/no_plan
  let enough_people_eta_label: string;
  if (enough_people_status === 'enough') {
    enough_people_eta_label = enough_people_eta
      ? formatEtaLabel(enough_people_eta, enough_people_status)
      : 'Đã đủ người theo kế hoạch kỳ';
  } else if (enough_people_status === 'no_plan') {
    enough_people_eta_label = ETA_LABEL_UNKNOWN;
  } else {
    enough_people_eta_label = formatEtaLabel(enough_people_eta, enough_people_status);
  }
  return {
    planned_need,
    filled_count,
    in_pipeline_count,
    open_yctd_count,
    gap_count,
    completion_pct,
    enough_people_status,
    enough_people_eta: enough_people_eta ?? null,
    enough_people_eta_label,
  };
}

export function emptyGuideForNoPlan(): typeof EMPTY_GUIDE_NO_PLAN {
  return { ...EMPTY_GUIDE_NO_PLAN };
}

export function parseIncludeYctd(include: string | undefined): boolean {
  if (!include?.trim()) return false;
  const parts = include
    .split(',')
    .map((p) => p.trim().toLowerCase())
    .filter(Boolean);
  if (parts.some((p) => p !== 'yctd')) {
    const bad = parts.find((p) => p !== 'yctd');
    if (bad) {
      throw new ApiException(
        HRM_REC_DASH_VAL_400,
        `include token không hợp lệ: ${bad}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  return parts.includes('yctd');
}

export function parsePageSize(raw: string | number | undefined, fallback = 50, max = 200): number {
  if (raw === undefined || raw === null || raw === '') return fallback;
  const n = Math.trunc(Number(raw));
  if (!Number.isFinite(n) || n < 1) {
    throw new ApiException(
      HRM_REC_DASH_VAL_400,
      'page_size phải là số nguyên ≥ 1',
      HttpStatus.BAD_REQUEST,
    );
  }
  return Math.min(n, max);
}

export function parsePage(raw: string | number | undefined, fallback = 1): number {
  if (raw === undefined || raw === null || raw === '') return fallback;
  const n = Math.trunc(Number(raw));
  if (!Number.isFinite(n) || n < 1) {
    throw new ApiException(
      HRM_REC_DASH_VAL_400,
      'page phải là số nguyên ≥ 1',
      HttpStatus.BAD_REQUEST,
    );
  }
  return n;
}

/**
 * O5 — earliest open YCTD target_month with remaining > 0.
 */
export function earliestEtaYm(
  rows: Array<{
    status?: string | null;
    headcount?: number | null;
    filled_count?: number | null;
    target_month?: string | Date | null;
  }>,
): string | null {
  let best: string | null = null;
  for (const row of rows) {
    if (!isOpenYctdStatus(row.status)) continue;
    const hc = Math.max(0, Math.trunc(Number(row.headcount ?? 0)));
    const filled = Math.max(0, Math.trunc(Number(row.filled_count ?? 0)));
    const remaining = Math.max(hc - filled, 0);
    if (remaining <= 0) continue;
    const ym = targetMonthToYm(row.target_month);
    if (!ym) continue;
    if (!best || ym < best) best = ym;
  }
  return best;
}

export function assertNoForbiddenFields(payload: unknown): void {
  if (payload == null || typeof payload !== 'object') return;
  const walk = (obj: unknown, path: string): void => {
    if (obj == null || typeof obj !== 'object') return;
    if (Array.isArray(obj)) {
      obj.forEach((item, i) => walk(item, `${path}[${i}]`));
      return;
    }
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      if (
        /offer_salary|salary_|c_and_b_|compensation_|bank_|mst|tax_code|cost_/i.test(k)
      ) {
        throw new Error(`FORBIDDEN dashboard field leaked: ${path}.${k}`);
      }
      walk(v, `${path}.${k}`);
    }
  };
  walk(payload, 'root');
}
