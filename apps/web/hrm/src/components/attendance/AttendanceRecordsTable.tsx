/**
 * @CODE-MEMORY
 * Screen: HRM → Chấm công → Dữ liệu chấm công (AttendanceRecordsTable)
 * UC: HRM-AT-02 list · HRM-AT-03 PATCH status · matrix #13 · J-HRM-06 mutate
 * SRS: docs/qa/professional/by-uc/HRM-AT-03.md · PATCH …/records/:id/status
 * TechSpec: docs/hrm/TECHSPEC.md attendance records status
 * Purpose: List LIVE GET records; row «Chỉnh sửa» mở modal chọn status → updateRecord PATCH 2xx → refetch.
 * WorkItem: PO-MFD-M2-ATT-RECORDS-EDIT-01
 * Coded: 2026-08-04
 * Callers: Attendance.tsx (activeAttendanceType=records / data view)
 * Callees: useAttendanceRecords.updateRecord · toApiAttendanceStatus · updateAttendanceStatus
 * must_keep: List GET LIVE; Delete≠status UX cheat; CLOCK/SHEETS/LEAVE/OT; Face HOLD; U65; no Attendance CLOSED claim
 * Impact: Sửa không onClick → STUB edit (R-MFD-M2-ATT-RECORDS-EDIT-STUB)
 *
 * @CODE-MEMORY-CHANGE 2026-08-04 PO-MFD-M2-ATT-RECORDS-EDIT-01
 * change_mode: FIX
 * What: Wire DropdownMenuItem Edit → Dialog status select → updateRecord PATCH; saving disable
 * Why: QC GWC list-only — patchesFired=0 · dialogAfterEdit=false
 * must_keep: list path; API status enum pending|present|absent|leave only
 *
 * @CODE-MEMORY-CHANGE 2026-08-04 PO-MFD-M2-ATT-RECORDS-EDIT-01-R3-FE
 * change_mode: FIX (consumer — transport in hrmApi/hook)
 * What: Edit Lưu vẫn qua updateRecord; scope x-company-id = JWT/OU (hook → resolveHrmMutateCompanyScope)
 * Why: QA R2 PATCH 409 HRM-ATT-409 when header main on member trsport
 * must_keep: dialog/status/save/date testids; DATE harden; list GET LIVE; no Delete→absent AT-03
 *
 * @CODE-MEMORY-CHANGE 2026-08-04 PO-MFD-M2-ATT-RECORDS-EDIT-01-R2-FE
 * change_mode: FIX
 * What: Safe date display in edit Dialog via formatAttendanceRecordDateDisplay (check_in_at fallback)
 * Why: QA FAIL R-MFD-M2-ATT-RECORDS-EDIT-DATE-CRASH — attendance_date «Tue Aug 04» + T00:00:00 → Invalid time value
 * must_keep: PATCH updateRecord + testids; list GET LIVE; no Delete→absent cheat
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-W3-ATT-A
 * change_mode: UPGRADE
 * What: Today records table chrome → Precision Motion sharp labels (S22)
 * Why: ADR-XEVN-PRECISION-MOTION-TOKENS-20260805 §8–§10
 * must_keep: PATCH updateRecord + date harden + x-company-id scope; Face HOLD; U65
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-W3-ATT-B
 * change_mode: UPGRADE
 * What: Records tab list + edit/delete dialogs (S26–S28) — primary CTA, sharp summary, AlertDialog title ≥20
 * Why: ADR-XEVN-PRECISION-MOTION-TOKENS-20260805 §8–§10 · inventory W3-ATT-B
 * must_keep: PATCH updateRecord + date harden + x-company-id; deleteRecord wire; dialog.tsx R1; no Attendance CLOSED
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-W3-ATT-E
 * change_mode: UPGRADE
 * What: Date filter (S30) + export trigger (S29) chrome polish — sharp outline labels
 * Why: ADR-XEVN-PRECISION-MOTION-TOKENS-20260805 §8–§10 · inventory W3-ATT-E S29–S30
 * must_keep: date → useAttendanceRecords(dateString); export dialog client XLSX; PATCH edit; no Attendance CLOSED
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-W4-ATT-DIALOG-EXT
 * change_mode: ADD
 * What: Edit/delete dialogs → title ≥20 + compact select/reason + *dialog-precision aliases kept with legacy testids
 * Why: ADR §16 LOCK · FE-DIALOG-01 shell · inventory S27–S28 delete/export chain
 * must_keep: PATCH updateRecord; deleteRecord; attendance-record-edit-* / delete-dialog testids; U65 no seed
 * LastVerified: docs/qa/evidence/po-hrm-ui-brand-w4-att-dialog-ext.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-06 PO-HRM-ATT-LEAVE-FUNNEL-FE-01
 * change_mode: ADD
 * What: getStatusBadge prefer status_label + leave_type_label when status=leave (display-ready only)
 * Why: F-ATT-LEAVE-FUNNEL-03 / AC-ATT-LV-SHEET-01 Bản ghi — cấm Option C GET leave-requests tô màu
 * must_keep: list GET only; no poll; J-HRM-06b; edit PATCH; attendance_uat_ready=false
 * LastVerified: docs/qa/evidence/po-hrm-att-leave-funnel-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-08 PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-FE-01
 * change_mode: ADD
 * What: Edit/filter status Select bind Nest GET …/attendance-codes/effective; EFF=0 bootstrap closed-4
 * Why: SA Option A LOCKED · AC-PLT-ATT-CODE-01/01f · VAL-CNS-06 — cấm hardcode sole SoT khi EFF>0
 * must_keep: list GET LIVE; PATCH updateRecord Nest code; HRM-ATT-CODE-KEY toast; early_leave/on_leave
 *            không sole Edit SoT khi EFF>0; OT/COMP pickers; L1 KEY LIVE; Face HOLD; U65; ready=false
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-att-code-catalog-fe-01.md
 */
import { useMemo, useState } from 'react';
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Search,
  CalendarIcon,
  MoreHorizontal,
  Pencil,
  Trash2,
  LogIn,
  LogOut,
  MapPin,
  Filter,
  RefreshCw,
  FileSpreadsheet,
} from 'lucide-react';
import { AttendanceExportDialog } from './AttendanceExportDialog';
import {
  useAttendanceRecords,
  type AttendanceRecord,
} from '@/hooks/useAttendanceRecords';
import {
  ATT_ATTENDANCE_CODE_BOOTSTRAP_FALLBACK,
  resolveAttAttendanceCodeEditValue,
  resolveAttAttendanceCodeLabel,
  useAttAttendanceCodesEffective,
  type AttAttendanceCodePickerOption,
} from '@/hooks/useAttAttendanceCodesEffective';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { formatAttendanceRecordDateDisplay } from '@/lib/attendanceRecordDateDisplay';
import {
  isAttendanceLeaveStatus,
  resolveAttendanceLeaveDisplayLabel,
} from '@/lib/attendanceLeaveDisplay';
import { cn } from '@/lib/utils';

export function AttendanceRecordsTable() {
  const { t } = useTranslation();
  const [dateFilter, setDateFilter] = useState<Date | undefined>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteRecordId, setDeleteRecordId] = useState<string | null>(null);
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [editStatus, setEditStatus] = useState<string>('present');
  const [editNote, setEditNote] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const dateString = dateFilter ? format(dateFilter, 'yyyy-MM-dd') : undefined;
  const { records, isLoading, deleteRecord, updateRecord, refetch } = useAttendanceRecords(dateString);

  // VAL-ATT-CODE-CNS-06 — bind catalog ký hiệu công hiệu lực của Nest.
  const {
    nestOptions,
    effectiveCount,
    isLoading: attCodesLoading,
    isError: attCodesError,
  } = useAttAttendanceCodesEffective();

  const bootstrapAttCodes = useMemo<AttAttendanceCodePickerOption[]>(
    () =>
      ATT_ATTENDANCE_CODE_BOOTSTRAP_FALLBACK.map((o) => ({
        code: o.code,
        name: t(o.i18nKey, { defaultValue: o.defaultNameVi }),
      })),
    [t],
  );

  /** EFF>0 → picker Nest (code/nameVi/symbol); EFF=0 → bootstrap pending|present|absent|leave. */
  const attCodeCatalogBound = effectiveCount > 0;
  const statusOptions: AttAttendanceCodePickerOption[] = attCodeCatalogBound
    ? nestOptions
    : bootstrapAttCodes;

  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.employee_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (record.department?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  /** Legacy i18n map — chỉ fallback khi catalog không có mã (lịch sử). */
  const statusLabelFallback = (status: string) => {
    const map: Record<string, string> = {
      present: t('attendance.present', { defaultValue: 'Có mặt' }),
      late: t('attendance.late', { defaultValue: 'Đi muộn' }),
      early_leave: t('attendance.early', { defaultValue: 'Về sớm' }),
      absent: t('attendance.absent', { defaultValue: 'Vắng mặt' }),
      on_leave: t('attendance.onLeave', { defaultValue: 'Nghỉ phép' }),
      leave: t('attendance.onLeave', { defaultValue: 'Nghỉ phép' }),
      pending: t('common.status.pending', { defaultValue: 'Chờ xử lý' }),
      business_trip: t('status.businessTrip', { defaultValue: 'Công tác' }),
      holiday: t('status.holiday', { defaultValue: 'Ngày lễ' }),
      weekend: t('status.weekend', { defaultValue: 'Cuối tuần' }),
    };
    return map[status] || status;
  };

  const statusLabel = (status: string) => {
    const fromCatalog = resolveAttAttendanceCodeLabel(statusOptions, status);
    if (fromCatalog && fromCatalog !== status) return fromCatalog;
    if (statusOptions.some((o) => o.code.toLowerCase() === status.toLowerCase())) {
      return fromCatalog;
    }
    return statusLabelFallback(status);
  };

  const getStatusBadge = (record: AttendanceRecord) => {
    const variantMap: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      present: 'default',
      late: 'destructive',
      early_leave: 'secondary',
      absent: 'destructive',
      on_leave: 'outline',
      leave: 'outline',
      pending: 'secondary',
      business_trip: 'outline',
      holiday: 'outline',
      weekend: 'outline',
    };
    const variant = variantMap[record.status] ?? 'outline';
    const label = isAttendanceLeaveStatus(record.status)
      ? resolveAttendanceLeaveDisplayLabel(record, statusLabel(record.status))
      : record.status_label?.trim() || statusLabel(record.status);
    return (
      <Badge
        variant={variant}
        data-testid={`attendance-record-status-${record.id}`}
        data-status={record.status}
        data-leave-request-id={record.leave_request_id ?? undefined}
      >
        {label}
      </Badge>
    );
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

  const openEditModal = (record: AttendanceRecord) => {
    setEditingRecord(record);
    setEditStatus(
      resolveAttAttendanceCodeEditValue(statusOptions, record.status, attCodeCatalogBound),
    );
    setEditNote(record.notes ?? '');
  };

  const handleSaveEdit = async () => {
    if (!editingRecord || isSavingEdit) return;
    if (!editStatus) return;
    setIsSavingEdit(true);
    try {
      const ok = await updateRecord(editingRecord.id, {
        status: editStatus,
        notes: editNote.trim() ? editNote.trim() : null,
      });
      if (ok) {
        setEditingRecord(null);
      }
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDelete = async () => {
    if (deleteRecordId) {
      await deleteRecord(deleteRecordId);
      setDeleteRecordId(null);
    }
  };

  return (
    <div className="space-y-4" data-testid="attendance-records-table">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-xevn-textMuted" />
          <Input
            placeholder={t('attendanceRecords.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-[15px] text-xevn-text"
          />
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="min-w-[200px] justify-start border-xevn-border text-xevn-text"
              data-testid="att-records-date-filter"
            >
              <CalendarIcon className="mr-2 h-4 w-4 text-xevn-primary" />
              {dateFilter ? format(dateFilter, 'dd/MM/yyyy', { locale: vi }) : t('attendanceRecords.selectDate')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 border-xevn-border" align="start">
            <Calendar
              mode="single"
              selected={dateFilter}
              onSelect={setDateFilter}
              locale={vi}
            />
          </PopoverContent>
        </Popover>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger
            className="w-[180px]"
            data-testid="att-attendance-code-filter"
          >
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder={t('attendanceRecords.statusFilter')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common.all')}</SelectItem>
            {statusOptions.map((opt) => (
              <SelectItem key={opt.code} value={opt.code}>
                {opt.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" size="icon" onClick={() => refetch()}>
          <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
        </Button>

        <AttendanceExportDialog>
          <Button variant="outline" className="border-xevn-border text-xevn-text" data-testid="att-records-export">
            <FileSpreadsheet className="mr-2 h-4 w-4 text-xevn-primary" />
            {t('attendanceRecords.exportReport')}
          </Button>
        </AttendanceExportDialog>
      </div>

      {attCodesError ? (
        <p
          className="text-sm text-destructive"
          data-testid="att-attendance-code-catalog-error"
        >
          {t('attendanceRecords.attCodeCatalogError', {
            defaultValue: 'Không tải được danh mục ký hiệu công hiệu lực. Đang dùng mức khởi tạo (nếu catalog trống).',
          })}
        </p>
      ) : null}
      {!attCodesLoading && !attCodeCatalogBound ? (
        <p
          className="text-sm text-xevn-textSecondary"
          data-testid="att-attendance-code-catalog-bootstrap-hint"
        >
          {t('attendanceRecords.attCodeCatalogBootstrapHint', {
            defaultValue:
              'Chưa có ký hiệu công trong danh mục đơn vị — đang dùng mức khởi tạo (chờ xử lý / có mặt / vắng / nghỉ). Không seed.',
          })}
        </p>
      ) : null}

      {/* Summary Stats — DNA status + primary total (ops density, no pale gray) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="p-3 rounded-card border border-xevn-border bg-xevn-surface">
          <div className="text-2xl font-bold text-green-700 tabular-nums">{filteredRecords.filter(r => r.status === 'present').length}</div>
          <div className="text-sm text-xevn-textSecondary">{t('attendanceRecords.onTime')}</div>
        </div>
        <div className="p-3 rounded-card border border-xevn-border bg-xevn-surface">
          <div className="text-2xl font-bold text-red-700 tabular-nums">{filteredRecords.filter(r => r.status === 'late').length}</div>
          <div className="text-sm text-xevn-textSecondary">{t('attendanceRecords.lateCount')}</div>
        </div>
        <div className="p-3 rounded-card border border-xevn-border bg-xevn-surface">
          <div className="text-2xl font-bold text-amber-800 tabular-nums">{filteredRecords.filter(r => r.status === 'early_leave').length}</div>
          <div className="text-sm text-xevn-textSecondary">{t('attendanceRecords.earlyLeaveCount')}</div>
        </div>
        <div className="p-3 rounded-card border border-xevn-border bg-xevn-surface">
          <div className="text-2xl font-bold text-xevn-text tabular-nums">{filteredRecords.filter(r => r.status === 'absent').length}</div>
          <div className="text-sm text-xevn-textSecondary">{t('attendanceRecords.absentCount')}</div>
        </div>
        <div className="p-3 rounded-card border border-xevn-border bg-xevn-surface">
          <div className="text-2xl font-bold text-xevn-primary tabular-nums">{filteredRecords.length}</div>
          <div className="text-sm text-xevn-textSecondary">{t('attendanceRecords.totalCount')}</div>
        </div>
      </div>

      {/* Table */}
      <div className="border border-xevn-border rounded-card overflow-hidden bg-xevn-surface">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px] text-xevn-textSecondary font-semibold">#</TableHead>
              <TableHead className="text-xevn-textSecondary font-semibold">{t('attendanceRecords.employee')}</TableHead>
              <TableHead className="text-xevn-textSecondary font-semibold">{t('attendanceRecords.department')}</TableHead>
              <TableHead className="text-center text-xevn-textSecondary font-semibold">{t('attendanceRecords.checkIn')}</TableHead>
              <TableHead className="text-center text-xevn-textSecondary font-semibold">{t('attendanceRecords.checkOut')}</TableHead>
              <TableHead className="text-center text-xevn-textSecondary font-semibold">{t('attendanceRecords.workHours')}</TableHead>
              <TableHead className="text-center text-xevn-textSecondary font-semibold">{t('attendanceRecords.status')}</TableHead>
              <TableHead className="text-center text-xevn-textSecondary font-semibold">{t('attendanceRecords.type')}</TableHead>
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
                <TableCell colSpan={9} className="text-center py-10 text-xevn-textSecondary">
                  {t('attendanceRecords.noData')}
                </TableCell>
              </TableRow>
            ) : (
              filteredRecords.map((record, index) => (
                <TableRow key={record.id}>
                  <TableCell className="text-xevn-textSecondary">{index + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="text-xs bg-xevn-primary/10 text-xevn-primary font-medium">
                          {record.employee_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-xevn-text">{record.employee_name}</div>
                        <div className="text-xs text-xevn-textSecondary">{record.employee_code}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-xevn-textSecondary">{record.department || '-'}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center">
                      <div className="flex items-center gap-1 font-medium text-green-600">
                        <LogIn className="h-3.5 w-3.5" />
                        {record.check_in_time?.slice(0, 5) || '--:--'}
                      </div>
                      {record.check_in_location && (
                        <div className="flex items-center gap-1 text-xs text-xevn-textSecondary">
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
                      <div className="flex items-center gap-1 font-medium text-xevn-primary">
                        <LogOut className="h-3.5 w-3.5" />
                        {record.check_out_time?.slice(0, 5) || '--:--'}
                      </div>
                      {record.check_out_location && (
                        <div className="flex items-center gap-1 text-xs text-xevn-textSecondary">
                          <MapPin className="h-3 w-3" />
                          {record.check_out_location}
                        </div>
                      )}
                      {(record.early_leave_minutes ?? 0) > 0 && (
                        <span className="text-xs text-amber-800">-{record.early_leave_minutes} {t('attendanceRecords.minutes')}</span>
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
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          aria-label={t('attendanceRecords.edit')}
                          data-testid={`attendance-record-row-menu-${record.id}`}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onSelect={() => openEditModal(record)}
                          data-testid={`attendance-record-edit-${record.id}`}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          {t('attendanceRecords.edit')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onSelect={() => setDeleteRecordId(record.id)}
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

      {/* Edit status modal — HRM-AT-03 · Nest EFF status Select */}
      <Dialog
        open={!!editingRecord}
        onOpenChange={(open) => {
          if (!open && !isSavingEdit) setEditingRecord(null);
        }}
      >
        <DialogContent
          className="sm:max-w-[480px]"
          data-testid="attendance-record-edit-dialog"
        >
          <DialogHeader>
            <DialogTitle className="text-[20px] font-bold text-xevn-text">
              {t('attendanceRecords.edit')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-sm text-xevn-textSecondary">{t('attendanceRecords.employee')}</Label>
              <Input
                value={
                  editingRecord
                    ? `${editingRecord.employee_name} (${editingRecord.employee_code})`
                    : ''
                }
                readOnly
                className="bg-muted xevn-field-name"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-xevn-textSecondary">{t('attendanceRecords.selectDate')}</Label>
              <Input
                value={
                  editingRecord
                    ? formatAttendanceRecordDateDisplay(
                        editingRecord.attendance_date,
                        editingRecord.check_in_at,
                      )
                    : ''
                }
                readOnly
                className="bg-muted xevn-field-date"
                data-testid="attendance-record-edit-date"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="att-record-edit-status" className="text-xevn-text">{t('attendanceRecords.status')} *</Label>
              <Select
                value={editStatus}
                onValueChange={(v) => setEditStatus(v)}
                disabled={attCodesLoading || statusOptions.length === 0}
              >
                <SelectTrigger
                  id="att-record-edit-status"
                  className="xevn-field-select-md"
                  data-testid="attendance-record-edit-status"
                >
                  <SelectValue
                    placeholder={
                      attCodesLoading
                        ? t('common.loading', { defaultValue: 'Đang tải...' })
                        : t('attendanceRecords.status')
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((opt) => (
                    <SelectItem key={opt.code} value={opt.code}>
                      {opt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!attCodeCatalogBound ? (
                <p className="text-xs text-xevn-textSecondary" data-testid="att-code-edit-bootstrap-hint">
                  {t('attendanceRecords.attCodeCatalogBootstrapHint', {
                    defaultValue:
                      'Chưa có ký hiệu công trong danh mục đơn vị — đang dùng mức khởi tạo (chờ xử lý / có mặt / vắng / nghỉ). Không seed.',
                  })}
                </p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="att-record-edit-note" className="text-xevn-text">{t('attendanceRecords.editNote', { defaultValue: 'Ghi chú' })}</Label>
              <Textarea
                id="att-record-edit-note"
                data-testid="attendance-record-edit-note"
                value={editNote}
                onChange={(e) => setEditNote(e.target.value)}
                placeholder={t('attendanceRecords.editNotePlaceholder', {
                  defaultValue: 'Ghi chú cập nhật trạng thái (tuỳ chọn)',
                })}
                rows={3}
                maxLength={1000}
                className="xevn-field-reason text-xevn-text"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="border-xevn-border"
              onClick={() => setEditingRecord(null)}
              disabled={isSavingEdit}
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={isSavingEdit || !editingRecord || !editStatus || attCodesLoading}
              data-testid="attendance-record-edit-save"
              className="bg-xevn-primary hover:bg-xevn-primaryPressed text-white"
            >
              {isSavingEdit
                ? t('common.loading', { defaultValue: 'Đang lưu...' })
                : t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation — S28 · W4 shared AlertDialog chrome (legacy testid must_keep) */}
      <AlertDialog open={!!deleteRecordId} onOpenChange={() => setDeleteRecordId(null)}>
        <AlertDialogContent data-testid="attendance-record-delete-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[20px] font-bold text-xevn-text">
              {t('attendanceRecords.deleteConfirmTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[15px] text-xevn-textSecondary">
              {t('attendanceRecords.deleteConfirmMessage')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

