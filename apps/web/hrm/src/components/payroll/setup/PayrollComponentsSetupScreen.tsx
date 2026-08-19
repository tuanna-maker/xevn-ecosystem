/**
 * @CODE-MEMORY
 * Screen:     HRM Lương → Thiết lập lương → Danh mục thành phần (Wave 8 + Wave 9)
 * UC:         UC-HRM-PAYCAT-01..04
 * SRS:        docs/program/deltas/BA_HRM_PAYROLL_COMPONENT_SRS_01_20260813.md
 * TechSpec:   docs/program/deltas/BA_HRM_PAYROLL_COMPONENT_TECHSPEC_01_20260813.md
 * UI:         docs/hrm/ui-screens/UI-HRM-PAYROLL-COMPONENT-01.md
 * WorkItem:   D-PO-HRM-PAY-COMP-FE-01
 * Coded:      2026-08-13
 */
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Plus, AlertCircle, ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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

export type CategoryType = 'ALL' | 'FIXED_EARNING' | 'VARIABLE_EARNING' | 'ALLOWANCE' | 'BONUS' | 'DEDUCTION';

export type PayrollComponentItem = {
  id: string;
  code: string;
  name: string;
  categoryType: Exclude<CategoryType, 'ALL'>;
  calculationSign: '+' | '-';
  scopeLevel: 'GLOBAL' | 'COMPANY' | 'BRANCH';
  branchName?: string;
  unitType?: string;
  status: 'active' | 'stopped';
};

/** Real sample data derived from 30 customer policy documents */
const SAMPLE_COMPONENTS: PayrollComponentItem[] = [
  { id: 'c1', code: 'SALARY_FIXED_LOAD', name: 'Lương cứng theo tải trọng', categoryType: 'FIXED_EARNING', calculationSign: '+', scopeLevel: 'GLOBAL', unitType: 'Tháng', status: 'active' },
  { id: 'c2', code: 'SALARY_KPI_DISPATCH', name: 'Lương KPI theo ngày công', categoryType: 'VARIABLE_EARNING', calculationSign: '+', scopeLevel: 'GLOBAL', unitType: 'Công', status: 'active' },
  { id: 'c3', code: 'SALARY_CALL_COUNT', name: 'Lương cuộc nghe', categoryType: 'VARIABLE_EARNING', calculationSign: '+', scopeLevel: 'GLOBAL', unitType: 'Cuộc gọi', status: 'active' },
  { id: 'c4', code: 'SALARY_TRIP_RATE', name: 'Lương đơn giá theo lượt', categoryType: 'VARIABLE_EARNING', calculationSign: '+', scopeLevel: 'BRANCH', branchName: 'Chi nhánh Nam Định', unitType: 'Lượt', status: 'active' },
  { id: 'c5', code: 'ALLOWANCE_PHONE', name: 'Phụ cấp điện thoại', categoryType: 'ALLOWANCE', calculationSign: '+', scopeLevel: 'GLOBAL', unitType: 'Tháng', status: 'active' },
  { id: 'c6', code: 'ALLOWANCE_APP_XE', name: 'Phụ cấp hướng dẫn app X.E', categoryType: 'ALLOWANCE', calculationSign: '+', scopeLevel: 'GLOBAL', unitType: 'Khách', status: 'active' },
  { id: 'c7', code: 'ALLOWANCE_AWAY_HOME', name: 'Phụ cấp công tác xa nhà', categoryType: 'ALLOWANCE', calculationSign: '+', scopeLevel: 'COMPANY', unitType: 'Ngày', status: 'active' },
  { id: 'c8', code: 'BONUS_ATTENDANCE', name: 'Thưởng chuyên cần', categoryType: 'BONUS', calculationSign: '+', scopeLevel: 'GLOBAL', unitType: 'Tháng', status: 'active' },
  { id: 'c9', code: 'BONUS_KPI_SCORECARD', name: 'Thưởng KPI kết quả công việc', categoryType: 'BONUS', calculationSign: '+', scopeLevel: 'GLOBAL', unitType: 'Tháng', status: 'active' },
  { id: 'c10', code: 'DEDUCTION_VEHICLE_REPAIR', name: 'Giảm trừ sửa chữa phương tiện', categoryType: 'DEDUCTION', calculationSign: '-', scopeLevel: 'GLOBAL', unitType: 'Lần', status: 'active' },
  { id: 'c11', code: 'DEDUCTION_ADVANCE', name: 'Khấu trừ tạm ứng lương', categoryType: 'DEDUCTION', calculationSign: '-', scopeLevel: 'GLOBAL', unitType: 'Tháng', status: 'active' },
];

export function PayrollComponentsSetupScreen() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<CategoryType>('ALL');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [stopConfirmItem, setStopConfirmItem] = useState<PayrollComponentItem | null>(null);

  // Form State
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<Exclude<CategoryType, 'ALL'>>('ALLOWANCE');
  const [formScope, setFormScope] = useState<'GLOBAL' | 'COMPANY' | 'BRANCH'>('COMPANY');

  const filteredComponents = useMemo(() => {
    return SAMPLE_COMPONENTS.filter((comp) => {
      const matchSearch =
        comp.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comp.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchTab = activeTab === 'ALL' || comp.categoryType === activeTab;
      return matchSearch && matchTab;
    });
  }, [searchTerm, activeTab]);

  const handleCreate = () => {
    if (!formCode || !formName) return;
    setIsAddDialogOpen(false);
    setFormCode('');
    setFormName('');
  };

  const getCategoryLabel = (cat: CategoryType) => {
    switch (cat) {
      case 'FIXED_EARNING': return 'Thu nhập cố định';
      case 'VARIABLE_EARNING': return 'Thu nhập sản lượng';
      case 'ALLOWANCE': return 'Phụ cấp';
      case 'BONUS': return 'Thưởng';
      case 'DEDUCTION': return 'Khấu trừ';
      default: return 'Tất cả';
    }
  };

  return (
    <div className="space-y-4" data-testid="payroll-components-setup-screen">
      {/* Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-card p-4 rounded-lg border">
        <div className="flex items-center gap-2 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Tìm theo mã hoặc tên khoản lương..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
              data-testid="search-component-input"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-cyan-300 bg-cyan-50 text-cyan-900">
            Nguồn: Master + Local Extensions
          </Badge>
          <Button
            type="button"
            size="sm"
            onClick={() => setIsAddDialogOpen(true)}
            data-testid="btn-add-component"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Thêm khoản riêng
          </Button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-1 border-b pb-2">
        {(['ALL', 'FIXED_EARNING', 'VARIABLE_EARNING', 'ALLOWANCE', 'BONUS', 'DEDUCTION'] as CategoryType[]).map(
          (cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveTab(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === cat
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
              data-testid={`tab-cat-${cat}`}
            >
              {getCategoryLabel(cat)}
            </button>
          ),
        )}
      </div>

      {/* Main Table View */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left" data-testid="payroll-components-table">
              <thead className="text-xs uppercase bg-muted text-muted-foreground border-b">
                <tr>
                  <th className="px-4 py-3">Mã khoản</th>
                  <th className="px-4 py-3">Tên hiển thị</th>
                  <th className="px-4 py-3">Nhóm</th>
                  <th className="px-4 py-3 text-center">Dấu</th>
                  <th className="px-4 py-3">Phạm vi</th>
                  <th className="px-4 py-3">Đơn vị</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredComponents.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 font-mono font-medium">{item.code}</td>
                    <td className="px-4 py-3 font-medium text-foreground">{item.name}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-xs font-normal">
                        {getCategoryLabel(item.categoryType)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center font-bold font-mono">
                      <span className={item.calculationSign === '+' ? 'text-emerald-600' : 'text-rose-600'}>
                        {item.calculationSign}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {item.scopeLevel === 'GLOBAL' && (
                        <Badge className="bg-sky-100 text-sky-800 border-sky-300">Toàn Tập đoàn</Badge>
                      )}
                      {item.scopeLevel === 'COMPANY' && (
                        <Badge className="bg-purple-100 text-purple-800 border-purple-300">Công ty thành viên</Badge>
                      )}
                      {item.scopeLevel === 'BRANCH' && (
                        <Badge className="bg-amber-100 text-amber-800 border-amber-300">
                          {item.branchName || 'Chi nhánh'}
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{item.unitType || '-'}</td>
                    <td className="px-4 py-3">
                      {item.status === 'active' ? (
                        <span className="inline-flex items-center text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="mr-1 h-3 w-3" /> Đang áp dụng
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-300">
                          <XCircle className="mr-1 h-3 w-3" /> Đã ngừng
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {item.scopeLevel !== 'GLOBAL' && item.status === 'active' && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                          onClick={() => setStopConfirmItem(item)}
                          data-testid={`btn-stop-${item.id}`}
                        >
                          Ngừng dùng
                        </Button>
                      )}
                      {item.scopeLevel === 'GLOBAL' && (
                        <span className="text-xs text-muted-foreground italic">Read-only</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog Add Local Component */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Thêm Thành phần Lương Cục bộ</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Mã khoản (Unique)</label>
              <Input
                placeholder="VD: ALLOWANCE_PHONE_NAM_DINH"
                value={formCode}
                onChange={(e) => setFormCode(e.target.value)}
                className="font-mono text-sm mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Tên hiển thị</label>
              <Input
                placeholder="VD: Phụ cấp điện thoại Chi nhánh Nam Định"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="text-sm mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Nhóm thành phần</label>
              <Select
                value={formCategory}
                onValueChange={(val) => setFormCategory(val as Exclude<CategoryType, 'ALL'>)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FIXED_EARNING">Thu nhập cố định (+)</SelectItem>
                  <SelectItem value="VARIABLE_EARNING">Thu nhập sản lượng (+)</SelectItem>
                  <SelectItem value="ALLOWANCE">Phụ cấp (+)</SelectItem>
                  <SelectItem value="BONUS">Thưởng (+)</SelectItem>
                  <SelectItem value="DEDUCTION">Khấu trừ (-)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Phạm vi áp dụng</label>
              <Select
                value={formScope}
                onValueChange={(val) => setFormScope(val as 'GLOBAL' | 'COMPANY' | 'BRANCH')}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="COMPANY">Toàn Công ty thành viên</SelectItem>
                  <SelectItem value="BRANCH">Chi nhánh cụ thể</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Hủy
            </Button>
            <Button type="button" onClick={handleCreate} data-testid="btn-save-component">
              Lưu thành phần
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Confirm Soft-Stop */}
      <Dialog open={!!stopConfirmItem} onOpenChange={() => setStopConfirmItem(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-amber-600">
              <ShieldAlert className="mr-2 h-5 w-5" /> Ngừng sử dụng Thành phần Lương
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <p className="text-sm">
              Bạn có chắc chắn muốn ngừng sử dụng khoản{' '}
              <strong className="font-mono">{stopConfirmItem?.code}</strong> ({stopConfirmItem?.name})?
            </p>
            <div className="p-3 bg-amber-50 rounded-md border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                Khoản lương sẽ chuyển sang trạng thái <strong>Đã ngừng</strong>. Dữ liệu bảng lương lịch sử vẫn giữ nguyên không bị ảnh hưởng.
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setStopConfirmItem(null)}>
              Quay lại
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => setStopConfirmItem(null)}
              data-testid="btn-confirm-stop"
            >
              Xác nhận Ngừng dùng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
