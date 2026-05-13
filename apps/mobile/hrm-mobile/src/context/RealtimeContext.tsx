import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { connectHrmRealtimeSocket } from '../integrations/hrmRealtimeClient';
import { tryRegisterExpoPushToken } from '../integrations/pushRegistration';

export type HrmRealtimeFeedItem = {
  id: string;
  receivedAt: number;
  raw: unknown;
};

type RealtimeContextValue = {
  socketStatus: 'off' | 'connecting' | 'live' | 'error';
  feed: HrmRealtimeFeedItem[];
  clearFeed: () => void;
};

const RealtimeContext = createContext<RealtimeContextValue | null>(null);

function summarizeEvent(raw: unknown): string {
  if (!raw || typeof raw !== 'object') return 'Sự kiện (không rõ định dạng)';
  const o = raw as Record<string, unknown>;
  const type = typeof o.type === 'string' ? o.type : '';
  const req = o.request && typeof o.request === 'object' ? (o.request as Record<string, unknown>) : null;
  const name = req && typeof req.employee_name === 'string' ? req.employee_name : '';
  if (type === 'attendance_update_request.created') return `Đơn công mới${name ? `: ${name}` : ''}`;
  if (type === 'attendance_update_request.approved') return `Đơn công đã duyệt${name ? `: ${name}` : ''}`;
  if (type === 'attendance_update_request.rejected') return `Đơn công bị từ chối${name ? `: ${name}` : ''}`;
  return type || 'hrm:event';
}

export function useHrmRealtimeSummary(): string {
  const rt = useRealtimeOptional();
  if (!rt || rt.socketStatus === 'off') return '';
  if (rt.socketStatus === 'error') return 'Realtime: lỗi kết nối';
  if (rt.socketStatus === 'connecting') return 'Realtime: đang nối…';
  if (rt.feed.length === 0) return 'Realtime: đã nối';
  return summarizeEvent(rt.feed[0].raw);
}

export function useRealtimeOptional(): RealtimeContextValue | null {
  return useContext(RealtimeContext);
}

export function useRealtime(): RealtimeContextValue {
  const v = useContext(RealtimeContext);
  if (!v) throw new Error('RealtimeProvider missing');
  return v;
}

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const [socketStatus, setSocketStatus] = useState<RealtimeContextValue['socketStatus']>('off');
  const [feed, setFeed] = useState<HrmRealtimeFeedItem[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const seq = useRef(0);

  const clearFeed = useCallback(() => setFeed([]), []);

  useEffect(() => {
    if (!auth.signedIn) return;
    const companyUuid = auth.getAttendanceCompanyId();
    const employeeId = auth.employeeId.trim();
    if (!companyUuid || !employeeId) return;
    void tryRegisterExpoPushToken(auth.getHrmAuth(), companyUuid, employeeId);
  }, [
    auth.signedIn,
    auth.baseUrl,
    auth.accessToken,
    auth.internalApiKey,
    auth.employeeId,
    auth.getAttendanceCompanyId,
    auth.getHrmAuth,
  ]);

  useEffect(() => {
    if (!auth.signedIn) {
      socketRef.current?.removeAllListeners();
      socketRef.current?.disconnect();
      socketRef.current = null;
      setSocketStatus('off');
      return;
    }

    const companyUuid = auth.getAttendanceCompanyId();
    if (!companyUuid) {
      setSocketStatus('off');
      return;
    }

    setSocketStatus('connecting');
    const socket = connectHrmRealtimeSocket(auth.getHrmAuth(), {
      companyUuid,
      employeeId: auth.employeeId.trim() || undefined,
    });
    socketRef.current = socket;

    const bump = (raw: unknown) => {
      seq.current += 1;
      const id = `evt-${seq.current}-${Date.now()}`;
      setFeed((prev) => [{ id, receivedAt: Date.now(), raw }, ...prev].slice(0, 40));
    };

    socket.on('connect', () => setSocketStatus('live'));
    socket.on('disconnect', () => setSocketStatus((s) => (s === 'off' ? 'off' : 'connecting')));
    socket.on('connect_error', () => setSocketStatus('error'));
    socket.on('hrm:event', bump);

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      if (socketRef.current === socket) socketRef.current = null;
      setSocketStatus('off');
    };
  }, [
    auth.signedIn,
    auth.baseUrl,
    auth.accessToken,
    auth.internalApiKey,
    auth.tenantId,
    auth.companyId,
    auth.companyUuid,
    auth.employeeId,
    auth.getAttendanceCompanyId,
    auth.getHrmAuth,
  ]);

  const value = useMemo<RealtimeContextValue>(
    () => ({ socketStatus, feed, clearFeed }),
    [socketStatus, feed, clearFeed],
  );

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}
