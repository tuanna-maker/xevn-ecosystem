/**
 * Source lock — PO-HRM-MVP-GD1-ATT-11-CLUSTER-FE-01 / FE-02 comment terminator
 * Sign/close/reopen bind · Nest /core = 0 · must_keep ATT-10/09/08 · DENY att_leave_hold.
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

describe('PO-HRM-MVP-GD1-ATT-11-CLUSTER-FE-01 source lock', () => {
  it('hrmApi FE-02 — block comment must not contain star-slash path typo (Vite 500)', () => {
    const src = read('integrations/hrmApi.ts');
    expect(src).toContain('PO-HRM-MVP-GD1-ATT-11-CLUSTER-FE-02');
    expect(src).not.toMatch(/attendance-sheets\*\/signatures/);
    expect(src).toContain('attendance-sheets/{id}/signatures');
    expect(codeOnly(src)).toContain('export type HrmAttendanceSheetSignaturesPayload');
    expect(codeOnly(src)).toContain('export async function listAttendanceSheetSignatures');
  });

  it('hrmApi physical signatures/close/reopen · Nest /core SoT = 0', () => {
    const src = read('integrations/hrmApi.ts');
    const body = codeOnly(src);
    expect(src).toContain('/api/hrm/attendance/attendance-sheets/');
    expect(src).toContain('/signatures');
    expect(src).toContain('/close');
    expect(src).toContain('/reopen');
    expect(src).toContain('listAttendanceSheetSignatures');
    expect(src).toContain('createAttendanceSheetSignature');
    expect(src).toContain('closeAttendanceSheet');
    expect(src).toContain('reopenAttendanceSheet');
    expect(src).toContain('PO-HRM-MVP-GD1-ATT-11-CLUSTER-FE-01');
    expect(body).not.toMatch(
      /(?:listAttendanceSheetSignatures|createAttendanceSheetSignature|closeAttendanceSheet|reopenAttendanceSheet)[\s\S]{0,900}\/api\/hrm\/core\//,
    );
    // No dual hold path in sign/close/reopen SoT (DENY invent — stamp only in CODE-MEMORY/ring).
    const signSliceStart = body.indexOf('listAttendanceSheetSignatures');
    const signSlice = body.slice(signSliceStart, signSliceStart + 4500);
    expect(signSlice).toContain('/signatures');
    expect(signSlice).toContain('/close');
    expect(signSlice).toContain('/reopen');
    expect(signSlice).not.toContain('att_leave_hold');
    expect(signSlice).not.toContain('/api/hrm/core/');
  });

  it('AttendanceSheetSignPanel Sign/close/reopen · display-ready · reject · honesty · Nest /core 0', () => {
    const panel = read('components/attendance/AttendanceSheetSignPanel.tsx');
    expect(panel).toContain('PO-HRM-MVP-GD1-ATT-11-CLUSTER-FE-01');
    expect(panel).toContain('parseAtt11SignaturesDisplay');
    expect(panel).toContain('att11HonestyBannerText');
    expect(panel).toContain('data-testid="att-11-honesty"');
    expect(panel).toContain('data-testid="att-11-sign-display"');
    expect(panel).toContain('data-testid="att-sign-close-sheet"');
    expect(panel).toContain('att-sheet-reopen');
    expect(panel).toContain('att-sign-reject-');
    expect(panel).toContain('FIXED_GĐ1');
    expect(panel).toContain('listAttendanceSheetSignatures');
    expect(panel).toContain('closeAttendanceSheet');
    expect(panel).toContain('reopenAttendanceSheet');
    // ATT-10 peer must_keep
    expect(panel).toContain('PO-HRM-MVP-GD1-ATT-10-CLUSTER-FE-01');
    expect(panel).toContain('att-10-agg-display');
    expect(codeOnly(panel)).not.toContain('/api/hrm/core/');
    expect(codeOnly(panel)).not.toContain('att_leave_hold');
    expect(codeOnly(panel)).not.toMatch(/attendance_uat_ready\s*=\s*true/);
    expect(codeOnly(panel)).not.toMatch(/contracts_printable_ready\s*=\s*true/);
  });

  it('attSheet11Ring honesty · FIXED_GĐ1 · Nest deny · seals · DENY dual hold', () => {
    const ring = read('lib/attSheet11Ring.ts');
    expect(ring).toContain('PO-HRM-MVP-GD1-ATT-11-CLUSTER-FE-01');
    expect(ring).toContain("inventHoldTableDenied: 'att_leave_hold'");
    expect(ring).toContain("secondSignLedgerDenied: 'second_sign_ledger'");
    expect(ring).toContain("nestCoreDenied: '/api/hrm/core/'");
    expect(ring).toContain('≠ LIVE sign/close alone = ATT-11 DONE');
    expect(ring).toContain('≠ AGG = ATT-10 DONE');
    expect(ring).toContain('ATT10QC1-MSLWGUYH');
    expect(ring).toContain('≠ soft/ATT-08 = ATT-09 DONE');
    expect(ring).toContain('CFG ≠ ATT-02 DONE (ATT02QC1-MSLQZUK7)');
    expect(ring).toContain('ATT08QC1-MSLSL36C');
    expect(ring).toContain('ATT09QC1-MSLUTL9D');
    expect(ring).toContain('FIXED_GĐ1');
    expect(ring).toContain('employee');
    expect(ring).toContain('direct_manager');
    expect(ring).toContain('hr_admin');
    expect(ring).toContain('OUT GĐ1');
    expect(codeOnly(ring)).not.toMatch(/contracts_printable_ready\s*=\s*true/);
    expect(codeOnly(ring)).not.toMatch(/attendance_uat_ready\s*=\s*true/);
  });

  it('ATT-10 / ATT-09 / ATT-08 peer must_keep paths intact (no wipe)', () => {
    const sheet10 = read('lib/attSheet10Ring.ts');
    const leave09 = read('lib/attLeave09Ring.ts');
    const leave08 = read('lib/attLeaveRing.ts');
    expect(sheet10).toContain('ATT09QC1-MSLUTL9D');
    expect(sheet10).toContain('≠ AGG alone = ATT-10 DONE');
    expect(leave09).toContain("inventHoldTableDenied: 'att_leave_hold'");
    expect(leave08).toContain('previewDeduction');
    expect(leave08).toContain("nestCoreDenied: '/api/hrm/core/'");
  });
});
