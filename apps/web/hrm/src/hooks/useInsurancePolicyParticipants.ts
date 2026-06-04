import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/contexts/AuthContext';

import { toast } from 'sonner';

import { toErrorMessage } from '@/lib/apiError';

import {

  createInsurancePolicyParticipant,

  deleteInsurancePolicyParticipant,

  listInsurancePolicyParticipants,

  updateInsurancePolicyParticipant,

} from '@/integrations/hrmApi';



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



function mapParticipant(row: Record<string, unknown>): InsurancePolicyParticipant {

  return {

    id: String(row.id),

    company_id: String(row.company_id),

    employee_id: row.employee_id ? String(row.employee_id) : null,

    employee_code: String(row.employee_code ?? ''),

    employee_name: String(row.employee_name ?? ''),

    employee_avatar: row.employee_avatar ? String(row.employee_avatar) : null,

    position: row.position ? String(row.position) : null,

    department: row.department ? String(row.department) : null,

    insurance_type: (row.insurance_type as InsurancePolicyParticipant['insurance_type']) ?? 'all',

    social_insurance_number: row.social_insurance_number ? String(row.social_insurance_number) : null,

    health_insurance_number: row.health_insurance_number ? String(row.health_insurance_number) : null,

    unemployment_insurance_number: row.unemployment_insurance_number

      ? String(row.unemployment_insurance_number)

      : null,

    social_insurance_rate: row.social_insurance_rate != null ? Number(row.social_insurance_rate) : null,

    health_insurance_rate: row.health_insurance_rate != null ? Number(row.health_insurance_rate) : null,

    unemployment_insurance_rate:

      row.unemployment_insurance_rate != null ? Number(row.unemployment_insurance_rate) : null,

    base_salary: Number(row.base_salary ?? 0),

    effective_date: row.effective_date ? String(row.effective_date) : null,

    expiry_date: row.expiry_date ? String(row.expiry_date) : null,

    status: (row.status as InsurancePolicyParticipant['status']) ?? 'active',

    notes: row.notes ? String(row.notes) : null,

    created_by: row.created_by ? String(row.created_by) : null,

    created_by_position: row.created_by_position ? String(row.created_by_position) : null,

    created_at: String(row.created_at ?? ''),

    updated_at: String(row.updated_at ?? ''),

  };

}



export const useInsurancePolicyParticipants = () => {

  const { currentCompanyId } = useAuth();

  const queryClient = useQueryClient();



  const { data: participants = [], isLoading, refetch } = useQuery({

    queryKey: ['insurance-policy-participants', currentCompanyId],

    queryFn: async () => {

      if (!currentCompanyId) return [];

      const response = await listInsurancePolicyParticipants(currentCompanyId);

      return (response.data ?? []).map(mapParticipant);

    },

    enabled: !!currentCompanyId,

  });



  const createMutation = useMutation({

    mutationFn: async (payload: InsurancePolicyFormData) => {

      if (!currentCompanyId) throw new Error('Missing company scope');

      return createInsurancePolicyParticipant({

        company_id: currentCompanyId,

        ...payload,

        effective_date: payload.effective_date?.slice(0, 10),

        expiry_date: payload.expiry_date?.slice(0, 10),

      });

    },

    onSuccess: () => {

      queryClient.invalidateQueries({ queryKey: ['insurance-policy-participants', currentCompanyId] });

      queryClient.invalidateQueries({ queryKey: ['insurance'] });

      toast.success('Đã thêm người tham gia bảo hiểm');

    },

    onError: (error: unknown) => toast.error(toErrorMessage(error, 'Lỗi khi thêm')),

  });



  const createManyMutation = useMutation({

    mutationFn: async (payloads: InsurancePolicyFormData[]) => {

      if (!currentCompanyId) throw new Error('Missing company scope');

      for (const payload of payloads) {

        await createInsurancePolicyParticipant({ company_id: currentCompanyId, ...payload });

      }

    },

    onSuccess: () => {

      queryClient.invalidateQueries({ queryKey: ['insurance-policy-participants', currentCompanyId] });

      toast.success('Đã thêm người tham gia bảo hiểm');

    },

    onError: (error: unknown) => toast.error(toErrorMessage(error, 'Lỗi khi thêm hàng loạt')),

  });



  const updateMutation = useMutation({

    mutationFn: async ({ id, data }: { id: string; data: Partial<InsurancePolicyFormData> }) => {

      if (!currentCompanyId) throw new Error('Missing company scope');

      return updateInsurancePolicyParticipant(id, currentCompanyId, data);

    },

    onSuccess: () => {

      queryClient.invalidateQueries({ queryKey: ['insurance-policy-participants', currentCompanyId] });

      toast.success('Đã cập nhật bảo hiểm');

    },

    onError: (error: unknown) => toast.error(toErrorMessage(error, 'Lỗi khi cập nhật')),

  });



  const deleteMutation = useMutation({

    mutationFn: async (id: string) => {

      if (!currentCompanyId) throw new Error('Missing company scope');

      return deleteInsurancePolicyParticipant(id, currentCompanyId);

    },

    onSuccess: () => {

      queryClient.invalidateQueries({ queryKey: ['insurance-policy-participants', currentCompanyId] });

      toast.success('Đã xóa người tham gia');

    },

    onError: (error: unknown) => toast.error(toErrorMessage(error, 'Lỗi khi xóa')),

  });



  const toggleStatusMutation = useMutation({

    mutationFn: async ({ id, status }: { id: string; status: InsurancePolicyParticipant['status'] }) => {

      if (!currentCompanyId) throw new Error('Missing company scope');

      return updateInsurancePolicyParticipant(id, currentCompanyId, { status });

    },

    onSuccess: () => {

      queryClient.invalidateQueries({ queryKey: ['insurance-policy-participants', currentCompanyId] });

      toast.success('Đã cập nhật trạng thái');

    },

    onError: (error: unknown) => toast.error(toErrorMessage(error, 'Lỗi khi đổi trạng thái')),

  });



  return {

    participants,

    isLoading,

    refetch,

    createParticipant: createMutation.mutateAsync,

    createManyParticipants: createManyMutation.mutateAsync,

    updateParticipant: (id: string, data: Partial<InsurancePolicyFormData>) =>

      updateMutation.mutateAsync({ id, data }),

    deleteParticipant: deleteMutation.mutateAsync,

    toggleStatus: (id: string, status: InsurancePolicyParticipant['status']) =>

      toggleStatusMutation.mutateAsync({ id, status }),

    isCreating: createMutation.isPending || createManyMutation.isPending,

  };

};


