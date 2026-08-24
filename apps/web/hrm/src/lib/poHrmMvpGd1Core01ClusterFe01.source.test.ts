/**
 * Source lock — PO-HRM-MVP-GD1-CORE-01-CLUSTER-FE-01
 * Assert public ring bind paths + CB-MAP + dependents Nest clients (no Nest /core).
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = join(__dirname, '..');

function read(rel: string): string {
  return readFileSync(join(root, rel), 'utf8');
}

describe.skip('PO-HRM-MVP-GD1-CORE-01-CLUSTER-FE-01 source lock', () => {
  it('hrmApi dependents use physical /employees/:id/dependents*', () => {
    const src = read('integrations/hrmApi.ts');
    expect(src).toContain('/dependents');
    expect(src).toContain('listEmployeeDependents');
    expect(src).toContain('createEmployeeDependent');
    expect(src).toContain('softDeleteEmployeeDependent');
    expect(src).not.toMatch(/\/api\/hrm\/core\/employees.*dependents/);
  });

  it('EmployeeFormDialog hides finance mutate + CB-MAP redirect', () => {
    const src = read('components/employee/EmployeeFormDialog.tsx');
    expect(src).toContain('emp-core-cb-map-redirect');
    expect(src).toContain('CORE_CB_MAP_REDIRECT_TITLE_VI');
    expect(src).toContain('hasAnyFinanceFields = false');
    expect(src).toContain("salary: undefined");
    expect(src).toContain('stripCoreCbKeysFromRecord');
    expect(src).not.toMatch(/TabsTrigger value="finance"/);
  });

  it('EmployeeFamilyInfo binds Nest dependents + relation_label + ViDateField', () => {
    const src = read('components/employee/EmployeeFamilyInfo.tsx');
    expect(src).toContain('listEmployeeDependents');
    expect(src).toContain('createEmployeeDependent');
    expect(src).toContain('resolveDependentRelationLabel');
    expect(src).toContain('ViDateField');
    expect(src).toContain('formatDisplayDate');
    expect(src).toContain('HRM-CORE-DEP-VAL-400');
    expect(src).not.toContain('/api/hrm/core/');
  });

  it('EmployeeProfile general redirects C&B — no employee.salary InfoItem bind', () => {
    const src = read('pages/EmployeeProfile.tsx');
    expect(src).toContain('emp-core-cb-map-redirect');
    expect(src).toContain('emp-core-cb-map-open-salary');
    expect(src).not.toMatch(/employee\.salary \? new Intl\.NumberFormat/);
    expect(src).not.toMatch(/employee\.bank_name \|\| '--'/);
  });

  it('apiError maps CORE CB-403 and DEP codes', () => {
    const src = read('lib/apiError.ts');
    expect(src).toContain('"HRM-CORE-CB-403"');
    expect(src).toContain('"HRM-CORE-DEP-VAL-400"');
    expect(src).toContain('"HRM-CORE-DEP-404"');
  });

  it('mutations strip CB keys before POST/PATCH', () => {
    const src = read('hooks/useEmployeeMutations.ts');
    expect(src).toContain('stripCoreCbKeysFromRecord');
  });
});
