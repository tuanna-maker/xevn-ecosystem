import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface ToolEquipment {
  id: string;
  company_id: string;
  code: string;
  name: string;
  category: string | null;
  brand: string | null;
  model: string | null;
  serial_number: string | null;
  specifications: string | null;
  unit: string;
  quantity: number;
  available_quantity: number;
  condition: string;
  location: string | null;
  purchase_date: string | null;
  purchase_price: number;
  warranty_expiry: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ToolAssignment {
  id: string;
  company_id: string;
  tool_id: string;
  employee_id: string | null;
  employee_name: string;
  employee_code: string | null;
  department: string | null;
  assignment_type: string;
  quantity: number;
  assignment_date: string;
  return_date: string | null;
  condition_on_assign: string | null;
  condition_on_return: string | null;
  notes: string | null;
  approved_by: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export function useToolsEquipment() {
  const { currentCompanyId } = useAuth();
  const queryClient = useQueryClient();

  const toolsQuery = useQuery({
    queryKey: ['tools-equipment', currentCompanyId],
    queryFn: async () => {
      if (!currentCompanyId) return [];
      const { data, error } = await supabase
        .from('tools_equipment' as any)
        .select('*')
        .eq('company_id', currentCompanyId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as ToolEquipment[];
    },
    enabled: !!currentCompanyId,
  });

  const assignmentsQuery = useQuery({
    queryKey: ['tool-assignments', currentCompanyId],
    queryFn: async () => {
      if (!currentCompanyId) return [];
      const { data, error } = await supabase
        .from('tool_assignments' as any)
        .select('*')
        .eq('company_id', currentCompanyId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as ToolAssignment[];
    },
    enabled: !!currentCompanyId,
  });

  const addTool = useMutation({
    mutationFn: async (item: Partial<ToolEquipment>) => {
      const { error } = await supabase
        .from('tools_equipment' as any)
        .insert({ ...item, company_id: currentCompanyId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tools-equipment'] });
      toast.success('Đã thêm CCDC thành công');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateTool = useMutation({
    mutationFn: async ({ id, ...data }: Partial<ToolEquipment> & { id: string }) => {
      const { error } = await supabase
        .from('tools_equipment' as any)
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tools-equipment'] });
      toast.success('Đã cập nhật CCDC');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteTool = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tools_equipment' as any)
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tools-equipment'] });
      toast.success('Đã xóa CCDC');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const addAssignment = useMutation({
    mutationFn: async (item: Partial<ToolAssignment>) => {
      const { error } = await supabase
        .from('tool_assignments' as any)
        .insert({ ...item, company_id: currentCompanyId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tool-assignments'] });
      toast.success('Đã tạo phiếu thành công');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateAssignment = useMutation({
    mutationFn: async ({ id, ...data }: Partial<ToolAssignment> & { id: string }) => {
      const { error } = await supabase
        .from('tool_assignments' as any)
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tool-assignments'] });
      toast.success('Đã cập nhật phiếu');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteAssignment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tool_assignments' as any)
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tool-assignments'] });
      toast.success('Đã xóa phiếu');
    },
    onError: (e: any) => toast.error(e.message),
  });

  return {
    tools: toolsQuery.data || [],
    assignments: assignmentsQuery.data || [],
    isLoading: toolsQuery.isLoading || assignmentsQuery.isLoading,
    addTool, updateTool, deleteTool,
    addAssignment, updateAssignment, deleteAssignment,
  };
}
