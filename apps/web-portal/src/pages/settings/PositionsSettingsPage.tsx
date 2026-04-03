import React, { useState } from 'react';
import { Briefcase, Plus, Edit2, Trash2, X, Save } from 'lucide-react';
import {
  PageHeader,
  DataTable,
  Badge,
  Button,
  Column,
} from '../../components/common';
import { AutoResizeTextarea } from '../command-center/settings-form-pattern';
import { mockPositions, mockCompanies, Position } from '../../data/mockData';

const PositionsSettingsPage: React.FC = () => {
  const [positions, setPositions] = useState<Position[]>(mockPositions);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    level: 1,
    category: 'management' as Position['category'],
    description: '',
    applicableCompanies: ['all'] as string[],
  });

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      level: 1,
      category: 'management' as Position['category'],
      description: '',
      applicableCompanies: ['all'],
    });
    setEditingPosition(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (position: Position) => {
    setEditingPosition(position);
    setFormData({
      code: position.code,
      name: position.name,
      level: position.level,
      category: position.category,
      description: position.description,
      applicableCompanies: position.applicableCompanies,
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (editingPosition) {
      // Update existing
      setPositions((prev) =>
        prev.map((pos) =>
          pos.id === editingPosition.id
            ? { ...pos, ...formData }
            : pos
        )
      );
    } else {
      // Add new
      const newPosition: Position = {
        id: `pos-${Date.now()}`,
        ...formData,
      };
      setPositions((prev) => [...prev, newPosition]);
    }
    setIsModalOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa chức vụ này?')) {
      setPositions((prev) => prev.filter((pos) => pos.id !== id));
    }
  };

  const getCompanyName = (companyId: string) => {
    const company = mockCompanies.find((c) => c.id === companyId);
    return company?.shortName || companyId;
  };

  // Table columns
  const columns: Column<Position>[] = [
    {
      key: 'code',
      header: 'Mã chức vụ',
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
      header: 'Tên chức vụ',
      sortable: true,
      render: (value) => (
        <span className="font-semibold text-slate-800">{value}</span>
      ),
    },
    {
      key: 'level',
      header: 'Cấp bậc',
      sortable: true,
      width: '100px',
      render: (value) => (
        <div className="flex items-center gap-2">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
              value <= 2
                ? 'bg-red-500'
                : value <= 4
                ? 'bg-amber-500'
                : 'bg-slate-400'
            }`}
          >
            {value}
          </div>
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Mô tả',
      render: (value) => (
        <span className="text-sm text-slate-600">{value}</span>
      ),
    },
    {
      key: 'applicableCompanies',
      header: 'Áp dụng cho',
      render: (value: string[]) => (
        <div className="flex flex-wrap gap-1">
          {value.map((companyId) => (
            <Badge key={companyId} variant="info" size="sm">
              {getCompanyName(companyId)}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: 'id',
      header: 'Thao tác',
      width: '120px',
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

  return (
    <div>
      <PageHeader
        title="Danh mục Chức vụ"
        subtitle="Quản lý danh mục chức vụ dùng chung trên toàn tập đoàn"
        icon={<Briefcase size={24} />}
        showCompanyFilter={false}
        actions={
          <Button icon={<Plus size={16} />} onClick={openAddModal}>
            Thêm chức vụ mới
          </Button>
        }
      />

      {/* Info Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <Briefcase size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-800">
            ⚡ Khu vực CRUD - Dữ liệu gốc (Master Data)
          </p>
          <p className="text-sm text-amber-600 mt-0.5">
            Các thay đổi tại đây sẽ ảnh hưởng đến toàn bộ hệ thống và tất cả các công ty thành viên.
            Vui lòng cân nhắc trước khi thao tác.
          </p>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={positions}
        keyExtractor={(item) => item.id}
        searchPlaceholder="Tìm kiếm chức vụ..."
        emptyMessage="Chưa có chức vụ nào"
        actions={
          <span className="text-sm text-slate-500">
            Tổng: <span className="font-semibold">{positions.length}</span> chức vụ
          </span>
        }
      />

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/80 xevn-safe-inline py-4 shadow-soft backdrop-blur-md">
              <h2 className="text-lg font-semibold text-slate-800">
                {editingPosition ? 'Chỉnh sửa chức vụ' : 'Thêm chức vụ mới'}
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Mã chức vụ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value.toUpperCase() })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-xevn-accent/20 focus:border-xevn-accent"
                    placeholder="VD: MGR"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Cấp bậc <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.level}
                    onChange={(e) =>
                      setFormData({ ...formData, level: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-xevn-accent/20 focus:border-xevn-accent"
                  >
                    {[1, 2, 3, 4, 5, 6].map((level) => (
                      <option key={level} value={level}>
                        Cấp {level}{' '}
                        {level <= 2 ? '(Lãnh đạo)' : level <= 4 ? '(Quản lý)' : '(Nhân viên)'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tên chức vụ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-xevn-accent/20 focus:border-xevn-accent"
                  placeholder="VD: Quản lý"
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
                  placeholder="Mô tả ngắn về chức vụ..."
                />
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
                disabled={!formData.code || !formData.name}
              >
                {editingPosition ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PositionsSettingsPage;
