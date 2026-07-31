import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Activity,
  Bell,
} from 'lucide-react';
import { Container } from '@xevn/ui';
import { mockModuleCards, type AlertItem } from '../../data/mockExecutiveDashboardData';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* ROW 1: Header */}
      <header className="border-b border-slate-200/80 bg-white/80 shadow-soft backdrop-blur-md">
        <Container size="xl">
          <div className="xevn-safe-inline py-6">
            <div className="flex items-center justify-between">
              {/* Logo & Title Section */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-lg">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-900">BẢNG ĐIỀU HÀNH TẬP ĐOÀN XeVN</h1>
                  <p className="text-sm font-medium text-blue-600 bg-blue-100/50 px-2 py-1 rounded-md inline-block mt-1">
                    XeVN OS - Executive Cockpit
                    {rollupCount !== null ? ` · Rollup QT: ${rollupCount}` : ''}
                    {kpiLoading ? '' : ` · KPI: ${kpiRows.length}`}
                    {pendingTasks !== null ? ` · WF pending: ${pendingTasks}` : ''}
                  </p>
                </div>
              </div>

              {/* Global Filter & Actions */}
              <div className="flex items-center gap-4">
                <Link
                  to="/"
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  Unified Shell
                </Link>
                <Link
                  to="/command-center"
                  className="rounded-xl border border-blue-200/70 bg-white px-4 py-2.5 text-sm font-semibold text-blue-800 shadow-sm transition hover:bg-blue-50"
                >
                  Command Center
                </Link>
                <Link
                  to="/dashboard/organization"
                  className="rounded-xl border border-emerald-200/80 bg-emerald-50/80 px-4 py-2.5 text-sm font-semibold text-emerald-900 shadow-sm transition hover:bg-emerald-100/80"
                >
                  Workspace Portal
                </Link>
                {/* Global Filter */}
                <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200/50 shadow-sm">
                  <span className="text-sm font-semibold text-blue-800">Toàn Tập đoàn</span>
                  <ChevronDown className="w-4 h-4 text-blue-600" />
                </div>

                {/* Notification Icon */}
                <div className="relative">
                  <div className="w-10 h-10 bg-blue-100/50 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-200/50 transition-colors">
                    <Bell className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-bold">3</span>
                  </div>
                </div>

                {/* Admin Profile */}
                <div className="flex items-center gap-3 px-4 py-2.5 bg-white rounded-xl border border-slate-200 shadow-sm">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">AD</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Admin</p>
                    <p className="text-xs text-slate-500">Super Admin</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-xevn-textMuted" />
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
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-700"></div>
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
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">KPI rollup</p>
                <p className="mt-2 text-3xl font-black text-slate-900">
                  {executiveKpiRail.headlinePercent != null
                    ? `${executiveKpiRail.headlinePercent}%`
                    : '—'}
                </p>
                <p className="mt-1 text-sm text-slate-500">Nguồn: {executiveKpiRail.source}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Chỉ số KPI</p>
                <p className="mt-2 text-3xl font-black text-slate-900">{kpiRows.length}</p>
                <p className="mt-1 text-sm text-slate-500">business-master + kpi-engine</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tuân thủ KPI</p>
                <p className="mt-2 text-3xl font-black text-purple-700">
                  {kpiCompliancePercent != null ? `${kpiCompliancePercent}%` : '—'}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">WF / báo cáo</p>
                <p className="mt-2 text-3xl font-black text-slate-900">{rollupCount ?? '—'}</p>
                <p className="mt-1 text-sm text-slate-500">instances + routes</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Việc chờ</p>
                <p className="mt-2 text-3xl font-black text-slate-900">{pendingTasks ?? '—'}</p>
                <p className="mt-1 text-sm text-slate-500">workflow-engine tasks</p>
              </div>
            </div>
          )}
        </section>

        {/* ROW 3: Module Cards */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6 px-2">
            <h2 className="text-xl font-black text-slate-800">Cổng Phân hệ Nghiệp vụ</h2>
            <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
              10 modules đang hoạt động
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {mockModuleCards.map((card) => (
              <ModuleCard key={card.id} card={card} />
            ))}
          </div>
        </section>

        {/* ROW 4: Hot Alerts */}
        <section className="mb-8">
          <AlertTicker alerts={cockpitAlerts} />
          {alertsFromApi && cockpitAlerts.length === 0 ? (
            <p className="mt-2 text-center text-sm text-slate-500">
              Không có cảnh báo từ workflow/catalog — chạy seed inbox nếu cần dữ liệu mẫu.
            </p>
          ) : null}
        </section>
      </main>
    </div>
  );
};

// ModuleCard Component
const ModuleCard: React.FC<{ card: typeof mockModuleCards[0] }> = ({ card }) => {
  const navigate = useNavigate();

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
        <p className="mb-4 truncate text-sm text-xevn-textSecondary">{card.subtitle}</p>

        {/* KPIs */}
        <div className="space-y-3 mb-6">
          {card.stats.map((kpi, idx) => (
            <div key={idx} className="flex items-center justify-between text-sm">
              <span className="truncate text-xevn-textSecondary">{kpi.label}</span>
              <span className="font-bold text-white">{kpi.value}</span>
            </div>
          ))}
        </div>

        {/* Access Button — BTN-A5-EXEC-MODULE-ACCESS */}
        <CapabilityActionButton
          capabilityCode="BTN-A5-EXEC-MODULE-ACCESS"
          className="w-full rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 py-3 px-6 text-sm font-bold shadow-lg transition-all duration-300 hover:scale-105 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50"
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
    <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-slate-200/50 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
          <AlertTriangle className="w-6 h-6 text-red-600" />
        </div>
        <h3 className="text-xl font-black text-red-800">CẢNH BÁO NÓNG</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {alerts.map((alert) => (
          <div key={alert.id} className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${alert.priority === 'high' ? 'bg-red-500' : alert.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'}`} />
            <div className="flex-1">
              <p className="text-sm text-slate-800 break-words">{alert.message}</p>
              <p className="text-xs text-slate-500 mt-1">{alert.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExecutiveDashboardPage;