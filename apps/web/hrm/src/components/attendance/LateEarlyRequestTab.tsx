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
        return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">{t('lateEarly.types.late')}</Badge>;
      case 'early':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">{t('lateEarly.types.early')}</Badge>;
      case 'both':
        return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">{t('lateEarly.types.both')}</Badge>;
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
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{t('lateEarly.title')}</h2>
        <Button className="gap-2 bg-orange-500 hover:bg-orange-600 text-white" onClick={() => setAddModalOpen(true)}>
          <Plus className="w-4 h-4" />
          {t('lateEarly.addRequest')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100"><Clock className="w-5 h-5 text-blue-600" /></div>
            <div><p className="text-2xl font-bold">{stats.total}</p><p className="text-sm text-muted-foreground">{t('lateEarly.totalRequests')}</p></div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-100"><AlertCircle className="w-5 h-5 text-yellow-600" /></div>
            <div><p className="text-2xl font-bold">{stats.pending}</p><p className="text-sm text-muted-foreground">{t('common.pending')}</p></div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100"><Check className="w-5 h-5 text-green-600" /></div>
            <div><p className="text-2xl font-bold">{stats.approved}</p><p className="text-sm text-muted-foreground">{t('common.approved')}</p></div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100"><X className="w-5 h-5 text-red-600" /></div>
            <div><p className="text-2xl font-bold">{stats.rejected}</p><p className="text-sm text-muted-foreground">{t('common.rejected')}</p></div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-100"><ArrowRight className="w-5 h-5 text-orange-600" /></div>
            <div><p className="text-2xl font-bold">{stats.lateCount}</p><p className="text-sm text-muted-foreground">{t('lateEarly.types.late')}</p></div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100"><ArrowLeft className="w-5 h-5 text-purple-600" /></div>
            <div><p className="text-2xl font-bold">{stats.earlyCount}</p><p className="text-sm text-muted-foreground">{t('lateEarly.types.early')}</p></div>
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px] max-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
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

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="p-3 text-left w-10"><Checkbox /></th>
                <th className="p-3 text-left font-medium text-sm">{t('common.employee')}</th>
                <th className="p-3 text-left font-medium text-sm">{t('common.department')}</th>
                <th className="p-3 text-center font-medium text-sm">{t('lateEarly.applyDate')}</th>
                <th className="p-3 text-center font-medium text-sm">{t('lateEarly.type')}</th>
                <th className="p-3 text-center font-medium text-sm">{t('lateEarly.arrivalTime')}</th>
                <th className="p-3 text-center font-medium text-sm">{t('lateEarly.leaveTime')}</th>
                <th className="p-3 text-left font-medium text-sm">{t('common.reason')}</th>
                <th className="p-3 text-center font-medium text-sm">{t('common.status.label')}</th>
                <th className="p-3 text-center font-medium text-sm">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((request) => (
                <tr key={request.id} className="border-b hover:bg-muted/20 transition-colors">
                  <td className="p-3"><Checkbox /></td>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs bg-orange-100 text-orange-600">
                          {request.employee_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{request.employee_name}</p>
                        <p className="text-xs text-muted-foreground">{request.employee_code}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-sm text-muted-foreground">{request.department || '-'}</td>
                  <td className="p-3 text-sm text-center">{request.request_date}</td>
                  <td className="p-3 text-center">{getTypeBadge(request.request_type)}</td>
                  <td className="p-3 text-sm text-center">
                    {request.late_time ? (
                      <span className="text-orange-600 font-medium">{request.late_time}</span>
                    ) : '-'}
                  </td>
                  <td className="p-3 text-sm text-center">
                    {request.early_time ? (
                      <span className="text-blue-600 font-medium">{request.early_time}</span>
                    ) : '-'}
                  </td>
                  <td className="p-3 text-sm text-muted-foreground max-w-[200px] truncate">{request.reason}</td>
                  <td className="p-3 text-center">{getStatusBadge(request.status)}</td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedRequest(request); setDetailModalOpen(true); }}>
                        <Eye className="w-4 h-4 text-muted-foreground" />
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
                  <td colSpan={10} className="text-center py-8 text-muted-foreground">
                    {t('lateEarly.noRequests')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Modal */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{t('lateEarly.addRequest')}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t('common.employee')} <span className="text-destructive">*</span></Label>
              <Select value={formData.employeeId} onValueChange={(v) => setFormData({...formData, employeeId: v})}>
                <SelectTrigger><SelectValue placeholder={t('common.selectEmployee')} /></SelectTrigger>
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
            <div className="space-y-2">
              <Label>{t('lateEarly.applyDate')} <span className="text-destructive">*</span></Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.requestDate ? format(formData.requestDate, 'dd/MM/yyyy', { locale: getDateLocale() }) : t('common.selectDate')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0"><CalendarComponent mode="single" selected={formData.requestDate} onSelect={(d) => setFormData({...formData, requestDate: d})} locale={getDateLocale()} /></PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>{t('lateEarly.requestType')}</Label>
              <Select value={formData.requestType} onValueChange={(v: any) => setFormData({...formData, requestType: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="late">{t('lateEarly.types.late')}</SelectItem>
                  <SelectItem value="early">{t('lateEarly.types.early')}</SelectItem>
                  <SelectItem value="both">{t('lateEarly.types.both')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(formData.requestType === 'late' || formData.requestType === 'both') && (
              <div className="space-y-2">
                <Label>{t('lateEarly.expectedArrival')}</Label>
                <Input type="time" value={formData.lateTime} onChange={(e) => setFormData({...formData, lateTime: e.target.value})} />
              </div>
            )}
            {(formData.requestType === 'early' || formData.requestType === 'both') && (
              <div className="space-y-2">
                <Label>{t('lateEarly.expectedLeave')}</Label>
                <Input type="time" value={formData.earlyTime} onChange={(e) => setFormData({...formData, earlyTime: e.target.value})} />
              </div>
            )}
            <div className="space-y-2">
              <Label>{t('common.reason')} <span className="text-destructive">*</span></Label>
              <Textarea value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})} placeholder={t('lateEarly.reasonPlaceholder')} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddModalOpen(false)}>{t('common.cancel')}</Button>
            <Button className="bg-orange-500 hover:bg-orange-600" onClick={handleAddRequest} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {t('common.add')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{t('lateEarly.requestDetail')}</DialogTitle></DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-orange-100 text-orange-600">
                    {selectedRequest.employee_name.split(' ').pop()?.charAt(0) || 'N'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedRequest.employee_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedRequest.employee_code} • {selectedRequest.department}</p>
                </div>
                <div className="ml-auto">{getStatusBadge(selectedRequest.status)}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{t('lateEarly.applyDate')}</p>
                  <p className="font-medium">{selectedRequest.request_date}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('lateEarly.type')}</p>
                  {getTypeBadge(selectedRequest.request_type)}
                </div>
                {selectedRequest.late_time && (
                  <div>
                    <p className="text-sm text-muted-foreground">{t('lateEarly.arrivalTime')}</p>
                    <p className="font-medium text-orange-600">{selectedRequest.late_time}</p>
                    {selectedRequest.late_minutes && (
                      <p className="text-xs text-muted-foreground">({selectedRequest.late_minutes} {t('lateEarly.minutes')})</p>
                    )}
                  </div>
                )}
                {selectedRequest.early_time && (
                  <div>
                    <p className="text-sm text-muted-foreground">{t('lateEarly.leaveTime')}</p>
                    <p className="font-medium text-blue-600">{selectedRequest.early_time}</p>
                    {selectedRequest.early_minutes && (
                      <p className="text-xs text-muted-foreground">({selectedRequest.early_minutes} {t('lateEarly.minutes')})</p>
                    )}
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('common.reason')}</p>
                <p className="font-medium">{selectedRequest.reason}</p>
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

      {/* Delete Confirmation */}
      <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common.confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>
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
