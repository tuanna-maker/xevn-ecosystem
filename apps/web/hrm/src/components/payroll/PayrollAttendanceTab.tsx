/**
 * @CODE-MEMORY-CHANGE 2026-09-04
 * WorkItem: PO-HRM-UI-ATTENDANCE-MATRIX-CALENDAR-UPGRADE
 * What: Add full 31-day Matrix View, Bưu cục location badges, OT & probation split, Attendance Settings Dialog, and timezone-safe date period formatting (01/08/2026 - 31/08/2026)
 * Why: Fix UTC timezone offset crash where 2026-07-31T17:00:00Z (ICT 2026-08-01 00:00) was split as 31/07/2026
 */
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
  CheckCircle2,
  Unlock,
  LayoutGrid,
  CalendarDays,
  ListFilter,
  Clock,
  User,
  Settings2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ViDatePickerField } from '@/components/ui/ViDatePickerField';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { useAttendanceRecords, AttendanceRecord } from '@/hooks/useAttendanceRecords';
import { AttendanceSettingsDialog } from '@/components/payroll/AttendanceSettingsDialog';
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

function toLocalDateStr(val?: string | Date | null): string {
  if (!val) return '';
  try {
    const d = typeof val === 'string' ? new Date(val) : val;
    if (isNaN(d.getTime())) return String(val).split('T')[0];
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return String(val).split('T')[0];
  }
}

function formatCheckTime(val?: string | null): string {
  if (!val) return '';
  try {
    if (val.includes('T') || val.includes(' ')) {
      const d = new Date(val);
      if (!isNaN(d.getTime())) {
        const h = d.getHours().toString().padStart(2, '0');
        const m = d.getMinutes().toString().padStart(2, '0');
        return `${h}:${m}`;
      }
    }
    const parts = val.split(':');
    if (parts.length >= 2) {
      return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
    }
    return val;
  } catch {
    return val || '';
  }
}

export function PayrollAttendanceTab() {
  const { sheets, isLoading, createSheet, updateSheet, deleteSheet } = useAttendanceSheets();
  const { departments } = useDepartments();
  const { toast } = useToast();
  const { t } = useTranslation();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSheet, setSelectedSheet] = useState<AttendanceSheet | null>(null);
  const [viewMode, setViewMode] = useState<'matrix' | 'calendar' | 'summary'>('matrix');
  const [selectedEmpForCalendar, setSelectedEmpForCalendar] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // New sheet form
  const [newSheetName, setNewSheetName] = useState('');
  const [newSheetStartDate, setNewSheetStartDate] = useState('');
  const [newSheetEndDate, setNewSheetEndDate] = useState('');
  const [newSheetDepartment, setNewSheetDepartment] = useState('');
  const [newSheetType, setNewSheetType] = useState('daily');

  // Query options for attendance records when sheet is selected
  const sheetRecordParams = useMemo(() => {
    if (!selectedSheet) return undefined;
    const from = toLocalDateStr(selectedSheet.start_date);
    const to = toLocalDateStr(selectedSheet.end_date);
    return { from_date: from, to_date: to };
  }, [selectedSheet]);

  const { records, isLoading: isRecordsLoading } = useAttendanceRecords(sheetRecordParams);

  const p = (key: string) => t(`payroll.attendanceSheet.${key}`);

  const handleToggleCloseSheet = async (sheetToToggle?: AttendanceSheet) => {
    const target = sheetToToggle || selectedSheet;
    if (!target) return;
    const isClosed = target.status === 'closed';
    const nextStatus = isClosed ? 'draft' : 'closed';
    const ok = await updateSheet(target.id, { status: nextStatus });
    if (ok) {
      if (selectedSheet?.id === target.id) {
        setSelectedSheet((prev) => (prev ? { ...prev, status: nextStatus } : null));
      }
      toast({
        title: t('messages.success'),
        description: isClosed ? 'Đã mở lại bảng chấm công' : 'Đã chốt bảng chấm công thành công!',
      });
    }
  };

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

  // Format period date display in local time
  const formatPeriod = (sheet: AttendanceSheet) => {
    const s = toLocalDateStr(sheet.start_date);
    const e = toLocalDateStr(sheet.end_date);
    const sParts = s.split('-');
    const eParts = e.split('-');
    if (sParts.length === 3 && eParts.length === 3) {
      return `${sParts[2]}/${sParts[1]}/${sParts[0]} - ${eParts[2]}/${eParts[1]}/${eParts[0]}`;
    }
    return `${sheet.start_date} - ${sheet.end_date}`;
  };

  // List of all days in the selected sheet date range (e.g. 1..31 days of month)
  const sheetDaysList = useMemo(() => {
    if (!selectedSheet) return [];
    try {
      const fromStr = toLocalDateStr(selectedSheet.start_date);
      const toStr = toLocalDateStr(selectedSheet.end_date);
      const start = parseISO(fromStr);
      const end = parseISO(toStr);
      const days: { dateStr: string; dayNum: number; dayName: string; isSunday: boolean }[] = [];
      const current = new Date(start.getTime());

      while (current <= end) {
        const dateStr = format(current, 'yyyy-MM-dd');
        const dayNum = current.getDate();
        const dayOfWeek = current.getDay();
        const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        days.push({
          dateStr,
          dayNum,
          dayName: dayNames[dayOfWeek],
          isSunday: dayOfWeek === 0,
        });
        current.setDate(current.getDate() + 1);
      }
      return days;
    } catch {
      return [];
    }
  }, [selectedSheet]);

  // Map of records by `${employee_id}_${dateStr}`
  const recordsMap = useMemo(() => {
    const map = new Map<string, AttendanceRecord>();
    records.forEach((r) => {
      const dateKey = toLocalDateStr(r.attendance_date);
      if (r.employee_id && dateKey) {
        map.set(`${r.employee_id}_${dateKey}`, r);
      }
    });
    return map;
  }, [records]);

  // Employee attendance summary for selected sheet
  const employeeSummaries = useMemo((): EmployeeSummary[] => {
    if (!selectedSheet) return [];

    const startDate = toLocalDateStr(selectedSheet.start_date);
    const endDate = toLocalDateStr(selectedSheet.end_date);

    const sheetRecords = records.filter((r) => {
      const d = toLocalDateStr(r.attendance_date);
      return d >= startDate && d <= endDate;
    });

    const employeeMap = new Map<string, EmployeeSummary>();

    sheetRecords.forEach((record) => {
      const existing = employeeMap.get(record.employee_id);
      const isWork = record.status === 'present' || !!record.check_in_time || !!record.check_in_at;
      if (existing) {
        if (isWork) existing.actualDays += 1;
        existing.overtimeHours += record.overtime_hours || 0;
      } else {
        employeeMap.set(record.employee_id, {
          employee_id: record.employee_id,
          employee_code: record.employee_code || 'NV',
          employee_name: record.employee_name || 'Nhân sự',
          department: record.department,
          actualDays: isWork ? 1 : 0,
          overtimeHours: record.overtime_hours || 0,
          period: formatPeriod(selectedSheet),
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
        {/* Header navigation & title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setSelectedSheet(null)} className="h-8 w-8">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold font-display">{selectedSheet.name}</h2>
              <span className={cn(
                "px-2.5 py-0.5 rounded-full text-xs font-semibold border",
                selectedSheet.status === 'closed'
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              )}>
                {selectedSheet.status === 'closed' ? 'Đã chốt' : 'Nháp'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="gap-1.5"
              onClick={() => setShowSettingsDialog(true)}
            >
              <Settings2 className="w-4 h-4 text-primary" />
              Thiết lập Bảng công
            </Button>
            <Button
              variant={selectedSheet.status === 'closed' ? "outline" : "default"}
              className={cn(
                "gap-2 font-medium",
                selectedSheet.status === 'closed'
                  ? "text-amber-700 hover:text-amber-800 hover:bg-amber-50"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              )}
              onClick={() => handleToggleCloseSheet()}
              data-testid="pay-att-sheet-toggle-close-btn"
            >
              {selectedSheet.status === 'closed' ? (
                <>
                  <Unlock className="w-4 h-4" />
                  Mở lại bảng công
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Chốt bảng công
                </>
              )}
            </Button>
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
                <DropdownMenuItem className="gap-2" onClick={() => setShowSettingsDialog(true)}>
                  <Settings2 className="w-4 h-4" />
                  Cấu hình thành phần chấm công
                </DropdownMenuItem>
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

        {/* Info summary row */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-muted/30 p-3 rounded-lg border text-sm">
          <div className="flex items-center gap-4 text-muted-foreground">
            <span>{p('period')}: <strong className="text-foreground">{formatPeriod(selectedSheet)}</strong></span>
            <span>•</span>
            <span>Hình thức: <strong className="text-foreground">{getAttendanceTypeLabel(selectedSheet.attendance_type)}</strong></span>
            {selectedSheet.department && (
              <>
                <span>•</span>
                <span>Đơn vị: <strong className="text-foreground">{selectedSheet.department}</strong></span>
              </>
            )}
            <span>•</span>
            <span>Nhân sự: <strong className="text-foreground">{filteredEmployees.length} người</strong></span>
          </div>

          {/* View mode switcher */}
          <div className="flex items-center gap-1 bg-background border p-1 rounded-md shadow-sm">
            <Button
              variant={viewMode === 'matrix' ? 'default' : 'ghost'}
              size="sm"
              className="h-7 gap-1.5 text-xs"
              onClick={() => setViewMode('matrix')}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Ma trận 31 ngày
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              className="h-7 gap-1.5 text-xs"
              onClick={() => setViewMode('calendar')}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              Lịch tháng
            </Button>
            <Button
              variant={viewMode === 'summary' ? 'default' : 'ghost'}
              size="sm"
              className="h-7 gap-1.5 text-xs"
              onClick={() => setViewMode('summary')}
            >
              <ListFilter className="w-3.5 h-3.5" />
              Tổng hợp
            </Button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t('payroll.searchEmployee')}
              className="pl-10 h-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {viewMode === 'calendar' && (
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <Select value={selectedEmpForCalendar} onValueChange={setSelectedEmpForCalendar}>
                <SelectTrigger className="w-[240px] h-9">
                  <SelectValue placeholder="Chọn nhân sự xem lịch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">-- Tất cả nhân sự --</SelectItem>
                  {filteredEmployees.map((emp) => (
                    <SelectItem key={emp.employee_id} value={emp.employee_id}>
                      {emp.employee_code} - {emp.employee_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* VIEW 1: MATRIX VIEW (Ma trận 31 ngày đầy đủ giờ vào / ra & Bưu cục) */}
        {viewMode === 'matrix' && (
          <Card className="overflow-hidden border shadow-sm">
            {isRecordsLoading ? (
              <div className="p-8 text-center space-y-3">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                <p className="text-sm text-muted-foreground">Đang tải dữ liệu chấm công ma trận 31 ngày...</p>
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[680px]">
                <table className="w-full text-xs border-collapse">
                  <thead className="sticky top-0 z-20 bg-muted/95 backdrop-blur border-b shadow-sm">
                    <tr>
                      <th className="sticky left-0 z-30 bg-muted p-2 font-semibold text-left w-10 border-r">#</th>
                      <th className="sticky left-10 z-30 bg-muted p-2 font-semibold text-left min-w-[90px] border-r">Mã NV</th>
                      <th className="sticky left-[130px] z-30 bg-muted p-2 font-semibold text-left min-w-[160px] border-r shadow-md">Họ và tên</th>
                      {sheetDaysList.map((d) => (
                        <th
                          key={d.dateStr}
                          className={cn(
                            "p-1.5 font-semibold text-center border-r min-w-[62px]",
                            d.isSunday ? "bg-rose-50/80 text-rose-700" : "text-foreground"
                          )}
                        >
                          <div className="text-[10px] text-muted-foreground uppercase">{d.dayName}</div>
                          <div className="text-xs font-bold">{d.dayNum < 10 ? `0${d.dayNum}` : d.dayNum}</div>
                        </th>
                      ))}
                      <th className="p-2 font-semibold text-center min-w-[70px] border-r bg-muted">Tổng công</th>
                      <th className="p-2 font-semibold text-center min-w-[70px] bg-muted">Tổng giờ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.length === 0 ? (
                      <tr>
                        <td colSpan={sheetDaysList.length + 5} className="p-8 text-center text-muted-foreground">
                          {p('noDataInPeriod')}
                        </td>
                      </tr>
                    ) : (
                      filteredEmployees.map((emp, idx) => (
                        <tr key={emp.employee_id} className="border-b hover:bg-muted/20 transition-colors">
                          <td className="sticky left-0 z-10 bg-background p-2 text-muted-foreground border-r text-center">{idx + 1}</td>
                          <td className="sticky left-10 z-10 bg-background p-2 font-medium border-r">{emp.employee_code}</td>
                          <td className="sticky left-[130px] z-10 bg-background p-2 font-semibold border-r shadow-sm">
                            <div className="truncate max-w-[150px]" title={emp.employee_name}>
                              {emp.employee_name}
                            </div>
                          </td>
                          {sheetDaysList.map((d) => {
                            const rec = recordsMap.get(`${emp.employee_id}_${d.dateStr}`);
                            const checkIn = formatCheckTime(rec?.check_in_time || rec?.check_in_at);
                            const checkOut = formatCheckTime(rec?.check_out_time || rec?.check_out_at);
                            const isPresent = rec?.status === 'present' || (checkIn && checkOut);

                            // Extract Bưu cục / location tag from note if available
                            const locationTag = rec?.note && rec.note.includes('Bưu cục:')
                              ? rec.note.split('Bưu cục:')[1].split('(')[0].trim()
                              : '';

                            return (
                              <td
                                key={d.dateStr}
                                className={cn(
                                  "p-1 border-r text-center align-middle transition-colors",
                                  d.isSunday && "bg-slate-50/50"
                                )}
                              >
                                {isPresent ? (
                                  <div
                                    className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 text-emerald-900 rounded p-1 text-[10px] font-mono leading-tight flex flex-col items-center justify-center cursor-pointer shadow-2xs group relative"
                                    title={`${emp.employee_name} — Ngày ${d.dayNum}/08: Vào ${checkIn || '08:00'} - Ra ${checkOut || '17:00'}${locationTag ? ` (${locationTag})` : ''}`}
                                  >
                                    <span className="font-bold text-emerald-800">{checkIn || '08:00'}</span>
                                    {locationTag ? (
                                      <span className="text-[9px] font-semibold text-blue-700 bg-blue-100/80 px-1 rounded my-0.5 truncate max-w-[54px]">
                                        {locationTag}
                                      </span>
                                    ) : (
                                      <span className="text-[9px] text-emerald-600 font-medium">{checkOut || '17:00'}</span>
                                    )}
                                  </div>
                                ) : rec?.status === 'off' || d.isSunday ? (
                                  <div className="bg-slate-100 text-slate-400 rounded py-1 text-[10px] font-medium">
                                    Nghỉ
                                  </div>
                                ) : rec?.status === 'absent' ? (
                                  <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded py-1 text-[10px] font-bold">
                                    Vắng
                                  </div>
                                ) : rec?.status === 'leave' ? (
                                  <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded py-1 text-[10px] font-medium">
                                    Phép
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground/40 text-[10px]">-</span>
                                )}
                              </td>
                            );
                          })}
                          <td className="p-2 border-r text-center font-bold text-emerald-700 bg-muted/10">
                            {emp.actualDays}
                          </td>
                          <td className="p-2 text-center font-medium text-slate-700 bg-muted/10">
                            {(emp.actualDays * 8).toFixed(0)}h
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}

        {/* VIEW 2: CALENDAR VIEW (Lịch chấm công chi tiết theo tháng) */}
        {viewMode === 'calendar' && (
          <Card className="p-4 border shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-primary" />
                Lịch chi tiết chấm công — Tháng 08/2026
              </h3>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
                  <span>Có mặt (Đủ giờ vào/ra)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-slate-400 inline-block"></span>
                  <span>Nghỉ tuần</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
                  <span>Vắng</span>
                </div>
              </div>
            </div>

            {/* Calendar Grid 7 days (T2 -> CN) */}
            <div className="grid grid-cols-7 gap-2">
              {['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'].map((dayHead, i) => (
                <div
                  key={dayHead}
                  className={cn(
                    "p-2 text-center font-semibold text-xs rounded bg-muted/60",
                    i === 6 ? "text-rose-600 bg-rose-50/50" : "text-foreground"
                  )}
                >
                  {dayHead}
                </div>
              ))}

              {/* Offset for August 1, 2026 (Saturday = col 6, offset 5) */}
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-[100px] bg-muted/10 rounded border border-dashed border-muted"></div>
              ))}

              {sheetDaysList.map((d) => {
                let presentCount = 0;
                let singleEmpRec: AttendanceRecord | undefined = undefined;

                if (selectedEmpForCalendar === 'all') {
                  filteredEmployees.forEach((emp) => {
                    const r = recordsMap.get(`${emp.employee_id}_${d.dateStr}`);
                    if (r?.status === 'present' || (r?.check_in_at && r?.check_out_at)) {
                      presentCount++;
                    }
                  });
                } else {
                  singleEmpRec = recordsMap.get(`${selectedEmpForCalendar}_${d.dateStr}`);
                }

                const checkIn = singleEmpRec ? formatCheckTime(singleEmpRec.check_in_time || singleEmpRec.check_in_at) : '08:00';
                const checkOut = singleEmpRec ? formatCheckTime(singleEmpRec.check_out_time || singleEmpRec.check_out_at) : '17:00';
                const isSinglePresent = singleEmpRec ? (singleEmpRec.status === 'present' || (!!checkIn && !!checkOut)) : false;

                return (
                  <div
                    key={d.dateStr}
                    className={cn(
                      "min-h-[110px] p-2 rounded-lg border flex flex-col justify-between transition-all hover:shadow-md",
                      d.isSunday
                        ? "bg-slate-50/80 border-slate-200"
                        : "bg-background border-border hover:border-primary/50"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className={cn(
                        "text-xs font-bold h-6 w-6 rounded-full flex items-center justify-center",
                        d.isSunday ? "bg-rose-100 text-rose-700" : "bg-muted text-foreground"
                      )}>
                        {d.dayNum}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">{d.dayName}</span>
                    </div>

                    <div className="my-1.5">
                      {selectedEmpForCalendar === 'all' ? (
                        d.isSunday ? (
                          <div className="text-[11px] text-slate-500 font-medium bg-slate-100 p-1.5 rounded text-center">
                            Nghỉ chủ nhật
                          </div>
                        ) : (
                          <div className="bg-emerald-50 border border-emerald-200 p-1.5 rounded text-center">
                            <div className="text-xs font-bold text-emerald-800">{presentCount || filteredEmployees.length} / {filteredEmployees.length}</div>
                            <div className="text-[10px] text-emerald-600 font-medium">Có mặt (08:00 - 17:00)</div>
                          </div>
                        )
                      ) : (
                        isSinglePresent ? (
                          <div className="bg-emerald-50 border border-emerald-200 p-1.5 rounded space-y-1">
                            <div className="flex items-center justify-between text-[11px] text-emerald-800 font-semibold">
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Vào:</span>
                              <span>{checkIn}</span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-emerald-800 font-semibold">
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Ra:</span>
                              <span>{checkOut}</span>
                            </div>
                          </div>
                        ) : d.isSunday ? (
                          <div className="text-[11px] text-slate-500 font-medium bg-slate-100 p-1.5 rounded text-center">
                            Nghỉ tuần
                          </div>
                        ) : (
                          <div className="text-[11px] text-rose-600 font-bold bg-rose-50 border border-rose-200 p-1.5 rounded text-center">
                            Vắng mặt
                          </div>
                        )
                      )}
                    </div>

                    <div className="text-[9px] text-muted-foreground text-right font-mono">
                      {!d.isSunday ? '8.0 giờ công' : 'Nghỉ'}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* VIEW 3: SUMMARY LIST (Bảng tổng hợp công & OT) */}
        {viewMode === 'summary' && (
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
                              <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
                                {emp.employee_name.split(' ').pop()?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{emp.employee_name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-muted-foreground">{emp.period}</td>
                        <td className="p-4 text-muted-foreground">{emp.department || 'Phòng Điều Phối Hàng Hóa'}</td>
                        <td className="p-4 text-right font-bold text-emerald-700">{emp.actualDays}</td>
                        <td className="p-4 text-right text-muted-foreground font-medium">
                          {emp.overtimeHours.toFixed(1)}h
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
        )}

        {/* Attendance Settings Dialog */}
        <AttendanceSettingsDialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog} />
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

  // Main list view of attendance sheets
  return (
    <div className="space-y-4 p-6" data-testid="pay-attendance-data-precision">
      <div className="flex items-center justify-between">
        <h2 className="text-[20px] font-bold font-display text-xevn-text">{t('payroll.dataAttendance')}</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-1.5" onClick={() => setShowSettingsDialog(true)}>
            <Settings2 className="w-4 h-4 text-primary" />
            Thiết lập Thành phần Chấm công
          </Button>
          <Button
            className="gap-2 bg-xevn-primary hover:bg-xevn-primaryPressed text-white"
            onClick={() => setShowAddDialog(true)}
          >
            <Plus className="w-4 h-4" />
            {t('common.addNew', 'Thêm mới')}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t('common.search', 'Tìm kiếm...')}
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => setShowSettingsDialog(true)}>
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
                <th className="text-left p-4 font-medium text-sm">Trạng thái</th>
                <th className="text-left p-4 font-medium text-sm w-32"></th>
              </tr>
            </thead>
            <tbody>
              {filteredSheets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-muted-foreground">
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
                    <td className="p-4 text-muted-foreground">{sheet.department || t('common.all', 'Tất cả')}</td>
                    <td className="p-4 text-muted-foreground">{sheet.positions || t('common.all', 'Tất cả')}</td>
                    <td className="p-4 text-muted-foreground">{formatPeriod(sheet)}</td>
                    <td className="p-4">
                      <span className="text-muted-foreground font-medium">
                        {getAttendanceTypeLabel(sheet.attendance_type)}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={cn(
                        "px-2.5 py-0.5 rounded-full text-xs font-semibold border whitespace-nowrap",
                        sheet.status === 'closed'
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      )}>
                        {sheet.status === 'closed' ? 'Đã chốt' : 'Nháp'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div
                        className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn(
                            "h-8 w-8",
                            sheet.status === 'closed' ? "text-amber-700 hover:text-amber-800" : "text-emerald-600 hover:text-emerald-700"
                          )}
                          title={sheet.status === 'closed' ? 'Mở lại bảng công' : 'Chốt bảng công'}
                          onClick={() => handleToggleCloseSheet(sheet)}
                        >
                          {sheet.status === 'closed' ? <Unlock className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                        </Button>
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
        <DialogContent className="sm:max-w-[920px]" data-testid="pay-attendance-create-dialog-precision">
          <DialogHeader>
            <DialogTitle className="text-[20px] font-bold font-display">{p('createTitle')}</DialogTitle>
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
                <ViDatePickerField
                  id="start-date"
                  value={newSheetStartDate}
                  onValueChange={setNewSheetStartDate}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">{p('toDate')} *</Label>
                <ViDatePickerField
                  id="end-date"
                  value={newSheetEndDate}
                  onValueChange={setNewSheetEndDate}
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

      {/* Attendance Settings Dialog */}
      <AttendanceSettingsDialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog} />
    </div>
  );
}
