import { useCallback, useEffect, type RefObject } from 'react';
import {
  getStoredTokenExpiresAt,
  getStoredUser,
  getValidAccessToken,
} from '../../integrations/authSession';

/** Keep aligned with apps/web/hrm/src/lib/portalEmbedSessionBridge.ts */
export const PORTAL_EMBED_SESSION_PUSH = 'xevn.portal.embed.session.push';
export const PORTAL_EMBED_SESSION_REQUEST = 'xevn.portal.embed.session.request';

export type PortalEmbedSessionPushMessage = {
  type: typeof PORTAL_EMBED_SESSION_PUSH;
  v: 1;
  accessToken: string;
  user: { userId: string; displayName: string };
  expiresAt: number;
};

function buildPushMessage(): PortalEmbedSessionPushMessage | null {
  const accessToken = getValidAccessToken();
  if (!accessToken) return null;
  const user = getStoredUser();
  if (!user?.userId) return null;
  const expiresAt = getStoredTokenExpiresAt() ?? Date.now() + 3600_000;
  return {
    type: PORTAL_EMBED_SESSION_PUSH,
    v: 1,
    accessToken,
    user: { userId: user.userId, displayName: user.displayName },
    expiresAt,
  };
}

export function postPortalEmbedSession(target: Window | null | undefined): boolean {
  if (!target || target === window) return false;
  const msg = buildPushMessage();
  if (!msg) return false;
  target.postMessage(msg, window.location.origin);
  return true;
}

/** Push portal JWT into HRM iframe when sessionStorage is not shared (per browsing context). */
export function usePortalEmbedSessionPublisher(
  iframeRef: RefObject<HTMLIFrameElement | null>,
  enabled: boolean,
  accessToken: string | null,
): void {
  const push = useCallback(() => {
    postPortalEmbedSession(iframeRef.current?.contentWindow ?? null);
  }, [iframeRef]);

  useEffect(() => {
    if (!enabled) return;
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== PORTAL_EMBED_SESSION_REQUEST) return;
      const iframeWin = iframeRef.current?.contentWindow;
      if (!iframeWin || event.source !== iframeWin) return;
      postPortalEmbedSession(event.source as Window);
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [enabled, iframeRef]);

  useEffect(() => {
    if (!enabled || !accessToken) return;
    push();
  }, [enabled, accessToken, push]);
}
