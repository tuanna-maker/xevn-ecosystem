import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, Search, Building2, LayoutGrid, Home, ChevronRight, LogOut, User, Settings, Key, Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeToggle } from './ThemeToggle';
import { MobileSidebarTrigger } from './AppSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useHrmInboxNotifications } from '@/hooks/useHrmInboxNotifications';
import {
  canMarkHrmInboxPersonalRead,
  inboxNotificationSummary,
  isHrmInboxUnread,
} from '@/lib/hrmInboxNotificationDisplay';

/**
 * @CODE-MEMORY-CHANGE 2026-08-04 PO-UC-TC-W4-FE-NT01-INBOX-MARK-READ-01
 * change_mode: ADD
 * What: Bell dropdown uses HRM inbox API when employee_id + isHrmNestApiReachable (proxy or origin); no mock «3»
 * Why: HRM-NT-01 web embed · parity mobile InAppNotificationsScreen mark read
 * must_keep: password dialog; company switcher; U65 no fake unread
 *
 * @CODE-MEMORY-CHANGE 2026-08-04 PO-UC-TC-W4-FE-NT01-MARK-COMPANY-UUID-01
 * change_mode: FIX
 * What: bell click mark-read only when canMarkHrmInboxPersonalRead (not broadcast NULL)
 * Why: QA R3 BA AC-NT01-MARK-01 personal-only; UUID company_id resolved in hook/API
 * must_keep: GET inbox proxy; ceo@ EXPECTED_NO_INBOX; U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-W3-PORT-B
 * change_mode: UPGRADE
 * What: Muted icon/hint density — text-muted-foreground → text-xevn-textMuted (icons) / textSecondary (labels)
 * Why: PORT-A-QA residual AppHeader; ADR-XEVN-PRECISION-MOTION-TOKENS-20260805 §8
 * must_keep: inbox mark-read; company switcher; password dialog; membership labels; U65 no seed
 */

// Route to translation key mapping
const routeMap: Record<string, { key: string; parent?: string }> = {
  '/': { key: 'nav.dashboard' },
  '/employees': { key: 'nav.employees', parent: 'nav.hr' },
  '/contracts': { key: 'nav.contracts', parent: 'nav.hr' },
  '/insurance': { key: 'nav.insurance', parent: 'nav.hr' },
  '/decisions': { key: 'nav.decisions', parent: 'nav.hr' },
  '/recruitment': { key: 'nav.recruitment' },
  '/attendance': { key: 'nav.attendance' },
  '/payroll': { key: 'nav.payroll' },
  '/company': { key: 'nav.company' },
  '/reports': { key: 'nav.reports' },
  '/settings': { key: 'nav.settings' },
  '/notifications': { key: 'header.notifications' },
};

export function AppHeader() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, memberships, currentCompanyId, setCurrentCompanyId, signOut } = useAuth();
  const {
    enabled: inboxApiEnabled,
    rows: inboxRows,
    unreadCount,
    isLoading: inboxLoading,
    markRead,
  } = useHrmInboxNotifications({ limit: 8 });

  // Change password dialog
  const [pwDialogOpen, setPwDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  const handleChangePassword = async () => {
    if (newPassword.length < 8) {
      toast.error(t('header.passwordMinLength', 'Mật khẩu tối thiểu 8 ký tự'));
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(t('header.passwordMismatch', 'Mật khẩu nhập lại không khớp'));
      return;
    }
    setPwLoading(true);
    try {
      toast.success(t('header.passwordChanged', 'Đổi mật khẩu thành công'));
      setPwDialogOpen(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.message || t('header.passwordChangeFailed', 'Đổi mật khẩu thất bại'));
    } finally {
      setPwLoading(false);
    }
  };

  // Get current company
  const currentMembership = memberships.find(m => m.company_id === currentCompanyId);
  const currentCompany = currentMembership?.company;

  // Get breadcrumb items based on current route
  const getBreadcrumbs = () => {
    // Normalize path for cases where React Router exposes full pathname with base prefix.
    // Our routeMap uses paths without `/hr` or `/hrm` prefix.
    const currentPath = location.pathname.replace(/^\/hrm?(?=\/|$)/, '');
    const routeInfo = routeMap[currentPath];
    
    if (!routeInfo) {
      // Handle employee profile or other dynamic routes
      if (currentPath.startsWith('/employees/')) {
        return [
          { key: 'nav.hr', path: null },
          { key: 'nav.employees', path: '/employees' },
          { key: 'header.employeeProfile', path: null },
        ];
      }
      return [];
    }

    const breadcrumbs = [];
    
    if (routeInfo.parent) {
      breadcrumbs.push({ key: routeInfo.parent, path: null });
    }
    
    breadcrumbs.push({ key: routeInfo.key, path: currentPath });
    
    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const handleSwitchCompany = (companyId: string) => {
    setCurrentCompanyId(companyId);
  };

  // Get user initials for avatar
  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  return (
    <header className="z-40 flex h-16 w-full shrink-0 items-center justify-between border-b border-xevn-border bg-xevn-surface px-3 md:px-6">
      {/* Left Section - Mobile Menu & Breadcrumb */}
      <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
        {/* Mobile Menu Trigger - hidden since bottom nav exists */}
        <div className="md:hidden">
          <MobileSidebarTrigger />
        </div>

        {/* App Grid - hidden on mobile */}
        <Button variant="ghost" size="icon" className="h-9 w-9 hidden md:flex">
          <LayoutGrid className="w-5 h-5 text-xevn-textMuted" />
        </Button>

        {/* Breadcrumb - simplified on mobile */}
        <nav className="flex items-center gap-1 text-sm min-w-0">
          <Link 
            to="/" 
            className="flex items-center gap-1 text-xevn-textSecondary hover:text-xevn-text transition-colors shrink-0"
          >
            <Home className="w-4 h-4" />
          </Link>
          {breadcrumbs.slice(-1).map((item, index) => (
            <div key={index} className="flex items-center gap-1 min-w-0">
              <ChevronRight className="w-4 h-4 text-xevn-textMuted shrink-0" />
              <span className="font-medium text-xevn-text truncate">
                {t(item.key)}
              </span>
            </div>
          ))}
        </nav>

        {/* Search - hidden on mobile */}
        <div className="relative ml-4 hidden lg:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-xevn-textMuted" />
          <Input
            placeholder={t('common.search')}
            className="pl-10 w-64 bg-xevn-background border-0 focus-visible:ring-1"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-1 md:gap-2 shrink-0">
        {/* Company Switcher - simplified on mobile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-1 md:gap-2 h-9 px-2 md:px-3">
              <Building2 className="w-4 h-4 text-primary" />
              <span className="font-medium text-sm max-w-[80px] md:max-w-[150px] truncate hidden sm:inline">
                {currentCompany?.name || t('header.selectCompany')}
              </span>
              <ChevronDown className="w-4 h-4 text-xevn-textMuted hidden sm:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>{t('company.switchCompany')}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {memberships.length > 0 ? (
              memberships.map((membership) => (
                <DropdownMenuItem 
                  key={membership.id}
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => handleSwitchCompany(membership.company_id)}
                >
                  <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                    {membership.company?.logo_url ? (
                      <img 
                        src={membership.company.logo_url} 
                        alt="" 
                        className="w-6 h-6 rounded object-cover" 
                      />
                    ) : (
                      <Building2 className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-xevn-text">{membership.company?.name}</p>
                    <p className="text-xs text-xevn-textSecondary capitalize">{membership.role}</p>
                  </div>
                  {membership.company_id === currentCompanyId && (
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  )}
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-xevn-text">{t('header.noCompany')}</p>
                  <p className="text-xs text-xevn-textSecondary">
                    {t('header.createCompanyPrompt')}
                  </p>
                </div>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-primary cursor-pointer"
              onClick={() => navigate('/onboarding')}
            >
              + {t('company.addNewCompany')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Plan Badge - hidden on mobile */}
        <Badge variant="secondary" className="bg-primary/10 text-primary border-0 hidden lg:flex">
          {currentMembership?.role || 'Free'}
        </Badge>

        {/* Language Switcher - hidden on small mobile */}
        <div className="hidden sm:block">
          <LanguageSwitcher />
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications — HRM inbox when API + employee_id; no mock unread (HRM-NT-01) */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-9 w-9" aria-label={t('header.notifications')}>
              <Bell className="w-5 h-5" />
              {inboxApiEnabled && unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[1rem] md:min-w-[1.25rem] h-4 md:h-5 px-0.5 bg-destructive text-destructive-foreground text-[10px] md:text-xs font-medium rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72 md:w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>{t('header.notifications')}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {!inboxApiEnabled && (
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-3 cursor-default focus:bg-transparent">
                <p className="text-xs text-xevn-textSecondary">
                  {t(
                    'header.inboxRequiresEmployee',
                    'Thông báo HRM cần tài khoản gắn mã nhân viên trên công ty đang chọn.',
                  )}
                </p>
              </DropdownMenuItem>
            )}
            {inboxApiEnabled && inboxLoading && (
              <DropdownMenuItem className="flex items-center gap-2 py-3 cursor-default focus:bg-transparent">
                <Loader2 className="h-4 w-4 animate-spin text-xevn-textMuted" />
                <span className="text-xs text-xevn-textSecondary">{t('common.loading', 'Đang tải…')}</span>
              </DropdownMenuItem>
            )}
            {inboxApiEnabled && !inboxLoading && inboxRows.length === 0 && (
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-3 cursor-default focus:bg-transparent">
                <p className="text-xs text-xevn-textSecondary">{t('header.inboxEmpty', 'Chưa có thông báo.')}</p>
              </DropdownMenuItem>
            )}
            {inboxApiEnabled &&
              !inboxLoading &&
              inboxRows.slice(0, 5).map((row) => (
                <DropdownMenuItem
                  key={row.id}
                  className="flex flex-col items-start gap-1 py-3 cursor-pointer"
                  onClick={() => {
                    if (canMarkHrmInboxPersonalRead(row)) {
                      void markRead(row).catch(() => undefined);
                    }
                  }}
                >
                  <p className={`text-sm ${isHrmInboxUnread(row) ? 'font-medium text-xevn-text' : 'font-normal text-xevn-textSecondary'}`}>
                    {inboxNotificationSummary(row)}
                  </p>
                  <p className="text-xs text-xevn-textMuted">
                    {new Date(row.created_at).toLocaleString('vi-VN')}
                  </p>
                </DropdownMenuItem>
              ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-center text-primary text-sm cursor-pointer"
              onClick={() => navigate('/notifications')}
            >
              {t('header.viewAllNotifications')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-1 md:gap-2 h-9 px-1 md:pl-2">
              <Avatar className="w-7 h-7 md:w-8 md:h-8">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs md:text-sm">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-col items-start hidden lg:flex">
                <span className="text-sm font-medium text-xevn-text">
                  {profile?.full_name || user?.email?.split('@')[0] || 'User'}
                </span>
                <span className="text-xs text-xevn-textSecondary">
                  {t(`roles.${currentMembership?.role || 'user'}`)}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-xevn-textMuted hidden lg:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-xevn-text">{profile?.full_name || 'User'}</span>
                <span className="text-xs font-normal text-xevn-textSecondary">
                  {user?.email}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <User className="w-4 h-4 mr-2" />
              {t('header.personalInfo')}
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={() => setPwDialogOpen(true)}>
              <Key className="w-4 h-4 mr-2" />
              {t('header.changePassword')}
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/settings')}>
              <Settings className="w-4 h-4 mr-2" />
              {t('nav.settings')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive cursor-pointer"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              {t('header.signOut')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={pwDialogOpen} onOpenChange={(open) => { setPwDialogOpen(open); if (!open) { setNewPassword(''); setConfirmPassword(''); setShowNew(false); setShowConfirm(false); } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Key className="w-5 h-5 text-primary" />{t('header.changePassword')}</DialogTitle>
            <DialogDescription>{t('header.changePasswordDesc', 'Nhập mật khẩu mới cho tài khoản của bạn')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>{t('header.newPassword', 'Mật khẩu mới')}</Label>
              <div className="relative">
                <Input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder={t('header.passwordMinLength', 'Tối thiểu 8 ký tự')}
                  maxLength={128}
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-xevn-textMuted hover:text-xevn-text" onClick={() => setShowNew(v => !v)}>
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>{t('header.confirmPassword', 'Nhập lại mật khẩu')}</Label>
              <div className="relative">
                <Input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder={t('header.confirmPasswordPlaceholder', 'Nhập lại mật khẩu mới')}
                  maxLength={128}
                  onKeyDown={e => e.key === 'Enter' && handleChangePassword()}
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-xevn-textMuted hover:text-xevn-text" onClick={() => setShowConfirm(v => !v)}>
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-destructive">{t('header.passwordMismatch', 'Mật khẩu nhập lại không khớp')}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPwDialogOpen(false)}>{t('common.cancel', 'Hủy')}</Button>
            <Button onClick={handleChangePassword} disabled={pwLoading || !newPassword || !confirmPassword || newPassword !== confirmPassword}>
              {pwLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t('common.processing', 'Đang xử lý...')}</> : t('common.save', 'Lưu')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}
