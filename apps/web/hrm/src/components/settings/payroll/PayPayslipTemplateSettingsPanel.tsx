// @CODE-MEMORY: Cấu hình Danh mục Mẫu Phiếu Lương (Payslip Template).
// @CODE-MEMORY-CHANGE 2026-08-25: Refactor UI map trực tiếp statusLabel, statusTone (Display-Ready) từ BE.
import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useHrmOperatingUnitFilter } from '@/contexts/HrmOperatingUnitFilterContext';
import { listPaySheetTemplateLines } from '@/integrations/hrmApi';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent
} from '@/components/ui/select';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { usePayslipTemplates, type PayslipTemplate } from '@/hooks/usePayslipTemplates';
import { usePaySheetTemplates } from '@/hooks/usePaySheetTemplates';

const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-[12px] shadow-sm border border-gray-100 p-6 flex flex-col h-[calc(100vh-140px)] ${className}`}>
    {children}
  </div>
);

const emptyForm = (): Partial<PayslipTemplate> => ({
  code: '',
  name: '',
  pay_sheet_template_id: '',
  settings: {
    showLogo: true,
    hideZeroValues: true,
    showCompanyStamp: false,
    footerNote: 'Trân trọng cảm ơn sự đóng góp của anh/chị. Mọi thắc mắc về phiếu lương vui lòng liên hệ phòng Nhân sự qua email hr@xevn.com trong vòng 3 ngày làm việc.',
    layoutType: 'email_modern',
  },
  is_active: true,
});

export const PayPaySlipTemplateSettingsPanel = () => {
  const { templates, isLoading, createTemplate, updateTemplate, deleteTemplate } = usePayslipTemplates();
  const { templates: sheetTemplates } = usePaySheetTemplates();
  const { currentCompanyId } = useAuth();
  const { listCompanyId } = useHrmOperatingUnitFilter();
  const companyId = listCompanyId || currentCompanyId;

  const [selectedSheetLines, setSelectedSheetLines] = useState<any[]>([]);
  const [sheetLinesLoading, setSheetLinesLoading] = useState(false);

  useEffect(() => {
    const loadSheetLines = async () => {
      const templateId = formData.pay_sheet_template_id;
      if (!templateId || !companyId) {
        setSelectedSheetLines([]);
        return;
      }
      setSheetLinesLoading(true);
      try {
        const res = await listPaySheetTemplateLines(templateId, companyId);
        setSelectedSheetLines(res.lines || []);
      } catch (err) {
        console.error('Error loading template lines:', err);
        setSelectedSheetLines([]);
      } finally {
        setSheetLinesLoading(false);
      }
    };
    loadSheetLines();
  }, [formData.pay_sheet_template_id, companyId]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PayslipTemplate | null>(null);
  const [formData, setFormData] = useState<Partial<PayslipTemplate>>(emptyForm());
  const [saving, setSaving] = useState(false);

  const handleOpenDialog = (item: PayslipTemplate | null = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        ...item,
        settings: { ...emptyForm().settings, ...item.settings }
      });
    } else {
      setEditingItem(null);
      setFormData(emptyForm());
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.code || !formData.name) {
      toast.error('Vui lòng nhập Mã và Tên mẫu phiếu lương');
      return;
    }
    setSaving(true);
    let ok = false;
    if (editingItem) {
      ok = await updateTemplate(editingItem.id, formData);
    } else {
      ok = await createTemplate(formData);
    }
    setSaving(false);
    if (ok) {
      setIsDialogOpen(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa mẫu phiếu lương này?')) {
      await deleteTemplate(id);
    }
  };

  return (
    <Card>
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Mẫu Phiếu Lương (Payslip)</h2>
          <p className="text-sm text-gray-500 mt-1">Cấu hình danh sách các mẫu phiếu lương áp dụng cho từng Bảng lương.</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-blue-600 hover:bg-blue-700 rounded-lg">
          <Plus className="w-4 h-4 mr-2" /> Thêm mẫu mới
        </Button>
      </div>

      <div className="border rounded-md flex-1 overflow-y-auto relative">
        <Table>
          <TableHeader className="bg-gray-50 sticky top-0 z-10 shadow-[0_1px_0_0_#e5e7eb]">
            <TableRow>
              <TableHead className="font-medium whitespace-nowrap">Mã mẫu</TableHead>
              <TableHead className="font-medium whitespace-nowrap">Tên hiển thị</TableHead>
              <TableHead className="font-medium whitespace-nowrap">Bảng lương áp dụng</TableHead>
              <TableHead className="font-medium whitespace-nowrap">Kiểu giao diện</TableHead>
              <TableHead className="font-medium whitespace-nowrap text-center">Trạng thái</TableHead>
              <TableHead className="font-medium whitespace-nowrap text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-400">Đang tải dữ liệu...</TableCell>
              </TableRow>
            ) : templates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-400">Chưa có mẫu phiếu lương nào. Bấm "Thêm mẫu mới" để tạo.</TableCell>
              </TableRow>
            ) : (
              templates.map((tpl) => (
                <TableRow key={tpl.id} className="hover:bg-gray-50/50 transition-colors">
                  <TableCell className="font-medium text-gray-900">{tpl.code}</TableCell>
                  <TableCell>{tpl.name}</TableCell>
                  <TableCell className="text-gray-500">
                    {tpl.pay_sheet_template_name || <span className="italic text-gray-400">Chưa map</span>}
                  </TableCell>
                  <TableCell>
                    <span className="px-2.5 py-1 text-xs font-medium border rounded-full bg-blue-50 text-blue-700 border-blue-200">
                      {tpl.settings?.layoutType === 'print_a4' ? 'In A4' : tpl.settings?.layoutType === 'print_a5' ? 'In A5' : 'Hiện đại (Email)'}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${tpl.statusTone === 'success' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {tpl.statusLabel}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(tpl)}>
                      <Edit2 className="w-4 h-4 text-gray-500" />
                    </Button>
                    <Button variant="ghost" size="icon" className="hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(tpl.id)}>
                      <Trash2 className="w-4 h-4 text-gray-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Sửa mẫu phiếu lương' : 'Thêm mẫu phiếu lương'}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 border-b pb-2">Thông tin chung</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Mã mẫu <span className="text-red-500">*</span></Label>
                    <Input 
                      value={formData.code || ''} 
                      onChange={e => setFormData({ ...formData, code: e.target.value })} 
                      disabled={!!editingItem} 
                      placeholder="VD: PAYSLIP-VP" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tên hiển thị <span className="text-red-500">*</span></Label>
                    <Input 
                      value={formData.name || ''} 
                      onChange={e => setFormData({ ...formData, name: e.target.value })} 
                      placeholder="VD: Phiếu lương Văn phòng" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Mẫu bảng lương áp dụng</Label>
                  <Select
                    value={formData.pay_sheet_template_id || ''}
                    onValueChange={(val) => setFormData({ ...formData, pay_sheet_template_id: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn bảng lương map với phiếu này" />
                    </SelectTrigger>
                    <SelectContent>
                      {sheetTemplates?.map(st => (
                        <SelectItem key={st.id} value={st.id}>{st.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.pay_sheet_template_id && (
                  <div className="space-y-2 border p-3 rounded-lg bg-gray-50/50">
                    <Label className="font-semibold block mb-2 text-sm text-gray-700">Các trường hiển thị trên phiếu lương</Label>
                    {sheetLinesLoading ? (
                      <div className="text-xs text-gray-500 py-2 text-center">Đang tải danh sách trường...</div>
                    ) : selectedSheetLines.length === 0 ? (
                      <div className="text-xs text-gray-500 py-2 text-center">Bảng lương chưa có thành phần nào.</div>
                    ) : (
                      <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                        {selectedSheetLines.map((line) => {
                          const isChecked = formData.settings?.visibleFields ? formData.settings.visibleFields.includes(line.componentId) : true;
                          const label = line.displayLabel || line.componentId;
                          return (
                            <div key={line.id} className="flex items-center justify-between py-1.5 border-b last:border-0 border-gray-100">
                              <span className="text-xs font-medium text-gray-600">{label}</span>
                              <Switch
                                checked={isChecked}
                                onCheckedChange={(checked) => {
                                  const currentVisible = formData.settings?.visibleFields ?? selectedSheetLines.map(l => l.componentId);
                                  let nextVisible: string[];
                                  if (checked) {
                                    nextVisible = [...currentVisible, line.componentId];
                                  } else {
                                    nextVisible = currentVisible.filter((id: string) => id !== line.componentId);
                                  }
                                  setFormData({
                                    ...formData,
                                    settings: {
                                      ...formData.settings,
                                      visibleFields: nextVisible,
                                    },
                                  });
                                }}
                              />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 border-b pb-2">Tùy chọn hiển thị</h3>
                
                <div className="flex items-center justify-between">
                  <Label>Hiển thị Logo công ty</Label>
                  <Switch 
                    checked={formData.settings?.showLogo} 
                    onCheckedChange={(c) => setFormData({...formData, settings: {...formData.settings, showLogo: c}})} 
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Ẩn các khoản bằng 0đ</Label>
                  <Switch 
                    checked={formData.settings?.hideZeroValues} 
                    onCheckedChange={(c) => setFormData({...formData, settings: {...formData.settings, hideZeroValues: c}})} 
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Hiển thị con dấu công ty</Label>
                  <Switch 
                    checked={formData.settings?.showCompanyStamp} 
                    onCheckedChange={(c) => setFormData({...formData, settings: {...formData.settings, showCompanyStamp: c}})} 
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 border-b pb-2">Bố cục & Ghi chú</h3>
                <RadioGroup 
                  value={formData.settings?.layoutType || 'email_modern'} 
                  onValueChange={(v: any) => setFormData({...formData, settings: {...formData.settings, layoutType: v}})}
                  className="flex flex-col gap-3"
                >
                  <div className="flex items-center space-x-2 border p-3 rounded-md cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value="email_modern" id="email_modern" />
                    <Label htmlFor="email_modern" className="flex-1 cursor-pointer">Giao diện hiện đại (Web/Email)</Label>
                  </div>
                  <div className="flex items-center space-x-2 border p-3 rounded-md cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value="print_a4" id="print_a4" />
                    <Label htmlFor="print_a4" className="flex-1 cursor-pointer">Giao diện in A4 truyền thống</Label>
                  </div>
                  <div className="flex items-center space-x-2 border p-3 rounded-md cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value="print_a5" id="print_a5" />
                    <Label htmlFor="print_a5" className="flex-1 cursor-pointer">Giao diện in A5 ngang (Mật mã xé)</Label>
                  </div>
                </RadioGroup>

                <div className="space-y-2">
                  <Label>Ghi chú chân trang</Label>
                  <Textarea 
                    value={formData.settings?.footerNote || ''}
                    onChange={(e) => setFormData({...formData, settings: {...formData.settings, footerNote: e.target.value}})}
                    className="h-20 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Live Preview */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 flex flex-col items-center">
              <h3 className="text-sm font-medium text-gray-500 mb-4 self-start">Xem trước (Preview)</h3>
              
              <div className="bg-white w-full max-w-sm rounded-lg shadow-sm border border-gray-200 p-5 scale-90 origin-top pointer-events-none select-none">
                <div className="flex justify-between items-start mb-4 border-b pb-4">
                  {formData.settings?.showLogo ? (
                    <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-xs">
                      XeVN
                    </div>
                  ) : <div />}
                  <div className="text-right">
                    <h4 className="font-bold text-gray-900 text-sm">PHIẾU LƯƠNG</h4>
                    <p className="text-xs text-gray-500">Tháng 08/2026</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs font-semibold">Nguyễn Văn A - Lái xe hạng D</p>
                  <p className="text-xs text-gray-500">Mã NV: EMP-1020</p>
                </div>

                <div className="space-y-2 text-xs w-full">
                  {selectedSheetLines.length > 0 ? (
                    selectedSheetLines
                      .filter((line) => {
                        const isChecked = formData.settings?.visibleFields ? formData.settings.visibleFields.includes(line.componentId) : true;
                        if (!isChecked) return false;
                        
                        if (formData.settings?.hideZeroValues) {
                          const isZero = !line.componentId.includes('base') && 
                                         !line.componentId.includes('luong') && 
                                         !line.componentId.includes('allowance') && 
                                         !line.componentId.includes('phu_cap') && 
                                         !line.componentId.includes('deduct') && 
                                         !line.componentId.includes('bhxh') && 
                                         !line.componentId.includes('thue');
                          if (isZero) return false;
                        }
                        return true;
                      })
                      .map((line) => {
                        const label = line.displayLabel || line.componentId;
                        const isDeduction = line.componentId.includes('deduct') || 
                                            line.componentId.includes('bhxh') || 
                                            line.componentId.includes('thue') || 
                                            line.componentId.includes('phat');
                        let valText = '500,000';
                        let isRed = false;
                        if (line.componentId.includes('base') || line.componentId.includes('luong')) {
                          valText = '10,000,000';
                        } else if (line.componentId.includes('allowance') || line.componentId.includes('phu_cap')) {
                          valText = '2,000,000';
                        } else if (isDeduction) {
                          valText = '-1,200,000';
                          isRed = true;
                        }
                        return (
                          <div key={line.id} className={`flex justify-between ${isRed ? 'text-red-600' : ''}`}>
                            <span className="text-gray-600 text-left pr-2">{label}</span>
                            <span className="font-medium text-right shrink-0">{valText}</span>
                          </div>
                        );
                      })
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Lương cơ bản</span>
                        <span className="font-medium">10,000,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phụ cấp</span>
                        <span className="font-medium">2,000,000</span>
                      </div>
                      {!formData.settings?.hideZeroValues && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Thưởng</span>
                          <span className="font-medium text-gray-400">0</span>
                        </div>
                      )}
                      <div className="flex justify-between text-red-600">
                        <span>Khấu trừ (BHXH, Thuế)</span>
                        <span>-1,200,000</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t flex justify-between items-center">
                  <span className="font-bold text-sm text-gray-900">THỰC LĨNH</span>
                  <span className="font-bold text-lg text-blue-600">10,800,000</span>
                </div>

                <div className="mt-6 text-[10px] text-gray-400 italic text-center leading-relaxed">
                  {formData.settings?.footerNote}
                </div>

                {formData.settings?.showCompanyStamp && (
                  <div className="mt-4 flex justify-end">
                    <div className="w-16 h-16 border-2 border-red-500 text-red-500 rounded-full flex items-center justify-center text-[8px] font-bold rotate-[-15deg] opacity-70">
                      XeVN STAMP
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white">
              {saving ? 'Đang lưu...' : 'Lưu mẫu'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
