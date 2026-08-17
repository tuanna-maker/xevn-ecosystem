/**
 * @CODE-MEMORY
 * Screen:     /settings — tab Mã chấm công ATT · Attendance → CFG mã chấm công
 * UC:         AC-PLT-ATT-CODE-01* · BR-PLT-04/05 · R-PLT-ATT-FE-ADMIN-01 (sponsor unlock)
 * BR:         soft-delete retire · DYNAMIC-LOCK open catalog · U65 zero-seed
 * SRS:        docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-FE-ADMIN-NOTES-SA-01.md §5.2
 * API_DESIGN: F-ATT-CAT-CODE-01/02 · GET/PUT /attendance/attendance-codes · retire
 * Purpose:    Settings CRUD catalog mã chấm công Nest — tạo mã N+ → F5 list → retire ẩn picker.
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-OT-FE-ADMIN-BUILD-FE-01
 * Coded:      2026-08-09
 * Callers:    pages/Settings.tsx · pages/Attendance.tsx attendance-codes
 * Callees:    hrmApi attendance-codes · attAttendanceCodeAdminCatalog · invalidate effective
 * FEActions:  | Thao tác | Handler | API |
 *             | Tải danh sách | loadRows | GET /attendance/attendance-codes |
 *             | Lưu / upsert | onSave | PUT /attendance/attendance-codes |
 *             | Ngừng | onRetire | POST …/retire |
 * must_keep:  Nest KEY paths only · no dual-write · consumer EFF CLOSED · LVRULE HOLD · honesty false
 * SOLID:      Panel Settings mutate; AttendanceRecordsTable bind effective (hook riêng)
 * solid_convention_ack: bind nameVi/code/symbol từ BE — không FE invent closed-4 SoT
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-att-code-ot-fe-admin-build-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-10 PO-HRM-SETTINGS-W3-CAT-A-FE-01
 * change_mode: UPGRADE
 * What: List + search client + pagination + dialog; SettingsCatalogScreenShell compact; Select trong dialog
 * Why: Sponsor W3 — đồng bộ UX Loại phép; không form inline trên list
 * must_keep: hdsd-att-attendance-code-* testids dialog · F-ATT-CAT-CODE API · honesty · không đè density W1
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
  listAttAttendanceCodes,
  retireAttAttendanceCode,
  upsertAttAttendanceCode,
  type HrmAttAttendanceCodeRecord,
} from '@/integrations/hrmApi';
import { ATT_ATTENDANCE_CODES_EFFECTIVE_QUERY_KEY } from '@/hooks/useAttAttendanceCodesEffective';
import { toErrorMessage } from '@/lib/apiError';
import {
  ATT_ATTENDANCE_CODE_ADMIN_UAT_HONESTY,
  ATT_ATTENDANCE_CODE_COUNTS_AS,
  attAttendanceCodeCountsAsLabel,
  attAttendanceCodeSourceLabel,
  formatAttAttendanceCodeDisplay,
  isValidAttAttendanceCodeKeyFormat,
  normalizeAttAttendanceCodeKey,
  parseAttAttendanceCodeDayWeight,
  parseAttAttendanceCodeLegacyAliases,
} from '@/lib/attAttendanceCodeAdminCatalog';
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
import { SettingsDialogSelectContent } from '@/components/settings/SettingsDialogSelectContent';
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
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  code: string;
  nameVi: string;
  symbol: string;
  sortOrder: string;
  countsAs: string;
  dayWeight: string;
  isPaid: boolean;
  isPresent: boolean;
  color: string;
  legacyAliases: string;
  status: string;
};

const emptyForm = (): FormState => ({
  code: '',
  nameVi: '',
  symbol: '',
  sortOrder: '100',
  countsAs: 'work',
  dayWeight: '1',
  isPaid: true,
  isPresent: true,
  color: '',
  legacyAliases: '',
  status: 'active',
});

const SETTINGS_TAB_ATT_ATTENDANCE_CODES = 'att-attendance-codes';

export function AttAttendanceCodeSettingsPanel() {
  const { currentCompanyId } = useAuth();
  const { listCompanyId } = useHrmOperatingUnitFilter();
  const companyId = listCompanyId || currentCompanyId;
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const bootstrapFocusQueryRef = useRef(
    resolveSettingsCatalogInitialSearchQuery(
      SETTINGS_TAB_ATT_ATTENDANCE_CODES,
      searchParams.get('focus'),
    ),
  );

  const [items, setItems] = useState<HrmAttAttendanceCodeRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [q, setQ] = useState(() => bootstrapFocusQueryRef.current);
  const [page, setPage] = useState(1);

  const rowKeyOf = useCallback((r: HrmAttAttendanceCodeRecord) => r.code, []);
  const { rememberFocusForReload } = useSettingsCatalogFocusPage(
    SETTINGS_TAB_ATT_ATTENDANCE_CODES,
    items,
    loading,
    rowKeyOf,
    setPage,
    setQ,
  );

  const loadRows = useCallback(async (): Promise<HrmAttAttendanceCodeRecord[]> => {
    if (!companyId) return [];
    setLoading(true);
    setError(null);
    try {
      const res = await listAttAttendanceCodes({
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
      setError(toErrorMessage(err, 'Không tải được danh sách mã chấm công.'));
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
        (r) => `${r.nameVi} ${r.symbol ?? ''}`,
      ),
    [items, q],
  );

  const paginated = useMemo(
    () => paginateCatalogRows(filtered, page, SETTINGS_CATALOG_PAGE_SIZE),
    [filtered, page],
  );

  const invalidateConsumers = () => {
    void queryClient.invalidateQueries({ queryKey: [ATT_ATTENDANCE_CODES_EFFECTIVE_QUERY_KEY] });
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (row: HrmAttAttendanceCodeRecord) => {
    setEditingId(row.id);
    setForm({
      code: row.code,
      nameVi: row.nameVi,
      symbol: row.symbol || '',
      sortOrder: String(row.sortOrder ?? 100),
      countsAs: row.countsAs || 'work',
      dayWeight: String(row.dayWeight ?? 1),
      isPaid: row.isPaid !== false,
      isPresent: row.isPresent !== false,
      color: row.color ?? '',
      legacyAliases: (row.legacyAliasKeys ?? []).join(', '),
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
    const code = normalizeAttAttendanceCodeKey(form.code);
    const nameVi = form.nameVi.trim();
    let symbol = form.symbol.trim();
    if (!symbol) {
      symbol = code.slice(0, 16) || nameVi.slice(0, 1) || '·';
    }
    if (!isValidAttAttendanceCodeKeyFormat(code)) {
      toast({
        title: 'Mã chấm công không hợp lệ',
        description:
          'Định dạng a-z đầu + a-z0-9_ (vd. wfh_half).',
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
    const dayWeight = parseAttAttendanceCodeDayWeight(form.dayWeight);
    if (dayWeight == null) {
      toast({
        title: 'Trọng số ngày không hợp lệ',
        description: 'dayWeight phải trong khoảng (0, 1] (vd. 1 hoặc 0.5).',
        variant: 'destructive',
      });
      return;
    }
    const sortParsed = Number.parseInt(form.sortOrder, 10);
    const sortOrder = Number.isFinite(sortParsed) && sortParsed >= 0 ? sortParsed : 100;

    setSaving(true);
    try {
      const saved = await upsertAttAttendanceCode({
        companyId,
        code,
        nameVi,
        symbol,
        sortOrder,
        countsAs: form.countsAs,
        dayWeight,
        isPaid: form.isPaid,
        isPresent: form.isPresent,
        color: form.color.trim() || null,
        legacyAliasKeys: parseAttAttendanceCodeLegacyAliases(form.legacyAliases),
        status: form.status || 'active',
      });
      toast({
        title: editingId ? 'Đã cập nhật mã chấm công' : 'Đã tạo mã chấm công',
        description: formatAttAttendanceCodeDisplay(saved.code, saved.nameVi, saved.symbol),
      });
      closeDialog();
      rememberFocusForReload(saved.code);
      setQ('');
      const fresh = await loadRows();
      setPage(catalogPageForKey(fresh, saved.code, (r) => r.code));
      invalidateConsumers();
    } catch (err) {
      toast({
        title: 'Lưu mã chấm công thất bại',
        description: toErrorMessage(err, 'Không lưu được mã chấm công.'),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const onRetire = async (row: HrmAttAttendanceCodeRecord) => {
    if (!companyId) return;
    const ok = window.confirm(
      `Ngừng mã chấm công «${formatAttAttendanceCodeDisplay(row.code, row.nameVi, row.symbol)}»? (soft-delete — bản ghi lịch sử vẫn giữ mã)`,
    );
    if (!ok) return;
    try {
      await retireAttAttendanceCode(row.id, companyId);
      toast({ title: 'Đã ngừng mã chấm công', description: row.nameVi });
      if (editingId === row.id) closeDialog();
      await loadRows();
      invalidateConsumers();
    } catch (err) {
      toast({
        title: 'Ngừng mã chấm công thất bại',
        description: toErrorMessage(err, 'Không ngừng được mã chấm công.'),
        variant: 'destructive',
      });
    }
  };

  const honestySlot = !ATT_ATTENDANCE_CODE_ADMIN_UAT_HONESTY? null /* honesty-slot: no-op banner */ : null;

  return (
    <>
      <SettingsCatalogScreenShell
        compact
        title="Mã chấm công (ATT catalog)"
        description="Catalog mở theo đơn vị — tìm mã hoặc nhãn; thêm/sửa qua hộp thoại; F5 sau lưu."
        testId="settings-att-attendance-codes"
        searchValue={q}
        onSearchChange={setQ}
        searchPlaceholder="Tìm theo mã hoặc tên…"
        onRefresh={() => void loadRows()}
        refreshing={loading}
        onAdd={openCreate}
        addLabel="Thêm mã chấm công"
        honestySlot={honestySlot}
        footerSlot={
          <SettingsCatalogPagination
            page={paginated.page}
            totalPages={paginated.totalPages}
            total={paginated.total}
            pageSize={paginated.pageSize}
            onPageChange={setPage}
            testId="settings-att-attendance-codes-pagination"
          />
        }
      >
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        <Table data-testid="settings-att-attendance-codes-table" className="min-w-[640px]">
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[120px]">Mã</TableHead>
              <TableHead className="min-w-[160px]">Tên / ký hiệu</TableHead>
              <TableHead>Nhóm</TableHead>
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
                    ? 'Chưa có mã chấm công — bấm «Thêm mã chấm công».'
                    : 'Không có dòng khớp tìm kiếm.'}
                </TableCell>
              </TableRow>
            ) : (
              paginated.slice.map((row) => (
                <TableRow
                  key={row.id}
                  data-testid={settingsCatalogRowTestId(row.code)}
                >
                  <TableCell className="font-mono text-xs">{row.code}</TableCell>
                  <TableCell>
                    <div className="font-medium">{row.nameVi}</div>
                    {row.symbol ? (
                      <div className="text-xs text-muted-foreground">Ký hiệu: {row.symbol}</div>
                    ) : null}
                  </TableCell>
                  <TableCell>{attAttendanceCodeCountsAsLabel(row.countsAs)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {attAttendanceCodeSourceLabel(row.source ?? 'att_native')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <SettingsCatalogRowActions
                      editTestId={`hdsd-att-attendance-code-edit-${row.code}`}
                      retireTestId={`hdsd-att-attendance-code-retire-${row.code}`}
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
          data-testid="settings-att-attendance-codes-dialog"
        >
          <DialogHeader>
            <DialogTitle>{editingId ? 'Sửa mã chấm công' : 'Thêm mã chấm công'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="att-code-key">Mã *</Label>
                <Input
                  id="att-code-key"
                  data-testid="hdsd-att-attendance-code-key"
                  className="font-mono text-sm"
                  placeholder="wfh_half"
                  value={form.code}
                  disabled={Boolean(editingId)}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="att-code-name">Nhãn tiếng Việt *</Label>
                <Input
                  id="att-code-name"
                  data-testid="hdsd-att-attendance-code-name"
                  placeholder="Làm nhà nửa ngày"
                  value={form.nameVi}
                  onChange={(e) => setForm((f) => ({ ...f, nameVi: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="att-code-symbol">Ký hiệu *</Label>
                <Input
                  id="att-code-symbol"
                  data-testid="hdsd-att-attendance-code-symbol"
                  placeholder="W½"
                  value={form.symbol}
                  onChange={(e) => setForm((f) => ({ ...f, symbol: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label>Nhóm công</Label>
                <Select
                  value={form.countsAs}
                  onValueChange={(v) => setForm((f) => ({ ...f, countsAs: v }))}
                >
                  <SelectTrigger data-testid="hdsd-att-attendance-code-counts-as" className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SettingsDialogSelectContent>
                    {ATT_ATTENDANCE_CODE_COUNTS_AS.map((c) => (
                      <SelectItem key={c} value={c}>
                        {attAttendanceCodeCountsAsLabel(c)}
                      </SelectItem>
                    ))}
                  </SettingsDialogSelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1">
                <Label htmlFor="att-code-weight">Trọng số</Label>
                <Input
                  id="att-code-weight"
                  data-testid="hdsd-att-attendance-code-day-weight"
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9.]*"
                  value={form.dayWeight}
                  onChange={(e) => setForm((f) => ({ ...f, dayWeight: e.target.value.replace(/[^0-9.]/g, '') }))}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="att-code-sort">Thứ tự</Label>
                <Input
                  id="att-code-sort"
                  data-testid="hdsd-att-attendance-code-sort"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={form.sortOrder}
                  onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value.replace(/\D/g, '') }))}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="att-code-aliases">Alias legacy</Label>
                <Input
                  id="att-code-aliases"
                  data-testid="hdsd-att-attendance-code-aliases"
                  className="font-mono text-sm"
                  placeholder="on_leave, early_leave"
                  value={form.legacyAliases}
                  onChange={(e) => setForm((f) => ({ ...f, legacyAliases: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
              <label className="inline-flex items-center gap-2">
                <Switch
                  checked={form.isPaid}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, isPaid: v }))}
                />
                Có lương
              </label>
              <label className="inline-flex items-center gap-2">
                <Switch
                  checked={form.isPresent}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, isPresent: v }))}
                />
                Tính có mặt
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
              data-testid="hdsd-att-attendance-code-save"
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
