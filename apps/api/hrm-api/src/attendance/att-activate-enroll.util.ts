import { createHash } from 'node:crypto';

const HCM_TIMEZONE = 'Asia/Ho_Chi_Minh';

const DD_MM_YYYY_RE = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;

/** Parse dd/MM/yyyy (CORE-07 wire) → ISO date YYYY-MM-DD. */
export function parseViEffectiveDateToIso(ddMmYyyy: string): string {
  const text = String(ddMmYyyy ?? '').trim();
  const m = DD_MM_YYYY_RE.exec(text);
  if (!m) {
    throw new Error(`effective_date must be dd/MM/yyyy: ${text}`);
  }
  const day = Number(m[1]);
  const month = Number(m[2]);
  const year = Number(m[3]);
  const dt = new Date(Date.UTC(year, month - 1, day));
  if (
    dt.getUTCFullYear() !== year ||
    dt.getUTCMonth() !== month - 1 ||
    dt.getUTCDate() !== day
  ) {
    throw new Error(`effective_date invalid calendar: ${text}`);
  }
  return `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day
    .toString()
    .padStart(2, '0')}`;
}

/** Last calendar day of month in Asia/Ho_Chi_Minh for ISO date. */
export function isLastDayOfMonthInHcm(effectiveDateIso: string): boolean {
  const [y, m, d] = effectiveDateIso.split('-').map(Number);
  const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return d === lastDay;
}

/**
 * BR-BP-LC-03-HALF — cuối tháng: nửa quỹ khởi tạo (floor policy annual / 2).
 * Full month: full policy annual_days.
 */
export function computeActivateEnrollEntitledDays(
  policyAnnualDays: number,
  effectiveDateIso: string,
): number {
  const annual = Number.isFinite(policyAnnualDays) ? policyAnnualDays : 0;
  if (annual <= 0) return 0;
  if (isLastDayOfMonthInHcm(effectiveDateIso)) {
    return Math.floor(annual / 2);
  }
  return annual;
}

/** R-ATT-12-IDEMPOTENT — stable dedupe key (DATA §6.1). */
export function buildActivateEnrollIdempotencyKey(
  companyId: string,
  employeeId: string,
  effectiveDateIso: string,
  eventId?: string | null,
): string {
  const base =
    eventId && eventId.trim()
      ? `event:${eventId.trim()}`
      : `${companyId.trim()}|${employeeId.trim()}|${effectiveDateIso}`;
  return createHash('sha256').update(base, 'utf8').digest('hex');
}

export function calendarYearFromIsoDate(effectiveDateIso: string): number {
  const y = Number(effectiveDateIso.slice(0, 4));
  return Number.isFinite(y) ? y : new Date().getUTCFullYear();
}

export function todayIsoInHcm(): string {
  const iso = new Intl.DateTimeFormat('en-CA', { timeZone: HCM_TIMEZONE }).format(new Date());
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(iso);
  return match ? match[1] : new Date().toISOString().slice(0, 10);
}
