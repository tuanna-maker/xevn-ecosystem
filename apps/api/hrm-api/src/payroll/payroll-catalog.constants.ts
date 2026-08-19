/**
 * @CODE-MEMORY
 * Screen:     HRM → Lương → Thành phần lương (catalog constants)
 * UC:         AC-PLT-PAY-01 · AC-PAY-COMP-01 · F-PAY-COMP-CATALOG-01
 * SRS:        docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-TECHSPEC-01.md §4 PAY
 * TechSpec:   ADR-HRM-DYNAMIC-CONFIG-PLATFORM L1 open catalog
 * Purpose:    Starter rows ≠ closed enum; code format only; error taxonomy catalog PAY.
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-BE-01
 * Coded:      2026-08-07
 * must_keep:  no CHK IN (N) · formula TEXT ≠ engine · payroll_e2e_ready=false
 * SOLID:      Constants SRP — no I/O
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-BE-02
 * change_mode: ADD
 * What: PAY_TYPES_STARTER_ROWS — open-catalog bootstrap REF for empty pay_types picker
 * must_keep: not closed enum · U65 no seed script · Settings items N+1 path
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-CNS-BE-01
 * change_mode: ADD
 * What: HRM_SC_COMP_KEY consumer invent taxonomy + HRM_COMP_004 1:1 peer alias note
 * must_keep: admin F-PLT-PAY-COMP-02 open · payroll_e2e_ready=false
 */

/** Open code format — reject slug only, never closed N-set. */
export const SALARY_COMPONENT_CODE_FORMAT = /^[A-Za-z][A-Za-z0-9_]{1,62}$/;

export const HRM_PAY_COMP_CODE_INVALID = 'HRM-PAY-COMP-CODE-INVALID';
export const HRM_PAY_COMP_404 = 'HRM-PAY-COMP-404';
export const HRM_PAY_COMP_409 = 'HRM-PAY-COMP-409';
export const HRM_PAY_COMP_FORMULA_412 = 'HRM-PAY-COMP-FORMULA-412';

/**
 * Consumer invent / OOS component_code when Nest salary_components effective active >0
 * (BR-PLT-PAY-02 · AC-PAY-COMP-01 · VAL-PAY-CNS-*). Admin F-PLT-PAY-COMP-02 OPEN — never this code.
 * Peer 1:1 alias (legacy compensation): `HRM-COMP-004` — same membership semantics.
 */
export const HRM_SC_COMP_KEY = 'HRM-SC-COMP-KEY';
/** @deprecated Prefer HRM_SC_COMP_KEY — kept as documented 1:1 peer alias. */
export const HRM_COMP_004 = 'HRM-COMP-004';

/**
 * Open-catalog bootstrap for Settings `pay_types` — codes align with starter salary
 * component_type REF. Not a closed enum: tenants may add N+1 via Settings items UF.
 * U65: bootstrap on empty picker only — not a seed script / UAT fake density.
 */
export const PAY_TYPES_STARTER_ROWS = [
  { code: 'luong', label: 'Lương' },
  { code: 'thue', label: 'Thuế' },
  { code: 'cham_cong', label: 'Chấm công' },
] as const;

/** Bootstrap examples only — tenant may add N+1 without code release (Platform L1). */
export const PAY_SALARY_COMPONENT_STARTER_ROWS = [
  {
    code: 'LUONG_CO_BAN',
    name: 'Lương cơ bản',
    component_type: 'luong',
    nature: 'income',
    value_type: 'currency',
    is_taxable: true,
    is_insurance_base: true,
    sort_order: 10,
    is_system: true,
  },
  {
    code: 'THUE_TNCN_HT',
    name: 'Thuế TNCN',
    component_type: 'thue',
    nature: 'deduction',
    value_type: 'currency',
    is_taxable: false,
    is_insurance_base: false,
    sort_order: 20,
    is_system: true,
  },
  {
    code: 'SO_NGAY_NGHI_BU',
    name: 'Số ngày nghỉ bù',
    component_type: 'cham_cong',
    nature: 'other',
    value_type: 'number',
    is_taxable: false,
    is_insurance_base: false,
    sort_order: 30,
    is_system: true,
  },
] as const;
