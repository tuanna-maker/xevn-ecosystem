/**
 * @CODE-MEMORY
 * Screen:     Satellite employee pickers (insurance, company members, attendance, …)
 * UC:          UC-HRM-SCOPE-03
 * BR:          BR-INT-05
 * SRS:         docs/hrm/SRS.md §15.2 AC-INT-SCOPE-G-01
 * TechSpec:    docs/hrm/TECHSPEC.md §11.2
 * Purpose:     Server-paged / keyword typeahead employee options for pickers.
 *              Never calls listAllEmployees (ADR Option B W2 — COND-SCALE-W2-PICKER).
 * WorkItem:    P1-HRM-SCALE-FE-W2
 * Coded:       2026-07-17
 *
 * Callers:
 *   - useEmployees (capped default page)
 *   - AddInsuranceDialog typeahead
 *   - CompanyMembersManagement invite/link pickers
 *   - LeaveTab create/handover typeahead (CD-FB-07-FE-LEAVE-PICKER)
 *
 * Callees:
 *   - listEmployees → GET /api/hrm/employees (single page, optional keyword)
 *
 * FE-Actions:
 *   | User action           | Handler              | Lib / API              |
 *   |-----------------------|----------------------|------------------------|
 *   | Open picker / type    | useEmployeePickerSearch | listEmployees        |
 *
 * BE-Chain: GET /api/hrm/employees?page=&page_size=&keyword=
 * Impact:      Unbounded listAllEmployees fan-out (~12× at 1k NV) on picker mount.
 * must_keep:   Cap ≤ Nest @Max(100); keyword search; W1 Employees page untouched.
 * SOLID:       Picker read path separate from useEmployeesPage table.
 * LastVerified: apps/web/hrm/src/hooks/useEmployeePicker.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-07-19 CD-FB-07-FE-LEAVE-PICKER
 *   LeaveTab create dialog wired to useEmployeePickerSearch (C-CD-FB-07-01).
 */
import { useEffect, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { coerceHrmListCompanyId } from '@/lib/hrmListScope';
import { HRM_API_MAX_PAGE_SIZE } from '@/lib/hrmDataMode';
import { listEmployees, type HrmEmployeeRecord, type HrmSpreadsheetScope } from '@/integrations/hrmApi';

/** ADR §5.2 / W2 — picker default page (≤ Nest hard cap 100). */
export const HRM_EMPLOYEE_PICKER_PAGE_SIZE = 50;

/** Hard stop: pickers never walk page 2..N (no listAllEmployees). */
export const HRM_EMPLOYEE_PICKER_MAX_PAGES = 1;

export const EMPLOYEE_PICKER_QUERY_KEY = 'employee-picker' as const;

export type EmployeePickerFilters = {
  keyword?: string;
  pageSize?: number;
  includeArchived?: boolean;
  status?: string;
};

export function buildEmployeePickerQueryKey(
  companyId: string | null | undefined,
  filters: EmployeePickerFilters = {},
): readonly unknown[] {
  return [
    EMPLOYEE_PICKER_QUERY_KEY,
    companyId ?? null,
    filters.keyword?.trim() || '',
    filters.pageSize ?? HRM_EMPLOYEE_PICKER_PAGE_SIZE,
    filters.includeArchived ?? false,
    filters.status && filters.status !== 'all' ? filters.status : '',
  ] as const;
}

export type EmployeePickerResult = {
  data: HrmEmployeeRecord[];
  total: number;
  isCapped: boolean;
};

/**
 * Single-page employee list for pickers (optional keyword).
 * Never fans out across pages — use keyword search to reach deeper rows.
 */
export async function fetchEmployeePickerPage(params: {
  company_id: string;
  keyword?: string;
  page_size?: number;
  include_archived?: boolean;
  status?: string;
  scope?: HrmSpreadsheetScope;
}): Promise<EmployeePickerResult> {
  const pageSize = Math.min(
    Math.max(1, params.page_size ?? HRM_EMPLOYEE_PICKER_PAGE_SIZE),
    HRM_API_MAX_PAGE_SIZE,
  );
  const res = await listEmployees({
    company_id: coerceHrmListCompanyId(params.company_id),
    keyword: params.keyword?.trim() || undefined,
    include_archived: params.include_archived,
    status: params.status,
    page: 1,
    page_size: pageSize,
    scope: params.scope,
  });
  const data = res.data ?? [];
  const total = res.total ?? data.length;
  return {
    data,
    total,
    isCapped: total > data.length,
  };
}

export function useDebouncedPickerKeyword(value: string, delayMs = 300): string {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

export type UseEmployeePickerSearchOptions = {
  companyId?: string | null;
  keyword?: string;
  enabled?: boolean;
  pageSize?: number;
  includeArchived?: boolean;
  status?: string;
  scope?: HrmSpreadsheetScope | null;
};

/** React Query typeahead / capped picker — one GET per keyword/scope. */
export function useEmployeePickerSearch(options: UseEmployeePickerSearchOptions) {
  const {
    companyId,
    keyword = '',
    enabled = true,
    pageSize = HRM_EMPLOYEE_PICKER_PAGE_SIZE,
    includeArchived = false,
    status,
    scope,
  } = options;

  const filters: EmployeePickerFilters = {
    keyword,
    pageSize,
    includeArchived,
    status,
  };

  const query = useQuery({
    queryKey: [...buildEmployeePickerQueryKey(companyId, filters), scope?.tenantId ?? null, scope?.companyId ?? null],
    queryFn: async (): Promise<EmployeePickerResult> => {
      if (!companyId) {
        return { data: [], total: 0, isCapped: false };
      }
      return fetchEmployeePickerPage({
        company_id: companyId,
        keyword,
        page_size: pageSize,
        include_archived: includeArchived,
        status,
        scope: scope ?? undefined,
      });
    },
    enabled: Boolean(companyId) && enabled,
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });

  const result = query.data ?? { data: [], total: 0, isCapped: false };

  return {
    employees: result.data,
    total: result.total,
    isCapped: result.isCapped,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}
