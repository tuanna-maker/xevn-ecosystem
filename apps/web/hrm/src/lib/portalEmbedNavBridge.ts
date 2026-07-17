/** Keep aligned with apps/web/web-portal/src/modules/hrm/portalEmbedNavBridge.ts */
export const PORTAL_EMBED_NAVIGATE = 'xevn.portal.embed.navigate';

export type PortalEmbedNavigateMessage = {
  type: typeof PORTAL_EMBED_NAVIGATE;
  v: 1;
  path: string;
};

function isNavigateMessage(data: unknown): data is PortalEmbedNavigateMessage {
  if (!data || typeof data !== 'object') return false;
  const msg = data as PortalEmbedNavigateMessage;
  return (
    msg.type === PORTAL_EMBED_NAVIGATE &&
    msg.v === 1 &&
    typeof msg.path === 'string' &&
    msg.path.startsWith('/')
  );
}

/** Parent → iframe soft navigation (no iframe remount). */
export function initPortalEmbedNavBridge(onNavigate: (path: string) => void): () => void {
  if (typeof window === 'undefined') return () => undefined;

  const handler = (event: MessageEvent) => {
    if (event.origin !== window.location.origin) return;
    if (!isNavigateMessage(event.data)) return;
    onNavigate(event.data.path);
  };

  window.addEventListener('message', handler);
  return () => window.removeEventListener('message', handler);
}
