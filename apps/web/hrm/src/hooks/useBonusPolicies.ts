import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/contexts/AuthContext';

import { toast } from 'sonner';

import { toErrorMessage } from '@/lib/apiError';

import {

  createBonusPolicy,

  createBonusPolicyParticipant,

  deleteBonusPolicy,

  listBonusPolicies,

  listBonusPolicyParticipants,

  updateBonusPolicy,

} from '@/integrations/hrmApi';



export type BonusType = 'monthly' | 'quarterly' | 'yearly' | 'kpi' | 'sales' | 'holiday' | 'excellence' | 'other';

export type CalculationMethod = 'fixed' | 'percentage' | 'formula' | 'tier';



export interface BonusTier {

  from: number;

  to: number;

  value: number;

  type: 'fixed' | 'percentage';

}



export interface BonusPolicy {

  id: string;

  company_id: string;

  code: string;

  name: string;

  type: BonusType;

  description: string | null;

  calculation_method: CalculationMethod;

  base_value: number;

  percentage_base: string | null;

  formula: string | null;

  tiers: BonusTier[] | null;

  conditions: string[] | null;

  effective_date: string;

  expiry_date: string | null;

  status: 'active' | 'inactive' | 'draft';

  applied_departments: string[] | null;

  applied_positions: string[] | null;

  participant_count: number;

  total_paid_amount: number;

  last_paid_date: string | null;

  created_at: string;

  updated_at: string;

}



export interface BonusPolicyParticipant {

  id: string;

  company_id: string;

  policy_id: string;

  employee_id: string | null;

  employee_code: string;

  employee_name: string;

  department: string | null;

  position: string | null;

  join_date: string;

  last_bonus_amount: number | null;

  last_bonus_date: string | null;

  status: 'active' | 'suspended' | 'pending';

  created_at: string;

  updated_at: string;

}



export interface BonusPolicyFormData {

  code: string;

  name: string;

  type: BonusType;

  description?: string;

  calculation_method: CalculationMethod;

  base_value: number;

  percentage_base?: string;

  formula?: string;

  tiers?: BonusTier[];

  conditions?: string[];

  effective_date: string;

  expiry_date?: string;

  status: 'active' | 'inactive' | 'draft';

  applied_departments?: string[];

  applied_positions?: string[];

}



function mapPolicy(row: Record<string, unknown>): BonusPolicy {

  return {

    id: String(row.id),

    company_id: String(row.company_id),

    code: String(row.code),

    name: String(row.name),

    type: (row.type as BonusType) ?? 'other',

    description: row.description ? String(row.description) : null,

    calculation_method: (row.calculation_method as CalculationMethod) ?? 'fixed',

    base_value: Number(row.base_value ?? 0),

    percentage_base: row.percentage_base ? String(row.percentage_base) : null,

    formula: row.formula ? String(row.formula) : null,

    tiers: (row.tiers as BonusTier[]) ?? null,

    conditions: (row.conditions as string[]) ?? null,

    effective_date: String(row.effective_date ?? ''),

    expiry_date: row.expiry_date ? String(row.expiry_date) : null,

    status: (row.status as BonusPolicy['status']) ?? 'draft',

    applied_departments: (row.applied_departments as string[]) ?? null,

    applied_positions: (row.applied_positions as string[]) ?? null,

    participant_count: Number(row.participant_count ?? 0),

    total_paid_amount: Number(row.total_paid_amount ?? 0),

    last_paid_date: row.last_paid_date ? String(row.last_paid_date) : null,

    created_at: String(row.created_at ?? ''),

    updated_at: String(row.updated_at ?? ''),

  };

}



export const useBonusPolicies = () => {

  const { currentCompanyId } = useAuth();

  const queryClient = useQueryClient();



  const { data: policies = [], isLoading, refetch } = useQuery({

    queryKey: ['bonus-policies', currentCompanyId],

    queryFn: async () => {

      if (!currentCompanyId) return [];

      const response = await listBonusPolicies(currentCompanyId);

      return (response.data ?? []).map(mapPolicy);

    },

    enabled: !!currentCompanyId,

  });



  const fetchParticipants = async (policyId: string): Promise<BonusPolicyParticipant[]> => {

    if (!currentCompanyId) return [];

    const response = await listBonusPolicyParticipants(policyId, currentCompanyId);

    return (response.data ?? []).map((row) => ({

      id: String(row.id),

      company_id: String(row.company_id),

      policy_id: String(row.policy_id),

      employee_id: row.employee_id ? String(row.employee_id) : null,

      employee_code: String(row.employee_code ?? ''),

      employee_name: String(row.employee_name ?? ''),

      department: row.department ? String(row.department) : null,

      position: row.position ? String(row.position) : null,

      join_date: String(row.join_date ?? ''),

      last_bonus_amount: row.last_bonus_amount != null ? Number(row.last_bonus_amount) : null,

      last_bonus_date: row.last_bonus_date ? String(row.last_bonus_date) : null,

      status: (row.status as BonusPolicyParticipant['status']) ?? 'active',

      created_at: String(row.created_at ?? ''),

      updated_at: String(row.updated_at ?? ''),

    }));

  };



  const createPolicyMutation = useMutation({

    mutationFn: async (formData: BonusPolicyFormData) => {

      if (!currentCompanyId) throw new Error('Missing company scope');

      return createBonusPolicy({ company_id: currentCompanyId, ...formData });

    },

    onSuccess: () => {

      queryClient.invalidateQueries({ queryKey: ['bonus-policies', currentCompanyId] });

      toast.success('Đã tạo chính sách thưởng');

    },

    onError: (error: unknown) => toast.error(toErrorMessage(error, 'Lỗi khi tạo chính sách')),

  });



  const updatePolicyMutation = useMutation({

    mutationFn: async ({ id, data }: { id: string; data: Partial<BonusPolicyFormData> }) => {

      if (!currentCompanyId) throw new Error('Missing company scope');

      return updateBonusPolicy(id, currentCompanyId, data);

    },

    onSuccess: () => {

      queryClient.invalidateQueries({ queryKey: ['bonus-policies', currentCompanyId] });

      toast.success('Đã cập nhật');

    },

    onError: (error: unknown) => toast.error(toErrorMessage(error, 'Lỗi khi cập nhật')),

  });



  const deletePolicyMutation = useMutation({

    mutationFn: async (id: string) => {

      if (!currentCompanyId) throw new Error('Missing company scope');

      return deleteBonusPolicy(id, currentCompanyId);

    },

    onSuccess: () => {

      queryClient.invalidateQueries({ queryKey: ['bonus-policies', currentCompanyId] });

      toast.success('Đã xóa');

    },

    onError: (error: unknown) => toast.error(toErrorMessage(error, 'Lỗi khi xóa')),

  });



  const addParticipantMutation = useMutation({

    mutationFn: async (payload: Record<string, unknown>) => {

      if (!currentCompanyId) throw new Error('Missing company scope');

      return createBonusPolicyParticipant({ company_id: currentCompanyId, ...payload });

    },

    onError: (error: unknown) => toast.error(toErrorMessage(error, 'Lỗi khi thêm nhân viên')),

  });



  const updateParticipantMutation = useMutation({

    mutationFn: async () => {

      throw new Error('Cập nhật participant chưa hỗ trợ');

    },

    onError: (error: unknown) => toast.error(toErrorMessage(error, 'Lỗi khi cập nhật nhân viên')),

  });



  const deleteParticipantMutation = useMutation({

    mutationFn: async () => {

      throw new Error('Xóa participant chưa hỗ trợ');

    },

    onError: (error: unknown) => toast.error(toErrorMessage(error, 'Lỗi khi xóa nhân viên')),

  });



  return {

    policies,

    isLoading,

    refetch,

    fetchParticipants,

    createPolicy: createPolicyMutation.mutateAsync,

    updatePolicy: (id: string, data: Partial<BonusPolicyFormData>) => updatePolicyMutation.mutateAsync({ id, data }),

    deletePolicy: deletePolicyMutation.mutateAsync,

    addParticipant: addParticipantMutation.mutateAsync,

    updateParticipant: updateParticipantMutation.mutateAsync,

    deleteParticipant: deleteParticipantMutation.mutateAsync,

  };

};


