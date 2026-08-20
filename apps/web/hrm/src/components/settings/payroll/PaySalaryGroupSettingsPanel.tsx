// @CODE-MEMORY: Quản lý Cài đặt Nhóm Lương (Payroll Groups).
// UC-HRM-PAY-GROUP-CFG.
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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
    red: 'bg-red-50 text-red-700 border-red-200',
  };
  return (
    <span className={`px-2.5 py-1 text-xs font-medium border rounded-full ${colors[color] || colors.gray}`}>
      {children}
    </span>
  );
};

export const PaySalaryGroupSettingsPanel = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  const [formData, setFormData] = useState({
    code: '',
    name_vi: '',
    priority: 0,
    match_rule_json: '{}',
    status: 'active',
  });

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = () => {
    setLoading(true);
    // Simulate API fetch to /api/hrm/payroll-groups
    setTimeout(() => {
      setGroups([
        {
          id: '1', 
          code: 'GRP_OFFICE', 
          name_vi: 'Khối Văn Phòng',
          priority: 10,
          match_rule_json: '{"department": "VP"}',
          status: 'active'
        },
        {
          id: '2', 
          code: 'GRP_DRIVER', 
          name_vi: 'Khối Lái Xe',
          priority: 20,
          match_rule_json: '{"position": "DRIVER"}',
          status: 'active'
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
        priority: item.priority,
        match_rule_json: item.match_rule_json,
        status: item.status,
      });
    } else {
      setEditingItem(null);
      setFormData({
        code: '',
        name_vi: '',
        priority: 0,
        match_rule_json: '{\n  "department": "VP"\n}',
        status: 'active',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.code || !formData.name_vi) {
      toast.error('Vui lòng nhập đầy đủ mã và tên nhóm.');
      return;
    }
    
    try {
      JSON.parse(formData.match_rule_json);
    } catch (e) {
      toast.error('Luật matching (JSON) không hợp lệ.');
      return;
    }

    const newItem = {
      id: editingItem ? editingItem.id : Math.random().toString(),
      ...formData
    };

    if (editingItem) {
      setGroups(prev => prev.map(c => c.id === editingItem.id ? newItem : c));
      toast.success('Cập nhật nhóm lương thành công!');
    } else {
      setGroups(prev => [newItem, ...prev]);
      toast.success('Thêm nhóm lương thành công!');
    }
    setIsDialogOpen(false);
  };

  return (
    <Card>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Danh mục Nhóm lương</h2>
          <p className="text-sm text-gray-500 mt-1">Phân luồng nhân sự áp dụng chung công thức (VD: Khối VP, Khối Kho).</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-blue-600 hover:bg-blue-700 rounded-[12px] shadow-sm">
          + Thêm nhóm lương
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-gray-500">
              <th className="pb-3 font-medium">Mã</th>
              <th className="pb-3 font-medium">Tên nhóm</th>
              <th className="pb-3 font-medium">Độ ưu tiên</th>
              <th className="pb-3 font-medium">Luật phân nhóm</th>
              <th className="pb-3 font-medium">Trạng thái</th>
              <th className="pb-3 font-medium text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={6} className="py-8 text-center text-gray-500">Đang tải...</td></tr>
            ) : groups.map(g => (
              <tr key={g.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="py-4 font-medium text-gray-900">{g.code}</td>
                <td className="py-4">{g.name_vi}</td>
                <td className="py-4">{g.priority}</td>
                <td className="py-4"><code className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-600">{g.match_rule_json}</code></td>
                <td className="py-4">
                  <Badge color={g.status === 'active' ? 'green' : 'gray'}>
                    {g.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}
                  </Badge>
                </td>
                <td className="py-4 text-right">
                  <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(g)} className="text-blue-600 hover:text-blue-800 font-medium">
                    Sửa
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-[16px]">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Sửa nhóm lương' : 'Thêm mới nhóm lương'}</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="code" className="text-sm font-medium">Mã nhóm <span className="text-red-500">*</span></Label>
                <Input 
                  id="code" 
                  value={formData.code} 
                  onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  placeholder="VD: GRP_VP"
                  disabled={!!editingItem} 
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="name_vi" className="text-sm font-medium">Tên hiển thị <span className="text-red-500">*</span></Label>
                <Input 
                  id="name_vi" 
                  value={formData.name_vi} 
                  onChange={(e) => setFormData({...formData, name_vi: e.target.value})}
                  placeholder="VD: Khối Văn Phòng"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="priority" className="text-sm font-medium">Độ ưu tiên (Càng lớn ưu tiên càng cao)</Label>
                <Input 
                  id="priority" 
                  type="number"
                  value={formData.priority} 
                  onChange={(e) => setFormData({...formData, priority: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="status" className="text-sm font-medium">Trạng thái</Label>
                <Select value={formData.status} onValueChange={(val) => setFormData({...formData, status: val})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Hoạt động</SelectItem>
                    <SelectItem value="retired">Tạm dừng (Retired)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="match_rule_json" className="text-sm font-medium">Luật phân nhóm (Match Rules JSON)</Label>
              <Textarea 
                id="match_rule_json" 
                value={formData.match_rule_json} 
                onChange={(e) => setFormData({...formData, match_rule_json: e.target.value})}
                placeholder='{"department": "VP", "job_grade": "M1"}'
                className="font-mono text-sm h-32"
              />
              <p className="text-xs text-gray-500">Quy tắc map nhân sự tự động vào nhóm. Viết theo định dạng JSON.</p>
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
