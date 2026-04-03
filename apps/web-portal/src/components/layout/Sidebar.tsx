import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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
    id: 'x-bos',
    label: 'X-BOS',
    icon: <Building2 size={20} />,
    path: `${P}/organization`,
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
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['settings']);
  const location = useLocation();

  const hrmOrigin =
    import.meta.env.VITE_HRM_ORIGIN ?? (import.meta.env.DEV ? 'http://localhost:8080' : '');

  const resolveExternalHref = (href: string) => {
    // HRM app chạy độc lập ở port khác (dev) và mount theo basename `/hr`.
    if (href.startsWith('/hr')) {
      return hrmOrigin ? `${hrmOrigin}${href}` : href;
    }
    return href;
  };

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
    const isParentActive = item.children?.some(
      (child) => location.pathname === child.path
    );

    if (hasChildren) {
      return (
        <div key={item.id}>
          <button
            onClick={() => toggleMenu(item.id)}
            className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
              isParentActive
                ? 'bg-xevn-accent/10 text-xevn-accent'
                : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
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

    if (item.external && item.path) {
      // Treat HRM routes as internal navigation to avoid full reload.
      // (Full reload can make Mac browser re-apply a different per-origin zoom.)
      if (item.path.startsWith('/command-center/hrm')) {
        return (
          <NavLink
            key={item.id}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-xevn-accent text-white shadow-lg shadow-xevn-accent/25'
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
              } ${isChild ? 'py-2.5 text-[13px]' : ''}`
            }
          >
            <div className="flex items-center gap-3">
              {item.icon}
              <span>{item.label}</span>
            </div>
            {item.badge && (
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-green-500 text-white rounded-full animate-pulse">
                {item.badge}
              </span>
            )}
          </NavLink>
        );
      }
      return (
        <a
          key={item.id}
          href={resolveExternalHref(item.path)}
          className={`flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
            isChild ? 'py-2.5 text-[13px]' : ''
          } text-slate-300 hover:bg-slate-700/50 hover:text-white`}
        >
          <div className="flex items-center gap-3">
            {item.icon}
            <span>{item.label}</span>
          </div>
          {item.badge && (
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-green-500 text-white rounded-full animate-pulse">
              {item.badge}
            </span>
          )}
        </a>
      );
    }

    return (
      <NavLink
        key={item.id}
        to={item.path || P}
        className={({ isActive }) =>
          `flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
            isActive
              ? 'bg-xevn-accent text-white shadow-lg shadow-xevn-accent/25'
              : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
          } ${isChild ? 'py-2.5 text-[13px]' : ''}`
        }
      >
        <div className="flex items-center gap-3">
          {item.icon}
          <span>{item.label}</span>
        </div>
        {item.badge && (
          <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-green-500 text-white rounded-full animate-pulse">
            {item.badge}
          </span>
        )}
      </NavLink>
    );
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-xevn-sidebar flex flex-col z-50">
      {/* Logo Header */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-xevn-accent to-blue-400 flex items-center justify-center text-white font-bold text-lg shadow-lg">
            X
          </div>
          <div>
            <h1 className="text-white font-bold text-lg tracking-tight">
              X-BOS
            </h1>
            <p className="text-slate-400 text-xs">XeVN Holding</p>
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
            {primaryMenus.map((item) => renderMenuItem(item))}
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
            {settingsMenus.map((item) => renderMenuItem(item))}
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
