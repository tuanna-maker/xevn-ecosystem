import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

/** P1-SUPA-FE-02 / P1-INC-P0-HRM-DASH-01 — plans are platform-admin only; no Supabase in portal embed. */
const supabaseEnabled = false;

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
    enabled: supabaseEnabled,
    queryFn: async () => {
      return [] as SubscriptionPlan[];
    },
  });
}

export function useActiveSubscriptionPlans() {
  return useQuery({
    queryKey: ['subscription-plans-active'],
    enabled: supabaseEnabled,
    queryFn: async () => {
      return [] as SubscriptionPlan[];
    },
  });
}

export function useCreatePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (plan: Partial<SubscriptionPlan>) => {
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
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subscription-plans'] });
      qc.invalidateQueries({ queryKey: ['subscription-plans-active'] });
    },
  });
}
