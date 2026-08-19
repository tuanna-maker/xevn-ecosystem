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
import { shouldBypassHrmPermissionGate } from './PermissionGate';

/** PermissionRoute delegates to shouldBypassHrmPermissionGate — keep in sync (D-HRM-W2A-STANDALONE-RBAC-01). */
describe('PermissionRoute bypass parity (W2a standalone mobile JWT)', () => {
  afterEach(() => {
    vi.mocked(hasPortalSession).mockReturnValue(false);
    sessionStorage.clear();
    localStorage.clear();
  });

  it('allows W2a standalone after mobile login hydrates portal JWT storage', () => {
    vi.mocked(hasPortalSession).mockReturnValue(true);
    expect(shouldBypassHrmPermissionGate('')).toBe(true);
  });

  it('still blocks unauthenticated standalone without portal signals', () => {
    expect(shouldBypassHrmPermissionGate('')).toBe(false);
  });

  it('still allows W2b embed ?portal=1 unchanged', () => {
    expect(shouldBypassHrmPermissionGate('?portal=1&companyId=main')).toBe(true);
  });
});
