import { NavLink } from 'react-router-dom';
import { ClipboardList, Scale, ReceiptText } from 'lucide-react';
import { cn } from '@/lib/cn';

export function PolicyTabs() {
  const tabs = [
    { to: '/policy', label: 'Global Policy & Override', icon: ClipboardList, end: true },
    { to: '/policy/tariff', label: 'Cấu hình thưởng/phạt theo KPI', icon: Scale, end: false },
    { to: '/policy/summary', label: 'Scanning & phê duyệt', icon: ReceiptText, end: false },
  ];

  return (
    <nav
      aria-label="Điều hướng chính sách"
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

