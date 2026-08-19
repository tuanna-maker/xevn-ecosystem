/**
 * Source lock — PO-HRM-MVP-GD1-PAY-04-CLUSTER-FE-01
 * segments[] display-only · GET /payroll/payslips/:id · no FE net merge · honesty footer.
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

describe('PO-HRM-MVP-GD1-PAY-04-CLUSTER-FE-01 source lock', () => {
  it('PayrollPayslipsApiTab binds GET payslip detail + segments panel', () => {
    const tab = read('components/payroll/PayrollPayslipsApiTab.tsx');
    const body = codeOnly(tab);
    expect(tab).toContain('PO-HRM-MVP-GD1-PAY-04-CLUSTER-FE-01');
    expect(tab).toContain('usePayrollPayslipDetail');
    expect(tab).toContain('PayslipSplitSegmentsPanel');
    expect(tab).toContain('pay-payslip-header-net');
    expect(body).not.toMatch(/segmentGrossVnd[\s\S]{0,120}\+\s*segmentGrossVnd/);
    expect(body).not.toMatch(/reduce\s*\(\s*\(\s*sum/);
    expect(body).not.toContain('/api/hrm/core/');
    expect(body).not.toMatch(/payroll_e2e_ready\s*=\s*true/);
  });

  it('hrmApi getPayrollPayslipById physical /payroll/payslips', () => {
    const src = read('integrations/hrmApi.ts');
    const body = codeOnly(src);
    expect(src).toContain('PO-HRM-MVP-GD1-PAY-04-CLUSTER-FE-01');
    expect(src).toContain('getPayrollPayslipById');
    expect(src).toContain('HrmPayslipSplitSegment');
    expect(src).toContain('/api/hrm/payroll/payslips/');
    expect(body).not.toMatch(/getPayrollPayslipById[\s\S]{0,400}\/api\/hrm\/core\//);
  });

  it('PayslipSplitSegmentsPanel · pay-04-honesty · no forbidden DV-14 fields', () => {
    const panel = read('components/payroll/PayslipSplitSegmentsPanel.tsx');
    expect(panel).toContain('pay-payslip-split-segments');
    expect(panel).toContain('pay-04-honesty');
    expect(panel).not.toContain('taxAmountVnd');
    expect(panel).not.toContain('gtgcAmountVnd');
    expect(panel).not.toContain('siEmployeeVnd');
  });

  it('payPayslipSplitDisplay honesty · must_keep seals cited', () => {
    const lib = read('lib/payPayslipSplitDisplay.ts');
    const body = codeOnly(lib);
    expect(lib).toContain('payroll_e2e_ready=false');
    expect(lib).toContain('≠ PAY-04 DONE');
    expect(body).not.toContain('segmentGrossVnd');
    expect(body).not.toMatch(/\.reduce\s*\(/);
  });
});
