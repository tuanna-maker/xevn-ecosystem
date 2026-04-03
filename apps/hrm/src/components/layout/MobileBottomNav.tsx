import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Users,
  Clock,
  Wallet,
  MoreHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import {
  UserPlus,
  Building2,
  BarChart3,
  Settings,
  HelpCircle,
  Bot,
  ClipboardList,
  FileSignature,
  Shield,
  FileText,
  X,
  BookOpen,
  ConciergeBell,
  Wrench,
} from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';

interface BottomNavItem {
  titleKey: string;
  icon: React.ElementType;
  path: string;
  module?: string;
}

const primaryNavItems: BottomNavItem[] = [
  { titleKey: 'nav.dashboard', icon: LayoutDashboard, path: '/', module: 'dashboard' },
  { titleKey: 'nav.employees', icon: Users, path: '/employees', module: 'employees' },
  { titleKey: 'nav.attendance', icon: Clock, path: '/attendance', module: 'attendance' },
  { titleKey: 'nav.payroll', icon: Wallet, path: '/payroll', module: 'payroll' },
];

const moreNavItems: BottomNavItem[] = [
  { titleKey: 'nav.recruitment', icon: UserPlus, path: '/recruitment', module: 'recruitment' },
  { titleKey: 'nav.contracts', icon: FileSignature, path: '/contracts', module: 'contracts' },
  { titleKey: 'nav.insurance', icon: Shield, path: '/insurance', module: 'insurance' },
  { titleKey: 'nav.decisions', icon: FileText, path: '/decisions', module: 'decisions' },
  { titleKey: 'nav.ai', icon: Bot, path: '/ai', module: 'ai' },
  { titleKey: 'nav.tasks', icon: ClipboardList, path: '/tasks', module: 'tasks' },
  { titleKey: 'nav.company', icon: Building2, path: '/company', module: 'company' },
  { titleKey: 'nav.reports', icon: BarChart3, path: '/reports', module: 'reports' },
  { titleKey: 'nav.processes', icon: BookOpen, path: '/processes', module: 'processes' },
  { titleKey: 'nav.services', icon: ConciergeBell, path: '/internal-services', module: 'services' },
  { titleKey: 'nav.tools', icon: Wrench, path: '/tools-equipment', module: 'tools' },
  { titleKey: 'nav.settings', icon: Settings, path: '/settings', module: 'settings' },
  { titleKey: 'guide.title', icon: HelpCircle, path: '/guide' },
];

export function MobileBottomNav() {
  const { t } = useTranslation();
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const { hasAnyPermission } = usePermissions();

  const isActive = (path: string) => {
    const currentPath = location.pathname.replace(/^\/hr(?=\/|$)/, '');
    if (path === '/') return currentPath === '/';
    return currentPath === path || currentPath.startsWith(`${path}/`);
  };

  const isMoreActive = moreNavItems.some(item => isActive(item.path));

  const filteredPrimary = primaryNavItems.filter(i => !i.module || hasAnyPermission(i.module));
  const filteredMore = moreNavItems.filter(i => !i.module || hasAnyPermission(i.module));

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-area-bottom">
      <div className="flex items-stretch justify-around h-16">
        {filteredPrimary.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={cn(
              'flex flex-col items-center justify-center flex-1 gap-0.5 text-muted-foreground transition-colors',
              isActive(item.path) && 'text-primary'
            )}
          >
            <item.icon className={cn('w-5 h-5', isActive(item.path) && 'text-primary')} />
            <span className="text-[10px] font-medium leading-tight">{t(item.titleKey)}</span>
          </NavLink>
        ))}

        {/* More button */}
        <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
          <SheetTrigger asChild>
            <button
              className={cn(
                'flex flex-col items-center justify-center flex-1 gap-0.5 text-muted-foreground transition-colors',
                isMoreActive && 'text-primary'
              )}
            >
              <MoreHorizontal className={cn('w-5 h-5', isMoreActive && 'text-primary')} />
              <span className="text-[10px] font-medium leading-tight">{t('nav.more', 'More')}</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-2xl pb-8 max-h-[70vh]">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-foreground">{t('nav.mainMenu')}</h3>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {filteredMore.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMoreOpen(false)}
                  className={cn(
                    'flex flex-col items-center gap-1.5 p-3 rounded-xl transition-colors',
                    isActive(item.path)
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted'
                  )}
                >
                  <div className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center',
                    isActive(item.path) ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  )}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-medium text-center leading-tight">
                    {t(item.titleKey)}
                  </span>
                </NavLink>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
