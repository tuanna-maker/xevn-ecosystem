import React, { useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useNetwork } from '../context/NetworkContext';
import { flushOfflineQueue } from '../integrations/offlineQueue';

/** MOB-401: đồng bộ hàng đợi ghi khi có mạng trở lại. */
export function OfflineSync() {
  const auth = useAuth();
  const net = useNetwork();
  const wasOffline = useRef(false);

  useEffect(() => {
    if (!auth.signedIn || !net.ready) return;
    if (net.offline) {
      wasOffline.current = true;
      return;
    }
    if (!wasOffline.current) return;
    wasOffline.current = false;
    void (async () => {
      const result = await flushOfflineQueue((path, init) => auth.requestHrm<unknown>(path, init));
      if (result.synced > 0) {
        Alert.alert('Đồng bộ', `Đã gửi ${result.synced} thao tác đang chờ.`);
      }
    })();
  }, [net.offline, net.ready, auth.signedIn, auth]);

  return null;
}
