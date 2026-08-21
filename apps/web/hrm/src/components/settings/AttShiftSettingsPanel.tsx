import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SettingsCatalogRowActions } from './SettingsCatalogRowActions';
import { SettingsCatalogScreenShell } from './SettingsCatalogScreenShell';
import { Plus } from 'lucide-react';
import { hrmApi } from '@/integrations/hrmApi';
import {
  listAttShifts,
  upsertAttShift,
  retireAttShift,
  type HrmAttShiftRecord,
} from '@/integrations/hrmApi';

export function AttShiftSettingsPanel() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const companyId = hrmApi.resolvePortalParentCompanyId();

  const [q, setQ] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    code: '',
    nameVi: '',
    startTime: '',
    endTime: '',
    breakMinutes: 0,
    isFlexible: false,
    isNightShift: false,
    applyTo: '',
    description: '',
    status: 'active',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['att-shifts', companyId, q],
    queryFn: () => listAttShifts({ company_id: companyId!, q }),
    enabled: !!companyId,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['att-shifts'] });

  const resetForm = () => {
    setForm({
      code: '',
      nameVi: '',
      startTime: '',
      endTime: '',
      breakMinutes: 0,
      isFlexible: false,
      isNightShift: false,
      applyTo: '',
      description: '',
      status: 'active',
    });
    setEditingId(null);
  };

  const openCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (row: HrmAttShiftRecord) => {
    setForm({
      code: row.code,
      nameVi: row.name_vi,
      startTime: row.start_time || '',
      endTime: row.end_time || '',
      breakMinutes: row.break_minutes,
      isFlexible: row.is_flexible,
      isNightShift: row.is_night_shift,
      applyTo: row.apply_to || '',
      description: row.description || '',
      status: row.status,
    });
    setEditingId(row.id);
    setDialogOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: () =>
      upsertAttShift({
        company_id: companyId!,
        code: form.code,
        name_vi: form.nameVi,
        start_time: form.startTime || null,
        end_time: form.endTime || null,
        break_minutes: form.breakMinutes,
        is_flexible: form.isFlexible,
        is_night_shift: form.isNightShift,
        apply_to: form.applyTo || null,
        description: form.description || null,
        status: form.status,
      }),
    onSuccess: () => {
      toast({ title: 'Đã lưu ca làm việc' });
      setDialogOpen(false);
      invalidate();
    },
    onError: (err: any) => {
      toast({
        title: 'Lỗi',
        description: err.message || 'Không thể lưu ca làm việc',
        variant: 'destructive',
      });
    },
  });

  const retireMutation = useMutation({
    mutationFn: (id: string) => retireAttShift(id, companyId!),
    onSuccess: () => {
      toast({ title: 'Đã ngừng ca làm việc' });
      invalidate();
    },
    onError: (err: any) => {
      toast({
        title: 'Lỗi',
        description: err.message || 'Không thể ngừng ca làm việc',
        variant: 'destructive',
      });
    },
  });

  const handleRetire = (row: HrmAttShiftRecord) => {
    if (confirm(`Ngừng ca làm việc "${row.name_vi}"?`)) {
      retireMutation.mutate(row.id);
    }
  };

  const items = data?.items || [];

  return (
    <SettingsCatalogScreenShell
      title="Ca làm việc"
      description="Quản lý thời gian, giờ vào ra của các ca làm việc trong hệ thống."
      q={q}
      setQ={setQ}
      onRefresh={invalidate}
      renderActions={() => (
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Thêm ca
        </Button>
      )}
    >
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã ca</TableHead>
              <TableHead>Tên ca</TableHead>
              <TableHead>Giờ làm</TableHead>
              <TableHead>Nghỉ (phút)</TableHead>
              <TableHead>Tính chất</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            ) : (
              items.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-mono">{row.code}</TableCell>
                  <TableCell className="font-medium">{row.name_vi}</TableCell>
                  <TableCell>
                    {row.is_flexible ? (
                      <span className="text-muted-foreground italic">Linh hoạt</span>
                    ) : (
                      `${row.start_time || '--'} - ${row.end_time || '--'}`
                    )}
                  </TableCell>
                  <TableCell>{row.break_minutes}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {row.is_night_shift && <Badge variant="secondary">Ca đêm</Badge>}
                      {row.is_flexible && <Badge variant="outline">Linh hoạt</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={row.status === 'active' ? 'default' : 'secondary'}>
                      {row.status === 'active' ? 'Đang dùng' : 'Ngừng'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <SettingsCatalogRowActions
                      onEdit={() => openEdit(row)}
                      onRetire={() => handleRetire(row)}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Sửa ca làm việc' : 'Thêm ca làm việc'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Mã ca *</Label>
                <Input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  disabled={!!editingId}
                  placeholder="VD: HC_HN"
                />
              </div>
              <div className="space-y-2">
                <Label>Tên ca *</Label>
                <Input
                  value={form.nameVi}
                  onChange={(e) => setForm({ ...form, nameVi: e.target.value })}
                  placeholder="VD: Hành chính HN"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isFlexible"
                  checked={form.isFlexible}
                  onCheckedChange={(c) => setForm({ ...form, isFlexible: !!c })}
                />
                <Label htmlFor="isFlexible">Giờ linh hoạt (không cố định)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isNightShift"
                  checked={form.isNightShift}
                  onCheckedChange={(c) => setForm({ ...form, isNightShift: !!c })}
                />
                <Label htmlFor="isNightShift">Ca đêm (+30%)</Label>
              </div>
            </div>

            {!form.isFlexible && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Giờ bắt đầu</Label>
                  <Input
                    type="time"
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Giờ kết thúc</Label>
                  <Input
                    type="time"
                    value={form.endTime}
                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Thời gian nghỉ (phút)</Label>
              <Input
                type="number"
                value={form.breakMinutes}
                onChange={(e) => setForm({ ...form, breakMinutes: parseInt(e.target.value) || 0 })}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Ghi chú</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="VD: Nghỉ trưa 60 phút"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
              Lưu lại
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SettingsCatalogScreenShell>
  );
}
