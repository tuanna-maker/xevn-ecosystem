import { describe, expect, it } from 'vitest';
import {
  MOBILE_JWT_DEFAULT_TTL_SEC,
  computeTokenExpiresAt,
  isMobileTokenExpired,
} from '../mobileAuthSession';

describe('mobileAuthSession (portal TTL parity)', () => {
  it('defaults to 86400s when server omits expires_in_sec', () => {
    expect(MOBILE_JWT_DEFAULT_TTL_SEC).toBe(86400);
    const now = 1_700_000_000_000;
    expect(computeTokenExpiresAt(undefined, now)).toBe(now + 86400 * 1000);
  });

  it('honors server expires_in_sec from mobile login', () => {
    const now = 1_700_000_000_000;
    expect(computeTokenExpiresAt(43200, now)).toBe(now + 43200 * 1000);
  });

  it('flags expiry within refresh skew', () => {
    const expiresAt = Date.now() + 30_000;
    expect(isMobileTokenExpired(expiresAt)).toBe(true);
    expect(isMobileTokenExpired(expiresAt + 120_000)).toBe(false);
  });

  it('treats missing expiresAt as non-expired (legacy sessions)', () => {
    expect(isMobileTokenExpired(0)).toBe(false);
    expect(isMobileTokenExpired(undefined)).toBe(false);
  });
});
