/**
 * @CODE-MEMORY
 * Screen:     HRM → Cài đặt → Defaults thuế / BH / PC theo vị trí
 * UC:         UC-SET-DEF-01..06 · AC-AMIS-SET-TAX/SI/POS
 * BR:         BR-AMIS-SET-DEF-01..08 · BR-AMIS-PAY-SRC-02 · V-13
 * SRS:        docs/program/specs/PO-HRM-SETTINGS-DEFAULTS-DATA-01.md
 * TechSpec:   docs/program/specs/PO-HRM-SETTINGS-DEFAULTS-API-01.md F-SET-*
 * Purpose:    Error taxonomy + open pay_tax_* / SI status / POS calc_mode — no closed key IN.
 * WorkItem:   PO-HRM-SETTINGS-DEFAULTS-BE-01
 * Coded:      2026-08-07
 * Callers:    settings-tax-params · insurance-rate-cfg · position-compensation-policy services
 * must_keep:  SRC-02 resolve read-only · SI-412 no silent 0% · soft-delete · U65 no seed
 * SOLID:      Constants SRP — no I/O
 * LastVerified: docs/qa/evidence/po-hrm-settings-defaults-be-01.md
 */

export const PAY_TAX_KEY_PREFIX = 'pay_tax_';

export const PAY_TAX_PERSONAL_DEDUCTION = 'pay_tax_personal_deduction_vnd';
export const PAY_TAX_DEPENDENT_DEDUCTION = 'pay_tax_dependent_deduction_vnd';
export const PAY_TAX_REGIME = 'pay_tax_regime';
export const PAY_TAX_FLAGS = 'pay_tax_flags';

/** Starter keys — open registry (BR-PLT-05); not a closed CHECK set. */
export const PAY_TAX_STARTER_KEYS = [
  PAY_TAX_PERSONAL_DEDUCTION,
  PAY_TAX_DEPENDENT_DEDUCTION,
  PAY_TAX_REGIME,
  PAY_TAX_FLAGS,
] as const;

export const SI_STATUSES = ['draft', 'active', 'retired'] as const;
export type SiStatus = (typeof SI_STATUSES)[number];

export const POS_STATUSES = ['draft', 'active', 'retired'] as const;
export type PosStatus = (typeof POS_STATUSES)[number];

export const POS_CALC_MODES = ['fixed', 'formula', 'rate'] as const;
export type PosCalcMode = (typeof POS_CALC_MODES)[number];

export const INSURANCE_TYPE_KEY_FORMAT = /^[A-Za-z][A-Za-z0-9_]{0,63}$/;

export const HRM_SET_TAX_200 = 'HRM-SET-TAX-200';
export const HRM_SET_TAX_400_SHAPE = 'HRM-SET-TAX-400-SHAPE';
export const HRM_SET_TAX_412_MISSING = 'HRM-SET-TAX-412-MISSING';

export const HRM_SET_SI_200 = 'HRM-SET-SI-200';
export const HRM_SET_SI_201 = 'HRM-SET-SI-201';
export const HRM_SET_SI_404 = 'HRM-SET-SI-404';
export const HRM_SET_SI_409_OVERLAP = 'HRM-SET-SI-409-OVERLAP';
export const HRM_SET_SI_409_HARD_DELETE = 'HRM-SET-SI-409-HARD-DELETE';
export const HRM_SET_SI_412_MISSING = 'HRM-SET-SI-412-MISSING';

export const HRM_SET_POS_200 = 'HRM-SET-POS-200';
export const HRM_SET_POS_201 = 'HRM-SET-POS-201';
export const HRM_SET_POS_404 = 'HRM-SET-POS-404';
export const HRM_SET_POS_400_KEY = 'HRM-SET-POS-400-KEY';
export const HRM_SET_POS_409_ACTIVE = 'HRM-SET-POS-409-ACTIVE';
export const HRM_SET_POS_409_LINE = 'HRM-SET-POS-409-LINE';

/** Peer ALLOW-CAT orphan — reuse on policy lines when PC catalog ≠ ∅. */
export const HRM_ALLOW_CAT_ORPHAN_CODE = 'HRM-ALLOW-CAT-ORPHAN-CODE';

export const JOB_TITLES_CATALOG_KEY = 'job_titles';
