/**
 * @CODE-MEMORY
 * Screen:     /cockpit — ExecutiveDashboardPage (PORT-10)
 * UC:         Portal executive cockpit · KPI rollup
 * BR:         Dual-surface light ops · ApiLoadBanner honesty
 * SRS:        N/A theme remaster (no FR rewrite)
 * TechSpec:   docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md §8–§10
 * Purpose:    Bảng điều hành tập đoàn — KPI/modules/alerts; token-align Precision Motion.
 * WorkItem:   PO-HRM-UI-BRAND-W3-PORT-B
 * Coded:      2026-08-05
 * Callers:    portal router /cockpit
 * Callees:    useKpiDashboardSnapshot · ApiLoadBanner · CapabilityActionButton
 * must_keep:  ApiLoadBanner honesty; capability BTN-A5; no Nest/seed invent
 * SOLID:      Page compose + ModuleCard/AlertTicker presentational
 * LastVerified: docs/qa/evidence/po-hrm-ui-brand-w3-port-b.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-W3-PORT-B
 * change_mode: UPGRADE
 * What: Token-align cockpit chrome — slate/purple → xevn primary/text*; keep honesty banners
 * Why: Inventory PORT-10 P2 capacity wave; ADR §8 pale ban + ban purple AI
 * must_keep: ApiLoadBanner; KPI rails; CapabilityActionButton; demo layout flag
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Truck,
  Warehouse,
  FileText,
  Calculator,
  Users,
  HeartHandshake,
  Wrench,
  TrendingUp,
  ChevronDown,
  Package,
  Zap,
  AlertTriangle,
  Bell,
  User,
  Settings,
  LogOut,
  MapPin,
  Activity,
} from 'lucide-react';
import { Container } from '@xevn/ui';
import { mockModuleCards, type AlertItem, type ModuleCardData } from '../../data/mockExecutiveDashboardData';
import { getPortalMockExecutiveDashboardStats } from '../../data/portal-dev-seed';
import { PORTAL_UNLOCK_STORAGE_KEY } from '../../constants/portal-flow';
import { listWorkflowInstances, listReportingRoutes, listWorkflowTasks } from '../../integrations/workflowEngineApi';
import { fetchPortalAlerts } from '../../integrations/portalAlertsApi';
import {
  isExecutiveDashboardDemoLayoutEnabled,
  resolveExecutiveDashboardAlertsOnEmpty,
} from '../../utils/portalStrictMode';
import { useTenantScope } from '../../contexts/GlobalFilterContext';
import { useKpiDashboardSnapshot } from '../../hooks/useKpiDashboardSnapshot';
import { useCommandCenterKpiRail } from '../../hooks/useCommandCenterKpiRail';
import { ApiLoadBanner } from '../../components/common/ApiLoadBanner';
import { CapabilityActionButton } from '../../components/command-center/CapabilityActionButton';
import { resolveExecModuleAccessRoute } from '../../integrations/capabilityActionRegistry';
import {
  collectMembershipModuleIds,
  resolveExecModuleCards,
} from '../../integrations/execModuleCatalog';
import { useAuth } from '../../contexts/AuthContext';
import { useGlobalFilter } from '../../contexts/GlobalFilterContext';
import {
  membershipTenantDisplay,
  membershipCompanyDisplay,
  membershipRoleDisplay,
} from '../../integrations/authSession';
import { useTenantNavigate } from '../../hooks/useTenantNavigate';
import { useNavigate } from 'react-router-dom';

// Sparkline component
const Sparkline: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const range = maxValue - minValue;

  return (
    <div className="h-8 w-16">
      <svg viewBox="0 0 64 32" className="w-full h-full">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          points={data.map((value, i) => {
            const x = (i / (data.length - 1)) * 64;
            const y = 32 - ((value - minValue) / range) * 32;
            return `${x},${y}`;
          }).join(' ')}
        />
      </svg>
    </div>
  );
};

const ExecutiveDashboardPage: React.FC = () => {
  const { tenantId, companyId } = useTenantScope();
  const { selectedTenant, tenants, setSelectedTenant } = useGlobalFilter();
  const { memberships, selectMembership, membershipSwitching, user, logout } = useAuth();
  const tenantNavigate = useTenantNavigate();
  const rawNavigate = useNavigate();
  const [isTenantDropdownOpen, setIsTenantDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const tenantDropdownRef = React.useRef<HTMLDivElement>(null);
  const profileDropdownRef = React.useRef<HTMLDivElement>(null);

  const [rollupCount, setRollupCount] = useState<number | null>(null);
  const [pendingTasks, setPendingTasks] = useState<number | null>(null);
  const [cockpitAlerts, setCockpitAlerts] = useState<AlertItem[]>([]);
  const [alertsFromApi, setAlertsFromApi] = useState(false);
  const {
    rows: kpiRows,
    loadFailed: kpiLoadFailed,
    usingMockFallback: kpiMockFallback,
    isLoading: kpiLoading,
  } = useKpiDashboardSnapshot(tenantId, companyId, 'all');
  const executiveKpiRail = useCommandCenterKpiRail('bod', tenantId, companyId);
  const showDemoCockpitLayout = isExecutiveDashboardDemoLayoutEnabled();
  const demoStats = getPortalMockExecutiveDashboardStats();
  const moduleCards = useMemo(() => {
    const fromRegistry = resolveExecModuleCards(collectMembershipModuleIds(memberships));
    if (fromRegistry.length) return fromRegistry;
    if (showDemoCockpitLayout) return mockModuleCards;
    return [];
  }, [memberships, showDemoCockpitLayout]);

  const kpiCompliancePercent = useMemo(() => {
    if (!kpiRows.length) return null;
    const avg =
      kpiRows.reduce((acc, k) => acc + (k.currentValue / (k.targetValue || 1)) * 100, 0) / kpiRows.length;
    return Math.round(Math.min(avg, 100));
  }, [kpiRows]);

  useEffect(() => {
    sessionStorage.setItem(PORTAL_UNLOCK_STORAGE_KEY, '1');
    void Promise.all([
      listWorkflowInstances(tenantId, companyId, 'completed'),
      listReportingRoutes(tenantId, companyId),
      listWorkflowTasks(tenantId, 'pending'),
      fetchPortalAlerts(tenantId, undefined, companyId),
    ])
      .then(([instances, routes, tasks, alerts]) => {
        setRollupCount(instances.length + routes.length);
        setPendingTasks(tasks.length);
        if (alerts.length) {
          setCockpitAlerts(
            alerts.map((a) => ({
              id: a.id,
              message: a.detail ? `${a.title} — ${a.detail}` : a.title,
              priority: a.level === 'critical' ? 'high' : a.level === 'warn' ? 'medium' : 'low',
              time: a.sourceSystem ?? 'API',
            })),
          );
          setAlertsFromApi(true);
        } else {
          setCockpitAlerts(resolveExecutiveDashboardAlertsOnEmpty());
          setAlertsFromApi(true);
        }
      })
      .catch(() => {
        setRollupCount(null);
        setPendingTasks(null);
      });
  }, [tenantId, companyId]);

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

  const getTenantDefaultRoute = (tenant: (typeof tenants)[number]) => {
    if (tenant.modules && tenant.modules.length > 0) {
      // Prioritize business modules over 'core'
      const activeModule = tenant.modules.find(m => m !== 'core') || tenant.modules[0];
      return resolveExecModuleAccessRoute(activeModule);
    }
    return '/dashboard/organization';
  };

  const handleMembershipSelect = async (tenant: (typeof tenants)[number]) => {
    const route = getTenantDefaultRoute(tenant);
    // Strip leading slash to make it relative to the domain root, and prepend tenantId
    const absoluteRoute = `/${tenant.tenantId}${route.startsWith('/') ? route : `/${route}`}`;

    if (tenant.tenantId === selectedTenant.tenantId || membershipSwitching) {
      setIsTenantDropdownOpen(false);
      rawNavigate(absoluteRoute);
      return;
    }
    try {
      await selectMembership(tenant.tenantId);
      rawNavigate(absoluteRoute);
      setSelectedTenant(tenant);
      setIsTenantDropdownOpen(false);
    } catch (error) {
      // Ignored for now
    }
  };

  const tenantLabel = membershipTenantDisplay(selectedTenant);

  return (
    <div className="min-h-screen bg-xevn-background">
      {/* ROW 1: Header */}
      <header className="border-b border-xevn-border bg-xevn-surface/80 shadow-soft backdrop-blur-md">
        <Container size="xl">
          <div className="xevn-safe-inline py-6">
            <div className="flex items-center justify-between">
              {/* Logo & Title Section */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-xevn-primary rounded-card flex items-center justify-center shadow-soft">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-xevn-text">BẢNG ĐIỀU HÀNH TẬP ĐOÀN XeVN</h1>
                  <p className="mt-1 inline-block rounded-input bg-xevn-primary/10 px-2 py-1 text-sm font-medium text-xevn-primary">
                    XeVN OS - Executive Cockpit
                    {rollupCount !== null ? ` · Rollup QT: ${rollupCount}` : ''}
                    {kpiLoading ? '' : ` · KPI: ${kpiRows.length}`}
                    {pendingTasks !== null ? ` · WF pending: ${pendingTasks}` : ''}
                  </p>
                </div>
              </div>

              {/* Global Filter & Actions */}
              <div className="flex items-center gap-4">

                {/* Global Filter */}
                <div className="relative min-w-0" ref={tenantDropdownRef}>
                  <button
                    type="button"
                    disabled={membershipSwitching}
                    onClick={() => setIsTenantDropdownOpen(!isTenantDropdownOpen)}
                    className="flex items-center gap-2 rounded-input border border-xevn-primary/20 bg-xevn-primary/5 px-4 py-2.5 shadow-sm transition hover:bg-xevn-primary/10"
                  >
                    <span className="text-sm font-semibold text-xevn-primary truncate max-w-[200px]">{tenantLabel}</span>
                    <ChevronDown className={`w-4 h-4 text-xevn-primary transition-transform duration-200 ${isTenantDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isTenantDropdownOpen && (
                    <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-card border border-xevn-border bg-white shadow-xl">
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
                                : 'hover:bg-slate-50'
                            }`}
                          >
                            <div
                              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg font-semibold text-white shadow-sm"
                              style={{ backgroundColor: tenant.color || '#3b82f6' }}
                            >
                              {(tenant.shortName || membershipTenantDisplay(tenant)).charAt(0) || 'X'}
                            </div>
                            <div className="min-w-0 flex-1 text-left">
                              <p className="truncate text-sm font-semibold text-xevn-text">
                                {membershipTenantDisplay(tenant)}
                              </p>
                              <p className="truncate text-xs text-xevn-textSecondary">
                                {membershipCompanyDisplay(tenant)} · {membershipRoleDisplay(tenant)}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Notification Icon */}
                <div className="relative">
                  <div className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-xevn-primary/10 transition-colors hover:bg-xevn-primary/20">
                    <Bell className="w-5 h-5 text-xevn-primary" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-bold">3</span>
                  </div>
                </div>

                {/* Admin Profile */}
                <div className="relative" ref={profileDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl border border-xevn-border shadow-sm transition hover:bg-slate-50"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-xevn-primary">
                      <span className="text-white text-sm font-bold">{(user?.displayName?.[0] ?? 'A').toUpperCase()}</span>
                    </div>
                    <div className="text-left hidden md:block">
                      <p className="text-sm font-semibold text-xevn-text">{user?.displayName ?? 'Admin'}</p>
                      <p className="text-xs text-xevn-textSecondary">{membershipRoleDisplay(selectedTenant)}</p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-xevn-textMuted" />
                  </button>
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-card border border-xevn-border bg-xevn-surface shadow-soft">
                      <div className="border-b border-xevn-border p-4">
                        <p className="font-semibold text-xevn-text">{user?.displayName ?? 'Admin User'}</p>
                        <p className="text-sm text-xevn-textSecondary">{membershipRoleDisplay(selectedTenant)}</p>
                      </div>
                      <div className="p-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsProfileDropdownOpen(false);
                            rawNavigate('/login');
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
                            rawNavigate('/login');
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
            </div>
          </div>
        </Container>
      </header>

      <main className="xevn-safe-inline py-6">
        <div className="mb-6 space-y-3">
          <ApiLoadBanner
            loadFailed={kpiLoadFailed}
            usingMockFallback={kpiMockFallback}
            title="KPI Cockpit"
            message={
              kpiLoadFailed && !kpiMockFallback
                ? 'Chưa tải được KPI từ business-master + kpi-engine/evaluate-batch.'
                : undefined
            }
          />
          <ApiLoadBanner
            loadFailed={!showDemoCockpitLayout}
            title="Executive cockpit layout"
            message="Chế độ strict: các thẻ doanh thu/vận hành demo bị ẩn. Dùng KPI rollup và business-master khi có dữ liệu."
          />
          <ApiLoadBanner
            loadFailed={executiveKpiRail.loadFailed && !executiveKpiRail.usingMockFallback}
            usingMockFallback={executiveKpiRail.usingMockFallback}
            title="KPI rollup (Command Center)"
          />
        </div>
        {/* ROW 2: Top Metrics */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {showDemoCockpitLayout && demoStats ? (
          <>
          {/* Tổng doanh thu */}
          <div className="relative overflow-hidden rounded-2xl shadow-xl transform hover:-translate-y-1 transition-transform duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-700"></div>
            <div className="relative bg-white/10 backdrop-blur-sm p-6 h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Calculator className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-bold bg-white/20 text-white">
                  <TrendingUp className="w-4 h-4" />
                  <span>{demoStats.revenueTrend}%</span>
                </div>
              </div>
              <p className="text-[10px] uppercase tracking-wide text-white/60 mb-1">Demo layout</p>
              <h3 className="text-sm font-semibold text-white/80 mb-2">Tổng doanh thu</h3>
              <p className="text-3xl font-black text-white mb-2">
                {(demoStats.totalRevenue / 1e12).toFixed(1)} <span className="text-lg">Tỷ VND</span>
              </p>
              <div className="mt-2">
                <Sparkline
                  data={
                    executiveKpiRail.series.length
                      ? executiveKpiRail.series.map((p) => p.value)
                      : [85, 90, 88, 92, 95, 93, 97]
                  }
                  color="#ffffff"
                />
              </div>
            </div>
          </div>

          {/* Lợi nhuận gộp */}
          <div className="relative overflow-hidden rounded-2xl shadow-xl transform hover:-translate-y-1 transition-transform duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-emerald-700"></div>
            <div className="relative bg-white/10 backdrop-blur-sm p-6 h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-bold bg-white/20 text-white">
                  <span>{demoStats.grossMargin}%</span>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-white/80 mb-2">Lợi nhuận gộp</h3>
              <p className="text-3xl font-black text-white mb-2">
                {(demoStats.grossProfit / 1e12).toFixed(1)} <span className="text-lg">Tỷ VND</span>
              </p>
              <div className="mt-2">
                <Sparkline data={[70, 75, 72, 78, 80, 82, 85]} color="#ffffff" />
              </div>
            </div>
          </div>

          {/* Xe khả dụng */}
          <div className="relative overflow-hidden rounded-2xl shadow-xl transform hover:-translate-y-1 transition-transform duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-700"></div>
            <div className="relative bg-white/10 backdrop-blur-sm p-6 h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-bold bg-white/20 text-white">
                  <span>{demoStats.fleetHealth}%</span>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-white/80 mb-2">Xe khả dụng</h3>
              <p className="text-3xl font-black text-white mb-2">
                {demoStats.availableVehicles} <span className="text-lg">chiếc</span>
              </p>
              <div className="w-full bg-white/20 rounded-full h-2 mt-4">
                <div className="bg-white h-2 rounded-full" style={{ width: `${demoStats.fleetHealth}%` }}></div>
              </div>
            </div>
          </div>

          {/* Tuân thủ quy trình */}
          <div className="relative overflow-hidden rounded-2xl shadow-xl transform hover:-translate-y-1 transition-transform duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-[#1E40AF] to-blue-800"></div>
            <div className="relative bg-white/10 backdrop-blur-sm p-6 h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-bold bg-white/20 text-white">
                  <span>{kpiCompliancePercent ?? demoStats.policyCompliance}%</span>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-white/80 mb-2">
                {kpiCompliancePercent != null ? 'Đạt KPI trung bình' : 'Tuân thủ quy trình'}
              </h3>
              <p className="text-3xl font-black text-white mb-2">
                {kpiCompliancePercent ?? demoStats.policyCompliance}{' '}
                <span className="text-lg">%</span>
              </p>
              <div className="w-full bg-white/20 rounded-full h-2 mt-4">
                <div
                  className="bg-white h-2 rounded-full"
                  style={{
                    width: `${kpiCompliancePercent ?? demoStats.policyCompliance}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Tổng nhân sự */}
          <div className="relative overflow-hidden rounded-2xl shadow-xl transform hover:-translate-y-1 transition-transform duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-teal-700"></div>
            <div className="relative bg-white/10 backdrop-blur-sm p-6 h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-bold bg-white/20 text-white">
                  <TrendingUp className="w-4 h-4" />
                  <span>{demoStats.employeeChange}%</span>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-white/80 mb-2">Tổng nhân sự</h3>
              <p className="text-3xl font-black text-white mb-2">
                {demoStats.totalEmployees} <span className="text-lg">người</span>
              </p>
              <div className="mt-2">
                <Sparkline data={[1200, 1210, 1220, 1215, 1230, 1240, 1250]} color="#ffffff" />
              </div>
            </div>
          </div>
          </>
          ) : (
            <div className="col-span-full grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
              <div className="rounded-2xl border border-xevn-border bg-white p-6 shadow-soft">
                <p className="text-xs font-semibold uppercase tracking-wide text-xevn-textSecondary">KPI rollup</p>
                <p className="mt-2 text-3xl font-black text-xevn-text">
                  {executiveKpiRail.headlinePercent != null
                    ? `${executiveKpiRail.headlinePercent}%`
                    : '—'}
                </p>
                <p className="mt-1 text-sm text-xevn-textSecondary">Nguồn: {executiveKpiRail.source}</p>
              </div>
              <div className="rounded-2xl border border-xevn-border bg-white p-6 shadow-soft">
                <p className="text-xs font-semibold uppercase tracking-wide text-xevn-textSecondary">Chỉ số KPI</p>
                <p className="mt-2 text-3xl font-black text-xevn-text">{kpiRows.length}</p>
                <p className="mt-1 text-sm text-xevn-textSecondary">business-master + kpi-engine</p>
              </div>
              <div className="rounded-2xl border border-xevn-border bg-white p-6 shadow-soft">
                <p className="text-xs font-semibold uppercase tracking-wide text-xevn-textSecondary">Tuân thủ KPI</p>
                <p className="mt-2 text-3xl font-black text-xevn-primary">
                  {kpiCompliancePercent != null ? `${kpiCompliancePercent}%` : '—'}
                </p>
              </div>
              <div className="rounded-2xl border border-xevn-border bg-white p-6 shadow-soft">
                <p className="text-xs font-semibold uppercase tracking-wide text-xevn-textSecondary">WF / báo cáo</p>
                <p className="mt-2 text-3xl font-black text-xevn-text">{rollupCount ?? '—'}</p>
                <p className="mt-1 text-sm text-xevn-textSecondary">instances + routes</p>
              </div>
              <div className="rounded-2xl border border-xevn-border bg-white p-6 shadow-soft">
                <p className="text-xs font-semibold uppercase tracking-wide text-xevn-textSecondary">Việc chờ</p>
                <p className="mt-2 text-3xl font-black text-xevn-text">{pendingTasks ?? '—'}</p>
                <p className="mt-1 text-sm text-xevn-textSecondary">workflow-engine tasks</p>
              </div>
            </div>
          )}
        </section>

        {/* ROW 3: Đơn vị thành viên */}
        {tenants.filter(t => !t.isMaster).length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-6 px-2">
              <h2 className="text-xl font-black text-xevn-text">Đơn vị thành viên</h2>
              <span className="text-sm font-medium text-xevn-textSecondary bg-xevn-background px-3 py-1.5 rounded-lg">
                {tenants.filter(t => !t.isMaster).length} đơn vị
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {tenants.filter(t => !t.isMaster).map(t => (
                <div 
                  key={t.tenantId} 
                  onClick={() => {
                    void handleMembershipSelect(t);
                  }}
                  className="group cursor-pointer rounded-2xl border border-xevn-border bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:border-xevn-primary/30 relative overflow-hidden"
                >
                  <div className={`absolute top-0 right-0 w-2 h-full ${selectedTenant.tenantId === t.tenantId ? 'bg-xevn-primary' : 'bg-transparent'}`} />
                  <div className="flex items-start gap-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shadow-sm"
                      style={{ backgroundColor: t.color || '#3b82f6' }}
                    >
                      {(t.shortName || membershipTenantDisplay(t)).charAt(0) || 'X'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-xevn-text truncate text-lg group-hover:text-xevn-primary transition-colors">{membershipTenantDisplay(t)}</h3>
                      <p className="text-sm text-xevn-textSecondary truncate">{membershipCompanyDisplay(t)}</p>
                      
                      <div className="mt-4 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                          <MapPin className="w-3 h-3" />
                          {membershipRoleDisplay(t)}
                        </span>
                        {selectedTenant.tenantId === t.tenantId && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                            Đang mở
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ROW 4: Module Cards */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6 px-2">
            <h2 className="text-xl font-black text-xevn-text">Cổng Phân hệ Nghiệp vụ</h2>
            <span className="text-sm font-medium text-xevn-textSecondary bg-xevn-background px-3 py-1.5 rounded-lg">
              {moduleCards.length} module{moduleCards.length === 1 ? '' : 's'} đang hoạt động
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {moduleCards.map((card) => (
              <ModuleCard key={card.id} card={card} />
            ))}
          </div>
          {!moduleCards.length && !showDemoCockpitLayout ? (
            <p className="mt-3 text-sm text-xevn-textSecondary">
              Chưa có module nào trong membership — kiểm tra `xbos_tenant_registry.modules`.
            </p>
          ) : null}
        </section>

        {/* ROW 4: Hot Alerts */}
        <section className="mb-8">
          <AlertTicker alerts={cockpitAlerts} />
          {alertsFromApi && cockpitAlerts.length === 0 ? (
            <p className="mt-2 text-center text-sm text-xevn-textSecondary">
              Không có cảnh báo từ workflow/catalog — chạy seed inbox nếu cần dữ liệu mẫu.
            </p>
          ) : null}
        </section>
      </main>
    </div>
  );
};

// ModuleCard Component
const ModuleCard: React.FC<{ card: ModuleCardData }> = ({ card }) => {
  const navigate = useTenantNavigate();

  const handleAccessClick = () => {
    navigate(resolveExecModuleAccessRoute(card.id));
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'x-bos': return <Building2 className="w-8 h-8 text-white" />;
      case 'trsport': return <Truck className="w-8 h-8 text-white" />;
      case 'lgs': return <Warehouse className="w-8 h-8 text-white" />;
      case 'express': return <Package className="w-8 h-8 text-white" />;
      case 'x-scm': return <Activity className="w-8 h-8 text-white" />;
      case 'x-office': return <FileText className="w-8 h-8 text-white" />;
      case 'x-finance': return <Calculator className="w-8 h-8 text-white" />;
      case 'hrm': return <Users className="w-8 h-8 text-white" />;
      case 'crm': return <HeartHandshake className="w-8 h-8 text-white" />;
      case 'x-maintenance': return <Wrench className="w-8 h-8 text-white" />;
      default: return <Zap className="w-8 h-8 text-white" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'danger': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="relative group cursor-pointer">
      <div
        className={`h-full rounded-2xl p-6 text-white overflow-hidden relative transform group-hover:scale-105 transition-transform duration-300`}
        style={{
          background: `linear-gradient(135deg, ${card.gradientStart || '#1e293b'} 0%, ${card.gradientEnd || '#0f172a'} 100%)`,
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
        }}
      >
        {/* Status Light */}
        <div className="absolute top-4 right-4">
          <div className="relative">
            <div className={`w-4 h-4 rounded-full ${getStatusColor(card.status)} animate-pulse`} />
            <div className={`absolute inset-0 w-4 h-4 rounded-full ${getStatusColor(card.status)} blur-md animate-ping opacity-75`} />
          </div>
        </div>

        {/* Icon */}
        <div className="mb-4 bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center">
          {getIconComponent(card.icon)}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold mb-2 truncate">{card.title}</h3>
        <p className="mb-4 truncate text-sm text-white/80">{card.subtitle}</p>

        {/* KPIs */}
        <div className="space-y-3 mb-6">
          {card.stats.map((kpi, idx) => (
            <div key={idx} className="flex items-center justify-between text-sm">
              <span className="truncate text-white/70">{kpi.label}</span>
              <span className="font-bold text-white">{kpi.value}</span>
            </div>
          ))}
        </div>

        {/* Access Button — BTN-A5-EXEC-MODULE-ACCESS */}
        <CapabilityActionButton
          capabilityCode="BTN-A5-EXEC-MODULE-ACCESS"
          className="w-full rounded-2xl bg-gradient-to-r from-xevn-primary to-blue-800 py-3 px-6 text-sm font-bold shadow-soft transition-all duration-300 hover:scale-[1.02] hover:from-blue-800 hover:to-xevn-primary disabled:opacity-50"
          onClick={handleAccessClick}
        >
          <span className="tracking-wide text-white">TRUY CẬP</span>
        </CapabilityActionButton>
      </div>
    </div>
  );
};

// AlertTicker Component
const AlertTicker: React.FC<{ alerts: any[] }> = ({ alerts }) => {
  return (
    <div className="rounded-card border border-xevn-border bg-xevn-surface/80 p-6 shadow-soft backdrop-blur-md">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
          <AlertTriangle className="w-6 h-6 text-red-600" />
        </div>
        <h3 className="text-xl font-black text-red-800">CẢNH BÁO NÓNG</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {alerts.map((alert) => (
          <div key={alert.id} className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-xevn-border shadow-sm">
            <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${alert.priority === 'high' ? 'bg-red-500' : alert.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'}`} />
            <div className="flex-1">
              <p className="text-sm text-xevn-text break-words">{alert.message}</p>
              <p className="text-xs text-xevn-textSecondary mt-1">{alert.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExecutiveDashboardPage;