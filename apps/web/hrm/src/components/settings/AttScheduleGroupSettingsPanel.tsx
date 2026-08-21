import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SettingsCatalogRowActions } from './SettingsCatalogRowActions';
import { SettingsCatalogScreenShell } from './SettingsCatalogScreenShell';
import { hrmApi } from '@/integrations/hrmApi';
import {
  listAttSchedules,
  upsertAttSchedule,
  retireAttSchedule,
  type HrmAttScheduleRecord,
} from '@/integrations/hrmApi';

export function AttScheduleGroupSettingsPanel() {
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
    defaultShiftCode: '',
    workingDays: '',
    applyTo: '',
    description: '',
    status: 'active',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['att-schedules', companyId, q],
    queryFn: () => listAttSchedules({ company_id: companyId!, q }),
    enabled: !!companyId,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['att-schedules'] });

  const resetForm = () => {
    setForm({
      code: '',
      nameVi: '',
      defaultShiftCode: '',
      workingDays: '',
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

  const openEdit = (row: HrmAttScheduleRecord) => {
    setForm({
      code: row.code,
      nameVi: row.name_vi,
      defaultShiftCode: row.default_shift_code || '',
      workingDays: row.working_days || '',
      applyTo: row.apply_to || '',
      description: row.description || '',
      status: row.status,
    });
    setEditingId(row.id);
    setDialogOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: () =>
      upsertAttSchedule({
        company_id: companyId!,
        code: form.code,
        name_vi: form.nameVi,
        default_shift_code: form.defaultShiftCode || null,
        working_days: form.workingDays || null,
        apply_to: form.applyTo || null,
        description: form.description || null,
        status: form.status,
      }),
    onSuccess: () => {
      toast({ title: 'Đã lưu lịch làm việc' });
      setDialogOpen(false);
      invalidate();
    },
    onError: (err: any) => {
      toast({
        title: 'Lỗi',
        description: err.message || 'Không thể lưu lịch làm việc',
        variant: 'destructive',
      });
    },
  });

  const retireMutation = useMutation({
    mutationFn: (id: string) => retireAttSchedule(id, companyId!),
    onSuccess: () => {
      toast({ title: 'Đã ngừng lịch làm việc' });
      invalidate();
    },
    onError: (err: any) => {
      toast({
        title: 'Lỗi',
        description: err.message || 'Không thể ngừng lịch làm việc',
        variant: 'destructive',
      });
    },
  });

  const handleRetire = (row: HrmAttScheduleRecord) => {
    if (confirm(`Ngừng lịch làm việc "${row.name_vi}"?`)) {
      retireMutation.mutate(row.id);
    }
  };

  const items = data?.items || [];

  return (
    <SettingsCatalogScreenShell
      title="Nhóm lịch làm việc"
      description="Quản lý lịch trình làm việc và các ca mặc định cho nhân viên."
      testId="settings-att-schedule-groups"
      searchValue={q}
      onSearchChange={setQ}
      searchPlaceholder="Tìm theo mã hoặc tên…"
      onRefresh={invalidate}
      onAdd={openCreate}
      addLabel="Thêm lịch"
    >
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã lịch</TableHead>
              <TableHead>Tên lịch</TableHead>
              <TableHead>Ca mặc định</TableHead>
              <TableHead>Ngày làm việc</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            ) : (
              items.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-mono">{row.code}</TableCell>
                  <TableCell className="font-medium">{row.name_vi}</TableCell>
                  <TableCell>
                    {row.default_shift_code ? <Badge variant="outline">{row.default_shift_code}</Badge> : '--'}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {row.working_days || '--'}
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
            <DialogTitle>{editingId ? 'Sửa lịch làm việc' : 'Thêm lịch làm việc'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Mã lịch *</Label>
                <Input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  disabled={!!editingId}
                  placeholder="VD: SCH_VP_HN"
                />
              </div>
              <div className="space-y-2">
                <Label>Ca mặc định</Label>
                <Input
                  value={form.defaultShiftCode}
                  onChange={(e) => setForm({ ...form, defaultShiftCode: e.target.value })}
                  placeholder="VD: OFFICE_HN"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Tên lịch *</Label>
              <Input
                value={form.nameVi}
                onChange={(e) => setForm({ ...form, nameVi: e.target.value })}
                placeholder="VD: Lịch hành chính HN"
              />
            </div>

            <div className="space-y-2">
              <Label>Ngày làm việc</Label>
              <Input
                value={form.workingDays}
                onChange={(e) => setForm({ ...form, workingDays: e.target.value })}
                placeholder="VD: T2-T7"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Ghi chú</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="VD: Áp dụng khối VP HN"
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
