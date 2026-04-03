import { NavLink } from 'react-router-dom';
import { LayoutGrid, Settings2 } from 'lucide-react';
import { cn } from '@/lib/cn';

export function OrgTabs() {
  const tabs = [
    { to: '/', label: 'Danh sách', icon: LayoutGrid, end: true },
    { to: '/metadata', label: 'Trường bổ sung', icon: Settings2, end: false },
  ];

  return (
    <nav className="flex flex-wrap items-center gap-2 rounded-2xl border border-black/[0.06] bg-white/65 p-2 shadow-glass backdrop-blur-sm">
      {tabs.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
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

