import type { HrmJobRequisition } from '@/integrations/hrmApi';

export type JobRequisitionUiStatus = 'active' | 'paused' | 'closed';

export function mapRequisitionStatus(status: HrmJobRequisition['status']): JobRequisitionUiStatus {
  if (status === 'open') return 'active';
  if (status === 'on_hold') return 'paused';
  return 'closed';
}

export function nestStatusMatchesFilter(
  nestStatus: HrmJobRequisition['status'],
  filter: JobRequisitionUiStatus,
): boolean {
  return mapRequisitionStatus(nestStatus) === filter;
}

export const REQUISITION_STATUS_LABEL_VI: Record<HrmJobRequisition['status'], string> = {
  open: 'Đang tuyển',
  on_hold: 'Tạm dừng',
  closed: 'Đã đóng',
};

export const EMPLOYMENT_TYPE_OPTIONS = [
  { value: 'full_time', label: 'Toàn thời gian' },
  { value: 'part_time', label: 'Bán thời gian' },
  { value: 'contract', label: 'Hợp đồng' },
  { value: 'intern', label: 'Thực tập' },
] as const;
