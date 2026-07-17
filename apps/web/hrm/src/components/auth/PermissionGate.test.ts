import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/portalAuthBridge', () => ({
  hasPortalSession: vi.fn(() => false),
}));

vi.mock('@/lib/hrmPortalMode', async () => {
  const actual = await vi.importActual<typeof import('@/lib/hrmPortalMode')>('@/lib/hrmPortalMode');
  return {
    ...actual,
    isHrmPortalEmbedFrame: vi.fn(() => false),
  };
});

import { hasPortalSession } from '@/lib/portalAuthBridge';
import { isHrmPortalEmbedFrame } from '@/lib/hrmPortalMode';
import { shouldBypassHrmPermissionGate } from './PermissionGate';

describe('shouldBypassHrmPermissionGate (GWC-HRM-REC-UF12-01)', () => {
  afterEach(() => {
    vi.mocked(hasPortalSession).mockReturnValue(false);
    vi.mocked(isHrmPortalEmbedFrame).mockReturnValue(false);
    sessionStorage.clear();
    localStorage.clear();
  });

  it('bypasses when ?portal=1 is present', () => {
    expect(shouldBypassHrmPermissionGate('?portal=1&companyId=main')).toBe(true);
  });

  it('bypasses when companyId query alone marks portal embed', () => {
    expect(shouldBypassHrmPermissionGate('?companyId=main')).toBe(true);
  });

  it('bypasses when portal JWT session is hydrated without query', () => {
    vi.mocked(hasPortalSession).mockReturnValue(true);
    expect(shouldBypassHrmPermissionGate('')).toBe(true);
  });

  it('bypasses when HRM runs inside portal iframe', () => {
    vi.mocked(isHrmPortalEmbedFrame).mockReturnValue(true);
    expect(shouldBypassHrmPermissionGate('')).toBe(true);
  });

  it('does not bypass standalone HRM without portal signals', () => {
    expect(shouldBypassHrmPermissionGate('')).toBe(false);
  });
});
