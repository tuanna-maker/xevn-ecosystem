/**
 * @CODE-MEMORY
 * Screen:     Settings HĐ / form HĐ — open catalog helpers (DYNAMIC LOCK)
 * UC:         FR-UC-BP-CORE-09d · AC-CTR-XEVN-01 · AC-CTR-XEVN-11
 * BR:         BR-CTR-TPL-DYN-01..04 · CORR-01
 * SRS:        docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-DYNAMIC-LOCK.md
 * TechSpec:   docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-CORR-01.md AC-11
 * Purpose:    Format gate + starter soft-warn helpers — **cấm** dùng starter 8 làm ceiling picker.
 * WorkItem:   PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-FE-01
 * Coded:      2026-08-07
 * Callers:    ContractLegalPrintSettingsPanel · ContractPrintSpinePanel (labels only)
 * must_keep:  Open catalog; CODE-INVALID = bad format only; printable=false
 * solid_convention_ack: Pure helpers; list/picker bind API rows — no FE invent 8-only list
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-core-09d-cluster-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-CORE-09D-CLUSTER-FE-01
 * What: formatTemplatePickerLabel — pack VI + term + duration + title_print · display-ready
 * Why: UC-BP-CORE-09d picker fidelity · matrix=xevn = family filter only (API)
 * must_keep: starter soft-warn ≠ ceiling · CODE-INVALID format-only · printable=false
 */

/** Bootstrap Excel starters — soft-warn / badge only. NOT a create/list ceiling. */
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

export type XevnStarterTemplateCode = (typeof XEVN_STARTER_TEMPLATE_CODES)[number];

export const CONTRACT_SETTING_ORG_SUFFIX = 'contract_number_org_suffix';
export const CONTRACT_SETTING_NUMBER_PATTERN = 'contract_number_pattern';
export const CONTRACT_NUMBER_PATTERN_DEFAULT = '{seq}/{yyyy}/{docKind}-{orgSuffix}';

export const CONTRACT_TERM_TYPES = ['probation', 'definite', 'indefinite'] as const;
export type ContractTermType = (typeof CONTRACT_TERM_TYPES)[number];

export const CONTRACT_TERM_TYPE_LABELS: Record<ContractTermType, string> = {
  probation: 'Thử việc',
  definite: 'Xác định thời hạn',
  indefinite: 'Không xác định thời hạn',
};

export const CONTRACT_MATRIX_FAMILIES = ['XEVN_MATRIX', 'LEGACY'] as const;
export type ContractMatrixFamily = (typeof CONTRACT_MATRIX_FAMILIES)[number];

export const CONTRACT_MATRIX_FAMILY_LABELS: Record<ContractMatrixFamily, string> = {
  XEVN_MATRIX: 'Ma trận X.E',
  LEGACY: 'Legacy',
};

export function normalizeTemplateCode(raw: string | undefined | null): string {
  return (raw ?? '').trim().toUpperCase();
}

/** DYNAMIC LOCK — format only (A-Z start, A-Z0-9_- , 2–64). Never «not in starter 8». */
export function isValidTemplateCodeFormat(code: string | undefined | null): boolean {
  const u = normalizeTemplateCode(code);
  return /^[A-Z][A-Z0-9_-]{1,63}$/.test(u);
}

export function isXevnStarterTemplateCode(
  code: string | undefined | null,
): code is XevnStarterTemplateCode {
  if (!code?.trim()) return false;
  return (XEVN_STARTER_TEMPLATE_CODES as readonly string[]).includes(
    normalizeTemplateCode(code),
  );
}

/** Soft warn VAL-XEVN-07 CORR — missing starters only; never block create #9+. */
export function missingStarterTemplateCodes(
  presentCodes: readonly string[],
): XevnStarterTemplateCode[] {
  const present = new Set(presentCodes.map((c) => normalizeTemplateCode(c)));
  return XEVN_STARTER_TEMPLATE_CODES.filter((c) => !present.has(c));
}

/** Open-catalog picker: all active API rows — no hardcode slice of 8. */
export function activeTemplatesForPicker<T extends { status?: string | null }>(
  items: readonly T[],
): T[] {
  return items.filter((t) => String(t.status ?? '').toLowerCase() === 'active');
}

/** Display-ready picker / list line — pack VI + term + duration + title. */
export function formatTemplatePickerLabel(tpl: {
  name_vi?: string | null;
  code?: string | null;
  template_code?: string | null;
  pack_code?: string | null;
  pack_label_vi?: string | null;
  default_term_type?: string | null;
  default_duration_days?: number | null;
  default_duration_months?: number | null;
  title_print_vi?: string | null;
  matrix_family?: string | null;
  status?: string | null;
}): string {
  const code = (tpl.template_code ?? tpl.code ?? '').trim();
  const name = (tpl.name_vi ?? '').trim() || code || 'Mẫu HĐ';
  const parts: string[] = [`${name}${code ? ` (${code})` : ''}`];
  const pack =
    (tpl.pack_label_vi ?? '').trim() ||
    (tpl.pack_code ? String(tpl.pack_code) : '');
  if (pack) parts.push(pack);
  const termKey = String(tpl.default_term_type ?? '').trim() as ContractTermType;
  const term =
    termKey && (CONTRACT_TERM_TYPES as readonly string[]).includes(termKey)
      ? CONTRACT_TERM_TYPE_LABELS[termKey]
      : termKey;
  if (term) parts.push(term);
  if (tpl.default_duration_months != null && Number.isFinite(tpl.default_duration_months)) {
    parts.push(`${tpl.default_duration_months} tháng`);
  } else if (tpl.default_duration_days != null && Number.isFinite(tpl.default_duration_days)) {
    parts.push(`${tpl.default_duration_days} ngày`);
  }
  if (tpl.title_print_vi?.trim()) parts.push(tpl.title_print_vi.trim());
  return parts.join(' · ');
}

export function parseOrgSuffixValue(value: Record<string, unknown> | null | undefined): string {
  if (!value || typeof value !== 'object') return '';
  const s = value.suffix;
  return typeof s === 'string' ? s.trim() : '';
}

export function parseNumberPatternValue(
  value: Record<string, unknown> | null | undefined,
): string {
  if (!value || typeof value !== 'object') return '';
  const p = value.pattern;
  return typeof p === 'string' ? p.trim() : '';
}

export function buildOrgSuffixSettingValue(suffix: string): Record<string, unknown> {
  return { suffix: suffix.trim() };
}

export function buildNumberPatternSettingValue(pattern: string): Record<string, unknown> {
  return { pattern: pattern.trim() || CONTRACT_NUMBER_PATTERN_DEFAULT };
}
