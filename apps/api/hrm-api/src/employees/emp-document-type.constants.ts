/**
 * @CODE-MEMORY
 * Screen:     EMP document type open catalog constants
 * UC:         AC-PLT-EMP-02/03/06 · BR-PLT-02/04/05 · FR-UC-BP-CORE-03
 * BR:         DYNAMIC-LOCK — format-only document_type_key · no closed starter enum
 * SRS:        docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DATA-01.md §2
 * API_DESIGN: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-VERTICAL-SA-01.md §3 F-EMP-CAT-DOC-*
 * Purpose:    Status/source sets + error codes for emp_document_type — FORBIDDEN key IN (cccd,…).
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-BE-01
 * Coded:      2026-08-07
 * must_keep:  soft-delete · open catalog · U65 no seed · CORE-01/UF-HRM-02/SI · AC-PLT-EMP-01 XBOS position
 * SOLID:      Constants SRP — no I/O
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-be-01.md
 */

export const EMP_DOCUMENT_TYPE_STATUSES = ['active', 'retired'] as const;
export type EmpDocumentTypeStatus = (typeof EMP_DOCUMENT_TYPE_STATUSES)[number];

/** Format-only — FORBIDDEN closed document_type_key enum (BR-PLT-05). */
export const EMP_DOCUMENT_TYPE_KEY_FORMAT = /^[a-z][a-z0-9_]*$/;

export const EMP_DOCUMENT_TYPE_CATALOG_KIND = 'emp_document_type' as const;

export type EmpDocumentTypeSource = 'emp_native' | 'group_ref' | 'emp_override';

/** Platform taxonomy (VAL-EMP-DOC-02/03). */
export const HRM_PLT_CAT_CODE_INVALID = 'HRM-PLT-CAT-CODE-INVALID';
export const HRM_PLT_CAT_CODE_CONFLICT = 'HRM-PLT-CAT-CODE-CONFLICT';
export const HRM_EMP_DOC_404 = 'HRM-EMP-DOC-404';
/** Checklist / doc mutate key ∉ effective when catalog >0 (VAL-EMP-DOC-07 · BR-PLT-02). */
export const HRM_EMP_DOC_TYPE_UNKNOWN = 'HRM-EMP-DOC-TYPE-UNKNOWN';

/**
 * Docs-only bootstrap examples — NOT a product ceiling; NEVER enforce IN (…).
 * Optional ensure upsert later; U65 UF must not treat as required seed.
 */
export const EMP_DOCUMENT_TYPE_STARTER_KEYS = [
  'cccd',
  'cv',
  'degree',
  'health_cert',
  'labor_book',
] as const;
