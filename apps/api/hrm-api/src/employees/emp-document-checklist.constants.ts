/**
 * @CODE-MEMORY
 * Screen:     EMP document checklist instance constants (F-CORE-CHK-01)
 * UC:         UC-BP-CORE-03 · FR-UC-BP-CORE-03 Diễn biến #1–#2
 * BR:         BR-BP-DOC-01 · BR-PLT-02/04/05 · O1–O12 CORE-03
 * SRS:        docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md · FR-UC-BP-CORE-03
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-CORE-03-CLUSTER-API-01.md §4.6
 * Purpose:    Status set + HRM-CORE-CHK-* mint codes — open DOC key (no closed IN).
 * WorkItem:   PO-HRM-MVP-GD1-CORE-03-CLUSTER-BE-01
 * Coded:      2026-08-09
 * must_keep:  missing|submitted|approved only · soft archive · RETAIN HRM-EMP-DOC-TYPE-UNKNOWN
 * SOLID:      Constants SRP — no I/O
 * LastVerified: po-hrm-mvp-gd1-core-03-cluster-be-01.spec.ts
 */

export const HRM_DOCUMENT_CHECKLIST_STATUSES = [
  'missing',
  'submitted',
  'approved',
] as const;
export type HrmDocumentChecklistStatus =
  (typeof HRM_DOCUMENT_CHECKLIST_STATUSES)[number];

export const HRM_CORE_CHK_200 = 'HRM-CORE-CHK-200';
export const HRM_CORE_CHK_201 = 'HRM-CORE-CHK-201';
export const HRM_CORE_CHK_202 = 'HRM-CORE-CHK-202';
export const HRM_CORE_CHK_VAL_400 = 'HRM-CORE-CHK-VAL-400';
export const HRM_CORE_CHK_CONFLICT_409 = 'HRM-CORE-CHK-CONFLICT-409';
export const HRM_CORE_CHK_404 = 'HRM-CORE-CHK-404';

/** Partial UQ name — must match ensureSchema. */
export const UQ_HRM_DOC_CHK_EMP_KEY_ACTIVE =
  'uq_hrm_document_checklist_item_emp_key_active';
