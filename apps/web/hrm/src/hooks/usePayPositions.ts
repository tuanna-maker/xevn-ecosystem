import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  listPayPositions, 
  createPayPosition, 
  listDepartmentPositions,
  upsertDepartmentPosition,
  removeDepartmentPosition,
  type HrmPayPositionRecord,
  type HrmDepartmentPositionRecord
} from '@/integrations/hrmApi';
import { useAuth } from '@/contexts/AuthContext';

export const POSITIONS_QUERY_KEY = 'pay-positions';
export const DEPT_POSITIONS_QUERY_KEY = 'dept-positions';

export function usePayPositions(opts?: { companyId?: string }) {
  const queryClient = useQueryClient();
  const { currentCompanyId } = useAuth();
  const companyId = opts?.companyId || currentCompanyId;

  const query = useQuery({
    queryKey: [POSITIONS_QUERY_KEY, companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const res = await listPayPositions({ company_id: companyId });
      return res.data || [];
    },
    enabled: !!companyId,
  });

  const createPosition = useMutation({
    mutationFn: async (payload: Omit<Parameters<typeof createPayPosition>[0], 'company_id'>) => {
      if (!companyId) throw new Error('No company ID');
      return createPayPosition({ ...payload, company_id: companyId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [POSITIONS_QUERY_KEY, companyId] });
    }
  });

  return {
    positions: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    createPosition
  };
}

export function useDepartmentPositions(departmentId: string | undefined, opts?: { companyId?: string }) {
  const queryClient = useQueryClient();
  const { currentCompanyId } = useAuth();
  const companyId = opts?.companyId || currentCompanyId;

  const query = useQuery({
    queryKey: [DEPT_POSITIONS_QUERY_KEY, departmentId, companyId],
    queryFn: async () => {
      if (!departmentId || !companyId) return [];
      const res = await listDepartmentPositions(departmentId, { company_id: companyId });
      return res.data || [];
    },
    enabled: !!departmentId && !!companyId,
  });

  const upsertPosition = useMutation({
    mutationFn: async (payload: { position_code: string; local_name?: string | null; grade_code_override?: string | null }) => {
      if (!departmentId || !companyId) throw new Error('Missing dept/company ID');
      return upsertDepartmentPosition(departmentId, { ...payload, company_id: companyId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DEPT_POSITIONS_QUERY_KEY, departmentId, companyId] });
    }
  });

  const removePosition = useMutation({
    mutationFn: async (positionCode: string) => {
      if (!departmentId || !companyId) throw new Error('Missing dept/company ID');
      return removeDepartmentPosition(departmentId, positionCode, companyId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DEPT_POSITIONS_QUERY_KEY, departmentId, companyId] });
    }
  });

  return {
    departmentPositions: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    upsertPosition,
    removePosition
  };
}
