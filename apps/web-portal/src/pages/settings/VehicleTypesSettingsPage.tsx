import React, { useState } from 'react';
import { Truck, Plus, Edit2, Trash2, X, Save, Fuel, Weight } from 'lucide-react';
import {
  PageHeader,
  DataTable,
  Badge,
  Button,
  Column,
} from '../../components/common';
import { AutoResizeTextarea } from '../command-center/settings-form-pattern';
import { mockVehicleTypes, mockCompanies, VehicleType } from '../../data/mockData';

const VehicleTypesSettingsPage: React.FC = () => {
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>(mockVehicleTypes);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicleType, setEditingVehicleType] = useState<VehicleType | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: 'truck' as VehicleType['category'],
    description: '',
    payloadCapacity: 0,
    fuelConsumptionNorm: 0,
    fuelType: 'diesel' as VehicleType['fuelType'],
    requiredLicense: 'B2' as VehicleType['requiredLicense'],
    maintenanceIntervalKm: 10000,
    applicableCompanies: ['all'] as string[],
  });

  const categoryLabels: Record<VehicleType['category'], string> = {
    container: 'Container/Đầu kéo',
    truck: 'Xe tải',
    refrigerated: 'Xe lạnh',
    bus: 'Xe khách',
    van: 'Xe Van/Shipper',
    pickup: 'Xe bán tải',
    special: 'Xe đặc biệt',
  };

  const categoryColors: Record<VehicleType['category'], string> = {
    container: 'bg-blue-100 text-blue-700',
    truck: 'bg-emerald-100 text-emerald-700',
    refrigerated: 'bg-cyan-100 text-cyan-700',
    bus: 'bg-amber-100 text-amber-700',
    van: 'bg-purple-100 text-purple-700',
    pickup: 'bg-teal-100 text-teal-700',
    special: 'bg-rose-100 text-rose-700',
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      category: 'truck',
      description: '',
      payloadCapacity: 0,
      fuelConsumptionNorm: 0,
      fuelType: 'diesel',
      requiredLicense: 'B2',
      maintenanceIntervalKm: 10000,
      applicableCompanies: ['all'],
    });
    setEditingVehicleType(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (vehicleType: VehicleType) => {
    setEditingVehicleType(vehicleType);
    setFormData({
      code: vehicleType.code,
      name: vehicleType.name,
      category: vehicleType.category,
      description: vehicleType.description,
      payloadCapacity: vehicleType.payloadCapacity,
      fuelConsumptionNorm: vehicleType.fuelConsumptionNorm,
      fuelType: vehicleType.fuelType,
      requiredLicense: vehicleType.requiredLicense,
      maintenanceIntervalKm: vehicleType.maintenanceIntervalKm,
      applicableCompanies: vehicleType.applicableCompanies,
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (editingVehicleType) {
      setVehicleTypes((prev) =>
        prev.map((vt) =>
          vt.id === editingVehicleType.id
            ? { ...vt, ...formData, status: 'active' as const }
            : vt
        )
      );
    } else {
      const newVehicleType: VehicleType = {
        id: `vt-${Date.now()}`,
        code: formData.code,
        name: formData.name,
        category: formData.category,
        description: formData.description,
        payloadCapacity: formData.payloadCapacity,
        fuelConsumptionNorm: formData.fuelConsumptionNorm,
        fuelType: formData.fuelType,
        requiredLicense: formData.requiredLicense,
        maintenanceIntervalKm: formData.maintenanceIntervalKm,
        applicableCompanies: formData.applicableCompanies,
        status: 'active',
      };
      setVehicleTypes((prev) => [...prev, newVehicleType]);
    }
    setIsModalOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa loại phương tiện này?')) {
      setVehicleTypes((prev) => prev.filter((vt) => vt.id !== id));
    }
  };

  const getCompanyName = (companyId: string) => {
    const company = mockCompanies.find((c: { id: string }) => c.id === companyId);
    return company?.shortName || companyId;
  };

  // Table columns
  const columns: Column<VehicleType>[] = [
    {
      key: 'code',
      header: 'Mã loại',
      sortable: true,
      width: '120px',
      render: (value) => (
        <span className="font-mono text-xs bg-slate-800 text-white px-2 py-1 rounded">
          {value}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Tên loại phương tiện',
      sortable: true,
      render: (value) => (
        <span className="font-semibold text-slate-800">{value}</span>
      ),
    },
    {
      key: 'category',
      header: 'Nhóm',
      sortable: true,
      width: '150px',
      render: (value: VehicleType['category']) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors[value]}`}>
          {categoryLabels[value]}
        </span>
      ),
    },
    {
      key: 'payloadCapacity',
      header: 'Tải trọng',
      sortable: true,
      width: '100px',
      render: (value) => (
        <div className="flex items-center gap-1 text-slate-600">
          <Weight size={14} />
          <span className="text-sm">{value ? `${value} tấn` : '-'}</span>
        </div>
      ),
    },
    {
      key: 'fuelConsumptionNorm',
      header: 'Định mức NL',
      sortable: true,
      width: '130px',
      render: (value) => (
        <div className="flex items-center gap-1 text-amber-600">
          <Fuel size={14} />
          <span className="text-sm font-medium">{value} L/100km</span>
        </div>
      ),
    },
    {
      key: 'requiredLicense',
      header: 'Bằng lái',
      width: '80px',
      render: (value) => (
        <Badge variant={value === 'FC' ? 'danger' : value === 'C' ? 'warning' : 'info'} size="sm">
          {value}
        </Badge>
      ),
    },
    {
      key: 'applicableCompanies',
      header: 'Áp dụng cho',
      render: (value: string[]) => (
        <div className="flex flex-wrap gap-1">
          {value.slice(0, 2).map((companyId) => (
            <Badge key={companyId} variant="info" size="sm">
              {getCompanyName(companyId)}
            </Badge>
          ))}
          {value.length > 2 && (
            <Badge variant="neutral" size="sm">+{value.length - 2}</Badge>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'TT',
      width: '80px',
      render: (value) => (
        <Badge variant={value === 'active' ? 'success' : 'neutral'} size="sm">
          {value === 'active' ? 'Hoạt động' : 'Ngưng'}
        </Badge>
      ),
    },
    {
      key: 'id',
      header: 'Thao tác',
      width: '100px',
      render: (_, item) => (
        <div className="flex items-center gap-2">
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

  // Stats
  const stats = {
    total: vehicleTypes.length,
    byCategory: vehicleTypes.reduce((acc, vt) => {
      acc[vt.category] = (acc[vt.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  return (
    <div>
      <PageHeader
        title="Danh mục Loại phương tiện"
        subtitle="Quản lý định mức nhiên liệu và phân loại phương tiện vận tải"
        icon={<Truck size={24} />}
        showCompanyFilter={false}
        actions={
          <Button icon={<Plus size={16} />} onClick={openAddModal}>
            Thêm loại xe mới
          </Button>
        }
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
        {Object.entries(categoryLabels).map(([category, label]) => (
          <div key={category} className={`rounded-lg px-4 py-3 ${categoryColors[category as VehicleType['category']].replace('text-', 'bg-').replace('-700', '-50')}`}>
            <p className="text-xs text-slate-500">{label}</p>
            <p className="text-xl font-bold text-slate-800">
              {stats.byCategory[category] || 0}
            </p>
          </div>
        ))}
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <Fuel size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-800">
            ⛽ Định mức Nhiên liệu - Cost Control
          </p>
          <p className="text-sm text-blue-600 mt-0.5">
            Định mức nhiên liệu (L/100km) là cơ sở để tính toán chi phí vận tải, 
            phân tích hiệu quả xe và kiểm soát tiêu hao bất thường.
          </p>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={vehicleTypes}
        keyExtractor={(item) => item.id}
        searchPlaceholder="Tìm kiếm loại phương tiện..."
        emptyMessage="Chưa có loại phương tiện nào"
        actions={
          <span className="text-sm text-slate-500">
            Tổng: <span className="font-semibold">{vehicleTypes.length}</span> loại
          </span>
        }
      />

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/80 xevn-safe-inline py-4 shadow-soft backdrop-blur-md">
              <h2 className="text-lg font-semibold text-slate-800">
                {editingVehicleType ? 'Chỉnh sửa loại phương tiện' : 'Thêm loại phương tiện mới'}
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

            <div className="xevn-safe-inline space-y-4 py-6">
              {/* Row 1: Code & Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Mã loại xe <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value.toUpperCase() })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-xevn-accent/20 focus:border-xevn-accent"
                    placeholder="VD: XT-5T"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nhóm phương tiện <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as VehicleType['category'] })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-xevn-accent/20 focus:border-xevn-accent"
                  >
                    {Object.entries(categoryLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tên loại phương tiện <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-xevn-accent/20 focus:border-xevn-accent"
                  placeholder="VD: Xe tải 5 tấn"
                />
              </div>

              {/* Row 2: Payload & Fuel Norm */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Tải trọng (tấn) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.payloadCapacity}
                    onChange={(e) =>
                      setFormData({ ...formData, payloadCapacity: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-xevn-accent/20 focus:border-xevn-accent"
                    placeholder="VD: 5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Định mức NL (L/100km) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.fuelConsumptionNorm}
                    onChange={(e) =>
                      setFormData({ ...formData, fuelConsumptionNorm: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-xevn-accent/20 focus:border-xevn-accent"
                    placeholder="VD: 18"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Loại nhiên liệu
                  </label>
                  <select
                    value={formData.fuelType}
                    onChange={(e) =>
                      setFormData({ ...formData, fuelType: e.target.value as VehicleType['fuelType'] })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-xevn-accent/20 focus:border-xevn-accent"
                  >
                    <option value="diesel">Dầu Diesel</option>
                    <option value="gasoline">Xăng</option>
                    <option value="electric">Điện</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              {/* License */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Bằng lái yêu cầu
                  </label>
                  <select
                    value={formData.requiredLicense}
                    onChange={(e) =>
                      setFormData({ ...formData, requiredLicense: e.target.value as VehicleType['requiredLicense'] })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-xevn-accent/20 focus:border-xevn-accent"
                  >
                    <option value="B2">B2 - Xe ô tô đến 9 chỗ, xe tải dưới 3.5 tấn</option>
                    <option value="C">C - Xe tải trên 3.5 tấn</option>
                    <option value="D">D - Xe khách 10-30 chỗ</option>
                    <option value="E">E - Xe khách trên 30 chỗ</option>
                    <option value="FC">FC - Xe đầu kéo, container</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Chu kỳ bảo dưỡng (km)
                  </label>
                  <input
                    type="number"
                    step="1000"
                    value={formData.maintenanceIntervalKm}
                    onChange={(e) =>
                      setFormData({ ...formData, maintenanceIntervalKm: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-xevn-accent/20 focus:border-xevn-accent"
                    placeholder="VD: 10000"
                  />
                </div>
              </div>

              {/* Description */}
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
                  placeholder="Mô tả ngắn về loại phương tiện..."
                />
              </div>

              {/* Applicable Companies */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Áp dụng cho công ty <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {mockCompanies.map((company: { id: string; shortName: string }) => (
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
                disabled={!formData.code || !formData.name || !formData.fuelConsumptionNorm}
              >
                {editingVehicleType ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleTypesSettingsPage;
