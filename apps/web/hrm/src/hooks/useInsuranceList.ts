/**
 * @CODE-MEMORY
 * Screen:     /insurance — Bảo hiểm list (embed + standalone)
 * UC:         UF-HRM-04 · J-HRM-04 · P-CC-05
 * BR:         BR-INS-01
 * SRS:        docs/hrm/SRS.md (insurance list / employee drill)
 * TechSpec:   docs/api/openapi/hrm-api.yaml contracts-insurance/insurance
 * Purpose:    Load insurance workforce list via Nest API with progressive pages
 *             (first page → paint, then append). Non-2xx must surface fetchError —
 *             never coerce fail → empty «Không có dữ liệu».
 * WorkItem:   D-HRM-INS-EMPTY-MASK-01 · D-HRM-INS-PERF-01
 * Coded:      2026-07-17
 *
 * Callers:
 *   - apps/web/hrm/src/pages/Insurance.tsx → useInsuranceList()
 *
 * Callees:
 *   - listInsuranceRecords (paged) — not listAllInsuranceRecords on mount
 *   - listEmployees / listInsurancePolicyParticipants (non-fatal companions)
 *
 * FE-Actions:
 *   | User action     | Handler            | Lib / API              |
 *   |-----------------|--------------------|------------------------|
 *   | Open Bảo hiểm   | fetchInsurance     | listInsuranceRecords p1|
 *   | Retry banner    | refetch            | same                   |
 *   | Status chip     | selectedStatus dep | client filter + refetch|
 *
 * BE-Chain: GET /api/hrm/contracts-insurance/insurance?page=&page_size=
 * Impact:   11× waterfall before paint caused ~9s blank + 429→empty mask.
 * must_keep: J-HRM-04 employee_id link; fetchError ≠ noData; first-page paint.
 * SOLID:     Progressive loader pure fn testable; hook owns React state only.
 * LastVerified: apps/web/hrm/src/hooks/useInsuranceList.test.ts
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toErrorMessage } from '@/lib/apiError';
import { shouldSkipSupabaseDataFetches, HRM_API_MAX_PAGE_SIZE } from '@/lib/hrmDataMode';
import {
  isListFetchFailureEmpty,
  isRateLimitApiError,
} from '@/lib/hrmListLoadFailure';
import {
  listEmployees,
  listInsurancePolicyParticipants,
  listInsuranceRecords,
  type HrmEmployeeRecord,
  type HrmInsuranceRecord,
} from '@/integrations/hrmApi';
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

/** Nest @Max(100) — one page per request; progressive append for remainder. */
export const HRM_INSURANCE_LIST_PAGE_SIZE = HRM_API_MAX_PAGE_SIZE;

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

function applyStatusFilter(rows: InsuranceListItem[], selectedStatus: string): InsuranceListItem[] {
  if (selectedStatus === 'all') return rows;
  return rows.filter((item) => item.status === selectedStatus);
}

function enrichInsuranceRows(
  rows: HrmInsuranceRecord[],
  employees: HrmEmployeeRecord[],
  participantRows: Record<string, unknown>[],
): InsuranceListItem[] {
  const participantFinancials = buildPolicyParticipantFinancialMap(participantRows);
  const participantIdsByCode = buildPolicyParticipantIdByCode(participantRows);
  return rows.map((row) => {
    const mapped = mapApiInsuranceToListItem(row, findEmployeeForInsuranceRow(row, employees));
    const enriched = enrichInsuranceListItemFinancials(mapped, participantFinancials);
    return attachParticipantIdToListItem(enriched, participantIdsByCode);
  });
}

export type InsuranceProgressiveCallbacks = {
  onFirstPage: (payload: { items: InsuranceListItem[]; total: number }) => void;
  onProgress?: (payload: { items: InsuranceListItem[]; total: number }) => void;
  signal?: AbortSignal;
};

/**
 * D-HRM-INS-PERF-01: paint after page 1; append remaining pages.
 * Primary insurance non-2xx throws (caller sets fetchError). Companions are soft-fail.
 */
export async function loadInsuranceListProgressive(
  companyId: string,
  selectedStatus: string,
  callbacks: InsuranceProgressiveCallbacks,
): Promise<{ items: InsuranceListItem[]; total: number; pagesFetched: number }> {
  const pageSize = HRM_INSURANCE_LIST_PAGE_SIZE;
  const signal = callbacks.signal;

  const throwIfAborted = () => {
    if (signal?.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }
  };

  throwIfAborted();

  const [firstRes, empRes, participantRes] = await Promise.all([
    listInsuranceRecords({ company_id: companyId, page: 1, page_size: pageSize }),
    listEmployees({ company_id: companyId, page_size: pageSize }).catch(() => ({
      total: 0,
      data: [] as HrmEmployeeRecord[],
    })),
    listInsurancePolicyParticipants(companyId).catch(() => ({
      total: 0,
      data: [] as Record<string, unknown>[],
    })),
  ]);

  throwIfAborted();

  const employees = empRes.data ?? [];
  const participantRows = (participantRes.data ?? []) as Record<string, unknown>[];
  const firstBatch = firstRes.data ?? [];
  let accumulatedRaw = [...firstBatch];
  let items = applyStatusFilter(
    enrichInsuranceRows(accumulatedRaw, employees, participantRows),
    selectedStatus,
  );
  const total = firstRes.total ?? accumulatedRaw.length;

  callbacks.onFirstPage({ items, total });

  let pagesFetched = 1;
  let page = 2;

  while (accumulatedRaw.length < total) {
    throwIfAborted();
    const res = await listInsuranceRecords({
      company_id: companyId,
      page,
      page_size: pageSize,
    });
    throwIfAborted();
    const batch = res.data ?? [];
    if (batch.length === 0) break;
    accumulatedRaw = accumulatedRaw.concat(batch);
    items = applyStatusFilter(
      enrichInsuranceRows(accumulatedRaw, employees, participantRows),
      selectedStatus,
    );
    pagesFetched += 1;
    callbacks.onProgress?.({ items, total: res.total ?? total });
    if (accumulatedRaw.length >= (res.total ?? total)) break;
    page += 1;
  }

  return { items, total, pagesFetched };
}

/** @deprecated Prefer `isListFetchFailureEmpty` from `@/lib/hrmListLoadFailure`. */
export const isInsuranceFetchFailureEmpty = isListFetchFailureEmpty;

export function useInsuranceList(selectedStatus: string = 'all') {
  const { currentCompanyId } = useAuth();
  const [insuranceList, setInsuranceList] = useState<InsuranceListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const useApi = shouldSkipSupabaseDataFetches();
  const abortRef = useRef<AbortController | null>(null);

  const fetchInsurance = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    if (!currentCompanyId) {
      setInsuranceList([]);
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
        setInsuranceList([]);
        setTotalCount(0);
        return;
      }

      const result = await loadInsuranceListProgressive(currentCompanyId, selectedStatus, {
        signal: controller.signal,
        onFirstPage: ({ items, total }) => {
          painted = true;
          setInsuranceList(items);
          setTotalCount(total);
          setIsLoading(false);
          setIsLoadingMore(total > items.length || total > HRM_INSURANCE_LIST_PAGE_SIZE);
        },
        onProgress: ({ items, total }) => {
          setInsuranceList(items);
          setTotalCount(total);
        },
      });

      if (controller.signal.aborted) return;

      setInsuranceList(result.items);
      setTotalCount(result.total);
      setIsLoadingMore(false);
      if (!painted) {
        setIsLoading(false);
      }
    } catch (error: unknown) {
      if (controller.signal.aborted || (error instanceof DOMException && error.name === 'AbortError')) {
        return;
      }
      console.error('Error fetching insurance:', error);
      const message = toErrorMessage(error, 'Không thể tải danh sách bảo hiểm');
      setFetchError(message);
      // D-HRM-INS-EMPTY-MASK-01: clear only when first page never painted (avoid race with setState)
      if (!painted) {
        setInsuranceList([]);
        setTotalCount(0);
      }
      setIsLoadingMore(false);
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    }
  }, [currentCompanyId, selectedStatus, useApi]);

  useEffect(() => {
    void fetchInsurance();
    return () => {
      abortRef.current?.abort();
    };
  }, [fetchInsurance]);

  return {
    insuranceList,
    totalCount,
    isLoading,
    isLoadingMore,
    fetchError,
    refetch: fetchInsurance,
    useApiMode: useApi,
  };
}

/** @deprecated Prefer `isRateLimitApiError` from `@/lib/hrmListLoadFailure`. */
export const isRateLimitInsuranceError = isRateLimitApiError;
