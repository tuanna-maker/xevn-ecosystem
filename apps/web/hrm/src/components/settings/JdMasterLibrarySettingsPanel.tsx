/**
 * @CODE-MEMORY
 * Screen:     /settings?tab=jd-master-library — Thư viện JD master
 * UC:         UC-BP-REC-00 · FR-UC-BP-REC-00
 * SRS:        docs/program/specs/PO-HRM-JD-GROUP-SPEC-01.md · docs/hrm/ui-screens/UI-SETTINGS-JD-MASTER-LIST.md
 * TechSpec:   PO-HRM-JD-DYNAMIC-SPEC-01 · physical `/recruitment/job-templates*`
 * Purpose:    List JD master theo vị trí/mã trong Cài đặt — tách khỏi catalog `jd-dynamic` (UC-00a..f).
 * WorkItem:   PO-HRM-JD-IA-LIST-DETAIL-FE-01
 * Coded:      2026-08-10
 *
 * Callers:
 *   - pages/Settings.tsx tab jd-master-library
 *
 * Callees:
 *   - hooks/useJobTemplates.ts
 *   - JdTemplateWriterDialog · JdTemplateViewPanel
 *
 * FE-Actions:
 *   | List | GET job-templates | search + pagination + status filter |
 *   | Sửa  | writer dialog     | PATCH + layout_snapshot |
 *
 * Impact:     Thiếu tab → sponsor gap IA (list Settings vs catalog CFG only)
 * must_keep:  PAT-SETTINGS-CATALOG-01 compact; position_code SoT; U65; DENY /rec dual SoT
 * SOLID:      Reuse recruitment writer/view; hook owns API
 * LastVerified: docs/qa/evidence/po-hrm-jd-ia-list-detail-fe-01.md (2026-08-11)
 *
 * @CODE-MEMORY-CHANGE 2026-08-11 PO-HRM-JD-IA-LIST-DETAIL-FE-01
 * What: Empty CTA jd-dynamic · writer dialogTestId settings-jd-master-library-writer-dialog.
 * must_keep: List-only shell · PAT-DIALOG-FULL-VIEWPORT-CC-01 · U65
 */
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Ban, Eye, Pencil, Send } from 'lucide-react';
import { useJobTemplates } from '@/hooks/useJobTemplates';
import { useSettingsCatalogsOverview } from '@/hooks/useSettingsCatalogsOverview';
import type { HrmJobDescriptionTemplate } from '@/integrations/hrmApi';
import { HRM_DIALOG_FULL_VIEWPORT_SCROLL_CLASS } from '@/lib/hrmDialogFullViewport';
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
import {
  filterCatalogByCodeOrName,
  paginateCatalogRows,
  SETTINGS_CATALOG_PAGE_SIZE,
} from '@/lib/settingsCatalogPagination';
import { PermissionGate } from '@/components/auth/PermissionGate';
import {
  JdTemplateWriterDialog,
  type JdWriterSavePayload,
} from '@/components/recruitment/JdTemplateWriterDialog';
import { JdTemplateViewPanel } from '@/components/recruitment/JdTemplateViewPanel';
import { SettingsCatalogPagination } from '@/components/settings/SettingsCatalogPagination';
import { SettingsCatalogScreenShell } from '@/components/settings/SettingsCatalogScreenShell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import {
  JD_DYNAMIC_CFG_TAB_ID,
  JD_MASTER_LIBRARY_EMPTY_PRIMARY,
  JD_MASTER_LIBRARY_WRITER_DIALOG_TEST_ID,
  settingsTabQuery,
} from '@/lib/jdMasterLibraryIa';

export function JdMasterLibrarySettingsPanel() {
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
  } = useJobTemplates(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<HrmJobDescriptionTemplate | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewRow, setViewRow] = useState<HrmJobDescriptionTemplate | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | JdTemplateLifecycleStatus>('all');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);

  const {
    catalogs,
    isLoading: catalogsLoading,
    isError: catalogsError,
  } = useSettingsCatalogsOverview({ enabled: dialogOpen });

  const positionOptions = useMemo(
    () => jobTitleOptionsFromCatalog(catalogs ?? []),
    [catalogs],
  );

  const filtered = useMemo(() => {
    const byStatus = filterJdTemplatesByStatus(templates, statusFilter);
    return filterCatalogByCodeOrName(
      byStatus,
      q,
      (r) => r.code,
      (r) => `${r.title} ${r.position_name ?? ''} ${r.position_code ?? ''}`,
    );
  }, [templates, statusFilter, q]);

  const paged = useMemo(
    () => paginateCatalogRows(filtered, page, SETTINGS_CATALOG_PAGE_SIZE),
    [filtered, page],
  );

  useEffect(() => {
    setPage(1);
  }, [q, statusFilter]);

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
      // List row still renders view honesty
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
          description: 'Nội dung đã cập nhật — F5 để xác nhận.',
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
          description: 'Phát hành từ danh sách khi đủ trường bắt buộc.',
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
    if (!publishTemplate) return;
    if (!isJdTemplateDraft(row)) {
      toast({
        title: 'Không phát hành được',
        description: 'Chỉ phát hành được bản Nháp.',
        variant: 'destructive',
      });
      return;
    }
    setPublishingId(row.id);
    try {
      await publishTemplate(row.id);
      toast({
        title: 'Đã phát hành Hiệu lực',
        description: `«${row.code}» sẵn sàng gắn YCTD.`,
      });
    } catch (err: unknown) {
      toast({
        title: 'Không phát hành được JD',
        description: toErrorMessage(err, 'Thiếu trường bắt buộc hoặc JD không còn Nháp.'),
        variant: 'destructive',
      });
    } finally {
      setPublishingId(null);
    }
  };

  const onRetire = async (row: HrmJobDescriptionTemplate) => {
    if (
      !window.confirm(`Ngừng dùng JD «${row.code} — ${row.title}»? YCTD lịch sử vẫn giữ mã đã gắn.`)
    ) {
      return;
    }
    try {
      await removeTemplate(row.id);
      toast({
        title: 'Đã ngừng JD',
        description: 'Không còn trong picker YCTD mới.',
      });
    } catch (err: unknown) {
      toast({
        title: 'Không ngừng được JD',
        description: toErrorMessage(err, 'Không ngừng được template JD.'),
        variant: 'destructive',
      });
    }
  };

  const statusFilterSlot = (
    <div className="space-y-1">
      <span className="text-sm font-medium text-xevn-text">Trạng thái</span>
      <Select
        value={statusFilter}
        onValueChange={(v) => setStatusFilter(v as 'all' | JdTemplateLifecycleStatus)}
      >
        <SelectTrigger
          className="h-9 w-full"
          data-testid="settings-jd-master-library-status-filter"
        >
          <SelectValue placeholder="Trạng thái" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả</SelectItem>
          <SelectItem value="draft">Nháp</SelectItem>
          <SelectItem value="active">Hiệu lực</SelectItem>
          <SelectItem value="retired">Ngừng</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <>
      <SettingsCatalogScreenShell
        title="Thư viện JD"
        description="Danh sách mô tả công việc theo vị trí — Sửa mở cấu hình nhóm/trường (writer). Catalog trường/nhóm/pack: tab «Cấu hình trường JD»."
        testId="settings-jd-master-library"
        compact
        searchValue={q}
        onSearchChange={setQ}
        searchPlaceholder="Tìm theo mã, tiêu đề hoặc vị trí…"
        onRefresh={() => void refetch()}
        refreshing={loading}
        onAdd={openCreate}
        addLabel="Thêm JD"
        filterSlot={statusFilterSlot}
        footerSlot={
          <SettingsCatalogPagination
            page={paged.page}
            totalPages={paged.totalPages}
            total={paged.total}
            pageSize={SETTINGS_CATALOG_PAGE_SIZE}
            onPageChange={setPage}
            testId="settings-jd-master-library-pagination"
          />
        }
      >
        {error ? (
          <div
            className="mb-3 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            role="alert"
          >
            {error}
          </div>
        ) : null}
        {loading && templates.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground">Đang tải…</div>
        ) : (
          <Table data-testid="settings-jd-master-library-table" className="min-w-[720px]">
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
              {paged.slice.length === 0 ? (
                <TableRow data-testid="settings-jd-master-library-empty">
                  <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                    {templates.length === 0 ? (
                      <div className="mx-auto max-w-md space-y-3">
                        <p>{JD_MASTER_LIBRARY_EMPTY_PRIMARY}</p>
                        <Button type="button" variant="outline" size="sm" onClick={openCreate}>
                          Thêm JD
                        </Button>
                        <p>
                          <Link
                            to={`/settings${settingsTabQuery(JD_DYNAMIC_CFG_TAB_ID)}`}
                            className="font-medium text-primary underline"
                            data-testid="settings-jd-master-library-cta-jd-dynamic"
                          >
                            Mở Cấu hình trường JD
                          </Link>
                        </p>
                      </div>
                    ) : (
                      'Không có JD khớp tìm kiếm hoặc bộ lọc.'
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                paged.slice.map((row) => {
                  const status = resolveJdTemplateStatus(row);
                  const label = jdTemplateStatusLabelVi(status);
                  return (
                    <TableRow key={row.id} data-testid="settings-jd-master-library-row">
                      <TableCell className="font-mono text-xs">{row.code}</TableCell>
                      <TableCell className="font-medium">{row.title}</TableCell>
                      <TableCell>
                        {row.position_name ||
                          (row.position_code
                            ? resolveJobTitleLabel(positionOptions, row.position_code)
                            : row.position_code || '—')}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={jdTemplateStatusChipClass(status)}
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
                            data-testid="settings-jd-master-library-view"
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
                                data-testid="settings-jd-master-library-publish"
                              >
                                <Send className="mr-1 h-4 w-4" />
                                Phát hành
                              </Button>
                            </PermissionGate>
                          ) : null}
                          {!isJdTemplateRetired(row) ? (
                            <PermissionGate module="recruitment" action="update">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => openEdit(row)}
                                data-testid="settings-jd-master-library-edit"
                              >
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
                                data-testid="settings-jd-master-library-retire"
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
      </SettingsCatalogScreenShell>

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
          dialogTestId={JD_MASTER_LIBRARY_WRITER_DIALOG_TEST_ID}
        />
      ) : null}

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent
          className={HRM_DIALOG_FULL_VIEWPORT_SCROLL_CLASS}
          data-hrm-dialog-portal="parent"
        >
          <DialogHeader>
            <DialogTitle>Xem JD</DialogTitle>
          </DialogHeader>
          {viewLoading ? (
            <p className="text-sm text-muted-foreground">Đang tải chi tiết…</p>
          ) : viewRow ? (
            <JdTemplateViewPanel row={viewRow} showEmptyFields={true} />
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
