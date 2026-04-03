import { NavLink } from 'react-router-dom';
import { ClipboardList, Target, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/cn';

export function KpiTabs() {
  const tabs = [
    { to: '/kpi', label: 'Khai báo KPI', icon: ClipboardList, end: true },
    { to: '/kpi/assign', label: 'Gán KPI', icon: Target, end: false },
    { to: '/kpi/tracking', label: 'Theo dõi tiến độ', icon: TrendingUp, end: false },
  ];

  return (
    <nav
      aria-label="Điều hướng KPI"
      className="-mx-1 flex flex-wrap gap-1 border-b border-black/[0.08] sm:gap-2"
    >
      {tabs.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            cn(
              'inline-flex items-center gap-2 border-b-2 px-3 py-3 text-sm font-semibold transition-colors sm:px-4',
              isActive
                ? '-mb-px border-xevn-primary text-xevn-primary'
                : 'border-transparent text-xevn-muted hover:border-black/[0.12] hover:text-xevn-text'
            )
          }
        >
          <Icon className="h-4 w-4 shrink-0 opacity-90" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

