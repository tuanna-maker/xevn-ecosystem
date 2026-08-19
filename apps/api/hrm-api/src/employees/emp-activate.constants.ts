/**
 * @CODE-MEMORY
 * Screen:     EMP activate spine constants (F-CORE-ACT-01)
 * UC:         UC-BP-CORE-07 · FR-UC-BP-CORE-07 Diễn biến #1–#2 · BR-BP-LC-02
 * BR:         O1–O12 CORE-07 · U19 list=get=activate
 * SRS:        docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md · FR-UC-BP-CORE-07
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-CORE-07-CLUSTER-API-01.md §4.6
 * Purpose:    Mint HRM-EMP-ACT-* · status spine pending_docs→active · GATE 409 code.
 * WorkItem:   PO-HRM-MVP-GD1-CORE-07-CLUSTER-BE-01
 * Coded:      2026-08-09
 * must_keep:  Nest /core DENY · no completeness table · soft≠CORE-06 DONE · checklist≠DONE · free PATCH≠DONE
 * SOLID:      Constants SRP — no I/O
 * LastVerified: po-hrm-mvp-gd1-core-07-cluster-be-01.spec.ts
 */

export const EMP_STATUS_PENDING_DOCS = 'pending_docs';
export const EMP_STATUS_ACTIVE = 'active';

export const HRM_EMP_ACT_200 = 'HRM-EMP-ACT-200';
export const HRM_EMP_ACT_400 = 'HRM-EMP-ACT-400';
export const HRM_EMP_ACT_CHECKLIST_INCOMPLETE =
  'HRM-EMP-ACT-CHECKLIST-INCOMPLETE';
export const HRM_EMP_ACT_ILLEGAL_TRANSITION = 'HRM-EMP-ACT-ILLEGAL-TRANSITION';

/** Readable ATT-12 peer event type — emit only · OUT invent ATT enroll DONE. */
export const EMPLOYEE_ACTIVATED_EVENT = 'employee.activated';

/** Locale effective_date (vi-VN display/entry). */
export const EMP_ACT_EFFECTIVE_DATE_RE = /^(\d{2})\/(\d{2})\/(\d{4})$/;
