import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toErrorMessage } from '@/lib/apiError';
import { shouldSkipSupabaseDataFetches, HRM_API_MAX_PAGE_SIZE } from '@/lib/hrmDataMode';
import {
  listEmployees,
  listInsuranceRecords,
  type HrmEmployeeRecord,
  type HrmInsuranceRecord,
} from '@/integrations/hrmApi';
export interface InsuranceListItem {
  id: string;
  employee_code: string;
  employee_name: string;
  employee_avatar: string | null;
  department: string | null;
  social_insurance_number: string | null;
  health_insurance_number: string | null;
  unemployment_insurance_number: string | null;
  social_insurance_rate: number | null;
  health_insurance_rate: number | null;
  unemployment_insurance_rate: number | null;
  base_salary: number | null;
  effective_date: string | null;
  expiry_date: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  company_id: string;
}

export function mapApiInsuranceToListItem(
  row: HrmInsuranceRecord,
  employee?: HrmEmployeeRecord,
): InsuranceListItem {
  const status =
    row.status === 'cancelled' ? 'expired' : row.status === 'expired' ? 'expired' : 'active';
  return {
    id: row.id,
    employee_code:
      (row as HrmInsuranceRecord & { employee_code?: string }).employee_code?.trim() ||
      employee?.employee_code ||
      '—',
    employee_name:
      (row as HrmInsuranceRecord & { employee_name?: string }).employee_name?.trim() ||
      employee?.full_name ||
      '—',
    employee_avatar: null,
    department:
      (row as HrmInsuranceRecord & { department?: string }).department?.trim() ||
      employee?.job_title_key ||
      null,
    social_insurance_number:
      (row as HrmInsuranceRecord & { social_insurance_number?: string }).social_insurance_number?.trim() ||
      row.policy_number ||
      null,
    health_insurance_number:
      (row as HrmInsuranceRecord & { health_insurance_number?: string }).health_insurance_number?.trim() ||
      row.policy_number,
    unemployment_insurance_number: null,
    social_insurance_rate: null,
    health_insurance_rate: null,
    unemployment_insurance_rate: null,
    base_salary: null,
    effective_date: row.created_at?.split('T')[0] ?? null,
    expiry_date: row.expiry_date,
    status,
    notes: row.provider ? `Provider: ${row.provider}` : null,
    created_at: row.created_at,
    company_id: row.company_id,
  };
}

function mapSupabaseInsuranceRow(c: Record<string, unknown>): InsuranceListItem {
  return {
    id: String(c.id),
    employee_code: String(c.employee_code ?? ''),
    employee_name: String(c.employee_name ?? ''),
    employee_avatar: (c.employee_avatar as string | null) ?? null,
    department: (c.department as string | null) ?? null,
    social_insurance_number: (c.social_insurance_number as string | null) ?? null,
    health_insurance_number: (c.health_insurance_number as string | null) ?? null,
    unemployment_insurance_number: (c.unemployment_insurance_number as string | null) ?? null,
    social_insurance_rate: (c.social_insurance_rate as number | null) ?? null,
    health_insurance_rate: (c.health_insurance_rate as number | null) ?? null,
    unemployment_insurance_rate: (c.unemployment_insurance_rate as number | null) ?? null,
    base_salary: (c.base_salary as number | null) ?? null,
    effective_date: (c.effective_date as string | null) ?? null,
    expiry_date: (c.expiry_date as string | null) ?? null,
    status: String(c.status ?? 'pending'),
    notes: (c.notes as string | null) ?? null,
    created_at: String(c.created_at ?? new Date().toISOString()),
    company_id: String(c.company_id ?? ''),
  };
}

export function useInsuranceList(selectedStatus: string = 'all') {
  const { currentCompanyId } = useAuth();
  const [insuranceList, setInsuranceList] = useState<InsuranceListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const useApi = shouldSkipSupabaseDataFetches();

  const fetchInsurance = useCallback(async () => {
    if (!currentCompanyId) {
      setInsuranceList([]);
      setFetchError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setFetchError(null);

    try {
      if (useApi) {
        const insuranceRes = await listInsuranceRecords({ company_id: currentCompanyId });
        let rows = (insuranceRes.data ?? []).map((row) => mapApiInsuranceToListItem(row));
        if (rows.some((r) => r.employee_name === '—')) {
          const employeeRes = await listEmployees({
            company_id: currentCompanyId,
            page: 1,
            page_size: HRM_API_MAX_PAGE_SIZE,
          });
          const byEmployeeId = new Map(employeeRes.data.map((e) => [e.id, e]));
          rows = (insuranceRes.data ?? []).map((row) =>
            mapApiInsuranceToListItem(row, byEmployeeId.get(row.employee_id)),
          );
        }
        if (selectedStatus !== 'all') {
          rows = rows.filter((item) => item.status === selectedStatus);
        }
        setInsuranceList(rows);
        return;
      }
      setInsuranceList([]);
    } catch (error: unknown) {
      console.error('Error fetching insurance:', error);
      setInsuranceList([]);
      setFetchError(toErrorMessage(error, 'Không thể tải danh sách bảo hiểm'));
    } finally {
      setIsLoading(false);
    }
  }, [currentCompanyId, selectedStatus, useApi]);

  useEffect(() => {
    void fetchInsurance();
  }, [fetchInsurance]);

  return {
    insuranceList,
    isLoading,
    fetchError,
    refetch: fetchInsurance,
    useApiMode: useApi,
  };
}
