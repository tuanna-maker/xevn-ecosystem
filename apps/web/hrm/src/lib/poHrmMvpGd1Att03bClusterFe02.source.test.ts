/**
 * Source lock — PO-HRM-MVP-GD1-ATT-03B-CLUSTER-FE-02
 * residual LIVE holiday-calendars · Nest /core 0 · ≠ residual alone=ATT-03b DONE · seals RETAIN.
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

describe('PO-HRM-MVP-GD1-ATT-03B-CLUSTER-FE-02 source lock', () => {
  it('AttHolidayCalendarPanel residual GET/PUT · midYear · Nest /core 0', () => {
    const panel = read('components/attendance/AttHolidayCalendarPanel.tsx');
    const body = codeOnly(panel);
    expect(panel).toContain('PO-HRM-MVP-GD1-ATT-03B-CLUSTER-FE-02');
    expect(panel).toContain('getHolidayCalendar');
    expect(panel).toContain('putHolidayCalendar');
    expect(panel).toContain('parseAtt03bHolidayCalendarEnvelope');
    expect(panel).toContain('buildAtt03bPutYearBody');
    expect(panel).toContain('att-03b-holiday-calendar-panel');
    expect(panel).toContain('att-03b-honesty');
    expect(panel).toContain('att-03b-status-label');
    expect(panel).toContain('att-03b-midyear-banner');
    expect(panel).toContain('att03bMidYearRecalcBannerText');
    expect(panel).toContain('lunarFlag');
    expect(panel).toContain('dayType');
    expect(panel).toContain('isPaid');
    expect(panel).toContain('resolveAtt03bDayTypeLabelVi');
    expect(panel).toContain('residual ≠ ATT-03b DONE');
    expect(panel).toContain('att03bAdminLiveBadgeText');
    expect(panel).toContain('att03bResidualDeepenBannerText');
    expect(body).not.toContain('/api/hrm/core/');
    expect(body).not.toMatch(/contracts_printable_ready\s*=\s*true/);
    expect(body).not.toMatch(/attendance_uat_ready\s*=\s*true/);
  });

  it('hrmApi residual holiday-calendars · Nest /core 0', () => {
    const src = read('integrations/hrmApi.ts');
    const body = codeOnly(src);
    expect(src).toContain('/api/hrm/attendance/holiday-calendars/');
    expect(src).toContain('getHolidayCalendar');
    expect(src).toContain('putHolidayCalendar');
    expect(src).toContain('PO-HRM-MVP-GD1-ATT-03B-CLUSTER-FE-02');
    expect(src).toContain('midYearPendingLeaveRecalcRequired');
    expect(src).toContain('lunarFlag');
    expect(src).toContain('dayType');
    expect(body).not.toMatch(
      /(?:getHolidayCalendar|putHolidayCalendar)[\s\S]{0,800}\/api\/hrm\/core\//,
    );
  });

  it('attHoliday03bRing helpers · honesty residual ≠ DONE · seals', () => {
    const ring = read('lib/attHoliday03bRing.ts');
    expect(ring).toContain('PO-HRM-MVP-GD1-ATT-03B-CLUSTER-FE-02');
    expect(ring).toContain('resolveAtt03bStatusLabelVi');
    expect(ring).toContain('resolveAtt03bDayTypeLabelVi');
    expect(ring).toContain('midYearPendingLeaveRecalcRequired');
    expect(ring).toContain('ATT01QC1-MSLZ3KIM');
    expect(ring).toContain('ATT11QC1-MSLXTH9P');
    expect(ring).toContain('ATT10QC1-MSLWGUYH');
    expect(ring).toContain('ATT09QC1-MSLUTL9D');
    expect(ring).toContain('ATT08QC1-MSLSL36C');
    expect(ring).toContain('R-ATT-01-ASSIGN open');
    expect(ring).toContain('att_leave_hold');
    expect(ring).toContain('thin year GET/PUT ≠ ATT-03b DONE');
    expect(ring).toContain('≠ residual alone=ATT-03b DONE');
    expect(ring).toContain('R-ATT-03B-LUNAR');
    expect(codeOnly(ring)).not.toMatch(/contracts_printable_ready\s*=\s*true/);
  });

  it('Attendance mounts panel · Leave HOL-MISS CTA · apiError HOL-404', () => {
    const page = read('pages/Attendance.tsx');
    expect(page).toContain('AttHolidayCalendarPanel');
    expect(page).toContain('holiday-calendar');
    expect(codeOnly(page)).not.toMatch(
      /AttHolidayCalendarPanel[\s\S]{0,200}\/api\/hrm\/core\//,
    );

    const leave = read('components/attendance/AttLeavePreviewDeductionPanel.tsx');
    expect(leave).toContain('att-08-hol-miss-cta-admin');
    expect(leave).toContain('Lịch lễ / Tết');

    const err = read('lib/apiError.ts');
    expect(err).toContain('HRM-ATT-HOL-404');
    expect(err).toContain('HRM-LEAVE-HOL-MISSING');
  });
});
