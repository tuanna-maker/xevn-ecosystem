import { useState } from 'react';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useEmployees } from '@/hooks/useEmployees';
import { useLeaveRequests, LeaveRequestFormData, LeaveRequest } from '@/hooks/useLeaveRequests';
import { cn } from '@/lib/utils';

export function LeaveTab() {
  const { t } = useTranslation();
  const { employees, isLoading: isLoadingEmployees } = useEmployees();
  const { requests, isLoading, createRequest, approveRequest, rejectRequest, deleteRequest } = useLeaveRequests();

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

  const [formData, setFormData] = useState({
    employeeId: '',
    leaveType: 'annual',
    startDate: '',
    endDate: '',
    reason: '',
    handoverTo: '',
    handoverTasks: '',
  });

  const leaveTypeLabels: Record<string, string> = {
    annual: t('leave.annual'),
    sick: t('leave.sick'),
    unpaid: t('leave.unpaid'),
    maternity: t('leave.maternity'),
    paternity: t('leave.paternity'),
    marriage: t('leave.marriage'),
    bereavement: t('leave.bereavement'),
    other: t('leave.other'),
  };

  const leaveTypeColors: Record<string, string> = {
    annual: 'bg-blue-500',
    sick: 'bg-red-500',
    unpaid: 'bg-gray-500',
    maternity: 'bg-pink-500',
    paternity: 'bg-indigo-500',
    marriage: 'bg-purple-500',
    bereavement: 'bg-slate-600',
    other: 'bg-teal-500',
  };

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

    const employee = employees.find(e => e.id === formData.employeeId);
    if (!employee) return;

    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    const totalDays = differenceInDays(endDate, startDate) + 1;

    if (totalDays <= 0) {
      return;
    }

    setIsSubmitting(true);
    const data: LeaveRequestFormData = {
      employee_id: employee.id,
      employee_code: employee.employee_code,
      employee_name: employee.full_name,
      department: employee.department || undefined,
      position: employee.position || undefined,
      leave_type: formData.leaveType,
      start_date: formData.startDate,
      end_date: formData.endDate,
      total_days: totalDays,
      reason: formData.reason || undefined,
      handover_to: formData.handoverTo || undefined,
      handover_tasks: formData.handoverTasks || undefined,
    };

    const result = await createRequest(data);
    setIsSubmitting(false);
    
    if (result) {
      setIsCreateOpen(false);
      setFormData({
        employeeId: '',
        leaveType: 'annual',
        startDate: '',
        endDate: '',
        reason: '',
        handoverTo: '',
        handoverTasks: '',
      });
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
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
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
                <Select value={formData.employeeId} onValueChange={(v) => setFormData({...formData, employeeId: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('leave.selectEmployee')} />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingEmployees ? (
                      <SelectItem value="" disabled>{t('common.loading')}</SelectItem>
                    ) : employees.length === 0 ? (
                      <SelectItem value="" disabled>{t('leave.noEmployees')}</SelectItem>
                    ) : (
                      employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.full_name} - {emp.department || t('employeeProfile.noDepartment')}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>{t('leave.selectLeaveType')}</Label>
                <Select value={formData.leaveType} onValueChange={(v) => setFormData({...formData, leaveType: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('leave.selectLeaveType')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="annual">{t('leave.annual')}</SelectItem>
                    <SelectItem value="sick">{t('leave.sick')}</SelectItem>
                    <SelectItem value="unpaid">{t('leave.unpaid')}</SelectItem>
                    <SelectItem value="maternity">{t('leave.maternity')}</SelectItem>
                    <SelectItem value="paternity">{t('leave.paternity')}</SelectItem>
                    <SelectItem value="marriage">{t('leave.marriage')}</SelectItem>
                    <SelectItem value="bereavement">{t('leave.bereavement')}</SelectItem>
                    <SelectItem value="other">{t('leave.other')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>{t('leave.fromDate')}</Label>
                  <Input 
                    type="date" 
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>{t('leave.toDate')}</Label>
                  <Input 
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>{t('leave.handoverTo')}</Label>
                <Select 
                  value={formData.handoverTo} 
                  onValueChange={(v) => setFormData({...formData, handoverTo: v})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('leave.selectHandoverPerson')} />
                  </SelectTrigger>
                  <SelectContent>
                    {employees
                      .filter(emp => emp.id !== formData.employeeId)
                      .map((emp) => (
                        <SelectItem key={emp.id} value={emp.full_name}>
                          {emp.full_name} - {emp.department || t('common.noData')}
                        </SelectItem>
                      ))}
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
                  placeholder={t('leave.enterReason')} 
                  rows={3}
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
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
                              leaveTypeColors[leave.leave_type] || 'bg-gray-500'
                            )}
                          >
                            {leaveTypeLabels[leave.leave_type] || leave.leave_type}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {leave.total_days} {t('common.days')}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          {leave.reason}
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
                      <SelectItem value="annual">{t('leave.annual')}</SelectItem>
                      <SelectItem value="sick">{t('leave.sick')}</SelectItem>
                      <SelectItem value="unpaid">{t('leave.unpaid')}</SelectItem>
                      <SelectItem value="maternity">{t('leave.maternity')}</SelectItem>
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
                              leaveTypeColors[request.leave_type] || 'bg-gray-500'
                            )}
                          >
                            {leaveTypeLabels[request.leave_type] || request.leave_type}
                          </Badge>
                        </td>
                        <td>{format(parseISO(request.start_date), 'dd/MM/yyyy')}</td>
                        <td>{format(parseISO(request.end_date), 'dd/MM/yyyy')}</td>
                        <td className="font-medium">{request.total_days}</td>
                        <td className="max-w-[200px] truncate">{request.reason}</td>
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
                                leaveTypeColors[request.leave_type] || 'bg-gray-500'
                              )}
                            >
                              {leaveTypeLabels[request.leave_type] || request.leave_type}
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
                        {request.reason && (
                          <div className="mt-2 text-sm">
                            <span className="text-muted-foreground">
                              {t('leave.reason')}:
                            </span>{' '}
                            {request.reason}
                          </div>
                        )}
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
                        leaveTypeColors[selectedRequest.leave_type] || 'bg-gray-500'
                      )}
                    >
                      {leaveTypeLabels[selectedRequest.leave_type] || selectedRequest.leave_type}
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

              {selectedRequest.reason && (
                <div>
                  <Label className="text-muted-foreground">{t('leave.reason')}</Label>
                  <p className="mt-1 p-3 bg-muted/50 rounded-lg">{selectedRequest.reason}</p>
                </div>
              )}

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

              {selectedRequest.rejected_reason && (
                <div>
                  <Label className="text-muted-foreground text-red-600">{t('leave.rejectReason')}</Label>
                  <p className="mt-1 p-3 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 rounded-lg">
                    {selectedRequest.rejected_reason}
                  </p>
                </div>
              )}

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
