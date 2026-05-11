import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { isSupabaseConfigured, supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { createCompanyAdmin, createPlatformAdmin } from '@/integrations/hrmApi';
import { toErrorMessage } from '@/lib/apiError';

export function useIsPlatformAdmin() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['is-platform-admin', user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data, error } = await supabase.rpc('is_platform_admin', { _user_id: user.id });
      if (error) return false;
      return data as boolean;
    },
    enabled: !!user && isSupabaseConfigured,
  });
}

export function usePlatformCompanies() {
  return useQuery({
    queryKey: ['platform-companies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_companies_view' as any).select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });
}

export function usePlatformUsers() {
  return useQuery({
    queryKey: ['platform-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_users_view' as any).select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });
}

export function usePlatformStats() {
  return useQuery({
    queryKey: ['platform-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_platform_stats');
      if (error) throw error;
      return data as {
        totalCompanies: number; activeCompanies: number; newCompaniesThisMonth: number;
        totalUsers: number; newUsersThisMonth: number;
        totalEmployees: number; activeEmployees: number;
      };
    },
  });
}

export function useCreateCompanyAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (companyData: {
      name: string; industry?: string; phone?: string; email?: string;
      website?: string; address?: string; tax_code?: string;
    }) => {
      const { data, error } = await supabase.rpc('platform_admin_create_company' as any, {
        p_name: companyData.name,
        p_industry: companyData.industry || null,
        p_phone: companyData.phone || null,
        p_email: companyData.email || null,
        p_website: companyData.website || null,
        p_address: companyData.address || null,
        p_tax_code: companyData.tax_code || null,
      });
      if (error) throw error;

      const company = data as { id: string; name: string };
      if (companyData.email) {
        await createCompanyAdmin({
          company_id: company.id,
          email: companyData.email,
          password: crypto.randomUUID().slice(0, 8) + 'A!',
          full_name: companyData.name,
          role: 'admin',
        });
      }

      return company;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-companies'] });
      queryClient.invalidateQueries({ queryKey: ['platform-stats'] });
      queryClient.invalidateQueries({ queryKey: ['platform-audit-logs'] });
    },
  });
}

export function useUpdateCompanyStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ companyId, status }: { companyId: string; status: string }) => {
      const { error } = await supabase.from('companies').update({ status }).eq('id', companyId);
      if (error) throw error;
      // Log audit
      await supabase.rpc('log_platform_audit', {
        _action: status === 'active' ? 'company_unlocked' : 'company_locked',
        _entity_type: 'company', _entity_id: companyId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-companies'] });
      queryClient.invalidateQueries({ queryKey: ['platform-stats'] });
      queryClient.invalidateQueries({ queryKey: ['platform-audit-logs'] });
    },
  });
}

export function usePlatformAdmins() {
  return useQuery({
    queryKey: ['platform-admins'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_admins' as any).select('*').order('granted_at', { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });
}

export function useAddPlatformAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ email, password, full_name }: { email: string; password: string; full_name?: string }) => {
      await createPlatformAdmin({
        email,
        password,
        full_name,
      });
      await supabase.rpc('log_platform_audit', {
        _action: 'admin_added', _entity_type: 'platform_admin', _entity_name: email,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-admins'] });
      queryClient.invalidateQueries({ queryKey: ['platform-audit-logs'] });
    },
  });
}

export function useRemovePlatformAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ adminId, email }: { adminId: string; email?: string }) => {
      const { error } = await supabase.from('platform_admins' as any).delete().eq('id', adminId);
      if (error) throw error;
      await supabase.rpc('log_platform_audit', {
        _action: 'admin_removed', _entity_type: 'platform_admin', _entity_name: email || adminId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-admins'] });
      queryClient.invalidateQueries({ queryKey: ['platform-audit-logs'] });
    },
  });
}

export function platformAdminErrorMessage(error: unknown, fallback: string) {
  return toErrorMessage(error, fallback);
}

export function useCompanyMembers(companyId: string | null) {
  return useQuery({
    queryKey: ['platform-company-members', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await supabase
        .from('user_company_memberships').select('*').eq('company_id', companyId).order('created_at', { ascending: false });
      if (error) throw error;
      return data as any[];
    },
    enabled: !!companyId,
  });
}

// All company admin accounts (owner, admin, hr_manager roles) - uses security definer function
export function useAllCompanyAdmins() {
  return useQuery({
    queryKey: ['platform-all-company-admins'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_all_company_admins');
      if (error) throw error;
      return data as any[];
    },
  });
}

// Audit logs
export function useAuditLogs(limit = 100) {
  return useQuery({
    queryKey: ['platform-audit-logs', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_audit_logs' as any).select('*').order('created_at', { ascending: false }).limit(limit);
      if (error) throw error;
      return data as any[];
    },
  });
}

// System announcements
export function useSystemAnnouncements() {
  return useQuery({
    queryKey: ['system-announcements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_announcements' as any).select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: any) => {
      const { error } = await supabase.from('system_announcements' as any).insert(values);
      if (error) throw error;
      await supabase.rpc('log_platform_audit', {
        _action: 'announcement_created', _entity_type: 'announcement', _entity_name: values.title,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-announcements'] });
      queryClient.invalidateQueries({ queryKey: ['platform-audit-logs'] });
    },
  });
}

export function useToggleAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from('system_announcements' as any).update({ is_active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['system-announcements'] }),
  });
}

export function useDeleteAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const { error } = await supabase.from('system_announcements' as any).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['system-announcements'] }),
  });
}

// System config
export function useSystemConfig() {
  return useQuery({
    queryKey: ['system-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_config' as any).select('*').order('category', { ascending: true });
      if (error) throw error;
      return data as any[];
    },
  });
}

export function useUpdateSystemConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, value }: { id: string; value: any }) => {
      const { error } = await supabase
        .from('system_config' as any).update({ value, updated_by: (await supabase.auth.getUser()).data.user?.id, updated_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
      await supabase.rpc('log_platform_audit', {
        _action: 'config_updated', _entity_type: 'system_config', _entity_id: id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-config'] });
      queryClient.invalidateQueries({ queryKey: ['platform-audit-logs'] });
    },
  });
}

// ─── Trial Management ────────────────────────────────────────
export function usePlatformSubscriptions() {
  return useQuery({
    queryKey: ['platform-subscriptions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_subscriptions_view' as any)
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });
}

export function useUpdateTrialDate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ subscriptionId, trialEndDate, companyId }: { subscriptionId: string; trialEndDate: string; companyId: string }) => {
      const { error } = await supabase
        .from('company_subscriptions' as any)
        .update({ trial_end_date: trialEndDate, updated_at: new Date().toISOString() } as any)
        .eq('id', subscriptionId);
      if (error) throw error;
      await supabase.rpc('log_platform_audit', {
        _action: 'trial_date_updated',
        _entity_type: 'subscription',
        _entity_id: subscriptionId,
        _details: JSON.stringify({ new_trial_end_date: trialEndDate, company_id: companyId }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['platform-audit-logs'] });
    },
  });
}

export function useActivateSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ subscriptionId, planId, planCode, maxEmployees, companyId }: {
      subscriptionId: string; planId: string; planCode: string; maxEmployees: number; companyId: string;
    }) => {
      const { error } = await supabase
        .from('company_subscriptions' as any)
        .update({
          status: 'active',
          plan_id: planId,
          plan_code: planCode,
          max_employees: maxEmployees,
          subscription_start_date: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', subscriptionId);
      if (error) throw error;
      await supabase.rpc('log_platform_audit', {
        _action: 'subscription_activated',
        _entity_type: 'subscription',
        _entity_id: subscriptionId,
        _details: JSON.stringify({ plan_code: planCode, company_id: companyId }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['platform-audit-logs'] });
      queryClient.invalidateQueries({ queryKey: ['platform-stats'] });
    },
  });
}
