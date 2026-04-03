import React from 'react';
import { XEVN_FLUID_SHELL, XEVN_VIEWPORT_PADDING } from './settings-form-pattern';

/** Khoảng cách đồng nhất giữa Rail → Sidebar phụ → Workspace (24px) */
export const WORKSPACE_COLUMN_GAP = 'gap-6';

/**
 * Layout chung cho GroupDashboard (Trung tâm) và SystemSettings (Cài đặt):
 * - Safe Area: `xevn-safe-inline` (clamp đối xứng)
 * - Vỏ `max-w-[1920px]` để không kéo giãn vô hạn trên ultra-wide
 * - Cột Rail ~128px (lg; đủ chỗ nhãn 2 dòng + padding); Sub-sidebar 280px; `gap-6` giữa các cột
 */
export const WorkspaceLayout: React.FC<{
  rail: React.ReactNode;
  secondarySidebar?: React.ReactNode;
  children: React.ReactNode;
  mainClassName?: string;
  className?: string;
}> = ({ rail, secondarySidebar, children, mainClassName, className }) => (
  <div className={`w-full ${XEVN_VIEWPORT_PADDING} py-8 ${className ?? ''}`}>
    <div className={XEVN_FLUID_SHELL}>
      <div
        className={`flex min-h-0 min-w-0 flex-col ${WORKSPACE_COLUMN_GAP} lg:flex-row lg:items-start`}
      >
        <div className="flex w-full shrink-0 flex-col items-stretch lg:w-[128px] lg:min-w-[128px] lg:max-w-[128px]">
          {rail}
        </div>
        {secondarySidebar ?? null}
        <main
          className={`flex min-h-0 min-w-0 flex-1 flex-col ${mainClassName ?? ''}`}
        >
          {children}
        </main>
      </div>
    </div>
  </div>
);
