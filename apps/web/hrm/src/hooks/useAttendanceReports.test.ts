/**
 * @CODE-MEMORY
 * Screen:     unit — useAttendanceReports contract
 * WorkItem:   P1-HRM-MENU-QA-REPORTS-FIX / D-HRM-RPT-ATT-REF-01
 * Purpose:    Guard against reintroducing undefined attendanceError refs.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('useAttendanceReports source contract (D-HRM-RPT-ATT-REF-01)', () => {
  const raw = readFileSync(resolve(__dirname, 'useAttendanceReports.ts'), 'utf8');
  // Strip block comments so CODE-MEMORY prose does not false-positive.
  const source = raw.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');

  it('does not reference undefined Supabase leftover identifiers', () => {
    expect(source).not.toMatch(/\battendanceError\b/);
    expect(source).not.toMatch(/\bemployeesError\b/);
    expect(source).not.toMatch(/\bleaveError\b/);
    expect(source).not.toMatch(/\battendanceData\b/);
    expect(source).not.toMatch(/\bemployeesData\b/);
    expect(source).not.toMatch(/\bleaveData\b/);
    expect(source).not.toMatch(/\btrendRecords\b/);
  });

  it('wires Nest attendance/employees/leave APIs', () => {
    expect(source).toContain('listAttendanceRecords');
    expect(source).toContain('listEmployees');
    expect(source).toContain('listLeaveRequests');
  });
});
