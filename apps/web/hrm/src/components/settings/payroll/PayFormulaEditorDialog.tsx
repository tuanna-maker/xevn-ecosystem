// @CODE-MEMORY: Dialog soạn thảo công thức lương với Formula Builder thân thiện.
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const FORMULA_VARIABLES = [
  { label: 'Lương cơ bản theo ngạch', value: 'LUONG_CO_BAN_NGACH' },
  { label: 'Lương hợp đồng (Tổng đài)', value: 'LUONG_HOP_DONG_TD' },
  { label: 'Lương thời gian (Tổng đài)', value: 'LUONG_THOI_GIAN_TD' },
  { label: 'Lương cuộc nghe', value: 'LUONG_CUOC_NGHE' },
  { label: 'Lương lượt chạy (LX Tuyến)', value: 'LUONG_CUOC_LX_TUYEN' },
  { label: 'Lương cứng (LX Tải)', value: 'LUONG_CUNG_LX_TAI' },
  { label: 'Lương trách nhiệm QLPT', value: 'LUONG_QLPT' },
  { label: 'Thưởng doanh thu', value: 'THUONG_DOANH_THU' },
  { label: 'Thưởng chuyên cần', value: 'THUONG_CHUYEN_CAN' },
  { label: 'Thưởng an toàn', value: 'THUONG_AN_TOAN' },
  { label: 'Thưởng Top (Tổng đài)', value: 'THUONG_TOP_TD' },
  { label: 'Thưởng tỷ lệ nhỡ', value: 'THUONG_GOI_NHO' },
  { label: 'Thưởng KPI (LX Tải)', value: 'THUONG_KPI_LX_TC' },
  { label: 'Thưởng Tết', value: 'THUONG_TET' },
  { label: 'Thưởng hiệu suất', value: 'THUONG_HIEU_SUAT' },
  { label: 'Phụ cấp ăn ca CN', value: 'PC_AN_CA_CN' },
  { label: 'Phụ cấp giao hàng', value: 'PC_GIAO_HANG_PP' },
  { label: 'Phụ cấp bốc xếp', value: 'PC_BOC_XEP_TC' },
  { label: 'Phụ cấp điện thoại', value: 'PC_DIEN_THOAI' },
  { label: 'Phụ cấp xăng xe', value: 'PC_XANG_XE' },
  { label: 'Phụ cấp ăn trưa', value: 'PC_AN_TRUA' },
  { label: 'Phụ cấp trách nhiệm', value: 'PC_TRACH_NHIEM' },
  { label: 'Phụ cấp ca đêm', value: 'PC_CA_DEM' },
  { label: 'Khấu trừ BHXH', value: 'KT_BHXH_NLD' },
  { label: 'Khấu trừ thuế TNCN', value: 'KT_THUE_TNCN' },
  { label: 'Khấu trừ tạm ứng', value: 'KT_TAM_UNG' },
  { label: 'Khấu trừ vi phạm', value: 'KT_VI_PHAM' },
  { label: 'Ngày công thực tế', value: 'ACTUAL_DAYS' },
  { label: 'Ngày công chuẩn', value: 'STD_DAYS' },
];

const OPERATORS = ['+', '-', '*', '/', '(', ')'];

export function PayFormulaEditorDialog({ open, onClose, onSave, initialData = null }) {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  
  // expressionTokens holds the UI view of the formula: [{ type: 'var'|'op'|'num', label: '...', value: '...' }]
  const [tokens, setTokens] = useState([]);

  const handleInsertVar = (v) => {
    setTokens([...tokens, { type: 'var', label: `[${v.label}]`, value: v.value }]);
  };

  const handleInsertOp = (op) => {
    setTokens([...tokens, { type: 'op', label: op, value: op }]);
  };

  const handleRemoveLast = () => {
    setTokens(tokens.slice(0, -1));
  };

  const handleSave = () => {
    // Chuyển đổi tokens thành expression cho hệ thống
    const expression = tokens.map(t => t.value).join(' ');
    onSave({
      id: initialData?.id || Date.now().toString(),
      name,
      description,
      expression,
      tokens,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Sửa công thức lương' : 'Thêm công thức lương'}</DialogTitle>
          <DialogDescription>Xây dựng công thức bằng cách click vào các biến và toán tử bên dưới.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tên công thức (Mã hệ thống)</Label>
              <Input 
                placeholder="VD: CONG_THUC_LAI_XE" 
                value={name} 
                onChange={e => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Mô tả / Tên hiển thị</Label>
              <Input 
                placeholder="VD: Lương lái xe tuyến Nam Định" 
                value={description} 
                onChange={e => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2 border rounded-md p-4 bg-gray-50">
            <Label className="text-gray-700">Khung soạn thảo công thức</Label>
            <div className="min-h-[100px] p-3 bg-white border border-gray-200 rounded-md flex flex-wrap gap-2 items-start font-mono text-sm leading-relaxed shadow-inner">
              {tokens.length === 0 ? (
                <span className="text-gray-400 italic">Công thức trống. Click các nút bên dưới để chèn...</span>
              ) : (
                tokens.map((t, idx) => (
                  <span 
                    key={idx} 
                    className={`px-2 py-1 rounded inline-flex items-center justify-center
                      ${t.type === 'var' ? 'bg-blue-100 text-blue-700 font-semibold' : 'bg-gray-200 text-gray-800 font-bold'}`}
                  >
                    {t.label}
                  </span>
                ))
              )}
            </div>
            <div className="flex justify-end mt-2">
              <Button variant="outline" size="sm" onClick={handleRemoveLast} disabled={tokens.length === 0}>
                Xóa phần tử cuối
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setTokens([])} className="text-red-600 ml-2">
                Xóa tất cả
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-2">
              <Label className="text-sm font-semibold text-gray-600">Thành phần lương (Biến số)</Label>
              <div className="flex flex-wrap gap-2 h-48 overflow-y-auto pr-2 content-start">
                {FORMULA_VARIABLES.map(v => (
                  <button 
                    key={v.value}
                    onClick={() => handleInsertVar(v)}
                    className="text-xs bg-white border border-blue-200 text-blue-700 px-3 py-1.5 rounded-full hover:bg-blue-50 transition-colors shadow-sm"
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-600">Toán tử</Label>
              <div className="grid grid-cols-3 gap-2">
                {OPERATORS.map(op => (
                  <button 
                    key={op}
                    onClick={() => handleInsertOp(op)}
                    className="text-sm font-bold bg-gray-100 border border-gray-300 text-gray-800 h-10 rounded hover:bg-gray-200 shadow-sm"
                  >
                    {op}
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button onClick={handleSave} className="bg-blue-600">Lưu công thức</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
