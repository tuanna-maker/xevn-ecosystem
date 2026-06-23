import { createContext, useContext } from 'react';

/** Màn rộng (2xl+): trước đây rail luôn mở; U35 portal shell — vẫn cho thu gọn. */
export const WORKSPACE_RAIL_WIDE_MEDIA = '(min-width: 1536px)';
export const WORKSPACE_RAIL_MD_MEDIA = '(min-width: 768px)';

export const WORKSPACE_RAIL_PINNED_STORAGE_KEY = 'xevn-command-center-rail-pinned';
/** Rail phân hệ ngoài cùng — mặc định thu icon (toàn Command Center). */
export const WORKSPACE_RAIL_COLLAPSED_STORAGE_KEY = 'xevn-portal-rail-collapsed-v1';

export function readPortalRailCollapsed(): boolean {
  try {
    const v = localStorage.getItem(WORKSPACE_RAIL_COLLAPSED_STORAGE_KEY);
    if (v === null) return true;
    return v === '1';
  } catch {
    return true;
  }
}

export function writePortalRailCollapsed(collapsed: boolean): void {
  try {
    localStorage.setItem(WORKSPACE_RAIL_COLLAPSED_STORAGE_KEY, collapsed ? '1' : '0');
  } catch {
    /* ignore */
  }
}

export type WorkspaceRailContextValue = {
  /** Đủ chỗ hiển thị nhãn + icon (không ở chế độ chỉ icon). */
  contentExpanded: boolean;
  /** Viewport ≥ 2xl — không cần thu gọn. */
  isWideLayout: boolean;
  /** md+ và < 2xl: rail có thể thu gọn. */
  collapseEnabled: boolean;
  pinned: boolean;
  setPinned: (next: boolean) => void;
  togglePinned: () => void;
};

export const WorkspaceRailContext = createContext<WorkspaceRailContextValue | null>(null);

export function useWorkspaceRail(): WorkspaceRailContextValue {
  const v = useContext(WorkspaceRailContext);
  if (!v) {
    throw new Error('useWorkspaceRail must be used within WorkspaceRailContext.Provider');
  }
  return v;
}

export function useWorkspaceRailOptional(): WorkspaceRailContextValue | null {
  return useContext(WorkspaceRailContext);
}
