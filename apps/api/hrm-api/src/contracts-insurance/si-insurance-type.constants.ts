/**
 * @CODE-MEMORY
 * Screen:     SI insurance-type open catalog constants
 * UC:         AC-PLT-SI-INS-01..01d · BR-PLT-02/04/05/06 · FR-UC-BP-CORE-10
 * BR:         DYNAMIC-LOCK — format-only insurance_type_key · no closed BHXH/BHYT ceiling
 * SRS:        docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-DATA-01.md §2
 * API_DESIGN: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-SA-01.md §5–§6 F-SI-CAT-*
 * Purpose:    Status/source/error codes for si_insurance_type — FORBIDDEN key IN (BHXH,…).
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-BE-01
 * Coded:      2026-08-08
 * must_keep:  soft-delete · open catalog · U65 no seed · enrollment ONE SoT · CTR seals · E3 HRM-INS-TYPE-KEY
 * SOLID:      Constants SRP — no I/O
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-si-ins-catalog-be-01.md
 */

export const SI_INSURANCE_TYPE_STATUSES = ['active', 'retired'] as const;
export type SiInsuranceTypeStatus = (typeof SI_INSURANCE_TYPE_STATUSES)[number];

/**
 * Format-only — allows BHXH/BHYT/social (DATA-01 §2.1).
 * FORBIDDEN closed insurance_type_key enum (BR-PLT-05).
 */
export const SI_INSURANCE_TYPE_KEY_FORMAT = /^[a-zA-Z][a-zA-Z0-9_]*$/;

export const SI_INSURANCE_TYPE_CATALOG_KIND = 'si_insurance_type' as const;

export type SiInsuranceTypeSource = 'si_native' | 'group_ref' | 'si_override';

/** Platform taxonomy (VAL-SI-CAT-02/03). */
export const HRM_PLT_CAT_CODE_INVALID = 'HRM-PLT-CAT-CODE-INVALID';
export const HRM_PLT_CAT_CODE_CONFLICT = 'HRM-PLT-CAT-CODE-CONFLICT';
export const HRM_SI_INS_TYPE_404 = 'HRM-SI-INS-TYPE-404';

/**
 * Consumer invent when EFF >0 — retain E3 class (VAL-SI-CNS-01/02/04).
 * Optional docs alias HRM-SI-INS-TYPE-UNKNOWN MUST NOT diverge semantics.
 */
export const HRM_INS_TYPE_KEY = 'HRM-INS-TYPE-KEY';

/** Settings group REF partition — dual SoT merge-read (BR-PLT-06 · L-SI-INS-03). */
export const SI_INSURANCE_TYPES_GROUP_REF_KEY = 'insurance_types';

/**
 * Docs-only bootstrap examples — NOT a product ceiling; NEVER enforce IN (…).
 * Optional ensure upsert later; U65 UF must not treat as required seed.
 */
export const SI_INSURANCE_TYPE_STARTER_KEYS = [
  'BHXH',
  'BHYT',
  'BHTN',
  'social',
] as const;
