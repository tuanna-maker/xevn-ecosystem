/**
 * @CODE-MEMORY
 * Screen:     EmployeeProfile → tab Giấy tờ (UC-BP-CORE-03)
 * UC:         UC-BP-CORE-03 · FR-UC-BP-CORE-03 · AC-CORE-03-06..08
 * BR:         BR-BP-DOC-01 · BR-PLT-02/05 · BR-CORE-03-PATH · O1–O12
 * SRS:        SRS_HRM_ENTERPRISE.md FR-UC-BP-CORE-03 Diễn biến #1–#2
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-CORE-03-CLUSTER-API-01.md F-CORE-CHK-01
 * Purpose:    Checklist giấy tờ hồ sơ — picker DOC EFF; Nộp→submitted · Xác nhận→approved;
 *             toast invent KEY; F5; empty OK U65. Network document-checklist* only ·
 *             Settings DOC/ET RETAIN · DENY Nest /core · FE invent DOC SoT · required starter ·
 *             CORE-07/personnel/printable DONE · reopen sealed J-*.
 * WorkItem:   PO-HRM-MVP-GD1-CORE-03-CLUSTER-FE-01
 * Coded:      2026-08-09
 * Callers:    EmployeeProfile activeTab=documents
 * Callees:    useEmployeeDocumentChecklist · useEmpDocumentTypesEffective · CatalogSearchPicker · empCoreChkRing
 * must_keep: SoftDel prefer; U65; honesty false; C-SLICE; DOC/ET Settings paths RETAIN
 * ADR:        docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md §8–§10
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  CheckCircle2,
  ClipboardList,
  FileUp,
  Loader2,
  Plus,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { CatalogSearchPicker } from '@/components/common/CatalogSearchPicker';
import { useEmpDocumentTypesEffective } from '@/hooks/useEmpDocumentTypesEffective';
import {
  useEmployeeDocumentChecklist,
  type DocumentChecklistFormData,
} from '@/hooks/useEmployeeDocumentChecklist';
import {
  canApproveChkItem,
  canReopenChkItem,
  canSubmitChkItem,
  chkStatusLabelFallback,
  CORE_CHK_UAT_HONESTY,
} from '@/lib/empCoreChkRing';
import { formatEmpDocumentTypeDisplay } from '@/lib/empDocumentTypeCatalog';

interface EmployeeDocumentChecklistProps {
  employeeId: string;
}

const emptyForm = (): DocumentChecklistFormData => ({
  documentTypeKey: '',
  fileRef: '',
});

function statusBadgeClass(status: string): string {
  const s = status.trim().toLowerCase();
  if (s === 'approved') return 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100';
  if (s === 'submitted') return 'bg-amber-100 text-amber-800 hover:bg-amber-100';
  return 'bg-slate-100 text-slate-700 hover:bg-slate-100';
}

export function EmployeeDocumentChecklist({ employeeId }: EmployeeDocumentChecklistProps) {
  const {
    items,
    loading,
    mutating,
    addItem,
    submitItem,
    approveItem,
    reopenItem,
    archiveItem,
  } = useEmployeeDocumentChecklist(employeeId);

  const {
    documentTypeOptions,
    isLoading: catalogLoading,
    items: catalogItems,
  } = useEmpDocumentTypesEffective();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<DocumentChecklistFormData>(emptyForm);
  const [submitFileRef, setSubmitFileRef] = useState<Record<string, string>>({});

  void CORE_CHK_UAT_HONESTY; // honesty false — do not flip

  const handleOpenAdd = () => {
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const ok = await addItem(form);
    if (ok) setDialogOpen(false);
  };

  return (
    <Card
      className="rounded-card border-xevn-border shadow-soft"
      data-testid="hdsd-emp-document-checklist"
    >
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0 pb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <ClipboardList className="h-4 w-4 text-primary" aria-hidden />
          </div>
          <div className="min-w-0">
            <CardTitle className="text-base font-semibold text-xevn-text">
              Checklist giấy tờ
            </CardTitle>
            <p className="text-xs text-xevn-textSecondary">
              Nộp → submitted · Xác nhận → approved · catalog DOC hiệu lực (không starter cứng)
            </p>
          </div>
        </div>
        <Button
          type="button"
          size="sm"
          className="shrink-0"
          onClick={handleOpenAdd}
          disabled={mutating}
          data-testid="hdsd-emp-chk-add"
        >
          <Plus className="mr-1.5 h-4 w-4" aria-hidden />
          Thêm dòng
        </Button>
      </CardHeader>

      <CardContent className="space-y-3">
        {loading ? (
          <div
            className="flex items-center justify-center gap-2 py-10 text-sm text-xevn-textSecondary"
            data-testid="hdsd-emp-chk-loading"
          >
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Đang tải checklist…
          </div>
        ) : items.length === 0 ? (
          <div
            className="rounded-lg border border-dashed border-xevn-border bg-slate-50/80 px-4 py-8 text-center"
            data-testid="hdsd-emp-chk-empty"
          >
            <p className="text-sm font-medium text-xevn-text">Chưa có dòng checklist</p>
            <p className="mt-1 text-xs text-xevn-textSecondary">
              Empty hợp lệ (U65 — không seed). Thêm mã từ catalog hiệu lực hoặc tạo loại giấy tờ
              trong Cài đặt.
            </p>
            <Button asChild variant="link" className="mt-2 h-auto p-0 text-primary" size="sm">
              <Link to="/settings?tab=emp-document-types" data-testid="hdsd-emp-chk-open-settings-doc">
                Mở Cài đặt → Loại giấy tờ EMP
              </Link>
            </Button>
          </div>
        ) : (
          <ul className="space-y-2" data-testid="hdsd-emp-chk-list">
            {items.map((row) => {
              const label = formatEmpDocumentTypeDisplay(row.documentTypeKey, row.nameVi);
              const statusLabel =
                (row.statusLabel ?? '').trim() || chkStatusLabelFallback(row.status);
              return (
                <li
                  key={row.id}
                  className="rounded-lg border border-xevn-border bg-white px-3 py-3"
                  data-testid={`hdsd-emp-chk-row-${row.id}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 space-y-1">
                      <p className="text-sm font-medium text-xevn-text" data-testid="hdsd-emp-chk-name">
                        {label}
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge
                          className={statusBadgeClass(row.status)}
                          data-testid="hdsd-emp-chk-status-label"
                        >
                          {statusLabel}
                        </Badge>
                        {row.required ? (
                          <Badge variant="outline" className="text-xs" data-testid="hdsd-emp-chk-required">
                            Bắt buộc
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs text-xevn-textSecondary">
                            Tùy chọn
                          </Badge>
                        )}
                        {row.blocksActivation ? (
                          <Badge variant="outline" className="text-xs text-amber-800">
                            Chặn kích hoạt (peer CORE-07)
                          </Badge>
                        ) : null}
                      </div>
                      {row.fileRef ? (
                        <p className="truncate text-xs text-xevn-textSecondary" title={row.fileRef}>
                          File: {row.fileRef}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {canSubmitChkItem(row.status) ? (
                        <div className="flex items-center gap-1">
                          <Input
                            className="h-8 w-36 text-xs"
                            placeholder="file_ref (tuỳ chọn)"
                            value={submitFileRef[row.id] ?? ''}
                            onChange={(e) =>
                              setSubmitFileRef((m) => ({ ...m, [row.id]: e.target.value }))
                            }
                            data-testid="hdsd-emp-chk-file-ref"
                          />
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            disabled={mutating}
                            onClick={() => void submitItem(row.id, submitFileRef[row.id])}
                            data-testid="hdsd-emp-chk-submit"
                          >
                            <FileUp className="mr-1 h-3.5 w-3.5" aria-hidden />
                            Nộp
                          </Button>
                        </div>
                      ) : null}

                      {canApproveChkItem(row.status) ? (
                        <Button
                          type="button"
                          size="sm"
                          disabled={mutating}
                          onClick={() => void approveItem(row.id)}
                          data-testid="hdsd-emp-chk-approve"
                        >
                          <CheckCircle2 className="mr-1 h-3.5 w-3.5" aria-hidden />
                          Xác nhận
                        </Button>
                      ) : null}

                      {canReopenChkItem(row.status) ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={mutating}
                          onClick={() => void reopenItem(row.id)}
                          data-testid="hdsd-emp-chk-reopen"
                        >
                          <RotateCcw className="mr-1 h-3.5 w-3.5" aria-hidden />
                          Nộp lại
                        </Button>
                      ) : null}

                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="text-xevn-textSecondary"
                        disabled={mutating}
                        onClick={() => {
                          if (
                            window.confirm(
                              `Ẩn dòng «${label}»? (soft-archive — không hard-delete)`,
                            )
                          ) {
                            void archiveItem(row.id);
                          }
                        }}
                        data-testid="hdsd-emp-chk-archive"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden />
                      </Button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md" data-testid="hdsd-emp-chk-add-dialog">
          <DialogHeader>
            <DialogTitle>Thêm dòng checklist</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid gap-1.5">
              <Label>Loại giấy tờ (catalog hiệu lực)</Label>
              <CatalogSearchPicker
                options={documentTypeOptions}
                value={form.documentTypeKey}
                onValueChange={(value) => setForm((f) => ({ ...f, documentTypeKey: value }))}
                placeholder="Chọn mã loại giấy tờ…"
                loading={catalogLoading}
                emptyHint={
                  catalogItems.length === 0
                    ? 'Chưa có loại giấy tờ hiệu lực — tạo trong Cài đặt (open catalog, không starter cứng).'
                    : undefined
                }
                disabled={catalogLoading || mutating}
                data-testid="hdsd-emp-chk-doc-picker"
              />
              <p className="text-xs text-xevn-textSecondary">
                Cờ bắt buộc mặc định lấy từ catalog (`required_by_default`) — FE không hardcode starter.
              </p>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="emp-chk-file-ref">Tham chiếu file (tuỳ chọn)</Label>
              <Input
                id="emp-chk-file-ref"
                value={form.fileRef}
                onChange={(e) => setForm((f) => ({ ...f, fileRef: e.target.value }))}
                placeholder="storage ref / URL nội bộ"
                data-testid="hdsd-emp-chk-add-file-ref"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Huỷ
            </Button>
            <Button
              type="button"
              onClick={() => void handleSave()}
              disabled={mutating || !form.documentTypeKey.trim()}
              data-testid="hdsd-emp-chk-save"
            >
              {mutating ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : null}
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
