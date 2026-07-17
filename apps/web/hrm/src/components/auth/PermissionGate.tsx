import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';
import { getHrmPortalMode, isHrmPortalEmbedFrame } from '@/lib/hrmPortalMode';
import { hasPortalSession } from '@/lib/portalAuthBridge';

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

/**
 * Portal/Command Center embed: HRM `usePermissions` is an empty stub; RBAC is enforced by XBOS JWT on API.
 * Bypass when any portal signal is present (query, storage, iframe, or hydrated portal JWT).
 * @CODE-MEMORY work_item GWC-HRM-REC-UF12-01 — UF-HRM-12 Thêm/Sửa visible for Group CEO embed.
 */
export function shouldBypassHrmPermissionGate(search: string): boolean {
  return (
    getHrmPortalMode(search) ||
    hasPortalSession() ||
    isHrmPortalEmbedFrame()
  );
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
  const { hasPermission, hasAnyPermission, hasAnyOfPermissions, hasAllPermissions } = usePermissions();

  // Portal embed: RBAC is enforced by XBOS JWT on API — mirror PermissionRoute (no empty HRM stub).
  if (shouldBypassHrmPermissionGate(location.search)) {
    return <>{children}</>;
  }

  let allowed = false;

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
