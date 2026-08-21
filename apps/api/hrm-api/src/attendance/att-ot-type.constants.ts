/**
 * @CODE-MEMORY
 * Screen:     ATT OT-type (loại tăng ca) open catalog constants
 * UC:         AC-PLT-ATT-OT-01* · BR-PLT-02/04/05/06 · L-ATT-OT-01..15
 * BR:         DYNAMIC-LOCK — format-only code · no closed weekday|weekend|holiday enum CHECK
 * SRS:        docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-BA-01.md §3–§5
 * TechSpec:   docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-SA-01.md Option B
 * DB_DESIGN:  docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-DATA-01.md §2
 * API_DESIGN: F-ATT-CAT-OT-01/02 · EFF · HRM-ATT-OT-TYPE-KEY
 * Purpose:    Status/source/error codes — FORBIDDEN code IN (weekday,weekend,holiday).
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-BE-01
 * Coded:      2026-08-08
 * must_keep:  soft-delete · open catalog · U65 no seed · leave/code/worksite/shifts seals ·
 *             default_coeff ≠ payroll formula LIVE · FORBIDDEN fold into work_shifts/leave
 * SOLID:      Constants SRP — no I/O
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-ot-type-catalog-be-01.md
 */

/** Row lifecycle — DATA §2.1 / chk_att_ot_type_row_status. */
export const ATT_OT_TYPE_STATUSES = ['active', 'inactive'] as const;
export type AttOtTypeRowStatus = (typeof ATT_OT_TYPE_STATUSES)[number];

/** Format-only — FORBIDDEN closed code enum (BR-PLT-05 · L-ATT-OT-04). */
export const ATT_OT_TYPE_KEY_FORMAT = /^[a-z][a-z0-9_]*$/;

export const ATT_OT_TYPE_CATALOG_KIND = 'att_ot_type' as const;

export type AttOtTypeSource = 'att_native';

export const HRM_ATT_OT_404 = 'HRM-ATT-OT-404';
export const HRM_ATT_OT_409 = 'HRM-ATT-OT-409';
/** Admin validation (empty name, bad format, coeff < 0). */
export const HRM_ATT_OT_VAL = 'HRM-ATT-OT-VAL';
/** Consumer invent overtime_type when EFF > 0 (F-ATT-CAT-OT CNS · VAL-ATT-OT-CNS-01). */
export const HRM_ATT_OT_TYPE_KEY = 'HRM-ATT-OT-TYPE-KEY';
export const HRM_PLT_CAT_CODE_CONFLICT = 'HRM-PLT-CAT-CODE-CONFLICT';

/**
 * Docs-only bootstrap examples — NOT a product ceiling; NEVER enforce IN (…).
 * U65: ensureSchema does NOT seed these.
 */
export const ATT_OT_TYPE_STARTER_KEYS = [
  'weekday',
  'weekend',
  'holiday',
] as const;
