import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('P1-HRM-PERF-FE-02 — useEmployees enabled gates', () => {
  it('TaskFormDialog defers employee/department fetch until open', () => {
    const src = readFileSync(
      resolve(__dirname, '../components/tasks/TaskFormDialog.tsx'),
      'utf8',
    );
    expect(src).toContain('useEmployees(false, undefined, { enabled: open })');
    expect(src).toContain('useDepartments({ enabled: open })');
  });

  it('InternalServices defers useEmployees until dialog open', () => {
    const src = readFileSync(resolve(__dirname, '../pages/InternalServices.tsx'), 'utf8');
    expect(src).toMatch(/useEmployees\([^)]*enabled:\s*dialogOpen/);
  });

  it('Attendance gates useEmployees off overview tab', () => {
    const src = readFileSync(resolve(__dirname, '../pages/Attendance.tsx'), 'utf8');
    expect(src).toContain('enabled: needsEmployeeList');
  });

  it('useEmployees never imports listAllEmployees', () => {
    const src = readFileSync(resolve(__dirname, 'useEmployees.ts'), 'utf8');
    expect(src).not.toMatch(/import\s*\{[^}]*listAllEmployees/);
    expect(src).toContain('fetchEmployeePickerPage');
    expect(src).toContain('enabled: enabled && companyIds.length > 0');
  });
});
