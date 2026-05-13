import React, { useCallback } from 'react';
import { useNetwork } from '../context/NetworkContext';

/**
 * Blocks mutating HRM calls when the app considers the device offline (SRS: HRM-MOB-ERR-OFFLINE).
 */
export function useOfflineWriteGuard() {
  const net = useNetwork();
  return useCallback((): 'HRM-MOB-ERR-OFFLINE' | null => {
    if (net.ready && net.offline) return 'HRM-MOB-ERR-OFFLINE';
    return null;
  }, [net.ready, net.offline]);
}
