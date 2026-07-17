import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';
import { getHrmPortalMode } from '@/lib/hrmPortalMode';

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
  const location = useLocation();
  const portalMode = getHrmPortalMode(location.search);

  const { hasPermission, hasAnyPermission, hasAnyOfPermissions, hasAllPermissions } = usePermissions();

  let allowed = false;

  // Portal embed: RBAC is enforced by XBOS JWT on API — mirror PermissionRoute (no empty HRM stub).
  if (portalMode) return <>{children}</>;

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
