import { useNavigate, NavigateOptions } from 'react-router-dom';
import { useTenantScope } from '../contexts/GlobalFilterContext';

/**
 * A custom hook that wraps `useNavigate` to automatically prepend the current 
 * tenantId to absolute paths (paths starting with `/`).
 */
export function useTenantNavigate() {
  const navigate = useNavigate();
  const { selectedTenant } = useTenantScope();
  const tenantPrefix = `/${selectedTenant?.tenantId || ''}`;

  const tenantNavigate = (to: string, options?: NavigateOptions) => {
    if (to.startsWith('/')) {
      const resolvedPath = `${tenantPrefix}${to}`.replace(/\/+/g, '/');
      navigate(resolvedPath, options);
    } else {
      navigate(to, options);
    }
  };

  return tenantNavigate;
}
