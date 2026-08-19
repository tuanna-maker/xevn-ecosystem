import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const tabSrc = readFileSync(
  resolve(__dirname, '../components/payroll/SalaryComponentsTab.tsx'),
  'utf8',
);
const schemaSrc = readFileSync(
  resolve(__dirname, '../components/payroll/salaryComponentFormSchema.ts'),
  'utf8',
);
const pickerSrc = readFileSync(resolve(__dirname, './catalogSearchPicker.ts'), 'utf8');

describe('D-FE-HRM-PAY-PAY-TYPE-CONSUMER-REG-01 source locks', () => {
  it('catalog helpers — pay_types family merge + label resolve', () => {
    expect(pickerSrc).toContain('payTypeOptionsFromCatalog');
    expect(pickerSrc).toContain('resolvePayTypeLabel');
    expect(pickerSrc).toContain("payTypes: ['pay_types', 'component_types', 'pay_natures', 'salary_component_types']");
  });

  it('SalaryComponentsTab — overview, picker, Zod allowed codes, catalog filter', () => {
    expect(tabSrc).toContain('useSettingsCatalogsOverview');
    expect(tabSrc).toContain('payTypeOptionsFromCatalog');
    expect(tabSrc).toContain('resolvePayTypeLabel');
    expect(tabSrc).toContain('allowedPayTypeCodesRef');
    expect(tabSrc).toContain('component_type: values.componentType');
    expect(tabSrc).toContain('hdsd-pay-salary-component-type');
    expect(tabSrc).toContain('pay-salary-component-type-settings-cta');
    expect(tabSrc).toContain("hrmPathWithEmbedSearch('/settings?tab=master-data')");
    expect(tabSrc).toContain('payTypeOptions.map((type) =>');
    expect(tabSrc).toContain('comp.component_type === componentTypeFilter');
    expect(tabSrc).not.toMatch(/componentTypes\.map/);
  });

  it('salaryComponentFormSchema — invent ban when allowed pay_types non-empty', () => {
    expect(schemaSrc).toContain('getAllowedComponentTypes');
    expect(schemaSrc).toContain('typeNotInCatalog');
  });
});
