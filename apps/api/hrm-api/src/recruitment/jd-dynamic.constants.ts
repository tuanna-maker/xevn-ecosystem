/**
 * @CODE-MEMORY
 * Screen:     HRM Cài đặt / Thư viện JD — dynamic field + group/pack codes
 * UC:         UC-BP-REC-00a/b/c · UC-00d..00h
 * SRS:        docs/program/specs/PO-HRM-JD-DYNAMIC-SPEC-01.md · PO-HRM-JD-GROUP-SPEC-01.md
 * TechSpec:   PO-HRM-JD-DYNAMIC-ARCH-02.md · PO-HRM-JD-GROUP-ARCH-01.md
 * Purpose:    Enum / reserved codes cho field type, group, pack (WORLD-BENCHMARK §4).
 * WorkItem:   PO-HRM-JD-DYNAMIC-BE-01
 * Coded:      2026-08-06
 * must_keep:  PACK_CORP_DEFAULT fallback · SEC_META title-first · no job_postings dual-write
 * SOLID:      Constants-only — no I/O
 * LastVerified: po-hrm-jd-dynamic-be-01.md
 */

export const JD_FIELD_TYPES = ['short_text', 'long_text', 'select', 'number', 'date'] as const;
export type JdFieldType = (typeof JD_FIELD_TYPES)[number];

export const JD_SYSTEM_FIELD_KEYS = ['title', 'code', 'position_code'] as const;

export const JD_SECTION_HINTS = [
  'hero',
  'summary',
  'responsibilities',
  'requirements',
  'benefits',
  'other',
  'meta',
] as const;

export const JD_GROUP_KINDS = ['system_skeleton', 'tenant_custom'] as const;
export const JD_GROUP_USAGES = ['default_eligible', 'optional_only'] as const;
export const JD_VIEW_STYLES = [
  'heading',
  'bullets',
  'chips',
  'plain',
  'heading_block',
  'key_value',
] as const;

export const JD_PACK_MATCH_TYPES = [
  'job_family',
  'industry',
  'employment_work_mode',
  'fallback',
] as const;

/** Canonical pack codes (WORLD-BENCHMARK §3.5). PACK_COMPANY_DEFAULT = alias → CORP. */
export const PACK_CORP_DEFAULT = 'PACK_CORP_DEFAULT';
export const PACK_COMPANY_DEFAULT_ALIAS = 'PACK_COMPANY_DEFAULT';
export const PACK_IT_OFFICE = 'PACK_IT_OFFICE';
export const PACK_DRIVER_OPS = 'PACK_DRIVER_OPS';

export const SYSTEM_GROUP_DEFS: ReadonlyArray<{
  code: string;
  label: string;
  usage: 'default_eligible' | 'optional_only';
  view_style: string;
  sort_order: number;
}> = [
  { code: 'SEC_META', label: 'Thông tin đăng tuyển', usage: 'default_eligible', view_style: 'chips', sort_order: 0 },
  { code: 'SEC_ABOUT_ROLE', label: 'Giới thiệu vị trí', usage: 'default_eligible', view_style: 'plain', sort_order: 1 },
  {
    code: 'SEC_RESPONSIBILITIES',
    label: 'Mô tả / trách nhiệm',
    usage: 'default_eligible',
    view_style: 'bullets',
    sort_order: 2,
  },
  { code: 'SEC_REQ_MIN', label: 'Yêu cầu bắt buộc', usage: 'default_eligible', view_style: 'bullets', sort_order: 3 },
  { code: 'SEC_REQ_PREF', label: 'Yêu cầu ưu tiên', usage: 'default_eligible', view_style: 'bullets', sort_order: 4 },
  {
    code: 'SEC_WORKING',
    label: 'Thời gian & điều kiện làm việc',
    usage: 'default_eligible',
    view_style: 'plain',
    sort_order: 5,
  },
  { code: 'SEC_BENEFITS', label: 'Chế độ đãi ngộ', usage: 'default_eligible', view_style: 'bullets', sort_order: 6 },
  { code: 'SEC_GROWTH', label: 'Lộ trình phát triển', usage: 'optional_only', view_style: 'bullets', sort_order: 10 },
  {
    code: 'SEC_ABOUT_COMPANY',
    label: 'Về công ty / đội ngũ',
    usage: 'optional_only',
    view_style: 'plain',
    sort_order: 11,
  },
  { code: 'SEC_LICENSE', label: 'Giấy phép & chứng chỉ', usage: 'default_eligible', view_style: 'bullets', sort_order: 12 },
  { code: 'SEC_SAFETY', label: 'An toàn & tuân thủ', usage: 'default_eligible', view_style: 'bullets', sort_order: 13 },
  {
    code: 'SEC_PHYSICAL',
    label: 'Yêu cầu thể chất / môi trường',
    usage: 'optional_only',
    view_style: 'bullets',
    sort_order: 14,
  },
  {
    code: 'SEC_EEO',
    label: 'Cam kết đa dạng & cơ hội bình đẳng',
    usage: 'optional_only',
    view_style: 'plain',
    sort_order: 15,
  },
  { code: 'SEC_AI_TOOLS', label: 'Yêu cầu / ưu tiên AI', usage: 'optional_only', view_style: 'bullets', sort_order: 16 },
];

export type PackMembershipSpec = {
  always_on: string[];
  optional: string[];
};

export const PACK_MEMBERSHIP: Record<string, PackMembershipSpec> = {
  [PACK_IT_OFFICE]: {
    always_on: [
      'SEC_META',
      'SEC_ABOUT_ROLE',
      'SEC_RESPONSIBILITIES',
      'SEC_REQ_MIN',
      'SEC_REQ_PREF',
      'SEC_WORKING',
      'SEC_BENEFITS',
    ],
    optional: ['SEC_AI_TOOLS', 'SEC_GROWTH', 'SEC_ABOUT_COMPANY', 'SEC_EEO'],
  },
  [PACK_DRIVER_OPS]: {
    always_on: [
      'SEC_META',
      'SEC_ABOUT_ROLE',
      'SEC_RESPONSIBILITIES',
      'SEC_REQ_MIN',
      'SEC_LICENSE',
      'SEC_WORKING',
      'SEC_SAFETY',
      'SEC_BENEFITS',
    ],
    optional: ['SEC_REQ_PREF', 'SEC_PHYSICAL', 'SEC_GROWTH', 'SEC_ABOUT_COMPANY'],
  },
  [PACK_CORP_DEFAULT]: {
    always_on: [
      'SEC_META',
      'SEC_ABOUT_ROLE',
      'SEC_RESPONSIBILITIES',
      'SEC_REQ_MIN',
      'SEC_WORKING',
      'SEC_BENEFITS',
    ],
    optional: ['SEC_REQ_PREF', 'SEC_GROWTH', 'SEC_ABOUT_COMPANY', 'SEC_EEO'],
  },
};

export function normalizePackCode(code: string): string {
  const c = code.trim().toUpperCase();
  if (c === PACK_COMPANY_DEFAULT_ALIAS) return PACK_CORP_DEFAULT;
  return c;
}

export const SELECT_CATALOG_ALLOWLIST = [
  'job_titles',
  'employment_types',
  'work_modes',
  'departments',
  'locations',
] as const;
