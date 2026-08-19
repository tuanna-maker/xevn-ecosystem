import { describe, expect, it } from 'vitest';
import {
  ATT_LEAVE_12_PATH_ASSERT,
  att12HonestyBannerText,
  att12MustKeepSealLines,
  formatActivateDefaultShiftSummaryVi,
} from '@/lib/attLeave12Ring';

describe('attLeave12Ring', () => {
  it('path assert — panel + activate-default shift · Nest /core DENY', () => {
    expect(ATT_LEAVE_12_PATH_ASSERT.leaveBalancePanel).toContain('/leave-balance/panel');
    expect(ATT_LEAVE_12_PATH_ASSERT.activateDefaultShift).toContain(
      '/shift-assignments/activate-default',
    );
    expect(ATT_LEAVE_12_PATH_ASSERT.nestCoreDenied).toBe('/api/hrm/core/');
  });

  it('honesty ≠ ATT-12 DONE · must_keep seals', () => {
    expect(att12HonestyBannerText()).toMatch(/≠ ATT-12/);
    expect(att12HonestyBannerText()).toMatch(/DENY merge/);
    const seals = att12MustKeepSealLines().join(' ');
    expect(seals).toContain('ATT07QC1');
    expect(seals).toContain('ATT06QC1');
    expect(seals).toContain('compensatory');
  });

  it('formatActivateDefaultShiftSummaryVi', () => {
    expect(formatActivateDefaultShiftSummaryVi(null)).toMatch(/Chưa có ca/);
    expect(
      formatActivateDefaultShiftSummaryVi({
        assignmentId: 'a',
        shiftId: 's',
        shiftCode: 'HC',
        shiftName: 'Ca hành chính',
        effectiveFrom: '10/08/2026',
        source: 'activate_default',
      }),
    ).toBe('Ca hành chính · hiệu lực 10/08/2026');
  });
});
