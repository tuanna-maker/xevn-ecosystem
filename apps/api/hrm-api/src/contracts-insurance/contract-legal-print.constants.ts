/**
 * @CODE-MEMORY
 * Screen:     HRM HĐLĐ print spine constants
 * UC:         FR-UC-BP-CORE-09 · 09a · 09b · 09c · 09d
 * BR:         BR-CTR-CL-01..04 · BR-CD-F5-01 · BR-CTR-TPL-05 · VAL-XEVN-*
 * SRS:        docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-SPEC-01.md
 *             SRS_HRM_ENTERPRISE.md FR-UC-BP-CORE-09d
 * TechSpec:   docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-TECHSPEC-01.md §3 · §10
 *             PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-TECHSPEC-01.md
 * DB_DESIGN:  docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-DATA-01.md §3 · §5.13
 *             PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-DATA-01.md §2–§7
 * Purpose:    Pack codes + HRM-CTR-* error taxonomy + 8 XEVN matrix catalog (deterministic).
 * WorkItem:   PO-HRM-CONTRACT-LEGAL-PRINT-BE-01
 * Coded:      2026-08-06
 * must_keep:  Pack codes ≠ JD PACK_*; honesty contracts_printable_ready=false; open catalog (dynamic)
 * SOLID:      Constants SRP — no I/O
 * LastVerified: docs/qa/evidence/po-hrm-contract-legal-print-xevn-tpl-be-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-BE-01
 * change_mode: EXPAND
 * What: 8 XEVN_* STARTER matrix + CODE/PACK/TERM errors + company-settings keys
 * Why: XEVN-TPL-DATA/API · sponsor DYNAMIC LOCK — catalog open, 8 ≠ ceiling
 * must_keep: no closed enum of 8; Q-CTR-01/02 CLOSED; printable=false
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-CORR-01
 * change_mode: FIX
 * What: SUPERSEDE «FORBIDDEN 9th» — CODE-INVALID = bad format/FK only; starter list helper only
 * Why: Sponsor interrupt DYNAMIC LOCK 2026-08-07
 * must_keep: open hrm_contract_templates; unique code/scope
 *
 * @CODE-MEMORY-CHANGE 2026-08-08 PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-TEMPLATE-BE-01
 * change_mode: ADD
 * What: HRM-CTR-TPL-KEY invent class (consumer free-text when active EFF>0)
 * Why: BA-01 §4.3 · §8.1 — CODE-INVALID format-only ≠ invent; 404 get-by-id ≠ KEY; NONE empty
 * must_keep: open catalog; TPL-404 get-by-id; TPL-NONE empty; printable=false; no schema invent
 */

export const CONTRACT_PACK_CODES = [
  'GENERAL',
  'IT_OFFICE',
  'DRIVER',
  'LOGISTICS',
] as const;
export type ContractPackCode = (typeof CONTRACT_PACK_CODES)[number];

export const CONTRACT_PACK_DEFAULT: ContractPackCode = 'GENERAL';

export const HRM_CTR_TPL_NONE = 'HRM-CTR-TPL-NONE';
export const HRM_CTR_CL_REQUIRED = 'HRM-CTR-CL-REQUIRED';
export const HRM_CTR_CL_CODE_CONFLICT = 'HRM-CTR-CL-CODE-CONFLICT';
export const HRM_CTR_PACK_INVALID = 'HRM-CTR-PACK-INVALID';
export const HRM_CTR_DRIVER_REQUIRED = 'HRM-CTR-DRIVER-REQUIRED';
export const HRM_CTR_ISSUE_BLOCKED = 'HRM-CTR-ISSUE-BLOCKED';
export const HRM_CTR_VERSION_NOT_ISSUED = 'HRM-CTR-VERSION-NOT-ISSUED';
export const HRM_CTR_RENDER_FAIL = 'HRM-CTR-RENDER-FAIL';
export const HRM_CTR_CB_FORBIDDEN = 'HRM-CTR-CB-FORBIDDEN';
export const HRM_CTR_TPL_404 = 'HRM-CTR-TPL-404';
export const HRM_CTR_CL_404 = 'HRM-CTR-CL-404';
export const HRM_CTR_PV_404 = 'HRM-CTR-PV-404';

/**
 * Consumer invent when Nest hrm_contract_templates active EFF>0.
 * ≠ HRM-CTR-TPL-404 (GET templates/:id miss) · ≠ HRM-CTR-TPL-NONE (empty require-template)
 * ≠ HRM-CTR-TPL-CODE-INVALID (slug/format only).
 */
export const HRM_CTR_TPL_KEY = 'HRM-CTR-TPL-KEY';

/** FR-09d / VAL-XEVN — matrix gates. */
export const HRM_CTR_TPL_CODE_INVALID = 'HRM-CTR-TPL-CODE-INVALID';
export const HRM_CTR_TPL_PACK_MISMATCH = 'HRM-CTR-TPL-PACK-MISMATCH';
export const HRM_CTR_OVERLAY_400 = 'HRM-CTR-OVERLAY-400';
export const HRM_CTR_TERM_INVALID = 'HRM-CTR-TERM-INVALID';
export const HRM_CTR_UNIT_SCOPE = 'HRM-CTR-UNIT-SCOPE';

/** Group library publish / pull / apply (DATA-02 · ADR Option A). */
export const HRM_CTR_PUB_EMPTY = 'HRM-CTR-PUB-EMPTY';
export const HRM_CTR_PUB_FORBIDDEN = 'HRM-CTR-PUB-FORBIDDEN';
export const HRM_CTR_PUB_NOT_FOUND = 'HRM-CTR-PUB-NOT-FOUND';
export const HRM_CTR_PUB_RETIRED = 'HRM-CTR-PUB-RETIRED';
export const HRM_CTR_PUB_CODE_CONFLICT = 'HRM-CTR-PUB-CODE-CONFLICT';
export const HRM_CTR_PUB_NOTHING_TO_APPLY = 'HRM-CTR-PUB-NOTHING-TO-APPLY';
export const HRM_CTR_PUB_MANDATORY_GAP = 'HRM-CTR-PUB-MANDATORY-GAP';

export type ContractLibraryOrigin = 'member' | 'group' | 'member_override';

/**
 * Starter Excel matrix codes — bootstrap/upsert only.
 * NOT a closed enum: HR may CREATE template #9+ with any valid code format.
 * @see PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-DYNAMIC-LOCK.md
 */
export const XEVN_STARTER_TEMPLATE_CODES = [
  'XEVN_PROBATION_OFFICE',
  'XEVN_FT_12M_OFFICE',
  'XEVN_FT_24M_OFFICE',
  'XEVN_INDEF_OFFICE',
  'XEVN_PROBATION_DRIVER',
  'XEVN_FT_12M_DRIVER',
  'XEVN_FT_24M_DRIVER',
  'XEVN_INDEF_DRIVER',
] as const;

/** @deprecated Use XEVN_STARTER_TEMPLATE_CODES — alias for bootstrap callers. */
export const XEVN_TEMPLATE_CODES = XEVN_STARTER_TEMPLATE_CODES;

export type XevnStarterTemplateCode =
  (typeof XEVN_STARTER_TEMPLATE_CODES)[number];
/** @deprecated alias */
export type XevnTemplateCode = XevnStarterTemplateCode;

export type XevnTermType = 'probation' | 'definite' | 'indefinite';

export type XevnMatrixRow = {
  code: XevnStarterTemplateCode;
  pack_code: 'IT_OFFICE' | 'DRIVER';
  default_term_type: XevnTermType;
  default_duration_days: number | null;
  default_duration_months: number | null;
  title_print_vi: string;
  name_vi: string;
};

export const XEVN_MATRIX_FAMILY = 'XEVN_MATRIX' as const;
export const LEGACY_MATRIX_FAMILY = 'LEGACY' as const;

export const XEVN_MATRIX_CATALOG: readonly XevnMatrixRow[] = [
  {
    code: 'XEVN_PROBATION_OFFICE',
    pack_code: 'IT_OFFICE',
    default_term_type: 'probation',
    default_duration_days: 60,
    default_duration_months: null,
    title_print_vi: 'HỢP ĐỒNG THỬ VIỆC',
    name_vi: 'X.E — HĐ thử việc (HCNS)',
  },
  {
    code: 'XEVN_FT_12M_OFFICE',
    pack_code: 'IT_OFFICE',
    default_term_type: 'definite',
    default_duration_days: null,
    default_duration_months: 12,
    title_print_vi: 'HỢP ĐỒNG LAO ĐỘNG',
    name_vi: 'X.E — HĐLĐ 12 tháng (HCNS)',
  },
  {
    code: 'XEVN_FT_24M_OFFICE',
    pack_code: 'IT_OFFICE',
    default_term_type: 'definite',
    default_duration_days: null,
    default_duration_months: 24,
    title_print_vi: 'HỢP ĐỒNG LAO ĐỘNG',
    name_vi: 'X.E — HĐLĐ 24 tháng (HCNS)',
  },
  {
    code: 'XEVN_INDEF_OFFICE',
    pack_code: 'IT_OFFICE',
    default_term_type: 'indefinite',
    default_duration_days: null,
    default_duration_months: null,
    title_print_vi: 'HỢP ĐỒNG LAO ĐỘNG',
    name_vi: 'X.E — HĐLĐ không xác định thời hạn (HCNS)',
  },
  {
    code: 'XEVN_PROBATION_DRIVER',
    pack_code: 'DRIVER',
    default_term_type: 'probation',
    default_duration_days: 60,
    default_duration_months: null,
    title_print_vi: 'HỢP ĐỒNG THỬ VIỆC',
    name_vi: 'X.E — HĐ thử việc (Lái xe)',
  },
  {
    code: 'XEVN_FT_12M_DRIVER',
    pack_code: 'DRIVER',
    default_term_type: 'definite',
    default_duration_days: null,
    default_duration_months: 12,
    title_print_vi: 'HỢP ĐỒNG LAO ĐỘNG',
    name_vi: 'X.E — HĐLĐ 12 tháng (Lái xe)',
  },
  {
    code: 'XEVN_FT_24M_DRIVER',
    pack_code: 'DRIVER',
    default_term_type: 'definite',
    default_duration_days: null,
    default_duration_months: 24,
    title_print_vi: 'HỢP ĐỒNG LAO ĐỘNG',
    name_vi: 'X.E — HĐLĐ 24 tháng (Lái xe)',
  },
  {
    code: 'XEVN_INDEF_DRIVER',
    pack_code: 'DRIVER',
    default_term_type: 'indefinite',
    default_duration_days: null,
    default_duration_months: null,
    title_print_vi: 'HỢP ĐỒNG LAO ĐỘNG',
    name_vi: 'X.E — HĐLĐ không xác định thời hạn (Lái xe)',
  },
] as const;

export const CONTRACT_SETTING_ORG_SUFFIX = 'contract_number_org_suffix';
export const CONTRACT_SETTING_NUMBER_PATTERN = 'contract_number_pattern';
export const CONTRACT_SETTING_CLAUSE_CUSTOM_GROUPS = 'contract_clause_custom_groups';
export const CONTRACT_SETTING_KEYS = [
  CONTRACT_SETTING_ORG_SUFFIX,
  CONTRACT_SETTING_NUMBER_PATTERN,
  CONTRACT_SETTING_CLAUSE_CUSTOM_GROUPS,
] as const;
export type ContractSettingKey = (typeof CONTRACT_SETTING_KEYS)[number];

export const CONTRACT_NUMBER_PATTERN_DEFAULT =
  '{seq}/{yyyy}/{docKind}-{orgSuffix}';

/** True iff code is one of the 8 Excel starter rows (bootstrap helper — not a create gate). */
export function isXevnStarterTemplateCode(
  code: string | undefined | null,
): code is XevnStarterTemplateCode {
  if (!code?.trim()) return false;
  return (XEVN_STARTER_TEMPLATE_CODES as readonly string[]).includes(
    code.trim().toUpperCase(),
  );
}

/** @deprecated Prefer isXevnStarterTemplateCode — does NOT mean «only these codes allowed». */
export function isXevnTemplateCode(
  code: string | undefined | null,
): code is XevnTemplateCode {
  return isXevnStarterTemplateCode(code);
}

export function looksLikeXevnCode(code: string | undefined | null): boolean {
  return Boolean(code?.trim().toUpperCase().startsWith('XEVN_'));
}

export function getXevnMatrixRow(code: string): XevnMatrixRow | null {
  const u = code.trim().toUpperCase();
  return XEVN_MATRIX_CATALOG.find((r) => r.code === u) ?? null;
}

/**
 * Open-catalog code format (DYNAMIC LOCK).
 * CODE-INVALID = bad format only — never «not in starter 8».
 */
export function normalizeTemplateCode(raw: string | undefined | null): string {
  return (raw ?? '').trim().toUpperCase();
}

export function isValidTemplateCodeFormat(
  code: string | undefined | null,
): boolean {
  const u = normalizeTemplateCode(code);
  // 2–64 chars: A-Z / 0-9 / _ / - ; must start with letter
  return /^[A-Z][A-Z0-9_-]{1,63}$/.test(u);
}

export function assertValidTemplateCodeFormat(
  code: string | undefined | null,
): string {
  const u = normalizeTemplateCode(code);
  if (!isValidTemplateCodeFormat(u)) {
    throw Object.assign(new Error(HRM_CTR_TPL_CODE_INVALID), {
      code: HRM_CTR_TPL_CODE_INVALID,
      message: `Invalid template code format '${code ?? ''}'`,
    });
  }
  return u;
}

/** Default keyword_map tokens for XEVN matrix (DATA §3.3). */
export function defaultXevnKeywordMap(
  pack: 'IT_OFFICE' | 'DRIVER',
): Record<string, unknown> {
  const base: Record<string, unknown> = {
    '{{employer_legal_name}}': {
      source: 'company.legal_name',
      ring: 'company',
    },
    '{{employer_unit_label}}': {
      source: 'company.display_name',
      ring: 'company',
    },
    '{{employer_address}}': { source: 'company.address', ring: 'company' },
    '{{contract_number}}': {
      source: 'employee_contracts.contract_code',
      ring: 'contract',
    },
    '{{contract_number_suggested}}': {
      source: 'settings.contract_number_pattern',
      ring: 'contract',
    },
    '{{contract_title_print}}': {
      source: 'hrm_contract_templates.title_print_vi',
      ring: 'contract',
    },
    '{{term_type_label_vi}}': { source: 'derived.term_type', ring: 'contract' },
    '{{effective_from}}': {
      source: 'employee_contracts.start_date',
      ring: 'contract',
    },
    '{{effective_to}}': {
      source: 'employee_contracts.end_date',
      ring: 'contract',
    },
  };
  if (pack === 'DRIVER') {
    return {
      ...base,
      '{{driver_license_number}}': {
        source: 'employee_contracts.driver_license_number',
        ring: 'public',
      },
      '{{driver_license_class}}': {
        source: 'employee_contracts.license_class',
        ring: 'public',
      },
      '{{driver_license_issued_on}}': {
        source: 'employee_contracts.driver_license_issued_on',
        ring: 'public',
      },
      '{{driver_license_issued_place}}': {
        source: 'employee_contracts.driver_license_issued_place',
        ring: 'public',
      },
      '{{license_class}}': {
        source: 'employee_contracts.license_class',
        ring: 'public',
      },
      '{{vehicle_plate}}': {
        source: 'employee_contracts.vehicle_plate',
        ring: 'public',
      },
    };
  }
  return base;
}

export function docKindFromTemplateCode(
  templateCode: string | null | undefined,
): 'HDTV' | 'HDLD' {
  const u = (templateCode ?? '').toUpperCase();
  return u.includes('PROBATION') ? 'HDTV' : 'HDLD';
}

export function termTypeLabelVi(term: string | null | undefined): string {
  switch ((term ?? '').toLowerCase()) {
    case 'probation':
      return 'Thử việc';
    case 'definite':
      return 'Xác định thời hạn';
    case 'indefinite':
      return 'Không xác định thời hạn';
    case 'seasonal_other':
      return 'Theo mùa vụ / khác';
    default:
      return term?.trim() || '';
  }
}

export function normalizeContractPackCode(
  raw: string | undefined | null,
): ContractPackCode | null {
  if (!raw?.trim()) return null;
  const u = raw.trim().toUpperCase();
  return (CONTRACT_PACK_CODES as readonly string[]).includes(u)
    ? (u as ContractPackCode)
    : null;
}

export function assertContractPackCode(
  raw: string | undefined | null,
): ContractPackCode {
  const n = normalizeContractPackCode(raw);
  if (!n) {
    throw Object.assign(new Error(HRM_CTR_PACK_INVALID), {
      code: HRM_CTR_PACK_INVALID,
    });
  }
  return n;
}
