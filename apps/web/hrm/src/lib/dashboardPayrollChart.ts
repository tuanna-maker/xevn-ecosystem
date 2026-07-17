/**
 * @CODE-MEMORY
 * Screen: /dashboard · Tổng hợp lương charts
 * UC: UC-HRM-20 (ops tiles separate); payroll sub-charts from employees/summary.payroll
 * BR: R-DASH-PAYROLL-CHART-0 — never show fake 0 VNĐ when salary aggregate is absent
 * SRS: docs/hrm/SRS.md UC-HRM-20 · dashboard payroll summary
 * TechSpec: GET /api/hrm/employees/summary → payroll.total / employees_with_salary
 * Purpose: Gate dashboard payroll amounts/charts so missing salary fields on employee
 *   rows are shown as an honest empty state (Processes/Tools pattern), not zero charts.
 * WorkItem: R-DASH-PAYROLL-CHART-0
 * Coded: 2026-07-17
 * Callers: pages/Dashboard.tsx
 * Callees: HrmEmployeeSummary.payroll
 * must_keep: employees_with_salary > 0 required before rendering VNĐ amounts
 * SOLID: Pure availability predicate — no UI / no fetch
 * LastVerified: lib/dashboardPayrollChart.test.ts
 */

import type { HrmEmployeeSummary } from '@/integrations/hrmApi';

/** Honest copy when summary loaded but no employee salary fields to aggregate. */
export const DASHBOARD_PAYROLL_CHART_EMPTY_VI =
  'Chưa có dữ liệu lương trên hồ sơ nhân sự — biểu đồ không hiển thị số 0 giả. Cập nhật lương tại module Lương hoặc hồ sơ NV.';

/**
 * True when employees/summary returned a usable salary aggregate.
 * Zero totals with employees_with_salary === 0 means data absent (not a real 0 VNĐ payroll).
 */
export function hasEmployeeSalaryAggregate(
  summary: Pick<HrmEmployeeSummary, 'payroll'> | null | undefined,
): boolean {
  if (!summary?.payroll) return false;
  return summary.payroll.employees_with_salary > 0;
}
