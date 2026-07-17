/**
 * @CODE-MEMORY
 * Screen:     /insurance — Bảo hiểm list (embed + standalone)
 * UC:         UC-HRM-25 · UF-HRM-04 · J-HRM-04 · P-CC-05
 * BR:         BR-INS-01 · BR-LINK-07
 * SRS:        docs/hrm/SRS.md §UC-HRM-25 (HĐ/BHXH embed)
 * TechSpec:   docs/api/openapi/hrm-api.yaml contracts-insurance/insurance
 *             docs/decisions/ADR-HRM-SCALE-1000-USERS-20260717.md §5.2 / §6 T-FANOUT
 * Purpose:    Load insurance workforce list via Nest API with **bounded** pages
 *             (mount = page 1 only). Explicit loadMore for progressive append.
 *             Non-2xx must surface fetchError — never coerce fail → empty.
 * WorkItem:   P1-HRM-SCALE-FE-W2-INS-LIST (REPLACE unbounded progressive)
 * Coded:      2026-07-17
 *
 * Callers:
 *   - apps/web/hrm/src/pages/Insurance.tsx → useInsuranceList()
 *
 * Callees:
 *   - listInsuranceRecords (paged) — never listAllInsuranceRecords on mount
 *   - listEmployees / listInsurancePolicyParticipants (soft-fail companions, page-1 only)
 *
 * FE-Actions:
 *   | User action     | Handler            | Lib / API              |
 *   |-----------------|--------------------|------------------------|
 *   | Open Bảo hiểm   | fetchInsurance     | listInsuranceRecords p1|
 *   | Tải thêm        | loadMore           | listInsuranceRecords pN|
 *   | Retry banner    | refetch            | same                   |
 *   | Status chip     | selectedStatus dep | client filter + refetch|
 *
 * BE-Chain: GET /api/hrm/contracts-insurance/insurance?page=&page_size=
 * Impact:   Unbounded page=1..11 dump on mount violated ADR T-FANOUT / COND-SCALE-W2-INS-LIST-FANOUT.
 * must_keep: J-HRM-04 employee_id link; fetchError ≠ noData; W2 picker; ATT-NAV; honest totals.
 * SOLID:     Bounded loader pure fn testable; hook owns React state only.
 * LastVerified: apps/web/hrm/src/hooks/useInsuranceList.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-07-17 P1-HRM-SCALE-FE-W2-INS-LIST
 *   REPLACE auto-progressive while(total) with mount maxPages=1 + explicit loadMore.
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

/** Nest @Max(100) — one page per request; mount never loops past maxPages. */
export const HRM_INSURANCE_LIST_PAGE_SIZE = HRM_API_MAX_PAGE_SIZE;

/** ADR T-FANOUT: insurance mount ≤1–2 list GETs (default 1). */
export const HRM_INSURANCE_MOUNT_MAX_PAGES = 1;

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
  onFirstPage: (payload: { items: InsuranceListItem[]; total: number; hasMore: boolean }) => void;
  onProgress?: (payload: { items: InsuranceListItem[]; total: number; hasMore: boolean }) => void;
  signal?: AbortSignal;
  /**
   * Max insurance list pages to fetch in this call.
   * Mount default = {@link HRM_INSURANCE_MOUNT_MAX_PAGES} (1) — ADR T-FANOUT.
   * Pass a higher value only for explicit progressive UX (loadMore / export preview).
   */
  maxPages?: number;
};

export type InsuranceListLoadResult = {
  items: InsuranceListItem[];
  total: number;
  pagesFetched: number;
  hasMore: boolean;
  rawRows: HrmInsuranceRecord[];
  employees: HrmEmployeeRecord[];
  participantRows: Record<string, unknown>[];
};

/**
 * P1-HRM-SCALE-FE-W2-INS-LIST: paint after page 1; **do not** auto-dump pages 2..N.
 * Primary insurance non-2xx throws (caller sets fetchError). Companions are soft-fail.
 */
export async function loadInsuranceListProgressive(
  companyId: string,
  selectedStatus: string,
  callbacks: InsuranceProgressiveCallbacks,
): Promise<InsuranceListLoadResult> {
  const pageSize = HRM_INSURANCE_LIST_PAGE_SIZE;
  const maxPages = Math.max(1, callbacks.maxPages ?? HRM_INSURANCE_MOUNT_MAX_PAGES);
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
  let hasMore = accumulatedRaw.length < total;

  callbacks.onFirstPage({ items, total, hasMore });

  let pagesFetched = 1;
  let page = 2;

  while (pagesFetched < maxPages && accumulatedRaw.length < total) {
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
    hasMore = accumulatedRaw.length < (res.total ?? total);
    callbacks.onProgress?.({ items, total: res.total ?? total, hasMore });
    if (!hasMore) break;
    page += 1;
  }

  hasMore = accumulatedRaw.length < total;
  return { items, total, pagesFetched, hasMore, rawRows: accumulatedRaw, employees, participantRows };
}

/**
 * Append a single next insurance page (explicit progressive UX — not mount).
 */
export async function loadInsuranceListNextPage(params: {
  companyId: string;
  selectedStatus: string;
  page: number;
  accumulatedRaw: HrmInsuranceRecord[];
  employees: HrmEmployeeRecord[];
  participantRows: Record<string, unknown>[];
  total: number;
  signal?: AbortSignal;
}): Promise<{
  items: InsuranceListItem[];
  total: number;
  hasMore: boolean;
  rawRows: HrmInsuranceRecord[];
  pageFetched: number;
}> {
  if (params.signal?.aborted) {
    throw new DOMException('Aborted', 'AbortError');
  }
  const res = await listInsuranceRecords({
    company_id: params.companyId,
    page: params.page,
    page_size: HRM_INSURANCE_LIST_PAGE_SIZE,
  });
  if (params.signal?.aborted) {
    throw new DOMException('Aborted', 'AbortError');
  }
  const batch = res.data ?? [];
  const accumulatedRaw =
    batch.length === 0 ? params.accumulatedRaw : params.accumulatedRaw.concat(batch);
  const total = res.total ?? params.total;
  const items = applyStatusFilter(
    enrichInsuranceRows(accumulatedRaw, params.employees, params.participantRows),
    params.selectedStatus,
  );
  return {
    items,
    total,
    hasMore: accumulatedRaw.length < total && batch.length > 0,
    rawRows: accumulatedRaw,
    pageFetched: params.page,
  };
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
  const [hasMore, setHasMore] = useState(false);
  const useApi = shouldSkipSupabaseDataFetches();
  const abortRef = useRef<AbortController | null>(null);
  const companionsRef = useRef<{
    rawRows: HrmInsuranceRecord[];
    employees: HrmEmployeeRecord[];
    participantRows: Record<string, unknown>[];
    nextPage: number;
  }>({
    rawRows: [],
    employees: [],
    participantRows: [],
    nextPage: 2,
  });

  const fetchInsurance = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    if (!currentCompanyId) {
      setInsuranceList([]);
      setTotalCount(0);
      setHasMore(false);
      setFetchError(null);
      setIsLoading(false);
      setIsLoadingMore(false);
      companionsRef.current = {
        rawRows: [],
        employees: [],
        participantRows: [],
        nextPage: 2,
      };
      return;
    }

    setIsLoading(true);
    setIsLoadingMore(false);
    setFetchError(null);
    setHasMore(false);

    let painted = false;

    try {
      if (!useApi) {
        setInsuranceList([]);
        setTotalCount(0);
        setHasMore(false);
        return;
      }

      // Mount: ≤1 insurance list GET (ADR T-FANOUT / COND-SCALE-W2-INS-LIST-FANOUT)
      const result = await loadInsuranceListProgressive(currentCompanyId, selectedStatus, {
        signal: controller.signal,
        maxPages: HRM_INSURANCE_MOUNT_MAX_PAGES,
        onFirstPage: ({ items, total, hasMore: more }) => {
          painted = true;
          setInsuranceList(items);
          setTotalCount(total);
          setHasMore(more);
          setIsLoading(false);
        },
      });

      if (controller.signal.aborted) return;

      companionsRef.current = {
        rawRows: result.rawRows,
        employees: result.employees,
        participantRows: result.participantRows,
        nextPage: result.pagesFetched + 1,
      };
      setInsuranceList(result.items);
      setTotalCount(result.total);
      setHasMore(result.hasMore);
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
        setHasMore(false);
      }
      setIsLoadingMore(false);
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    }
  }, [currentCompanyId, selectedStatus, useApi]);

  const loadMore = useCallback(async () => {
    if (!currentCompanyId || !useApi || !hasMore || isLoadingMore || isLoading) return;

    const controller = abortRef.current ?? new AbortController();
    setIsLoadingMore(true);
    setFetchError(null);

    try {
      const companions = companionsRef.current;
      const result = await loadInsuranceListNextPage({
        companyId: currentCompanyId,
        selectedStatus,
        page: companions.nextPage,
        accumulatedRaw: companions.rawRows,
        employees: companions.employees,
        participantRows: companions.participantRows,
        total: totalCount,
        signal: controller.signal,
      });

      if (controller.signal.aborted) return;

      companionsRef.current = {
        ...companions,
        rawRows: result.rawRows,
        nextPage: result.pageFetched + 1,
      };
      setInsuranceList(result.items);
      setTotalCount(result.total);
      setHasMore(result.hasMore);
    } catch (error: unknown) {
      if (controller.signal.aborted || (error instanceof DOMException && error.name === 'AbortError')) {
        return;
      }
      console.error('Error loading more insurance:', error);
      setFetchError(toErrorMessage(error, 'Không thể tải thêm bản ghi bảo hiểm'));
    } finally {
      if (!controller.signal.aborted) {
        setIsLoadingMore(false);
      }
    }
  }, [
    currentCompanyId,
    useApi,
    hasMore,
    isLoadingMore,
    isLoading,
    selectedStatus,
    totalCount,
  ]);

  useEffect(() => {
    void fetchInsurance();
    return () => {
      abortRef.current?.abort();
    };
  }, [fetchInsurance]);

  const isCapped = hasMore || (totalCount > 0 && insuranceList.length < totalCount);

  return {
    insuranceList,
    totalCount,
    isLoading,
    isLoadingMore,
    isCapped,
    hasMore,
    fetchError,
    refetch: fetchInsurance,
    loadMore,
    useApiMode: useApi,
  };
}

/** @deprecated Prefer `isRateLimitApiError` from `@/lib/hrmListLoadFailure`. */
export const isRateLimitInsuranceError = isRateLimitApiError;
