import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';

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

export const useAdvanceRequests = () => {
  const { currentCompanyId } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all advance requests
  const { data: requests = [], isLoading, refetch } = useQuery({
    queryKey: ['advance-requests', currentCompanyId],
    queryFn: async () => {
      if (!currentCompanyId) return [];

      const { data, error } = await supabase
        .from('advance_requests')
        .select('*')
        .eq('company_id', currentCompanyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(item => ({
        ...item,
        approval_steps: item.approval_steps as unknown as ApprovalStep[] | null,
      })) as AdvanceRequest[];
    },
    enabled: !!currentCompanyId,
  });

  // Fetch employees for a request
  const fetchRequestEmployees = async (requestId: string): Promise<AdvanceRequestEmployee[]> => {
    const { data, error } = await supabase
      .from('advance_request_employees')
      .select('*')
      .eq('request_id', requestId)
      .order('employee_name', { ascending: true });

    if (error) throw error;
    return data as AdvanceRequestEmployee[];
  };

  // Create request mutation
  const createRequestMutation = useMutation({
    mutationFn: async (formData: AdvanceRequestFormData) => {
      if (!currentCompanyId) throw new Error('No company selected');

      const insertData = {
        company_id: currentCompanyId,
        name: formData.name,
        salary_period: formData.salary_period,
        department: formData.department,
        position: formData.position,
        approval_steps: formData.approval_steps as unknown as Json,
      };

      const { data, error } = await supabase
        .from('advance_requests')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advance-requests', currentCompanyId] });
      toast.success('Đã tạo bảng tạm ứng');
    },
    onError: () => {
      toast.error('Lỗi khi tạo bảng tạm ứng');
    },
  });

  // Update request mutation
  const updateRequestMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<AdvanceRequest> }) => {
      const updateData: Record<string, unknown> = { ...data };
      if (data.approval_steps) {
        updateData.approval_steps = data.approval_steps as unknown as Json;
      }

      const { error } = await supabase
        .from('advance_requests')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advance-requests', currentCompanyId] });
      toast.success('Đã cập nhật bảng tạm ứng');
    },
    onError: () => {
      toast.error('Lỗi khi cập nhật bảng tạm ứng');
    },
  });

  // Delete request mutation
  const deleteRequestMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('advance_requests')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advance-requests', currentCompanyId] });
      toast.success('Đã xóa bảng tạm ứng');
    },
    onError: () => {
      toast.error('Lỗi khi xóa bảng tạm ứng');
    },
  });

  // Approve/Reject mutation
  const updateApprovalMutation = useMutation({
    mutationFn: async ({ 
      id, 
      level, 
      action, 
      approverName, 
      note 
    }: { 
      id: string; 
      level: number; 
      action: 'approve' | 'reject';
      approverName: string;
      note?: string;
    }) => {
      const request = requests.find(r => r.id === id);
      if (!request) throw new Error('Request not found');

      const steps = request.approval_steps || [];
      const updatedSteps = steps.map((step: ApprovalStep) => {
        if (step.level === level) {
          return {
            ...step,
            status: action === 'approve' ? 'approved' as const : 'rejected' as const,
            approverName,
            approvedAt: new Date().toISOString(),
            note: note || '',
          };
        }
        return step;
      });

      const allApproved = updatedSteps.every((s) => s.status === 'approved');
      const anyRejected = updatedSteps.some((s) => s.status === 'rejected');

      const { error } = await supabase
        .from('advance_requests')
        .update({
          approval_steps: updatedSteps as unknown as Json,
          current_approval_level: level + 1,
          status: anyRejected ? 'rejected' : allApproved ? 'approved' : 'pending',
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advance-requests', currentCompanyId] });
      toast.success('Đã cập nhật trạng thái phê duyệt');
    },
    onError: () => {
      toast.error('Lỗi khi cập nhật trạng thái');
    },
  });

  // Add employee to request
  const addEmployeeMutation = useMutation({
    mutationFn: async (data: Omit<AdvanceRequestEmployee, 'id' | 'created_at' | 'updated_at'>) => {
      if (!currentCompanyId) throw new Error('No company selected');

      const { data: result, error } = await supabase
        .from('advance_request_employees')
        .insert({
          company_id: currentCompanyId,
          ...data,
        })
        .select()
        .single();

      if (error) throw error;

      // Update employee count and total amount
      const employees = await fetchRequestEmployees(data.request_id);
      const totalAmount = employees.reduce((sum, e) => sum + Number(e.advance_amount), 0);
      
      await supabase
        .from('advance_requests')
        .update({ 
          employee_count: employees.length,
          total_amount: totalAmount,
        })
        .eq('id', data.request_id);

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advance-requests', currentCompanyId] });
      toast.success('Đã thêm nhân viên');
    },
    onError: () => {
      toast.error('Lỗi khi thêm nhân viên');
    },
  });

  // Remove employee from request
  const removeEmployeeMutation = useMutation({
    mutationFn: async ({ id, requestId }: { id: string; requestId: string }) => {
      const { error } = await supabase
        .from('advance_request_employees')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update employee count and total amount
      const employees = await fetchRequestEmployees(requestId);
      const totalAmount = employees.reduce((sum, e) => sum + Number(e.advance_amount), 0);
      
      await supabase
        .from('advance_requests')
        .update({ 
          employee_count: employees.length,
          total_amount: totalAmount,
        })
        .eq('id', requestId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advance-requests', currentCompanyId] });
      toast.success('Đã xóa nhân viên');
    },
    onError: () => {
      toast.error('Lỗi khi xóa nhân viên');
    },
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
    addEmployee: addEmployeeMutation.mutateAsync,
    removeEmployee: removeEmployeeMutation.mutateAsync,
    isCreating: createRequestMutation.isPending,
  };
};
