/**
 * Settings → Ca làm việc — CRUD qua Nest `/api/hrm/attendance/work-shifts` (SoT ATT-01).
 * WorkItem: fix settings-att-shifts add button + dead `/shifts` client
 */
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
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
import { useAuth } from '@/contexts/AuthContext';
import { toErrorMessage } from '@/lib/apiError';
import { parseAtt01WorkShiftDisplay } from '@/lib/attShift01Ring';
import { WORK_SHIFTS_EFFECTIVE_QUERY_KEY } from '@/hooks/useWorkShiftsEffective';
import {
  listWorkShifts,
  createWorkShift,
  updateWorkShift,
  deleteWorkShift,
} from '@/integrations/hrmApi';

type ShiftRow = {
  id: string;
  code: string;
  name: string;
  start_time: string;
  end_time: string;
  break_start: string | null;
  break_end: string | null;
  is_night_shift: boolean;
  status: string;
  statusLabelVi: string;
  notes: string | null;
};

type ShiftForm = {
  code: string;
  name: string;
  startTime: string;
  endTime: string;
  breakStart: string;
  breakEnd: string;
  isNightShift: boolean;
  notes: string;
  status: string;
};

const emptyForm = (): ShiftForm => ({
  code: '',
  name: '',
  startTime: '08:00',
  endTime: '17:00',
  breakStart: '12:00',
  breakEnd: '13:00',
  isNightShift: false,
  notes: '',
  status: 'active',
});

function mapRow(row: Record<string, unknown>): ShiftRow {
  const display = parseAtt01WorkShiftDisplay(row);
  return {
    id: String(row.id ?? display.shiftId ?? ''),
    code: display.code,
    name: display.name,
    start_time: display.startTime ?? String(row.start_time ?? ''),
    end_time: display.endTime ?? String(row.end_time ?? ''),
    break_start: row.break_start != null ? String(row.break_start) : null,
    break_end: row.break_end != null ? String(row.break_end) : null,
    is_night_shift: Boolean(row.is_night_shift),
    status: display.status,
    statusLabelVi: display.statusLabelVi,
    notes: row.notes != null ? String(row.notes) : null,
  };
}

function breakMinutesLabel(row: ShiftRow): string {
  if (!row.break_start || !row.break_end) return '—';
  const [sh, sm] = row.break_start.split(':').map(Number);
  const [eh, em] = row.break_end.split(':').map(Number);
  if ([sh, sm, eh, em].some((n) => Number.isNaN(n))) return '—';
  const mins = eh * 60 + em - (sh * 60 + sm);
  return mins > 0 ? String(mins) : '—';
}

export function AttShiftSettingsPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentCompanyId } = useAuth();
  const companyId = currentCompanyId?.trim() || '';

  const [q, setQ] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ShiftForm>(emptyForm);

  const queryKey = ['work-shifts-settings', companyId] as const;

  const { data, isLoading, isFetching, refetch, isError, error } = useQuery({
    queryKey,
    queryFn: async () => {
      const res = await listWorkShifts(companyId);
      const rows = (res.data ?? []) as Record<string, unknown>[];
      return rows.map(mapRow);
    },
    enabled: !!companyId,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey });
    void queryClient.invalidateQueries({ queryKey: [WORK_SHIFTS_EFFECTIVE_QUERY_KEY] });
    void refetch();
  };

  const resetForm = () => {
    setForm(emptyForm());
    setEditingId(null);
  };

  const openCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (row: ShiftRow) => {
    setForm({
      code: row.code,
      name: row.name,
      startTime: row.start_time || '08:00',
      endTime: row.end_time || '17:00',
      breakStart: row.break_start || '',
      breakEnd: row.break_end || '',
      isNightShift: row.is_night_shift,
      notes: row.notes || '',
      status: row.status || 'active',
    });
    setEditingId(row.id);
    setDialogOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const code = form.code.trim().toUpperCase();
      const name = form.name.trim();
      if (!code || !name) {
        throw new Error('Vui lòng nhập mã ca và tên ca');
      }
      if (!form.startTime || !form.endTime) {
        throw new Error('Vui lòng nhập giờ bắt đầu và giờ kết thúc');
      }
      const payload = {
        code,
        name,
        start_time: form.startTime,
        end_time: form.endTime,
        break_start: form.breakStart.trim() || undefined,
        break_end: form.breakEnd.trim() || undefined,
        is_night_shift: form.isNightShift,
        notes: form.notes.trim() || undefined,
        status: form.status || 'active',
      };
      if (editingId) {
        return updateWorkShift(editingId, companyId, payload);
      }
      return createWorkShift({ company_id: companyId, ...payload });
    },
    onSuccess: () => {
      toast({ title: editingId ? 'Đã cập nhật ca làm việc' : 'Đã thêm ca làm việc' });
      setDialogOpen(false);
      resetForm();
      invalidate();
    },
    onError: (err: unknown) => {
      toast({
        title: 'Lỗi',
        description: toErrorMessage(err, 'Không thể lưu ca làm việc'),
        variant: 'destructive',
      });
    },
  });

  const retireMutation = useMutation({
    mutationFn: (id: string) => deleteWorkShift(id, companyId),
    onSuccess: () => {
      toast({ title: 'Đã ngừng ca làm việc' });
      invalidate();
    },
    onError: (err: unknown) => {
      toast({
        title: 'Lỗi',
        description: toErrorMessage(err, 'Không thể ngừng ca làm việc'),
        variant: 'destructive',
      });
    },
  });

  const handleRetire = (row: ShiftRow) => {
    if (confirm(`Ngừng ca làm việc "${row.name}"?`)) {
      retireMutation.mutate(row.id);
    }
  };

  const items = useMemo(() => {
    const all = data ?? [];
    const needle = q.trim().toLowerCase();
    if (!needle) return all;
    return all.filter(
      (row) =>
        row.code.toLowerCase().includes(needle) ||
        row.name.toLowerCase().includes(needle),
    );
  }, [data, q]);

  return (
    <SettingsCatalogScreenShell
      title="Ca làm việc"
      description="Quản lý thời gian, giờ vào ra của các ca làm việc trong hệ thống."
      testId="settings-att-shifts"
      searchValue={q}
      onSearchChange={setQ}
      searchPlaceholder="Tìm theo mã hoặc tên…"
      onRefresh={invalidate}
      refreshing={isFetching}
      onAdd={openCreate}
      addLabel="Thêm ca"
      honestySlot={
        !companyId ? (
          <p className="text-sm text-destructive">Chưa chọn đơn vị — không thể tải danh sách ca.</p>
        ) : isError ? (
          <p className="text-sm text-destructive">
            {toErrorMessage(error, 'Không tải được danh sách ca làm việc.')}
          </p>
        ) : null
      }
    >
      <div className="rounded-md border">
        <Table data-testid="settings-att-shifts-table">
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
                <TableCell colSpan={7} className="py-4 text-center">
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-4 text-center text-muted-foreground">
                  Chưa có ca làm việc — bấm «Thêm ca».
                </TableCell>
              </TableRow>
            ) : (
              items.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-mono">{row.code}</TableCell>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell>
                    {row.start_time || '—'} - {row.end_time || '—'}
                  </TableCell>
                  <TableCell>{breakMinutesLabel(row)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {row.is_night_shift ? <Badge variant="secondary">Ca đêm</Badge> : null}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={row.status === 'active' ? 'default' : 'secondary'}>
                      {row.statusLabelVi || (row.status === 'active' ? 'Đang dùng' : 'Ngừng')}
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
        <DialogContent className="sm:max-w-[500px]" data-testid="settings-att-shifts-dialog">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Sửa ca làm việc' : 'Thêm ca làm việc'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="att-shift-code">Mã ca *</Label>
                <Input
                  id="att-shift-code"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  disabled={!!editingId}
                  placeholder="VD: HC_HN"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="att-shift-name">Tên ca *</Label>
                <Input
                  id="att-shift-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="VD: Hành chính HN"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="att-shift-night"
                checked={form.isNightShift}
                onCheckedChange={(c) => setForm({ ...form, isNightShift: !!c })}
              />
              <Label htmlFor="att-shift-night">Ca đêm</Label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="att-shift-start">Giờ bắt đầu *</Label>
                <Input
                  id="att-shift-start"
                  type="time"
                  value={form.startTime}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="att-shift-end">Giờ kết thúc *</Label>
                <Input
                  id="att-shift-end"
                  type="time"
                  value={form.endTime}
                  onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="att-shift-break-start">Nghỉ từ</Label>
                <Input
                  id="att-shift-break-start"
                  type="time"
                  value={form.breakStart}
                  onChange={(e) => setForm({ ...form, breakStart: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="att-shift-break-end">Nghỉ đến</Label>
                <Input
                  id="att-shift-break-end"
                  type="time"
                  value={form.breakEnd}
                  onChange={(e) => setForm({ ...form, breakEnd: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="att-shift-notes">Ghi chú</Label>
              <Input
                id="att-shift-notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="VD: Nghỉ trưa 60 phút"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              data-testid="settings-att-shifts-save"
            >
              Lưu lại
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SettingsCatalogScreenShell>
  );
}
