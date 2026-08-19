/**
 * @CODE-MEMORY
 * Screen:     HRM -> Cong thuc luong (constants)
 * UC:         FR-UC-BP-PAY-02 . AC-PAY-FORMULA-01..08
 * BR:         Option A dual-control . DV-18 required_vars . R-PAY-DD-01 Form GĐ1
 * SRS:        docs/program/specs/PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-01.md §4 . §7
 * TechSpec:   ADR-HRM-4-PILLAR-API-BOUNDARY.md §10 Option A
 * DB_DESIGN:  docs/qa/evidence/po-hrm-payroll-formula-run-gap-data-01.md §2.1
 * API_DESIGN: F-PAY-FORMULA-AUTHOR/PUBLISH/LIST
 * Purpose:    SM status + error codes + required_vars allow-list (ATT closed + CORE C&B).
 * WorkItem:   PO-HRM-PAYROLL-FORMULA-RUN-GAP-BE-01
 * Coded:      2026-08-07
 * must_keep:  opaque expression . no closed formula code enum . dual-control on by default
 * SOLID:      Constants SRP -- no I/O
 * LastVerified: docs/qa/evidence/po-hrm-payroll-formula-run-gap-be-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-07
 * WorkItem: PO-HRM-PAYROLL-FORMULA-RUN-GAP-BE-EVAL-01
 * change_mode: ADD
 * What: Reuse FORMULA-412 / PREVIEW-STUB / ATT-412 codes for staged evaluator honesty
 * must_keep: cam claim LIVE . payroll_e2e_ready=false
 *
 * @CODE-MEMORY-CHANGE 2026-08-15
 * WorkItem: BA-HRM-INSURANCE-RATE-TECHSPEC-01
 * change_mode: ADD
 * What: 7 bien bao hiem tu config -- lay tu hrm_insurance_rate + hrm_minimum_wage_region
 * solid_convention_ack: true
 * be_boundary: true
 */

export const PAY_FORMULA_STATUSES = [
  'draft',
  'pending_publish',
  'active',
  'retired',
] as const;
export type PayFormulaStatus = (typeof PAY_FORMULA_STATUSES)[number];

/** Stable formula code -- format only; FORBIDDEN closed code enum. */
export const PAY_FORMULA_CODE_FORMAT = /^[a-z][a-z0-9_]{1,62}$/;

/**
 * DV-18 allow-list: closed timesheet hours + CORE C&B keys only.
 * Open allowance_* pattern accepted; Leave/OT live request keys FORBIDDEN.
 */
export const PAY_FORMULA_REQUIRED_VAR_ALLOWLIST = [
  'payable_hours',
  'standard_hours',
  'ot_hours_weighted',
  'paid_leave_hours',
  'unpaid_leave_hours',
  'base_salary',
  'dependents_count',
] as const;

export const PAY_FORMULA_ALLOWANCE_VAR_RE = /^allowance_[a-z0-9_]{1,48}$/;


/**
 * W10: source_kind taxonomy -- 13 values per PO-HRM-PAY-INPUT-PACKS-SPEC-01.md §2.
 * Mo allowlist cho bien tu Input Pack (pay_period_input_lines).
 * SOLID: pure const, no I/O
 *
 * @CODE-MEMORY-CHANGE 2026-08-15
 * WorkItem: BA-HRM-PAYROLL-FORMULA-INPUT-PACK-BE-01
 * change_mode: ADD
 * What: 13 source_kind values + isAllowedFormulaVarKey extending DV-18 to include IP taxonomy
 * BR: BR-W10-03 -- PAY_FORMULA_REQUIRED_VAR_ALLOWLIST takes precedence over IP source_kinds
 */
export const PAY_FORMULA_INPUT_PACK_SOURCE_KINDS = [
  'manual', 'kpi', 'dll_cpn', 'cpsc', 'cldv', 'route_count',
  'revenue', 'advance', 'xdtn', 'vp_cost', 'vp_allowance',
  'other_income', 'rd_transfer',
] as const;

export type PayFormulaInputPackSourceKind =
  (typeof PAY_FORMULA_INPUT_PACK_SOURCE_KINDS)[number];

/**
 * W12b: 7 bien bao hiem tu config -- lay tu hrm_insurance_rate + hrm_minimum_wage_region
 *
 * @CODE-MEMORY WorkItem: BA-HRM-INSURANCE-RATE-TECHSPEC-01
 * solid_convention_ack: true
 * be_boundary: true
 */
export const PAY_FORMULA_INSURANCE_SOURCE_KINDS = [
  'insurance_bhxh_employer_rate',
  'insurance_bhxh_employee_rate',
  'insurance_bhyt_employer_rate',
  'insurance_bhyt_employee_rate',
  'insurance_bhtn_employer_rate',
  'insurance_bhtn_employee_rate',
  'insurance_salary_cap',
] as const satisfies readonly string[];

export type PayFormulaInsuranceSourceKind =
  (typeof PAY_FORMULA_INSURANCE_SOURCE_KINDS)[number];

/**
 * W12a: leave_type_pay_rate -- lay tu hrm_leave_type.pay_rate_percent
 *
 * @CODE-MEMORY WorkItem: BA-HRM-LEAVE-TYPE-TECHSPEC-01
 * solid_convention_ack: true
 * be_boundary: true
 */
export const PAY_FORMULA_LEAVE_TYPE_SOURCE_KINDS = [
  'leave_type_pay_rate',
] as const satisfies readonly string[];

export type PayFormulaLeaveTypeSourceKind =
  (typeof PAY_FORMULA_LEAVE_TYPE_SOURCE_KINDS)[number];

/**
 * W10: Kiem tra var key co hop le cho pay formula khong.
 * Mo rong DV-18: core vars | allowance_* | source_kind taxonomy.
 * BR-W10-07: core list thang neu conflict voi source_kind.
 * W12b: them 7 bien bao hiem.
 * W12a: them leave_type_pay_rate.
 * Pure function -- zero I/O, zero side-effects (SRP: constants file only).
 */
export function isAllowedFormulaVarKey(key: string): boolean {
  const k = key.trim();
  if (!k) return false;
  if ((PAY_FORMULA_REQUIRED_VAR_ALLOWLIST as readonly string[]).includes(k)) return true;
  if (PAY_FORMULA_ALLOWANCE_VAR_RE.test(k)) return true;
  if ((PAY_FORMULA_INPUT_PACK_SOURCE_KINDS as readonly string[]).includes(k)) return true;
  if ((PAY_FORMULA_INSURANCE_SOURCE_KINDS as readonly string[]).includes(k)) return true;
  if ((PAY_FORMULA_LEAVE_TYPE_SOURCE_KINDS as readonly string[]).includes(k)) return true;
  return false;
}

export const HRM_PAY_FORMULA_403_DUAL = 'HRM-PAY-FORMULA-403-DUAL';
export const HRM_PAY_FORMULA_409_IMMUTABLE = 'HRM-PAY-FORMULA-409-IMMUTABLE';
export const HRM_PAY_FORMULA_409_STATE = 'HRM-PAY-FORMULA-409-STATE';
export const HRM_PAY_FORMULA_CODE_INVALID = 'HRM-PAY-FORMULA-CODE-INVALID';
export const HRM_PAY_FORMULA_CODE_CONFLICT = 'HRM-PAY-FORMULA-CODE-CONFLICT';
export const HRM_PAY_FORMULA_412 = 'HRM-PAY-FORMULA-412';
export const HRM_PAY_FORMULA_412_VARS = 'HRM-PAY-FORMULA-412-VARS';
export const HRM_PAY_FORMULA_412_PREVIEW_STUB = 'HRM-PAY-FORMULA-412-PREVIEW-STUB';
export const HRM_PAY_FORMULA_404 = 'HRM-PAY-FORMULA-404';
/** Process/preview when published formula expression is not in evaluable subset. */
export const HRM_PAY_FORMULA_412_NOT_EVALUABLE = 'HRM-PAY-FORMULA-412-NOT-EVALUABLE';
export const HRM_PAY_ATT_412 = 'HRM-PAY-ATT-412';

/** Dual-control default ON (GĐ1). Set HRM_PAY_FORMULA_DUAL_CONTROL=0 to disable (dev only). */
export function isPayFormulaDualControlEnabled(): boolean {
  const raw = (process.env.HRM_PAY_FORMULA_DUAL_CONTROL ?? '').trim().toLowerCase();
  if (!raw) return true;
  return !['0', 'false', 'no', 'off'].includes(raw);
}

export function isAllowedRequiredVarKey(key: string): boolean {
  const k = key.trim();
  if (!k) return false;
  if ((PAY_FORMULA_REQUIRED_VAR_ALLOWLIST as readonly string[]).includes(k)) {
    return true;
  }
  return PAY_FORMULA_ALLOWANCE_VAR_RE.test(k);
}
