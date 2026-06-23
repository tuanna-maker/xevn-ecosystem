/**
 * Vietnamese grouped integers — dot thousands separator (vi-VN), e.g. 1.234.567.
 * Applied when |value| >= 1000.
 */
export function formatViGroupedInteger(value: number): string {
  if (!Number.isFinite(value)) return '';
  const truncated = Math.trunc(value);
  if (truncated === 0) return '';
  if (Math.abs(truncated) < 1000) return String(truncated);
  return truncated.toLocaleString('vi-VN');
}

/** Strip grouping dots/spaces; keep digits only for integer parsing. */
export function parseViGroupedInteger(raw: string): number {
  const digits = raw.replace(/\D/g, '');
  if (digits === '') return 0;
  const parsed = Number(digits);
  return Number.isFinite(parsed) ? parsed : 0;
}
