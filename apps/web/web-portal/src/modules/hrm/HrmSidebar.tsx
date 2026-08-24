import React from 'react';
import { NavLink, useSearchParams } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Clock,
  Wallet,
  TrendingUp,
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
  Truck,
  HelpCircle,
  FileSignature,
} from 'lucide-react';
import {
  NAV_SUBSIDEBAR_ITEM_ACTIVE_CLASS,
  NAV_SUBSIDEBAR_ITEM_IDLE_CLASS,
  NAV_SUBSIDEBAR_TITLE_CLASS,
} from '../../pages/command-center/settings-form-pattern';
import { useTenantScope } from '../../contexts/GlobalFilterContext';
import type { HrmWorkspaceMenuKey } from './types';
import { tenantHrmPortalPath } from './paths';

const RAIL_STROKE = 1.5;

type NavItem = { key: HrmWorkspaceMenuKey; label: string; Icon: LucideIcon; badge?: number };

const HR_CORE: NavItem[] = [
  { key: 'employees', label: 'Nhân sự', Icon: Users },
  { key: 'contracts', label: 'Hợp đồng', Icon: FileSignature },
  { key: 'insurance', label: 'Bảo hiểm', Icon: ShieldCheck },
  { key: 'decisions', label: 'Quyết định', Icon: FileArchive },
];

const MAIN_AFTER: NavItem[] = [
  { key: 'recruitment', label: 'Tuyển dụng', Icon: UserPlus, badge: 3 },
  { key: 'attendance', label: 'Chấm công', Icon: Clock },
  { key: 'payroll', label: 'Tiền lương', Icon: Wallet },
  { key: 'performance', label: 'Đánh giá', Icon: TrendingUp },
  { key: 'hrm_ai', label: 'UniAI', Icon: Bot },
  { key: 'tasks', label: 'Công việc', Icon: ClipboardList },
  { key: 'processes', label: 'Quy trình & chính sách', Icon: BookOpen },
  { key: 'internal_services', label: 'Dịch vụ nội bộ', Icon: ConciergeBell },
  { key: 'tools_equipment', label: 'Công cụ & thiết bị', Icon: Wrench },
  { key: 'fleet', label: 'Hồ sơ xe', Icon: Truck },
];

const ADMIN: NavItem[] = [
  { key: 'company', label: 'Phòng/Ban & Công ty', Icon: Building2 },
  { key: 'reports', label: 'Báo cáo', Icon: BarChart3 },
  { key: 'settings', label: 'Cấu hình HRM', Icon: Settings },
];

const ICON_ONLY_ITEMS: NavItem[] = [
  { key: 'dashboard', label: 'Tổng quan', Icon: LayoutDashboard },
  ...HR_CORE,
  ...MAIN_AFTER,
  ...ADMIN,
  { key: 'guide', label: 'Hướng dẫn', Icon: HelpCircle },
];

export const HrmSidebar: React.FC<{ collapsed?: boolean }> = ({ collapsed = false }) => {
  const [searchParams] = useSearchParams();
  const { selectedTenant } = useTenantScope();
  const tenantId = searchParams.get('tenantId') ?? selectedTenant?.tenantId;
  const sectionLabelClass = 'px-1 text-xs font-semibold uppercase tracking-wider text-xevn-textSecondary';

  const linkClass = (isActive: boolean, iconOnly?: boolean) => {
    const py = iconOnly ? 'py-2' : 'py-3';
    const px = iconOnly ? 'px-0 justify-center' : 'px-2.5';
    return `flex w-full min-w-0 items-center gap-2 rounded-lg ${px} ${py} text-left transition active:scale-95 ${
      isActive ? 'bg-xevn-primary/10' : 'hover:bg-xevn-background'
    }`;
  };

  const renderLink = (item: NavItem, opts?: { compact?: boolean; iconOnly?: boolean }) => (
    <NavLink
      key={item.key}
<<<<<<< HEAD
      to={tenantHrmPortalPath(tenantId, item.key)}
      end={false}
      title={item.label}
      className={({ isActive }) => linkClass(isActive, opts?.iconOnly)}
    >
      {({ isActive }) => (
        <>
          <item.Icon
            className={`h-5 w-5 shrink-0 ${isActive ? 'text-xevn-primary' : 'text-xevn-textMuted'}`}
            strokeWidth={RAIL_STROKE}
          />
          {!opts?.iconOnly ? (
            <>
              <span
                className={`min-w-0 flex-1 text-[13px] leading-snug ${
                  isActive ? NAV_SUBSIDEBAR_ITEM_ACTIVE_CLASS : NAV_SUBSIDEBAR_ITEM_IDLE_CLASS
                }`}
              >
                {item.label}
              </span>
              {item.badge != null ? (
                <span className="shrink-0 rounded-full bg-xevn-accent px-2 py-0.5 text-xs font-semibold tabular-nums text-white">
                  {item.badge}
                </span>
              ) : null}
            </>
          ) : null}
        </>
      )}
    </NavLink>
  );

  if (collapsed) {
    return (
      <nav className="flex min-h-0 flex-1 flex-col items-center gap-1 overflow-y-auto overflow-x-hidden py-1">
        {ICON_ONLY_ITEMS.map((item) => renderLink(item, { iconOnly: true }))}
      </nav>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-3 shrink-0">
        <h2 className={NAV_SUBSIDEBAR_TITLE_CLASS}>HRM</h2>
      </div>
      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto">
        <p className={`${sectionLabelClass} mb-1`}>Menu chính</p>
        {renderLink({ key: 'dashboard', label: 'Tổng quan', Icon: LayoutDashboard })}

        <p className={`${sectionLabelClass} mb-1 mt-3`}>Nhân sự</p>
        <div className="ml-1 space-y-1 border-l border-xevn-border/80 pl-3">
          {HR_CORE.map((item) => renderLink(item, { compact: true }))}
        </div>

        {MAIN_AFTER.map((item) => renderLink(item))}

        <p className={`${sectionLabelClass} mb-1 mt-4`}>Quản trị</p>
        {ADMIN.map((item) => renderLink(item))}

        <div className="mt-3 border-t border-xevn-border pt-2">
          {renderLink({ key: 'guide', label: 'Hướng dẫn sử dụng', Icon: HelpCircle })}
        </div>
      </nav>
    </div>
  );
};
