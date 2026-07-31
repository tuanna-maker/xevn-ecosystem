/**
 * Navigate Command Center HRM sidebar from iframe embed (same-origin parent).
 * P-CC-03..08 portal routes — complements LinkedDataEmptyNotice catalog sync link.
 */
export type PortalHrmNavKey =
  | 'employees'
  | 'contracts'
  | 'insurance'
  | 'recruitment'
  | 'attendance'
  | 'payroll'
  | 'tasks'
  | 'tools_equipment'
  | 'fleet';

export const PORTAL_HRM_MENU_PATH: Record<PortalHrmNavKey, string> = {
  employees: '/command-center/hrm/employees',
  contracts: '/command-center/hrm/contracts',
  insurance: '/command-center/hrm/insurance',
  recruitment: '/command-center/hrm/recruitment',
  attendance: '/command-center/hrm/attendance',
  payroll: '/command-center/hrm/payroll',
  tasks: '/command-center/hrm/tasks',
  tools_equipment: '/command-center/hrm/tools_equipment',
  fleet: '/command-center/hrm/fleet',
};

export function navigatePortalHrmMenu(key: PortalHrmNavKey): void {
  if (typeof window === 'undefined') return;
  const path = PORTAL_HRM_MENU_PATH[key];
  try {
    if (window.parent && window.parent !== window) {
      window.parent.location.assign(path);
      return;
    }
  } catch {
    // cross-origin — fall through
  }
  window.location.assign(path);
}
