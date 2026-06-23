import { describe, expect, it } from 'vitest';
import type { InsuranceListItem } from '@/hooks/useInsuranceList';
import {
  aggregateInsuranceSummary,
  buildPolicyParticipantFinancialMap,
  calculateInsuranceContribution,
  enrichInsuranceListItemFinancials,
  formatInsuranceSummaryValue,
} from './insuranceSummary';

const formatCurrency = (amount: number | null) => {
  if (!amount) return '-';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const baseItem = (overrides: Partial<InsuranceListItem> = {}): InsuranceListItem => ({
  id: 'ins-1',
  employee_code: 'LOG-0003',
  employee_name: 'Lê Văn An',
  employee_avatar: null,
  department: 'HR',
  social_insurance_number: 'BH-001',
  health_insurance_number: null,
  unemployment_insurance_number: null,
  social_insurance_rate: null,
  health_insurance_rate: null,
  unemployment_insurance_rate: null,
  base_salary: null,
  effective_date: '2025-01-01',
  expiry_date: '2026-12-31',
  status: 'active',
  notes: null,
  created_at: '2025-01-01T00:00:00.000Z',
  company_id: 'main',
  ...overrides,
});

describe('aggregateInsuranceSummary (D-HRM-INS-SUMMARY-01)', () => {
  it('returns participant counts when financial fields are absent on list rows', () => {
    const summary = aggregateInsuranceSummary([
      baseItem(),
      baseItem({ id: 'ins-2', employee_code: 'LOG-0004', social_insurance_number: 'BH-002' }),
    ]);
    expect(summary.bhxhCount).toBe(2);
    expect(summary.bhytCount).toBe(0);
    expect(summary.participantCount).toBe(2);
    expect(summary.hasFinancialData).toBe(false);
    expect(summary.totalAmount).toBe(0);
  });

  it('computes monetary totals when base_salary and rates are present', () => {
    const summary = aggregateInsuranceSummary([
      baseItem({
        base_salary: 10_000_000,
        social_insurance_rate: 8,
        health_insurance_number: 'YT-1',
        health_insurance_rate: 1.5,
        unemployment_insurance_number: 'TN-1',
        unemployment_insurance_rate: 1,
      }),
    ]);
    expect(summary.bhxhAmount).toBe(800_000);
    expect(summary.bhytAmount).toBe(150_000);
    expect(summary.bhtnAmount).toBe(100_000);
    expect(summary.totalAmount).toBe(1_050_000);
    expect(summary.hasFinancialData).toBe(true);
  });

  it('uses statutory default rates when insurance number exists but rate is null', () => {
    const amount = calculateInsuranceContribution(10_000_000, null, true, 8);
    expect(amount).toBe(800_000);
  });
});

describe('formatInsuranceSummaryValue', () => {
  it('shows count instead of dash when records exist without salary', () => {
    expect(formatInsuranceSummaryValue(0, 2, formatCurrency)).toBe('2');
  });

  it('prefers currency when amount is positive', () => {
    const display = formatInsuranceSummaryValue(800_000, 2, formatCurrency);
    expect(display).toContain('800');
    expect(display).not.toBe('2');
  });

  it('shows dash only when no records for the type', () => {
    expect(formatInsuranceSummaryValue(0, 0, formatCurrency)).toBe('-');
  });
});

describe('enrichInsuranceListItemFinancials', () => {
  it('merges catalog participant salary/rates by employee_code', () => {
    const map = buildPolicyParticipantFinancialMap([
      {
        employee_code: 'LOG-0003',
        base_salary: 12_000_000,
        social_insurance_rate: 8,
        health_insurance_rate: 1.5,
        unemployment_insurance_rate: 1,
      },
    ]);
    const enriched = enrichInsuranceListItemFinancials(baseItem(), map);
    expect(enriched.base_salary).toBe(12_000_000);
    expect(enriched.social_insurance_rate).toBe(8);
    const summary = aggregateInsuranceSummary([enriched]);
    expect(summary.bhxhAmount).toBe(960_000);
    expect(summary.hasFinancialData).toBe(true);
  });
});
