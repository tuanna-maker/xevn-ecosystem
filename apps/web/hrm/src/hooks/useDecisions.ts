import { useCallback, useEffect, useState } from 'react';
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

export function useDecisions(selectedType: string = 'all') {
  const { currentCompanyId, user } = useAuth();
  const useApiMode = shouldSkipSupabaseDataFetches();
  const [decisions, setDecisions] = useState<DecisionRecord[]>([]);
  const [employees, setEmployees] = useState<DecisionEmployeeOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!currentCompanyId) {
      setDecisions([]);
      setEmployees([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setFetchError(null);
    try {
      {
        const [decRes, empRes] = await Promise.all([
          listHrDecisions({
            company_id: currentCompanyId,
            decision_type: selectedType !== 'all' ? selectedType : undefined,
          }),
          listEmployees({ company_id: currentCompanyId, page_size: HRM_API_MAX_PAGE_SIZE }),
        ]);
        setDecisions(decRes.data.map(mapApiRow));
        setEmployees(
          (empRes.data ?? []).map((e) => ({
            id: e.id,
            full_name: e.full_name,
            employee_code: e.employee_code ?? null,
            department:
              (e.custom_fields as { department?: string } | undefined)?.department ??
              e.job_title_key ??
              null,
            position: e.job_title_key ?? null,
            avatar_url: null,
          })),
        );
        return;
      }

    } catch (err: unknown) {
      setDecisions([]);
      const msg = toErrorMessage(err, 'Không thể tải quyết định nhân sự');
      setFetchError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [currentCompanyId, selectedType, useApiMode]);

  useEffect(() => {
    void load();
  }, [load]);

  const createDecision = async (data: DecisionFormPayload): Promise<boolean> => {
    if (!currentCompanyId) return false;
    try {
      {
        await createHrDecision(toApiPayload(currentCompanyId, data));
      }
      toast.success('Tạo quyết định thành công');
      await load();
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
      await load();
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
      await load();
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
    decisions,
    employees,
    isLoading,
    fetchError,
    useApiMode,
    refetch: load,
    createDecision,
    updateDecision,
    removeDecision,
    removeDecisions,
  };
}
