import { useState, useEffect } from 'react';
import { useDepartments } from '@/hooks/useDepartments';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  MoreHorizontal,
  Users,
  DollarSign,
  CheckCircle2,
  Lock,
  Eye,
  ArrowLeft,
  Download,
  Printer,
  FileSpreadsheet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { usePayrollBatches, PayrollBatch, PayrollRecord } from '@/hooks/usePayrollBatches';
import { useEmployees } from '@/hooks/useEmployees';
import { useSalaryTemplates } from '@/hooks/useSalaryTemplates';
import { toast } from 'sonner';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('vi-VN');
};

const currentMonth = new Date().getMonth() + 1;
const currentYear = new Date().getFullYear();

export function PayrollBatchesTab() {
  const { t } = useTranslation();
  const { departments } = useDepartments();
  const [periodMonth, setPeriodMonth] = useState(currentMonth);
  const [periodYear, setPeriodYear] = useState(currentYear);

  const {
    batches,
    isLoading,
    fetchBatchRecords,
    createBatch,
    updateBatch,
    deleteBatch,
    lockBatch,
    addRecord,
    updateRecord,
    deleteRecord,
    isCreating,
  } = usePayrollBatches({ periodMonth, periodYear });

  const { employees } = useEmployees();
  const { templates } = useSalaryTemplates();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedBatches, setSelectedBatches] = useState<string[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<PayrollBatch | null>(null);
  const [batchRecords, setBatchRecords] = useState<PayrollRecord[]>([]);
  
  // Dialog states
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAddEmployeeDialog, setShowAddEmployeeDialog] = useState(false);
  const [showLockDialog, setShowLockDialog] = useState(false);
  const [batchToDelete, setBatchToDelete] = useState<PayrollBatch | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    salary_period: `Tháng ${currentMonth}/${currentYear}`,
    period_month: currentMonth,
    period_year: currentYear,
    department: '',
    position: '',
    template_id: '',
  });

  // Add employee state
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
  const [selectedEmployeesToAdd, setSelectedEmployeesToAdd] = useState<string[]>([]);

  // Load records when viewing batch detail
  useEffect(() => {
    if (selectedBatch) {
      fetchBatchRecords(selectedBatch.id).then(setBatchRecords);
    }
  }, [selectedBatch]);

  const filteredBatches = batches.filter(batch => {
    const matchesSearch = batch.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || batch.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredEmployeesToAdd = employees.filter(emp => {
    const matchesSearch = emp.full_name.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
      emp.employee_code.toLowerCase().includes(employeeSearchTerm.toLowerCase());
    const alreadyAdded = batchRecords.some(r => r.employee_id === emp.id);
    return matchesSearch && !alreadyAdded && emp.status === 'active';
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-success/10 text-success hover:bg-success/20">Đã thanh toán</Badge>;
      case 'locked':
        return <Badge className="bg-purple-500/10 text-purple-600 hover:bg-purple-500/20">Đã khóa</Badge>;
      case 'approved':
        return <Badge className="bg-primary/10 text-primary hover:bg-primary/20">Đã duyệt</Badge>;
      case 'pending':
        return <Badge className="bg-warning/10 text-warning hover:bg-warning/20">{t('common.status.pending')}</Badge>;
      case 'draft':
        return <Badge variant="secondary">{t('bonus.draft')}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleCreateBatch = async () => {
    if (!formData.name || !formData.salary_period) {
      toast.error(t('common.fillAllFields'));
      return;
    }

    try {
      await createBatch({
        name: formData.name,
        salary_period: formData.salary_period,
        period_month: formData.period_month,
        period_year: formData.period_year,
        department: formData.department || undefined,
        position: formData.position || undefined,
        template_id: formData.template_id || undefined,
      });
      setShowAddDialog(false);
      setFormData({
        name: '',
        salary_period: `Tháng ${currentMonth}/${currentYear}`,
        period_month: currentMonth,
        period_year: currentYear,
        department: '',
        position: '',
        template_id: '',
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteBatch = async () => {
    if (!batchToDelete) return;
    try {
      await deleteBatch(batchToDelete.id);
      setShowDeleteDialog(false);
      setBatchToDelete(null);
    } catch (error) {
      console.error(error);
    }
  };

  const handleLockBatch = async () => {
    if (!selectedBatch) return;
    try {
      await lockBatch(selectedBatch.id);
      setShowLockDialog(false);
      // Refresh
      const updated = batches.find(b => b.id === selectedBatch.id);
      if (updated) setSelectedBatch({ ...updated, status: 'locked' });
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddEmployees = async () => {
    if (!selectedBatch || selectedEmployeesToAdd.length === 0) return;

    try {
      for (const empId of selectedEmployeesToAdd) {
        const emp = employees.find(e => e.id === empId);
        if (!emp) continue;

        await addRecord({
          company_id: emp.company_id,
          batch_id: selectedBatch.id,
          employee_id: emp.id,
          employee_code: emp.employee_code,
          employee_name: emp.full_name,
          department: emp.department || null,
          position: emp.position || null,
          base_salary: emp.salary || 0,
          allowances: 0,
          bonus: 0,
          overtime: 0,
          insurance_deduction: 0,
          tax_deduction: 0,
          other_deduction: 0,
          gross_salary: emp.salary || 0,
          net_salary: emp.salary || 0,
          work_days: 26,
          actual_work_days: 22,
          overtime_hours: 0,
          late_days: 0,
          leave_days: 0,
          component_values: null,
          notes: null,
        });
      }
      
      const updatedRecords = await fetchBatchRecords(selectedBatch.id);
      setBatchRecords(updatedRecords);
      
      setShowAddEmployeeDialog(false);
      setSelectedEmployeesToAdd([]);
    } catch (error) {
      console.error(error);
    }
  };

  const handleRemoveRecord = async (recordId: string) => {
    if (!selectedBatch) return;
    try {
      await deleteRecord({ id: recordId, batchId: selectedBatch.id });
      setBatchRecords(prev => prev.filter(r => r.id !== recordId));
    } catch (error) {
      console.error(error);
    }
  };

  const stats = {
    total: batches.length,
    draft: batches.filter(b => b.status === 'draft').length,
    locked: batches.filter(b => b.status === 'locked').length,
    totalNet: batches.reduce((sum, b) => sum + (b.total_net || 0), 0),
  };

  // Detail view
  if (selectedBatch) {
    const isEditable = selectedBatch.status === 'draft' || selectedBatch.status === 'pending';

    return (
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setSelectedBatch(null)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="text-xl font-semibold">{selectedBatch.name}</h2>
              <p className="text-sm text-muted-foreground">
                {selectedBatch.salary_period} • {selectedBatch.employee_count || 0} nhân viên
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(selectedBatch.status)}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Xuất
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Xuất Excel
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Printer className="w-4 h-4 mr-2" />
                  In bảng lương
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {isEditable && (
              <Button variant="destructive" onClick={() => setShowLockDialog(true)}>
                <Lock className="w-4 h-4 mr-2" />
                Khóa bảng lương
              </Button>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Tổng lương Gross</p>
              <p className="text-xl font-bold text-blue-600">
                {formatCurrency(selectedBatch.total_gross || 0)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Tổng khấu trừ</p>
              <p className="text-xl font-bold text-destructive">
                {formatCurrency(selectedBatch.total_deduction || 0)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Tổng lương Net</p>
              <p className="text-xl font-bold text-success">
                {formatCurrency(selectedBatch.total_net || 0)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Số nhân viên</p>
              <p className="text-xl font-bold">{selectedBatch.employee_count || 0}</p>
            </CardContent>
          </Card>
        </div>

        {/* Records Table */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Chi tiết lương nhân viên</h3>
              {isEditable && (
                <Button size="sm" onClick={() => setShowAddEmployeeDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm nhân viên
                </Button>
              )}
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã NV</TableHead>
                    <TableHead>Họ và tên</TableHead>
                    <TableHead>Phòng ban</TableHead>
                    <TableHead className="text-right">Lương cơ bản</TableHead>
                    <TableHead className="text-right">Phụ cấp</TableHead>
                    <TableHead className="text-right">Thưởng</TableHead>
                    <TableHead className="text-right">Khấu trừ</TableHead>
                    <TableHead className="text-right">Lương Net</TableHead>
                    {isEditable && <TableHead className="w-10"></TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batchRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        Chưa có nhân viên nào trong bảng lương
                      </TableCell>
                    </TableRow>
                  ) : (
                    batchRecords.map(record => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.employee_code}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                {record.employee_name.split(' ').pop()?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            {record.employee_name}
                          </div>
                        </TableCell>
                        <TableCell>{record.department || '-'}</TableCell>
                        <TableCell className="text-right">{formatCurrency(record.base_salary)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(record.allowances)}</TableCell>
                        <TableCell className="text-right text-success">{formatCurrency(record.bonus)}</TableCell>
                        <TableCell className="text-right text-destructive">
                          {formatCurrency(record.insurance_deduction + record.tax_deduction + record.other_deduction)}
                        </TableCell>
                        <TableCell className="text-right font-bold">{formatCurrency(record.net_salary)}</TableCell>
                        {isEditable && (
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleRemoveRecord(record.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Add Employee Dialog */}
        <Dialog open={showAddEmployeeDialog} onOpenChange={setShowAddEmployeeDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Thêm nhân viên vào bảng lương</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm nhân viên..."
                  value={employeeSearchTerm}
                  onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="max-h-64 overflow-y-auto border rounded-lg">
                {filteredEmployeesToAdd.map(emp => (
                  <div
                    key={emp.id}
                    className="flex items-center gap-3 p-3 border-b last:border-0 hover:bg-muted/50"
                  >
                    <Checkbox
                      checked={selectedEmployeesToAdd.includes(emp.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedEmployeesToAdd(prev => [...prev, emp.id]);
                        } else {
                          setSelectedEmployeesToAdd(prev => prev.filter(id => id !== emp.id));
                        }
                      }}
                    />
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {emp.full_name.split(' ').pop()?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{emp.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {emp.employee_code} • {emp.department}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(emp.salary || 0)}</p>
                      <p className="text-xs text-muted-foreground">Lương cơ bản</p>
                    </div>
                  </div>
                ))}
                {filteredEmployeesToAdd.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground">
                    Không tìm thấy nhân viên phù hợp
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddEmployeeDialog(false)}>
                Hủy
              </Button>
              <Button 
                onClick={handleAddEmployees}
                disabled={selectedEmployeesToAdd.length === 0}
              >
                Thêm {selectedEmployeesToAdd.length} nhân viên
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Lock Confirmation Dialog */}
        <Dialog open={showLockDialog} onOpenChange={setShowLockDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Khóa bảng lương
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-muted-foreground">
                Sau khi khóa, bảng lương sẽ không thể chỉnh sửa. Bạn có chắc chắn muốn khóa?
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowLockDialog(false)}>
                Hủy
              </Button>
              <Button variant="destructive" onClick={handleLockBatch}>
                Khóa bảng lương
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // List view
  return (
    <div className="p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <FileSpreadsheet className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tổng bảng lương</p>
                <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200 dark:border-amber-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <Pencil className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Đang soạn</p>
                <p className="text-2xl font-bold text-amber-600">{stats.draft}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Lock className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Đã khóa</p>
                <p className="text-2xl font-bold text-purple-600">{stats.locked}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border-emerald-200 dark:border-emerald-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tổng lương Net</p>
                <p className="text-lg font-bold text-emerald-600">{formatCurrency(stats.totalNet)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm bảng lương..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="draft">Nháp</SelectItem>
              <SelectItem value="pending">Chờ duyệt</SelectItem>
              <SelectItem value="approved">Đã duyệt</SelectItem>
              <SelectItem value="locked">Đã khóa</SelectItem>
              <SelectItem value="paid">Đã thanh toán</SelectItem>
            </SelectContent>
          </Select>
          <Select 
            value={`${periodMonth}-${periodYear}`} 
            onValueChange={(val) => {
              const [m, y] = val.split('-');
              setPeriodMonth(parseInt(m));
              setPeriodYear(parseInt(y));
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => {
                const month = i + 1;
                return (
                  <SelectItem key={month} value={`${month}-${currentYear}`}>
                    Tháng {month}/{currentYear}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Lập bảng lương
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={selectedBatches.length === filteredBatches.length && filteredBatches.length > 0}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedBatches(filteredBatches.map(b => b.id));
                      } else {
                        setSelectedBatches([]);
                      }
                    }}
                  />
                </TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead>Tên bảng lương</TableHead>
                <TableHead>Kỳ lương</TableHead>
                <TableHead className="text-center">Số NV</TableHead>
                <TableHead className="text-right">Tổng Gross</TableHead>
                <TableHead className="text-right">Tổng Net</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    Đang tải...
                  </TableCell>
                </TableRow>
              ) : filteredBatches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    Chưa có bảng lương nào cho kỳ này
                  </TableCell>
                </TableRow>
              ) : (
                filteredBatches.map(batch => (
                  <TableRow 
                    key={batch.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedBatch(batch)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedBatches.includes(batch.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedBatches(prev => [...prev, batch.id]);
                          } else {
                            setSelectedBatches(prev => prev.filter(id => id !== batch.id));
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>{formatDate(batch.created_at)}</TableCell>
                    <TableCell className="font-medium">{batch.name}</TableCell>
                    <TableCell>{batch.salary_period}</TableCell>
                    <TableCell className="text-center">{batch.employee_count || 0}</TableCell>
                    <TableCell className="text-right">{formatCurrency(batch.total_gross || 0)}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(batch.total_net || 0)}</TableCell>
                    <TableCell>{getStatusBadge(batch.status)}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedBatch(batch)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Xem chi tiết
                          </DropdownMenuItem>
                          {batch.status === 'draft' && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => {
                                  setBatchToDelete(batch);
                                  setShowDeleteDialog(true);
                                }}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Xóa
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Lập bảng lương mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tên bảng lương <span className="text-destructive">*</span></Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="VD: Bảng lương tháng 01/2025 - VP Hà Nội"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tháng</Label>
                <Select 
                  value={formData.period_month.toString()} 
                  onValueChange={(val) => {
                    const month = parseInt(val);
                    setFormData(prev => ({ 
                      ...prev, 
                      period_month: month,
                      salary_period: `Tháng ${month}/${prev.period_year}`
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        Tháng {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Năm</Label>
                <Select 
                  value={formData.period_year.toString()} 
                  onValueChange={(val) => {
                    const year = parseInt(val);
                    setFormData(prev => ({ 
                      ...prev, 
                      period_year: year,
                      salary_period: `Tháng ${prev.period_month}/${year}`
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[currentYear - 1, currentYear, currentYear + 1].map(year => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Mẫu bảng lương</Label>
              <Select 
                value={formData.template_id} 
                onValueChange={(val) => setFormData(prev => ({ ...prev, template_id: val }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn mẫu (tùy chọn)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Không sử dụng mẫu</SelectItem>
                  {templates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Đơn vị</Label>
              <Select
                value={formData.department}
                onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Để trống nếu áp dụng tất cả" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Hủy
            </Button>
            <Button onClick={handleCreateBatch} disabled={isCreating}>
              {isCreating ? 'Đang tạo...' : 'Lập bảng lương'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" />
              Xác nhận xóa
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">
              Bạn có chắc chắn muốn xóa bảng lương <strong>{batchToDelete?.name}</strong>?
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDeleteBatch}>
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
