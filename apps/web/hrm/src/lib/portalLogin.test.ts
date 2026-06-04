import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  PORTAL_LOGIN_REDIRECT_PARAM,
  getPortalLoginUrl,
  getPortalPublicOrigin,
  hrmReturnPathForPortalLogin,
} from './portalLogin';

describe('portalLogin', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('builds portal login URL with redirect query', () => {
    vi.stubEnv('VITE_PORTAL_PUBLIC_ORIGIN', 'http://127.0.0.1:5175');
    const url = new URL(getPortalLoginUrl('/command-center/hrm/employees'));
    expect(url.origin).toBe('http://127.0.0.1:5175');
    expect(url.pathname).toBe('/login');
    expect(url.searchParams.get(PORTAL_LOGIN_REDIRECT_PARAM)).toBe(
      '/command-center/hrm/employees',
    );
  });

  it('defaults redirect to command-center HRM dashboard', () => {
    vi.stubEnv('VITE_PORTAL_PUBLIC_ORIGIN', 'http://127.0.0.1:5175');
    const url = new URL(getPortalLoginUrl());
    expect(url.searchParams.get(PORTAL_LOGIN_REDIRECT_PARAM)).toBe(
      '/command-center/hrm/dashboard',
    );
  });

  it('rejects unsafe return paths', () => {
    vi.stubEnv('VITE_PORTAL_PUBLIC_ORIGIN', 'http://127.0.0.1:5175');
    const url = new URL(getPortalLoginUrl('https://evil.example'));
    expect(url.searchParams.get(PORTAL_LOGIN_REDIRECT_PARAM)).toBe(
      '/command-center/hrm/dashboard',
    );
  });

  it('maps HRM pathname to portal return path', () => {
    expect(hrmReturnPathForPortalLogin('/hr/employees')).toBe(
      '/command-center/hrm/employees',
    );
    expect(hrmReturnPathForPortalLogin('/hr')).toBe('/command-center/hrm/dashboard');
  });

  it('uses configured portal origin', () => {
    vi.stubEnv('VITE_PORTAL_PUBLIC_ORIGIN', 'https://portal.example.com');
    expect(getPortalPublicOrigin()).toBe('https://portal.example.com');
  });
});
