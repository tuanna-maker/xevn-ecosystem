import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/contexts/AuthContext';

import { toast } from 'sonner';

import { toErrorMessage } from '@/lib/apiError';

import {

  approveAdvanceRequest,

  createAdvanceRequest,

  createAdvanceRequestEmployee,

  listAdvanceRequestEmployees,

  listAdvanceRequests,

  markAdvanceRequestPaid,

  rejectAdvanceRequest,

} from '@/integrations/hrmApi';



export interface ApprovalStep {

  level: number;

  title: string;

  approverName: string;

  approverPosition: string;

  status: 'pending' | 'approved' | 'rejected';

  approvedAt?: string;

  note?: string;

}



export interface AdvanceRequest {

  id: string;

  company_id: string;

  name: string;

  salary_period: string;

  department: string | null;

  position: string | null;

  employee_count: number;

  total_amount: number;

  status: 'pending' | 'approved' | 'paid' | 'rejected';

  current_approval_level: number;

  approval_steps: ApprovalStep[] | null;

  created_by: string | null;

  created_at: string;

  updated_at: string;

}



export interface AdvanceRequestEmployee {

  id: string;

  company_id: string;

  request_id: string;

  employee_id: string | null;

  employee_code: string;

  employee_name: string;

  department: string | null;

  position: string | null;

  advance_amount: number;

  note: string | null;

  created_at: string;

  updated_at: string;

}



export interface AdvanceRequestFormData {

  name: string;

  salary_period: string;

  department?: string;

  position?: string;

  approval_steps?: ApprovalStep[];

}



function mapAdvanceRequest(row: {

  id: string;

  company_id: string;

  name: string;

  salary_period: string;

  department: string | null;

  position: string | null;

  employee_count: number | string;

  total_amount: number | string;

  status: string;

  current_approval_level: number | string;

  approval_steps: unknown;

  created_by: string | null;

  created_at: string;

  updated_at: string;

}): AdvanceRequest {

  const steps = row.approval_steps;

  return {

    ...row,

    employee_count: Number(row.employee_count) || 0,

    total_amount: Number(row.total_amount) || 0,

    current_approval_level: Number(row.current_approval_level) || 1,

    status: row.status as AdvanceRequest['status'],

    approval_steps: Array.isArray(steps) ? (steps as ApprovalStep[]) : null,

  };

}



function mapAdvanceEmployee(row: {

  id: string;

  company_id: string;

  request_id: string;

  employee_id: string | null;

  employee_code: string;

  employee_name: string;

  department: string | null;

  position: string | null;

  advance_amount: number | string;

  note: string | null;

  created_at: string;

  updated_at: string;

}): AdvanceRequestEmployee {

  return {

    ...row,

    advance_amount: Number(row.advance_amount) || 0,

  };

}



export const useAdvanceRequests = () => {

  const { currentCompanyId } = useAuth();

  const queryClient = useQueryClient();



  const { data: requests = [], isLoading, refetch } = useQuery({

    queryKey: ['advance-requests', currentCompanyId],

    queryFn: async () => {

      if (!currentCompanyId) return [];

      const result = await listAdvanceRequests({ company_id: currentCompanyId });

      return (result.data || []).map(mapAdvanceRequest);

    },

    enabled: !!currentCompanyId,

  });



  const fetchRequestEmployees = async (requestId: string): Promise<AdvanceRequestEmployee[]> => {

    if (!currentCompanyId) return [];

    const result = await listAdvanceRequestEmployees(requestId, currentCompanyId);

    return (result.data || []).map(mapAdvanceEmployee);

  };



  const createRequestMutation = useMutation({

    mutationFn: async (formData: AdvanceRequestFormData) => {

      if (!currentCompanyId) throw new Error('No company selected');

      const created = await createAdvanceRequest({

        company_id: currentCompanyId,

        name: formData.name,

        salary_period: formData.salary_period,

        department: formData.department,

        position: formData.position,

        approval_steps: formData.approval_steps,

      });

      return mapAdvanceRequest(created);

    },

    onSuccess: () => {

      queryClient.invalidateQueries({ queryKey: ['advance-requests', currentCompanyId] });

      toast.success('Đã tạo bảng tạm ứng');

    },

    onError: () => {

      toast.error('Lỗi khi tạo bảng tạm ứng');

    },

  });



  const updateRequestMutation = useMutation({

    mutationFn: async () => {
      throw new Error('API cập nhật bảng tạm ứng chưa có trên Nest');
    },

    onSuccess: () => {

      queryClient.invalidateQueries({ queryKey: ['advance-requests', currentCompanyId] });

      toast.success('Đã cập nhật');

    },

    onError: (error: unknown) => toast.error(toErrorMessage(error, 'Lỗi khi cập nhật')),

  });



  const deleteRequestMutation = useMutation({

    mutationFn: async (_id: string) => {
      throw new Error('API xóa bảng tạm ứng chưa có trên Nest');
    },

    onSuccess: () => {

      queryClient.invalidateQueries({ queryKey: ['advance-requests', currentCompanyId] });

      toast.success('Đã xóa');

    },

    onError: (error: unknown) => toast.error(toErrorMessage(error, 'Lỗi khi xóa')),

  });



  const updateApprovalMutation = useMutation({

    mutationFn: async (payload: {

      id: string;

      level: number;

      action: 'approve' | 'reject';

      approverName: string;

      note?: string;

    }) => {

      const body = {

        reviewer_name: payload.approverName,

        ...(payload.action === 'reject' && payload.note

          ? { rejected_reason: payload.note }

          : {}),

      };

      const updated =

        payload.action === 'approve'

          ? await approveAdvanceRequest(payload.id, body)

          : await rejectAdvanceRequest(payload.id, body);

      return mapAdvanceRequest(updated);

    },

    onSuccess: (_data, variables) => {

      queryClient.invalidateQueries({ queryKey: ['advance-requests', currentCompanyId] });

      toast.success(

        variables.action === 'approve' ? 'Đã phê duyệt bảng tạm ứng' : 'Đã từ chối bảng tạm ứng',

      );

    },

    onError: (_error, variables) =>

      toast.error(variables.action === 'approve' ? 'Lỗi khi phê duyệt' : 'Lỗi khi từ chối'),

  });



  const markPaidMutation = useMutation({

    mutationFn: async (payload: { id: string; approverName: string; note?: string }) => {

      const updated = await markAdvanceRequestPaid(payload.id, {

        reviewer_name: payload.approverName,

      });

      return mapAdvanceRequest(updated);

    },

    onSuccess: () => {

      queryClient.invalidateQueries({ queryKey: ['advance-requests', currentCompanyId] });

      toast.success('Đã đánh dấu chi trả');

    },

    onError: () => toast.error('Lỗi khi đánh dấu chi trả'),

  });



  const addEmployeeMutation = useMutation({

    mutationFn: async (payload: {
      request_id: string;
      company_id?: string;
      employee_id?: string | null;
      employee_code: string;
      employee_name: string;
      department?: string | null;
      position?: string | null;
      advance_amount: number | string;
      note?: string | null;
    }) => {
      if (!currentCompanyId) throw new Error('No company selected');
      const companyId = payload.company_id?.trim() || currentCompanyId;
      const created = await createAdvanceRequestEmployee(payload.request_id, companyId, {
        employee_id: payload.employee_id,
        employee_code: payload.employee_code,
        employee_name: payload.employee_name,
        department: payload.department,
        position: payload.position,
        advance_amount: payload.advance_amount,
        note: payload.note,
      });
      return mapAdvanceEmployee(created);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advance-requests', currentCompanyId] });
      toast.success('Đã thêm nhân viên');
    },

    onError: (error: unknown) => toast.error(toErrorMessage(error, 'Lỗi khi thêm nhân viên')),

  });



  const removeEmployeeMutation = useMutation({

    mutationFn: async (_payload: { id: string; requestId: string }) => {
      throw new Error('API xóa NV khỏi bảng tạm ứng chưa có trên Nest');
    },

    onSuccess: () => toast.success('Đã xóa nhân viên'),

    onError: (error: unknown) => toast.error(toErrorMessage(error, 'Lỗi khi xóa nhân viên')),

  });



  return {

    requests,

    isLoading,

    refetch,

    fetchRequestEmployees,

    createRequest: createRequestMutation.mutateAsync,

    updateRequest: updateRequestMutation.mutateAsync,

    deleteRequest: deleteRequestMutation.mutateAsync,

    updateApproval: updateApprovalMutation.mutateAsync,

    markPaid: markPaidMutation.mutateAsync,

    addEmployee: addEmployeeMutation.mutateAsync,

    removeEmployee: removeEmployeeMutation.mutateAsync,

    isCreating: createRequestMutation.isPending,

  };

};


