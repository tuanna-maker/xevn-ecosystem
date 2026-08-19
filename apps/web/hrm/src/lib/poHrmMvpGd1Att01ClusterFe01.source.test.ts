/**
 * Source lock — PO-HRM-MVP-GD1-ATT-01-CLUSTER-FE-01
 * Assert work-shifts* + shift-change-requests* · Nest /core ATT=0 · empty CTA · honesty.
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

describe('PO-HRM-MVP-GD1-ATT-01-CLUSTER-FE-01 source lock', () => {
  it('hrmApi physical work-shifts* + effective + shift-change-requests* · no Nest /core SoT', () => {
    const src = read('integrations/hrmApi.ts');
    const body = codeOnly(src);
    expect(src).toContain('/api/hrm/attendance/work-shifts');
    expect(src).toContain('/api/hrm/attendance/work-shifts/effective');
    expect(src).toContain('/api/hrm/attendance/shift-change-requests');
    expect(src).toContain('listWorkShifts');
    expect(src).toContain('createWorkShift');
    expect(src).toContain('listEffectiveWorkShifts');
    expect(src).toContain('listShiftChangeRequests');
    expect(src).toContain('createShiftChangeRequest');
    expect(body).not.toMatch(
      /(?:listWorkShifts|createWorkShift|listEffectiveWorkShifts|listShiftChangeRequests|createShiftChangeRequest)[\s\S]{0,800}\/api\/hrm\/core\//,
    );
  });

  it('useWorkShifts + useWorkShiftsEffective + useShiftChangeRequests bind physical only', () => {
    const shifts = read('hooks/useWorkShifts.ts');
    const eff = read('hooks/useWorkShiftsEffective.ts');
    const cns = read('hooks/useShiftChangeRequests.ts');
    expect(shifts).toContain('listWorkShifts');
    expect(shifts).toContain('createWorkShift');
    expect(shifts).toContain('parseAtt01WorkShiftDisplay');
    expect(shifts).toContain('statusLabelVi');
    expect(codeOnly(shifts)).not.toContain('/api/hrm/core/');
    expect(eff).toContain('listEffectiveWorkShifts');
    expect(eff).toContain('workShiftsToPickerOptions');
    expect(codeOnly(eff)).not.toContain('/api/hrm/core/');
    expect(cns).toContain('listShiftChangeRequests');
    expect(cns).toContain('createShiftChangeRequest');
    expect(cns).toContain('toErrorMessage');
    expect(codeOnly(cns)).not.toContain('/api/hrm/core/');
  });

  it('ShiftChangeRequestTab EFF bind · empty CTA · no bootstrap seed · Nest /core 0', () => {
    const tab = read('components/attendance/ShiftChangeRequestTab.tsx');
    const body = codeOnly(tab);
    expect(tab).toContain('PO-HRM-MVP-GD1-ATT-01-CLUSTER-FE-01');
    expect(tab).toContain('useWorkShiftsEffective');
    expect(tab).toContain('isAtt01EffectiveEmpty');
    expect(tab).toContain('att01EmptyCatalogCtaMessage');
    expect(tab).toContain('att-01-cns-empty-cta');
    expect(tab).toContain('att-01-honesty');
    expect(tab).toContain('att01HonestyBannerText');
    expect(tab).toContain('HRM-ATT-SHIFT-KEY');
    expect(body).not.toContain('WORK_SHIFT_BOOTSTRAP_FALLBACK');
    expect(body).not.toContain('/api/hrm/core/');
    expect(body).not.toMatch(/contracts_printable_ready\s*=\s*true/);
    expect(body).not.toMatch(/attendance_uat_ready\s*=\s*true/);
  });

  it('Attendance Danh sách ca LIVE · statusLabelVi · GĐ2-HOLD schedule · honesty · Nest /core 0', () => {
    const page = read('pages/Attendance.tsx');
    const body = codeOnly(page);
    expect(page).toContain('PO-HRM-MVP-GD1-ATT-01-CLUSTER-FE-01');
    expect(page).toContain('useWorkShifts');
    expect(page).toContain('statusLabelVi');
    expect(page).toContain('att-01-honesty');
    expect(page).toContain('att01HonestyBannerText');
    expect(page).toContain('gd2Hold');
    expect(body).not.toMatch(/shift-assignments/);
    expect(body).not.toContain('/api/hrm/core/');
  });

  it('attShift01Ring path + honesty · DENY invent ASSIGN/PAY/printable/ATT UAT', () => {
    const ring = read('lib/attShift01Ring.ts');
    expect(ring).toContain("nestCoreDenied: '/api/hrm/core/'");
    expect(ring).toContain('/api/hrm/attendance/work-shifts');
    expect(ring).toContain('/api/hrm/attendance/shift-change-requests');
    expect(ring).toContain('catalog alone ≠ ATT-01 DONE');
    expect(ring).toContain('R-ATT-01-ASSIGN open');
    expect(ring).toContain('GĐ2-HOLD');
    expect(ring).toContain('≠ LIVE=ATT-11 DONE');
    expect(ring).toContain('≠ AGG=ATT-10 DONE');
    expect(ring).toContain('ATT11QC1-MSLXTH9P');
    expect(ring).toContain('ATT10QC1-MSLWGUYH');
    expect(ring).toContain('ATT09QC1-MSLUTL9D');
    expect(ring).toContain('ATT08QC1-MSLSL36C');
    expect(ring).toContain('ATT02QC1-MSLQZUK7');
    expect(ring).toContain('PLT01QC1-MSLPUQIU');
    expect(ring).toContain('CORE10QC1-MSLP0EJB');
    expect(ring).toContain('CORE09QC1-MSLNBA89');
    expect(ring).toContain('CORE07QC1-KZJTSHNT');
    expect(ring).toContain('soft ≠ CORE-06 DONE');
    expect(ring).toContain('PAY OUT invent DONE');
    expect(ring).toContain('HRM-ATT-SHIFT-KEY');
    expect(ring).toContain('att_leave_hold');
    expect(codeOnly(ring)).not.toMatch(/contracts_printable_ready\s*=\s*true/);
  });

  it('apiError surfaces HRM-ATT-SHIFT-KEY + HRM-WS-*', () => {
    const err = read('lib/apiError.ts');
    expect(err).toContain('HRM-ATT-SHIFT-KEY');
    expect(err).toContain('HRM-WS-VAL');
    expect(err).toContain('HRM-WS-404');
    expect(err).toContain('HRM-WS-409');
  });
});
