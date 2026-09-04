/**
 * @CODE-MEMORY-CHANGE 2026-09-04
 * WorkItem: PO-HRM-ATTENDANCE-COMPONENT-SETTINGS
 * What: Attendance Components & Column Settings Dialog (Thành phần chấm công & Thiết lập Bảng công)
 * Why: Match Payroll setup capability — allow defining attendance components, OT ratios, leave formulas, and custom column toggles
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  SlidersHorizontal,
  Plus,
  CheckCircle2,
  Settings2,
  Clock,
  Briefcase,
  Layers,
  Calculator,
  Trash2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface AttendanceComponentItem {
  id: string;
  code: string;
  name: string;
  category: 'standard' | 'probation' | 'overtime' | 'leave' | 'custom';
  unit: 'ngay' | 'gio' | 'ca';
  formula: string;
  enabled: boolean;
  systemRequired?: boolean;
}

const INITIAL_ATTENDANCE_COMPONENTS: AttendanceComponentItem[] = [
  {
    id: 'att-1',
    code: 'CONG_CHUAN',
    name: 'Ngày công tiêu chuẩn',
    category: 'standard',
    unit: 'ngay',
    formula: '26',
    enabled: true,
    systemRequired: true,
  },
  {
    id: 'att-2',
    code: 'CONG_THUC_TE',
    name: 'Số ngày công thực tế',
    category: 'standard',
    unit: 'ngay',
    formula: 'SUM(GIO_CT + GIO_TV) / 8',
    enabled: true,
    systemRequired: true,
  },
  {
    id: 'att-3',
    code: 'GIO_CHINH_THUC',
    name: 'Số giờ công chính thức',
    category: 'standard',
    unit: 'gio',
    formula: 'SUM(WORK_HOURS WHERE STATUS = CT)',
    enabled: true,
  },
  {
    id: 'att-4',
    code: 'GIO_THU_VIEC',
    name: 'Số giờ công thử việc',
    category: 'probation',
    unit: 'gio',
    formula: 'SUM(WORK_HOURS WHERE STATUS = TV)',
    enabled: true,
  },
  {
    id: 'att-5',
    code: 'OT_150',
    name: 'Giờ làm thêm OT 150%',
    category: 'overtime',
    unit: 'gio',
    formula: 'SUM(OVERTIME_HOURS * 1.5)',
    enabled: true,
  },
  {
    id: 'att-6',
    code: 'OT_200',
    name: 'Giờ làm thêm OT 200% (Ngày nghỉ/Lễ)',
    category: 'overtime',
    unit: 'gio',
    formula: 'SUM(OVERTIME_HOURS * 2.0)',
    enabled: true,
  },
  {
    id: 'att-7',
    code: 'NGAY_PHEP',
    name: 'Số ngày nghỉ phép hưởng lương',
    category: 'leave',
    unit: 'ngay',
    formula: 'SUM(LEAVE_DAYS)',
    enabled: true,
  },
  {
    id: 'att-8',
    code: 'CONG_BUU_CUC',
    name: 'Phân bổ công theo Bưu cục / Vị trí',
    category: 'custom',
    unit: 'gio',
    formula: 'GROUP_BY(MA_VP, MA_BUU_CUC)',
    enabled: true,
  },
];

interface AttendanceSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AttendanceSettingsDialog({ open, onOpenChange }: AttendanceSettingsDialogProps) {
  const { t } = useTranslation();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'components' | 'columns'>('components');
  const [components, setComponents] = useState<AttendanceComponentItem[]>(INITIAL_ATTENDANCE_COMPONENTS);

  // Column settings
  const [showLocationCol, setShowLocationCol] = useState(true);
  const [showProbationSplit, setShowProbationSplit] = useState(true);
  const [showOvertime150, setShowOvertime150] = useState(true);
  const [showLeaveCol, setShowLeaveCol] = useState(true);
  const [showHoursCol, setShowHoursCol] = useState(true);

  // New component dialog state
  const [showAddComponentModal, setShowAddComponentModal] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<'standard' | 'probation' | 'overtime' | 'leave' | 'custom'>('custom');
  const [newUnit, setNewUnit] = useState<'ngay' | 'gio' | 'ca'>('gio');
  const [newFormula, setNewFormula] = useState('');

  const handleAddComponent = () => {
    if (!newCode || !newName) {
      toast({
        title: 'Thiếu thông tin',
        description: 'Vui lòng điền mã và tên thành phần chấm công',
        variant: 'destructive',
      });
      return;
    }

    const item: AttendanceComponentItem = {
      id: `att-${Date.now()}`,
      code: newCode.toUpperCase().replace(/\s+/g, '_'),
      name: newName,
      category: newCategory,
      unit: newUnit,
      formula: newFormula || '0',
      enabled: true,
    };

    setComponents([...components, item]);
    setShowAddComponentModal(false);
    setNewCode('');
    setNewName('');
    setNewFormula('');
    toast({
      title: 'Tạo thành phần mới thành công',
      description: `Đã thêm thành phần ${item.name} (${item.code})`,
    });
  };

  const handleToggleComponent = (id: string) => {
    setComponents(
      components.map((c) => (c.id === id && !c.systemRequired ? { ...c, enabled: !c.enabled } : c))
    );
  };

  const handleSaveSettings = () => {
    toast({
      title: 'Đã lưu cấu hình bảng chấm công',
      description: 'Hệ thống đã cập nhật quy tắc tính công và khai báo cột ma trận.',
    });
    onOpenChange(false);
  };

  const getCategoryBadge = (cat: AttendanceComponentItem['category']) => {
    switch (cat) {
      case 'standard': return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Công chuẩn</Badge>;
      case 'probation': return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Thử việc</Badge>;
      case 'overtime': return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Tăng ca OT</Badge>;
      case 'leave': return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Phép / Lễ</Badge>;
      default: return <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">Khác</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[850px]" data-testid="attendance-settings-dialog">
        <DialogHeader>
          <DialogTitle className="text-[20px] font-bold font-display flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-primary" />
            Thiết lập Thành phần Chấm công & Cấu hình Bảng công
          </DialogTitle>
        </DialogHeader>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 border-b pb-2">
          <Button
            variant={activeTab === 'components' ? 'default' : 'ghost'}
            size="sm"
            className="gap-2"
            onClick={() => setActiveTab('components')}
          >
            <Calculator className="w-4 h-4" />
            Khai báo Thành phần Chấm công ({components.length})
          </Button>
          <Button
            variant={activeTab === 'columns' ? 'default' : 'ghost'}
            size="sm"
            className="gap-2"
            onClick={() => setActiveTab('columns')}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Cấu hình Cột & Công thức Ma trận
          </Button>
        </div>

        {/* TAB 1: KHAI BÁO THÀNH PHẦN CHẤM CÔNG */}
        {activeTab === 'components' && (
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Định nghĩa các chỉ số ngày công, giờ công chính thức, giờ thử việc, OT và phân bổ bưu cục dùng để tính bảng công và chuyển giao dữ liệu sang Bảng lương.
              </p>
              <Button size="sm" className="gap-1.5 bg-primary text-white" onClick={() => setShowAddComponentModal(true)}>
                <Plus className="w-4 h-4" />
                Thêm thành phần mới
              </Button>
            </div>

            <div className="max-h-[380px] overflow-y-auto space-y-2.5 pr-1">
              {components.map((item) => (
                <Card key={item.id} className="p-3 border flex items-center justify-between hover:border-primary/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={item.enabled}
                      disabled={item.systemRequired}
                      onCheckedChange={() => handleToggleComponent(item.id)}
                    />
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">{item.name}</span>
                        <code className="text-[11px] bg-muted px-1.5 py-0.5 rounded font-mono text-muted-foreground">{item.code}</code>
                        {getCategoryBadge(item.category)}
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-2">
                        <span>Đơn vị: <strong className="text-foreground">{item.unit === 'ngay' ? 'Ngày' : item.unit === 'gio' ? 'Giờ' : 'Ca'}</strong></span>
                        <span>•</span>
                        <span>Công thức: <code className="text-primary font-mono text-[11px]">{item.formula}</code></span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.systemRequired ? (
                      <Badge variant="secondary" className="text-[10px]">Hệ thống</Badge>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setComponents(components.filter((c) => c.id !== item.id))}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: CẤU HÌNH CỘT BẢNG CHẤM CÔNG & CÔNG THỨC */}
        {activeTab === 'columns' && (
          <div className="space-y-4 py-2">
            <div className="bg-muted/40 p-3 rounded-lg border space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                Quy tắc tính toán Ngày công Thực tế từ Bảng chấm công
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Số ngày công thực tế của nhân sự được tự động tổng hợp từ dữ liệu chấm công chi tiết 31 ngày (bao gồm các ca làm việc tại Bưu cục, giờ công thử việc, chính thức và giờ tăng ca).
              </p>
              <div className="bg-background p-2 rounded border font-mono text-xs text-emerald-800 font-semibold">
                Ngày công thực tế = (Số giờ công CT + Số giờ công TV + (Số giờ OT * 1.5)) / 8.0
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Cấu hình hiển thị cột trên Ma trận Bảng công</h4>
              <div className="grid grid-cols-2 gap-3">
                <Card className="p-3 border flex items-center gap-3">
                  <Checkbox id="col-loc" checked={showLocationCol} onCheckedChange={(v) => setShowLocationCol(!!v)} />
                  <Label htmlFor="col-loc" className="text-xs font-medium cursor-pointer">
                    Hiển thị Mã Bưu cục / Vị trí phân bổ trên từng ô ca làm việc
                  </Label>
                </Card>

                <Card className="p-3 border flex items-center gap-3">
                  <Checkbox id="col-split" checked={showProbationSplit} onCheckedChange={(v) => setShowProbationSplit(!!v)} />
                  <Label htmlFor="col-split" className="text-xs font-medium cursor-pointer">
                    Tách riêng Công thử việc và Công chính thức
                  </Label>
                </Card>

                <Card className="p-3 border flex items-center gap-3">
                  <Checkbox id="col-ot" checked={showOvertime150} onCheckedChange={(v) => setShowOvertime150(!!v)} />
                  <Label htmlFor="col-ot" className="text-xs font-medium cursor-pointer">
                    Hiển thị Tổng giờ làm thêm OT (150% / 200%)
                  </Label>
                </Card>

                <Card className="p-3 border flex items-center gap-3">
                  <Checkbox id="col-leave" checked={showLeaveCol} onCheckedChange={(v) => setShowLeaveCol(!!v)} />
                  <Label htmlFor="col-leave" className="text-xs font-medium cursor-pointer">
                    Hiển thị Số ngày nghỉ phép hưởng lương
                  </Label>
                </Card>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="border-t pt-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button className="gap-2 bg-primary text-white" onClick={handleSaveSettings}>
            <CheckCircle2 className="w-4 h-4" />
            Lưu cấu hình
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Dialog thêm thành phần chấm công mới */}
      <Dialog open={showAddComponentModal} onOpenChange={setShowAddComponentModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Thêm Thành Phần Chấm Công Mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 text-xs">
            <div className="space-y-1.5">
              <Label htmlFor="comp-code">Mã thành phần *</Label>
              <Input
                id="comp-code"
                placeholder="VD: OT_CA_DEM, CONG_CONG_TAC..."
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="comp-name">Tên thành phần *</Label>
              <Input
                id="comp-name"
                placeholder="VD: Giờ làm ca đêm 130%..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Phân loại</Label>
                <Select value={newCategory} onValueChange={(v: any) => setNewCategory(v)}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Công chuẩn</SelectItem>
                    <SelectItem value="probation">Thử việc</SelectItem>
                    <SelectItem value="overtime">Tăng ca OT</SelectItem>
                    <SelectItem value="leave">Phép / Lễ</SelectItem>
                    <SelectItem value="custom">Tùy chỉnh</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Đơn vị tính</Label>
                <Select value={newUnit} onValueChange={(v: any) => setNewUnit(v)}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ngay">Ngày công</SelectItem>
                    <SelectItem value="gio">Giờ công</SelectItem>
                    <SelectItem value="ca">Ca làm việc</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="comp-formula">Công thức / Quy tắc tính</Label>
              <Input
                id="comp-formula"
                placeholder="VD: SUM(NIGHT_SHIFT_HOURS * 1.3)..."
                value={newFormula}
                onChange={(e) => setNewFormula(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddComponentModal(false)}>Hủy</Button>
            <Button onClick={handleAddComponent}>Tạo thành phần</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
