/**
 * @CODE-MEMORY-CHANGE 2026-09-04
 * WorkItem: PO-HRM-ATTENDANCE-TEMPLATE-SETTINGS-PANEL
 * What: Full Attendance Sheet Template & Column Configuration Panel (Mẫu Bảng Chấm Công & Cấu hình Cột Nghiệp vụ)
 * Why: Match Payroll setup capability (PaySheetTemplateSettingsPanel parity) for attendance templates & column formulas
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Plus,
  Save,
  Trash2,
  LayoutTemplate,
  CheckCircle2,
  Settings2,
  Calculator,
  SlidersHorizontal,
  Clock,
  Layers,
  Copy,
  Pencil,
  Eye,
  FileSpreadsheet,
} from 'lucide-react';

import { SettingsCatalogScreenShell } from '@/components/settings/SettingsCatalogScreenShell';
import { SettingsCatalogRowActions } from '@/components/settings/SettingsCatalogRowActions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export interface AttSheetTemplateRecord {
  id: string;
  code: string;
  name: string;
  applicability: 'all' | 'department' | 'position';
  department_name?: string;
  attendance_type: 'daily' | 'hourly' | 'shift';
  standard_work_days: number;
  status: 'active' | 'archived';
  lines: {
    id: string;
    code: string;
    name: string;
    column_type: 'system' | 'work_day' | 'overtime' | 'leave' | 'formula';
    formula?: string;
    enabled: boolean;
  }[];
}

const INITIAL_ATT_TEMPLATES: AttSheetTemplateRecord[] = [
  {
    id: 'tpl-att-1',
    code: 'TPL_ATT_DPHH',
    name: 'Mẫu Bảng Chấm Công — Phòng Điều Phối Hàng Hóa',
    applicability: 'department',
    department_name: 'Phòng Điều Phối Hàng Hóa',
    attendance_type: 'shift',
    standard_work_days: 26,
    status: 'active',
    lines: [
      { id: 'l1', code: 'EMP_CODE', name: 'Mã nhân viên', column_type: 'system', enabled: true },
      { id: 'l2', code: 'EMP_NAME', name: 'Họ và tên', column_type: 'system', enabled: true },
      { id: 'l3', code: 'BUU_CUC', name: 'Mã Bưu cục / Vị trí ca', column_type: 'work_day', enabled: true },
      { id: 'l4', code: 'DAILY_1_31', name: 'Các ngày trong tháng (1..31)', column_type: 'work_day', enabled: true },
      { id: 'l5', code: 'GIO_CT', name: 'Giờ công chính thức', column_type: 'work_day', formula: 'SUM(WORK_HOURS_CT)', enabled: true },
      { id: 'l6', code: 'GIO_TV', name: 'Giờ công thử việc', column_type: 'work_day', formula: 'SUM(WORK_HOURS_TV)', enabled: true },
      { id: 'l7', code: 'OT_150', name: 'Giờ làm thêm OT 150%', column_type: 'overtime', formula: 'SUM(OT_150_HOURS)', enabled: true },
      { id: 'l8', code: 'NGAY_PHEP', name: 'Số ngày nghỉ phép hưởng lương', column_type: 'leave', formula: 'SUM(LEAVE_DAYS)', enabled: true },
      { id: 'l9', code: 'CONG_THUC_TE', name: 'Tổng ngày công thực tế', column_type: 'formula', formula: '(GIO_CT + GIO_TV + OT_150*1.5) / 8.0', enabled: true },
    ],
  },
  {
    id: 'tpl-att-2',
    code: 'TPL_ATT_ADMIN',
    name: 'Mẫu Bảng Chấm Công — Khối Văn Phòng Hành Chính',
    applicability: 'all',
    attendance_type: 'daily',
    standard_work_days: 26,
    status: 'active',
    lines: [
      { id: 'la1', code: 'EMP_CODE', name: 'Mã nhân viên', column_type: 'system', enabled: true },
      { id: 'la2', code: 'EMP_NAME', name: 'Họ và tên', column_type: 'system', enabled: true },
      { id: 'la3', code: 'DAILY_1_31', name: 'Các ngày trong tháng (1..31)', column_type: 'work_day', enabled: true },
      { id: 'la4', code: 'CONG_THUC_TE', name: 'Tổng ngày công thực tế', column_type: 'formula', formula: 'SUM(PRESENT_DAYS)', enabled: true },
      { id: 'la5', code: 'NGAY_PHEP', name: 'Số ngày nghỉ phép', column_type: 'leave', enabled: true },
    ],
  },
];

export function AttSheetTemplateSettingsPanel() {
  const { t } = useTranslation();
  const { toast } = useToast();

  const [templates, setTemplates] = useState<AttSheetTemplateRecord[]>(INITIAL_ATT_TEMPLATES);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTemplate, setEditingTemplate] = useState<AttSheetTemplateRecord | null>(null);
  const [showEditorDialog, setShowEditorDialog] = useState(false);

  // Form state for creating/editing template
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formApplicability, setFormApplicability] = useState<'all' | 'department' | 'position'>('department');
  const [formDeptName, setFormDeptName] = useState('Phòng Điều Phối Hàng Hóa');
  const [formAttendanceType, setFormAttendanceType] = useState<'daily' | 'hourly' | 'shift'>('shift');
  const [formStandardDays, setFormStandardDays] = useState(26);
  const [formLines, setFormLines] = useState<AttSheetTemplateRecord['lines']>([]);

  const filteredTemplates = templates.filter(
    (tpl) =>
      tpl.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openCreateDialog = () => {
    setEditingTemplate(null);
    setFormCode(`TPL_ATT_${Date.now().toString().slice(-4)}`);
    setFormName('Mẫu Bảng Chấm Công Mới');
    setFormApplicability('department');
    setFormDeptName('Phòng Điều Phối Hàng Hóa');
    setFormAttendanceType('shift');
    setFormStandardDays(26);
    setFormLines(INITIAL_ATT_TEMPLATES[0].lines);
    setShowEditorDialog(true);
  };

  const openEditDialog = (tpl: AttSheetTemplateRecord) => {
    setEditingTemplate(tpl);
    setFormCode(tpl.code);
    setFormName(tpl.name);
    setFormApplicability(tpl.applicability);
    setFormDeptName(tpl.department_name || 'Tất cả');
    setFormAttendanceType(tpl.attendance_type);
    setFormStandardDays(tpl.standard_work_days);
    setFormLines(tpl.lines);
    setShowEditorDialog(true);
  };

  const handleSaveTemplate = () => {
    if (!formCode || !formName) {
      toast({
        title: 'Thiếu thông tin',
        description: 'Vui lòng nhập Mã mẫu và Tên mẫu bảng chấm công',
        variant: 'destructive',
      });
      return;
    }

    const updatedRecord: AttSheetTemplateRecord = {
      id: editingTemplate ? editingTemplate.id : `tpl-att-${Date.now()}`,
      code: formCode.toUpperCase().replace(/\s+/g, '_'),
      name: formName,
      applicability: formApplicability,
      department_name: formDeptName,
      attendance_type: formAttendanceType,
      standard_work_days: formStandardDays,
      status: 'active',
      lines: formLines,
    };

    if (editingTemplate) {
      setTemplates(templates.map((t) => (t.id === editingTemplate.id ? updatedRecord : t)));
    } else {
      setTemplates([...templates, updatedRecord]);
    }

    setShowEditorDialog(false);
    toast({
      title: 'Lưu mẫu bảng chấm công thành công',
      description: `Đã cập nhật cấu hình mẫu ${updatedRecord.name}`,
    });
  };

  const handleToggleLine = (lineId: string) => {
    setFormLines(
      formLines.map((l) => (l.id === lineId && l.column_type !== 'system' ? { ...l, enabled: !l.enabled } : l))
    );
  };

  return (
    <SettingsCatalogScreenShell
      title="Cấu hình Mẫu Bảng Chấm Công"
      description="Quản lý và định nghĩa danh mục mẫu bảng công, khai báo cấu hình các cột ma trận, thành phần công và quy tắc tính công tự động."
      searchPlaceholder="Tìm kiếm mẫu bảng công theo mã hoặc tên..."
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      createButtonText="Tạo mẫu bảng công mới"
      onCreateClick={openCreateDialog}
      testId="att-sheet-template-panel"
    >
      <Card className="overflow-hidden border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-16 text-center">#</TableHead>
              <TableHead className="w-44 font-semibold">Mã mẫu</TableHead>
              <TableHead className="font-semibold">Tên Mẫu Bảng Chấm Công</TableHead>
              <TableHead className="w-40 font-semibold">Phạm vi áp dụng</TableHead>
              <TableHead className="w-32 font-semibold">Hình thức</TableHead>
              <TableHead className="w-28 text-center font-semibold">Công chuẩn</TableHead>
              <TableHead className="w-28 text-center font-semibold">Số cột</TableHead>
              <TableHead className="w-28 text-center font-semibold">Trạng thái</TableHead>
              <TableHead className="w-24 text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTemplates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  Chưa có mẫu bảng chấm công nào. Nhấn "Tạo mẫu bảng công mới" để khởi tạo.
                </TableCell>
              </TableRow>
            ) : (
              filteredTemplates.map((tpl, index) => (
                <TableRow key={tpl.id} className="hover:bg-muted/30 cursor-pointer" onClick={() => openEditDialog(tpl)}>
                  <TableCell className="text-center text-muted-foreground font-medium">{index + 1}</TableCell>
                  <TableCell className="font-mono font-semibold text-primary">{tpl.code}</TableCell>
                  <TableCell className="font-medium text-foreground">{tpl.name}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {tpl.applicability === 'department' ? (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {tpl.department_name || 'Phòng ban'}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-slate-50 text-slate-700">Tất cả nhân sự</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-xs font-medium">
                    {tpl.attendance_type === 'shift' ? 'Theo ca / Bưu cục' : 'Theo ngày hành chính'}
                  </TableCell>
                  <TableCell className="text-center font-bold">{tpl.standard_work_days} ngày</TableCell>
                  <TableCell className="text-center font-mono text-xs">{tpl.lines.filter((l) => l.enabled).length} cột</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                      Hoạt động
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <SettingsCatalogRowActions
                      onEdit={() => openEditDialog(tpl)}
                      onArchive={() => {
                        setTemplates(templates.filter((t) => t.id !== tpl.id));
                        toast({ title: 'Đã lưu trữ mẫu bảng công' });
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Editor Dialog Mẫu Bảng Công */}
      <Dialog open={showEditorDialog} onOpenChange={setShowEditorDialog}>
        <DialogContent className="sm:max-w-[900px]">
          <DialogHeader>
            <DialogTitle className="text-[20px] font-bold font-display flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-primary" />
              {editingTemplate ? 'Chỉnh Sửa Mẫu Bảng Chấm Công' : 'Tạo Mẫu Bảng Chấm Công Mới'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Header info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="tpl-code">Mã mẫu bảng công *</Label>
                <Input
                  id="tpl-code"
                  placeholder="VD: TPL_ATT_DPHH"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tpl-name">Tên mẫu bảng công *</Label>
                <Input
                  id="tpl-name"
                  placeholder="VD: Mẫu Bảng Chấm Công Phòng Điều Phối Hàng Hóa"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Phạm vi áp dụng</Label>
                <Select value={formApplicability} onValueChange={(v: any) => setFormApplicability(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả nhân sự</SelectItem>
                    <SelectItem value="department">Theo Phòng ban / Đơn vị</SelectItem>
                    <SelectItem value="position">Theo Vị trí chức danh</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Tên Đơn vị / Phòng ban</Label>
                <Input value={formDeptName} onChange={(e) => setFormDeptName(e.target.value)} />
              </div>

              <div className="space-y-1.5">
                <Label>Ngày công tiêu chuẩn / tháng</Label>
                <Input type="number" value={formStandardDays} onChange={(e) => setFormStandardDays(Number(e.target.value))} />
              </div>
            </div>

            {/* Column & Line Configuration Table */}
            <div className="space-y-2 border-t pt-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-primary" />
                  Khai báo Các Cột Ma trận Bảng Chấm Công
                </h4>
                <span className="text-xs text-muted-foreground">Tích chọn các cột thành phần sẽ xuất hiện trên bảng công</span>
              </div>

              <Card className="max-h-[300px] overflow-y-auto border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="w-12 text-center">Bật</TableHead>
                      <TableHead className="w-36 font-semibold">Mã cột</TableHead>
                      <TableHead className="font-semibold">Tên cột hiển thị</TableHead>
                      <TableHead className="w-28 font-semibold">Phân loại</TableHead>
                      <TableHead className="font-semibold">Công thức / Quy tắc tính</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formLines.map((line) => (
                      <TableRow key={line.id}>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={line.enabled}
                            disabled={line.column_type === 'system'}
                            onCheckedChange={() => handleToggleLine(line.id)}
                          />
                        </TableCell>
                        <TableCell className="font-mono text-xs font-semibold text-primary">{line.code}</TableCell>
                        <TableCell className="font-medium text-xs">{line.name}</TableCell>
                        <TableCell>
                          {line.column_type === 'system' && <Badge variant="secondary" className="text-[10px]">Hệ thống</Badge>}
                          {line.column_type === 'work_day' && <Badge variant="outline" className="bg-emerald-50 text-emerald-700 text-[10px]">Ca làm</Badge>}
                          {line.column_type === 'overtime' && <Badge variant="outline" className="bg-purple-50 text-purple-700 text-[10px]">Làm thêm</Badge>}
                          {line.column_type === 'leave' && <Badge variant="outline" className="bg-blue-50 text-blue-700 text-[10px]">Nghỉ phép</Badge>}
                          {line.column_type === 'formula' && <Badge variant="outline" className="bg-amber-50 text-amber-700 text-[10px]">Công thức</Badge>}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {line.formula || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </div>
          </div>

          <DialogFooter className="border-t pt-3">
            <Button variant="outline" onClick={() => setShowEditorDialog(false)}>Hủy</Button>
            <Button className="gap-2 bg-primary text-white" onClick={handleSaveTemplate}>
              <CheckCircle2 className="w-4 h-4" />
              Lưu mẫu bảng công
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SettingsCatalogScreenShell>
  );
}
