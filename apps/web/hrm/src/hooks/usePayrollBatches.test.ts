import { describe, expect, it } from 'vitest';
import type { HrmPayrollPeriod, HrmPayslipRow } from '@/integrations/hrmApi';
import {
  mapPayrollPeriodToBatch,
  mapPayslipToPayrollRecord,
  parsePayrollAmount,
  resolvePayrollHeaderTotals,
  resolvePayrollPeriodCalendarMonth,
  resolvePeriodDisplayTotals,
} from './usePayrollBatches';

describe('usePayrollBatches mapping helpers', () => {
  it('maps period rollup from API for immediate batch refresh', () => {
    const period: HrmPayrollPeriod = {
      id: 'per-1',
      company_id: 'cmp-1',
      period_label: 'Kỳ tháng 8',
      start_date: '2026-08-01',
      end_date: '2026-08-31',
      status: 'processed',
      employee_count: 3,
      total_gross: '12000000',
      total_deduction: '1500000',
      total_net: '10500000',
      created_by: 'u-1',
      processed_at: null,
      closed_at: null,
      created_at: '2026-08-01T00:00:00.000Z',
      updated_at: '2026-08-02T00:00:00.000Z',
    };

    const mapped = mapPayrollPeriodToBatch(period);
    expect(mapped.employee_count).toBe(3);
    expect(mapped.total_gross).toBe(12000000);
    expect(mapped.total_deduction).toBe(1500000);
    expect(mapped.total_net).toBe(10500000);
    expect(mapped.status).toBe('approved');
  });

  it('maps process payslip_summary when list totals missing (R-PAY-W3-FE-SUMMARY-ZERO)', () => {
    const period: HrmPayrollPeriod = {
      id: 'cf38deac',
      company_id: 'main',
      period_label: 'QA-PAY-HIRE',
      start_date: '2026-07-31T17:00:00.000Z',
      end_date: '2026-08-30T17:00:00.000Z',
      status: 'processed',
      employee_count: 1,
      payslip_summary: { total_gross: 12345000, total_net: 12345000 },
      created_by: null,
      processed_at: '2026-08-07T10:37:16.994Z',
      closed_at: null,
      created_at: '2026-08-06T10:19:39.744Z',
      updated_at: '2026-08-07T10:37:16.994Z',
    };

    expect(resolvePeriodDisplayTotals(period)).toMatchObject({
      total_gross: 12345000,
      total_net: 12345000,
      source: 'payslip_summary',
    });
    const mapped = mapPayrollPeriodToBatch(period);
    expect(mapped.total_gross).toBe(12345000);
    expect(mapped.total_net).toBe(12345000);
  });

  it('resolves header cards from payslip line aggregate when period totals are zero', () => {
    const totals = resolvePayrollHeaderTotals(
      { total_gross: 0, total_deduction: 0, total_net: 0 },
      [
        {
          gross_salary: 12345000,
          net_salary: 12345000,
          insurance_deduction: 0,
          tax_deduction: 0,
          other_deduction: 0,
        },
      ],
    );
    expect(totals).toEqual({
      total_gross: 12345000,
      total_deduction: 0,
      total_net: 12345000,
      source: 'line_aggregate',
    });
  });

  it('prefers period totals over line aggregate when period has display-ready amounts', () => {
    const totals = resolvePayrollHeaderTotals(
      { total_gross: 10_000_000, total_deduction: 500_000, total_net: 9_500_000 },
      [{ gross_salary: 1, net_salary: 1, insurance_deduction: 0, tax_deduction: 0, other_deduction: 0 }],
    );
    expect(totals.source).toBe('period');
    expect(totals.total_net).toBe(9_500_000);
  });

  it('maps payslip rows for F5-safe detail records', () => {
    const payslip: HrmPayslipRow = {
      id: 'slip-1',
      employee_id: 'emp-1',
      employee_code: 'NV001',
      employee_name: 'Nguyen Van A',
      gross_amount: '15000000',
      deduction_amount: '1000000',
      net_amount: '14000000',
      status: 'draft',
      period_label: '08/2026',
    };

    const mapped = mapPayslipToPayrollRecord('period-1', payslip);
    expect(mapped.batch_id).toBe('period-1');
    expect(mapped.employee_id).toBe('emp-1');
    expect(mapped.gross_salary).toBe(15000000);
    expect(mapped.insurance_deduction).toBe(1000000);
    expect(mapped.net_salary).toBe(14000000);
  });

  it('parses invalid payroll amounts to zero', () => {
    expect(parsePayrollAmount('not-number')).toBe(0);
    expect(parsePayrollAmount(undefined)).toBe(0);
    expect(parsePayrollAmount(null)).toBe(0);
  });

  it('maps Jan 2026 VN period from UTC start_date (BE-01 same-month)', () => {
    expect(resolvePayrollPeriodCalendarMonth('2025-12-31T17:00:00.000Z')).toEqual({
      month: 1,
      year: 2026,
    });
    const mapped = mapPayrollPeriodToBatch({
      id: 'per-jan',
      company_id: 'main',
      period_label: 'QA-PAY-HIRE-05',
      start_date: '2025-12-31T17:00:00.000Z',
      end_date: '2026-01-31T17:00:00.000Z',
      status: 'draft',
      employee_count: 0,
      total_gross: '0',
      total_deduction: '0',
      total_net: '0',
      created_by: null,
      processed_at: null,
      closed_at: null,
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    });
    expect(mapped.period_month).toBe(1);
    expect(mapped.period_year).toBe(2026);
    expect(mapped.salary_period).toBe('01/2026');
  });
});
