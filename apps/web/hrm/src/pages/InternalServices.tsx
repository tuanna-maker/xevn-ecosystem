import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, UtensilsCrossed, Car, Package, Calendar, CheckCircle2, Clock, Search, Loader2, Trash2, Eye, Edit, XCircle } from 'lucide-react';
import { useServiceRequests, ServiceRequest } from '@/hooks/useServiceRequests';
import { useEmployees } from '@/hooks/useEmployees';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

const statusMap: Record<string, { variant: 'default' | 'secondary' | 'outline' | 'destructive'; label: string }> = {
  pending: { variant: 'outline', label: 'Chờ duyệt' },
  approved: { variant: 'default', label: 'Đã duyệt' },
  rejected: { variant: 'destructive', label: 'Từ chối' },
  completed: { variant: 'secondary', label: 'Hoàn thành' },
  cancelled: { variant: 'secondary', label: 'Đã hủy' },
};

export default function InternalServices() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('meal');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewDialog, setViewDialog] = useState<ServiceRequest | null>(null);

  const { data: allRequests = [], isLoading, addRequest, updateRequest, deleteRequest, approveRequest, rejectRequest } = useServiceRequests();
  const { employees } = useEmployees();

  const meals = allRequests.filter(r => r.service_type === 'meal');
  const vehicles = allRequests.filter(r => r.service_type === 'vehicle');
  const supplies = allRequests.filter(r => r.service_type === 'supply');

  const getFiltered = (list: ServiceRequest[]) => list.filter(r =>
    !searchTerm || r.employee_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Form state
  const [form, setForm] = useState<any>({});

  const openAdd = (type: string) => {
    setEditingId(null);
    setForm({
      service_type: type,
      employee_id: '',
      employee_name: '',
      employee_code: '',
      department: '',
      notes: '',
      meal_type: 'lunch',
      meal_date: format(new Date(), 'yyyy-MM-dd'),
      meal_quantity: 1,
      vehicle_purpose: '',
      vehicle_destination: '',
      vehicle_date: format(new Date(), 'yyyy-MM-dd'),
      vehicle_time_start: '08:00',
      vehicle_time_end: '17:00',
      vehicle_passengers: 1,
      supply_items: [{ name: '', quantity: 1, unit: 'cái', note: '' }],
      supply_urgency: 'normal',
    });
    setDialogOpen(true);
  };

  const openEdit = (item: ServiceRequest) => {
    setEditingId(item.id);
    setForm({
      ...item,
      supply_items: item.supply_items || [{ name: '', quantity: 1, unit: 'cái', note: '' }],
    });
    setDialogOpen(true);
  };

  const handleEmployeeSelect = (empId: string) => {
    const emp = employees.find(e => e.id === empId);
    if (emp) {
      setForm((f: any) => ({ ...f, employee_id: emp.id, employee_name: emp.full_name, employee_code: emp.employee_code, department: emp.department }));
    }
  };

  const handleSave = () => {
    if (!form.employee_name) return;
    const payload: any = {
      service_type: form.service_type,
      employee_id: form.employee_id || null,
      employee_name: form.employee_name,
      employee_code: form.employee_code || null,
      department: form.department || null,
      notes: form.notes || null,
    };
    if (form.service_type === 'meal') {
      payload.meal_type = form.meal_type;
      payload.meal_date = form.meal_date;
      payload.meal_quantity = form.meal_quantity;
    } else if (form.service_type === 'vehicle') {
      payload.vehicle_purpose = form.vehicle_purpose;
      payload.vehicle_destination = form.vehicle_destination;
      payload.vehicle_date = form.vehicle_date;
      payload.vehicle_time_start = form.vehicle_time_start;
      payload.vehicle_time_end = form.vehicle_time_end;
      payload.vehicle_passengers = form.vehicle_passengers;
    } else {
      payload.supply_items = form.supply_items;
      payload.supply_urgency = form.supply_urgency;
    }

    if (editingId) {
      updateRequest.mutate({ id: editingId, ...payload });
    } else {
      addRequest.mutate(payload);
    }
    setDialogOpen(false);
  };

  const renderStats = (list: ServiceRequest[], icon: React.ElementType) => {
    const Icon = icon;
    const pending = list.filter(r => r.status === 'pending').length;
    const approved = list.filter(r => r.status === 'approved').length;
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card><CardContent className="p-4 text-center">
          <Icon className="w-7 h-7 text-primary mx-auto mb-1.5" />
          <p className="text-xl font-bold">{list.length}</p>
          <p className="text-xs text-muted-foreground">Tổng yêu cầu</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <Clock className="w-7 h-7 text-yellow-500 mx-auto mb-1.5" />
          <p className="text-xl font-bold">{pending}</p>
          <p className="text-xs text-muted-foreground">Chờ duyệt</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <CheckCircle2 className="w-7 h-7 text-green-500 mx-auto mb-1.5" />
          <p className="text-xl font-bold">{approved}</p>
          <p className="text-xs text-muted-foreground">Đã duyệt</p>
        </CardContent></Card>
      </div>
    );
  };

  const renderRequests = (list: ServiceRequest[], type: string, icon: React.ElementType) => {
    const Icon = icon;
    const filtered = getFiltered(list);
    if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
    if (filtered.length === 0) return (
      <Card><CardContent className="p-8 text-center text-muted-foreground">
        <Icon className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>Chưa có yêu cầu nào</p>
        <Button variant="outline" size="sm" className="mt-3" onClick={() => openAdd(type)}>
          <Plus className="w-4 h-4 mr-1.5" />Tạo yêu cầu
        </Button>
      </CardContent></Card>
    );
    return (
      <div className="grid gap-3">
        {filtered.map(item => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-medium text-sm">{item.employee_name}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                      {item.department && <span>{item.department}</span>}
                      <span>•</span>
                      <span>{format(new Date(item.created_at), 'dd/MM/yyyy')}</span>
                      {type === 'meal' && item.meal_type && <><span>•</span><span>{item.meal_type === 'lunch' ? 'Trưa' : item.meal_type === 'dinner' ? 'Tối' : 'Sáng'}</span></>}
                      {type === 'vehicle' && item.vehicle_destination && <><span>•</span><span>{item.vehicle_destination}</span></>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={statusMap[item.status]?.variant || 'secondary'}>{statusMap[item.status]?.label || item.status}</Badge>
                  {item.status === 'pending' && (
                    <>
                      <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => approveRequest.mutate({ id: item.id, approved_by: user?.id || '' })}>Duyệt</Button>
                      <Button variant="outline" size="sm" className="h-7 text-xs text-destructive" onClick={() => rejectRequest.mutate({ id: item.id, rejected_reason: 'Từ chối' })}>Từ chối</Button>
                    </>
                  )}
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewDialog(item)}><Eye className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(item)}><Edit className="w-4 h-4" /></Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="w-4 h-4" /></Button></AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader><AlertDialogTitle>Xác nhận xóa</AlertDialogTitle><AlertDialogDescription>Bạn có chắc muốn xóa yêu cầu này?</AlertDialogDescription></AlertDialogHeader>
                      <AlertDialogFooter><AlertDialogCancel>Hủy</AlertDialogCancel><AlertDialogAction onClick={() => deleteRequest.mutate(item.id)}>Xóa</AlertDialogAction></AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const addSupplyItem = () => {
    setForm((f: any) => ({ ...f, supply_items: [...(f.supply_items || []), { name: '', quantity: 1, unit: 'cái', note: '' }] }));
  };

  const updateSupplyItem = (idx: number, field: string, value: any) => {
    setForm((f: any) => {
      const items = [...(f.supply_items || [])];
      items[idx] = { ...items[idx], [field]: value };
      return { ...f, supply_items: items };
    });
  };

  const removeSupplyItem = (idx: number) => {
    setForm((f: any) => ({ ...f, supply_items: (f.supply_items || []).filter((_: any, i: number) => i !== idx) }));
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <PageHeader
        title={t('services.title', 'Dịch vụ nội bộ')}
        subtitle={t('services.description', 'Quản lý báo cơm, đặt xe, văn phòng phẩm')}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <TabsList className="h-auto bg-transparent gap-1 p-0 overflow-x-auto scrollbar-hide flex flex-nowrap w-full sm:w-auto">
            <TabsTrigger value="meal" className="shrink-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4 py-1.5 text-sm">
              <UtensilsCrossed className="w-4 h-4 mr-1.5" />Báo cơm
              {meals.length > 0 && <Badge variant="secondary" className="ml-1.5 text-[10px] h-5">{meals.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="vehicle" className="shrink-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4 py-1.5 text-sm">
              <Car className="w-4 h-4 mr-1.5" />Đặt xe
              {vehicles.length > 0 && <Badge variant="secondary" className="ml-1.5 text-[10px] h-5">{vehicles.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="supply" className="shrink-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4 py-1.5 text-sm">
              <Package className="w-4 h-4 mr-1.5" />Văn phòng phẩm
              {supplies.length > 0 && <Badge variant="secondary" className="ml-1.5 text-[10px] h-5">{supplies.length}</Badge>}
            </TabsTrigger>
          </TabsList>
          <Button size="sm" className="shrink-0" onClick={() => openAdd(activeTab)}>
            <Plus className="w-4 h-4 mr-1.5" />Tạo yêu cầu
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Tìm theo tên nhân viên..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
          </div>
        </div>

        <TabsContent value="meal" className="space-y-4">
          {renderStats(meals, UtensilsCrossed)}
          {renderRequests(meals, 'meal', UtensilsCrossed)}
        </TabsContent>
        <TabsContent value="vehicle" className="space-y-4">
          {renderStats(vehicles, Car)}
          {renderRequests(vehicles, 'vehicle', Car)}
        </TabsContent>
        <TabsContent value="supply" className="space-y-4">
          {renderStats(supplies, Package)}
          {renderRequests(supplies, 'supply', Package)}
        </TabsContent>
      </Tabs>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Chỉnh sửa' : 'Tạo'} yêu cầu {form.service_type === 'meal' ? 'báo cơm' : form.service_type === 'vehicle' ? 'đặt xe' : 'văn phòng phẩm'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nhân viên <span className="text-destructive">*</span></Label>
              <Select value={form.employee_id || ''} onValueChange={handleEmployeeSelect}>
                <SelectTrigger><SelectValue placeholder="Chọn nhân viên" /></SelectTrigger>
                <SelectContent>
                  {employees.map(e => <SelectItem key={e.id} value={e.id}>{e.full_name} ({e.employee_code})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {form.service_type === 'meal' && (
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label>Loại bữa</Label>
                  <Select value={form.meal_type || 'lunch'} onValueChange={v => setForm((f: any) => ({ ...f, meal_type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="breakfast">Sáng</SelectItem>
                      <SelectItem value="lunch">Trưa</SelectItem>
                      <SelectItem value="dinner">Tối</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Ngày</Label>
                  <Input type="date" value={form.meal_date || ''} onChange={e => setForm((f: any) => ({ ...f, meal_date: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Số lượng</Label>
                  <Input type="number" min={1} value={form.meal_quantity || 1} onChange={e => setForm((f: any) => ({ ...f, meal_quantity: parseInt(e.target.value) }))} />
                </div>
              </div>
            )}

            {form.service_type === 'vehicle' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Điểm đến</Label>
                    <Input value={form.vehicle_destination || ''} onChange={e => setForm((f: any) => ({ ...f, vehicle_destination: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Mục đích</Label>
                    <Input value={form.vehicle_purpose || ''} onChange={e => setForm((f: any) => ({ ...f, vehicle_purpose: e.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label>Ngày</Label>
                    <Input type="date" value={form.vehicle_date || ''} onChange={e => setForm((f: any) => ({ ...f, vehicle_date: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Giờ đi</Label>
                    <Input type="time" value={form.vehicle_time_start || ''} onChange={e => setForm((f: any) => ({ ...f, vehicle_time_start: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Giờ về</Label>
                    <Input type="time" value={form.vehicle_time_end || ''} onChange={e => setForm((f: any) => ({ ...f, vehicle_time_end: e.target.value }))} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Số người</Label>
                  <Input type="number" min={1} value={form.vehicle_passengers || 1} onChange={e => setForm((f: any) => ({ ...f, vehicle_passengers: parseInt(e.target.value) }))} />
                </div>
              </>
            )}

            {form.service_type === 'supply' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Danh sách vật tư</Label>
                  <Button variant="outline" size="sm" onClick={addSupplyItem}><Plus className="w-3 h-3 mr-1" />Thêm</Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Mức độ</Label>
                    <Select value={form.supply_urgency || 'normal'} onValueChange={v => setForm((f: any) => ({ ...f, supply_urgency: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Bình thường</SelectItem>
                        <SelectItem value="urgent">Khẩn cấp</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {(form.supply_items || []).map((si: any, idx: number) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-5 space-y-1">
                      <Label className="text-xs">Tên</Label>
                      <Input value={si.name} onChange={e => updateSupplyItem(idx, 'name', e.target.value)} placeholder="Tên vật tư" />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <Label className="text-xs">SL</Label>
                      <Input type="number" min={1} value={si.quantity} onChange={e => updateSupplyItem(idx, 'quantity', parseInt(e.target.value))} />
                    </div>
                    <div className="col-span-3 space-y-1">
                      <Label className="text-xs">ĐVT</Label>
                      <Input value={si.unit} onChange={e => updateSupplyItem(idx, 'unit', e.target.value)} />
                    </div>
                    <div className="col-span-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeSupplyItem(idx)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-1.5">
              <Label>Ghi chú</Label>
              <Textarea value={form.notes || ''} onChange={e => setForm((f: any) => ({ ...f, notes: e.target.value }))} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleSave} disabled={!form.employee_name || addRequest.isPending || updateRequest.isPending}>
              {(addRequest.isPending || updateRequest.isPending) && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
              {editingId ? 'Cập nhật' : 'Tạo yêu cầu'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={!!viewDialog} onOpenChange={() => setViewDialog(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {viewDialog && (
            <>
              <DialogHeader><DialogTitle>Chi tiết yêu cầu</DialogTitle></DialogHeader>
              <div className="space-y-3 text-sm">
                <div className="flex gap-2">
                  <Badge variant={statusMap[viewDialog.status]?.variant || 'secondary'}>{statusMap[viewDialog.status]?.label}</Badge>
                  <Badge variant="outline">{viewDialog.service_type === 'meal' ? 'Báo cơm' : viewDialog.service_type === 'vehicle' ? 'Đặt xe' : 'VPP'}</Badge>
                </div>
                <div><strong>Nhân viên:</strong> {viewDialog.employee_name} ({viewDialog.employee_code})</div>
                {viewDialog.department && <div><strong>Phòng ban:</strong> {viewDialog.department}</div>}
                {viewDialog.service_type === 'meal' && (
                  <>
                    <div><strong>Bữa:</strong> {viewDialog.meal_type === 'lunch' ? 'Trưa' : viewDialog.meal_type === 'dinner' ? 'Tối' : 'Sáng'}</div>
                    <div><strong>Ngày:</strong> {viewDialog.meal_date}</div>
                    <div><strong>Số lượng:</strong> {viewDialog.meal_quantity}</div>
                  </>
                )}
                {viewDialog.service_type === 'vehicle' && (
                  <>
                    <div><strong>Điểm đến:</strong> {viewDialog.vehicle_destination}</div>
                    <div><strong>Mục đích:</strong> {viewDialog.vehicle_purpose}</div>
                    <div><strong>Ngày:</strong> {viewDialog.vehicle_date} ({viewDialog.vehicle_time_start} - {viewDialog.vehicle_time_end})</div>
                    <div><strong>Số người:</strong> {viewDialog.vehicle_passengers}</div>
                  </>
                )}
                {viewDialog.service_type === 'supply' && viewDialog.supply_items && (
                  <div>
                    <strong>Vật tư:</strong>
                    <ul className="list-disc list-inside mt-1">
                      {(viewDialog.supply_items as any[]).map((si: any, i: number) => (
                        <li key={i}>{si.name} - SL: {si.quantity} {si.unit}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {viewDialog.notes && <div><strong>Ghi chú:</strong> {viewDialog.notes}</div>}
                <div className="text-xs text-muted-foreground">Tạo lúc: {format(new Date(viewDialog.created_at), 'dd/MM/yyyy HH:mm')}</div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
