/**
 * @CODE-MEMORY
 * Screen:     unit — attShift01Ring helpers (ATT-01)
 * UC:         UC-BP-ATT-01 · J-HRM-ATT-01-01/04/05/06
 * Purpose:    Unit coverage for path · statusLabelVi · empty CTA · honesty · invent-ban
 * WorkItem:   PO-HRM-MVP-GD1-ATT-01-CLUSTER-FE-01
 * Coded:      2026-08-09
 * must_keep:  Nest /core DENY · ≠ ATT-01 DONE · R-ATT-01-ASSIGN open · U65
 */
import { describe, expect, it } from 'vitest';
import {
  ATT_01_HONESTY_FOOTER,
  ATT_01_SHIFT_KEY_CODE,
  ATT_01_STATUS_LABELS_VI,
  ATT_SHIFT_01_PATH_ASSERT,
  R_ATT_01_ASSIGN,
  att01EmptyCatalogCtaMessage,
  att01HonestyBannerText,
  att01HonestyFooterLines,
  att01ShiftKeyBanMessage,
  assertAtt01PrintableHonesty,
  deriveAtt01StatusLabelVi,
  isAtt01EffectiveEmpty,
  isForbiddenAtt01SotPath,
  isPhysicalAtt01Path,
  parseAtt01WorkShiftDisplay,
} from './attShift01Ring';

describe('attShift01Ring', () => {
  it('locks physical paths · Nest /core denied', () => {
    expect(ATT_SHIFT_01_PATH_ASSERT.workShifts).toContain('/attendance/work-shifts');
    expect(ATT_SHIFT_01_PATH_ASSERT.workShiftsEffective).toContain('/work-shifts/effective');
    expect(ATT_SHIFT_01_PATH_ASSERT.shiftChangeRequests).toContain('/shift-change-requests');
    expect(ATT_SHIFT_01_PATH_ASSERT.nestCoreDenied).toBe('/api/hrm/core/');
    expect(ATT_SHIFT_01_PATH_ASSERT.inventHoldTableDenied).toBe('att_leave_hold');
    expect(R_ATT_01_ASSIGN).toBe('R-ATT-01-ASSIGN');
  });

  it('FE-derives statusLabelVi · wire wins', () => {
    expect(deriveAtt01StatusLabelVi('active')).toBe(ATT_01_STATUS_LABELS_VI.active);
    expect(deriveAtt01StatusLabelVi('inactive')).toBe(ATT_01_STATUS_LABELS_VI.inactive);
    expect(deriveAtt01StatusLabelVi('active', 'Đang áp dụng')).toBe('Đang áp dụng');
    expect(deriveAtt01StatusLabelVi(null)).toBe('—');
  });

  it('parses display-ready work-shift row', () => {
    const display = parseAtt01WorkShiftDisplay({
      id: 'ws-1',
      code: 'HC',
      name: 'Hành chính',
      start_time: '08:00',
      end_time: '17:00',
      status: 'active',
      coefficient: 1,
      department: 'Kho',
    });
    expect(display.shiftId).toBe('ws-1');
    expect(display.code).toBe('HC');
    expect(display.statusLabelVi).toBe('Đang dùng');
    expect(display.workFactor).toBe(1);
    expect(display.department).toBe('Kho');
  });

  it('empty EFF → CTA · invent-ban message', () => {
    expect(isAtt01EffectiveEmpty(0)).toBe(true);
    expect(isAtt01EffectiveEmpty(3)).toBe(false);
    expect(att01EmptyCatalogCtaMessage()).toContain('Danh sách ca');
    expect(att01EmptyCatalogCtaMessage()).toContain('không seed');
    expect(att01ShiftKeyBanMessage()).toContain(ATT_01_SHIFT_KEY_CODE);
  });

  it('path guards physical vs Nest /core', () => {
    expect(isPhysicalAtt01Path('/api/hrm/attendance/work-shifts')).toBe(true);
    expect(isPhysicalAtt01Path('/api/hrm/attendance/shift-change-requests')).toBe(true);
    expect(isForbiddenAtt01SotPath('/api/hrm/core/att/work-shifts')).toBe(true);
    expect(isForbiddenAtt01SotPath('/api/hrm/attendance/work-shifts')).toBe(false);
  });

  it('honesty footer · printable false · ≠ ATT-01 DONE · ASSIGN open', () => {
    expect(assertAtt01PrintableHonesty()).toBe(true);
    const lines = att01HonestyFooterLines();
    expect(lines).toContain(ATT_01_HONESTY_FOOTER.catNeAtt01Done);
    expect(lines).toContain(ATT_01_HONESTY_FOOTER.assignOpen);
    expect(lines).toContain(ATT_01_HONESTY_FOOTER.neLiveAtt11);
    expect(lines).toContain(ATT_01_HONESTY_FOOTER.neAggAtt10);
    expect(lines).toContain(ATT_01_HONESTY_FOOTER.payOut);
    expect(att01HonestyBannerText()).toContain('catalog alone ≠ ATT-01 DONE');
    expect(att01HonestyBannerText()).toContain('GĐ2-HOLD');
  });
});
