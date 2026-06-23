import { statusLabel } from '../integrations/mapApiError';
import { resolvePriorityLabel } from './profileTask';

const SERVICE_TYPE_LABELS: Record<string, string> = {
  parking: 'Bãi đỗ xe',
  locker: 'Tủ locker',
  uniform: 'Đồng phục',
  equipment: 'Thiết bị',
  transport: 'Đưa đón',
};

const TASK_STATUS_LABELS: Record<string, string> = {
  open: 'Đang mở',
  in_progress: 'Đang làm',
  done: 'Hoàn thành',
  cancelled: 'Đã huỷ',
};

export function resolveServiceTypeLabel(serviceType: string | null | undefined): string {
  const key = serviceType?.trim().toLowerCase() ?? '';
  if (!key) return 'Yêu cầu dịch vụ';
  return SERVICE_TYPE_LABELS[key] ?? key.replace(/_/g, ' ');
}

export function resolveTaskStatusLabel(status: string | null | undefined): string {
  const key = status?.trim().toLowerCase() ?? '';
  if (!key) return '—';
  return TASK_STATUS_LABELS[key] ?? statusLabel(key);
}

export function resolveOpsPriorityLabel(priority: string | null | undefined): string {
  const key = priority?.trim().toLowerCase() ?? '';
  if (key === 'high' || key === 'urgent') return resolvePriorityLabel('high');
  if (key === 'low') return resolvePriorityLabel('low');
  return resolvePriorityLabel('normal');
}
