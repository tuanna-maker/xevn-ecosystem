/**
 * @CODE-MEMORY
 * Screen:     /employees — Danh sách nhân viên (server page)
 * UC:          UC-HRM-SCOPE-03, J-HRM-02
 * BR:          BR-INT-05
 * SRS:         docs/hrm/SRS.md §15.2 AC-INT-SCOPE-G-01
 * TechSpec:    docs/hrm/TECHSPEC.md §11.2
 * Purpose:     React Query server-paged employee list for the Employees table.
 *              One GET /employees?page=&page_size= per visible page (T-FANOUT ≤1).
 *              Does not call listAllEmployees on mount (ADR Option B W1).
 * WorkItem:    P1-HRM-SCALE-FE-W1
 * Coded:       2026-07-17
 *
 * Callers:
 *   - apps/web/hrm/src/pages/Employees.tsx → useEmployeesPage()
 *
 * Callees:
 *   - listEmployees → GET /api/hrm/employees (single page)
 *   - dedupeEmployeesById → first-wins defense on page payload
 *   - useEmployeeMutations → invalidate RQ on write
 *
 * FE-Actions:
 *   | User action        | Handler              | Lib / API              |
 *   |--------------------|----------------------|------------------------|
 *   | Open / change page | useQuery             | listEmployees          |
 *   | Search / status    | queryKey + refetch   | listEmployees keyword  |
 *   | Create/update/arch | mutations + invalidate | useEmployeeMutations |
 *
 * BE-Chain: GET /api/hrm/employees → employees (ORDER BY created_at DESC, id DESC)
 * Impact:      Full merge on mount causes ~12× fan-out at 1k NV; page hook cuts T-FANOUT.
 * must_keep:   First-wins dedupe; J-HRM-02 navigate `/employees/:id`; iframe key untouched.
 * SOLID:       Paged read path separate from legacy useEmployees full-collection pickers.
 * LastVerified: apps/web/hrm/src/hooks/useEmployeesPage.test.ts
 */
import { useCallback, useMemo } from 'react';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { toErrorMessage } from '@/lib/apiError';
import { coerceHrmListCompanyId } from '@/lib/hrmListScope';
import { listEmployees, type HrmEmployeeRecord } from '@/integrations/hrmApi';
import { mapHrmEmployeeRecord } from '@/hooks/useEmployee';
import {
  dedupeEmployeesById,
  type Employee,
  type EmployeeFormData,
} from '@/hooks/useEmployees';
import { useEmployeeMutations } from '@/hooks/useEmployeeMutations';

/** ADR §5.2 — dense table default (≤50); Nest hard cap remains 100. */
export const HRM_EMPLOYEES_TABLE_PAGE_SIZE = 50;

export const EMPLOYEES_PAGE_QUERY_KEY = 'employees-page' as const;

export type EmployeesPageFilters = {
  keyword?: string;
  status?: string;
  department?: string;
  page?: number;
  pageSize?: number;
  includeArchived?: boolean;
};

export function buildEmployeesPageQueryKey(
  companyId: string | null | undefined,
  filters: EmployeesPageFilters,
): readonly unknown[] {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? HRM_EMPLOYEES_TABLE_PAGE_SIZE;
  return [
    EMPLOYEES_PAGE_QUERY_KEY,
    companyId ?? null,
    page,
    pageSize,
    filters.keyword?.trim() || '',
    filters.status && filters.status !== 'all' ? filters.status : '',
    filters.department && filters.department !== 'all' ? filters.department : '',
    filters.includeArchived ?? false,
  ] as const;
}

export type EmployeesPageResult = {
  employees: Employee[];
  total: number;
  page: number;
  pageSize: number;
};

function mapPage(rows: HrmEmployeeRecord[]): Employee[] {
  return dedupeEmployeesById(rows.map(mapHrmEmployeeRecord)).filter((e) => e.deleted_at == null);
}

export function useEmployeesPage(
  companyIdFilter?: string | null,
  filters: EmployeesPageFilters = {},
  opts?: { enabled?: boolean },
) {
  const enabled = opts?.enabled !== false;
  const { currentCompanyId } = useAuth();
  const queryClient = useQueryClient();

  const targetCompanyId =
    companyIdFilter === undefined || companyIdFilter === null || companyIdFilter === ''
      ? currentCompanyId
      : companyIdFilter;

  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(
    Math.max(1, filters.pageSize ?? HRM_EMPLOYEES_TABLE_PAGE_SIZE),
    100,
  );
  const keyword = filters.keyword?.trim() || undefined;
  const status =
    filters.status && filters.status !== 'all' ? filters.status : undefined;
  const department =
    filters.department && filters.department !== 'all' ? filters.department : undefined;
  const includeArchived = filters.includeArchived ?? false;

  const queryKey = buildEmployeesPageQueryKey(targetCompanyId, {
    page,
    pageSize,
    keyword,
    status,
    department,
    includeArchived,
  });

  const query = useQuery({
    queryKey,
    queryFn: async (): Promise<EmployeesPageResult> => {
      if (!targetCompanyId) {
        return { employees: [], total: 0, page, pageSize };
      }
      try {
        const res = await listEmployees({
          company_id: coerceHrmListCompanyId(targetCompanyId),
          page,
          page_size: pageSize,
          keyword,
          status,
          department,
          include_archived: includeArchived || undefined,
        } as any);
        return {
          employees: mapPage(res.data ?? []),
          total: res.total ?? 0,
          page: res.page ?? page,
          pageSize: res.page_size ?? pageSize,
        };
      } catch (error: unknown) {
        console.error('Error fetching employees page:', error);
        toast.error(toErrorMessage(error, 'Không thể tải danh sách nhân viên'));
        throw error;
      }
    },
    enabled: enabled && !!targetCompanyId,
    staleTime: 60_000,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });

  const invalidatePages = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: [EMPLOYEES_PAGE_QUERY_KEY] });
  }, [queryClient]);

  const { createEmployee, updateEmployee, softDeleteEmployee, restoreEmployee } =
    useEmployeeMutations({
      onMutated: invalidatePages,
    });

  const employees = query.data?.employees ?? [];
  const total = query.data?.total ?? 0;
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / pageSize) || 1),
    [total, pageSize],
  );

  return {
    employees,
    total,
    page,
    pageSize,
    totalPages,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isPlaceholderData: query.isPlaceholderData,
    createEmployee,
    updateEmployee,
    softDeleteEmployee,
    restoreEmployee,
    refetch: query.refetch,
    invalidatePages,
    queryKey,
  };
}

export type { Employee, EmployeeFormData };
