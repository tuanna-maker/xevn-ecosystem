import { describe, expect, it } from 'vitest';
import {
  ATT_05B_EMPTY_CATALOG_HINT_VI,
  ATT_LEAVE_05B_PATH_ASSERT,
  att05bAdvanceHintMessage,
  att05bHonestyBannerText,
  att05bShouldShowEmptyCatalogHint,
} from '@/lib/attLeave05bRing';

describe('attLeave05bRing — PO-HRM-MVP-GD1-ATT-05B-CLUSTER-FE-01', () => {
  it('path assert — panel · effective · preview · DENY nest core', () => {
    expect(ATT_LEAVE_05B_PATH_ASSERT.leaveBalancePanel).toContain('/leave-balance/panel');
    expect(ATT_LEAVE_05B_PATH_ASSERT.leaveTypesEffective).toContain('/leave-types/effective');
    expect(ATT_LEAVE_05B_PATH_ASSERT.previewDeduction).toContain('preview-deduction');
    expect(ATT_LEAVE_05B_PATH_ASSERT.inventHoldTableDenied).toBe('att_leave_hold');
  });

  it('honesty — ≠ API alone DONE · C-SLICE', () => {
    const text = att05bHonestyBannerText();
    expect(text).toContain('R-ATT-05B-≠-API-DONE');
    expect(text).toContain('≠ ATT-05b');
    expect(text).not.toMatch(/attendance_uat_ready\s*=\s*true/);
  });

  it('empty catalog hint — SRS #0b', () => {
    expect(ATT_05B_EMPTY_CATALOG_HINT_VI).toContain('Cài đặt');
    expect(att05bShouldShowEmptyCatalogHint(false, false, 0)).toBe(true);
    expect(att05bShouldShowEmptyCatalogHint(false, false, 2)).toBe(false);
    expect(att05bShouldShowEmptyCatalogHint(true, false, 0)).toBe(false);
  });

  it('advance hint — over balance', () => {
    expect(
      att05bAdvanceHintMessage({
        availableDays: 1,
        requestedDays: 3,
        allowsAdvance: false,
      }),
    ).toContain('vượt quỹ');
    expect(
      att05bAdvanceHintMessage({
        availableDays: 5,
        requestedDays: 2,
        allowsAdvance: true,
      }),
    ).toBeNull();
  });
});
