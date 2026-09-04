/** Keep aligned with apps/web/hrm/src/lib/portalEmbedNavBridge.ts */
export const PORTAL_EMBED_NAVIGATE = 'xevn.portal.embed.navigate';

export type PortalEmbedNavigateMessage = {
  type: typeof PORTAL_EMBED_NAVIGATE;
  v: 1;
  /** HRM app path relative to basename `/hr` (e.g. `/employees`, `/employees/:id`). */
  path: string;
};

export function buildPortalEmbedNavigateMessage(path: string): PortalEmbedNavigateMessage {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return { type: PORTAL_EMBED_NAVIGATE, v: 1, path: normalized };
}

export function postPortalEmbedNavigate(target: Window | null | undefined, path: string): boolean {
  if (!target || target === window) return false;
  target.postMessage(buildPortalEmbedNavigateMessage(path), '*');
  return true;
}
