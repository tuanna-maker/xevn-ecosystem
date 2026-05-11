import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface TaxPolicyParticipant {
  id: string;
  company_id: string;
  employee_id: string | null;
  employee_code: string;
  employee_name: string;
  position: string | null;
  department: string | null;
  policy_type: 'progressive' | 'flat';
  policy_name: string;
  flat_rate: number | null;
  effective_date: string;
  status: 'active' | 'inactive';
  dependents: number;
  personal_deduction: number;
  dependent_deduction: number;
  notes: string | null;
  created_by: string | null;
  created_by_position: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaxPolicyParticipantFormData {
  employee_id?: string;
  employee_code: string;
  employee_name: string;
  position?: string;
  department?: string;
  policy_type: 'progressive' | 'flat';
  policy_name: string;
  flat_rate?: number;
  effective_date: string;
  status?: 'active' | 'inactive';
  dependents?: number;
  personal_deduction?: number;
  dependent_deduction?: number;
  notes?: string;
  created_by?: string;
  created_by_position?: string;
}

export const useTaxPolicyParticipants = () => {
  const { currentCompanyId } = useAuth();
  const queryClient = useQueryClient();

  const { data: participants = [], isLoading, refetch } = useQuery({
    queryKey: ['tax-policy-participants', currentCompanyId],
    queryFn: async () => {
      if (!currentCompanyId) return [];

      const { data, error } = await supabase
        .from('tax_policy_participants')
        .select('*')
        .eq('company_id', currentCompanyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as TaxPolicyParticipant[];
    },
    enabled: !!currentCompanyId,
  });

  const createMutation = useMutation({
    mutationFn: async (formData: TaxPolicyParticipantFormData) => {
      if (!currentCompanyId) throw new Error('No company selected');

      const { data, error } = await supabase
        .from('tax_policy_participants')
        .insert({
          company_id: currentCompanyId,
          ...formData,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax-policy-participants', currentCompanyId] });
      toast.success('Đã thêm người tham gia chính sách thuế');
    },
    onError: () => {
      toast.error('Lỗi khi thêm người tham gia');
    },
  });

  const createManyMutation = useMutation({
    mutationFn: async (items: TaxPolicyParticipantFormData[]) => {
      if (!currentCompanyId) throw new Error('No company selected');

      const insertData = items.map(item => ({
        company_id: currentCompanyId,
        ...item,
      }));

      const { data, error } = await supabase
        .from('tax_policy_participants')
        .insert(insertData)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax-policy-participants', currentCompanyId] });
      toast.success('Đã thêm người tham gia chính sách thuế');
    },
    onError: () => {
      toast.error('Lỗi khi thêm người tham gia');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<TaxPolicyParticipantFormData> }) => {
      const { error } = await supabase
        .from('tax_policy_participants')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax-policy-participants', currentCompanyId] });
      toast.success('Đã cập nhật chính sách thuế');
    },
    onError: () => {
      toast.error('Lỗi khi cập nhật');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tax_policy_participants')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax-policy-participants', currentCompanyId] });
      toast.success('Đã xóa người tham gia');
    },
    onError: () => {
      toast.error('Lỗi khi xóa');
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async (id: string) => {
      const participant = participants.find(p => p.id === id);
      if (!participant) throw new Error('Participant not found');

      const newStatus = participant.status === 'active' ? 'inactive' : 'active';

      const { error } = await supabase
        .from('tax_policy_participants')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax-policy-participants', currentCompanyId] });
      toast.success('Đã cập nhật trạng thái');
    },
    onError: () => {
      toast.error('Lỗi khi cập nhật trạng thái');
    },
  });

  return {
    participants,
    isLoading,
    refetch,
    createParticipant: createMutation.mutateAsync,
    createManyParticipants: createManyMutation.mutateAsync,
    updateParticipant: updateMutation.mutateAsync,
    deleteParticipant: deleteMutation.mutateAsync,
    toggleStatus: toggleStatusMutation.mutateAsync,
    isCreating: createMutation.isPending || createManyMutation.isPending,
  };
};
