import React, { useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useGlobalFilter } from '../../contexts/GlobalFilterContext';

export const TenantScopeSync: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { tenantId } = useParams<{ tenantId: string }>();
  const { tenants, selectedTenant, setSelectedTenant } = useGlobalFilter();

  useEffect(() => {
    if (tenantId && selectedTenant.tenantId !== tenantId) {
      const match = tenants.find((t) => t.tenantId.toLowerCase() === tenantId.toLowerCase());
      if (match) {
        setSelectedTenant(match);
      }
    }
  }, [tenantId, tenants, selectedTenant.tenantId, setSelectedTenant]);

  // If the URL tenantId is completely invalid, redirect to root which will redirect to a valid preferred tenant
  const match = tenants.find((t) => t.tenantId.toLowerCase() === tenantId?.toLowerCase());
  if (tenantId && !match && selectedTenant.id !== '__loading__') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
