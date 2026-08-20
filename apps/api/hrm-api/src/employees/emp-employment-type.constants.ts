/**
 * @CODE-MEMORY
 * Screen:     EMP employment type open catalog constants
 * UC:         AC-PLT-EMP-04/05 · BR-PLT-02/04/05/06
 * BR:         DYNAMIC-LOCK — format-only employment_type_key · no closed 4-option enum
 * SRS:        docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DATA-01.md §3
 * API_DESIGN: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-VERTICAL-SA-01.md §3 F-EMP-CAT-ET-*
 * Purpose:    Status/source sets + error codes for emp_employment_type — FORBIDDEN key IN (full_time,…).
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-BE-01
 * Coded:      2026-08-07
 * must_keep:  soft-delete · dual SoT employment_types REF · U65 no seed · AC-PLT-EMP-01 XBOS position
 * SOLID:      Constants SRP — no I/O
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-be-01.md
 */

export const EMP_EMPLOYMENT_TYPE_STATUSES = ['active', 'retired'] as const;
export type EmpEmploymentTypeStatus =
  (typeof EMP_EMPLOYMENT_TYPE_STATUSES)[number];

/** Format-only — FORBIDDEN closed employment_type_key enum (BR-PLT-05). */
export const EMP_EMPLOYMENT_TYPE_KEY_FORMAT = /^[a-z][a-z0-9_]*$/;

export const EMP_EMPLOYMENT_TYPE_CATALOG_KIND = 'emp_employment_type' as const;

export type EmpEmploymentTypeSource =
  | 'emp_native'
  | 'group_ref'
  | 'emp_override';

/** Platform taxonomy (VAL-EMP-ET-02/03). */
export const HRM_PLT_CAT_CODE_INVALID = 'HRM-PLT-CAT-CODE-INVALID';
export const HRM_PLT_CAT_CODE_CONFLICT = 'HRM-PLT-CAT-CODE-CONFLICT';
export const HRM_EMP_ET_404 = 'HRM-EMP-ET-404';
/** Employment type ∉ effective when catalog >0 (VAL-EMP-ET-07 · BR-PLT-02). */
export const HRM_EMP_ET_UNKNOWN = 'HRM-EMP-ET-UNKNOWN';

/** Settings group REF partition key — dual SoT read (BR-PLT-06 · L-EMP-CAT-03). */
export const EMP_EMPLOYMENT_TYPES_GROUP_REF_KEY = 'employment_types';

/**
 * Docs-only bootstrap examples — NOT a product ceiling; NEVER enforce IN (…).
 * Alias `full-time` normalizes → `full_time` on write.
 */
export const EMP_EMPLOYMENT_TYPE_STARTER_KEYS = [
  'full_time',
  'part_time',
  'contract',
  'intern',
] as const;
