/**
 * @CODE-MEMORY
 * Screen:     /hr/recruitment — Dashboard Board (kanban only)
 * UC:         UC-HRM-30 · UC-HRM-REC-WF-04 (board)
 * BR:         UC-BP-REC-08 dashboard KPIs moved to Nest (see useRecruitmentNestDashboard)
 * SRS:        SRS FR-UC-BP-REC-08 — DENY FE domain aggregate for KH/%/ETA
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-REC-08-CLUSTER-API-01.md
 * Purpose:    Board subtab only — kanban candidates. Dashboard metrics SoT = Nest GET.
 * WorkItem:   PO-HRM-MVP-GD1-REC-08-CLUSTER-FE-01
 * Coded:      2026-08-09
 * Callers:    pages/Recruitment.tsx board subtab
 * Callees:    useKanbanCandidates
 * FEActions:  drag stage · hire picker (board)
 * Impact:     Re-adding job-postings KH aggregate = FAIL AC-REC-08-09
 * must_keep:  Board kanban · hire bind · honesty false
 * SOLID:      Hook SRP — no dashboard formula
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-rec-08-cluster-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-REC-08-CLUSTER-FE-01
 * change_mode: UPGRADE
 * What: REMOVE FE aggregator domain SoT from this hook (Nest owns dashboard)
 * Why: BA O1–O10 · Nest RecruitmentDashboardService owns formulas
 * must_keep: useKanbanCandidates for Board tab
 */

import { useKanbanCandidates } from '@/hooks/useKanbanCandidates';

/**
 * Board-only data for Recruitment dashboard subtab «Board».
 * Metrics / funnel / KH → useRecruitmentNestDashboard (Nest DTO bind).
 */
export function useRecruitmentDashboard(enabled: boolean) {
  const {
    candidates,
    loading: candidatesLoading,
    stats,
    updateCandidateStage,
    refetch,
  } = useKanbanCandidates();

  return {
    candidates,
    candidatesLoading,
    stats,
    updateCandidateStage,
    refetch,
    loading: candidatesLoading && enabled,
  };
}
