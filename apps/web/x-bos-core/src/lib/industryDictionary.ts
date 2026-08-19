// @CODE-MEMORY WorkItem: D-HRM-CO-01-INDUSTRY-FE-01
// Dictionary: Ngành nghề (industry) — XBOS Plane A SoT
//
// SoT: `xbos_legal_entity.business_lines` (TEXT) + VI display dictionary.
// Cấm bind `entity_type` (org class) vào cột «Ngành nghề» — xem TECHSPEC §20.3.
//
// Canonical keys align SRS / TECHSPEC §20.3 + API_DESIGN_HRM_COMPANY_LIST §3.
// Free-text Vietnamese already in `business_lines` is preserved as-is (display).
// Tokens from `entity_type` blocklist (holding/subsidiary/parent/member/branch)
// are treated as MISBIND → display «—», never rendered as industry.

/** Canonical industry key → Vietnamese display label. */
export const INDUSTRY_DICTIONARY: Record<string, string> = {
  it: 'Công nghệ thông tin',
  manufacturing: 'Sản xuất',
  trading: 'Thương mại',
  services: 'Dịch vụ',
  finance: 'Tài chính - Ngân hàng',
  realestate: 'Bất động sản',
  education: 'Giáo dục',
  healthcare: 'Y tế',
  tourism: 'Du lịch - Khách sạn',
  logistics: 'Vận tải - Logistics',
  construction: 'Xây dựng',
  other: 'Khác',
};

/** Keys that are org-class tokens (entity_type), NEVER industry. */
export const INDUSTRY_MISBIND_BLOCKLIST = new Set([
  'holding',
  'subsidiary',
  'parent',
  'member',
  'branch',
]);

/**
 * Resolve a raw `business_lines` / payload industry value into a VI display label.
 *
 * Rules (TECHSPEC §20.3 / §20.5):
 *  1. null/empty/whitespace → null (UI renders «—»)
 *  2. blocklist token (entity_type misbind) → null (UI renders «—»)
 *  3. known catalog key → VI label
 *  4. otherwise → raw free-text Vietnamese, trimmed, as-is
 */
export function resolveIndustryLabel(value: string | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (INDUSTRY_MISBIND_BLOCKLIST.has(trimmed.toLowerCase())) return null;
  const direct = INDUSTRY_DICTIONARY[trimmed];
  if (direct) return direct;
  const lower = trimmed.toLowerCase();
  const fromLower = INDUSTRY_DICTIONARY[lower];
  return fromLower ?? trimmed;
}

/** Canonical industry keys, sorted by VI label (for Select options). */
export function listIndustryOptions(): Array<{ code: string; label: string }> {
  return Object.entries(INDUSTRY_DICTIONARY)
    .map(([code, label]) => ({ code, label }))
    .sort((a, b) => a.label.localeCompare(b.label, 'vi'));
}
