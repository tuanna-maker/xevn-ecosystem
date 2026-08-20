// @CODE-MEMORY: Quản lý Công thức lương (List View chuẩn).
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { PayFormulaEditorDialog } from '@/components/settings/payroll/PayFormulaEditorDialog';

const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-[12px] shadow-sm border border-gray-100 p-6 ${className}`}>
    {children}
  </div>
);

export const PayFormulaSettingsPanel = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFormula, setEditingFormula] = useState(null);

  // Dữ liệu mẫu (mock)
  const [formulas, setFormulas] = useState([
    {
      id: 'F1',
      name: 'CONG_THUC_LAI_XE',
      description: 'Lương Lái xe tải (Cứng + QLPT + Thưởng DT)',
      expression: 'LUONG_CUNG_LX_TAI + LUONG_QLPT + THUONG_DOANH_THU',
      tokens: [
        { type: 'var', label: '[Lương cứng Lái xe]', value: 'LUONG_CUNG_LX_TAI' },
        { type: 'op', label: '+', value: '+' },
        { type: 'var', label: '[Lương trách nhiệm]', value: 'LUONG_QLPT' },
        { type: 'op', label: '+', value: '+' },
        { type: 'var', label: '[Thưởng doanh thu]', value: 'THUONG_DOANH_THU' },
      ],
      updatedAt: '2026-08-20',
    }
  ]);

  const handleOpenNew = () => {
    setEditingFormula(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (f) => {
    setEditingFormula(f);
    setIsDialogOpen(true);
  };

  const handleDelete = (id) => {
    setFormulas(formulas.filter(f => f.id !== id));
    toast.success('Đã xóa công thức.');
  };

  const handleSaveFormula = (newFormula) => {
    const exists = formulas.find(f => f.id === newFormula.id);
    if (exists) {
      setFormulas(formulas.map(f => f.id === newFormula.id ? { ...newFormula, updatedAt: '2026-08-20' } : f));
      toast.success('Cập nhật công thức thành công!');
    } else {
      setFormulas([...formulas, { ...newFormula, updatedAt: '2026-08-20' }]);
      toast.success('Thêm công thức mới thành công!');
    }
  };

  return (
    <Card>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Danh sách Công thức lương</h2>
          <p className="text-sm text-gray-500 mt-1">Quản lý và thiết lập công thức tính toán cho các nhóm lương.</p>
        </div>
        <Button onClick={handleOpenNew} className="bg-blue-600 hover:bg-blue-700 rounded-lg">
          + Thêm công thức
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr className="text-gray-500">
              <th className="px-4 py-3 font-medium">Tên công thức / Mô tả</th>
              <th className="px-4 py-3 font-medium">Biểu thức (Expression)</th>
              <th className="px-4 py-3 font-medium w-32">Cập nhật</th>
              <th className="px-4 py-3 font-medium w-24 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {formulas.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">Chưa có công thức nào.</td>
              </tr>
            ) : (
              formulas.map((f) => (
                <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-gray-900">{f.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{f.description}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1 font-mono text-[10px]">
                      {f.tokens?.map((t, idx) => (
                        <span 
                          key={idx} 
                          className={`px-1.5 py-0.5 rounded ${t.type === 'var' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-gray-100 text-gray-700 font-bold'}`}
                        >
                          {t.label}
                        </span>
                      )) || <span className="text-gray-400">Không có dữ liệu</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{f.updatedAt}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleOpenEdit(f)} className="text-blue-600 hover:text-blue-800 font-medium mr-3">Sửa</button>
                    <button onClick={() => handleDelete(f.id)} className="text-red-600 hover:text-red-800 font-medium">Xóa</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isDialogOpen && (
        <PayFormulaEditorDialog 
          open={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSave={handleSaveFormula}
          initialData={editingFormula}
        />
      )}
    </Card>
  );
};
