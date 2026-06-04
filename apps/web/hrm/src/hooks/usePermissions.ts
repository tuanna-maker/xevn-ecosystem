import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

export interface UserPermission {
  module: string;
  action: string;
}

export function usePermissions() {
  const { user, currentCompanyId } = useAuth();

  const { data: permissions = [], isLoading } = useQuery({
    queryKey: ['user-permissions', user?.id, currentCompanyId],
    queryFn: async () => {
      if (!user || !currentCompanyId) return [];
      return [] as UserPermission[];
    },
    enabled: !!user && !!currentCompanyId,
    staleTime: 5 * 60 * 1000,
  });

  const { data: userRole } = useQuery({
    queryKey: ['user-role', user?.id, currentCompanyId],
    queryFn: async () => {
      if (!user || !currentCompanyId) return null;
      return null as string | null;
    },
    enabled: !!user && !!currentCompanyId,
    staleTime: 5 * 60 * 1000,
  });

  const hasPermission = (module: string, action: string): boolean => {
    return permissions.some((p) => p.module === module && p.action === action);
  };

  const hasAnyPermission = (module: string): boolean => {
    return permissions.some((p) => p.module === module);
  };

  const hasAllPermissions = (checks: { module: string; action: string }[]): boolean => {
    return checks.every((c) => hasPermission(c.module, c.action));
  };

  const hasAnyOfPermissions = (checks: { module: string; action: string }[]): boolean => {
    return checks.some((c) => hasPermission(c.module, c.action));
  };

  const isOwner = userRole === 'owner';
  const isAdmin = userRole === 'owner' || userRole === 'admin';

  return {
    permissions,
    userRole,
    isLoading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasAnyOfPermissions,
    isOwner,
    isAdmin,
  };
}

export function useSystemRoles() {
  return useQuery({
    queryKey: ['system-roles'],
    queryFn: async () => {
      return [] as Array<{
        id: string;
        code: string;
        name: string;
        description: string;
        level: number;
      }>;
    },
  });
}

export function useRolePermissions(roleId: string | null) {
  return useQuery({
    queryKey: ['role-permissions', roleId],
    queryFn: async () => {
      if (!roleId) return [];
      return [] as unknown[];
    },
    enabled: !!roleId,
  });
}
