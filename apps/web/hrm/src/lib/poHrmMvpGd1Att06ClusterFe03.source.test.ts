/**
 * Source lock — PO-HRM-MVP-GD1-ATT-06-CLUSTER-FE-03
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = join(__dirname, '..');

function read(rel: string): string {
  return readFileSync(join(root, rel), 'utf8');
}

describe('PO-HRM-MVP-GD1-ATT-06-CLUSTER-FE-03 source lock', () => {
  it('attLeave06Ring — ot_comp key + nameVi match', () => {
    const ring = read('lib/attLeave06Ring.ts');
    expect(ring).toContain('isKnownOtCompLeaveTypeKey');
    expect(ring).toContain('effectiveRowMatchesOtCompLeave');
  });

  it('OvertimeRequestTab — default date + submit ready hook', () => {
    const tab = read('components/attendance/OvertimeRequestTab.tsx');
    expect(tab).toContain('handleAddModalOpenChange');
    expect(tab).toContain('otAddSubmitReady');
    expect(tab).toContain('data-att-ot-submit-ready');
    expect(tab).toContain('att-ot-date-trigger');
    expect(tab).toContain('att-ot-employee-select');
  });

  it('CatalogSearchPicker — option testids for J-05', () => {
    const picker = read('components/common/CatalogSearchPicker.tsx');
    expect(picker).toContain('catalog-picker-option-');
    expect(picker).toContain('data-value={opt.value}');
  });
});
