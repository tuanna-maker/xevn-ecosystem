import { useQuery } from '@tanstack/react-query';
import { isSupabaseConfigured, supabase } from '@/integrations/supabase/client';
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
      const { data, error } = await supabase
        .rpc('get_user_permissions', {
          _user_id: user.id,
          _company_id: currentCompanyId,
        });
      if (error) {
        console.error('Error fetching permissions:', error);
        return [];
      }
      return (data || []) as UserPermission[];
    },
    enabled: !!user && !!currentCompanyId && isSupabaseConfigured,
    staleTime: 5 * 60 * 1000, // Cache for 5 min
  });

  const { data: userRole } = useQuery({
    queryKey: ['user-role', user?.id, currentCompanyId],
    queryFn: async () => {
      if (!user || !currentCompanyId) return null;
      const { data, error } = await supabase
        .rpc('get_user_role', {
          _user_id: user.id,
          _company_id: currentCompanyId,
        });
      if (error) return null;
      return data as string | null;
    },
    enabled: !!user && !!currentCompanyId && isSupabaseConfigured,
    staleTime: 5 * 60 * 1000,
  });

  const hasPermission = (module: string, action: string): boolean => {
    return permissions.some(p => p.module === module && p.action === action);
  };

  const hasAnyPermission = (module: string): boolean => {
    return permissions.some(p => p.module === module);
  };

  const hasAllPermissions = (checks: { module: string; action: string }[]): boolean => {
    return checks.every(c => hasPermission(c.module, c.action));
  };

  const hasAnyOfPermissions = (checks: { module: string; action: string }[]): boolean => {
    return checks.some(c => hasPermission(c.module, c.action));
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

// Hook to fetch system roles list
export function useSystemRoles() {
  return useQuery({
    queryKey: ['system-roles'],
    enabled: isSupabaseConfigured,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_roles' as any)
        .select('*')
        .order('level', { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as Array<{
        id: string;
        code: string;
        name: string;
        description: string;
        level: number;
      }>;
    },
  });
}

// Hook to fetch permissions for a specific role
export function useRolePermissions(roleId: string | null) {
  return useQuery({
    queryKey: ['role-permissions', roleId],
    queryFn: async () => {
      if (!roleId) return [];
      const { data, error } = await supabase
        .from('role_permissions' as any)
        .select(`
          id,
          permission_id,
          permissions:permission_id (
            id,
            module,
            action,
            description
          )
        `)
        .eq('role_id', roleId);
      if (error) throw error;
      return (data || []) as any[];
    },
    enabled: !!roleId && isSupabaseConfigured,
  });
}
