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
  CalendarIcon,
  TrendingUp,
  AlertCircle,
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
import { vi } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { useEmployees } from '@/hooks/useEmployees';
import { useOvertimeRequests, OvertimeRequest } from '@/hooks/useOvertimeRequests';

export function OvertimeRequestTab() {
  const { t } = useTranslation();
  const { employees } = useEmployees();
  const { requests, isLoading, createRequest, approveRequest, rejectRequest, deleteRequest } = useOvertimeRequests();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [overtimeTypeFilter, setOvertimeTypeFilter] = useState('all');

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<OvertimeRequest | null>(null);

  const [formData, setFormData] = useState({
    employee: '',
    overtimeDate: undefined as Date | undefined,
    startTime: '18:00',
    endTime: '21:00',
    overtimeType: 'weekday' as string,
    reason: '',
    compensationType: 'salary' as string,
  });

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
    totalHours: requests.filter(r => r.status === 'approved').reduce((sum, r) => sum + r.total_hours, 0),
  };

  const getCoefficient = (type: string) => {
    switch (type) {
      case 'weekday': return 1.5;
      case 'weekend': return 2.0;
      case 'holiday': return 3.0;
      default: return 1.5;
    }
  };

  const getOvertimeTypeLabel = (type: string) => {
    switch (type) {
      case 'weekday': return t('overtime.weekday');
      case 'weekend': return t('overtime.weekend');
      case 'holiday': return t('overtime.holiday');
      default: return type;
    }
  };

  const getOvertimeTypeBadge = (type: string) => {
    switch (type) {
      case 'weekday':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">{t('overtime.weekday')}</Badge>;
      case 'weekend':
        return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">{t('overtime.weekend')}</Badge>;
      case 'holiday':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">{t('overtime.holiday')}</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">{t('status.approved')}</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">{t('status.rejected')}</Badge>;
      default:
        return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">{t('status.pending')}</Badge>;
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesSearch = req.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         req.employee_code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    const matchesType = overtimeTypeFilter === 'all' || req.overtime_type === overtimeTypeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const calculateHours = (start: string, end: string): number => {
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    return Math.max(0, (endMinutes - startMinutes) / 60);
  };

  const handleAddRequest = async () => {
    if (!formData.employee || !formData.overtimeDate || !formData.reason) {
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
      overtime_date: format(formData.overtimeDate, 'yyyy-MM-dd'),
      start_time: formData.startTime,
      end_time: formData.endTime,
      total_hours: calculateHours(formData.startTime, formData.endTime),
      overtime_type: formData.overtimeType,
      coefficient: getCoefficient(formData.overtimeType),
      reason: formData.reason,
      compensation_type: formData.compensationType,
    });

    if (result) {
      setAddModalOpen(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({
      employee: '',
      overtimeDate: undefined,
      startTime: '18:00',
      endTime: '21:00',
      overtimeType: 'weekday',
      reason: '',
      compensationType: 'salary',
    });
  };

  const handleApprove = async (request: OvertimeRequest) => {
    await approveRequest(request.id);
    setDetailModalOpen(false);
  };

  const handleReject = async (request: OvertimeRequest) => {
    await rejectRequest(request.id, t('overtime.notEligible'));
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
        <h2 className="text-xl font-semibold">{t('overtime.title')}</h2>
        <Button className="gap-2 bg-orange-500 hover:bg-orange-600 text-white" onClick={() => setAddModalOpen(true)}>
          <Plus className="w-4 h-4" />
          {t('overtime.addRequest')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100"><Clock className="w-5 h-5 text-blue-600" /></div>
            <div><p className="text-2xl font-bold">{stats.total}</p><p className="text-sm text-muted-foreground">{t('overtime.totalRequests')}</p></div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-100"><AlertCircle className="w-5 h-5 text-orange-600" /></div>
            <div><p className="text-2xl font-bold">{stats.pending}</p><p className="text-sm text-muted-foreground">{t('overtime.pendingApproval')}</p></div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100"><Check className="w-5 h-5 text-green-600" /></div>
            <div><p className="text-2xl font-bold">{stats.approved}</p><p className="text-sm text-muted-foreground">{t('overtime.approved')}</p></div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100"><X className="w-5 h-5 text-red-600" /></div>
            <div><p className="text-2xl font-bold">{stats.rejected}</p><p className="text-sm text-muted-foreground">{t('overtime.rejected')}</p></div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100"><TrendingUp className="w-5 h-5 text-purple-600" /></div>
            <div><p className="text-2xl font-bold">{stats.totalHours}h</p><p className="text-sm text-muted-foreground">{t('overtime.totalApprovedHours')}</p></div>
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
              <SelectItem value="pending">{t('status.pending')}</SelectItem>
              <SelectItem value="approved">{t('status.approved')}</SelectItem>
              <SelectItem value="rejected">{t('status.rejected')}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={overtimeTypeFilter} onValueChange={setOvertimeTypeFilter}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder={t('overtime.overtimeType')} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common.all')}</SelectItem>
              <SelectItem value="weekday">{t('overtime.weekday')}</SelectItem>
              <SelectItem value="weekend">{t('overtime.weekend')}</SelectItem>
              <SelectItem value="holiday">{t('overtime.holiday')}</SelectItem>
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
                <th className="p-3 text-left font-medium text-sm">{t('attendanceRecords.employee')}</th>
                <th className="p-3 text-left font-medium text-sm">{t('attendanceRecords.department')}</th>
                <th className="p-3 text-center font-medium text-sm">{t('overtime.overtimeDate')}</th>
                <th className="p-3 text-center font-medium text-sm">{t('checkinout.time')}</th>
                <th className="p-3 text-center font-medium text-sm">{t('overtime.totalHours')}</th>
                <th className="p-3 text-center font-medium text-sm">{t('overtime.overtimeType')}</th>
                <th className="p-3 text-center font-medium text-sm">{t('overtime.coefficient')}</th>
                <th className="p-3 text-left font-medium text-sm">{t('overtime.reason')}</th>
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
                  <td className="p-3 text-sm text-center">{request.overtime_date}</td>
                  <td className="p-3 text-sm text-center">{request.start_time} - {request.end_time}</td>
                  <td className="p-3 text-center">
                    <Badge variant="secondary">{request.total_hours}h</Badge>
                  </td>
                  <td className="p-3 text-center">{getOvertimeTypeBadge(request.overtime_type)}</td>
                  <td className="p-3 text-center font-medium text-orange-600">x{request.coefficient}</td>
                  <td className="p-3 text-sm max-w-[200px] truncate">{request.reason}</td>
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
                  <td colSpan={11} className="p-8 text-center text-muted-foreground">
                    {t('overtime.noRequests')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between p-4 border-t">
          <div className="text-sm text-muted-foreground">{t('overtime.totalCount')}: <span className="font-medium">{filteredRequests.length}</span></div>
        </div>
      </Card>

      {/* Add Modal */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('overtime.addRequest')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t('attendanceRecords.employee')} *</Label>
              <Select value={formData.employee} onValueChange={(v) => setFormData({ ...formData, employee: v })}>
                <SelectTrigger><SelectValue placeholder={t('overtime.selectEmployee')} /></SelectTrigger>
                <SelectContent>
                  {employees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>{emp.full_name} - {emp.employee_code}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t('overtime.overtimeDate')} *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.overtimeDate ? format(formData.overtimeDate, 'dd/MM/yyyy', { locale: vi }) : t('overtime.selectDate')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0"><CalendarComponent mode="single" selected={formData.overtimeDate} onSelect={(d) => setFormData({ ...formData, overtimeDate: d })} /></PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t('overtime.startTime')}</Label>
                <Input type="time" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} />
              </div>
              <div>
                <Label>{t('overtime.endTime')}</Label>
                <Input type="time" value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t('overtime.overtimeType')}</Label>
                <Select value={formData.overtimeType} onValueChange={(v) => setFormData({ ...formData, overtimeType: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekday">{t('overtime.weekday')} (x1.5)</SelectItem>
                    <SelectItem value="weekend">{t('overtime.weekend')} (x2.0)</SelectItem>
                    <SelectItem value="holiday">{t('overtime.holiday')} (x3.0)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t('overtime.compensationType')}</Label>
                <Select value={formData.compensationType} onValueChange={(v) => setFormData({ ...formData, compensationType: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="salary">{t('overtime.compensationSalary')}</SelectItem>
                    <SelectItem value="compensatory_leave">{t('overtime.compensationTimeOff')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>{t('overtime.reason')} *</Label>
              <Textarea value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} placeholder={t('overtime.reason')} />
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
            <DialogTitle>{t('overtime.requestDetail')}</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-orange-100 text-orange-600">
                    {selectedRequest.employee_name.split(' ').pop()?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedRequest.employee_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedRequest.employee_code} - {selectedRequest.position}</p>
                </div>
                <div className="ml-auto">{getStatusBadge(selectedRequest.status)}</div>
              </div>
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">{t('overtime.overtimeDate')}</p>
                  <p className="font-medium">{selectedRequest.overtime_date}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('checkinout.time')}</p>
                  <p className="font-medium">{selectedRequest.start_time} - {selectedRequest.end_time}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('overtime.totalHours')}</p>
                  <p className="font-medium">{selectedRequest.total_hours}h</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('overtime.coefficient')}</p>
                  <p className="font-medium text-orange-600">x{selectedRequest.coefficient}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('overtime.overtimeType')}</p>
                  <p>{getOvertimeTypeBadge(selectedRequest.overtime_type)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('overtime.compensationType')}</p>
                  <p className="font-medium">{selectedRequest.compensation_type === 'salary' ? t('overtime.compensationSalary') : t('overtime.compensationTimeOff')}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">{t('overtime.reason')}</p>
                <p className="text-sm">{selectedRequest.reason}</p>
              </div>
              {selectedRequest.rejected_reason && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{t('leave.rejectReason')}</p>
                  <p className="text-sm text-red-600">{selectedRequest.rejected_reason}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            {selectedRequest?.status === 'pending' && (
              <>
                <Button variant="outline" className="text-red-600" onClick={() => selectedRequest && handleReject(selectedRequest)}>
                  <X className="w-4 h-4 mr-2" />{t('leave.reject')}
                </Button>
                <Button className="bg-green-600 hover:bg-green-700" onClick={() => selectedRequest && handleApprove(selectedRequest)}>
                  <Check className="w-4 h-4 mr-2" />{t('leave.approve')}
                </Button>
              </>
            )}
            <Button variant="outline" onClick={() => setDetailModalOpen(false)}>{t('common.close')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('overtime.deleteConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('overtime.deleteConfirmMessage')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDelete}>{t('common.delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
