import { useState, useEffect, useMemo } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Clock,
  Wallet,
  Building2,
  Settings,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  HelpCircle,
  FileSignature,
  Shield,
  FileText,
  Menu,
  X,
  Bot,
  ClipboardList,
  BookOpen,
  ConciergeBell,
  Wrench,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePermissions } from '@/hooks/usePermissions';

interface BrandingConfig {
  logoUrl: string | null;
  systemName: string;
  systemNameShort: string;
}

const STORAGE_KEY = 'branding_config';

const getDefaultBranding = (): BrandingConfig => ({
  logoUrl: null,
  systemName: 'UNICOM HRM',
  systemNameShort: 'UC',
});


interface NavItem {
  titleKey: string;
  icon: React.ElementType;
  path: string;
  badge?: number;
  color?: string;
  module?: string; // Permission module to check
}

interface NavItemWithChildren {
  titleKey: string;
  icon: React.ElementType;
  path?: string;
  badge?: number;
  color?: string;
  module?: string; // Permission module to check
  children?: NavItem[];
}

const mainNavItems: NavItemWithChildren[] = [
  { titleKey: 'nav.dashboard', icon: LayoutDashboard, path: '/', module: 'dashboard' },
  { 
    titleKey: 'nav.hr', 
    icon: Users, 
    children: [
      { titleKey: 'nav.employees', icon: Users, path: '/employees', color: 'bg-indigo-500', module: 'employees' },
      { titleKey: 'nav.contracts', icon: FileSignature, path: '/contracts', color: 'bg-emerald-500', module: 'contracts' },
      { titleKey: 'nav.insurance', icon: Shield, path: '/insurance', color: 'bg-amber-500', module: 'insurance' },
      { titleKey: 'nav.decisions', icon: FileText, path: '/decisions', color: 'bg-rose-500', module: 'decisions' },
    ]
  },
  { titleKey: 'nav.recruitment', icon: UserPlus, path: '/recruitment', badge: 3, module: 'recruitment' },
  { titleKey: 'nav.attendance', icon: Clock, path: '/attendance', module: 'attendance' },
  { titleKey: 'nav.payroll', icon: Wallet, path: '/payroll', module: 'payroll' },
  { titleKey: 'nav.ai', icon: Bot, path: '/ai', module: 'ai' },
  { titleKey: 'nav.tasks', icon: ClipboardList, path: '/tasks', module: 'tasks' },
  { titleKey: 'nav.processes', icon: BookOpen, path: '/processes', module: 'processes' },
  { titleKey: 'nav.services', icon: ConciergeBell, path: '/internal-services', module: 'services' },
  { titleKey: 'nav.tools', icon: Wrench, path: '/tools-equipment', module: 'tools' },
];

const settingsNavItems: NavItem[] = [
  { titleKey: 'nav.company', icon: Building2, path: '/company', module: 'company' },
  { titleKey: 'nav.reports', icon: BarChart3, path: '/reports', module: 'reports' },
  { titleKey: 'nav.settings', icon: Settings, path: '/settings', module: 'settings' },
];

// Mobile sidebar trigger component for header
export function MobileSidebarTrigger() {
  const [open, setOpen] = useState(false);
  
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden h-9 w-9">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-72 bg-sidebar border-sidebar-border">
        <MobileSidebarContent onClose={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}

function MobileSidebarContent({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const location = useLocation();
  const [openPopover, setOpenPopover] = useState<string | null>(null);
  const { hasAnyPermission } = usePermissions();
  
  const [branding, setBranding] = useState<BrandingConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return getDefaultBranding();
      }
    }
    return getDefaultBranding();
  });

  const filteredMainNav = useMemo(() => mainNavItems.map(item => {
    if (item.children) {
      const filteredChildren = item.children.filter(c => !c.module || hasAnyPermission(c.module));
      if (filteredChildren.length === 0) return null;
      return { ...item, children: filteredChildren };
    }
    return !item.module || hasAnyPermission(item.module) ? item : null;
  }).filter(Boolean) as NavItemWithChildren[], [hasAnyPermission]);

  const filteredSettingsNav = useMemo(() => 
    settingsNavItems.filter(item => !item.module || hasAnyPermission(item.module)),
  [hasAnyPermission]);

  const isActive = (path: string) => {
    const currentPath = location.pathname.replace(/^\/hr(?=\/|$)/, '');
    if (path === '/') return currentPath === '/';
    return currentPath === path || currentPath.startsWith(`${path}/`);
  };

  const isParentActive = (item: NavItemWithChildren) => {
    if (item.children) {
      return item.children.some(child => isActive(child.path));
    }
    return item.path ? isActive(item.path) : false;
  };

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--gradient-sidebar)' }}>
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          {branding.logoUrl && (
            <img src={branding.logoUrl} alt="Logo" className="w-8 h-8 object-contain" />
          )}
          <span className="font-bold text-sidebar-foreground text-lg">{branding.systemName}</span>
        </div>
        <SheetClose asChild>
          <Button variant="ghost" size="icon" className="text-sidebar-foreground h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </SheetClose>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <div className="px-3 mb-6">
          <span className="text-xs font-semibold text-sidebar-muted uppercase tracking-wider px-3">
            {t('nav.mainMenu')}
          </span>
          <ul className="mt-2 space-y-1">
            {filteredMainNav.map((item) => (
              <li key={item.titleKey}>
                {item.children ? (
                  <Popover 
                    open={openPopover === item.titleKey} 
                    onOpenChange={(open) => setOpenPopover(open ? item.titleKey : null)}
                  >
                    <PopoverTrigger asChild>
                      <button
                        className={cn(
                          'sidebar-link w-full group',
                          isParentActive(item) && 'active'
                        )}
                      >
                        <item.icon className="w-5 h-5 shrink-0" />
                        <span>{t(item.titleKey)}</span>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent 
                      side="right" 
                      align="start"
                      sideOffset={8}
                      className="w-auto p-3 bg-popover border border-border shadow-lg rounded-xl z-50"
                    >
                      <div className="grid grid-cols-2 gap-2 min-w-[200px]">
                        {item.children.map((child) => (
                          <NavLink
                            key={child.path}
                            to={child.path}
                            onClick={() => {
                              setOpenPopover(null);
                              onClose();
                            }}
                            className={cn(
                              'flex flex-col items-center gap-2 p-3 rounded-xl text-xs transition-all hover:bg-accent group',
                              isActive(child.path) && 'bg-accent'
                            )}
                          >
                            <div className={cn(
                              'w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm',
                              child.color || 'bg-primary'
                            )}>
                              <child.icon className="w-5 h-5" />
                            </div>
                            <span className="text-foreground font-medium text-center leading-tight">
                              {t(child.titleKey)}
                            </span>
                          </NavLink>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                ) : (
                  <NavLink
                    to={item.path!}
                    onClick={onClose}
                    className={cn(
                      'sidebar-link group',
                      isActive(item.path!) && 'active'
                    )}
                  >
                    <item.icon className="w-5 h-5 shrink-0" />
                    <span className="flex-1">{t(item.titleKey)}</span>
                    {item.badge && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-primary text-primary-foreground rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="px-3">
          <span className="text-xs font-semibold text-sidebar-muted uppercase tracking-wider px-3">
            {t('nav.management')}
          </span>
          <ul className="mt-2 space-y-1">
            {filteredSettingsNav.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={onClose}
                  className={cn(
                    'sidebar-link group',
                    isActive(item.path) && 'active'
                  )}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  <span>{t(item.titleKey)}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Help Section */}
      <div className="p-3 border-t border-sidebar-border">
        <NavLink to="/guide" onClick={onClose} className="sidebar-link w-full group">
          <HelpCircle className="w-5 h-5 shrink-0" />
          <span>{t('guide.title')}</span>
        </NavLink>
      </div>
    </div>
  );
}

export function AppSidebar() {
  const { t } = useTranslation();
  const collapsed = false;
  const [openPopover, setOpenPopover] = useState<string | null>(null);
  const location = useLocation();
  const isMobile = useIsMobile();
  const { hasAnyPermission } = usePermissions();
  
  const [branding, setBranding] = useState<BrandingConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return getDefaultBranding();
      }
    }
    return getDefaultBranding();
  });

  const filteredMainNav = useMemo(() => mainNavItems.map(item => {
    if (item.children) {
      const filteredChildren = item.children.filter(c => !c.module || hasAnyPermission(c.module));
      if (filteredChildren.length === 0) return null;
      return { ...item, children: filteredChildren };
    }
    return !item.module || hasAnyPermission(item.module) ? item : null;
  }).filter(Boolean) as NavItemWithChildren[], [hasAnyPermission]);

  const filteredSettingsNav = useMemo(() => 
    settingsNavItems.filter(item => !item.module || hasAnyPermission(item.module)),
  [hasAnyPermission]);

  useEffect(() => {
    const handleBrandingUpdate = (e: CustomEvent<BrandingConfig>) => {
      setBranding(e.detail);
    };

    window.addEventListener('branding-updated', handleBrandingUpdate as EventListener);
    return () => {
      window.removeEventListener('branding-updated', handleBrandingUpdate as EventListener);
    };
  }, []);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const isParentActive = (item: NavItemWithChildren) => {
    if (item.children) {
      return item.children.some(child => isActive(child.path));
    }
    return item.path ? isActive(item.path) : false;
  };

  // Hide sidebar on mobile - use Sheet instead
  if (isMobile) {
    return null;
  }

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-50 h-screen w-64 bg-sidebar flex-col border-r border-sidebar-border hidden md:flex'
      )}
      style={{ background: 'var(--gradient-sidebar)' }}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-center px-4 border-b border-sidebar-border gap-2">
        {branding.logoUrl && (
          <img 
            src={branding.logoUrl} 
            alt="Logo" 
            className={cn(
              "object-contain transition-all duration-300",
              collapsed ? "w-6 h-6" : "w-8 h-8"
            )}
          />
        )}
        {!collapsed && (
          <span className="font-bold text-sidebar-foreground text-lg">{branding.systemName}</span>
        )}
        {collapsed && !branding.logoUrl && (
          <span className="font-bold text-sidebar-foreground text-sm">{branding.systemNameShort}</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <div className="px-3 mb-6">
          {!collapsed && (
            <span className="text-xs font-semibold text-sidebar-muted uppercase tracking-wider px-3">
              {t('nav.mainMenu')}
            </span>
          )}
          <ul className="mt-2 space-y-1">
            {filteredMainNav.map((item) => (
              <li key={item.titleKey}>
                {item.children ? (
                  // Menu with children - Popover style
                  <Popover 
                    open={openPopover === item.titleKey} 
                    onOpenChange={(open) => setOpenPopover(open ? item.titleKey : null)}
                  >
                    <PopoverTrigger asChild>
                      <button
                        className={cn(
                          'sidebar-link w-full group',
                          isParentActive(item) && 'active'
                        )}
                        title={collapsed ? t(item.titleKey) : undefined}
                      >
                        <item.icon className="w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110" />
                        {!collapsed && <span>{t(item.titleKey)}</span>}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent 
                      side="right" 
                      align="start"
                      sideOffset={8}
                      className="w-auto p-3 bg-popover border border-border shadow-lg rounded-xl z-50"
                    >
                      <div className="grid grid-cols-2 gap-2 min-w-[200px]">
                        {item.children.map((child) => (
                          <NavLink
                            key={child.path}
                            to={child.path}
                            onClick={() => setOpenPopover(null)}
                            className={cn(
                              'flex flex-col items-center gap-2 p-3 rounded-xl text-xs transition-all hover:bg-accent group',
                              isActive(child.path) && 'bg-accent'
                            )}
                          >
                            <div className={cn(
                              'w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm transition-transform duration-200 group-hover:scale-110',
                              child.color || 'bg-primary'
                            )}>
                              <child.icon className="w-5 h-5" />
                            </div>
                            <span className="text-foreground font-medium text-center leading-tight">
                              {t(child.titleKey)}
                            </span>
                          </NavLink>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                ) : (
                  // Regular menu item
                  <NavLink
                    to={item.path!}
                    className={cn(
                      'sidebar-link group',
                      isActive(item.path!) && 'active'
                    )}
                    title={collapsed ? t(item.titleKey) : undefined}
                  >
                    <item.icon className="w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110" />
                    {!collapsed && (
                      <>
                        <span className="flex-1">{t(item.titleKey)}</span>
                        {item.badge && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-primary text-primary-foreground rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="px-3">
          {!collapsed && (
            <span className="text-xs font-semibold text-sidebar-muted uppercase tracking-wider px-3">
              {t('nav.management')}
            </span>
          )}
          <ul className="mt-2 space-y-1">
            {filteredSettingsNav.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={cn(
                    'sidebar-link group',
                    isActive(item.path) && 'active'
                  )}
                  title={collapsed ? t(item.titleKey) : undefined}
                >
                  <item.icon className="w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110" />
                  {!collapsed && <span>{t(item.titleKey)}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Help Section */}
      <div className="p-3 border-t border-sidebar-border">
        <NavLink
          to="/guide"
          className="sidebar-link w-full group"
          title={collapsed ? t('guide.title') : undefined}
        >
          <HelpCircle className="w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110" />
          {!collapsed && <span>{t('guide.title')}</span>}
        </NavLink>
      </div>

    </aside>
  );
}
