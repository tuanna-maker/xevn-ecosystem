import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = join(import.meta.dirname, '..');

describe('PO-HRM-MVP-GD1-PAY-09-CLUSTER-FE-01 source guards', () => {
  it('hrmApi wires payroll/groups* and period payroll_group_id', () => {
    const api = readFileSync(join(root, 'integrations/hrmApi.ts'), 'utf8');
    expect(api).toContain('/api/hrm/payroll/groups');
    expect(api).toContain('payroll_group_id');
    expect(api).toContain('getPayrollGroupMembers');
    expect(api).not.toMatch(/\/api\/hrm\/core\/.*payroll/i);
  });

  it('catalog tab LIVE bind · no hardcode four groups · honesty footer', () => {
    const tab = readFileSync(join(root, 'components/payroll/PayrollGroupsCatalogTab.tsx'), 'utf8');
    expect(tab).toContain('pay-groups-catalog-precision');
    expect(tab).toContain('assertNoHardcodedPayrollGroupSeed');
    expect(tab).toContain('payroll_e2e_ready=false');
    expect(tab).not.toMatch(/office\s*\|\s*sales\s*\|\s*driver\s*\|\s*ops/);
  });

  it('payroll groups mutations upsert list cache (FE-PAY09-CATALOG-LIST-STALE)', () => {
    const hook = readFileSync(join(root, 'hooks/usePayrollGroups.ts'), 'utf8');
    expect(hook).toContain('upsertPayrollGroupInListCache');
    expect(hook).toContain('setQueriesData');
    expect(hook).toContain('refreshPayrollGroupsQueries');
  });

  it('period scope panel PATCH · payslip list filter', () => {
    const scope = readFileSync(join(root, 'components/payroll/PayrollPeriodGroupScopePanel.tsx'), 'utf8');
    expect(scope).toContain('pay-period-group-scope');
    expect(scope).toContain('updatePayrollPeriod');

    const payslips = readFileSync(join(root, 'components/payroll/PayrollPayslipsApiTab.tsx'), 'utf8');
    expect(payslips).toContain('pay-payslips-group-filter');

    const ring = readFileSync(join(root, 'lib/payPay09GroupRing.ts'), 'utf8');
    expect(ring).toContain('PAY08QC1-MSMFFXGWC1');
  });
});
