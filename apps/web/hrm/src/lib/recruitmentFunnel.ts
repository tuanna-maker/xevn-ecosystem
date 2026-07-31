/**
 * @CODE-MEMORY
 * Screen:     /hr/recruitment — Pipeline funnel (Dashboard + embed)
 * UC:         UC-HRM-RC-09 · UC-HRM-22 · UC-HRM-30 · UC-HRM-REC-WF-05
 * BR:         BR-CD-F6-03 · BR-DQ-01 · BR-REC-WF-04
 * SRS:        docs/hrm/SRS.md §13 UC-HRM-22 · §14 UC-HRM-30 · §16.5 delta
 * TechSpec:   docs/program/deltas/CUSTOMER_DEMO_HRM_DELTA_20260620.md §6.3–6.5
 * DataContract: docs/program/deltas/XBOS_HRM_REC_WF_BRIDGE_DATA_CONTRACT.md §2.1
 * Purpose:    Normalize candidate stages to F6 funnel (6 columns) and aggregate
 *             counts from live API rows — never invent 1OFFICE / hardcoded KPI.
 *             After WF step callback, chips bind the synced `candidate.stage`.
 * WorkItem:   CD-FB-09-RECRUIT · XHRM-REC-WF-FE-01
 * Coded:      2026-07-19
 *
 * Callers:
 *   - Recruitment.tsx → CandidatePipelineFunnel
 *   - useRecruitmentDashboard / portal embed helpers
 *
 * Callees:
 *   - Pure functions only (no network)
 *
 * FE-Actions:
 *   | Aggregate stages | buildRecruitmentFunnelCounts | mapRecruitmentFunnelStage |
 *
 * Impact:     Wrong mapping → dashboard counts diverge from kanban / AC-CD-F6-03
 * must_keep:  Six normative statuses; applied→new alias; no mock org labels
 * SOLID:      SRP — stage taxonomy + count aggregation only
 * LastVerified: recruitmentFunnel.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-07-19 XHRM-REC-WF-FE-01
 * Cite UC-HRM-REC-WF-05 — funnel remains 6 F6 columns; counts reflect post-callback
 * API stage. Do not REPLACE enum; applied→new display alias only.
 */

/** Normative F6 candidate funnel statuses (delta §6.3). */
export const RECRUITMENT_FUNNEL_STAGES = [
  'new',
  'screening',
  'interview',
  'offer',
  'hired',
  'rejected',
] as const;

export type RecruitmentFunnelStage = (typeof RECRUITMENT_FUNNEL_STAGES)[number];

export const RECRUITMENT_FUNNEL_LABEL_VI: Record<RecruitmentFunnelStage, string> = {
  new: 'Chờ CV / Mới',
  screening: 'Sàng lọc',
  interview: 'Phỏng vấn',
  offer: 'Đề nghị',
  hired: 'Đã tuyển',
  rejected: 'Từ chối',
};

export type RecruitmentFunnelCounts = Record<RecruitmentFunnelStage, number> & {
  total: number;
};

/**
 * Map pool/application stage strings onto normative funnel columns.
 * Legacy `applied` maps to `new` (waiting CV).
 */
export function mapRecruitmentFunnelStage(raw: string | null | undefined): RecruitmentFunnelStage {
  const stage = (raw ?? '').trim().toLowerCase();
  if (stage === 'applied' || stage === 'new' || stage === '') return 'new';
  if (stage === 'screening') return 'screening';
  if (stage === 'interview') return 'interview';
  if (stage === 'offer') return 'offer';
  if (stage === 'hired') return 'hired';
  if (stage === 'rejected') return 'rejected';
  return 'new';
}

export function buildEmptyFunnelCounts(): RecruitmentFunnelCounts {
  return {
    new: 0,
    screening: 0,
    interview: 0,
    offer: 0,
    hired: 0,
    rejected: 0,
    total: 0,
  };
}

export function buildRecruitmentFunnelCounts(
  rows: Array<{ stage?: string | null }>,
): RecruitmentFunnelCounts {
  const counts = buildEmptyFunnelCounts();
  for (const row of rows) {
    const key = mapRecruitmentFunnelStage(row.stage);
    counts[key] += 1;
    counts.total += 1;
  }
  return counts;
}

export function funnelStageToKanbanStage(stage: RecruitmentFunnelStage): string {
  if (stage === 'new') return 'applied';
  return stage;
}
