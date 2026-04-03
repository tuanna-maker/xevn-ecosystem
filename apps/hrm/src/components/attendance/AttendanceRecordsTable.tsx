import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Search,
  CalendarIcon,
  MoreHorizontal,
  Pencil,
  Trash2,
  Clock,
  LogIn,
  LogOut,
  MapPin,
  Filter,
  RefreshCw,
  FileSpreadsheet,
} from 'lucide-react';
import { AttendanceExportDialog } from './AttendanceExportDialog';
import { useAttendanceRecords, type AttendanceRecord } from '@/hooks/useAttendanceRecords';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export function AttendanceRecordsTable() {
  const { t } = useTranslation();
  const [dateFilter, setDateFilter] = useState<Date | undefined>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteRecordId, setDeleteRecordId] = useState<string | null>(null);

  const dateString = dateFilter ? format(dateFilter, 'yyyy-MM-dd') : undefined;
  const { records, isLoading, deleteRecord, refetch } = useAttendanceRecords(dateString);

  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.employee_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (record.department?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (record: AttendanceRecord) => {
    const statusMap: Record<string, { labelKey: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      present: { labelKey: 'status.present', variant: 'default' },
      late: { labelKey: 'status.late', variant: 'destructive' },
      early_leave: { labelKey: 'status.earlyLeave', variant: 'secondary' },
      absent: { labelKey: 'status.absent', variant: 'destructive' },
      on_leave: { labelKey: 'status.onLeave', variant: 'outline' },
      business_trip: { labelKey: 'status.businessTrip', variant: 'outline' },
      holiday: { labelKey: 'status.holiday', variant: 'outline' },
      weekend: { labelKey: 'status.weekend', variant: 'outline' },
    };

    const status = statusMap[record.status] || { labelKey: record.status, variant: 'outline' as const };
    return <Badge variant={status.variant}>{t(status.labelKey)}</Badge>;
  };

  const getAttendanceTypeBadge = (type: string | null) => {
    if (!type) return null;
    const typeMap: Record<string, string> = {
      normal: 'attendanceType.normal',
      remote: 'attendanceType.remote',
      field_work: 'attendanceType.fieldWork',
    };
    return (
      <Badge variant="outline" className="text-xs">
        {t(typeMap[type]) || type}
      </Badge>
    );
  };

  const handleDelete = async () => {
    if (deleteRecordId) {
      await deleteRecord(deleteRecordId);
      setDeleteRecordId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('attendanceRecords.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="min-w-[200px] justify-start">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateFilter ? format(dateFilter, 'dd/MM/yyyy', { locale: vi }) : t('attendanceRecords.selectDate')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dateFilter}
              onSelect={setDateFilter}
              locale={vi}
            />
          </PopoverContent>
        </Popover>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder={t('attendanceRecords.statusFilter')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common.all')}</SelectItem>
            <SelectItem value="present">{t('status.present')}</SelectItem>
            <SelectItem value="late">{t('status.late')}</SelectItem>
            <SelectItem value="early_leave">{t('status.earlyLeave')}</SelectItem>
            <SelectItem value="absent">{t('status.absent')}</SelectItem>
            <SelectItem value="on_leave">{t('status.onLeave')}</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="icon" onClick={() => refetch()}>
          <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
        </Button>

        <AttendanceExportDialog>
          <Button variant="outline">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            {t('attendanceRecords.exportReport')}
          </Button>
        </AttendanceExportDialog>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{filteredRecords.filter(r => r.status === 'present').length}</div>
          <div className="text-sm text-green-600/80">{t('attendanceRecords.onTime')}</div>
        </div>
        <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{filteredRecords.filter(r => r.status === 'late').length}</div>
          <div className="text-sm text-red-600/80">{t('attendanceRecords.lateCount')}</div>
        </div>
        <div className="p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">{filteredRecords.filter(r => r.status === 'early_leave').length}</div>
          <div className="text-sm text-orange-600/80">{t('attendanceRecords.earlyLeaveCount')}</div>
        </div>
        <div className="p-3 bg-gray-50 dark:bg-gray-950/30 rounded-lg">
          <div className="text-2xl font-bold text-gray-600">{filteredRecords.filter(r => r.status === 'absent').length}</div>
          <div className="text-sm text-gray-600/80">{t('attendanceRecords.absentCount')}</div>
        </div>
        <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{filteredRecords.length}</div>
          <div className="text-sm text-blue-600/80">{t('attendanceRecords.totalCount')}</div>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">#</TableHead>
              <TableHead>{t('attendanceRecords.employee')}</TableHead>
              <TableHead>{t('attendanceRecords.department')}</TableHead>
              <TableHead className="text-center">{t('attendanceRecords.checkIn')}</TableHead>
              <TableHead className="text-center">{t('attendanceRecords.checkOut')}</TableHead>
              <TableHead className="text-center">{t('attendanceRecords.workHours')}</TableHead>
              <TableHead className="text-center">{t('attendanceRecords.status')}</TableHead>
              <TableHead className="text-center">{t('attendanceRecords.type')}</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-10">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    {t('attendanceRecords.loadingData')}
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-10 text-muted-foreground">
                  {t('attendanceRecords.noData')}
                </TableCell>
              </TableRow>
            ) : (
              filteredRecords.map((record, index) => (
                <TableRow key={record.id}>
                  <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {record.employee_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{record.employee_name}</div>
                        <div className="text-xs text-muted-foreground">{record.employee_code}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{record.department || '-'}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center">
                      <div className="flex items-center gap-1 font-medium text-green-600">
                        <LogIn className="h-3.5 w-3.5" />
                        {record.check_in_time?.slice(0, 5) || '--:--'}
                      </div>
                      {record.check_in_location && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {record.check_in_location}
                        </div>
                      )}
                      {(record.late_minutes ?? 0) > 0 && (
                        <span className="text-xs text-red-500">+{record.late_minutes} {t('attendanceRecords.minutes')}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center">
                      <div className="flex items-center gap-1 font-medium text-orange-600">
                        <LogOut className="h-3.5 w-3.5" />
                        {record.check_out_time?.slice(0, 5) || '--:--'}
                      </div>
                      {record.check_out_location && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {record.check_out_location}
                        </div>
                      )}
                      {(record.early_leave_minutes ?? 0) > 0 && (
                        <span className="text-xs text-orange-500">-{record.early_leave_minutes} {t('attendanceRecords.minutes')}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center">
                      <span className="font-medium">{record.actual_hours ? `${record.actual_hours}h` : '-'}</span>
                      {(record.overtime_hours ?? 0) > 0 && (
                        <span className="text-xs text-primary">+{record.overtime_hours}h OT</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{getStatusBadge(record)}</TableCell>
                  <TableCell className="text-center">{getAttendanceTypeBadge(record.attendance_type)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Pencil className="mr-2 h-4 w-4" />
                          {t('attendanceRecords.edit')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeleteRecordId(record.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t('attendanceRecords.delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteRecordId} onOpenChange={() => setDeleteRecordId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('attendanceRecords.deleteConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('attendanceRecords.deleteConfirmMessage')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
