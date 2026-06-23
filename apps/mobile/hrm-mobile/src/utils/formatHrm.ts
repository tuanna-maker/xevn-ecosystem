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

/** vi-VN date — dd/MM/yyyy; returns «—» for invalid/null API values. */
export function formatHrmDate(value: string | null | undefined): string {
  const d = parseHrmDateOnly(value);
  if (!d) return '—';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/** vi-VN date range — dd/MM/yyyy – dd/MM/yyyy; collapses when equal. */
export function formatHrmDateRange(
  start: string | null | undefined,
  end: string | null | undefined,
): string {
  const from = formatHrmDate(start);
  const to = formatHrmDate(end);
  if (from === '—' && to === '—') return '—';
  if (from === to) return from;
  return `${from} – ${to}`;
}

/** vi-VN datetime — dd/MM/yyyy HH:mm; returns «—» for invalid/null. */
export function formatHrmDateTime(value: string | null | undefined): string {
  if (!value || value === '0') return '—';
  const raw = String(value).trim();
  if (!raw) return '—';
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime()) || parsed.getTime() === 0) return '—';
  const datePart = formatHrmDate(raw);
  const hours = String(parsed.getHours()).padStart(2, '0');
  const minutes = String(parsed.getMinutes()).padStart(2, '0');
  return `${datePart} ${hours}:${minutes}`;
}

/** Normalize API amount (number or string) for display math. */
export function parseAmount(raw: string | number | null | undefined): number {
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : 0;
  if (typeof raw === 'string') {
    const n = Number.parseFloat(raw.replace(/,/g, ''));
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

/** vi-VN currency — Intl VND parity with web PayrollPayslipsApiTab. */
export function formatHrmCurrency(
  amount: string | number | null | undefined,
  currency = 'VND',
): string {
  const n = parseAmount(amount);
  if (currency === 'VND') {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
  }
  return `${n.toLocaleString('vi-VN')} ${currency}`;
}

const SEED_PREFIX = 'seed:';

/** Hide UAT seed prefix from end-user display. */
export function sanitizeSeedDisplay(text: string | null | undefined): string {
  if (text == null) return '—';
  const raw = String(text).trim();
  if (!raw) return '—';
  if (raw.toLowerCase().startsWith(SEED_PREFIX)) {
    return 'Dữ liệu mẫu UAT';
  }
  return raw;
}
