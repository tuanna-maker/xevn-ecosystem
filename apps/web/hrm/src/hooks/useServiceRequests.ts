/**
 * @CODE-MEMORY
 * Screen:     /internal-services — Dịch vụ nội bộ
 * UC:         HRM-SV-02
 * BR:         list service-requests by company
 * SRS:        docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md § internal_services
 * TechSpec:   GET /api/hrm/operations/service-requests
 * Purpose:    React Query list + mutations for meal/vehicle/supply requests.
 *             Exposes fetchError for non-2xx (RATE-429) so UI never silent-empty.
 * WorkItem:   D-P1-HRM-INTSVC-429-SILENT-EMPTY-01
 * Coded:      2026-07-17
 *
 * Callers: apps/web/hrm/src/pages/InternalServices.tsx
 * Callees: listServiceRequestsApi → GET /operations/service-requests
 * must_keep: isError/fetchError surfaced; retry via refetch
 * LastVerified: apps/web/hrm/src/lib/hrmListLoadFailure.test.ts
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { toErrorMessage } from '@/lib/apiError';
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
  supply_items: unknown;
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
      if (!currentCompanyId) return [] as ServiceRequest[];
      return (await listServiceRequestsApi({
        company_id: currentCompanyId,
        service_type: serviceType,
      })) as unknown as ServiceRequest[];
    },
    enabled: !!currentCompanyId,
    retry: (failureCount, error) => {
      // Do not hammer rate-limited hosts
      const msg = toErrorMessage(error, '');
      if (msg.includes('429') || msg.includes('giới hạn tần suất')) return false;
      return failureCount < 1;
    },
  });

  const fetchError = query.isError
    ? toErrorMessage(query.error, 'Không thể tải danh sách dịch vụ nội bộ')
    : null;

  const addRequest = useMutation({
    mutationFn: async (item: Partial<ServiceRequest>) => {
      await createServiceRequestApi({ ...item, company_id: currentCompanyId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-requests'] });
      toast.success('Đã tạo yêu cầu thành công');
    },
    onError: (e: unknown) => toast.error(toErrorMessage(e, 'Không thể tạo yêu cầu')),
  });

  const updateRequest = useMutation({
    mutationFn: async ({ id, ...data }: Partial<ServiceRequest> & { id: string }) => {
      await updateServiceRequestApi(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-requests'] });
      toast.success('Đã cập nhật thành công');
    },
    onError: (e: unknown) => toast.error(toErrorMessage(e, 'Không thể cập nhật yêu cầu')),
  });

  const deleteRequest = useMutation({
    mutationFn: async (id: string) => {
      await deleteServiceRequestApi(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-requests'] });
      toast.success('Đã xóa yêu cầu');
    },
    onError: (e: unknown) => toast.error(toErrorMessage(e, 'Không thể xóa yêu cầu')),
  });

  const approveRequest = useMutation({
    mutationFn: async ({ id, approved_by }: { id: string; approved_by: string }) => {
      await approveServiceRequestApi(id, { approved_by });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-requests'] });
      toast.success('Đã duyệt yêu cầu');
    },
    onError: (e: unknown) => toast.error(toErrorMessage(e, 'Không thể duyệt yêu cầu')),
  });

  const rejectRequest = useMutation({
    mutationFn: async ({ id, rejected_reason }: { id: string; rejected_reason: string }) => {
      await rejectServiceRequestApi(id, { rejected_reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-requests'] });
      toast.success('Đã từ chối yêu cầu');
    },
    onError: (e: unknown) => toast.error(toErrorMessage(e, 'Không thể từ chối yêu cầu')),
  });

  return {
    ...query,
    fetchError,
    addRequest,
    updateRequest,
    deleteRequest,
    approveRequest,
    rejectRequest,
  };
}
