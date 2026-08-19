/**
 * @CODE-MEMORY
 * Screen:     HRM Tuyển dụng → Thư tuyển + Đánh giá PV (FR-06)
 * UC:         UC-BP-REC-06 · F-REC-MAIL-01 · F-REC-APP-03
 * BR:         BR-BP-MAIL-01 · BR-BP-REC-IV-05 · VAL-REC-ME-*
 * SRS:        SRS_HRM_ENTERPRISE.md FR-UC-BP-REC-06 Diễn biến #1–#2
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-REC-06-CLUSTER-API-01.md §7
 * Purpose:    Mint codes + CFG keys + default mail template catalog for REC-06.
 * WorkItem:   PO-HRM-MVP-GD1-REC-06-CLUSTER-BE-01
 * Coded:      2026-08-09
 * must_keep:  APP-02 sole stage · DENY Nest /rec · pool eval ≠ FR-06 DONE · U65 no seed
 * LastVerified: po-hrm-mvp-gd1-rec-06-cluster-be-01.spec.ts
 */

/** Envelope success — mail enqueue. */
export const HRM_REC_MAIL_201 = 'HRM-REC-MAIL-201';
/** Envelope success — mail list/detail. */
export const HRM_REC_MAIL_200 = 'HRM-REC-MAIL-200';

export const HRM_REC_MAIL_CC_REQUIRED = 'HRM-REC-MAIL-CC-REQUIRED';
export const HRM_REC_MAIL_TEMPLATE_INACTIVE = 'HRM-REC-MAIL-TEMPLATE-INACTIVE';
export const HRM_REC_MAIL_NEO_REQUIRED = 'HRM-REC-MAIL-NEO-REQUIRED';
export const HRM_REC_MAIL_VAL_400 = 'HRM-REC-MAIL-VAL-400';
export const HRM_REC_MAIL_404 = 'HRM-REC-MAIL-404';
export const HRM_REC_MAIL_PROVIDER_FAIL = 'HRM-REC-MAIL-PROVIDER-FAIL';

/** Envelope success — eval list / soft-delete (RETAIN family). */
export const HRM_REC_EVAL_200 = 'HRM-REC-EVAL-200';
/** Envelope success — eval create (RETAIN family). */
export const HRM_REC_EVAL_201 = 'HRM-REC-EVAL-201';
/** Eval not found (RETAIN). */
export const HRM_REC_EVAL_404 = 'HRM-REC-EVAL-404';

export const HRM_REC_EVAL_PASSFAIL_REQUIRED = 'HRM-REC-EVAL-PASSFAIL-REQUIRED';
export const HRM_REC_EVAL_NEO_REQUIRED = 'HRM-REC-EVAL-NEO-REQUIRED';
export const HRM_REC_EVAL_ROUND_GATE = 'HRM-REC-EVAL-ROUND-GATE';
export const HRM_REC_EVAL_LEGACY_READONLY = 'HRM-REC-EVAL-LEGACY-READONLY';

/** CFG — allow persist result=pending draft (default false). */
export const CFG_EVAL_ALLOW_DRAFT = 'recruitment.eval.allow_draft';

/** CFG — optional JSON array of active mail template_code values. */
export const CFG_MAIL_TEMPLATE_CODES = 'recruitment.mail.template_codes';

/** GĐ1 default active mail templates when CFG unset. */
export const DEFAULT_MAIL_TEMPLATE_CODES = [
  'fail_cv',
  'interview_invite',
  'offer',
] as const;

export const MAIL_TEMPLATE_INTERVIEW_INVITE = 'interview_invite';

export const TERMINAL_IV_FOR_EVAL = [
  'completed',
  'cancelled',
  'no_show',
  'passed',
  'failed',
] as const;

export const ACTIVE_IV_FOR_EVAL = ['scheduled', 'confirmed'] as const;
