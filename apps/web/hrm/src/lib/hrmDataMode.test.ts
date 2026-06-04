import { describe, expect, it, vi, afterEach } from 'vitest';
import {
  clampHrmPageSize,
  HRM_API_MAX_PAGE_SIZE,
  isHrmApiDataMode,
  isPortalEmbedApiMode,
  isRemoteLocalhostSupabaseMisconfig,
  shouldSkipSupabaseDataFetches,
} from './hrmDataMode';

vi.mock('@/lib/hrmPortalMode', () => ({
  getHrmPortalMode: vi.fn(),
}));

vi.mock('@/lib/portalAuthBridge', () => ({
  hasPortalSession: vi.fn(),
}));

describe('shouldSkipSupabaseDataFetches', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns true when portal query and API mode enabled', async () => {
    vi.stubEnv('VITE_HRM_USE_API', 'true');
    const { getHrmPortalMode } = await import('@/lib/hrmPortalMode');
    const { hasPortalSession } = await import('@/lib/portalAuthBridge');
    vi.mocked(getHrmPortalMode).mockReturnValue(true);
    vi.mocked(hasPortalSession).mockReturnValue(false);
    expect(shouldSkipSupabaseDataFetches('?portal=1&companyId=main')).toBe(true);
  });

  it('returns true when portal session exists', async () => {
    vi.stubEnv('VITE_HRM_USE_API', 'true');
    const { getHrmPortalMode } = await import('@/lib/hrmPortalMode');
    const { hasPortalSession } = await import('@/lib/portalAuthBridge');
    vi.mocked(getHrmPortalMode).mockReturnValue(false);
    vi.mocked(hasPortalSession).mockReturnValue(true);
    expect(shouldSkipSupabaseDataFetches('')).toBe(true);
  });

  it('returns true by default in API mode without portal query', () => {
    vi.stubEnv('VITE_HRM_USE_API', 'true');
    window.history.replaceState({}, '', '/employees');
    expect(shouldSkipSupabaseDataFetches()).toBe(true);
  });

  it('returns false only when VITE_HRM_USE_API=false and no forced runtime', async () => {
    vi.stubEnv('VITE_HRM_USE_API', 'false');
    window.history.replaceState({}, '', '/employees');
    const { getHrmPortalMode } = await import('@/lib/hrmPortalMode');
    const { hasPortalSession } = await import('@/lib/portalAuthBridge');
    vi.mocked(getHrmPortalMode).mockReturnValue(false);
    vi.mocked(hasPortalSession).mockReturnValue(false);
    expect(shouldSkipSupabaseDataFetches()).toBe(false);
  });

  it('returns true when arg omitted and API mode default', () => {
    vi.stubEnv('VITE_HRM_USE_API', 'true');
    window.history.replaceState({}, '', '/hr/attendance?portal=1&companyId=main');
    expect(shouldSkipSupabaseDataFetches()).toBe(true);
  });
});

describe('isHrmApiDataMode', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    window.history.replaceState({}, '', '/');
  });

  it('defaults to true when env unset', () => {
    expect(isHrmApiDataMode()).toBe(true);
  });

  it('returns false when VITE_HRM_USE_API=false and no portal context', async () => {
    vi.stubEnv('VITE_HRM_USE_API', 'false');
    window.history.replaceState({}, '', '/employees');
    const { getHrmPortalMode } = await import('@/lib/hrmPortalMode');
    const { hasPortalSession } = await import('@/lib/portalAuthBridge');
    vi.mocked(getHrmPortalMode).mockReturnValue(false);
    vi.mocked(hasPortalSession).mockReturnValue(false);
    expect(isHrmApiDataMode()).toBe(false);
  });

  it('forces true for portal context even when VITE_HRM_USE_API=false', async () => {
    vi.stubEnv('VITE_HRM_USE_API', 'false');
    const { getHrmPortalMode } = await import('@/lib/hrmPortalMode');
    const { hasPortalSession } = await import('@/lib/portalAuthBridge');
    vi.mocked(getHrmPortalMode).mockReturnValue(true);
    vi.mocked(hasPortalSession).mockReturnValue(false);
    expect(isHrmApiDataMode()).toBe(true);
  });

  it('forces true for /hr proxy runtime', async () => {
    vi.stubEnv('VITE_HRM_USE_API', 'false');
    window.history.replaceState({}, '', '/hr/attendance');
    const { getHrmPortalMode } = await import('@/lib/hrmPortalMode');
    const { hasPortalSession } = await import('@/lib/portalAuthBridge');
    vi.mocked(getHrmPortalMode).mockReturnValue(false);
    vi.mocked(hasPortalSession).mockReturnValue(false);
    expect(isHrmApiDataMode()).toBe(true);
  });

  it('forces true for attendance runtime path', async () => {
    vi.stubEnv('VITE_HRM_USE_API', 'false');
    window.history.replaceState({}, '', '/attendance');
    const { getHrmPortalMode } = await import('@/lib/hrmPortalMode');
    const { hasPortalSession } = await import('@/lib/portalAuthBridge');
    vi.mocked(getHrmPortalMode).mockReturnValue(false);
    vi.mocked(hasPortalSession).mockReturnValue(false);
    expect(isHrmApiDataMode()).toBe(true);
    expect(shouldSkipSupabaseDataFetches()).toBe(true);
  });

  it('forces true for nested attendance runtime path', async () => {
    vi.stubEnv('VITE_HRM_USE_API', 'false');
    window.history.replaceState({}, '', '/command-center/hrm/attendance');
    const { getHrmPortalMode } = await import('@/lib/hrmPortalMode');
    const { hasPortalSession } = await import('@/lib/portalAuthBridge');
    vi.mocked(getHrmPortalMode).mockReturnValue(false);
    vi.mocked(hasPortalSession).mockReturnValue(false);
    expect(isHrmApiDataMode()).toBe(true);
    expect(shouldSkipSupabaseDataFetches()).toBe(true);
  });
});

describe('isPortalEmbedApiMode', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('aliases shouldSkipSupabaseDataFetches', async () => {
    vi.stubEnv('VITE_HRM_USE_API', 'true');
    const { getHrmPortalMode } = await import('@/lib/hrmPortalMode');
    const { hasPortalSession } = await import('@/lib/portalAuthBridge');
    vi.mocked(getHrmPortalMode).mockReturnValue(true);
    vi.mocked(hasPortalSession).mockReturnValue(false);
    expect(isPortalEmbedApiMode('?portal=1')).toBe(true);
  });
});

describe('clampHrmPageSize', () => {
  it('caps above max', () => {
    expect(clampHrmPageSize(200)).toBe(HRM_API_MAX_PAGE_SIZE);
  });

  it('keeps valid size', () => {
    expect(clampHrmPageSize(50)).toBe(50);
  });
});

describe('isRemoteLocalhostSupabaseMisconfig', () => {
  const originalLocation = window.location;

  afterEach(() => {
    vi.unstubAllEnvs();
    Object.defineProperty(window, 'location', { value: originalLocation, writable: true });
    window.history.replaceState({}, '', '/');
  });

  it('returns true on remote host when Supabase URL points to 127.0.0.1', () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'http://127.0.0.1:54321');
    Object.defineProperty(window, 'location', {
      value: new URL('https://14-225-217-232.nip.io/hr/attendance?portal=1&companyId=main'),
      writable: true,
    });
    expect(isRemoteLocalhostSupabaseMisconfig()).toBe(true);
    expect(shouldSkipSupabaseDataFetches()).toBe(true);
  });

  it('returns false on localhost dev host', () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'http://127.0.0.1:54321');
    Object.defineProperty(window, 'location', {
      value: new URL('http://localhost:5175/hr/attendance'),
      writable: true,
    });
    expect(isRemoteLocalhostSupabaseMisconfig()).toBe(false);
  });
});
