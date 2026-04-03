import React, { useState } from 'react';
import { Receipt, Plus, Edit2, Trash2, X, Save, CheckCircle, AlertCircle } from 'lucide-react';
import {
  PageHeader,
  DataTable,
  Badge,
  Button,
  Column,
} from '../../components/common';
import { AutoResizeTextarea } from '../command-center/settings-form-pattern';
import { mockExpenseCategories, mockCompanies, ExpenseCategory } from '../../data/mockData';

const ExpenseCategoriesSettingsPage: React.FC = () => {
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>(mockExpenseCategories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: 'variable' as ExpenseCategory['category'],
    type: 'fuel' as ExpenseCategory['type'],
    description: '',
    accountCode: '',
    taxDeductible: true,
    requiresReceipt: true,
    approvalRequired: false,
    maxAmountNoApproval: undefined as number | undefined,
    applicableCompanies: ['all'] as string[],
  });

  const categoryLabels: Record<ExpenseCategory['category'], string> = {
    direct: 'Trực tiếp',
    indirect: 'Gián tiếp',
    fixed: 'Cố định',
    variable: 'Biến đổi',
  };

  const typeLabels: Record<ExpenseCategory['type'], string> = {
    fuel: 'Nhiên liệu',
    toll: 'Cầu đường/BOT',
    maintenance: 'Sửa chữa/Bảo trì',
    labor: 'Nhân công/Tài xế',
    parking: 'Bến bãi/Lưu kho',
    insurance: 'Bảo hiểm',
    depreciation: 'Khấu hao',
    other: 'Chi phí khác',
  };

  const typeColors: Record<ExpenseCategory['type'], string> = {
    fuel: 'bg-orange-100 text-orange-700',
    toll: 'bg-blue-100 text-blue-700',
    maintenance: 'bg-emerald-100 text-emerald-700',
    labor: 'bg-purple-100 text-purple-700',
    parking: 'bg-amber-100 text-amber-700',
    insurance: 'bg-cyan-100 text-cyan-700',
    depreciation: 'bg-slate-100 text-slate-700',
    other: 'bg-rose-100 text-rose-700',
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      category: 'variable',
      type: 'fuel',
      description: '',
      accountCode: '',
      taxDeductible: true,
      requiresReceipt: true,
      approvalRequired: false,
      maxAmountNoApproval: undefined,
      applicableCompanies: ['all'],
    });
    setEditingCategory(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (category: ExpenseCategory) => {
    setEditingCategory(category);
    setFormData({
      code: category.code,
      name: category.name,
      category: category.category,
      type: category.type,
      description: category.description,
      accountCode: category.accountCode,
      taxDeductible: category.taxDeductible,
      requiresReceipt: category.requiresReceipt,
      approvalRequired: category.approvalRequired,
      maxAmountNoApproval: category.maxAmountNoApproval,
      applicableCompanies: category.applicableCompanies,
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (editingCategory) {
      setExpenseCategories((prev) =>
        prev.map((c) =>
          c.id === editingCategory.id
            ? { ...c, ...formData, status: 'active' as const }
            : c
        )
      );
    } else {
      const newCategory: ExpenseCategory = {
        id: `exp-${Date.now()}`,
        ...formData,
        status: 'active',
      };
      setExpenseCategories((prev) => [...prev, newCategory]);
    }
    setIsModalOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa loại chi phí này?')) {
      setExpenseCategories((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const filteredCategories = filterType === 'all' 
    ? expenseCategories 
    : expenseCategories.filter(c => c.type === filterType);

  // Table columns
  const columns: Column<ExpenseCategory>[] = [
    {
      key: 'code',
      header: 'Mã CP',
      sortable: true,
      width: '110px',
      render: (value) => (
        <span className="font-mono text-xs bg-slate-800 text-white px-2 py-1 rounded">
          {value}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Tên loại chi phí',
      sortable: true,
      render: (value, item) => (
        <div>
          <span className="font-semibold text-slate-800">{value}</span>
          <p className="text-xs text-slate-500 truncate max-w-[250px]">{item.description}</p>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Nhóm',
      sortable: true,
      width: '130px',
      render: (value: ExpenseCategory['type']) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[value]}`}>
          {typeLabels[value]}
        </span>
      ),
    },
    {
      key: 'category',
      header: 'Loại',
      width: '90px',
      render: (value: ExpenseCategory['category']) => (
        <Badge 
          variant={value === 'fixed' ? 'info' : value === 'variable' ? 'warning' : 'neutral'} 
          size="sm"
        >
          {categoryLabels[value]}
        </Badge>
      ),
    },
    {
      key: 'accountCode',
      header: 'TK Kế toán',
      width: '100px',
      render: (value) => (
        <span className="font-mono text-xs text-slate-600">{value}</span>
      ),
    },
    {
      key: 'taxDeductible',
      header: 'Khấu trừ',
      width: '80px',
      render: (value) => (
        value ? (
          <CheckCircle size={16} className="text-emerald-500" />
        ) : (
          <AlertCircle size={16} className="text-slate-300" />
        )
      ),
    },
    {
      key: 'requiresReceipt',
      header: 'Chứng từ',
      width: '80px',
      render: (value) => (
        value ? (
          <Badge variant="warning" size="sm">Bắt buộc</Badge>
        ) : (
          <span className="text-xs text-slate-400">Không</span>
        )
      ),
    },
    {
      key: 'approvalRequired',
      header: 'Phê duyệt',
      width: '90px',
      render: (value, item) => (
        value ? (
          <div>
            <Badge variant="danger" size="sm">Cần duyệt</Badge>
            {item.maxAmountNoApproval && (
              <p className="text-[10px] text-slate-500 mt-0.5">
                &lt;{(item.maxAmountNoApproval / 1000000).toFixed(0)}M: tự động
              </p>
            )}
          </div>
        ) : (
          <span className="text-xs text-slate-400">Tự động</span>
        )
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
    total: expenseCategories.length,
    byType: expenseCategories.reduce((acc, c) => {
      acc[c.type] = (acc[c.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    needApproval: expenseCategories.filter(c => c.approvalRequired).length,
    taxDeductible: expenseCategories.filter(c => c.taxDeductible).length,
  };

  return (
    <div>
      <PageHeader
        title="Danh mục Loại chi phí"
        subtitle="Quản lý phân loại chi phí hoạt động cho kiểm soát và báo cáo tài chính"
        icon={<Receipt size={24} />}
        showCompanyFilter={false}
        actions={
          <Button icon={<Plus size={16} />} onClick={openAddModal}>
            Thêm loại chi phí
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Tổng loại CP</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Cần phê duyệt</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{stats.needApproval}</p>
          <p className="text-xs text-slate-500">loại chi phí</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Được khấu trừ thuế</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.taxDeductible}</p>
          <p className="text-xs text-slate-500">loại chi phí</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Nhiên liệu</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">{stats.byType['fuel'] || 0}</p>
          <p className="text-xs text-slate-500">Chi phí lớn nhất</p>
        </div>
      </div>

      {/* Filter by Type */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            filterType === 'all'
              ? 'bg-slate-800 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Tất cả ({stats.total})
        </button>
        {Object.entries(typeLabels).map(([type, label]) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filterType === type
                ? typeColors[type as ExpenseCategory['type']].replace('-100', '-600') + ' text-white'
                : typeColors[type as ExpenseCategory['type']]
            }`}
          >
            {label} ({stats.byType[type] || 0})
          </button>
        ))}
      </div>

      {/* Info Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <Receipt size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-800">
            💰 Cost Control - Kiểm soát Chi phí Vận hành
          </p>
          <p className="text-sm text-amber-600 mt-0.5">
            Danh mục chi phí được mapping với tài khoản kế toán và quy trình phê duyệt. 
            Các thay đổi sẽ ảnh hưởng đến báo cáo tài chính và workflow duyệt chi.
          </p>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredCategories}
        keyExtractor={(item) => item.id}
        searchPlaceholder="Tìm kiếm loại chi phí..."
        emptyMessage="Chưa có loại chi phí nào"
        actions={
          <span className="text-sm text-slate-500">
            Hiển thị: <span className="font-semibold">{filteredCategories.length}</span> loại
          </span>
        }
      />

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/80 xevn-safe-inline py-4 shadow-soft backdrop-blur-md">
              <h2 className="text-lg font-semibold text-slate-800">
                {editingCategory ? 'Chỉnh sửa loại chi phí' : 'Thêm loại chi phí mới'}
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
              {/* Row 1: Code, Type, Category */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Mã chi phí <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value.toUpperCase() })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-xevn-accent/20 focus:border-xevn-accent"
                    placeholder="VD: CP-NL-001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nhóm chi phí <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value as ExpenseCategory['type'] })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-xevn-accent/20 focus:border-xevn-accent"
                  >
                    {Object.entries(typeLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Loại <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as ExpenseCategory['category'] })
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
                  Tên loại chi phí <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-xevn-accent/20 focus:border-xevn-accent"
                  placeholder="VD: Chi phí Nhiên liệu (Dầu Diesel)"
                />
              </div>

              {/* Accountng Code & Max Amount */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Mã tài khoản kế toán <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.accountCode}
                    onChange={(e) =>
                      setFormData({ ...formData, accountCode: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-xevn-accent/20 focus:border-xevn-accent"
                    placeholder="VD: 6277"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Mức tối đa không cần duyệt (VNĐ)
                  </label>
                  <input
                    type="number"
                    value={formData.maxAmountNoApproval || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, maxAmountNoApproval: e.target.value ? Number(e.target.value) : undefined })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-xevn-accent/20 focus:border-xevn-accent"
                    placeholder="VD: 10000000"
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
                  placeholder="Mô tả chi tiết loại chi phí..."
                />
              </div>

              {/* Checkboxes */}
              <div className="grid grid-cols-3 gap-4">
                <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={formData.taxDeductible}
                    onChange={(e) =>
                      setFormData({ ...formData, taxDeductible: e.target.checked })
                    }
                    className="w-4 h-4 text-xevn-accent border-slate-300 rounded focus:ring-xevn-accent"
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-700">Khấu trừ thuế</p>
                    <p className="text-xs text-slate-500">Được khấu trừ VAT</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={formData.requiresReceipt}
                    onChange={(e) =>
                      setFormData({ ...formData, requiresReceipt: e.target.checked })
                    }
                    className="w-4 h-4 text-xevn-accent border-slate-300 rounded focus:ring-xevn-accent"
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-700">Yêu cầu chứng từ</p>
                    <p className="text-xs text-slate-500">Hóa đơn/Biên lai</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={formData.approvalRequired}
                    onChange={(e) =>
                      setFormData({ ...formData, approvalRequired: e.target.checked })
                    }
                    className="w-4 h-4 text-xevn-accent border-slate-300 rounded focus:ring-xevn-accent"
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-700">Cần phê duyệt</p>
                    <p className="text-xs text-slate-500">Workflow duyệt chi</p>
                  </div>
                </label>
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
                disabled={!formData.code || !formData.name || !formData.accountCode}
              >
                {editingCategory ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseCategoriesSettingsPage;
