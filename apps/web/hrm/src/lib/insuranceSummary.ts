import type { InsuranceListItem } from '@/hooks/useInsuranceList';

/** Statutory employer contribution defaults (matches AddInsuranceDialog). */
export const DEFAULT_INSURANCE_RATES = {
  social: 8,
  health: 1.5,
  unemployment: 1,
} as const;

export type InsuranceSummaryTotals = {
  bhxhAmount: number;
  bhytAmount: number;
  bhtnAmount: number;
  totalAmount: number;
  bhxhCount: number;
  bhytCount: number;
  bhtnCount: number;
  participantCount: number;
  hasFinancialData: boolean;
};

export function resolveInsuranceRate(
  rate: number | null | undefined,
  hasInsurance: boolean,
  defaultRate: number,
): number | null {
  if (rate != null && rate > 0) return rate;
  if (hasInsurance) return defaultRate;
  return null;
}

export function calculateInsuranceContribution(
  baseSalary: number | null | undefined,
  rate: number | null | undefined,
  hasInsurance: boolean,
  defaultRate: number,
): number {
  const effectiveRate = resolveInsuranceRate(rate, hasInsurance, defaultRate);
  if (!baseSalary || baseSalary <= 0 || effectiveRate == null) return 0;
  return (baseSalary * effectiveRate) / 100;
}

export function aggregateInsuranceSummary(items: InsuranceListItem[]): InsuranceSummaryTotals {
  let bhxhAmount = 0;
  let bhytAmount = 0;
  let bhtnAmount = 0;
  let bhxhCount = 0;
  let bhytCount = 0;
  let bhtnCount = 0;

  for (const item of items) {
    const hasBhxh = !!item.social_insurance_number?.trim();
    const hasBhyt = !!item.health_insurance_number?.trim();
    const hasBhtn = !!item.unemployment_insurance_number?.trim();

    if (hasBhxh) bhxhCount += 1;
    if (hasBhyt) bhytCount += 1;
    if (hasBhtn) bhtnCount += 1;

    bhxhAmount += calculateInsuranceContribution(
      item.base_salary,
      item.social_insurance_rate,
      hasBhxh,
      DEFAULT_INSURANCE_RATES.social,
    );
    bhytAmount += calculateInsuranceContribution(
      item.base_salary,
      item.health_insurance_rate,
      hasBhyt,
      DEFAULT_INSURANCE_RATES.health,
    );
    bhtnAmount += calculateInsuranceContribution(
      item.base_salary,
      item.unemployment_insurance_rate,
      hasBhtn,
      DEFAULT_INSURANCE_RATES.unemployment,
    );
  }

  const totalAmount = bhxhAmount + bhytAmount + bhtnAmount;

  return {
    bhxhAmount,
    bhytAmount,
    bhtnAmount,
    totalAmount,
    bhxhCount,
    bhytCount,
    bhtnCount,
    participantCount: items.length,
    hasFinancialData: totalAmount > 0,
  };
}

export function formatInsuranceSummaryValue(
  amount: number,
  count: number,
  formatCurrency: (value: number | null) => string,
): string {
  if (amount > 0) return formatCurrency(amount);
  if (count > 0) return String(count);
  return '-';
}

export type PolicyParticipantFinancials = {
  base_salary: number | null;
  social_insurance_rate: number | null;
  health_insurance_rate: number | null;
  unemployment_insurance_rate: number | null;
};

export function buildPolicyParticipantFinancialMap(
  rows: Record<string, unknown>[],
): Map<string, PolicyParticipantFinancials> {
  const map = new Map<string, PolicyParticipantFinancials>();
  for (const row of rows) {
    const code = String(row.employee_code ?? '').trim().toUpperCase();
    if (!code) continue;
    const existing = map.get(code);
    const next: PolicyParticipantFinancials = {
      base_salary:
        row.base_salary != null && Number(row.base_salary) > 0
          ? Number(row.base_salary)
          : (existing?.base_salary ?? null),
      social_insurance_rate:
        row.social_insurance_rate != null
          ? Number(row.social_insurance_rate)
          : (existing?.social_insurance_rate ?? null),
      health_insurance_rate:
        row.health_insurance_rate != null
          ? Number(row.health_insurance_rate)
          : (existing?.health_insurance_rate ?? null),
      unemployment_insurance_rate:
        row.unemployment_insurance_rate != null
          ? Number(row.unemployment_insurance_rate)
          : (existing?.unemployment_insurance_rate ?? null),
    };
    map.set(code, next);
  }
  return map;
}

export function enrichInsuranceListItemFinancials(
  item: InsuranceListItem,
  financials: Map<string, PolicyParticipantFinancials>,
): InsuranceListItem {
  const fin = financials.get(item.employee_code.trim().toUpperCase());
  if (!fin) return item;
  return {
    ...item,
    base_salary: item.base_salary ?? fin.base_salary,
    social_insurance_rate: item.social_insurance_rate ?? fin.social_insurance_rate,
    health_insurance_rate: item.health_insurance_rate ?? fin.health_insurance_rate,
    unemployment_insurance_rate:
      item.unemployment_insurance_rate ?? fin.unemployment_insurance_rate,
  };
}
