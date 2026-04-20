import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePermissions } from '@/hooks/usePermissions';
import { ShieldX, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getHrmPortalMode } from '@/lib/hrmPortalMode';

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
  const location = useLocation();
  const portalMode = getHrmPortalMode(location.search);

  // Portal: không chờ Supabase permissions — tránh spinner/blank khi nhúng Command Center.
  if (portalMode) return <>{children}</>;

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const hasAccess = action ? hasPermission(module, action) : hasAnyPermission(module);

  if (!hasAccess) {
    if (redirect) {
      return <Navigate to="/" replace />;
    }
    return <AccessDeniedPage />;
  }

  return <>{children}</>;
}
