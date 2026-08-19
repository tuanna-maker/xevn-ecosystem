/**
 * @CODE-MEMORY
 * Screen:     vitest — ATT-10 ring helpers
 * UC:         UC-BP-ATT-10 · AC-ATT-10-PAYABLE/GOLD/OT/DISP/PATH
 * WorkItem:   PO-HRM-MVP-GD1-ATT-10-CLUSTER-FE-01
 * Purpose:    Unit coverage for path · statusLabelVi · payable gold · parse display · honesty
 */
import { describe, expect, it } from 'vitest';
import {
  ATT_SHEET_10_PATH_ASSERT,
  ATT_10_MUST_KEEP_STAMPS,
  att10HonestyBannerText,
  att10HolMealFooterText,
  att10LinesDispResidualText,
  att10PrintableReady,
  computeAtt10PayableGold,
  deriveAtt10StatusLabelVi,
  isAtt10EmptyEnrollment,
  isAtt10PayableGoldOk,
  isAtt10RawOtInPayableFail,
  isForbiddenAttSheet10SotPath,
  isPhysicalAttSheet10Path,
  parseAtt10SheetAggDisplay,
} from './attSheet10Ring';

describe('attSheet10Ring — PO-HRM-MVP-GD1-ATT-10-CLUSTER-FE-01', () => {
  it('locks physical attendance-sheets path · Nest /core forbidden', () => {
    expect(
      isPhysicalAttSheet10Path('/api/hrm/attendance/attendance-sheets/abc/aggregate'),
    ).toBe(true);
    expect(isPhysicalAttSheet10Path(ATT_SHEET_10_PATH_ASSERT.listSheets)).toBe(true);
    expect(isForbiddenAttSheet10SotPath('/api/hrm/core/attendance-sheets/agg')).toBe(true);
    expect(isForbiddenAttSheet10SotPath('att_leave_hold')).toBe(true);
    expect(isForbiddenAttSheet10SotPath('/api/hrm/attendance/attendance-sheets/x/submit')).toBe(
      false,
    );
  });

  it('FE-derives statusLabelVi · wire wins', () => {
    expect(deriveAtt10StatusLabelVi('draft')).toBe('Nháp');
    expect(deriveAtt10StatusLabelVi('open')).toBe('Nháp');
    expect(deriveAtt10StatusLabelVi('submitted')).toBe('Chờ ký');
    expect(deriveAtt10StatusLabelVi('closed')).toBe('Đã chốt');
    expect(deriveAtt10StatusLabelVi('submitted', '  Đã gửi  ')).toBe('Đã gửi');
  });

  it('payable gold GĐ1 = std+paidLeave+otWeighted · unpaid∉ · penalty not subtracted', () => {
    const gold = computeAtt10PayableGold({
      standardHours: 8,
      paidLeaveHours: 8,
      otHoursWeighted: 3,
    });
    expect(gold).toBe(19);
    expect(
      isAtt10PayableGoldOk(19, {
        standardHours: 8,
        paidLeaveHours: 8,
        otHoursWeighted: 3,
      }),
    ).toBe(true);
    // unpaid excluded from gold
    expect(
      isAtt10PayableGoldOk(19, {
        standardHours: 8,
        paidLeaveHours: 8,
        otHoursWeighted: 3,
      }),
    ).toBe(true);
    // subtracting late_penalty from payable = FAIL gold
    expect(
      isAtt10PayableGoldOk(18, {
        standardHours: 8,
        paidLeaveHours: 8,
        otHoursWeighted: 3,
      }),
    ).toBe(false);
  });

  it('FAIL raw OT in payable when weighted differs', () => {
    expect(
      isAtt10RawOtInPayableFail({
        payableHours: 10,
        standardHours: 8,
        paidLeaveHours: 0,
        otHoursRaw: 2,
        otHoursWeighted: 3,
      }),
    ).toBe(true);
    expect(
      isAtt10RawOtInPayableFail({
        payableHours: 11,
        standardHours: 8,
        paidLeaveHours: 0,
        otHoursRaw: 2,
        otHoursWeighted: 3,
      }),
    ).toBe(false);
  });

  it('parses display-ready AGG envelope with lines gold + HOL/MEAL null', () => {
    const display = parseAtt10SheetAggDisplay({
      sheet_id: 'sheet-1',
      status: 'submitted',
      line_count: 1,
      warnings: ['AGG_OT_ENROLL_UNAVAILABLE'],
      lines: [
        {
          employee_id: 'emp-1',
          employee_name: 'Nguyễn Văn A',
          standard_hours: 8,
          ot_hours_weighted: 1.5,
          paid_leave_hours: 0,
          unpaid_leave_hours: 4,
          late_penalty_hours: 0.5,
          meal_shift_hours: null,
          holiday_hours: null,
          payable_hours: 9.5,
          work_days: 1,
          line_locked: false,
        },
      ],
    });
    expect(display).not.toBeNull();
    expect(display!.sheetId).toBe('sheet-1');
    expect(display!.statusLabelVi).toBe('Chờ ký');
    expect(display!.lineCount).toBe(1);
    expect(display!.warnings).toEqual(['AGG_OT_ENROLL_UNAVAILABLE']);
    expect(display!.linesEnvelopePresent).toBe(true);
    expect(display!.lines).toHaveLength(1);
    expect(display!.lines[0].payableGoldOk).toBe(true);
    expect(display!.lines[0].unpaidLeaveHours).toBe(4);
    expect(display!.lines[0].latePenaltyHours).toBe(0.5);
    expect(display!.lines[0].mealShiftHours).toBeNull();
    expect(display!.lines[0].holidayHours).toBeNull();
    expect(att10LinesDispResidualText(display!)).toBeNull();
  });

  it('empty enrollment + DISP residual when line_count>0 without lines[]', () => {
    expect(isAtt10EmptyEnrollment({ lineCount: 0, warnings: [] })).toBe(true);
    const metaOnly = parseAtt10SheetAggDisplay({
      sheet_id: 's2',
      status: 'open',
      line_count: 3,
      warnings: [],
    });
    expect(metaOnly!.linesEnvelopePresent).toBe(false);
    expect(metaOnly!.statusLabelVi).toBe('Nháp');
    expect(att10LinesDispResidualText(metaOnly!)).toMatch(/R-ATT-10-DISP/);
  });

  it('honesty · HOL/MEAL footer · stamps · printable false', () => {
    const honesty = att10HonestyBannerText();
    expect(honesty).toMatch(/≠ AGG alone = ATT-10 DONE/);
    expect(honesty).toMatch(/ATT09QC1-MSLUTL9D/);
    expect(honesty).toMatch(/ATT08QC1-MSLSL36C/);
    expect(honesty).toMatch(/Nest \/core DENY/);
    expect(honesty).toMatch(/att_leave_hold/);
    expect(att10HolMealFooterText()).toMatch(/OUT GĐ1/);
    expect(att10PrintableReady()).toBe(false);
    expect(ATT_10_MUST_KEEP_STAMPS.att09).toBe('ATT09QC1-MSLUTL9D');
    expect(ATT_10_MUST_KEEP_STAMPS.core09).toBe('CORE09QC1-MSLNBA89');
  });
});
