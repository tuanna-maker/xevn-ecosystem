import { afterEach, describe, expect, it } from 'vitest';
import { isQaDeepLinkLoginEnabled, isQaDevLoginEnabled } from '../qaLogin';

const ORIGINAL_QA_DEV = process.env.EXPO_PUBLIC_ENABLE_QA_DEV_LOGIN;
const ORIGINAL_QA_DEEP = process.env.EXPO_PUBLIC_ENABLE_QA_DEEP_LINK;

afterEach(() => {
  if (ORIGINAL_QA_DEV === undefined) delete process.env.EXPO_PUBLIC_ENABLE_QA_DEV_LOGIN;
  else process.env.EXPO_PUBLIC_ENABLE_QA_DEV_LOGIN = ORIGINAL_QA_DEV;
  if (ORIGINAL_QA_DEEP === undefined) delete process.env.EXPO_PUBLIC_ENABLE_QA_DEEP_LINK;
  else process.env.EXPO_PUBLIC_ENABLE_QA_DEEP_LINK = ORIGINAL_QA_DEEP;
});

describe('isQaDevLoginEnabled', () => {
  it('returns false for sponsor/pilot release bundle (flag 0)', () => {
    process.env.EXPO_PUBLIC_ENABLE_QA_DEV_LOGIN = '0';
    expect(isQaDevLoginEnabled()).toBe(false);
  });

  it('returns true for qa-device bundle (flag 1)', () => {
    process.env.EXPO_PUBLIC_ENABLE_QA_DEV_LOGIN = '1';
    expect(isQaDevLoginEnabled()).toBe(true);
  });

  it('accepts true/yes aliases', () => {
    process.env.EXPO_PUBLIC_ENABLE_QA_DEV_LOGIN = 'true';
    expect(isQaDevLoginEnabled()).toBe(true);
    process.env.EXPO_PUBLIC_ENABLE_QA_DEV_LOGIN = 'yes';
    expect(isQaDevLoginEnabled()).toBe(true);
  });
});

describe('isQaDeepLinkLoginEnabled', () => {
  it('returns false when deep link explicitly off (sponsor release)', () => {
    process.env.EXPO_PUBLIC_ENABLE_QA_DEV_LOGIN = '0';
    process.env.EXPO_PUBLIC_ENABLE_QA_DEEP_LINK = '0';
    expect(isQaDeepLinkLoginEnabled()).toBe(false);
  });

  it('returns true when qa-device flags on', () => {
    process.env.EXPO_PUBLIC_ENABLE_QA_DEV_LOGIN = '1';
    process.env.EXPO_PUBLIC_ENABLE_QA_DEEP_LINK = '1';
    expect(isQaDeepLinkLoginEnabled()).toBe(true);
  });
});
