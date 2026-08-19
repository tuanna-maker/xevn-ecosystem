/**
 * @CODE-MEMORY
 * Screen:     DEC / QSĐ decision-type open catalog constants
 * UC:         AC-PLT-DEC-01..06 · BR-PLT-02/04/05/06 · BR-PLT-DEC-*
 * BR:         DYNAMIC-LOCK — format-only decision_type_key · no closed starter/HRD_* enum
 * SRS:        docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-DATA-01.md §2 · §5
 * API_DESIGN: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-VERTICAL-SA-01.md §3 F-DEC-CAT-*
 * Purpose:    Status/source/error codes for hr_decision_type — FORBIDDEN key IN (appointment,HRD_*).
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-BE-01
 * Coded:      2026-08-07
 * must_keep:  soft-delete · open catalog · U65 no seed · F-CORE-DEC create/approve/WH spine
 * SOLID:      Constants SRP — no I/O
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-dec-be-01.md
 */

export const HR_DECISION_TYPE_STATUSES = ['active', 'retired'] as const;
export type HrDecisionTypeStatus = (typeof HR_DECISION_TYPE_STATUSES)[number];

/**
 * Format-only — FORBIDDEN closed decision_type_key enum (BR-PLT-05).
 * Allows HRD_01 style (leading letter + alnum/underscore).
 */
export const HR_DECISION_TYPE_KEY_FORMAT = /^[a-zA-Z][a-zA-Z0-9_]*$/;

export const HR_DECISION_TYPE_CATALOG_KIND = 'hr_decision_type' as const;

export type HrDecisionTypeSource = 'dec_native' | 'group_ref' | 'dec_override';

/** Platform taxonomy (VAL-DEC-CAT-02/03). */
export const HRM_PLT_CAT_CODE_INVALID = 'HRM-PLT-CAT-CODE-INVALID';
export const HRM_PLT_CAT_CODE_CONFLICT = 'HRM-PLT-CAT-CODE-CONFLICT';
export const HRM_DEC_TYP_404 = 'HRM-DEC-TYP-404';
/** decision_type ∉ effective when catalog >0 (VAL-DEC-CNS-01 · BR-PLT-02). */
export const HRM_DEC_TYPE_UNKNOWN = 'HRM-DEC-TYPE-UNKNOWN';
/** Retire last WH-producing type without replacement (VAL-DEC-CAT-10). */
export const HRM_DEC_TYP_WH_REQUIRED = 'HRM-DEC-TYP-WH-REQUIRED';
export const HRM_VAL_400 = 'HRM-VAL-400';

/**
 * Settings group REF partition — dual SoT read (BR-PLT-06 · BR-PLT-DEC-05).
 * Family aliases `decision_types` ↔ storage `hr_decision_types`.
 */
export const HR_DECISION_TYPES_GROUP_REF_KEY = 'hr_decision_types';
export const HR_DECISION_TYPES_GROUP_REF_ALIASES = ['hr_decision_types', 'decision_types'] as const;

/**
 * Optional bootstrap starter keys — ensure may upsert later; U65 UF must not treat as required seed.
 * NOT a product ceiling (BR-PLT-05).
 */
export const HR_DECISION_TYPE_STARTER_KEYS = [
  'appointment',
  'transfer',
  'HRD_01',
  'HRD_02',
  'HRD_03',
] as const;
