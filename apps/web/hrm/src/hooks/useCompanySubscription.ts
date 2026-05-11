import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { isSupabaseConfigured, supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface CompanySubscription {
  id: string;
  company_id: string;
  plan_code: string;
  status: string;
  trial_start_date: string;
  trial_end_date: string;
  subscription_start_date: string | null;
  subscription_end_date: string | null;
  max_employees: number;
  plan_name_vi: string | null;
  plan_name_en: string | null;
  plan_price_monthly: number | null;
  plan_price_yearly: number | null;
  plan_features_vi: string[] | null;
  plan_features_en: string[] | null;
  is_active: boolean;
  trial_days_remaining: number;
}

export function useCompanySubscription() {
  const { currentCompanyId } = useAuth();
  return useQuery({
    queryKey: ['company-subscription', currentCompanyId],
    queryFn: async () => {
      if (!currentCompanyId) return null;
      const { data, error } = await supabase.rpc('get_company_subscription', {
        _company_id: currentCompanyId,
      });
      if (error) throw error;
      return data as unknown as CompanySubscription | null;
    },
    enabled: !!currentCompanyId && isSupabaseConfigured,
  });
}

export function useUpgradePlan() {
  const qc = useQueryClient();
  const { currentCompanyId } = useAuth();
  return useMutation({
    mutationFn: async ({ planId, planCode, maxEmployees }: { planId: string; planCode: string; maxEmployees: number }) => {
      if (!currentCompanyId) throw new Error('No company selected');
      const { error } = await supabase
        .from('company_subscriptions' as any)
        .update({
          plan_id: planId,
          plan_code: planCode,
          max_employees: maxEmployees,
          status: 'active',
          subscription_start_date: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as any)
        .eq('company_id', currentCompanyId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['company-subscription'] });
    },
  });
}

export function useCanAddEmployee() {
  const { currentCompanyId } = useAuth();
  return useQuery({
    queryKey: ['can-add-employee', currentCompanyId],
    queryFn: async () => {
      if (!currentCompanyId) return { canAdd: false, current: 0, max: 0, reason: '' };
      
      // Get subscription
      const { data: sub } = await supabase.rpc('get_company_subscription', {
        _company_id: currentCompanyId,
      });
      
      if (!sub) return { canAdd: true, current: 0, max: 999, reason: '' };
      
      const subscription = sub as unknown as CompanySubscription;
      
      // Check if subscription is active
      if (!subscription.is_active) {
        return { canAdd: false, current: 0, max: subscription.max_employees, reason: 'subscription_expired' };
      }
      
      // Count current employees
      const { count, error } = await supabase
        .from('employees')
        .select('id', { count: 'exact', head: true })
        .eq('company_id', currentCompanyId)
        .is('deleted_at', null);
      
      if (error) throw error;
      
      const current = count || 0;
      const max = subscription.max_employees;
      
      return {
        canAdd: current < max,
        current,
        max,
        reason: current >= max ? 'employee_limit' : '',
      };
    },
    enabled: !!currentCompanyId && isSupabaseConfigured,
  });
}
