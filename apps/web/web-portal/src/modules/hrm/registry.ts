import type { HrmWorkspaceMenuKey } from './types';

/**
 * Danh sách view HRM — đây là điểm mở rộng cho “chỉ cấu hình”:
 * sau này có thể lọc theo feature flag / JSON remote / quyền người dùng.
 */
export const HRM_ALL_VIEWS = [
  'dashboard',
  'employees',
  'contracts',
  'insurance',
  'decisions',
  'recruitment',
  'attendance',
  'payroll',
  'hrm_ai',
  'tasks',
  'processes',
  'internal_services',
  'tools_equipment',
  'company',
  'reports',
  'settings',
  'guide',
] as const satisfies readonly HrmWorkspaceMenuKey[];

const VIEW_SET = new Set<string>(HRM_ALL_VIEWS);

export const HRM_DEFAULT_VIEW: HrmWorkspaceMenuKey = 'dashboard';

export function isHrmWorkspaceView(segment: string | undefined): segment is HrmWorkspaceMenuKey {
  return segment != null && VIEW_SET.has(segment);
}

export function parseHrmWorkspaceView(segment: string | undefined): HrmWorkspaceMenuKey {
  if (isHrmWorkspaceView(segment)) return segment;
  return HRM_DEFAULT_VIEW;
}
