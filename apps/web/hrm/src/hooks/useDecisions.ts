/**
 * @CODE-MEMORY
 * Screen:     /decisions — Quyết định nhân sự list/create dialog
 * UC:          UC-HRM-27
 * BR:          BR-DEC-01, BR-DEC-03, BR-DEC-06
 * SRS:         docs/hrm/SRS.md § UC-HRM-27
 * TechSpec:    docs/hrm/TECHSPEC.md §11.2–11.4
 * Purpose:     Owns the live HRM decisions list and employee picker data used by the
 *              create/edit dialog, with request coalescing and dialog-gated picker loading.
 * WorkItem:    PERF-HRM-DEC-01
 * Coded:       2026-07-17
 *
 * Callers:
 *   - apps/web/hrm/src/pages/Decisions.tsx → useDecisions()
 *
 * Callees:
 *   - decisions query → listHrDecisions() → GET /api/hrm/decisions → hr_decisions
 *   - employee query → listEmployees() → GET /api/hrm/employees → employees
 *   - mutations → create/update/deleteHrDecision() → HRM decisions APIs
 *
 * FE-Actions:
 *   | User action        | Handler              | Lib / API                     |
 *   |--------------------|----------------------|-------------------------------|
 *   | Open decisions     | useDecisions query   | listHrDecisions               |
 *   | Open create/edit   | employee query       | listEmployees                 |
 *   | Save/delete        | mutation methods     | HRM decision write APIs       |
 *
 * BE-Chain: GET/POST/PATCH/DELETE /api/hrm/decisions → hr_decisions;
 *           GET /api/hrm/employees → employees
 * Impact:      Duplicate mount requests and eager employee loading delay the embedded menu.
 * must_keep:   Live-empty behavior, scope-aware company_id, no mock fallback, post-write refresh.
 * SOLID:       This hook isolates decisions server state and dialog-only picker state from page UI.
 * LastVerified: apps/web/hrm/src/hooks/useDecisions.test.ts
 */
import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { shouldSkipSupabaseDataFetches, HRM_API_MAX_PAGE_SIZE } from '@/lib/hrmDataMode';
import { toErrorMessage } from '@/lib/apiError';
import {
  createHrDecision,
  deleteHrDecision,
  listEmployees,
  listHrDecisions,
  updateHrDecision,
  type HrmDecisionRecord,
} from '@/integrations/hrmApi';
import { toast } from 'sonner';

export type DecisionRecord = {
  id: string;
  decision_code: string;
  decision_type: string;
  title: string;
  content: string | null;
  employee_id: string | null;
  employee_name: string;
  employee_code: string | null;
  department: string | null;
  position: string | null;
  effective_date: string | null;
  expiry_date: string | null;
  signer_name: string | null;
  signer_position: string | null;
  signing_date: string | null;
  file_url: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  company_id: string;
};

export type DecisionFormPayload = {
  decision_code: string;
  decision_type: string;
  title: string;
  content: string;
  employee_id: string;
  employee_name: string;
  employee_code: string;
  department: string;
  position: string;
  effective_date: Date | undefined;
  expiry_date: Date | undefined;
  signer_name: string;
  signer_position: string;
  signing_date: Date | undefined;
  file_url: string;
  status: string;
  notes: string;
};

export type DecisionEmployeeOption = {
  id: string;
  full_name: string;
  employee_code: string | null;
  department: string | null;
  position: string | null;
  avatar_url: string | null;
};

function mapApiRow(row: HrmDecisionRecord): DecisionRecord {
  return {
    id: row.id,
    decision_code: row.decision_code,
    decision_type: row.decision_type,
    title: row.title,
    content: row.content,
    employee_id: row.employee_id,
    employee_name: row.employee_name,
    employee_code: row.employee_code,
    department: row.department,
    position: row.position,
    effective_date: row.effective_date,
    expiry_date: row.expiry_date,
    signer_name: row.signer_name,
    signer_position: row.signer_position,
    signing_date: row.signing_date,
    file_url: row.file_url,
    status: row.status,
    notes: row.notes,
    created_at: row.created_at,
    company_id: row.company_id,
  };
}

function fmtDate(d: Date | undefined): string | null {
  return d ? format(d, 'yyyy-MM-dd') : null;
}

function toApiPayload(companyId: string, data: DecisionFormPayload) {
  return {
    company_id: companyId,
    decision_code: data.decision_code,
    decision_type: data.decision_type,
    title: data.title,
    content: data.content || undefined,
    employee_id: data.employee_id || undefined,
    employee_name: data.employee_name,
    employee_code: data.employee_code || undefined,
    department: data.department || undefined,
    position: data.position || undefined,
    effective_date: fmtDate(data.effective_date) ?? undefined,
    expiry_date: fmtDate(data.expiry_date) ?? undefined,
    signer_name: data.signer_name || undefined,
    signer_position: data.signer_position || undefined,
    signing_date: fmtDate(data.signing_date) ?? undefined,
    file_url: data.file_url || undefined,
    status: data.status,
    notes: data.notes || undefined,
  };
}

export function useDecisions(
  selectedType: string = 'all',
  options?: { loadEmployees?: boolean },
) {
  const { currentCompanyId } = useAuth();
  const useApiMode = shouldSkipSupabaseDataFetches();
  const queryClient = useQueryClient();
  const loadEmployees = options?.loadEmployees === true;

  const decisionsQuery = useQuery({
    queryKey: ['hrm-decisions', currentCompanyId, selectedType],
    queryFn: async () => {
      if (!currentCompanyId) return [];
      const response = await listHrDecisions({
        company_id: currentCompanyId,
        decision_type: selectedType !== 'all' ? selectedType : undefined,
      });
      return response.data.map(mapApiRow);
    },
    enabled: Boolean(currentCompanyId),
    staleTime: 30_000,
  });

  const employeesQuery = useQuery({
    queryKey: ['hrm-decision-employees', currentCompanyId],
    queryFn: async () => {
      if (!currentCompanyId) return [];
      const response = await listEmployees({
        company_id: currentCompanyId,
        page_size: HRM_API_MAX_PAGE_SIZE,
      });
      return (response.data ?? []).map((employee) => ({
        id: employee.id,
        full_name: employee.full_name,
        employee_code: employee.employee_code ?? null,
        department:
          (employee.custom_fields as { department?: string } | undefined)?.department ??
          employee.job_title_key ??
          null,
        position: employee.job_title_key ?? null,
        avatar_url: null,
      }));
    },
    enabled: Boolean(currentCompanyId) && loadEmployees,
    staleTime: 5 * 60_000,
  });

  const fetchError = decisionsQuery.error
    ? toErrorMessage(decisionsQuery.error, 'Không thể tải quyết định nhân sự')
    : null;

  useEffect(() => {
    if (fetchError) toast.error(fetchError);
  }, [fetchError]);

  const refreshDecisions = async () => {
    await queryClient.invalidateQueries({
      queryKey: ['hrm-decisions', currentCompanyId],
    });
  };

  const createDecision = async (data: DecisionFormPayload): Promise<boolean> => {
    if (!currentCompanyId) return false;
    try {
      {
        await createHrDecision(toApiPayload(currentCompanyId, data));
      }
      toast.success('Tạo quyết định thành công');
      await refreshDecisions();
      return true;
    } catch (err: unknown) {
      toast.error(toErrorMessage(err, 'Không thể tạo quyết định'));
      return false;
    }
  };

  const updateDecision = async (id: string, data: DecisionFormPayload): Promise<boolean> => {
    if (!currentCompanyId) return false;
    try {
      {
        await updateHrDecision(id, toApiPayload(currentCompanyId, data));
      }
      toast.success('Cập nhật quyết định thành công');
      await refreshDecisions();
      return true;
    } catch (err: unknown) {
      toast.error(toErrorMessage(err, 'Không thể cập nhật quyết định'));
      return false;
    }
  };

  const removeDecision = async (id: string): Promise<boolean> => {
    if (!currentCompanyId) return false;
    try {
      {
        await deleteHrDecision(id, currentCompanyId);
      }
      toast.success('Xóa quyết định thành công');
      await refreshDecisions();
      return true;
    } catch (err: unknown) {
      toast.error(toErrorMessage(err, 'Không thể xóa quyết định'));
      return false;
    }
  };

  const removeDecisions = async (ids: string[]): Promise<boolean> => {
    for (const id of ids) {
      const ok = await removeDecision(id);
      if (!ok) return false;
    }
    return true;
  };

  return {
    decisions: decisionsQuery.data ?? [],
    employees: employeesQuery.data ?? [],
    isLoading: decisionsQuery.isLoading,
    isLoadingEmployees: employeesQuery.isLoading,
    fetchError,
    useApiMode,
    refetch: decisionsQuery.refetch,
    createDecision,
    updateDecision,
    removeDecision,
    removeDecisions,
  };
}
