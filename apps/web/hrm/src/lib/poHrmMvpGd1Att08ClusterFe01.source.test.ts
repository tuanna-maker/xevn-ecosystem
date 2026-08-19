/**
 * Source lock — PO-HRM-MVP-GD1-ATT-08-CLUSTER-FE-01
 * Assert /attendance/leave-requests* · Nest /core leave=0 · preview stub-safe · honesty.
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

describe('PO-HRM-MVP-GD1-ATT-08-CLUSTER-FE-01 source lock', () => {
  it('hrmApi physical leave-requests + preview-deduction · no Nest /core leave SoT', () => {
    const src = read('integrations/hrmApi.ts');
    const body = codeOnly(src);
    expect(src).toContain('/api/hrm/attendance/leave-requests');
    expect(src).toContain('listLeaveRequests');
    expect(src).toContain('createLeaveRequest');
    expect(src).toContain('previewLeaveDeduction');
    expect(src).toContain('/api/hrm/attendance/leave-requests/preview-deduction');
    expect(src).toContain('approveLeaveRequest');
    expect(src).toContain('rejectLeaveRequest');
    expect(body).not.toMatch(
      /(?:listLeaveRequests|createLeaveRequest|previewLeaveDeduction)[\s\S]{0,800}\/api\/hrm\/core\//,
    );
  });

  it('useLeaveRequests RETAIN physical peers · Nest /core 0', () => {
    const hook = read('hooks/useLeaveRequests.ts');
    expect(hook).toContain('listLeaveRequests');
    expect(hook).toContain('createLeaveRequest');
    expect(hook).toContain('PO-HRM-MVP-GD1-ATT-08-CLUSTER-FE-01');
    expect(hook).toContain('client total_days ≠ ATT-08 DONE');
    expect(codeOnly(hook)).not.toContain('/api/hrm/core/');
  });

  it('AttLeavePreviewDeductionPanel stub-safe · HOL-MISS · honesty · Nest /core 0', () => {
    const panel = read('components/attendance/AttLeavePreviewDeductionPanel.tsx');
    const body = codeOnly(panel);
    expect(panel).toContain('PO-HRM-MVP-GD1-ATT-08-CLUSTER-FE-01');
    expect(panel).toContain('previewLeaveDeduction');
    expect(panel).toContain('parseAtt08PreviewDeductionEnvelope');
    expect(panel).toContain('isAtt08PreviewAbsentError');
    expect(panel).toContain('isAtt08HolMissError');
    expect(panel).toContain('att-08-honesty');
    expect(panel).toContain('att08PreviewAbsentBannerText');
    expect(panel).toContain('no fake T6→T2=4');
    expect(body).not.toContain('/api/hrm/core/');
    expect(body).not.toMatch(/contracts_printable_ready\s*=\s*true/);
    expect(body).not.toMatch(/attendance_uat_ready\s*=\s*true/);
    // DENY invent working_days=4 as engine when ABSENT
    expect(body).not.toMatch(/workingDays\s*=\s*4/);
    expect(body).not.toMatch(/working_days:\s*4/);
  });

  it('LeaveTab mounts preview panel · HOL-MISS blocks submit', () => {
    const tab = read('components/attendance/LeaveTab.tsx');
    expect(tab).toContain('AttLeavePreviewDeductionPanel');
    expect(tab).toContain('PO-HRM-MVP-GD1-ATT-08-CLUSTER-FE-01');
    expect(tab).toContain('previewSubmitBlocked');
    expect(tab).toContain('att08HolMissMessage');
    expect(codeOnly(tab)).not.toMatch(
      /AttLeavePreviewDeductionPanel[\s\S]{0,200}\/api\/hrm\/core\//,
    );
  });

  it('attLeaveRing path + honesty · DENY invent PAY/printable/ATT UAT/client-days DONE', () => {
    const ring = read('lib/attLeaveRing.ts');
    expect(ring).toContain("nestCoreDenied: '/api/hrm/core/'");
    expect(ring).toContain('/api/hrm/attendance/leave-requests/preview-deduction');
    expect(ring).toContain('client total_days / calendar expand ≠ ATT-08 DONE');
    expect(ring).toContain('≠ ATT-09 hold DONE');
    expect(ring).toContain('≠ ATT-03b admin DONE');
    expect(ring).toContain('CFG ≠ ATT-02 DONE · ATT02QC1-MSLQZUK7');
    expect(ring).toContain('PAY OUT invent DONE');
    expect(ring).toContain('PLT01QC1-MSLPUQIU');
    expect(ring).toContain('CORE10QC1-MSLP0EJB');
    expect(ring).toContain('CORE09QC1-MSLNBA89');
    expect(ring).toContain('CORE07QC1-KZJTSHNT');
    expect(ring).toContain('soft ≠ CORE-06 DONE');
    expect(ring).toContain('R-ATT-08-PREVIEW-FE');
    expect(ring).toContain('DENY fake T6→T2=4');
    expect(codeOnly(ring)).not.toMatch(/contracts_printable_ready\s*=\s*true/);
  });

  it('apiError surfaces HRM-LEAVE-HOL-MISSING', () => {
    const err = read('lib/apiError.ts');
    expect(err).toContain('HRM-LEAVE-HOL-MISSING');
    expect(err).toContain('Thiếu lịch lễ năm');
  });
});
