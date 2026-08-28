/**
 * @CODE-MEMORY
 * Screen:     /settings — tab Vị trí công việc (rec_positions)
 * UC:         HRM-SC-01..03
 * Purpose:    List + search + phân trang + CRUD dialog cho Vị trí công việc
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useHrmOperatingUnitFilter } from '@/contexts/HrmOperatingUnitFilterContext';
import {
  listRecSettingsCatalog,
  retireRecSettingsCatalog,
  upsertRecSettingsCatalog,
  type HrmRecSettingsRecord,
} from '@/integrations/hrmApi';
import { toErrorMessage } from '@/lib/apiError';
import {
  filterCatalogByCodeOrName,
  paginateCatalogRows,
  SETTINGS_CATALOG_PAGE_SIZE,
} from '@/lib/settingsCatalogPagination';
import { SettingsCatalogScreenShell } from '@/components/settings/SettingsCatalogScreenShell';
import { SettingsCatalogPagination } from '@/components/settings/SettingsCatalogPagination';
import { SettingsCatalogRowActions } from '@/components/settings/SettingsCatalogRowActions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { toast } from '@/hooks/use-toast';

type FormState = {
  code: string;
  label: string;
  status: string;
};

const emptyForm = (): FormState => ({
  code: '',
  label: '',
  status: 'active',
});

const isValidCodeFormat = (code: string): boolean => {
  return /^[a-z0-9_-]+$/.test(code.trim());
};

export function CatalogRecPositionsSettingsPanel() {
  const { currentCompanyId } = useAuth();
  const { listCompanyId } = useHrmOperatingUnitFilter();
  const companyId = listCompanyId || currentCompanyId;

  const [items, setItems] = useState<HrmRecSettingsRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);

  const loadRows = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    setError(null);
    try {
      const rows = await listRecSettingsCatalog('rec_positions', {
        company_id: companyId,
        status: 'all',
      });
      setItems(rows);
    } catch (err) {
      setError(toErrorMessage(err, 'Không tải được danh sách chức danh.'));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    void loadRows();
  }, [loadRows]);

  useEffect(() => {
    setPage(1);
  }, [q]);

  const filtered = useMemo(
    () =>
      filterCatalogByCodeOrName(
        items,
        q,
        (r) => r.code,
        (r) => r.label,
      ),
    [items, q],
  );

  const paginated = useMemo(
    () => paginateCatalogRows(filtered, page, SETTINGS_CATALOG_PAGE_SIZE),
    [filtered, page],
  );

  const openCreate = () => {
    setEditingCode(null);
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (row: HrmRecSettingsRecord) => {
    setEditingCode(row.code);
    setForm({
      code: row.code,
      label: row.label,
      status: row.status || 'active',
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingCode(null);
    setForm(emptyForm());
  };

  const onSave = async () => {
    if (!companyId) {
      toast({ title: 'Thiếu phạm vi đơn vị', variant: 'destructive' });
      return;
    }
    const code = form.code.trim().toLowerCase();
    const label = form.label.trim();
    if (!code) {
      toast({ title: 'Thiếu mã chức danh', variant: 'destructive' });
      return;
    }
    if (!isValidCodeFormat(code)) {
      toast({
        title: 'Mã chức danh không hợp lệ',
        description: 'Chỉ dùng chữ thường, số, dấu gạch dưới và gạch ngang.',
        variant: 'destructive',
      });
      return;
    }
    if (!label) {
      toast({ title: 'Thiếu tên chức danh', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      await upsertRecSettingsCatalog({
        catalogKey: 'rec_positions',
        companyId,
        code,
        label,
        status: (form.status as 'active' | 'draft') || 'active',
      });
      toast({
        title: editingCode ? 'Đã cập nhật chức danh' : 'Đã tạo chức danh',
        description: `${code} — ${label}`,
      });
      closeDialog();
      await loadRows();
    } catch (err) {
      toast({
        title: 'Lưu chức danh thất bại',
        description: toErrorMessage(err, 'Không lưu được chức danh.'),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const onRetire = async (row: HrmRecSettingsRecord) => {
    if (!companyId) return;
    const ok = window.confirm(
      `Ngừng chức danh «${row.label}» (${row.code})? Dữ liệu cũ vẫn giữ, nhưng không chọn được nữa.`,
    );
    if (!ok) return;
    try {
      await retireRecSettingsCatalog('rec_positions', row.code, companyId);
      toast({ title: 'Đã ngừng chức danh', description: row.label });
      if (editingCode === row.code) closeDialog();
      await loadRows();
    } catch (err) {
      toast({
        title: 'Ngừng chức danh thất bại',
        description: toErrorMessage(err, 'Không ngừng được chức danh.'),
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <SettingsCatalogScreenShell
        compact
        title="Vị trí tuyển dụng"
        description="Danh sách chức danh theo đơn vị — dùng để tạo JD và YCTD."
        testId="settings-catalog-job-titles"
        searchValue={q}
        onSearchChange={setQ}
        searchPlaceholder="Tìm theo mã hoặc tên…"
        onRefresh={() => void loadRows()}
        refreshing={loading}
        onAdd={openCreate}
        addLabel="Thêm vị trí"
        footerSlot={
          <SettingsCatalogPagination
            page={paginated.page}
            totalPages={paginated.totalPages}
            total={paginated.total}
            pageSize={paginated.pageSize}
            onPageChange={setPage}
            testId="settings-catalog-job-titles-pagination"
          />
        }
      >
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        <Table data-testid="settings-catalog-job-titles-table" className="min-w-[480px]">
          <TableHeader>
            <TableRow>
              <TableHead>Mã</TableHead>
              <TableHead>Tên mục</TableHead>
              <TableHead>Nguồn</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-sm text-muted-foreground">
                  Đang tải…
                </TableCell>
              </TableRow>
            ) : paginated.slice.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                  {items.length === 0
                    ? 'Chưa có chức danh — bấm «Thêm vị trí» để bắt đầu.'
                    : 'Không có dòng khớp tìm kiếm.'}
                </TableCell>
              </TableRow>
            ) : (
              paginated.slice.map((row) => (
                <TableRow
                  key={row.code}
                  data-testid={`settings-catalog-job-titles-row-${row.code}`}
                >
                  <TableCell className="font-mono text-xs">{row.code}</TableCell>
                  <TableCell className="font-medium">{row.label}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {row.origin === 'xbos' ? 'XBOS' : 'HRM'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <SettingsCatalogRowActions
                      editTestId={`hdsd-job-titles-edit-${row.code}`}
                      retireTestId={`hdsd-job-titles-retire-${row.code}`}
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
        <DialogContent
          className="max-h-[min(90vh,640px)] max-w-lg overflow-y-auto sm:max-w-xl"
          data-testid="settings-catalog-job-titles-dialog"
        >
          <DialogHeader>
            <DialogTitle>
              {editingCode ? 'Sửa mục' : 'Thêm vị trí'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="job-title-code">Mã chức danh *</Label>
                <Input
                  id="job-title-code"
                  data-testid="hdsd-job-title-code"
                  className="font-mono text-sm"
                  placeholder="nhan_vien_hanh_chinh"
                  value={form.code}
                  disabled={Boolean(editingCode)}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">
                  Chỉ chữ thường, số, _ và -. Không đổi sau khi tạo.
                </p>
              </div>
              <div className="space-y-1">
                <Label htmlFor="job-title-label">Tên mục *</Label>
                <Input
                  id="job-title-label"
                  data-testid="hdsd-job-title-label"
                  placeholder="Nhân viên hành chính"
                  value={form.label}
                  onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={closeDialog} disabled={saving}>
              Hủy
            </Button>
            <Button onClick={() => void onSave()} disabled={saving}>
              {saving ? 'Đang lưu…' : editingCode ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
