import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { toErrorMessage } from '@/lib/apiError';
import { shouldSkipSupabaseDataFetches } from '@/lib/hrmDataMode';
import { coerceHrmListCompanyId } from '@/lib/hrmListScope';
import {
  createEmployeeContract,
  deleteEmployeeContract,
  listAllEmployeeContracts,
  updateEmployeeContract,
  type HrmContractRecord,
  type HrmEmployeeRecord,
} from '@/integrations/hrmApi';
export type ContractSource = 'contracts' | 'employee_contracts';

export interface Contract {
  id: string;
  contract_code: string;
  employee_name: string;
  employee_avatar: string | null;
  department: string | null;
  contract_type: string;
  effective_date: string | null;
  expiry_date: string | null;
  status: string;
  created_by: string | null;
  created_at: string;
  file_url: string | null;
  notes: string | null;
  company_id: string;
  source: ContractSource;
  employee_id?: string;
}

export interface ContractFormData {
  contract_code: string;
  employee_name: string;
  employee_avatar: string;
  department: string;
  contract_type: string;
  effective_date: Date | undefined;
  expiry_date: Date | undefined;
  status: string;
  notes: string;
  file_url: string;
  employee_id?: string;
}

function mapApiStatus(status: HrmContractRecord['status']): string {
  if (status === 'terminated') return 'expired';
  return status;
}

function mapApiContract(row: HrmContractRecord, employee?: HrmEmployeeRecord): Contract {
  const code =
    row.employee_code != null
      ? `${row.employee_code}-HD`
      : employee?.employee_code != null
        ? `${employee.employee_code}-HD`
        : `HD-${row.id.slice(0, 8).toUpperCase()}`;
  const name =
    (row.employee_name && row.employee_name.trim()) ||
    employee?.full_name ||
    '—';
  const dept =
    (row.department && row.department.trim()) ||
    (employee?.custom_fields as { department?: string } | undefined)?.department ||
    employee?.job_title_key ||
    null;
  return {
    id: row.id,
    contract_code: code,
    employee_name: name,
    employee_avatar: null,
    department: dept,
    contract_type: row.contract_type,
    effective_date: row.start_date,
    expiry_date: row.end_date,
    status: mapApiStatus(row.status),
    created_by: null,
    created_at: row.created_at,
    file_url: null,
    notes: null,
    company_id: row.company_id,
    source: 'employee_contracts',
    employee_id: row.employee_id,
  };
}

function mapSupabaseContract(c: Record<string, unknown>, source: ContractSource, employee?: {
  full_name?: string;
  avatar_url?: string | null;
}): Contract {
  return {
    id: String(c.id),
    contract_code: String(c.contract_code ?? ''),
    employee_name: String(
      source === 'employee_contracts' ? employee?.full_name ?? c.employee_name ?? 'Unknown' : c.employee_name ?? '',
    ),
    employee_avatar:
      source === 'employee_contracts'
        ? (employee?.avatar_url as string | null) ?? null
        : (c.employee_avatar as string | null) ?? null,
    department: (c.department as string | null) ?? null,
    contract_type: String(c.contract_type ?? ''),
    effective_date: (c.effective_date as string | null) ?? null,
    expiry_date: (c.expiry_date as string | null) ?? null,
    status: String(c.status ?? 'pending'),
    created_by: (c.created_by as string | null) ?? null,
    created_at: String(c.created_at ?? new Date().toISOString()),
    file_url: (c.file_url as string | null) ?? null,
    notes: (c.notes as string | null) ?? null,
    company_id: String(c.company_id ?? ''),
    source,
    employee_id: c.employee_id != null ? String(c.employee_id) : undefined,
  };
}

export function useContracts(selectedType: string = 'all') {
  const { currentCompanyId, user } = useAuth();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const useApi = shouldSkipSupabaseDataFetches();

  const fetchContracts = useCallback(async () => {
    if (!currentCompanyId) {
      setContracts([]);
      setFetchError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setFetchError(null);

    try {
      if (useApi) {
        const companyId = coerceHrmListCompanyId(currentCompanyId);
        const contractRes = await listAllEmployeeContracts({ company_id: companyId });
        let rows = (contractRes.data ?? []).map((row) => mapApiContract(row));
        if (selectedType !== 'all') {
          rows = rows.filter((c) => c.contract_type === selectedType);
        }
        setContracts(rows);
        return;
      }
      setContracts([]);
    } catch (error: unknown) {
      console.error('Error fetching contracts:', error);
      setContracts([]);
      const message = toErrorMessage(error, 'Không thể tải danh sách hợp đồng');
      setFetchError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [currentCompanyId, selectedType, useApi]);

  useEffect(() => {
    void fetchContracts();
  }, [fetchContracts]);

  const createContract = async (data: ContractFormData): Promise<boolean> => {
    if (!currentCompanyId) {
      toast.error('Vui lòng chọn công ty');
      return false;
    }

    try {
      if (useApi) {
        if (!data.employee_id) {
          toast.error('Vui lòng chọn nhân viên');
          return false;
        }
        if (!data.effective_date || !data.expiry_date) {
          toast.error('Vui lòng nhập ngày hiệu lực và ngày hết hạn');
          return false;
        }
        await createEmployeeContract({
          company_id: currentCompanyId,
          employee_id: data.employee_id,
          contract_type: data.contract_type,
          start_date: formatDate(data.effective_date),
          end_date: formatDate(data.expiry_date),
        });
      }
      toast.success('Thêm hợp đồng thành công');
      await fetchContracts();
      return true;
    } catch (error: unknown) {
      toast.error(toErrorMessage(error, 'Không thể thêm hợp đồng'));
      return false;
    }
  };

  const updateContract = async (contract: Contract, data: ContractFormData): Promise<boolean> => {
    try {
      if (useApi && contract.source === 'employee_contracts') {
        await updateEmployeeContract(contract.id, {
          contract_type: data.contract_type,
          start_date: data.effective_date ? formatDate(data.effective_date) : undefined,
          end_date: data.expiry_date ? formatDate(data.expiry_date) : undefined,
          status: mapUiStatusToApi(data.status),
        });
      }
      toast.success('Cập nhật hợp đồng thành công');
      await fetchContracts();
      return true;
    } catch (error: unknown) {
      toast.error(toErrorMessage(error, 'Không thể cập nhật hợp đồng'));
      return false;
    }
  };

  const deleteContract = async (contract: Contract): Promise<boolean> => {
    try {
      if (useApi && contract.source === 'employee_contracts') {
        await deleteEmployeeContract(contract.id);
      }
      toast.success('Đã xóa hợp đồng');
      await fetchContracts();
      return true;
    } catch (error: unknown) {
      toast.error(toErrorMessage(error, 'Không thể xóa hợp đồng'));
      return false;
    }
  };

  const bulkDeleteContracts = async (toDelete: Contract[]): Promise<boolean> => {
    try {
      if (useApi) {
        const apiRows = toDelete.filter((c) => c.source === 'employee_contracts');
        await Promise.all(apiRows.map((c) => deleteEmployeeContract(c.id)));
      }
      toast.success('Đã xóa hợp đồng');
      await fetchContracts();
      return true;
    } catch (error: unknown) {
      toast.error(toErrorMessage(error, 'Không thể xóa hợp đồng'));
      return false;
    }
  };

  return {
    contracts,
    isLoading,
    fetchError,
    refetch: fetchContracts,
    createContract,
    updateContract,
    deleteContract,
    bulkDeleteContracts,
    useApiMode: useApi,
  };
}

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function mapUiStatusToApi(status: string): 'active' | 'expired' | 'terminated' {
  if (status === 'expired') return 'expired';
  if (status === 'terminated') return 'terminated';
  if (status === 'pending') return 'active';
  return 'active';
}
