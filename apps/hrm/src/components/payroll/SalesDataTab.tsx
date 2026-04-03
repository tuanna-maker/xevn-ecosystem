import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search,
  RefreshCw,
  Upload,
  Download,
  ChevronLeft,
  ChevronRight,
  Calendar,
  TrendingUp,
  Users,
  DollarSign,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  Plus,
  Link,
  Settings,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { useSalesData, SalesRecord } from '@/hooks/useSalesData';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useDepartments } from '@/hooks/useDepartments';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);

const getMonths = (t: (k: string) => string) => [
  { value: 1, label: `${t('sales.monthPrefix')}01` },
  { value: 2, label: `${t('sales.monthPrefix')}02` },
  { value: 3, label: `${t('sales.monthPrefix')}03` },
  { value: 4, label: `${t('sales.monthPrefix')}04` },
  { value: 5, label: `${t('sales.monthPrefix')}05` },
  { value: 6, label: `${t('sales.monthPrefix')}06` },
  { value: 7, label: `${t('sales.monthPrefix')}07` },
  { value: 8, label: `${t('sales.monthPrefix')}08` },
  { value: 9, label: `${t('sales.monthPrefix')}09` },
  { value: 10, label: `${t('sales.monthPrefix')}10` },
  { value: 11, label: `${t('sales.monthPrefix')}11` },
  { value: 12, label: `${t('sales.monthPrefix')}12` },
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

export function SalesDataTab() {
  const { t } = useTranslation();
  const { currentCompanyId } = useAuth();
  const s = (key: string, opts?: Record<string, unknown>) => t(`sales.${key}`, opts);
  const { departments: departmentsList } = useDepartments();
  const months = getMonths(t);

  const currentDate = new Date();
  const [periodMonth, setPeriodMonth] = useState(currentDate.getMonth() + 1);
  const [periodYear, setPeriodYear] = useState(currentDate.getFullYear());
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Dialogs
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showSyncDialog, setShowSyncDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<SalesRecord | null>(null);
  const [syncApiUrl, setSyncApiUrl] = useState('');

  // Form state for add/edit
  const [formData, setFormData] = useState({
    employee_code: '',
    employee_name: '',
    department: '',
    position: '',
    sales_target: 0,
    actual_sales: 0,
    commission_rate: 0,
    commission_amount: 0,
    bonus_amount: 0,
    order_count: 0,
    customer_count: 0,
    new_customer_count: 0,
    notes: '',
  });

  const {
    salesData,
    isLoading,
    isSyncing,
    syncFromAPI,
    importFromExcel,
    addRecord,
    updateRecord,
    deleteRecord,
    getStats,
  } = useSalesData({ periodMonth, periodYear });

  // Fetch employees for dropdown
  const { data: employeesList = [] } = useQuery({
    queryKey: ['employees-list', currentCompanyId],
    queryFn: async () => {
      if (!currentCompanyId) return [];
      const { data, error } = await supabase
        .from('employees')
        .select('id, full_name, employee_code, department, position, avatar_url')
        .eq('company_id', currentCompanyId)
        .is('deleted_at', null)
        .order('full_name');
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentCompanyId,
  });

  const handleEmployeeSelect = (employeeId: string) => {
    const emp = employeesList.find(e => e.id === employeeId);
    if (emp) {
      setFormData(p => ({
        ...p,
        employee_code: emp.employee_code,
        employee_name: emp.full_name,
        department: emp.department || '',
        position: emp.position || '',
      }));
    }
  };

  const departments = useMemo(() => {
    const depts = new Set(salesData.map(r => r.department).filter(Boolean));
    return Array.from(depts);
  }, [salesData]);

  // Filter sales data
  const filteredData = useMemo(() => {
    return salesData.filter(record => {
      const matchesSearch =
        record.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.employee_code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = departmentFilter === 'all' || record.department === departmentFilter;
      return matchesSearch && matchesDepartment;
    });
  }, [salesData, searchTerm, departmentFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const stats = getStats();

  const handleSync = async () => {
    await syncFromAPI(syncApiUrl || undefined);
    setShowSyncDialog(false);
    setSyncApiUrl('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleConfirmImport = async () => {
    if (!selectedFile) return;

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as Record<string, unknown>[];

        const records = jsonData.map(row => ({
          employee_code: String(row[s('col.empCode')] || row['employee_code'] || ''),
          employee_name: String(row[s('col.fullName')] || row['employee_name'] || ''),
          department: String(row[s('col.department')] || row['department'] || ''),
          position: String(row[s('col.position')] || row['position'] || ''),
          sales_target: Number(row[s('col.target')] || row['sales_target'] || 0),
          actual_sales: Number(row[s('col.sales')] || row['actual_sales'] || 0),
          commission_rate: Number(row[s('col.commRate')] || row['commission_rate'] || 0),
          commission_amount: Number(row[s('col.commission')] || row['commission_amount'] || 0),
          bonus_amount: Number(row[s('col.bonus')] || row['bonus_amount'] || 0),
          order_count: Number(row[s('col.orders')] || row['order_count'] || 0),
          customer_count: Number(row[s('col.customers')] || row['customer_count'] || 0),
          new_customer_count: Number(row[s('col.newCustomers')] || row['new_customer_count'] || 0),
          period_month: periodMonth,
          period_year: periodYear,
        }));

        const success = await importFromExcel(records);
        if (success) {
          setShowImportDialog(false);
          setSelectedFile(null);
        }
      };
      reader.readAsBinaryString(selectedFile);
    } catch {
      toast.error(s('importError'));
    }
  };

  const handleExport = () => {
    const exportData = filteredData.map(r => ({
      [s('col.empCode')]: r.employee_code,
      [s('col.fullName')]: r.employee_name,
      [s('col.department')]: r.department,
      [s('col.position')]: r.position,
      [s('col.target')]: r.sales_target,
      [s('col.sales')]: r.actual_sales,
      [s('col.achieveRate')]: r.achievement_rate,
      [s('col.commRate')]: r.commission_rate,
      [s('col.commission')]: r.commission_amount,
      [s('col.bonus')]: r.bonus_amount,
      [s('col.orders')]: r.order_count,
      [s('col.customers')]: r.customer_count,
      [s('col.newCustomers')]: r.new_customer_count,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, s('sheetName'));
    XLSX.writeFile(wb, `${s('fileName')}_${periodMonth}_${periodYear}.xlsx`);
    toast.success(s('exportSuccess'));
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        [s('col.empCode')]: 'NV001',
        [s('col.fullName')]: 'Nguyen Van A',
        [s('col.department')]: 'Sales',
        [s('col.position')]: 'Staff',
        [s('col.target')]: 100000000,
        [s('col.sales')]: 120000000,
        [s('col.commRate')]: 5,
        [s('col.commission')]: 6000000,
        [s('col.bonus')]: 2000000,
        [s('col.orders')]: 50,
        [s('col.customers')]: 30,
        [s('col.newCustomers')]: 10,
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, `template_${s('fileName')}.xlsx`);
    toast.success(s('templateSuccess'));
  };

  const handleViewDetail = (record: SalesRecord) => {
    setSelectedRecord(record);
    setShowDetailDialog(true);
  };

  const handleEdit = (record: SalesRecord) => {
    setSelectedRecord(record);
    setFormData({
      employee_code: record.employee_code,
      employee_name: record.employee_name,
      department: record.department || '',
      position: record.position || '',
      sales_target: record.sales_target,
      actual_sales: record.actual_sales,
      commission_rate: record.commission_rate,
      commission_amount: record.commission_amount,
      bonus_amount: record.bonus_amount,
      order_count: record.order_count,
      customer_count: record.customer_count,
      new_customer_count: record.new_customer_count,
      notes: record.notes || '',
    });
    setShowEditDialog(true);
  };

  const handleDelete = async (record: SalesRecord) => {
    if (confirm(s('deleteConfirm', { name: record.employee_name }))) {
      await deleteRecord(record.id);
    }
  };

  const handleAddSubmit = async () => {
    const success = await addRecord({
      ...formData,
      period_month: periodMonth,
      period_year: periodYear,
    });
    if (success) {
      setShowAddDialog(false);
      resetForm();
    }
  };

  const handleEditSubmit = async () => {
    if (!selectedRecord) return;
    const success = await updateRecord(selectedRecord.id, formData);
    if (success) {
      setShowEditDialog(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({
      employee_code: '',
      employee_name: '',
      department: '',
      position: '',
      sales_target: 0,
      actual_sales: 0,
      commission_rate: 0,
      commission_amount: 0,
      bonus_amount: 0,
      order_count: 0,
      customer_count: 0,
      new_customer_count: 0,
      notes: '',
    });
    setSelectedRecord(null);
  };

  const getAchievementBadge = (rate: number) => {
    if (rate >= 120) return <Badge className="bg-emerald-500 text-white">{s('excellent')}</Badge>;
    if (rate >= 100) return <Badge className="bg-blue-500 text-white">{s('achieved')}</Badge>;
    if (rate >= 80) return <Badge className="bg-amber-500 text-white">{s('nearTarget')}</Badge>;
    return <Badge className="bg-red-500 text-white">{s('belowTarget')}</Badge>;
  };

  const getSyncSourceLabel = (source: string) => {
    if (source === 'api') return 'API';
    if (source === 'import') return 'Import';
    return s('manual');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{s('totalEmployees')}</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalEmployees}</p>
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
                <p className="text-sm text-muted-foreground">{s('totalSales')}</p>
                <p className="text-xl font-bold text-emerald-600">
                  {formatCurrency(stats.totalSales)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{s('totalCommission')}</p>
                <p className="text-xl font-bold text-purple-600">
                  {formatCurrency(stats.totalCommission)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200 dark:border-amber-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <Calendar className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{s('avgAchievement')}</p>
                <p className="text-2xl font-bold text-amber-600">
                  {stats.avgAchievement.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={s('searchPlaceholder')}
              className="pl-10 w-[280px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Select value={String(periodMonth)} onValueChange={(v) => setPeriodMonth(Number(v))}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder={s('month')} />
            </SelectTrigger>
            <SelectContent className="bg-popover border shadow-lg z-50">
              {months.map(m => (
                <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={String(periodYear)} onValueChange={(v) => setPeriodYear(Number(v))}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder={s('year')} />
            </SelectTrigger>
            <SelectContent className="bg-popover border shadow-lg z-50">
              {years.map(y => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={s('department')} />
            </SelectTrigger>
            <SelectContent className="bg-popover border shadow-lg z-50">
              <SelectItem value="all">{s('allDepartments')}</SelectItem>
              {departments.map(dept => (
                <SelectItem key={dept} value={dept!}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setShowAddDialog(true)}
          >
            <Plus className="w-4 h-4" />
            {s('addNew')}
          </Button>

          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setShowSyncDialog(true)}
            disabled={isSyncing}
          >
            <RefreshCw className={cn("w-4 h-4", isSyncing && "animate-spin")} />
            {s('syncAPI')}
          </Button>

          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setShowImportDialog(true)}
          >
            <Upload className="w-4 h-4" />
            Import
          </Button>

          <Button
            variant="outline"
            className="gap-2"
            onClick={handleExport}
          >
            <Download className="w-4 h-4" />
            {s('exportExcel')}
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">{t('common.loading')}</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium text-sm">{s('th.no')}</th>
                    <th className="text-left p-3 font-medium text-sm">{s('th.empCode')}</th>
                    <th className="text-left p-3 font-medium text-sm">{s('th.employee')}</th>
                    <th className="text-left p-3 font-medium text-sm">{s('th.department')}</th>
                    <th className="text-right p-3 font-medium text-sm">{s('th.sales')}</th>
                    <th className="text-right p-3 font-medium text-sm">{s('th.target')}</th>
                    <th className="text-center p-3 font-medium text-sm">{s('th.achieveRate')}</th>
                    <th className="text-right p-3 font-medium text-sm">{s('th.commission')}</th>
                    <th className="text-right p-3 font-medium text-sm">{s('th.bonus')}</th>
                    <th className="text-center p-3 font-medium text-sm">{s('th.source')}</th>
                    <th className="text-center p-3 font-medium text-sm">{s('th.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="text-center py-12 text-muted-foreground">
                        {s('noData')}
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((record, index) => (
                      <tr
                        key={record.id}
                        className="border-b hover:bg-muted/30 transition-colors"
                      >
                        <td className="p-3 text-sm text-muted-foreground">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </td>
                        <td className="p-3">
                          <span className="font-medium text-primary text-sm">
                            {record.employee_code}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {record.employee_name.split(' ').pop()?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{record.employee_name}</p>
                              <p className="text-xs text-muted-foreground">{record.position}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-sm">{record.department}</td>
                        <td className="p-3 text-sm text-right font-medium">
                          {formatCurrency(record.actual_sales)}
                        </td>
                        <td className="p-3 text-sm text-right text-muted-foreground">
                          {formatCurrency(record.sales_target)}
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-sm font-medium">{record.achievement_rate}%</span>
                            {getAchievementBadge(record.achievement_rate)}
                          </div>
                        </td>
                        <td className="p-3 text-sm text-right font-medium text-emerald-600">
                          {formatCurrency(record.commission_amount)}
                        </td>
                        <td className="p-3 text-sm text-right font-medium text-purple-600">
                          {formatCurrency(record.bonus_amount)}
                        </td>
                        <td className="p-3 text-center">
                          <Badge variant="outline" className="text-xs">
                            {getSyncSourceLabel(record.sync_source)}
                          </Badge>
                        </td>
                        <td className="p-3 text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-popover border shadow-lg">
                              <DropdownMenuItem onClick={() => handleViewDetail(record)}>
                                <Eye className="w-4 h-4 mr-2" />
                                {t('common.view')}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(record)}>
                                <Pencil className="w-4 h-4 mr-2" />
                                {t('common.edit')}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete(record)}
                                className="text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                {t('common.delete')}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t">
              <p className="text-sm text-muted-foreground">
                {s('showing', { from: (currentPage - 1) * itemsPerPage + 1, to: Math.min(currentPage * itemsPerPage, filteredData.length), total: filteredData.length })}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm">
                  {s('page', { current: currentPage, total: totalPages })}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sync API Dialog */}
      <Dialog open={showSyncDialog} onOpenChange={setShowSyncDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link className="w-5 h-5" />
              {s('syncTitle')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{s('syncUrlLabel')}</Label>
              <Input
                placeholder="https://api.example.com/sales"
                value={syncApiUrl}
                onChange={(e) => setSyncApiUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                {s('syncUrlHint')}
              </p>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium text-sm mb-2">{s('syncInfo')}</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• {s('syncPeriod', { month: periodMonth, year: periodYear })}</li>
                <li>• {s('syncDuplicateUpdate')}</li>
                <li>• {s('syncNewAdd')}</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSyncDialog(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSync} disabled={isSyncing}>
              {isSyncing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  {s('syncing')}
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {s('syncBtn')}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              {s('importTitle')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{s('selectFile')}</Label>
              <Input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
              />
              {selectedFile && (
                <p className="text-sm text-muted-foreground">
                  {s('selected')}: {selectedFile.name}
                </p>
              )}
            </div>
            <Button variant="outline" className="w-full" onClick={handleDownloadTemplate}>
              <Download className="w-4 h-4 mr-2" />
              {s('downloadTemplate')}
            </Button>
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium text-sm mb-2">{s('importGuide')}</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• {s('importGuide1')}</li>
                <li>• {s('importGuide2')}</li>
                <li>• {s('importGuide3')}</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImportDialog(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleConfirmImport} disabled={!selectedFile}>
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{s('addTitle')}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            {/* Employee Selection */}
            {employeesList.length > 0 && (
              <div className="col-span-2 space-y-2">
                <Label>{t('common.selectEmployee')}</Label>
                <Select onValueChange={handleEmployeeSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('common.selectEmployee')} />
                  </SelectTrigger>
                  <SelectContent>
                    {employeesList.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.full_name} - {emp.employee_code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>{s('col.empCode')} *</Label>
              <Input
                value={formData.employee_code}
                onChange={(e) => setFormData(p => ({ ...p, employee_code: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>{s('col.fullName')} *</Label>
              <Input
                value={formData.employee_name}
                onChange={(e) => setFormData(p => ({ ...p, employee_name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>{s('col.department')}</Label>
              <Select
                value={formData.department}
                onValueChange={(value) => setFormData(p => ({ ...p, department: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={s('col.department')} />
                </SelectTrigger>
                <SelectContent>
                  {departmentsList.map((dept) => (
                    <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{s('col.position')}</Label>
              <Input
                value={formData.position}
                onChange={(e) => setFormData(p => ({ ...p, position: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>{s('col.target')}</Label>
              <Input
                type="number"
                value={formData.sales_target}
                onChange={(e) => setFormData(p => ({ ...p, sales_target: Number(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <Label>{s('lbl.actualSales')}</Label>
              <Input
                type="number"
                value={formData.actual_sales}
                onChange={(e) => setFormData(p => ({ ...p, actual_sales: Number(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <Label>{s('lbl.commissionRate')}</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.commission_rate}
                onChange={(e) => setFormData(p => ({ ...p, commission_rate: Number(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <Label>{s('lbl.commissionAmount')}</Label>
              <Input
                type="number"
                value={formData.commission_amount}
                onChange={(e) => setFormData(p => ({ ...p, commission_amount: Number(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <Label>{s('lbl.bonusAmount')}</Label>
              <Input
                type="number"
                value={formData.bonus_amount}
                onChange={(e) => setFormData(p => ({ ...p, bonus_amount: Number(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <Label>{s('lbl.orderCount')}</Label>
              <Input
                type="number"
                value={formData.order_count}
                onChange={(e) => setFormData(p => ({ ...p, order_count: Number(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <Label>{s('lbl.customerCount')}</Label>
              <Input
                type="number"
                value={formData.customer_count}
                onChange={(e) => setFormData(p => ({ ...p, customer_count: Number(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <Label>{s('lbl.newCustomers')}</Label>
              <Input
                type="number"
                value={formData.new_customer_count}
                onChange={(e) => setFormData(p => ({ ...p, new_customer_count: Number(e.target.value) }))}
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>{s('lbl.notes')}</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAddDialog(false); resetForm(); }}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleAddSubmit}>{t('common.add')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{s('editTitle')}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>{s('col.empCode')} *</Label>
              <Input
                value={formData.employee_code}
                onChange={(e) => setFormData(p => ({ ...p, employee_code: e.target.value }))}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label>{s('col.fullName')} *</Label>
              <Input
                value={formData.employee_name}
                onChange={(e) => setFormData(p => ({ ...p, employee_name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>{s('col.department')}</Label>
              <Select
                value={formData.department}
                onValueChange={(value) => setFormData(p => ({ ...p, department: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={s('col.department')} />
                </SelectTrigger>
                <SelectContent>
                  {departmentsList.map((dept) => (
                    <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{s('col.position')}</Label>
              <Input
                value={formData.position}
                onChange={(e) => setFormData(p => ({ ...p, position: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>{s('col.target')}</Label>
              <Input
                type="number"
                value={formData.sales_target}
                onChange={(e) => setFormData(p => ({ ...p, sales_target: Number(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <Label>{s('lbl.actualSales')}</Label>
              <Input
                type="number"
                value={formData.actual_sales}
                onChange={(e) => setFormData(p => ({ ...p, actual_sales: Number(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <Label>{s('lbl.commissionRate')}</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.commission_rate}
                onChange={(e) => setFormData(p => ({ ...p, commission_rate: Number(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <Label>{s('lbl.commissionAmount')}</Label>
              <Input
                type="number"
                value={formData.commission_amount}
                onChange={(e) => setFormData(p => ({ ...p, commission_amount: Number(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <Label>{s('lbl.bonusAmount')}</Label>
              <Input
                type="number"
                value={formData.bonus_amount}
                onChange={(e) => setFormData(p => ({ ...p, bonus_amount: Number(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <Label>{s('lbl.orderCount')}</Label>
              <Input
                type="number"
                value={formData.order_count}
                onChange={(e) => setFormData(p => ({ ...p, order_count: Number(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <Label>{s('lbl.customerCount')}</Label>
              <Input
                type="number"
                value={formData.customer_count}
                onChange={(e) => setFormData(p => ({ ...p, customer_count: Number(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <Label>{s('lbl.newCustomers')}</Label>
              <Input
                type="number"
                value={formData.new_customer_count}
                onChange={(e) => setFormData(p => ({ ...p, new_customer_count: Number(e.target.value) }))}
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>{s('lbl.notes')}</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowEditDialog(false); resetForm(); }}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleEditSubmit}>{t('common.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{s('detailTitle')}</DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4 pb-4 border-b">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">
                    {selectedRecord.employee_name.split(' ').pop()?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{selectedRecord.employee_name}</h3>
                  <p className="text-muted-foreground">{selectedRecord.employee_code}</p>
                  <p className="text-sm text-muted-foreground">{selectedRecord.position} - {selectedRecord.department}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{s('detail.period')}</p>
                  <p className="font-medium">{s('monthPrefix')}{selectedRecord.period_month}/{selectedRecord.period_year}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{s('detail.source')}</p>
                  <Badge variant="outline">
                    {getSyncSourceLabel(selectedRecord.sync_source)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{s('col.target')}</p>
                  <p className="font-medium">{formatCurrency(selectedRecord.sales_target)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{s('lbl.actualSales')}</p>
                  <p className="font-medium text-emerald-600">{formatCurrency(selectedRecord.actual_sales)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{s('detail.achieveRate')}</p>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{selectedRecord.achievement_rate}%</span>
                    {getAchievementBadge(selectedRecord.achievement_rate)}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{s('lbl.commissionRate')}</p>
                  <p className="font-medium">{selectedRecord.commission_rate}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{s('lbl.commissionAmount')}</p>
                  <p className="font-medium text-emerald-600">{formatCurrency(selectedRecord.commission_amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{s('lbl.bonusAmount')}</p>
                  <p className="font-medium text-purple-600">{formatCurrency(selectedRecord.bonus_amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{s('lbl.orderCount')}</p>
                  <p className="font-medium">{selectedRecord.order_count}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{s('lbl.customerCount')}</p>
                  <p className="font-medium">{selectedRecord.customer_count}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{s('lbl.newCustomers')}</p>
                  <p className="font-medium">{selectedRecord.new_customer_count}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{s('detail.totalEarnings')}</p>
                  <p className="font-bold text-lg text-primary">{formatCurrency(selectedRecord.total_earnings)}</p>
                </div>
              </div>

              {selectedRecord.synced_at && (
                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground">
                    {s('detail.lastUpdated')}: {new Date(selectedRecord.synced_at).toLocaleString('vi-VN')}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
              {t('common.close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
