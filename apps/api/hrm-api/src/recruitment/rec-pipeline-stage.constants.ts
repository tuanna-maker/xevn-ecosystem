/**
 * @CODE-MEMORY
 * Screen:     REC pipeline stage open catalog constants
 * UC:         AC-PLT-REC-02..05 · BR-PLT-02/04/05/06
 * BR:         DYNAMIC-LOCK — format-only stage_key · no closed starter six enum
 * SRS:        docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-DATA-01.md §2
 * API_DESIGN: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-VERTICAL-SA-01.md §3 F-REC-CAT-*
 * Purpose:    Status/source sets + error codes for rec_pipeline_stage — FORBIDDEN key IN (six).
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-BE-01
 * Coded:      2026-08-07
 * must_keep:  soft-delete · open catalog · U65 no seed · JD DnD · IV one-active · hire→EMP · YCTD
 * SOLID:      Constants SRP — no I/O
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-rec-be-01.md
 */

export const REC_PIPELINE_STAGE_STATUSES = ['active', 'retired'] as const;
export type RecPipelineStageStatus =
  (typeof REC_PIPELINE_STAGE_STATUSES)[number];

/** Format-only — FORBIDDEN closed stage_key enum (BR-PLT-05 / starter six). */
export const REC_PIPELINE_STAGE_KEY_FORMAT = /^[a-z][a-z0-9_]*$/;

export const REC_PIPELINE_STAGE_CATALOG_KIND = 'rec_pipeline_stage' as const;

export type RecPipelineStageSource =
  | 'rec_native'
  | 'group_ref'
  | 'rec_override';

/** Platform taxonomy (VAL-REC-STG-02/03). */
export const HRM_PLT_CAT_CODE_INVALID = 'HRM-PLT-CAT-CODE-INVALID';
export const HRM_PLT_CAT_CODE_CONFLICT = 'HRM-PLT-CAT-CODE-CONFLICT';
export const HRM_REC_STG_404 = 'HRM-REC-STG-404';
/** Second active is_hired_outcome (VAL-REC-STG-05). */
export const HRM_REC_STG_HIRED_DUP = 'HRM-REC-STG-HIRED-DUP';
/** Retire sole hired-outcome without reassign (VAL-REC-STG-10). */
export const HRM_REC_STG_HIRED_REQUIRED = 'HRM-REC-STG-HIRED-REQUIRED';
/** Transition / create ∉ effective when catalog >0 (VAL-REC-STG-12 · BR-PLT-02). */
export const HRM_REC_STAGE_UNKNOWN = 'HRM-REC-STAGE-UNKNOWN';
/**
 * FR-UC-BP-REC-05 / O5 — reject-class transition thiếu note (VAL-REC-STG-08).
 * Mint ≠ UNKNOWN · ≠ IV DISALLOW.
 */
export const HRM_REC_STAGE_REJECT_REASON = 'HRM-REC-STAGE-REJECT-REASON';
/**
 * FR-UC-BP-REC-05 / O6 — reverse khi CFG recruitment.allow_reverse_stage=false.
 */
export const HRM_REC_STAGE_REVERSE_FORBIDDEN =
  'HRM-REC-STAGE-REVERSE-FORBIDDEN';
/**
 * FR-UC-BP-REC-05 / O4 — transition khi EFF=0 (preferred ≠ invent soft-allow).
 */
export const HRM_REC_STAGE_EMPTY_CATALOG = 'HRM-REC-STAGE-EMPTY-CATALOG';
/**
 * FR-UC-BP-REC-05 / VAL-24 — history INSERT fail → rollback stage.
 */
export const HRM_REC_STAGE_HISTORY_FAIL = 'HRM-REC-STAGE-HISTORY-FAIL';
/**
 * VAL-REC-CNS-05 — schedule when current stage allows_interview_schedule=false.
 * Deterministic 4xx ≠ HRM-REC-STAGE-UNKNOWN · ≠ HRM-REC-IV-409-ACTIVE (one-active RETAIN).
 */
export const HRM_REC_IV_STAGE_DISALLOW = 'HRM-REC-IV-400-STAGE-DISALLOW';
export const HRM_VAL_400 = 'HRM-VAL-400';

/** Tenant CFG — reverse stage transition (default true · API-01 §4.1). */
export const CFG_ALLOW_REVERSE_STAGE = 'recruitment.allow_reverse_stage';

/** Fallback reject-class keys when catalog is_reject_outcome absent (API-01 §4.2). */
export const REC_STAGE_REJECT_KEY_FALLBACK = [
  'rejected',
  'reject',
  'withdrawn',
] as const;

/**
 * Docs-only bootstrap examples — NOT a product ceiling; NEVER enforce IN (…).
 * ensureSchema may upsert these later; U65 UF must not treat as required seed.
 */
export const REC_PIPELINE_STAGE_STARTER_KEYS = [
  'screening',
  'interview',
  'offer',
  'hired',
  'rejected',
  'withdrawn',
] as const;
