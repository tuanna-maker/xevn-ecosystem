/**
 * @CODE-MEMORY
 * Screen:     HRM Tuyển dụng → Chấp nhận offer → hồ sơ NS (FR-07)
 * UC:         UC-BP-REC-07 · F-REC-HIRE-01
 * BR:         BR-BP-LC-01 · BR-BP-ONB-01 · VAL-REC-HIRE-*
 * SRS:        SRS_HRM_ENTERPRISE.md FR-UC-BP-REC-07 Diễn biến #1–#2
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-REC-07-CLUSTER-API-01.md §7
 * Purpose:    Mint + RETAIN hire envelope codes for accept-offer create/link.
 * WorkItem:   PO-HRM-MVP-GD1-REC-07-CLUSTER-BE-01
 * Coded:      2026-08-09
 * must_keep:  HIRE-400/409 RETAIN · PAY-403 · APP-02 sole hired-outcome · DENY Nest /rec · U65
 * LastVerified: po-hrm-mvp-gd1-rec-07-cluster-be-01.spec.ts
 */

/** CREATE success. */
export const HRM_REC_HIRE_201 = 'HRM-REC-HIRE-201';
/** LINK / idempotent re-accept success. */
export const HRM_REC_HIRE_200 = 'HRM-REC-HIRE-200';

/** Not offer-ready / ambiguous thin alias. */
export const HRM_REC_HIRE_OFFER_INVALID = 'HRM-REC-HIRE-OFFER-INVALID';
/** Offer cancelled after intent. */
export const HRM_REC_HIRE_CANCELLED = 'HRM-REC-HIRE-CANCELLED';
/** Missing required prefill (name/company[/email]). */
export const HRM_REC_HIRE_PREFILL_FAIL = 'HRM-REC-HIRE-PREFILL-FAIL';
/** True conflict — different active emp. */
export const HRM_REC_HIRE_DUP = 'HRM-REC-HIRE-DUP';

/** RETAIN — link-only missing emp (hire-employee-link). */
export const HRM_REC_HIRE_400 = 'HRM-REC-HIRE-400';
/** RETAIN — cross-company. */
export const HRM_REC_HIRE_409 = 'HRM-REC-HIRE-409';
/** Client payroll/payslip invent on accept. */
export const HRM_REC_PAY_403 = 'HRM-REC-PAY-403';

/** Default EMP status after accept CREATE (DATA-01 M11). */
export const EMP_STATUS_PENDING_DOCS = 'pending_docs';

/** Domain event name echoed in accept DTO. */
export const OFFER_ACCEPTED_EVENT = 'offer.accepted';

/** Stages treated as cancelled offer (O2). */
export const OFFER_CANCELLED_STAGES = [
  'cancelled',
  'withdrawn',
  'offer_cancelled',
] as const;

/** Body keys that force PAY-403 (prefix match for payslip_/payroll_). */
export const PAY_FORBIDDEN_BODY_KEYS = [
  'base_salary',
  'salary',
  'gross_salary',
  'net_salary',
  'payroll',
  'payslip',
  'payslip_id',
  'cb_package',
  'compensation',
] as const;
