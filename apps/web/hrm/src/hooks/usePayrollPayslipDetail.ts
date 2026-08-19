import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toErrorMessage } from '@/lib/apiError';
import { isHrmApiDataMode } from '@/lib/hrmDataMode';
import { coerceHrmListCompanyId } from '@/lib/hrmListScope';
import { getPayrollPayslipById, type HrmPayslipDetail } from '@/integrations/hrmApi';

export function usePayrollPayslipDetail(payslipId: string | null) {
  const { currentCompanyId } = useAuth();
  const [detail, setDetail] = useState<HrmPayslipDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const useApi = isHrmApiDataMode();

  const fetchDetail = useCallback(async () => {
    if (!payslipId || !currentCompanyId) {
      setDetail(null);
      setFetchError(null);
      setIsLoading(false);
      return;
    }
    if (!useApi) {
      setDetail(null);
      setFetchError('Chế độ bảng lương chưa sẵn sàng — mở HRM từ Command Center.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setFetchError(null);
    try {
      const data = await getPayrollPayslipById(payslipId, {
        company_id: coerceHrmListCompanyId(currentCompanyId),
        include_segments: true,
      });
      setDetail(data);
    } catch (error: unknown) {
      console.error('Error fetching payslip detail:', error);
      setDetail(null);
      setFetchError(toErrorMessage(error, 'Không thể tải chi tiết phiếu lương'));
    } finally {
      setIsLoading(false);
    }
  }, [payslipId, currentCompanyId, useApi]);

  useEffect(() => {
    void fetchDetail();
  }, [fetchDetail]);

  return { detail, isLoading, fetchError, refetch: fetchDetail };
}
