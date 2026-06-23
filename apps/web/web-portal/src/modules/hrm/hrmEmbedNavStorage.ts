import {
  readPortalRailCollapsed,
  writePortalRailCollapsed,
} from '../../pages/command-center/workspace-rail-context';

const HRM_SIDEBAR_COLLAPSED_KEY = 'cc-hrm-embed-sidebar-collapsed-v3';

/** Mặc định mở rộng menu HRM con để hiện đủ nhãn (rail ngoài thu icon). */
export function readHrmSidebarCollapsed(): boolean {
  try {
    const v = localStorage.getItem(HRM_SIDEBAR_COLLAPSED_KEY);
    if (v === null) return false;
    return v === '1';
  } catch {
    return false;
  }
}

/** @deprecated — dùng readPortalRailCollapsed từ workspace-rail-context */
export function readHrmModuleRailCollapsed(): boolean {
  return readPortalRailCollapsed();
}

/** @deprecated */
export function writeHrmModuleRailCollapsed(collapsed: boolean): void {
  writePortalRailCollapsed(collapsed);
}

export function writeHrmSidebarCollapsed(collapsed: boolean): void {
  try {
    localStorage.setItem(HRM_SIDEBAR_COLLAPSED_KEY, collapsed ? '1' : '0');
  } catch {
    /* ignore */
  }
}
