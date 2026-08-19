/**
 * Unit — attHoliday03bRing ATT-03b path / DTO / residual / midYear / honesty.
 * FE-01 thin + FE-02 residual deepen.
 */
import { describe, expect, it } from 'vitest';
import { ApiClientError } from './apiError';
import {
  ATT_03B_HOL_404_CODE,
  ATT_03B_HONESTY_FOOTER,
  ATT_03B_VAL_400_CODE,
  ATT_HOL_03B_PATH_ASSERT,
  R_ATT_03B_ADMIN,
  R_ATT_03B_LUNAR,
  assertAtt03bPrintableHonesty,
  att03bHonestyBannerText,
  att03bHonestyFooterLines,
  att03bMidYearRecalcBannerText,
  att03bResidualDeepenBannerText,
  buildAtt03bPutYearBody,
  emptyAtt03bYearEnvelope,
  isAtt03bHol404Error,
  isForbiddenAttHolidaySotPath,
  isPhysicalAttHolidayPath,
  parseAtt03bHolidayCalendarEnvelope,
  resolveAtt03bDayTypeLabelVi,
  resolveAtt03bStatusLabelVi,
  validateAtt03bYearDraft,
} from './attHoliday03bRing';

describe('attHoliday03bRing — PO-HRM-MVP-GD1-ATT-03B-CLUSTER-FE-02', () => {
  it('path assert physical holiday-calendars · Nest /core denied', () => {
    expect(ATT_HOL_03B_PATH_ASSERT.holidayCalendars).toBe(
      '/api/hrm/attendance/holiday-calendars',
    );
    expect(ATT_HOL_03B_PATH_ASSERT.holidayCalendarYear).toContain(
      '/attendance/holiday-calendars/:year',
    );
    expect(ATT_HOL_03B_PATH_ASSERT.leavePreviewPeer).toContain(
      '/attendance/leave-requests/preview-deduction',
    );
    expect(ATT_HOL_03B_PATH_ASSERT.nestCoreDenied).toBe('/api/hrm/core/');
    expect(ATT_HOL_03B_PATH_ASSERT.inventHoldTableDenied).toBe('att_leave_hold');
    expect(isPhysicalAttHolidayPath('/api/hrm/attendance/holiday-calendars/2026')).toBe(
      true,
    );
    expect(isForbiddenAttHolidaySotPath('/api/hrm/core/att/holiday-calendars/2026')).toBe(
      true,
    );
    expect(isForbiddenAttHolidaySotPath('/api/hrm/attendance/holiday-calendars/2026')).toBe(
      false,
    );
  });

  it('parse thin LIVE envelope · statusLabelVi FE-derive · residual absent', () => {
    const env = parseAtt03bHolidayCalendarEnvelope({
      id: 'cal-1',
      companyId: 'main',
      year: 2026,
      days: [
        { date: '2026-01-01', nameVi: 'Tết Dương lịch' },
        { date: '2026-04-30', name_vi: 'Giải phóng miền Nam' },
      ],
      dayCount: 2,
      updatedAt: '2026-08-09T00:00:00.000Z',
      createdAt: '2026-01-01T00:00:00.000Z',
    });
    expect(env.envelopePresent).toBe(true);
    expect(env.residualDeepenPresent).toBe(false);
    expect(env.year).toBe(2026);
    expect(env.days).toHaveLength(2);
    expect(env.days[0].nameVi).toBe('Tết Dương lịch');
    expect(env.days[1].nameVi).toBe('Giải phóng miền Nam');
    expect(env.statusLabelVi).toBe('Đã lưu năm (thay tại chỗ GĐ1)');
    expect(env.days[0].lunarFlag).toBeNull();
    expect(env.days[0].isPaid).toBeNull();
    expect(env.midYearPendingLeaveRecalcRequired).toBe(false);
  });

  it('parse residual deepen · statusLabelVi · dayTypeLabelVi · midYear', () => {
    const env = parseAtt03bHolidayCalendarEnvelope({
      id: 'cal-2',
      company_id: 'main',
      year: 2026,
      status: 'effective',
      statusLabelVi: 'Đã phát hành',
      calendarType: 'solar',
      publishMode: 'replace_in_place_gd1',
      midYearPendingLeaveRecalcRequired: true,
      days: [
        {
          date: '2026-02-17',
          nameVi: 'Mùng 1 Tết',
          lunarFlag: true,
          calendarType: 'lunar',
          isPaid: true,
          dayType: 'nghi',
          dayTypeLabelVi: 'Nghỉ lễ',
        },
        {
          date: '2026-09-02',
          nameVi: 'Trực Quốc khánh',
          lunarFlag: false,
          calendarType: 'solar',
          isPaid: false,
          dayType: 'truc',
        },
      ],
      day_count: 2,
    });
    expect(env.residualDeepenPresent).toBe(true);
    expect(env.status).toBe('effective');
    expect(env.statusLabelVi).toBe('Đã phát hành');
    expect(env.calendarType).toBe('solar');
    expect(env.publishMode).toBe('replace_in_place_gd1');
    expect(env.midYearPendingLeaveRecalcRequired).toBe(true);
    expect(env.days[0].lunarFlag).toBe(true);
    expect(env.days[0].calendarType).toBe('lunar');
    expect(env.days[0].isPaid).toBe(true);
    expect(env.days[0].dayType).toBe('nghi');
    expect(env.days[0].dayTypeLabelVi).toBe('Nghỉ lễ');
    expect(env.days[1].dayType).toBe('truc');
    expect(env.days[1].dayTypeLabelVi).toBe('Trực lễ');
  });

  it('dayTypeLabelVi FE-derive · statusLabelVi · empty year', () => {
    expect(resolveAtt03bDayTypeLabelVi('nghi', null)).toBe('Nghỉ lễ');
    expect(resolveAtt03bDayTypeLabelVi('truc', null)).toBe('Trực lễ');
    expect(resolveAtt03bDayTypeLabelVi('nghi', 'Nhãn BE')).toBe('Nhãn BE');
    expect(resolveAtt03bStatusLabelVi(null, null, 0, false)).toBe('Chưa có lịch năm');
    expect(resolveAtt03bStatusLabelVi(null, null, 0, true)).toBe(
      'Năm trống (chưa có ngày)',
    );
    expect(resolveAtt03bStatusLabelVi('effective', null, 3, true)).toBe('Đã phát hành');
    expect(resolveAtt03bStatusLabelVi('draft', null, 1, true)).toBe('Nháp');
    const empty = emptyAtt03bYearEnvelope(2027, 'main');
    expect(empty.envelopePresent).toBe(false);
    expect(empty.year).toBe(2027);
    expect(empty.statusLabelVi).toBe('Chưa có lịch năm');
    expect(empty.midYearPendingLeaveRecalcRequired).toBe(false);
  });

  it('PUT body residual fields · validate duplicate · HOL-404 detect', () => {
    const body = buildAtt03bPutYearBody({
      companyId: 'main',
      status: 'effective',
      calendarType: 'solar',
      days: [
        {
          date: '2026-01-01',
          nameVi: 'Tết Dương lịch',
          lunarFlag: false,
          calendarType: 'solar',
          isPaid: true,
          dayType: 'nghi',
        },
        {
          date: '2026-02-17',
          nameVi: 'Mùng 1',
          lunarFlag: true,
          calendarType: 'lunar',
          isPaid: true,
          dayType: 'nghi',
        },
        { date: '2026-09-02', nameVi: '  ', dayType: 'truc', isPaid: false },
      ],
    });
    expect(body.companyId).toBe('main');
    expect(body.status).toBe('effective');
    expect(body.calendarType).toBe('solar');
    expect(body.days[0]).toEqual({
      date: '2026-01-01',
      nameVi: 'Tết Dương lịch',
      lunarFlag: false,
      calendarType: 'solar',
      isPaid: true,
      dayType: 'nghi',
    });
    expect(body.days[1].lunarFlag).toBe(true);
    expect(body.days[1].calendarType).toBe('lunar');
    expect(body.days[2]).toEqual({
      date: '2026-09-02',
      isPaid: false,
      dayType: 'truc',
    });
    expect(validateAtt03bYearDraft([{ date: '2026-01-01' }, { date: '2026-01-01' }])).toContain(
      'HRM-VAL-400',
    );
    expect(validateAtt03bYearDraft([{ date: '2026-01-01' }, { date: '2026-01-02' }])).toBeNull();
    expect(ATT_03B_VAL_400_CODE).toBe('HRM-VAL-400');
    expect(
      isAtt03bHol404Error(
        new ApiClientError({
          status: 404,
          code: ATT_03B_HOL_404_CODE,
          message: 'missing',
        }),
      ),
    ).toBe(true);
  });

  it('honesty footer · residual ≠ ATT-03b DONE · midYear banner · seals', () => {
    expect(assertAtt03bPrintableHonesty()).toBe(true);
    expect(ATT_03B_HONESTY_FOOTER.thinNeDone).toContain('≠ ATT-03b DONE');
    expect(ATT_03B_HONESTY_FOOTER.residualNeDone).toContain(
      '≠ ATT-03b DONE alone',
    );
    expect(ATT_03B_HONESTY_FOOTER.neCatalog01).toContain('ATT01QC1-MSLZ3KIM');
    expect(ATT_03B_HONESTY_FOOTER.neLive11).toContain('ATT11QC1-MSLXTH9P');
    expect(ATT_03B_HONESTY_FOOTER.neAgg10).toContain('ATT10QC1-MSLWGUYH');
    expect(ATT_03B_HONESTY_FOOTER.neSoft09).toContain('att_leave_hold');
    expect(ATT_03B_HONESTY_FOOTER.holMissPeer).toContain('ATT08QC1-MSLSL36C');
    expect(ATT_03B_HONESTY_FOOTER.residualBound).toContain('≠ residual alone=ATT-03b DONE');
    expect(att03bHonestyFooterLines().length).toBeGreaterThan(10);
    expect(att03bHonestyBannerText()).toContain('thin year GET/PUT ≠ ATT-03b DONE');
    expect(att03bHonestyBannerText()).toContain('≠ ATT-03b DONE alone');
    expect(att03bResidualDeepenBannerText()).toContain(R_ATT_03B_LUNAR);
    expect(att03bResidualDeepenBannerText()).toContain('≠ residual alone=ATT-03b DONE');
    expect(att03bMidYearRecalcBannerText()).toContain('midYearPendingLeaveRecalcRequired');
    expect(R_ATT_03B_ADMIN).toBe('R-ATT-03B-ADMIN');
  });
});
