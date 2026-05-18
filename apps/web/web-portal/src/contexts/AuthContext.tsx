import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  clearAuthSession,
  fetchPortalMe,
  getStoredAccessToken,
  getStoredUser,
  loginPortal,
  persistAuthSession,
  type LoginResult,
  type PortalUser,
} from '../integrations/authSession';
import type { AccessibleTenant } from '../integrations/tenantScopeApi';

type AuthContextValue = {
  user: PortalUser | null;
  accessToken: string | null;
  memberships: AccessibleTenant[];
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<PortalUser | null>(() => getStoredUser());
  const [accessToken, setAccessToken] = useState<string | null>(() => getStoredAccessToken());
  const [memberships, setMemberships] = useState<AccessibleTenant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getStoredAccessToken();
    if (!token) {
      setLoading(false);
      return;
    }
    void fetchPortalMe(token)
      .then((data) => {
        setUser(data.user);
        setMemberships(data.memberships);
        setAccessToken(token);
      })
      .catch(() => {
        clearAuthSession();
        setUser(null);
        setAccessToken(null);
        setMemberships([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await loginPortal(email, password);
    persistAuthSession(result);
    setAccessToken(result.accessToken);
    setUser(result.user);
    setMemberships(result.memberships);
    return result;
  }, []);

  const logout = useCallback(() => {
    clearAuthSession();
    setAccessToken(null);
    setUser(null);
    setMemberships([]);
  }, []);

  const value = useMemo(
    () => ({
      user,
      accessToken,
      memberships,
      loading,
      isAuthenticated: Boolean(accessToken),
      login,
      logout,
    }),
    [user, accessToken, memberships, loading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
