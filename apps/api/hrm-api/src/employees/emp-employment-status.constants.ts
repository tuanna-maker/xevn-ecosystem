/**
 * @CODE-MEMORY
 * Screen:     EMP employment status open catalog constants
 * UC:         AC-PLT-EMP-STATUS-01* · BR-PLT-02/04/05/06 · L-EMP-ST-01..14
 * BR:         DYNAMIC-LOCK — format-only status_key · no closed active|inactive enum CHECK
 * SRS:        docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-BA-01.md §3
 * TechSpec:   docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-SA-01.md §5–§6
 * DB_DESIGN:  docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-DATA-01.md §2
 * API_DESIGN: F-EMP-CAT-ST-* · F-EMP-ST-CNS-01 · HRM-EMP-STATUS-KEY
 * Purpose:    Status/source sets + error codes for emp_employment_status — FORBIDDEN key IN (active,inactive,…).
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-BE-01
 * Coded:      2026-08-08
 * must_keep:  soft-delete · dual SoT employee_statuses/employment_statuses REF · U65 no seed · DOC/ET seals · EMP-CUSTOM/EXT
 * SOLID:      Constants SRP — no I/O
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-status-catalog-be-01.md
 */

export const EMP_EMPLOYMENT_STATUS_STATUSES = ['active', 'retired'] as const;
export type EmpEmploymentStatusRowStatus =
  (typeof EMP_EMPLOYMENT_STATUS_STATUSES)[number];

/** Format-only — FORBIDDEN closed status_key enum (BR-PLT-05 · L-EMP-ST-04). */
export const EMP_EMPLOYMENT_STATUS_KEY_FORMAT = /^[a-z][a-z0-9_]*$/;

export const EMP_EMPLOYMENT_STATUS_CATALOG_KIND =
  'emp_employment_status' as const;

export type EmpEmploymentStatusSource =
  | 'emp_native'
  | 'group_ref'
  | 'emp_override';

/** Platform taxonomy (VAL-EMP-ST-CAT-*). */
export const HRM_PLT_CAT_CODE_INVALID = 'HRM-PLT-CAT-CODE-INVALID';
export const HRM_PLT_CAT_CODE_CONFLICT = 'HRM-PLT-CAT-CODE-CONFLICT';
export const HRM_EMP_ST_404 = 'HRM-EMP-ST-404';
/** Employee status ∉ effective when catalog >0 (F-EMP-ST-CNS-01 · VAL-EMP-ST-CNS-01). */
export const HRM_EMP_STATUS_KEY = 'HRM-EMP-STATUS-KEY';

/** Settings group REF partition keys — dual SoT merge-read (BR-PLT-06 · L-EMP-ST-03). */
export const EMP_EMPLOYMENT_STATUS_GROUP_REF_KEYS = [
  'employee_statuses',
  'employment_statuses',
] as const;

/**
 * Docs-only bootstrap examples — NOT a product ceiling; NEVER enforce IN (…).
 * Alias normalize: hyphen→underscore on write.
 */
export const EMP_EMPLOYMENT_STATUS_STARTER_KEYS = [
  'active',
  'probation',
  'inactive',
  'on_leave',
  'resigned',
  'terminated',
] as const;
