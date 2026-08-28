import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTenantScope } from '../../contexts/GlobalFilterContext';

import {
  Building2,
  Settings,
  ChevronDown,
  ChevronRight,
  Briefcase,
  ListChecks,
  MapPin,
  Truck,
  Clock,
  Calculator,
  Receipt,
  Shield,
  Warehouse,
  Wrench,
  Users,
  ClipboardList,
  Wallet,
  TrendingUp,
  LayoutDashboard,
  UserPlus,
  BarChart3,
  Bot,
  BookOpen,
  HelpCircle,
  ConciergeBell,
} from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  children?: MenuItem[];
  badge?: string;
  /**
   * When true, render children as external anchors (`<a href=...>`)
   * so HRM (separate app) can be loaded via full page reload.
   */
  external?: boolean;
}

/** Khớp với `Route path="/dashboard/*"` trong App.tsx */
const P = '/dashboard';

const primaryMenus: MenuItem[] = [
  {
    id: 'x-bos-group',
    label: 'X-BOS (Tập đoàn)',
    icon: <Building2 size={20} />,
    path: `${P}/organization`,
  },
  {
    id: 'catalog-governance',
    label: 'Duyệt danh mục HRM',
    icon: <ClipboardList size={20} />,
    path: '/command-center?settings=hrm_catalog_governance',
  },
  {
    id: 'trsport',
    label: 'TRSPORT',
    icon: <Truck size={20} />,
    path: `${P}/kpi-dashboard`,
  },
  {
    id: 'lgts',
    label: 'LGTS',
    icon: <Warehouse size={20} />,
    path: `${P}/kpi-dashboard`,
  },
  {
    id: 'x-maintenance',
    label: 'X-Maintenance',
    icon: <Wrench size={20} />,
    path: `${P}/kpi-dashboard`,
  },
  {
    id: 'hrm',
    label: 'HRM',
    icon: <Users size={20} />,
    children: [
      {
        id: 'hrm-overview',
        label: 'Tổng quan',
        icon: <LayoutDashboard size={18} />,
        path: '/command-center/hrm/dashboard',
      },
      {
        id: 'hrm-employees',
        label: 'Nhân sự',
        icon: <Users size={18} />,
        path: '/command-center/hrm/employees',
      },
      {
        id: 'hrm-recruitment',
        label: 'Tuyển dụng',
        icon: <UserPlus size={18} />,
        path: '/command-center/hrm/recruitment',
      },
      {
        id: 'hrm-attendance',
        label: 'Chấm công',
        icon: <Clock size={18} />,
        path: '/command-center/hrm/attendance',
      },
      {
        id: 'hrm-payroll',
        label: 'Tiền lương',
        icon: <Wallet size={18} />,
        path: '/command-center/hrm/payroll',
      },
      {
        id: 'hrm-performance',
        label: 'Đánh giá',
        icon: <TrendingUp size={18} />,
        path: '/command-center/hrm/performance',
      },
      {
        id: 'hrm-company',
        label: 'Phòng/Ban & Công ty',
        icon: <Building2 size={18} />,
        path: '/command-center/hrm/company',
      },
      {
        id: 'hrm-reports',
        label: 'Báo cáo',
        icon: <BarChart3 size={18} />,
        path: '/command-center/hrm/reports',
      },
      {
        id: 'hrm-settings',
        label: 'Cài đặt',
        icon: <Settings size={18} />,
        path: '/command-center/hrm/settings',
      },
      {
        id: 'hrm-contracts',
        label: 'Hợp đồng',
        icon: <Receipt size={18} />,
        path: '/command-center/hrm/contracts',
      },
      {
        id: 'hrm-insurance',
        label: 'Bảo hiểm',
        icon: <Shield size={18} />,
        path: '/command-center/hrm/insurance',
      },
      {
        id: 'hrm-decisions',
        label: 'Quyết định',
        icon: <Receipt size={18} />,
        path: '/command-center/hrm/decisions',
      },
      {
        id: 'hrm-ai',
        label: 'UniAI',
        icon: <Bot size={18} />,
        path: '/command-center/hrm/hrm_ai',
      },
      {
        id: 'hrm-tasks',
        label: 'Công việc',
        icon: <ClipboardList size={18} />,
        path: '/command-center/hrm/tasks',
      },
      {
        id: 'hrm-processes',
        label: 'Quy trình & chính sách',
        icon: <BookOpen size={18} />,
        path: '/command-center/hrm/processes',
      },
      {
        id: 'hrm-internal-services',
        label: 'Dịch vụ nội bộ',
        icon: <ConciergeBell size={18} />,
        path: '/command-center/hrm/internal_services',
      },
      {
        id: 'hrm-guide',
        label: 'Hướng dẫn sử dụng',
        icon: <HelpCircle size={18} />,
        path: '/command-center/hrm/guide',
      },
      {
        id: 'hrm-tools-equipment',
        label: 'Công cụ & Thiết bị',
        icon: <Wrench size={18} />,
        path: '/command-center/hrm/tools_equipment',
      },
    ],
  },
  {
    id: 'crm',
    label: 'CRM',
    icon: <ClipboardList size={20} />,
    path: `${P}/customers`,
  },
];

const settingsMenus: MenuItem[] = [
  {
    id: 'settings',
    label: 'Cài đặt hệ thống',
    icon: <Settings size={20} />,
    children: [
      {
        id: 'settings-positions',
        label: 'Danh mục Chức vụ',
        icon: <Briefcase size={18} />,
        path: `${P}/settings/positions`,
      },
      {
        id: 'settings-departments',
        label: 'Danh mục Phòng ban',
        icon: <Building2 size={18} />,
        path: `${P}/settings/departments`,
      },
      {
        id: 'settings-regions',
        label: 'Vùng địa lý',
        icon: <MapPin size={18} />,
        path: `${P}/settings/regions`,
      },
      {
        id: 'settings-vehicles',
        label: 'Loại phương tiện',
        icon: <Truck size={18} />,
        path: `${P}/settings/vehicles`,
      },
      {
        id: 'settings-vendors',
        label: 'Đối tác / NCC',
        icon: <Shield size={18} />,
        path: `${P}/settings/vendors`,
      },
      {
        id: 'settings-expense-categories',
        label: 'Loại chi phí',
        icon: <Receipt size={18} />,
        path: `${P}/settings/expense-categories`,
      },
      {
        id: 'settings-kpi-metrics',
        label: 'KPI & Metric',
        icon: <ListChecks size={18} />,
        path: `${P}/settings/kpi-metrics`,
      },
      {
        id: 'settings-kpi-formulas',
        label: 'Công thức KPI',
        icon: <Calculator size={18} />,
        path: `${P}/settings/kpi-formulas`,
      },
    ],
  },
];

const Sidebar: React.FC = () => {
  const { isMasterContext, selectedTenant } = useTenantScope();
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['settings']);
  const location = useLocation();

  const visiblePrimaryMenus = primaryMenus.filter((item) => {
    if (item.id === 'x-bos-group' || item.id === 'catalog-governance') return isMasterContext;
    if (['trsport', 'lgts', 'x-maintenance', 'crm'].includes(item.id)) return !isMasterContext;
    return true;
  });
  const visibleSettingsMenus = isMasterContext ? [] : settingsMenus;

  const toggleMenu = (menuId: string) => {
    setExpandedMenus((prev) =>
      prev.includes(menuId)
        ? prev.filter((id) => id !== menuId)
        : [...prev, menuId]
    );
  };

  const isMenuExpanded = (menuId: string) => expandedMenus.includes(menuId);

  const renderMenuItem = (item: MenuItem, isChild = false) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = isMenuExpanded(item.id);
    const tenantPrefix = `/${selectedTenant?.tenantId || ''}`;
    
    const resolvePath = (path?: string) => {
      if (!path) return '';
      if (!path.startsWith('/')) return path;
      return `${tenantPrefix}${path}`.replace(/\/+/g, '/');
    };

    const isParentActive = item.children?.some(
      (child) => location.pathname === resolvePath(child.path)
    );

    if (hasChildren) {
      return (
        <div key={item.id}>
          <button
            onClick={() => toggleMenu(item.id)}
            className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
              isParentActive
                ? 'bg-xevn-accent/10 text-xevn-accent'
                : 'text-white/55 hover:bg-slate-700/50 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              {item.icon}
              <span>{item.label}</span>
            </div>
            {isExpanded ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </button>
          {isExpanded && (
            <div className="ml-4 mt-1 space-y-1 border-l border-slate-700 pl-4">
              {item.children?.map((child) => renderMenuItem(child, true))}
            </div>
          )}
        </div>
      );
    }

    const itemResolvedPath = resolvePath(item.path);

    if (item.external && item.path) {
      if (item.path.startsWith('/command-center/hrm')) {
        return (
          <NavLink
            key={item.id}
            to={itemResolvedPath}
            className={({ isActive }) =>
              `flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-xevn-accent text-white shadow-lg shadow-xevn-accent/25'
                  : 'text-white/55 hover:bg-slate-700/50 hover:text-white'
              } ${isChild ? 'py-2.5 text-[13px]' : ''}`
            }
          >
            <div className="flex items-center gap-3">
              {item.icon}
              <span>{item.label}</span>
            </div>
            {item.badge && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-xevn-accent text-[10px] font-bold text-white">
                {item.badge}
              </span>
            )}
          </NavLink>
        );
      }
      return (
        <a
          key={item.id}
          href={itemResolvedPath}
          className={`flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 text-white/55 hover:bg-slate-700/50 hover:text-white ${isChild ? 'py-2.5 text-[13px]' : ''}`}
        >
          <div className="flex items-center gap-3">
            {item.icon}
            <span>{item.label}</span>
          </div>
          {item.badge && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-xevn-accent text-[10px] font-bold text-white">
              {item.badge}
            </span>
          )}
        </a>
      );
    }

    return (
      <NavLink
        key={item.id}
        to={itemResolvedPath || resolvePath(P)}
        className={({ isActive }) =>
          `flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
            isActive
              ? 'bg-xevn-accent text-white shadow-lg shadow-xevn-accent/25'
              : 'text-white/55 hover:bg-slate-700/50 hover:text-white'
          } ${isChild ? 'py-2.5 text-[13px]' : ''}`
        }
      >
        <div className="flex items-center gap-3">
          {item.icon}
          <span>{item.label}</span>
        </div>
        {item.badge && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-xevn-accent text-[10px] font-bold text-white">
            {item.badge}
          </span>
        )}
      </NavLink>
    );
  };

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-dvh w-64 flex-col bg-slate-900">
      {/* Logo Header */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <img src="/xevn-logo.png" alt="XeVN" className="h-10 w-10 object-contain" />
          <div>
            <h1 className="text-white font-bold text-lg tracking-tight">
              X-BOS
            </h1>
            <p className="text-white/60 text-xs">XeVN Holding</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {/* Primary Menus - Executive Modules */}
        <div className="mb-6">
          <p className="px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Phân hệ chính
          </p>
          <div className="space-y-1">
            {visiblePrimaryMenus.map((item) => renderMenuItem(item))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-700 my-4"></div>

        {/* Settings Menus - Global Setup (Foundation) */}
        <div>
          <p className="px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Danh mục gốc (MDM)
          </p>
          <div className="space-y-1">
            {visibleSettingsMenus.map((item) => renderMenuItem(item))}
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700">
        <div className="text-center">
          <p className="text-slate-500 text-[10px]">
            Version 1.0.0 | © 2024 XeVN
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
