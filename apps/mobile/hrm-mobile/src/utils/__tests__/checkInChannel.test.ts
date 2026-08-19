import { describe, expect, it } from 'vitest';

import {
  canSubmitCheckInWithChannel,
  CHECK_IN_CHANNEL_OPTIONS,
  FACE_MVP_HONESTY_BANNER,
  resolveDefaultCheckInChannel,
} from '../checkInChannel';

describe('checkInChannel — W4-MOB-A Face MVP chrome', () => {
  it('defaults to GPS submit path', () => {
    expect(resolveDefaultCheckInChannel()).toBe('gps');
  });

  it('blocks submit on face_mvp (face_live=false)', () => {
    expect(canSubmitCheckInWithChannel('gps')).toBe(true);
    expect(canSubmitCheckInWithChannel('face_mvp')).toBe(false);
  });

  it('exposes GPS + Face MVP options with testIDs', () => {
    expect(CHECK_IN_CHANNEL_OPTIONS.map((o) => o.id)).toEqual(['gps', 'face_mvp']);
    expect(CHECK_IN_CHANNEL_OPTIONS[1]?.testID).toBe('check-in-channel-face-mvp');
  });

  it('honesty banner mentions MVP not golive', () => {
    expect(FACE_MVP_HONESTY_BANNER.toLowerCase()).toContain('mvp');
    expect(FACE_MVP_HONESTY_BANNER.toLowerCase()).not.toContain('golive sản phẩm');
  });
});
