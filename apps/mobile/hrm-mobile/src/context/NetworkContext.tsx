import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AppState } from 'react-native';
import { fetchDeviceOffline } from '../integrations/networkState';

export type NetworkContextValue = {
  ready: boolean;
  /** True when device reports no usable connection (SRS UC-HRM-MOB-14 / client offline). */
  offline: boolean;
  refresh: () => Promise<void>;
};

const NetworkContext = createContext<NetworkContextValue | null>(null);

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [offline, setOffline] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setOffline(await fetchDeviceOffline());
    } catch {
      setOffline(false);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active') void refresh();
    });
    return () => sub.remove();
  }, [refresh]);

  const value = useMemo<NetworkContextValue>(() => ({ ready, offline, refresh }), [ready, offline, refresh]);
  return <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>;
}

export function useNetwork(): NetworkContextValue {
  const ctx = useContext(NetworkContext);
  if (!ctx) throw new Error('useNetwork must be used within NetworkProvider');
  return ctx;
}
