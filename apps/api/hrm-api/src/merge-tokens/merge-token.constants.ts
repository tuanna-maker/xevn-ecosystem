/**
 * @CODE-MEMORY
 * Screen:     HRM MergeToken platform constants
 * UC:         BR-PLT-01 · AC-PLT-CTR-05 · VAL-PLT-TOK-01..05
 * BR:         BR-PLT-01..05 · BR-CD-F5-01 (ring cb ACL)
 * SRS:        docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md
 * TechSpec:   docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-TECHSPEC-01.md §1.1C · §6
 * DB_DESIGN:  docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-DATA-01.md §3
 * API_DESIGN: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-API-01.md F-PLT-TOK-*
 * Purpose:    Open catalog CHK sets + error codes for hrm_merge_tokens — format only, no closed token enum.
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-BE-01
 * Coded:      2026-08-07
 * must_keep:  soft-delete · DYNAMIC-LOCK · no CHECK token_key IN (N) · printable=false
 * SOLID:      Constants SRP — no I/O
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-be-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-ALLOWANCE-CATALOG-SYNC-BE-01
 * change_mode: ADD
 * What: EXPAND MERGE_TOKEN_ORIGINS + chk origin — allowance_catalog for PC/KT register
 * must_keep: soft-delete · no closed token_key enum
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-BE-01
 * change_mode: ADD
 * What: EXPAND MERGE_TOKEN_ORIGINS + chk origin — emp_catalog for DOC/ET register (retain allowance_catalog)
 * must_keep: soft-delete · single hrm_merge_tokens · no closed token_key enum · printable=false
 */

export const MERGE_TOKEN_RINGS = [
  'public',
  'company',
  'contract',
  'cb',
  'clause',
  'custom',
] as const;
export type MergeTokenRing = (typeof MERGE_TOKEN_RINGS)[number];

export const MERGE_TOKEN_STATUSES = ['draft', 'active', 'retired'] as const;
export type MergeTokenStatus = (typeof MERGE_TOKEN_STATUSES)[number];

export const MERGE_TOKEN_ORIGINS = [
  'builtin',
  'keyword_map',
  'extension_field',
  'import',
  'allowance_catalog',
  'emp_catalog',
] as const;
export type MergeTokenOrigin = (typeof MERGE_TOKEN_ORIGINS)[number];

export const MERGE_TOKEN_DOMAINS = [
  'CTR',
  'EMP',
  'REC',
  'ATT',
  'PAY',
  'SET',
  'CAT',
] as const;
export type MergeTokenDomain = (typeof MERGE_TOKEN_DOMAINS)[number];

/** Format-only — FORBIDDEN closed token_key enum (BR-PLT-05). */
export const MERGE_TOKEN_KEY_FORMAT =
  /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)*$/;

/** Dual legacy `#token#` — reject GĐ1 (Q-PLT-01 / VAL-PLT-TOK-04). */
export const MERGE_TOKEN_HASH_SYNTAX = /#[a-z][a-z0-9_.]*#/i;

export const HRM_PLT_CAT_CODE_INVALID = 'HRM-PLT-CAT-CODE-INVALID';
export const HRM_PLT_CAT_CODE_CONFLICT = 'HRM-PLT-CAT-CODE-CONFLICT';
export const HRM_PLT_PACK_INVALID = 'HRM-PLT-PACK-INVALID';
export const HRM_PLT_TOKEN_UNKNOWN = 'HRM-PLT-TOKEN-UNKNOWN';
export const HRM_PLT_SCHEMA_INVALID = 'HRM-PLT-SCHEMA-INVALID';
export const HRM_PLT_TOK_404 = 'HRM-PLT-TOK-404';

export type MergeTokenResolveSource =
  | 'issued'
  | 'registry'
  | 'keyword_map'
  | 'builtin'
  | 'override'
  | 'missing';

/**
 * Starter builtin bindings — bootstrap examples only, NOT a closed ceiling.
 * Maps token_key → source_path + ring + domain for empty-registry fallback step 4.
 */
export const MERGE_TOKEN_BUILTIN_DEFAULTS: ReadonlyArray<{
  tokenKey: string;
  sourcePath: string;
  ring: MergeTokenRing;
  domain: MergeTokenDomain;
  labelVi: string;
  /** Canonical key in print merged_fields bag */
  bagKey: string;
}> = [
  {
    tokenKey: 'employee.full_name',
    sourcePath: 'employee.full_name',
    ring: 'public',
    domain: 'EMP',
    labelVi: 'Họ tên nhân viên',
    bagKey: 'employee_full_name',
  },
  {
    tokenKey: 'contract.contract_number',
    sourcePath: 'contract.contract_code',
    ring: 'contract',
    domain: 'CTR',
    labelVi: 'Số hợp đồng',
    bagKey: 'contract_number',
  },
  {
    tokenKey: 'company.legal_name',
    sourcePath: 'company.legal_name',
    ring: 'company',
    domain: 'SET',
    labelVi: 'Tên pháp lý đơn vị',
    bagKey: 'employer_unit_label',
  },
  {
    tokenKey: 'driver.license_number',
    sourcePath: 'contract.driver_license_number',
    ring: 'public',
    domain: 'CTR',
    labelVi: 'Số GPLX',
    bagKey: 'driver_license_number',
  },
  {
    tokenKey: 'cb.base_salary',
    sourcePath: 'cb.base_salary',
    ring: 'cb',
    domain: 'CTR',
    labelVi: 'Lương cơ bản',
    bagKey: 'base_salary_amount',
  },
];

/** source_path / alias → merged_fields bag key (print-spine must_keep). */
export const MERGE_TOKEN_SOURCE_TO_BAG: Readonly<Record<string, string>> = {
  'employee.full_name': 'employee_full_name',
  employee_full_name: 'employee_full_name',
  'contract.contract_code': 'contract_code',
  'contract.contract_number': 'contract_number',
  'employee_contracts.contract_code': 'contract_code',
  contract_code: 'contract_code',
  contract_number: 'contract_number',
  'company.legal_name': 'employer_unit_label',
  'company.display_name': 'employer_unit_label',
  'company.address': 'employer_address',
  employer_unit_label: 'employer_unit_label',
  'contract.driver_license_number': 'driver_license_number',
  'employee_contracts.driver_license_number': 'driver_license_number',
  'employee_contracts.license_class': 'license_class',
  'employee_contracts.driver_license_issued_on': 'driver_license_issued_on',
  'employee_contracts.driver_license_issued_place': 'driver_license_issued_place',
  'employee_contracts.vehicle_plate': 'vehicle_plate',
  'employee_contracts.start_date': 'effective_from',
  'employee_contracts.end_date': 'effective_to',
  'hrm_contract_templates.title_print_vi': 'contract_title_print',
  'derived.term_type': 'term_type_label_vi',
  'settings.contract_number_pattern': 'number_pattern_hint',
  'cb.base_salary': 'base_salary_amount',
  base_salary_amount: 'base_salary_amount',
  effective_from: 'effective_from',
  effective_to: 'effective_to',
  term_type_label_vi: 'term_type_label_vi',
  contract_title_print: 'contract_title_print',
  driver_license_number: 'driver_license_number',
  driver_license_class: 'driver_license_class',
  license_class: 'license_class',
  vehicle_plate: 'vehicle_plate',
  /** F-EMP-TOK-05 — EMP catalog label aliases (DATA §5.2) */
  'employee.employment_type_label': 'employee_employment_type_label',
  employee_employment_type_label: 'employee_employment_type_label',
};
