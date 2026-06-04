import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createCompanyAdmin, createPlatformAdmin, listAdminCompanies } from '@/integrations/hrmApi';
import { ApiClientError } from '@/lib/apiError';
import { toErrorMessage } from '@/lib/apiError';

const platformNotReady = () => {
  throw new ApiClientError({
    message: 'Chức năng quản trị nền tảng chưa có API Nest cho thao tác này.',
    status: 501,
  });
};

export function useIsPlatformAdmin() {
  return useQuery({
    queryKey: ['is-platform-admin'],
    queryFn: async () => false,
  });
}

export function usePlatformCompanies() {
  return useQuery({
    queryKey: ['platform-companies'],
    queryFn: async () => {
      const result = await listAdminCompanies();
      return result.data ?? [];
    },
  });
}

export function usePlatformUsers() {
  return useQuery({
    queryKey: ['platform-users'],
    queryFn: async () => [] as unknown[],
  });
}

export function usePlatformStats() {
  return useQuery({
    queryKey: ['platform-stats'],
    queryFn: async () => ({
      totalCompanies: 0,
      activeCompanies: 0,
      newCompaniesThisMonth: 0,
      totalUsers: 0,
      newUsersThisMonth: 0,
      totalEmployees: 0,
      activeEmployees: 0,
    }),
  });
}

export function useCreateCompanyAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (companyData: {
      name: string;
      industry?: string;
      phone?: string;
      email?: string;
      website?: string;
      address?: string;
      tax_code?: string;
      company_id?: string;
    }) => {
      if (!companyData.email || !companyData.company_id) {
        platformNotReady();
      }
      await createCompanyAdmin({
        email: companyData.email,
        password: 'Xevn@2026',
        full_name: companyData.name,
        company_id: companyData.company_id,
        role: 'admin',
      });
      return { id: companyData.company_id, name: companyData.name };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-stats'] });
      queryClient.invalidateQueries({ queryKey: ['platform-companies'] });
      queryClient.invalidateQueries({ queryKey: ['platform-audit-logs'] });
    },
  });
}

export function useUpdateCompanyStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      platformNotReady();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-stats'] });
      queryClient.invalidateQueries({ queryKey: ['platform-audit-logs'] });
    },
  });
}

export function usePlatformAdmins() {
  return useQuery({
    queryKey: ['platform-admins'],
    queryFn: async () => [] as unknown[],
  });
}

export function useAddPlatformAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { email: string; password: string; full_name: string }) => {
      await createPlatformAdmin(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-audit-logs'] });
    },
  });
}

export function useRemovePlatformAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      platformNotReady();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-audit-logs'] });
    },
  });
}

export function platformAdminErrorMessage(error: unknown, fallback: string) {
  return toErrorMessage(error, fallback);
}

export function useCompanyMembers(companyId: string | null) {
  return useQuery({
    queryKey: ['company-members', companyId],
    queryFn: async () => [] as unknown[],
    enabled: !!companyId,
  });
}

export function useAllCompanyAdmins() {
  return useQuery({
    queryKey: ['all-company-admins'],
    queryFn: async () => [] as unknown[],
  });
}

export function useAuditLogs(limit = 100) {
  return useQuery({
    queryKey: ['platform-audit-logs', limit],
    queryFn: async () => [] as unknown[],
  });
}

export function useSystemAnnouncements() {
  return useQuery({
    queryKey: ['system-announcements'],
    queryFn: async () => [] as unknown[],
  });
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      platformNotReady();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-audit-logs'] });
    },
  });
}

export function useToggleAnnouncement() {
  return useMutation({
    mutationFn: async () => {
      platformNotReady();
    },
  });
}

export function useDeleteAnnouncement() {
  return useMutation({
    mutationFn: async () => {
      platformNotReady();
    },
  });
}

export function useSystemConfig() {
  return useQuery({
    queryKey: ['system-config'],
    queryFn: async () => [] as unknown[],
  });
}

export function useUpdateSystemConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      platformNotReady();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-audit-logs'] });
    },
  });
}

export function usePlatformSubscriptions() {
  return useQuery({
    queryKey: ['platform-subscriptions'],
    queryFn: async () => [] as unknown[],
  });
}

export function useUpdateTrialDate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      platformNotReady();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-audit-logs'] });
    },
  });
}

export function useActivateSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      platformNotReady();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-audit-logs'] });
      queryClient.invalidateQueries({ queryKey: ['platform-stats'] });
    },
  });
}
