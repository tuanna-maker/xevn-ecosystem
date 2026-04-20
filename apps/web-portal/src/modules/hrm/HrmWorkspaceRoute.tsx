import React from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { hrmPortalPath, hrmProxyPath, HRM_PORTAL_BASE } from './paths';
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
  const target = hrmProxyPath(key, {
    portal: true,
    companyId: selectedCompany?.id ?? null,
  });

  /**
   * Lấp đầy chiều cao cột workspace (flex-1 + min-h-0), không cap 920px / 100dvh-11rem —
   * tránh khoảng trắng phía dưới và cắt nội dung. Cuộn dọc do app HRM bên trong iframe xử lý.
   */
  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-xevn-border bg-white shadow-soft">
      <iframe
        key={target}
        src={target}
        title="HRM Workspace"
        className="min-h-[min(18rem,45dvh)] min-w-0 w-full flex-1 border-0"
      />
    </div>
  );
};
