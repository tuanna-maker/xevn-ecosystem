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

export function isAllowedEmbedOrigin(origin: string): boolean {
  if (typeof window === 'undefined') return false;
  if (origin === window.location.origin) return true;
  try {
    const url = new URL(origin);
    const host = url.hostname;
    if (host === 'localhost' || host === '127.0.0.1' || host.endsWith('.localhost')) {
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

/** Parent → iframe soft navigation (no iframe remount). */
export function initPortalEmbedNavBridge(onNavigate: (path: string) => void): () => void {
  if (typeof window === 'undefined') return () => undefined;

  const handler = (event: MessageEvent) => {
    if (!isAllowedEmbedOrigin(event.origin)) return;
    if (!isNavigateMessage(event.data)) return;
    onNavigate(event.data.path);
  };

  window.addEventListener('message', handler);
  return () => window.removeEventListener('message', handler);
}
