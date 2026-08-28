import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GradeAPI, Grade } from '@/lib/api/hrm-policy-api';

export const GRADES_QUERY_KEY = 'payroll-grades';

export function useGrades() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [GRADES_QUERY_KEY],
    queryFn: async () => {
      return GradeAPI.list();
    },
  });

  const upsertGrade = useMutation({
    mutationFn: async (data: Omit<Grade, 'id'> & { id?: string }) => {
      return GradeAPI.upsert(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GRADES_QUERY_KEY] });
    }
  });

  return {
    grades: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    upsertGrade
  };
}
