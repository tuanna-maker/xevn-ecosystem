import React from 'react';
import { NavLink } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Clock,
  Wallet,
  Building2,
  Settings,
  ShieldCheck,
  FileArchive,
  BarChart3,
  Bot,
  ClipboardList,
  BookOpen,
  ConciergeBell,
  Wrench,
  HelpCircle,
  FileSignature,
} from 'lucide-react';
import {
  NAV_SUBSIDEBAR_ITEM_ACTIVE_CLASS,
  NAV_SUBSIDEBAR_ITEM_IDLE_CLASS,
  NAV_SUBSIDEBAR_TITLE_CLASS,
  NAV_SUBSIDEBAR_WIDTH_CLASS,
  SETTINGS_RADIUS_CARD,
} from '../../pages/command-center/settings-form-pattern';
import type { HrmWorkspaceMenuKey } from './types';
import { hrmPortalPath } from './paths';

const RAIL_STROKE = 1.5;

/**
 * Menu HRM cột giữa — link thật tới `/command-center/hrm/:view` (router riêng).
 * Lọc mục theo `registry` khi triển khai cấu hình.
 */
export const HrmSidebar: React.FC = () => {
  const sectionLabelClass = 'px-1 text-xs font-semibold uppercase tracking-wider text-slate-400';
  const hrCoreItems: Array<{ key: HrmWorkspaceMenuKey; label: string; Icon: LucideIcon }> = [
    { key: 'employees', label: 'Nhân sự', Icon: Users },
    { key: 'contracts', label: 'Hợp đồng', Icon: FileSignature },
    { key: 'insurance', label: 'Bảo hiểm', Icon: ShieldCheck },
    { key: 'decisions', label: 'Quyết định', Icon: FileArchive },
  ];
  const mainAfterHr: Array<{ key: HrmWorkspaceMenuKey; label: string; Icon: LucideIcon; badge?: number }> = [
    { key: 'recruitment', label: 'Tuyển dụng', Icon: UserPlus, badge: 3 },
    { key: 'attendance', label: 'Chấm công', Icon: Clock },
    { key: 'payroll', label: 'Tiền lương', Icon: Wallet },
    { key: 'hrm_ai', label: 'UniAI', Icon: Bot },
    { key: 'tasks', label: 'Công việc', Icon: ClipboardList },
    { key: 'processes', label: 'Quy trình & chính sách', Icon: BookOpen },
    { key: 'internal_services', label: 'Dịch vụ nội bộ', Icon: ConciergeBell },
    { key: 'tools_equipment', label: 'Công cụ & thiết bị', Icon: Wrench },
  ];
  const adminItems: Array<{ key: HrmWorkspaceMenuKey; label: string; Icon: LucideIcon }> = [
    { key: 'company', label: 'Phòng/Ban & Công ty', Icon: Building2 },
    { key: 'reports', label: 'Báo cáo', Icon: BarChart3 },
    { key: 'settings', label: 'Cấu hình HRM', Icon: Settings },
  ];

  const linkClass = (isActive: boolean, compact?: boolean) => {
    const py = compact ? 'py-2.5' : 'py-3';
    return `flex w-full min-w-0 items-center gap-2 rounded-lg px-2.5 ${py} text-left transition active:scale-95 ${
      isActive ? 'bg-xevn-primary/10' : 'hover:bg-slate-100'
    }`;
  };

  const renderLink = (
    key: HrmWorkspaceMenuKey,
    label: string,
    Icon: LucideIcon,
    opts?: { badge?: number; compact?: boolean },
  ) => (
    <NavLink
      key={key}
      to={hrmPortalPath(key)}
      className={({ isActive }) => linkClass(isActive, opts?.compact)}
    >
      {({ isActive }) => (
        <>
          <Icon
            className={`h-5 w-5 shrink-0 ${isActive ? 'text-xevn-primary' : 'text-slate-500'}`}
            strokeWidth={RAIL_STROKE}
          />
          <span
            className={`min-w-0 flex-1 truncate ${
              isActive ? NAV_SUBSIDEBAR_ITEM_ACTIVE_CLASS : NAV_SUBSIDEBAR_ITEM_IDLE_CLASS
            }`}
          >
            {label}
          </span>
          {opts?.badge != null ? (
            <span className="shrink-0 rounded-full bg-xevn-accent px-2 py-0.5 text-xs font-semibold tabular-nums text-white">
              {opts.badge}
            </span>
          ) : null}
        </>
      )}
    </NavLink>
  );

  return (
    <aside
      className={`flex min-h-0 w-full shrink-0 flex-col bg-xevn-surface/95 px-4 py-4 shadow-soft lg:h-full ${NAV_SUBSIDEBAR_WIDTH_CLASS} ${SETTINGS_RADIUS_CARD}`}
    >
      <div className="mb-4">
        <h2 className={NAV_SUBSIDEBAR_TITLE_CLASS}>HRM</h2>
      </div>
      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto">
        <p className={`${sectionLabelClass} mb-1`}>Menu chính</p>
        {renderLink('dashboard', 'Tổng quan', LayoutDashboard)}

        <p className={`${sectionLabelClass} mb-1 mt-3`}>Nhân sự</p>
        <div className="ml-1 space-y-1 border-l border-xevn-border/80 pl-3">
          {hrCoreItems.map(({ key, label, Icon }) => renderLink(key, label, Icon, { compact: true }))}
        </div>

        {mainAfterHr.map(({ key, label, Icon, badge }) => renderLink(key, label, Icon, { badge }))}

        <p className={`${sectionLabelClass} mb-1 mt-4`}>Quản trị</p>
        {adminItems.map(({ key, label, Icon }) => renderLink(key, label, Icon))}

        <div className="mt-3 border-t border-xevn-border pt-2">
          {renderLink('guide', 'Hướng dẫn sử dụng', HelpCircle)}
        </div>
      </nav>
    </aside>
  );
};
