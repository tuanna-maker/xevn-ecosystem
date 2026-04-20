import React, { useCallback, useMemo, useState, useEffect, useSyncExternalStore } from 'react';
import { XEVN_FLUID_SHELL, XEVN_VIEWPORT_PADDING } from './settings-form-pattern';
import {
  WorkspaceRailContext,
  WORKSPACE_RAIL_MD_MEDIA,
  WORKSPACE_RAIL_PINNED_STORAGE_KEY,
  WORKSPACE_RAIL_WIDE_MEDIA,
} from './workspace-rail-context';

/** Khoảng cách đồng nhất giữa Rail → Sidebar phụ → Workspace (24px) */
export const WORKSPACE_COLUMN_GAP = 'gap-6';

function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onStoreChange) => {
      const mq = window.matchMedia(query);
      mq.addEventListener('change', onStoreChange);
      return () => mq.removeEventListener('change', onStoreChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/**
 * Layout Command Center:
 * - Mobile: rail full width xếp dọc (không thu gọn cạnh).
 * - md–2xl: rail ~100px hoặc thu ~44px; hover cột rail = mở (đẩy sidebar phụ + nội dung, không đè).
 * - ≥2xl: rail luôn mở.
 */
export const WorkspaceLayout: React.FC<{
  rail: React.ReactNode;
  secondarySidebar?: React.ReactNode;
  children: React.ReactNode;
  mainClassName?: string;
  className?: string;
}> = ({ rail, secondarySidebar, children, mainClassName, className }) => {
  const isWideLayout = useMediaQuery(WORKSPACE_RAIL_WIDE_MEDIA);
  const isMdUp = useMediaQuery(WORKSPACE_RAIL_MD_MEDIA);
  const [pinned, setPinnedState] = useState(false);
  const [hoverOpen, setHoverOpen] = useState(false);

  useEffect(() => {
    try {
      setPinnedState(localStorage.getItem(WORKSPACE_RAIL_PINNED_STORAGE_KEY) === '1');
    } catch {
      /* ignore */
    }
  }, []);

  const setPinned = useCallback((next: boolean) => {
    setPinnedState(next);
    try {
      if (next) localStorage.setItem(WORKSPACE_RAIL_PINNED_STORAGE_KEY, '1');
      else localStorage.removeItem(WORKSPACE_RAIL_PINNED_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const togglePinned = useCallback(() => {
    setPinnedState((prev) => {
      const next = !prev;
      try {
        if (next) localStorage.setItem(WORKSPACE_RAIL_PINNED_STORAGE_KEY, '1');
        else localStorage.removeItem(WORKSPACE_RAIL_PINNED_STORAGE_KEY);
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const collapseEnabled = isMdUp && !isWideLayout;
  const contentExpanded = !collapseEnabled || pinned || hoverOpen;

  const railContext = useMemo(
    () => ({
      contentExpanded,
      isWideLayout,
      collapseEnabled,
      pinned,
      setPinned,
      togglePinned,
    }),
    [collapseEnabled, contentExpanded, isWideLayout, pinned, setPinned, togglePinned],
  );

  const railColumnClass =
    'flex shrink-0 flex-col items-stretch transition-[width,min-width,max-width] duration-200 ease-out max-md:w-full md:min-h-0 md:overflow-hidden ' +
    (isMdUp
      ? contentExpanded
        ? 'md:w-[100px] md:min-w-[100px] md:max-w-[100px]'
        : 'md:w-11 md:min-w-11 md:max-w-11'
      : '');

  return (
    <div
      className={`flex min-h-0 flex-1 flex-col w-full ${XEVN_VIEWPORT_PADDING} py-8 ${className ?? ''}`}
    >
      <div className={`${XEVN_FLUID_SHELL} flex min-h-0 min-w-0 flex-1 flex-col`}>
        <WorkspaceRailContext.Provider value={railContext}>
          <div
            className={`flex min-h-0 min-w-0 flex-1 flex-col ${WORKSPACE_COLUMN_GAP} md:flex-row md:items-stretch`}
          >
            <div
              className={railColumnClass}
              onMouseEnter={() => {
                if (collapseEnabled && !pinned) setHoverOpen(true);
              }}
              onMouseLeave={() => {
                if (collapseEnabled && !pinned) setHoverOpen(false);
              }}
              role="navigation"
              aria-label="Phân hệ Command Center"
            >
              {rail}
            </div>
            {secondarySidebar ?? null}
            <main
              className={`flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overflow-x-hidden min-h-[min(22rem,50svh)] md:min-h-0 ${mainClassName ?? ''}`}
            >
              {children}
            </main>
          </div>
        </WorkspaceRailContext.Provider>
      </div>
    </div>
  );
};
