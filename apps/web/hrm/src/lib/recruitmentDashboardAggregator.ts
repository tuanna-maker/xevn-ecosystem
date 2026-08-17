/**
 * @CODE-MEMORY
 * Screen:     (legacy helpers — NOT dashboard SoT)
 * UC:         UC-BP-REC-08 — DENY as KH/%/ETA SoT
 * BR:         BR-REC-08-BE-FORMULA · O8/O10
 * SRS:        SRS FR-UC-BP-REC-08
 * TechSpec:   PO-HRM-MVP-GD1-REC-08-CLUSTER-API-01 — Nest owns formulas
 * Purpose:    Deprecated chart type aliases + cost empty stub. Dashboard MUST use Nest bind.
 * WorkItem:   PO-HRM-MVP-GD1-REC-08-CLUSTER-FE-01
 * Coded:      2026-08-09
 * Callers:    RecruitmentBarChart / LineChart type imports only
 * Callees:    (none domain)
 * FEActions:  none — SoT disabled
 * Impact:     Calling sumActiveJobPostingHeadcount for dashboard KH = FAIL
 * must_keep:  formatRecruitmentCostVnd never invents when null; buildRecruitmentCostSummary.hasData=false
 * SOLID:      Types retained for chart presentational components
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-rec-08-cluster-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-REC-08-CLUSTER-FE-01
 * change_mode: UPGRADE
 * What: Disable domain aggregation as SoT; keep chart row types + cost empty stub (O10)
 * Why: Nest GET /recruitment/dashboard* is sole KH/TT/%/funnel/ETA SoT
 * must_keep: no VND invent; chart components compile
 */

/** @deprecated Dashboard SoT = Nest DTO — use RecDashBarChartRow from recruitmentDashboardNestBind */
export interface RecruitmentBarChartRow {
  name: string;
  value: number;
  color: string;
}

/** @deprecated Dashboard SoT = Nest DTO — use RecDashLineChartRow from recruitmentDashboardNestBind */
export interface RecruitmentLineChartRow {
  month: string;
  value: number;
}

export interface RecruitmentCostSummary {
  avgCostPerCandidate: number | null;
  costTopCV: number | null;
  cost24h: number | null;
  hasData: boolean;
}

/** O10 — never invent VND. Always empty. */
export function buildRecruitmentCostSummary(): RecruitmentCostSummary {
  return {
    avgCostPerCandidate: null,
    costTopCV: null,
    cost24h: null,
    hasData: false,
  };
}

export function formatRecruitmentCostVnd(value: number | null | undefined): string | null {
  if (value == null || !Number.isFinite(value) || value <= 0) return null;
  return `${Math.round(value).toLocaleString('vi-VN')} đ`;
}

/**
 * @deprecated DENY as dashboard KH SoT (AC-REC-08-09). Nest planned_need owns KH.
 * Retained only so accidental imports fail loudly in vitest source audits.
 */
export function sumActiveJobPostingHeadcount(): number {
  return 0;
}
