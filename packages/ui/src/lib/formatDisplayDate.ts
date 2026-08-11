/**
 * @CODE-MEMORY
 * Screen:     Shared VI date display (portal + HRM dual-export)
 * Purpose:    Safe display format — default dd/MM/yyyy; HH:mm only when pattern asks.
 *             Never throws RangeError on bad API values.
 * WorkItem:   D-UX-VI-FORMAT-SHARED-01
 * Coded:      2026-07-20
 * must_keep:  null/invalid → «—»; period_label MM/yyyy | yyyy-MM kept verbatim
 * LastVerified: apps/web/hrm formatDisplayDate.test.ts (re-export)
 *
 * Note — native `<input type="date">` cannot reliably show dd/MM/yyyy across browsers.
 * Prefer Calendar + Popover pattern (HRM shadcn) for fill UX; use this helper for display.
 */

export const VI_DATE_DISPLAY_PATTERN = 'dd/MM/yyyy';
export const VI_DATETIME_DISPLAY_PATTERN = 'dd/MM/yyyy HH:mm';

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

/** Apply a small set of date-fns-like tokens used in this monorepo. */
function applyPattern(d: Date, pattern: string): string {
  const tokens: Record<string, string> = {
    yyyy: String(d.getFullYear()),
    dd: pad2(d.getDate()),
    MM: pad2(d.getMonth() + 1),
    HH: pad2(d.getHours()),
    mm: pad2(d.getMinutes()),
  };
  return pattern.replace(/yyyy|dd|MM|HH|mm/g, (token) => tokens[token] ?? token);
}

function parseFlexibleDate(trimmed: string): Date | null {
  // ISO date-only yyyy-MM-dd — parse as local calendar date (avoid UTC day shift)
  const isoDateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (isoDateOnly) {
    const y = Number(isoDateOnly[1]);
    const m = Number(isoDateOnly[2]);
    const day = Number(isoDateOnly[3]);
    const local = new Date(y, m - 1, day);
    if (
      local.getFullYear() === y &&
      local.getMonth() === m - 1 &&
      local.getDate() === day
    ) {
      return local;
    }
    return null;
  }

  const native = new Date(trimmed);
  if (Number.isNaN(native.getTime())) return null;
  return native;
}

/** Safe date format — never throws RangeError on bad API/mock values. */
export function formatDisplayDate(
  value: string | null | undefined,
  pattern: string = VI_DATE_DISPLAY_PATTERN,
): string {
  if (value == null || value === '') return '—';
  const trimmed = String(value).trim();
  if (!trimmed) return '—';

  // period_label MM/yyyy | yyyy-MM trước Date() — JS `new Date('2026-07')` → sai ngữ nghĩa
  if (/^\d{1,2}\/\d{4}$/.test(trimmed) || /^\d{4}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  const parsed = parseFlexibleDate(trimmed);
  if (!parsed) return '—';
  return applyPattern(parsed, pattern);
}
