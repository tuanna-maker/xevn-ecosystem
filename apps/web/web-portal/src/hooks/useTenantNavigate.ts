import { useNavigate, NavigateOptions } from 'react-router-dom';
import { useTenantScope } from '../contexts/GlobalFilterContext';
import { withTenantQueryParam } from '../modules/hrm/paths';

/**
 * Wraps `useNavigate` — keeps tenant in `?tenantId=` on absolute paths.
 */
export function useTenantNavigate() {
  const navigate = useNavigate();
  const { selectedTenant } = useTenantScope();

  const tenantNavigate = (to: string, options?: NavigateOptions) => {
    if (to.startsWith('/')) {
      const resolvedPath = withTenantQueryParam(to, selectedTenant?.tenantId);
      navigate(resolvedPath, options);
    } else {
      navigate(to, options);
    }
  };

  return tenantNavigate;
}
