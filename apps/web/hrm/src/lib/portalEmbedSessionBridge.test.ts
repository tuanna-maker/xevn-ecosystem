import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  initPortalEmbedSessionBridge,
  PORTAL_EMBED_SESSION_PUSH,
} from './portalEmbedSessionBridge';
import { getPortalAccessToken } from './portalAuthBridge';

describe('portalEmbedSessionBridge', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    initPortalEmbedSessionBridge();
  });

  afterEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('applies JWT from parent postMessage on same origin', () => {
    window.dispatchEvent(
      new MessageEvent('message', {
        origin: window.location.origin,
        data: {
          type: PORTAL_EMBED_SESSION_PUSH,
          v: 1,
          accessToken: 'jwt-postmessage',
          user: { userId: 'ceo@xe.vn', displayName: 'CEO' },
          expiresAt: Date.now() + 60_000,
        },
      }),
    );
    expect(getPortalAccessToken()).toBe('jwt-postmessage');
  });

  it('ignores postMessage from foreign origin', () => {
    window.dispatchEvent(
      new MessageEvent('message', {
        origin: 'https://evil.example',
        data: {
          type: PORTAL_EMBED_SESSION_PUSH,
          v: 1,
          accessToken: 'jwt-evil',
          user: { userId: 'x', displayName: 'x' },
          expiresAt: Date.now() + 60_000,
        },
      }),
    );
    expect(getPortalAccessToken()).toBeNull();
  });
});
