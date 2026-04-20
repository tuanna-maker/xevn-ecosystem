import React, { type Dispatch, type SetStateAction } from 'react';
import { matchPath, useLocation, useNavigate } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  LayoutGrid,
  Users,
  Truck,
  Wallet,
  Settings,
  Calculator,
  TrendingUp,
  Pin,
  PinOff,
  ChevronRight,
} from 'lucide-react';
import type { RailModuleItem } from '../../data/command-center-mock';
import {
  NAV_RAIL_MODULE_CAPTION_ACTIVE_CLASS,
  NAV_RAIL_MODULE_CAPTION_DISABLED_CLASS,
  NAV_RAIL_MODULE_CAPTION_IDLE_CLASS,
  SETTINGS_RADIUS_CARD,
} from './settings-form-pattern';
import { useWorkspaceRail } from './workspace-rail-context';
import { hrmPortalPath } from '../../modules/hrm/paths';

const RAIL_STROKE = 1.5;
const SYSTEM_SETTINGS = 'SYSTEM_SETTINGS';

const moduleIcons: Record<string, LucideIcon> = {
  group: LayoutGrid,
  finance: Wallet,
  accounting: Calculator,
  hrm: Users,
  business: TrendingUp,
  fleet: Truck,
  system: Settings,
};

export type CommandCenterModuleRailProps = {
  railItems: RailModuleItem[];
  selectedModule: string;
  setSelectedModule: Dispatch<SetStateAction<string | 'all' | typeof SYSTEM_SETTINGS>>;
};

export const CommandCenterModuleRail: React.FC<CommandCenterModuleRailProps> = ({
  railItems,
  selectedModule,
  setSelectedModule,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { contentExpanded, collapseEnabled, pinned, togglePinned } = useWorkspaceRail();

  return (
    <aside className="flex h-full min-h-0 w-full shrink-0 flex-col items-stretch">
      <div
        className={`flex min-h-0 w-full flex-1 flex-col items-center border border-xevn-border bg-xevn-surface/90 shadow-soft backdrop-blur-sm ${SETTINGS_RADIUS_CARD} ${
          contentExpanded ? 'px-2 py-4' : 'px-1 py-3'
        }`}
      >
        <div className={`flex w-full flex-col items-center ${contentExpanded ? 'space-y-3' : 'space-y-2'}`}>
          {railItems.map((m) => {
            const Icon = moduleIcons[m.moduleCode] ?? LayoutDashboard;
            const onHrmRoute =
              matchPath({ path: '/command-center/hrm/*', end: false }, location.pathname) != null;
            const isActive =
              (m.moduleCode === 'group' && selectedModule === 'all' && !onHrmRoute) ||
              (m.moduleCode === 'system' && selectedModule === SYSTEM_SETTINGS) ||
              (m.moduleCode === 'hrm' && (selectedModule === 'hrm' || onHrmRoute)) ||
              (m.moduleCode !== 'group' &&
                m.moduleCode !== 'system' &&
                m.moduleCode !== 'hrm' &&
                selectedModule === m.moduleCode);

            const iconWrap =
              contentExpanded ? 'h-9 w-9' : 'h-8 w-8';
            const iconSz = contentExpanded ? 'h-4 w-4' : 'h-3.5 w-3.5';

            const inner = (
              <span
                className={`flex items-center justify-center rounded-full border transition ${iconWrap} ${
                  m.disabled
                    ? 'cursor-not-allowed border-dashed border-slate-200 text-slate-300'
                    : isActive
                      ? 'border-xevn-primary bg-xevn-primary/10 text-xevn-primary shadow-sm'
                      : 'border-transparent text-xevn-textSecondary hover:border-xevn-border hover:bg-slate-50'
                }`}
                title={m.disabled ? m.disabledReason : m.label}
              >
                <Icon className={iconSz} strokeWidth={RAIL_STROKE} aria-hidden />
              </span>
            );

            if (m.disabled) {
              return (
                <div key={m.moduleCode} className="flex flex-col items-center gap-1">
                  {inner}
                  <span className={`${NAV_RAIL_MODULE_CAPTION_DISABLED_CLASS} ${!contentExpanded ? 'sr-only' : ''}`}>
                    {m.label}
                  </span>
                </div>
              );
            }

            return (
              <button
                key={m.moduleCode}
                type="button"
                onClick={() => {
                  if (m.moduleCode === 'system') {
                    setSelectedModule(SYSTEM_SETTINGS);
                    navigate('/command-center');
                    return;
                  }
                  if (m.moduleCode === 'group') {
                    setSelectedModule('all');
                    navigate('/command-center');
                    return;
                  }
                  if (m.moduleCode === 'hrm') {
                    setSelectedModule('hrm');
                    navigate(hrmPortalPath('dashboard'));
                    return;
                  }
                  setSelectedModule(m.moduleCode);
                  navigate('/command-center');
                }}
                className="flex flex-col items-center gap-1 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-xevn-accent"
              >
                {inner}
                <span
                  className={`${
                    isActive ? NAV_RAIL_MODULE_CAPTION_ACTIVE_CLASS : NAV_RAIL_MODULE_CAPTION_IDLE_CLASS
                  } ${!contentExpanded ? 'sr-only' : ''}`}
                >
                  {m.label}
                </span>
              </button>
            );
          })}
        </div>

        {collapseEnabled ? (
          <div className="mt-auto w-full shrink-0 border-t border-xevn-border/80 pt-2">
            {contentExpanded ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  togglePinned();
                }}
                className="flex w-full items-center justify-center gap-1 rounded-md py-1.5 text-[12px] font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                title={pinned ? 'Bỏ ghim thanh phân hệ (chỉ mở khi di chuột)' : 'Ghim mở thanh phân hệ'}
                aria-pressed={pinned}
              >
                {pinned ? (
                  <PinOff className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
                ) : (
                  <Pin className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
                )}
                <span className="hidden md:inline">{pinned ? 'Bỏ ghim' : 'Ghim'}</span>
              </button>
            ) : (
              <div
                className="flex justify-center py-1 text-slate-400"
                aria-hidden
                title="Di chuột vào cột để mở đầy đủ"
              >
                <ChevronRight className="h-4 w-4 -rotate-90 opacity-70" strokeWidth={2} />
              </div>
            )}
          </div>
        ) : null}
      </div>
    </aside>
  );
};
