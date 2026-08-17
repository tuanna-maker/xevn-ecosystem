/**
 * @CODE-MEMORY
 * Screen:     /settings — tab Loại giấy tờ EMP · EMP CFG document-types
 * UC:         AC-PLT-EMP-02 · AC-PLT-EMP-03 · BR-PLT-04/05
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-FE-01 · PO-HRM-SETTINGS-W3-CAT-B-FE-01
 * Purpose:    List + search + phân trang + popup thêm/sửa (đồng bộ Loại phép / W3 shell).
 * must_keep:  soft-delete · open catalog · U65 · hrm_personnel_uat_ready=false · hdsd-* testids
 *
 * @CODE-MEMORY-CHANGE 2026-08-10 PO-HRM-SETTINGS-W3-CAT-B-FE-01
 * change_mode: UPGRADE
 * What: Bỏ form inline + picker preview; SettingsCatalogScreenShell + Dialog + client pagination
 * Why: Sponsor W3 — 100% catalog Settings cùng UX density
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
  listEmpDocumentTypes,
  retireEmpDocumentType,
  upsertEmpDocumentType,
  type HrmEmpDocumentTypeRecord,
} from '@/integrations/hrmApi';
import { EMP_DOCUMENT_TYPES_EFFECTIVE_QUERY_KEY } from '@/hooks/useEmpDocumentTypesEffective';
import { toErrorMessage } from '@/lib/apiError';
import {
  EMP_DOCUMENT_TYPE_UAT_HONESTY,
  empDocumentTypeSourceLabel,
  formatEmpDocumentTypeDisplay,
  isValidEmpDocumentTypeKeyFormat,
  normalizeEmpDocumentTypeKey,
} from '@/lib/empDocumentTypeCatalog';
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
  documentTypeKey: string;
  nameVi: string;
  sortOrder: string;
  requiredByDefault: boolean;
  requiresExpiry: boolean;
  blocksActivation: boolean;
  isIdentityDoc: boolean;
  status: string;
};

const emptyForm = (): FormState => ({
  documentTypeKey: '',
  nameVi: '',
  sortOrder: '100',
  requiredByDefault: false,
  requiresExpiry: false,
  blocksActivation: false,
  isIdentityDoc: false,
  status: 'active',
});

const SETTINGS_TAB_EMP_DOCUMENT_TYPES = 'emp-document-types';

export function EmpDocumentTypeSettingsPanel() {
  const { currentCompanyId } = useAuth();
  const { listCompanyId } = useHrmOperatingUnitFilter();
  const companyId = listCompanyId || currentCompanyId;
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const bootstrapFocusQueryRef = useRef(
    resolveSettingsCatalogInitialSearchQuery(
      SETTINGS_TAB_EMP_DOCUMENT_TYPES,
      searchParams.get('focus'),
    ),
  );

  const [items, setItems] = useState<HrmEmpDocumentTypeRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [q, setQ] = useState(() => bootstrapFocusQueryRef.current);
  const [page, setPage] = useState(1);

  const rowKeyOf = useCallback((r: HrmEmpDocumentTypeRecord) => r.documentTypeKey, []);
  const { rememberFocusForReload } = useSettingsCatalogFocusPage(
    SETTINGS_TAB_EMP_DOCUMENT_TYPES,
    items,
    loading,
    rowKeyOf,
    setPage,
    setQ,
  );

  const loadRows = useCallback(async (): Promise<HrmEmpDocumentTypeRecord[]> => {
    if (!companyId) return [];
    setLoading(true);
    setError(null);
    try {
      const res = await listEmpDocumentTypes({
        company_id: companyId,
        status: 'active',
      });
      const sorted = sortSettingsCatalogByOrderThenKey(
        res.items,
        (r) => r.sortOrder,
        (r) => r.documentTypeKey,
      );
      setItems(sorted);
      return sorted;
    } catch (err) {
      setError(toErrorMessage(err, 'Không tải được danh sách loại giấy tờ.'));
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
        (r) => r.documentTypeKey,
        (r) => r.nameVi,
      ),
    [items, q],
  );

  const paginated = useMemo(
    () => paginateCatalogRows(filtered, page, SETTINGS_CATALOG_PAGE_SIZE),
    [filtered, page],
  );

  const invalidateConsumers = () => {
    void queryClient.invalidateQueries({ queryKey: [EMP_DOCUMENT_TYPES_EFFECTIVE_QUERY_KEY] });
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (row: HrmEmpDocumentTypeRecord) => {
    setEditingId(row.id);
    setForm({
      documentTypeKey: row.documentTypeKey,
      nameVi: row.nameVi,
      sortOrder: String(row.sortOrder ?? 100),
      requiredByDefault: Boolean(row.requiredByDefault),
      requiresExpiry: Boolean(row.requiresExpiry),
      blocksActivation: Boolean(row.blocksActivation),
      isIdentityDoc: Boolean(row.isIdentityDoc),
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
    const documentTypeKey = normalizeEmpDocumentTypeKey(form.documentTypeKey);
    const nameVi = form.nameVi.trim();
    if (!isValidEmpDocumentTypeKeyFormat(documentTypeKey)) {
      toast({
        title: 'Mã loại giấy tờ không hợp lệ',
        description:
          'Định dạng a-z / số / gạch dưới (vd. hr_doc_custom_09).',
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
      const saved = await upsertEmpDocumentType({
        companyId,
        documentTypeKey,
        nameVi,
        sortOrder,
        requiredByDefault: form.requiredByDefault,
        requiresExpiry: form.requiresExpiry,
        blocksActivation: form.blocksActivation,
        isIdentityDoc: form.isIdentityDoc,
        status: form.status || 'active',
      });
      toast({
        title: editingId ? 'Đã cập nhật loại giấy tờ' : 'Đã tạo loại giấy tờ',
        description: formatEmpDocumentTypeDisplay(saved.documentTypeKey, saved.nameVi),
      });
      closeDialog();
      rememberFocusForReload(saved.documentTypeKey);
      setQ('');
      const fresh = await loadRows();
      setPage(catalogPageForKey(fresh, saved.documentTypeKey, (r) => r.documentTypeKey));
      invalidateConsumers();
    } catch (err) {
      toast({
        title: 'Lưu loại giấy tờ thất bại',
        description: toErrorMessage(err, 'Không lưu được loại giấy tờ.'),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const onRetire = async (row: HrmEmpDocumentTypeRecord) => {
    if (!companyId) return;
    const ok = window.confirm(
      `Ngừng loại giấy tờ «${formatEmpDocumentTypeDisplay(row.documentTypeKey, row.nameVi)}»? (soft-delete)`,
    );
    if (!ok) return;
    try {
      await retireEmpDocumentType(row.id, companyId);
      toast({ title: 'Đã ngừng loại giấy tờ', description: row.nameVi });
      if (editingId === row.id) closeDialog();
      await loadRows();
      invalidateConsumers();
    } catch (err) {
      toast({
        title: 'Ngừng loại giấy tờ thất bại',
        description: toErrorMessage(err, 'Không ngừng được loại giấy tờ.'),
        variant: 'destructive',
      });
    }
  };

  const honestySlot = !EMP_DOCUMENT_TYPE_UAT_HONESTY? null /* honesty-slot: no-op banner */ : null;

  return (
    <>
      <SettingsCatalogScreenShell
        compact
        title="Loại giấy tờ (EMP catalog)"
        description="Danh sách loại giấy tờ theo đơn vị — tìm mã hoặc nhãn; thêm/sửa qua hộp thoại; F5 sau lưu."
        testId="settings-emp-document-types"
        searchValue={q}
        onSearchChange={setQ}
        searchPlaceholder="Tìm theo mã hoặc tên…"
        onRefresh={() => void loadRows()}
        refreshing={loading}
        onAdd={openCreate}
        addLabel="Thêm loại giấy tờ"
        honestySlot={honestySlot}
        footerSlot={
          <SettingsCatalogPagination
            page={paginated.page}
            totalPages={paginated.totalPages}
            total={paginated.total}
            pageSize={paginated.pageSize}
            onPageChange={setPage}
            testId="settings-emp-document-types-pagination"
          />
        }
      >
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        <Table data-testid="settings-emp-document-types-table" className="min-w-[640px]">
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
                    ? 'Chưa có loại giấy tờ — bấm «Thêm loại giấy tờ».'
                    : 'Không có dòng khớp tìm kiếm.'}
                </TableCell>
              </TableRow>
            ) : (
              paginated.slice.map((row) => (
                <TableRow
                  key={row.id}
                  data-testid={settingsCatalogRowTestId(row.documentTypeKey)}
                >
                  <TableCell className="font-mono text-xs">{row.documentTypeKey}</TableCell>
                  <TableCell className="font-medium">{row.nameVi}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {[
                      row.requiredByDefault ? 'bắt buộc' : null,
                      row.requiresExpiry ? 'có hạn' : null,
                      row.blocksActivation ? 'chặn KH' : null,
                      row.isIdentityDoc ? 'ĐD' : null,
                    ]
                      .filter(Boolean)
                      .join(' · ') || '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {empDocumentTypeSourceLabel(row.source ?? 'emp_native')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <SettingsCatalogRowActions
                      editTestId={`hdsd-emp-document-type-edit-${row.documentTypeKey}`}
                      retireTestId={`hdsd-emp-document-type-retire-${row.documentTypeKey}`}
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
          data-testid="settings-emp-document-types-dialog"
        >
          <DialogHeader>
            <DialogTitle>{editingId ? 'Sửa loại giấy tờ' : 'Thêm loại giấy tờ'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="emp-doc-key">Mã loại giấy tờ *</Label>
                <Input
                  id="emp-doc-key"
                  data-testid="hdsd-emp-document-type-key"
                  className="font-mono text-sm"
                  placeholder="hr_doc_custom_09"
                  value={form.documentTypeKey}
                  disabled={Boolean(editingId)}
                  onChange={(e) => setForm((f) => ({ ...f, documentTypeKey: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="emp-doc-name">Nhãn tiếng Việt *</Label>
                <Input
                  id="emp-doc-name"
                  data-testid="hdsd-emp-document-type-name"
                  placeholder="Giấy tờ HR riêng"
                  value={form.nameVi}
                  onChange={(e) => setForm((f) => ({ ...f, nameVi: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1 max-w-[8rem]">
              <Label htmlFor="emp-doc-sort">Thứ tự</Label>
              <Input
                id="emp-doc-sort"
                data-testid="hdsd-emp-document-type-sort"
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
                  checked={form.requiredByDefault}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, requiredByDefault: v }))}
                />
                Bắt buộc mặc định
              </label>
              <label className="inline-flex items-center gap-2">
                <Switch
                  checked={form.requiresExpiry}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, requiresExpiry: v }))}
                />
                Có hạn
              </label>
              <label className="inline-flex items-center gap-2">
                <Switch
                  checked={form.blocksActivation}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, blocksActivation: v }))}
                />
                Chặn kích hoạt HS
              </label>
              <label className="inline-flex items-center gap-2">
                <Switch
                  checked={form.isIdentityDoc}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, isIdentityDoc: v }))}
                />
                Giấy tờ định danh
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
              data-testid="hdsd-emp-document-type-save"
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
