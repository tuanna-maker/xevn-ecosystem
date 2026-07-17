/**
 * @CODE-MEMORY
 * Screen: /tools-equipment · Công cụ & thiết bị
 * UC: UC-HRM-27 (deferred)
 * BR: tools_equipment deferred — honest empty, no stub CRUD
 * SRS: docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md § tools_equipment
 * TechSpec: No tools REST in Phase 1
 * Purpose: Browse CCDC inventory / assignments when API exists. View-only until then.
 *   No Add/Edit/Delete stubs and no fake success toasts (D-HRM-TOOLS-STUB-TOAST-01).
 * WorkItem: D-HRM-TOOLS-STUB-TOAST-01
 * Coded: 2026-07-17
 * Callers: App.tsx route /tools-equipment
 * Callees: useToolsEquipment, Dialog (+ Title/Description)
 * FEActions: Search · tab filter · Eye → view dialog (when data exists)
 * Impact: Misleading CRUD stubs previously toasted success with empty list
 * must_keep: Deferred notice; no mutate buttons; DialogTitle + DialogDescription on view
 * SOLID: Page owns presentation; hook owns query
 * LastVerified: pages/ToolsEquipment.readOnly.test.ts
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Package, Search, CheckCircle2, AlertTriangle, Eye, ArrowUpDown, Wrench, Loader2 } from 'lucide-react';
import {
  useToolsEquipment,
  ToolEquipment,
  TOOLS_MUTATION_UNSUPPORTED_VI,
} from '@/hooks/useToolsEquipment';
import { format } from 'date-fns';

const conditionMap: Record<string, string> = { good: 'Tốt', fair: 'Trung bình', poor: 'Kém', damaged: 'Hư hỏng' };
const statusToolMap: Record<string, { variant: 'default' | 'secondary' | 'outline' | 'destructive'; label: string }> = {
  available: { variant: 'default', label: 'Sẵn sàng' },
  in_use: { variant: 'secondary', label: 'Đang dùng' },
  maintenance: { variant: 'outline', label: 'Bảo trì' },
  disposed: { variant: 'destructive', label: 'Thanh lý' },
};

function DeferredNotice() {
  return (
    <p className="text-xs max-w-md mx-auto text-muted-foreground" data-testid="tools-readonly-notice">
      {TOOLS_MUTATION_UNSUPPORTED_VI}
    </p>
  );
}

export default function ToolsEquipmentPage() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewTool, setViewTool] = useState<ToolEquipment | null>(null);

  const { tools, assignments, isLoading } = useToolsEquipment();

  const filteredTools = tools.filter(
    (item) =>
      !searchTerm ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const stats = {
    total: tools.reduce((s, item) => s + item.quantity, 0),
    inUse: tools.filter((item) => item.status === 'in_use').length,
    maintenance: tools.filter((item) => item.status === 'maintenance').length,
    damaged: tools.filter((item) => item.condition === 'damaged').length,
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <PageHeader
        title={t('tools.title', 'Công cụ dụng cụ')}
        subtitle={t(
          'tools.description',
          'Quản lý công cụ, dụng cụ, trang thiết bị (chỉ xem — API CCDC đang triển khai)',
        )}
      />

      <Card className="border-dashed bg-muted/30">
        <CardContent className="p-4 text-sm text-muted-foreground" data-testid="tools-deferred-banner">
          <DeferredNotice />
        </CardContent>
      </Card>

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

        <TabsContent value="inventory" className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
          ) : filteredTools.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground space-y-2">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Chưa có CCDC nào</p>
              <DeferredNotice />
            </CardContent></Card>
          ) : (
            <div className="grid gap-3">
              {filteredTools.map((item) => (
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
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          aria-label={`Xem ${item.name}`}
                          onClick={() => setViewTool(item)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          {assignments.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground space-y-2">
              <ArrowUpDown className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Chưa có phiếu cấp phát / thu hồi nào</p>
              <DeferredNotice />
            </CardContent></Card>
          ) : (
            <div className="grid gap-3">
              {assignments.map((item) => (
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
                      <Badge variant={item.status === 'completed' ? 'default' : 'outline'}>
                        {item.status === 'completed' ? 'Hoàn thành' : item.status === 'pending' ? 'Chờ duyệt' : item.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!viewTool} onOpenChange={(open) => !open && setViewTool(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" aria-describedby="tools-view-desc">
          <DialogHeader>
            <DialogTitle>{viewTool?.name ?? 'Chi tiết CCDC'}</DialogTitle>
            <DialogDescription id="tools-view-desc">Xem chi tiết công cụ dụng cụ (chỉ đọc)</DialogDescription>
          </DialogHeader>
          {viewTool && (
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
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
