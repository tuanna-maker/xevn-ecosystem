import { describe, expect, it, vi } from 'vitest';
import {
  PORTAL_EMBED_NAVIGATE,
  buildPortalEmbedNavigateMessage,
  postPortalEmbedNavigate,
} from './portalEmbedNavBridge';

describe('portalEmbedNavBridge (web-portal)', () => {
  it('builds navigate message with leading slash', () => {
    expect(buildPortalEmbedNavigateMessage('employees')).toEqual({
      type: PORTAL_EMBED_NAVIGATE,
      v: 1,
      path: '/employees',
    });
    expect(buildPortalEmbedNavigateMessage('/employees/uuid-1')).toEqual({
      type: PORTAL_EMBED_NAVIGATE,
      v: 1,
      path: '/employees/uuid-1',
    });
  });

  it('postPortalEmbedNavigate posts same-origin message', () => {
    const postMessage = vi.fn();
    const target = { postMessage } as unknown as Window;
    expect(postPortalEmbedNavigate(target, '/contracts')).toBe(true);
    expect(postMessage).toHaveBeenCalledWith(
      { type: PORTAL_EMBED_NAVIGATE, v: 1, path: '/contracts' },
      '*',
    );
  });

  it('postPortalEmbedNavigate rejects null/self window', () => {
    expect(postPortalEmbedNavigate(null, '/')).toBe(false);
    expect(postPortalEmbedNavigate(window, '/')).toBe(false);
  });
});
