/**
 * Source lock — PO-HRM-MVP-GD1-CORE-02-CLUSTER-FE-01
 * Assert C&B bind paths packages* + SI actions · bank/MST on form · no Nest /core SoT.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = join(__dirname, '..');

function read(rel: string): string {
  return readFileSync(join(root, rel), 'utf8');
}

/** Strip block comments so CODE-MEMORY paths do not false-positive. */
function codeOnly(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '');
}

describe.skip('PO-HRM-MVP-GD1-CORE-02-CLUSTER-FE-01 source lock', () => {
  it('hrmApi compensation uses physical packages* (+ revise/history/active)', () => {
    const src = read('integrations/hrmApi.ts');
    expect(src).toContain('/api/hrm/contracts-insurance/compensation-packages');
    expect(src).toContain('/compensation-packages/active');
    expect(src).toContain('/revise');
    expect(src).toContain('/api/hrm/contracts-insurance/compensation-history');
    expect(src).toContain('bank_account');
    expect(src).toContain('tax_id');
    expect(codeOnly(src)).not.toMatch(
      /createCompensationPackage[\s\S]{0,400}\/api\/hrm\/core\//,
    );
  });

  it('EmployeeCompensationPanel binds bank/MST + packages path via hook', () => {
    const src = read('components/employee/EmployeeCompensationPanel.tsx');
    expect(src).toContain('hdsd-emp-comp-bank-tax');
    expect(src).toContain('hdsd-emp-comp-bank-account');
    expect(src).toContain('hdsd-emp-comp-tax-id');
    expect(src).toContain('maskBankAccountView');
    expect(src).toContain('bank_account:');
    expect(src).not.toContain('/api/hrm/core/');
  });

  it('useEmployeeCompensation posts bank/MST on create+revise', () => {
    const src = read('hooks/useEmployeeCompensation.ts');
    expect(src).toContain('createCompensationPackage');
    expect(src).toContain('reviseCompensationPackage');
    expect(src).toContain('bank_account:');
    expect(src).toContain('tax_id:');
    expect(codeOnly(src)).not.toContain('/api/hrm/core/');
  });

  it('SI update routes rate change via actions change_rate', () => {
    const src = read('hooks/useEmployeeInsurance.ts');
    expect(src).toContain('postEmployeeInsuranceAction');
    expect(src).toContain('change_rate');
    expect(src).toContain('splitSiEnrollmentUpdate');
    expect(src).toContain('listEmployeeInsurances');
    expect(codeOnly(src)).not.toContain('/api/hrm/core/');
  });

  it('apiError maps CORE-02 AuthZ / OVERLAP / VAL', () => {
    const src = read('lib/apiError.ts');
    expect(src).toContain('"HRM-CORE-CB-AUTHZ-403"');
    expect(src).toContain('"HRM-COMP-409-OVERLAP"');
    expect(src).toContain('"HRM-CORE-CB-OVERLAP-409"');
    expect(src).toContain('"HRM-CORE-CB-VAL-400"');
    expect(src).toContain('"HRM-CORE-CB-403"');
  });

  it('public form still strips C&B (CORE-01 must_keep — not same-form salary)', () => {
    const form = read('components/employee/EmployeeFormDialog.tsx');
    expect(form).toContain('hasAnyFinanceFields = false');
    expect(form).toContain('stripCoreCbKeysFromRecord');
    expect(form).not.toMatch(/TabsTrigger value="finance"/);
  });
});
