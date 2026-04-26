import React, { useState } from 'react';
import { Building, Plus, Edit2, Trash2, X, Save, Phone } from 'lucide-react';
import {
  PageHeader,
  DataTable,
  Badge,
  Button,
  Column,
} from '../../components/common';
import { AutoResizeTextarea } from '../command-center/settings-form-pattern';
import { mockVendors, mockCompanies, Vendor } from '../../data/mockData';

const VendorsSettingsPage: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>(mockVendors);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    shortName: '',
    category: 'fuel' as Vendor['category'],
    taxCode: '',
    address: '',
    contactPerson: '',
    phone: '',
    email: '',
    paymentTerms: '',
    creditLimit: undefined as number | undefined,
    discountRate: undefined as number | undefined,
    notes: '',
    relatedCompanies: ['all'] as string[],
  });

  const categoryLabels: Record<Vendor['category'], string> = {
    fuel: 'Nhiên liệu',
    insurance: 'Bảo hiểm',
    repair: 'Sửa chữa',
    rest_stop: 'Trạm dừng nghỉ',
    rescue: 'Cứu hộ',
    toll: 'Cầu đường/BOT',
    parts: 'Phụ tùng',
    technology: 'Công nghệ',
    port: 'Cảng/Logistics',
    other: 'Khác',
  };

  const categoryColors: Record<Vendor['category'], string> = {
    fuel: 'bg-orange-100 text-orange-700',
    insurance: 'bg-blue-100 text-blue-700',
    repair: 'bg-emerald-100 text-emerald-700',
    rest_stop: 'bg-amber-100 text-amber-700',
    rescue: 'bg-red-100 text-red-700',
    toll: 'bg-indigo-100 text-indigo-700',
    parts: 'bg-slate-100 text-slate-700',
    technology: 'bg-purple-100 text-purple-700',
    port: 'bg-cyan-100 text-cyan-700',
    other: 'bg-gray-100 text-gray-700',
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      shortName: '',
      category: 'fuel',
      taxCode: '',
      address: '',
      contactPerson: '',
      phone: '',
      email: '',
      paymentTerms: '',
      creditLimit: undefined,
      discountRate: undefined,
      notes: '',
      relatedCompanies: ['all'],
    });
    setEditingVendor(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setFormData({
      code: vendor.code,
      name: vendor.name,
      shortName: vendor.shortName,
      category: vendor.category,
      taxCode: vendor.taxCode || '',
      address: vendor.address || '',
      contactPerson: vendor.contactPerson || '',
      phone: vendor.phone || '',
      email: vendor.email || '',
      paymentTerms: vendor.paymentTerms || '',
      creditLimit: vendor.creditLimit,
      discountRate: vendor.discountRate,
      notes: vendor.notes || '',
      relatedCompanies: vendor.relatedCompanies,
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (editingVendor) {
      setVendors((prev) =>
        prev.map((v) =>
          v.id === editingVendor.id
            ? { ...v, ...formData, status: 'active' as const }
            : v
        )
      );
    } else {
      const newVendor: Vendor = {
        id: `vnd-${Date.now()}`,
        ...formData,
        status: 'active',
      };
      setVendors((prev) => [...prev, newVendor]);
    }
    setIsModalOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa đối tác này?')) {
      setVendors((prev) => prev.filter((v) => v.id !== id));
    }
  };

  const filteredVendors = filterCategory === 'all' 
    ? vendors 
    : vendors.filter(v => v.category === filterCategory);

  // Table columns
  const columns: Column<Vendor>[] = [
    {
      key: 'code',
      header: 'Mã NCC',
      sortable: true,
      width: '100px',
      render: (value) => (
        <span className="font-mono text-xs bg-slate-800 text-white px-2 py-1 rounded">
          {value}
        </span>
      ),
    },
    {
      key: 'shortName',
      header: 'Tên đối tác',
      sortable: true,
      render: (value, item) => (
        <div>
          <span className="font-semibold text-slate-800">{value}</span>
          <p className="text-xs text-slate-500 truncate max-w-[200px]">{item.name}</p>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Loại',
      sortable: true,
      width: '130px',
      render: (value: Vendor['category']) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors[value]}`}>
          {categoryLabels[value]}
        </span>
      ),
    },
    {
      key: 'contactPerson',
      header: 'Liên hệ',
      render: (value, item) => (
        <div className="text-sm">
          <p className="text-slate-800">{value || '-'}</p>
          {item.phone && (
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <Phone size={10} /> {item.phone}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'paymentTerms',
      header: 'Điều khoản TT',
      width: '140px',
      render: (value) => (
        <span className="text-sm text-slate-600">{value || '-'}</span>
      ),
    },
    {
      key: 'creditLimit',
      header: 'Hạn mức CN',
      width: '130px',
      render: (value: Vendor['creditLimit']) => (
        <div className="flex items-center gap-1">
          {value ? (
            <span className="text-sm font-medium text-emerald-600">
              {(value / 1000000).toFixed(0)}M
            </span>
          ) : (
            <span className="text-sm text-slate-400">-</span>
          )}
        </div>
      ),
    },
    {
      key: 'discountRate',
      header: 'CK%',
      width: '70px',
      render: (value) => (
        value ? (
          <Badge variant="success" size="sm">{value}%</Badge>
        ) : (
          <span className="text-slate-400">-</span>
        )
      ),
    },
    {
      key: 'status',
      header: 'TT',
      width: '80px',
      render: (value) => (
        <Badge variant={value === 'active' ? 'success' : 'neutral'} size="sm">
          {value === 'active' ? 'HĐ' : 'Ngưng'}
        </Badge>
      ),
    },
    {
      key: 'id',
      header: '',
      width: '90px',
      render: (_, item) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => openEditModal(item)}
            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
          >
            <Edit2 size={15} />
          </button>
          <button
            onClick={() => handleDelete(item.id)}
            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  // Stats
  const stats = {
    total: vendors.length,
    active: vendors.filter(v => v.status === 'active').length,
    byCategory: vendors.reduce((acc, v) => {
      acc[v.category] = (acc[v.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    totalCreditLimit: vendors.reduce((sum, v) => sum + (v.creditLimit || 0), 0),
  };

  return (
    <div>
      <PageHeader
        title="Danh mục Đối tác / Nhà cung cấp"
        subtitle="Quản lý thông tin đối tác: Nhiên liệu, Bảo hiểm, Sửa chữa, Cảng…"
        icon={<Building size={24} />}
        showCompanyFilter={false}
        actions={
          <Button icon={<Plus size={16} />} onClick={openAddModal}>
            Thêm đối tác mới
          </Button>
        }
      />

      {/* Stats & Filter */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={() => setFilterCategory('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filterCategory === 'all'
              ? 'bg-slate-800 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Tất cả ({stats.total})
        </button>
        {Object.entries(categoryLabels).map(([category, label]) => (
          <button
            key={category}
            onClick={() => setFilterCategory(category)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterCategory === category
                ? categoryColors[category as Vendor['category']].replace('bg-', 'bg-').replace('-100', '-500') + ' text-white'
                : categoryColors[category as Vendor['category']] + ' hover:opacity-80'
            }`}
          >
            {label} ({stats.byCategory[category] || 0})
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Tổng đối tác</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{stats.total}</p>
          <p className="text-xs text-emerald-600 mt-1">{stats.active} hoạt động</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Nhiên liệu</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">{stats.byCategory['fuel'] || 0}</p>
          <p className="text-xs text-slate-500 mt-1">Petrolimex, PVOil...</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Bảo hiểm</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{stats.byCategory['insurance'] || 0}</p>
          <p className="text-xs text-slate-500 mt-1">Bảo Việt, PJICO, PVI</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Tổng hạn mức CN</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{(stats.totalCreditLimit / 1000000000).toFixed(1)}B</p>
          <p className="text-xs text-slate-500 mt-1">VNĐ</p>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredVendors}
        keyExtractor={(item) => item.id}
        searchPlaceholder="Tìm kiếm đối tác..."
        emptyMessage="Chưa có đối tác nào"
        actions={
          <span className="text-sm text-slate-500">
            Hiển thị: <span className="font-semibold">{filteredVendors.length}</span> đối tác
          </span>
        }
      />

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/80 xevn-safe-inline py-4 shadow-soft backdrop-blur-md">
              <h2 className="text-lg font-semibold text-slate-800">
                {editingVendor ? 'Chỉnh sửa đối tác' : 'Thêm đối tác mới'}
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
              {/* Row 1: Code, Category, ShortName */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Mã NCC <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value.toUpperCase() })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-xevn-accent/20 focus:border-xevn-accent"
                    placeholder="VD: NL-001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Loại đối tác <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as Vendor['category'] })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-xevn-accent/20 focus:border-xevn-accent"
                  >
                    {Object.entries(categoryLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Tên viết tắt <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.shortName}
                    onChange={(e) =>
                      setFormData({ ...formData, shortName: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-xevn-accent/20 focus:border-xevn-accent"
                    placeholder="VD: Petrolimex"
                  />
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tên đầy đủ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-xevn-accent/20 focus:border-xevn-accent"
                  placeholder="VD: Tập đoàn Xăng dầu Việt Nam"
                />
              </div>

              {/* Tax & Address */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Mã số thuế
                  </label>
                  <input
                    type="text"
                    value={formData.taxCode}
                    onChange={(e) =>
                      setFormData({ ...formData, taxCode: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-xevn-accent/20 focus:border-xevn-accent"
                    placeholder="VD: 0100108108"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Địa chỉ
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-xevn-accent/20 focus:border-xevn-accent"
                    placeholder="Địa chỉ văn phòng..."
                  />
                </div>
              </div>

              {/* Contact */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Người liên hệ
                  </label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) =>
                      setFormData({ ...formData, contactPerson: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-xevn-accent/20 focus:border-xevn-accent"
                    placeholder="Họ và tên"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-xevn-accent/20 focus:border-xevn-accent"
                    placeholder="Hotline/SĐT"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-xevn-accent/20 focus:border-xevn-accent"
                    placeholder="email@company.vn"
                  />
                </div>
              </div>

              {/* Payment Terms */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Điều khoản thanh toán
                  </label>
                  <select
                    value={formData.paymentTerms}
                    onChange={(e) =>
                      setFormData({ ...formData, paymentTerms: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-xevn-accent/20 focus:border-xevn-accent"
                  >
                    <option value="">-- Chọn --</option>
                    <option value="Thanh toán ngay">Thanh toán ngay</option>
                    <option value="Công nợ 7 ngày">Công nợ 7 ngày</option>
                    <option value="Công nợ 15 ngày">Công nợ 15 ngày</option>
                    <option value="Công nợ 30 ngày">Công nợ 30 ngày</option>
                    <option value="Công nợ 45 ngày">Công nợ 45 ngày</option>
                    <option value="Hàng tháng">Hàng tháng</option>
                    <option value="Hàng quý">Hàng quý</option>
                    <option value="Hàng năm">Hàng năm</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Hạn mức công nợ (VNĐ)
                  </label>
                  <input
                    type="number"
                    value={formData.creditLimit || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, creditLimit: e.target.value ? Number(e.target.value) : undefined })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-xevn-accent/20 focus:border-xevn-accent"
                    placeholder="VD: 500000000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Chiết khấu (%)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.discountRate || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, discountRate: e.target.value ? Number(e.target.value) : undefined })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-xevn-accent/20 focus:border-xevn-accent"
                    placeholder="VD: 5"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Ghi chú
                </label>
                <AutoResizeTextarea
                  value={formData.notes}
                  onChange={(v) =>
                    setFormData({ ...formData, notes: v })
                  }
                  className="w-full border-slate-300 focus:ring-2 focus:ring-xevn-accent/20 focus:border-xevn-accent"
                  placeholder="Ghi chú thêm về đối tác..."
                />
              </div>

              {/* Related Companies */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Áp dụng cho công ty <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {mockCompanies.map((company: { id: string; shortName: string }) => (
                    <label
                      key={company.id}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                        formData.relatedCompanies.includes(company.id)
                          ? 'bg-xevn-accent/10 border-xevn-accent text-xevn-accent'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.relatedCompanies.includes(company.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              relatedCompanies: [
                                ...formData.relatedCompanies,
                                company.id,
                              ],
                            });
                          } else {
                            setFormData({
                              ...formData,
                              relatedCompanies:
                                formData.relatedCompanies.filter(
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
                disabled={!formData.code || !formData.name || !formData.shortName}
              >
                {editingVendor ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorsSettingsPage;
