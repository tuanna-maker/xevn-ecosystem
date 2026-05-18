import React, { useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
} from 'lucide-react';
import { PageHeader, InfoCard, Badge } from '../../components/common';
import { useGlobalFilter, useTenantScope } from '../../contexts/GlobalFilterContext';
import { useCompanyFilterOptions } from '../../hooks/useCompanyFilterOptions';
import { useKpiDashboardSnapshot } from '../../hooks/useKpiDashboardSnapshot';
import { ApiLoadBanner } from '../../components/common/ApiLoadBanner';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts';

const KPIDashboardPage: React.FC = () => {
  const { selectedCompany } = useGlobalFilter();
  const { tenantId, companyId } = useTenantScope();
  const scopeCompanyId = selectedCompany.id;
  const { companies } = useCompanyFilterOptions();

  const { rows: filteredKPIData, loadFailed, usingMockFallback, sourceNote, isLoading } =
    useKpiDashboardSnapshot(tenantId, companyId, scopeCompanyId);

  const kpiHealth = useMemo(() => {
    const good = filteredKPIData.filter((kpi) => kpi.status === 'good').length;
    const warning = filteredKPIData.filter((kpi) => kpi.status === 'warning').length;
    const critical = filteredKPIData.filter((kpi) => kpi.status === 'critical').length;
    return { good, warning, critical, total: filteredKPIData.length };
  }, [filteredKPIData]);

  const comparisonData = useMemo(() => {
    if (scopeCompanyId !== 'all') return [];
    const memberCompanies = companies.filter((c) => c.id !== 'all');
    return memberCompanies.map((company) => {
      const companyKPIs = filteredKPIData.filter((kpi) => kpi.companyId === company.id);
      if (!companyKPIs.length) {
        return {
          name: company.shortName,
          performance: 0,
          color: (company as { color?: string }).color ?? '#3b82f6',
        };
      }
      const avgPerformance =
        companyKPIs.reduce((acc, kpi) => acc + (kpi.currentValue / (kpi.targetValue || 1)) * 100, 0) /
        companyKPIs.length;
      return {
        name: company.shortName,
        performance: Math.round(avgPerformance),
        color: (company as { color?: string }).color ?? '#3b82f6',
      };
    });
  }, [scopeCompanyId, companies, filteredKPIData]);

  const pieChartData = [
    { name: 'Đạt mục tiêu', value: kpiHealth.good, color: '#10b981' },
    { name: 'Cảnh báo', value: kpiHealth.warning, color: '#f59e0b' },
    { name: 'Nguy hiểm', value: kpiHealth.critical, color: '#ef4444' },
  ];

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === 'good') return <CheckCircle size={16} className="text-emerald-500" />;
    if (status === 'warning') return <AlertTriangle size={16} className="text-amber-500" />;
    return <XCircle size={16} className="text-red-500" />;
  };

  const TrendIcon = ({ trend }: { trend: string }) => {
    if (trend === 'up') return <TrendingUp size={14} className="text-emerald-500" />;
    if (trend === 'down') return <TrendingDown size={14} className="text-red-500" />;
    return <Minus size={14} className="text-slate-400" />;
  };

  const formatValue = (value: number, unit: string) => {
    if (unit === 'VNĐ') {
      if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)} tỷ`;
      if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(0)} triệu`;
      return value.toLocaleString();
    }
    if (unit === 'km') return `${(value / 1000).toFixed(0)}k`;
    return `${value}${unit === '%' || unit === 'điểm' ? '' : ' '}${unit}`;
  };

  return (
    <div>
      <PageHeader
        title="Theo dõi KPI"
        subtitle="Trung tâm điều hành — business-master + kpi-engine"
        icon={<BarChart3 size={24} />}
      />

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <Info size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-800">Dashboard tự động cập nhật</p>
          <p className="text-sm text-blue-600 mt-0.5">
            {sourceNote ??
              'Dữ liệu KPI lấy từ business-master và chấm điểm qua kpi-engine. Cấu hình metric tại '}
            {!sourceNote ? (
              <a href="/settings/kpi-metrics" className="font-semibold underline hover:text-blue-800">
                Cài đặt → KPI & Metric
              </a>
            ) : null}
          </p>
        </div>
      </div>

      <ApiLoadBanner loadFailed={loadFailed} usingMockFallback={usingMockFallback} />

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
              <BarChart3 size={24} className="text-slate-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Tổng KPI đang theo dõi</p>
              <p className="text-2xl font-bold text-slate-900">{isLoading ? '…' : kpiHealth.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
              <CheckCircle size={24} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-emerald-600">Đạt mục tiêu</p>
              <p className="text-2xl font-bold text-emerald-700">{kpiHealth.good}</p>
            </div>
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <AlertTriangle size={24} className="text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-amber-600">Cảnh báo</p>
              <p className="text-2xl font-bold text-amber-700">{kpiHealth.warning}</p>
            </div>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
              <XCircle size={24} className="text-red-600" />
            </div>
            <div>
              <p className="text-sm text-red-600">Vùng đỏ</p>
              <p className="text-2xl font-bold text-red-700">{kpiHealth.critical}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        <InfoCard title="Tổng quan sức khỏe KPI">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </InfoCard>

        {scopeCompanyId === 'all' && (
          <InfoCard title="So sánh hiệu suất giữa các công ty" className="col-span-2">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 120]} unit="%" />
                  <YAxis type="category" dataKey="name" width={100} />
                  <Tooltip formatter={(value: number) => [`${value}%`, 'Hiệu suất']} />
                  <Bar dataKey="performance" radius={[0, 4, 4, 0]}>
                    {comparisonData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </InfoCard>
        )}

        {scopeCompanyId !== 'all' && (
          <InfoCard title="Tiến độ đạt mục tiêu" className="col-span-2">
            <div className="space-y-4">
              {filteredKPIData.map((kpi) => {
                const progress = Math.min((kpi.currentValue / (kpi.targetValue || 1)) * 100, 120);
                return (
                  <div key={kpi.kpiCode}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-700">{kpi.kpiName}</span>
                      <span className="text-sm text-slate-500">{progress.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          kpi.status === 'good'
                            ? 'bg-emerald-500'
                            : kpi.status === 'warning'
                              ? 'bg-amber-500'
                              : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </InfoCard>
        )}
      </div>

      <InfoCard title="Chi tiết các chỉ số KPI">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Mã KPI
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Tên chỉ số
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Giá trị hiện tại
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Mục tiêu
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                  % Đạt
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Xu hướng
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    Đang tải KPI…
                  </td>
                </tr>
              ) : filteredKPIData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    Chưa có chỉ số KPI trong phạm vi này.
                  </td>
                </tr>
              ) : (
                filteredKPIData.map((kpi) => (
                  <tr key={`${kpi.companyId}-${kpi.kpiCode}`} className="hover:bg-slate-50">
                    <td className="px-4 py-4">
                      <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">{kpi.kpiCode}</span>
                    </td>
                    <td className="px-4 py-4 font-medium text-slate-800">{kpi.kpiName}</td>
                    <td className="px-4 py-4 text-right font-semibold text-slate-900">
                      {formatValue(kpi.currentValue, kpi.unit)}
                    </td>
                    <td className="px-4 py-4 text-right text-slate-500">
                      {formatValue(kpi.targetValue, kpi.unit)}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span
                        className={`font-semibold ${
                          kpi.status === 'good'
                            ? 'text-emerald-600'
                            : kpi.status === 'warning'
                              ? 'text-amber-600'
                              : 'text-red-600'
                        }`}
                      >
                        {((kpi.currentValue / (kpi.targetValue || 1)) * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <TrendIcon trend={kpi.trend} />
                        <span
                          className={`text-sm ${
                            kpi.trend === 'up'
                              ? 'text-emerald-600'
                              : kpi.trend === 'down'
                                ? 'text-red-600'
                                : 'text-slate-500'
                          }`}
                        >
                          {kpi.changePercent > 0 ? '+' : ''}
                          {kpi.changePercent}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <StatusIcon status={kpi.status} />
                        <Badge
                          variant={
                            kpi.status === 'good' ? 'success' : kpi.status === 'warning' ? 'warning' : 'danger'
                          }
                          size="sm"
                        >
                          {kpi.status === 'good' ? 'Tốt' : kpi.status === 'warning' ? 'Cảnh báo' : 'Nguy hiểm'}
                        </Badge>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </InfoCard>
    </div>
  );
};

export default KPIDashboardPage;
