/**
 * Khóa màn HRM trong portal — đồng bộ với segment URL `/command-center/hrm/:view`.
 * Bật/tắt từng màn sau này qua `registry.ts` (hoặc nạp remote config).
 */
export type HrmWorkspaceMenuKey =
  | 'dashboard'
  | 'employees'
  | 'contracts'
  | 'insurance'
  | 'decisions'
  | 'recruitment'
  | 'attendance'
  | 'payroll'
  | 'performance'
  | 'hrm_ai'
  | 'tasks'
  | 'processes'
  | 'internal_services'
  | 'tools_equipment'
  | 'fleet'
  | 'internal_news'
  | 'company'
  | 'reports'
  | 'settings'
  | 'guide';
