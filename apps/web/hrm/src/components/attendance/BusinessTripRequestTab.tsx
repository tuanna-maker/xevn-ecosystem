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
  MapPin,
  CalendarIcon,
  AlertCircle,
  Plane,
  Car,
  Train,
  Building2,
  Wallet,
  FileText,
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
import { format, differenceInDays } from 'date-fns';
import { vi, enUS, zhCN } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useEmployees } from '@/hooks/useEmployees';
import { useBusinessTripRequests, BusinessTripRequest } from '@/hooks/useBusinessTripRequests';

export function BusinessTripRequestTab() {
  const { t, i18n } = useTranslation();
  const { employees } = useEmployees();
  const { requests, isLoading, createRequest, approveRequest, rejectRequest, deleteRequest } = useBusinessTripRequests();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<BusinessTripRequest | null>(null);

  const [formData, setFormData] = useState({
    employee: '',
    destination: '',
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    purpose: '',
    transportation: 'car' as string,
    accommodation: '',
    estimatedCost: 0,
    hasAdvance: false,
    advanceAmount: 0,
    companions: '',
    contactInfo: '',
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
    totalDays: requests.filter(r => r.status === 'approved').reduce((sum, r) => sum + r.total_days, 0),
    totalCost: requests.filter(r => r.status === 'approved').reduce((sum, r) => sum + (r.estimated_cost || 0), 0),
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const getTransportationIcon = (type: string) => {
    switch (type) {
      case 'plane': return <Plane className="w-4 h-4" />;
      case 'train': return <Train className="w-4 h-4" />;
      case 'car': return <Car className="w-4 h-4" />;
      default: return <Car className="w-4 h-4" />;
    }
  };

  const getTransportationLabel = (type: string) => {
    switch (type) {
      case 'plane': return t('businessTrip.transport.plane');
      case 'train': return t('businessTrip.transport.train');
      case 'car': return t('businessTrip.transport.car');
      case 'company_car': return t('businessTrip.transport.companyCar');
      default: return t('common.other');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">{t('common.approved')}</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">{t('common.rejected')}</Badge>;
      default:
        return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">{t('common.pending')}</Badge>;
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesSearch = req.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         req.employee_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         req.destination.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || req.department === departmentFilter;
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const calculateDays = (start?: Date, end?: Date): number => {
    if (!start || !end) return 0;
    return differenceInDays(end, start) + 1;
  };

  const handleAddRequest = async () => {
    if (!formData.employee || !formData.destination || !formData.startDate || !formData.endDate || !formData.purpose) {
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
      destination: formData.destination,
      start_date: format(formData.startDate, 'yyyy-MM-dd'),
      end_date: format(formData.endDate, 'yyyy-MM-dd'),
      total_days: calculateDays(formData.startDate, formData.endDate),
      purpose: formData.purpose,
      transportation: formData.transportation,
      accommodation: formData.accommodation,
      estimated_cost: formData.estimatedCost,
      advance_amount: formData.hasAdvance ? formData.advanceAmount : 0,
      companions: formData.companions,
      contact_info: formData.contactInfo,
    });

    if (result) {
      setAddModalOpen(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({
      employee: '',
      destination: '',
      startDate: undefined,
      endDate: undefined,
      purpose: '',
      transportation: 'car',
      accommodation: '',
      estimatedCost: 0,
      hasAdvance: false,
      advanceAmount: 0,
      companions: '',
      contactInfo: '',
    });
  };

  const handleApprove = async (request: BusinessTripRequest) => {
    await approveRequest(request.id);
    setDetailModalOpen(false);
  };

  const handleReject = async (request: BusinessTripRequest) => {
    await rejectRequest(request.id, t('businessTrip.rejectReason'));
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
        <h2 className="text-xl font-semibold">{t('businessTrip.title')}</h2>
        <Button className="gap-2 bg-orange-500 hover:bg-orange-600 text-white" onClick={() => setAddModalOpen(true)}>
          <Plus className="w-4 h-4" />
          {t('businessTrip.addRequest')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100"><FileText className="w-5 h-5 text-blue-600" /></div>
            <div><p className="text-2xl font-bold">{stats.total}</p><p className="text-sm text-muted-foreground">{t('businessTrip.totalRequests')}</p></div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-100"><AlertCircle className="w-5 h-5 text-orange-600" /></div>
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
            <div className="p-2 rounded-lg bg-purple-100"><CalendarIcon className="w-5 h-5 text-purple-600" /></div>
            <div><p className="text-2xl font-bold">{stats.totalDays}</p><p className="text-sm text-muted-foreground">{t('businessTrip.tripDays')}</p></div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-100"><Wallet className="w-5 h-5 text-yellow-600" /></div>
            <div><p className="text-lg font-bold">{formatCurrency(stats.totalCost)}</p><p className="text-sm text-muted-foreground">{t('businessTrip.totalCost')}</p></div>
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
                <th className="p-3 text-left font-medium text-sm">{t('businessTrip.destination')}</th>
                <th className="p-3 text-center font-medium text-sm">{t('businessTrip.period')}</th>
                <th className="p-3 text-center font-medium text-sm">{t('businessTrip.days')}</th>
                <th className="p-3 text-left font-medium text-sm">{t('businessTrip.purpose')}</th>
                <th className="p-3 text-center font-medium text-sm">{t('businessTrip.transportation')}</th>
                <th className="p-3 text-right font-medium text-sm">{t('businessTrip.estimatedCost')}</th>
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
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-orange-500" />
                      <span className="text-sm font-medium">{request.destination}</span>
                    </div>
                  </td>
                  <td className="p-3 text-sm text-center">
                    <div>{request.start_date}</div>
                    <div className="text-xs text-muted-foreground">{t('businessTrip.to')} {request.end_date}</div>
                  </td>
                  <td className="p-3 text-center">
                    <Badge variant="secondary">{request.total_days} {t('businessTrip.daysUnit')}</Badge>
                  </td>
                  <td className="p-3 text-sm max-w-[200px] truncate">{request.purpose}</td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {getTransportationIcon(request.transportation || 'car')}
                      <span className="text-xs">{getTransportationLabel(request.transportation || 'car')}</span>
                    </div>
                  </td>
                  <td className="p-3 text-sm text-right font-medium">{formatCurrency(request.estimated_cost || 0)}</td>
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
                    {t('businessTrip.noRequests')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between p-4 border-t">
          <div className="text-sm text-muted-foreground">{t('common.total')}: <span className="font-medium">{filteredRequests.length} {t('businessTrip.requestsUnit')}</span></div>
        </div>
      </Card>

      {/* Add Modal */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('businessTrip.addRequest')}</DialogTitle>
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
              <Label>{t('businessTrip.destination')} *</Label>
              <Input value={formData.destination} onChange={(e) => setFormData({ ...formData, destination: e.target.value })} placeholder={t('businessTrip.destinationPlaceholder')} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t('businessTrip.startDate')} *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.startDate ? format(formData.startDate, 'dd/MM/yyyy', { locale: getDateLocale() }) : t('common.selectDate')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0"><CalendarComponent mode="single" selected={formData.startDate} onSelect={(d) => setFormData({ ...formData, startDate: d })} /></PopoverContent>
                </Popover>
              </div>
              <div>
                <Label>{t('businessTrip.endDate')} *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.endDate ? format(formData.endDate, 'dd/MM/yyyy', { locale: getDateLocale() }) : t('common.selectDate')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0"><CalendarComponent mode="single" selected={formData.endDate} onSelect={(d) => setFormData({ ...formData, endDate: d })} /></PopoverContent>
                </Popover>
              </div>
            </div>
            {formData.startDate && formData.endDate && (
              <div className="text-sm text-muted-foreground">
                {t('businessTrip.duration')}: <span className="font-medium text-foreground">{calculateDays(formData.startDate, formData.endDate)} {t('businessTrip.daysUnit')}</span>
              </div>
            )}
            <div>
              <Label>{t('businessTrip.purpose')} *</Label>
              <Textarea value={formData.purpose} onChange={(e) => setFormData({ ...formData, purpose: e.target.value })} placeholder={t('businessTrip.purposePlaceholder')} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t('businessTrip.transportation')}</Label>
                <Select value={formData.transportation} onValueChange={(v) => setFormData({ ...formData, transportation: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="car">{t('businessTrip.transport.car')}</SelectItem>
                    <SelectItem value="plane">{t('businessTrip.transport.plane')}</SelectItem>
                    <SelectItem value="train">{t('businessTrip.transport.train')}</SelectItem>
                    <SelectItem value="company_car">{t('businessTrip.transport.companyCar')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t('businessTrip.accommodation')}</Label>
                <Input value={formData.accommodation} onChange={(e) => setFormData({ ...formData, accommodation: e.target.value })} placeholder={t('businessTrip.accommodationPlaceholder')} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t('businessTrip.estimatedCost')}</Label>
                <Input type="number" value={formData.estimatedCost} onChange={(e) => setFormData({ ...formData, estimatedCost: Number(e.target.value) })} />
              </div>
              <div className="flex items-center gap-4 pt-6">
                <Switch checked={formData.hasAdvance} onCheckedChange={(v) => setFormData({ ...formData, hasAdvance: v })} />
                <Label>{t('businessTrip.hasAdvance')}</Label>
              </div>
            </div>
            {formData.hasAdvance && (
              <div>
                <Label>{t('businessTrip.advanceAmount')}</Label>
                <Input type="number" value={formData.advanceAmount} onChange={(e) => setFormData({ ...formData, advanceAmount: Number(e.target.value) })} />
              </div>
            )}
            <div>
              <Label>{t('businessTrip.companions')}</Label>
              <Input value={formData.companions} onChange={(e) => setFormData({ ...formData, companions: e.target.value })} placeholder={t('businessTrip.companionsPlaceholder')} />
            </div>
            <div>
              <Label>{t('businessTrip.contactInfo')}</Label>
              <Input value={formData.contactInfo} onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })} placeholder={t('businessTrip.contactInfoPlaceholder')} />
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('businessTrip.requestDetail')}</DialogTitle>
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
                  <p className="text-sm text-muted-foreground">{t('businessTrip.destination')}</p>
                  <p className="font-medium flex items-center gap-2"><MapPin className="w-4 h-4 text-orange-500" />{selectedRequest.destination}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('businessTrip.duration')}</p>
                  <p className="font-medium">{selectedRequest.start_date} - {selectedRequest.end_date} ({selectedRequest.total_days} {t('businessTrip.daysUnit')})</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('businessTrip.transportation')}</p>
                  <p className="font-medium flex items-center gap-2">
                    {getTransportationIcon(selectedRequest.transportation || 'car')}
                    {getTransportationLabel(selectedRequest.transportation || 'car')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('businessTrip.estimatedCost')}</p>
                  <p className="font-medium text-orange-600">{formatCurrency(selectedRequest.estimated_cost || 0)}</p>
                </div>
                {selectedRequest.advance_amount && selectedRequest.advance_amount > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground">{t('businessTrip.advanceAmount')}</p>
                    <p className="font-medium">{formatCurrency(selectedRequest.advance_amount)}</p>
                  </div>
                )}
                {selectedRequest.accommodation && (
                  <div>
                    <p className="text-sm text-muted-foreground">{t('businessTrip.accommodation')}</p>
                    <p className="font-medium">{selectedRequest.accommodation}</p>
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('businessTrip.purpose')}</p>
                <p className="font-medium">{selectedRequest.purpose}</p>
              </div>
              {selectedRequest.companions && (
                <div>
                  <p className="text-sm text-muted-foreground">{t('businessTrip.companions')}</p>
                  <p className="font-medium">{selectedRequest.companions}</p>
                </div>
              )}
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
              {t('businessTrip.deleteConfirmation')}
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
