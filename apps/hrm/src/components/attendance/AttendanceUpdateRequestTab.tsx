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
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">{t('attendanceUpdate.types.checkIn')}</Badge>;
      case 'check_out':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">{t('attendanceUpdate.types.checkOut')}</Badge>;
      case 'both':
        return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">{t('attendanceUpdate.types.both')}</Badge>;
      case 'forgot_check':
        return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">{t('attendanceUpdate.types.forgot')}</Badge>;
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

    const result = await createRequest({
      employee_id: selectedEmployee.id,
      employee_code: selectedEmployee.employee_code,
      employee_name: selectedEmployee.full_name,
      department: selectedEmployee.department,
      position: selectedEmployee.position,
      attendance_date: format(formData.attendanceDate, 'yyyy-MM-dd'),
      update_type: formData.updateType,
      requested_check_in: formData.updateType !== 'check_out' ? formData.requestedCheckIn : undefined,
      requested_check_out: formData.updateType !== 'check_in' ? formData.requestedCheckOut : undefined,
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
    return <div className="flex items-center justify-center p-8">{t('common.loading')}</div>;
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{t('attendanceUpdate.title')}</h2>
        <Button className="gap-2 bg-orange-500 hover:bg-orange-600 text-white" onClick={() => setAddModalOpen(true)}>
          <Plus className="w-4 h-4" />
          {t('attendanceUpdate.addRequest')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100"><RefreshCw className="w-5 h-5 text-blue-600" /></div>
            <div><p className="text-2xl font-bold">{stats.total}</p><p className="text-sm text-muted-foreground">{t('attendanceUpdate.totalRequests')}</p></div>
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

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="p-3 text-left w-10"><Checkbox /></th>
                <th className="p-3 text-left font-medium text-sm">{t('common.employee')}</th>
                <th className="p-3 text-left font-medium text-sm">{t('common.department')}</th>
                <th className="p-3 text-center font-medium text-sm">{t('attendanceUpdate.attendanceDate')}</th>
                <th className="p-3 text-center font-medium text-sm">{t('attendanceUpdate.type')}</th>
                <th className="p-3 text-center font-medium text-sm">{t('attendanceUpdate.currentTime')}</th>
                <th className="p-3 text-center font-medium text-sm">{t('attendanceUpdate.requestedTime')}</th>
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
                          {request.employee_name.split(' ').pop()?.charAt(0) || 'N'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{request.employee_name}</p>
                        <p className="text-xs text-muted-foreground">{request.employee_code}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-sm text-muted-foreground">{request.department || '-'}</td>
                  <td className="p-3 text-sm text-center">{request.attendance_date}</td>
                  <td className="p-3 text-center">{getTypeBadge(request.update_type)}</td>
                  <td className="p-3 text-sm text-center text-muted-foreground">
                    {request.current_check_in && <div>{t('attendanceUpdate.in')}: {request.current_check_in}</div>}
                    {request.current_check_out && <div>{t('attendanceUpdate.out')}: {request.current_check_out}</div>}
                    {!request.current_check_in && !request.current_check_out && '-'}
                  </td>
                  <td className="p-3 text-sm text-center font-medium text-orange-600">
                    {request.requested_check_in && <div>{t('attendanceUpdate.in')}: {request.requested_check_in}</div>}
                    {request.requested_check_out && <div>{t('attendanceUpdate.out')}: {request.requested_check_out}</div>}
                  </td>
                  <td className="p-3 text-sm text-muted-foreground max-w-[200px] truncate">{request.reason}</td>
                  <td className="p-3 text-center">{getStatusBadge(request.status)}</td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedRequest(request); setDetailModalOpen(true); }}>
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      </Button>
                      {request.status === 'pending' && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedRequest(request); setDeleteModalOpen(true); }}>
                          <Trash2 className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-muted-foreground">
                    {t('attendanceUpdate.noRequests')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between p-4 border-t">
          <div className="text-sm text-muted-foreground">{t('common.total')}: <span className="font-medium">{filteredRequests.length} {t('attendanceUpdate.requestsUnit')}</span></div>
        </div>
      </Card>

      {/* Add Modal */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('attendanceUpdate.addRequest')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t('common.employee')} *</Label>
              <Select value={formData.employee} onValueChange={(v) => setFormData({ ...formData, employee: v })}>
                <SelectTrigger><SelectValue placeholder={t('common.selectEmployee')} /></SelectTrigger>
                <SelectContent>
                  {employees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>{emp.full_name} - {emp.employee_code}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t('attendanceUpdate.attendanceDate')} *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.attendanceDate ? format(formData.attendanceDate, 'dd/MM/yyyy', { locale: getDateLocale() }) : t('common.selectDate')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0"><CalendarComponent mode="single" selected={formData.attendanceDate} onSelect={(d) => setFormData({ ...formData, attendanceDate: d })} /></PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>{t('attendanceUpdate.updateType')}</Label>
              <Select value={formData.updateType} onValueChange={(v) => setFormData({ ...formData, updateType: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="check_in">{t('attendanceUpdate.types.checkIn')}</SelectItem>
                  <SelectItem value="check_out">{t('attendanceUpdate.types.checkOut')}</SelectItem>
                  <SelectItem value="both">{t('attendanceUpdate.types.both')}</SelectItem>
                  <SelectItem value="forgot_check">{t('attendanceUpdate.types.forgot')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.updateType !== 'check_out' && (
              <div>
                <Label>{t('attendanceUpdate.requestedCheckIn')}</Label>
                <Input type="time" value={formData.requestedCheckIn} onChange={(e) => setFormData({ ...formData, requestedCheckIn: e.target.value })} />
              </div>
            )}
            {formData.updateType !== 'check_in' && (
              <div>
                <Label>{t('attendanceUpdate.requestedCheckOut')}</Label>
                <Input type="time" value={formData.requestedCheckOut} onChange={(e) => setFormData({ ...formData, requestedCheckOut: e.target.value })} />
              </div>
            )}
            <div>
              <Label>{t('common.reason')} *</Label>
              <Textarea value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} placeholder={t('attendanceUpdate.reasonPlaceholder')} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddModalOpen(false)}>{t('common.cancel')}</Button>
            <Button className="bg-orange-500 hover:bg-orange-600" onClick={handleAddRequest}>{t('common.add')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('attendanceUpdate.requestDetail')}</DialogTitle>
          </DialogHeader>
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
                  <p className="text-sm text-muted-foreground">{t('attendanceUpdate.attendanceDate')}</p>
                  <p className="font-medium">{selectedRequest.attendance_date}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('attendanceUpdate.type')}</p>
                  {getTypeBadge(selectedRequest.update_type)}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('attendanceUpdate.currentTime')}</p>
                  <div className="font-medium">
                    {selectedRequest.current_check_in && <div>{t('attendanceUpdate.in')}: {selectedRequest.current_check_in}</div>}
                    {selectedRequest.current_check_out && <div>{t('attendanceUpdate.out')}: {selectedRequest.current_check_out}</div>}
                    {!selectedRequest.current_check_in && !selectedRequest.current_check_out && '-'}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('attendanceUpdate.requestedTime')}</p>
                  <div className="font-medium text-orange-600">
                    {selectedRequest.requested_check_in && <div>{t('attendanceUpdate.in')}: {selectedRequest.requested_check_in}</div>}
                    {selectedRequest.requested_check_out && <div>{t('attendanceUpdate.out')}: {selectedRequest.requested_check_out}</div>}
                  </div>
                </div>
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
