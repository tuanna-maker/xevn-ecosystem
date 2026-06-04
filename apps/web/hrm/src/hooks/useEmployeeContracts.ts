import { useCallback, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toErrorMessage } from '@/lib/apiError';
import { shouldSkipSupabaseDataFetches } from '@/lib/hrmDataMode';
import {
  createEmployeeContract,
  deleteEmployeeContract,
  listEmployeeContracts,
  updateEmployeeContract,
  type HrmContractRecord,
} from '@/integrations/hrmApi';
import { toast } from 'sonner';

export interface EmployeeContractRow {
  id: string;
  employee_id: string;
  company_id: string;
  contract_code: string;
  contract_type: string;
  effective_date: string | null;
  expiry_date: string | null;
  salary: number | null;
  position: string | null;
  department: string | null;
  work_location: string | null;
  probation_period: number | null;
  probation_end_date: string | null;
  signing_date: string | null;
  signer_name: string | null;
  signer_position: string | null;
  status: string;
  file_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  renewed_from_id: string | null;
}

export function mapApiContractToProfileRow(row: HrmContractRecord): EmployeeContractRow {
  const status =
    row.status === 'terminated' ? 'terminated' : row.status === 'expired' ? 'expired' : 'active';
  return {
    id: row.id,
    employee_id: row.employee_id,
    company_id: row.company_id,
    contract_code: `HD-${row.id.slice(0, 8).toUpperCase()}`,
    contract_type: row.contract_type,
    effective_date: row.start_date,
    expiry_date: row.end_date,
    salary: null,
    position: null,
    department: null,
    work_location: null,
    probation_period: null,
    probation_end_date: null,
    signing_date: null,
    signer_name: null,
    signer_position: null,
    status,
    file_url: null,
    notes: null,
    created_at: row.created_at,
    updated_at: row.updated_at,
    renewed_from_id: null,
  };
}

export function useEmployeeContracts(employeeId: string | undefined) {
  const { currentCompanyId } = useAuth();
  const [contracts, setContracts] = useState<EmployeeContractRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const useApi = shouldSkipSupabaseDataFetches();

  const refetch = useCallback(async () => {
    if (!employeeId || !currentCompanyId) {
      setContracts([]);
      setFetchError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setFetchError(null);

    try {
      if (useApi) {
        const res = await listEmployeeContracts({
          company_id: currentCompanyId,
          employee_id: employeeId,
        });
        setContracts((res.data ?? []).map(mapApiContractToProfileRow));
        return;
      }

      setContracts([]);
    } catch (error: unknown) {
      console.error('Error fetching employee contracts:', error);
      setContracts([]);
      const message = toErrorMessage(error, 'Không thể tải hợp đồng');
      setFetchError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [employeeId, currentCompanyId, useApi]);

  const createContract = useCallback(
    async (payload: {
      contract_type: string;
      effective_date: string;
      expiry_date: string;
      status?: string;
    }): Promise<boolean> => {
      if (!employeeId || !currentCompanyId) return false;

      if (useApi) {
        try {
          await createEmployeeContract({
            company_id: currentCompanyId,
            employee_id: employeeId,
            contract_type: payload.contract_type,
            start_date: payload.effective_date,
            end_date: payload.expiry_date,
          });
          toast.success('Đã thêm hợp đồng');
          await refetch();
          return true;
        } catch (error: unknown) {
          toast.error(toErrorMessage(error, 'Không thể thêm hợp đồng'));
          return false;
        }
      }

      return false;
    },
    [employeeId, currentCompanyId, useApi, refetch],
  );

  const updateContract = useCallback(
    async (
      contractId: string,
      payload: Partial<{
        contract_type: string;
        effective_date: string;
        expiry_date: string;
        status: string;
      }>,
    ): Promise<boolean> => {
      if (useApi) {
        try {
          const apiStatus =
            payload.status === 'expired' || payload.status === 'terminated'
              ? ('expired' as const)
              : payload.status === 'active'
                ? ('active' as const)
                : undefined;
          await updateEmployeeContract(contractId, {
            contract_type: payload.contract_type,
            start_date: payload.effective_date,
            end_date: payload.expiry_date,
            status: apiStatus,
          });
          toast.success('Đã cập nhật hợp đồng');
          await refetch();
          return true;
        } catch (error: unknown) {
          toast.error(toErrorMessage(error, 'Không thể cập nhật hợp đồng'));
          return false;
        }
      }
      return false;
    },
    [useApi, refetch],
  );

  const deleteContract = useCallback(
    async (contractId: string): Promise<boolean> => {
      if (useApi) {
        try {
          await deleteEmployeeContract(contractId);
          toast.success('Đã xóa hợp đồng');
          await refetch();
          return true;
        } catch (error: unknown) {
          toast.error(toErrorMessage(error, 'Không thể xóa hợp đồng'));
          return false;
        }
      }
      return false;
    },
    [useApi, refetch],
  );

  return {
    contracts,
    isLoading,
    fetchError,
    useApi,
    refetch,
    createContract,
    updateContract,
    deleteContract,
  };
}
