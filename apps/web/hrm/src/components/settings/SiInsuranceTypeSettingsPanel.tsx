/**
 * @CODE-MEMORY
 * Screen:     /settings — tab Loại BH / SI type
 * UC:         AC-PLT-SI-INS-01d
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-FE-01 · PO-HRM-SETTINGS-W3-CAT-B-FE-01
 * Purpose:    List + search + phân trang + popup (W3 shell).
 * must_keep:  soft-delete · U65 · hdsd-* testids
 *
 * @CODE-MEMORY-CHANGE 2026-08-10 PO-HRM-SETTINGS-W3-CAT-B-FE-01
 * change_mode: UPGRADE · SettingsCatalogScreenShell + Dialog
 *
 * @CODE-MEMORY-CHANGE 2026-08-10 PO-HRM-SETTINGS-W3-MUTATE-FIX-FE-01
 * change_mode: UPGRADE
 * What: F5 post-mutate — loadRows + catalogPageForKey + invalidate EFF; focus/page sync hooks
 * Why: SA Option A W3 mutate residual — FE-after-2xx row visible pre-F5
 * must_keep: ATTLVTSOTQC1 OUT OF SCOPE · honesty false
 *
 * @CODE-MEMORY-CHANGE 2026-08-13 PO-HRM-SETTINGS-IA-COPY-WAVE2-FE-01
 * change_mode: FIX
 * What: Dọn copy jargon nội bộ — empty-state bỏ đuôi "(U65, không seed)".
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
  listSiInsuranceTypes,
  retireSiInsuranceType,
  upsertSiInsuranceType,
  type HrmSiInsuranceTypeRecord,
} from '@/integrations/hrmApi';
import { SI_INSURANCE_TYPES_EFFECTIVE_QUERY_KEY } from '@/hooks/useSiInsuranceTypesEffective';
import { SETTINGS_CATALOGS_QUERY_KEY } from '@/hooks/useSettingsCatalogsOverview';
import { toErrorMessage } from '@/lib/apiError';
import {
  SI_INSURANCE_TYPE_UAT_HONESTY,
  formatSiInsuranceTypeDisplay,
  isValidSiInsuranceTypeKeyFormat,
  normalizeSiInsuranceTypeKey,
  siInsuranceTypeSourceLabel,
} from '@/lib/siInsuranceTypeCatalog';
import {
  filterCatalogByCodeOrName,
  paginateCatalogRows,
  catalogPageForKey,
  SETTINGS_CATALOG_PAGE_SIZE,
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
  insuranceTypeKey: string;
  nameVi: string;
  sortOrder: string;
  isStatutory: boolean;
  eligibleForRateCfg: boolean;
  requiresPolicy: boolean;
  status: string;
};

const emptyForm = (): FormState => ({
  insuranceTypeKey: '',
  nameVi: '',
  sortOrder: '100',
  isStatutory: false,
  eligibleForRateCfg: true,
  requiresPolicy: false,
  status: 'active',
});

const SETTINGS_TAB_SI_INSURANCE_TYPES = 'si-insurance-types';

export function SiInsuranceTypeSettingsPanel() {
  const { currentCompanyId } = useAuth();
  const { listCompanyId } = useHrmOperatingUnitFilter();
  const companyId = listCompanyId || currentCompanyId;
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const bootstrapFocusQueryRef = useRef(
    resolveSettingsCatalogInitialSearchQuery(
      SETTINGS_TAB_SI_INSURANCE_TYPES,
      searchParams.get('focus'),
    ),
  );

  const [items, setItems] = useState<HrmSiInsuranceTypeRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [q, setQ] = useState(() => bootstrapFocusQueryRef.current);
  const [page, setPage] = useState(1);

  const rowKeyOf = useCallback((r: HrmSiInsuranceTypeRecord) => r.insuranceTypeKey, []);
  const { rememberFocusForReload } = useSettingsCatalogFocusPage(
    SETTINGS_TAB_SI_INSURANCE_TYPES,
    items,
    loading,
    rowKeyOf,
    setPage,
    setQ,
  );

  const loadRows = useCallback(async (): Promise<HrmSiInsuranceTypeRecord[]> => {
    if (!companyId) return [];
    setLoading(true);
    setError(null);
    try {
      const res = await listSiInsuranceTypes({
        company_id: companyId,
        status: 'active',
      });
      const sorted = sortSettingsCatalogByOrderThenKey(
        res.items,
        (r) => r.sortOrder,
        (r) => r.insuranceTypeKey,
      );
      setItems(sorted);
      return sorted;
    } catch (err) {
      setError(toErrorMessage(err, 'Không tải được danh sách loại bảo hiểm.'));
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
        (r) => r.insuranceTypeKey,
        (r) => r.nameVi,
      ),
    [items, q],
  );

  const paginated = useMemo(
    () => paginateCatalogRows(filtered, page, SETTINGS_CATALOG_PAGE_SIZE),
    [filtered, page],
  );

  const invalidateConsumers = () => {
    void queryClient.invalidateQueries({ queryKey: [SI_INSURANCE_TYPES_EFFECTIVE_QUERY_KEY] });
    void queryClient.invalidateQueries({ queryKey: [SETTINGS_CATALOGS_QUERY_KEY] });
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (row: HrmSiInsuranceTypeRecord) => {
    setEditingId(row.id);
    setForm({
      insuranceTypeKey: row.insuranceTypeKey,
      nameVi: row.nameVi,
      sortOrder: String(row.sortOrder ?? 100),
      isStatutory: Boolean(row.isStatutory),
      eligibleForRateCfg: row.eligibleForRateCfg !== false,
      requiresPolicy: Boolean(row.requiresPolicy),
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
    const insuranceTypeKey = normalizeSiInsuranceTypeKey(form.insuranceTypeKey);
    const nameVi = form.nameVi.trim();
    if (!isValidSiInsuranceTypeKeyFormat(insuranceTypeKey)) {
      toast({ title: 'Mã loại BH không hợp lệ', variant: 'destructive' });
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
      const saved = await upsertSiInsuranceType({
        companyId,
        insuranceTypeKey,
        nameVi,
        sortOrder,
        isStatutory: form.isStatutory,
        eligibleForRateCfg: form.eligibleForRateCfg,
        requiresPolicy: form.requiresPolicy,
        status: form.status || 'active',
      });
      toast({
        title: editingId ? 'Đã cập nhật loại BH' : 'Đã tạo loại BH',
        description: formatSiInsuranceTypeDisplay(saved.insuranceTypeKey, saved.nameVi),
      });
      closeDialog();
      rememberFocusForReload(saved.insuranceTypeKey);
      setQ('');
      const fresh = await loadRows();
      setPage(catalogPageForKey(fresh, saved.insuranceTypeKey, (r) => r.insuranceTypeKey));
      invalidateConsumers();
    } catch (err) {
      toast({
        title: 'Lưu loại BH thất bại',
        description: toErrorMessage(err, 'Không lưu được loại bảo hiểm.'),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const onRetire = async (row: HrmSiInsuranceTypeRecord) => {
    if (!companyId) return;
    const ok = window.confirm(
      `Ngừng loại BH «${formatSiInsuranceTypeDisplay(row.insuranceTypeKey, row.nameVi)}»? (soft-delete)`,
    );
    if (!ok) return;
    try {
      await retireSiInsuranceType(row.id, companyId);
      toast({ title: 'Đã ngừng loại BH', description: row.nameVi });
      if (editingId === row.id) closeDialog();
      await loadRows();
      invalidateConsumers();
    } catch (err) {
      toast({
        title: 'Ngừng loại BH thất bại',
        description: toErrorMessage(err, 'Không ngừng được loại bảo hiểm.'),
        variant: 'destructive',
      });
    }
  };

  const honestySlot = null;

  return (
    <>
      <SettingsCatalogScreenShell
        compact
        title="Loại bảo hiểm (SI catalog)"
        description="Danh sách loại BH theo đơn vị — thêm/sửa qua hộp thoại."
        testId="settings-si-insurance-types"
        searchValue={q}
        onSearchChange={setQ}
        searchPlaceholder="Tìm theo mã hoặc tên…"
        onRefresh={() => void loadRows()}
        refreshing={loading}
        onAdd={openCreate}
        addLabel="Thêm loại BH"
        honestySlot={honestySlot}
        footerSlot={
          <SettingsCatalogPagination
            page={paginated.page}
            totalPages={paginated.totalPages}
            total={paginated.total}
            pageSize={paginated.pageSize}
            onPageChange={setPage}
            testId="settings-si-insurance-types-pagination"
          />
        }
      >
        {error ? (
          <p className="text-sm text-destructive" data-testid="settings-si-insurance-types-error">
            {error}
          </p>
        ) : null}
        <Table data-testid="settings-si-insurance-types-table" className="min-w-[640px]">
          <TableHeader>
            <TableRow>
              <TableHead>Mã</TableHead>
              <TableHead>Tên</TableHead>
              <TableHead>Nguồn</TableHead>
              <TableHead>Cờ</TableHead>
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
                    ? 'Chưa có loại BH — bấm «Thêm loại BH».'
                    : 'Không có dòng khớp tìm kiếm.'}
                </TableCell>
              </TableRow>
            ) : (
              paginated.slice.map((row) => (
                <TableRow
                  key={row.id}
                  data-testid={`settings-si-insurance-type-row-${row.insuranceTypeKey}`}
                >
                  <TableCell className="font-mono text-xs">{row.insuranceTypeKey}</TableCell>
                  <TableCell className="font-medium">{row.nameVi}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {siInsuranceTypeSourceLabel(row.source)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {[
                      row.isStatutory ? 'luật' : null,
                      row.eligibleForRateCfg !== false ? 'tỷ lệ' : null,
                      row.requiresPolicy ? 'policy' : null,
                    ]
                      .filter(Boolean)
                      .join(' · ') || '—'}
                  </TableCell>
                  <TableCell>
                    <SettingsCatalogRowActions
                      editTestId={`hdsd-si-insurance-type-edit-${row.insuranceTypeKey}`}
                      retireTestId={`hdsd-si-insurance-type-retire-${row.insuranceTypeKey}`}
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
          data-testid="settings-si-insurance-types-dialog"
        >
          <DialogHeader>
            <DialogTitle>{editingId ? 'Sửa loại bảo hiểm' : 'Thêm loại bảo hiểm'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="si-ins-key">Mã loại BH *</Label>
                <Input
                  id="si-ins-key"
                  data-testid="hdsd-si-insurance-type-key"
                  className="font-mono text-sm"
                  placeholder="hr_custom_si_09"
                  value={form.insuranceTypeKey}
                  disabled={Boolean(editingId)}
                  onChange={(e) => setForm((f) => ({ ...f, insuranceTypeKey: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="si-ins-name">Nhãn tiếng Việt *</Label>
                <Input
                  id="si-ins-name"
                  data-testid="hdsd-si-insurance-type-name"
                  value={form.nameVi}
                  onChange={(e) => setForm((f) => ({ ...f, nameVi: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1 max-w-[8rem]">
              <Label htmlFor="si-ins-sort">Thứ tự</Label>
              <Input
                id="si-ins-sort"
                data-testid="hdsd-si-insurance-type-sort"
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
                  checked={form.isStatutory}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, isStatutory: v }))}
                />
                Bắt buộc theo luật
              </label>
              <label className="inline-flex items-center gap-2">
                <Switch
                  checked={form.eligibleForRateCfg}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, eligibleForRateCfg: v }))}
                />
                Dùng cho cấu hình tỷ lệ
              </label>
              <label className="inline-flex items-center gap-2">
                <Switch
                  checked={form.requiresPolicy}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, requiresPolicy: v }))}
                />
                Yêu cầu chính sách BH
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
              data-testid="hdsd-si-insurance-type-save"
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

