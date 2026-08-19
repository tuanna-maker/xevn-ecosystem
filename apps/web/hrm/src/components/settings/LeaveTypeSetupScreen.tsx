/**
 * @CODE-MEMORY
 * Screen:     /settings — tab Loại nghỉ phép (CATALOG-LEAVE-TYPES)
 * UC:         UC-LV-01 (GET list/detail), UC-LV-02 (POST/PUT/DELETE)
 * BR:         BR-LV-01 (LABOR_LAW no hard delete) · BR-LV-02 (unique code) · BR-LV-04 (LABOR_LAW immutable code/name)
 *             BR-LV-06 (unpaid -> payRate=0)
 * SRS:        docs/program/deltas/BA_HRM_LEAVE_TYPE_SRS_01_20260815.md §3 UC · §4 FR · §5 Data Model
 * TechSpec:   docs/program/deltas/BA_HRM_LEAVE_TYPE_TECHSPEC_01_20260815.md §3.3 Controller · §3.4 DTOs
 * WorkItem:   BA-HRM-LEAVE-TYPE-TECHSPEC-01
 * Coded:      2026-08-15
 * Purpose:    Leave Type catalog CRUD (PAT-SETTINGS-CATALOG-01 List+Dialog) — 8 BLĐ 2019 leave types + internal.
 * solid_convention_ack: true
 * be_boundary: true
 * display_ready_ack: true
 * fe_boundary: true
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Save } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useHrmOperatingUnitFilter } from '@/contexts/HrmOperatingUnitFilterContext';
import { toErrorMessage } from '@/lib/apiError';
import { SettingsCatalogScreenShell } from '@/components/settings/SettingsCatalogScreenShell';
import { SettingsCatalogPagination } from '@/components/settings/SettingsCatalogPagination';
import { SettingsCatalogRowActions } from '@/components/settings/SettingsCatalogRowActions';
import { SettingsDialogSelectContent } from '@/components/settings/SettingsDialogSelectContent';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import {
  filterCatalogByCodeOrName,
  paginateCatalogRows,
  catalogPageForKey,
  SETTINGS_CATALOG_PAGE_SIZE,
  sortSettingsCatalogByOrderThenKey,
} from '@/lib/settingsCatalogPagination';
import { useSettingsCatalogFocusPage, resolveSettingsCatalogInitialSearchQuery } from '@/hooks/useSettingsCatalogFocusPage';
import { useSettingsCatalogQueryPageSync } from '@/hooks/useSettingsCatalogQueryPageSync';
import type { HrmLeaveTypeRecord } from '@/integrations/hrmApi';
import { listLeaveTypes, retireLeaveType, upsertLeaveType } from '@/integrations/hrmApi';

const SETTINGS_TAB_CATALOG_LEAVE_TYPES = 'catalog-leave-types';

export function LeaveTypeSetupScreen() {
  const { currentCompanyId } = useAuth();
  const { listCompanyId } = useHrmOperatingUnitFilter();
  const companyId = listCompanyId || currentCompanyId;
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const bootstrapFocusQueryRef = useRef(
    resolveSettingsCatalogInitialSearchQuery(
      SETTINGS_TAB_CATALOG_LEAVE_TYPES,
      searchParams.get('focus'),
    ),
  );

  const [items, setItems] = useState<HrmLeaveTypeRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [q, setQ] = useState(() => bootstrapFocusQueryRef.current);
  const [page, setPage] = useState(1);

  const rowKeyOf = useCallback((r: HrmLeaveTypeRecord) => r.code, []);
  const { rememberFocusForReload } = useSettingsCatalogFocusPage(
    SETTINGS_TAB_CATALOG_LEAVE_TYPES,
    items,
    loading,
    rowKeyOf,
    setPage,
    setQ,
  );

  const loadRows = useCallback(async (): Promise<HrmLeaveTypeRecord[]> => {
    if (!companyId) return [];
    setLoading(true);
    setError(null);
    try {
      const res = await listLeaveTypes({
        company_id: companyId,
        status: 'active',
      });
      const sorted = sortSettingsCatalogByOrderThenKey(
        res.items,
        (r) => r.defaultDaysPerYear ?? 0,
        (r) => r.code,
      );
      setItems(sorted);
      return sorted;
    } catch (err) {
      setError(toErrorMessage(err, 'Không tải được danh sách loại nghỉ phép.'));
      setItems([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    void loadRows();
  }, [loadRows]);

  useSettingsCatalogQueryPageSync(q, setPage, {
    bootstrapFocusQuery: bootstrapFocusQueryRef.current,
  });

  const filtered = useMemo(
    () =>
      filterCatalogByCodeOrName(
        items,
        q,
        (r) => r.code,
        (r) => r.name,
      ),
    [items, q],
  );

  const paginated = useMemo(
    () => paginateCatalogRows(filtered, page, SETTINGS_CATALOG_PAGE_SIZE),
    [filtered, page],
  );

  const invalidateConsumers = () => {
    void queryClient.invalidateQueries({ queryKey: ['leave-types-effective'] });
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (row: HrmLeaveTypeRecord) => {
    setEditingId(row.id);
    setForm({
      code: row.code,
      name: row.name,
      defaultDaysPerYear: String(row.defaultDaysPerYear ?? 0),
      isPaid: row.isPaid !== false,
      payRatePercent: String(row.payRatePercent ?? 100),
      leaveCategory: row.leaveCategory,
      description: row.description ?? '',
      status: row.status || 'active',
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
    setForm(emptyForm());
  };

  const onSave = async () => {
    if (!companyId) {
      toast({ title: 'Thiếu phạm vi đơn vị', variant: 'destructive' });
      return;
    }
    const code = form.code.trim().toLowerCase();
    const name = form.name.trim();
    if (!code) {
      toast({ title: 'Thiếu mã loại nghỉ', variant: 'destructive' });
      return;
    }
    if (!/^[a-z][a-z0-9_]{1,19}$/.test(code)) {
      toast({
        title: 'Mã không hợp lệ',
        description: 'Chữ thường a–z, số, gạch dưới; bắt đầu bằng chữ (ví dụ: nl_nghi_phep).',
        variant: 'destructive',
      });
      return;
    }
    if (!name) {
      toast({ title: 'Thiếu tên loại nghỉ', variant: 'destructive' });
      return;
    }
    if (form.leaveCategory === 'LABOR_LAW' && !editingId) {
      toast({ title: 'Loại pháp luật chỉ được tạo 1 lần', description: 'Dùng seed dữ liệu hoặc chỉnh sửa bản ghi có sẵn.', variant: 'destructive' });
      return;
    }

    const defaultDays = Number.parseInt(form.defaultDaysPerYear, 10);
    const payRate = Number.parseFloat(form.payRatePercent);
    const isPaid = form.isPaid;

    if (isPaid === false && payRate > 0) {
      toast({ title: 'Loại không lương phải có tỷ lệ 0%', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const saved = await upsertLeaveType({
        companyId,
        code,
        name,
        defaultDaysPerYear: Number.isFinite(defaultDays) && defaultDays >= 0 ? defaultDays : 0,
        isPaid,
        payRatePercent: Number.isFinite(payRate) && payRate >= 0 && payRate <= 100 ? payRate : 100,
        leaveCategory: form.leaveCategory,
        description: form.description.trim() || undefined,
        status: form.status || 'active',
      });
      toast({
        title: editingId ? 'Đã cập nhật loại nghỉ' : 'Đã tạo loại nghỉ',
        description: `${saved.code} — ${saved.name}`,
      });
      closeDialog();
      rememberFocusForReload(saved.code);
      setQ('');
      const fresh = await loadRows();
      setPage(catalogPageForKey(fresh, saved.code, (r) => r.code));
      invalidateConsumers();
    } catch (err) {
      toast({
        title: 'Lưu loại nghỉ thất bại',
        description: toErrorMessage(err, 'Không lưu được loại nghỉ phép.'),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const onRetire = async (row: HrmLeaveTypeRecord) => {
    if (!companyId) return;
    if (row.leaveCategory === 'LABOR_LAW') {
      toast({ title: 'Không thể xóa loại pháp luật', description: 'Loại này sẽ được chuyển sang inactive.', variant: 'destructive' });
      return;
    }
    const ok = window.confirm(`Ngừng loại nghỉ «${row.code} — ${row.name}»? (soft-delete)`);
    if (!ok) return;
    try {
      await retireLeaveType(row.id, companyId);
      toast({ title: 'Đã ngừng loại nghỉ', description: row.name });
      if (editingId === row.id) closeDialog();
      await loadRows();
      invalidateConsumers();
    } catch (err) {
      toast({
        title: 'Ngừng loại nghỉ thất bại',
        description: toErrorMessage(err, 'Không ngừng được loại nghỉ phép.'),
        variant: 'destructive',
      });
    }
  };

  const LEAVE_CATEGORIES = [
    { value: 'LABOR_LAW', label: 'Luật Lao động 2019' },
    { value: 'INTERNAL', label: 'Nội bộ công ty' },
  ];

  const STATUS_OPTIONS = [
    { value: 'active', label: 'Đang dùng' },
    { value: 'inactive', label: 'Ngừng dùng' },
  ];

  return (
    <>
      <SettingsCatalogScreenShell
        compact
        title="Loại nghỉ phép (CATALOG)"
        description="Danh sách loại nghỉ theo Luật Lao động 2019 + nội bộ — tìm mã/ten; thêm/sửa qua hộp thoại; F5 sau lưu."
        testId="settings-catalog-leave-types"
        searchValue={q}
        onSearchChange={setQ}
        searchPlaceholder="Tìm theo mã hoặc tên…"
        onRefresh={() => void loadRows()}
        refreshing={loading}
        onAdd={openCreate}
        addLabel="Thêm loại nghỉ"
        footerSlot={
          <SettingsCatalogPagination
            page={paginated.page}
            totalPages={paginated.totalPages}
            total={paginated.total}
            pageSize={paginated.pageSize}
            onPageChange={setPage}
            testId="settings-catalog-leave-types-pagination"
          />
        }
      >
        {error ? (
          <p className="text-sm text-destructive" data-testid="settings-catalog-leave-types-error">
            {error}
          </p>
        ) : null}
        <Table data-testid="settings-catalog-leave-types-table" className="min-w-[720px]">
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[120px]">Mã</TableHead>
              <TableHead className="min-w-[180px]">Tên</TableHead>
              <TableHead>Nhóm</TableHead>
              <TableHead className="min-w-[90px]">Ngày/năm</TableHead>
              <TableHead className="min-w-[90px]">Tỷ lệ %</TableHead>
              <TableHead className="min-w-[80px]">Trạng thái</TableHead>
              <TableHead className="min-w-[140px] text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-sm text-muted-foreground">
                  Đang tải…
                </TableCell>
              </TableRow>
            ) : paginated.slice.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                  {items.length === 0
                    ? 'Chưa có loại nghỉ — bấm «Thêm loại nghỉ» hoặc chạy seed Luật Lao động 2019.'
                    : 'Không có dòng khớp tìm kiếm.'}
                </TableCell>
              </TableRow>
            ) : (
              paginated.slice.map((row) => (
                <TableRow
                  key={row.id}
                  data-testid={`settings-catalog-leave-type-row-${row.code}`}
                >
                  <TableCell className="font-mono text-xs">{row.code}</TableCell>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell>
                    <Badge variant={row.leaveCategory === 'LABOR_LAW' ? 'secondary' : 'outline'} className="text-xs">
                      {row.leaveCategory === 'LABOR_LAW' ? 'Luật Lao động 2019' : 'Nội bộ'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center text-xs">{row.defaultDaysPerYear ?? 0}</TableCell>
                  <TableCell className="text-center text-xs">{row.payRatePercent ?? 100}</TableCell>
                  <TableCell className="text-center text-xs">
                    <Badge variant={row.status === 'active' ? 'default' : 'secondary'} className="text-[10px]">
                      {row.status === 'active' ? 'Đang dùng' : 'Ngừng'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <SettingsCatalogRowActions
                      editTestId={`hdsd-catalog-leave-type-edit-${row.code}`}
                      retireTestId={`hdsd-catalog-leave-type-retire-${row.code}`}
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
          className="max-h-[min(90vh,720px)] max-w-lg overflow-y-auto sm:max-w-xl"
          data-testid="settings-catalog-leave-types-dialog"
        >
          <DialogHeader>
            <DialogTitle>{editingId ? 'Sửa loại nghỉ phép' : 'Thêm loại nghỉ phép'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="cat-lv-code">Mã loại nghỉ *</Label>
                <Input
                  id="cat-lv-code"
                  data-testid="hdsd-catalog-leave-type-code"
                  className="font-mono text-sm"
                  placeholder="nl_nghi_phep"
                  value={form.code}
                  disabled={Boolean(editingId) || form.leaveCategory === 'LABOR_LAW'}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toLowerCase() }))}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="cat-lv-name">Tên loại nghỉ *</Label>
                <Input
                  id="cat-lv-name"
                  data-testid="hdsd-catalog-leave-type-name"
                  placeholder="Nghỉ phép năm"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="cat-lv-category">Nhóm *</Label>
              <Select
                value={form.leaveCategory}
                onValueChange={(v) => setForm((f) => ({ ...f, leaveCategory: v }))}
                disabled={Boolean(editingId)}
              >
                <SelectTrigger id="cat-lv-category" data-testid="hdsd-catalog-leave-type-category" className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SettingsDialogSelectContent>
                  {LEAVE_CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SettingsDialogSelectContent>
              </Select>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1 max-w-[8rem]">
                <Label htmlFor="cat-lv-days">Ngày/năm</Label>
                <Input
                  id="cat-lv-days"
                  data-testid="hdsd-catalog-leave-type-days"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={form.defaultDaysPerYear}
                  onChange={(e) => setForm((f) => ({ ...f, defaultDaysPerYear: e.target.value.replace(/\D/g, '') }))}
                />
              </div>
              <div className="space-y-1 max-w-[8rem]">
                <Label htmlFor="cat-lv-rate">Tỷ lệ lương %</Label>
                <Input
                  id="cat-lv-rate"
                  data-testid="hdsd-catalog-leave-type-rate"
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9]*\.?[0-9]*"
                  value={form.payRatePercent}
                  onChange={(e) => setForm((f) => ({ ...f, payRatePercent: e.target.value }))}
                />
              </div>
              <div className="space-y-1 max-w-[8rem]">
                <Label htmlFor="cat-lv-status">Trạng thái</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}
                >
                  <SelectTrigger id="cat-lv-status" data-testid="hdsd-catalog-leave-type-status" className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SettingsDialogSelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SettingsDialogSelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="cat-lv-paid">Có lương</Label>
              <Switch
                checked={form.isPaid}
                onCheckedChange={(v) => setForm((f) => ({ ...f, isPaid: v }))}
                data-testid="hdsd-catalog-leave-type-paid"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="cat-lv-desc">Mô tả</Label>
              <Input
                id="cat-lv-desc"
                data-testid="hdsd-catalog-leave-type-desc"
                placeholder="Mô tả loại nghỉ phép (tùy chọn)"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={closeDialog}>
              Hủy
            </Button>
            <Button
              type="button"
              disabled={saving || !companyId}
              data-testid="hdsd-catalog-leave-type-save"
              onClick={() => void onSave()}
            >
              <Save className="mr-1.5 h-4 w-4" />
              {saving ? 'Đang lưu…' : 'Lưu'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

type FormState = {
  code: string;
  name: string;
  defaultDaysPerYear: string;
  isPaid: boolean;
  payRatePercent: string;
  leaveCategory: 'LABOR_LAW' | 'INTERNAL';
  description: string;
  status: string;
};

const emptyForm = (): FormState => ({
  code: '',
  name: '',
  defaultDaysPerYear: '0',
  isPaid: true,
  payRatePercent: '100',
  leaveCategory: 'INTERNAL',
  description: '',
  status: 'active',
});