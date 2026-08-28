import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useTenantScope } from '../../contexts/GlobalFilterContext';
import { tenantScopedPortalPath } from '../../modules/hrm/paths';

const RouteLoadingFallback: React.FC = () => (
  <div className="flex h-96 items-center justify-center text-slate-500">Đang tải...</div>
);

/**
 * Ensure legacy portal URLs (without `?tenantId=`) carry the active tenant query param.
 */
export const TenantLegacyPathRedirect: React.FC = () => {
  const location = useLocation();
  const { selectedTenant } = useTenantScope();

  if (selectedTenant.id === '__loading__') {
    return <RouteLoadingFallback />;
  }

  const tenantId = selectedTenant.tenantId?.trim();
  if (!tenantId) {
    return <Navigate to="/login" replace />;
  }

  const target = tenantScopedPortalPath(
    tenantId,
    `${location.pathname}${location.search}`
  );

  return <Navigate to={`${target}${location.hash}`} replace />;
};
