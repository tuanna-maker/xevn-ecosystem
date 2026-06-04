import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/contexts/AuthContext';

import { getCompanySubscription, upgradeCompanySubscription } from '@/integrations/hrmApi';

import { toErrorMessage } from '@/lib/apiError';



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



function mapSubscription(row: Record<string, unknown>): CompanySubscription {

  return {

    id: String(row.id),

    company_id: String(row.company_id),

    plan_code: String(row.plan_code ?? 'trial'),

    status: String(row.status ?? 'trial'),

    trial_start_date: String(row.trial_start_date ?? ''),

    trial_end_date: String(row.trial_end_date ?? ''),

    subscription_start_date: row.subscription_start_date ? String(row.subscription_start_date) : null,

    subscription_end_date: row.subscription_end_date ? String(row.subscription_end_date) : null,

    max_employees: Number(row.max_employees ?? 50),

    plan_name_vi: row.plan_name_vi ? String(row.plan_name_vi) : null,

    plan_name_en: row.plan_name_en ? String(row.plan_name_en) : null,

    plan_price_monthly: row.plan_price_monthly != null ? Number(row.plan_price_monthly) : null,

    plan_price_yearly: row.plan_price_yearly != null ? Number(row.plan_price_yearly) : null,

    plan_features_vi: (row.plan_features_vi as string[]) ?? null,

    plan_features_en: (row.plan_features_en as string[]) ?? null,

    is_active: Boolean(row.is_active ?? true),

    trial_days_remaining: Number(row.trial_days_remaining ?? 0),

  };

}



export function useCompanySubscription() {

  const { currentCompanyId } = useAuth();

  return useQuery({

    queryKey: ['company-subscription', currentCompanyId],

    queryFn: async () => {

      if (!currentCompanyId) return null;

      const row = await getCompanySubscription(currentCompanyId);

      return mapSubscription(row);

    },

    enabled: !!currentCompanyId,

  });

}



export function useUpgradePlan() {

  const qc = useQueryClient();

  const { currentCompanyId } = useAuth();

  return useMutation({

    mutationFn: async (payload: { planId: string; planCode: string; maxEmployees: number }) => {

      if (!currentCompanyId) throw new Error('No company selected');

      return upgradeCompanySubscription(currentCompanyId, {

        plan_code: payload.planCode,

        max_employees: payload.maxEmployees,

      });

    },

    onSuccess: () => {

      qc.invalidateQueries({ queryKey: ['company-subscription'] });

    },

    onError: (error: unknown) => {

      console.error('upgradePlan:', toErrorMessage(error));

    },

  });

}



export function useCanAddEmployee() {

  const { currentCompanyId } = useAuth();

  const { data: subscription } = useCompanySubscription();

  return useQuery({

    queryKey: ['can-add-employee', currentCompanyId, subscription?.max_employees],

    queryFn: async () => {

      if (!currentCompanyId) return { canAdd: false, current: 0, max: 0, reason: '' };

      const max = subscription?.max_employees ?? 999;

      return { canAdd: true, current: 0, max, reason: '' };

    },

    enabled: !!currentCompanyId,

  });

}


