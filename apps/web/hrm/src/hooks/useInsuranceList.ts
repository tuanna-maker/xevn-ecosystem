import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toErrorMessage } from '@/lib/apiError';
import { shouldSkipSupabaseDataFetches } from '@/lib/hrmDataMode';
import {
  listAllInsuranceRecords,
  listEmployees,
  listInsurancePolicyParticipants,
  type HrmEmployeeRecord,
  type HrmInsuranceRecord,
} from '@/integrations/hrmApi';
import { HRM_API_MAX_PAGE_SIZE } from '@/lib/hrmDataMode';
import {
  buildPolicyParticipantFinancialMap,
  enrichInsuranceListItemFinancials,
} from '@/lib/insuranceSummary';
import {
  attachParticipantIdToListItem,
  buildPolicyParticipantIdByCode,
} from '@/lib/insuranceParticipantLink';

export interface InsuranceListItem {
  id: string;
  /** Policy participant row id for POST/PATCH ACT-HRM-INS-LINK (may differ from workforce list id). */
  participant_id?: string;
  employee_id?: string;
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

export function normalizeInsuranceEmployeeId(value: unknown): string | undefined {
  if (value == null) return undefined;
  const id = String(value).trim();
  return id || undefined;
}

/** J-HRM-04: resolve profile id from list row + optional workforce row (code/name fallback). */
export function findEmployeeForInsuranceRow(
  row: HrmInsuranceRecord,
  employees: HrmEmployeeRecord[],
): HrmEmployeeRecord | undefined {
  const directId = normalizeInsuranceEmployeeId(row.employee_id);
  if (directId) {
    const byId = employees.find((e) => e.id.toLowerCase() === directId.toLowerCase());
    if (byId) return byId;
  }
  const code = row.employee_code?.trim().toUpperCase();
  if (code) {
    const byCode = employees.find((e) => e.employee_code.trim().toUpperCase() === code);
    if (byCode) return byCode;
  }
  const name = row.employee_name?.trim().toLowerCase();
  if (name) {
    return employees.find((e) => e.full_name.trim().toLowerCase() === name);
  }
  return undefined;
}

export function mapApiInsuranceToListItem(
  row: HrmInsuranceRecord,
  employee?: HrmEmployeeRecord,
): InsuranceListItem {
  const status =
    row.status === 'cancelled' ? 'expired' : row.status === 'expired' ? 'expired' : 'active';
  const employeeId =
    normalizeInsuranceEmployeeId(row.employee_id) ?? normalizeInsuranceEmployeeId(employee?.id);
  return {
    id: row.id,
    employee_id: employeeId,
    employee_code:
      row.employee_code?.trim() ||
      employee?.employee_code ||
      '—',
    employee_name:
      row.employee_name?.trim() ||
      employee?.full_name ||
      '—',
    employee_avatar: null,
    department:
      row.department?.trim() ||
      employee?.job_title_key ||
      null,
    social_insurance_number:
      row.social_insurance_number?.trim() ||
      row.policy_number ||
      null,
    health_insurance_number:
      row.health_insurance_number?.trim() ||
      row.policy_number ||
      null,
    unemployment_insurance_number: row.unemployment_insurance_number?.trim() || null,
    social_insurance_rate: row.social_insurance_rate ?? null,
    health_insurance_rate: row.health_insurance_rate ?? null,
    unemployment_insurance_rate: row.unemployment_insurance_rate ?? null,
    base_salary: row.base_salary ?? null,
    effective_date: row.effective_date ?? row.created_at?.split('T')[0] ?? null,
    expiry_date: row.expiry_date,
    status,
    notes: row.provider ? `Provider: ${row.provider}` : null,
    created_at: row.created_at,
    company_id: row.company_id,
  };
}

export function useInsuranceList(selectedStatus: string = 'all') {
  const { currentCompanyId } = useAuth();
  const [insuranceList, setInsuranceList] = useState<InsuranceListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const useApi = shouldSkipSupabaseDataFetches();

  const fetchInsurance = useCallback(async () => {
    if (!currentCompanyId) {
      setInsuranceList([]);
      setTotalCount(0);
      setFetchError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setFetchError(null);

    try {
      if (useApi) {
        const [insuranceRes, empRes, participantRes] = await Promise.all([
          listAllInsuranceRecords({ company_id: currentCompanyId }),
          listEmployees({ company_id: currentCompanyId, page_size: HRM_API_MAX_PAGE_SIZE }),
          listInsurancePolicyParticipants(currentCompanyId).catch(() => ({ total: 0, data: [] })),
        ]);
        const employees = empRes.data ?? [];
        const participantRows = participantRes.data ?? [];
        const participantFinancials = buildPolicyParticipantFinancialMap(participantRows);
        const participantIdsByCode = buildPolicyParticipantIdByCode(participantRows);
        let rows = (insuranceRes.data ?? []).map((row) => {
          const mapped = mapApiInsuranceToListItem(row, findEmployeeForInsuranceRow(row, employees));
          const enriched = enrichInsuranceListItemFinancials(mapped, participantFinancials);
          return attachParticipantIdToListItem(enriched, participantIdsByCode);
        });
        setTotalCount(insuranceRes.total ?? rows.length);
        if (selectedStatus !== 'all') {
          rows = rows.filter((item) => item.status === selectedStatus);
        }
        setInsuranceList(rows);
        return;
      }
      setInsuranceList([]);
      setTotalCount(0);
    } catch (error: unknown) {
      console.error('Error fetching insurance:', error);
      setInsuranceList([]);
      setTotalCount(0);
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
    totalCount,
    isLoading,
    fetchError,
    refetch: fetchInsurance,
    useApiMode: useApi,
  };
}
