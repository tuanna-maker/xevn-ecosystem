import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
      return [] as unknown as Permission[];
    },
  });
}

export function useAllRolePermissions(roleIds: string[]) {
  return useQuery({
    queryKey: ['all-role-permissions', roleIds],
    queryFn: async () => {
      if (roleIds.length === 0) return {};
      const map: RolePermissionMap = {};
      roleIds.forEach((id) => {
        map[id] = new Set();
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
