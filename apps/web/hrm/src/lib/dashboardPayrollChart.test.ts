import { describe, expect, it } from 'vitest';
import {
  DASHBOARD_PAYROLL_CHART_EMPTY_VI,
  hasEmployeeSalaryAggregate,
} from './dashboardPayrollChart';

describe('dashboardPayrollChart (R-DASH-PAYROLL-CHART-0)', () => {
  it('exposes honest empty copy (no fake zero)', () => {
    expect(DASHBOARD_PAYROLL_CHART_EMPTY_VI).toMatch(/không hiển thị số 0 giả/i);
    expect(DASHBOARD_PAYROLL_CHART_EMPTY_VI).toMatch(/lương/i);
  });

  it('returns false when summary missing or employees_with_salary is 0', () => {
    expect(hasEmployeeSalaryAggregate(undefined)).toBe(false);
    expect(hasEmployeeSalaryAggregate(null)).toBe(false);
    expect(
      hasEmployeeSalaryAggregate({
        payroll: { total: 0, employees_with_salary: 0 },
      }),
    ).toBe(false);
  });

  it('returns true when at least one employee has salary', () => {
    expect(
      hasEmployeeSalaryAggregate({
        payroll: { total: 50_000_000, employees_with_salary: 3 },
      }),
    ).toBe(true);
  });
});
