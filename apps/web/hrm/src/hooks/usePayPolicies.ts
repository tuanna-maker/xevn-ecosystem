import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { toErrorMessage } from '@/lib/apiError';
import { PolicyAPI } from '@/lib/api/hrm-policy-api';

export type ComponentType =
  | 'grade_base'
  | 'grade_allowance'
  | 'kpi_bonus_pct'
  | 'trip_rate_tiered'
  | 'revenue_quality'
  | 'cpn_commission'
  | 'contract_fee'
  | 'vehicle_repair_deduction'
  | 'attendance_bonus_conditional'
  | 'meal_allowance_conditional'
  | 'fixed_base_salary'
  | 'vehicle_mgmt_allowance'
  | 'revenue_commission_tiered'
  | 'clhd_point_deduction'
  | 'loading_support'
  | 'fuel_quota_deduction'
  | 'kpi_pool_share'
  | 'team_milestone_bonus'
  | 'delivery_commission'
  | 'zero_sum_pool'
  | 'kpi_multiplier'
  | 'ranking_bonus'
  | 'special_allowance'
  | 'remote_work_allowance';

export interface IncomeComponent {
  id?: string;
  component_type: ComponentType;
  name: string;
  sort_order: number;
  is_deduction: boolean;
  input_source: string;
  params: Record<string, any>;
}

export interface PayPolicy {
  id: string;
  name: string;
  pay_group_code: string;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  version: number;
  effective_from: string;
  effective_to: string | null;
  components: IncomeComponent[];
}

export interface CreatePayPolicyData {
  name: string;
  pay_group_code: string;
  effective_from: string;
  description?: string;
}

export function usePayPolicies() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const companyId = session?.user?.company_id || 'main';

  const { data: policies = [], isLoading } = useQuery({
    queryKey: ['pay-policies', companyId],
    queryFn: async () => {
      try {
        const data = await PolicyAPI.list();
        return data as any as PayPolicy[];
      } catch (err) {
        console.warn('API /pay-policies err', err);
        return [];
      }
    },
    enabled: !!companyId,
  });

  const createPolicy = useMutation({
    mutationFn: async (data: CreatePayPolicyData) => {
      return PolicyAPI.create(data);
    },
    onSuccess: (data, variables) => {
      toast.success('Đã tạo nhóm chính sách thành công');
      queryClient.setQueryData(['pay-policies', companyId], (oldData: PayPolicy[] | undefined) => {
        if (!oldData) return oldData;
        const newPolicy: PayPolicy = {
          id: data.id || data.policy_id,
          name: variables.name,
          pay_group_code: variables.pay_group_code,
          status: 'DRAFT',
          version: 1,
          effective_from: variables.effective_from,
          effective_to: null,
          components: []
        };
        return [...oldData, newPolicy];
      });
    },
    onError: (err) => {
      toast.error(`Lỗi: ${toErrorMessage(err)}`);
    },
  });

  const addComponent = useMutation({
    mutationFn: async ({ policyId, component }: { policyId: string, component: IncomeComponent }) => {
      return PolicyAPI.addComponent(policyId, component as any);
    },
    onSuccess: (_, { policyId, component }) => {
      toast.success('Đã thêm thành phần thu nhập');
      queryClient.setQueryData(['pay-policies', companyId], (oldData: PayPolicy[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map(pol => {
          if (pol.id === policyId) {
            return {
              ...pol,
              components: [...(pol.components || []), component]
            };
          }
          return pol;
        });
      });
    },
    onError: (err) => {
      toast.error(`Lỗi: ${toErrorMessage(err)}`);
    },
  });

  return {
    policies,
    isLoading,
    createPolicy,
    addComponent,
  };
}
