import { formatHrmCurrency } from '../utils/formatHrm';

/** Payroll payslip row shape from GET /payroll/payslips */
export type PayslipListRow = {
  id: string;
  period_id?: string;
  period_label: string;
  employee_name: string;
  gross_amount: number;
  deduction_amount: number;
  net_amount: number | null;
  status: string;
  currency: string;
};

/** BR-ZEN-03 — no fake salary when API omits or nulls net_amount. */
export function hasDisplayableNetAmount(amount: number | null | undefined): boolean {
  if (amount == null) return false;
  return Number.isFinite(amount);
}

/** Hero net display — masks null/invalid (BR-ZEN-03). */
export function formatPayslipHeroNet(
  amount: number | null | undefined,
  currency = 'VND',
): string {
  if (!hasDisplayableNetAmount(amount)) return '—';
  return formatHrmCurrency(amount, currency);
}

/**
 * API returns newest-first; first row is latest payslip for hero (J-MOB-34).
 */
export function splitPayslipHeroAndHistory(rows: PayslipListRow[]): {
  hero: PayslipListRow | null;
  history: PayslipListRow[];
} {
  if (rows.length === 0) return { hero: null, history: [] };
  const [hero, ...history] = rows;
  return { hero, history };
}

/**
 * Probe and pilot list payslips without `period_id`; period screen must not over-filter on wire.
 * Prefer rows for the navigated period; if none match, show all employee payslips (non-empty UX).
 */
export function filterPayslipsForPeriod(rows: PayslipListRow[], periodId?: string): PayslipListRow[] {
  const pid = periodId?.trim() ?? '';
  if (!pid || rows.length === 0) return rows;
  const matched = rows.filter((r) => r.period_id === pid);
  return matched.length > 0 ? matched : rows;
}

export function buildEmployeePayslipQuery(companyId: string, employeeId: string): string {
  return new URLSearchParams({ company_id: companyId, employee_id: employeeId }).toString();
}
