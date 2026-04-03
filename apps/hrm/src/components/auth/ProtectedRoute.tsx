import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useIsPlatformAdmin } from '@/hooks/usePlatformAdmin';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, profile, memberships, loading } = useAuth();
  const location = useLocation();
  const { data: isPlatformAdmin, isLoading: adminLoading } = useIsPlatformAdmin();
  const portalMode =
    (() => {
      const searchParams = new URLSearchParams(location.search);
      const portalParam = searchParams.get('portal');
      const portalQs =
        portalParam != null && (portalParam === '1' || portalParam.toLowerCase() === 'true');

      // Some integration flows may drop `portal` query during internal navigation.
      // If we still carry `companyId`, treat it as ecosystem/portal-mode as fallback.
      const companyIdParam = searchParams.get('companyId');
      const portalCompanyId =
        companyIdParam != null && companyIdParam !== '' && companyIdParam !== 'all';

      const qsPortal = portalQs || portalCompanyId;
      const storedSession =
        typeof sessionStorage !== 'undefined' &&
        sessionStorage.getItem('hrm_portal_mode') === '1';
      const storedLocal =
        typeof localStorage !== 'undefined' && localStorage.getItem('hrm_portal_mode') === '1';

      if (qsPortal) {
        if (typeof sessionStorage !== 'undefined') sessionStorage.setItem('hrm_portal_mode', '1');
        if (typeof localStorage !== 'undefined') localStorage.setItem('hrm_portal_mode', '1');
      }

      return qsPortal || storedSession || storedLocal;
    })();

  if (loading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Hệ sinh thái/portal đang quản lý auth. Trong portal-mode,
    // HRM không redirect về màn login nữa.
    if (portalMode) return <>{children}</>;
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Platform admin must always go to /platform-admin
  // Portal-mode: portal muốn vào thẳng màn HRM chính theo menu,
  // không cưỡng ép người dùng vào trang Platform Admin.
  if (!portalMode && isPlatformAdmin) {
    return <Navigate to="/platform-admin" replace />;
  }

  // Check if onboarding is completed
  if (profile && !profile.onboarding_completed && memberships.length === 0) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
