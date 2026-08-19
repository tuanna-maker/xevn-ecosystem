import { describe, expect, it } from 'vitest';
import {
  ATT_06_COMPENSATORY_BUCKET,
  ATT_06_OT_COMP_CATEGORY,
  ATT_LEAVE_06_PATH_ASSERT,
  isOtCompLeaveTypeSelected,
  pickPreferredOtCompTypeCode,
  resolveLeaveBalanceBucketForLeaveType,
} from '@/lib/attLeave06Ring';

describe('attLeave06Ring', () => {
  it('path assert — physical /attendance/* · DENY /core', () => {
    expect(ATT_LEAVE_06_PATH_ASSERT.otCompLeavePolicy).toContain('/attendance/ot-comp-leave-policy');
    expect(ATT_LEAVE_06_PATH_ASSERT.otCompTypesEffective).toContain('/ot-comp-types/effective');
    expect(ATT_LEAVE_06_PATH_ASSERT.nestCoreDenied).toBeTruthy();
  });

  it('resolveLeaveBalanceBucketForLeaveType maps ot_comp → compensatory', () => {
    const items = [
      { leaveTypeKey: 'annual', category: 'annual' },
      { leaveTypeKey: 'ot_comp_leave', category: ATT_06_OT_COMP_CATEGORY },
    ];
    expect(resolveLeaveBalanceBucketForLeaveType('ot_comp_leave', items)).toBe(
      ATT_06_COMPENSATORY_BUCKET,
    );
    expect(resolveLeaveBalanceBucketForLeaveType('annual', items)).toBe('annual');
    expect(isOtCompLeaveTypeSelected('ot_comp_leave', items)).toBe(true);
    expect(isOtCompLeaveTypeSelected('annual', items)).toBe(false);
  });

  it('pickPreferredOtCompTypeCode prefers compensatory_leave', () => {
    expect(pickPreferredOtCompTypeCode(['salary', 'compensatory_leave'])).toBe('compensatory_leave');
  });

  it('isKnownOtCompLeaveTypeKey — ot_comp_leave without effective row', () => {
    expect(isOtCompLeaveTypeSelected('ot_comp_leave', [])).toBe(true);
    expect(isOtCompLeaveTypeSelected('annual', [])).toBe(false);
  });

  it('effectiveRowMatchesOtCompLeave via nameVi when category missing on stale cache', () => {
    const items = [{ leaveTypeKey: 'custom_ot', category: 'other', nameVi: 'Nghỉ bù OT' }];
    expect(isOtCompLeaveTypeSelected('custom_ot', items)).toBe(true);
  });
});
