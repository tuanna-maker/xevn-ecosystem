import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { persistAuthSession } from '../../integrations/authSession';
import {
  postPortalEmbedSession,
  PORTAL_EMBED_SESSION_PUSH,
  PORTAL_EMBED_SESSION_REQUEST,
} from './portalEmbedSessionBridge';

describe('portalEmbedSessionBridge (parent)', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    persistAuthSession({
      accessToken: 'parent-jwt',
      expiresInSec: 3600,
      user: { userId: 'ceo@xe.vn', displayName: 'CEO' },
      memberships: [],
      defaultTenantId: 'xevn',
      defaultCompanyId: 'main',
    });
  });

  afterEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  it('postPortalEmbedSession sends push message to iframe window', () => {
    const postMessage = vi.fn();
    const fakeIframe = { postMessage } as unknown as Window;
    const ok = postPortalEmbedSession(fakeIframe);
    expect(ok).toBe(true);
    expect(postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: PORTAL_EMBED_SESSION_PUSH,
        v: 1,
        accessToken: 'parent-jwt',
      }),
      window.location.origin,
    );
  });

  it('returns false when no valid portal session', () => {
    sessionStorage.clear();
    localStorage.clear();
    const postMessage = vi.fn();
    expect(postPortalEmbedSession({ postMessage } as unknown as Window)).toBe(false);
    expect(postMessage).not.toHaveBeenCalled();
  });

  it('exports request message type for iframe handshake', () => {
    expect(PORTAL_EMBED_SESSION_REQUEST).toBe('xevn.portal.embed.session.request');
  });
});
