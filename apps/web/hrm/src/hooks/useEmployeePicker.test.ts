import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  buildEmployeePickerQueryKey,
  EMPLOYEE_PICKER_QUERY_KEY,
  HRM_EMPLOYEE_PICKER_MAX_PAGES,
  HRM_EMPLOYEE_PICKER_PAGE_SIZE,
} from '@/hooks/useEmployeePicker';
import { HRM_API_MAX_PAGE_SIZE } from '@/lib/hrmDataMode';

describe('P1-HRM-SCALE-FE-W2 — employee picker cap', () => {
  it('picker page size stays within Nest @Max(100) and ADR ≤50 default', () => {
    expect(HRM_EMPLOYEE_PICKER_PAGE_SIZE).toBe(50);
    expect(HRM_EMPLOYEE_PICKER_PAGE_SIZE).toBeLessThanOrEqual(HRM_API_MAX_PAGE_SIZE);
    expect(HRM_EMPLOYEE_PICKER_MAX_PAGES).toBe(1);
  });

  it('buildEmployeePickerQueryKey is stable for scope + keyword', () => {
    expect(buildEmployeePickerQueryKey('main', { keyword: '  anh  ' })).toEqual([
      EMPLOYEE_PICKER_QUERY_KEY,
      'main',
      'anh',
      HRM_EMPLOYEE_PICKER_PAGE_SIZE,
      false,
      '',
    ]);
  });

  it('fetchEmployeePickerPage uses listEmployees page=1 only (no listAllEmployees call)', () => {
    const src = readFileSync(
      resolve(__dirname, 'useEmployeePicker.ts'),
      'utf8',
    );
    expect(src).toContain('listEmployees');
    expect(src).not.toMatch(/listAllEmployees\(/);
    expect(src).not.toMatch(/import\s*\{[^}]*listAllEmployees/);
    expect(src).toContain('page: 1');
    expect(src).toContain('isCapped');
  });

  it('useEmployees satellite hook no longer calls listAllEmployees', () => {
    const src = readFileSync(resolve(__dirname, 'useEmployees.ts'), 'utf8');
    expect(src).not.toMatch(/listAllEmployees\(/);
    expect(src).not.toMatch(/import\s*\{[^}]*listAllEmployees/);
    expect(src).toContain('fetchEmployeePickerPage');
    expect(src).toContain('EMPLOYEE_PICKER_QUERY_KEY');
  });

  it('AddInsuranceDialog uses typeahead picker (no listAllEmployees call)', () => {
    const src = readFileSync(
      resolve(__dirname, '../components/insurance/AddInsuranceDialog.tsx'),
      'utf8',
    );
    expect(src).not.toMatch(/listAllEmployees\(/);
    expect(src).not.toMatch(/import\s*\{[^}]*listAllEmployees/);
    expect(src).toContain('useEmployeePickerSearch');
    expect(src).toContain('useDebouncedPickerKeyword');
  });

  it('CompanyMembersManagement uses capped listEmployees (no listAllEmployees call)', () => {
    const src = readFileSync(
      resolve(__dirname, '../components/company/CompanyMembersManagement.tsx'),
      'utf8',
    );
    expect(src).not.toMatch(/listAllEmployees\(/);
    expect(src).not.toMatch(/import\s*\{[^}]*listAllEmployees/);
    expect(src).toContain('listEmployees');
    expect(src).toContain('page_size: HRM_API_MAX_PAGE_SIZE');
    expect(src).toContain('isLinkEmployeeDialogOpen');
    expect(src).toContain('isBulkInviteDialogOpen');
  });

  it('listAllEmployees remains export-only for Employees export/archive paths', async () => {
    const apiSrc = readFileSync(
      resolve(__dirname, '../integrations/hrmApi.ts'),
      'utf8',
    );
    expect(apiSrc).toMatch(/export async function listAllEmployees/);

    const employeesPage = readFileSync(
      resolve(__dirname, '../pages/Employees.tsx'),
      'utf8',
    );
    // Allowed: export + archived dialog only (enabled when dialog open)
    expect(employeesPage).toContain('listAllEmployees');
    expect(employeesPage).toContain('exportDialogOpen');
    expect(employeesPage).toContain('deletedDialogOpen');
    // Table path still uses useEmployeesPage
    expect(employeesPage).toContain('useEmployeesPage');
  });
});
