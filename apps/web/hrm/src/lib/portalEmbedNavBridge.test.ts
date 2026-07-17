import { describe, expect, it, vi } from 'vitest';
import { PORTAL_EMBED_NAVIGATE, initPortalEmbedNavBridge } from './portalEmbedNavBridge';

describe('portalEmbedNavBridge (hrm)', () => {
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
