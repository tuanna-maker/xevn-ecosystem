import React from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { stripTenantPrefixFromPathname, withTenantQueryParam } from '../../modules/hrm/paths';

/**
 * Strip legacy `/:tenantId` path prefix and move tenant into `?tenantId=`.
 * e.g. `/visun/command-center/hrm/settings` → `/command-center/hrm/settings?tenantId=visun`
 */
export const TenantPathPrefixRedirect: React.FC = () => {
  const { tenantId } = useParams<{ tenantId: string }>();
  const location = useLocation();
  const stripped = stripTenantPrefixFromPathname(location.pathname);
  const target = withTenantQueryParam(`${stripped}${location.search}`, tenantId);
  return <Navigate to={`${target}${location.hash}`} replace />;
};
