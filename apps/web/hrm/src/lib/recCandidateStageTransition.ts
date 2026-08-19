/**
 * @CODE-MEMORY
 * Screen:     /hr/recruitment — Đổi trạng thái UV theo YCTD + timeline (FR-UC-BP-REC-05)
 * UC:         UC-BP-REC-05 · AC-REC-05-01..05 · ALT-01 · EX-01..03
 * BR:         BR-BP-CV-02 · BR-REC-STG-HOME/EFF/REJECT/PATH · O1–O6
 * SRS:        docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-REC-05 Diễn biến #0b–#2
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-REC-05-CLUSTER-API-01.md F-REC-APP-02 · F-REC-APP-02-TL
 * Purpose:    Pure helpers — YCTD-bound Lane A transition SoT, reject-class detect, reverse ordinal,
 *             Lane A id resolve; cấm Nest /rec · pool stage as FR-05 SoT · invent timeline.
 * WorkItem:   PO-HRM-MVP-GD1-REC-05-CLUSTER-FE-01
 * Coded:      2026-08-09
 * Callers:    CandidatesTab · CandidateStageTransitionDialog · CandidateStageHistoryPanel · CandidateDetailView
 * Callees:    hasCandidateYctdLink (peer)
 * must_keep:  physical /recruitment/candidates/:id/transitions · EFF picker · U65 · honesty false · C-SLICE
 *             · RETAIN pool mutate for non-YCTD INT-01 · DENY claim pool = FR-05 DONE
 * SOLID:      Pure SRP — UI dialogs consume helpers only
 * solid_convention_ack: FE không invent history SoT; bind display-ready DTO từ BE
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-rec-05-cluster-fe-01.md
 */

import { hasCandidateYctdLink, type CandidateYctdDisplayFields } from '@/lib/candidateUvYctdUi';
import { REC_PIPELINE_STAGE_EMPTY_CTA_VI } from '@/lib/recPipelineStageCatalog';

/** Fallback reject keys when catalog flag absent (API-01 §4.2). */
export const REC_STAGE_REJECT_KEY_FALLBACK = new Set(['rejected', 'reject', 'withdrawn']);

export const REC_STAGE_TRANSITION_EMPTY_CTA_VI = REC_PIPELINE_STAGE_EMPTY_CTA_VI;

export const REC_STAGE_REJECT_REASON_REQUIRED_VI =
  'Từ chối / rút hồ sơ bắt buộc nhập lý do trước khi lưu.';

export const REC_STAGE_TIMELINE_EMPTY_VI =
  'Chưa có lịch sử đổi trạng thái trên liên kết UV–YCTD này.';

export const REC_STAGE_TRANSITION_SUCCESS_VI =
  'Đã cập nhật giai đoạn pipeline và ghi lịch sử trạng thái.';

export type RecStageCatalogFlags = {
  stageKey: string;
  nameVi?: string | null;
  sortOrder?: number | null;
  isRejectOutcome?: boolean | null;
  isHiredOutcome?: boolean | null;
};

export type RecStageTransitionCandidate = CandidateYctdDisplayFields & {
  id: string;
  full_name?: string | null;
  email?: string | null;
  list_lane?: 'pool' | 'spine' | string | null;
  /** Lane A spine id when list row is pool-enriched by email (ADD merge). */
  recruitment_candidate_id?: string | null;
  stage?: string | null;
  status?: string | null;
};

/** O3 — FR-05 transition SoT only when UV gắn YCTD (Lane A link). */
export function isYctdBoundStageHome(row: CandidateYctdDisplayFields): boolean {
  return hasCandidateYctdLink(row);
}

/**
 * Resolve Lane A candidate id for POST transitions / GET stage-history.
 * Spine list uses row.id; pool-enriched attaches recruitment_candidate_id from spine merge.
 */
export function resolveLaneACandidateIdForTransition(
  row: RecStageTransitionCandidate,
): string | null {
  const spineId = (row.recruitment_candidate_id ?? '').trim();
  if (spineId) return spineId;
  if (row.list_lane === 'spine') {
    const id = (row.id ?? '').trim();
    return id || null;
  }
  if (isYctdBoundStageHome(row)) {
    const id = (row.id ?? '').trim();
    return id || null;
  }
  return null;
}

/** Use F-REC-APP-02 when YCTD-bound; else RETAIN pool stage (≠ FR-05 SoT claim). */
export function shouldUseLaneAStageTransition(row: RecStageTransitionCandidate): boolean {
  return isYctdBoundStageHome(row) && Boolean(resolveLaneACandidateIdForTransition(row));
}

export function isRecStageRejectOutcome(
  items: readonly RecStageCatalogFlags[],
  toStage: string | null | undefined,
  catalogCount: number,
): boolean {
  const key = (toStage ?? '').trim();
  if (!key) return false;
  if (catalogCount > 0 && items.length > 0) {
    const row = items.find(
      (i) => i.stageKey === key || i.stageKey.toLowerCase() === key.toLowerCase(),
    );
    if (row) return row.isRejectOutcome === true;
  }
  return REC_STAGE_REJECT_KEY_FALLBACK.has(key.toLowerCase());
}

function stageSortOrder(
  items: readonly RecStageCatalogFlags[],
  stageKey: string | null | undefined,
): number | null {
  const key = (stageKey ?? '').trim();
  if (!key) return null;
  const row = items.find(
    (i) => i.stageKey === key || i.stageKey.toLowerCase() === key.toLowerCase(),
  );
  if (!row || typeof row.sortOrder !== 'number') return null;
  return row.sortOrder;
}

/**
 * API-01 §4.1 — reverse when to_stage has strictly lower sort_order than from_stage.
 * Missing ordinals → not reverse (BE CFG still authoritative).
 */
export function isRecStageReverseTransition(
  items: readonly RecStageCatalogFlags[],
  fromStage: string | null | undefined,
  toStage: string | null | undefined,
): boolean {
  const fromOrder = stageSortOrder(items, fromStage);
  const toOrder = stageSortOrder(items, toStage);
  if (fromOrder === null || toOrder === null) return false;
  return toOrder < fromOrder;
}

export function formatStageHistoryChangedAt(iso: string | null | undefined): string {
  if (!iso || !String(iso).trim()) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
}
