/**
 * Source lock — PO-HRM-MVP-GD1-ATT-04-CLUSTER-FE-01
 * Assert leave-types* · leave-accrual-policies* · tracked-entitlement · Nest /core ATT=0
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

describe('PO-HRM-MVP-GD1-ATT-04-CLUSTER-FE-01 source lock', () => {
  it('hrmApi physical LVT + LVRULE + tracked-entitlement · no Nest /core SoT', () => {
    const src = read('integrations/hrmApi.ts');
    const body = codeOnly(src);
    expect(src).toContain('/api/hrm/attendance/leave-types');
    expect(src).toContain('/api/hrm/attendance/leave-types/effective');
    expect(src).toContain('/api/hrm/attendance/leave-accrual-policies');
    expect(src).toContain('/api/hrm/attendance/leave-balance/tracked-entitlement');
    expect(src).toContain('listAttLeaveAccrualPolicies');
    expect(src).toContain('putTrackedLeaveEntitlement');
    expect(body).not.toMatch(
      /(?:listAttLeaveAccrualPolicies|putTrackedLeaveEntitlement)[\s\S]{0,600}\/api\/hrm\/core\//,
    );
  });

  it('AttLeaveTypeSettingsPanel + LVRULE admin + grant panel wired', () => {
    const lvt = read('components/settings/AttLeaveTypeSettingsPanel.tsx');
    const lvrule = read('components/settings/AttLeaveAccrualPolicySettingsPanel.tsx');
    const grant = read('components/attendance/AttLeaveTrackedEntitlementGrantPanel.tsx');
    const page = read('pages/Attendance.tsx');
    const tab = read('components/attendance/LeaveTab.tsx');
    expect(lvt).toContain('listAttLeaveTypes');
    expect(lvrule).toContain('PO-HRM-MVP-GD1-ATT-04-CLUSTER-FE-01');
    expect(lvrule).toContain('createAttLeaveAccrualPolicy');
    expect(lvrule).toContain('att-04-honesty');
    expect(grant).toContain('putTrackedLeaveEntitlement');
    expect(grant).toContain('att-04-grant-panel');
    expect(page).toContain('AttLeaveAccrualPolicySettingsPanel');
    expect(tab).toContain('AttLeaveTrackedEntitlementGrantPanel');
    expect(codeOnly(tab)).not.toContain('/api/hrm/core/');
  });

  it('attLeave04Ring path lock · FY/ENGINE HOLD', () => {
    const ring = read('lib/attLeave04Ring.ts');
    expect(ring).toContain('PO-HRM-MVP-GD1-ATT-04-CLUSTER-FE-01');
    expect(ring).toContain('R-ATT-04-FY');
    expect(ring).toContain('R-ATT-04-ENGINE');
    expect(ring).toContain('att_leave_hold');
    expect(codeOnly(ring)).not.toMatch(/attendance_uat_ready\s*=\s*true/);
  });
});
