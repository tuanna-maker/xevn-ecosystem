import { useQuery } from '@tanstack/react-query';
import { hrmApi } from '@/integrations/hrmApi';

export const PAY_STEPS_QUERY_KEY = 'pay-steps';

export type PayStep = {
  id: string;
  code: string;
  name: string;
  is_active: boolean;
};

export function usePaySteps() {
  const query = useQuery({
    queryKey: [PAY_STEPS_QUERY_KEY],
    queryFn: async () => {
      const res = await hrmApi.get<PayStep[]>('/api/hrm/payroll/pay-steps');
      return Array.isArray(res) ? res : ((res as any).data || []) as PayStep[];
    },
  });

  return {
    steps: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
