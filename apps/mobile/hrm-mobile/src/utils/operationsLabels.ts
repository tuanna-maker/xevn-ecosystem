/**
 * @CODE-MEMORY
 * Screen:     Operations — service_type / task status
 * UC:         UC-HRM-MOB ops · M-F-06 · AC-U72-MOB-GLOBAL
 * BR:         U72 display-label
 * SRS:        d-mob-u72-label-scan-01 §3 M-F-06
 * TechSpec:   display-label-no-raw-key.mdc
 * Purpose:    Map ops service_type + task status → VI; unknown → «—» (cấm underscore→space).
 * WorkItem:   D-MOB-U72-LABEL-FE-01
 * Coded:      2026-07-27
 * Callers:    OperationsScreen
 * Callees:    statusLabel · resolvePriorityLabel
 * must_keep:  known parking/locker/… maps; open/in_progress/done
 * LastVerified: utils/__tests__/operationsLabels.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-07-27
 * WorkItem: D-MOB-U72-LABEL-FE-01
 * change_mode: FIX
 * What: Unknown service_type / task status → «—»
 * Why: U72 M-F-06
 * must_keep: known SERVICE_TYPE / TASK_STATUS maps; U65 · HOLD_DEPLOY
 */

import { statusLabel } from '../integrations/mapApiError';
import { resolvePriorityLabel } from './profileTask';

const EM_DASH = '—';

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
  cancelled: 'Đã hủy',
  canceled: 'Đã hủy',
};

export function resolveServiceTypeLabel(serviceType: string | null | undefined): string {
  const key = serviceType?.trim().toLowerCase() ?? '';
  if (!key) return 'Yêu cầu dịch vụ';
  return SERVICE_TYPE_LABELS[key] ?? EM_DASH;
}

export function resolveTaskStatusLabel(status: string | null | undefined): string {
  const key = status?.trim().toLowerCase() ?? '';
  if (!key) return EM_DASH;
  return TASK_STATUS_LABELS[key] ?? statusLabel(key);
}

export function resolveOpsPriorityLabel(priority: string | null | undefined): string {
  const key = priority?.trim().toLowerCase() ?? '';
  if (key === 'high' || key === 'urgent') return resolvePriorityLabel('high');
  if (key === 'low') return resolvePriorityLabel('low');
  return resolvePriorityLabel('normal');
}
