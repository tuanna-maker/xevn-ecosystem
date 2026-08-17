/**
 * @CODE-MEMORY
 * Screen:     Attendance → Đơn từ → Đổi ca (S56–S57)
 * UC:         UC-HRM-ATT-SHIFT-CHANGE
 * Purpose:    Shift-change request list + add/detail/delete chrome
 * WorkItem:   PO-HRM-UI-BRAND-W3-ATT-D
 * Coded:      2026-08-05
 * must_keep:  create/approve/reject/delete wires; leave panel untouched; U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-W3-ATT-D
 * change_mode: UPGRADE
 * What: Remaster shift-change tab + modals → Precision Motion; ban orange/purple/blue chrome
 * Why: ADR-XEVN-PRECISION-MOTION-TOKENS-20260805 §8–§10 · inventory W3-ATT-D S56–S57
 * must_keep: mutate wires; Dialog title ≥20; no Nest/seed; no Attendance CLOSED; no LeaveTab fight
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-W3-ATT-D (stall#2)
 * change_mode: FIX
 * What: changeCount KPI amber→xevn secondary; pending DNA amber only
 * Why: RE-DISPATCH stall#2 — ban non-DNA orange chrome; evidence + theme-contrast re-close
 * must_keep: mutate wires; Dialog/Alert title ≥20; no Nest/seed
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-W4-ATT-DIALOG-EXT
 * change_mode: ADD
 * What: Wire shift-change add/detail/delete → shared chrome + compact fields + *dialog-precision
 * Why: ADR §16 LOCK · FE-DIALOG-01 shell · inventory S56–S57
 * must_keep: mutate wires; leave/OT/GPS wires; Face HOLD; U65 no seed
 * LastVerified: docs/qa/evidence/po-hrm-ui-brand-w4-att-dialog-ext.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-08 PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-FE-01
 * change_mode: FIX
 * What: Rebind current/requested shift picker → Nest GET work-shifts/effective khi active>0;
 *       hardcode 5-id (morning|afternoon|night|office|flexible) CHỈ khi Nest active=0 (empty bootstrap).
 *       Submit gửi Nest `code` (key) → HRM-ATT-SHIFT-KEY BE assert còn hiệu lực; nhãn bảng resolve code→name.
 * Why: QC GWC CONDITION R-PLT-ATT-SHIFT-CNS-02 · BA VAL-ATT-SHIFT-CNS-02 · AC-PLT-ATT-SHIFT-01
 * must_keep: mutate wires; submit dùng Nest key; fallback chỉ khi empty; ATT-CODE FE HOLD untouched;
 *            U65 no seed; no Settings dual-write; attendance_uat_ready=false
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-att-shift-catalog-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-ATT-01-CLUSTER-FE-01
 * change_mode: UPGRADE
 * What: EFF empty → CTA Danh sách ca (no bootstrap seed); picker chỉ nestOptions khi active>0;
 *       honesty banner · HRM-ATT-SHIFT-KEY surface · Nest /core 0 · ≠ ATT-01 DONE.
 * Why: UC-BP-ATT-01 · F-ATT-SHIFT-CNS-01 · AC-ATT-01-EMPTY/INVENT-BAN · J-HRM-ATT-01-04/05 · U65
 * Spec: docs/program/specs/PO-HRM-MVP-GD1-ATT-01-CLUSTER-API-01.md · BA-01 O5
 * must_keep: mutate wires; ATT11QC1-MSLXTH9P · ATT10QC1-MSLWGUYH · ATT09QC1-MSLUTL9D ·
 *            ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 CFG≠DONE · PLT/CORE · R-ATT-01-ASSIGN open ·
 *            printable false · PAY OUT · DENY att_leave_hold · U65
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-att-01-cluster-fe-01.md
 */
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Filter,
  Download,
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Eye,
  Check,
  X,
  Clock,
  CalendarIcon,
  AlertCircle,
  ArrowRightLeft,
  RefreshCw,
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
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { vi, enUS, zhCN } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { useEmployees } from '@/hooks/useEmployees';
import { useShiftChangeRequests, ShiftChangeRequest } from '@/hooks/useShiftChangeRequests';
import { useWorkShiftsEffective } from '@/hooks/useWorkShiftsEffective';
import { resolveWorkShiftLabel, type WorkShiftPickerOption } from '@/lib/workShiftCatalog';
import {
  att01EmptyCatalogCtaMessage,
  att01HonestyBannerText,
  isAtt01EffectiveEmpty,
} from '@/lib/attShift01Ring';

export function ShiftChangeRequestTab() {
  const { t, i18n } = useTranslation();
  const { employees } = useEmployees();
  const { requests, isLoading, createRequest, approveRequest, rejectRequest, deleteRequest } = useShiftChangeRequests();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ShiftChangeRequest | null>(null);

  const [formData, setFormData] = useState({
    employee: '',
    changeDate: undefined as Date | undefined,
    changeType: 'change' as 'swap' | 'change',
    currentShift: '',
    requestedShift: '',
    swapWithEmployee: '',
    reason: '',
  });

  const getDateLocale = () => {
    switch (i18n.language) {
      case 'en': return enUS;
      case 'zh': return zhCN;
      default: return vi;
    }
  };

  // VAL-ATT-SHIFT-CNS-02 / AC-ATT-01-CNS — bind Nest effective (active-only) work-shift catalog.
  const { nestOptions, activeCount, isLoading: isLoadingShiftsEff } = useWorkShiftsEffective();
  const catalogEmpty = isAtt01EffectiveEmpty(activeCount);

  // active>0 → picker Nest (code/name/times); =0 → empty CTA (no bootstrap seed · U65).
  const shifts: WorkShiftPickerOption[] = useMemo(
    () => (catalogEmpty ? [] : nestOptions),
    [catalogEmpty, nestOptions],
  );

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
    swapCount: requests.filter(r => r.change_type === 'swap').length,
    changeCount: requests.filter(r => r.change_type === 'change').length,
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'swap':
        return <Badge className="bg-xevn-primary/10 text-xevn-primary hover:bg-xevn-primary/10 border-0">{t('shiftChange.types.swap')}</Badge>;
      case 'change':
        return <Badge className="bg-xevn-textSecondary/15 text-xevn-text hover:bg-xevn-textSecondary/15 border-0">{t('shiftChange.types.change')}</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">{t('common.approved')}</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">{t('common.rejected')}</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">{t('common.pending')}</Badge>;
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesSearch = req.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         req.employee_code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    const matchesType = typeFilter === 'all' || req.change_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleAddRequest = async () => {
    if (catalogEmpty) return;
    if (!formData.employee || !formData.changeDate || !formData.currentShift || !formData.requestedShift || !formData.reason) {
      return;
    }

    const selectedEmployee = employees.find(e => e.id === formData.employee);
    if (!selectedEmployee) return;

    const currentShiftInfo = shifts.find(s => s.code === formData.currentShift);
    const requestedShiftInfo = shifts.find(s => s.code === formData.requestedShift);

    const result = await createRequest({
      employee_id: selectedEmployee.id,
      employee_code: selectedEmployee.employee_code,
      employee_name: selectedEmployee.full_name,
      department: selectedEmployee.department,
      position: selectedEmployee.position,
      change_date: format(formData.changeDate, 'yyyy-MM-dd'),
      change_type: formData.changeType,
      // Submit Nest `code` (key) — HRM-ATT-SHIFT-KEY assert BE còn hiệu lực khi active>0.
      current_shift: currentShiftInfo?.code || formData.currentShift,
      current_shift_time: currentShiftInfo?.time || '',
      requested_shift: requestedShiftInfo?.code || formData.requestedShift,
      requested_shift_time: requestedShiftInfo?.time || '',
      swap_with_employee_name: formData.changeType === 'swap' ? formData.swapWithEmployee : undefined,
      reason: formData.reason,
    });

    if (result) {
      setAddModalOpen(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({
      employee: '',
      changeDate: undefined,
      changeType: 'change',
      currentShift: '',
      requestedShift: '',
      swapWithEmployee: '',
      reason: '',
    });
  };

  const handleApprove = async (request: ShiftChangeRequest) => {
    await approveRequest(request.id);
    setDetailModalOpen(false);
  };

  const handleReject = async (request: ShiftChangeRequest) => {
    await rejectRequest(request.id, t('shiftChange.rejectReason'));
    setDetailModalOpen(false);
  };

  const handleDelete = async () => {
    if (selectedRequest) {
      await deleteRequest(selectedRequest.id);
      setDeleteModalOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 text-[15px] text-xevn-textSecondary">
        {t('common.loading')}
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6" data-testid="att-shift-change-precision">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-[20px] font-bold text-xevn-text">{t('shiftChange.title')}</h2>
        <Button
          className="gap-2 bg-xevn-primary hover:bg-xevn-primaryPressed text-white"
          onClick={() => setAddModalOpen(true)}
          disabled={catalogEmpty && !isLoadingShiftsEff}
          title={catalogEmpty ? att01EmptyCatalogCtaMessage() : undefined}
        >
          <Plus className="w-4 h-4" />
          {t('shiftChange.addRequest')}
        </Button>
      </div>

      {catalogEmpty && !isLoadingShiftsEff ? (
        <div
          className="rounded-card border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-xevn-text"
          data-testid="att-01-cns-empty-cta"
          role="status"
        >
          <p className="font-medium">{att01EmptyCatalogCtaMessage()}</p>
          <p className="mt-1 text-xevn-textSecondary">
            AC-ATT-01-EMPTY · U65 zero-seed · không dùng bootstrap mã ca giả.
          </p>
          <span className="mt-2 inline-block text-xevn-primary text-sm font-medium">
            Mở Chấm công → Ca làm việc → Danh sách ca để tạo ca Nest.
          </span>
        </div>
      ) : null}

      <p
        className="text-xs text-xevn-textSecondary leading-relaxed"
        data-testid="att-01-honesty"
      >
        {att01HonestyBannerText()} · HRM-ATT-SHIFT-KEY when active&gt;0
      </p>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card className="p-4 rounded-card border-xevn-border bg-xevn-surface">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-input bg-xevn-primary/10"><ArrowRightLeft className="w-5 h-5 text-xevn-primary" /></div>
            <div><p className="text-2xl font-bold text-xevn-text">{stats.total}</p><p className="text-sm text-xevn-textSecondary">{t('shiftChange.totalRequests')}</p></div>
          </div>
        </Card>
        <Card className="p-4 rounded-card border-xevn-border bg-xevn-surface">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-input bg-amber-100"><AlertCircle className="w-5 h-5 text-amber-700" /></div>
            <div><p className="text-2xl font-bold text-xevn-text">{stats.pending}</p><p className="text-sm text-xevn-textSecondary">{t('common.pending')}</p></div>
          </div>
        </Card>
        <Card className="p-4 rounded-card border-xevn-border bg-xevn-surface">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-input bg-green-100"><Check className="w-5 h-5 text-green-700" /></div>
            <div><p className="text-2xl font-bold text-xevn-text">{stats.approved}</p><p className="text-sm text-xevn-textSecondary">{t('common.approved')}</p></div>
          </div>
        </Card>
        <Card className="p-4 rounded-card border-xevn-border bg-xevn-surface">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-input bg-red-100"><X className="w-5 h-5 text-red-600" /></div>
            <div><p className="text-2xl font-bold text-xevn-text">{stats.rejected}</p><p className="text-sm text-xevn-textSecondary">{t('common.rejected')}</p></div>
          </div>
        </Card>
        <Card className="p-4 rounded-card border-xevn-border bg-xevn-surface">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-input bg-xevn-primary/10"><RefreshCw className="w-5 h-5 text-xevn-primary" /></div>
            <div><p className="text-2xl font-bold text-xevn-text">{stats.swapCount}</p><p className="text-sm text-xevn-textSecondary">{t('shiftChange.types.swap')}</p></div>
          </div>
        </Card>
        <Card className="p-4 rounded-card border-xevn-border bg-xevn-surface">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-input bg-xevn-textSecondary/15"><Clock className="w-5 h-5 text-xevn-textSecondary" /></div>
            <div><p className="text-2xl font-bold text-xevn-text">{stats.changeCount}</p><p className="text-sm text-xevn-textSecondary">{t('shiftChange.types.change')}</p></div>
          </div>
        </Card>
      </div>

      <Card className="p-4 rounded-card border-xevn-border bg-xevn-surface">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px] max-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-xevn-textMuted" />
            <Input placeholder={t('common.search')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder={t('common.status.label')} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common.all')}</SelectItem>
              <SelectItem value="pending">{t('common.pending')}</SelectItem>
              <SelectItem value="approved">{t('common.approved')}</SelectItem>
              <SelectItem value="rejected">{t('common.rejected')}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder={t('shiftChange.requestType')} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common.all')}</SelectItem>
              <SelectItem value="swap">{t('shiftChange.types.swap')}</SelectItem>
              <SelectItem value="change">{t('shiftChange.types.change')}</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2 ml-auto">
            <Button variant="outline" size="icon"><Filter className="w-4 h-4" /></Button>
            <Button variant="outline" size="icon"><Download className="w-4 h-4" /></Button>
          </div>
        </div>
      </Card>

      <Card className="rounded-card border-xevn-border bg-xevn-surface">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-xevn-border bg-xevn-background">
                <th className="p-3 text-left w-10"><Checkbox /></th>
                <th className="p-3 text-left font-semibold text-sm text-xevn-textSecondary">{t('common.employee')}</th>
                <th className="p-3 text-left font-semibold text-sm text-xevn-textSecondary">{t('common.department')}</th>
                <th className="p-3 text-center font-semibold text-sm text-xevn-textSecondary">{t('shiftChange.applyDate')}</th>
                <th className="p-3 text-center font-semibold text-sm text-xevn-textSecondary">{t('shiftChange.type')}</th>
                <th className="p-3 text-left font-semibold text-sm text-xevn-textSecondary">{t('shiftChange.currentShift')}</th>
                <th className="p-3 text-left font-semibold text-sm text-xevn-textSecondary">{t('shiftChange.requestedShift')}</th>
                <th className="p-3 text-left font-semibold text-sm text-xevn-textSecondary">{t('shiftChange.swapWith')}</th>
                <th className="p-3 text-center font-semibold text-sm text-xevn-textSecondary">{t('common.status.label')}</th>
                <th className="p-3 text-center font-semibold text-sm text-xevn-textSecondary">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((request) => (
                <tr key={request.id} className="border-b border-xevn-border hover:bg-xevn-primary/5 transition-colors">
                  <td className="p-3"><Checkbox /></td>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs bg-xevn-primary/10 text-xevn-primary font-medium">
                          {request.employee_name.split(' ').pop()?.charAt(0) || 'N'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-xevn-text">{request.employee_name}</p>
                        <p className="text-xs text-xevn-textSecondary">{request.employee_code}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-sm text-xevn-textSecondary">{request.department || '-'}</td>
                  <td className="p-3 text-sm text-center">{request.change_date}</td>
                  <td className="p-3 text-center">{getTypeBadge(request.change_type)}</td>
                  <td className="p-3">
                    <div>
                      <p className="text-sm font-medium text-xevn-text">{resolveWorkShiftLabel(shifts, request.current_shift)}</p>
                      <p className="text-xs text-xevn-textSecondary">{request.current_shift_time}</p>
                    </div>
                  </td>
                  <td className="p-3">
                    <div>
                      <p className="text-sm font-medium text-xevn-primary">{resolveWorkShiftLabel(shifts, request.requested_shift)}</p>
                      <p className="text-xs text-xevn-textSecondary">{request.requested_shift_time}</p>
                    </div>
                  </td>
                  <td className="p-3 text-sm">
                    {request.swap_with_employee_name ? (
                      <div>
                        <p className="font-medium text-xevn-text">{request.swap_with_employee_name}</p>
                        <p className="text-xs text-xevn-textSecondary">{request.swap_with_employee_code}</p>
                      </div>
                    ) : '-'}
                  </td>
                  <td className="p-3 text-center">{getStatusBadge(request.status)}</td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedRequest(request); setDetailModalOpen(true); }}>
                        <Eye className="w-4 h-4 text-xevn-textMuted" />
                      </Button>
                      {request.status === 'pending' && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedRequest(request); setDeleteModalOpen(true); }}>
                          <Trash2 className="w-4 h-4 text-xevn-textMuted" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-[15px] text-xevn-textSecondary">
                    {t('shiftChange.noRequests')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between p-4 border-t border-xevn-border">
          <div className="text-sm text-xevn-textSecondary">{t('common.total')}: <span className="font-medium text-xevn-text">{filteredRequests.length} {t('shiftChange.requestsUnit')}</span></div>
        </div>
      </Card>

      {/* Add Modal — S57 · W4 dialog chrome + compact fields */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="sm:max-w-[920px]" data-testid="att-shift-change-add-dialog-precision">
          <DialogHeader>
            <DialogTitle className="text-[20px] font-bold text-xevn-text">{t('shiftChange.addRequest')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xevn-text">{t('common.employee')} *</Label>
              <Select value={formData.employee} onValueChange={(v) => setFormData({ ...formData, employee: v })}>
                <SelectTrigger className="xevn-field-select-md"><SelectValue placeholder={t('common.selectEmployee')} /></SelectTrigger>
                <SelectContent>
                  {employees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>{emp.full_name} - {emp.employee_code}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-12">
              <div className="sm:col-span-4">
                <Label className="text-xevn-text">{t('shiftChange.applyDate')} *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="xevn-field-date justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4 text-xevn-textMuted" />
                      {formData.changeDate ? format(formData.changeDate, 'dd/MM/yyyy', { locale: getDateLocale() }) : t('common.selectDate')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0"><CalendarComponent mode="single" selected={formData.changeDate} onSelect={(d) => setFormData({ ...formData, changeDate: d })} /></PopoverContent>
                </Popover>
              </div>
              <div className="sm:col-span-4">
                <Label className="text-xevn-text">{t('shiftChange.requestType')}</Label>
                <Select value={formData.changeType} onValueChange={(v: 'swap' | 'change') => setFormData({ ...formData, changeType: v })}>
                  <SelectTrigger className="xevn-field-select-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="change">{t('shiftChange.types.change')}</SelectItem>
                    <SelectItem value="swap">{t('shiftChange.types.swapWithColleague')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-12">
              <div className="sm:col-span-4">
                <Label className="text-xevn-text">{t('shiftChange.currentShift')} *</Label>
                {catalogEmpty ? (
                  <div
                    className="rounded-input border border-dashed border-xevn-border px-3 py-2 text-sm text-xevn-textSecondary"
                    data-testid="att-01-cns-empty-cta"
                  >
                    {att01EmptyCatalogCtaMessage()}
                  </div>
                ) : (
                  <Select value={formData.currentShift} onValueChange={(v) => setFormData({ ...formData, currentShift: v })}>
                    <SelectTrigger className="xevn-field-select-md"><SelectValue placeholder={t('shiftChange.selectShift')} /></SelectTrigger>
                    <SelectContent>
                      {shifts.map(s => (
                        <SelectItem key={s.code} value={s.code}>{s.name}{s.time ? ` (${s.time})` : ''}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="sm:col-span-4">
                <Label className="text-xevn-text">{t('shiftChange.requestedShift')} *</Label>
                {catalogEmpty ? (
                  <div className="rounded-input border border-dashed border-xevn-border px-3 py-2 text-sm text-xevn-textSecondary">
                    {att01EmptyCatalogCtaMessage()}
                  </div>
                ) : (
                  <Select value={formData.requestedShift} onValueChange={(v) => setFormData({ ...formData, requestedShift: v })}>
                    <SelectTrigger className="xevn-field-select-md"><SelectValue placeholder={t('shiftChange.selectShift')} /></SelectTrigger>
                    <SelectContent>
                      {shifts.map(s => (
                        <SelectItem key={s.code} value={s.code}>{s.name}{s.time ? ` (${s.time})` : ''}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
            {formData.changeType === 'swap' && (
              <div>
                <Label className="text-xevn-text">{t('shiftChange.swapWith')}</Label>
                <Input className="xevn-field-name" value={formData.swapWithEmployee} onChange={(e) => setFormData({ ...formData, swapWithEmployee: e.target.value })} placeholder={t('shiftChange.swapWithPlaceholder')} />
              </div>
            )}
            <div>
              <Label className="text-xevn-text">{t('common.reason')} *</Label>
              <Textarea className="xevn-field-reason" value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} placeholder={t('shiftChange.reasonPlaceholder')} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddModalOpen(false)}>{t('common.cancel')}</Button>
            <Button
              className="bg-xevn-primary hover:bg-xevn-primaryPressed text-white"
              onClick={handleAddRequest}
              disabled={catalogEmpty}
            >
              {t('common.add')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Modal — S57 */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="sm:max-w-[600px]" data-testid="att-shift-change-detail-dialog-precision">
          <DialogHeader>
            <DialogTitle className="text-[20px] font-bold text-xevn-text">{t('shiftChange.requestDetail')}</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-card border border-xevn-border bg-xevn-background">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-xevn-primary/10 text-xevn-primary font-medium">
                    {selectedRequest.employee_name.split(' ').pop()?.charAt(0) || 'N'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-xevn-text">{selectedRequest.employee_name}</p>
                  <p className="text-sm text-xevn-textSecondary">{selectedRequest.employee_code} • {selectedRequest.department}</p>
                </div>
                <div className="ml-auto">{getStatusBadge(selectedRequest.status)}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-xevn-textSecondary">{t('shiftChange.applyDate')}</p>
                  <p className="font-medium text-xevn-text">{selectedRequest.change_date}</p>
                </div>
                <div>
                  <p className="text-sm text-xevn-textSecondary">{t('shiftChange.type')}</p>
                  {getTypeBadge(selectedRequest.change_type)}
                </div>
                <div>
                  <p className="text-sm text-xevn-textSecondary">{t('shiftChange.currentShift')}</p>
                  <p className="font-medium text-xevn-text">{resolveWorkShiftLabel(shifts, selectedRequest.current_shift)}</p>
                  <p className="text-xs text-xevn-textSecondary">{selectedRequest.current_shift_time}</p>
                </div>
                <div>
                  <p className="text-sm text-xevn-textSecondary">{t('shiftChange.requestedShift')}</p>
                  <p className="font-medium text-xevn-primary">{resolveWorkShiftLabel(shifts, selectedRequest.requested_shift)}</p>
                  <p className="text-xs text-xevn-textSecondary">{selectedRequest.requested_shift_time}</p>
                </div>
              </div>
              {selectedRequest.swap_with_employee_name && (
                <div>
                  <p className="text-sm text-xevn-textSecondary">{t('shiftChange.swapWith')}</p>
                  <p className="font-medium text-xevn-text">{selectedRequest.swap_with_employee_name}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-xevn-textSecondary">{t('common.reason')}</p>
                <p className="font-medium text-xevn-text">{selectedRequest.reason}</p>
              </div>
              {selectedRequest.status === 'pending' && (
                <div className="flex gap-2 pt-4">
                  <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => handleApprove(selectedRequest)}>
                    <Check className="w-4 h-4 mr-2" />{t('common.approve')}
                  </Button>
                  <Button variant="destructive" className="flex-1" onClick={() => handleReject(selectedRequest)}>
                    <X className="w-4 h-4 mr-2" />{t('common.reject')}
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation — S57 */}
      <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <AlertDialogContent data-testid="att-shift-change-delete-dialog-precision">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[20px] font-bold text-xevn-text">{t('common.confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription className="text-[15px] text-xevn-textSecondary">
              {t('shiftChange.deleteConfirmation')}
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
