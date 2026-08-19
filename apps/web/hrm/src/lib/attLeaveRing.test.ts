/**
 * Unit — attLeaveRing ATT-08 path / preview / honesty · FE-01 + FE-02 LIVE.
 */
import { describe, expect, it } from 'vitest';
import { ApiClientError } from './apiError';
import {
  ATT_08_HOL_MISS_CODE,
  ATT_LEAVE_08_PATH_ASSERT,
  R_ATT_08_PREVIEW_FE,
  R_ATT_08_PREVIEW_FE_STATUS,
  assertAtt08GoldWorkingDaysNotCalendar,
  assertAtt08PrintableHonesty,
  att08AlignInflateMessage,
  att08HonestyBannerText,
  att08HonestyFooterLines,
  att08PreviewLiveBadgeText,
  att08UnitLabelVi,
  buildAtt08PreviewDeductionBody,
  isAtt08AlignInflateError,
  isAtt08HolMissError,
  isAtt08PreviewAbsentError,
  isForbiddenAttLeaveSotPath,
  isPhysicalAttLeavePath,
  parseAtt08PreviewDeductionEnvelope,
  resolveAtt08SubmitTotalDays,
} from './attLeaveRing';

describe('attLeaveRing — PO-HRM-MVP-GD1-ATT-08-CLUSTER-FE-01/02', () => {
  it('path assert physical leave-requests + preview · Nest /core denied', () => {
    expect(ATT_LEAVE_08_PATH_ASSERT.leaveRequests).toBe(
      '/api/hrm/attendance/leave-requests',
    );
    expect(ATT_LEAVE_08_PATH_ASSERT.previewDeduction).toContain(
      '/attendance/leave-requests/preview-deduction',
    );
    expect(ATT_LEAVE_08_PATH_ASSERT.nestCoreDenied).toBe('/api/hrm/core/');
    expect(isPhysicalAttLeavePath(ATT_LEAVE_08_PATH_ASSERT.previewDeduction)).toBe(
      true,
    );
    expect(
      isForbiddenAttLeaveSotPath('/api/hrm/core/leave-requests/preview-deduction'),
    ).toBe(true);
    expect(
      isForbiddenAttLeaveSotPath('/api/hrm/attendance/leave-requests/preview-deduction'),
    ).toBe(false);
  });

  it('parse preview envelope LIVE display-ready · gold T6→T2 working_days=2', () => {
    const env = parseAtt08PreviewDeductionEnvelope({
      employeeId: 'e1',
      leaveType: 'ANNUAL',
      unit: 'day',
      startDate: '2026-08-07',
      endDate: '2026-08-10',
      calendar_days: 4,
      working_days: 2,
      deductible_units: 2,
      excluded_days: [
        { date: '2026-08-08', reason: 'weekend', labelVi: 'Thứ Bảy' },
        { date: '2026-08-09', reason: 'weekend', labelVi: 'Chủ nhật' },
      ],
      warnings: [],
    });
    expect(env.envelopePresent).toBe(true);
    expect(env.workingDays).toBe(2);
    expect(env.calendarDays).toBe(4);
    expect(env.deductibleUnits).toBe(2);
    expect(env.unit).toBe('day');
    expect(env.excludedDays).toHaveLength(2);
    expect(assertAtt08GoldWorkingDaysNotCalendar(env)).toBe(true);
  });

  it('DENY calendar inflate as trừ quỹ (working_days=4 calendar=4)', () => {
    const bad = parseAtt08PreviewDeductionEnvelope({
      working_days: 4,
      calendar_days: 4,
      deductible_units: 4,
      unit: 'day',
    });
    expect(assertAtt08GoldWorkingDaysNotCalendar(bad)).toBe(false);
  });

  it('ABSENT raw ⇒ envelopePresent false · no invent T6→T2', () => {
    const empty = parseAtt08PreviewDeductionEnvelope(null);
    expect(empty.envelopePresent).toBe(false);
    expect(empty.workingDays).toBeNull();
    expect(empty.deductibleUnits).toBeNull();
    expect(assertAtt08GoldWorkingDaysNotCalendar(empty)).toBe(true);
  });

  it('buildAtt08PreviewDeductionBody camelCase · optional halfDay/hours', () => {
    const body = buildAtt08PreviewDeductionBody({
      employeeId: 'e1',
      companyId: 'holding',
      leaveType: 'ANNUAL',
      startDate: '2026-08-07',
      endDate: '2026-08-10',
      halfDay: true,
      hours: 1,
    });
    expect(body.employeeId).toBe('e1');
    expect(body.companyId).toBe('holding');
    expect(body.leaveType).toBe('ANNUAL');
    expect(body.halfDay).toBe(true);
    expect(body.hours).toBe(1);
  });

  it('isAtt08PreviewAbsentError · HOL-MISS detect', () => {
    expect(
      isAtt08PreviewAbsentError(
        new ApiClientError({ status: 404, code: 'HRM-DATA-404', message: 'nf' }),
      ),
    ).toBe(true);
    expect(
      isAtt08HolMissError(
        new ApiClientError({
          status: 400,
          code: ATT_08_HOL_MISS_CODE,
          message: 'miss',
        }),
      ),
    ).toBe(true);
    expect(
      isAtt08PreviewAbsentError(
        new ApiClientError({
          status: 400,
          code: ATT_08_HOL_MISS_CODE,
          message: 'miss',
        }),
      ),
    ).toBe(false);
  });

  it('FE-02 · resolveAtt08SubmitTotalDays uses deductible_units · DENY calendar SoT', () => {
    const env = parseAtt08PreviewDeductionEnvelope({
      working_days: 2,
      calendar_days: 4,
      deductible_units: 2,
      unit: 'day',
    });
    expect(resolveAtt08SubmitTotalDays(env, 4)).toBe(2);
    expect(resolveAtt08SubmitTotalDays(null, 4)).toBe(4);
    expect(att08UnitLabelVi('day')).toBe('ngày');
    expect(att08UnitLabelVi('hour')).toBe('giờ');
  });

  it('FE-02 · half-day 0.5 / hour 1 unit from envelope', () => {
    const half = parseAtt08PreviewDeductionEnvelope({
      unit: 'day',
      deductible_units: 0.5,
      working_days: 0.5,
      calendar_days: 1,
    });
    expect(resolveAtt08SubmitTotalDays(half, 1)).toBe(0.5);
    const hour = parseAtt08PreviewDeductionEnvelope({
      unit: 'hour',
      deductible_units: 1,
      working_days: 0,
      calendar_days: 1,
    });
    expect(hour.unit).toBe('hour');
    expect(resolveAtt08SubmitTotalDays(hour, 1)).toBe(1);
  });

  it('FE-02 · ALIGN inflate detect + message · residual CLOSED', () => {
    const err = new ApiClientError({
      status: 400,
      code: 'HRM-VAL-400',
      message: 'total_days 4 does not match engine deductible_units 2 (BR-BP-LV-05 — calendar inflate rejected)',
      details: {
        total_days: 4,
        deductible_units: 2,
        working_days: 2,
        calendar_days: 4,
        unit: 'day',
      },
    });
    expect(isAtt08AlignInflateError(err)).toBe(true);
    expect(att08AlignInflateMessage(err)).toContain('4');
    expect(att08AlignInflateMessage(err)).toContain('2');
    expect(att08AlignInflateMessage(err)).toContain('BR-BP-LV-05');
    expect(R_ATT_08_PREVIEW_FE_STATUS).toBe('CLOSED');
    expect(att08PreviewLiveBadgeText()).toContain('CLOSED');
  });

  it('honesty footer · residual R-ATT-08-PREVIEW-FE CLOSED · printable false · stamps', () => {
    const lines = att08HonestyFooterLines();
    expect(lines.join(' ')).toContain('contracts_printable_ready=false');
    expect(lines.join(' ')).toContain('client total_days');
    expect(lines.join(' ')).toContain('≠ ATT-09');
    expect(lines.join(' ')).toContain('≠ ATT-03b');
    expect(lines.join(' ')).toContain('ATT02QC1-MSLQZUK7');
    expect(lines.join(' ')).toContain('PLT01QC1-MSLPUQIU');
    expect(lines.join(' ')).toContain('CORE10QC1-MSLP0EJB');
    expect(lines.join(' ')).toContain('CORE09QC1-MSLNBA89');
    expect(lines.join(' ')).toContain('CORE07QC1-KZJTSHNT');
    expect(lines.join(' ')).toContain('soft ≠ CORE-06 DONE');
    expect(lines.join(' ')).toContain(R_ATT_08_PREVIEW_FE);
    expect(lines.join(' ')).toContain('CLOSED');
    expect(lines.join(' ')).toContain('DENY fake T6→T2=4');
    expect(att08HonestyBannerText()).toContain('PAY OUT');
    expect(assertAtt08PrintableHonesty()).toBe(true);
  });
});
