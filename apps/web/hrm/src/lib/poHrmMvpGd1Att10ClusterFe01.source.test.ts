/**
 * Source lock — PO-HRM-MVP-GD1-ATT-10-CLUSTER-FE-01
 * AGG/submit bind · Nest /core = 0 · must_keep ATT-09/08 · DENY att_leave_hold.
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

describe('PO-HRM-MVP-GD1-ATT-10-CLUSTER-FE-01 source lock', () => {
  it('hrmApi physical attendance-sheets AGG/submit · Nest /core AGG SoT = 0', () => {
    const src = read('integrations/hrmApi.ts');
    const body = codeOnly(src);
    expect(src).toContain('/api/hrm/attendance/attendance-sheets/');
    expect(src).toContain('/aggregate');
    expect(src).toContain('/submit');
    expect(src).toContain('aggregateAttendanceSheet');
    expect(src).toContain('submitAttendanceSheetForSign');
    expect(src).toContain('PO-HRM-MVP-GD1-ATT-10-CLUSTER-FE-01');
    expect(body).not.toMatch(
      /(?:aggregateAttendanceSheet|submitAttendanceSheetForSign)[\s\S]{0,800}\/api\/hrm\/core\//,
    );
    expect(body).not.toContain('att_leave_hold');
  });

  it('AttendanceSheetSignPanel AGG on draft/open · display-ready · honesty · Nest /core 0', () => {
    const panel = read('components/attendance/AttendanceSheetSignPanel.tsx');
    expect(panel).toContain('PO-HRM-MVP-GD1-ATT-10-CLUSTER-FE-01');
    expect(panel).toContain('parseAtt10SheetAggDisplay');
    expect(panel).toContain('att10HonestyBannerText');
    expect(panel).toContain('data-testid="att-10-honesty"');
    expect(panel).toContain('data-testid="att-10-agg-display"');
    expect(panel).toContain('data-testid="att-sheet-aggregate"');
    expect(panel).toContain('att-sheet-aggregate-draft');
    expect(codeOnly(panel)).not.toContain('/api/hrm/core/');
    expect(codeOnly(panel)).not.toContain('att_leave_hold');
    expect(codeOnly(panel)).not.toMatch(/attendance_uat_ready\s*=\s*true/);
    expect(codeOnly(panel)).not.toMatch(/contracts_printable_ready\s*=\s*true/);
  });

  it('attSheet10Ring honesty · gold · Nest deny · seals · DENY dual hold', () => {
    const ring = read('lib/attSheet10Ring.ts');
    expect(ring).toContain('PO-HRM-MVP-GD1-ATT-10-CLUSTER-FE-01');
    expect(ring).toContain("inventHoldTableDenied: 'att_leave_hold'");
    expect(ring).toContain("nestCoreDenied: '/api/hrm/core/'");
    expect(ring).toContain('≠ AGG alone = ATT-10 DONE');
    expect(ring).toContain('≠ soft/ATT-08 = ATT-09 DONE');
    expect(ring).toContain('CFG ≠ ATT-02 DONE (ATT02QC1-MSLQZUK7)');
    expect(ring).toContain('ATT08QC1-MSLSL36C');
    expect(ring).toContain('ATT09QC1-MSLUTL9D');
    expect(ring).toContain('computeAtt10PayableGold');
    expect(ring).toContain('OUT GĐ1');
    expect(codeOnly(ring)).not.toMatch(/contracts_printable_ready\s*=\s*true/);
    expect(codeOnly(ring)).not.toMatch(/attendance_uat_ready\s*=\s*true/);
  });

  it('ATT-08 / ATT-09 peer must_keep paths intact (no wipe)', () => {
    const leave09 = read('lib/attLeave09Ring.ts');
    const leave08 = read('lib/attLeaveRing.ts');
    expect(leave09).toContain('ATT08QC1-MSLSL36C');
    expect(leave09).toContain("inventHoldTableDenied: 'att_leave_hold'");
    expect(leave08).toContain('previewDeduction');
    expect(leave08).toContain("nestCoreDenied: '/api/hrm/core/'");
  });
});
