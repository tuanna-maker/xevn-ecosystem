import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';

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

export const useBonusPolicies = () => {
  const { currentCompanyId } = useAuth();
  const queryClient = useQueryClient();

  // Fetch policies
  const { data: policies = [], isLoading, refetch } = useQuery({
    queryKey: ['bonus-policies', currentCompanyId],
    queryFn: async () => {
      if (!currentCompanyId) return [];

      const { data, error } = await supabase
        .from('bonus_policies')
        .select('*')
        .eq('company_id', currentCompanyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(item => ({
        ...item,
        tiers: item.tiers as unknown as BonusTier[] | null,
      })) as BonusPolicy[];
    },
    enabled: !!currentCompanyId,
  });

  // Fetch participants for a specific policy
  const fetchParticipants = async (policyId: string): Promise<BonusPolicyParticipant[]> => {
    const { data, error } = await supabase
      .from('bonus_policy_participants')
      .select('*')
      .eq('policy_id', policyId)
      .order('employee_name', { ascending: true });

    if (error) throw error;
    return data as BonusPolicyParticipant[];
  };

  // Create policy mutation
  const createPolicyMutation = useMutation({
    mutationFn: async (formData: BonusPolicyFormData) => {
      if (!currentCompanyId) throw new Error('No company selected');

      const insertData = {
        company_id: currentCompanyId,
        code: formData.code,
        name: formData.name,
        type: formData.type,
        description: formData.description,
        calculation_method: formData.calculation_method,
        base_value: formData.base_value,
        percentage_base: formData.percentage_base,
        formula: formData.formula,
        tiers: formData.tiers as unknown as Json,
        conditions: formData.conditions,
        effective_date: formData.effective_date,
        expiry_date: formData.expiry_date,
        status: formData.status,
        applied_departments: formData.applied_departments,
        applied_positions: formData.applied_positions,
      };

      const { data, error } = await supabase
        .from('bonus_policies')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bonus-policies', currentCompanyId] });
      toast.success('Đã tạo chính sách thưởng');
    },
    onError: (error: any) => {
      if (error.code === '23505') {
        toast.error('Mã chính sách đã tồn tại');
      } else {
        toast.error('Lỗi khi tạo chính sách');
      }
    },
  });

  // Update policy mutation
  const updatePolicyMutation = useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: Partial<BonusPolicyFormData> }) => {
      const updateData: Record<string, unknown> = { ...formData };
      if (formData.tiers) {
        updateData.tiers = formData.tiers as unknown as Json;
      }

      const { error } = await supabase
        .from('bonus_policies')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bonus-policies', currentCompanyId] });
      toast.success('Đã cập nhật chính sách thưởng');
    },
    onError: () => {
      toast.error('Lỗi khi cập nhật chính sách');
    },
  });

  // Delete policy mutation
  const deletePolicyMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('bonus_policies')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bonus-policies', currentCompanyId] });
      toast.success('Đã xóa chính sách thưởng');
    },
    onError: () => {
      toast.error('Lỗi khi xóa chính sách');
    },
  });

  // Toggle status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'active' | 'inactive' }) => {
      const { error } = await supabase
        .from('bonus_policies')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bonus-policies', currentCompanyId] });
      toast.success('Đã cập nhật trạng thái');
    },
    onError: () => {
      toast.error('Lỗi khi cập nhật trạng thái');
    },
  });

  // Add participant mutation
  const addParticipantMutation = useMutation({
    mutationFn: async (data: Omit<BonusPolicyParticipant, 'id' | 'created_at' | 'updated_at'>) => {
      if (!currentCompanyId) throw new Error('No company selected');

      const { data: result, error } = await supabase
        .from('bonus_policy_participants')
        .insert({
          company_id: currentCompanyId,
          ...data,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      toast.success('Đã thêm người tham gia');
    },
    onError: (error: any) => {
      if (error.code === '23505') {
        toast.error('Nhân viên đã tham gia chính sách này');
      } else {
        toast.error('Lỗi khi thêm người tham gia');
      }
    },
  });

  // Remove participant mutation
  const removeParticipantMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('bonus_policy_participants')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Đã xóa người tham gia');
    },
    onError: () => {
      toast.error('Lỗi khi xóa người tham gia');
    },
  });

  return {
    policies,
    isLoading,
    refetch,
    fetchParticipants,
    createPolicy: createPolicyMutation.mutateAsync,
    updatePolicy: updatePolicyMutation.mutateAsync,
    deletePolicy: deletePolicyMutation.mutateAsync,
    toggleStatus: toggleStatusMutation.mutateAsync,
    addParticipant: addParticipantMutation.mutateAsync,
    removeParticipant: removeParticipantMutation.mutateAsync,
    isCreating: createPolicyMutation.isPending,
    isUpdating: updatePolicyMutation.isPending,
    isDeleting: deletePolicyMutation.isPending,
  };
};
