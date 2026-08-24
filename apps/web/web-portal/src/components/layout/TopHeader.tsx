/**
 * @CODE-MEMORY
 * Screen: Portal chrome — TopHeader (WP-SHELL-HEADER)
 * UC: brand chrome · L-CONTRAST / L-TYPE / L-OPS
 * BR: ADR-XEVN-THEME-SHARP-OPS · XEVN_BRAND_UIUX_PROPOSAL §4.1
 * SRS: N/A (theme remaster — no SRS mutate)
 * TechSpec: ADR-XEVN-THEME-SHARP-OPS-20260722 §4
 * Purpose: Thanh header sticky mỏng — mark XeVN 40px + wordmark, membership/scope, tìm kiếm; chữ sắc nét theo token xevn.
 * WorkItem: XEVN-THM-FE-W1
 * Coded: 2026-07-22
 * Callers: shell layouts (Command Center / dashboard)
 * Callees: AuthContext · GlobalFilterContext · authSession membership*Display
 * FEActions: chọn membership → selectMembership; đăng xuất → logout
 * BEChain: memberships *_label từ XBOS auth (OS 28)
 * Impact: Thiếu mark → brand test FAIL; chữ nhạt → L-CONTRAST FAIL
 * must_keep: mark+wordmark luôn hiện; cấm stats strip / emoji / purple gradient avatar
 * SOLID: Chỉ chrome shell — khôngロジ nghiệp vụ module
 * LastVerified: verify:xevn:theme-contrast + visual TopHeader
 *
 * @CODE-MEMORY-CHANGE
 * WorkItem: XEVN-THM-FE-W1 · 2026-07-22
 * Change: ADD mark 40 + wordmark; sticky glass; pale slate/gray classes → xevn tokens; bỏ purple avatar
 * must_keep: brand axis trái; membership/profile phải
 *
 * @CODE-MEMORY-CHANGE
 * WorkItem: W1-B-04-AUTH-FE · 2026-08-03
 * Change: Membership picker bind tenant_label / company_label / role_label từ BE;
 *         bỏ formatRoleCodeVi invent (module thiếu + vi phạm OS 28).
 * must_keep: selectMembership(tenantId); fallback nhãn chỉ «—»
 *
 * @CODE-MEMORY-CHANGE
 * WorkItem: W1-B-04-AUTH-FE-CC-CHIP-01 · 2026-08-03
 * Change: Caller ADD — ExecutiveDashboardLayout mounts TopHeader trên /command-center*
 *         (trước chỉ MainLayout /dashboard/* → chip missing sau login CC).
 * must_keep: data-testid portal-membership-switcher|static; BE *_label via authSession helpers
 *
 * @CODE-MEMORY-CHANGE
 * WorkItem: PO-HRM-UI-BRAND-W3-PORT-A · 2026-08-05
 * change_mode: UPGRADE
 * Change: Membership hover `slate-100` → `xevn-background`; cite ADR-20260805 §8–§9 (PORT-06)
 * must_keep: sticky glass · safe-inline · mark+wordmark · BE *_label · no stats strip
 */
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  ChevronDown,
  Search,
  Building2,
  Check,
  User,
  Settings,
  LogOut,
  Loader2,
} from 'lucide-react';
import { useGlobalFilter } from '../../contexts/GlobalFilterContext';
import { useAuth } from '../../contexts/AuthContext';
import {
  MEMBERSHIP_LABEL_FALLBACK,
  membershipCompanyDisplay,
  membershipRoleDisplay,
  membershipTenantDisplay,
} from '../../integrations/authSession';
import { stripTenantPrefixFromPathname, withTenantQueryParam } from '../../modules/hrm/paths';

const TopHeader: React.FC = () => {
  const navigate = useNavigate();
  const { logout, user, selectMembership, membershipSwitching } = useAuth();
  const { selectedTenant, setSelectedTenant, tenants, tenantScopeError, tenantScopeStatus } =
    useGlobalFilter();
  const [isTenantDropdownOpen, setIsTenantDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [switchError, setSwitchError] = useState<string | null>(null);
  const tenantDropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  const showMembershipSwitcher = tenants.length > 1 && tenantScopeStatus === 'ready';
  const roleLabel = membershipRoleDisplay(selectedTenant);
  const tenantLabel = membershipTenantDisplay(selectedTenant);
  const companyLabel = membershipCompanyDisplay(selectedTenant);
  const kindLabel =
    (selectedTenant.tenant_kind_label ?? '').trim() || MEMBERSHIP_LABEL_FALLBACK;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tenantDropdownRef.current && !tenantDropdownRef.current.contains(event.target as Node)) {
        setIsTenantDropdownOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const memberTenants = tenants.filter((t) => !t.isMaster);

  const handleMembershipSelect = async (tenant: (typeof tenants)[number]) => {
    if (tenant.tenantId === selectedTenant.tenantId || membershipSwitching) {
      setIsTenantDropdownOpen(false);
      return;
    }
    setSwitchError(null);
    try {
      await selectMembership(tenant.tenantId);
      const stripped = stripTenantPrefixFromPathname(location.pathname);
      if (stripped === '/command-center' || stripped.startsWith('/command-center/')) {
        navigate(
          withTenantQueryParam(`${stripped}${location.search}`, tenant.tenantId) + location.hash,
        );
      } else {
        const pathParts = location.pathname.split('/');
        if (pathParts.length > 1) {
          pathParts[1] = tenant.tenantId;
          navigate(pathParts.join('/') + location.search + location.hash);
        } else {
          navigate(`/${tenant.tenantId}/cockpit`);
        }
      }
      setSelectedTenant(tenant);
      setIsTenantDropdownOpen(false);
    } catch (error) {
      setSwitchError(error instanceof Error ? error.message : 'Không thể chuyển membership');
    }
  };

  return (
    <>
      {tenantScopeStatus === 'error' && tenantScopeError ? (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm text-amber-900 xevn-safe-inline">
          {tenantScopeError}
        </div>
      ) : null}
      {switchError ? (
        <div className="border-b border-red-200 bg-red-50 px-4 py-2 text-center text-sm text-red-800 xevn-safe-inline">
          {switchError}
        </div>
      ) : null}
      <header className="sticky top-0 z-40 flex h-14 w-full shrink-0 items-center justify-between border-b border-xevn-border bg-xevn-surface/80 xevn-safe-inline shadow-soft backdrop-blur-md">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            to={withTenantQueryParam('/command-center', selectedTenant.tenantId)}
            className="flex h-10 shrink-0 items-center gap-2.5 rounded-input pr-1 transition hover:opacity-90"
            data-testid="portal-brand-mark"
            aria-label="XeVN — về Command Center"
          >
            <img
              src="/xevn-logo.png"
              alt=""
              className="h-10 w-10 object-contain"
              width={40}
              height={40}
            />
            <span className="hidden text-xl font-semibold tracking-tight text-xevn-text sm:inline">
              XeVN
            </span>
          </Link>

          <div className="hidden h-6 w-px shrink-0 bg-xevn-border sm:block" aria-hidden />

          {showMembershipSwitcher ? (
            <div className="relative min-w-0" ref={tenantDropdownRef}>
              <button
                type="button"
                disabled={membershipSwitching}
                onClick={() => setIsTenantDropdownOpen(!isTenantDropdownOpen)}
                className="flex min-w-0 max-w-[min(280px,42vw)] items-center gap-2.5 rounded-input border border-xevn-border bg-xevn-background px-3 py-1.5 transition hover:bg-xevn-surface disabled:opacity-70"
                data-testid="portal-membership-switcher"
              >
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-semibold text-white"
                  style={{ backgroundColor: selectedTenant.color }}
                >
                  {(selectedTenant.shortName || tenantLabel).charAt(0) || 'X'}
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <p className="text-xs font-medium text-xevn-textSecondary">Membership đang làm việc</p>
                  <p className="truncate text-sm font-semibold text-xevn-text">{tenantLabel}</p>
                  <p className="truncate text-xs text-xevn-textSecondary">
                    {companyLabel} · {roleLabel}
                  </p>
                </div>
                {membershipSwitching ? (
                  <Loader2 size={18} className="shrink-0 animate-spin text-xevn-textMuted" />
                ) : (
                  <ChevronDown
                    size={18}
                    className={`shrink-0 text-xevn-textMuted transition-transform duration-200 ${isTenantDropdownOpen ? 'rotate-180' : ''}`}
                  />
                )}
              </button>

              {isTenantDropdownOpen && (
                <div className="absolute left-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-card border border-xevn-border bg-xevn-surface shadow-soft">
                  <div className="max-h-72 overflow-y-auto p-2">
                    <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-xevn-textSecondary">
                      Tenant được gán (membership)
                    </p>
                    {tenants.map((tenant) => (
                      <button
                        key={tenant.tenantId}
                        type="button"
                        disabled={membershipSwitching}
                        onClick={() => void handleMembershipSelect(tenant)}
                        className={`flex w-full items-center gap-3 rounded-input p-3 transition-all duration-150 ${
                          selectedTenant.tenantId === tenant.tenantId
                            ? 'border border-xevn-accent/20 bg-xevn-accent/10'
                            : 'hover:bg-xevn-background'
                        }`}
                      >
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-lg font-semibold text-white"
                          style={{ backgroundColor: tenant.color }}
                        >
                          <Building2 size={18} />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-semibold text-xevn-text">
                            {membershipTenantDisplay(tenant)}
                          </p>
                          <p className="text-xs text-xevn-textSecondary">
                            {membershipCompanyDisplay(tenant)} ·{' '}
                            {(tenant.tenant_kind_label ?? '').trim() || MEMBERSHIP_LABEL_FALLBACK} ·{' '}
                            {membershipRoleDisplay(tenant)}
                          </p>
                        </div>
                        {selectedTenant.tenantId === tenant.tenantId && (
                          <Check size={18} className="text-xevn-accent" />
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-xevn-border bg-xevn-background p-3">
                    <p className="text-center text-xs text-xevn-textSecondary">
                      <span className="font-semibold text-xevn-primary">{memberTenants.length}</span> tenant
                      thành viên · <span className="font-semibold text-xevn-text">{tenants.length}</span>{' '}
                      tổng membership
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div
              className="flex min-w-0 max-w-[min(240px,40vw)] items-center gap-2.5 rounded-input border border-xevn-border bg-xevn-background px-3 py-1.5"
              data-testid="portal-membership-static"
            >
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-semibold text-white"
                style={{ backgroundColor: selectedTenant.color }}
              >
                {(selectedTenant.shortName || tenantLabel).charAt(0) || 'X'}
              </div>
              <div className="min-w-0 flex-1 text-left">
                <p className="text-xs font-medium text-xevn-textSecondary">Phạm vi làm việc</p>
                <p className="truncate text-sm font-semibold text-xevn-text">{tenantLabel}</p>
                <p className="truncate text-xs text-xevn-textSecondary">
                  {companyLabel} · {kindLabel} · {roleLabel}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex h-10 items-center gap-3">
          <div className="relative hidden md:block">
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xevn-textMuted"
            />
            <input
              type="text"
              placeholder="Tìm kiếm nhanh..."
              className="h-10 w-64 rounded-input border border-xevn-border bg-xevn-background py-2 pl-10 pr-4 text-sm text-xevn-text placeholder:text-xevn-textMuted transition-all focus:border-xevn-accent focus:outline-none focus:ring-2 focus:ring-xevn-accent/20"
            />
          </div>
          <button
            type="button"
            className="relative rounded-input p-2 text-xevn-textSecondary transition-colors hover:bg-xevn-background hover:text-xevn-text"
            aria-label="Thông báo"
          >
            <Bell size={20} />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-xevn-danger" />
          </button>
          <div className="relative" ref={profileDropdownRef}>
            <button
              type="button"
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex h-10 items-center gap-2 rounded-input p-1.5 transition-colors hover:bg-xevn-background"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-xevn-primary text-sm font-semibold text-white">
                {(user?.displayName?.[0] ?? 'A').toUpperCase()}
              </div>
              <div className="hidden text-left md:block">
                <p className="text-sm font-semibold text-xevn-text">{user?.displayName ?? 'Admin'}</p>
                <p className="text-xs text-xevn-textSecondary">{roleLabel}</p>
              </div>
              <ChevronDown size={16} className="text-xevn-textMuted" />
            </button>
            {isProfileDropdownOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-card border border-xevn-border bg-xevn-surface shadow-soft">
                <div className="border-b border-xevn-border p-4">
                  <p className="font-semibold text-xevn-text">{user?.displayName ?? 'Admin User'}</p>
                  <p className="text-sm text-xevn-textSecondary">{roleLabel}</p>
                </div>
                <div className="p-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      navigate('/login');
                    }}
                    className="flex w-full items-center gap-3 rounded-input p-2.5 text-sm text-xevn-textSecondary hover:bg-xevn-background hover:text-xevn-text"
                  >
                    <User size={16} />
                    Hồ sơ cá nhân
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 rounded-input p-2.5 text-sm text-xevn-textSecondary hover:bg-xevn-background hover:text-xevn-text"
                  >
                    <Settings size={16} />
                    Cài đặt tài khoản
                  </button>
                </div>
                <div className="border-t border-xevn-border p-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      logout();
                      navigate('/login');
                    }}
                    className="flex w-full items-center gap-3 rounded-input p-2.5 text-sm text-xevn-danger hover:bg-red-50"
                  >
                    <LogOut size={16} />
                    Đăng xuất
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default TopHeader;
