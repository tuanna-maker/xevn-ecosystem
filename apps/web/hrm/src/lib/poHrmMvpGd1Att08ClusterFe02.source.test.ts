/**
 * Source lock — PO-HRM-MVP-GD1-ATT-08-CLUSTER-FE-02
 * LIVE preview bind · Nest /core leave=0 · residual CLOSED · ALIGN submit.
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

describe('PO-HRM-MVP-GD1-ATT-08-CLUSTER-FE-02 source lock', () => {
  it('hrmApi physical preview-deduction · Nest /core leave SoT = 0', () => {
    const src = read('integrations/hrmApi.ts');
    const body = codeOnly(src);
    expect(src).toContain('previewLeaveDeduction');
    expect(src).toContain('/api/hrm/attendance/leave-requests/preview-deduction');
    expect(src).toContain('PO-HRM-MVP-GD1-ATT-08-CLUSTER-FE-02');
    expect(body).not.toMatch(
      /(?:previewLeaveDeduction)[\s\S]{0,800}\/api\/hrm\/core\//,
    );
  });

  it('AttLeavePreviewDeductionPanel LIVE · HOL-MISS · unit · residual CLOSED badge', () => {
    const panel = read('components/attendance/AttLeavePreviewDeductionPanel.tsx');
    const body = codeOnly(panel);
    expect(panel).toContain('PO-HRM-MVP-GD1-ATT-08-CLUSTER-FE-02');
    expect(panel).toContain('previewLeaveDeduction');
    expect(panel).toContain('onPreviewReady');
    expect(panel).toContain('att08PreviewLiveBadgeText');
    expect(panel).toContain('att08UnitLabelVi');
    expect(panel).toContain('deductible_units');
    expect(panel).toContain('working_days');
    expect(panel).toContain('≠ trừ quỹ');
    expect(panel).toContain('isAtt08HolMissError');
    expect(body).not.toContain('/api/hrm/core/');
    expect(body).not.toMatch(/contracts_printable_ready\s*=\s*true/);
    expect(body).not.toMatch(/attendance_uat_ready\s*=\s*true/);
    expect(body).not.toMatch(/workingDays\s*=\s*4/);
    expect(body).not.toMatch(/working_days:\s*4/);
  });

  it('LeaveTab ALIGN submit deductible_units · HOL-MISS block · Nest /core 0', () => {
    const tab = read('components/attendance/LeaveTab.tsx');
    expect(tab).toContain('PO-HRM-MVP-GD1-ATT-08-CLUSTER-FE-02');
    expect(tab).toContain('resolveAtt08SubmitTotalDays');
    expect(tab).toContain('onPreviewReady');
    expect(tab).toContain('previewEnvelope');
    expect(tab).toContain('previewSubmitBlocked');
    expect(tab).toContain('att08HolMissMessage');
    expect(codeOnly(tab)).not.toMatch(
      /AttLeavePreviewDeductionPanel[\s\S]{0,200}\/api\/hrm\/core\//,
    );
  });

  it('attLeaveRing residual CLOSED · ALIGN helpers · honesty seals', () => {
    const ring = read('lib/attLeaveRing.ts');
    expect(ring).toContain("R_ATT_08_PREVIEW_FE_STATUS = 'CLOSED'");
    expect(ring).toContain('resolveAtt08SubmitTotalDays');
    expect(ring).toContain('isAtt08AlignInflateError');
    expect(ring).toContain('att08AlignInflateMessage');
    expect(ring).toContain('R-ATT-08-PREVIEW-FE CLOSED');
    expect(ring).toContain('CFG ≠ ATT-02 DONE · ATT02QC1-MSLQZUK7');
    expect(ring).toContain('PAY OUT invent DONE');
    expect(ring).toContain("nestCoreDenied: '/api/hrm/core/'");
    expect(codeOnly(ring)).not.toMatch(/contracts_printable_ready\s*=\s*true/);
  });

  it('apiError surfaces ALIGN inflate before generic HRM-VAL-400', () => {
    const err = read('lib/apiError.ts');
    expect(err).toContain('leaveAlignInflateMessage');
    expect(err).toContain('HRM-LEAVE-HOL-MISSING');
    expect(err).toContain('BR-BP-LV-05');
    expect(err).toContain('deductible_units');
  });
});
