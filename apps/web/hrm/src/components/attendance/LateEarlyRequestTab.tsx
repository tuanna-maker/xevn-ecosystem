/**
 * @CODE-MEMORY
 * Screen:     Attendance → Đơn từ → Đi muộn/Về sớm (S48–S49)
 * UC:         UC-HRM-ATT-LATE-EARLY
 * Purpose:    Late/early request list + add/detail/delete chrome
 * WorkItem:   PO-HRM-UI-BRAND-W3-ATT-C
 * Coded:      2026-08-05
 * must_keep:  create/approve/reject/delete wires; leave-balance panel untouched; U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-W3-ATT-C
 * change_mode: UPGRADE
 * What: Remaster late/early chrome → Precision Motion; ban orange/purple CTA chrome
 * Why: ADR-XEVN-PRECISION-MOTION-TOKENS-20260805 §8–§10 · inventory W3-ATT-C
 * must_keep: mutate wires; Dialog title ≥20; no Nest/seed; no Attendance CLOSED
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-W4-ATT-DIALOG-EXT
 * change_mode: ADD
 * What: Wire add/detail/delete dialogs → shared chrome + compact fields + *dialog-precision testids
 * Why: ADR §16 LOCK · FE-DIALOG-01 shell · inventory S48–S49
 * must_keep: create/approve/reject/delete wires; leave/OT wires; Face HOLD; U65 no seed
 * LastVerified: docs/qa/evidence/po-hrm-ui-brand-w4-att-dialog-ext.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-ATT-02-CLUSTER-FE-01
 * change_mode: UPGRADE
 * What: Honesty footer — late_early_requests ≠ mode SoT · ≠ FR-02 / ATT-02 DONE · Nest /core 0
 * Why: UC-BP-ATT-02 O7 AC-ATT-02-≠-LER · peer RETAIN bind physical /late-early-requests*
 * must_keep: create/approve/reject/delete wires; U65; attendance_uat_ready=false
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
  Clock,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
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
import { useLateEarlyRequests, LateEarlyRequestFormData } from '@/hooks/useLateEarlyRequests';
import { att02HonestyBannerText } from '@/lib/attRuleRing';
import { CalendarIcon } from 'lucide-react';

export function LateEarlyRequestTab() {
  const { t, i18n } = useTranslation();
  const { employees, isLoading: isLoadingEmployees } = useEmployees();
  const { requests, isLoading, createRequest, approveRequest, rejectRequest, deleteRequest } = useLateEarlyRequests();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    employeeId: '',
    requestDate: undefined as Date | undefined,
    requestType: 'late' as 'late' | 'early' | 'both',
    lateTime: '09:00',
    earlyTime: '16:30',
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
    lateCount: requests.filter(r => r.request_type === 'late' || r.request_type === 'both').length,
    earlyCount: requests.filter(r => r.request_type === 'early' || r.request_type === 'both').length,
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'late':
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-0">
            {t('lateEarly.types.late')}
          </Badge>
        );
      case 'early':
        return (
          <Badge className="bg-xevn-primary/10 text-xevn-primary hover:bg-xevn-primary/10 border-0">
            {t('lateEarly.types.early')}
          </Badge>
        );
      case 'both':
        return (
          <Badge className="bg-xevn-textSecondary/15 text-xevn-text hover:bg-xevn-textSecondary/15 border-0">
            {t('lateEarly.types.both')}
          </Badge>
        );
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
    const matchesType = typeFilter === 'all' || req.request_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const calculateMinutes = (time: string, type: 'late' | 'early'): number => {
    const [hours, minutes] = time.split(':').map(Number);
    if (type === 'late') {
      const standardStart = 8 * 60;
      return (hours * 60 + minutes) - standardStart;
    } else {
      const standardEnd = 17 * 60 + 30;
      return standardEnd - (hours * 60 + minutes);
    }
  };

  const handleAddRequest = async () => {
    if (!formData.employeeId || !formData.requestDate || !formData.reason) {
      return;
    }

    const employee = employees.find(e => e.id === formData.employeeId);
    if (!employee) return;

    setIsSubmitting(true);
    const data: LateEarlyRequestFormData = {
      employee_id: employee.id,
      employee_code: employee.employee_code,
      employee_name: employee.full_name,
      department: employee.department || undefined,
      position: employee.position || undefined,
      request_date: format(formData.requestDate, 'yyyy-MM-dd'),
      request_type: formData.requestType,
      late_time: formData.requestType !== 'early' ? formData.lateTime : undefined,
      early_time: formData.requestType !== 'late' ? formData.earlyTime : undefined,
      late_minutes: formData.requestType !== 'early' ? calculateMinutes(formData.lateTime, 'late') : undefined,
      early_minutes: formData.requestType !== 'late' ? calculateMinutes(formData.earlyTime, 'early') : undefined,
      reason: formData.reason,
    };

    const result = await createRequest(data);
    setIsSubmitting(false);

    if (result) {
      setAddModalOpen(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({
      employeeId: '',
      requestDate: undefined,
      requestType: 'late',
      lateTime: '09:00',
      earlyTime: '16:30',
      reason: '',
    });
  };

  const handleApprove = async (request: any) => {
    await approveRequest(request.id);
    setDetailModalOpen(false);
  };

  const handleReject = async (request: any) => {
    await rejectRequest(request.id, t('lateEarly.rejectReason'));
    setDetailModalOpen(false);
  };

  const handleDelete = async () => {
    if (selectedRequest) {
      await deleteRequest(selectedRequest.id);
      setDeleteModalOpen(false);
      setSelectedRequest(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-xevn-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6" data-testid="att-late-early-precision">
      <div className="flex items-center justify-between">
        <h2 className="text-[20px] font-bold text-xevn-text">{t('lateEarly.title')}</h2>
        <Button
          className="gap-2 bg-xevn-primary hover:bg-xevn-primaryPressed text-white"
          onClick={() => setAddModalOpen(true)}
        >
          <Plus className="w-4 h-4" />
          {t('lateEarly.addRequest')}
        </Button>
      </div>
      <p
        className="text-xs text-xevn-textSecondary leading-relaxed"
        data-testid="att-02-ler-honesty"
      >
        late_early_requests ≠ mode SoT · ≠ FR-02 / ATT-02 DONE · {att02HonestyBannerText()}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card className="p-4 rounded-card border-xevn-border bg-xevn-surface">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-input bg-xevn-primary/10">
              <Clock className="w-5 h-5 text-xevn-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-xevn-text">{stats.total}</p>
              <p className="text-sm text-xevn-textSecondary">{t('lateEarly.totalRequests')}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 rounded-card border-xevn-border bg-xevn-surface">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-input bg-amber-100">
              <AlertCircle className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-xevn-text">{stats.pending}</p>
              <p className="text-sm text-xevn-textSecondary">{t('common.pending')}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 rounded-card border-xevn-border bg-xevn-surface">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-input bg-green-100">
              <Check className="w-5 h-5 text-green-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-xevn-text">{stats.approved}</p>
              <p className="text-sm text-xevn-textSecondary">{t('common.approved')}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 rounded-card border-xevn-border bg-xevn-surface">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-input bg-red-100">
              <X className="w-5 h-5 text-red-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-xevn-text">{stats.rejected}</p>
              <p className="text-sm text-xevn-textSecondary">{t('common.rejected')}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 rounded-card border-xevn-border bg-xevn-surface">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-input bg-amber-100">
              <ArrowRight className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-xevn-text">{stats.lateCount}</p>
              <p className="text-sm text-xevn-textSecondary">{t('lateEarly.types.late')}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 rounded-card border-xevn-border bg-xevn-surface">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-input bg-xevn-primary/10">
              <ArrowLeft className="w-5 h-5 text-xevn-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-xevn-text">{stats.earlyCount}</p>
              <p className="text-sm text-xevn-textSecondary">{t('lateEarly.types.early')}</p>
            </div>
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
            <SelectTrigger className="w-[160px]"><SelectValue placeholder={t('lateEarly.requestType')} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common.all')}</SelectItem>
              <SelectItem value="late">{t('lateEarly.types.late')}</SelectItem>
              <SelectItem value="early">{t('lateEarly.types.early')}</SelectItem>
              <SelectItem value="both">{t('lateEarly.types.both')}</SelectItem>
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
                <th className="p-3 text-center font-semibold text-sm text-xevn-textSecondary">{t('lateEarly.applyDate')}</th>
                <th className="p-3 text-center font-semibold text-sm text-xevn-textSecondary">{t('lateEarly.type')}</th>
                <th className="p-3 text-center font-semibold text-sm text-xevn-textSecondary">{t('lateEarly.arrivalTime')}</th>
                <th className="p-3 text-center font-semibold text-sm text-xevn-textSecondary">{t('lateEarly.leaveTime')}</th>
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
                          {request.employee_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-xevn-text">{request.employee_name}</p>
                        <p className="text-xs text-xevn-textSecondary">{request.employee_code}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-sm text-xevn-textSecondary">{request.department || '-'}</td>
                  <td className="p-3 text-sm text-center text-xevn-text">{request.request_date}</td>
                  <td className="p-3 text-center">{getTypeBadge(request.request_type)}</td>
                  <td className="p-3 text-sm text-center">
                    {request.late_time ? (
                      <span className="text-amber-800 font-medium">{request.late_time}</span>
                    ) : '-'}
                  </td>
                  <td className="p-3 text-sm text-center">
                    {request.early_time ? (
                      <span className="text-xevn-primary font-medium">{request.early_time}</span>
                    ) : '-'}
                  </td>
                  <td className="p-3 text-sm text-xevn-textSecondary max-w-[200px] truncate">{request.reason}</td>
                  <td className="p-3 text-center">{getStatusBadge(request.status)}</td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedRequest(request); setDetailModalOpen(true); }}>
                        <Eye className="w-4 h-4 text-xevn-textMuted" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { setSelectedRequest(request); setDeleteModalOpen(true); }}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={10} className="text-center py-8 text-[15px] text-xevn-textSecondary">
                    {t('lateEarly.noRequests')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Modal — S49 · W4 dialog chrome + compact fields */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="sm:max-w-[920px]" data-testid="att-late-early-add-dialog-precision">
          <DialogHeader>
            <DialogTitle className="text-[20px] font-bold text-xevn-text">
              {t('lateEarly.addRequest')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-xevn-text">{t('common.employee')} <span className="text-destructive">*</span></Label>
              <Select value={formData.employeeId} onValueChange={(v) => setFormData({...formData, employeeId: v})}>
                <SelectTrigger className="xevn-field-select-md"><SelectValue placeholder={t('common.selectEmployee')} /></SelectTrigger>
                <SelectContent>
                  {isLoadingEmployees ? (
                    <SelectItem value="" disabled>{t('common.loading')}</SelectItem>
                  ) : employees.length === 0 ? (
                    <SelectItem value="" disabled>{t('lateEarly.noEmployees')}</SelectItem>
                  ) : (
                    employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.full_name} - {emp.employee_code}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-12">
              <div className="space-y-2 sm:col-span-4">
                <Label className="text-xevn-text">{t('lateEarly.applyDate')} <span className="text-destructive">*</span></Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="xevn-field-date justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4 text-xevn-textMuted" />
                      {formData.requestDate ? format(formData.requestDate, 'dd/MM/yyyy', { locale: getDateLocale() }) : t('common.selectDate')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0"><CalendarComponent mode="single" selected={formData.requestDate} onSelect={(d) => setFormData({...formData, requestDate: d})} locale={getDateLocale()} /></PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2 sm:col-span-4">
                <Label className="text-xevn-text">{t('lateEarly.requestType')}</Label>
                <Select value={formData.requestType} onValueChange={(v: 'late' | 'early' | 'both') => setFormData({...formData, requestType: v})}>
                  <SelectTrigger className="xevn-field-select-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="late">{t('lateEarly.types.late')}</SelectItem>
                    <SelectItem value="early">{t('lateEarly.types.early')}</SelectItem>
                    <SelectItem value="both">{t('lateEarly.types.both')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {(formData.requestType === 'late' || formData.requestType === 'both') && (
                <div className="space-y-2 sm:col-span-4">
                  <Label className="text-xevn-text">{t('lateEarly.expectedArrival')}</Label>
                  <Input className="xevn-field-time" type="time" value={formData.lateTime} onChange={(e) => setFormData({...formData, lateTime: e.target.value})} />
                </div>
              )}
              {(formData.requestType === 'early' || formData.requestType === 'both') && (
                <div className="space-y-2 sm:col-span-4">
                  <Label className="text-xevn-text">{t('lateEarly.expectedLeave')}</Label>
                  <Input className="xevn-field-time" type="time" value={formData.earlyTime} onChange={(e) => setFormData({...formData, earlyTime: e.target.value})} />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-xevn-text">{t('common.reason')} <span className="text-destructive">*</span></Label>
              <Textarea className="xevn-field-reason" value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})} placeholder={t('lateEarly.reasonPlaceholder')} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddModalOpen(false)}>{t('common.cancel')}</Button>
            <Button className="bg-xevn-primary hover:bg-xevn-primaryPressed text-white" onClick={handleAddRequest} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {t('common.add')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Modal — S49 */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="sm:max-w-[600px]" data-testid="att-late-early-detail-dialog-precision">
          <DialogHeader>
            <DialogTitle className="text-[20px] font-bold text-xevn-text">
              {t('lateEarly.requestDetail')}
            </DialogTitle>
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
                  <p className="text-sm text-xevn-textSecondary">{t('lateEarly.applyDate')}</p>
                  <p className="font-medium text-xevn-text">{selectedRequest.request_date}</p>
                </div>
                <div>
                  <p className="text-sm text-xevn-textSecondary">{t('lateEarly.type')}</p>
                  {getTypeBadge(selectedRequest.request_type)}
                </div>
                {selectedRequest.late_time && (
                  <div>
                    <p className="text-sm text-xevn-textSecondary">{t('lateEarly.arrivalTime')}</p>
                    <p className="font-medium text-xevn-text">{selectedRequest.late_time}</p>
                    {selectedRequest.late_minutes && (
                      <p className="text-xs text-xevn-textSecondary">({selectedRequest.late_minutes} {t('lateEarly.minutes')})</p>
                    )}
                  </div>
                )}
                {selectedRequest.early_time && (
                  <div>
                    <p className="text-sm text-xevn-textSecondary">{t('lateEarly.leaveTime')}</p>
                    <p className="font-medium text-xevn-primary">{selectedRequest.early_time}</p>
                    {selectedRequest.early_minutes && (
                      <p className="text-xs text-xevn-textSecondary">({selectedRequest.early_minutes} {t('lateEarly.minutes')})</p>
                    )}
                  </div>
                )}
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

      {/* Delete Confirmation — S49 */}
      <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <AlertDialogContent data-testid="att-late-early-delete-dialog-precision">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[20px] font-bold text-xevn-text">
              {t('common.confirmDelete')}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[15px] text-xevn-textSecondary">
              {t('lateEarly.deleteConfirmation')}
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
