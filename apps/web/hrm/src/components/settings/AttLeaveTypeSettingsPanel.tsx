/**
 * @CODE-MEMORY
 * Screen:     /settings — tab Loại phép ATT · Attendance → Quy tắc nghỉ phép
 * UC:         AC-PLT-ATT-01 · AC-PLT-ATT-02 · BR-PLT-04/05
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-FE-01 · PO-HRM-SETTINGS-IA-UX-REMasters-SPONSOR-01
 * Purpose:    List + search + phân trang + popup thêm/sửa (đồng bộ Điều khoản HĐ).
 * must_keep:  soft-delete · open catalog · U65 · attendance_uat_ready=false
 *
 * @CODE-MEMORY-CHANGE 2026-08-10 PO-HRM-SETTINGS-IA-UX-REMasters-W3-ATT-LVT
 * change_mode: UPGRADE
 * What: Bỏ form inline; SettingsCatalogScreenShell + Dialog; client search + pagination
 * Why: Sponsor — 100% catalog Settings cùng UX; mở rộng vùng bảng embed CC
 * must_keep: hdsd-att-leave-type-* testids · F-ATT-CAT-LVT API · ATT04/05 honesty
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
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Save } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useHrmOperatingUnitFilter } from '@/contexts/HrmOperatingUnitFilterContext';
import {
  listAttLeaveTypes,
  retireAttLeaveType,
  upsertAttLeaveType,
  type HrmAttLeaveTypeRecord,
} from '@/integrations/hrmApi';
import { ATT_LEAVE_TYPES_EFFECTIVE_QUERY_KEY } from '@/hooks/useAttLeaveTypesEffective';
import { toErrorMessage } from '@/lib/apiError';
import {
  ATT_LEAVE_TYPE_CATEGORIES,
  ATT_LEAVE_TYPE_UAT_HONESTY,
  attLeaveTypeCategoryLabel,
  attLeaveTypeSourceLabel,
  formatAttLeaveTypeDisplay,
  isValidAttLeaveTypeKeyFormat,
  normalizeAttLeaveTypeKey,
} from '@/lib/attLeaveTypeCatalog';
import { att05HonestyBannerText } from '@/lib/attLeave05Ring';
import {
  filterCatalogByCodeOrName,
  paginateCatalogRows,
  catalogPageForKey,
  SETTINGS_CATALOG_PAGE_SIZE,
} from '@/lib/settingsCatalogPagination';
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
  leaveTypeKey: string;
  nameVi: string;
  category: string;
  isPaid: boolean;
  allowsCarryOver: boolean;
  allowsAdvance: boolean;
  insuranceRegimeFlag: boolean;
  companyTopupFlag: boolean;
  countsTowardTimesheet: boolean;
  status: string;
};

const emptyForm = (): FormState => ({
  leaveTypeKey: '',
  nameVi: '',
  category: 'other',
  isPaid: true,
  allowsCarryOver: false,
  allowsAdvance: false,
  insuranceRegimeFlag: false,
  companyTopupFlag: false,
  countsTowardTimesheet: true,
  status: 'active',
});

export function AttLeaveTypeSettingsPanel() {
  const { currentCompanyId } = useAuth();
  const { listCompanyId } = useHrmOperatingUnitFilter();
  const companyId = listCompanyId || currentCompanyId;
  const queryClient = useQueryClient();

  const [items, setItems] = useState<HrmAttLeaveTypeRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);

  const loadRows = useCallback(async (): Promise<HrmAttLeaveTypeRecord[]> => {
    if (!companyId) return [];
    setLoading(true);
    setError(null);
    try {
      const res = await listAttLeaveTypes({
        company_id: companyId,
        status: 'active',
      });
      setItems(res.items);
      return res.items;
    } catch (err) {
      setError(toErrorMessage(err, 'Không tải được danh sách loại phép.'));
      setItems([]);
      return [];
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
        (r) => r.leaveTypeKey,
        (r) => r.nameVi,
      ),
    [items, q],
  );

  const paginated = useMemo(
    () => paginateCatalogRows(filtered, page, SETTINGS_CATALOG_PAGE_SIZE),
    [filtered, page],
  );

  const invalidateConsumers = () => {
    void queryClient.invalidateQueries({ queryKey: [ATT_LEAVE_TYPES_EFFECTIVE_QUERY_KEY] });
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (row: HrmAttLeaveTypeRecord) => {
    setEditingId(row.id);
    setForm({
      leaveTypeKey: row.leaveTypeKey,
      nameVi: row.nameVi,
      category: row.category || 'other',
      isPaid: row.isPaid !== false,
      allowsCarryOver: Boolean(row.allowsCarryOver),
      allowsAdvance: Boolean(row.allowsAdvance),
      insuranceRegimeFlag: Boolean(row.insuranceRegimeFlag),
      companyTopupFlag: Boolean(row.companyTopupFlag),
      countsTowardTimesheet: row.countsTowardTimesheet !== false,
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
    const leaveTypeKey = normalizeAttLeaveTypeKey(form.leaveTypeKey);
    const nameVi = form.nameVi.trim();
    if (!isValidAttLeaveTypeKeyFormat(leaveTypeKey)) {
      toast({
        title: 'Mã loại phép không hợp lệ',
        description:
          'Chữ thường a–z, số, gạch dưới; bắt đầu bằng chữ (vd. hr_custom_09). Hệ thống tự chuyển về chữ thường khi lưu.',
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

    setSaving(true);
    try {
      const saved = await upsertAttLeaveType({
        companyId,
        leaveTypeKey,
        nameVi,
        category: form.category,
        isPaid: form.isPaid,
        allowsCarryOver: form.allowsCarryOver,
        allowsAdvance: form.allowsAdvance,
        insuranceRegimeFlag: form.insuranceRegimeFlag,
        companyTopupFlag: form.companyTopupFlag,
        countsTowardTimesheet: form.countsTowardTimesheet,
        status: form.status || 'active',
      });
      toast({
        title: editingId ? 'Đã cập nhật loại phép' : 'Đã tạo loại phép',
        description: formatAttLeaveTypeDisplay(saved.leaveTypeKey, saved.nameVi),
      });
      closeDialog();
      setQ('');
      const fresh = await loadRows();
      setPage(catalogPageForKey(fresh, saved.leaveTypeKey, (r) => r.leaveTypeKey));
      invalidateConsumers();
    } catch (err) {
      toast({
        title: 'Lưu loại phép thất bại',
        description: toErrorMessage(err, 'Không lưu được loại phép.'),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const onRetire = async (row: HrmAttLeaveTypeRecord) => {
    if (!companyId) return;
    const ok = window.confirm(
      `Ngừng loại phép «${formatAttLeaveTypeDisplay(row.leaveTypeKey, row.nameVi)}»? (soft-delete)`,
    );
    if (!ok) return;
    try {
      await retireAttLeaveType(row.id, companyId);
      toast({ title: 'Đã ngừng loại phép', description: row.nameVi });
      if (editingId === row.id) closeDialog();
      await loadRows();
      invalidateConsumers();
    } catch (err) {
      toast({
        title: 'Ngừng loại phép thất bại',
        description: toErrorMessage(err, 'Không ngừng được loại phép.'),
        variant: 'destructive',
      });
    }
  };

  const honestySlot = !ATT_LEAVE_TYPE_UAT_HONESTY? null /* honesty-slot: no-op banner */ : null;

  return (
    <>
      <SettingsCatalogScreenShell
        compact
        title="Loại nghỉ phép"
        description="Danh sách loại phép theo đơn vị — thêm/sửa qua hộp thoại."
        testId="settings-att-leave-types"
        searchValue={q}
        onSearchChange={setQ}
        searchPlaceholder="Tìm theo mã hoặc tên…"
        onRefresh={() => void loadRows()}
        refreshing={loading}
        onAdd={openCreate}
        addLabel="Thêm loại phép"
        honestySlot={honestySlot}
        footerSlot={
          <SettingsCatalogPagination
            page={paginated.page}
            totalPages={paginated.totalPages}
            total={paginated.total}
            pageSize={paginated.pageSize}
            onPageChange={setPage}
            testId="settings-att-leave-types-pagination"
          />
        }
      >
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        <Table data-testid="settings-att-leave-types-table" className="min-w-[640px]">
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[140px]">Mã</TableHead>
              <TableHead className="min-w-[160px]">Tên</TableHead>
              <TableHead>Nhóm</TableHead>
              <TableHead>Mang sang</TableHead>
              <TableHead>Nguồn</TableHead>
              <TableHead className="min-w-[140px] text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-sm text-muted-foreground">
                  Đang tải…
                </TableCell>
              </TableRow>
            ) : paginated.slice.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                  {items.length === 0
                    ? 'Chưa có loại phép — bấm «Thêm loại phép».'
                    : 'Không có dòng khớp tìm kiếm.'}
                </TableCell>
              </TableRow>
            ) : (
              paginated.slice.map((row) => (
                <TableRow
                  key={row.id}
                  data-testid={`settings-att-leave-type-row-${row.leaveTypeKey}`}
                >
                  <TableCell className="font-mono text-xs">{row.leaveTypeKey}</TableCell>
                  <TableCell className="font-medium">{row.nameVi}</TableCell>
                  <TableCell>{attLeaveTypeCategoryLabel(row.category)}</TableCell>
                  <TableCell className="text-xs">
                    {row.allowsCarryOver ? 'Có' : '—'}
                    {row.category === 'carry_over' ? (
                      <Badge variant="secondary" className="ml-1 text-[10px]">
                        carry_over
                      </Badge>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {attLeaveTypeSourceLabel(row.source ?? 'att_native')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <SettingsCatalogRowActions
                      editTestId={`hdsd-att-leave-type-edit-${row.leaveTypeKey}`}
                      retireTestId={`hdsd-att-leave-type-retire-${row.leaveTypeKey}`}
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
          data-testid="settings-att-leave-types-dialog"
        >
          <DialogHeader>
            <DialogTitle>{editingId ? 'Sửa loại phép' : 'Thêm loại phép'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="att-lvt-key">Mã loại phép *</Label>
                <Input
                  id="att-lvt-key"
                  data-testid="hdsd-att-leave-type-key"
                  className="font-mono text-sm"
                  placeholder="hr_custom_09"
                  value={form.leaveTypeKey}
                  disabled={Boolean(editingId)}
                  onChange={(e) => setForm((f) => ({ ...f, leaveTypeKey: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="att-lvt-name">Nhãn tiếng Việt *</Label>
                <Input
                  id="att-lvt-name"
                  data-testid="hdsd-att-leave-type-name"
                  placeholder="Phép riêng HR"
                  value={form.nameVi}
                  onChange={(e) => setForm((f) => ({ ...f, nameVi: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Nhóm</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
              >
                <SelectTrigger data-testid="hdsd-att-leave-type-category" className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SettingsDialogSelectContent>
                  {ATT_LEAVE_TYPE_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {attLeaveTypeCategoryLabel(c)}
                    </SelectItem>
                  ))}
                </SettingsDialogSelectContent>
              </Select>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
              <label className="inline-flex items-center gap-2">
                <Switch
                  checked={form.isPaid}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, isPaid: v }))}
                />
                Có lương
              </label>
              <label
                className="inline-flex items-center gap-2"
                data-testid="hdsd-att-leave-type-allows-carry-over"
              >
                <Switch
                  checked={form.allowsCarryOver}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, allowsCarryOver: v }))}
                />
                Cho phép mang sang
              </label>
              <label
                className="inline-flex items-center gap-2"
                data-testid="hdsd-att-leave-type-allows-advance"
              >
                <Switch
                  checked={form.allowsAdvance}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, allowsAdvance: v }))}
                />
                Cho phép ứng phép
              </label>
              <label className="inline-flex items-center gap-2">
                <Switch
                  checked={form.insuranceRegimeFlag}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, insuranceRegimeFlag: v }))}
                />
                Chế độ BHXH
              </label>
              <label className="inline-flex items-center gap-2">
                <Switch
                  checked={form.countsTowardTimesheet}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, countsTowardTimesheet: v }))}
                />
                Tính vào bảng công
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
              data-testid="hdsd-att-leave-type-save"
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
