/**
 * @CODE-MEMORY
 * UC: PO-HRM-PAY-SYSTEM-DATA-SPEC-01
 * Business Rule: Màn hình này cấu hình các "System Data" (Dữ liệu hệ thống) có thể được gán 
 * cho các cột bảng lương thay vì nhập tay hoặc dùng công thức.
 * Context Hook: Dùng `useAuth()` từ `@/contexts/AuthContext` để lấy `currentCompanyId`,
 * không dùng `AuthProvider` vì sai spec cấu trúc module HRM.
 */
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listPaySystemData, createPaySystemData, updatePaySystemData, deletePaySystemData, type HrmPaySystemDataRecord } from '@/integrations/hrmApi';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Pencil, Trash2, Loader2, Database, Search } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type CatalogItem = {
  category: 'attendance' | 'cb' | 'gtgc' | 'system_params';
  code: string;
  name: string;
  description: string;
  data_type: 'NUMBER' | 'TEXT' | 'BOOLEAN';
};

const SYSTEM_DATA_CATALOG: CatalogItem[] = [
  // 1. Chấm công
  {
    category: 'attendance',
    code: 'payable_hours',
    name: 'Số giờ công được trả lương',
    description: 'Tổng số giờ làm việc thực tế được tính lương (att_timesheet_line.payable_hours)',
    data_type: 'NUMBER',
  },
  {
    category: 'attendance',
    code: 'standard_hours',
    name: 'Số giờ công tiêu chuẩn',
    description: 'Số giờ làm việc tiêu chuẩn của tháng (att_timesheet_line.standard_hours)',
    data_type: 'NUMBER',
  },
  {
    category: 'attendance',
    code: 'ot_hours_weighted',
    name: 'Số giờ tăng ca quy đổi',
    description: 'Giờ làm thêm giờ đã nhân hệ số (att_timesheet_line.ot_hours_weighted)',
    data_type: 'NUMBER',
  },
  {
    category: 'attendance',
    code: 'paid_leave_hours',
    name: 'Số giờ nghỉ phép hưởng lương',
    description: 'Nghỉ phép năm, nghỉ lễ hưởng lương (att_timesheet_line.paid_leave_hours)',
    data_type: 'NUMBER',
  },
  {
    category: 'attendance',
    code: 'unpaid_leave_hours',
    name: 'Số giờ nghỉ không lương',
    description: 'Nghỉ không lương, nghỉ tự do (att_timesheet_line.unpaid_leave_hours)',
    data_type: 'NUMBER',
  },
  {
    category: 'attendance',
    code: 'work_days',
    name: 'Số ngày công thực tế',
    description: 'Tổng số ngày công đi làm thực tế từ chấm công (att_timesheet_line.work_days)',
    data_type: 'NUMBER',
  },

  // 2. C&B
  {
    category: 'cb',
    code: 'base_salary',
    name: 'Mức lương cơ bản',
    description: 'Lương chính thức/lương thử việc từ Hợp đồng & C&B (employee_compensation_lines)',
    data_type: 'NUMBER',
  },
  {
    category: 'cb',
    code: 'allowance_meal',
    name: 'Phụ cấp ăn trưa',
    description: 'Mức phụ cấp ăn trưa cố định từ gói lương nhân sự',
    data_type: 'NUMBER',
  },
  {
    category: 'cb',
    code: 'allowance_phone',
    name: 'Phụ cấp điện thoại',
    description: 'Mức phụ cấp điện thoại cố định từ gói lương nhân sự',
    data_type: 'NUMBER',
  },
  {
    category: 'cb',
    code: 'allowance_toxic',
    name: 'Phụ cấp độc hại',
    description: 'Mức phụ cấp độc hại/nặng nhọc từ gói lương nhân sự',
    data_type: 'NUMBER',
  },

  // 3. Giảm trừ gia cảnh
  {
    category: 'gtgc',
    code: 'dependents_count',
    name: 'Số người phụ thuộc',
    description: 'Số lượng người phụ thuộc đăng ký giảm trừ gia cảnh thuế TNCN',
    data_type: 'NUMBER',
  },
  {
    category: 'gtgc',
    code: 'gtgc_amount_vnd',
    name: 'Mức giảm trừ gia cảnh',
    description: 'Tổng số tiền được giảm trừ gia cảnh (bản thân + người phụ thuộc)',
    data_type: 'NUMBER',
  },

  // 4. Tham số hệ thống
  {
    category: 'system_params',
    code: 'MINIMUM_WAGE',
    name: 'Lương tối thiểu vùng',
    description: 'Lương tối thiểu vùng áp dụng cho công ty (pay_system_params)',
    data_type: 'NUMBER',
  },
  {
    category: 'system_params',
    code: 'STANDARD_WORK_DAYS',
    name: 'Số ngày công tiêu chuẩn',
    description: 'Số ngày làm việc tiêu chuẩn trong tháng (ví dụ: 26)',
    data_type: 'NUMBER',
  },
  {
    category: 'system_params',
    code: 'STANDARD_WORK_HOURS',
    name: 'Số giờ công tiêu chuẩn ngày',
    description: 'Số giờ làm việc tiêu chuẩn một ngày (ví dụ: 8)',
    data_type: 'NUMBER',
  },
  {
    category: 'system_params',
    code: 'BHXH_BASE',
    name: 'Mức lương cơ sở BHXH',
    description: 'Mức lương cơ sở dùng để tính đóng BHXH tối đa',
    data_type: 'NUMBER',
  },
  {
    category: 'system_params',
    code: 'BHXH_CAP',
    name: 'Trần đóng BHXH',
    description: 'Mức trần đóng BHXH tối đa (ví dụ: 20 lần lương cơ sở)',
    data_type: 'NUMBER',
  },
  {
    category: 'system_params',
    code: 'BHXH_EMP_RATE',
    name: 'Tỷ lệ đóng BHXH của NV',
    description: 'Tỷ lệ người lao động đóng BHXH, BHYT, BHTN (thường là 10.5%)',
    data_type: 'NUMBER',
  },
  {
    category: 'system_params',
    code: 'BHXH_CMP_RATE',
    name: 'Tỷ lệ đóng BHXH của Công ty',
    description: 'Tỷ lệ công ty đóng BHXH, BHYT, BHTN (thường là 17.5%)',
    data_type: 'NUMBER',
  },
  {
    category: 'system_params',
    code: 'TNCN_PERSONAL',
    name: 'Giảm trừ bản thân',
    description: 'Mức giảm trừ thuế TNCN cá nhân (ví dụ: 11,000,000 VND)',
    data_type: 'NUMBER',
  },
  {
    category: 'system_params',
    code: 'TNCN_DEPENDENT',
    name: 'Giảm trừ người phụ thuộc',
    description: 'Mức giảm trừ thuế TNCN mỗi người phụ thuộc (ví dụ: 4,400,000 VND)',
    data_type: 'NUMBER',
  },
];

export function PaySystemDataSettingsPanel() {
  const { currentCompanyId: companyId } = useAuth();
  const queryClient = useQueryClient();

  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<HrmPaySystemDataRecord>>({
    code: '',
    name: '',
    data_type: 'NUMBER',
    description: '',
  });

  const [selectedCategory, setSelectedCategory] = useState<'all' | 'attendance' | 'cb' | 'gtgc' | 'system_params'>('all');
  const [filterSearch, setFilterSearch] = useState('');

  const { data: records = [], isLoading } = useQuery({
    queryKey: ['pay-system-data', companyId],
    queryFn: () => listPaySystemData(companyId!),
    enabled: !!companyId,
  });

  const createMutation = useMutation({
    mutationFn: (data: Parameters<typeof createPaySystemData>[1]) => createPaySystemData(companyId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pay-system-data', companyId] });
      toast.success('Thêm mới thành công');
      setIsOpen(false);
    },
    onError: () => toast.error('Lỗi khi thêm mới'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updatePaySystemData>[2] }) => updatePaySystemData(id, companyId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pay-system-data', companyId] });
      toast.success('Cập nhật thành công');
      setIsOpen(false);
    },
    onError: () => toast.error('Lỗi khi cập nhật'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePaySystemData(id, companyId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pay-system-data', companyId] });
      toast.success('Xóa thành công');
    },
    onError: () => toast.error('Lỗi khi xóa'),
  });

  const handleOpenNew = () => {
    setIsEditing(false);
    setFormData({ code: '', name: '', data_type: 'NUMBER', description: '' });
    setSelectedCategory('all');
    setFilterSearch('');
    setIsOpen(true);
  };

  const handleOpenEdit = (record: HrmPaySystemDataRecord) => {
    setIsEditing(true);
    setFormData(record);
    setSelectedCategory('all');
    setFilterSearch('');
    setIsOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.name) {
      toast.error('Vui lòng nhập đầy đủ thông tin bắt buộc');
      return;
    }
    if (isEditing && formData.id) {
      updateMutation.mutate({
        id: formData.id,
        data: {
          code: formData.code,
          name: formData.name,
          data_type: formData.data_type,
          description: formData.description,
        },
      });
    } else {
      createMutation.mutate({
        code: formData.code,
        name: formData.name,
        data_type: formData.data_type,
        description: formData.description,
      });
    }
  };

  const filteredCatalogItems = useMemo(() => {
    return SYSTEM_DATA_CATALOG.filter((item) => {
      const matchCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const search = filterSearch.toLowerCase();
      const matchSearch =
        item.code.toLowerCase().includes(search) ||
        item.name.toLowerCase().includes(search) ||
        item.description.toLowerCase().includes(search);
      return matchCategory && matchSearch;
    });
  }, [selectedCategory, filterSearch]);

  const handleSelectSuggestion = (item: CatalogItem) => {
    setFormData((prev) => ({
      ...prev,
      code: item.code.toUpperCase(),
      name: item.name,
      data_type: item.data_type,
      description: item.description,
    }));
  };

  if (!companyId) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Dữ liệu hệ thống (System Data)</CardTitle>
        </div>
        <Button onClick={handleOpenNew}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm định nghĩa
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-8 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Đang tải dữ liệu...
          </div>
        ) : (
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-left">
                  <th className="p-3 font-medium">Mã dữ liệu</th>
                  <th className="p-3 font-medium">Tên dữ liệu</th>
                  <th className="p-3 font-medium">Kiểu dữ liệu</th>
                  <th className="p-3 font-medium">Mô tả</th>
                  <th className="p-3 font-medium w-[100px]">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Database className="w-8 h-8 text-muted-foreground/50" />
                        <p>Chưa có định nghĩa dữ liệu hệ thống nào</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  records.map((record) => (
                    <tr key={record.id} className="border-b hover:bg-muted/50">
                      <td className="p-3 font-medium">{record.code}</td>
                      <td className="p-3">{record.name}</td>
                      <td className="p-3">
                        <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs font-medium">
                          {record.data_type}
                        </span>
                      </td>
                      <td className="p-3 text-muted-foreground">{record.description}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(record)}>
                            <Pencil className="w-4 h-4 text-primary" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(record.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
          <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
            <DialogHeader className="p-6 pb-4 border-b">
              <DialogTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" />
                {isEditing ? 'Sửa định nghĩa dữ liệu hệ thống' : 'Thêm mới định nghĩa dữ liệu hệ thống'}
              </DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-0 flex-1 overflow-hidden">
              {/* Form Input - Left side (5/12 cols) */}
              <div className="md:col-span-5 p-6 space-y-4 border-r overflow-y-auto">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Mã dữ liệu (Code) <span className="text-destructive">*</span></Label>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/\s+/g, '_') })}
                    placeholder="VD: TOTAL_WORK_DAYS"
                    className="font-mono text-sm uppercase"
                    required
                  />
                  <p className="text-[10px] text-muted-foreground">Mã định danh hệ thống, viết hoa, không dấu, cách bằng dấu gạch dưới.</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Tên dữ liệu <span className="text-destructive">*</span></Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="VD: Tổng số ngày làm việc"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Kiểu dữ liệu</Label>
                  <Select
                    value={formData.data_type || 'NUMBER'}
                    onValueChange={(val) => setFormData({ ...formData, data_type: val })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NUMBER">Số (NUMBER)</SelectItem>
                      <SelectItem value="TEXT">Văn bản (TEXT)</SelectItem>
                      <SelectItem value="BOOLEAN">Logic (BOOLEAN)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Mô tả</Label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Ghi chú thêm về nguồn gốc dữ liệu..."
                    className="w-full min-h-[80px] text-sm p-2 rounded-md border bg-transparent"
                  />
                </div>
              </div>

              {/* Suggestions Catalog - Right side (7/12 cols) */}
              <div className="md:col-span-7 bg-muted/20 p-6 flex flex-col overflow-hidden h-full">
                <div className="mb-4">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Gợi ý ánh xạ cột dữ liệu DB</h4>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Tìm kiếm cột / tham số hệ thống..."
                      value={filterSearch}
                      onChange={(e) => setFilterSearch(e.target.value)}
                      className="pl-8 text-sm bg-background"
                    />
                  </div>
                </div>

                {/* Filter Categories tabs */}
                <div className="flex flex-wrap gap-1 mb-3">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('all')}
                    className={`px-2.5 py-1 text-xs rounded-full transition-colors ${
                      selectedCategory === 'all'
                        ? 'bg-primary text-primary-foreground font-medium'
                        : 'bg-background hover:bg-muted text-muted-foreground border'
                    }`}
                  >
                    Tất cả
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('attendance')}
                    className={`px-2.5 py-1 text-xs rounded-full transition-colors ${
                      selectedCategory === 'attendance'
                        ? 'bg-primary text-primary-foreground font-medium'
                        : 'bg-background hover:bg-muted text-muted-foreground border'
                    }`}
                  >
                    Chấm công
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('cb')}
                    className={`px-2.5 py-1 text-xs rounded-full transition-colors ${
                      selectedCategory === 'cb'
                        ? 'bg-primary text-primary-foreground font-medium'
                        : 'bg-background hover:bg-muted text-muted-foreground border'
                    }`}
                  >
                    Hợp đồng & C&B
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('gtgc')}
                    className={`px-2.5 py-1 text-xs rounded-full transition-colors ${
                      selectedCategory === 'gtgc'
                        ? 'bg-primary text-primary-foreground font-medium'
                        : 'bg-background hover:bg-muted text-muted-foreground border'
                    }`}
                  >
                    Giảm trừ thuế
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('system_params')}
                    className={`px-2.5 py-1 text-xs rounded-full transition-colors ${
                      selectedCategory === 'system_params'
                        ? 'bg-primary text-primary-foreground font-medium'
                        : 'bg-background hover:bg-muted text-muted-foreground border'
                    }`}
                  >
                    Tham số hệ thống
                  </button>
                </div>

                {/* Scrollable list */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                  {filteredCatalogItems.length === 0 ? (
                    <div className="text-center py-8 text-sm text-muted-foreground bg-background rounded-lg border border-dashed">
                      Không tìm thấy gợi ý nào khớp
                    </div>
                  ) : (
                    filteredCatalogItems.map((item) => {
                      const isSelected = formData.code === item.code;
                      return (
                        <div
                          key={item.code}
                          onClick={() => handleSelectSuggestion(item)}
                          className={`p-3 rounded-lg border transition-all cursor-pointer flex items-start gap-3 ${
                            isSelected
                              ? 'bg-primary/5 border-primary ring-1 ring-primary'
                              : 'bg-background hover:bg-muted/30 border-muted hover:border-muted-foreground/30'
                          }`}
                        >
                          <div className={`p-1.5 rounded-md mt-0.5 ${
                            item.category === 'attendance' ? 'bg-amber-50 text-amber-600' :
                            item.category === 'cb' ? 'bg-sky-50 text-sky-600' :
                            item.category === 'gtgc' ? 'bg-emerald-50 text-emerald-600' :
                            'bg-purple-50 text-purple-600'
                          }`}>
                            <Database className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-mono text-xs font-bold text-foreground truncate">{item.code}</span>
                              <span className="text-[10px] font-medium px-1.5 py-0.5 bg-muted text-muted-foreground rounded">
                                {item.data_type}
                              </span>
                            </div>
                            <h5 className="text-xs font-semibold text-foreground mt-0.5">{item.name}</h5>
                            <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{item.description}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <DialogFooter className="p-6 border-t bg-muted/10">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Lưu lại
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
