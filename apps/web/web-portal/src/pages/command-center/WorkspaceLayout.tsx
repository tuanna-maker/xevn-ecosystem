import React, { useCallback, useMemo, useState, useEffect, useSyncExternalStore } from 'react';
import { XEVN_FLUID_SHELL, XEVN_VIEWPORT_PADDING } from './settings-form-pattern';
import {
  WorkspaceRailContext,
  WORKSPACE_RAIL_MD_MEDIA,
  WORKSPACE_RAIL_PINNED_STORAGE_KEY,
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
 * Layout Command Center (toàn portal — mọi phân hệ):
 * - md+: rail ngoài mặc định thu icon (~44px); mở khi ghim hoặc toggle (không hover).
 * - Sub-sidebar (Cài đặt / HRM): token NAV_SUBSIDEBAR_WIDTH_*; content flex thu theo.
 */
export const WorkspaceLayout: React.FC<{
  rail: React.ReactNode;
  secondarySidebar?: React.ReactNode;
  children: React.ReactNode;
  mainClassName?: string;
  className?: string;
  /** HRM iframe: padding/gap nhỏ hơn; rail dùng chung logic thu gọn. */
  layoutMode?: 'default' | 'hrm-embed';
  /** Rail phân hệ ngoài: true = thu icon (mặc định portal). */
  portalRailCollapsed?: boolean;
}> = ({
  rail,
  secondarySidebar,
  children,
  mainClassName,
  className,
  layoutMode = 'default',
  portalRailCollapsed = true,
}) => {
  const hrmEmbed = layoutMode === 'hrm-embed';
  const isMdUp = useMediaQuery(WORKSPACE_RAIL_MD_MEDIA);
  const [pinned, setPinnedState] = useState(false);

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

  /** Mọi breakpoint md+ — rail có thể thu (kể cả ≥2xl). */
  const collapseEnabled = isMdUp;
  const contentExpanded = pinned || !portalRailCollapsed;

  const railContext = useMemo(
    () => ({
      contentExpanded,
      isWideLayout: false,
      collapseEnabled,
      pinned,
      setPinned,
      togglePinned,
    }),
    [collapseEnabled, contentExpanded, pinned, setPinned, togglePinned],
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
      className={`flex min-h-0 flex-1 flex-col w-full ${XEVN_VIEWPORT_PADDING} ${hrmEmbed ? 'py-3 md:py-4' : 'py-8'} ${className ?? ''}`}
    >
      <div className={`${XEVN_FLUID_SHELL} flex min-h-0 min-w-0 flex-1 flex-col`}>
        <WorkspaceRailContext.Provider value={railContext}>
          <div
            className={`flex min-h-0 min-w-0 flex-1 flex-col md:flex-row md:items-stretch ${
              hrmEmbed ? 'gap-2' : WORKSPACE_COLUMN_GAP
            }`}
          >
            <div className={railColumnClass} role="navigation" aria-label="Phân hệ Command Center">
              {rail}
            </div>
            {secondarySidebar ? (
              <div
                className={
                  hrmEmbed ? 'hidden min-h-0 min-w-0 shrink-0 md:flex' : 'min-h-0 min-w-0 shrink-0'
                }
              >
                {secondarySidebar}
              </div>
            ) : null}
            <main
              className={`flex min-h-0 min-w-0 flex-[1_1_0%] flex-col overflow-y-auto overflow-x-hidden min-h-[min(22rem,50svh)] md:min-h-0 ${
                hrmEmbed ? 'min-h-[min(32rem,72dvh)] !overflow-hidden' : ''
              } ${mainClassName ?? ''}`}
            >
              {hrmEmbed && secondarySidebar ? (
                <div className="shrink-0 md:hidden">{secondarySidebar}</div>
              ) : null}
              {children}
            </main>
          </div>
        </WorkspaceRailContext.Provider>
      </div>
    </div>
  );
};
