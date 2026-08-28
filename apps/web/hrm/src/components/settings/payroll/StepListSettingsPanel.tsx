import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, MoreHorizontal, Pencil, Trash, Loader2, Save, X } from 'lucide-react';
import { hrmApi } from '@/integrations/hrmApi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { DataTable } from '@/components/common/DataTable';
import { toast } from 'sonner';

type PayStep = {
  id: string;
  code: string;
  name: string;
  description?: string;
  is_active: boolean;
};

export const StepListSettingsPanel: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ code: '', name: '', description: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['pay-steps', search],
    queryFn: async () => {
      const res = await hrmApi.get<any>('/api/hrm/payroll/pay-steps?search=' + search);
      return (Array.isArray(res) ? res : res?.data ?? []) as PayStep[];
    }
  });

  const createMut = useMutation({
    mutationFn: async (data: Omit<PayStep, 'id' | 'is_active'>) => {
      return await hrmApi.post<any>('/api/hrm/payroll/pay-steps', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pay-steps'] });
      setIsFormOpen(false);
      toast.success('Thêm bậc lương thành công');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Không thể thêm bậc lương');
    }
  });

  const updateMut = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: Partial<PayStep> }) => {
      return await hrmApi.patch<any>('/api/hrm/payroll/pay-steps/' + id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pay-steps'] });
      setIsFormOpen(false);
      toast.success('Cập nhật bậc lương thành công');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Không thể cập nhật bậc lương');
    }
  });

  const archiveMut = useMutation({
    mutationFn: async (id: string) => {
      return await hrmApi.delete<any>('/api/hrm/payroll/pay-steps/' + id + '/archive');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pay-steps'] });
      toast.success('Đã xóa bậc lương');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Không thể xóa bậc lương');
    }
  });

  const handleSave = () => {
    if (!form.code.trim()) { toast.error('Mã bậc không được để trống'); return; }
    if (!form.name.trim()) { toast.error('Tên bậc không được để trống'); return; }

    if (editingId) updateMut.mutate({ id: editingId, data: form });
    else createMut.mutate(form);
  };

  const openEdit = (row: PayStep) => {
    setEditingId(row.id);
    setForm({ code: row.code, name: row.name, description: row.description || '' });
    setIsFormOpen(true);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ code: '', name: '', description: '' });
    setIsFormOpen(true);
  };

  const columns = [
    {
      key: 'code',
      header: 'Mã Bậc',
      render: (row: PayStep) => <span className="font-medium font-mono text-sm">{row.code}</span>
    },
    {
      key: 'name',
      header: 'Tên Bậc',
      render: (row: PayStep) => <span className="font-medium text-sm">{row.name}</span>
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (row: PayStep) => (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${row.is_active ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
          {row.is_active ? 'Đang dùng' : 'Đã ẩn'}
        </span>
      )
    },
    {
      key: 'actions',
      header: '',
      render: (row: PayStep) => (
        <div className="flex justify-end items-center gap-1">
          <Button variant="ghost" size="sm" className="h-8 px-2 gap-1 text-muted-foreground hover:text-foreground" onClick={(e) => { e.stopPropagation(); openEdit(row); }}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 px-2 gap-1 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={(e) => { e.stopPropagation(); if (window.confirm(`Xóa bậc ${row.name}?`)) archiveMut.mutate(row.id); }}>
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      ),
      className: 'w-[100px] text-right'
    }
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Tìm theo mã hoặc tên bậc..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button onClick={openCreate} size="sm" className="shrink-0">
          <Plus className="mr-1.5 h-4 w-4" /> Thêm bậc
        </Button>
      </div>

      <Card className="border shadow-sm flex flex-col" style={{ minHeight: '300px', maxHeight: '500px' }}>
        <CardContent className="p-0 overflow-y-auto flex-1">
          {isLoading ? (
             <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Đang tải danh sách bậc lương...</span>
             </div>
          ) : (
             <DataTable
                columns={columns}
                data={data || []}
                keyExtractor={(item) => item.id}
                onRowClick={openEdit}
                emptyMessage="Chưa có bậc lương nào. Bấm '+ Thêm bậc' để tạo mới."
             />
          )}
        </CardContent>
      </Card>

      <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
        <SheetContent side="right" className="w-full max-w-[480px]">
          <SheetHeader>
            <SheetTitle>{editingId ? 'Sửa bậc lương' : 'Thêm bậc lương mới'}</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-5 py-5">
            <div className="space-y-1.5">
              <Label><span className="text-red-500 mr-0.5">*</span>Mã bậc</Label>
              <Input
                placeholder="VD: BAC01"
                value={form.code}
                onChange={e => setForm({...form, code: e.target.value.toUpperCase()})}
                disabled={!!editingId}
                className="font-mono"
              />
              {editingId && <p className="text-xs text-muted-foreground">Mã không thể thay đổi sau khi tạo</p>}
            </div>
            <div className="space-y-1.5">
              <Label><span className="text-red-500 mr-0.5">*</span>Tên bậc</Label>
              <Input
                placeholder="VD: Bậc 1"
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Mô tả / Ghi chú</Label>
              <Input
                placeholder="Ghi chú thêm về bậc này (tuỳ chọn)"
                value={form.description}
                onChange={e => setForm({...form, description: e.target.value})}
              />
            </div>
          </div>
          <SheetFooter className="border-t pt-4 mt-auto">
            <Button variant="outline" onClick={() => setIsFormOpen(false)} disabled={createMut.isPending || updateMut.isPending}>
              <X className="mr-1.5 h-4 w-4" />Hủy
            </Button>
            <Button onClick={handleSave} disabled={createMut.isPending || updateMut.isPending}>
              {createMut.isPending || updateMut.isPending ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />}
              Lưu
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};