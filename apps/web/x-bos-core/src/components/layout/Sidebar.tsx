import { NavLink, useLocation } from 'react-router-dom';
import { Building2, LayoutGrid, Network, ReceiptText, Settings, Target } from 'lucide-react';
import { cn } from '@/lib/cn';

export function Sidebar() {
  const location = useLocation();

  const kpiOpen = location.pathname === '/kpi' || location.pathname.startsWith('/kpi/');
  const settingsOpen = location.pathname.startsWith('/settings');
  const policyOpen = location.pathname === '/policy' || location.pathname.startsWith('/policy/');

  return (
    <aside className="fixed left-0 top-0 z-30 flex h-dvh w-64 flex-col border-r border-black/[0.06] bg-white/72 backdrop-blur-nav shadow-glass">
      <div className="flex items-center gap-3 border-b border-black/[0.06] px-5 py-5">
        <img src="/xevn-logo.png" alt="XeVN" className="h-10 w-10 object-contain" />
        <div>
          <div className="text-sm font-semibold tracking-tight text-xevn-text">X-BOS</div>
          <div className="text-xs text-xevn-muted">Dynamic DNA Engine</div>
        </div>
      </div>
      <nav className="flex-1 space-y-0.5 p-3">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-xevn-primary/10 text-xevn-primary'
                : 'text-xevn-muted hover:bg-black/[0.04] hover:text-xevn-text'
            )
          }
        >
          <Building2 className="h-4 w-4 shrink-0 opacity-90" />
          Đơn vị
        </NavLink>

        <NavLink
          to="/org-chart"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-xevn-primary/10 text-xevn-primary'
                : 'text-xevn-muted hover:bg-black/[0.04] hover:text-xevn-text'
            )
          }
        >
          <Network className="h-4 w-4 shrink-0 opacity-90" />
          Sơ đồ tổ chức
        </NavLink>

        <NavLink
          to="/master-data"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-xevn-primary/10 text-xevn-primary'
                : 'text-xevn-muted hover:bg-black/[0.04] hover:text-xevn-text'
            )
          }
        >
          <LayoutGrid className="h-4 w-4 shrink-0 opacity-90" />
          Danh mục tập trung
        </NavLink>

        {/* KPI group */}
        <div className="mt-2">
          <div className="px-3 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-wide text-xevn-muted">
            Quản trị KPI
          </div>
          <NavLink
            to="/kpi"
            end={false}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                isActive || kpiOpen
                  ? 'bg-xevn-primary/10 text-xevn-primary'
                  : 'text-xevn-muted hover:bg-black/[0.04] hover:text-xevn-text'
              )
            }
          >
            <Target className="h-4 w-4 shrink-0 opacity-90" />
            KPI
          </NavLink>
        </div>

        {/* Policy group */}
        <div className="mt-2">
          <div className="px-3 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-wide text-xevn-muted">
            Quản trị chính sách
          </div>
          <NavLink
            to="/policy"
            end={false}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                isActive || policyOpen
                  ? 'bg-xevn-primary/10 text-xevn-primary'
                  : 'text-xevn-muted hover:bg-black/[0.04] hover:text-xevn-text'
              )
            }
          >
            <ReceiptText className="h-4 w-4 shrink-0 opacity-90" />
            Chính sách thưởng/phạt
          </NavLink>
        </div>

        {/* Settings group */}
        <div className="mt-2">
          <div className="px-3 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-wide text-xevn-muted">
            Cài đặt hệ thống
          </div>
          <NavLink
            to="/settings/companies"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                isActive || settingsOpen
                  ? 'bg-xevn-primary/10 text-xevn-primary'
                  : 'text-xevn-muted hover:bg-black/[0.04] hover:text-xevn-text'
              )
            }
          >
            <Settings className="h-4 w-4 shrink-0 opacity-90" />
            Quản lý Công ty & Tenant
          </NavLink>
        </div>
      </nav>
      <div className="border-t border-black/[0.06] p-4 text-xs leading-relaxed text-xevn-muted">
        <div className="font-medium text-xevn-text/80">
          Tab con KPI/Chính sách nằm trong khung nội dung.
        </div>
      </div>
    </aside>
  );
}
