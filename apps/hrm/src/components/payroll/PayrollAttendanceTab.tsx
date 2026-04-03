import { useState, useMemo } from 'react';
import { useDepartments } from '@/hooks/useDepartments';
import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';
import {
  Search,
  Plus,
  Filter,
  Settings,
  ChevronLeft,
  ChevronRight,
  Copy,
  Trash2,
  ArrowLeft,
  Pencil,
  Upload,
  MoreHorizontal,
  Info,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
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
import { Skeleton } from '@/components/ui/skeleton';
import { useAttendanceSheets, AttendanceSheet, AttendanceSheetInput } from '@/hooks/useAttendanceSheets';
import { useAttendanceRecords } from '@/hooks/useAttendanceRecords';
import { useToast } from '@/hooks/use-toast';

interface EmployeeSummary {
  employee_id: string;
  employee_code: string;
  employee_name: string;
  department: string | null;
  actualDays: number;
  overtimeHours: number;
  period: string;
}

export function PayrollAttendanceTab() {
  const { sheets, isLoading, createSheet, deleteSheet } = useAttendanceSheets();
  const { departments } = useDepartments();
  const { records } = useAttendanceRecords();
  const { toast } = useToast();
  const { t } = useTranslation();

  const p = (key: string) => t(`payroll.attendanceSheet.${key}`);

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSheet, setSelectedSheet] = useState<AttendanceSheet | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  
  // New sheet form
  const [newSheetName, setNewSheetName] = useState('');
  const [newSheetStartDate, setNewSheetStartDate] = useState('');
  const [newSheetEndDate, setNewSheetEndDate] = useState('');
  const [newSheetDepartment, setNewSheetDepartment] = useState('');
  const [newSheetType, setNewSheetType] = useState('daily');

  // Filter sheets by search
  const filteredSheets = useMemo(() => {
    if (!searchQuery) return sheets;
    const query = searchQuery.toLowerCase();
    return sheets.filter(
      (sheet) =>
        sheet.name.toLowerCase().includes(query) ||
        sheet.department?.toLowerCase().includes(query)
    );
  }, [sheets, searchQuery]);

  // Get employee attendance summary for selected sheet
  const employeeSummaries = useMemo((): EmployeeSummary[] => {
    if (!selectedSheet) return [];

    const startDate = selectedSheet.start_date;
    const endDate = selectedSheet.end_date;

    const sheetRecords = records.filter(
      (r) => r.attendance_date >= startDate && r.attendance_date <= endDate
    );

    const employeeMap = new Map<string, EmployeeSummary>();

    sheetRecords.forEach((record) => {
      const existing = employeeMap.get(record.employee_id);
      if (existing) {
        existing.actualDays += 1;
        existing.overtimeHours += record.overtime_hours || 0;
      } else {
        employeeMap.set(record.employee_id, {
          employee_id: record.employee_id,
          employee_code: record.employee_code,
          employee_name: record.employee_name,
          department: record.department,
          actualDays: 1,
          overtimeHours: record.overtime_hours || 0,
          period: `${format(parseISO(startDate), 'dd/MM/yyyy')} - ${format(parseISO(endDate), 'dd/MM/yyyy')}`,
        });
      }
    });

    return Array.from(employeeMap.values());
  }, [selectedSheet, records]);

  // Filter employees by search
  const filteredEmployees = useMemo(() => {
    if (!searchQuery) return employeeSummaries;
    const query = searchQuery.toLowerCase();
    return employeeSummaries.filter(
      (emp) =>
        emp.employee_name.toLowerCase().includes(query) ||
        emp.employee_code.toLowerCase().includes(query)
    );
  }, [employeeSummaries, searchQuery]);

  // Handlers
  const handleCreateSheet = async () => {
    if (!newSheetName || !newSheetStartDate || !newSheetEndDate) {
      toast({
        title: t('common.error'),
        description: t('common.fillAllFields'),
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);
    const input: AttendanceSheetInput = {
      name: newSheetName,
      start_date: newSheetStartDate,
      end_date: newSheetEndDate,
      department: newSheetDepartment || undefined,
      attendance_type: newSheetType,
    };

    const result = await createSheet(input);
    setIsCreating(false);

    if (result) {
      setShowAddDialog(false);
      resetForm();
    }
  };

  const handleDeleteSheet = async (id: string) => {
    setIsDeleting(id);
    await deleteSheet(id);
    setIsDeleting(null);
  };

  const resetForm = () => {
    setNewSheetName('');
    setNewSheetStartDate('');
    setNewSheetEndDate('');
    setNewSheetDepartment('');
    setNewSheetType('daily');
  };

  const formatPeriod = (sheet: AttendanceSheet) => {
    try {
      return `${format(parseISO(sheet.start_date), 'dd/MM/yyyy')} - ${format(parseISO(sheet.end_date), 'dd/MM/yyyy')}`;
    } catch {
      return `${sheet.start_date} - ${sheet.end_date}`;
    }
  };

  const getAttendanceTypeLabel = (type: string) => {
    switch (type) {
      case 'daily': return p('typeDaily');
      case 'hourly': return p('typeHourly');
      case 'shift': return p('typeShift');
      default: return type;
    }
  };

  // Detail view for selected sheet
  if (selectedSheet) {
    return (
      <div className="space-y-4 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setSelectedSheet(null)} className="h-8 w-8">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">{selectedSheet.name}</h2>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Pencil className="w-3 h-3" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2">
              <Upload className="w-4 h-4" />
              {p('import')}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="gap-2">
                  <Copy className="w-4 h-4" />
                  {p('duplicate')}
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2">
                  <Info className="w-4 h-4" />
                  {p('reference')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="gap-2 text-destructive"
                  onClick={() => {
                    handleDeleteSheet(selectedSheet.id);
                    setSelectedSheet(null);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                  {t('common.delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{p('period')}: {formatPeriod(selectedSheet)}</span>
          <span>•</span>
          <span>{p('format')}: {getAttendanceTypeLabel(selectedSheet.attendance_type)}</span>
          {selectedSheet.department && (
            <>
              <span>•</span>
              <span>{p('unit')}: {selectedSheet.department}</span>
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t('payroll.searchEmployee')}
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4 font-medium text-sm w-10">
                    <input type="checkbox" className="rounded border-border" />
                  </th>
                  <th className="text-left p-4 font-medium text-sm w-16">#</th>
                  <th className="text-left p-4 font-medium text-sm">{t('payroll.employeeCode')}</th>
                  <th className="text-left p-4 font-medium text-sm">{t('payroll.employeeName')}</th>
                  <th className="text-left p-4 font-medium text-sm">{p('period')}</th>
                  <th className="text-left p-4 font-medium text-sm">{p('unit')}</th>
                  <th className="text-right p-4 font-medium text-sm">{p('totalActualDays')}</th>
                  <th className="text-right p-4 font-medium text-sm">{p('totalOvertimeHours')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-muted-foreground">
                      {p('noDataInPeriod')}
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp, index) => (
                    <tr key={emp.employee_id} className="border-b hover:bg-muted/30">
                      <td className="p-4">
                        <input type="checkbox" className="rounded border-border" />
                      </td>
                      <td className="p-4 text-muted-foreground">{index + 1}</td>
                      <td className="p-4 font-medium">{emp.employee_code}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs bg-primary/10 text-primary">
                              {emp.employee_name.split(' ').pop()?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{emp.employee_name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground">{emp.period}</td>
                      <td className="p-4 text-muted-foreground">{emp.department || 'N/A'}</td>
                      <td className="p-4 text-right font-medium">{emp.actualDays}</td>
                      <td className="p-4 text-right text-muted-foreground">
                        {emp.overtimeHours.toFixed(1)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-4 py-3 border-t">
            <span className="text-sm text-muted-foreground">
              {t('payroll.attendanceSheet.totalEmployees', { count: filteredEmployees.length })}
            </span>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-28" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-48" />
        </div>
        <Card className="p-4">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  // Main list view
  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{t('payroll.dataAttendance')}</h2>
        <Button
          className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-white"
          onClick={() => setShowAddDialog(true)}
        >
          <Plus className="w-4 h-4" />
          {t('common.addNew')}
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t('common.search')}
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="icon">
          <Settings className="w-4 h-4" />
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-4 font-medium text-sm w-10">
                  <input type="checkbox" className="rounded border-border" />
                </th>
                <th className="text-left p-4 font-medium text-sm">{p('sheetName')}</th>
                <th className="text-left p-4 font-medium text-sm">{p('unit')}</th>
                <th className="text-left p-4 font-medium text-sm">{p('appliedPosition')}</th>
                <th className="text-left p-4 font-medium text-sm">{p('period')}</th>
                <th className="text-left p-4 font-medium text-sm">{p('format')}</th>
                <th className="text-left p-4 font-medium text-sm w-24"></th>
              </tr>
            </thead>
            <tbody>
              {filteredSheets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    {p('emptyState')}
                  </td>
                </tr>
              ) : (
                filteredSheets.map((sheet) => (
                  <tr
                    key={sheet.id}
                    className="border-b hover:bg-muted/30 cursor-pointer group"
                    onClick={() => setSelectedSheet(sheet)}
                  >
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" className="rounded border-border" />
                    </td>
                    <td className="p-4">
                      <span className="font-medium text-primary hover:underline">
                        {sheet.name}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground">{sheet.department || t('common.all')}</td>
                    <td className="p-4 text-muted-foreground">{sheet.positions || t('common.all')}</td>
                    <td className="p-4 text-muted-foreground">{formatPeriod(sheet)}</td>
                    <td className="p-4">
                      <span className="text-rose-500">
                        {getAttendanceTypeLabel(sheet.attendance_type)}
                      </span>
                    </td>
                    <td className="p-4">
                      <div
                        className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button variant="ghost" size="icon" className="h-8 w-8" title={p('duplicate')}>
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          title={t('common.delete')}
                          disabled={isDeleting === sheet.id}
                          onClick={() => handleDeleteSheet(sheet.id)}
                        >
                          {isDeleting === sheet.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t">
          <span className="text-sm text-muted-foreground">
            {t('payroll.attendanceSheet.totalRecords', { count: filteredSheets.length })}
          </span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{p('recordsPerPage')}</span>
              <Select defaultValue="50">
                <SelectTrigger className="w-20 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <span className="text-sm text-muted-foreground">
              1 - {filteredSheets.length} {p('records')}
            </span>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{p('createTitle')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="sheet-name">{p('sheetNameLabel')} *</Label>
              <Input
                id="sheet-name"
                placeholder={p('sheetNamePlaceholder')}
                value={newSheetName}
                onChange={(e) => setNewSheetName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">{p('fromDate')} *</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={newSheetStartDate}
                  onChange={(e) => setNewSheetStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">{p('toDate')} *</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={newSheetEndDate}
                  onChange={(e) => setNewSheetEndDate(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">{p('unit')}</Label>
              <Select value={newSheetDepartment} onValueChange={setNewSheetDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder={p('unitPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">{p('attendanceFormat')}</Label>
              <Select value={newSheetType} onValueChange={setNewSheetType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">{p('typeDaily')}</SelectItem>
                  <SelectItem value="hourly">{p('typeHourly')}</SelectItem>
                  <SelectItem value="shift">{p('typeShift')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleCreateSheet} disabled={isCreating}>
              {isCreating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {p('createSheet')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
