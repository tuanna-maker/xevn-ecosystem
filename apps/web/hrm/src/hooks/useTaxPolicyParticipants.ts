import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/contexts/AuthContext';

import { toast } from 'sonner';

import { toErrorMessage } from '@/lib/apiError';

import {

  createTaxPolicyParticipant,

  deleteTaxPolicyParticipant,

  listTaxPolicyParticipants,

  updateTaxPolicyParticipant,

} from '@/integrations/hrmApi';



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



function mapParticipant(row: Record<string, unknown>): TaxPolicyParticipant {

  return {

    id: String(row.id),

    company_id: String(row.company_id),

    employee_id: row.employee_id ? String(row.employee_id) : null,

    employee_code: String(row.employee_code ?? ''),

    employee_name: String(row.employee_name ?? ''),

    position: row.position ? String(row.position) : null,

    department: row.department ? String(row.department) : null,

    policy_type: (row.policy_type as TaxPolicyParticipant['policy_type']) ?? 'progressive',

    policy_name: String(row.policy_name ?? ''),

    flat_rate: row.flat_rate != null ? Number(row.flat_rate) : null,

    effective_date: String(row.effective_date ?? ''),

    status: (row.status as TaxPolicyParticipant['status']) ?? 'active',

    dependents: Number(row.dependent_count ?? row.dependents ?? 0),

    personal_deduction: Number(row.personal_deduction ?? 0),

    dependent_deduction: Number(row.dependent_deduction ?? 0),

    notes: row.notes ? String(row.notes) : null,

    created_by: row.created_by ? String(row.created_by) : null,

    created_by_position: row.created_by_position ? String(row.created_by_position) : null,

    created_at: String(row.created_at ?? ''),

    updated_at: String(row.updated_at ?? ''),

  };

}



export const useTaxPolicyParticipants = () => {

  const { currentCompanyId } = useAuth();

  const queryClient = useQueryClient();



  const { data: participants = [], isLoading, refetch } = useQuery({

    queryKey: ['tax-policy-participants', currentCompanyId],

    queryFn: async () => {

      if (!currentCompanyId) return [];

      const response = await listTaxPolicyParticipants(currentCompanyId);

      return (response.data ?? []).map(mapParticipant);

    },

    enabled: !!currentCompanyId,

  });



  const createMutation = useMutation({

    mutationFn: async (payload: TaxPolicyParticipantFormData) => {

      if (!currentCompanyId) throw new Error('Missing company scope');

      return createTaxPolicyParticipant({

        company_id: currentCompanyId,

        ...payload,

        dependent_count: payload.dependents,

      });

    },

    onSuccess: () => {

      queryClient.invalidateQueries({ queryKey: ['tax-policy-participants', currentCompanyId] });

      toast.success('Đã thêm người tham gia chính sách thuế');

    },

    onError: (error: unknown) => toast.error(toErrorMessage(error, 'Lỗi khi thêm')),

  });



  const createManyMutation = useMutation({

    mutationFn: async (payloads: TaxPolicyParticipantFormData[]) => {

      if (!currentCompanyId) throw new Error('Missing company scope');

      for (const payload of payloads) {

        await createTaxPolicyParticipant({

          company_id: currentCompanyId,

          ...payload,

          dependent_count: payload.dependents,

        });

      }

    },

    onSuccess: () => {

      queryClient.invalidateQueries({ queryKey: ['tax-policy-participants', currentCompanyId] });

      toast.success('Đã thêm người tham gia chính sách thuế');

    },

    onError: (error: unknown) => toast.error(toErrorMessage(error, 'Lỗi khi thêm hàng loạt')),

  });



  const updateMutation = useMutation({

    mutationFn: async ({ id, data }: { id: string; data: Partial<TaxPolicyParticipantFormData> }) => {

      if (!currentCompanyId) throw new Error('Missing company scope');

      return updateTaxPolicyParticipant(id, currentCompanyId, {

        ...data,

        dependent_count: data.dependents,

      });

    },

    onSuccess: () => {

      queryClient.invalidateQueries({ queryKey: ['tax-policy-participants', currentCompanyId] });

      toast.success('Đã cập nhật chính sách thuế');

    },

    onError: (error: unknown) => toast.error(toErrorMessage(error, 'Lỗi khi cập nhật')),

  });



  const deleteMutation = useMutation({

    mutationFn: async (id: string) => {

      if (!currentCompanyId) throw new Error('Missing company scope');

      return deleteTaxPolicyParticipant(id, currentCompanyId);

    },

    onSuccess: () => {

      queryClient.invalidateQueries({ queryKey: ['tax-policy-participants', currentCompanyId] });

      toast.success('Đã xóa người tham gia');

    },

    onError: (error: unknown) => toast.error(toErrorMessage(error, 'Lỗi khi xóa')),

  });



  const toggleStatusMutation = useMutation({

    mutationFn: async ({ id, status }: { id: string; status: TaxPolicyParticipant['status'] }) => {

      if (!currentCompanyId) throw new Error('Missing company scope');

      return updateTaxPolicyParticipant(id, currentCompanyId, { status });

    },

    onSuccess: () => {

      queryClient.invalidateQueries({ queryKey: ['tax-policy-participants', currentCompanyId] });

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

    updateParticipant: (id: string, data: Partial<TaxPolicyParticipantFormData>) =>

      updateMutation.mutateAsync({ id, data }),

    deleteParticipant: deleteMutation.mutateAsync,

    toggleStatus: (id: string, status: TaxPolicyParticipant['status']) =>

      toggleStatusMutation.mutateAsync({ id, status }),

    isCreating: createMutation.isPending || createManyMutation.isPending,

  };

};


