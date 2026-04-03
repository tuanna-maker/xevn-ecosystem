import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Wrench, Package, Search, CheckCircle2, AlertTriangle, Eye, Edit, Trash2, ArrowUpDown, BarChart3, Loader2 } from 'lucide-react';
import { useToolsEquipment, ToolEquipment, ToolAssignment } from '@/hooks/useToolsEquipment';
import { useEmployees } from '@/hooks/useEmployees';
import { format } from 'date-fns';

const conditionMap: Record<string, string> = { good: 'Tốt', fair: 'Trung bình', poor: 'Kém', damaged: 'Hư hỏng' };
const statusToolMap: Record<string, { variant: 'default' | 'secondary' | 'outline' | 'destructive'; label: string }> = {
  available: { variant: 'default', label: 'Sẵn sàng' },
  in_use: { variant: 'secondary', label: 'Đang dùng' },
  maintenance: { variant: 'outline', label: 'Bảo trì' },
  disposed: { variant: 'destructive', label: 'Thanh lý' },
};

export default function ToolsEquipmentPage() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [toolDialog, setToolDialog] = useState(false);
  const [assignDialog, setAssignDialog] = useState(false);
  const [editingToolId, setEditingToolId] = useState<string | null>(null);
  const [editingAssignId, setEditingAssignId] = useState<string | null>(null);
  const [viewTool, setViewTool] = useState<ToolEquipment | null>(null);

  const { tools, assignments, isLoading, addTool, updateTool, deleteTool, addAssignment, updateAssignment, deleteAssignment } = useToolsEquipment();
  const { employees } = useEmployees();

  const filteredTools = tools.filter(t => !searchTerm || t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.code.toLowerCase().includes(searchTerm.toLowerCase()));

  // Tool form
  const emptyToolForm = { code: '', name: '', category: 'tool', brand: '', model: '', serial_number: '', specifications: '', unit: 'cái', quantity: 1, available_quantity: 1, condition: 'good', location: '', purchase_date: '', purchase_price: 0, warranty_expiry: '', status: 'available', notes: '' };
  const [toolForm, setToolForm] = useState<any>(emptyToolForm);

  // Assignment form
  const emptyAssignForm = { tool_id: '', employee_id: '', employee_name: '', employee_code: '', department: '', assignment_type: 'assign', quantity: 1, assignment_date: format(new Date(), 'yyyy-MM-dd'), condition_on_assign: 'good', notes: '' };
  const [assignForm, setAssignForm] = useState<any>(emptyAssignForm);

  const openAddTool = () => { setEditingToolId(null); setToolForm(emptyToolForm); setToolDialog(true); };
  const openEditTool = (item: ToolEquipment) => {
    setEditingToolId(item.id);
    setToolForm({ ...item, purchase_date: item.purchase_date || '', warranty_expiry: item.warranty_expiry || '' });
    setToolDialog(true);
  };

  const handleSaveTool = () => {
    if (!toolForm.name || !toolForm.code) return;
    const payload = { ...toolForm, purchase_date: toolForm.purchase_date || null, warranty_expiry: toolForm.warranty_expiry || null };
    if (editingToolId) {
      updateTool.mutate({ id: editingToolId, ...payload });
    } else {
      addTool.mutate(payload);
    }
    setToolDialog(false);
  };

  const openAddAssign = () => { setEditingAssignId(null); setAssignForm(emptyAssignForm); setAssignDialog(true); };

  const handleEmployeeSelect = (empId: string) => {
    const emp = employees.find(e => e.id === empId);
    if (emp) setAssignForm((f: any) => ({ ...f, employee_id: emp.id, employee_name: emp.full_name, employee_code: emp.employee_code, department: emp.department }));
  };

  const handleSaveAssign = () => {
    if (!assignForm.tool_id || !assignForm.employee_name) return;
    const payload = { ...assignForm, employee_id: assignForm.employee_id || null };
    if (editingAssignId) {
      updateAssignment.mutate({ id: editingAssignId, ...payload });
    } else {
      addAssignment.mutate(payload);
    }
    setAssignDialog(false);
  };

  const stats = {
    total: tools.reduce((s, t) => s + t.quantity, 0),
    inUse: tools.filter(t => t.status === 'in_use').length,
    maintenance: tools.filter(t => t.status === 'maintenance').length,
    damaged: tools.filter(t => t.condition === 'damaged').length,
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <PageHeader
        title={t('tools.title', 'Công cụ dụng cụ')}
        subtitle={t('tools.description', 'Quản lý công cụ, dụng cụ, trang thiết bị')}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-4 text-center">
          <Package className="w-7 h-7 text-primary mx-auto mb-1.5" />
          <p className="text-xl font-bold">{stats.total}</p>
          <p className="text-xs text-muted-foreground">Tổng số</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <CheckCircle2 className="w-7 h-7 text-green-500 mx-auto mb-1.5" />
          <p className="text-xl font-bold">{stats.inUse}</p>
          <p className="text-xs text-muted-foreground">Đang dùng</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <Wrench className="w-7 h-7 text-yellow-500 mx-auto mb-1.5" />
          <p className="text-xl font-bold">{stats.maintenance}</p>
          <p className="text-xs text-muted-foreground">Bảo trì</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <AlertTriangle className="w-7 h-7 text-destructive mx-auto mb-1.5" />
          <p className="text-xl font-bold">{stats.damaged}</p>
          <p className="text-xs text-muted-foreground">Hư hỏng</p>
        </CardContent></Card>
      </div>

      <Tabs defaultValue="inventory" className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <TabsList className="h-auto bg-transparent gap-1 p-0 overflow-x-auto scrollbar-hide flex flex-nowrap w-full sm:w-auto">
            <TabsTrigger value="inventory" className="shrink-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4 py-1.5 text-sm">
              <Package className="w-4 h-4 mr-1.5" />Kho CCDC
              {tools.length > 0 && <Badge variant="secondary" className="ml-1.5 text-[10px] h-5">{tools.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="assignments" className="shrink-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4 py-1.5 text-sm">
              <ArrowUpDown className="w-4 h-4 mr-1.5" />Cấp phát / Thu hồi
              {assignments.length > 0 && <Badge variant="secondary" className="ml-1.5 text-[10px] h-5">{assignments.length}</Badge>}
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Tìm kiếm CCDC..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
          </div>
        </div>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={openAddTool}><Plus className="w-4 h-4 mr-1.5" />Thêm CCDC</Button>
          </div>
          {isLoading ? (
            <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
          ) : filteredTools.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Chưa có CCDC nào</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={openAddTool}><Plus className="w-4 h-4 mr-1.5" />Thêm CCDC đầu tiên</Button>
            </CardContent></Card>
          ) : (
            <div className="grid gap-3">
              {filteredTools.map(item => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Package className="w-5 h-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-medium text-sm">{item.name}</h3>
                          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <span>{item.code}</span>
                            {item.category && <><span>•</span><span>{item.category}</span></>}
                            <span>•</span><span>SL: {item.quantity} ({item.available_quantity} sẵn)</span>
                            <span>•</span><span>{conditionMap[item.condition] || item.condition}</span>
                            {item.location && <><span>•</span><span>{item.location}</span></>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant={statusToolMap[item.status]?.variant || 'secondary'}>{statusToolMap[item.status]?.label || item.status}</Badge>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewTool(item)}><Eye className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditTool(item)}><Edit className="w-4 h-4" /></Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="w-4 h-4" /></Button></AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>Xác nhận xóa</AlertDialogTitle><AlertDialogDescription>Bạn có chắc muốn xóa "{item.name}"?</AlertDialogDescription></AlertDialogHeader>
                            <AlertDialogFooter><AlertDialogCancel>Hủy</AlertDialogCancel><AlertDialogAction onClick={() => deleteTool.mutate(item.id)}>Xóa</AlertDialogAction></AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Assignments Tab */}
        <TabsContent value="assignments" className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={openAddAssign}><Plus className="w-4 h-4 mr-1.5" />Tạo phiếu</Button>
          </div>
          {assignments.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">
              <ArrowUpDown className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Chưa có phiếu cấp phát / thu hồi nào</p>
            </CardContent></Card>
          ) : (
            <div className="grid gap-3">
              {assignments.map(item => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge variant={item.assignment_type === 'assign' ? 'default' : 'secondary'}>
                            {item.assignment_type === 'assign' ? 'Cấp phát' : 'Thu hồi'}
                          </Badge>
                          <span className="font-medium text-sm">{item.employee_name}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span>SL: {item.quantity}</span>
                          <span>•</span>
                          <span>{item.assignment_date}</span>
                          {item.department && <><span>•</span><span>{item.department}</span></>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant={item.status === 'completed' ? 'default' : 'outline'}>{item.status === 'completed' ? 'Hoàn thành' : item.status === 'pending' ? 'Chờ duyệt' : item.status}</Badge>
                        <AlertDialog>
                          <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="w-4 h-4" /></Button></AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>Xác nhận xóa</AlertDialogTitle><AlertDialogDescription>Bạn có chắc muốn xóa phiếu này?</AlertDialogDescription></AlertDialogHeader>
                            <AlertDialogFooter><AlertDialogCancel>Hủy</AlertDialogCancel><AlertDialogAction onClick={() => deleteAssignment.mutate(item.id)}>Xóa</AlertDialogAction></AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Tool Add/Edit Dialog */}
      <Dialog open={toolDialog} onOpenChange={setToolDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingToolId ? 'Chỉnh sửa' : 'Thêm'} CCDC</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Mã CCDC <span className="text-destructive">*</span></Label><Input value={toolForm.code} onChange={e => setToolForm((f: any) => ({ ...f, code: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>Tên CCDC <span className="text-destructive">*</span></Label><Input value={toolForm.name} onChange={e => setToolForm((f: any) => ({ ...f, name: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Loại</Label>
                <Select value={toolForm.category} onValueChange={v => setToolForm((f: any) => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tool">Công cụ</SelectItem>
                    <SelectItem value="equipment">Thiết bị</SelectItem>
                    <SelectItem value="device">Máy móc</SelectItem>
                    <SelectItem value="furniture">Nội thất</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Thương hiệu</Label><Input value={toolForm.brand || ''} onChange={e => setToolForm((f: any) => ({ ...f, brand: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>Model</Label><Input value={toolForm.model || ''} onChange={e => setToolForm((f: any) => ({ ...f, model: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5"><Label>ĐVT</Label><Input value={toolForm.unit} onChange={e => setToolForm((f: any) => ({ ...f, unit: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>Số lượng</Label><Input type="number" min={0} value={toolForm.quantity} onChange={e => setToolForm((f: any) => ({ ...f, quantity: parseInt(e.target.value) || 0 }))} /></div>
              <div className="space-y-1.5"><Label>SL khả dụng</Label><Input type="number" min={0} value={toolForm.available_quantity} onChange={e => setToolForm((f: any) => ({ ...f, available_quantity: parseInt(e.target.value) || 0 }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Tình trạng</Label>
                <Select value={toolForm.condition} onValueChange={v => setToolForm((f: any) => ({ ...f, condition: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="good">Tốt</SelectItem>
                    <SelectItem value="fair">Trung bình</SelectItem>
                    <SelectItem value="poor">Kém</SelectItem>
                    <SelectItem value="damaged">Hư hỏng</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Trạng thái</Label>
                <Select value={toolForm.status} onValueChange={v => setToolForm((f: any) => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Sẵn sàng</SelectItem>
                    <SelectItem value="in_use">Đang dùng</SelectItem>
                    <SelectItem value="maintenance">Bảo trì</SelectItem>
                    <SelectItem value="disposed">Thanh lý</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Vị trí lưu kho</Label><Input value={toolForm.location || ''} onChange={e => setToolForm((f: any) => ({ ...f, location: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>Giá mua</Label><Input type="number" min={0} value={toolForm.purchase_price} onChange={e => setToolForm((f: any) => ({ ...f, purchase_price: parseFloat(e.target.value) || 0 }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Ngày mua</Label><Input type="date" value={toolForm.purchase_date || ''} onChange={e => setToolForm((f: any) => ({ ...f, purchase_date: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>Hết bảo hành</Label><Input type="date" value={toolForm.warranty_expiry || ''} onChange={e => setToolForm((f: any) => ({ ...f, warranty_expiry: e.target.value }))} /></div>
            </div>
            <div className="space-y-1.5"><Label>Ghi chú</Label><Textarea value={toolForm.notes || ''} onChange={e => setToolForm((f: any) => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setToolDialog(false)}>Hủy</Button>
            <Button onClick={handleSaveTool} disabled={!toolForm.name || !toolForm.code || addTool.isPending || updateTool.isPending}>
              {(addTool.isPending || updateTool.isPending) && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
              {editingToolId ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assignment Dialog */}
      <Dialog open={assignDialog} onOpenChange={setAssignDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Tạo phiếu cấp phát / thu hồi</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Loại <span className="text-destructive">*</span></Label>
              <Select value={assignForm.assignment_type} onValueChange={v => setAssignForm((f: any) => ({ ...f, assignment_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="assign">Cấp phát</SelectItem>
                  <SelectItem value="return">Thu hồi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>CCDC <span className="text-destructive">*</span></Label>
              <Select value={assignForm.tool_id} onValueChange={v => setAssignForm((f: any) => ({ ...f, tool_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Chọn CCDC" /></SelectTrigger>
                <SelectContent>
                  {tools.map(t => <SelectItem key={t.id} value={t.id}>{t.name} ({t.code})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Nhân viên <span className="text-destructive">*</span></Label>
              <Select value={assignForm.employee_id || ''} onValueChange={handleEmployeeSelect}>
                <SelectTrigger><SelectValue placeholder="Chọn nhân viên" /></SelectTrigger>
                <SelectContent>
                  {employees.map(e => <SelectItem key={e.id} value={e.id}>{e.full_name} ({e.employee_code})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Số lượng</Label><Input type="number" min={1} value={assignForm.quantity} onChange={e => setAssignForm((f: any) => ({ ...f, quantity: parseInt(e.target.value) || 1 }))} /></div>
              <div className="space-y-1.5"><Label>Ngày</Label><Input type="date" value={assignForm.assignment_date} onChange={e => setAssignForm((f: any) => ({ ...f, assignment_date: e.target.value }))} /></div>
            </div>
            <div className="space-y-1.5"><Label>Ghi chú</Label><Textarea value={assignForm.notes || ''} onChange={e => setAssignForm((f: any) => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialog(false)}>Hủy</Button>
            <Button onClick={handleSaveAssign} disabled={!assignForm.tool_id || !assignForm.employee_name || addAssignment.isPending}>
              {addAssignment.isPending && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
              Tạo phiếu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Tool Dialog */}
      <Dialog open={!!viewTool} onOpenChange={() => setViewTool(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {viewTool && (
            <>
              <DialogHeader><DialogTitle>{viewTool.name}</DialogTitle></DialogHeader>
              <div className="space-y-3 text-sm">
                <div className="flex gap-2">
                  <Badge variant={statusToolMap[viewTool.status]?.variant || 'secondary'}>{statusToolMap[viewTool.status]?.label}</Badge>
                  <Badge variant="outline">{viewTool.code}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div><strong>Loại:</strong> {viewTool.category}</div>
                  <div><strong>ĐVT:</strong> {viewTool.unit}</div>
                  <div><strong>SL:</strong> {viewTool.quantity} (Khả dụng: {viewTool.available_quantity})</div>
                  <div><strong>Tình trạng:</strong> {conditionMap[viewTool.condition]}</div>
                  {viewTool.brand && <div><strong>Thương hiệu:</strong> {viewTool.brand}</div>}
                  {viewTool.model && <div><strong>Model:</strong> {viewTool.model}</div>}
                  {viewTool.location && <div><strong>Vị trí:</strong> {viewTool.location}</div>}
                  {viewTool.purchase_price > 0 && <div><strong>Giá mua:</strong> {viewTool.purchase_price.toLocaleString()}đ</div>}
                </div>
                {viewTool.notes && <div><strong>Ghi chú:</strong> {viewTool.notes}</div>}
                <div className="text-xs text-muted-foreground">Tạo lúc: {format(new Date(viewTool.created_at), 'dd/MM/yyyy HH:mm')}</div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
