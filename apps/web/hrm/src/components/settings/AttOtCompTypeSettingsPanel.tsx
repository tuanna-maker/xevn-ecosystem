/**
 * @CODE-MEMORY
 * Screen:     /settings — tab Loại chi trả OT ATT · Attendance → CFG loại chi trả
 * UC:         AC-PLT-ATT-COMP-01* · BR-PLT-04/05 · R-PLT-ATT-FE-ADMIN-01 (sponsor unlock)
 * BR:         soft-delete retire · DYNAMIC-LOCK open catalog · U65 zero-seed
 * SRS:        docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-FE-ADMIN-NOTES-SA-01.md §5.2
 * API_DESIGN: F-ATT-CAT-OTC-01/02 · GET/PUT /attendance/ot-comp-types · retire
 * Purpose:    Settings CRUD catalog loại chi trả OT Nest — tạo mã N+ → F5 list → retire ẩn picker.
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-OT-FE-ADMIN-BUILD-FE-01
 * Coded:      2026-08-09
 * Callers:    pages/Settings.tsx · pages/Attendance.tsx ot-comp-types
 * Callees:    hrmApi ot-comp-types · attOtCompTypeAdminCatalog · invalidate effective
 * FEActions:  | Thao tác | Handler | API |
 *             | Tải danh sách | loadRows | GET /attendance/ot-comp-types |
 *             | Lưu / upsert | onSave | PUT /attendance/ot-comp-types |
 *             | Ngừng | onRetire | POST …/retire |
 * must_keep:  Nest KEY paths only · orthogonal ≠ OT-TYPE · consumer EFF CLOSED · LVRULE HOLD · honesty false
 * SOLID:      Panel Settings mutate; OvertimeRequestTab bind effective (hook riêng)
 * solid_convention_ack: bind nameVi/code từ BE — không FE invent salary|compensatory_leave SoT
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-att-code-ot-fe-admin-build-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-10 PO-HRM-SETTINGS-W3-CAT-A-FE-01
 * change_mode: UPGRADE
 * What: List + search client + pagination + dialog; SettingsCatalogScreenShell compact
 * Why: Sponsor W3 — đồng bộ UX Loại phép; không form inline trên list
 * must_keep: hdsd-att-ot-comp-type-* testids dialog · F-ATT-CAT-OTC API · honesty · không đè density W1
 *
 * @CODE-MEMORY-CHANGE 2026-08-10 PO-HRM-SETTINGS-W3-MUTATE-FIX-FE-01
 * change_mode: UPGRADE
 * What: F5 post-mutate — loadRows + catalogPageForKey + invalidate EFF; focus/page sync hooks
 * Why: SA Option A W3 mutate residual — FE-after-2xx row visible pre-F5
 * must_keep: ATTLVTSOTQC1 OUT OF SCOPE · Nest KEY only · honesty false
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
  listAttOtCompTypes,
  retireAttOtCompType,
  upsertAttOtCompType,
  type HrmAttOtCompTypeRecord,
} from '@/integrations/hrmApi';
import { ATT_OT_COMP_TYPES_EFFECTIVE_QUERY_KEY } from '@/hooks/useAttOtCompTypesEffective';
import { toErrorMessage } from '@/lib/apiError';
import {
  ATT_OT_COMP_TYPE_ADMIN_UAT_HONESTY,
  attOtCompTypeSourceLabel,
  formatAttOtCompTypeDisplay,
  isValidAttOtCompTypeKeyFormat,
  normalizeAttOtCompTypeKey,
} from '@/lib/attOtCompTypeAdminCatalog';
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
import { toast } from '@/hooks/use-toast';

type FormState = {
  code: string;
  nameVi: string;
  nameEn: string;
  sortOrder: string;
  color: string;
  status: string;
};

const emptyForm = (): FormState => ({
  code: '',
  nameVi: '',
  nameEn: '',
  sortOrder: '100',
  color: '',
  status: 'active',
});

const SETTINGS_TAB_ATT_OT_COMP_TYPES = 'att-ot-comp-types';

export function AttOtCompTypeSettingsPanel() {
  const { currentCompanyId } = useAuth();
  const { listCompanyId } = useHrmOperatingUnitFilter();
  const companyId = listCompanyId || currentCompanyId;
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const bootstrapFocusQueryRef = useRef(
    resolveSettingsCatalogInitialSearchQuery(
      SETTINGS_TAB_ATT_OT_COMP_TYPES,
      searchParams.get('focus'),
    ),
  );

  const [items, setItems] = useState<HrmAttOtCompTypeRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [q, setQ] = useState(() => bootstrapFocusQueryRef.current);
  const [page, setPage] = useState(1);

  const rowKeyOf = useCallback((r: HrmAttOtCompTypeRecord) => r.code, []);
  const { rememberFocusForReload } = useSettingsCatalogFocusPage(
    SETTINGS_TAB_ATT_OT_COMP_TYPES,
    items,
    loading,
    rowKeyOf,
    setPage,
    setQ,
  );

  const loadRows = useCallback(async (): Promise<HrmAttOtCompTypeRecord[]> => {
    if (!companyId) return [];
    setLoading(true);
    setError(null);
    try {
      const res = await listAttOtCompTypes({
        company_id: companyId,
        status: 'active',
      });
      const sorted = sortSettingsCatalogByOrderThenKey(
        res.items,
        (r) => r.sortOrder,
        (r) => r.code,
      );
      setItems(sorted);
      return sorted;
    } catch (err) {
      setError(toErrorMessage(err, 'Không tải được danh sách loại chi trả OT.'));
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
        (r) => r.nameVi,
      ),
    [items, q],
  );

  const paginated = useMemo(
    () => paginateCatalogRows(filtered, page, SETTINGS_CATALOG_PAGE_SIZE),
    [filtered, page],
  );

  const invalidateConsumers = () => {
    void queryClient.invalidateQueries({ queryKey: [ATT_OT_COMP_TYPES_EFFECTIVE_QUERY_KEY] });
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (row: HrmAttOtCompTypeRecord) => {
    setEditingId(row.id);
    setForm({
      code: row.code,
      nameVi: row.nameVi,
      nameEn: row.nameEn ?? '',
      sortOrder: String(row.sortOrder ?? 100),
      color: row.color ?? '',
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
    const code = normalizeAttOtCompTypeKey(form.code);
    const nameVi = form.nameVi.trim();
    if (!isValidAttOtCompTypeKeyFormat(code)) {
      toast({
        title: 'Mã loại chi trả OT không hợp lệ',
        description:
          'Định dạng a-z đầu + a-z0-9_ (vd. cash_plus_leave).',
        variant: 'destructive',
      });
      return;
    }
    if (!nameVi) {
      toast({
        title: 'Thiếu nhãn tiếng Việt',
        description: 'Bắt buộc nameVi (display-ready) — không chỉ hiện raw key.',
        variant: 'destructive',
      });
      return;
    }
    const sortParsed = Number.parseInt(form.sortOrder, 10);
    const sortOrder = Number.isFinite(sortParsed) && sortParsed >= 0 ? sortParsed : 100;

    setSaving(true);
    try {
      const saved = await upsertAttOtCompType({
        companyId,
        code,
        nameVi,
        nameEn: form.nameEn.trim() || null,
        sortOrder,
        color: form.color.trim() || null,
        status: form.status || 'active',
      });
      toast({
        title: editingId ? 'Đã cập nhật loại chi trả OT' : 'Đã tạo loại chi trả OT',
        description: formatAttOtCompTypeDisplay(saved.code, saved.nameVi),
      });
      closeDialog();
      rememberFocusForReload(saved.code);
      setQ('');
      const fresh = await loadRows();
      setPage(catalogPageForKey(fresh, saved.code, (r) => r.code));
      invalidateConsumers();
    } catch (err) {
      toast({
        title: 'Lưu loại chi trả OT thất bại',
        description: toErrorMessage(err, 'Không lưu được loại chi trả OT.'),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const onRetire = async (row: HrmAttOtCompTypeRecord) => {
    if (!companyId) return;
    const ok = window.confirm(
      `Ngừng loại chi trả OT «${formatAttOtCompTypeDisplay(row.code, row.nameVi)}»? (soft-delete — đơn OT lịch sử vẫn giữ mã)`,
    );
    if (!ok) return;
    try {
      await retireAttOtCompType(row.id, companyId);
      toast({ title: 'Đã ngừng loại chi trả OT', description: row.nameVi });
      if (editingId === row.id) closeDialog();
      await loadRows();
      invalidateConsumers();
    } catch (err) {
      toast({
        title: 'Ngừng loại chi trả OT thất bại',
        description: toErrorMessage(err, 'Không ngừng được loại chi trả OT.'),
        variant: 'destructive',
      });
    }
  };

  const honestySlot = !ATT_OT_COMP_TYPE_ADMIN_UAT_HONESTY? null /* honesty-slot: no-op banner */ : null;

  return (
    <>
      <SettingsCatalogScreenShell
        compact
        title="Loại chi trả OT (ATT OTC catalog)"
        description="Catalog mở theo đơn vị — tìm mã hoặc nhãn; thêm/sửa qua hộp thoại; orthogonal với loại OT."
        testId="settings-att-ot-comp-types"
        searchValue={q}
        onSearchChange={setQ}
        searchPlaceholder="Tìm theo mã hoặc tên…"
        onRefresh={() => void loadRows()}
        refreshing={loading}
        onAdd={openCreate}
        addLabel="Thêm loại chi trả OT"
        honestySlot={honestySlot}
        footerSlot={
          <SettingsCatalogPagination
            page={paginated.page}
            totalPages={paginated.totalPages}
            total={paginated.total}
            pageSize={paginated.pageSize}
            onPageChange={setPage}
            testId="settings-att-ot-comp-types-pagination"
          />
        }
      >
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        <Table data-testid="settings-att-ot-comp-types-table" className="min-w-[560px]">
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[120px]">Mã</TableHead>
              <TableHead className="min-w-[160px]">Tên</TableHead>
              <TableHead>Thứ tự</TableHead>
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
                    ? 'Chưa có loại chi trả OT — bấm «Thêm loại chi trả OT».'
                    : 'Không có dòng khớp tìm kiếm.'}
                </TableCell>
              </TableRow>
            ) : (
              paginated.slice.map((row) => (
                <TableRow
                  key={row.id}
                  data-testid={`settings-att-ot-comp-type-row-${row.code}`}
                >
                  <TableCell className="font-mono text-xs">{row.code}</TableCell>
                  <TableCell className="font-medium">{row.nameVi}</TableCell>
                  <TableCell className="font-mono text-sm">{row.sortOrder ?? '—'}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {attOtCompTypeSourceLabel(row.source ?? 'att_native')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <SettingsCatalogRowActions
                      editTestId={`hdsd-att-ot-comp-type-edit-${row.code}`}
                      retireTestId={`hdsd-att-ot-comp-type-retire-${row.code}`}
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
          className="max-h-[min(90vh,640px)] max-w-lg overflow-y-auto sm:max-w-xl"
          data-testid="settings-att-ot-comp-types-dialog"
        >
          <DialogHeader>
            <DialogTitle>{editingId ? 'Sửa loại chi trả OT' : 'Thêm loại chi trả OT'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="att-otc-key">Mã loại chi trả *</Label>
                <Input
                  id="att-otc-key"
                  data-testid="hdsd-att-ot-comp-type-key"
                  className="font-mono text-sm"
                  placeholder="cash_plus_leave"
                  value={form.code}
                  disabled={Boolean(editingId)}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="att-otc-name">Nhãn tiếng Việt *</Label>
                <Input
                  id="att-otc-name"
                  data-testid="hdsd-att-ot-comp-type-name"
                  placeholder="Tiền + nghỉ bù"
                  value={form.nameVi}
                  onChange={(e) => setForm((f) => ({ ...f, nameVi: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="att-otc-sort">Thứ tự</Label>
                <Input
                  id="att-otc-sort"
                  data-testid="hdsd-att-ot-comp-type-sort"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={form.sortOrder}
                  onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value.replace(/\D/g, '') }))}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="att-otc-name-en">Nhãn EN (tuỳ chọn)</Label>
                <Input
                  id="att-otc-name-en"
                  data-testid="hdsd-att-ot-comp-type-name-en"
                  placeholder="Cash + leave"
                  value={form.nameEn}
                  onChange={(e) => setForm((f) => ({ ...f, nameEn: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={closeDialog}>
              Hủy
            </Button>
            <Button
              type="button"
              disabled={saving || !companyId}
              data-testid="hdsd-att-ot-comp-type-save"
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
