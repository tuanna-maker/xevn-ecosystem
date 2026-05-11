import React, { useMemo } from 'react';
import { Target, Info, FileText, CheckCircle, Clock } from 'lucide-react';
import {
  PageHeader,
  StatCard,
  InfoCard,
  Badge,
} from '../../components/common';
import { useGlobalFilter } from '../../contexts/GlobalFilterContext';
import { mockKPIMetrics, mockCompanies } from '../../data/mockData';

// Mock policy data
const mockPolicies = [
  {
    id: 'policy-1',
    code: 'CS-2024-001',
    name: 'Chính sách KPI Doanh thu Q1/2024',
    description: 'Quy định mục tiêu và cách tính KPI doanh thu cho toàn tập đoàn',
    status: 'approved',
    approvedDate: '2024-01-15',
    effectiveDate: '2024-01-01',
    applicableCompanies: ['all'],
    relatedKPIs: ['REV001'],
  },
  {
    id: 'policy-2',
    code: 'CS-2024-002',
    name: 'Chính sách quản lý Turnover Rate',
    description: 'Quy định ngưỡng tỷ lệ nghỉ việc cho phép của từng công ty',
    status: 'approved',
    approvedDate: '2024-01-20',
    effectiveDate: '2024-02-01',
    applicableCompanies: ['all'],
    relatedKPIs: ['HR001'],
  },
  {
    id: 'policy-3',
    code: 'CS-2024-003',
    name: 'Chính sách SLA Vận hành Logistics',
    description: 'Quy định các mức SLA cho hoạt động vận chuyển và giao nhận',
    status: 'pending',
    approvedDate: null,
    effectiveDate: null,
    applicableCompanies: ['trsport', 'lgts'],
    relatedKPIs: ['OPS001'],
  },
  {
    id: 'policy-4',
    code: 'CS-2024-004',
    name: 'Chính sách Uptime hệ thống công nghệ',
    description: 'Yêu cầu độ ổn định của các hệ thống IT trong tập đoàn',
    status: 'approved',
    approvedDate: '2024-02-01',
    effectiveDate: '2024-02-15',
    applicableCompanies: ['xevn-tech'],
    relatedKPIs: ['TECH001'],
  },
];

const KPIPolicyPage: React.FC = () => {
  const { selectedCompany } = useGlobalFilter();

  // Filter policies based on selected company
  const filteredPolicies = useMemo(() => {
    if (selectedCompany.id === 'all') {
      return mockPolicies;
    }
    return mockPolicies.filter(
      (policy) =>
        policy.applicableCompanies.includes(selectedCompany.id) ||
        policy.applicableCompanies.includes('all')
    );
  }, [selectedCompany.id]);

  // Filter KPI metrics based on selected company
  const filteredMetrics = useMemo(() => {
    if (selectedCompany.id === 'all') {
      return mockKPIMetrics;
    }
    return mockKPIMetrics.filter(
      (metric) =>
        metric.applicableCompanies.includes(selectedCompany.id) ||
        metric.applicableCompanies.includes('all')
    );
  }, [selectedCompany.id]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalPolicies = filteredPolicies.length;
    const approved = filteredPolicies.filter((p) => p.status === 'approved').length;
    const pending = filteredPolicies.filter((p) => p.status === 'pending').length;
    const totalMetrics = filteredMetrics.length;
    return { totalPolicies, approved, pending, totalMetrics };
  }, [filteredPolicies, filteredMetrics]);

  // Get company name by ID
  const getCompanyName = (companyId: string) => {
    const company = mockCompanies.find((c) => c.id === companyId);
    return company?.shortName || companyId;
  };

  return (
    <div>
      <PageHeader
        title="KPI & Chính sách"
        subtitle="Quản lý và phê duyệt các chính sách KPI của tập đoàn"
        icon={<Target size={24} />}
      />

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <Info size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-800">
            Chế độ Xem và Phê duyệt (View & Orchestration)
          </p>
          <p className="text-sm text-blue-600 mt-0.5">
            Tại đây bạn có thể xem và phê duyệt các chính sách KPI.
            Để tạo mới hoặc chỉnh sửa định nghĩa metric, vui lòng truy cập{' '}
            <a
              href="/settings/kpi-metrics"
              className="font-semibold underline hover:text-blue-800"
            >
              Cài đặt → KPI & Metric
            </a>
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Tổng chính sách"
          value={stats.totalPolicies}
          icon={<FileText size={24} />}
          color="blue"
        />
        <StatCard
          title="Đã phê duyệt"
          value={stats.approved}
          icon={<CheckCircle size={24} />}
          color="green"
        />
        <StatCard
          title="Chờ phê duyệt"
          value={stats.pending}
          icon={<Clock size={24} />}
          color="amber"
        />
        <StatCard
          title="Số metric KPI"
          value={stats.totalMetrics}
          icon={<Target size={24} />}
          color="purple"
        />
      </div>

      {/* Policies List */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <InfoCard title="Danh sách Chính sách KPI">
          <div className="space-y-3">
            {filteredPolicies.map((policy) => (
              <div
                key={policy.id}
                className={`p-4 rounded-lg border ${
                  policy.status === 'approved'
                    ? 'bg-emerald-50 border-emerald-200'
                    : 'bg-amber-50 border-amber-200'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="font-mono text-xs bg-white px-2 py-0.5 rounded border">
                      {policy.code}
                    </span>
                    <h4 className="font-semibold text-slate-800 mt-1">
                      {policy.name}
                    </h4>
                  </div>
                  <Badge
                    variant={policy.status === 'approved' ? 'success' : 'warning'}
                    size="sm"
                    dot
                  >
                    {policy.status === 'approved' ? 'Đã phê duyệt' : 'Chờ phê duyệt'}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600 mb-2">{policy.description}</p>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  {policy.approvedDate && (
                    <span>Phê duyệt: {policy.approvedDate}</span>
                  )}
                  {policy.effectiveDate && (
                    <span>Hiệu lực: {policy.effectiveDate}</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {policy.applicableCompanies.map((companyId) => (
                    <Badge key={companyId} variant="neutral" size="sm">
                      {getCompanyName(companyId)}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </InfoCard>

        <InfoCard title="Các Metric KPI đang áp dụng">
          <div className="space-y-3">
            {filteredMetrics.map((metric) => (
              <div
                key={metric.id}
                className="p-4 rounded-lg border bg-slate-50 border-slate-200"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="font-mono text-xs bg-white px-2 py-0.5 rounded border">
                      {metric.code}
                    </span>
                    <h4 className="font-semibold text-slate-800 mt-1">
                      {metric.name}
                    </h4>
                  </div>
                  <Badge variant="info" size="sm">
                    {metric.category}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600 mb-2">{metric.description}</p>
                
                <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                  <div className="bg-emerald-100 text-emerald-700 rounded px-2 py-1 text-center">
                    <p className="font-semibold">Mục tiêu</p>
                    <p>{metric.targetValue.toLocaleString()} {metric.unit}</p>
                  </div>
                  <div className="bg-amber-100 text-amber-700 rounded px-2 py-1 text-center">
                    <p className="font-semibold">Cảnh báo</p>
                    <p>{metric.warningThreshold.toLocaleString()} {metric.unit}</p>
                  </div>
                  <div className="bg-red-100 text-red-700 rounded px-2 py-1 text-center">
                    <p className="font-semibold">Nguy hiểm</p>
                    <p>{metric.criticalThreshold.toLocaleString()} {metric.unit}</p>
                  </div>
                </div>

                {metric.formula && (
                  <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
                    <span className="font-semibold">Công thức: </span>
                    {metric.formula}
                  </div>
                )}
              </div>
            ))}
          </div>
        </InfoCard>
      </div>
    </div>
  );
};

export default KPIPolicyPage;
