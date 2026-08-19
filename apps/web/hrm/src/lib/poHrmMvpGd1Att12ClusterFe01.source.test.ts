/**
 * Source lock — PO-HRM-MVP-GD1-ATT-12-CLUSTER-FE-01
 * HCNS profile strip · GET leave-balance/panel · activate_default shift · Nest /core 0.
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

describe('PO-HRM-MVP-GD1-ATT-12-CLUSTER-FE-01 source lock', () => {
  it('attLeave12Ring — panel path · shift read · DENY merge · honesty', () => {
    const ring = read('lib/attLeave12Ring.ts');
    expect(ring).toContain('PO-HRM-MVP-GD1-ATT-12-CLUSTER-FE-01');
    expect(ring).toContain('ATT_LEAVE_05B_PATH_ASSERT.leaveBalancePanel');
    expect(ring).toContain('/shift-assignments/activate-default');
    expect(ring).toContain('DENY merge compensatory/carry/sick→annual');
    expect(ring).toContain('ATT07QC1');
    expect(ring).toContain('ATT06QC1');
    expect(codeOnly(ring)).not.toMatch(/attendance_uat_ready\s*=\s*true/);
  });

  it('hrmApi — fetchActivateDefaultShiftAssignment · panel RETAIN', () => {
    const api = read('integrations/hrmApi.ts');
    const body = codeOnly(api);
    expect(api).toContain('fetchActivateDefaultShiftAssignment');
    expect(api).toContain('/api/hrm/attendance/shift-assignments/activate-default');
    expect(api).toContain('/api/hrm/attendance/leave-balance/panel');
    expect(body).not.toMatch(
      /fetchActivateDefaultShiftAssignment[\s\S]{0,400}\/api\/hrm\/core\//,
    );
    expect(body).not.toContain('att_leave_hold');
  });

  it('EmployeeActivateEnrollConfirmStrip — 5 bucket rows · shift summary · honesty', () => {
    const strip = read('components/employee/EmployeeActivateEnrollConfirmStrip.tsx');
    expect(strip).toContain('hdsd-emp-att12-enroll-confirm-strip');
    expect(strip).toContain('useLeaveBalancesByType');
    expect(strip).toContain('useActivateDefaultShift');
    expect(strip).toContain('hdsd-emp-att12-leave-row-');
    expect(strip).toContain('hdsd-emp-att12-shift-summary');
    expect(strip).toContain('deriveAtt05PanelBucketLabelVi');
    expect(codeOnly(strip)).not.toMatch(/merge.*annual/i);
    expect(codeOnly(strip)).not.toContain('att_leave_hold');
  });

  it('EmployeeActivatePanel embeds ATT-12 strip when active', () => {
    const panel = read('components/employee/EmployeeActivatePanel.tsx');
    expect(panel).toContain('EmployeeActivateEnrollConfirmStrip');
    expect(panel).toContain('PO-HRM-MVP-GD1-ATT-12-CLUSTER-FE-01');
  });

  it('useEmployeeActivate invalidates panel + shift after activate', () => {
    const hook = read('hooks/useEmployeeActivate.ts');
    expect(hook).toContain('LEAVE_BALANCE_PANEL_QUERY_KEY');
    expect(hook).toContain('ACTIVATE_DEFAULT_SHIFT_QUERY_KEY');
    expect(hook).toContain('invalidateQueries');
  });

  it('EmployeeProfile · Nest /core 0 on activate path', () => {
    const profile = read('pages/EmployeeProfile.tsx');
    expect(profile).toContain('EmployeeActivatePanel');
    expect(codeOnly(profile)).not.toMatch(/attendance_uat_ready\s*=\s*true/);
  });
});
