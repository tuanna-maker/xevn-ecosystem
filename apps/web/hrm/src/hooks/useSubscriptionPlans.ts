import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { isSupabaseConfigured, supabase } from '@/integrations/supabase/client';

export interface SubscriptionPlan {
  id: string;
  code: string;
  name_vi: string;
  name_en: string;
  description_vi: string | null;
  description_en: string | null;
  price_monthly: number;
  price_yearly: number;
  currency: string;
  max_employees: number;
  is_popular: boolean;
  is_active: boolean;
  sort_order: number;
  features_vi: string[];
  features_en: string[];
  created_at: string;
  updated_at: string;
}

export function useSubscriptionPlans() {
  return useQuery({
    queryKey: ['subscription-plans'],
    enabled: isSupabaseConfigured,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_plans' as any)
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data as unknown as SubscriptionPlan[];
    },
  });
}

export function useActiveSubscriptionPlans() {
  return useQuery({
    queryKey: ['subscription-plans-active'],
    enabled: isSupabaseConfigured,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_plans' as any)
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data as unknown as SubscriptionPlan[];
    },
  });
}

export function useCreatePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (plan: Partial<SubscriptionPlan>) => {
      const { error } = await supabase.from('subscription_plans' as any).insert(plan as any);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subscription-plans'] });
      qc.invalidateQueries({ queryKey: ['subscription-plans-active'] });
    },
  });
}

export function useUpdatePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SubscriptionPlan> & { id: string }) => {
      const { error } = await supabase
        .from('subscription_plans' as any)
        .update({ ...updates, updated_at: new Date().toISOString() } as any)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subscription-plans'] });
      qc.invalidateQueries({ queryKey: ['subscription-plans-active'] });
    },
  });
}

export function useDeletePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('subscription_plans' as any).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subscription-plans'] });
      qc.invalidateQueries({ queryKey: ['subscription-plans-active'] });
    },
  });
}
