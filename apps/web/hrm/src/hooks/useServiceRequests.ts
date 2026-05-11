import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  approveServiceRequest as approveServiceRequestApi,
  createServiceRequest as createServiceRequestApi,
  deleteServiceRequest as deleteServiceRequestApi,
  listServiceRequests as listServiceRequestsApi,
  rejectServiceRequest as rejectServiceRequestApi,
  updateServiceRequest as updateServiceRequestApi,
} from '@/integrations/hrmApi';

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
      return await listServiceRequestsApi({
        company_id: currentCompanyId,
        service_type: serviceType,
      }) as unknown as ServiceRequest[];
    },
    enabled: !!currentCompanyId,
  });

  const addRequest = useMutation({
    mutationFn: async (item: Partial<ServiceRequest>) => {
      await createServiceRequestApi({ ...item, company_id: currentCompanyId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-requests'] });
      toast.success('Đã tạo yêu cầu thành công');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateRequest = useMutation({
    mutationFn: async ({ id, ...data }: Partial<ServiceRequest> & { id: string }) => {
      await updateServiceRequestApi(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-requests'] });
      toast.success('Đã cập nhật thành công');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteRequest = useMutation({
    mutationFn: async (id: string) => {
      await deleteServiceRequestApi(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-requests'] });
      toast.success('Đã xóa yêu cầu');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const approveRequest = useMutation({
    mutationFn: async ({ id, approved_by }: { id: string; approved_by: string }) => {
      await approveServiceRequestApi(id, { approved_by });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-requests'] });
      toast.success('Đã duyệt yêu cầu');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const rejectRequest = useMutation({
    mutationFn: async ({ id, rejected_reason }: { id: string; rejected_reason: string }) => {
      await rejectServiceRequestApi(id, { rejected_reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-requests'] });
      toast.success('Đã từ chối yêu cầu');
    },
    onError: (e: any) => toast.error(e.message),
  });

  return { ...query, addRequest, updateRequest, deleteRequest, approveRequest, rejectRequest };
}
