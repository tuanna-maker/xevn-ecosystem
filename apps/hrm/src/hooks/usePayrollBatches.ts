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

export interface PayrollBatch {
  id: string;
  company_id: string;
  name: string;
  salary_period: string;
  period_month: number;
  period_year: number;
  department: string | null;
  position: string | null;
  template_id: string | null;
  employee_count: number;
  total_gross: number;
  total_deduction: number;
  total_net: number;
  status: 'draft' | 'pending' | 'approved' | 'locked' | 'paid';
  current_approval_level: number;
  approval_steps: ApprovalStep[] | null;
  locked_at: string | null;
  locked_by: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PayrollRecord {
  id: string;
  company_id: string;
  batch_id: string;
  employee_id: string | null;
  employee_code: string;
  employee_name: string;
  department: string | null;
  position: string | null;
  base_salary: number;
  allowances: number;
  bonus: number;
  overtime: number;
  insurance_deduction: number;
  tax_deduction: number;
  other_deduction: number;
  gross_salary: number;
  net_salary: number;
  work_days: number;
  actual_work_days: number;
  overtime_hours: number;
  late_days: number;
  leave_days: number;
  component_values: Record<string, number> | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PayrollBatchFormData {
  name: string;
  salary_period: string;
  period_month: number;
  period_year: number;
  department?: string;
  position?: string;
  template_id?: string;
  approval_steps?: ApprovalStep[];
}

export const usePayrollBatches = (options?: { periodMonth?: number; periodYear?: number }) => {
  const { currentCompanyId } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all payroll batches
  const { data: batches = [], isLoading, refetch } = useQuery({
    queryKey: ['payroll-batches', currentCompanyId, options?.periodMonth, options?.periodYear],
    queryFn: async () => {
      if (!currentCompanyId) return [];

      let query = supabase
        .from('payroll_batches')
        .select('*')
        .eq('company_id', currentCompanyId)
        .order('created_at', { ascending: false });

      if (options?.periodMonth && options?.periodYear) {
        query = query
          .eq('period_month', options.periodMonth)
          .eq('period_year', options.periodYear);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      return (data || []).map(item => ({
        ...item,
        approval_steps: item.approval_steps as unknown as ApprovalStep[] | null,
      })) as PayrollBatch[];
    },
    enabled: !!currentCompanyId,
  });

  // Fetch records for a batch
  const fetchBatchRecords = async (batchId: string): Promise<PayrollRecord[]> => {
    const { data, error } = await supabase
      .from('payroll_records')
      .select('*')
      .eq('batch_id', batchId)
      .order('employee_name', { ascending: true });

    if (error) throw error;
    return (data || []).map(item => ({
      ...item,
      component_values: item.component_values as Record<string, number> | null,
    })) as PayrollRecord[];
  };

  // Create batch mutation
  const createBatchMutation = useMutation({
    mutationFn: async (formData: PayrollBatchFormData) => {
      if (!currentCompanyId) throw new Error('No company selected');

      const insertData = {
        company_id: currentCompanyId,
        name: formData.name,
        salary_period: formData.salary_period,
        period_month: formData.period_month,
        period_year: formData.period_year,
        department: formData.department,
        position: formData.position,
        template_id: formData.template_id,
        approval_steps: formData.approval_steps as unknown as Json,
      };

      const { data, error } = await supabase
        .from('payroll_batches')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-batches', currentCompanyId] });
      toast.success('Đã tạo bảng lương');
    },
    onError: () => {
      toast.error('Lỗi khi tạo bảng lương');
    },
  });

  // Update batch mutation
  const updateBatchMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<PayrollBatch> }) => {
      const updateData: Record<string, unknown> = { ...data };
      if (data.approval_steps) {
        updateData.approval_steps = data.approval_steps as unknown as Json;
      }

      const { error } = await supabase
        .from('payroll_batches')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-batches', currentCompanyId] });
      toast.success('Đã cập nhật bảng lương');
    },
    onError: () => {
      toast.error('Lỗi khi cập nhật bảng lương');
    },
  });

  // Delete batch mutation
  const deleteBatchMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('payroll_batches')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-batches', currentCompanyId] });
      toast.success('Đã xóa bảng lương');
    },
    onError: () => {
      toast.error('Lỗi khi xóa bảng lương');
    },
  });

  // Lock batch mutation
  const lockBatchMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('payroll_batches')
        .update({
          status: 'locked',
          locked_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-batches', currentCompanyId] });
      toast.success('Đã khóa bảng lương');
    },
    onError: () => {
      toast.error('Lỗi khi khóa bảng lương');
    },
  });

  // Add record to batch
  const addRecordMutation = useMutation({
    mutationFn: async (data: Omit<PayrollRecord, 'id' | 'created_at' | 'updated_at'>) => {
      if (!currentCompanyId) throw new Error('No company selected');

      const { data: result, error } = await supabase
        .from('payroll_records')
        .insert({
          company_id: currentCompanyId,
          ...data,
        })
        .select()
        .single();

      if (error) throw error;

      // Update batch totals
      await updateBatchTotals(data.batch_id);

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-batches', currentCompanyId] });
      toast.success('Đã thêm nhân viên vào bảng lương');
    },
    onError: () => {
      toast.error('Lỗi khi thêm nhân viên');
    },
  });

  // Update record
  const updateRecordMutation = useMutation({
    mutationFn: async ({ id, batchId, data }: { id: string; batchId: string; data: Partial<PayrollRecord> }) => {
      const { error } = await supabase
        .from('payroll_records')
        .update(data)
        .eq('id', id);

      if (error) throw error;

      // Update batch totals
      await updateBatchTotals(batchId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-batches', currentCompanyId] });
      toast.success('Đã cập nhật bản ghi lương');
    },
    onError: () => {
      toast.error('Lỗi khi cập nhật bản ghi');
    },
  });

  // Delete record
  const deleteRecordMutation = useMutation({
    mutationFn: async ({ id, batchId }: { id: string; batchId: string }) => {
      const { error } = await supabase
        .from('payroll_records')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update batch totals
      await updateBatchTotals(batchId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-batches', currentCompanyId] });
      toast.success('Đã xóa bản ghi lương');
    },
    onError: () => {
      toast.error('Lỗi khi xóa bản ghi');
    },
  });

  // Helper function to update batch totals
  const updateBatchTotals = async (batchId: string) => {
    const records = await fetchBatchRecords(batchId);
    const totalGross = records.reduce((sum, r) => sum + Number(r.gross_salary), 0);
    const totalDeduction = records.reduce((sum, r) => 
      sum + Number(r.insurance_deduction) + Number(r.tax_deduction) + Number(r.other_deduction), 0
    );
    const totalNet = records.reduce((sum, r) => sum + Number(r.net_salary), 0);

    await supabase
      .from('payroll_batches')
      .update({
        employee_count: records.length,
        total_gross: totalGross,
        total_deduction: totalDeduction,
        total_net: totalNet,
      })
      .eq('id', batchId);
  };

  return {
    batches,
    isLoading,
    refetch,
    fetchBatchRecords,
    createBatch: createBatchMutation.mutateAsync,
    updateBatch: updateBatchMutation.mutateAsync,
    deleteBatch: deleteBatchMutation.mutateAsync,
    lockBatch: lockBatchMutation.mutateAsync,
    addRecord: addRecordMutation.mutateAsync,
    updateRecord: updateRecordMutation.mutateAsync,
    deleteRecord: deleteRecordMutation.mutateAsync,
    isCreating: createBatchMutation.isPending,
  };
};
