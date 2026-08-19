/**
 * Source lock — PO-HRM-MVP-GD1-PAY-02-CLUSTER-FE-01
 * GĐ1 formula author · dual publish · preview display-only · COMP-01 · ≠ PAY-02 DONE
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = join(__dirname, '..');

function read(rel: string): string {
  return readFileSync(join(root, rel), 'utf8');
}

function codeOnly(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
}

describe('PO-HRM-MVP-GD1-PAY-02-CLUSTER-FE-01 source lock', () => {
  it('PayFormulaAuthorPanel — formulas* · COMP-01 · preview lines · honesty', () => {
    const panel = read('components/payroll/PayFormulaAuthorPanel.tsx');
    const body = codeOnly(panel);
    expect(panel).toContain('PO-HRM-MVP-GD1-PAY-02-CLUSTER-FE-01');
    expect(panel).toContain('assertComp01FormulaLines');
    expect(panel).toContain('collectAlienNestSalaryComponentCodes');
    expect(panel).toContain('normalizePayFormulaPreviewLines');
    expect(panel).toContain('pay-formula-preview-lines-table');
    expect(panel).toContain('hdsd-pay-formula-publish');
    expect(panel).toContain('hdsd-pay-formula-submit-publish');
    expect(panel).toContain('HRM-PAY-FORMULA-403-DUAL');
    expect(panel).toContain('payroll_e2e_ready');
    expect(panel).toContain('previewPayFormula');
    expect(panel).toContain('listPayFormulas');
    expect(body).not.toContain('/api/hrm/core/');
    expect(body).not.toMatch(/payroll_e2e_ready\s*=\s*true/);
  });

  it('hrmApi formulas client — physical payroll path', () => {
    const api = read('integrations/hrmApi.ts');
    const body = codeOnly(api);
    expect(api).toContain('/api/hrm/payroll/formulas');
    expect(api).toContain('previewPayFormula');
    expect(body).not.toMatch(/previewPayFormula[\s\S]{0,400}\/api\/hrm\/core\//);
  });

  it('payFormulaCatalog preview normalize · salaryComponent COMP-01 helpers', () => {
    const cat = read('lib/payFormulaCatalog.ts');
    expect(cat).toContain('normalizePayFormulaPreviewLines');
    expect(cat).toContain('PO-HRM-MVP-GD1-PAY-02-CLUSTER-FE-01');
    const sc = read('lib/salaryComponentCatalog.ts');
    expect(sc).toContain('collectAlienNestSalaryComponentCodes');
    expect(sc).toContain('comp01RejectMessageVi');
    expect(sc).toContain('AC-PAY-COMP-01');
  });

  it('must_keep PAY01QC1 · Payroll tab formulas · ≠ module DONE footer', () => {
    const payroll = read('pages/Payroll.tsx');
    expect(payroll).toContain('PO-HRM-MVP-GD1-PAY-02-CLUSTER-FE-01');
    expect(payroll).toContain('PayFormulaAuthorPanel');
    expect(payroll).toContain('payroll-tab-formulas');
    const panel = read('components/payroll/PayFormulaAuthorPanel.tsx');
    expect(panel).toContain('PAY01QC1-MSMBGWC1');
    expect(panel).toContain('≠ PAY-02 DONE');
  });
});
