/**
 * @CODE-MEMORY
 * Screen:     /settings — tab Điều khoản HĐ · «Token merge HĐ»
 * UC:         BR-PLT-01 · AC-PLT-CTR-05 · BR-PLT-04
 * BR:         soft-delete retire · DYNAMIC-LOCK open catalog · U65 zero-seed
 * SRS:        docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md AC-PLT-CTR-05
 * TechSpec:   docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-TECHSPEC-01.md §1.1C
 * API_DESIGN: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-API-01.md F-PLT-TOK-01..03
 * Purpose:    Settings CRUD registry MergeToken — đăng ký/upsert → F5 list → resolve-preview (registry wins).
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-FE-01
 * Coded:      2026-08-07
 * Callers:    pages/Settings.tsx tab contract-legal
 * Callees:    hrmApi merge-tokens · mergeTokenCatalog · toErrorMessage
 * FEActions:  | Thao tác | Handler | API |
 *             | Tải danh sách | loadTokens | GET /merge-tokens |
 *             | Lưu / upsert | onSave | PUT /merge-tokens |
 *             | Ngừng | onRetire | POST …/retire |
 *             | Resolve preview | onResolvePreview | POST …/resolve-preview |
 * must_keep:  UF-HRM-02 · print-spine · soft-delete · U65 · không closed token enum · printable=false
 * SOLID:      Panel Settings mutate; ContractPrintSpinePanel giữ PREV HĐ
 * solid_convention_ack: bind labelVi/displayToken từ BE — không FE invent printable
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-fe-01.md
 *
 * @CODE-MEMORY-CHANGE
 * WorkItem:   PO-HRM-MVP-GD1-PLT-01-CLUSTER-FE-01
 * Date:       2026-08-09
 * What:       Wave-24 UPGRADE — bind LIVE DTO tokenKey/labelVi/status/ring/domain/archivedAt;
 *             include_archived admin list; soft-retire only; resolve-preview ≠ VER/print SoT;
 *             honesty footer peer catalog≠PLT DONE · merge≠platform UAT · catalog≠CORE-10 DONE ·
 *             CORE-10/09/07 RETAIN · printable false · PAY/ATT OUT · Nest /core 0.
 * Why:        UC-BP-PLT-01 · API-01 CONFIRMED RETAIN · BA O1–O12 · R-PLT-01-DISP · U65
 * must_keep:  CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 · CORE07QC1-KZJTSHNT · soft≠CORE-06 DONE
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-plt-01-cluster-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-10 PO-HRM-SETTINGS-W3-CAT-C-FE-01
 * change_mode: UPGRADE
 * What: SettingsCatalogScreenShell + dialog + client search/pagination (pattern Loại phép)
 * must_keep: soft-retire · resolve-preview · hdsd-merge-token-* · U65
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useHrmOperatingUnitFilter } from '@/contexts/HrmOperatingUnitFilterContext';
import {
  listMergeTokens,
  resolveMergeTokenPreview,
  retireMergeToken,
  upsertMergeToken,
  type HrmMergeTokenRecord,
  type HrmMergeTokenResolvePreview,
} from '@/integrations/hrmApi';
import { toErrorMessage } from '@/lib/apiError';
import {
  formatMergeTokenDisplay,
  isValidMergeTokenKeyFormat,
  MERGE_TOKEN_DOMAINS,
  MERGE_TOKEN_DOMAIN_LABELS,
  MERGE_TOKEN_ORIGINS,
  MERGE_TOKEN_ORIGIN_LABELS,
  MERGE_TOKEN_PRINTABLE_HONESTY,
  MERGE_TOKEN_RINGS,
  MERGE_TOKEN_RING_LABELS,
  mergeTokenDomainLabel,
  mergeTokenOriginLabel,
  mergeTokenResolveSourceLabel,
  mergeTokenRingLabel,
  mergeTokenStatusLabel,
  normalizeMergeTokenKey,
  resolveMergeTokenDescription,
} from '@/lib/mergeTokenCatalog';
import {
  isMergeTokenArchived,
  plt01HonestyBannerText,
  resolveMergeTokenPrimaryLabel,
} from '@/lib/pltTokRing';
import {
  filterCatalogByCodeOrName,
  paginateCatalogRows,
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
import { toast } from '@/hooks/use-toast';
import { formatDisplayDate } from '@/lib/formatDisplayDate';

type FormState = {
  tokenKey: string;
  sourcePath: string;
  ring: string;
  domain: string;
  labelVi: string;
  origin: string;
  extensionFieldRef: string;
  status: string;
};

const emptyForm = (): FormState => ({
  tokenKey: '',
  sourcePath: '',
  ring: 'custom',
  domain: 'CTR',
  labelVi: '',
  origin: 'keyword_map',
  extensionFieldRef: '',
  status: 'active',
});

export function MergeTokenSettingsPanel() {
  const { currentCompanyId } = useAuth();
  const { listCompanyId } = useHrmOperatingUnitFilter();
  const companyId = listCompanyId || currentCompanyId;

  const [items, setItems] = useState<HrmMergeTokenRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [includeArchived, setIncludeArchived] = useState(false);
  const [preview, setPreview] = useState<HrmMergeTokenResolvePreview | null>(null);
  const [previewBusy, setPreviewBusy] = useState(false);

  const loadTokens = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await listMergeTokens({
        company_id: companyId,
        status: includeArchived ? undefined : 'active',
        include_archived: includeArchived || undefined,
      });
      setItems(res.items);
    } catch (err) {
      const msg = toErrorMessage(err, 'Không tải được danh sách token merge.');
      setError(msg);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [companyId, includeArchived]);

  useEffect(() => {
    void loadTokens();
  }, [loadTokens]);

  useEffect(() => {
    setPage(1);
  }, [q, includeArchived]);

  const filtered = useMemo(
    () =>
      filterCatalogByCodeOrName(
        items,
        q,
        (r) => r.tokenKey,
        (r) => r.labelVi,
      ),
    [items, q],
  );

  const paginated = useMemo(
    () => paginateCatalogRows(filtered, page, SETTINGS_CATALOG_PAGE_SIZE),
    [filtered, page],
  );

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (row: HrmMergeTokenRecord) => {
    setEditingId(row.id);
    setForm({
      tokenKey: row.tokenKey,
      sourcePath: row.sourcePath,
      ring: row.ring,
      domain: row.domain,
      labelVi: row.labelVi,
      origin: row.origin || 'extension_field',
      extensionFieldRef: row.extensionFieldRef ?? '',
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
    const tokenKey = normalizeMergeTokenKey(form.tokenKey);
    const labelVi = form.labelVi.trim();
    const sourcePath = form.sourcePath.trim() || tokenKey;
    if (!isValidMergeTokenKeyFormat(tokenKey)) {
      toast({
        title: 'Mã token không hợp lệ',
        description:
          'Chỉ kiểm tra định dạng a-z / số / gạch dưới / dấu chấm — không bị chặn vì «ngoài starter».',
        variant: 'destructive',
      });
      return;
    }
    if (!labelVi) {
      toast({
        title: 'Thiếu nhãn tiếng Việt',
        description: 'Bắt buộc labelVi (display-ready) — không chỉ hiện raw key.',
        variant: 'destructive',
      });
      return;
    }
    if (form.origin === 'extension_field' && !form.extensionFieldRef.trim()) {
      toast({
        title: 'Thiếu tham chiếu trường mở rộng',
        description: 'origin=extension_field cần extensionFieldRef (mã/id Settings).',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const saved = await upsertMergeToken({
        companyId,
        tokenKey,
        sourcePath,
        ring: form.ring,
        domain: form.domain,
        labelVi,
        status: form.status || 'active',
        origin: form.origin,
        extensionFieldRef: form.extensionFieldRef.trim() || undefined,
      });
      toast({
        title: editingId ? 'Đã cập nhật token merge' : 'Đã đăng ký token merge',
        description: formatMergeTokenDisplay(saved.tokenKey, saved.labelVi),
      });
      closeDialog();
      await loadTokens();
    } catch (err) {
      toast({
        title: 'Lưu token thất bại',
        description: toErrorMessage(err, 'Không lưu được merge token.'),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const onRetire = async (row: HrmMergeTokenRecord) => {
    if (!companyId) return;
    const ok = window.confirm(
      `Ngừng (soft-retire) token «${formatMergeTokenDisplay(row.tokenKey, row.labelVi)}»? ` +
        'Không xóa cứng — archivedAt ghi nhận; picker ẩn; lịch sử / freeze peers vẫn đọc được.',
    );
    if (!ok) return;
    try {
      await retireMergeToken(row.id, companyId);
      toast({
        title: 'Đã soft-retire token',
        description: `${resolveMergeTokenPrimaryLabel(row.tokenKey, row.labelVi)} — không hard-delete`,
      });
      if (editingId === row.id) closeDialog();
      await loadTokens();
    } catch (err) {
      toast({
        title: 'Ngừng token thất bại',
        description: toErrorMessage(err, 'Không ngừng được merge token.'),
        variant: 'destructive',
      });
    }
  };

  const onResolvePreview = async () => {
    if (!companyId) return;
    setPreviewBusy(true);
    setPreview(null);
    try {
      const keys =
        items.length > 0
          ? items.slice(0, 20).map((t) => t.tokenKey)
          : form.tokenKey.trim()
            ? [normalizeMergeTokenKey(form.tokenKey)]
            : undefined;
      const res = await resolveMergeTokenPreview({
        companyId,
        domain: form.domain || undefined,
        tokenKeys: keys,
        strict: false,
      });
      setPreview(res);
      const registryHits = res.tokens.filter((t) => t.source === 'registry').length;
      toast({
        title: 'Resolve preview',
        description: `${registryHits}/${res.tokens.length} token lấy từ registry (registry wins khi có dòng active).`,
      });
    } catch (err) {
      toast({
        title: 'Resolve preview thất bại',
        description: toErrorMessage(err, 'Không resolve được preview.'),
        variant: 'destructive',
      });
    } finally {
      setPreviewBusy(false);
    }
  };

  const honestySlot = (
    <>
      {/* MERGE_TOKEN_PRINTABLE_HONESTY: no-op banner slot */}
      <span className="mt-1 block text-xs text-muted-foreground" data-testid="plt-01-honesty">
        {plt01HonestyBannerText()}
      </span>
    </>
  );

  return (
    <>
      <SettingsCatalogScreenShell
        compact
        title="Token merge hợp đồng (MergeToken)"
        description="Đăng ký các token dùng để chèn nội dung động vào mẫu hợp đồng. Tải lại trang sau khi lưu để xác nhận."
        testId="settings-merge-tokens"
        searchValue={q}
        onSearchChange={setQ}
        searchPlaceholder="Tìm theo mã / nhãn…"
        onRefresh={() => void loadTokens()}
        refreshing={loading}
        onAdd={openCreate}
        addLabel="Đăng ký token"
        honestySlot={honestySlot}
        filterSlot={
          <div className="flex h-full flex-col justify-end space-y-1 pb-0.5">
            <Label className="text-xs text-muted-foreground">Bộ lọc</Label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                data-testid="hdsd-merge-token-include-archived"
                checked={includeArchived}
                onChange={(e) => setIncludeArchived(e.target.checked)}
              />
              Hiện đã ngừng (include_archived)
            </label>
          </div>
        }
        footerSlot={
          <SettingsCatalogPagination
            page={paginated.page}
            totalPages={paginated.totalPages}
            total={paginated.total}
            pageSize={paginated.pageSize}
            onPageChange={setPage}
            testId="settings-merge-tokens-pagination"
          />
        }
      >
        {error ? (
          <p className="text-sm text-destructive" data-testid="settings-merge-tokens-error">
            {error}
          </p>
        ) : null}
        <Table data-testid="settings-merge-tokens-table" className="min-w-[850px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Diễn giải & Tên hiển thị (Tiếng Việt)</TableHead>
              <TableHead>Mã Biến Kỹ Thuật (Token)</TableHead>
              <TableHead>Ví Dụ Mẫu (Sample Data)</TableHead>
              <TableHead>Miền / Vòng</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="min-w-[140px] text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-sm text-muted-foreground">
                  Đang tải danh sách token merge…
                </TableCell>
              </TableRow>
            ) : paginated.slice.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                  {items.length === 0
                    ? 'Chưa có token — bấm «Đăng ký token».'
                    : 'Không có dòng khớp tìm kiếm.'}
                </TableCell>
              </TableRow>
            ) : (
              paginated.slice.map((row) => {
                const desc = resolveMergeTokenDescription(row.tokenKey);
                const primaryLabel = resolveMergeTokenPrimaryLabel(row.tokenKey, row.labelVi);
                return (
                  <TableRow
                    key={row.id}
                    data-testid={`settings-merge-token-row-${row.tokenKey}`}
                  >
                    <TableCell>
                      <div className="font-semibold text-foreground">
                        {primaryLabel}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {desc.description !== primaryLabel ? desc.description : `Nguồn: ${row.sourcePath}`}
                      </div>
                    </TableCell>
                    <TableCell>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 rounded bg-muted/80 px-2 py-1 font-mono text-xs text-primary transition-colors hover:bg-primary/10 hover:text-primary"
                        title="Bấm để chép mã token"
                        onClick={() => {
                          void navigator.clipboard.writeText(`{{${row.tokenKey}}}`);
                          toast({
                            title: 'Đã sao chép mã token',
                            description: `{{${row.tokenKey}}} (Dán vào mẫu hợp đồng)`,
                          });
                        }}
                      >
                        {`{{${row.tokenKey}}}`}
                      </button>
                    </TableCell>
                    <TableCell>
                      <span className="inline-block rounded border bg-background px-2 py-0.5 text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                        {desc.sample !== '—' ? desc.sample : '—'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant="outline" className="w-fit">
                          {mergeTokenDomainLabel(row.domain)}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground">
                          {mergeTokenRingLabel(row.ring)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {mergeTokenStatusLabel(row.status)}
                        {isMergeTokenArchived(row.archivedAt) ? (
                          <Badge variant="secondary" className="text-[10px]">
                            archived
                          </Badge>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell>
                      <SettingsCatalogRowActions
                        editTestId={`hdsd-merge-token-edit-${row.tokenKey}`}
                        retireTestId={`hdsd-merge-token-retire-${row.tokenKey}`}
                        onEdit={() => openEdit(row)}
                        onRetire={
                          !isMergeTokenArchived(row.archivedAt) && row.status !== 'retired'
                            ? () => void onRetire(row)
                            : undefined
                        }
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        <div className="pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            data-testid="hdsd-merge-token-resolve-preview"
            disabled={previewBusy || !companyId}
            onClick={() => void onResolvePreview()}
          >
            Kiểm tra resolve (registry)
          </Button>
        </div>
        {preview ? (
          <div
            className="mt-3 space-y-2 rounded-md border p-3 text-sm"
            data-testid="settings-merge-tokens-preview"
          >
            <p className="font-medium">
              Kết quả resolve — thứ tự: registry → keyword_map → builtin → missing
            </p>
            <ul className="max-h-48 space-y-1 overflow-y-auto">
              {preview.tokens.map((t) => (
                <li key={t.tokenKey} className="flex flex-wrap items-baseline gap-2">
                  <span className="font-medium">
                    {formatMergeTokenDisplay(t.tokenKey, undefined)}
                  </span>
                  <Badge variant={t.source === 'registry' ? 'default' : 'secondary'}>
                    {mergeTokenResolveSourceLabel(t.source)}
                  </Badge>
                  {t.warning ? null /* todo-badge: no-op */ : null}
                </li>
              ))}
            </ul>
            {preview.warnings?.length ? (
              <p className="text-xs text-muted-foreground">{preview.warnings.join(' · ')}</p>
            ) : null}
          </div>
        ) : null}
      </SettingsCatalogScreenShell>

      <Dialog open={dialogOpen} onOpenChange={(open) => (open ? setDialogOpen(true) : closeDialog())}>
        <DialogContent
          className="max-h-[min(90vh,720px)] max-w-lg overflow-y-auto sm:max-w-xl"
          data-testid="settings-merge-tokens-dialog"
        >
          <DialogHeader>
            <DialogTitle>{editingId ? 'Sửa token merge' : 'Đăng ký token merge'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="merge-token-key">Mã token (tokenKey) *</Label>
                <Input
                  id="merge-token-key"
                  data-testid="hdsd-merge-token-key"
                  className="font-mono text-sm"
                  placeholder="custom.emp.badge"
                  value={form.tokenKey}
                  disabled={Boolean(editingId)}
                  onChange={(e) => setForm((f) => ({ ...f, tokenKey: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="merge-token-label">Nhãn tiếng Việt *</Label>
                <Input
                  id="merge-token-label"
                  data-testid="hdsd-merge-token-label"
                  placeholder="Mã thẻ nhân viên"
                  value={form.labelVi}
                  onChange={(e) => setForm((f) => ({ ...f, labelVi: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="merge-token-source">Đường dẫn nguồn (sourcePath)</Label>
              <Input
                id="merge-token-source"
                data-testid="hdsd-merge-token-source"
                placeholder="custom.emp.badge"
                value={form.sourcePath}
                onChange={(e) => setForm((f) => ({ ...f, sourcePath: e.target.value }))}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>Vòng (ring)</Label>
                <Select value={form.ring} onValueChange={(v) => setForm((f) => ({ ...f, ring: v }))}>
                  <SelectTrigger data-testid="hdsd-merge-token-ring" className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SettingsDialogSelectContent>
                    {MERGE_TOKEN_RINGS.map((r) => (
                      <SelectItem key={r} value={r}>
                        {MERGE_TOKEN_RING_LABELS[r]}
                      </SelectItem>
                    ))}
                  </SettingsDialogSelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Miền (domain)</Label>
                <Select
                  value={form.domain}
                  onValueChange={(v) => setForm((f) => ({ ...f, domain: v }))}
                >
                  <SelectTrigger data-testid="hdsd-merge-token-domain" className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SettingsDialogSelectContent>
                    {MERGE_TOKEN_DOMAINS.map((d) => (
                      <SelectItem key={d} value={d}>
                        {MERGE_TOKEN_DOMAIN_LABELS[d]}
                      </SelectItem>
                    ))}
                  </SettingsDialogSelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Nguồn gốc (origin)</Label>
                <Select
                  value={form.origin}
                  onValueChange={(v) => setForm((f) => ({ ...f, origin: v }))}
                >
                  <SelectTrigger data-testid="hdsd-merge-token-origin" className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SettingsDialogSelectContent>
                    {MERGE_TOKEN_ORIGINS.map((o) => (
                      <SelectItem key={o} value={o}>
                        {MERGE_TOKEN_ORIGIN_LABELS[o]}
                      </SelectItem>
                    ))}
                  </SettingsDialogSelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="merge-token-ext-ref">Tham chiếu trường mở rộng</Label>
                <Input
                  id="merge-token-ext-ref"
                  data-testid="hdsd-merge-token-ext-ref"
                  placeholder="ext.emp.badge"
                  value={form.extensionFieldRef}
                  onChange={(e) => setForm((f) => ({ ...f, extensionFieldRef: e.target.value }))}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Cú pháp GĐ1:{' '}
              {form.tokenKey.trim() ? `{{${normalizeMergeTokenKey(form.tokenKey)}}}` : '{{…}}'} — catalog
              mở.
            </p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={closeDialog}>
              Hủy
            </Button>
            <Button
              type="button"
              disabled={saving || !companyId}
              data-testid="hdsd-merge-token-save"
              onClick={() => void onSave()}
            >
              <Save className="mr-1.5 h-4 w-4" />
              {saving ? 'Đang lưu…' : editingId ? 'Cập nhật' : 'Đăng ký'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
