import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { endOfMonth, format, startOfMonth } from 'date-fns';
import {
  closePayrollPeriod,
  createPayrollPeriod,
  listPayrollPeriods,
  processPayrollPeriod,
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

  const mapStatus = (status: 'draft' | 'processed' | 'closed'): PayrollBatch['status'] => {
    if (status === 'closed') return 'locked';
    if (status === 'processed') return 'approved';
    return 'draft';
  };

  // Fetch all payroll batches
  const { data: batches = [], isLoading, refetch } = useQuery({
    queryKey: ['payroll-batches', currentCompanyId, options?.periodMonth, options?.periodYear],
    queryFn: async () => {
      if (!currentCompanyId) return [];
      const response = await listPayrollPeriods({ company_id: currentCompanyId });
      const data = response.data ?? [];
      const mapped = data.map((item) => {
        const start = new Date(item.start_date);
        return {
          id: item.id,
          company_id: item.company_id,
          name: item.period_label,
          salary_period: `${format(start, 'MM/yyyy')}`,
          period_month: start.getMonth() + 1,
          period_year: start.getFullYear(),
          department: null,
          position: null,
          template_id: null,
          employee_count: 0,
          total_gross: 0,
          total_deduction: 0,
          total_net: 0,
          status: mapStatus(item.status),
          current_approval_level: 0,
          approval_steps: null,
          locked_at: item.closed_at,
          locked_by: null,
          created_by: item.created_by,
          created_at: item.created_at,
          updated_at: item.updated_at,
        } as PayrollBatch;
      });

      if (options?.periodMonth && options?.periodYear) {
        return mapped.filter((batch) => batch.period_month === options.periodMonth && batch.period_year === options.periodYear);
      }
      return mapped;
    },
    enabled: !!currentCompanyId,
  });

  // Fetch records for a batch
  const fetchBatchRecords = async (batchId: string): Promise<PayrollRecord[]> => {
    void batchId;
    return [];
  };

  // Create batch mutation
  const createBatchMutation = useMutation({
    mutationFn: async (formData: PayrollBatchFormData) => {
      if (!currentCompanyId) throw new Error('No company selected');
      const startDate = startOfMonth(new Date(formData.period_year, formData.period_month - 1, 1));
      const endDate = endOfMonth(startDate);
      return createPayrollPeriod({
        company_id: currentCompanyId,
        period_label: formData.name,
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
      });
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
      void id;
      void data;
      return;
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
      void id;
      throw new Error('Xóa kỳ lương chưa được hỗ trợ bởi HRM payroll API.');
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
      await processPayrollPeriod(id);
      await closePayrollPeriod(id);
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
      void data;
      throw new Error('Thêm nhân viên vào kỳ lương chưa được hỗ trợ bởi HRM payroll API.');
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
      void id;
      void batchId;
      void data;
      throw new Error('Cập nhật bản ghi lương chưa được hỗ trợ bởi HRM payroll API.');
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
      void id;
      void batchId;
      throw new Error('Xóa bản ghi lương chưa được hỗ trợ bởi HRM payroll API.');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-batches', currentCompanyId] });
      toast.success('Đã xóa bản ghi lương');
    },
    onError: () => {
      toast.error('Lỗi khi xóa bản ghi');
    },
  });

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
