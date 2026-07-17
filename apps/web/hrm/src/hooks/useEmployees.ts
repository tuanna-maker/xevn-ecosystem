/**
 * @CODE-MEMORY
 * Screen:     Pickers / satellite menus needing full employee collection
 * UC:          UC-HRM-SCOPE-03
 * BR:          BR-INT-05
 * SRS:         docs/hrm/SRS.md §15.2, §15.5
 * TechSpec:    docs/hrm/TECHSPEC.md §11.2, §12
 * Purpose:     Legacy full-collection loader via listAllEmployees for pickers (attendance, payroll, …).
 *              Employees **table** must use useEmployeesPage (RQ server page) — P1-HRM-SCALE-FE-W1.
 * WorkItem:    P1-HRM-EMP-DUP-KEY-FE
 * Coded:       2026-07-16
 *
 * @CODE-MEMORY-CHANGE 2026-07-17 P1-HRM-SCALE-FE-W1
 *   Employees.tsx no longer calls this hook on mount; table uses useEmployeesPage.
 *   Keep dedupeEmployeesById export for page + full-merge consumers.
 *
 * Callers:
 *   - Satellite pickers (attendance/payroll/tasks) → useEmployees()
 *   - NOT Employees.tsx table (use useEmployeesPage)
 *
 * Callees:
 *   - fetchEmployees → listAllEmployeesApi() → GET /api/hrm/employees (multi-page)
 *   - mutations → useEmployeeMutations() → HRM employee write APIs
 *
 * FE-Actions:
 *   | User action          | Handler          | Lib / API                    |
 *   |----------------------|------------------|------------------------------|
 *   | Open picker needing all names | fetchEmployees | listAllEmployeesApi   |
 *   | Create/update/archive| mutation methods | useEmployeeMutations         |
 *
 * BE-Chain: GET /api/hrm/employees → employees; write APIs → employees
 * Impact:      Duplicate IDs can crash React row identity; full merge fans ~12× at 1k NV.
 * must_keep:   Stable first-wins ordering, archived split, API pagination, and backend-owned totals.
 * SOLID:       Full-collection hook for pickers; paged table lives in useEmployeesPage.
 * LastVerified: apps/web/hrm/src/hooks/useEmployees.dedupe.test.ts
 */
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { toErrorMessage } from '@/lib/apiError';
import { getHrmPortalMode } from '@/lib/hrmPortalMode';
import { HRM_API_MAX_PAGE_SIZE } from '@/lib/hrmDataMode';
import { coerceHrmListCompanyId } from '@/lib/hrmListScope';
import {
  listAllEmployees as listAllEmployeesApi,
  type HrmEmployeeRecord,
} from '@/integrations/hrmApi';
import { mapHrmEmployeeRecord } from '@/hooks/useEmployee';
import { useEmployeeMutations } from '@/hooks/useEmployeeMutations';

export interface Employee {
  id: string;
  company_id: string;
  employee_code: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  department: string | null;
  position: string | null;
  start_date: string | null;
  end_date: string | null;
  status: string;
  avatar_url: string | null;
  salary: number | null;
  manager_id: string | null;
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

export function useEmployees(
  includeDeleted: boolean = false,
  companyIdFilter?: string | null,
  opts?: { enabled?: boolean },
) {
  const enabled = opts?.enabled !== false;
  const { currentCompanyId, memberships } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [deletedEmployees, setDeletedEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Use specific filter, or null means all companies
  const targetCompanyId = companyIdFilter === undefined ? currentCompanyId : companyIdFilter;

  const mapEmployee = (row: HrmEmployeeRecord): Employee => mapHrmEmployeeRecord(row);

  const fetchEmployees = useCallback(async () => {
    const portalEmbed =
      typeof window !== 'undefined' && getHrmPortalMode(window.location.search);
    const companyIdsRaw = targetCompanyId
      ? [targetCompanyId]
      : portalEmbed
        ? currentCompanyId
          ? [currentCompanyId]
          : []
        : memberships.map((m) => m.company_id);
    const companyIds = [...new Set(companyIdsRaw.filter((id) => !!id && id !== 'all'))];

    if (companyIds.length === 0) {
      setEmployees([]);
      setDeletedEmployees([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const responses = await Promise.all(
        companyIds.map((companyId) =>
          listAllEmployeesApi({
            company_id: coerceHrmListCompanyId(companyId),
            include_archived: includeDeleted,
            page_size: HRM_API_MAX_PAGE_SIZE,
          }),
        ),
      );
      const merged = responses.flatMap((res) => res.data ?? []).map(mapEmployee);
      const uniqueEmployees = dedupeEmployeesById(merged);
      setEmployees(uniqueEmployees.filter((e) => e.deleted_at == null));
      setDeletedEmployees(
        includeDeleted ? uniqueEmployees.filter((e) => e.deleted_at != null) : [],
      );
    } catch (error: unknown) {
      console.error('Error fetching employees:', error);
      toast.error(toErrorMessage(error, 'Không thể tải danh sách nhân viên'));
    } finally {
      setIsLoading(false);
    }
  }, [targetCompanyId, includeDeleted, memberships, currentCompanyId]);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }
    void fetchEmployees();
  }, [fetchEmployees, enabled]);

  const { createEmployee, updateEmployee, softDeleteEmployee, restoreEmployee } = useEmployeeMutations({
    onMutated: fetchEmployees,
  });

  return {
    employees,
    deletedEmployees,
    isLoading,
    createEmployee,
    updateEmployee,
    softDeleteEmployee,
    restoreEmployee,
    refetch: fetchEmployees,
  };
}
