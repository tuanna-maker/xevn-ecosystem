/**
 * @CODE-MEMORY
 * Screen:     /settings — tab Loại tăng ca ATT · Attendance → CFG loại OT
 * UC:         AC-PLT-ATT-OT-01* · BR-PLT-04/05 · R-PLT-ATT-FE-ADMIN-01 (sponsor unlock)
 * BR:         soft-delete retire · DYNAMIC-LOCK open catalog · U65 zero-seed
 * SRS:        docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-FE-ADMIN-NOTES-SA-01.md §5.2
 * API_DESIGN: F-ATT-CAT-OT-01/02 · GET/PUT /attendance/ot-types · retire
 * Purpose:    Settings CRUD catalog loại tăng ca Nest — tạo mã N+ → F5 list → retire ẩn picker.
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-OT-FE-ADMIN-BUILD-FE-01
 * Coded:      2026-08-09
 * Callers:    pages/Settings.tsx · pages/Attendance.tsx ot-types
 * Callees:    hrmApi ot-types · attOtTypeAdminCatalog · invalidate effective
 * FEActions:  | Thao tác | Handler | API |
 *             | Tải danh sách | loadRows | GET /attendance/ot-types |
 *             | Lưu / upsert | onSave | PUT /attendance/ot-types |
 *             | Ngừng | onRetire | POST …/retire |
 * must_keep:  Nest KEY paths only · defaultCoeff ≠ payroll formula · consumer EFF CLOSED · LVRULE HOLD
 * SOLID:      Panel Settings mutate; OvertimeRequestTab bind effective (hook riêng)
 * solid_convention_ack: bind nameVi/code/defaultCoeff từ BE — không FE invent weekday|weekend|holiday SoT
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-att-code-ot-fe-admin-build-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-10 PO-HRM-SETTINGS-W3-CAT-A-FE-01
 * change_mode: UPGRADE
 * What: List + search client + pagination + dialog; SettingsCatalogScreenShell compact
 * Why: Sponsor W3 — đồng bộ UX Loại phép; không form inline trên list
 * must_keep: hdsd-att-ot-type-* testids dialog · F-ATT-CAT-OT API · honesty · không đè density W1
 *
 * @CODE-MEMORY-CHANGE 2026-08-10 PO-HRM-SETTINGS-W3-MUTATE-FIX-FE-01
 * change_mode: UPGRADE
 * What: F5 post-mutate — loadRows + catalogPageForKey + invalidate EFF; focus/page sync hooks
 * Why: SA Option A W3 mutate residual — FE-after-2xx row visible pre-F5
 * must_keep: ATTLVTSOTQC1 OUT OF SCOPE · Nest KEY only · honesty false
 *
 * @CODE-MEMORY-CHANGE 2026-08-13 PO-HRM-SETTINGS-IA-COPY-WAVE2-FE-01
 * change_mode: FIX
 * What: Dọn copy jargon nội bộ — toast lỗi mã không hợp lệ bỏ mã "HRM-PLT-CAT-CODE-INVALID — "; empty-state bỏ đuôi "(U65, không seed)"; toast lỗi hệ số mặc định đổi "defaultCoeff ..." sang tên trường tiếng Việt "Hệ số mặc định ...".
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
  listAttOtTypes,
  retireAttOtType,
  upsertAttOtType,
  type HrmAttOtTypeRecord,
} from '@/integrations/hrmApi';
import { ATT_OT_TYPES_EFFECTIVE_QUERY_KEY } from '@/hooks/useAttOtTypesEffective';
import { toErrorMessage } from '@/lib/apiError';
import {
  ATT_OT_TYPE_ADMIN_UAT_HONESTY,
  attOtTypeSourceLabel,
  formatAttOtTypeDisplay,
  isValidAttOtTypeKeyFormat,
  normalizeAttOtTypeKey,
  parseAttOtTypeDefaultCoeff,
} from '@/lib/attOtTypeAdminCatalog';
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
  defaultCoeff: string;
  sortOrder: string;
  color: string;
  status: string;
};

const emptyForm = (): FormState => ({
  code: '',
  nameVi: '',
  nameEn: '',
  defaultCoeff: '1.5',
  sortOrder: '100',
  color: '',
  status: 'active',
});

const SETTINGS_TAB_ATT_OT_TYPES = 'att-ot-types';

export function AttOtTypeSettingsPanel() {
  const { currentCompanyId } = useAuth();
  const { listCompanyId } = useHrmOperatingUnitFilter();
  const companyId = listCompanyId || currentCompanyId;
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const bootstrapFocusQueryRef = useRef(
    resolveSettingsCatalogInitialSearchQuery(
      SETTINGS_TAB_ATT_OT_TYPES,
      searchParams.get('focus'),
    ),
  );

  const [items, setItems] = useState<HrmAttOtTypeRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [q, setQ] = useState(() => bootstrapFocusQueryRef.current);
  const [page, setPage] = useState(1);

  const rowKeyOf = useCallback((r: HrmAttOtTypeRecord) => r.code, []);
  const { rememberFocusForReload } = useSettingsCatalogFocusPage(
    SETTINGS_TAB_ATT_OT_TYPES,
    items,
    loading,
    rowKeyOf,
    setPage,
    setQ,
  );

  const loadRows = useCallback(async (): Promise<HrmAttOtTypeRecord[]> => {
    if (!companyId) return [];
    setLoading(true);
    setError(null);
    try {
      const res = await listAttOtTypes({
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
      setError(toErrorMessage(err, 'Không tải được danh sách loại tăng ca.'));
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
    void queryClient.invalidateQueries({ queryKey: [ATT_OT_TYPES_EFFECTIVE_QUERY_KEY] });
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (row: HrmAttOtTypeRecord) => {
    setEditingId(row.id);
    setForm({
      code: row.code,
      nameVi: row.nameVi,
      nameEn: row.nameEn ?? '',
      defaultCoeff: String(row.defaultCoeff ?? row.defaultCoefficient ?? 1.5),
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
    const code = normalizeAttOtTypeKey(form.code);
    const nameVi = form.nameVi.trim();
    if (!isValidAttOtTypeKeyFormat(code)) {
      toast({
        title: 'Mã loại tăng ca không hợp lệ',
        description:
          'Định dạng a-z đầu + a-z0-9_ (vd. night_shift_ot).',
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
    const defaultCoeff = parseAttOtTypeDefaultCoeff(form.defaultCoeff);
    if (defaultCoeff == null) {
      toast({
        title: 'Hệ số mặc định không hợp lệ',
        description: 'Hệ số mặc định phải ≥ 0 (chỉ hiển thị — không dùng làm công thức lương).',
        variant: 'destructive',
      });
      return;
    }
    const sortParsed = Number.parseInt(form.sortOrder, 10);
    const sortOrder = Number.isFinite(sortParsed) && sortParsed >= 0 ? sortParsed : 100;

    setSaving(true);
    try {
      const saved = await upsertAttOtType({
        companyId,
        code,
        nameVi,
        nameEn: form.nameEn.trim() || null,
        defaultCoeff,
        sortOrder,
        color: form.color.trim() || null,
        status: form.status || 'active',
      });
      toast({
        title: editingId ? 'Đã cập nhật loại tăng ca' : 'Đã tạo loại tăng ca',
        description: formatAttOtTypeDisplay(saved.code, saved.nameVi),
      });
      closeDialog();
      rememberFocusForReload(saved.code);
      setQ('');
      const fresh = await loadRows();
      setPage(catalogPageForKey(fresh, saved.code, (r) => r.code));
      invalidateConsumers();
    } catch (err) {
      toast({
        title: 'Lưu loại tăng ca thất bại',
        description: toErrorMessage(err, 'Không lưu được loại tăng ca.'),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const onRetire = async (row: HrmAttOtTypeRecord) => {
    if (!companyId) return;
    const ok = window.confirm(
      `Ngừng loại tăng ca «${formatAttOtTypeDisplay(row.code, row.nameVi)}»? (soft-delete — đơn OT lịch sử vẫn giữ mã)`,
    );
    if (!ok) return;
    try {
      await retireAttOtType(row.id, companyId);
      toast({ title: 'Đã ngừng loại tăng ca', description: row.nameVi });
      if (editingId === row.id) closeDialog();
      await loadRows();
      invalidateConsumers();
      setPage(1);
    } catch (err) {
      toast({
        title: 'Ngừng loại tăng ca thất bại',
        description: toErrorMessage(err, 'Không ngừng được loại tăng ca.'),
        variant: 'destructive',
      });
    }
  };

  const honestySlot = !ATT_OT_TYPE_ADMIN_UAT_HONESTY? null /* honesty-slot: no-op banner */ : null;

  return (
    <>
      <SettingsCatalogScreenShell
        compact
        title="Loại tăng ca (ATT OT catalog)"
        description="Catalog mở theo đơn vị — tìm mã hoặc nhãn; thêm/sửa qua hộp thoại; hệ số mặc định display-ready (≠ lương)."
        testId="settings-att-ot-types"
        searchValue={q}
        onSearchChange={setQ}
        searchPlaceholder="Tìm theo mã hoặc tên…"
        onRefresh={() => void loadRows()}
        refreshing={loading}
        onAdd={openCreate}
        addLabel="Thêm loại tăng ca"
        honestySlot={honestySlot}
        footerSlot={
          <SettingsCatalogPagination
            page={paginated.page}
            totalPages={paginated.totalPages}
            total={paginated.total}
            pageSize={paginated.pageSize}
            onPageChange={setPage}
            testId="settings-att-ot-types-pagination"
          />
        }
      >
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        <Table data-testid="settings-att-ot-types-table" className="min-w-[560px]">
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[120px]">Mã</TableHead>
              <TableHead className="min-w-[160px]">Tên</TableHead>
              <TableHead>Hệ số</TableHead>
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
                    ? 'Chưa có loại tăng ca — bấm «Thêm loại tăng ca».'
                    : 'Không có dòng khớp tìm kiếm.'}
                </TableCell>
              </TableRow>
            ) : (
              paginated.slice.map((row) => (
                <TableRow key={row.id} data-testid={`settings-att-ot-type-row-${row.code}`}>
                  <TableCell className="font-mono text-xs">{row.code}</TableCell>
                  <TableCell className="font-medium">{row.nameVi}</TableCell>
                  <TableCell className="font-mono text-sm">
                    {row.defaultCoeff ?? row.defaultCoefficient ?? '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {attOtTypeSourceLabel(row.source ?? 'att_native')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <SettingsCatalogRowActions
                      editTestId={`hdsd-att-ot-type-edit-${row.code}`}
                      retireTestId={`hdsd-att-ot-type-retire-${row.code}`}
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
          data-testid="settings-att-ot-types-dialog"
        >
          <DialogHeader>
            <DialogTitle>{editingId ? 'Sửa loại tăng ca' : 'Thêm loại tăng ca'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="att-ot-key">Mã loại OT *</Label>
                <Input
                  id="att-ot-key"
                  data-testid="hdsd-att-ot-type-key"
                  className="font-mono text-sm"
                  placeholder="night_shift_ot"
                  value={form.code}
                  disabled={Boolean(editingId)}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="att-ot-name">Nhãn tiếng Việt *</Label>
                <Input
                  id="att-ot-name"
                  data-testid="hdsd-att-ot-type-name"
                  placeholder="OT ca đêm"
                  value={form.nameVi}
                  onChange={(e) => setForm((f) => ({ ...f, nameVi: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1">
                <Label htmlFor="att-ot-coeff">Hệ số mặc định</Label>
                <Input
                  id="att-ot-coeff"
                  data-testid="hdsd-att-ot-type-coeff"
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9.]*"
                  value={form.defaultCoeff}
                  onChange={(e) => setForm((f) => ({ ...f, defaultCoeff: e.target.value.replace(/[^0-9.]/g, '') }))}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="att-ot-sort">Thứ tự</Label>
                <Input
                  id="att-ot-sort"
                  data-testid="hdsd-att-ot-type-sort"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={form.sortOrder}
                  onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value.replace(/\D/g, '') }))}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="att-ot-name-en">Nhãn EN (tuỳ chọn)</Label>
                <Input
                  id="att-ot-name-en"
                  data-testid="hdsd-att-ot-type-name-en"
                  placeholder="Night shift OT"
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
              data-testid="hdsd-att-ot-type-save"
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
