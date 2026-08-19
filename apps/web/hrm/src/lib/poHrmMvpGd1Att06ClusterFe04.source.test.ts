/**
 * Source lock — PO-HRM-MVP-GD1-ATT-06-CLUSTER-FE-04
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = join(__dirname, '..');

function read(rel: string): string {
  return readFileSync(join(root, rel), 'utf8');
}

describe('PO-HRM-MVP-GD1-ATT-06-CLUSTER-FE-04 source lock', () => {
  it('OvertimeRequestTab — approve chain testids + list refetch', () => {
    const tab = read('components/attendance/OvertimeRequestTab.tsx');
    expect(tab).toContain('att-ot-row-view');
    expect(tab).toContain('att-ot-approve-submit');
    expect(tab).toContain('att-ot-row-pending');
    expect(tab).toContain('showInitialLoading');
    expect(tab).toContain('void fetchRequests()');
  });

  it('attLeave06Ring — honesty seals ATT05 / compensatory', () => {
    const ring = read('lib/attLeave06Ring.ts');
    expect(ring).toContain('ATT05BQC1');
    expect(ring).toContain('ATT05QC1');
  });

  it('AttOtCompLeavePolicySettingsPanel — honesty data seals', () => {
    const panel = read('components/settings/AttOtCompLeavePolicySettingsPanel.tsx');
    expect(panel).toContain('data-att-06-seal-att05');
    expect(panel).toContain('att-06-policy-honesty');
  });

  it('QA harness — approveFirstPendingOt uses row-view + approve-submit', () => {
    const script = readFileSync(
      join(root, '../../../../scripts/qa/_tmp-po-hrm-mvp-gd1-att-06-cluster-qa-01.mjs'),
      'utf8',
    );
    expect(script).toContain('att-ot-row-view');
    expect(script).toContain('att-ot-approve-submit');
  });
});
