import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toErrorMessage } from '@/lib/apiError';
import { isHrmApiDataMode } from '@/lib/hrmDataMode';
import { coerceHrmListCompanyId } from '@/lib/hrmListScope';
import { listPayrollPayslips, type HrmPayslipRow } from '@/integrations/hrmApi';

export function buildPayrollPayslipsQuery(companyId: string, periodId?: string) {
  return { company_id: companyId, period_id: periodId };
}

export function usePayrollPayslips(periodId?: string) {
  const { currentCompanyId } = useAuth();
  const [payslips, setPayslips] = useState<HrmPayslipRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const useApi = isHrmApiDataMode();

  const fetchPayslips = useCallback(async () => {
    if (!currentCompanyId) {
      setPayslips([]);
      setFetchError(null);
      setIsLoading(false);
      return;
    }
    if (!useApi) {
      setPayslips([]);
      setFetchError('Chế độ bảng lương chưa sẵn sàng — mở HRM từ Command Center.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setFetchError(null);
    try {
      const response = await listPayrollPayslips(
        buildPayrollPayslipsQuery(coerceHrmListCompanyId(currentCompanyId), periodId),
      );
      setPayslips(response.data ?? []);
    } catch (error: unknown) {
      console.error('Error fetching payroll payslips:', error);
      setPayslips([]);
      setFetchError(toErrorMessage(error, 'Không thể tải bảng lương'));
    } finally {
      setIsLoading(false);
    }
  }, [currentCompanyId, periodId, useApi]);

  useEffect(() => {
    void fetchPayslips();
  }, [fetchPayslips]);

  return { payslips, isLoading, fetchError, refetch: fetchPayslips, useApiMode: useApi };
}
