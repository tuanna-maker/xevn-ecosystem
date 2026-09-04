import { describe, expect, it, vi } from 'vitest';
import { PORTAL_EMBED_NAVIGATE, initPortalEmbedNavBridge, isAllowedEmbedOrigin } from './portalEmbedNavBridge';

describe('portalEmbedNavBridge (hrm)', () => {
  it('validates allowed origins for local dev and same origin', () => {
    expect(isAllowedEmbedOrigin(window.location.origin)).toBe(true);
    expect(isAllowedEmbedOrigin('http://localhost:5173')).toBe(true);
    expect(isAllowedEmbedOrigin('http://127.0.0.1:5173')).toBe(true);
    expect(isAllowedEmbedOrigin('https://evil.example')).toBe(false);
  });

  it('invokes onNavigate for valid parent message', () => {
    const onNavigate = vi.fn();
    const cleanup = initPortalEmbedNavBridge(onNavigate);

    window.dispatchEvent(
      new MessageEvent('message', {
        origin: window.location.origin,
        data: { type: PORTAL_EMBED_NAVIGATE, v: 1, path: '/payroll' },
      }),
    );

    expect(onNavigate).toHaveBeenCalledWith('/payroll');
    cleanup();
  });

  it('ignores foreign origin and malformed payloads', () => {
    const onNavigate = vi.fn();
    const cleanup = initPortalEmbedNavBridge(onNavigate);

    window.dispatchEvent(
      new MessageEvent('message', {
        origin: 'https://evil.example',
        data: { type: PORTAL_EMBED_NAVIGATE, v: 1, path: '/payroll' },
      }),
    );
    window.dispatchEvent(
      new MessageEvent('message', {
        origin: window.location.origin,
        data: { type: PORTAL_EMBED_NAVIGATE, v: 1, path: 'no-leading-slash' },
      }),
    );

    expect(onNavigate).not.toHaveBeenCalled();
    cleanup();
  });
});
