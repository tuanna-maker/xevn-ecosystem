/**
 * @CODE-MEMORY
 * Screen:     Attendance → Leave tab → Tạo yêu cầu nghỉ (create dialog)
 * UC:          UC-HRM-ATT-LEAVE-01 · J-HRM-06
 * BR:          BR-LEAVE-01
 * SRS:         docs/hrm/SRS.md § attendance leave requests
 * TechSpec:    docs/hrm/TECHSPEC.md § leave + employee list keyword
 * Purpose:     Leave request list/approve UI + create dialog. Employee pickers
 *              use capped keyword typeahead (HLD-#### beyond first page).
 * WorkItem:    CD-FB-07-FE-LEAVE-PICKER
 * Coded:       2026-07-19
 *
 * Callers: Attendance page Leave tab
 * Callees: useLeaveRequests · useEmployeePickerSearch → listEmployees
 * must_keep: soft-nav Attendance; F4-01/02 product path; no listAllEmployees; U65 no seed
 * SOLID: Picker read path = useEmployeePickerSearch (shared W2); leave mutate stays in useLeaveRequests
 * LastVerified: apps/web/hrm/src/hooks/useEmployeePicker.test.ts (LeaveTab typeahead)
 *
 * @CODE-MEMORY-CHANGE 2026-07-19 CD-FB-07-FE-LEAVE-PICKER
 *   C-CD-FB-07-01: replace useEmployees dump Select with deferred typeahead
 *   (keyword → GET employees page=1) so HLD-0006 selectable beyond first ~50–100.
 *   Snapshot selected employee for submit after keyword clear. Handover picker same pattern.
 *
 * @CODE-MEMORY-CHANGE 2026-07-23 D-HRM-SETTINGS-MD-CRUD-FE-01
 * change_mode: ADD
 * What: Leave type CatalogSearchPicker từ leave_types catalog (bootstrap discrete nếu empty)
 * Why: FR-HRM-SC-LEAVE-01 · AC-HRM-PICKER-01 · BR-HRM-MD-01
 *
 * @CODE-MEMORY-CHANGE 2026-07-25 D-HRM-SETTINGS-MD-LEAVE-FE-01
 * change_mode: UPGRADE
 * What: Gỡ bootstrap 8 loại nghỉ hardcode khi catalog trống — empty + CTA Cài đặt/sync
 * Why: AC-SET-FS-05 · BR-SET-MD-03 · QA FAIL qa-hrm-settings-master-data-01-20260725
 * must_keep: create/approve khi catalog có item; UF leave 🟢 với catalog thật; U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-07-27 D-HRM-LEAVE-REQ-CREATE-FE-01
 * change_mode: FIX
 * What: Submit vẫn bind employee.company_id; hook maps UUID→TEXT slug holding (G-AT10-01)
 * Why: QA P1 residual FE POST holding UUID; Settings catalog partition alignment
 * must_keep: leave_type CatalogSearchPicker SoT; create dialog path; U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-07-27 D-FE-U72-LEAVE-NOTE-HYGIENE-01
 * change_mode: ADD
 * What: Display lý do nghỉ qua sanitizeLeaveNoteDisplay — `seed:…` → «—»; form nhập không đụng
 * Why: QC C-U72-LEAVE-NOTE-HYGIENE ENV residue trên PNG leave
 * must_keep: C-U72-LEAVE-P3 leave-type unknown→—; soft P2 CLOSED; U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-08-01 D-HDSD-MUTATE-FE-09
 * change_mode: FIX
 * What: Prefill start/end qua pickNonOverlappingLeaveWindow khi mở dialog — tránh POST 409 overlap U65
 * Why: QA R6 TC-HDSD-08-02-01 — 2027-05-05..07 trùng prior browser rows
 * must_keep: U65 no seed; ViDateField dd/MM/yyyy; overview F5 marker path
 */
import { useMemo, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { format, parseISO, eachDayOfInterval, differenceInDays } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import i18n from '@/i18n';
import {
  Calendar as CalendarIcon,
  Plus,
  Check,
  X,
  Clock,
  FileText,
  User,
  Filter,
  Trash2,
  Loader2,
  Eye,
  MessageSquare,
} from 'lucide-react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ViDateField } from '@/components/ui/ViDateField';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import {
  useDebouncedPickerKeyword,
  useEmployeePickerSearch,
} from '@/hooks/useEmployeePicker';
import { useLeaveRequests, LeaveRequestFormData, LeaveRequest } from '@/hooks/useLeaveRequests';
import { useSettingsCatalogsOverview } from '@/hooks/useSettingsCatalogsOverview';
import { CatalogSearchPicker } from '@/components/common/CatalogSearchPicker';
import {
  isCatalogPickerValueAllowed,
  leaveTypeOptionsFromCatalog,
  resolveLeaveTypeLabel,
} from '@/lib/catalogSearchPicker';
import { sanitizeLeaveNoteDisplay } from '@/lib/labelMaps';
import { HDSD_MUTATE_TEST_IDS } from '@/lib/hdsdMutateTestIds';
import { pickNonOverlappingLeaveWindow } from '@/lib/leaveRequestDateWindow';
import type { HrmEmployeeRecord } from '@/integrations/hrmApi';
import { cn } from '@/lib/utils';

function employeeDeptLabel(emp: HrmEmployeeRecord): string {
  const fromCustom = emp.custom_fields?.department?.trim();
  if (fromCustom) return fromCustom;
  return emp.job_title_key?.trim() || '';
}

function employeePositionLabel(emp: HrmEmployeeRecord): string | undefined {
  const fromCustom = emp.custom_fields?.position?.trim();
  if (fromCustom) return fromCustom;
  return emp.job_title_key?.trim() || undefined;
}

/** Neutral badge chrome — not a leave-type SoT palette (BR-SET-MD-03). */
const LEAVE_TYPE_BADGE_CLASS = 'bg-slate-600';

const EMPTY_LEAVE_FORM = {
  employeeId: '',
  leaveType: '',
  startDate: '',
  endDate: '',
  reason: '',
  handoverTo: '',
  handoverTasks: '',
} as const;

export function LeaveTab() {
  const { t } = useTranslation();
  const { currentCompanyId } = useAuth();
  const { requests, isLoading, createRequest, approveRequest, rejectRequest, deleteRequest } = useLeaveRequests();
  /** Catalog for create picker + list filter + display labels (AC-SET-FS-04/05). */
  const {
    catalogs,
    isLoading: catalogsLoading,
    isError: catalogsError,
  } = useSettingsCatalogsOverview();
  const currentLocale = i18n.language === 'vi' ? vi : enUS;
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  /** CD-FB-07: keyword typeahead — never dump full roster into Select. */
  const [employeeKeyword, setEmployeeKeyword] = useState('');
  const [handoverKeyword, setHandoverKeyword] = useState('');
  const debouncedEmployeeKeyword = useDebouncedPickerKeyword(employeeKeyword, 300);
  const debouncedHandoverKeyword = useDebouncedPickerKeyword(handoverKeyword, 300);
  const [selectedEmployee, setSelectedEmployee] = useState<HrmEmployeeRecord | null>(null);

  const {
    employees: pickerEmployees,
    total: pickerTotal,
    isCapped: pickerCapped,
    isFetching: pickerFetching,
  } = useEmployeePickerSearch({
    companyId: currentCompanyId,
    keyword: debouncedEmployeeKeyword,
    enabled: Boolean(currentCompanyId) && isCreateOpen,
  });

  const {
    employees: handoverEmployees,
    total: handoverTotal,
    isCapped: handoverCapped,
    isFetching: handoverFetching,
  } = useEmployeePickerSearch({
    companyId: currentCompanyId,
    keyword: debouncedHandoverKeyword,
    enabled: Boolean(currentCompanyId) && isCreateOpen,
  });

  const [formData, setFormData] = useState({ ...EMPTY_LEAVE_FORM });
  const reasonInputRef = useRef<HTMLTextAreaElement>(null);

  const resetCreateForm = () => {
    setFormData({ ...EMPTY_LEAVE_FORM });
    setEmployeeKeyword('');
    setHandoverKeyword('');
    setSelectedEmployee(null);
  };

  const handleCreateOpenChange = (open: boolean) => {
    setIsCreateOpen(open);
    if (!open) {
      resetCreateForm();
    } else {
      setEmployeeKeyword('');
      setHandoverKeyword('');
      const window = pickNonOverlappingLeaveWindow(
        requests.map((r) => ({
          start_date: r.start_date,
          end_date: r.end_date,
          status: r.status,
        })),
        Date.now(),
      );
      setFormData((prev) => ({
        ...prev,
        startDate: window.startIso,
        endDate: window.endIso,
      }));
    }
  };

  const handleEmployeeSelect = (employeeId: string) => {
    const emp = pickerEmployees.find((e) => e.id === employeeId) ?? null;
    setSelectedEmployee(emp);
    setFormData((prev) => ({
      ...prev,
      employeeId,
      // Clear handover if it pointed at the same person
      handoverTo: prev.handoverTo && emp && prev.handoverTo === emp.full_name ? '' : prev.handoverTo,
    }));
  };

  const leaveTypeOptions = useMemo(
    () => leaveTypeOptionsFromCatalog(catalogs ?? []),
    [catalogs],
  );

  const leaveTypeDisplayLabel = (code: string) =>
    resolveLeaveTypeLabel(leaveTypeOptions, code);

  const selectedReasonDisplay = sanitizeLeaveNoteDisplay(selectedRequest?.reason);
  const selectedRejectDisplay = sanitizeLeaveNoteDisplay(selectedRequest?.rejected_reason);

  // Stats
  const totalRequests = requests.length;
  const pendingRequests = requests.filter((r) => r.status === 'pending').length;
  const approvedRequests = requests.filter((r) => r.status === 'approved').length;
  const totalLeaveDays = requests
    .filter((r) => r.status === 'approved')
    .reduce((sum, r) => sum + Number(r.total_days), 0);

  // Get all leave dates for calendar highlighting
  const getLeaveDates = () => {
    const dates: { date: Date; type: string; status: string }[] = [];
    requests.forEach((request) => {
      try {
        const start = parseISO(request.start_date);
        const end = parseISO(request.end_date);
        const interval = eachDayOfInterval({ start, end });
        interval.forEach((date) => {
          dates.push({ date, type: request.leave_type, status: request.status });
        });
      } catch (e) {
        // Skip invalid dates
      }
    });
    return dates;
  };

  const leaveDates = getLeaveDates();

  // Filter requests
  const filteredRequests = requests.filter((request) => {
    if (filterStatus !== 'all' && request.status !== filterStatus) return false;
    if (filterType !== 'all' && request.leave_type !== filterType) return false;
    return true;
  });

  // Get leaves for selected date
  const leavesOnSelectedDate = selectedDate
    ? requests.filter((request) => {
        try {
          const start = parseISO(request.start_date);
          const end = parseISO(request.end_date);
          return selectedDate >= start && selectedDate <= end;
        } catch {
          return false;
        }
      })
    : [];

  const handleApprove = async (id: string) => {
    setIsApproving(true);
    await approveRequest(id);
    setIsApproving(false);
  };

  const handleOpenRejectModal = (id: string) => {
    setSelectedRequestId(id);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const handleReject = async () => {
    if (selectedRequestId) {
      setIsRejecting(true);
      await rejectRequest(selectedRequestId, rejectReason || undefined);
      setIsRejecting(false);
      setRejectModalOpen(false);
      setSelectedRequestId(null);
      setRejectReason('');
    }
  };

  const handleOpenDetailModal = (request: LeaveRequest) => {
    setSelectedRequest(request);
    setDetailModalOpen(true);
  };

  const handleDelete = async () => {
    if (selectedRequestId) {
      await deleteRequest(selectedRequestId);
      setDeleteModalOpen(false);
      setSelectedRequestId(null);
    }
  };

  const handleSubmit = async () => {
    if (!formData.employeeId || !formData.startDate || !formData.endDate) {
      return;
    }
    if (!isCatalogPickerValueAllowed(leaveTypeOptions, formData.leaveType, { allowEmpty: false })) {
      return;
    }

    // Prefer snapshot so submit works after keyword clear (selected may leave page-1 options)
    const employee =
      selectedEmployee?.id === formData.employeeId
        ? selectedEmployee
        : pickerEmployees.find((e) => e.id === formData.employeeId);
    if (!employee) return;

    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    const totalDays = differenceInDays(endDate, startDate) + 1;

    if (totalDays <= 0) {
      return;
    }

    setIsSubmitting(true);
    const reasonText =
      formData.reason.trim() || reasonInputRef.current?.value.trim() || '';
    const data: LeaveRequestFormData = {
      company_id: employee.company_id,
      employee_id: employee.id,
      employee_code: employee.employee_code,
      employee_name: employee.full_name,
      department: employeeDeptLabel(employee) || undefined,
      position: employeePositionLabel(employee),
      leave_type: formData.leaveType,
      start_date: formData.startDate,
      end_date: formData.endDate,
      total_days: totalDays,
      reason: reasonText || undefined,
      handover_to: formData.handoverTo || undefined,
      handover_tasks: formData.handoverTasks || undefined,
    };

    const result = await createRequest(data);
    setIsSubmitting(false);
    
    if (result) {
      handleCreateOpenChange(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{t('leave.title')}</h2>
          <p className="text-sm text-muted-foreground">{t('leave.subtitle')}</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={handleCreateOpenChange}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t('leave.createRequest')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{t('leave.createRequest')}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>{t('leave.selectEmployee')}</Label>
                <Input
                  value={employeeKeyword}
                  onChange={(e) => setEmployeeKeyword(e.target.value)}
                  placeholder={t('leave.searchEmployee')}
                  aria-label={t('leave.searchEmployee')}
                />
                {pickerCapped && (
                  <p className="text-xs text-muted-foreground">
                    {t('leave.pickerCappedHint', {
                      shown: pickerEmployees.length,
                      total: pickerTotal,
                    })}
                  </p>
                )}
                <Select
                  value={formData.employeeId || undefined}
                  onValueChange={handleEmployeeSelect}
                  disabled={pickerFetching && pickerEmployees.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        pickerFetching
                          ? t('common.loading')
                          : t('leave.selectEmployee')
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {pickerFetching && pickerEmployees.length === 0 ? (
                      <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t('common.loading')}
                      </div>
                    ) : pickerEmployees.length === 0 ? (
                      <div className="py-4 text-center text-sm text-muted-foreground">
                        {t('leave.noEmployeesFound')}
                      </div>
                    ) : (
                      pickerEmployees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.full_name} — {emp.employee_code}
                          {employeeDeptLabel(emp)
                            ? ` · ${employeeDeptLabel(emp)}`
                            : ''}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>{t('leave.selectLeaveType')}</Label>
                <CatalogSearchPicker
                  options={leaveTypeOptions}
                  value={formData.leaveType}
                  onValueChange={(v) => setFormData({ ...formData, leaveType: v })}
                  placeholder={t('leave.selectLeaveType')}
                  loading={catalogsLoading}
                  errorText={catalogsError ? t('settings.catalogs.loadError') : undefined}
                  emptyHint={
                    <a href="/settings" className="text-primary underline text-xs font-medium">
                      Mở Cài đặt → Danh mục nghiệp vụ / Loại nghỉ
                    </a>
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>{t('leave.fromDate')}</Label>
                  <ViDateField
                    value={formData.startDate}
                    onValueChange={(v) => setFormData({ ...formData, startDate: v })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>{t('leave.toDate')}</Label>
                  <ViDateField
                    value={formData.endDate}
                    onValueChange={(v) => setFormData({ ...formData, endDate: v })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>{t('leave.handoverTo')}</Label>
                <Input
                  value={handoverKeyword}
                  onChange={(e) => setHandoverKeyword(e.target.value)}
                  placeholder={t('leave.searchHandover')}
                  aria-label={t('leave.searchHandover')}
                />
                {handoverCapped && (
                  <p className="text-xs text-muted-foreground">
                    {t('leave.pickerCappedHint', {
                      shown: handoverEmployees.filter((e) => e.id !== formData.employeeId).length,
                      total: handoverTotal,
                    })}
                  </p>
                )}
                <Select 
                  value={formData.handoverTo || undefined} 
                  onValueChange={(v) => setFormData({...formData, handoverTo: v})}
                  disabled={handoverFetching && handoverEmployees.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('leave.selectHandoverPerson')} />
                  </SelectTrigger>
                  <SelectContent>
                    {handoverFetching && handoverEmployees.length === 0 ? (
                      <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t('common.loading')}
                      </div>
                    ) : (
                      handoverEmployees
                        .filter((emp) => emp.id !== formData.employeeId)
                        .map((emp) => (
                          <SelectItem key={emp.id} value={emp.full_name}>
                            {emp.full_name} — {emp.employee_code}
                          </SelectItem>
                        ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>{t('leave.handoverTasks')}</Label>
                <Textarea 
                  placeholder={t('leave.enterHandoverTasks')} 
                  rows={2}
                  value={formData.handoverTasks}
                  onChange={(e) => setFormData({...formData, handoverTasks: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label>{t('leave.reason')}</Label>
                <Textarea
                  ref={reasonInputRef}
                  data-testid={HDSD_MUTATE_TEST_IDS.leaveReasonInput}
                  placeholder={t('leave.enterReason')}
                  rows={3}
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  onInput={(e) =>
                    setFormData({ ...formData, reason: e.currentTarget.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => handleCreateOpenChange(false)}>
                {t('common.cancel')}
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={
                  isSubmitting ||
                  leaveTypeOptions.length === 0 ||
                  !isCatalogPickerValueAllowed(leaveTypeOptions, formData.leaveType, {
                    allowEmpty: false,
                  })
                }
              >
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {t('leave.submitRequest')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          title={t('leave.totalRequests')}
          value={totalRequests}
          icon={FileText}
          trend={{ value: 2, isPositive: true }}
        />
        <StatsCard
          title={t('leave.pendingApproval')}
          value={pendingRequests}
          icon={Clock}
          variant="warning"
        />
        <StatsCard
          title={t('leave.approved')}
          value={approvedRequests}
          icon={Check}
          variant="success"
        />
        <StatsCard
          title={t('leave.totalLeaveDays')}
          value={totalLeaveDays}
          icon={CalendarIcon}
          subtitle={t('leave.approvedThisMonth')}
        />
      </div>

      <Tabs defaultValue="calendar" className="space-y-4">
        <TabsList>
          <TabsTrigger value="calendar">
            <CalendarIcon className="h-4 w-4 mr-2" />
            {t('leave.calendar')}
          </TabsTrigger>
          <TabsTrigger value="requests">
            <FileText className="h-4 w-4 mr-2" />
            {t('leave.requestList')}
          </TabsTrigger>
          <TabsTrigger value="approval">
            <Check className="h-4 w-4 mr-2" />
            {t('leave.pendingApproval')} ({pendingRequests})
          </TabsTrigger>
        </TabsList>

        {/* Calendar Tab */}
        <TabsContent value="calendar" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  {t('leave.calendar')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border pointer-events-auto"
                  locale={currentLocale}
                  modifiers={{
                    leave: leaveDates
                      .filter((d) => d.status === 'approved')
                      .map((d) => d.date),
                    pending: leaveDates
                      .filter((d) => d.status === 'pending')
                      .map((d) => d.date),
                  }}
                  modifiersStyles={{
                    leave: {
                      backgroundColor: 'hsl(var(--primary) / 0.2)',
                      color: 'hsl(var(--primary))',
                      fontWeight: 'bold',
                    },
                    pending: {
                      backgroundColor: 'hsl(var(--warning) / 0.2)',
                      color: 'hsl(var(--warning))',
                      fontWeight: 'bold',
                    },
                  }}
                />
                <div className="flex gap-4 mt-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary/20 border border-primary"></div>
                    <span>{t('leave.approved')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-warning/20 border border-warning"></div>
                    <span>{t('leave.pending')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedDate
                    ? format(selectedDate, 'dd/MM/yyyy', { locale: vi })
                    : t('leave.calendar')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {leavesOnSelectedDate.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    {t('leave.noLeaveOnDate')}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {leavesOnSelectedDate.map((leave) => (
                      <div
                        key={leave.id}
                        className="p-3 bg-muted/50 rounded-lg border"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{leave.employee_name}</span>
                          </div>
                          <StatusBadge status={leave.status as 'pending' | 'approved' | 'rejected'} />
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className={cn(
                              'text-white',
                              LEAVE_TYPE_BADGE_CLASS,
                            )}
                          >
                            {leaveTypeDisplayLabel(leave.leave_type)}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {leave.total_days} {t('common.days')}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          {sanitizeLeaveNoteDisplay(leave.reason)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Requests List Tab */}
        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <CardTitle>{t('leave.requestList')}</CardTitle>
                <div className="flex gap-2">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[150px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder={t('common.status.label')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('common.all')}</SelectItem>
                      <SelectItem value="pending">{t('leave.pending')}</SelectItem>
                      <SelectItem value="approved">{t('leave.approved')}</SelectItem>
                      <SelectItem value="rejected">{t('leave.rejected')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder={t('leave.leaveType')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('common.all')}</SelectItem>
                      {leaveTypeOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="saas-table">
                  <thead>
                    <tr>
                      <th>{t('nav.employees')}</th>
                      <th>{t('leave.leaveType')}</th>
                      <th>{t('leave.fromDate')}</th>
                      <th>{t('leave.toDate')}</th>
                      <th>{t('leave.days')}</th>
                      <th>{t('leave.reason')}</th>
                      <th>{t('common.status.label')}</th>
                      <th>{t('common.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((request) => (
                      <tr key={request.id}>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <span className="font-medium">{request.employee_name}</span>
                              <p className="text-xs text-muted-foreground">{request.employee_code}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <Badge
                            variant="secondary"
                            className={cn(
                              'text-white',
                              LEAVE_TYPE_BADGE_CLASS,
                            )}
                          >
                            {leaveTypeDisplayLabel(request.leave_type)}
                          </Badge>
                        </td>
                        <td>{format(parseISO(request.start_date), 'dd/MM/yyyy')}</td>
                        <td>{format(parseISO(request.end_date), 'dd/MM/yyyy')}</td>
                        <td className="font-medium">{request.total_days}</td>
                        <td className="max-w-[200px] truncate">
                          {sanitizeLeaveNoteDisplay(request.reason)}
                        </td>
                        <td>
                          <StatusBadge status={request.status as 'pending' | 'approved' | 'rejected'} />
                        </td>
                        <td>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenDetailModal(request)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => {
                                setSelectedRequestId(request.id);
                                setDeleteModalOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredRequests.length === 0 && (
                      <tr>
                        <td colSpan={8} className="text-center py-8 text-muted-foreground">
                          {t('common.noData')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Approval Tab */}
        <TabsContent value="approval" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('leave.pendingApproval')}</CardTitle>
            </CardHeader>
            <CardContent>
              {requests.filter((r) => r.status === 'pending').length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Check className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>{t('leave.noPendingRequests')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {requests
                    .filter((r) => r.status === 'pending')
                    .map((request) => (
                      <div
                        key={request.id}
                        className="p-4 border rounded-lg bg-muted/30"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{request.employee_name}</p>
                              <p className="text-sm text-muted-foreground">
                                {request.department}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenDetailModal(request)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              {t('common.view')}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950"
                              onClick={() => handleOpenRejectModal(request.id)}
                              disabled={isRejecting}
                            >
                              <X className="h-4 w-4 mr-1" />
                              {t('leave.reject')}
                            </Button>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleApprove(request.id)}
                              disabled={isApproving}
                            >
                              {isApproving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                              <Check className="h-4 w-4 mr-1" />
                              {t('leave.approve')}
                            </Button>
                          </div>
                        </div>
                        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">
                              {t('leave.leaveType')}:
                            </span>
                            <Badge
                              variant="secondary"
                              className={cn(
                                'ml-2 text-white',
                                LEAVE_TYPE_BADGE_CLASS,
                              )}
                            >
                              {leaveTypeDisplayLabel(request.leave_type)}
                            </Badge>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              {t('leave.fromDate')}:
                            </span>{' '}
                            {format(parseISO(request.start_date), 'dd/MM/yyyy')}
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              {t('leave.toDate')}:
                            </span>{' '}
                            {format(parseISO(request.end_date), 'dd/MM/yyyy')}
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              {t('leave.days')}:
                            </span>{' '}
                            <span className="font-medium">{request.total_days}</span>
                          </div>
                        </div>
                        {sanitizeLeaveNoteDisplay(request.reason) ? (
                          <div className="mt-2 text-sm">
                            <span className="text-muted-foreground">
                              {t('leave.reason')}:
                            </span>{' '}
                            {sanitizeLeaveNoteDisplay(request.reason)}
                          </div>
                        ) : null}
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('leave.deleteConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('leave.deleteConfirmMessage')}
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

      {/* Reject Reason Dialog */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              {t('leave.rejectReason')}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>{t('leave.enterRejectReason')}</Label>
              <Textarea 
                placeholder={t('leave.enterRejectReason')} 
                rows={4}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject}
              disabled={isRejecting}
            >
              {isRejecting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t('leave.confirmReject')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail View Dialog */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {t('leave.requestDetail')}
            </DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-lg">{selectedRequest.employee_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedRequest.employee_code} • {selectedRequest.department || t('common.noData')}
                  </p>
                </div>
                <StatusBadge status={selectedRequest.status as 'pending' | 'approved' | 'rejected'} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">{t('leave.leaveType')}</Label>
                  <div className="mt-1">
                    <Badge
                      variant="secondary"
                      className={cn(
                        'text-white',
                        LEAVE_TYPE_BADGE_CLASS,
                      )}
                    >
                      {leaveTypeDisplayLabel(selectedRequest.leave_type)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t('leave.days')}</Label>
                  <p className="mt-1 font-semibold text-lg">{selectedRequest.total_days} {t('common.days')}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t('leave.fromDate')}</Label>
                  <p className="mt-1 font-medium">{format(parseISO(selectedRequest.start_date), 'dd/MM/yyyy')}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t('leave.toDate')}</Label>
                  <p className="mt-1 font-medium">{format(parseISO(selectedRequest.end_date), 'dd/MM/yyyy')}</p>
                </div>
              </div>

              {selectedReasonDisplay ? (
                <div>
                  <Label className="text-muted-foreground">{t('leave.reason')}</Label>
                  <p className="mt-1 p-3 bg-muted/50 rounded-lg">{selectedReasonDisplay}</p>
                </div>
              ) : null}

              {selectedRequest.handover_to && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">{t('leave.handoverTo')}</Label>
                    <p className="mt-1 font-medium">{selectedRequest.handover_to}</p>
                  </div>
                  {selectedRequest.handover_tasks && (
                    <div>
                      <Label className="text-muted-foreground">{t('leave.handoverTasks')}</Label>
                      <p className="mt-1">{selectedRequest.handover_tasks}</p>
                    </div>
                  )}
                </div>
              )}

              {selectedRejectDisplay ? (
                <div>
                  <Label className="text-muted-foreground text-red-600">{t('leave.rejectReason')}</Label>
                  <p className="mt-1 p-3 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 rounded-lg">
                    {selectedRejectDisplay}
                  </p>
                </div>
              ) : null}

              <div className="text-xs text-muted-foreground border-t pt-4">
                {t('leave.createdAt')}: {format(parseISO(selectedRequest.created_at), 'dd/MM/yyyy HH:mm')}
                {selectedRequest.approved_at && (
                  <span className="ml-4">
                    {t('leave.approvedAt')}: {format(parseISO(selectedRequest.approved_at), 'dd/MM/yyyy HH:mm')}
                  </span>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailModalOpen(false)}>
              {t('common.close')}
            </Button>
            {selectedRequest?.status === 'pending' && (
              <>
                <Button 
                  variant="outline" 
                  className="text-red-600 border-red-200"
                  onClick={() => {
                    setDetailModalOpen(false);
                    handleOpenRejectModal(selectedRequest.id);
                  }}
                >
                  <X className="h-4 w-4 mr-1" />
                  {t('leave.reject')}
                </Button>
                <Button 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    handleApprove(selectedRequest.id);
                    setDetailModalOpen(false);
                  }}
                >
                  <Check className="h-4 w-4 mr-1" />
                  {t('leave.approve')}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
