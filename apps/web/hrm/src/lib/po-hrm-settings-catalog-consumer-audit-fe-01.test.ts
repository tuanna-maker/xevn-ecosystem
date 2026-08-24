/**
 * PO-HRM-SETTINGS-CATALOG-CONSUMER-AUDIT-FE-01 — source bind locks
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = join(__dirname, '..');

function read(rel: string): string {
  return readFileSync(join(root, rel), 'utf8');
}

describe.skip('PO-HRM-SETTINGS-CATALOG-CONSUMER-AUDIT-FE-01', () => {
  it('Contracts create wizard — department via departmentOptionsFromCatalog + CatalogSearchPicker', () => {
    const page = read('pages/Contracts.tsx');
    expect(page).toContain('departmentOptionsFromCatalog');
    expect(page).toContain('buildActiveContractFormFields');
    expect(page).not.toContain('useDepartments');
    const step1 = read('components/contracts/ContractCreateStep1GeneralGrid.tsx');
    expect(step1).toContain('ctr-create-department-picker');
    // PO-HRM-CTR-CREATE-PICKER-INLINE-PORTAL-CONDITIONAL-01: không hardcode chết inline —
    // searchPlacement phải điều kiện theo getHrmPortalMode (standalone = popover, portal = inline).
    expect(step1).toContain('getHrmPortalMode');
    expect(step1).toContain('searchPlacement={catalogSearchPlacement}');
    expect(step1).toContain('CatalogSearchPicker');
    expect(step1).not.toMatch(/departmentOptions\.map\(\(d\)/);
    const resolver = read('components/contracts/contractFormFieldResolver.ts');
    expect(resolver).toContain("'department'");
    expect(resolver).toContain('REQUIRED_CONTRACT_FORM_FIELDS');
  });

  it('EmployeeFormDialog — catalog dept/position helpers', () => {
    const form = read('components/employee/EmployeeFormDialog.tsx');
    expect(form).toContain('departmentOptionsFromCatalog');
    expect(form).toContain('jobTitleOptionsFromCatalog');
    expect(form).toContain('useSettingsCatalogsOverview');
  });

  it('JobRequisitionsTab — position + dept catalog helpers', () => {
    const tab = read('components/recruitment/JobRequisitionsTab.tsx');
    expect(tab).toContain('jobTitleOptionsFromCatalog');
    expect(tab).toContain('requisitionDepartmentPickerOptions');
    expect(tab).toContain('useSettingsCatalogsOverview');
  });

  it('SalaryComponentsTab — pay_types consumer (AC-SET-CONSUMER-PT-PAY-01)', () => {
    const tab = read('components/payroll/SalaryComponentsTab.tsx');
    expect(tab).toContain('payTypeOptionsFromCatalog');
    expect(tab).toContain('resolvePayTypeLabel');
    expect(tab).toContain('allowedPayTypeCodesRef');
    expect(tab).toContain('hdsd-pay-salary-component-type');
    expect(tab).not.toMatch(/componentTypes\.map/);
  });
});
