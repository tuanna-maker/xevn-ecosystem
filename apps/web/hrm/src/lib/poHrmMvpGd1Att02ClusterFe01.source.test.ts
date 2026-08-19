/**
 * Source lock — PO-HRM-MVP-GD1-ATT-02-CLUSTER-FE-01
 * Assert /attendance/* peers · Nest /core ATT=0 · mode shell stub-safe · honesty.
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

describe('PO-HRM-MVP-GD1-ATT-02-CLUSTER-FE-01 source lock', () => {
  it('hrmApi physical peers rules/sites/shifts/late-early/punch · no Nest /core ATT SoT', () => {
    const src = read('integrations/hrmApi.ts');
    const body = codeOnly(src);
    expect(src).toContain('/api/hrm/attendance/rules');
    expect(src).toContain('getAttendanceRules');
    expect(src).toContain('patchAttendanceRules');
    expect(src).toContain('/api/hrm/attendance/work-sites');
    expect(src).toContain('/api/hrm/attendance/work-shifts');
    expect(src).toContain('/api/hrm/attendance/late-early-requests');
    expect(src).toContain('/api/hrm/attendance/records');
    expect(body).not.toMatch(
      /(?:getAttendanceRules|patchAttendanceRules|listAttendanceWorkSites|listLateEarlyRequests)[\s\S]{0,600}\/api\/hrm\/core\//,
    );
  });

  it('useAttendanceRules + useLateEarlyRequests + useWorkShifts bind physical only', () => {
    const rules = read('hooks/useAttendanceRules.ts');
    const ler = read('hooks/useLateEarlyRequests.ts');
    const shifts = read('hooks/useWorkShifts.ts');
    expect(rules).toContain('getAttendanceRules');
    expect(rules).toContain('patchAttendanceRules');
    expect(rules).toContain('listAttendanceWorkSites');
    expect(codeOnly(rules)).not.toContain('/api/hrm/core/');
    expect(ler).toContain('listLateEarlyRequests');
    expect(codeOnly(ler)).not.toContain('/api/hrm/core/');
    expect(shifts).toContain('listWorkShifts');
    expect(shifts).toContain('createWorkShift');
    expect(codeOnly(shifts)).not.toContain('/api/hrm/core/');
    const api = read('integrations/hrmApi.ts');
    expect(api).toContain('/api/hrm/attendance/work-shifts');
  });

  it('AttLatePenaltyModePanel stub-safe · honesty · Nest /core 0 · no fake persist when ABSENT', () => {
    const panel = read('components/attendance/AttLatePenaltyModePanel.tsx');
    const body = codeOnly(panel);
    expect(panel).toContain('PO-HRM-MVP-GD1-ATT-02-CLUSTER-FE-01');
    expect(panel).toContain('getAttendanceRules');
    expect(panel).toContain('patchAttendanceRules');
    expect(panel).toContain('parseAtt02LatePenaltyEnvelope');
    expect(panel).toContain('envelopePresent');
    expect(panel).toContain('R_ATT_02_MODE_FE');
    expect(panel).toContain('att-02-honesty');
    expect(panel).toContain('att02HonestyBannerText');
    expect(panel).toContain('cấm lưu giả XOR');
    expect(body).not.toContain('/api/hrm/core/');
    expect(body).not.toMatch(/contracts_printable_ready\s*=\s*true/);
    expect(body).not.toMatch(/attendance_uat_ready\s*=\s*true/);
  });

  it('Attendance.tsx mounts mode panel · LateEarly honesty ≠ mode SoT', () => {
    const page = read('pages/Attendance.tsx');
    const lerTab = read('components/attendance/LateEarlyRequestTab.tsx');
    expect(page).toContain('AttLatePenaltyModePanel');
    expect(page).toContain('PO-HRM-MVP-GD1-ATT-02-CLUSTER-FE-01');
    expect(codeOnly(page)).not.toMatch(
      /AttLatePenaltyModePanel[\s\S]{0,200}\/api\/hrm\/core\//,
    );
    expect(lerTab).toContain('att-02-ler-honesty');
    expect(lerTab).toContain('late_early_requests ≠ mode SoT');
    expect(codeOnly(lerTab)).not.toContain('/api/hrm/core/');
  });

  it('attRuleRing path + honesty · DENY invent PAY/printable/ATT UAT', () => {
    const ring = read('lib/attRuleRing.ts');
    expect(ring).toContain("nestCoreDenied: '/api/hrm/core/'");
    expect(ring).toContain('/api/hrm/attendance/rules');
    expect(ring).toContain('CFG alone ≠ ATT-02 DONE');
    expect(ring).toContain('late_early_requests ≠ mode SoT');
    expect(ring).toContain('PAY OUT invent DONE');
    expect(ring).toContain('PLT01QC1-MSLPUQIU');
    expect(ring).toContain('CORE10QC1-MSLP0EJB');
    expect(ring).toContain('CORE09QC1-MSLNBA89');
    expect(ring).toContain('CORE07QC1-KZJTSHNT');
    expect(ring).toContain('soft ≠ CORE-06 DONE');
    expect(ring).toContain('R-ATT-02-MODE-FE');
    expect(codeOnly(ring)).not.toMatch(/contracts_printable_ready\s*=\s*true/);
  });
});
