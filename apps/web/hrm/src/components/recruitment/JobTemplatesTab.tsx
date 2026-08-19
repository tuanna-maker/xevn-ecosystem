/**
 * @CODE-MEMORY
 * Screen:     /hr/recruitment — Thư viện JD (UC-HRM-RC-07)
 * UC:         UC-HRM-RC-07 · FR-HRM-RC-JD-01
 * BR:         BR-CD-F6-01 · BR-HRM-MD-01
 * SRS:        docs/hrm/SRS.md §14 UC-HRM-30 · AC-SET-FS-03
 * TechSpec:   docs/program/deltas/CUSTOMER_DEMO_HRM_DELTA_20260620.md §6 AC-CD-F6-01
 * Purpose:    List/create/edit JD templates so HR does not retype job detail each time.
 * WorkItem:   CD-FB-09-RECRUIT · D-HRM-SETTINGS-MD-JT-FE-01
 * Coded:      2026-07-19
 *
 * Callers:
 *   - pages/Recruitment.tsx tab jd-library
 *
 * Callees:
 *   - hooks/useJobTemplates.ts → hrmApi job-templates
 *   - jobTitleOptionsFromCatalog / buildJobTemplatePositionFields
 *
 * FE-Actions:
 *   | Thêm JD | open create dialog | POST job-templates (position_code) |
 *   | Sửa     | open edit dialog   | PATCH job-templates/:id |
 *   | F5      | remount refetch    | GET job-templates |
 *
 * Impact:     Without this tab AC-CD-F6-01 fails; label-only SoT → BE HRM-REC-JD-POS
 * must_keep:  Persist via API (not localStorage); show 409 code conflict; catalog code SoT
 * SOLID:      UI only — mutations via hook; catalog helpers pure
 * LastVerified: docs/qa/evidence/fe-hrm-settings-md-jt-01-20260725.md
 *
 * @CODE-MEMORY-CHANGE 2026-07-23 D-HRM-SETTINGS-MD-CRUD-FE-01
 * change_mode: ADD
 * What: position_name via CatalogSearchPicker (FR-HRM-SC-POS-01) — cấm Input free-text
 * Why: AC-HRM-PICKER-01 · FR-HRM-SC-JT-01 link position catalog
 *
 * @CODE-MEMORY-CHANGE 2026-07-25 D-HRM-SETTINGS-MD-JT-FE-01
 * change_mode: UPGRADE
 * What: form SoT = position_code; POST/PATCH send code (+ optional denorm label); empty catalog CTA + submit guard
 * Why: AC-SET-FS-03 · FR-HRM-RC-JD-01 — BE rejects invent-only free text (HRM-REC-JD-POS)
 *
 * @CODE-MEMORY-CHANGE 2026-08-06 PO-HRM-UI-P0-LOGO-FONT-TITLE-01
 * change_mode: FIX
 * What: Create/edit JD template — `title` FormField first (before code + position)
 * Why: Sponsor — popup thêm mới: trường Tiêu đề đứng đầu form
 * must_keep: position_code catalog SoT; HDSD testids; U65; persist API
 * LastVerified: docs/qa/evidence/po-hrm-ui-p0-logo-font-title-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-01 D-HDSD-MUTATE-FE-14
 * change_mode: FIX
 * What: optional shared useJobTemplates props from Recruitment page — same rows as YCTD create dialog
 * Why: QA R11 — separate hook instance caused jd-library tbody count=1 while requisitions picker empty
 *
 * @CODE-MEMORY-CHANGE 2026-08-01 D-HDSD-MUTATE-FE-16
 * change_mode: FIX
 * What: HDSD data-testid on JD library empty row / data rows / create dialog — harness gates on API count not tbody
 * Why: QA R13 — empty-state tbody false positive (count=1) skipped FE «Thêm JD» when GET total=0
 *
 * @CODE-MEMORY-CHANGE 2026-08-03 PO-E2E-SPINE-01-FE-REC-MOUNT
 * change_mode: FIX
 * What: Restore JobTemplatesTab (+ useJobTemplates) from stash 43c479a UTF-8 — unblock Recruitment.tsx Vite resolve
 * Why: QA R-PO-SPINE01-REC-MOUNT — Failed to resolve @/components/recruitment/JobTemplatesTab → /hr/recruitment whitescreen
 * must_keep: sharedTemplates prop; position_code catalog SoT; leave/AUTH/EMP/CAT CLOSED; U65 no seed
 * LastVerified: docs/qa/evidence/po-e2e-spine-01-fe-rec-mount.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-W4-REC-A
 * change_mode: UPGRADE
 * What: Precision Motion title ≥20; error honesty warning DNA; sharp secondary; compact code field
 * Why: ADR §16 · inventory R03 · B4 cấm amber AI
 * must_keep: position_code catalog SoT · sharedTemplates · HDSD testids · U65 · no Nest invent
 * ADR: docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-06 PO-HRM-JD-DYNAMIC-FE-01
 * change_mode: ADD
 * What: Writer pack resolve + group DnD + snapshot v2; TopCV view; title-first; G4 pack confirm
 * Why: GROUP triad unlock · Q1/Q6 · WORLD §3.6 · AC-JD-GRP-*
 * SRS: docs/program/specs/PO-HRM-JD-GROUP-SPEC-01.md · ARCH-02 · GROUP-ARCH-01
 * must_keep: position_code SoT; JobPostingsTab not JD write; no PACK_* hardcode; U65; HDSD testids
 * LastVerified: docs/qa/evidence/po-hrm-jd-dynamic-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-REC-00-CLUSTER-FE-01
 * change_mode: UPGRADE
 * What: Status chips from DTO status (Nháp/Hiệu lực/Ngừng); create=Nháp toast; Phát hành → POST …/publish;
 *       soft-retire Ngừng; filter status; toast PUB-* / CODE-DUP / YCTD-STATUS via toErrorMessage
 * Why: UC-BP-REC-00 O1–O5 · API-01 F-JD-01..04 · BA Diễn biến #1–#3 U65
 * must_keep: physical /recruitment/job-templates only; position_code; sharedTemplates; HDSD; DENY /rec · seed · honesty
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-rec-00-cluster-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-REC-00-CLUSTER-FE-02
 * change_mode: FIX
 * What: Escape CODE-MEMORY toast codes — space around slash so PUB-* / CODE-DUP does not close block comment (Vite SWC)
 * Why: QA-01 R-REC-00-FE-COMMENT-ASTERISK — asterisk-slash sequence inside block comment terminated early → Recruitment whitescreen
 * must_keep: FE-01 chips/publish/Ngừng; physical /recruitment/job-templates; DENY /rec · seed · honesty
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-rec-00-cluster-fe-02.md
 */
import { useMemo, useState } from 'react';
import { BookOpen, Eye, Pencil, Plus, RefreshCw, Send, Ban } from 'lucide-react';
import { useJobTemplates } from '@/hooks/useJobTemplates';
import { useSettingsCatalogsOverview } from '@/hooks/useSettingsCatalogsOverview';
import type { HrmJobDescriptionTemplate } from '@/integrations/hrmApi';
import { toErrorMessage } from '@/lib/apiError';
import { jobTitleOptionsFromCatalog, resolveJobTitleLabel } from '@/lib/catalogSearchPicker';
import {
  filterJdTemplatesByStatus,
  isJdTemplateActive,
  isJdTemplateDraft,
  isJdTemplateRetired,
  jdTemplateStatusChipClass,
  jdTemplateStatusLabelVi,
  resolveJdTemplateStatus,
  type JdTemplateLifecycleStatus,
} from '@/lib/jobTemplateStatus';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
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
import { HDSD_MUTATE_TEST_IDS } from '@/lib/hdsdMutateTestIds';
import {
  JdTemplateWriterDialog,
  type JdWriterSavePayload,
} from '@/components/recruitment/JdTemplateWriterDialog';
import { JdTemplateViewPanel } from '@/components/recruitment/JdTemplateViewPanel';

type JobTemplatesTabProps = {
  /** Shared page-level hook — same source as JobRequisitionsTab (D-HDSD-MUTATE-FE-14). */
  sharedTemplates?: ReturnType<typeof useJobTemplates>;
};

export function JobTemplatesTab({ sharedTemplates }: JobTemplatesTabProps = {}) {
  const internalHook = useJobTemplates(!sharedTemplates);
  const {
    companyId,
    templates,
    loading,
    error,
    refetch,
    createTemplate,
    updateTemplate,
    publishTemplate,
    removeTemplate,
    getTemplateById,
  } = sharedTemplates ?? internalHook;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<HrmJobDescriptionTemplate | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewRow, setViewRow] = useState<HrmJobDescriptionTemplate | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | JdTemplateLifecycleStatus>('all');
  const {
    catalogs,
    isLoading: catalogsLoading,
    isError: catalogsError,
  } = useSettingsCatalogsOverview({ enabled: dialogOpen });

  const positionOptions = useMemo(
    () => jobTitleOptionsFromCatalog(catalogs ?? []),
    [catalogs],
  );

  const visibleTemplates = useMemo(
    () => filterJdTemplatesByStatus(templates, statusFilter),
    [templates, statusFilter],
  );

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (row: HrmJobDescriptionTemplate) => {
    if (isJdTemplateRetired(row)) {
      toast({
        title: 'JD đã Ngừng',
        description: toErrorMessage(
          { code: 'HRM-REC-JD-RETIRED-LOCKED' },
          'JD đã Ngừng — không chỉnh nội dung.',
        ),
        variant: 'destructive',
      });
      return;
    }
    setEditing(row);
    setDialogOpen(true);
  };

  const openView = async (row: HrmJobDescriptionTemplate) => {
    setViewOpen(true);
    setViewRow(row);
    if (!getTemplateById) return;
    setViewLoading(true);
    try {
      const detail = await getTemplateById(row.id);
      setViewRow(detail);
    } catch {
      // List row + legacy bridge still render (AC-JD-DYN-16 honesty)
    } finally {
      setViewLoading(false);
    }
  };

  const onWriterSubmit = async (payload: JdWriterSavePayload) => {
    setSubmitting(true);
    try {
      if (editing) {
        await updateTemplate(editing.id, {
          code: payload.code,
          title: payload.title,
          position_code: payload.position_code,
          position_name: payload.position_name,
          job_description: payload.job_description || '',
          requirements: payload.requirements || '',
          notes: payload.notes || '',
          values_json: payload.values_json,
          layout_snapshot: payload.layout_snapshot,
          layout_snapshot_json: payload.layout_snapshot,
          layout_version: payload.layout_version,
        });
        toast({
          title: 'Đã lưu JD',
          description: 'Nội dung đã cập nhật — F5 để xác nhận. Phát hành riêng nếu còn Nháp.',
        });
      } else {
        await createTemplate({
          code: payload.code,
          title: payload.title,
          position_code: payload.position_code,
          position_name: payload.position_name,
          job_description: payload.job_description,
          requirements: payload.requirements,
          notes: payload.notes,
          values_json: payload.values_json,
          layout_snapshot: payload.layout_snapshot,
          layout_snapshot_json: payload.layout_snapshot,
          layout_version: payload.layout_version,
        });
        toast({
          title: 'Đã lưu bản Nháp',
          description: 'JD tạo ở trạng thái Nháp — bấm Phát hành khi đủ trường bắt buộc trên bố cục.',
        });
      }
      setDialogOpen(false);
      setEditing(null);
    } catch (err: unknown) {
      toast({
        title: editing ? 'Không cập nhật được JD' : 'Không tạo được JD',
        description: toErrorMessage(
          err,
          'Kiểm tra mã JD trùng, chức danh catalog hoặc quyền truy cập.',
        ),
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const onPublish = async (row: HrmJobDescriptionTemplate) => {
    if (!publishTemplate) {
      toast({
        title: 'Chưa sẵn sàng phát hành',
        description: 'Hook thư viện thiếu publishTemplate — tải lại trang.',
        variant: 'destructive',
      });
      return;
    }
    if (!isJdTemplateDraft(row)) {
      toast({
        title: 'Không phát hành được',
        description: toErrorMessage(
          { code: 'HRM-REC-JD-PUB-STATE' },
          'Chỉ phát hành được bản Nháp.',
        ),
        variant: 'destructive',
      });
      return;
    }
    setPublishingId(row.id);
    try {
      await publishTemplate(row.id);
      toast({
        title: 'Đã phát hành Hiệu lực',
        description: `«${row.code}» sẵn sàng gắn YCTD — F5 để xác nhận chip Hiệu lực.`,
      });
    } catch (err: unknown) {
      toast({
        title: 'Không phát hành được JD',
        description: toErrorMessage(
          err,
          'Thiếu trường bắt buộc trên bố cục hoặc JD không còn Nháp.',
        ),
        variant: 'destructive',
      });
    } finally {
      setPublishingId(null);
    }
  };

  const onRetire = async (row: HrmJobDescriptionTemplate) => {
    if (!window.confirm(`Ngừng dùng JD «${row.code} — ${row.title}»? YCTD lịch sử vẫn xem được mã đã gắn.`)) {
      return;
    }
    try {
      await removeTemplate(row.id);
      toast({
        title: 'Đã ngừng JD',
        description: 'Trạng thái Ngừng — không còn trong picker YCTD mới.',
      });
    } catch (err: unknown) {
      toast({
        title: 'Không ngừng được JD',
        description: toErrorMessage(err, 'Không ngừng được template JD.'),
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3" data-testid="rec-jd-library-tab-precision">
        <div>
          <h2 className="flex items-center gap-2 font-display text-[20px] font-bold tracking-tight text-xevn-text">
            <BookOpen className="h-5 w-5 text-primary" />
            Thư viện mô tả công việc (JD)
          </h2>
          <p className="text-sm text-xevn-textSecondary">
            Tạo bản Nháp → Phát hành Hiệu lực → gắn YCTD. Ngừng giữ lịch sử (không xóa cứng).
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as 'all' | JdTemplateLifecycleStatus)}
          >
            <SelectTrigger className="h-9 w-[160px]" data-testid="jd-library-status-filter">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="draft">Nháp</SelectItem>
              <SelectItem value="active">Hiệu lực</SelectItem>
              <SelectItem value="retired">Ngừng</SelectItem>
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void refetch()}
            disabled={loading}
            data-testid={HDSD_MUTATE_TEST_IDS.jdLibraryRefreshBtn}
          >
            <RefreshCw className="mr-1.5 h-4 w-4" />
            Làm mới
          </Button>
          <PermissionGate module="recruitment" action="create">
            <Button
              type="button"
              size="sm"
              onClick={openCreate}
              data-testid={HDSD_MUTATE_TEST_IDS.jdLibraryAddBtn}
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Thêm JD
            </Button>
          </PermissionGate>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-warning">
          {error}
        </div>
      ) : null}

      <Card>
        {loading ? (
          <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">Đang tải…</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã</TableHead>
                <TableHead>Tiêu đề</TableHead>
                <TableHead>Vị trí</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Cập nhật</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleTemplates.length === 0 ? (
                <TableRow data-testid={HDSD_MUTATE_TEST_IDS.jdLibraryEmpty}>
                  <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                    {templates.length === 0
                      ? 'Chưa có JD template — bấm «Thêm JD» để tạo thư viện.'
                      : 'Không có JD khớp bộ lọc trạng thái.'}
                  </TableCell>
                </TableRow>
              ) : (
                visibleTemplates.map((row) => {
                  const status = resolveJdTemplateStatus(row);
                  const label = jdTemplateStatusLabelVi(status);
                  return (
                    <TableRow key={row.id} data-testid={HDSD_MUTATE_TEST_IDS.jdLibraryRow}>
                      <TableCell className="font-mono text-xs">{row.code}</TableCell>
                      <TableCell className="font-medium">{row.title}</TableCell>
                      <TableCell>
                        {row.position_name ||
                          (row.position_code
                            ? resolveJobTitleLabel(positionOptions, row.position_code)
                            : '—')}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={jdTemplateStatusChipClass(status)}
                          data-testid="jd-library-status-chip"
                          data-status={status}
                        >
                          {label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(row.updated_at || row.created_at).toLocaleString('vi-VN')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-wrap items-center justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => void openView(row)}
                            data-testid="jd-library-view-btn"
                          >
                            <Eye className="mr-1 h-4 w-4" />
                            Xem
                          </Button>
                          {isJdTemplateDraft(row) ? (
                            <PermissionGate module="recruitment" action="update">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                disabled={publishingId === row.id}
                                onClick={() => void onPublish(row)}
                                data-testid="jd-library-publish-btn"
                              >
                                <Send className="mr-1 h-4 w-4" />
                                Phát hành
                              </Button>
                            </PermissionGate>
                          ) : null}
                          {!isJdTemplateRetired(row) ? (
                            <PermissionGate module="recruitment" action="update">
                              <Button type="button" variant="ghost" size="sm" onClick={() => openEdit(row)}>
                                <Pencil className="mr-1 h-4 w-4" />
                                Sửa
                              </Button>
                            </PermissionGate>
                          ) : null}
                          {isJdTemplateActive(row) || isJdTemplateDraft(row) ? (
                            <PermissionGate module="recruitment" action="delete">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-destructive"
                                onClick={() => void onRetire(row)}
                                data-testid="jd-library-retire-btn"
                              >
                                <Ban className="mr-1 h-4 w-4" />
                                Ngừng
                              </Button>
                            </PermissionGate>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}
      </Card>

      {companyId ? (
        <JdTemplateWriterDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          companyId={companyId}
          editing={editing}
          positionOptions={positionOptions}
          catalogsLoading={catalogsLoading}
          catalogsError={!!catalogsError}
          submitting={submitting}
          onSubmit={onWriterSubmit}
        />
      ) : null}

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[720px]">
          <DialogHeader>
            <DialogTitle className="flex flex-wrap items-center gap-2">
              Xem mô tả công việc
              {viewRow ? (
                <Badge
                  variant="outline"
                  className={jdTemplateStatusChipClass(resolveJdTemplateStatus(viewRow))}
                >
                  {jdTemplateStatusLabelVi(resolveJdTemplateStatus(viewRow))}
                </Badge>
              ) : null}
            </DialogTitle>
          </DialogHeader>
          {viewLoading ? (
            <p className="py-8 text-sm text-muted-foreground">Đang tải chi tiết…</p>
          ) : viewRow ? (
            <JdTemplateViewPanel row={viewRow} />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
