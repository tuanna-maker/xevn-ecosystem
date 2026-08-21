/**
 * @CODE-MEMORY
 * Screen:     SI insurers open catalog constants
 * UC:         AC-PLT-SI-INSURER-01..01d · BR-PLT-02/04/05/06 · FR-UC-BP-CORE-10 · E3 AC-INS-02
 * BR:         DYNAMIC-LOCK — format-only insurer_key · no closed VSS/BHXH_VN ceiling
 * SRS:        docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-DATA-01.md §2
 * API_DESIGN: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-SA-01.md §5–§6 F-SI-CAT-INS-*
 * Purpose:    Status/source/error codes for si_insurer — FORBIDDEN key IN (VSS,…); ≠ si_insurance_type.
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-BE-01
 * Coded:      2026-08-08
 * must_keep:  soft-delete · open catalog · U65 no seed · SI type L1 RETAIN · enrollment ONE SoT ·
 *             CTR seals · E3 HRM-INS-INSURER-KEY · FORBIDDEN fold into si_insurance_type
 * SOLID:      Constants SRP — no I/O
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-si-insurer-catalog-be-01.md
 */

export const SI_INSURER_STATUSES = ['active', 'retired'] as const;
export type SiInsurerStatus = (typeof SI_INSURER_STATUSES)[number];

/**
 * Format-only — allows VSS / BaoViet / hr_insurer_custom_09 (DATA-01 §2.1).
 * FORBIDDEN closed insurer_key enum (BR-PLT-05).
 */
export const SI_INSURER_KEY_FORMAT = /^[a-zA-Z][a-zA-Z0-9_]*$/;

export const SI_INSURER_CATALOG_KIND = 'si_insurer' as const;

export type SiInsurerSource = 'si_native' | 'group_ref' | 'si_override';

/** Platform taxonomy (VAL-SI-INR-CAT-02/03). */
export const HRM_PLT_CAT_CODE_INVALID = 'HRM-PLT-CAT-CODE-INVALID';
export const HRM_PLT_CAT_CODE_CONFLICT = 'HRM-PLT-CAT-CODE-CONFLICT';
export const HRM_SI_INSURER_404 = 'HRM-SI-INSURER-404';

/**
 * Consumer invent when EFF >0 — retain E3 class (VAL-SI-INR-CNS-01).
 * Optional docs alias HRM-SI-INSURER-UNKNOWN MUST NOT diverge semantics.
 * ≠ HRM-INS-TYPE-KEY (separate SoT).
 */
export const HRM_INS_INSURER_KEY = 'HRM-INS-INSURER-KEY';

/**
 * Settings group REF partition — dual SoT merge-read (BR-PLT-06 · L-SI-INR-03).
 * Aliases insurance_providers / bhxh_providers resolved by settings catalog family.
 */
export const SI_INSURERS_GROUP_REF_KEY = 'insurers';

/**
 * Docs-only bootstrap examples — NOT a product ceiling; NEVER enforce IN (…).
 * Optional ensure upsert later; U65 UF must not treat as required seed.
 */
export const SI_INSURER_STARTER_KEYS = [
  'VSS',
  'BaoViet',
  'PVI',
  'BaoMinh',
] as const;
