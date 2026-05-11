import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Permission {
  id: string;
  module: string;
  action: string;
  description: string;
}

export interface RolePermissionMap {
  [roleId: string]: Set<string>; // Set of permission_ids
}

export function useAllPermissions() {
  return useQuery({
    queryKey: ['all-permissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('permissions' as any)
        .select('id, module, action, description')
        .order('module')
        .order('action');
      if (error) throw error;
      return (data || []) as unknown as Permission[];
    },
  });
}

export function useAllRolePermissions(roleIds: string[]) {
  return useQuery({
    queryKey: ['all-role-permissions', roleIds],
    queryFn: async () => {
      if (roleIds.length === 0) return {};
      const { data, error } = await supabase
        .from('role_permissions' as any)
        .select('role_id, permission_id')
        .in('role_id', roleIds);
      if (error) throw error;

      const map: RolePermissionMap = {};
      roleIds.forEach(id => { map[id] = new Set(); });
      (data || []).forEach((rp: any) => {
        if (!map[rp.role_id]) map[rp.role_id] = new Set();
        map[rp.role_id].add(rp.permission_id);
      });
      return map;
    },
    enabled: roleIds.length > 0,
  });
}

export function useToggleRolePermission() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const addMutation = useMutation({
    mutationFn: async ({ roleId, permissionId }: { roleId: string; permissionId: string }) => {
      const { error } = await supabase
        .from('role_permissions' as any)
        .insert({ role_id: roleId, permission_id: permissionId } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-role-permissions'] });
      queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
      queryClient.invalidateQueries({ queryKey: ['user-permissions'] });
    },
    onError: (error: any) => {
      toast({ title: 'Lỗi', description: error.message, variant: 'destructive' });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async ({ roleId, permissionId }: { roleId: string; permissionId: string }) => {
      const { error } = await supabase
        .from('role_permissions' as any)
        .delete()
        .eq('role_id', roleId)
        .eq('permission_id', permissionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-role-permissions'] });
      queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
      queryClient.invalidateQueries({ queryKey: ['user-permissions'] });
    },
    onError: (error: any) => {
      toast({ title: 'Lỗi', description: error.message, variant: 'destructive' });
    },
  });

  const toggle = (roleId: string, permissionId: string, currentlyHas: boolean) => {
    if (currentlyHas) {
      removeMutation.mutate({ roleId, permissionId });
    } else {
      addMutation.mutate({ roleId, permissionId });
    }
  };

  return { toggle, isLoading: addMutation.isPending || removeMutation.isPending };
}
