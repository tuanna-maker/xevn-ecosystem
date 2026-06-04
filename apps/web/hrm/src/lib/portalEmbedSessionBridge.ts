import {
  applyPortalSession,
  hasPortalSession,
  type PortalSessionPayload,
} from '@/lib/portalAuthBridge';
import { getHrmPortalMode } from '@/lib/hrmPortalMode';

/** Keep aligned with apps/web/web-portal/src/modules/hrm/portalEmbedSessionBridge.ts */
export const PORTAL_EMBED_SESSION_PUSH = 'xevn.portal.embed.session.push';
export const PORTAL_EMBED_SESSION_REQUEST = 'xevn.portal.embed.session.request';

type PortalEmbedSessionPushMessage = PortalSessionPayload & {
  type: typeof PORTAL_EMBED_SESSION_PUSH;
  v: 1;
};

function isPushMessage(data: unknown): data is PortalEmbedSessionPushMessage {
  if (!data || typeof data !== 'object') return false;
  const msg = data as PortalEmbedSessionPushMessage;
  return (
    msg.type === PORTAL_EMBED_SESSION_PUSH &&
    msg.v === 1 &&
    typeof msg.accessToken === 'string' &&
    msg.accessToken.length > 0 &&
    typeof msg.expiresAt === 'number' &&
    Number.isFinite(msg.expiresAt) &&
    msg.user != null &&
    typeof msg.user.userId === 'string'
  );
}

function requestSessionFromParent(): void {
  if (typeof window === 'undefined' || window.parent === window) return;
  window.parent.postMessage({ type: PORTAL_EMBED_SESSION_REQUEST, v: 1 }, window.location.origin);
}

/**
 * HTTPS pilot: iframe has isolated sessionStorage — receive JWT via postMessage
 * and read parent mirror from localStorage (same origin).
 */
export function initPortalEmbedSessionBridge(): void {
  if (typeof window === 'undefined') return;

  window.addEventListener('message', (event: MessageEvent) => {
    if (event.origin !== window.location.origin) return;
    if (!isPushMessage(event.data)) return;
    applyPortalSession({
      accessToken: event.data.accessToken,
      user: event.data.user,
      expiresAt: event.data.expiresAt,
    });
  });

  const maybeRequest = () => {
    if (!getHrmPortalMode(window.location.search)) return;
    if (hasPortalSession()) return;
    requestSessionFromParent();
  };

  maybeRequest();
  window.setTimeout(maybeRequest, 50);
  window.setTimeout(maybeRequest, 300);
}
