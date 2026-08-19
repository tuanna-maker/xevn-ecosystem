/**
 * Source lock — PO-HRM-MVP-GD1-ATT-02-CLUSTER-FE-02
 * LIVE mode bind · XOR · HRM-VAL-400 · Nest /core 0 · R-ATT-02-MODE-FE CLOSED.
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

describe('PO-HRM-MVP-GD1-ATT-02-CLUSTER-FE-02 source lock', () => {
  it('AttLatePenaltyModePanel LIVE bind · XOR · VAL-400 · Nest /core 0', () => {
    const panel = read('components/attendance/AttLatePenaltyModePanel.tsx');
    const body = codeOnly(panel);
    expect(panel).toContain('PO-HRM-MVP-GD1-ATT-02-CLUSTER-FE-02');
    expect(panel).toContain('getAttendanceRules');
    expect(panel).toContain('patchAttendanceRules');
    expect(panel).toContain('parseAtt02LatePenaltyEnvelope');
    expect(panel).toContain('buildAtt02LatePenaltyPatchBody');
    expect(panel).toContain('validateAtt02LatePenaltyDraft');
    expect(panel).toContain('R_ATT_02_MODE_FE_CLOSED');
    expect(panel).toContain('ATT_02_VAL_400_CODE');
    expect(panel).toContain('att-02-source-flags');
    expect(panel).toContain('att-02-mode-live-banner');
    expect(panel).toContain('att-02-honesty');
    expect(panel).toContain('cấm lưu giả XOR');
    expect(panel).toContain('notify_late ≠ off');
    expect(body).not.toContain('/api/hrm/core/');
    expect(body).not.toMatch(/contracts_printable_ready\s*=\s*true/);
    expect(body).not.toMatch(/attendance_uat_ready\s*=\s*true/);
  });

  it('hrmApi physical rules + optional late-penalty · Nest /core 0', () => {
    const src = read('integrations/hrmApi.ts');
    const body = codeOnly(src);
    expect(src).toContain('/api/hrm/attendance/rules');
    expect(src).toContain('/api/hrm/attendance/rules/late-penalty');
    expect(src).toContain('patchAttendanceLatePenalty');
    expect(src).toContain('PO-HRM-MVP-GD1-ATT-02-CLUSTER-FE-02');
    expect(src).toContain('modeLabelVi');
    expect(src).toContain('latePenaltyEnabled');
    expect(body).not.toMatch(
      /(?:getAttendanceRules|patchAttendanceRules|patchAttendanceLatePenalty)[\s\S]{0,600}\/api\/hrm\/core\//,
    );
  });

  it('attRuleRing FE-02 helpers · residual CLOSED · off≠notifyLate · stamps', () => {
    const ring = read('lib/attRuleRing.ts');
    expect(ring).toContain('PO-HRM-MVP-GD1-ATT-02-CLUSTER-FE-02');
    expect(ring).toContain('buildAtt02LatePenaltyPatchBody');
    expect(ring).toContain('collectActiveAtt02Modes');
    expect(ring).toContain('validateAtt02LatePenaltyDraft');
    expect(ring).toContain('HRM-VAL-400');
    expect(ring).toContain('R-ATT-02-MODE-FE CLOSED');
    expect(ring).toContain('latePenaltyEnabled=false ≠ notifyLate off');
    expect(ring).toContain('PLT01QC1-MSLPUQIU');
    expect(ring).toContain('CORE10QC1-MSLP0EJB');
    expect(ring).toContain('CORE09QC1-MSLNBA89');
    expect(ring).toContain('CORE07QC1-KZJTSHNT');
    expect(codeOnly(ring)).not.toMatch(/contracts_printable_ready\s*=\s*true/);
  });

  it('apiError surfaces HRM-VAL-400 · Attendance mounts panel', () => {
    const err = read('lib/apiError.ts');
    expect(err).toContain('HRM-VAL-400');
    const page = read('pages/Attendance.tsx');
    expect(page).toContain('AttLatePenaltyModePanel');
    expect(page).toContain('PO-HRM-MVP-GD1-ATT-02-CLUSTER-FE-02');
    expect(codeOnly(page)).not.toMatch(
      /AttLatePenaltyModePanel[\s\S]{0,200}\/api\/hrm\/core\//,
    );
  });
});
