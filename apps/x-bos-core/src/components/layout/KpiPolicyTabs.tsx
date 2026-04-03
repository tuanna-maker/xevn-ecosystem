import { NavLink } from 'react-router-dom';
import { Calculator, ClipboardList, Percent, Target } from 'lucide-react';
import { cn } from '@/lib/cn';

export function KpiPolicyTabs() {
  const tabs = [
    { to: '/kpi-policy/kpi', label: 'KPI', icon: Target },
    { to: '/kpi-policy/policy', label: 'Chính sách', icon: ClipboardList },
    { to: '/kpi-policy/tariff', label: 'Khoảng mức', icon: Percent },
    { to: '/kpi-policy/calc', label: 'Tính thưởng/phạt', icon: Calculator },
  ];

  return (
    <nav className="flex flex-wrap items-center gap-2 rounded-2xl border border-black/[0.06] bg-white/65 p-2 shadow-glass backdrop-blur-sm">
      {tabs.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-xevn-primary/10 text-xevn-primary'
                : 'text-xevn-muted hover:bg-black/[0.04] hover:text-xevn-text'
            )
          }
        >
          <Icon className="h-4 w-4 opacity-90" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

