/**
 * @CODE-MEMORY
 * Screen:     /settings — tab Loại hình thuê EMP
 * UC:         AC-PLT-EMP-04 · AC-PLT-EMP-05
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-FE-01 · PO-HRM-SETTINGS-W3-CAT-B-FE-01
 * Purpose:    List + search + phân trang + popup thêm/sửa (W3 shell).
 * must_keep:  soft-delete · open catalog · U65 · hdsd-* testids
 *
 * @CODE-MEMORY-CHANGE 2026-08-10 PO-HRM-SETTINGS-W3-CAT-B-FE-01
 * change_mode: UPGRADE · SettingsCatalogScreenShell + Dialog
 *
 * @CODE-MEMORY-CHANGE 2026-08-13 PO-HRM-SETTINGS-IA-COPY-WAVE2-FE-01
 * change_mode: FIX
 * What: Dọn copy jargon nội bộ — toast lỗi mã không hợp lệ bỏ mã "HRM-PLT-CAT-CODE-INVALID — "; empty-state bỏ đuôi "(U65, không seed)".
 * Why: PO-HRM-SETTINGS-IA-COPY-WAVE2-FE-01 (Phần B) — UX-PRODUCT-RULES.md §10 R1/R2
 *      cấm mã tracing/thuật ngữ vận hành nội bộ render ra UI end-user.
 * SRS: (không phát sinh SRS mới — copy hygiene, không đổi logic validate/mutate)
 * must_keep: mọi data-testid cũ nguyên vẹn; logic validate/điều kiện không đổi
 * LastVerified: docs/qa/evidence/po-hrm-settings-ia-copy-wave2-fe-01.md
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Save } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useHrmOperatingUnitFilter } from '@/contexts/HrmOperatingUnitFilterContext';
import {
  listEmpEmploymentTypes,
  retireEmpEmploymentType,
  upsertEmpEmploymentType,
  type HrmEmpEmploymentTypeRecord,
} from '@/integrations/hrmApi';
import { EMP_EMPLOYMENT_TYPES_EFFECTIVE_QUERY_KEY } from '@/hooks/useEmpEmploymentTypesEffective';
import { SETTINGS_CATALOGS_QUERY_KEY } from '@/hooks/useSettingsCatalogsOverview';
import { toErrorMessage } from '@/lib/apiError';
import {
  EMP_EMPLOYMENT_TYPE_UAT_HONESTY,
  empEmploymentTypeSourceLabel,
  formatEmpEmploymentTypeDisplay,
  isValidEmpEmploymentTypeKeyFormat,
  normalizeEmpEmploymentTypeKey,
} from '@/lib/empEmploymentTypeCatalog';
import {
  filterCatalogByCodeOrName,
  paginateCatalogRows,
  catalogPageForKey,
  SETTINGS_CATALOG_PAGE_SIZE,
  settingsCatalogRowTestId,
  sortSettingsCatalogByOrderThenKey,
} from '@/lib/settingsCatalogPagination';
import { useSettingsCatalogFocusPage, resolveSettingsCatalogInitialSearchQuery } from '@/hooks/useSettingsCatalogFocusPage';
import { useSettingsCatalogQueryPageSync } from '@/hooks/useSettingsCatalogQueryPageSync';
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
  employmentTypeKey: string;
  nameVi: string;
  sortOrder: string;
  countsTowardHeadcount: boolean;
  eligibleForSi: boolean;
  isContingent: boolean;
  status: string;
};

const emptyForm = (): FormState => ({
  employmentTypeKey: '',
  nameVi: '',
  sortOrder: '100',
  countsTowardHeadcount: true,
  eligibleForSi: true,
  isContingent: false,
  status: 'active',
});

const SETTINGS_TAB_EMP_EMPLOYMENT_TYPES = 'emp-employment-types';

export function EmpEmploymentTypeSettingsPanel() {
  const { currentCompanyId } = useAuth();
  const { listCompanyId } = useHrmOperatingUnitFilter();
  const companyId = listCompanyId || currentCompanyId;
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const bootstrapFocusQueryRef = useRef(
    resolveSettingsCatalogInitialSearchQuery(
      SETTINGS_TAB_EMP_EMPLOYMENT_TYPES,
      searchParams.get('focus'),
    ),
  );

  const [items, setItems] = useState<HrmEmpEmploymentTypeRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [q, setQ] = useState(() => bootstrapFocusQueryRef.current);
  const [page, setPage] = useState(1);

  const rowKeyOf = useCallback((r: HrmEmpEmploymentTypeRecord) => r.employmentTypeKey, []);
  const { rememberFocusForReload } = useSettingsCatalogFocusPage(
    SETTINGS_TAB_EMP_EMPLOYMENT_TYPES,
    items,
    loading,
    rowKeyOf,
    setPage,
    setQ,
  );

  const loadRows = useCallback(async (): Promise<HrmEmpEmploymentTypeRecord[]> => {
    if (!companyId) return [];
    setLoading(true);
    setError(null);
    try {
      const res = await listEmpEmploymentTypes({
        company_id: companyId,
        status: 'active',
      });
      const sorted = sortSettingsCatalogByOrderThenKey(
        res.items,
        (r) => r.sortOrder,
        (r) => r.employmentTypeKey,
      );
      setItems(sorted);
      return sorted;
    } catch (err) {
      setError(toErrorMessage(err, 'Không tải được danh sách loại hình thuê.'));
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
        (r) => r.employmentTypeKey,
        (r) => r.nameVi,
      ),
    [items, q],
  );

  const paginated = useMemo(
    () => paginateCatalogRows(filtered, page, SETTINGS_CATALOG_PAGE_SIZE),
    [filtered, page],
  );

  const invalidateConsumers = () => {
    void queryClient.invalidateQueries({ queryKey: [EMP_EMPLOYMENT_TYPES_EFFECTIVE_QUERY_KEY] });
    void queryClient.invalidateQueries({ queryKey: [SETTINGS_CATALOGS_QUERY_KEY] });
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (row: HrmEmpEmploymentTypeRecord) => {
    setEditingId(row.id);
    setForm({
      employmentTypeKey: row.employmentTypeKey,
      nameVi: row.nameVi,
      sortOrder: String(row.sortOrder ?? 100),
      countsTowardHeadcount: row.countsTowardHeadcount !== false,
      eligibleForSi: row.eligibleForSi !== false,
      isContingent: Boolean(row.isContingent),
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
    const employmentTypeKey = normalizeEmpEmploymentTypeKey(form.employmentTypeKey);
    const nameVi = form.nameVi.trim();
    if (!isValidEmpEmploymentTypeKeyFormat(employmentTypeKey)) {
      toast({
        title: 'Mã loại hình thuê không hợp lệ',
        description: 'Định dạng a-z / số / _ sau khi đổi - → _.',
        variant: 'destructive',
      });
      return;
    }
    if (!nameVi) {
      toast({ title: 'Thiếu nhãn tiếng Việt', variant: 'destructive' });
      return;
    }

    const sortParsed = Number.parseInt(form.sortOrder, 10);
    const sortOrder = Number.isFinite(sortParsed) && sortParsed >= 0 ? sortParsed : 100;

    setSaving(true);
    try {
      const saved = await upsertEmpEmploymentType({
        companyId,
        employmentTypeKey,
        nameVi,
        sortOrder,
        countsTowardHeadcount: form.countsTowardHeadcount,
        eligibleForSi: form.eligibleForSi,
        isContingent: form.isContingent,
        status: form.status || 'active',
      });
      toast({
        title: editingId ? 'Đã cập nhật loại hình thuê' : 'Đã tạo loại hình thuê',
        description: formatEmpEmploymentTypeDisplay(saved.employmentTypeKey, saved.nameVi),
      });
      closeDialog();
      rememberFocusForReload(saved.employmentTypeKey);
      setQ('');
      const fresh = await loadRows();
      setPage(catalogPageForKey(fresh, saved.employmentTypeKey, (r) => r.employmentTypeKey));
      invalidateConsumers();
    } catch (err) {
      toast({
        title: 'Lưu loại hình thuê thất bại',
        description: toErrorMessage(err, 'Không lưu được loại hình thuê.'),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const onRetire = async (row: HrmEmpEmploymentTypeRecord) => {
    if (!companyId) return;
    const ok = window.confirm(
      `Ngừng loại hình thuê «${formatEmpEmploymentTypeDisplay(row.employmentTypeKey, row.nameVi)}»? (soft-delete)`,
    );
    if (!ok) return;
    try {
      await retireEmpEmploymentType(row.id, companyId);
      toast({ title: 'Đã ngừng loại hình thuê', description: row.nameVi });
      if (editingId === row.id) closeDialog();
      await loadRows();
      invalidateConsumers();
    } catch (err) {
      toast({
        title: 'Ngừng loại hình thuê thất bại',
        description: toErrorMessage(err, 'Không ngừng được loại hình thuê.'),
        variant: 'destructive',
      });
    }
  };

  const honestySlot = null;

  return (
    <>
      <SettingsCatalogScreenShell
        compact
        title="Loại hình thuê (EMP catalog)"
        description="Danh sách loại hình theo đơn vị — tìm mã hoặc nhãn; thêm/sửa qua hộp thoại."
        testId="settings-emp-employment-types"
        searchValue={q}
        onSearchChange={setQ}
        searchPlaceholder="Tìm theo mã hoặc tên…"
        onRefresh={() => void loadRows()}
        refreshing={loading}
        onAdd={openCreate}
        addLabel="Thêm loại hình"
        honestySlot={honestySlot}
        footerSlot={
          <SettingsCatalogPagination
            page={paginated.page}
            totalPages={paginated.totalPages}
            total={paginated.total}
            pageSize={paginated.pageSize}
            onPageChange={setPage}
            testId="settings-emp-employment-types-pagination"
          />
        }
      >
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        <Table data-testid="settings-emp-employment-types-table" className="min-w-[640px]">
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
                    ? 'Chưa có loại hình — bấm «Thêm loại hình».'
                    : 'Không có dòng khớp tìm kiếm.'}
                </TableCell>
              </TableRow>
            ) : (
              paginated.slice.map((row) => (
                <TableRow
                  key={row.id}
                  data-testid={settingsCatalogRowTestId(row.employmentTypeKey)}
                >
                  <TableCell className="font-mono text-xs">{row.employmentTypeKey}</TableCell>
                  <TableCell className="font-medium">{row.nameVi}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {[
                      row.countsTowardHeadcount !== false ? 'HC' : null,
                      row.eligibleForSi !== false ? 'BHXH' : null,
                      row.isContingent ? 'contingent' : null,
                    ]
                      .filter(Boolean)
                      .join(' · ') || '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {empEmploymentTypeSourceLabel(row.source ?? 'emp_native')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <SettingsCatalogRowActions
                      editTestId={`hdsd-emp-employment-type-edit-${row.employmentTypeKey}`}
                      retireTestId={`hdsd-emp-employment-type-retire-${row.employmentTypeKey}`}
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

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => (open ? setDialogOpen(true) : closeDialog())}
      >
        <DialogContent
          className="max-h-[min(90vh,720px)] max-w-lg overflow-y-auto sm:max-w-xl"
          data-testid="settings-emp-employment-types-dialog"
        >
          <DialogHeader>
            <DialogTitle>{editingId ? 'Sửa loại hình thuê' : 'Thêm loại hình thuê'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="emp-et-key">Mã loại hình *</Label>
                <Input
                  id="emp-et-key"
                  data-testid="hdsd-emp-employment-type-key"
                  className="font-mono text-sm"
                  placeholder="seasonal_temp_09"
                  value={form.employmentTypeKey}
                  disabled={Boolean(editingId)}
                  onChange={(e) => setForm((f) => ({ ...f, employmentTypeKey: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="emp-et-name">Nhãn tiếng Việt *</Label>
                <Input
                  id="emp-et-name"
                  data-testid="hdsd-emp-employment-type-name"
                  placeholder="Thời vụ mùa"
                  value={form.nameVi}
                  onChange={(e) => setForm((f) => ({ ...f, nameVi: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1 max-w-[8rem]">
              <Label htmlFor="emp-et-sort">Thứ tự</Label>
              <Input
                id="emp-et-sort"
                data-testid="hdsd-emp-employment-type-sort"
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
                  checked={form.countsTowardHeadcount}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, countsTowardHeadcount: v }))}
                />
                Tính headcount
              </label>
              <label className="inline-flex items-center gap-2">
                <Switch
                  checked={form.eligibleForSi}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, eligibleForSi: v }))}
                />
                Đủ điều kiện BHXH
              </label>
              <label className="inline-flex items-center gap-2">
                <Switch
                  checked={form.isContingent}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, isContingent: v }))}
                />
                Lao động thời vụ / contingent
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
              data-testid="hdsd-emp-employment-type-save"
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

