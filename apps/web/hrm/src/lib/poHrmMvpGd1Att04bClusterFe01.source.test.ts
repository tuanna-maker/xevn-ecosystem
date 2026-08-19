/**
 * Source lock — PO-HRM-MVP-GD1-ATT-04B-CLUSTER-FE-01
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

describe('PO-HRM-MVP-GD1-ATT-04B-CLUSTER-FE-01 source lock', () => {
  it('attLeave04bRing · path · residuals · no att_leave_hold invent', () => {
    const ring = read('lib/attLeave04bRing.ts');
    expect(ring).toContain('PO-HRM-MVP-GD1-ATT-04B-CLUSTER-FE-01');
    expect(ring).toContain('R-ATT-04B-OVER-BAL');
    expect(ring).toContain('R-ATT-04B-CAP-CRUD');
    expect(ring).toContain('HRM-LEAVE-VAL-BALANCE');
    expect(ring).toContain('att_leave_hold');
    expect(codeOnly(ring)).not.toMatch(/attendance_uat_ready\s*=\s*true/);
  });

  it('LVT allowsAdvance · panel labels · balance reject UX · Nest /core 0', () => {
    const lvt = read('components/settings/AttLeaveTypeSettingsPanel.tsx');
    const tab = read('components/attendance/LeaveTab.tsx');
    const hook = read('hooks/useLeaveRequests.ts');
    const lvrule = read('components/settings/AttLeaveAccrualPolicySettingsPanel.tsx');
    expect(lvt).toContain('allowsAdvance');
    expect(lvt).toContain('hdsd-att-leave-type-allows-advance');
    expect(tab).toContain('att-04b-balance-reject');
    expect(tab).toContain('att-04b-honesty');
    expect(tab).toContain('deriveAtt04bPanelBucketLabelVi');
    expect(tab).toContain('att-04b-over-bal-hold');
    expect(hook).toContain('parseAtt04bBalanceReject');
    expect(lvrule).toContain('att-04b-cap-hold');
    expect(codeOnly(tab)).not.toContain('/api/hrm/core/');
  });

  it('physical /attendance/* leave paths retained', () => {
    const api = read('integrations/hrmApi.ts');
    expect(api).toContain('/api/hrm/attendance/leave-types');
    expect(api).toContain('/api/hrm/attendance/leave-balance/panel');
    expect(api).toContain('/api/hrm/attendance/leave-requests');
    expect(api).toContain('/api/hrm/attendance/leave-accrual-policies');
  });
});
