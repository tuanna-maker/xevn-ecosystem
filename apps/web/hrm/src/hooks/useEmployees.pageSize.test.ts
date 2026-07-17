import { describe, expect, it } from 'vitest';
import { HRM_API_MAX_PAGE_SIZE } from '@/lib/hrmDataMode';
import { HRM_EMPLOYEES_TABLE_PAGE_SIZE } from '@/hooks/useEmployeesPage';

describe('P1-HRM-PAGESIZE-CRYPTO-8088 — employees list cap', () => {
  it('HRM_API_MAX_PAGE_SIZE is 100 (Nest @Max)', () => {
    expect(HRM_API_MAX_PAGE_SIZE).toBe(100);
  });

  it('Employees table default pageSize is 50 (ADR scale W1)', () => {
    expect(HRM_EMPLOYEES_TABLE_PAGE_SIZE).toBe(50);
    expect(HRM_EMPLOYEES_TABLE_PAGE_SIZE).toBeLessThanOrEqual(HRM_API_MAX_PAGE_SIZE);
  });

  it('listAllEmployees is exported for export/archive only; table uses listEmployees; pickers capped W2', async () => {
    const mod = await import('@/integrations/hrmApi');
    expect(typeof mod.listAllEmployees).toBe('function');
    expect(typeof mod.listEmployees).toBe('function');
    expect(typeof mod.getEmployeesSummary).toBe('function');

    const { HRM_EMPLOYEE_PICKER_MAX_PAGES, HRM_EMPLOYEE_PICKER_PAGE_SIZE } =
      await import('@/hooks/useEmployeePicker');
    expect(HRM_EMPLOYEE_PICKER_MAX_PAGES).toBe(1);
    expect(HRM_EMPLOYEE_PICKER_PAGE_SIZE).toBeLessThanOrEqual(HRM_API_MAX_PAGE_SIZE);
  });
});
