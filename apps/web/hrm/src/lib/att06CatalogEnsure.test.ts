import { describe, expect, it } from 'vitest';
import {
  ATT_06_OT_COMP_LEAVE_TYPE_KEY,
  ATT_06_OT_COMP_TYPE_CODE,
  buildPolicyMapsCompCodes,
  isOtCompAccrualMappableCode,
  pickPreferredOtCompTypeCode,
} from '@/lib/attLeave06Ring';

describe('att06 catalog helpers', () => {
  it('isOtCompAccrualMappableCode', () => {
    expect(isOtCompAccrualMappableCode('compensatory_leave')).toBe(true);
    expect(isOtCompAccrualMappableCode('qa_fe_otc_x')).toBe(false);
  });

  it('pickPreferredOtCompTypeCode prefers compensatory_leave', () => {
    expect(pickPreferredOtCompTypeCode(['salary', 'compensatory_leave', 'x'])).toBe(
      'compensatory_leave',
    );
    expect(pickPreferredOtCompTypeCode(['qa_only'])).toBe('qa_only');
  });

  it('buildPolicyMapsCompCodes when no default in EFF', () => {
    expect(buildPolicyMapsCompCodes(['qa_fe_otc'])).toEqual(['qa_fe_otc']);
    expect(buildPolicyMapsCompCodes(['compensatory_leave'])).toBeNull();
  });

  it('standard keys locked', () => {
    expect(ATT_06_OT_COMP_TYPE_CODE).toBe('compensatory_leave');
    expect(ATT_06_OT_COMP_LEAVE_TYPE_KEY).toBe('ot_comp_leave');
  });
});
