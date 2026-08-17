/**
 * @CODE-MEMORY
 * Screen:     Portal AuthProvider — session + membership list
 * UC:         FR-UC-M01 · UC-M01
 * BR:         BR-SCOPE-01
 * SRS:        docs/brand-new-documents-20270801/SRS_NEW.md v1.1 §3.2 · FR-UC-M01
 * TechSpec:   docs/brand-new-documents-20270801/TECH_SPEC_NEW.md · TS-MOB-AUTH
 * Purpose:    Cung cấp user/JWT/memberships display-ready cho shell; giữ membershipId
 *             sau login và select-membership (JWT path API_CONTRACT §8).
 * WorkItem:   W1-B-04-AUTH-FE
 * Coded:      2026-08-03
 * Callers:    LoginPage · GlobalFilterProvider · TopHeader · RequireAuth
 * Callees:    authSession loginPortal / fetchPortalMe / selectPortalMembership
 * FEActions:  login · selectMembership(tenantId) · logout
 * BEChain:    XBOS auth → memberships *_label + JWT membershipId
 * Impact:     Mất membershipId → picker/API scope lệch sau đổi tenant
 * must_keep:  Luồng login/select hiện có; không invent label trên FE
 * SOLID:      Context chỉ orchestration session — normalize ở authSession
 * LastVerified: authSession.test.ts W1-B-04
 *
 * @CODE-MEMORY-CHANGE
 * WorkItem: W1-B-04-AUTH-FE · 2026-08-03
 * Change: ADD membershipId state từ JWT/defaultMembershipId sau login & select-membership.
 * must_keep: memberships đã normalize *_label từ BE.
 */

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  clearAuthSession,
  fetchPortalMe,
  getStoredAccessToken,
  getStoredMembershipId,
  getStoredUser,
  getValidAccessToken,
  isStoredSessionExpired,
  loginPortal,
  parseJwtMembershipId,
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
  /** Active membership id from select-membership / login JWT (API_CONTRACT §8). */
  membershipId: string | null;
  memberships: AccessibleTenant[];
  loading: boolean;
  isAuthenticated: boolean;
  membershipSwitching: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  selectMembership: (tenantId: string) => Promise<SelectMembershipResult>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function resolveMembershipId(
  accessToken: string | null | undefined,
  preferred?: string | null,
): string | null {
  const fromPreferred = preferred?.trim();
  if (fromPreferred) return fromPreferred;
  return parseJwtMembershipId(accessToken) ?? getStoredMembershipId();
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<PortalUser | null>(() => getStoredUser());
  const [accessToken, setAccessToken] = useState<string | null>(() => getValidAccessToken());
  const [membershipId, setMembershipId] = useState<string | null>(() => getStoredMembershipId());
  const [memberships, setMemberships] = useState<AccessibleTenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [membershipSwitching, setMembershipSwitching] = useState(false);

  const logout = useCallback(() => {
    clearAuthSession();
    setAccessToken(null);
    setUser(null);
    setMembershipId(null);
    setMemberships([]);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setAccessToken(null);
      setUser(null);
      setMembershipId(null);
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
      setMembershipId(null);
      setMemberships([]);
      setLoading(false);
      return;
    }

    const token = getStoredAccessToken();
    if (!token) {
      setAccessToken(null);
      setMembershipId(null);
      setLoading(false);
      return;
    }

    void fetchPortalMe(token)
      .then((data) => {
        setUser(data.user);
        setMemberships(data.memberships);
        setAccessToken(token);
        const jwtMid = parseJwtMembershipId(token);
        const matchMid =
          jwtMid ??
          data.memberships.find((m) => m.membershipId)?.membershipId ??
          getStoredMembershipId();
        setMembershipId(matchMid);
      })
      .catch(() => {
        clearAuthSession();
        setUser(null);
        setAccessToken(null);
        setMembershipId(null);
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
    setMembershipId(resolveMembershipId(result.accessToken, result.defaultMembershipId));
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
          defaultMembershipId:
            result.defaultMembershipId ?? result.membership.membershipId,
        });
        setAccessToken(result.accessToken);
        setMemberships(result.memberships);
        setMembershipId(
          resolveMembershipId(
            result.accessToken,
            result.defaultMembershipId ?? result.membership.membershipId,
          ),
        );
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
      membershipId,
      memberships,
      loading,
      isAuthenticated: Boolean(accessToken) && !isStoredSessionExpired(),
      membershipSwitching,
      login,
      selectMembership,
      logout,
    }),
    [
      user,
      accessToken,
      membershipId,
      memberships,
      loading,
      membershipSwitching,
      login,
      selectMembership,
      logout,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
