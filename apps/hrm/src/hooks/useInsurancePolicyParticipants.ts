import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface InsurancePolicyParticipant {
  id: string;
  company_id: string;
  employee_id: string | null;
  employee_code: string;
  employee_name: string;
  employee_avatar: string | null;
  position: string | null;
  department: string | null;
  insurance_type: 'social' | 'health' | 'unemployment' | 'all';
  social_insurance_number: string | null;
  health_insurance_number: string | null;
  unemployment_insurance_number: string | null;
  social_insurance_rate: number | null;
  health_insurance_rate: number | null;
  unemployment_insurance_rate: number | null;
  base_salary: number;
  effective_date: string | null;
  expiry_date: string | null;
  status: 'active' | 'inactive' | 'expired';
  notes: string | null;
  created_by: string | null;
  created_by_position: string | null;
  created_at: string;
  updated_at: string;
}

export interface InsurancePolicyFormData {
  employee_id?: string;
  employee_code: string;
  employee_name: string;
  employee_avatar?: string;
  position?: string;
  department?: string;
  insurance_type?: 'social' | 'health' | 'unemployment' | 'all';
  social_insurance_number?: string;
  health_insurance_number?: string;
  unemployment_insurance_number?: string;
  social_insurance_rate?: number;
  health_insurance_rate?: number;
  unemployment_insurance_rate?: number;
  base_salary: number;
  effective_date?: string;
  expiry_date?: string;
  status?: 'active' | 'inactive' | 'expired';
  notes?: string;
  created_by?: string;
  created_by_position?: string;
}

export const useInsurancePolicyParticipants = () => {
  const { currentCompanyId } = useAuth();
  const queryClient = useQueryClient();

  const { data: participants = [], isLoading, refetch } = useQuery({
    queryKey: ['insurance-policy-participants', currentCompanyId],
    queryFn: async () => {
      if (!currentCompanyId) return [];

      const { data, error } = await supabase
        .from('insurance')
        .select('*')
        .eq('company_id', currentCompanyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(item => ({
        ...item,
        insurance_type: item.insurance_type || 'all',
      })) as InsurancePolicyParticipant[];
    },
    enabled: !!currentCompanyId,
  });

  const createMutation = useMutation({
    mutationFn: async (formData: InsurancePolicyFormData) => {
      if (!currentCompanyId) throw new Error('No company selected');

      const { data, error } = await supabase
        .from('insurance')
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
      queryClient.invalidateQueries({ queryKey: ['insurance-policy-participants', currentCompanyId] });
      toast.success('Đã thêm người tham gia bảo hiểm');
    },
    onError: () => {
      toast.error('Lỗi khi thêm người tham gia');
    },
  });

  const createManyMutation = useMutation({
    mutationFn: async (items: InsurancePolicyFormData[]) => {
      if (!currentCompanyId) throw new Error('No company selected');

      const insertData = items.map(item => ({
        company_id: currentCompanyId,
        ...item,
      }));

      const { data, error } = await supabase
        .from('insurance')
        .insert(insertData)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insurance-policy-participants', currentCompanyId] });
      toast.success('Đã thêm người tham gia bảo hiểm');
    },
    onError: () => {
      toast.error('Lỗi khi thêm người tham gia');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsurancePolicyFormData> }) => {
      const { error } = await supabase
        .from('insurance')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insurance-policy-participants', currentCompanyId] });
      toast.success('Đã cập nhật bảo hiểm');
    },
    onError: () => {
      toast.error('Lỗi khi cập nhật');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('insurance')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insurance-policy-participants', currentCompanyId] });
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
        .from('insurance')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insurance-policy-participants', currentCompanyId] });
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
