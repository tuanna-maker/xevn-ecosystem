/**
 * Source lock — PO-HRM-MVP-GD1-ATT-06-CLUSTER-FE-02
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = join(__dirname, '..');

function read(rel: string): string {
  return readFileSync(join(root, rel), 'utf8');
}

describe('PO-HRM-MVP-GD1-ATT-06-CLUSTER-FE-02 source lock', () => {
  it('att06CatalogEnsure + ring accrual helpers', () => {
    const ensure = read('lib/att06CatalogEnsure.ts');
    expect(ensure).toContain('ensureAtt06OtCompTypeForAccrual');
    expect(ensure).toContain('ensureAtt06OtCompLeaveType');
    expect(ensure).toContain('compensatory_leave');
    const ring = read('lib/attLeave06Ring.ts');
    expect(ring).toContain('buildPolicyMapsCompCodes');
    expect(ring).toContain('pickPreferredOtCompTypeCode');
  });

  it('OvertimeRequestTab — ensure on dialog + submit testid', () => {
    const tab = read('components/attendance/OvertimeRequestTab.tsx');
    expect(tab).toContain('ensureAtt06OtCompTypeForAccrual');
    expect(tab).toContain('att-ot-add-submit');
    expect(tab).toContain('pickPreferredOtCompTypeCode');
  });

  it('Policy panel — ensure + maps_comp_codes on save', () => {
    const panel = read('components/settings/AttOtCompLeavePolicySettingsPanel.tsx');
    expect(panel).toContain('ensureAtt06CatalogPrereqs');
    expect(panel).toContain('maps_comp_codes');
    expect(panel).toContain('buildPolicyMapsCompCodes');
  });

  it('LeaveTab — ensure ot_comp on create open', () => {
    const tab = read('components/attendance/LeaveTab.tsx');
    expect(tab).toContain('ensureAtt06OtCompLeaveType');
    expect(tab).toContain('att-06-form-panel');
  });

  it('effective hooks — listCompanyId scope', () => {
    const comp = read('hooks/useAttOtCompTypesEffective.ts');
    expect(comp).toContain('useHrmOperatingUnitFilter');
    const ot = read('hooks/useAttOtTypesEffective.ts');
    expect(ot).toContain('useHrmOperatingUnitFilter');
    const otHook = read('hooks/useOvertimeRequests.ts');
    expect(otHook).toContain('useHrmOperatingUnitFilter');
  });
});
