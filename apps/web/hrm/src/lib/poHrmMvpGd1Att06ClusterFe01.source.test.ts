/**
 * Source lock — PO-HRM-MVP-GD1-ATT-06-CLUSTER-FE-01
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

describe('PO-HRM-MVP-GD1-ATT-06-CLUSTER-FE-01 source lock', () => {
  it('attLeave06Ring · policy path · compensatory bucket · ot_comp map', () => {
    const ring = read('lib/attLeave06Ring.ts');
    expect(ring).toContain('PO-HRM-MVP-GD1-ATT-06-CLUSTER-FE-01');
    expect(ring).toContain('ot-comp-leave-policy');
    expect(ring).toContain('compensatory');
    expect(ring).toContain('resolveLeaveBalanceBucketForLeaveType');
    expect(codeOnly(ring)).not.toMatch(/attendance_uat_ready\s*=\s*true/);
  });

  it('hrmApi — ot-comp-leave-policy + ot-comp-types/effective + accrual on approve type', () => {
    const api = read('integrations/hrmApi.ts');
    expect(api).toContain('/api/hrm/attendance/ot-comp-leave-policy');
    expect(api).toContain('getOtCompLeavePolicy');
    expect(api).toContain('putOtCompLeavePolicy');
    expect(api).toContain('/api/hrm/attendance/ot-comp-types/effective');
    expect(api).toContain('idempotent_replay');
    expect(codeOnly(api)).not.toContain('/api/hrm/core/');
  });

  it('OvertimeRequestTab — compensation_type EFF bind', () => {
    const tab = read('components/attendance/OvertimeRequestTab.tsx');
    expect(tab).toContain('useAttOtCompTypesEffective');
    expect(tab).toContain('compensation_type: selectedOtCompType');
  });

  it('useOvertimeRequests — invalidate panel after approve', () => {
    const hook = read('hooks/useOvertimeRequests.ts');
    expect(hook).toContain('LEAVE_BALANCE_PANEL_QUERY_KEY');
    expect(hook).toContain('invalidateQueries');
    expect(hook).toContain('credited_days');
  });

  it('LeaveTab — att-06-form-panel + bucket map', () => {
    const tab = read('components/attendance/LeaveTab.tsx');
    expect(tab).toContain('att-06-form-panel');
    expect(tab).toContain('resolveLeaveBalanceBucketForLeaveType');
    expect(tab).toContain('leave-balance-row-');
    expect(tab).toContain('att-05b-form-panel');
    expect(codeOnly(tab)).not.toContain('/api/hrm/core/');
  });

  it('Settings — AttOtCompLeavePolicySettingsPanel wired in Attendance', () => {
    const panel = read('components/settings/AttOtCompLeavePolicySettingsPanel.tsx');
    expect(panel).toContain('settings-att-ot-comp-leave-policy');
    expect(panel).toContain('hdsd-att-ot-comp-leave-policy-save');
    const att = read('pages/Attendance.tsx');
    expect(att).toContain('ot-comp-leave-policy');
    expect(att).toContain('AttOtCompLeavePolicySettingsPanel');
  });
});
