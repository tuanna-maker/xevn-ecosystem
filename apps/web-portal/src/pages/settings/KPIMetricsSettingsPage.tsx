import React, { useState } from 'react';
import { ListChecks, Plus, Edit2, Trash2, X, Save, AlertCircle } from 'lucide-react';
import {
  PageHeader,
  DataTable,
  Badge,
  Button,
  Column,
} from '../../components/common';
import { AutoResizeTextarea } from '../command-center/settings-form-pattern';
import { mockKPIMetrics, mockCompanies, KPIMetric } from '../../data/mockData';

const KPIMetricsSettingsPage: React.FC = () => {
  const [metrics, setMetrics] = useState<KPIMetric[]>(mockKPIMetrics);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMetric, setEditingMetric] = useState<KPIMetric | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    unit: '',
    formula: '',
    category: 'Tài chính',
    targetValue: 0,
    warningThreshold: 0,
    criticalThreshold: 0,
    applicableCompanies: ['all'] as string[],
  });

  const categories = ['Tài chính', 'Vận hành', 'Nhân sự', 'Y tế', 'Khách hàng', 'Công nghệ'];

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      unit: '',
      formula: '',
      category: 'Tài chính',
      targetValue: 0,
      warningThreshold: 0,
      criticalThreshold: 0,
      applicableCompanies: ['all'],
    });
    setEditingMetric(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (metric: KPIMetric) => {
    setEditingMetric(metric);
    setFormData({
      code: metric.code,
      name: metric.name,
      description: metric.description,
      unit: metric.unit,
      formula: metric.formula || '',
      category: metric.category,
      targetValue: metric.targetValue,
      warningThreshold: metric.warningThreshold,
      criticalThreshold: metric.criticalThreshold,
      applicableCompanies: metric.applicableCompanies,
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (editingMetric) {
      // Update existing
      setMetrics((prev) =>
        prev.map((m) =>
          m.id === editingMetric.id
            ? { ...m, ...formData }
            : m
        )
      );
    } else {
      // Add new
      const newMetric: KPIMetric = {
        id: `kpi-${Date.now()}`,
        ...formData,
      };
      setMetrics((prev) => [...prev, newMetric]);
    }
    setIsModalOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa metric KPI này? Điều này có thể ảnh hưởng đến các báo cáo đang sử dụng.')) {
      setMetrics((prev) => prev.filter((m) => m.id !== id));
    }
  };

  const getCompanyName = (companyId: string) => {
    const company = mockCompanies.find((c) => c.id === companyId);
    return company?.shortName || companyId;
  };

  const formatValue = (value: number, unit: string) => {
    if (unit === 'VNĐ') {
      if (value >= 1000000000) {
        return `${(value / 1000000000).toFixed(1)} tỷ`;
      }
      if (value >= 1000000) {
        return `${(value / 1000000).toFixed(0)} triệu`;
      }
      return value.toLocaleString();
    }
    return `${value.toLocaleString()} ${unit}`;
  };

  const categoryColors: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'> = {
    'Tài chính': 'success',
    'Vận hành': 'warning',
    'Nhân sự': 'info',
    'Y tế': 'danger',
    'Khách hàng': 'default',
    'Công nghệ': 'neutral',
  };

  // Table columns
  const columns: Column<KPIMetric>[] = [
    {
      key: 'code',
      header: 'Mã KPI',
      sortable: true,
      width: '100px',
      render: (value) => (
        <span className="font-mono text-xs bg-slate-800 text-white px-2 py-1 rounded">
          {value}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Tên chỉ số',
      sortable: true,
      render: (value, item) => (
        <div>
          <span className="font-semibold text-slate-800">{value}</span>
          <p className="text-xs text-slate-500 mt-0.5 truncate max-w-xs">
            {item.description}
          </p>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Nhóm',
      sortable: true,
      width: '120px',
      render: (value) => (
        <Badge variant={categoryColors[value] || 'neutral'} size="sm">
          {value}
        </Badge>
      ),
    },
    {
      key: 'targetValue',
      header: 'Mục tiêu',
      sortable: true,
      width: '120px',
      render: (value, item) => (
        <span className="font-semibold text-emerald-600">
          {formatValue(value, item.unit)}
        </span>
      ),
    },
    {
      key: 'warningThreshold',
      header: 'Ngưỡng cảnh báo',
      width: '120px',
      render: (value, item) => (
        <span className="text-amber-600">
          {formatValue(value, item.unit)}
        </span>
      ),
    },
    {
      key: 'criticalThreshold',
      header: 'Ngưỡng nguy hiểm',
      width: '120px',
      render: (value, item) => (
        <span className="text-red-600">
          {formatValue(value, item.unit)}
        </span>
      ),
    },
    {
      key: 'applicableCompanies',
      header: 'Áp dụng',
      render: (value: string[]) => (
        <div className="flex flex-wrap gap-1 max-w-[150px]">
          {value.slice(0, 2).map((companyId) => (
            <Badge key={companyId} variant="neutral" size="sm">
              {getCompanyName(companyId)}
            </Badge>
          ))}
          {value.length > 2 && (
            <Badge variant="neutral" size="sm">
              +{value.length - 2}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'id',
      header: 'Thao tác',
      width: '100px',
      render: (_, item) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => openEditModal(item)}
            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => handleDelete(item.id)}
            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="KPI & Metric"
        subtitle="Định nghĩa và quản lý các chỉ số đo lường KPI dùng chung"
        icon={<ListChecks size={24} />}
        showCompanyFilter={false}
        actions={
          <Button icon={<Plus size={16} />} onClick={openAddModal}>
            Thêm metric mới
          </Button>
        }
      />

      {/* Info Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <AlertCircle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-800">
            ⚡ Khu vực CRUD - Dữ liệu gốc KPI (Master Data)
          </p>
          <p className="text-sm text-amber-600 mt-0.5">
            Các metric được định nghĩa tại đây sẽ được sử dụng để tính toán và hiển thị trên Dashboard KPI.
            Thay đổi ngưỡng sẽ ảnh hưởng đến cảnh báo toàn hệ thống.
          </p>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={metrics}
        keyExtractor={(item) => item.id}
        searchPlaceholder="Tìm kiếm metric KPI..."
        emptyMessage="Chưa có metric KPI nào"
        actions={
          <span className="text-sm text-slate-500">
            Tổng: <span className="font-semibold">{metrics.length}</span> metric
          </span>
        }
      />

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto py-8">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/80 xevn-safe-inline py-4 shadow-soft backdrop-blur-md">
              <h2 className="text-lg font-semibold text-slate-800">
                {editingMetric ? 'Chỉnh sửa metric KPI' : 'Thêm metric KPI mới'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X size={20} />
              </button>
            </div>

            <div className="xevn-safe-inline max-h-[70vh] space-y-4 overflow-y-auto py-6">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Mã KPI <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value.toUpperCase() })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-xevn-accent/20 focus:border-xevn-accent"
                    placeholder="VD: REV001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nhóm KPI <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-xevn-accent/20 focus:border-xevn-accent"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Đơn vị <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) =>
                      setFormData({ ...formData, unit: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-xevn-accent/20 focus:border-xevn-accent"
                    placeholder="VD: VNĐ, %, km"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tên chỉ số <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-xevn-accent/20 focus:border-xevn-accent"
                  placeholder="VD: Doanh thu"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Mô tả
                </label>
                <AutoResizeTextarea
                  value={formData.description}
                  onChange={(v) =>
                    setFormData({ ...formData, description: v })
                  }
                  className="w-full border-slate-300 focus:ring-2 focus:ring-xevn-accent/20 focus:border-xevn-accent"
                  placeholder="Mô tả về chỉ số này..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Công thức tính (nếu có)
                </label>
                <input
                  type="text"
                  value={formData.formula}
                  onChange={(e) =>
                    setFormData({ ...formData, formula: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-xevn-accent/20 focus:border-xevn-accent font-mono text-sm"
                  placeholder="VD: (Số nghỉ việc / Tổng nhân sự) * 100"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Giá trị mục tiêu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.targetValue}
                    onChange={(e) =>
                      setFormData({ ...formData, targetValue: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-emerald-300 bg-emerald-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400"
                  />
                  <p className="text-xs text-emerald-600 mt-1">✓ Mục tiêu cần đạt</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Ngưỡng cảnh báo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.warningThreshold}
                    onChange={(e) =>
                      setFormData({ ...formData, warningThreshold: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-amber-300 bg-amber-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400"
                  />
                  <p className="text-xs text-amber-600 mt-1">⚠ Bắt đầu cảnh báo</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Ngưỡng nguy hiểm <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.criticalThreshold}
                    onChange={(e) =>
                      setFormData({ ...formData, criticalThreshold: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-red-300 bg-red-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400"
                  />
                  <p className="text-xs text-red-600 mt-1">✗ Vùng đỏ</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Áp dụng cho công ty <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {mockCompanies.map((company) => (
                    <label
                      key={company.id}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                        formData.applicableCompanies.includes(company.id)
                          ? 'bg-xevn-accent/10 border-xevn-accent text-xevn-accent'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.applicableCompanies.includes(company.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              applicableCompanies: [
                                ...formData.applicableCompanies,
                                company.id,
                              ],
                            });
                          } else {
                            setFormData({
                              ...formData,
                              applicableCompanies:
                                formData.applicableCompanies.filter(
                                  (id) => id !== company.id
                                ),
                            });
                          }
                        }}
                        className="sr-only"
                      />
                      <span className="text-sm font-medium">{company.shortName}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 z-10 flex items-center justify-end gap-3 rounded-b-xl border-t border-slate-100 bg-slate-50/90 xevn-safe-inline py-4 shadow-soft backdrop-blur-md">
              <Button
                variant="outline"
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
              >
                Hủy bỏ
              </Button>
              <Button
                icon={<Save size={16} />}
                onClick={handleSave}
                disabled={!formData.code || !formData.name || !formData.unit}
              >
                {editingMetric ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KPIMetricsSettingsPage;
