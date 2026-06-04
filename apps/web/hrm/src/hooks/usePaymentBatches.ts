import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { toErrorMessage } from '@/lib/apiError';
import {
  addPaymentBatchRecord,
  createPaymentBatch,
  deletePaymentBatch,
  listPaymentBatchRecords,
  listPaymentBatches,
  processPaymentBatch,
  processPaymentBatchRecord,
  updatePaymentBatch,
} from '@/integrations/hrmApi';

export interface PaymentBatch {
  id: string;
  company_id: string;
  payroll_batch_id: string | null;
  name: string;
  salary_period: string;
  department: string | null;
  position: string | null;
  payment_method: 'bank_transfer' | 'cash' | 'check';
  bank_name: string | null;
  employee_count: number;
  total_amount: number;
  paid_count: number;
  paid_amount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  payment_date: string | null;
  processed_by: string | null;
  processed_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentRecord {
  id: string;
  company_id: string;
  payment_batch_id: string;
  payroll_record_id: string | null;
  employee_id: string | null;
  employee_code: string;
  employee_name: string;
  department: string | null;
  bank_name: string | null;
  bank_account: string | null;
  amount: number;
  status: 'pending' | 'paid' | 'failed';
  paid_at: string | null;
  transaction_ref: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentBatchFormData {
  payroll_batch_id?: string;
  name: string;
  salary_period: string;
  department?: string;
  position?: string;
  payment_method: 'bank_transfer' | 'cash' | 'check';
  bank_name?: string;
  payment_date?: string;
}

function mapBatch(row: Record<string, unknown>): PaymentBatch {
  return {
    ...(row as PaymentBatch),
    employee_count: Number(row.employee_count ?? 0),
    total_amount: Number(row.total_amount ?? 0),
    paid_count: Number(row.paid_count ?? 0),
    paid_amount: Number(row.paid_amount ?? 0),
  };
}

export const usePaymentBatches = () => {
  const { currentCompanyId } = useAuth();
  const queryClient = useQueryClient();

  const { data: batches = [], isLoading, refetch } = useQuery({
    queryKey: ['payment-batches', currentCompanyId],
    queryFn: async () => {
      if (!currentCompanyId) return [];
      const res = await listPaymentBatches(currentCompanyId);
      return (res.data ?? []).map(mapBatch);
    },
    enabled: !!currentCompanyId,
  });

  const fetchBatchRecords = async (batchId: string): Promise<PaymentRecord[]> => {
    if (!currentCompanyId) return [];
    try {
      const res = await listPaymentBatchRecords(batchId, currentCompanyId);
      return (res.data ?? []).map((row) => ({
        ...(row as PaymentRecord),
        amount: Number((row as PaymentRecord).amount ?? 0),
      }));
    } catch (error: unknown) {
      console.error('Error fetching payment records:', error);
      return [];
    }
  };

  const createBatchMutation = useMutation({
    mutationFn: async (formData: PaymentBatchFormData) => {
      if (!currentCompanyId) throw new Error('No company selected');
      return createPaymentBatch({ company_id: currentCompanyId, ...formData });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-batches', currentCompanyId] });
      toast.success('Đã tạo bảng chi trả');
    },
    onError: (error: unknown) => toast.error(toErrorMessage(error, 'Lỗi khi tạo bảng chi trả')),
  });

  const updateBatchMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<PaymentBatchFormData> }) => {
      if (!currentCompanyId) throw new Error('No company selected');
      return updatePaymentBatch(id, currentCompanyId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-batches', currentCompanyId] });
      toast.success('Đã cập nhật bảng chi trả');
    },
    onError: (error: unknown) => toast.error(toErrorMessage(error, 'Lỗi khi cập nhật bảng chi trả')),
  });

  const deleteBatchMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!currentCompanyId) throw new Error('No company selected');
      return deletePaymentBatch(id, currentCompanyId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-batches', currentCompanyId] });
      toast.success('Đã xóa bảng chi trả');
    },
    onError: (error: unknown) => toast.error(toErrorMessage(error, 'Lỗi khi xóa bảng chi trả')),
  });

  const processPaymentMutation = useMutation({
    mutationFn: async ({
      batchId,
      recordId,
      transactionRef,
      notes,
    }: {
      batchId: string;
      recordId: string;
      transactionRef?: string;
      notes?: string;
    }) => {
      if (!currentCompanyId) throw new Error('No company selected');
      return processPaymentBatchRecord(batchId, recordId, currentCompanyId, {
        transaction_ref: transactionRef,
        notes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-batches', currentCompanyId] });
    },
    onError: (error: unknown) => toast.error(toErrorMessage(error, 'Lỗi khi chi trả')),
  });

  const processAllPaymentsMutation = useMutation({
    mutationFn: async ({ batchId, notes }: { batchId: string; notes?: string }) => {
      if (!currentCompanyId) throw new Error('No company selected');
      return processPaymentBatch(batchId, currentCompanyId, { notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-batches', currentCompanyId] });
      toast.success('Đã gửi lệnh chi trả toàn bộ');
    },
    onError: (error: unknown) => toast.error(toErrorMessage(error, 'Lỗi khi chi trả toàn bộ')),
  });

  const addRecordMutation = useMutation({
    mutationFn: async ({
      batchId,
      employeeCode,
      employeeName,
      amount,
      department,
      bankName,
      bankAccount,
      payrollRecordId,
      employeeId,
      notes,
    }: {
      batchId: string;
      employeeCode: string;
      employeeName: string;
      amount: number;
      department?: string | null;
      bankName?: string | null;
      bankAccount?: string | null;
      payrollRecordId?: string | null;
      employeeId?: string | null;
      notes?: string | null;
    }) => {
      if (!currentCompanyId) throw new Error('No company selected');
      return addPaymentBatchRecord(batchId, currentCompanyId, {
        employee_code: employeeCode,
        employee_name: employeeName,
        amount,
        department,
        bank_name: bankName,
        bank_account: bankAccount,
        payroll_record_id: payrollRecordId,
        employee_id: employeeId,
        notes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-batches', currentCompanyId] });
      toast.success('Đã thêm nhân viên vào bảng chi trả');
    },
    onError: (error: unknown) => toast.error(toErrorMessage(error, 'Lỗi khi thêm nhân viên')),
  });

  return {
    batches,
    isLoading,
    refetch,
    fetchBatchRecords,
    createBatch: createBatchMutation.mutateAsync,
    updateBatch: updateBatchMutation.mutateAsync,
    deleteBatch: deleteBatchMutation.mutateAsync,
    processPayment: processPaymentMutation.mutateAsync,
    processAllPayments: processAllPaymentsMutation.mutateAsync,
    addRecord: addRecordMutation.mutateAsync,
    isCreating: createBatchMutation.isPending,
  };
};
