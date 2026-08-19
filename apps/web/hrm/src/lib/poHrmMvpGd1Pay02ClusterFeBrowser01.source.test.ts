/**
 * Source lock — PO-HRM-MVP-GD1-PAY-02-CLUSTER-FE-BROWSER-01
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = join(__dirname, '..');

function read(rel: string): string {
  return readFileSync(join(root, rel), 'utf8');
}

describe('PO-HRM-MVP-GD1-PAY-02-CLUSTER-FE-BROWSER-01 source lock', () => {
  it('CatalogSearchPicker — cmdk harness testids + pointer select', () => {
    const picker = read('components/common/CatalogSearchPicker.tsx');
    expect(picker).toContain('catalog-picker-search');
    expect(picker).toContain('onPointerDown');
    expect(picker).toContain('catalog-picker-option-');
  });

  it('SalaryComponentsTab — QA salary component dialog testids', () => {
    const tab = read('components/payroll/SalaryComponentsTab.tsx');
    expect(tab).toContain('hdsd-pay-salary-component-add');
    expect(tab).toContain('pay-salary-component-code-input');
    expect(tab).toContain('pay-salary-component-name-input');
    expect(tab).toContain('hdsd-pay-salary-component-type');
    expect(tab).toContain('hdsd-pay-salary-component-save');
  });

  it('PayFormulaAuthorPanel — seed align Nest catalog', () => {
    const panel = read('components/payroll/PayFormulaAuthorPanel.tsx');
    expect(panel).toContain('alignGd1EvalLinesToNestCatalog');
    expect(panel).toContain('PO-HRM-MVP-GD1-PAY-02-CLUSTER-FE-BROWSER-01');
  });

  it('Payroll — payroll-tab-components explicit', () => {
    const payroll = read('pages/Payroll.tsx');
    expect(payroll).toContain('payroll-tab-components');
  });

  it('payFormulaCatalog — align helper', () => {
    const cat = read('lib/payFormulaCatalog.ts');
    expect(cat).toContain('alignGd1EvalLinesToNestCatalog');
  });
});
