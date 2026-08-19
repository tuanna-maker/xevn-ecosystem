/**
 * @CODE-MEMORY
 * Screen:     unit — attWorkSite03dRing helpers (ATT-03d)
 * UC:         UC-BP-ATT-03d · J-HRM-ATT-03D-01..06
 * Purpose:    Unit coverage for path · statusLabelVi from active · empty CTA · GEO · honesty
 * WorkItem:   PO-HRM-MVP-GD1-ATT-03D-CLUSTER-FE-01
 * Coded:      2026-08-09
 * must_keep:  Nest /core DENY · ≠ ATT-03d DONE · PLT WS ≠ DONE · U65
 */
import { describe, expect, it } from 'vitest';
import {
  ATT_03D_GEO_001_CODE,
  ATT_03D_GEO_REQ_CODE,
  ATT_03D_HONESTY_FOOTER,
  ATT_03D_STATUS_LABELS_VI,
  ATT_WS_03D_PATH_ASSERT,
  R_ATT_03D_EMPTY,
  att03dEmptyCatalogCtaMessage,
  att03dEmptyPunchSkipMessage,
  att03dGeo001Message,
  att03dGeoReqMessage,
  att03dHonestyBannerText,
  att03dHonestyFooterLines,
  assertAtt03dPrintableHonesty,
  deriveAtt03dStatusLabelVi,
  isAtt03dActiveEmpty,
  isForbiddenAtt03dSotPath,
  isPhysicalAtt03dPath,
  parseAtt03dWorkSiteDisplay,
} from './attWorkSite03dRing';

describe('attWorkSite03dRing', () => {
  it('locks physical paths · Nest /core denied · invent bans', () => {
    expect(ATT_WS_03D_PATH_ASSERT.workSites).toContain('/attendance/work-sites');
    expect(ATT_WS_03D_PATH_ASSERT.attendanceRecords).toContain('/attendance/records');
    expect(ATT_WS_03D_PATH_ASSERT.attendanceRulesPeer).toContain('/attendance/rules');
    expect(ATT_WS_03D_PATH_ASSERT.nestCoreDenied).toBe('/api/hrm/core/');
    expect(ATT_WS_03D_PATH_ASSERT.inventHoldTableDenied).toBe('att_leave_hold');
    expect(ATT_WS_03D_PATH_ASSERT.ensureDefaultDenied).toBe('ensureDefaultWorkSite');
    expect(ATT_WS_03D_PATH_ASSERT.gpsLocationsSoleDenied).toBe('gps_locations');
    expect(R_ATT_03D_EMPTY).toBe('R-ATT-03D-EMPTY');
  });

  it('FE-derives statusLabelVi from active · wire wins', () => {
    expect(deriveAtt03dStatusLabelVi(true)).toBe(ATT_03D_STATUS_LABELS_VI.active);
    expect(deriveAtt03dStatusLabelVi(false)).toBe(ATT_03D_STATUS_LABELS_VI.inactive);
    expect(deriveAtt03dStatusLabelVi(true, 'Đang áp dụng')).toBe('Đang áp dụng');
    expect(deriveAtt03dStatusLabelVi(null)).toBe('—');
  });

  it('parses display-ready work-site row', () => {
    const display = parseAtt03dWorkSiteDisplay({
      id: 'site-1',
      company_id: 'main',
      name: 'Văn phòng HN',
      address: 'Cầu Giấy',
      latitude: 21.02,
      longitude: 105.8,
      radius_meters: 150,
      active: true,
    });
    expect(display.id).toBe('site-1');
    expect(display.companyId).toBe('main');
    expect(display.radiusMeters).toBe(150);
    expect(display.active).toBe(true);
    expect(display.statusLabelVi).toBe('Đang hiệu lực');
  });

  it('empty active → CTA · punch skip · GEO messages', () => {
    expect(isAtt03dActiveEmpty(0)).toBe(true);
    expect(isAtt03dActiveEmpty(2)).toBe(false);
    expect(att03dEmptyCatalogCtaMessage()).toContain('Điểm GPS');
    expect(att03dEmptyCatalogCtaMessage()).toContain('không seed');
    expect(att03dEmptyPunchSkipMessage()).toContain('không bị chặn ngoài vùng');
    expect(att03dGeo001Message()).toContain(ATT_03D_GEO_001_CODE);
    expect(att03dGeoReqMessage()).toContain(ATT_03D_GEO_REQ_CODE);
  });

  it('path guards physical vs Nest /core', () => {
    expect(isPhysicalAtt03dPath('/api/hrm/attendance/work-sites')).toBe(true);
    expect(isPhysicalAtt03dPath('/api/hrm/attendance/records')).toBe(true);
    expect(isForbiddenAtt03dSotPath('/api/hrm/core/att/work-sites')).toBe(true);
    expect(isForbiddenAtt03dSotPath('/api/hrm/attendance/work-sites')).toBe(false);
  });

  it('honesty footer · printable false · ≠ ATT-03d DONE · PLT WS ≠ DONE', () => {
    expect(assertAtt03dPrintableHonesty()).toBe(true);
    const lines = att03dHonestyFooterLines();
    expect(lines).toContain(ATT_03D_HONESTY_FOOTER.pltWsNeAtt03dDone);
    expect(lines).toContain(ATT_03D_HONESTY_FOOTER.thinNeAtt03dDone);
    expect(lines).toContain(ATT_03D_HONESTY_FOOTER.neResidualAtt03b);
    expect(lines).toContain(ATT_03D_HONESTY_FOOTER.neCatalogAtt01);
    expect(lines).toContain(ATT_03D_HONESTY_FOOTER.neLiveAtt11);
    expect(lines).toContain(ATT_03D_HONESTY_FOOTER.neAggAtt10);
    expect(lines).toContain(ATT_03D_HONESTY_FOOTER.payOut);
    expect(lines).toContain(ATT_03D_HONESTY_FOOTER.noSeed);
    expect(att03dHonestyBannerText()).toContain('PLT WS / CNS-05 ≠ ATT-03d DONE');
    expect(att03dHonestyBannerText()).toContain('thin work-sites CRUD alone ≠ ATT-03d DONE');
  });
});
