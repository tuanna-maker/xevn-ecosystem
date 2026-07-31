/**
 * @CODE-MEMORY
 * Screen:     /hr/recruitment — WF lock + SPAWN-MISSING helpers
 * UC:         UC-HRM-REC-WF-02..05 · UC-HRM-22 · UC-HRM-30 · UC-HRM-REC-WF-01
 * BR:         BR-REC-WF-02 · BR-REC-WF-08 · BR-REC-WF-09 · BR-REC-WF-14
 * SRS:        docs/hrm/SRS.md §16.5 (delta) · docs/program/deltas/XBOS_HRM_REC_WF_BRIDGE_BA_DELTA.md
 * TechSpec:   docs/decisions/ADR-XBOS-HRM-RECRUITMENT-WORKFLOW-BRIDGE.md §3–§8
 * DataContract: docs/program/deltas/XBOS_HRM_REC_WF_BRIDGE_DATA_CONTRACT.md §2–§6
 * Purpose:    Detect active workflow_instance_id lock (409 LOCKED) and SPAWN-MISSING
 *             banner conditions for plan / requisition / candidate pipeline.
 * WorkItem:   XHRM-REC-WF-FE-01 · XHRM-REC-WF-FE-CANVAS-01
 * Coded:      2026-07-19
 *
 * Callers:
 *   - JobRequisitionsTab · CandidatesTab · useKanbanCandidates · useRecruitmentPlans · Recruitment.tsx
 *
 * Callees:
 *   - Pure helpers only
 *
 * FE-Actions:
 *   | Submit WF returns null instance | isRecruitmentSpawnMissing | show SPAWN-MISSING banner |
 *   | PATCH stage while instance active | isRecruitmentWorkflowLocked | disable direct UI |
 *
 * Impact:     Silent approve when spawn missing violates BR-REC-WF-02
 * must_keep:  UF-HRM-12 (no instance → local PATCH allowed); AC-CD-F6-* stage set unchanged
 * change_mode: UPGRADE
 * SOLID:      SRP — WF UI predicates only; no network
 * LastVerified: recruitmentWorkflowUi.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-07-19
 * WorkItem: XHRM-REC-WF-FE-CANVAS-01
 * What: SPAWN-MISSING body cites three normative codes + canvas path hint (J-REC-WF-01)
 * Why: QC GWC — admin must create defs via FE before J-03/06 inbox
 * must_keep: Prior lock/spawn helpers; F6 columns; leave bridge untouched
 *
 * @CODE-MEMORY-CHANGE 2026-08-01 D-REC-13-S2-SUBMIT-INBOX-01
 * change_mode: ADD
 * What: canSubmitRequisitionWorkflow — visible Gửi duyệt QT after YCTD create (open, no wi)
 * Why: QC residual R-REC-13-S2-SUBMIT-INBOX — submit CTA missing on list after POST 201
 * must_keep: UF-HRM-12 create+F5; J-REC-WF historic greens; U65 no seed
 */

export const HRM_REC_WF_LOCKED_CODE = 'HRM-REC-WF-LOCKED';
export const HRM_REC_WF_SPAWN_MISSING_CODE = 'HRM-REC-WF-SPAWN-MISSING';

/** Normative ADR §3 Q1 — mirror portal presets (display only; SoT is XBOS canvas). */
export const HRM_REC_WF_REQUIRED_CODES = [
  'hrm_recruitment_plan_approval',
  'hrm_requisition_approval',
  'hrm_candidate_pipeline',
] as const;

const PLAN_TERMINAL = new Set(['approved', 'rejected', 'cancelled']);
const REQUISITION_TERMINAL = new Set(['open', 'approved', 'rejected', 'closed', 'cancelled']);
const CANDIDATE_TERMINAL = new Set(['hired', 'rejected']);

/** Statuses that must not offer submit-workflow (already closed or terminal). */
const REQUISITION_SUBMIT_BLOCKED = new Set(['closed', 'rejected', 'cancelled', 'approved']);

export type RecruitmentWfEntity = 'plan' | 'requisition' | 'candidate';

export type RecruitmentWfSpawnResult = {
  workflow_instance_id?: string | null;
  workflowInstanceId?: string | null;
  spawnMissing?: boolean;
  spawn?: { workflowInstanceId?: string | null } | null;
};

/** Data contract §4.1 — active instance + non-terminal → lock direct stage/status PATCH. */
export function isRecruitmentWorkflowLocked(
  workflowInstanceId: string | null | undefined,
  statusOrStage: string | null | undefined,
  entity: RecruitmentWfEntity,
): boolean {
  if (!workflowInstanceId?.trim()) return false;
  const value = (statusOrStage ?? '').trim().toLowerCase();
  if (entity === 'plan') return !PLAN_TERMINAL.has(value);
  if (entity === 'requisition') return !REQUISITION_TERMINAL.has(value);
  return !CANDIDATE_TERMINAL.has(value);
}

/**
 * UF-HRM-12 / J-REC-WF-02 — after create (default `open`, no instance) show «Gửi duyệt QT».
 * Hide when instance already exists or status is terminal/closed.
 */
export function canSubmitRequisitionWorkflow(
  workflowInstanceId: string | null | undefined,
  status: string | null | undefined,
): boolean {
  if (workflowInstanceId?.trim()) return false;
  const value = (status ?? '').trim().toLowerCase();
  if (!value) return true;
  return !REQUISITION_SUBMIT_BLOCKED.has(value);
}

/**
 * Prefer explicit `spawnMissing` from BE; else empty `spawn.workflowInstanceId`.
 * Idempotent spawn with id → not missing. Entity may still be 2xx (BR-REC-WF-02).
 */
export function detectRecruitmentSpawnMissing(result: RecruitmentWfSpawnResult | null | undefined): boolean {
  if (!result) return false;
  if (typeof result.spawnMissing === 'boolean') return result.spawnMissing;
  if (result.spawn != null && !result.spawn.workflowInstanceId?.trim()) return true;
  return false;
}

/** Alias for banner gates. */
export function isRecruitmentSpawnMissing(result: RecruitmentWfSpawnResult | null | undefined): boolean {
  return detectRecruitmentSpawnMissing(result);
}

export const RECRUITMENT_SPAWN_MISSING_TITLE_VI = 'Không tạo được quy trình phê duyệt';

export const RECRUITMENT_SPAWN_MISSING_BODY_VI =
  'Hồ sơ đã lưu ở trạng thái chờ duyệt nhưng chưa gắn quy trình. Vào Command Center → Cấu hình → Hệ thống quy trình → Mẫu QT tuyển dụng HRM để tạo/kích hoạt mẫu rồi gửi lại — không duyệt tay trên HRM.';

export const RECRUITMENT_WF_LOCKED_HINT_VI =
  'Đang chạy quy trình phê duyệt — duyệt/từ chối trên Inbox; không đổi giai đoạn/trạng thái trực tiếp trên HRM.';
