import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

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

export const usePaymentBatches = () => {
  const { currentCompanyId } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all payment batches
  const { data: batches = [], isLoading, refetch } = useQuery({
    queryKey: ['payment-batches', currentCompanyId],
    queryFn: async () => {
      if (!currentCompanyId) return [];

      const { data, error } = await supabase
        .from('payment_batches')
        .select('*')
        .eq('company_id', currentCompanyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PaymentBatch[];
    },
    enabled: !!currentCompanyId,
  });

  // Fetch records for a batch
  const fetchBatchRecords = async (batchId: string): Promise<PaymentRecord[]> => {
    const { data, error } = await supabase
      .from('payment_records')
      .select('*')
      .eq('payment_batch_id', batchId)
      .order('employee_name', { ascending: true });

    if (error) throw error;
    return data as PaymentRecord[];
  };

  // Create batch mutation
  const createBatchMutation = useMutation({
    mutationFn: async (formData: PaymentBatchFormData) => {
      if (!currentCompanyId) throw new Error('No company selected');

      const { data, error } = await supabase
        .from('payment_batches')
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
      queryClient.invalidateQueries({ queryKey: ['payment-batches', currentCompanyId] });
      toast.success('Đã tạo bảng chi trả');
    },
    onError: () => {
      toast.error('Lỗi khi tạo bảng chi trả');
    },
  });

  // Update batch mutation
  const updateBatchMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<PaymentBatch> }) => {
      const { error } = await supabase
        .from('payment_batches')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-batches', currentCompanyId] });
      toast.success('Đã cập nhật bảng chi trả');
    },
    onError: () => {
      toast.error('Lỗi khi cập nhật bảng chi trả');
    },
  });

  // Delete batch mutation
  const deleteBatchMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('payment_batches')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-batches', currentCompanyId] });
      toast.success('Đã xóa bảng chi trả');
    },
    onError: () => {
      toast.error('Lỗi khi xóa bảng chi trả');
    },
  });

  // Process payment for single record
  const processPaymentMutation = useMutation({
    mutationFn: async ({ recordId, batchId, transactionRef }: { 
      recordId: string; 
      batchId: string;
      transactionRef?: string;
    }) => {
      const { error } = await supabase
        .from('payment_records')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
          transaction_ref: transactionRef,
        })
        .eq('id', recordId);

      if (error) throw error;

      // Update batch paid count and amount
      await updateBatchPaymentStats(batchId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-batches', currentCompanyId] });
      toast.success('Đã chi trả thành công');
    },
    onError: () => {
      toast.error('Lỗi khi chi trả');
    },
  });

  // Process all payments in a batch
  const processAllPaymentsMutation = useMutation({
    mutationFn: async (batchId: string) => {
      const { error } = await supabase
        .from('payment_records')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
        })
        .eq('payment_batch_id', batchId)
        .eq('status', 'pending');

      if (error) throw error;

      // Update batch status
      await supabase
        .from('payment_batches')
        .update({
          status: 'completed',
          processed_at: new Date().toISOString(),
        })
        .eq('id', batchId);

      await updateBatchPaymentStats(batchId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-batches', currentCompanyId] });
      toast.success('Đã chi trả toàn bộ thành công');
    },
    onError: () => {
      toast.error('Lỗi khi chi trả');
    },
  });

  // Add record to batch
  const addRecordMutation = useMutation({
    mutationFn: async (data: Omit<PaymentRecord, 'id' | 'created_at' | 'updated_at'>) => {
      if (!currentCompanyId) throw new Error('No company selected');

      const { data: result, error } = await supabase
        .from('payment_records')
        .insert({
          company_id: currentCompanyId,
          ...data,
        })
        .select()
        .single();

      if (error) throw error;

      // Update batch stats
      await updateBatchPaymentStats(data.payment_batch_id);

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-batches', currentCompanyId] });
      toast.success('Đã thêm nhân viên vào bảng chi trả');
    },
    onError: () => {
      toast.error('Lỗi khi thêm nhân viên');
    },
  });

  // Helper function to update batch payment stats
  const updateBatchPaymentStats = async (batchId: string) => {
    const records = await fetchBatchRecords(batchId);
    const paidRecords = records.filter(r => r.status === 'paid');
    const totalAmount = records.reduce((sum, r) => sum + Number(r.amount), 0);
    const paidAmount = paidRecords.reduce((sum, r) => sum + Number(r.amount), 0);

    await supabase
      .from('payment_batches')
      .update({
        employee_count: records.length,
        total_amount: totalAmount,
        paid_count: paidRecords.length,
        paid_amount: paidAmount,
        status: paidRecords.length === records.length && records.length > 0 ? 'completed' : 'processing',
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
    processPayment: processPaymentMutation.mutateAsync,
    processAllPayments: processAllPaymentsMutation.mutateAsync,
    addRecord: addRecordMutation.mutateAsync,
    isCreating: createBatchMutation.isPending,
  };
};
