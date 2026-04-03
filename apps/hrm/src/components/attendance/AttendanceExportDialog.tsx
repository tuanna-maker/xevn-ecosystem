import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileSpreadsheet, Download, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { vi, enUS, zhCN } from 'date-fns/locale';

interface AttendanceExportDialogProps {
  children?: React.ReactNode;
}

interface AttendanceRecord {
  id: string;
  employee_id: string;
  employee_code: string;
  employee_name: string;
  department: string | null;
  attendance_date: string;
  check_in_time: string | null;
  check_out_time: string | null;
  actual_hours: number | null;
  late_minutes: number | null;
  early_leave_minutes: number | null;
  overtime_hours: number | null;
  status: string;
  attendance_type: string | null;
  check_in_location: string | null;
  check_out_location: string | null;
  notes: string | null;
}

interface EmployeeSummary {
  employee_code: string;
  employee_name: string;
  department: string;
  total_days: number;
  present_days: number;
  late_days: number;
  early_leave_days: number;
  absent_days: number;
  leave_days: number;
  total_hours: number;
  total_late_minutes: number;
  total_early_leave_minutes: number;
  total_overtime_hours: number;
  attendance_rate: number;
}

export function AttendanceExportDialog({ children }: AttendanceExportDialogProps) {
  const { t, i18n } = useTranslation();
  const { currentCompanyId } = useAuth();
  const [open, setOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const getDateLocale = () => {
    switch (i18n.language) {
      case 'en': return enUS;
      case 'zh': return zhCN;
      default: return vi;
    }
  };

  const getStatusLabel = (status: string): string => {
    const statusMap: Record<string, string> = {
      present: t('attendanceExport.status.onTime'),
      late: t('attendanceExport.status.late'),
      early_leave: t('attendanceExport.status.earlyLeave'),
      absent: t('attendanceExport.status.absent'),
      on_leave: t('attendanceExport.status.onLeave'),
      business_trip: t('attendanceExport.status.businessTrip'),
      holiday: t('attendanceExport.status.holiday'),
      weekend: t('attendanceExport.status.weekend'),
    };
    return statusMap[status] || status;
  };

  const fetchMonthlyRecords = async (): Promise<AttendanceRecord[]> => {
    const year = parseInt(selectedYear);
    const month = parseInt(selectedMonth);
    const startDate = format(startOfMonth(new Date(year, month - 1)), 'yyyy-MM-dd');
    const endDate = format(endOfMonth(new Date(year, month - 1)), 'yyyy-MM-dd');

    if (!currentCompanyId) {
      throw new Error(t('attendanceExport.errors.noCompany'));
    }

    const { data, error } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('company_id', currentCompanyId)
      .gte('attendance_date', startDate)
      .lte('attendance_date', endDate)
      .order('attendance_date', { ascending: true })
      .order('employee_name', { ascending: true });

    if (error) throw error;
    return data || [];
  };

  const calculateSummary = (records: AttendanceRecord[]): EmployeeSummary[] => {
    const employeeMap = new Map<string, AttendanceRecord[]>();

    records.forEach(record => {
      const key = record.employee_id;
      if (!employeeMap.has(key)) {
        employeeMap.set(key, []);
      }
      employeeMap.get(key)!.push(record);
    });

    const summaries: EmployeeSummary[] = [];
    employeeMap.forEach((empRecords, _employeeId) => {
      const firstRecord = empRecords[0];
      const summary: EmployeeSummary = {
        employee_code: firstRecord.employee_code,
        employee_name: firstRecord.employee_name,
        department: firstRecord.department || 'N/A',
        total_days: empRecords.length,
        present_days: empRecords.filter(r => r.status === 'present').length,
        late_days: empRecords.filter(r => r.status === 'late').length,
        early_leave_days: empRecords.filter(r => r.status === 'early_leave').length,
        absent_days: empRecords.filter(r => r.status === 'absent').length,
        leave_days: empRecords.filter(r => r.status === 'on_leave').length,
        total_hours: empRecords.reduce((sum, r) => sum + (r.actual_hours || 0), 0),
        total_late_minutes: empRecords.reduce((sum, r) => sum + (r.late_minutes || 0), 0),
        total_early_leave_minutes: empRecords.reduce((sum, r) => sum + (r.early_leave_minutes || 0), 0),
        total_overtime_hours: empRecords.reduce((sum, r) => sum + (r.overtime_hours || 0), 0),
        attendance_rate: 0,
      };
      
      const workDays = summary.present_days + summary.late_days + summary.early_leave_days;
      summary.attendance_rate = summary.total_days > 0 
        ? Math.round((workDays / summary.total_days) * 100) 
        : 0;
      
      summaries.push(summary);
    });

    return summaries.sort((a, b) => a.employee_name.localeCompare(b.employee_name));
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const records = await fetchMonthlyRecords();
      
      if (records.length === 0) {
        toast.warning(t('attendanceExport.noData'));
        return;
      }

      const summaries = calculateSummary(records);
      const workbook = XLSX.utils.book_new();

      // Sheet 1: Summary Statistics
      const summaryData = summaries.map((s, index) => ({
        [t('attendanceExport.columns.no')]: index + 1,
        [t('attendanceExport.columns.empCode')]: s.employee_code,
        [t('attendanceExport.columns.fullName')]: s.employee_name,
        [t('attendanceExport.columns.department')]: s.department,
        [t('attendanceExport.columns.totalDays')]: s.total_days,
        [t('attendanceExport.columns.onTime')]: s.present_days,
        [t('attendanceExport.columns.late')]: s.late_days,
        [t('attendanceExport.columns.earlyLeave')]: s.early_leave_days,
        [t('attendanceExport.columns.absent')]: s.absent_days,
        [t('attendanceExport.columns.onLeave')]: s.leave_days,
        [t('attendanceExport.columns.totalHours')]: s.total_hours.toFixed(1),
        [t('attendanceExport.columns.lateMinutes')]: s.total_late_minutes,
        [t('attendanceExport.columns.earlyLeaveMinutes')]: s.total_early_leave_minutes,
        [t('attendanceExport.columns.otHours')]: s.total_overtime_hours.toFixed(1),
        [t('attendanceExport.columns.attendanceRate')]: s.attendance_rate,
      }));

      const summarySheet = XLSX.utils.json_to_sheet(summaryData);
      
      summarySheet['!cols'] = [
        { wch: 5 }, { wch: 10 }, { wch: 25 }, { wch: 20 }, { wch: 10 },
        { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 },
        { wch: 12 }, { wch: 15 }, { wch: 18 }, { wch: 12 }, { wch: 12 },
      ];
      
      XLSX.utils.book_append_sheet(workbook, summarySheet, t('attendanceExport.sheets.summary'));

      // Sheet 2: Detailed Records
      const detailData = records.map((r, index) => ({
        [t('attendanceExport.columns.no')]: index + 1,
        [t('attendanceExport.columns.date')]: format(new Date(r.attendance_date), 'dd/MM/yyyy'),
        [t('attendanceExport.columns.dayOfWeek')]: format(new Date(r.attendance_date), 'EEEE', { locale: getDateLocale() }),
        [t('attendanceExport.columns.empCode')]: r.employee_code,
        [t('attendanceExport.columns.fullName')]: r.employee_name,
        [t('attendanceExport.columns.department')]: r.department || '',
        [t('attendanceExport.columns.checkIn')]: r.check_in_time?.slice(0, 5) || '',
        [t('attendanceExport.columns.checkOut')]: r.check_out_time?.slice(0, 5) || '',
        [t('attendanceExport.columns.workHours')]: r.actual_hours?.toFixed(1) || '',
        [t('attendanceExport.columns.lateMinutes')]: r.late_minutes || 0,
        [t('attendanceExport.columns.earlyLeaveMinutes')]: r.early_leave_minutes || 0,
        [t('attendanceExport.columns.otHours')]: r.overtime_hours?.toFixed(1) || '',
        [t('attendanceExport.columns.status')]: getStatusLabel(r.status),
        [t('attendanceExport.columns.type')]: r.attendance_type === 'remote' ? t('attendanceExport.types.wfh') : 
                   r.attendance_type === 'field_work' ? t('attendanceExport.types.fieldWork') : t('attendanceExport.types.office'),
        [t('attendanceExport.columns.checkInLocation')]: r.check_in_location || '',
        [t('attendanceExport.columns.checkOutLocation')]: r.check_out_location || '',
        [t('attendanceExport.columns.notes')]: r.notes || '',
      }));

      const detailSheet = XLSX.utils.json_to_sheet(detailData);
      
      detailSheet['!cols'] = [
        { wch: 5 }, { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 25 },
        { wch: 20 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 12 },
        { wch: 14 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 30 },
        { wch: 30 }, { wch: 30 },
      ];
      
      XLSX.utils.book_append_sheet(workbook, detailSheet, t('attendanceExport.sheets.detail'));

      // Sheet 3: Daily Overview
      const year = parseInt(selectedYear);
      const month = parseInt(selectedMonth);
      const daysInMonth = eachDayOfInterval({
        start: startOfMonth(new Date(year, month - 1)),
        end: endOfMonth(new Date(year, month - 1)),
      });

      const dailyStats = daysInMonth.map(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const dayRecords = records.filter(r => r.attendance_date === dateStr);
        
        return {
          [t('attendanceExport.columns.date')]: format(day, 'dd/MM'),
          [t('attendanceExport.columns.dayOfWeek')]: format(day, 'EEE', { locale: getDateLocale() }),
          [t('attendanceExport.columns.totalEmployees')]: dayRecords.length,
          [t('attendanceExport.columns.onTime')]: dayRecords.filter(r => r.status === 'present').length,
          [t('attendanceExport.columns.late')]: dayRecords.filter(r => r.status === 'late').length,
          [t('attendanceExport.columns.earlyLeave')]: dayRecords.filter(r => r.status === 'early_leave').length,
          [t('attendanceExport.columns.absent')]: dayRecords.filter(r => r.status === 'absent').length,
          [t('attendanceExport.columns.onLeave')]: dayRecords.filter(r => r.status === 'on_leave').length,
          [t('attendanceExport.columns.totalHours')]: dayRecords.reduce((sum, r) => sum + (r.actual_hours || 0), 0).toFixed(1),
          [t('attendanceExport.columns.totalOT')]: dayRecords.reduce((sum, r) => sum + (r.overtime_hours || 0), 0).toFixed(1),
        };
      });

      const dailySheet = XLSX.utils.json_to_sheet(dailyStats);
      dailySheet['!cols'] = [
        { wch: 8 }, { wch: 8 }, { wch: 10 }, { wch: 10 }, { wch: 10 },
        { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 },
      ];
      
      XLSX.utils.book_append_sheet(workbook, dailySheet, t('attendanceExport.sheets.daily'));

      const fileName = `${t('attendanceExport.fileName')}_${selectedMonth.padStart(2, '0')}-${selectedYear}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
      toast.success(t('attendanceExport.success', { fileName }));
      setOpen(false);
    } catch (error) {
      console.error('Export error:', error);
      toast.error(t('attendanceExport.error'));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            {t('attendanceExport.exportButton')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            {t('attendanceExport.title')}
          </DialogTitle>
          <DialogDescription>
            {t('attendanceExport.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('attendanceExport.year')}</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('attendanceExport.month')}</Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map(month => (
                    <SelectItem key={month} value={month.toString()}>
                      {t('attendanceExport.monthLabel', { month })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-sm">{t('attendanceExport.reportContent')}:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• <strong>{t('attendanceExport.sheets.summary')}:</strong> {t('attendanceExport.summaryDesc')}</li>
              <li>• <strong>{t('attendanceExport.sheets.detail')}:</strong> {t('attendanceExport.detailDesc')}</li>
              <li>• <strong>{t('attendanceExport.sheets.daily')}:</strong> {t('attendanceExport.dailyDesc')}</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('attendanceExport.exporting')}
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                {t('attendanceExport.exportExcel')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
