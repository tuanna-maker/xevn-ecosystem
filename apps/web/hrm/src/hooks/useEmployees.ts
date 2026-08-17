/**
 * @CODE-MEMORY
 * Screen:     Pickers / satellite menus needing employee options
 * UC:          UC-HRM-SCOPE-03
 * BR:          BR-INT-05
 * SRS:         docs/hrm/SRS.md §15.2, §15.5
 * TechSpec:    docs/hrm/TECHSPEC.md §11.2, §12
 * Purpose:     Capped employee collection for satellite pickers (attendance, payroll, …).
 *              Single page via listEmployees — never listAllEmployees (ADR W2).
 *              Employees **table** must use useEmployeesPage (RQ server page) — W1.
 *              Callers should pass `{ enabled }` to defer fetch until dialog/tab needs data.
 * WorkItem:    P1-HRM-EMP-DUP-KEY-FE / P1-HRM-PERF-FE-02
 * Coded:       2026-07-16
 *
 * @CODE-MEMORY-CHANGE 2026-07-17 P1-HRM-SCALE-FE-W1
 *   Employees.tsx no longer calls this hook on mount; table uses useEmployeesPage.
 *   Keep dedupeEmployeesById export for page + full-merge consumers.
 *
 * @CODE-MEMORY-CHANGE 2026-07-17 P1-HRM-SCALE-FE-W2
 *   Replace listAllEmployees multi-page dump with capped listEmployees (page=1).
 *   Wire React Query so attendance/payroll tabs share one in-flight GET.
 *   Export total/isCapped for explicit truncated-picker UX.
 *
 * @CODE-MEMORY-CHANGE 2026-07-19 CD-FB-04-PERF-FIX / P1-HRM-PERF-FE-02
 *   Document enabled-gate pattern for dialog consumers (TaskFormDialog, InternalServices).
 *   Profile must not import this hook for list — useEmployeeMutations only.
 *
 * @CODE-MEMORY-CHANGE 2026-08-03 R-SPINE-MGR-HIER-01-FE
 * change_mode: ADD
 * What: EmployeeFormData.manager_id + Employee.manager_label (display-ready)
 * Why: UC-H01 Option B wire QL trực tiếp → POST/PATCH manager_id
 * must_keep: picker cap W2; SoftDel; leave approve UX untouched
 *
 * Callers:
 *   - Satellite pickers (attendance/payroll/tasks) → useEmployees(..., { enabled })
 *   - NOT Employees.tsx table (use useEmployeesPage)
 *   - NOT EmployeeProfile list mount
 *
 * Callees:
 *   - fetchEmployeePickerPage → listEmployees (single page)
 *   - mutations → useEmployeeMutations() → HRM employee write APIs
 *
 * FE-Actions:
 *   | User action          | Handler          | Lib / API                    |
 *   |----------------------|------------------|------------------------------|
 *   | Open picker          | useQuery         | fetchEmployeePickerPage      |
 *   | Create/update/archive| mutation methods | useEmployeeMutations         |
 *
 * BE-Chain: GET /api/hrm/employees → employees; write APIs → employees
 * Impact:      Duplicate IDs can crash React row identity; full merge fans ~12× at 1k NV.
 * must_keep:   Stable first-wins ordering, archived split, API pagination, and backend-owned totals.
 * SOLID:       Capped picker hook; paged table lives in useEmployeesPage.
 * LastVerified: apps/web/hrm/src/hooks/useEmployees.pickerCap.test.ts
 */
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { toErrorMessage } from '@/lib/apiError';
import { getHrmPortalMode } from '@/lib/hrmPortalMode';
import { HRM_API_MAX_PAGE_SIZE } from '@/lib/hrmDataMode';
import { coerceHrmListCompanyId } from '@/lib/hrmListScope';
import { mapHrmEmployeeRecord } from '@/hooks/useEmployee';
import { useEmployeeMutations } from '@/hooks/useEmployeeMutations';
import {
  EMPLOYEE_PICKER_QUERY_KEY,
  fetchEmployeePickerPage,
  HRM_EMPLOYEE_PICKER_PAGE_SIZE,
} from '@/hooks/useEmployeePicker';

export interface Employee {
  id: string;
  company_id: string;
  /** Legal-entity / ĐVTV label from API when present (AC-EMP-COL-01). */
  company_display_name?: string | null;
  employee_code: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  department: string | null;
  position: string | null;
  /** API job_title_key — display only via resolveJobTitleDisplayLabel (never raw on UI). */
  job_title_key?: string | null;
  start_date: string | null;
  end_date: string | null;
  status: string;
  avatar_url: string | null;
  salary: number | null;
  manager_id: string | null;
  /** Display-ready QL trực tiếp (U72) when BE/FE resolved — never raw UUID alone. */
  manager_label?: string | null;
  gender: string | null;
  birth_date: string | null;
  id_number: string | null;
  id_issue_date: string | null;
  id_issue_place: string | null;
  permanent_address: string | null;
  temporary_address: string | null;
  emergency_contact: string | null;
  emergency_phone: string | null;
  employment_type: string | null;
  work_location: string | null;
  bank_name: string | null;
  bank_account: string | null;
  tax_code: string | null;
  social_insurance_number: string | null;
  health_insurance_number: string | null;
  custom_fields?: Record<string, string>;
  deleted_at: string | null;
  deleted_by: string | null;
  delete_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmployeeFormData {
  employee_code: string;
  full_name: string;
  email?: string | null;
  phone?: string | null;
  department?: string | null;
  position?: string | null;
  /** Direct manager employee UUID (FR-UC-H01); null clears. */
  manager_id?: string | null;
  start_date?: string | null;
  salary?: number | null;
  status?: string;
  avatar_url?: string | null;
  gender?: string | null;
  birth_date?: string | null;
  id_number?: string | null;
  id_issue_date?: string | null;
  id_issue_place?: string | null;
  permanent_address?: string | null;
  temporary_address?: string | null;
  emergency_contact?: string | null;
  emergency_phone?: string | null;
  employment_type?: string | null;
  work_location?: string | null;
  bank_name?: string | null;
  bank_account?: string | null;
  tax_code?: string | null;
  social_insurance_number?: string | null;
  health_insurance_number?: string | null;
  custom_fields?: Record<string, string>;
}

export function dedupeEmployeesById<T extends Pick<Employee, 'id'>>(items: readonly T[]): T[] {
  const seenIds = new Set<string>();

  return items.filter((item) => {
    if (seenIds.has(item.id)) {
      return false;
    }

    seenIds.add(item.id);
    return true;
  });
}

type UseEmployeesOpts = { enabled?: boolean };

function isUseEmployeesOpts(value: unknown): value is UseEmployeesOpts {
  return (
    value != null &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    ('enabled' in (value as Record<string, unknown>) ||
      Object.keys(value as object).length === 0)
  );
}

/**
 * Normalize call shapes:
 * - useEmployees()
 * - useEmployees(false, companyId, { enabled })
 * - useEmployees(undefined, { enabled }) — InternalServices defer pattern
 */
function normalizeUseEmployeesArgs(
  includeDeletedArg: boolean | undefined,
  companyIdFilterOrOpts?: string | null | UseEmployeesOpts,
  optsArg?: UseEmployeesOpts,
): { includeDeleted: boolean; companyIdFilter?: string | null; enabled: boolean } {
  if (isUseEmployeesOpts(companyIdFilterOrOpts)) {
    return {
      includeDeleted: Boolean(includeDeletedArg),
      companyIdFilter: undefined,
      enabled: companyIdFilterOrOpts.enabled !== false,
    };
  }
  return {
    includeDeleted: Boolean(includeDeletedArg),
    companyIdFilter: companyIdFilterOrOpts,
    enabled: optsArg?.enabled !== false,
  };
}

export function useEmployees(
  includeDeleted: boolean = false,
  companyIdFilter?: string | null | UseEmployeesOpts,
  opts?: UseEmployeesOpts,
) {
  const { includeDeleted: includeArchived, companyIdFilter: filterId, enabled } =
    normalizeUseEmployeesArgs(includeDeleted, companyIdFilter, opts);

  const { currentCompanyId, memberships } = useAuth();
  const queryClient = useQueryClient();

  // Use specific filter, or null means all companies
  const targetCompanyId = filterId === undefined ? currentCompanyId : filterId;

  const companyIds = useMemo(() => {
    const portalEmbed =
      typeof window !== 'undefined' && getHrmPortalMode(window.location.search);
    const companyIdsRaw = targetCompanyId
      ? [targetCompanyId]
      : portalEmbed
        ? currentCompanyId
          ? [currentCompanyId]
          : []
        : memberships.map((m) => m.company_id);
    return [...new Set(companyIdsRaw.filter((id) => !!id && id !== 'all'))];
  }, [targetCompanyId, currentCompanyId, memberships]);

  const queryKey = useMemo(
    () =>
      [
        EMPLOYEE_PICKER_QUERY_KEY,
        'satellite',
        companyIds.slice().sort().join(','),
        includeArchived,
        HRM_API_MAX_PAGE_SIZE,
      ] as const,
    [companyIds, includeArchived],
  );

  const employeesQuery = useQuery({
    queryKey,
    queryFn: async () => {
      if (companyIds.length === 0) {
        return { rows: [] as Employee[], total: 0, isCapped: false };
      }

      const responses = await Promise.all(
        companyIds.map((companyId) =>
          fetchEmployeePickerPage({
            company_id: coerceHrmListCompanyId(companyId),
            include_archived: includeArchived,
            page_size: HRM_API_MAX_PAGE_SIZE,
          }),
        ),
      );

      const merged = responses.flatMap((res) => res.data).map(mapHrmEmployeeRecord);
      const uniqueEmployees = dedupeEmployeesById(merged);
      const total = responses.reduce((sum, res) => sum + res.total, 0);
      const isCapped = responses.some((res) => res.isCapped) || total > uniqueEmployees.length;

      return { rows: uniqueEmployees, total, isCapped };
    },
    enabled: enabled && companyIds.length > 0,
    staleTime: 60_000,
  });

  const toastedErrorRef = useRef<unknown>(null);
  useEffect(() => {
    if (!employeesQuery.error || toastedErrorRef.current === employeesQuery.error) return;
    toastedErrorRef.current = employeesQuery.error;
    console.error('Error fetching employees:', employeesQuery.error);
    toast.error(toErrorMessage(employeesQuery.error, 'Không thể tải danh sách nhân viên'));
  }, [employeesQuery.error]);

  const allRows = employeesQuery.data?.rows ?? [];
  const employees = allRows.filter((e) => e.deleted_at == null);
  const deletedEmployees = includeArchived
    ? allRows.filter((e) => e.deleted_at != null)
    : [];
  const total = employeesQuery.data?.total ?? employees.length;
  const isCapped = employeesQuery.data?.isCapped ?? false;

  const invalidatePicker = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: [EMPLOYEE_PICKER_QUERY_KEY] });
  }, [queryClient]);

  const fetchEmployees = useCallback(async () => {
    await employeesQuery.refetch();
  }, [employeesQuery]);

  const { createEmployee, updateEmployee, softDeleteEmployee, restoreEmployee } =
    useEmployeeMutations({
      onMutated: () => {
        invalidatePicker();
        void fetchEmployees();
      },
    });

  return {
    employees,
    deletedEmployees,
    isLoading:
      employeesQuery.isLoading ||
      (enabled && employeesQuery.isFetching && !employeesQuery.data),
    total,
    isCapped,
    /** Explicit UX: shown when picker page < workforce total. */
    pickerPageSize: HRM_API_MAX_PAGE_SIZE,
    pickerHintPageSize: HRM_EMPLOYEE_PICKER_PAGE_SIZE,
    createEmployee,
    updateEmployee,
    softDeleteEmployee,
    restoreEmployee,
    refetch: fetchEmployees,
  };
}
