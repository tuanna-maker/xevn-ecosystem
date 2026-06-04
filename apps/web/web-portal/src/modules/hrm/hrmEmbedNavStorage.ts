const HRM_SIDEBAR_COLLAPSED_KEY = 'cc-hrm-embed-sidebar-collapsed-v2';
const HRM_MODULE_RAIL_COLLAPSED_KEY = 'cc-hrm-embed-module-rail-collapsed-v2';

/** Mặc định thu gọn để ưu tiên iframe nội dung chính. */
export function readHrmSidebarCollapsed(): boolean {
  try {
    const v = localStorage.getItem(HRM_SIDEBAR_COLLAPSED_KEY);
    if (v === null) return true;
    return v === '1';
  } catch {
    return true;
  }
}

/** Rail phân hệ (HRM/Tài chính…): mặc định thu icon khi đang ở module HRM. */
export function readHrmModuleRailCollapsed(): boolean {
  try {
    const v = localStorage.getItem(HRM_MODULE_RAIL_COLLAPSED_KEY);
    if (v === null) return true;
    return v === '1';
  } catch {
    return true;
  }
}

export function writeHrmModuleRailCollapsed(collapsed: boolean): void {
  try {
    localStorage.setItem(HRM_MODULE_RAIL_COLLAPSED_KEY, collapsed ? '1' : '0');
  } catch {
    /* ignore */
  }
}

export function writeHrmSidebarCollapsed(collapsed: boolean): void {
  try {
    localStorage.setItem(HRM_SIDEBAR_COLLAPSED_KEY, collapsed ? '1' : '0');
  } catch {
    /* ignore */
  }
}
