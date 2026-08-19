import { describe, expect, it } from 'vitest';
import { minutesToRoundingSelect, roundingSelectToMinutes } from './useAttendanceRules';

describe('useAttendanceRules rounding helpers', () => {
  it('maps select none to 0 minutes', () => {
    expect(roundingSelectToMinutes('none')).toBe(0);
    expect(minutesToRoundingSelect(0)).toBe('none');
  });

  it('maps 5/10/15 round-trip', () => {
    for (const m of [5, 10, 15]) {
      expect(roundingSelectToMinutes(String(m))).toBe(m);
      expect(minutesToRoundingSelect(m)).toBe(String(m));
    }
  });
});
