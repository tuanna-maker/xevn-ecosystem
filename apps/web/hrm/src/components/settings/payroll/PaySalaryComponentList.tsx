// @CODE-MEMORY: Danh sách Thành phần Lương. Có form thêm/sửa component theo đúng yêu cầu Apple-style.
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-[12px] shadow-sm border border-gray-100 p-6 ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, color = 'gray' }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    gray: 'bg-gray-50 text-gray-700 border-gray-200',
  };
  return (
    <span className={`px-2.5 py-1 text-xs font-medium border rounded-full ${colors[color] || colors.gray}`}>
      {children}
    </span>
  );
};

export const PaySalaryComponentList = () => {
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  const [formData, setFormData] = useState({
    code: '',
    name_vi: '',
    component_type: 'BASIC',
    is_taxable: false,
    in_bhxh_base: false,
  });

  useEffect(() => {
    fetchComponents();
  }, []);

  const fetchComponents = () => {
    setLoading(true);
    // Simulate API fetch (in real app, call GET /api/hrm/payroll-config/components)
    setTimeout(() => {
      setComponents([
        {
          id: '1', code: 'LUONG_CO_BAN_NGACH', name_vi: 'Lương cơ bản ngạch bậc',
          component_type: 'BASIC', taxable_badge: 'Có tính thuế', bhxh_badge: 'Tính BHXH',
          is_taxable: true, in_bhxh_base: true
        },
        {
          id: '2', code: 'PHU_CAP_DIEN_THOAI', name_vi: 'Phụ cấp điện thoại',
          component_type: 'ALLOWANCE', taxable_badge: 'Không tính thuế', bhxh_badge: 'Không tính BHXH',
          is_taxable: false, in_bhxh_base: false
        }
      ]);
      setLoading(false);
    }, 500);
  };

  const handleOpenDialog = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        code: item.code,
        name_vi: item.name_vi,
        component_type: item.component_type,
        is_taxable: item.is_taxable,
        in_bhxh_base: item.in_bhxh_base,
      });
    } else {
      setEditingItem(null);
      setFormData({
        code: '',
        name_vi: '',
        component_type: 'BASIC',
        is_taxable: false,
        in_bhxh_base: false,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.code || !formData.name_vi) {
      toast.error('Vui lòng nhập đầy đủ mã và tên thành phần.');
      return;
    }

    // Simulate API POST/PUT
    const newItem = {
      id: editingItem ? editingItem.id : Math.random().toString(),
      ...formData,
      taxable_badge: formData.is_taxable ? 'Có tính thuế' : 'Không tính thuế',
      bhxh_badge: formData.in_bhxh_base ? 'Tính BHXH' : 'Không tính BHXH'
    };

    if (editingItem) {
      setComponents(prev => prev.map(c => c.id === editingItem.id ? newItem : c));
      toast.success('Cập nhật thành phần lương thành công!');
    } else {
      setComponents(prev => [newItem, ...prev]);
      toast.success('Thêm thành phần lương thành công!');
    }
    setIsDialogOpen(false);
  };

  return (
    <Card>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Danh mục Thành phần lương</h2>
          <p className="text-sm text-gray-500 mt-1">Quản lý các loại tiền lương, phụ cấp, khấu trừ dùng trong công thức.</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-blue-600 hover:bg-blue-700 rounded-[12px] shadow-sm">
          + Thêm thành phần
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-gray-500">
              <th className="pb-3 font-medium">Mã</th>
              <th className="pb-3 font-medium">Tên hiển thị</th>
              <th className="pb-3 font-medium">Loại</th>
              <th className="pb-3 font-medium">Tính thuế TNCN</th>
              <th className="pb-3 font-medium">Đóng BHXH</th>
              <th className="pb-3 font-medium text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={6} className="py-8 text-center text-gray-500">Đang tải...</td></tr>
            ) : components.map(c => (
              <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="py-4 font-medium text-gray-900">{c.code}</td>
                <td className="py-4">{c.name_vi}</td>
                <td className="py-4">{c.component_type}</td>
                <td className="py-4">
                  <Badge color={c.is_taxable ? 'blue' : 'gray'}>{c.taxable_badge}</Badge>
                </td>
                <td className="py-4">
                  <Badge color={c.in_bhxh_base ? 'green' : 'gray'}>{c.bhxh_badge}</Badge>
                </td>
                <td className="py-4 text-right">
                  <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(c)} className="text-blue-600 hover:text-blue-800 font-medium">
                    Sửa
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-[16px]">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Sửa thành phần lương' : 'Thêm mới thành phần lương'}</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="code" className="text-sm font-medium">Mã thành phần <span className="text-red-500">*</span></Label>
                <Input 
                  id="code" 
                  value={formData.code} 
                  onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  placeholder="VD: PHU_CAP_XANG"
                  disabled={!!editingItem} // Không cho sửa mã
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="name_vi" className="text-sm font-medium">Tên hiển thị <span className="text-red-500">*</span></Label>
                <Input 
                  id="name_vi" 
                  value={formData.name_vi} 
                  onChange={(e) => setFormData({...formData, name_vi: e.target.value})}
                  placeholder="VD: Phụ cấp xăng xe"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium">Loại thành phần <span className="text-red-500">*</span></Label>
              <Select value={formData.component_type} onValueChange={(val) => setFormData({...formData, component_type: val})}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại thành phần" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BASIC">Lương cơ bản</SelectItem>
                  <SelectItem value="ALLOWANCE">Phụ cấp</SelectItem>
                  <SelectItem value="DEDUCTION">Khấu trừ</SelectItem>
                  <SelectItem value="BONUS">Thưởng</SelectItem>
                  <SelectItem value="OTHER">Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-4 mt-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="is_taxable" 
                  checked={formData.is_taxable}
                  onCheckedChange={(checked) => setFormData({...formData, is_taxable: checked})}
                />
                <label htmlFor="is_taxable" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Thành phần có tính Thuế TNCN (Taxable)
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="in_bhxh_base" 
                  checked={formData.in_bhxh_base}
                  onCheckedChange={(checked) => setFormData({...formData, in_bhxh_base: checked})}
                />
                <label htmlFor="in_bhxh_base" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Thành phần dùng làm căn cứ đóng BHXH
                </label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-lg">
              Hủy
            </Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 rounded-lg">
              {editingItem ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
