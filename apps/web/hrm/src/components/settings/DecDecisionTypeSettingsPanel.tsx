/**
 * @CODE-MEMORY
 * Screen:     /settings — tab Loại quyết định DEC
 * UC:         AC-PLT-DEC-01..06
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-FE-01 · PO-HRM-SETTINGS-W3-CAT-B-FE-01
 * Purpose:    List + search + phân trang + popup (W3 shell).
 * must_keep:  soft-delete · U65 · hdsd-* testids · WH/person-bound validation
 *
 * @CODE-MEMORY-CHANGE 2026-08-10 PO-HRM-SETTINGS-W3-CAT-B-FE-01
 * change_mode: UPGRADE · SettingsCatalogScreenShell + Dialog
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Save } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useHrmOperatingUnitFilter } from '@/contexts/HrmOperatingUnitFilterContext';
import {
  listDecDecisionTypes,
  retireDecDecisionType,
  upsertDecDecisionType,
  type HrmDecDecisionTypeRecord,
} from '@/integrations/hrmApi';
import { DEC_DECISION_TYPES_EFFECTIVE_QUERY_KEY } from '@/hooks/useDecDecisionTypesEffective';
import { SETTINGS_CATALOGS_QUERY_KEY } from '@/hooks/useSettingsCatalogsOverview';
import { toErrorMessage } from '@/lib/apiError';
import {
  DEC_DECISION_TYPE_UAT_HONESTY,
  decDecisionTypeSourceLabel,
  formatDecDecisionTypeDisplay,
  isValidDecDecisionTypeKeyFormat,
  normalizeDecDecisionTypeKey,
} from '@/lib/decDecisionTypeCatalog';
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
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';

type FormState = {
  decisionTypeKey: string;
  nameVi: string;
  sortOrder: string;
  isPersonBound: boolean;
  writesWorkHistory: boolean;
  whEventType: string;
  requiresPositionKey: boolean;
  status: string;
};

const emptyForm = (): FormState => ({
  decisionTypeKey: '',
  nameVi: '',
  sortOrder: '100',
  isPersonBound: true,
  writesWorkHistory: false,
  whEventType: '',
  requiresPositionKey: false,
  status: 'active',
});

export function DecDecisionTypeSettingsPanel() {
  const { currentCompanyId } = useAuth();
  const { listCompanyId } = useHrmOperatingUnitFilter();
  const companyId = listCompanyId || currentCompanyId;
  const queryClient = useQueryClient();

  const [items, setItems] = useState<HrmDecDecisionTypeRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);

  const loadRows = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await listDecDecisionTypes({
        company_id: companyId,
        status: 'active',
      });
      setItems(res.items);
    } catch (err) {
      setError(toErrorMessage(err, 'Không tải được danh sách loại quyết định.'));
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
        (r) => r.decisionTypeKey,
        (r) => r.nameVi,
      ),
    [items, q],
  );

  const paginated = useMemo(
    () => paginateCatalogRows(filtered, page, SETTINGS_CATALOG_PAGE_SIZE),
    [filtered, page],
  );

  const invalidateConsumers = () => {
    void queryClient.invalidateQueries({ queryKey: [DEC_DECISION_TYPES_EFFECTIVE_QUERY_KEY] });
    void queryClient.invalidateQueries({ queryKey: [SETTINGS_CATALOGS_QUERY_KEY] });
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (row: HrmDecDecisionTypeRecord) => {
    setEditingId(row.id);
    setForm({
      decisionTypeKey: row.decisionTypeKey,
      nameVi: row.nameVi,
      sortOrder: String(row.sortOrder ?? 100),
      isPersonBound: row.isPersonBound !== false,
      writesWorkHistory: Boolean(row.writesWorkHistory),
      whEventType: row.whEventType ?? '',
      requiresPositionKey: Boolean(row.requiresPositionKey),
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
    const decisionTypeKey = normalizeDecDecisionTypeKey(form.decisionTypeKey);
    const nameVi = form.nameVi.trim();
    if (!isValidDecDecisionTypeKeyFormat(decisionTypeKey)) {
      toast({ title: 'Mã loại quyết định không hợp lệ', variant: 'destructive' });
      return;
    }
    if (!nameVi) {
      toast({ title: 'Thiếu nhãn tiếng Việt', variant: 'destructive' });
      return;
    }
    if (form.writesWorkHistory && !form.isPersonBound) {
      toast({
        title: 'Cờ WH không hợp lệ',
        description: 'writesWorkHistory yêu cầu isPersonBound = true.',
        variant: 'destructive',
      });
      return;
    }

    const sortParsed = Number.parseInt(form.sortOrder, 10);
    const sortOrder = Number.isFinite(sortParsed) && sortParsed >= 0 ? sortParsed : 100;

    setSaving(true);
    try {
      const saved = await upsertDecDecisionType({
        companyId,
        decisionTypeKey,
        nameVi,
        sortOrder,
        isPersonBound: form.isPersonBound,
        writesWorkHistory: form.writesWorkHistory,
        whEventType: form.whEventType.trim() || null,
        requiresPositionKey: form.requiresPositionKey,
        status: form.status || 'active',
      });
      toast({
        title: editingId ? 'Đã cập nhật loại quyết định' : 'Đã tạo loại quyết định',
        description: formatDecDecisionTypeDisplay(saved.decisionTypeKey, saved.nameVi),
      });
      closeDialog();
      await loadRows();
      invalidateConsumers();
    } catch (err) {
      toast({
        title: 'Lưu loại quyết định thất bại',
        description: toErrorMessage(err, 'Không lưu được loại quyết định.'),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const onRetire = async (row: HrmDecDecisionTypeRecord) => {
    if (!companyId) return;
    const ok = window.confirm(
      `Ngừng loại quyết định «${formatDecDecisionTypeDisplay(row.decisionTypeKey, row.nameVi)}»? (soft-delete)`,
    );
    if (!ok) return;
    try {
      await retireDecDecisionType(row.id, companyId);
      toast({ title: 'Đã ngừng loại quyết định', description: row.nameVi });
      if (editingId === row.id) closeDialog();
      await loadRows();
      invalidateConsumers();
    } catch (err) {
      toast({
        title: 'Ngừng loại quyết định thất bại',
        description: toErrorMessage(err, 'Không ngừng được loại quyết định.'),
        variant: 'destructive',
      });
    }
  };

  const honestySlot = null;

  return (
    <>
      <SettingsCatalogScreenShell
        compact
        title="Loại quyết định (DEC catalog)"
        description="Danh sách loại QSĐ theo đơn vị — thêm/sửa qua hộp thoại."
        testId="settings-dec-decision-types"
        searchValue={q}
        onSearchChange={setQ}
        searchPlaceholder="Tìm theo mã hoặc tên…"
        onRefresh={() => void loadRows()}
        refreshing={loading}
        onAdd={openCreate}
        addLabel="Thêm loại quyết định"
        honestySlot={honestySlot}
        footerSlot={
          <SettingsCatalogPagination
            page={paginated.page}
            totalPages={paginated.totalPages}
            total={paginated.total}
            pageSize={paginated.pageSize}
            onPageChange={setPage}
            testId="settings-dec-decision-types-pagination"
          />
        }
      >
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        <Table data-testid="settings-dec-decision-types-table" className="min-w-[640px]">
          <TableHeader>
            <TableRow>
              <TableHead>Mã</TableHead>
              <TableHead>Tên</TableHead>
              <TableHead>Cờ</TableHead>
              <TableHead>Nguồn</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-sm text-muted-foreground">
                  Đang tải…
                </TableCell>
              </TableRow>
            ) : paginated.slice.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                  {items.length === 0
                    ? 'Chưa có loại quyết định — bấm «Thêm loại quyết định».'
                    : 'Không có dòng khớp tìm kiếm.'}
                </TableCell>
              </TableRow>
            ) : (
              paginated.slice.map((row) => (
                <TableRow
                  key={row.id}
                  data-testid={`settings-dec-decision-type-row-${row.decisionTypeKey}`}
                >
                  <TableCell className="font-mono text-xs">{row.decisionTypeKey}</TableCell>
                  <TableCell className="font-medium">{row.nameVi}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {[
                      row.isPersonBound !== false ? 'gắn NV' : null,
                      row.writesWorkHistory ? 'WH' : null,
                      row.requiresPositionKey ? 'chức danh' : null,
                    ]
                      .filter(Boolean)
                      .join(' · ') || '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {decDecisionTypeSourceLabel(row.source ?? 'dec_native')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <SettingsCatalogRowActions
                      editTestId={`hdsd-dec-decision-type-edit-${row.decisionTypeKey}`}
                      retireTestId={`hdsd-dec-decision-type-retire-${row.decisionTypeKey}`}
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
          data-testid="settings-dec-decision-types-dialog"
        >
          <DialogHeader>
            <DialogTitle>{editingId ? 'Sửa loại quyết định' : 'Thêm loại quyết định'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="dec-typ-key">Mã loại quyết định *</Label>
                <Input
                  id="dec-typ-key"
                  data-testid="hdsd-dec-decision-type-key"
                  className="font-mono text-sm"
                  placeholder="hr_custom_dec_09"
                  value={form.decisionTypeKey}
                  disabled={Boolean(editingId)}
                  onChange={(e) => setForm((f) => ({ ...f, decisionTypeKey: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="dec-typ-name">Nhãn tiếng Việt *</Label>
                <Input
                  id="dec-typ-name"
                  data-testid="hdsd-dec-decision-type-name"
                  value={form.nameVi}
                  onChange={(e) => setForm((f) => ({ ...f, nameVi: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1 max-w-[8rem]">
              <Label htmlFor="dec-typ-sort">Thứ tự</Label>
              <Input
                id="dec-typ-sort"
                data-testid="hdsd-dec-decision-type-sort"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={form.sortOrder}
                onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value.replace(/\D/g, '') }))}
              />
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
              <label className="inline-flex items-center gap-2">
                <Switch
                  checked={form.isPersonBound}
                  onCheckedChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      isPersonBound: v,
                      writesWorkHistory: v ? f.writesWorkHistory : false,
                    }))
                  }
                />
                Gắn nhân viên
              </label>
              <label className="inline-flex items-center gap-2">
                <Switch
                  checked={form.writesWorkHistory}
                  disabled={!form.isPersonBound}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, writesWorkHistory: v }))}
                />
                Ghi lịch sử công tác (WH)
              </label>
              <label className="inline-flex items-center gap-2">
                <Switch
                  checked={form.requiresPositionKey}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, requiresPositionKey: v }))}
                />
                Bắt buộc chức danh
              </label>
            </div>
            {form.writesWorkHistory ? (
              <div className="space-y-1">
                <Label htmlFor="dec-typ-wh-event">Loại sự kiện WH (tuỳ chọn)</Label>
                <Input
                  id="dec-typ-wh-event"
                  data-testid="hdsd-dec-decision-type-wh-event"
                  className="font-mono text-sm"
                  placeholder="appointment"
                  value={form.whEventType}
                  onChange={(e) => setForm((f) => ({ ...f, whEventType: e.target.value }))}
                />
              </div>
            ) : null}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={closeDialog}>
              Hủy
            </Button>
            <Button
              type="button"
              disabled={saving || !companyId}
              data-testid="hdsd-dec-decision-type-save"
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

