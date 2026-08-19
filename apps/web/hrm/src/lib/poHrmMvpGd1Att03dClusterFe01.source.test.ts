/**
 * Source lock — PO-HRM-MVP-GD1-ATT-03D-CLUSTER-FE-01
 * Assert work-sites* + records punch · Nest /core ATT=0 · empty CTA · honesty · ≠ ATT-03d DONE.
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

describe('PO-HRM-MVP-GD1-ATT-03D-CLUSTER-FE-01 source lock', () => {
  it('hrmApi physical work-sites* + records · no Nest /core SoT', () => {
    const src = read('integrations/hrmApi.ts');
    const body = codeOnly(src);
    expect(src).toContain('/api/hrm/attendance/work-sites');
    expect(src).toContain('listAttendanceWorkSites');
    expect(src).toContain('createAttendanceWorkSite');
    expect(src).toContain('updateAttendanceWorkSite');
    expect(src).toContain('deleteAttendanceWorkSite');
    expect(src).toContain('/api/hrm/attendance/records');
    expect(body).not.toMatch(
      /(?:listAttendanceWorkSites|createAttendanceWorkSite|updateAttendanceWorkSite|deleteAttendanceWorkSite)[\s\S]{0,800}\/api\/hrm\/core\//,
    );
  });

  it('useAttendanceRules bind work-sites · statusLabelVi · no gps_locations PATCH · Nest /core 0', () => {
    const rules = read('hooks/useAttendanceRules.ts');
    const body = codeOnly(rules);
    expect(rules).toContain('PO-HRM-MVP-GD1-ATT-03D-CLUSTER-FE-01');
    expect(rules).toContain('listAttendanceWorkSites');
    expect(rules).toContain('createAttendanceWorkSite');
    expect(rules).toContain('deleteAttendanceWorkSite');
    expect(rules).toContain('parseAtt03dWorkSiteDisplay');
    expect(rules).toContain('statusLabelVi');
    expect(rules).toContain('active');
    expect(body).not.toContain('/api/hrm/core/');
    expect(body).not.toContain('ensureDefaultWorkSite');
    expect(body).not.toMatch(/patchAttendanceRules[\s\S]{0,400}gps_locations/);
  });

  it('Attendance GPS card · empty CTA · soft-retire · honesty · Nest /core 0', () => {
    const page = read('pages/Attendance.tsx');
    const body = codeOnly(page);
    expect(page).toContain('PO-HRM-MVP-GD1-ATT-03D-CLUSTER-FE-01');
    expect(page).toContain('att-gps-sites-card');
    expect(page).toContain('att-03d-empty-cta');
    expect(page).toContain('att-03d-honesty');
    expect(page).toContain('att03dHonestyBannerText');
    expect(page).toContain('att03dEmptyCatalogCtaMessage');
    expect(page).toContain('statusLabelVi');
    expect(page).toContain('att-gps-retire');
    expect(body).not.toContain('/api/hrm/core/');
    expect(body).not.toContain('ensureDefaultWorkSite');
    expect(body).not.toMatch(/contracts_printable_ready\s*=\s*true/);
    expect(body).not.toMatch(/attendance_uat_ready\s*=\s*true/);
  });

  it('GPSAttendance punch · lat/lon + method=gps · empty skip CTA · Nest /core 0', () => {
    const gps = read('components/attendance/GPSAttendance.tsx');
    const body = codeOnly(gps);
    expect(gps).toContain('PO-HRM-MVP-GD1-ATT-03D-CLUSTER-FE-01');
    expect(gps).toContain("check_in_method: 'gps'");
    expect(gps).toContain('latitude:');
    expect(gps).toContain('longitude:');
    expect(gps).toContain('att-03d-punch-empty-cta');
    expect(gps).toContain('att03dEmptyPunchSkipMessage');
    expect(gps).toContain('listAttendanceWorkSites');
    expect(body).not.toContain('/api/hrm/core/');
    expect(body).not.toContain('ensureDefaultWorkSite');
  });

  it('attWorkSite03dRing path + honesty · DENY PLT=DONE · seed · gps_locations sole · PAY', () => {
    const ring = read('lib/attWorkSite03dRing.ts');
    expect(ring).toContain("nestCoreDenied: '/api/hrm/core/'");
    expect(ring).toContain('/api/hrm/attendance/work-sites');
    expect(ring).toContain('/api/hrm/attendance/records');
    expect(ring).toContain('PLT WS / CNS-05 ≠ ATT-03d DONE');
    expect(ring).toContain('thin work-sites CRUD alone ≠ ATT-03d DONE');
    expect(ring).toContain('ATTWSQA-MSJC3IN9');
    expect(ring).toContain('ATTWSQA2-MSJCG47P');
    expect(ring).toContain('ATT03BQC1-MSM0891H');
    expect(ring).toContain('ATT01QC1-MSLZ3KIM');
    expect(ring).toContain('R-ATT-01-ASSIGN open');
    expect(ring).toContain('ATT11QC1-MSLXTH9P');
    expect(ring).toContain('ATT10QC1-MSLWGUYH');
    expect(ring).toContain('ATT09QC1-MSLUTL9D');
    expect(ring).toContain('ATT08QC1-MSLSL36C');
    expect(ring).toContain('ATT02QC1-MSLQZUK7');
    expect(ring).toContain('PLT01QC1-MSLPUQIU');
    expect(ring).toContain('CORE10QC1-MSLP0EJB');
    expect(ring).toContain('CORE09QC1-MSLNBA89');
    expect(ring).toContain('CORE07QC1-KZJTSHNT');
    expect(ring).toContain('ensureDefaultWorkSite');
    expect(ring).toContain('gps_locations');
    expect(ring).toContain('att_leave_hold');
    expect(ring).toContain('HRM-ATT-GEO-001');
    expect(ring).toContain('HRM-ATT-GEO-REQ');
    expect(ring).toContain('OVERLAP/SITE/MOB HOLD');
    expect(ring).toContain('PAY OUT invent DONE');
    expect(codeOnly(ring)).not.toMatch(/contracts_printable_ready\s*=\s*true/);
  });

  it('apiError surfaces GEO-001 · GEO-REQ · SITE-VAL/404', () => {
    const err = read('lib/apiError.ts');
    expect(err).toContain('HRM-ATT-GEO-001');
    expect(err).toContain('HRM-ATT-GEO-REQ');
    expect(err).toContain('HRM-ATT-SITE-VAL');
    expect(err).toContain('HRM-ATT-SITE-404');
  });
});
