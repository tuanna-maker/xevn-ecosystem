import { addDays, startOfDay } from 'date-fns';

/** Parse API date-only (YYYY-MM-DD) or ISO timestamp without timezone drift on display. */
export function parseHrmDateOnly(value: string | null | undefined): Date | null {
  if (!value || value === '0') return null;
  const raw = String(value).trim();
  if (!raw) return null;
  const datePart = raw.includes('T') ? raw.split('T')[0] : raw.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    const fallback = new Date(raw);
    return Number.isNaN(fallback.getTime()) || fallback.getTime() === 0 ? null : fallback;
  }
  const [y, m, d] = datePart.split('-').map(Number);
  const parsed = new Date(y, m - 1, d);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/** Safe vi-VN date — avoids epoch display for null/invalid API values. */
export function formatHrmDateVi(value: string | null | undefined): string {
  const d = parseHrmDateOnly(value);
  if (!d) return '-';
  return d.toLocaleDateString('vi-VN');
}

export type HrmExpiringContractRow = {
  end_date: string;
  status?: string;
};

/** Active contracts expiring within the next N days (excludes overdue/stale rows). */
export function filterUpcomingExpiringContracts<T extends HrmExpiringContractRow>(
  rows: T[],
  days = 30,
  today = new Date(),
): T[] {
  const windowStart = startOfDay(today);
  const windowEnd = addDays(windowStart, days);
  return rows
    .filter((row) => {
      if (row.status && row.status !== 'active') return false;
      const expiry = parseHrmDateOnly(row.end_date);
      if (!expiry) return false;
      return expiry >= windowStart && expiry <= windowEnd;
    })
    .sort(
      (a, b) =>
        (parseHrmDateOnly(a.end_date)?.getTime() ?? 0) -
        (parseHrmDateOnly(b.end_date)?.getTime() ?? 0),
    );
}
