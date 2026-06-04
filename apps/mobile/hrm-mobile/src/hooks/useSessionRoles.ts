import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { isManagerRole, parseJwtClaims } from '../integrations/jwtClaims';

export function useSessionRoles() {
  const auth = useAuth();
  return useMemo(() => {
    const claims = auth.accessToken ? parseJwtClaims(auth.accessToken) : null;
    const roles = claims?.roles ?? [];
    return {
      roles,
      isManager: isManagerRole(roles),
      employeeIdFromToken: claims?.employee_id,
    };
  }, [auth.accessToken]);
}
