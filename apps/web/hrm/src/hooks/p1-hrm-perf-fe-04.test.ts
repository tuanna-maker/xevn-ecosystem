import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { EXPIRING_CONTRACTS_DASHBOARD_QUERY_KEY } from '@/hooks/useExpiringContractsDashboard';
import { EMPLOYEES_SUMMARY_QUERY_KEY } from '@/hooks/useEmployeesSummary';

describe('P1-HRM-PERF-FE-04 — dashboard query keys', () => {
  it('employees summary and expiring contracts share stable RQ keys', () => {
    expect(EMPLOYEES_SUMMARY_QUERY_KEY).toBe('employees-summary');
    expect(EXPIRING_CONTRACTS_DASHBOARD_QUERY_KEY).toBe('expiring-contracts-dashboard');
  });

  it('App QueryClient default staleTime is 60s', () => {
    const appSrc = readFileSync(resolve(__dirname, '../App.tsx'), 'utf8');
    expect(appSrc).toContain('staleTime: 60_000');
  });

  it('Dashboard uses summary + shared expiring hook — not useEmployees list', () => {
    const dash = readFileSync(resolve(__dirname, '../pages/Dashboard.tsx'), 'utf8');
    expect(dash).toContain('useEmployeesSummary');
    expect(dash).toContain('useExpiringContractsDashboard');
    expect(dash).not.toMatch(/useEmployees\s*\(/);
  });

  it('D-HRM-DASH-NET-01 — dashboard load calls attendance/overview + payroll/payslips', () => {
    const dash = readFileSync(resolve(__dirname, '../pages/Dashboard.tsx'), 'utf8');
    expect(dash).toContain('useAttendanceOverview');
    expect(dash).toContain('usePayrollPayslips');
    expect(dash).not.toContain('listAttendanceRecords');
    expect(dash).not.toContain('attendance-dashboard');
  });
});
