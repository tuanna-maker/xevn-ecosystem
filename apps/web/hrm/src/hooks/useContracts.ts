/**
 * @CODE-MEMORY
 * Screen:     /contracts — Hợp đồng list (embed + standalone)
 * UC:         UF-HRM-02 · J-HRM-03 · P-CC-04
 * BR:         BR-CON-01
 * SRS:        docs/hrm/SRS.md (contracts list / detail drawer / PATCH)
 * TechSpec:   docs/api/openapi/hrm-api.yaml contracts-insurance/contracts
 * Purpose:    Load contracts via Nest API with progressive pages
 *             (first page → paint, then append). Non-2xx must surface fetchError —
 *             never coerce fail → empty «Không có dữ liệu». Employee picker is
 *             deferred to dialog (Contracts.tsx), not this hook.
 * WorkItem:   P1-HRM-CON-PERF-01 · D-HRM-CON-PERF-01
 * Coded:      2026-07-17
 *
 * Callers:
 *   - apps/web/hrm/src/pages/Contracts.tsx → useContracts()
 *
 * Callees:
 *   - listEmployeeContracts (paged) — not listAllEmployeeContracts on mount
 *   - create/update/deleteEmployeeContract for mutate (UF-HRM-02)
 *
 * FE-Actions:
 *   | User action     | Handler            | Lib / API                 |
 *   |-----------------|--------------------|---------------------------|
 *   | Open Hợp đồng   | fetchContracts     | listEmployeeContracts p1  |
 *   | Retry banner    | refetch            | same                      |
 *   | Type chip       | selectedType dep   | client filter + refetch   |
 *   | PATCH / create  | update/create…     | then progressive refetch  |
 *
 * BE-Chain: GET /api/hrm/contracts-insurance/contracts?page=&page_size=
 * Impact:   12× contracts + 12× employees before paint caused RATE-429 empty UI.
 * must_keep: J-HRM-03 detail from list row; UF-HRM-02 PATCH; fetchError ≠ noData.
 * SOLID:     Progressive loader pure fn testable; hook owns React state only.
 * LastVerified: apps/web/hrm/src/hooks/useContracts.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-07-19
 * WorkItem: CD-FB-08-CONTRACT
 * What: Confirm list create path never sends salary (term-only); F5 compensation on profile tabs
 * Why: AC-CD-F5-01 — salary deprecated on contract body
 * SRS/BR: CUSTOMER_DEMO_HRM_DELTA §5 · BR-CD-F5-01
 *
 * @CODE-MEMORY-CHANGE 2026-08-01 D-HDSD-MUTATE-FE-08
 * change_mode: FIX
 * What: createContract sends contract_code + position_key (E1-A required) + department snapshot
 * Why: QA RET-03-HRM-R5 — form-ready 🟢 but POST 400 missing position_key
 * must_keep: G-CI-01 open-ended expiry omit; F5 salary off body
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { toErrorMessage } from '@/lib/apiError';
import { shouldSkipSupabaseDataFetches, HRM_API_MAX_PAGE_SIZE } from '@/lib/hrmDataMode';
import { coerceHrmListCompanyId } from '@/lib/hrmListScope';
import { isListFetchFailureEmpty } from '@/lib/hrmListLoadFailure';
import { validateContractDatesForSubmit } from '@/lib/contractEndDatePolicy';
import {
  createEmployeeContract,
  deleteEmployeeContract,
  listEmployeeContracts,
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
  /** E1-A — required on POST /contracts-insurance/contracts (D-HDSD-MUTATE-FE-08). */
  position_key?: string;
  position?: string;
}

/** Nest @Max(100) — one page per request; progressive append for remainder. */
export const HRM_CONTRACTS_LIST_PAGE_SIZE = HRM_API_MAX_PAGE_SIZE;

/** @deprecated Prefer `isListFetchFailureEmpty` from `@/lib/hrmListLoadFailure`. */
export const isContractsFetchFailureEmpty = isListFetchFailureEmpty;

function mapApiStatus(status: HrmContractRecord['status']): string {
  if (status === 'terminated') return 'expired';
  return status;
}

export function mapApiContract(row: HrmContractRecord, employee?: HrmEmployeeRecord): Contract {
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

function applyTypeFilter(rows: Contract[], selectedType: string): Contract[] {
  if (selectedType === 'all') return rows;
  return rows.filter((c) => c.contract_type === selectedType);
}

export type ContractsProgressiveCallbacks = {
  onFirstPage: (payload: { items: Contract[]; total: number }) => void;
  onProgress?: (payload: { items: Contract[]; total: number }) => void;
  signal?: AbortSignal;
};

/**
 * P1-HRM-CON-PERF-01: paint after page 1; append remaining pages.
 * Primary contracts non-2xx throws (caller sets fetchError). No employee fan-out.
 */
export async function loadContractsListProgressive(
  companyId: string,
  selectedType: string,
  callbacks: ContractsProgressiveCallbacks,
): Promise<{ items: Contract[]; total: number; pagesFetched: number }> {
  const pageSize = HRM_CONTRACTS_LIST_PAGE_SIZE;
  const signal = callbacks.signal;
  const listCompanyId = coerceHrmListCompanyId(companyId);

  const throwIfAborted = () => {
    if (signal?.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }
  };

  throwIfAborted();

  const firstRes = await listEmployeeContracts({
    company_id: listCompanyId,
    page: 1,
    page_size: pageSize,
  });

  throwIfAborted();

  const firstBatch = firstRes.data ?? [];
  let accumulatedRaw = [...firstBatch];
  let items = applyTypeFilter(
    accumulatedRaw.map((row) => mapApiContract(row)),
    selectedType,
  );
  const total = firstRes.total ?? accumulatedRaw.length;

  callbacks.onFirstPage({ items, total });

  let pagesFetched = 1;
  let page = 2;

  while (accumulatedRaw.length < total) {
    throwIfAborted();
    const res = await listEmployeeContracts({
      company_id: listCompanyId,
      page,
      page_size: pageSize,
    });
    throwIfAborted();
    const batch = res.data ?? [];
    if (batch.length === 0) break;
    accumulatedRaw = accumulatedRaw.concat(batch);
    items = applyTypeFilter(
      accumulatedRaw.map((row) => mapApiContract(row)),
      selectedType,
    );
    pagesFetched += 1;
    callbacks.onProgress?.({ items, total: res.total ?? total });
    if (accumulatedRaw.length >= (res.total ?? total)) break;
    page += 1;
  }

  return { items, total, pagesFetched };
}

export function useContracts(selectedType: string = 'all') {
  const { currentCompanyId } = useAuth();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const useApi = shouldSkipSupabaseDataFetches();
  const abortRef = useRef<AbortController | null>(null);

  const fetchContracts = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    if (!currentCompanyId) {
      setContracts([]);
      setTotalCount(0);
      setFetchError(null);
      setIsLoading(false);
      setIsLoadingMore(false);
      return;
    }

    setIsLoading(true);
    setIsLoadingMore(false);
    setFetchError(null);

    let painted = false;

    try {
      if (!useApi) {
        setContracts([]);
        setTotalCount(0);
        return;
      }

      const result = await loadContractsListProgressive(currentCompanyId, selectedType, {
        signal: controller.signal,
        onFirstPage: ({ items, total }) => {
          painted = true;
          setContracts(items);
          setTotalCount(total);
          setIsLoading(false);
          setIsLoadingMore(total > items.length || total > HRM_CONTRACTS_LIST_PAGE_SIZE);
        },
        onProgress: ({ items, total }) => {
          setContracts(items);
          setTotalCount(total);
        },
      });

      if (controller.signal.aborted) return;

      setContracts(result.items);
      setTotalCount(result.total);
      setIsLoadingMore(false);
      if (!painted) {
        setIsLoading(false);
      }
    } catch (error: unknown) {
      if (controller.signal.aborted || (error instanceof DOMException && error.name === 'AbortError')) {
        return;
      }
      console.error('Error fetching contracts:', error);
      const message = toErrorMessage(error, 'Không thể tải danh sách hợp đồng');
      setFetchError(message);
      // Clear only when first page never painted — avoid empty mask over partial data
      if (!painted) {
        setContracts([]);
        setTotalCount(0);
      }
      setIsLoadingMore(false);
      toast.error(message);
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    }
  }, [currentCompanyId, selectedType, useApi]);

  useEffect(() => {
    void fetchContracts();
    return () => {
      abortRef.current?.abort();
    };
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
        // G-CI-01 — open-ended may omit expiry_date; fixed-term still blocked client-side
        const datesGate = validateContractDatesForSubmit({
          contractType: data.contract_type,
          effectiveDate: data.effective_date,
          expiryDate: data.expiry_date,
        });
        if (!datesGate.ok) {
          toast.error(datesGate.message);
          return false;
        }
        const positionKey = data.position_key?.trim();
        if (!positionKey) {
          toast.error('Chọn vị trí từ danh mục chức danh (Cài đặt → Danh mục nghiệp vụ).');
          return false;
        }
        await createEmployeeContract({
          company_id: currentCompanyId,
          employee_id: data.employee_id,
          contract_code: data.contract_code.trim() || undefined,
          contract_type: data.contract_type,
          start_date: formatDate(data.effective_date!),
          ...(data.expiry_date ? { end_date: formatDate(data.expiry_date) } : {}),
          position_key: positionKey,
          ...(data.position?.trim() ? { position: data.position.trim() } : {}),
          ...(data.department?.trim() ? { department: data.department.trim() } : {}),
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
    totalCount,
    isLoading,
    isLoadingMore,
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
