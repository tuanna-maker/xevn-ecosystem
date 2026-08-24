/**
 * @CODE-MEMORY
 * Screen:     Shared VI number format (portal CC + HRM + mobile consumers)
 * UC:         Sponsor VI format project-wide
 * Purpose:    Format/parse integers with vi-VN thousand separators (1.234.567).
 *             Store/submit always as number — never string payloads.
 * WorkItem:   D-UX-VI-FORMAT-SHARED-01
 * Coded:      2026-07-20
 * must_keep:  parse returns number; empty → 0; |n|<1000 ungrouped display
 * LastVerified: apps/web/web-portal viNumberFormat.test.ts (re-export)
 *
 * Decision — decimal rates:
 *   formatViGroupedDecimal / parseViGroupedDecimal exist for money-with-cents
 *   or rates (e.g. 1.234,56). Prefer integers for quantity/VND whole amounts.
 *   Do not use these for ratio % fields that stay type=number.
 */

/** Vietnamese grouped integers — dot thousands (vi-VN), e.g. 1.234.567. */
export function formatViGroupedInteger(value: number): string {
  if (!Number.isFinite(value)) return '';
  const truncated = Math.trunc(value);
  if (Math.abs(truncated) < 1000) return String(truncated);
  return truncated.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/** Strip grouping dots/spaces; keep digits only for integer parsing. */
export function parseViGroupedInteger(raw: string): number {
  const digits = raw.replace(/\D/g, '');
  if (digits === '') return 0;
  const parsed = Number(digits);
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Format decimal with vi-VN grouping (dot thousands, comma fraction).
 * Optional — use for rates / money with minor units; prefer integer for VND whole.
 */
export function formatViGroupedDecimal(value: number, fractionDigits = 2): string {
  if (!Number.isFinite(value)) return '';
  if (value === 0) return '';
  
  const factor = Math.pow(10, fractionDigits);
  const rounded = Math.round(value * factor) / factor;
  
  const parts = rounded.toString().split('.');
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  if (parts.length > 1) {
    return `${integerPart},${parts[1]}`;
  }
  
  return integerPart;
}

/**
 * Parse vi-VN grouped decimal (1.234,56 → 1234.56). Dots = thousands, comma = decimal.
 * Falls back to plain Number() when no comma present after stripping spaces.
 */
export function parseViGroupedDecimal(raw: string): number {
  const trimmed = raw.trim().replace(/\s/g, '');
  if (trimmed === '') return 0;
  const normalized = trimmed.includes(',')
    ? trimmed.replace(/\./g, '').replace(',', '.')
    : trimmed.replace(/\./g, '');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}
