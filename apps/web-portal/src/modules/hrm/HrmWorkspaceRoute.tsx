import React from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { hrmAppPath, hrmPortalPath, HRM_PORTAL_BASE } from './paths';
import { HRM_DEFAULT_VIEW, isHrmWorkspaceView, parseHrmWorkspaceView } from './registry';
import { useGlobalFilter } from '../../contexts/GlobalFilterContext';

/**
 * Route con: `/command-center/hrm/:view`
 * Segment không hợp lệ → redirect về view mặc định (tránh URL “chết”).
 */
export const HrmWorkspaceRoute: React.FC = () => {
  const { view } = useParams<{ view: string }>();
  const location = useLocation();
  const { selectedCompany } = useGlobalFilter();

  // Be defensive: in some cases `useParams()` can be undefined if the segment is missing.
  // We then derive the `view` from pathname to avoid incorrectly falling back to `dashboard`.
  const normalizedPath = location.pathname.replace(/\/+$/, '');
  let viewFromPath: string | undefined;
  if (normalizedPath.startsWith(`${HRM_PORTAL_BASE}/`)) {
    const seg = normalizedPath.slice(`${HRM_PORTAL_BASE}/`.length);
    viewFromPath = seg ? decodeURIComponent(seg) : undefined;
  } else if (normalizedPath === HRM_PORTAL_BASE) {
    viewFromPath = undefined;
  }

  const requestedView = viewFromPath ?? view;

  if (requestedView != null && !isHrmWorkspaceView(requestedView)) {
    return <Navigate to={hrmPortalPath(HRM_DEFAULT_VIEW)} replace />;
  }

  const key = parseHrmWorkspaceView(requestedView);

  // Micro-FE handoff (no iframe): chuyển sang app HRM thật để đảm bảo đủ CRUD/filters/dialogs.
  // Lúc này portal chỉ đóng vai trò điều hướng URL.
  if (typeof window !== 'undefined') {
    const target = hrmAppPath(key, {
      portal: true,
      companyId: selectedCompany?.id ?? null,
    });

    // Redirect immediately to avoid a moment where portal content is visible.
    if (window.location.href !== target) {
      window.location.replace(target);
    }
  }

  return null;
};
