import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface ServiceRequest {
  id: string;
  company_id: string;
  service_type: string;
  employee_id: string | null;
  employee_name: string;
  employee_code: string | null;
  department: string | null;
  request_date: string;
  status: string;
  notes: string | null;
  meal_type: string | null;
  meal_date: string | null;
  meal_quantity: number | null;
  vehicle_purpose: string | null;
  vehicle_destination: string | null;
  vehicle_date: string | null;
  vehicle_time_start: string | null;
  vehicle_time_end: string | null;
  vehicle_passengers: number | null;
  supply_items: any;
  supply_urgency: string | null;
  approved_by: string | null;
  approved_at: string | null;
  rejected_reason: string | null;
  created_at: string;
  updated_at: string;
}

export function useServiceRequests(serviceType?: string) {
  const { currentCompanyId } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['service-requests', currentCompanyId, serviceType],
    queryFn: async () => {
      if (!currentCompanyId) return [];
      let q = supabase
        .from('service_requests' as any)
        .select('*')
        .eq('company_id', currentCompanyId)
        .order('created_at', { ascending: false });
      if (serviceType) q = q.eq('service_type', serviceType);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as unknown as ServiceRequest[];
    },
    enabled: !!currentCompanyId,
  });

  const addRequest = useMutation({
    mutationFn: async (item: Partial<ServiceRequest>) => {
      const { error } = await supabase
        .from('service_requests' as any)
        .insert({ ...item, company_id: currentCompanyId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-requests'] });
      toast.success('Đã tạo yêu cầu thành công');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateRequest = useMutation({
    mutationFn: async ({ id, ...data }: Partial<ServiceRequest> & { id: string }) => {
      const { error } = await supabase
        .from('service_requests' as any)
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-requests'] });
      toast.success('Đã cập nhật thành công');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteRequest = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('service_requests' as any)
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-requests'] });
      toast.success('Đã xóa yêu cầu');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const approveRequest = useMutation({
    mutationFn: async ({ id, approved_by }: { id: string; approved_by: string }) => {
      const { error } = await supabase
        .from('service_requests' as any)
        .update({ status: 'approved', approved_by, approved_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-requests'] });
      toast.success('Đã duyệt yêu cầu');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const rejectRequest = useMutation({
    mutationFn: async ({ id, rejected_reason }: { id: string; rejected_reason: string }) => {
      const { error } = await supabase
        .from('service_requests' as any)
        .update({ status: 'rejected', rejected_reason })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-requests'] });
      toast.success('Đã từ chối yêu cầu');
    },
    onError: (e: any) => toast.error(e.message),
  });

  return { ...query, addRequest, updateRequest, deleteRequest, approveRequest, rejectRequest };
}
