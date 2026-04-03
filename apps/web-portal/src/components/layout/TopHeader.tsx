import React, { useState, useRef, useEffect } from 'react';
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

const TopHeader: React.FC = () => {
  const { selectedCompany, setSelectedCompany, companies } = useGlobalFilter();
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const companyDropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        companyDropdownRef.current &&
        !companyDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCompanyDropdownOpen(false);
      }
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCompanySelect = (company: typeof selectedCompany) => {
    setSelectedCompany(company);
    setIsCompanyDropdownOpen(false);
  };

  return (
    <header className="fixed top-0 left-64 right-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white xevn-safe-inline shadow-soft backdrop-blur-md">
      {/* Left Section - Global Company Filter */}
      <div className="flex items-center gap-4">
        <div className="relative" ref={companyDropdownRef}>
          <button
            onClick={() => setIsCompanyDropdownOpen(!isCompanyDropdownOpen)}
            className="flex items-center gap-3 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all duration-200 min-w-[280px]"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-semibold text-sm"
              style={{ backgroundColor: selectedCompany.color }}
            >
              {selectedCompany.shortName.charAt(0)}
            </div>
            <div className="flex-1 text-left">
              <p className="text-xs text-slate-500 font-medium">
                Đang xem dữ liệu của
              </p>
              <p className="text-sm font-semibold text-slate-800 truncate">
                {selectedCompany.shortName}
              </p>
            </div>
            <ChevronDown
              size={18}
              className={`text-slate-400 transition-transform duration-200 ${
                isCompanyDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Company Dropdown */}
          {isCompanyDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50">
              <div className="p-3 border-b border-slate-100">
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    placeholder="Tìm kiếm công ty..."
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-xevn-accent/20 focus:border-xevn-accent"
                  />
                </div>
              </div>

              <div className="max-h-72 overflow-y-auto">
                <div className="p-2">
                  <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Chọn công ty thành viên
                  </p>
                  {companies.map((company) => (
                    <button
                      key={company.id}
                      onClick={() => handleCompanySelect(company)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-150 ${
                        selectedCompany.id === company.id
                          ? 'bg-xevn-accent/10 border border-xevn-accent/20'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold"
                        style={{ backgroundColor: company.color }}
                      >
                        <Building2 size={18} />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-semibold text-slate-800">
                          {company.shortName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {company.industry} • {company.employeeCount} nhân sự
                        </p>
                      </div>
                      {selectedCompany.id === company.id && (
                        <Check size={18} className="text-xevn-accent" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-slate-50 border-t border-slate-100">
                <p className="text-xs text-slate-500 text-center">
                  <span className="font-semibold text-xevn-accent">
                    {companies.length - 1}
                  </span>{' '}
                  công ty thành viên
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Current Filter Badge */}
        {selectedCompany.id !== 'all' && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: selectedCompany.color }}
            ></div>
            <span className="text-xs font-medium text-amber-700">
              Đang lọc theo: {selectedCompany.shortName}
            </span>
            <button
              onClick={() => handleCompanySelect(companies[0])}
              className="ml-1 text-amber-500 hover:text-amber-700"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Right Section - Search, Notifications, Profile */}
      <div className="flex items-center gap-4">
        {/* Global Search */}
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Tìm kiếm nhanh..."
            className="w-64 pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-xevn-accent/20 focus:border-xevn-accent transition-all"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 bg-slate-200 rounded">
            ⌘K
          </kbd>
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User Profile */}
        <div className="relative" ref={profileDropdownRef}>
          <button
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            className="flex items-center gap-2 p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-xevn-accent to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
              AD
            </div>
            <div className="text-left hidden md:block">
              <p className="text-sm font-semibold text-slate-800">Admin</p>
              <p className="text-xs text-slate-500">Super Admin</p>
            </div>
            <ChevronDown size={16} className="text-slate-400" />
          </button>

          {/* Profile Dropdown */}
          {isProfileDropdownOpen && (
            <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50">
              <div className="p-4 border-b border-slate-100">
                <p className="font-semibold text-slate-800">Admin User</p>
                <p className="text-sm text-slate-500">admin@xevn.vn</p>
              </div>
              <div className="p-2">
                <button className="w-full flex items-center gap-3 p-2.5 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                  <User size={16} />
                  Hồ sơ cá nhân
                </button>
                <button className="w-full flex items-center gap-3 p-2.5 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                  <Settings size={16} />
                  Cài đặt tài khoản
                </button>
              </div>
              <div className="p-2 border-t border-slate-100">
                <button className="w-full flex items-center gap-3 p-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <LogOut size={16} />
                  Đăng xuất
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopHeader;
