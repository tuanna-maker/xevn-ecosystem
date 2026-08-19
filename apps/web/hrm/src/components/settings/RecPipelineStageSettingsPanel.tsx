/**
 * @CODE-MEMORY
 * Screen:     /settings — tab Giai đoạn REC · pipeline-stage
 * UC:         AC-PLT-REC-02 · AC-PLT-REC-03
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-FE-01 · PO-HRM-SETTINGS-W3-CAT-B-FE-01
 * Purpose:    List + search + phân trang + popup (W3 shell).
 * must_keep:  soft-delete · hired/reject flags · hdsd-* testids · U65
 *
 * @CODE-MEMORY-CHANGE 2026-08-10 PO-HRM-SETTINGS-W3-CAT-B-FE-01
 * change_mode: UPGRADE · SettingsCatalogScreenShell + Dialog
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
  listRecPipelineStages,
  retireRecPipelineStage,
  upsertRecPipelineStage,
  type HrmRecPipelineStageRecord,
} from '@/integrations/hrmApi';
import { REC_PIPELINE_STAGES_EFFECTIVE_QUERY_KEY } from '@/hooks/useRecPipelineStagesEffective';
import { toErrorMessage } from '@/lib/apiError';
import {
  formatRecPipelineStageDisplay,
  isValidRecPipelineStageKeyFormat,
  normalizeRecPipelineStageKey,
  REC_PIPELINE_STAGE_UAT_HONESTY,
  recPipelineStageSourceLabel,
} from '@/lib/recPipelineStageCatalog';
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
  stageKey: string;
  nameVi: string;
  sortOrder: string;
  isTerminal: boolean;
  isHiredOutcome: boolean;
  isRejectOutcome: boolean;
  allowsInterviewSchedule: boolean;
  wfTaskTypeKey: string;
  status: string;
};

const emptyForm = (): FormState => ({
  stageKey: '',
  nameVi: '',
  sortOrder: '100',
  isTerminal: false,
  isHiredOutcome: false,
  isRejectOutcome: false,
  allowsInterviewSchedule: true,
  wfTaskTypeKey: '',
  status: 'active',
});

const SETTINGS_TAB_REC_PIPELINE_STAGES = 'rec-pipeline-stages';

export function RecPipelineStageSettingsPanel() {
  const { currentCompanyId } = useAuth();
  const { listCompanyId } = useHrmOperatingUnitFilter();
  const companyId = listCompanyId || currentCompanyId;
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const bootstrapFocusQueryRef = useRef(
    resolveSettingsCatalogInitialSearchQuery(
      SETTINGS_TAB_REC_PIPELINE_STAGES,
      searchParams.get('focus'),
    ),
  );

  const [items, setItems] = useState<HrmRecPipelineStageRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [q, setQ] = useState(() => bootstrapFocusQueryRef.current);
  const [page, setPage] = useState(1);

  const rowKeyOf = useCallback((r: HrmRecPipelineStageRecord) => r.stageKey, []);
  const { rememberFocusForReload } = useSettingsCatalogFocusPage(
    SETTINGS_TAB_REC_PIPELINE_STAGES,
    items,
    loading,
    rowKeyOf,
    setPage,
    setQ,
  );

  const loadRows = useCallback(async (): Promise<HrmRecPipelineStageRecord[]> => {
    if (!companyId) return [];
    setLoading(true);
    setError(null);
    try {
      const res = await listRecPipelineStages({
        company_id: companyId,
        status: 'active',
      });
      const sorted = sortSettingsCatalogByOrderThenKey(
        res.items,
        (r) => r.sortOrder,
        (r) => r.stageKey,
      );
      setItems(sorted);
      return sorted;
    } catch (err) {
      setError(toErrorMessage(err, 'Không tải được danh sách giai đoạn pipeline.'));
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
      filterCatalogByCodeOrName(items, q, (r) => r.stageKey, (r) => r.nameVi),
    [items, q],
  );

  const paginated = useMemo(
    () => paginateCatalogRows(filtered, page, SETTINGS_CATALOG_PAGE_SIZE),
    [filtered, page],
  );

  const invalidateConsumers = () => {
    void queryClient.invalidateQueries({ queryKey: [REC_PIPELINE_STAGES_EFFECTIVE_QUERY_KEY] });
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (row: HrmRecPipelineStageRecord) => {
    setEditingId(row.id);
    setForm({
      stageKey: row.stageKey,
      nameVi: row.nameVi,
      sortOrder: String(row.sortOrder ?? 100),
      isTerminal: Boolean(row.isTerminal),
      isHiredOutcome: Boolean(row.isHiredOutcome),
      isRejectOutcome: Boolean(row.isRejectOutcome),
      allowsInterviewSchedule: row.allowsInterviewSchedule !== false,
      wfTaskTypeKey: row.wfTaskTypeKey?.trim() || '',
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
    const stageKey = normalizeRecPipelineStageKey(form.stageKey);
    const nameVi = form.nameVi.trim();
    if (!isValidRecPipelineStageKeyFormat(stageKey)) {
      toast({ title: 'Mã giai đoạn không hợp lệ', variant: 'destructive' });
      return;
    }
    if (!nameVi) {
      toast({ title: 'Thiếu nhãn tiếng Việt', variant: 'destructive' });
      return;
    }

    const sortParsed = Number.parseInt(form.sortOrder, 10);
    const sortOrder = Number.isFinite(sortParsed) && sortParsed >= 0 ? sortParsed : 100;

    const isHiredOutcome = form.isHiredOutcome;
    const isRejectOutcome = form.isRejectOutcome && !isHiredOutcome;
    const isTerminal = isHiredOutcome ? true : form.isTerminal;

    setSaving(true);
    try {
      const saved = await upsertRecPipelineStage({
        companyId,
        stageKey,
        nameVi,
        sortOrder,
        isTerminal,
        isHiredOutcome,
        isRejectOutcome,
        allowsInterviewSchedule: form.allowsInterviewSchedule,
        wfTaskTypeKey: form.wfTaskTypeKey.trim() || null,
        status: form.status || 'active',
      });
      toast({
        title: editingId ? 'Đã cập nhật giai đoạn' : 'Đã tạo giai đoạn',
        description: formatRecPipelineStageDisplay(saved.stageKey, saved.nameVi),
      });
      closeDialog();
      rememberFocusForReload(saved.stageKey);
      setQ('');
      const fresh = await loadRows();
      setPage(catalogPageForKey(fresh, saved.stageKey, (r) => r.stageKey));
      invalidateConsumers();
    } catch (err) {
      toast({
        title: 'Lưu giai đoạn thất bại',
        description: toErrorMessage(err, 'Không lưu được giai đoạn pipeline.'),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const onRetire = async (row: HrmRecPipelineStageRecord) => {
    if (!companyId) return;
    const ok = window.confirm(
      `Ngừng giai đoạn «${formatRecPipelineStageDisplay(row.stageKey, row.nameVi)}»? (soft-delete)`,
    );
    if (!ok) return;
    try {
      await retireRecPipelineStage(row.id, companyId);
      toast({ title: 'Đã ngừng giai đoạn', description: row.nameVi });
      if (editingId === row.id) closeDialog();
      await loadRows();
      invalidateConsumers();
    } catch (err) {
      toast({
        title: 'Ngừng giai đoạn thất bại',
        description: toErrorMessage(err, 'Không ngừng được giai đoạn.'),
        variant: 'destructive',
      });
    }
  };

  const honestySlot = null;

  return (
    <>
      <SettingsCatalogScreenShell
        compact
        title="Giai đoạn pipeline (REC catalog)"
        description="Danh sách giai đoạn theo đơn vị — thêm/sửa qua hộp thoại."
        testId="settings-rec-pipeline-stages"
        searchValue={q}
        onSearchChange={setQ}
        searchPlaceholder="Tìm theo mã hoặc tên…"
        onRefresh={() => void loadRows()}
        refreshing={loading}
        onAdd={openCreate}
        addLabel="Thêm giai đoạn"
        honestySlot={honestySlot}
        footerSlot={
          <SettingsCatalogPagination
            page={paginated.page}
            totalPages={paginated.totalPages}
            total={paginated.total}
            pageSize={paginated.pageSize}
            onPageChange={setPage}
            testId="settings-rec-pipeline-stages-pagination"
          />
        }
      >
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        <Table data-testid="settings-rec-pipeline-stages-table" className="min-w-[640px]">
          <TableHeader>
            <TableRow>
              <TableHead>Mã</TableHead>
              <TableHead>Tên</TableHead>
              <TableHead>Cờ</TableHead>
              <TableHead>Nguồn</TableHead>
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
                    ? 'Chưa có giai đoạn — bấm «Thêm giai đoạn».'
                    : 'Không có dòng khớp tìm kiếm.'}
                </TableCell>
              </TableRow>
            ) : (
              paginated.slice.map((row) => (
                <TableRow
                  key={row.id}
                  data-testid={settingsCatalogRowTestId(row.stageKey)}
                >
                  <TableCell className="font-mono text-xs">{row.stageKey}</TableCell>
                  <TableCell className="font-medium">{row.nameVi}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {row.isHiredOutcome ? (
                        <Badge variant="outline" className="text-xs">
                          hired
                        </Badge>
                      ) : null}
                      {row.isRejectOutcome ? (
                        <Badge variant="outline" className="text-xs">
                          reject
                        </Badge>
                      ) : null}
                      {row.isTerminal ? (
                        <Badge variant="outline" className="text-xs">
                          terminal
                        </Badge>
                      ) : null}
                      <span className="text-xs text-muted-foreground">#{row.sortOrder ?? 100}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {recPipelineStageSourceLabel(row.source ?? 'rec_native')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <SettingsCatalogRowActions
                      editTestId={`hdsd-rec-pipeline-stage-edit-${row.stageKey}`}
                      retireTestId={`hdsd-rec-pipeline-stage-retire-${row.stageKey}`}
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
          data-testid="settings-rec-pipeline-stages-dialog"
        >
          <DialogHeader>
            <DialogTitle>{editingId ? 'Sửa giai đoạn pipeline' : 'Thêm giai đoạn pipeline'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="rec-stg-key">Mã giai đoạn *</Label>
                <Input
                  id="rec-stg-key"
                  data-testid="hdsd-rec-pipeline-stage-key"
                  className="font-mono text-sm"
                  placeholder="hr_custom_stage_07"
                  value={form.stageKey}
                  disabled={Boolean(editingId)}
                  onChange={(e) => setForm((f) => ({ ...f, stageKey: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="rec-stg-name">Nhãn tiếng Việt *</Label>
                <Input
                  id="rec-stg-name"
                  data-testid="hdsd-rec-pipeline-stage-name"
                  value={form.nameVi}
                  onChange={(e) => setForm((f) => ({ ...f, nameVi: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1 max-w-[8rem]">
              <Label htmlFor="rec-stg-sort">Thứ tự</Label>
              <Input
                id="rec-stg-sort"
                data-testid="hdsd-rec-pipeline-stage-sort"
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
                  checked={form.isTerminal || form.isHiredOutcome}
                  disabled={form.isHiredOutcome}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, isTerminal: v }))}
                  data-testid="hdsd-rec-pipeline-stage-terminal"
                />
                Kết thúc (terminal)
              </label>
              <label className="inline-flex items-center gap-2">
                <Switch
                  checked={form.isHiredOutcome}
                  onCheckedChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      isHiredOutcome: v,
                      isTerminal: v ? true : f.isTerminal,
                      isRejectOutcome: v ? false : f.isRejectOutcome,
                    }))
                  }
                  data-testid="hdsd-rec-pipeline-stage-hired-outcome"
                />
                Kết quả tuyển (hired)
              </label>
              <label className="inline-flex items-center gap-2">
                <Switch
                  checked={form.isRejectOutcome}
                  disabled={form.isHiredOutcome}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, isRejectOutcome: v }))}
                  data-testid="hdsd-rec-pipeline-stage-reject-outcome"
                />
                Từ chối (reject)
              </label>
              <label className="inline-flex items-center gap-2">
                <Switch
                  checked={form.allowsInterviewSchedule}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, allowsInterviewSchedule: v }))}
                />
                Cho phép lịch PV
              </label>
            </div>
            <div className="space-y-1">
              <Label htmlFor="rec-stg-wf">Mã task WF (tuỳ chọn)</Label>
              <Input
                id="rec-stg-wf"
                data-testid="hdsd-rec-pipeline-stage-wf-task"
                className="font-mono text-sm"
                placeholder="optional wf_task_type_key"
                value={form.wfTaskTypeKey}
                onChange={(e) => setForm((f) => ({ ...f, wfTaskTypeKey: e.target.value }))}
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
              data-testid="hdsd-rec-pipeline-stage-save"
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

