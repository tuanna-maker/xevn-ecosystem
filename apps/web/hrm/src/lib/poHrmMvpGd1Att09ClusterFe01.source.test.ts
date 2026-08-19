/**
 * Source lock — PO-HRM-MVP-GD1-ATT-09-CLUSTER-FE-01
 * Hold/settle/panel bind · Nest /core leave-hold=0 · must_keep ATT-08 · DENY att_leave_hold.
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

describe('PO-HRM-MVP-GD1-ATT-09-CLUSTER-FE-01 source lock', () => {
  it('hrmApi physical leave-requests + balance · Nest /core leave SoT = 0', () => {
    const src = read('integrations/hrmApi.ts');
    const body = codeOnly(src);
    expect(src).toContain('/api/hrm/attendance/leave-requests');
    expect(src).toContain('/api/hrm/attendance/leave-balance');
    expect(src).toContain('/api/hrm/attendance/leave-balance/panel');
    expect(src).toContain('approveLeaveRequest');
    expect(src).toContain('rejectLeaveRequest');
    expect(src).toContain('cancelLeaveRequest');
    expect(src).toContain('PO-HRM-MVP-GD1-ATT-09-CLUSTER-FE-01');
    expect(src).toContain('status_label');
    expect(body).not.toMatch(
      /(?:createLeaveRequest|approveLeaveRequest|rejectLeaveRequest|cancelLeaveRequest|fetchLeaveBalance)[\s\S]{0,600}\/api\/hrm\/core\//,
    );
    expect(body).not.toContain('att_leave_hold');
  });

  it('useLeaveRequests invalidate balance on create/approve/reject · type-block · statusLabelVi', () => {
    const hook = read('hooks/useLeaveRequests.ts');
    expect(hook).toContain('PO-HRM-MVP-GD1-ATT-09-CLUSTER-FE-01');
    expect(hook).toContain('statusLabelVi');
    expect(hook).toContain('LEAVE_BALANCE_QUERY_KEY');
    expect(hook).toContain('LEAVE_BALANCE_PANEL_QUERY_KEY');
    expect(hook).toContain('assertAtt09LeaveTypeUpdateAllowed');
    expect(hook).toContain('att09TypeBlockMessage');
    expect(codeOnly(hook)).not.toContain('/api/hrm/core/');
    expect(codeOnly(hook)).not.toContain('att_leave_hold');
  });

  it('LeaveTab panel held=pending · used · honesty · type-block · Nest /core 0 · ATT-08 RETAIN', () => {
    const tab = read('components/attendance/LeaveTab.tsx');
    expect(tab).toContain('PO-HRM-MVP-GD1-ATT-09-CLUSTER-FE-01');
    expect(tab).toContain('att09HonestyBannerText');
    expect(tab).toContain('data-testid="att-09-honesty"');
    expect(tab).toContain('resolveAtt09HeldDays');
    expect(tab).toContain('statusLabelVi');
    expect(tab).toContain('isAtt09LeaveTypeChangeBlocked');
    expect(tab).toContain('AttLeavePreviewDeductionPanel');
    expect(tab).toContain('PO-HRM-MVP-GD1-ATT-08-CLUSTER-FE-02');
    expect(codeOnly(tab)).not.toMatch(
      /AttLeavePreviewDeductionPanel[\s\S]{0,200}\/api\/hrm\/core\//,
    );
    expect(codeOnly(tab)).not.toContain('att_leave_hold');
    expect(codeOnly(tab)).not.toMatch(/attendance_uat_ready\s*=\s*true/);
    expect(codeOnly(tab)).not.toMatch(/contracts_printable_ready\s*=\s*true/);
  });

  it('attLeave09Ring honesty · held alias · TYPE-BLOCK · Nest deny · seals', () => {
    const ring = read('lib/attLeave09Ring.ts');
    expect(ring).toContain('PO-HRM-MVP-GD1-ATT-09-CLUSTER-FE-01');
    expect(ring).toContain("inventHoldTableDenied: 'att_leave_hold'");
    expect(ring).toContain('held=pending_days');
    expect(ring).toContain('soft create alone ≠ ATT-09 DONE');
    expect(ring).toContain('≠ ATT-08 preview = ATT-09 DONE');
    expect(ring).toContain('CFG ≠ ATT-02 DONE · ATT02QC1-MSLQZUK7');
    expect(ring).toContain('ATT08QC1-MSLSL36C');
    expect(ring).toContain('isAtt09LeaveTypeChangeBlocked');
    expect(ring).toContain("nestCoreDenied: '/api/hrm/core/'");
    expect(codeOnly(ring)).not.toMatch(/contracts_printable_ready\s*=\s*true/);
    expect(codeOnly(ring)).not.toMatch(/attendance_uat_ready\s*=\s*true/);
  });

  it('leaveBalance held alias helper RETAIN pending_days · no invent dual table', () => {
    const bal = read('lib/leaveBalance.ts');
    expect(bal).toContain('pending_days');
    expect(bal).toContain('PO-HRM-MVP-GD1-ATT-09-CLUSTER-FE-01');
    expect(bal).toContain('resolveLeaveBalanceHeldDays');
    expect(codeOnly(bal)).not.toContain('att_leave_hold');
  });
});
