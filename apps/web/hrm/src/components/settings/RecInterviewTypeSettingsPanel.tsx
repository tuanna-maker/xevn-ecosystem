import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Save } from 'lucide-react';
import { toast } from 'sonner';
import { SettingsCatalogScreenShell } from './SettingsCatalogScreenShell';
import { SettingsCatalogPagination } from './SettingsCatalogPagination';
import { SettingsCatalogRowActions } from './SettingsCatalogRowActions';
import { hrmApi } from '@/integrations/hrmApi';

export function RecInterviewTypeSettingsPanel() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ typeKey: '', nameVi: '' });

  const companyId = hrmApi.resolvePortalParentCompanyId();

  useEffect(() => {
    fetchItems();
  }, [companyId]);

  const fetchItems = async () => {
    if (!companyId) return;
    try {
      setLoading(true);
      const res = await hrmApi.get('/api/hrm/settings-catalogs/interview_types/items', {
        headers: { 'x-company-id': companyId },
      });
      setItems(res.data?.data || []);
    } catch (err: any) {
      toast.error('Lỗi tải danh sách Loại phỏng vấn', { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    if (!search) return items;
    const lower = search.toLowerCase();
    return items.filter(
      (it) => it.item_key?.toLowerCase().includes(lower) || it.name_vi?.toLowerCase().includes(lower)
    );
  }, [items, search]);

  const pageSize = 20;
  const paginated = useMemo(() => {
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(page, totalPages);
    const slice = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
    return { slice, total, totalPages, page: safePage, pageSize };
  }, [filtered, page]);

  const openEdit = (row?: any) => {
    if (row) {
      setEditingId(row.id);
      setForm({ typeKey: row.item_key, nameVi: row.name_vi || '' });
    } else {
      setEditingId('');
      setForm({ typeKey: '', nameVi: '' });
    }
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingId('');
    setForm({ typeKey: '', nameVi: '' });
  };

  const onSave = async () => {
    if (!form.typeKey.trim() || !form.nameVi.trim()) {
      toast.error('Vui lòng nhập đủ thông tin bắt buộc');
      return;
    }
    try {
      setSaving(true);
      const payload = {
        items: [
          {
            item_key: form.typeKey.trim(),
            name_vi: form.nameVi.trim(),
          },
        ],
      };
      await hrmApi.post('/api/hrm/settings-catalogs/interview_types/items', payload, {
        headers: { 'x-company-id': companyId },
      });
      toast.success(editingId ? 'Cập nhật thành công' : 'Thêm mới thành công');
      closeDialog();
      fetchItems();
    } catch (err: any) {
      toast.error('Lỗi lưu Loại phỏng vấn', { description: err.message });
    } finally {
      setSaving(false);
    }
  };

  const onRetire = async (row: any) => {
    if (!confirm(`Xóa loại phỏng vấn: ${row.name_vi}?`)) return;
    try {
      await hrmApi.delete('/api/hrm/settings-catalogs/interview_types/items', {
        headers: { 'x-company-id': companyId },
        data: { itemKeys: [row.item_key] },
      });
      toast.success('Xóa thành công');
      fetchItems();
    } catch (err: any) {
      toast.error('Lỗi xóa loại phỏng vấn', { description: err.message });
    }
  };

  return (
    <>
      <SettingsCatalogScreenShell
        title="Loại phỏng vấn"
        description="Quản lý danh sách các hình thức phỏng vấn (Offline, Online, Test, v.v.)."
        searchValue={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        onAdd={() => openEdit()}
        loading={loading}
        addTestId="hdsd-interview-type-add"
        footerSlot={
          <SettingsCatalogPagination
            page={paginated.page}
            totalPages={paginated.totalPages}
            total={paginated.total}
            pageSize={paginated.pageSize}
            onPageChange={setPage}
          />
        }
      >
        <Table className="min-w-[640px]">
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[140px]">Mã</TableHead>
              <TableHead className="min-w-[160px]">Tên loại</TableHead>
              <TableHead className="min-w-[140px] text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-sm text-muted-foreground">
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : paginated.slice.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="py-8 text-center text-sm text-muted-foreground">
                  {items.length === 0 ? 'Chưa có dữ liệu.' : 'Không có dòng khớp tìm kiếm.'}
                </TableCell>
              </TableRow>
            ) : (
              paginated.slice.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-mono text-xs">{row.item_key}</TableCell>
                  <TableCell className="font-medium">{row.name_vi}</TableCell>
                  <TableCell>
                    <SettingsCatalogRowActions
                      onEdit={() => openEdit(row)}
                      onRetire={() => void onRetire(row)}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </SettingsCatalogScreenShell>

      <Dialog open={dialogOpen} onOpenChange={(open) => (open ? setDialogOpen(true) : closeDialog())}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Sửa loại phỏng vấn' : 'Thêm loại phỏng vấn'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-1">
              <Label>Mã loại *</Label>
              <Input
                className="font-mono text-sm"
                placeholder="interview_online"
                value={form.typeKey}
                disabled={Boolean(editingId)}
                onChange={(e) => setForm((f) => ({ ...f, typeKey: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label>Tên loại *</Label>
              <Input
                placeholder="Phỏng vấn Online"
                value={form.nameVi}
                onChange={(e) => setForm((f) => ({ ...f, nameVi: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeDialog}>Hủy</Button>
            <Button type="button" disabled={saving || !companyId} onClick={() => void onSave()}>
              <Save className="mr-1.5 h-4 w-4" />
              {saving ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
