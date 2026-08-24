import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useGlobalFilter } from '../../contexts/GlobalFilterContext';
import { extractTenantIdFromSearch, withTenantQueryParam } from '../../modules/hrm/paths';

const RouteLoadingFallback: React.FC = () => (
  <div className="flex h-96 items-center justify-center text-slate-500">Đang tải...</div>
);

/**
 * Canonical portal routes keep tenant in `?tenantId=` (not `/:tenantId` path prefix).
 * Syncs query param ↔ GlobalFilter and redirects when the param is missing.
 */
export const TenantQueryScopeSync: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { tenants, selectedTenant, setSelectedTenant, tenantScopeStatus } = useGlobalFilter();
  const queryTenantId = extractTenantIdFromSearch(location.search);

  useEffect(() => {
    if (!queryTenantId || selectedTenant.tenantId === queryTenantId) return;
    const match = tenants.find((t) => t.tenantId.toLowerCase() === queryTenantId.toLowerCase());
    if (match) setSelectedTenant(match);
  }, [queryTenantId, tenants, selectedTenant.tenantId, setSelectedTenant]);

  if (tenantScopeStatus === 'loading' || selectedTenant.id === '__loading__') {
    return <RouteLoadingFallback />;
  }

  if (!queryTenantId) {
    const target = withTenantQueryParam(
      `${location.pathname}${location.search}`,
      selectedTenant.tenantId,
    );
    return <Navigate to={`${target}${location.hash}`} replace />;
  }

  const match = tenants.find((t) => t.tenantId.toLowerCase() === queryTenantId.toLowerCase());
  if (tenantScopeStatus === 'ready' && !match) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
