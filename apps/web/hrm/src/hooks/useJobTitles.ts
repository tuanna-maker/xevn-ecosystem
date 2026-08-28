import { useQuery } from '@tanstack/react-query';
import { listJobTitles, type HrmJobTitleRecord } from '@/integrations/hrmApi';
import { useAuth } from '@/contexts/AuthContext';

export const JOB_TITLES_QUERY_KEY = 'hrm-job-titles';

export function useJobTitles(opts?: { enabled?: boolean }) {
  const { currentCompanyId } = useAuth();
  const enabled = opts?.enabled !== false && !!currentCompanyId;

  return useQuery({
    queryKey: [JOB_TITLES_QUERY_KEY, currentCompanyId],
    queryFn: async () => {
      const data = await listJobTitles({ status: 'active' });
      return data || [];
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}
