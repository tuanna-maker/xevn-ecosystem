import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export function isCommandCenterPath(pathname: string): boolean {
  return pathname === '/command-center' || pathname.startsWith('/command-center/');
}

/** UC-ECO-SCOPE-01 — every portal route behind RequireAuth must redirect unauthenticated users. */
export function isProtectedPortalPath(pathname: string): boolean {
  if (pathname === '/' || pathname === '/cockpit') return true;
  if (pathname.startsWith('/catalog-governance')) return true;
  if (isCommandCenterPath(pathname)) return true;
  if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) return true;
  return false;
}

/**
 * Dev bypass (internal API key, no JWT) is disabled on all protected portal paths.
 * UC-ECO-SCOPE-01: unauthenticated users on pilot routes must land on /login.
 */
export function allowDevBypass(pathname: string): boolean {
  if (isProtectedPortalPath(pathname)) return false;
  if (import.meta.env.VITE_REQUIRE_LOGIN === 'true') return false;
  return (
    import.meta.env.DEV &&
    Boolean(import.meta.env.VITE_INTERNAL_API_KEY?.trim())
  );
}

/** Aligned with apps/web/hrm `portalLogin.ts` PORTAL_LOGIN_REDIRECT_PARAM. */
export function buildLoginRedirectUrl(from: string): string {
  return `/login?redirect=${encodeURIComponent(from)}`;
}

const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-slate-500">Đang tải phiên…</div>;
  }

  if (!isAuthenticated) {
    if (allowDevBypass(location.pathname)) {
      return <>{children}</>;
    }
    const from = location.pathname + location.search;
    return <Navigate to={buildLoginRedirectUrl(from)} replace state={{ from }} />;
  }

  return <>{children}</>;
};

export default RequireAuth;
