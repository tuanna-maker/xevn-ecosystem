import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuth } from '@/contexts/AuthContext';

interface PermissionGateProps {
  children: ReactNode;
  module: string;
  action?: string;
  /** Show children if user has permission on ANY action in the module */
  anyAction?: boolean;
  /** Fallback element when permission denied */
  fallback?: ReactNode;
  /** Multiple permission checks - any must pass */
  anyOf?: { module: string; action: string }[];
  /** Multiple permission checks - all must pass */
  allOf?: { module: string; action: string }[];
}

export function PermissionGate({
  children,
  module,
  action,
  anyAction = false,
  fallback = null,
  anyOf,
  allOf,
}: PermissionGateProps) {
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

  const { hasPermission, hasAnyPermission, hasAnyOfPermissions, hasAllPermissions } = usePermissions();

  let allowed = false;

  // Portal-mode: hệ sinh thái quản lý quyền. Nếu HRM chưa có session/user,
  // vẫn cho phép render để tránh chặn action ngay từ UI gate.
  if (portalMode && !user) return <>{children}</>;

  if (anyOf) {
    allowed = hasAnyOfPermissions(anyOf);
  } else if (allOf) {
    allowed = hasAllPermissions(allOf);
  } else if (anyAction) {
    allowed = hasAnyPermission(module);
  } else if (action) {
    allowed = hasPermission(module, action);
  }

  if (!allowed) return <>{fallback}</>;
  return <>{children}</>;
}
