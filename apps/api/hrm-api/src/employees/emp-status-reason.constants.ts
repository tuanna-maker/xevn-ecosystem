/**
 * @CODE-MEMORY
 * Screen:     EMP status reason open catalog constants (companion)
 * UC:         AC-PLT-EMP-STATUS-01e · BR-PLT-EMP-ST-05/07 · L-EMP-ST-02
 * BR:         Format-only reason_key · invent → HRM-EMP-STATUS-REASON-KEY when required / EFF>0
 * SRS:        docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-BA-01.md §3
 * TechSpec:   docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-SA-01.md §6.2–6.3
 * DB_DESIGN:  docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-DATA-01.md §3
 * API_DESIGN: F-EMP-CAT-STR-* · F-EMP-ST-CNS-02
 * Purpose:    Constants for emp_status_reason — FORBIDDEN closed reason_key IN (…) · no hard FK to status.
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-BE-01
 * Coded:      2026-08-08
 * must_keep:  soft-delete · U65 empty [] OK · orthogonal to DOC/ET/custom · no mega-EAV
 * SOLID:      Constants SRP — no I/O
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-status-catalog-be-01.md
 */

export const EMP_STATUS_REASON_STATUSES = ['active', 'retired'] as const;
export type EmpStatusReasonRowStatus =
  (typeof EMP_STATUS_REASON_STATUSES)[number];

export const EMP_STATUS_REASON_KEY_FORMAT = /^[a-z][a-z0-9_]*$/;

export const EMP_STATUS_REASON_CATALOG_KIND = 'emp_status_reason' as const;

export const HRM_EMP_STR_404 = 'HRM-EMP-STR-404';
/** Status reason invent when required / reason EFF>0 (F-EMP-ST-CNS-02). */
export const HRM_EMP_STATUS_REASON_KEY = 'HRM-EMP-STATUS-REASON-KEY';

/** Docs-only bootstrap — NOT ceiling. */
export const EMP_STATUS_REASON_STARTER_KEYS = [
  'resign_personal',
  'resign_better_offer',
  'term_performance',
  'term_redundancy',
] as const;
