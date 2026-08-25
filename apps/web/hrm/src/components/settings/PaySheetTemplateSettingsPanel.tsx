/**
 * @CODE-MEMORY
 * Screen:     /settings — tab «Mẫu bảng lương»
 * UC:         FR-UC-BP-PAY-02 · AC-PAY-TPL-01..06 · AMIS Step3
 * BR:         pack≠mẫu · OV-C definition_id · soft-delete · R-PAY-DD-01 Form GĐ1 — cấm DnD
 * SRS:        docs/program/specs/PO-HRM-AMIS-PARITY-PAY-TPL-API-01.md §5 F-PAY-SHEET-TPL-*
 * TechSpec:   docs/qa/evidence/po-hrm-amis-parity-pay-depth-01.md OV-C Option B
 * API_DESIGN: F-PAY-SHEET-TPL-LIST/UPSERT/LINES/ARCHIVE
 * DB_DESIGN:  pay_sheet_templates · pay_sheet_template_lines
 * Purpose:    Settings GĐ1 CRUD mẫu bảng lương — list/create/edit lines/archive; OV-C picker FK.
 * WorkItem:   PO-HRM-AMIS-PARITY-PAY-TPL-FE-01
 * Coded:      2026-08-07
 * Callers:    pages/Settings.tsx tab pay-sheet-tpl
 * Callees:    hrmApi pay-sheet-templates* · listSalaryComponents · listPayFormulas · paySheetTemplateCatalog
 * FEActions:  | Thao tác | Handler | API |
 *             | Tải danh sách | loadTemplates | GET /pay-sheet-templates |
 *             | Tạo / Lưu header | onSaveHeader | POST/PATCH |
 *             | Lưu cột | onSaveLines | PUT …/lines |
 *             | Lưu trữ | onArchive | POST …/archive |
 * must_keep:  payroll_e2e_ready=false · cấm DnD formula · cấm merge salary-templates pack · U65
 * SOLID:      Panel Settings mutate; SalaryTemplatesTab giữ enroll pack riêng
 * solid_convention_ack: FE–BE display-ready — không FE net / không evaluate formula / không invent amount
 * LastVerified: docs/qa/evidence/po-hrm-amis-parity-pay-tpl-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-CNS-FE-01
 * change_mode: ADD
 * What: Line component picker empty Nest VI (AC-PLT-PAY-01b); SoT remains listSalaryComponents Nest.
 * must_keep: payroll_e2e_ready=false · U65 no seed · pack≠mẫu
 *
 * @CODE-MEMORY-CHANGE 2026-08-10 PO-HRM-SETTINGS-W3-CAT-C-FE-01
 * change_mode: UPGRADE
 * What: List shell + dialog editor (pattern Loại phép); cấm DnD formula RETAIN
 * must_keep: payroll_e2e_ready=false · hdsd-pay-sheet-tpl-* · U65
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Save, Trash2, LayoutTemplate } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useHrmOperatingUnitFilter } from '@/contexts/HrmOperatingUnitFilterContext';
import {
  archivePaySheetTemplate,
  createPaySheetTemplate,
  listPayFormulas,
  listPaySheetTemplateLines,
  listPaySheetTemplates,
  listSalaryComponents,
  putPaySheetTemplateLines,
  updatePaySheetTemplate,
  type HrmPayFormulaRecord,
  type HrmPaySheetTemplateRecord,
  type HrmSalaryComponentRow,
} from '@/integrations/hrmApi';
import { toErrorMessage } from '@/lib/apiError';
import {
  PAY_SHEET_TPL_APPLICABILITY,
  PAY_SHEET_TPL_APPLICABILITY_LABELS,
  PAY_SHEET_TPL_PACK_ALIAS_NOTE,
  PAY_SHEET_TPL_STATUSES,
  PAY_SHEET_TPL_STATUS_LABELS,
  PAYROLL_E2E_READY_HONESTY,
  buildPaySheetTemplateLinesPayload,
  createEmptyPaySheetLineDraft,
  formatPaySheetFormulaOverrideLabel,
  isValidPaySheetTemplateCodeFormat,
  normalizePaySheetTemplateCode,
  paySheetApplicabilityLabel,
  paySheetLineDisplayLabel,
  paySheetTemplateStatusLabel,
  type PaySheetLineDraft,
} from '@/lib/paySheetTemplateCatalog';
import {
  buildVpHanoiPaySheetLineDrafts,
  missingVpHanoiComponentCodes,
} from '@/lib/payrollBatchSheetColumns';
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
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

type HeaderForm = {
  code: string;
  name: string;
  description: string;
  status: string;
  isDefault: boolean;
  applicabilityScope: string;
};

const emptyHeader = (): HeaderForm => ({
  code: '',
  name: '',
  description: '',
  status: 'draft',
  isDefault: false,
  applicabilityScope: 'company',
});

function mapLinesToDrafts(
  lines: Array<{
    id?: string;
    componentId: string;
    displayLabel?: string | null;
    sortOrder: number;
    formulaOverrideDefinitionId?: string | null;
  }>,
): PaySheetLineDraft[] {
  if (!lines.length) return [createEmptyPaySheetLineDraft(0)];
  return lines.map((l, i) => ({
    key: l.id ?? `line-${i}-${l.componentId}`,
    componentId: l.componentId,
    displayLabel: l.displayLabel ?? '',
    sortOrder: Number(l.sortOrder ?? i),
    formulaOverrideDefinitionId: l.formulaOverrideDefinitionId ?? '',
  }));
}

export function PaySheetTemplateSettingsPanel() {
  const { currentCompanyId } = useAuth();
  const { listCompanyId } = useHrmOperatingUnitFilter();
  const companyId = listCompanyId || currentCompanyId;

  const [items, setItems] = useState<HrmPaySheetTemplateRecord[]>([]);
  const [components, setComponents] = useState<HrmSalaryComponentRow[]>([]);
  const [formulas, setFormulas] = useState<HrmPayFormulaRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<HeaderForm>(emptyHeader);
  const [lineDrafts, setLineDrafts] = useState<PaySheetLineDraft[]>([createEmptyPaySheetLineDraft(0)]);

  const componentNameById = useMemo(() => {
    const m = new Map<string, string>();
    for (const c of components) {
      m.set(c.id, String(c.name || c.code || c.id));
    }
    return m;
  }, [components]);

  const loadCatalogs = useCallback(async () => {
    if (!companyId) return;
    try {
      const [compRes, formulaRes] = await Promise.all([
        listSalaryComponents(companyId),
        listPayFormulas({ company_id: companyId, active_only: true }),
      ]);
      setComponents(compRes.data ?? []);
      setFormulas(formulaRes.items ?? []);
    } catch (err) {
      // Catalog soft-fail — header list still works; picker may be empty.
      console.warn('[pay-sheet-tpl] catalog load', err);
    }
  }, [companyId]);

  const loadTemplates = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await listPaySheetTemplates({
        company_id: companyId,
      });
      setItems(res.items);
    } catch (err) {
      setError(toErrorMessage(err, 'Không tải được danh sách mẫu bảng lương.'));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    void loadTemplates();
    void loadCatalogs();
  }, [loadTemplates, loadCatalogs]);

  useEffect(() => {
    setPage(1);
  }, [q]);

  const filtered = useMemo(
    () =>
      filterCatalogByCodeOrName(
        items,
        q,
        (r) => r.code,
        (r) => r.name,
      ),
    [items, q],
  );

  const paginated = useMemo(
    () => paginateCatalogRows(filtered, page, SETTINGS_CATALOG_PAGE_SIZE),
    [filtered, page],
  );

  const resetEditor = () => {
    setEditingId(null);
    setForm(emptyHeader());
    setLineDrafts([createEmptyPaySheetLineDraft(0)]);
  };

  const openCreate = () => {
    resetEditor();
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    resetEditor();
  };

  const onPickRow = async (row: HrmPaySheetTemplateRecord) => {
    setEditingId(row.id);
    setForm({
      code: row.code,
      name: row.name,
      description: row.description ?? '',
      status: row.status || 'draft',
      isDefault: Boolean(row.isDefault),
      applicabilityScope: row.applicabilityScope || 'company',
    });
    if (!companyId) return;
    try {
      const { lines } = await listPaySheetTemplateLines(row.id, companyId);
      setLineDrafts(mapLinesToDrafts(lines));
    } catch (err) {
      toast({
        title: 'Không tải cột mẫu',
        description: toErrorMessage(err, 'Lỗi tải dòng cột.'),
        variant: 'destructive',
      });
      setLineDrafts([createEmptyPaySheetLineDraft(0)]);
    }
    setDialogOpen(true);
  };

  const onSaveHeader = async () => {
    if (!companyId) return;
    const code = normalizePaySheetTemplateCode(form.code);
    if (!isValidPaySheetTemplateCodeFormat(code)) {
      toast({
        title: 'Mã mẫu không hợp lệ',
        description: 'Mã bắt đầu bằng chữ thường, chỉ a-z / 0-9 / _ / - (open catalog).',
        variant: 'destructive',
      });
      return;
    }
    if (!form.name.trim()) {
      toast({
        title: 'Thiếu tên mẫu',
        description: 'Nhập tên hiển thị tiếng Việt.',
        variant: 'destructive',
      });
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        const updated = await updatePaySheetTemplate(editingId, {
          company_id: companyId,
          code,
          name: form.name.trim(),
          description: form.description.trim() || null,
          status: form.status,
          isDefault: form.isDefault,
          applicabilityScope: form.applicabilityScope,
        });
        toast({ title: 'Đã cập nhật mẫu', description: updated.name });
        setForm((f) => ({ ...f, code: updated.code, name: updated.name }));
      } else {
        const created = await createPaySheetTemplate({
          company_id: companyId,
          code,
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          status: form.status,
          isDefault: form.isDefault,
          applicabilityScope: form.applicabilityScope,
        });
        toast({ title: 'Đã tạo mẫu', description: created.name });
        setEditingId(created.id);
        setForm((f) => ({ ...f, code: created.code, name: created.name }));
      }
      await loadTemplates();
    } catch (err) {
      toast({
        title: 'Lưu mẫu thất bại',
        description: toErrorMessage(err, 'Không lưu được header mẫu.'),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const onSaveLines = async () => {
    if (!companyId || !editingId) {
      toast({
        title: 'Chưa có mẫu',
        description: 'Lưu header mẫu trước khi cấu hình cột.',
        variant: 'destructive',
      });
      return;
    }
    const built = buildPaySheetTemplateLinesPayload(lineDrafts);
    if (!built.ok) {
      toast({ title: 'Cột không hợp lệ', description: built.error, variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const res = await putPaySheetTemplateLines(editingId, {
        company_id: companyId,
        lines: built.lines,
      });
      setLineDrafts(mapLinesToDrafts(res.lines ?? []));
      toast({ title: 'Đã lưu cột mẫu', description: `${(res.lines ?? []).length} cột` });
      await loadTemplates();
    } catch (err) {
      toast({
        title: 'Lưu cột thất bại',
        description: toErrorMessage(err, 'Không ghi được lines.'),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const onArchive = async (row: HrmPaySheetTemplateRecord) => {
    if (!companyId) return;
    if (!window.confirm(`Lưu trữ mẫu «${row.name}»? Mẫu sẽ ẩn khỏi danh sách đang dùng.`)) return;
    setSaving(true);
    try {
      await archivePaySheetTemplate(row.id, companyId);
      toast({ title: 'Đã lưu trữ mẫu', description: row.name });
      if (editingId === row.id) closeDialog();
      await loadTemplates();
    } catch (err) {
      toast({
        title: 'Lưu trữ thất bại',
        description: toErrorMessage(err, 'Không archive được mẫu.'),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const updateLine = (key: string, patch: Partial<PaySheetLineDraft>) => {
    setLineDrafts((prev) => prev.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  };

  const addLine = () => {
    setLineDrafts((prev) => {
      const nextOrder = prev.reduce((m, l) => Math.max(m, Number(l.sortOrder) || 0), -1) + 1;
      return [...prev, createEmptyPaySheetLineDraft(nextOrder)];
    });
  };

  const removeLine = (key: string) => {
    setLineDrafts((prev) => {
      const next = prev.filter((l) => l.key !== key);
      return next.length ? next : [createEmptyPaySheetLineDraft(0)];
    });
  };

  const applyVpHanoiPreset = () => {
    if (
      !window.confirm(
        'Thay thế các cột hiện tại bằng bộ 23 cột VP Hà Nội (theo Excel bảng lương)?',
      )
    ) {
      return;
    }
    const missing = missingVpHanoiComponentCodes(components);
    if (missing.length > 0) {
      toast({
        title: 'Thiếu thành phần lương trong catalog',
        description: `Chưa có mã: ${missing.slice(0, 5).join(', ')}${missing.length > 5 ? '…' : ''}. Tải lại trang hoặc mở Lương → Thành phần lương để bootstrap catalog.`,
        variant: 'destructive',
      });
    }
    setLineDrafts(buildVpHanoiPaySheetLineDrafts(components, formulas));
  };

  const honestySlot = (
    <>
      <Badge
        variant="outline"
        className="mt-1 border-amber-500/40 text-amber-800"
        data-testid="pay-sheet-tpl-honesty-badge"
      >
        payroll_e2e_ready={String(PAYROLL_E2E_READY_HONESTY)}
      </Badge>
      <p className="mt-1 text-xs text-xevn-textMuted" data-testid="pay-sheet-tpl-pack-alias-note">
        {PAY_SHEET_TPL_PACK_ALIAS_NOTE}
      </p>
    </>
  );

  const editorBlock = (
    <>
      <div
        className="grid grid-cols-12 gap-4 rounded-lg border border-xevn-border bg-slate-50/60 p-4"
        data-testid="pay-sheet-tpl-editor"
      >
        <div className="col-span-12 space-y-2 sm:col-span-4">
          <Label htmlFor="pay-sheet-tpl-code">Mã mẫu</Label>
          <Input
            id="pay-sheet-tpl-code"
            data-testid="hdsd-pay-sheet-tpl-code"
            value={form.code}
            onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
            placeholder="vd. mau_cong_ty"
            disabled={Boolean(editingId)}
          />
        </div>
        <div className="col-span-12 space-y-2 sm:col-span-4">
          <Label htmlFor="pay-sheet-tpl-name">Tên mẫu</Label>
          <Input
            id="pay-sheet-tpl-name"
            data-testid="hdsd-pay-sheet-tpl-name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Mẫu bảng lương chuẩn"
          />
        </div>
        <div className="col-span-12 space-y-2 sm:col-span-4">
          <Label>Trạng thái</Label>
          <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
            <SelectTrigger data-testid="hdsd-pay-sheet-tpl-status" className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SettingsDialogSelectContent>
              {PAY_SHEET_TPL_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {PAY_SHEET_TPL_STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SettingsDialogSelectContent>
          </Select>
        </div>
        <div className="col-span-12 space-y-2 sm:col-span-4">
          <Label>Phạm vi áp dụng</Label>
          <Select
            value={form.applicabilityScope}
            onValueChange={(v) => setForm((f) => ({ ...f, applicabilityScope: v }))}
          >
            <SelectTrigger data-testid="hdsd-pay-sheet-tpl-scope" className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SettingsDialogSelectContent>
              {PAY_SHEET_TPL_APPLICABILITY.map((s) => (
                <SelectItem key={s} value={s}>
                  {PAY_SHEET_TPL_APPLICABILITY_LABELS[s]}
                </SelectItem>
              ))}
            </SettingsDialogSelectContent>
          </Select>
        </div>
        <div className="col-span-12 space-y-2 sm:col-span-8">
          <Label htmlFor="pay-sheet-tpl-desc">Mô tả</Label>
          <Textarea
            id="pay-sheet-tpl-desc"
            data-testid="hdsd-pay-sheet-tpl-desc"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={2}
          />
        </div>
        <div className="col-span-12 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              checked={form.isDefault}
              onCheckedChange={(v) => setForm((f) => ({ ...f, isDefault: v }))}
              data-testid="hdsd-pay-sheet-tpl-default"
            />
            <Label>Mẫu mặc định</Label>
          </div>
          <Button
            type="button"
            onClick={() => void onSaveHeader()}
            disabled={saving}
            data-testid="hdsd-pay-sheet-tpl-save-header"
          >
            <Save className="mr-2 h-4 w-4" />
            {editingId ? 'Lưu header' : 'Tạo mẫu'}
          </Button>
        </div>
      </div>

      <div className="space-y-3" data-testid="pay-sheet-tpl-lines-editor">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-xevn-text">Cột mẫu (GĐ1 form)</h3>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={applyVpHanoiPreset}
              data-testid="hdsd-pay-sheet-tpl-apply-vp-hn"
            >
              <LayoutTemplate className="mr-1 h-4 w-4" />
              Cột VP Hà Nội
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addLine}
              data-testid="hdsd-pay-sheet-tpl-add-line"
            >
              <Plus className="mr-1 h-4 w-4" />
              Thêm cột
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => void onSaveLines()}
              disabled={saving || !editingId}
              data-testid="hdsd-pay-sheet-tpl-save-lines"
            >
              <Save className="mr-1 h-4 w-4" />
              Lưu cột
            </Button>
          </div>
        </div>
        <p className="text-xs text-xevn-textMuted">
          Override công thức: chọn định nghĩa đã phát hành (OV-C). Không kéo-thả canvas công thức
          (GĐ2).
        </p>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">TT</TableHead>
              <TableHead>Thành phần</TableHead>
              <TableHead>Nhãn hiển thị</TableHead>
              <TableHead>Override công thức (FK)</TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {lineDrafts.map((line) => (
              <TableRow key={line.key} data-testid={`pay-sheet-tpl-line-${line.key}`}>
                <TableCell>
                  <Input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="h-9"
                    value={line.sortOrder}
                    onChange={(e) =>
                      updateLine(line.key, { sortOrder: Number(e.target.value.replace(/\D/g, '')) || 0 })
                    }
                    data-testid={`hdsd-pay-sheet-tpl-line-sort-${line.key}`}
                  />
                </TableCell>
                <TableCell>
                  <Select
                    value={line.componentId || undefined}
                    onValueChange={(v) => updateLine(line.key, { componentId: v })}
                  >
                    <SelectTrigger
                      className="h-9"
                      data-testid={`hdsd-pay-sheet-tpl-line-component-${line.key}`}
                    >
                      <SelectValue placeholder="Chọn thành phần" />
                    </SelectTrigger>
                    <SettingsDialogSelectContent>
                      {components.length === 0 ? (
                        <div
                          className="max-w-[280px] p-2 text-center text-xs text-xevn-textSecondary"
                          data-testid="hdsd-pay-sheet-tpl-nest-empty"
                        >
                          Chưa có thành phần lương. Tạo tại Payroll → Thành phần lương trước.
                        </div>
                      ) : (
                        components.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name} ({c.code})
                          </SelectItem>
                        ))
                      )}
                    </SettingsDialogSelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Input
                    className="h-9"
                    value={line.displayLabel}
                    placeholder={
                      line.componentId
                        ? componentNameById.get(line.componentId) || 'Nhãn cột'
                        : 'Nhãn cột (tuỳ chọn)'
                    }
                    onChange={(e) => updateLine(line.key, { displayLabel: e.target.value })}
                    data-testid={`hdsd-pay-sheet-tpl-line-label-${line.key}`}
                  />
                </TableCell>
                <TableCell>
                  <Select
                    value={line.formulaOverrideDefinitionId || '__none__'}
                    onValueChange={(v) =>
                      updateLine(line.key, {
                        formulaOverrideDefinitionId: v === '__none__' ? '' : v,
                      })
                    }
                  >
                    <SelectTrigger
                      className="h-9"
                      data-testid={`hdsd-pay-sheet-tpl-line-ovc-${line.key}`}
                    >
                      <SelectValue placeholder="Không override" />
                    </SelectTrigger>
                    <SettingsDialogSelectContent>
                      <SelectItem value="__none__">Không override</SelectItem>
                      {formulas.map((f) => (
                        <SelectItem key={f.id} value={f.id}>
                          {f.label?.trim() || f.code} · v{f.version}
                        </SelectItem>
                      ))}
                    </SettingsDialogSelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeLine(line.key)}
                    data-testid={`hdsd-pay-sheet-tpl-line-remove-${line.key}`}
                    aria-label="Xóa cột nháp"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {editingId && lineDrafts.some((l) => l.componentId) ? (
        <div
          className="space-y-1 rounded-lg border border-dashed border-xevn-border p-3 text-xs text-xevn-textSecondary"
          data-testid="pay-sheet-tpl-display-preview"
        >
          <p className="font-medium text-xevn-text">Xem trước nhãn cột (display-ready)</p>
          {lineDrafts
            .filter((l) => l.componentId)
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((l) => (
              <div key={l.key} className="flex gap-2">
                <span className="w-8">{l.sortOrder}</span>
                <span>
                  {paySheetLineDisplayLabel({
                    displayLabel: l.displayLabel,
                    componentName: componentNameById.get(l.componentId),
                  })}
                </span>
                <span className="text-muted-foreground">
                  {formatPaySheetFormulaOverrideLabel({
                    formulaOverrideDefinitionId: l.formulaOverrideDefinitionId || null,
                    formulaOverrideCode: formulas.find((f) => f.id === l.formulaOverrideDefinitionId)
                      ?.code,
                    formulaOverrideVersion: formulas.find(
                      (f) => f.id === l.formulaOverrideDefinitionId,
                    )?.version,
                  })}
                </span>
              </div>
            ))}
        </div>
      ) : null}
    </>
  );

  return (
    <div data-testid="pay-sheet-tpl-settings-panel">
      <SettingsCatalogScreenShell
        compact
        title="Mẫu bảng lương"
        description="Thiết kế cột kỳ lương — thêm/sửa qua hộp thoại; không phải gói enroll tuyển dụng."
        testId="pay-sheet-tpl-settings"
        searchValue={q}
        onSearchChange={setQ}
        searchPlaceholder="Tìm mã / tên mẫu…"
        onRefresh={() => void loadTemplates()}
        refreshing={loading}
        onAdd={openCreate}
        addLabel="Thêm mẫu"
        honestySlot={honestySlot}
        footerSlot={
          <SettingsCatalogPagination
            page={paginated.page}
            totalPages={paginated.totalPages}
            total={paginated.total}
            pageSize={paginated.pageSize}
            onPageChange={setPage}
            testId="pay-sheet-tpl-settings-pagination"
          />
        }
      >
        {error ? (
          <p className="text-sm text-destructive" data-testid="pay-sheet-tpl-list-error">
            {error}
          </p>
        ) : null}
        <Table data-testid="pay-sheet-tpl-list-table" className="min-w-[640px]">
          <TableHeader>
            <TableRow>
              <TableHead>Mã</TableHead>
              <TableHead>Tên</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Phạm vi</TableHead>
              <TableHead>Mặc định</TableHead>
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
                    ? 'Chưa có mẫu bảng lương — bấm «Thêm mẫu».'
                    : 'Không có dòng khớp tìm kiếm.'}
                </TableCell>
              </TableRow>
            ) : (
              paginated.slice.map((row) => (
                <TableRow key={row.id} data-testid={`pay-sheet-tpl-row-${row.code}`}>
                  <TableCell className="font-mono text-xs">{row.code}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{paySheetTemplateStatusLabel(row.status)}</Badge>
                  </TableCell>
                  <TableCell>{paySheetApplicabilityLabel(row.applicabilityScope)}</TableCell>
                  <TableCell>{row.isDefault ? 'Có' : '—'}</TableCell>
                  <TableCell>
                    <SettingsCatalogRowActions
                      editTestId={`hdsd-pay-sheet-tpl-edit-${row.code}`}
                      retireTestId={`hdsd-pay-sheet-tpl-archive-${row.code}`}
                      retireLabel="Lưu trữ"
                      onEdit={() => void onPickRow(row)}
                      onRetire={() => void onArchive(row)}
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
          className="max-h-[min(92vh,800px)] max-w-4xl overflow-y-auto"
          data-testid="pay-sheet-tpl-settings-dialog"
        >
          <DialogHeader>
            <DialogTitle>{editingId ? 'Sửa mẫu bảng lương' : 'Thêm mẫu bảng lương'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">{editorBlock}</div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeDialog}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
