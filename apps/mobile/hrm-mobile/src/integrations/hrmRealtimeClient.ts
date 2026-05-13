import { io, type Socket } from 'socket.io-client';
import type { HrmAuthConfig } from './types';

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, '');
}

export type HrmRealtimeJoinPayload = {
  companyUuid: string;
  employeeId?: string;
};

/** Same origin as REST `HRM_API_BASE_URL` (host:port), namespace `/hrm-realtime` — not under `/api/hrm`. */
export function getHrmRealtimeSocketUrl(baseUrl: string): string {
  return `${stripTrailingSlash(baseUrl)}/hrm-realtime`;
}

export function connectHrmRealtimeSocket(auth: HrmAuthConfig, join: HrmRealtimeJoinPayload): Socket {
  const authorization = auth.accessToken
    ? auth.accessToken.startsWith('Bearer ')
      ? auth.accessToken
      : `Bearer ${auth.accessToken}`
    : undefined;

  const socket = io(getHrmRealtimeSocketUrl(auth.baseUrl), {
    path: '/socket.io/',
    transports: ['websocket', 'polling'],
    forceNew: true,
    auth: {
      authorization,
      internalApiKey: auth.internalApiKey ?? undefined,
    },
  });

  const sendJoin = () => {
    socket.emit('hrm:join', {
      companyUuid: join.companyUuid,
      employeeId: join.employeeId?.trim() || undefined,
    });
  };

  socket.on('connect', sendJoin);
  return socket;
}
