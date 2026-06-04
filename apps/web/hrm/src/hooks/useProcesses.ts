import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface CompanyProcess {
  id: string;
  company_id: string;
  type: string;
  name: string;
  code: string | null;
  category: string | null;
  department: string | null;
  description: string | null;
  content: string | null;
  steps: any;
  status: string;
  effective_date: string | null;
  expiry_date: string | null;
  version: number;
  issuing_authority: string | null;
  file_urls: string[];
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export function useProcesses() {
  const { currentCompanyId } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['company-processes', currentCompanyId],
    queryFn: async () => {
      if (!currentCompanyId) return [];
      return [] as unknown as CompanyProcess[];
    },
    enabled: !!currentCompanyId,
  });

  const addProcess = useMutation({
    mutationFn: async (item: Partial<CompanyProcess>) => {
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-processes'] });
      toast.success('Đã thêm thành công');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateProcess = useMutation({
    mutationFn: async ({ id, ...data }: Partial<CompanyProcess> & { id: string }) => {
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-processes'] });
      toast.success('Đã cập nhật thành công');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteProcess = useMutation({
    mutationFn: async (id: string) => {
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-processes'] });
      toast.success('Đã xóa thành công');
    },
    onError: (e: any) => toast.error(e.message),
  });

  return { ...query, addProcess, updateProcess, deleteProcess };
}
