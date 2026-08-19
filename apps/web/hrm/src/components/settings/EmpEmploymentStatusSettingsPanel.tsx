/**
 * @CODE-MEMORY
 * Screen:     /settings — tab Trạng thái NV EMP · EMP CFG employment-statuses + status-reasons
 * UC:         AC-PLT-EMP-STATUS-01* · BR-PLT-04/05 · VAL-EMP-ST/STR-CAT
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-FE-ADMIN-BUILD-FE-01 · PO-HRM-SETTINGS-W3-CAT-B-FE-01
 * Purpose:    List + search + phân trang + popup thêm/sửa (W3 shell) — ST + STR twin.
 * must_keep:  Nest KEY sealed · effective picker preview testids · U65 · hdsd-* testids
 *
 * @CODE-MEMORY-CHANGE 2026-08-10 PO-HRM-SETTINGS-W3-CAT-B-FE-01
 * change_mode: UPGRADE · SettingsCatalogScreenShell + Dialog; client search + pagination
 *
 * @CODE-MEMORY-CHANGE 2026-08-10 PO-HRM-SETTINGS-W3-MUTATE-FIX-FE-01
 * change_mode: UPGRADE
 * What: F5 post-mutate page focus + query/page sync on ST/STR twin catalogs
 * Why: SA Option A W3 EMP mutate residual — FE-after-2xx row visible pre-F5
 * must_keep: ATTLVTSOTQC1 OUT OF SCOPE · effective picker preview · Nest KEY only
 *
 * @CODE-MEMORY-CHANGE 2026-08-13 PO-HRM-SETTINGS-IA-COPY-WAVE2-FE-01
 * change_mode: FIX
 * What: Dọn copy jargon nội bộ — toast lỗi mã không hợp lệ (status + reason) bỏ mã "HRM-PLT-CAT-CODE-INVALID — "; Label picker hiệu lực (status + reason) bỏ mã "(sau F5 — AC-PLT-EMP-STATUS...)" -> "(cập nhật sau khi tải lại trang)"; empty-state (status + reason) bỏ đuôi "(U65, không seed)" (bổ sung ngoài B2 list gốc — cùng file đã sửa B3, cùng pattern jargon, thấy qua tự-kiểm §10.4).
 * Why: PO-HRM-SETTINGS-IA-COPY-WAVE2-FE-01 (Phần B) — UX-PRODUCT-RULES.md §10 R1/R2
 *      cấm mã tracing/thuật ngữ vận hành nội bộ render ra UI end-user.
 * SRS: (không phát sinh SRS mới — copy hygiene, không đổi logic validate/mutate)
 * must_keep: mọi data-testid cũ nguyên vẹn; logic validate/điều kiện không đổi
 * LastVerified: docs/qa/evidence/po-hrm-settings-ia-copy-wave2-fe-01.md
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Save } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useHrmOperatingUnitFilter } from '@/contexts/HrmOperatingUnitFilterContext';
import {
  listEmpEmploymentStatuses,
  listEmpStatusReasons,
  retireEmpEmploymentStatus,
  retireEmpStatusReason,
  upsertEmpEmploymentStatus,
  upsertEmpStatusReason,
  type HrmEmpEmploymentStatusRecord,
  type HrmEmpStatusReasonRecord,
} from '@/integrations/hrmApi';
import {
  EMP_EMPLOYMENT_STATUSES_EFFECTIVE_QUERY_KEY,
  useEmpEmploymentStatusesEffective,
} from '@/hooks/useEmpEmploymentStatusesEffective';
import {
  EMP_STATUS_REASONS_EFFECTIVE_QUERY_KEY,
  useEmpStatusReasonsEffective,
} from '@/hooks/useEmpStatusReasonsEffective';
import { toErrorMessage } from '@/lib/apiError';
import {
  EMP_EMPLOYMENT_STATUS_UAT_HONESTY,
  empEmploymentStatusSourceLabel,
  formatEmpEmploymentStatusDisplay,
  formatEmpStatusReasonDisplay,
  isValidEmpEmploymentStatusKeyFormat,
  isValidEmpStatusReasonKeyFormat,
  normalizeEmpEmploymentStatusKey,
  normalizeEmpStatusReasonKey,
  parseEmpStatusReasonAppliesTo,
} from '@/lib/empEmploymentStatusCatalog';
import {
  filterCatalogByCodeOrName,
  paginateCatalogRows,
  catalogPageForKey,
  SETTINGS_CATALOG_PAGE_SIZE,
  sortSettingsCatalogByOrderThenKey,
} from '@/lib/settingsCatalogPagination';
import { useSettingsCatalogQueryPageSync } from '@/hooks/useSettingsCatalogQueryPageSync';
import { CatalogSearchPicker } from '@/components/common/CatalogSearchPicker';
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

type StatusFormState = {
  statusKey: string;
  nameVi: string;
  sortOrder: string;
  isWorkforceActive: boolean;
  isTerminal: boolean;
  requiresReason: boolean;
  countsTowardHeadcount: boolean;
  status: string;
};

type ReasonFormState = {
  reasonKey: string;
  nameVi: string;
  sortOrder: string;
  appliesToRaw: string;
  status: string;
};

const emptyStatusForm = (): StatusFormState => ({
  statusKey: '',
  nameVi: '',
  sortOrder: '100',
  isWorkforceActive: true,
  isTerminal: false,
  requiresReason: false,
  countsTowardHeadcount: true,
  status: 'active',
});

const emptyReasonForm = (): ReasonFormState => ({
  reasonKey: '',
  nameVi: '',
  sortOrder: '100',
  appliesToRaw: '',
  status: 'active',
});

function EmpEmploymentStatusCatalogCard() {
  const { currentCompanyId } = useAuth();
  const { listCompanyId } = useHrmOperatingUnitFilter();
  const companyId = listCompanyId || currentCompanyId;
  const queryClient = useQueryClient();
  const {
    nestOptions: statusOptions,
    isLoading: effectiveLoading,
    refetch: refetchEffective,
  } = useEmpEmploymentStatusesEffective({ enabled: Boolean(companyId) });

  const [items, setItems] = useState<HrmEmpEmploymentStatusRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<StatusFormState>(emptyStatusForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [previewKey, setPreviewKey] = useState('');

  const loadRows = useCallback(async (): Promise<HrmEmpEmploymentStatusRecord[]> => {
    if (!companyId) return [];
    setLoading(true);
    setError(null);
    try {
      const res = await listEmpEmploymentStatuses({
        company_id: companyId,
        status: 'active',
      });
      const sorted = sortSettingsCatalogByOrderThenKey(
        res.items,
        (r) => r.sortOrder,
        (r) => r.statusKey,
      );
      setItems(sorted);
      return sorted;
    } catch (err) {
      setError(toErrorMessage(err, 'Không tải được danh sách trạng thái NV.'));
      setItems([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    void loadRows();
  }, [loadRows]);

  useSettingsCatalogQueryPageSync(q, setPage);

  const filtered = useMemo(
    () =>
      filterCatalogByCodeOrName(
        items,
        q,
        (r) => r.statusKey,
        (r) => r.nameVi,
      ),
    [items, q],
  );

  const paginated = useMemo(
    () => paginateCatalogRows(filtered, page, SETTINGS_CATALOG_PAGE_SIZE),
    [filtered, page],
  );

  const invalidateConsumers = () => {
    void queryClient.invalidateQueries({ queryKey: [EMP_EMPLOYMENT_STATUSES_EFFECTIVE_QUERY_KEY] });
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyStatusForm());
    setDialogOpen(true);
  };

  const openEdit = (row: HrmEmpEmploymentStatusRecord) => {
    setEditingId(row.id);
    setForm({
      statusKey: row.statusKey,
      nameVi: row.nameVi,
      sortOrder: String(row.sortOrder ?? 100),
      isWorkforceActive: row.isWorkforceActive !== false,
      isTerminal: Boolean(row.isTerminal),
      requiresReason: Boolean(row.requiresReason),
      countsTowardHeadcount: row.countsTowardHeadcount !== false,
      status: row.status || 'active',
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
    setForm(emptyStatusForm());
  };

  const onSave = async () => {
    if (!companyId) {
      toast({ title: 'Thiếu phạm vi đơn vị', variant: 'destructive' });
      return;
    }
    const statusKey = normalizeEmpEmploymentStatusKey(form.statusKey);
    const nameVi = form.nameVi.trim();
    if (!isValidEmpEmploymentStatusKeyFormat(statusKey)) {
      toast({
        title: 'Mã trạng thái không hợp lệ',
        description:
          'Định dạng a-z / số / _ sau khi đổi - → _ (vd. on_leave).',
        variant: 'destructive',
      });
      return;
    }
    if (!nameVi) {
      toast({
        title: 'Thiếu nhãn tiếng Việt',
        description: 'Bắt buộc nameVi (display-ready).',
        variant: 'destructive',
      });
      return;
    }

    const sortParsed = Number.parseInt(form.sortOrder, 10);
    const sortOrder = Number.isFinite(sortParsed) && sortParsed >= 0 ? sortParsed : 100;

    setSaving(true);
    try {
      const saved = await upsertEmpEmploymentStatus({
        companyId,
        statusKey,
        nameVi,
        sortOrder,
        isWorkforceActive: form.isWorkforceActive,
        isTerminal: form.isTerminal,
        requiresReason: form.requiresReason,
        countsTowardHeadcount: form.countsTowardHeadcount,
        status: form.status || 'active',
      });
      toast({
        title: editingId ? 'Đã cập nhật trạng thái NV' : 'Đã tạo trạng thái NV',
        description: formatEmpEmploymentStatusDisplay(saved.statusKey, saved.nameVi),
      });
      closeDialog();
      setQ('');
      const fresh = await loadRows();
      setPage(catalogPageForKey(fresh, saved.statusKey, (r) => r.statusKey));
      invalidateConsumers();
      await refetchEffective();
      setPreviewKey(saved.statusKey);
    } catch (err) {
      toast({
        title: 'Lưu trạng thái NV thất bại',
        description: toErrorMessage(err, 'Không lưu được trạng thái NV.'),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const onRetire = async (row: HrmEmpEmploymentStatusRecord) => {
    if (!companyId) return;
    const ok = window.confirm(
      `Ngừng trạng thái «${formatEmpEmploymentStatusDisplay(row.statusKey, row.nameVi)}»? (soft-delete — hồ sơ lịch sử vẫn giữ mã)`,
    );
    if (!ok) return;
    try {
      await retireEmpEmploymentStatus(row.id, companyId);
      toast({ title: 'Đã ngừng trạng thái NV', description: row.nameVi });
      if (editingId === row.id) closeDialog();
      if (previewKey === row.statusKey) setPreviewKey('');
      await loadRows();
      invalidateConsumers();
      await refetchEffective();
    } catch (err) {
      toast({
        title: 'Ngừng trạng thái NV thất bại',
        description: toErrorMessage(err, 'Không ngừng được trạng thái NV.'),
        variant: 'destructive',
      });
    }
  };

  const honestySlot = null;

  return (
    <>
      <SettingsCatalogScreenShell
        compact
        title="Trạng thái nhân viên (EMP catalog)"
        description="Catalog mở theo đơn vị — tìm mã hoặc nhãn; thêm/sửa qua hộp thoại; F5 sau lưu."
        testId="settings-emp-employment-statuses"
        searchValue={q}
        onSearchChange={setQ}
        searchPlaceholder="Tìm theo mã hoặc tên…"
        onRefresh={() => {
          void loadRows();
          void refetchEffective();
        }}
        refreshing={loading}
        onAdd={openCreate}
        addLabel="Thêm trạng thái"
        honestySlot={honestySlot}
        footerSlot={
          <SettingsCatalogPagination
            page={paginated.page}
            totalPages={paginated.totalPages}
            total={paginated.total}
            pageSize={paginated.pageSize}
            onPageChange={setPage}
            testId="settings-emp-employment-statuses-pagination"
          />
        }
      >
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        <Table data-testid="settings-emp-employment-statuses-table" className="min-w-[640px]">
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[140px]">Mã</TableHead>
              <TableHead className="min-w-[160px]">Tên</TableHead>
              <TableHead>Cờ</TableHead>
              <TableHead>Nguồn</TableHead>
              <TableHead className="min-w-[140px] text-right">Thao tác</TableHead>
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
                    ? 'Chưa có trạng thái — bấm «Thêm trạng thái».'
                    : 'Không có dòng khớp tìm kiếm.'}
                </TableCell>
              </TableRow>
            ) : (
              paginated.slice.map((row) => (
                <TableRow
                  key={row.id}
                  data-testid={`settings-emp-employment-status-row-${row.statusKey}`}
                >
                  <TableCell className="font-mono text-xs">{row.statusKey}</TableCell>
                  <TableCell className="font-medium">{row.nameVi}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {[
                      row.isWorkforceActive !== false ? 'WF' : null,
                      row.isTerminal ? 'terminal' : null,
                      row.requiresReason ? 'lý do' : null,
                      row.countsTowardHeadcount !== false ? 'HC' : null,
                    ]
                      .filter(Boolean)
                      .join(' · ') || '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {empEmploymentStatusSourceLabel(row.source ?? 'emp_native')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <SettingsCatalogRowActions
                      editTestId={`hdsd-emp-employment-status-edit-${row.statusKey}`}
                      retireTestId={`hdsd-emp-employment-status-retire-${row.statusKey}`}
                      onEdit={() => openEdit(row)}
                      onRetire={() => void onRetire(row)}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div
          className="mt-4 grid max-w-md gap-2 border-t border-xevn-border pt-4"
          data-testid="settings-emp-employment-statuses-picker-preview"
        >
          <Label>Picker hiệu lực (cập nhật sau khi tải lại trang)</Label>
          <CatalogSearchPicker
            value={previewKey}
            onValueChange={setPreviewKey}
            options={statusOptions}
            placeholder="Chọn trạng thái hiệu lực…"
            loading={effectiveLoading}
            emptyHint="Chưa có trạng thái hiệu lực — tạo mã mới qua hộp thoại."
            data-testid="hdsd-emp-employment-status-effective-picker"
          />
        </div>
      </SettingsCatalogScreenShell>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => (open ? setDialogOpen(true) : closeDialog())}
      >
        <DialogContent
          className="max-h-[min(90vh,720px)] max-w-lg overflow-y-auto sm:max-w-xl"
          data-testid="settings-emp-employment-statuses-dialog"
        >
          <DialogHeader>
            <DialogTitle>{editingId ? 'Sửa trạng thái NV' : 'Thêm trạng thái NV'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="emp-st-key">Mã trạng thái *</Label>
                <Input
                  id="emp-st-key"
                  data-testid="hdsd-emp-employment-status-key"
                  className="font-mono text-sm"
                  placeholder="hr_st_custom_09"
                  value={form.statusKey}
                  disabled={Boolean(editingId)}
                  onChange={(e) => setForm((f) => ({ ...f, statusKey: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="emp-st-name">Nhãn tiếng Việt *</Label>
                <Input
                  id="emp-st-name"
                  data-testid="hdsd-emp-employment-status-name"
                  placeholder="Tạm nghỉ dài hạn"
                  value={form.nameVi}
                  onChange={(e) => setForm((f) => ({ ...f, nameVi: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1 max-w-[8rem]">
              <Label htmlFor="emp-st-sort">Thứ tự</Label>
              <Input
                id="emp-st-sort"
                data-testid="hdsd-emp-employment-status-sort"
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
                  checked={form.isWorkforceActive}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, isWorkforceActive: v }))}
                />
                Workforce active
              </label>
              <label className="inline-flex items-center gap-2">
                <Switch
                  checked={form.isTerminal}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, isTerminal: v }))}
                />
                Terminal (kết thúc)
              </label>
              <label className="inline-flex items-center gap-2">
                <Switch
                  checked={form.requiresReason}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, requiresReason: v }))}
                />
                Bắt buộc lý do
              </label>
              <label className="inline-flex items-center gap-2">
                <Switch
                  checked={form.countsTowardHeadcount}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, countsTowardHeadcount: v }))}
                />
                Tính headcount
              </label>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={closeDialog}>
              Hủy
            </Button>
            <Button
              type="button"
              disabled={saving || !companyId}
              data-testid="hdsd-emp-employment-status-save"
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

function EmpStatusReasonCatalogCard() {
  const { currentCompanyId } = useAuth();
  const { listCompanyId } = useHrmOperatingUnitFilter();
  const companyId = listCompanyId || currentCompanyId;
  const queryClient = useQueryClient();
  const {
    nestOptions: reasonOptions,
    isLoading: effectiveLoading,
    refetch: refetchEffective,
  } = useEmpStatusReasonsEffective({ enabled: Boolean(companyId) });

  const [items, setItems] = useState<HrmEmpStatusReasonRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<ReasonFormState>(emptyReasonForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [previewKey, setPreviewKey] = useState('');

  const loadRows = useCallback(async (): Promise<HrmEmpStatusReasonRecord[]> => {
    if (!companyId) return [];
    setLoading(true);
    setError(null);
    try {
      const res = await listEmpStatusReasons({
        company_id: companyId,
        status: 'active',
      });
      const sorted = sortSettingsCatalogByOrderThenKey(
        res.items,
        (r) => r.sortOrder,
        (r) => r.reasonKey,
      );
      setItems(sorted);
      return sorted;
    } catch (err) {
      setError(toErrorMessage(err, 'Không tải được danh sách lý do trạng thái.'));
      setItems([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    void loadRows();
  }, [loadRows]);

  useSettingsCatalogQueryPageSync(q, setPage);

  const filtered = useMemo(
    () =>
      filterCatalogByCodeOrName(
        items,
        q,
        (r) => r.reasonKey,
        (r) => r.nameVi,
      ),
    [items, q],
  );

  const paginated = useMemo(
    () => paginateCatalogRows(filtered, page, SETTINGS_CATALOG_PAGE_SIZE),
    [filtered, page],
  );

  const invalidateConsumers = () => {
    void queryClient.invalidateQueries({ queryKey: [EMP_STATUS_REASONS_EFFECTIVE_QUERY_KEY] });
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyReasonForm());
    setDialogOpen(true);
  };

  const openEdit = (row: HrmEmpStatusReasonRecord) => {
    setEditingId(row.id);
    setForm({
      reasonKey: row.reasonKey,
      nameVi: row.nameVi,
      sortOrder: String(row.sortOrder ?? 100),
      appliesToRaw: (row.appliesToStatusKeys ?? []).join(', '),
      status: row.status || 'active',
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
    setForm(emptyReasonForm());
  };

  const onSave = async () => {
    if (!companyId) {
      toast({ title: 'Thiếu phạm vi đơn vị', variant: 'destructive' });
      return;
    }
    const reasonKey = normalizeEmpStatusReasonKey(form.reasonKey);
    const nameVi = form.nameVi.trim();
    if (!isValidEmpStatusReasonKeyFormat(reasonKey)) {
      toast({
        title: 'Mã lý do không hợp lệ',
        description:
          'Định dạng a-z / số / _ sau khi đổi - → _ (vd. resign_personal).',
        variant: 'destructive',
      });
      return;
    }
    if (!nameVi) {
      toast({
        title: 'Thiếu nhãn tiếng Việt',
        description: 'Bắt buộc nameVi (display-ready).',
        variant: 'destructive',
      });
      return;
    }

    const sortParsed = Number.parseInt(form.sortOrder, 10);
    const sortOrder = Number.isFinite(sortParsed) && sortParsed >= 0 ? sortParsed : 100;
    const appliesToStatusKeys = parseEmpStatusReasonAppliesTo(form.appliesToRaw);

    setSaving(true);
    try {
      const saved = await upsertEmpStatusReason({
        companyId,
        reasonKey,
        nameVi,
        sortOrder,
        appliesToStatusKeys,
        status: form.status || 'active',
      });
      toast({
        title: editingId ? 'Đã cập nhật lý do trạng thái' : 'Đã tạo lý do trạng thái',
        description: formatEmpStatusReasonDisplay(saved.reasonKey, saved.nameVi),
      });
      closeDialog();
      setQ('');
      const fresh = await loadRows();
      setPage(catalogPageForKey(fresh, saved.reasonKey, (r) => r.reasonKey));
      invalidateConsumers();
      await refetchEffective();
      setPreviewKey(saved.reasonKey);
    } catch (err) {
      toast({
        title: 'Lưu lý do trạng thái thất bại',
        description: toErrorMessage(err, 'Không lưu được lý do trạng thái.'),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const onRetire = async (row: HrmEmpStatusReasonRecord) => {
    if (!companyId) return;
    const ok = window.confirm(
      `Ngừng lý do «${formatEmpStatusReasonDisplay(row.reasonKey, row.nameVi)}»? (soft-delete — hồ sơ lịch sử vẫn giữ mã)`,
    );
    if (!ok) return;
    try {
      await retireEmpStatusReason(row.id, companyId);
      toast({ title: 'Đã ngừng lý do trạng thái', description: row.nameVi });
      if (editingId === row.id) closeDialog();
      if (previewKey === row.reasonKey) setPreviewKey('');
      await loadRows();
      invalidateConsumers();
      await refetchEffective();
    } catch (err) {
      toast({
        title: 'Ngừng lý do trạng thái thất bại',
        description: toErrorMessage(err, 'Không ngừng được lý do trạng thái.'),
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <SettingsCatalogScreenShell
        compact
        title="Lý do trạng thái (EMP catalog)"
        description="Catalog mở theo đơn vị — applies_to = danh sách status_key; thêm/sửa qua hộp thoại."
        testId="settings-emp-status-reasons"
        searchValue={q}
        onSearchChange={setQ}
        searchPlaceholder="Tìm theo mã hoặc tên…"
        onRefresh={() => {
          void loadRows();
          void refetchEffective();
        }}
        refreshing={loading}
        onAdd={openCreate}
        addLabel="Thêm lý do"
        footerSlot={
          <SettingsCatalogPagination
            page={paginated.page}
            totalPages={paginated.totalPages}
            total={paginated.total}
            pageSize={paginated.pageSize}
            onPageChange={setPage}
            testId="settings-emp-status-reasons-pagination"
          />
        }
      >
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        <Table data-testid="settings-emp-status-reasons-table" className="min-w-[640px]">
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[140px]">Mã</TableHead>
              <TableHead className="min-w-[160px]">Tên</TableHead>
              <TableHead>Áp dụng</TableHead>
              <TableHead className="min-w-[140px] text-right">Thao tác</TableHead>
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
                    ? 'Chưa có lý do — bấm «Thêm lý do».'
                    : 'Không có dòng khớp tìm kiếm.'}
                </TableCell>
              </TableRow>
            ) : (
              paginated.slice.map((row) => (
                <TableRow
                  key={row.id}
                  data-testid={`settings-emp-status-reason-row-${row.reasonKey}`}
                >
                  <TableCell className="font-mono text-xs">{row.reasonKey}</TableCell>
                  <TableCell className="font-medium">{row.nameVi}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {(row.appliesToStatusKeys ?? []).length > 0
                      ? (row.appliesToStatusKeys ?? []).join(', ')
                      : '— (mọi trạng thái)'}
                  </TableCell>
                  <TableCell>
                    <SettingsCatalogRowActions
                      editTestId={`hdsd-emp-status-reason-edit-${row.reasonKey}`}
                      retireTestId={`hdsd-emp-status-reason-retire-${row.reasonKey}`}
                      onEdit={() => openEdit(row)}
                      onRetire={() => void onRetire(row)}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div
          className="mt-4 grid max-w-md gap-2 border-t border-xevn-border pt-4"
          data-testid="settings-emp-status-reasons-picker-preview"
        >
          <Label>Picker hiệu lực (cập nhật sau khi tải lại trang)</Label>
          <CatalogSearchPicker
            value={previewKey}
            onValueChange={setPreviewKey}
            options={reasonOptions}
            placeholder="Chọn lý do hiệu lực…"
            loading={effectiveLoading}
            emptyHint="Chưa có lý do hiệu lực — tạo mã mới qua hộp thoại."
            data-testid="hdsd-emp-status-reason-effective-picker"
          />
        </div>
      </SettingsCatalogScreenShell>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => (open ? setDialogOpen(true) : closeDialog())}
      >
        <DialogContent
          className="max-h-[min(90vh,720px)] max-w-lg overflow-y-auto sm:max-w-xl"
          data-testid="settings-emp-status-reasons-dialog"
        >
          <DialogHeader>
            <DialogTitle>{editingId ? 'Sửa lý do trạng thái' : 'Thêm lý do trạng thái'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="emp-str-key">Mã lý do *</Label>
                <Input
                  id="emp-str-key"
                  data-testid="hdsd-emp-status-reason-key"
                  className="font-mono text-sm"
                  placeholder="resign_personal"
                  value={form.reasonKey}
                  disabled={Boolean(editingId)}
                  onChange={(e) => setForm((f) => ({ ...f, reasonKey: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="emp-str-name">Nhãn tiếng Việt *</Label>
                <Input
                  id="emp-str-name"
                  data-testid="hdsd-emp-status-reason-name"
                  placeholder="Nghỉ việc tự nguyện"
                  value={form.nameVi}
                  onChange={(e) => setForm((f) => ({ ...f, nameVi: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1 max-w-[8rem]">
              <Label htmlFor="emp-str-sort">Thứ tự</Label>
              <Input
                id="emp-str-sort"
                data-testid="hdsd-emp-status-reason-sort"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={form.sortOrder}
                onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value.replace(/\D/g, '') }))}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="emp-str-applies">Áp dụng cho status_key (phẩy / khoảng trắng)</Label>
              <Input
                id="emp-str-applies"
                data-testid="hdsd-emp-status-reason-applies-to"
                className="font-mono text-sm"
                placeholder="inactive, resigned"
                value={form.appliesToRaw}
                onChange={(e) => setForm((f) => ({ ...f, appliesToRaw: e.target.value }))}
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
              data-testid="hdsd-emp-status-reason-save"
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

/** Settings tab body — ST + STR admin twin (peer DEC/ET). */
export function EmpEmploymentStatusSettingsPanel() {
  return (
    <div className="space-y-6" data-testid="settings-emp-status-admin">
      <EmpEmploymentStatusCatalogCard />
      <EmpStatusReasonCatalogCard />
    </div>
  );
}

