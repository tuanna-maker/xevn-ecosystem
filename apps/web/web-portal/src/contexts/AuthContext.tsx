import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  clearAuthSession,
  fetchPortalMe,
  getStoredAccessToken,
  getStoredUser,
  getValidAccessToken,
  isStoredSessionExpired,
  loginPortal,
  peekLoginRedirect,
  persistAuthSession,
  selectPortalMembership,
  setUnauthorizedHandler,
  type LoginResult,
  type PortalUser,
  type SelectMembershipResult,
} from '../integrations/authSession';
import type { AccessibleTenant } from '../integrations/tenantScopeApi';

type AuthContextValue = {
  user: PortalUser | null;
  accessToken: string | null;
  memberships: AccessibleTenant[];
  loading: boolean;
  isAuthenticated: boolean;
  membershipSwitching: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  selectMembership: (tenantId: string) => Promise<SelectMembershipResult>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<PortalUser | null>(() => getStoredUser());
  const [accessToken, setAccessToken] = useState<string | null>(() => getValidAccessToken());
  const [memberships, setMemberships] = useState<AccessibleTenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [membershipSwitching, setMembershipSwitching] = useState(false);

  const logout = useCallback(() => {
    clearAuthSession();
    setAccessToken(null);
    setUser(null);
    setMemberships([]);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setAccessToken(null);
      setUser(null);
      setMemberships([]);
      if (window.location.pathname !== '/login') {
        const returnPath = peekLoginRedirect();
        const loginTarget =
          returnPath && returnPath.startsWith('/') && !returnPath.startsWith('//')
            ? `/login?redirect=${encodeURIComponent(returnPath)}`
            : '/login';
        window.location.replace(loginTarget);
      }
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  useEffect(() => {
    if (isStoredSessionExpired()) {
      clearAuthSession();
      setAccessToken(null);
      setUser(null);
      setMemberships([]);
      setLoading(false);
      return;
    }

    const token = getStoredAccessToken();
    if (!token) {
      setAccessToken(null);
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

  const selectMembership = useCallback(
    async (tenantId: string) => {
      const token = getValidAccessToken();
      const currentUser = user ?? getStoredUser();
      if (!token || !currentUser) {
        throw new Error('Phiên đăng nhập không hợp lệ');
      }
      setMembershipSwitching(true);
      try {
        const result = await selectPortalMembership(token, tenantId);
        persistAuthSession({
          accessToken: result.accessToken,
          expiresInSec: result.expiresInSec,
          user: currentUser,
          memberships: result.memberships,
          defaultTenantId: result.defaultTenantId,
          defaultCompanyId: result.defaultCompanyId,
        });
        setAccessToken(result.accessToken);
        setMemberships(result.memberships);
        return result;
      } finally {
        setMembershipSwitching(false);
      }
    },
    [user],
  );

  const value = useMemo(
    () => ({
      user,
      accessToken,
      memberships,
      loading,
      isAuthenticated: Boolean(accessToken) && !isStoredSessionExpired(),
      membershipSwitching,
      login,
      selectMembership,
      logout,
    }),
    [user, accessToken, memberships, loading, membershipSwitching, login, selectMembership, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
