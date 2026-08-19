/**
 * Source lock — PO-HRM-MVP-GD1-ATT-05-CLUSTER-FE-01
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

describe('PO-HRM-MVP-GD1-ATT-05-CLUSTER-FE-01 source lock', () => {
  it('attLeave05Ring · path · residuals · no att_leave_hold invent', () => {
    const ring = read('lib/attLeave05Ring.ts');
    expect(ring).toContain('PO-HRM-MVP-GD1-ATT-05-CLUSTER-FE-01');
    expect(ring).toContain('R-ATT-05-FY');
    expect(ring).toContain('R-ATT-05-ENGINE');
    expect(ring).toContain('carry_over');
    expect(ring).toContain('att_leave_hold');
    expect(ring).toContain('DENY merge');
    expect(codeOnly(ring)).not.toMatch(/attendance_uat_ready\s*=\s*true/);
  });

  it('LVT allowsCarryOver · LVRULE carry cols · panel · ledger sep · Nest /core 0', () => {
    const lvt = read('components/settings/AttLeaveTypeSettingsPanel.tsx');
    const lvrule = read('components/settings/AttLeaveAccrualPolicySettingsPanel.tsx');
    const tab = read('components/attendance/LeaveTab.tsx');
    const grant = read('components/attendance/AttLeaveTrackedEntitlementGrantPanel.tsx');
    expect(lvt).toContain('allowsCarryOver');
    expect(lvt).toContain('hdsd-att-leave-type-allows-carry-over');
    expect(lvrule).toContain('carryOverExpireRule');
    expect(lvrule).toContain('carryCapDays');
    expect(lvrule).toContain('att-05-fy-hold');
    expect(tab).toContain('att-05-honesty');
    expect(tab).toContain('deriveAtt05PanelBucketLabelVi');
    expect(tab).toContain('leave-balance-row-${row.leave_type}');
    expect(tab).toContain('carry_over');
    expect(tab).toContain('att-05-ledger-sep');
    expect(grant).toContain('carry_over');
    expect(codeOnly(tab)).not.toContain('/api/hrm/core/');
  });

  it('physical /attendance/* leave paths retained', () => {
    const api = read('integrations/hrmApi.ts');
    expect(api).toContain('/api/hrm/attendance/leave-types');
    expect(api).toContain('/api/hrm/attendance/leave-balance/panel');
    expect(api).toContain('/api/hrm/attendance/leave-accrual-policies');
    expect(api).toContain('carryOverExpireRule');
    expect(api).toContain('carryCapDays');
  });
});
