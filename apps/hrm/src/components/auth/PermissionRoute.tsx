import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePermissions } from '@/hooks/usePermissions';
import { ShieldX, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface PermissionRouteProps {
  children: ReactNode;
  module: string;
  action?: string;
  /** If true, redirects to dashboard. If false, shows access denied page inline. */
  redirect?: boolean;
}

function AccessDeniedPage() {
  const { t } = useTranslation();

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-md space-y-4">
        <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <ShieldX className="w-8 h-8 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">
          {t('permissions.accessDenied', 'Không có quyền truy cập')}
        </h2>
        <p className="text-muted-foreground">
          {t('permissions.accessDeniedDesc', 'Bạn không có quyền truy cập tính năng này. Vui lòng liên hệ quản trị viên để được cấp quyền.')}
        </p>
        <Button variant="outline" onClick={() => window.history.back()}>
          {t('common.goBack', 'Quay lại')}
        </Button>
      </div>
    </div>
  );
}

export function PermissionRoute({ children, module, action, redirect = false }: PermissionRouteProps) {
  const { hasPermission, hasAnyPermission, isLoading } = usePermissions();
  const { user } = useAuth();
  const location = useLocation();
  const portalMode =
    (() => {
      const searchParams = new URLSearchParams(location.search);
      const portalParam = searchParams.get('portal');
      const portalQs =
        portalParam != null && (portalParam === '1' || portalParam.toLowerCase() === 'true');
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

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const hasAccess = action ? hasPermission(module, action) : hasAnyPermission(module);

  // Portal-mode: nếu hệ sinh thái đang quản lý quyền mà HRM chưa có session/user,
  // cho phép render màn chính để tránh “chặn chức năng”.
  if (portalMode && !user) return <>{children}</>;

  if (!hasAccess) {
    if (redirect) {
      return <Navigate to="/" replace />;
    }
    return <AccessDeniedPage />;
  }

  return <>{children}</>;
}
