/**
 * @CODE-MEMORY
 * Screen:     EmployeeProfile → Hợp đồng tab (list/create term)
 * UC:         UC-HRM-CI-01..05 · UC-HRM-25
 * BR:         BR-CD-F5-01 (salary not on contract body)
 * SRS:        docs/program/deltas/CUSTOMER_DEMO_HRM_DELTA_20260620.md §5
 * TechSpec:   docs/api/openapi/hrm-api.yaml contracts-insurance/contracts
 * Purpose:    Employee-scoped labor contract CRUD via Nest API (term only).
 * WorkItem:   CD-FB-08-CONTRACT
 * Coded:      2026-07-19
 * Callers:    EmployeeContracts.tsx
 * Callees:    list/create/update/deleteEmployeeContract
 * must_keep:  salary always null on mapped row; compensation via separate APIs
 * LastVerified: useEmployeeContracts.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-07-19
 * WorkItem: CD-FB-08-CONTRACT
 * What: Map compensation_package_id; drop inventing salary on contract body
 * Why: F5 / AC-CD-F5-01 — salary lives on compensation packages
 * SRS/BR: BR-CD-F5-01 · AC-CD-F5-01
 *
 * @CODE-MEMORY-CHANGE 2026-07-22
 * WorkItem: FE-HRM-G-CI-01
 * What: create/update omit end_date when expiry empty (open-ended G-CI-01)
 * Why: Align Nest optional end_date; avoid empty-string VAL-001
 * SRS/BR: FR-HRM-CI-01 · TechSpec G-CI-01
 *
 * @CODE-MEMORY-CHANGE 2026-07-28 D-FE-ERP-E1A-PICKER-01
 * change_mode: ADD
 * What: Pass position_key / department_key / signer_position_key on create/update; map from API
 * Why: AC-E1A-CI-POS-01 · API_DESIGN_HRM_MD_BIND_E1A
 * must_keep: F5 salary null; open-ended end_date omit
 */
import { useCallback, useEffect, useState } from 'react';
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
  /** @deprecated F5 — always null; use compensation package APIs */
  salary: number | null;
  compensation_package_id: string | null;
  position: string | null;
  position_key: string | null;
  department: string | null;
  department_key: string | null;
  work_location: string | null;
  probation_period: number | null;
  probation_end_date: string | null;
  signing_date: string | null;
  signer_name: string | null;
  signer_position: string | null;
  signer_position_key: string | null;
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
    compensation_package_id: row.compensation_package_id ?? null,
    position: row.position ?? null,
    position_key: row.position_key ?? null,
    department: row.department ?? null,
    department_key: row.department_key ?? null,
    work_location: null,
    probation_period: null,
    probation_end_date: null,
    signing_date: null,
    signer_name: null,
    signer_position: row.signer_position ?? null,
    signer_position_key: row.signer_position_key ?? null,
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

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const createContract = useCallback(
    async (payload: {
      contract_type: string;
      effective_date: string;
      expiry_date?: string;
      status?: string;
      position_key?: string;
      position?: string;
      department_key?: string;
      department?: string;
      signer_position_key?: string;
      signer_position?: string;
      signer_name?: string;
    }): Promise<boolean> => {
      if (!employeeId || !currentCompanyId) return false;

      if (useApi) {
        try {
          await createEmployeeContract({
            company_id: currentCompanyId,
            employee_id: employeeId,
            contract_type: payload.contract_type,
            start_date: payload.effective_date,
            ...(payload.expiry_date?.trim()
              ? { end_date: payload.expiry_date.trim() }
              : {}),
            position_key: payload.position_key,
            position: payload.position,
            department_key: payload.department_key,
            department: payload.department,
            signer_position_key: payload.signer_position_key,
            signer_position: payload.signer_position,
            signer_name: payload.signer_name,
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
        position_key?: string;
        position?: string;
        department_key?: string;
        department?: string;
        signer_position_key?: string;
        signer_position?: string;
        signer_name?: string;
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
            ...(payload.expiry_date?.trim()
              ? { end_date: payload.expiry_date.trim() }
              : {}),
            status: apiStatus,
            position_key: payload.position_key,
            position: payload.position,
            department_key: payload.department_key,
            department: payload.department,
            signer_position_key: payload.signer_position_key,
            signer_position: payload.signer_position,
            signer_name: payload.signer_name,
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
