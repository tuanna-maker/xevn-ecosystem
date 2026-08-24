import React, { useEffect } from 'react';
import { useParams, Navigate, useLocation } from 'react-router-dom';
import { useGlobalFilter } from '../../contexts/GlobalFilterContext';
import { useAuth } from '../../contexts/AuthContext';

export const TenantScopeSync: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { tenantId } = useParams<{ tenantId: string }>();
  const location = useLocation();
  const { tenants, selectedTenant, setSelectedTenant } = useGlobalFilter();
  const { logout } = useAuth();

  useEffect(() => {
    if (tenantId && selectedTenant.tenantId !== tenantId) {
      const match = tenants.find((t) => t.tenantId.toLowerCase() === tenantId.toLowerCase());
      if (match) {
        setSelectedTenant(match);
      }
    }
  }, [tenantId, tenants, selectedTenant.tenantId, setSelectedTenant]);

  const match = tenants.find((t) => t.tenantId.toLowerCase() === tenantId?.toLowerCase());
  
  useEffect(() => {
    if (tenantId && !match && selectedTenant.id !== '__loading__') {
      logout();
    }
  }, [tenantId, match, selectedTenant.id, logout]);

  // If the URL tenantId is completely invalid (e.g. visiting /command-center directly without tenant_id),
  // immediately clear the token (via logout above) and redirect to login.
  if (tenantId && !match && selectedTenant.id !== '__loading__') {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  return <>{children}</>;
};

