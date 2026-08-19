/**
 * @CODE-MEMORY
 * Screen:     /hr/attendance → Quản lý đơn → Đề nghị cập nhật công
 * UC:         UC-HRM-09 · FN-REQ-UPD-CRUD · HIM §5.5
 * Purpose:    List / tạo / duyệt đề nghị cập nhật công — form HH:mm; POST ISO timestamptz.
 * WorkItem:   U78-U84-ATT-ADJ-TMDV-TIME-WIRE-01
 * Coded:      2026-08-04
 * must_keep:  approve/reject/list; calendar dd/MM/yyyy; leave tab riêng
 * LastVerified: attendanceUpdateRequestTime.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-08-04 U78-U84-ATT-ADJ-TMDV-TIME-WIRE-01
 * change_mode: FIX
 * What: POST requested_check_in/out = compose attendance_date + HH:mm → ISO (không còn "08:00")
 * Why: BE TIMESTAMPTZ → 500 HRM-SYS-001 khi FE gửi bare HH:mm (QA Primary P-ATT-ADJ TMDV)
 * must_keep: Input type=time HH:mm UX; leave submit; approve path; U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-08-04 U78-U84-ATT-ADJ-TMDV-AP-COMPANY-HEADER-01
 * change_mode: FIX
 * What: Duyệt/Từ chối qua hook → approveAttendanceUpdateRequest(..., currentCompanyId) → x-company-id
 * Why: QA R1 mgr FE 409 SCOPE_CONTEXT_MISMATCH; L1 + x-company-id=trsport → 201
 * must_keep: ISO create compose; list company_id; leave approve không đổi
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-W3-ATT-D
 * change_mode: UPGRADE
 * What: Remaster update-request tab + modals → Precision Motion; ban orange/purple/blue chrome
 * Why: ADR-XEVN-PRECISION-MOTION-TOKENS-20260805 §8–§10 · inventory W3-ATT-D S54–S55
 * must_keep: ISO time compose; approve x-company-id; Dialog title ≥20; no Nest/seed; no Attendance CLOSED; no LeaveTab fight
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-W3-ATT-D (stall#2)
 * change_mode: FIX
 * What: forgot-type badge amber→xevn secondary (non-DNA); keep pending DNA amber only
 * Why: RE-DISPATCH stall#2 — no orange AI chrome on type chips; evidence + theme-contrast re-close
 * must_keep: ISO compose; x-company-id approve; mutate wires; Dialog/Alert title ≥20
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-W4-ATT-DIALOG-EXT
 * change_mode: ADD
 * What: Wire update add/detail/delete → shared chrome + compact date/time/reason + *dialog-precision
 * Why: ADR §16 LOCK · FE-DIALOG-01 shell · inventory S54–S55
 * must_keep: ISO time compose; x-company-id approve; leave/OT/GPS wires; Face HOLD; U65 no seed
 * LastVerified: docs/qa/evidence/po-hrm-ui-brand-w4-att-dialog-ext.md
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Filter,
  Download,
  Plus,
  Trash2,
  Eye,
  Check,
  X,
  CalendarIcon,
  AlertCircle,
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
import { useAttendanceUpdateRequests, AttendanceUpdateRequest } from '@/hooks/useAttendanceUpdateRequests';
import {
  buildAttendanceUpdateRequestTimeFields,
  formatAttendanceRequestedTimeDisplay,
} from '@/lib/attendanceUpdateRequestTime';

export function AttendanceUpdateRequestTab() {
  const { t, i18n } = useTranslation();
  const { employees } = useEmployees();
  const { requests, isLoading, createRequest, approveRequest, rejectRequest, deleteRequest } = useAttendanceUpdateRequests();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<AttendanceUpdateRequest | null>(null);

  const [formData, setFormData] = useState({
    employee: '',
    attendanceDate: undefined as Date | undefined,
    updateType: 'forgot_check' as string,
    requestedCheckIn: '08:00',
    requestedCheckOut: '17:30',
    reason: '',
  });

  const getDateLocale = () => {
    switch (i18n.language) {
      case 'en': return enUS;
      case 'zh': return zhCN;
      default: return vi;
    }
  };

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'check_in':
        return <Badge className="bg-xevn-primary/10 text-xevn-primary hover:bg-xevn-primary/10 border-0">{t('attendanceUpdate.types.checkIn')}</Badge>;
      case 'check_out':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">{t('attendanceUpdate.types.checkOut')}</Badge>;
      case 'both':
        return <Badge className="bg-xevn-textSecondary/15 text-xevn-text hover:bg-xevn-textSecondary/15 border-0">{t('attendanceUpdate.types.both')}</Badge>;
      case 'forgot_check':
        return <Badge className="bg-xevn-textSecondary/15 text-xevn-text hover:bg-xevn-textSecondary/15 border-0">{t('attendanceUpdate.types.forgot')}</Badge>;
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
    const matchesType = typeFilter === 'all' || req.update_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleAddRequest = async () => {
    if (!formData.employee || !formData.attendanceDate || !formData.reason) {
      return;
    }

    const selectedEmployee = employees.find(e => e.id === formData.employee);
    if (!selectedEmployee) return;

    const attendanceDateYmd = format(formData.attendanceDate, 'yyyy-MM-dd');
    // BE TIMESTAMPTZ — compose local wall-clock HH:mm onto attendance_date (not bare "08:00")
    const timeFields = buildAttendanceUpdateRequestTimeFields({
      attendanceDate: formData.attendanceDate,
      updateType: formData.updateType,
      requestedCheckIn: formData.requestedCheckIn,
      requestedCheckOut: formData.requestedCheckOut,
    });

    const result = await createRequest({
      employee_id: selectedEmployee.id,
      employee_code: selectedEmployee.employee_code,
      employee_name: selectedEmployee.full_name,
      department: selectedEmployee.department,
      position: selectedEmployee.position,
      attendance_date: attendanceDateYmd,
      update_type: formData.updateType,
      ...timeFields,
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
      attendanceDate: undefined,
      updateType: 'forgot_check',
      requestedCheckIn: '08:00',
      requestedCheckOut: '17:30',
      reason: '',
    });
  };

  const handleApprove = async (request: AttendanceUpdateRequest) => {
    await approveRequest(request.id);
    setDetailModalOpen(false);
  };

  const handleReject = async (request: AttendanceUpdateRequest) => {
    await rejectRequest(request.id, t('attendanceUpdate.rejectReason'));
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
    <div className="space-y-4 p-6" data-testid="att-update-precision">
      <div className="flex items-center justify-between">
        <h2 className="text-[20px] font-bold text-xevn-text">{t('attendanceUpdate.title')}</h2>
        <Button className="gap-2 bg-xevn-primary hover:bg-xevn-primaryPressed text-white" onClick={() => setAddModalOpen(true)}>
          <Plus className="w-4 h-4" />
          {t('attendanceUpdate.addRequest')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 rounded-card border-xevn-border bg-xevn-surface">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-input bg-xevn-primary/10"><RefreshCw className="w-5 h-5 text-xevn-primary" /></div>
            <div><p className="text-2xl font-bold text-xevn-text">{stats.total}</p><p className="text-sm text-xevn-textSecondary">{t('attendanceUpdate.totalRequests')}</p></div>
          </div>
        </Card>
        <Card className="p-4 rounded-card border-xevn-border bg-xevn-surface">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-input bg-amber-100"><AlertCircle className="w-5 h-5  hidden " /></div>
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
            <SelectTrigger className="w-[180px]"><SelectValue placeholder={t('attendanceUpdate.updateType')} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common.all')}</SelectItem>
              <SelectItem value="check_in">{t('attendanceUpdate.types.checkIn')}</SelectItem>
              <SelectItem value="check_out">{t('attendanceUpdate.types.checkOut')}</SelectItem>
              <SelectItem value="both">{t('attendanceUpdate.types.both')}</SelectItem>
              <SelectItem value="forgot_check">{t('attendanceUpdate.types.forgot')}</SelectItem>
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
                <th className="p-3 text-center font-semibold text-sm text-xevn-textSecondary">{t('attendanceUpdate.attendanceDate')}</th>
                <th className="p-3 text-center font-semibold text-sm text-xevn-textSecondary">{t('attendanceUpdate.type')}</th>
                <th className="p-3 text-center font-semibold text-sm text-xevn-textSecondary">{t('attendanceUpdate.currentTime')}</th>
                <th className="p-3 text-center font-semibold text-sm text-xevn-textSecondary">{t('attendanceUpdate.requestedTime')}</th>
                <th className="p-3 text-left font-semibold text-sm text-xevn-textSecondary">{t('common.reason')}</th>
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
                  <td className="p-3 text-sm text-center">{request.attendance_date}</td>
                  <td className="p-3 text-center">{getTypeBadge(request.update_type)}</td>
                  <td className="p-3 text-sm text-center text-xevn-textSecondary">
                    {request.current_check_in && (
                      <div>{t('attendanceUpdate.in')}: {formatAttendanceRequestedTimeDisplay(request.current_check_in)}</div>
                    )}
                    {request.current_check_out && (
                      <div>{t('attendanceUpdate.out')}: {formatAttendanceRequestedTimeDisplay(request.current_check_out)}</div>
                    )}
                    {!request.current_check_in && !request.current_check_out && '-'}
                  </td>
                  <td className="p-3 text-sm text-center font-medium text-xevn-primary">
                    {request.requested_check_in && (
                      <div>{t('attendanceUpdate.in')}: {formatAttendanceRequestedTimeDisplay(request.requested_check_in)}</div>
                    )}
                    {request.requested_check_out && (
                      <div>{t('attendanceUpdate.out')}: {formatAttendanceRequestedTimeDisplay(request.requested_check_out)}</div>
                    )}
                  </td>
                  <td className="p-3 text-sm text-xevn-textSecondary max-w-[200px] truncate">{request.reason}</td>
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
                    {t('attendanceUpdate.noRequests')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between p-4 border-t border-xevn-border">
          <div className="text-sm text-xevn-textSecondary">{t('common.total')}: <span className="font-medium text-xevn-text">{filteredRequests.length} {t('attendanceUpdate.requestsUnit')}</span></div>
        </div>
      </Card>

      {/* Add Modal — S55 · W4 dialog chrome + compact fields (HH:mm UX kept) */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="sm:max-w-[920px]" data-testid="att-update-add-dialog-precision">
          <DialogHeader>
            <DialogTitle className="text-[20px] font-bold text-xevn-text">{t('attendanceUpdate.addRequest')}</DialogTitle>
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
                <Label className="text-xevn-text">{t('attendanceUpdate.attendanceDate')} *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="xevn-field-date justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4 text-xevn-textMuted" />
                      {formData.attendanceDate ? format(formData.attendanceDate, 'dd/MM/yyyy', { locale: getDateLocale() }) : t('common.selectDate')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0"><CalendarComponent mode="single" selected={formData.attendanceDate} onSelect={(d) => setFormData({ ...formData, attendanceDate: d })} /></PopoverContent>
                </Popover>
              </div>
              <div className="sm:col-span-4">
                <Label className="text-xevn-text">{t('attendanceUpdate.updateType')}</Label>
                <Select value={formData.updateType} onValueChange={(v) => setFormData({ ...formData, updateType: v })}>
                  <SelectTrigger className="xevn-field-select-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="check_in">{t('attendanceUpdate.types.checkIn')}</SelectItem>
                    <SelectItem value="check_out">{t('attendanceUpdate.types.checkOut')}</SelectItem>
                    <SelectItem value="both">{t('attendanceUpdate.types.both')}</SelectItem>
                    <SelectItem value="forgot_check">{t('attendanceUpdate.types.forgot')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.updateType !== 'check_out' && (
                <div className="sm:col-span-4">
                  <Label className="text-xevn-text">{t('attendanceUpdate.requestedCheckIn')}</Label>
                  <Input className="xevn-field-time" type="time" value={formData.requestedCheckIn} onChange={(e) => setFormData({ ...formData, requestedCheckIn: e.target.value })} />
                </div>
              )}
              {formData.updateType !== 'check_in' && (
                <div className="sm:col-span-4">
                  <Label className="text-xevn-text">{t('attendanceUpdate.requestedCheckOut')}</Label>
                  <Input className="xevn-field-time" type="time" value={formData.requestedCheckOut} onChange={(e) => setFormData({ ...formData, requestedCheckOut: e.target.value })} />
                </div>
              )}
            </div>
            <div>
              <Label className="text-xevn-text">{t('common.reason')} *</Label>
              <Textarea className="xevn-field-reason" value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} placeholder={t('attendanceUpdate.reasonPlaceholder')} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddModalOpen(false)}>{t('common.cancel')}</Button>
            <Button className="bg-xevn-primary hover:bg-xevn-primaryPressed text-white" onClick={handleAddRequest}>{t('common.add')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Modal — S55 */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="sm:max-w-[600px]" data-testid="att-update-detail-dialog-precision">
          <DialogHeader>
            <DialogTitle className="text-[20px] font-bold text-xevn-text">{t('attendanceUpdate.requestDetail')}</DialogTitle>
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
                  <p className="text-sm text-xevn-textSecondary">{t('attendanceUpdate.attendanceDate')}</p>
                  <p className="font-medium text-xevn-text">{selectedRequest.attendance_date}</p>
                </div>
                <div>
                  <p className="text-sm text-xevn-textSecondary">{t('attendanceUpdate.type')}</p>
                  {getTypeBadge(selectedRequest.update_type)}
                </div>
                <div>
                  <p className="text-sm text-xevn-textSecondary">{t('attendanceUpdate.currentTime')}</p>
                  <div className="font-medium text-xevn-text">
                    {selectedRequest.current_check_in && (
                      <div>{t('attendanceUpdate.in')}: {formatAttendanceRequestedTimeDisplay(selectedRequest.current_check_in)}</div>
                    )}
                    {selectedRequest.current_check_out && (
                      <div>{t('attendanceUpdate.out')}: {formatAttendanceRequestedTimeDisplay(selectedRequest.current_check_out)}</div>
                    )}
                    {!selectedRequest.current_check_in && !selectedRequest.current_check_out && '-'}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-xevn-textSecondary">{t('attendanceUpdate.requestedTime')}</p>
                  <div className="font-medium text-xevn-primary">
                    {selectedRequest.requested_check_in && (
                      <div>{t('attendanceUpdate.in')}: {formatAttendanceRequestedTimeDisplay(selectedRequest.requested_check_in)}</div>
                    )}
                    {selectedRequest.requested_check_out && (
                      <div>{t('attendanceUpdate.out')}: {formatAttendanceRequestedTimeDisplay(selectedRequest.requested_check_out)}</div>
                    )}
                  </div>
                </div>
              </div>
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

      {/* Delete Confirmation — S55 */}
      <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <AlertDialogContent data-testid="att-update-delete-dialog-precision">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[20px] font-bold text-xevn-text">{t('common.confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription className="text-[15px] text-xevn-textSecondary">
              {t('attendanceUpdate.deleteConfirmation')}
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
