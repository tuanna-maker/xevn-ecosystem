import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
      const { data, error } = await supabase
        .from('company_processes' as any)
        .select('*')
        .eq('company_id', currentCompanyId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as CompanyProcess[];
    },
    enabled: !!currentCompanyId,
  });

  const addProcess = useMutation({
    mutationFn: async (item: Partial<CompanyProcess>) => {
      const { error } = await supabase
        .from('company_processes' as any)
        .insert({ ...item, company_id: currentCompanyId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-processes'] });
      toast.success('Đã thêm thành công');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateProcess = useMutation({
    mutationFn: async ({ id, ...data }: Partial<CompanyProcess> & { id: string }) => {
      const { error } = await supabase
        .from('company_processes' as any)
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-processes'] });
      toast.success('Đã cập nhật thành công');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteProcess = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('company_processes' as any)
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-processes'] });
      toast.success('Đã xóa thành công');
    },
    onError: (e: any) => toast.error(e.message),
  });

  return { ...query, addProcess, updateProcess, deleteProcess };
}
