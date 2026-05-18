import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  ChevronDown,
  Search,
  Building2,
  Check,
  User,
  Settings,
  LogOut,
} from 'lucide-react';
import { useGlobalFilter } from '../../contexts/GlobalFilterContext';
import { useAuth } from '../../contexts/AuthContext';

const TopHeader: React.FC = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { selectedTenant, setSelectedTenant, tenants, tenantScopeError, tenantScopeStatus } =
    useGlobalFilter();
  const [isTenantDropdownOpen, setIsTenantDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const tenantDropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

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

  return (
    <>
    {tenantScopeStatus === 'error' && tenantScopeError ? (
      <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm text-amber-900 xevn-safe-inline">
        {tenantScopeError}
      </div>
    ) : null}
    <header className="z-40 flex h-16 w-full shrink-0 items-center justify-between border-b border-slate-200 bg-white xevn-safe-inline shadow-soft backdrop-blur-md">
      <div className="flex items-center gap-4">
        <div className="relative" ref={tenantDropdownRef}>
          <button
            type="button"
            onClick={() => setIsTenantDropdownOpen(!isTenantDropdownOpen)}
            className="flex min-w-[280px] items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 transition-all duration-200 hover:bg-slate-100"
          >
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-semibold text-white"
              style={{ backgroundColor: selectedTenant.color }}
            >
              {selectedTenant.shortName.charAt(0)}
            </div>
            <div className="flex-1 text-left">
              <p className="text-xs font-medium text-slate-500">Tenant đang làm việc</p>
              <p className="truncate text-sm font-semibold text-slate-800">{selectedTenant.shortName}</p>
              <p className="truncate text-[10px] text-slate-400">{selectedTenant.roleCode}</p>
            </div>
            <ChevronDown
              size={18}
              className={`text-slate-400 transition-transform duration-200 ${isTenantDropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {isTenantDropdownOpen && (
            <div className="absolute left-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
              <div className="max-h-72 overflow-y-auto p-2">
                <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Tenant được gán (membership)
                </p>
                {tenants.map((tenant) => (
                  <button
                    key={tenant.tenantId}
                    type="button"
                    onClick={() => {
                      setSelectedTenant(tenant);
                      setIsTenantDropdownOpen(false);
                    }}
                    className={`flex w-full items-center gap-3 rounded-lg p-3 transition-all duration-150 ${
                      selectedTenant.tenantId === tenant.tenantId
                        ? 'border border-xevn-accent/20 bg-xevn-accent/10'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg font-semibold text-white"
                      style={{ backgroundColor: tenant.color }}
                    >
                      <Building2 size={18} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-semibold text-slate-800">{tenant.shortName}</p>
                      <p className="text-xs text-slate-500">
                        {tenant.isMaster ? 'Master · X-BOS Group' : 'Thành viên'} · {tenant.roleCode}
                      </p>
                    </div>
                    {selectedTenant.tenantId === tenant.tenantId && (
                      <Check size={18} className="text-xevn-accent" />
                    )}
                  </button>
                ))}
              </div>
              <div className="border-t border-slate-100 bg-slate-50 p-3">
                <p className="text-center text-xs text-slate-500">
                  <span className="font-semibold text-xevn-accent">{memberTenants.length}</span> tenant thành
                  viên · <span className="font-semibold">{tenants.length}</span> tổng membership
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm nhanh..."
            className="w-64 rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm transition-all focus:border-xevn-accent focus:outline-none focus:ring-2 focus:ring-xevn-accent/20"
          />
        </div>
        <button type="button" className="relative rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700">
          <Bell size={20} />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
        </button>
        <div className="relative" ref={profileDropdownRef}>
          <button
            type="button"
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-slate-100"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-xevn-accent to-purple-500 text-sm font-semibold text-white">
              {(user?.displayName?.[0] ?? 'A').toUpperCase()}
            </div>
            <div className="hidden text-left md:block">
              <p className="text-sm font-semibold text-slate-800">{user?.displayName ?? 'Admin'}</p>
              <p className="text-xs text-slate-500">{selectedTenant.roleCode}</p>
            </div>
            <ChevronDown size={16} className="text-slate-400" />
          </button>
          {isProfileDropdownOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
              <div className="border-b border-slate-100 p-4">
                <p className="font-semibold text-slate-800">{user?.displayName ?? 'Admin User'}</p>
                <p className="text-sm text-slate-500">{selectedTenant.roleCode}</p>
              </div>
              <div className="p-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileDropdownOpen(false);
                    navigate('/login');
                  }}
                  className="flex w-full items-center gap-3 rounded-lg p-2.5 text-sm text-slate-600 hover:bg-slate-50"
                >
                  <User size={16} />
                  Hồ sơ cá nhân
                </button>
                <button type="button" className="flex w-full items-center gap-3 rounded-lg p-2.5 text-sm text-slate-600 hover:bg-slate-50">
                  <Settings size={16} />
                  Cài đặt tài khoản
                </button>
              </div>
              <div className="border-t border-slate-100 p-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileDropdownOpen(false);
                    logout();
                    navigate('/login');
                  }}
                  className="flex w-full items-center gap-3 rounded-lg p-2.5 text-sm text-red-600 hover:bg-red-50"
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
