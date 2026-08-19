/**
 * Source lock — PO-HRM-MVP-GD1-ATT-07-CLUSTER-FE-01
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

describe('PO-HRM-MVP-GD1-ATT-07-CLUSTER-FE-01 source lock', () => {
  it('attLeave07Ring · fund-order path · panel no sick', () => {
    const ring = read('lib/attLeave07Ring.ts');
    expect(ring).toContain('PO-HRM-MVP-GD1-ATT-07-CLUSTER-FE-01');
    expect(ring).toContain('sick-leave-fund-order');
    expect(ring).toContain('att07PanelExcludesSickBucket');
    expect(ring).toContain('ATT06QC1');
    expect(codeOnly(ring)).not.toMatch(/attendance_uat_ready\s*=\s*true/);
  });

  it('hrmApi — sick-leave-fund-order GET/PUT + dayBranches on leave create', () => {
    const api = read('integrations/hrmApi.ts');
    expect(api).toContain('/api/hrm/attendance/sick-leave-fund-order');
    expect(api).toContain('getSickLeaveFundOrder');
    expect(api).toContain('putSickLeaveFundOrder');
    expect(api).toContain('dayBranches');
    expect(codeOnly(api)).not.toContain('/api/hrm/core/');
  });

  it('LeaveTab — att-07 picker flags · attach · honesty · panel RETAIN', () => {
    const tab = read('components/attendance/LeaveTab.tsx');
    expect(tab).toContain('att-07-honesty');
    expect(tab).toContain('att-07-sick-flags');
    expect(tab).toContain('att-07-sick-attach');
    expect(tab).toContain('resolveSickLeaveTypeFlags');
    expect(tab).toContain('att-06-form-panel');
    expect(tab).toContain('leave-balance-row-');
    expect(codeOnly(tab)).not.toContain('/api/hrm/core/');
  });

  it('Settings — AttSickLeaveFundOrderSettingsPanel wired in Attendance', () => {
    const panel = read('components/settings/AttSickLeaveFundOrderSettingsPanel.tsx');
    expect(panel).toContain('settings-att-sick-leave-fund-order');
    expect(panel).toContain('isProgramDefault');
    expect(panel).toContain('hdsd-att-sick-leave-fund-order-save');
    const att = read('pages/Attendance.tsx');
    expect(att).toContain('sick-leave-fund-order');
    expect(att).toContain('AttSickLeaveFundOrderSettingsPanel');
  });

  it('useLeaveRequests — dayBranches toast on sick create', () => {
    const hook = read('hooks/useLeaveRequests.ts');
    expect(hook).toContain('parseLeaveCreateDayBranches');
    expect(hook).toContain('formatSickDayBranchesSummary');
  });
});
