import { createContext, useContext } from 'react';

const STORAGE_KEY = 'xevn-command-center-rail-pinned';

/** Màn rộng (2xl+): rail luôn đủ chỗ; dưới 2xl (md+): cho phép thu gọn + hover. */
export const WORKSPACE_RAIL_WIDE_MEDIA = '(min-width: 1536px)';
export const WORKSPACE_RAIL_MD_MEDIA = '(min-width: 768px)';

export const WORKSPACE_RAIL_PINNED_STORAGE_KEY = 'xevn-command-center-rail-pinned';

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
