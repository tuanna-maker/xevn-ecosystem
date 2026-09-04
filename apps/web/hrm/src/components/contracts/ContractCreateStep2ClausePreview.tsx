/**
 * @CODE-MEMORY
 * Screen:     /contracts wizard Bước 2 — palette/canvas/preview (no template junction mutate)
 * WorkItem:   PO-HRM-CTR-CREATE-REDESIGN-FE-02 · FE-03 · FE-04-DND-PARENT-02 · HRM-CTR-CREATE-REDESIGN-FE-02
 * must_keep:  cấm syncContractTemplateClauseBind · preview ephemeral
 *
 * @CODE-MEMORY-CHANGE 2026-08-11 PO-HRM-CTR-WORKSPACE-FE-LAYOUT-BIND-01
 * What: initialClauseLayout on readOnly — bind GET clause_layout; skip library list APIs
 * Why: SA-01 §4.1 one GET round-trip for view shell
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Draggable, Droppable, type DropResult } from '@hello-pangea/dnd';
import { HrmDragDropContext } from '@/components/contracts/HrmDragDropContext';
import { Eye, FileDown, FileText, GripVertical, Loader2, Plus, Save, X } from 'lucide-react';
import {
  createContractPrintVersion,
  fetchContractPrintPdf,
  listContractClauses,
  listContractTemplates,
  type HrmContractClauseLayoutItem,
  type HrmContractClauseRecord,
  type HrmContractPreviewResult,
  type HrmContractTemplateRecord,
} from '@/integrations/hrmApi';
import {
  clauseIdsFromTemplate,
  filterClausesForPack,
  placeClauseOnCanvas,
  reorderByIndex,
} from '@/lib/contractClauseOrder';
import {
  buildContractPrintFieldOverrides,
  normalizePreviewMissingFields,
} from '@/lib/contractPrintFieldOverrides';
import {
  missingClauseLabels,
  previewMergedSummaryRows,
  shouldShowDriverPreviewBlock,
} from '@/lib/contractPackPreviewUx';
import {
  contractPrintPdfFilename,
  extractIssueBlockedDetails,
  formatIssueBlockedMissingSummary,
  isIssueGateErrorCode,
} from '@/lib/contractPrintVersionUx';
import { activeTemplatesForPicker } from '@/lib/contractTemplateCatalog';
import { sameNodeDragBind } from '@/lib/jdDndSameNodeProps';
import { ApiClientError, toErrorMessage } from '@/lib/apiError';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import {
  previewContractCreatePrint,
  putContractPrintOverlay,
  type ContractCreateContextSnapshot,
} from '@/lib/contractCreateApi';
import {
  clauseIdsFromLayout,
  clauseLayoutToLibraryRecords,
} from '@/lib/contractWorkspaceLayoutBind';
import { ContractClauseOverrideEditor } from '@/components/contracts/ContractClauseOverrideEditor';
import { downloadContractAsDocx, type ContractExportDocxData } from '@/lib/contractExportDocx';

export type ContractCreateStep2ClausePreviewProps = {
  companyId: string;
  contractId: string;
  employeeId?: string | null;
  packCode: string;
  templateId: string;
  templateCode: string;
  workLocation: string;
  driverOverrides: Record<string, string>;
  onCanvasChange?: () => void;
  /** View mode — disable DnD/mutate; preview read-only */
  readOnly?: boolean;
  /** View mode — bind GET clause_layout (one round-trip; skip library list APIs). */
  initialClauseLayout?: HrmContractClauseLayoutItem[] | null;
  contextSnapshot?: ContractCreateContextSnapshot | null;
};

export function ContractCreateStep2ClausePreview({
  companyId,
  contractId,
  packCode,
  templateId,
  templateCode,
  workLocation,
  driverOverrides,
  onCanvasChange,
  readOnly = false,
  initialClauseLayout = null,
  contextSnapshot = null,
}: ContractCreateStep2ClausePreviewProps) {
  const [templates, setTemplates] = useState<HrmContractTemplateRecord[]>([]);
  const [clauses, setClauses] = useState<HrmContractClauseRecord[]>([]);
  const [canvasIds, setCanvasIds] = useState<string[]>([]);
  const [libraryReady, setLibraryReady] = useState(false);
  const [libraryError, setLibraryError] = useState<string | null>(null);
  const [preview, setPreview] = useState<HrmContractPreviewResult | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [overlayNote, setOverlayNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const fieldOverrides = useMemo(
    () => ({
      work_location: workLocation,
      ...driverOverrides,
    }),
    [workLocation, driverOverrides],
  );

  const getLayoutBind = readOnly && initialClauseLayout != null;

  useEffect(() => {
    if (!getLayoutBind) return;
    const layout = initialClauseLayout ?? [];
    setClauses(clauseLayoutToLibraryRecords(layout, companyId));
    setCanvasIds(clauseIdsFromLayout(layout));
    setLibraryReady(true);
    setLibraryError(null);
  }, [getLayoutBind, initialClauseLayout, companyId]);

  useEffect(() => {
    if (getLayoutBind) return;
    let cancelled = false;
    (async () => {
      setLibraryReady(false);
      setLibraryError(null);
      try {
        const [tplRes, clRes] = await Promise.all([
          listContractTemplates({ company_id: companyId, status: 'active' }),
          listContractClauses({ company_id: companyId, status: 'active' }),
        ]);
        if (cancelled) return;
        setTemplates(tplRes.items);
        setClauses(clRes.items);
        const tpl = activeTemplatesForPicker(tplRes.items).find(
          (t) =>
            t.id === templateId ||
            (t.template_code ?? t.code).trim().toUpperCase() === templateCode.trim().toUpperCase(),
        );
        if (tpl) {
          const ids = clauseIdsFromTemplate(tpl);
          const seen = new Set<string>();
          setCanvasIds(ids.filter((id) => {
            if (seen.has(id)) return false;
            seen.add(id);
            return true;
          }));
        }
        setLibraryReady(true);
      } catch (err: unknown) {
        if (!cancelled) {
          setLibraryError(toErrorMessage(err, 'Không tải thư viện điều khoản / mẫu.'));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [companyId, templateId, templateCode, getLayoutBind]);

  /** Drop orphan/duplicate canvas ids after library load (template junction vs catalog). */
  useEffect(() => {
    if (!libraryReady || clauses.length === 0) return;
    const known = new Set(clauses.map((c) => c.id));
    setCanvasIds((prev) => {
      const seen = new Set<string>();
      const next = prev.filter((id) => {
        if (!known.has(id) || seen.has(id)) return false;
        seen.add(id);
        return true;
      });
      return next.length === prev.length && seen.size === prev.length ? prev : next;
    });
  }, [libraryReady, clauses]);

  const paletteClauses = useMemo(() => {
    const filtered = filterClausesForPack(clauses, packCode);
    const seen = new Set<string>();
    return filtered.filter((c) => {
      if (seen.has(c.id)) return false;
      seen.add(c.id);
      return true;
    });
  }, [clauses, packCode]);

  const canvasClauses = useMemo(() => {
    const map = new Map(clauses.map((c) => [c.id, c]));
    const seen = new Set<string>();
    return canvasIds
      .filter((id) => {
        if (seen.has(id)) return false;
        seen.add(id);
        return map.has(id);
      })
      .map((id) => map.get(id)!);
  }, [canvasIds, clauses]);

  const missingFieldItems = useMemo(
    () => normalizePreviewMissingFields(preview?.missing_fields),
    [preview?.missing_fields],
  );
  const missingClauseItems = useMemo(
    () => missingClauseLabels(preview?.missing_clauses),
    [preview?.missing_clauses],
  );
  const previewSummaryRows = useMemo(
    () => previewMergedSummaryRows(preview?.merged_fields),
    [preview?.merged_fields],
  );

  const clauseIdFromDraggable = (draggableId: string) => {
    if (draggableId.startsWith('cpal-')) return draggableId.slice(5);
    if (draggableId.startsWith('ccan-')) return draggableId.slice(5);
    return draggableId;
  };

  const notifyCanvasChange = useCallback(() => {
    onCanvasChange?.();
  }, [onCanvasChange]);

  const addClauseToCanvas = (clauseId: string) => {
    setCanvasIds((prev) => placeClauseOnCanvas(prev, clauseId, prev.length));
    notifyCanvasChange();
  };

  const removeClauseFromCanvas = (clauseId: string) => {
    const clause = clauses.find((c) => c.id === clauseId);
    if (clause?.mandatory) {
      const ok = window.confirm(
        'Điều khoản này là bắt buộc theo mẫu. Bạn có chắc muốn gỡ khỏi hợp đồng?',
      );
      if (!ok) return;
    }
    setCanvasIds((prev) => prev.filter((id) => id !== clauseId));
    notifyCanvasChange();
  };

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === 'ctr-create-canvas' && destination.droppableId === 'ctr-create-canvas') {
      setCanvasIds((prev) => reorderByIndex(prev, source.index, destination.index));
      notifyCanvasChange();
      return;
    }
    if (source.droppableId === 'ctr-create-palette' && destination.droppableId === 'ctr-create-canvas') {
      const id = clauseIdFromDraggable(draggableId);
      setCanvasIds((prev) => placeClauseOnCanvas(prev, id, destination.index));
      notifyCanvasChange();
    }
  };

  const persistOverlay = useCallback(async () => {
    if (canvasIds.length === 0) {
      setOverlayNote(null);
      return;
    }
    const res = await putContractPrintOverlay(contractId, companyId, canvasIds);
    if (!res.ok) {
      setOverlayNote(res.reason);
      return;
    }
    setOverlayNote(null);
  }, [canvasIds, companyId, contractId]);

  const runPreview = async () => {
    setBusy(true);
    setPreviewError(null);
    try {
      await persistOverlay();
      const overrides = buildContractPrintFieldOverrides(fieldOverrides);
      const res = await previewContractCreatePrint(contractId, {
        company_id: companyId,
        pack_code: packCode,
        template_id: templateId || undefined,
        template_code: templateCode || undefined,
        ...(overrides ? { field_overrides: overrides } : {}),
        ...(canvasIds.length > 0 ? { clause_ids: canvasIds } : {}),
      });
      setPreview(res);
      toast({
        title: 'Đã tải bản xem trước',
        description: res.can_issue
          ? 'Đủ điều kiện ban hành — có thể lưu phiên bản in hoặc xuất Word/PDF.'
          : 'Bổ sung field/điều khoản thiếu bên dưới.',
      });
    } catch (err: unknown) {
      setPreview(null);
      setPreviewError(toErrorMessage(err, 'Preview chưa khả dụng.'));
    } finally {
      setBusy(false);
    }
  };

  const saveVersion = async () => {
    setBusy(true);
    try {
      await persistOverlay();
      const overrides = buildContractPrintFieldOverrides(fieldOverrides);
      await createContractPrintVersion(contractId, {
        company_id: companyId,
        pack_code: packCode,
        template_id: templateId || undefined,
        template_code: templateCode || undefined,
        ...(overrides ? { field_overrides: overrides } : {}),
      });
      toast({ title: 'Đã lưu phiên bản in' });
    } catch (err: unknown) {
      const code = err instanceof ApiClientError ? err.code : undefined;
      if (code && isIssueGateErrorCode(code)) {
        const details = extractIssueBlockedDetails(err);
        toast({
          title: 'Không ban hành phiên bản in',
          description: formatIssueBlockedMissingSummary(details),
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Lỗi lưu phiên bản',
          description: toErrorMessage(err, 'Không lưu phiên bản in.'),
          variant: 'destructive',
        });
      }
    } finally {
      setBusy(false);
    }
  };

  const downloadPdf = async () => {
    setBusy(true);
    try {
      const blob = await fetchContractPrintPdf(contractId, { company_id: companyId });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = contractPrintPdfFilename(contractId);
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      toast({
        title: 'Không tải PDF',
        description: toErrorMessage(err, 'PDF chỉ từ phiên bản đã ban hành. Bấm Xem trước hoặc xuất Word.'),
        variant: 'destructive',
      });
    } finally {
      setBusy(false);
    }
  };

  const handleDownloadDocx = () => {
    const emp = contextSnapshot?.employee_party_b;
    const employer = contextSnapshot?.employer_party_a;
    const signer = contextSnapshot?.suggested_signatory;
    const cb = contextSnapshot?.compensation_snapshot;

    const fmtDate = (val?: string | null) => {
      if (!val) return '……/……/……';
      try {
        const d = new Date(val);
        if (isNaN(d.getTime())) return val;
        return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
      } catch {
        return val;
      }
    };

    const docxData: ContractExportDocxData = {
      contractCode: preview?.contract_code || '……/2026/HĐTV-X.E',
      contractName: preview?.contract_name || 'HỢP ĐỒNG THỬ VIỆC',
      contractTypeLabel: preview?.contract_type_label || 'Hợp đồng thử việc',
      effectiveDateDisplay: fmtDate(preview?.effective_date),
      expiryDateDisplay: fmtDate(preview?.expiry_date),

      // Party A
      employerName: employer?.legal_name || 'CÔNG TY TNHH X.E VIỆT NAM',
      employerSignerName: signer?.signer_name || 'Nguyễn Trọng Khánh',
      employerSignerPosition: signer?.signer_position || 'Giám đốc',
      employerAddress: employer?.address || 'Số 4 đường Văn Chỉ, thôn Tam Đa, xã Tam Hưng, TP. Hà Nội',
      employerPhone: employer?.phone || '024.3681.5722',

      // Party B
      employeeCode: emp?.employee_code || '',
      employeeName: emp?.full_name || '',
      employeeDobDisplay: fmtDate(emp?.birth_date),
      employeeIdNumber: emp?.id_number || '',
      employeeIdIssueDate: fmtDate(emp?.id_issue_date),
      employeeIdIssuePlace: emp?.id_issue_place || '',
      employeeAddress: emp?.permanent_address || '',
      employeeDepartment: emp?.department_name || '',
      employeePosition: emp?.job_title || emp?.position || '',
      workLocation: workLocation || 'Theo sự phân công của Công ty',
      workArrangement: 'Toàn thời gian',

      // Financial
      baseSalaryDisplay: cb?.base_salary ? new Intl.NumberFormat('vi-VN').format(cb.base_salary) : '',
      salaryRatioPercent: 100,
    };

    downloadContractAsDocx(docxData);
  };

  return (
    <div className="flex min-h-0 flex-col gap-4" data-testid="ctr-create-step-2" data-company-id={companyId}>
      {libraryError ? (
        <p className="text-sm text-destructive">{libraryError}</p>
      ) : null}
      {overlayNote ? (
        <p className="text-xs text-amber-800 bg-amber-50 rounded-md p-2" data-qa="ctr-overlay-blocked">
          {overlayNote}
        </p>
      ) : null}

      {!libraryReady ? (
        <div className="grid grid-cols-12 gap-4 min-h-[240px]">
          <div className="col-span-4 border rounded-card p-3" data-testid="ctr-create-clause-palette">
            <p className="text-sm font-medium mb-2">Palette điều khoản</p>
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
          <div className="col-span-8 border rounded-card p-3" data-testid="ctr-create-clause-canvas">
            <p className="text-sm font-medium mb-2">Thứ tự điều khoản trên HĐ</p>
            <p className="text-xs text-muted-foreground p-4 text-center">Đang tải thư viện điều khoản…</p>
          </div>
        </div>
      ) : readOnly ? (
        <div className="border rounded-card p-3" data-testid="ctr-create-clause-canvas">
          <p className="text-base font-medium mb-2">Thứ tự điều khoản trên HĐ (chỉ xem)</p>
          <ul className="space-y-2 text-sm" data-testid="ctr-workspace-view-clause-layout">
            {canvasClauses.map((cl, index) => (
              <li key={cl.id} className="rounded border bg-muted/40 p-2">
                <p className="font-medium">
                  {index + 1}. {cl.title_vi ?? cl.code}
                  {cl.mandatory ? (
                    <span className="text-xs text-muted-foreground ml-1">(bắt buộc)</span>
                  ) : null}
                </p>
                {cl.body_vi?.trim() ? (
                  <p className="text-muted-foreground whitespace-pre-wrap mt-1 text-xs">
                    {cl.body_vi}
                  </p>
                ) : null}
                {templateCode ? (
                  <ContractClauseOverrideEditor templateCode={templateCode} clauseId={cl.id} />
                ) : null}
              </li>
            ))}
            {canvasClauses.length === 0 ? (
              <li className="text-muted-foreground p-4 text-center">Chưa có điều khoản trên mẫu.</li>
            ) : null}
          </ul>
        </div>
      ) : (
        <HrmDragDropContext onDragEnd={onDragEnd}>
          <div
            className="grid grid-cols-12 gap-4 min-h-[280px]"
            data-testid="ctr-create-clause-dnd-ready"
          >
            <div className="col-span-12 lg:col-span-4 border rounded-card p-3" data-testid="ctr-create-clause-palette">
              <p className="text-base font-medium mb-2">Palette điều khoản</p>
              <p className="text-sm text-muted-foreground mb-2">Kéo thả hoặc bấm «Thêm».</p>
              <Droppable droppableId="ctr-create-palette" isDropDisabled>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="space-y-1 max-h-[min(40vh,320px)] overflow-y-auto"
                  >
                    {paletteClauses.map((cl, index) => (
                      <Draggable key={`pal-${cl.id}`} draggableId={`cpal-${cl.id}`} index={index}>
                        {(dragProvided) => {
                          const bind = sameNodeDragBind(dragProvided);
                          return (
                            <div
                              ref={bind.ref}
                              {...bind.props}
                              className="flex cursor-grab items-center gap-2 rounded border bg-background p-2 text-sm active:cursor-grabbing"
                            >
                              <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                              <span className="truncate flex-1">{cl.title_vi ?? cl.code}</span>
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                className="h-8 shrink-0 text-xs px-2"
                                onPointerDown={(e) => e.stopPropagation()}
                                onClick={() => addClauseToCanvas(cl.id)}
                                data-testid={`ctr-clause-add-${cl.id}`}
                              >
                                <Plus className="h-3.5 w-3.5 mr-0.5" />
                                Thêm
                              </Button>
                            </div>
                          );
                        }}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>

            <div className="col-span-12 lg:col-span-8 border rounded-card p-3" data-testid="ctr-create-clause-canvas">
              <p className="text-base font-medium mb-2">Thứ tự điều khoản trên HĐ</p>
              <Droppable droppableId="ctr-create-canvas">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="min-h-[220px] space-y-1 rounded border-dashed border p-2 max-h-[min(45vh,360px)] overflow-y-auto"
                  >
                    {canvasClauses.length === 0 ? (
                      <p className="text-sm text-muted-foreground p-4 text-center">
                        Kéo điều khoản từ trái hoặc bấm «Thêm» — sau đó có thể «Gỡ» trước khi Lưu / Xem trước.
                      </p>
                    ) : (
                      canvasClauses.map((cl, index) => (
                        <Draggable
                          key={`can-${cl.id}-${index}`}
                          draggableId={`ccan-${cl.id}`}
                          index={index}
                        >
                          {(dragProvided) => {
                            const bind = sameNodeDragBind(dragProvided);
                            return (
                              <div
                                ref={bind.ref}
                                {...bind.props}
                                className="rounded border bg-muted/40 p-2 text-sm"
                              >
                                <div className="flex cursor-grab items-center gap-2 active:cursor-grabbing">
                                  <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                                  <span className="flex-1">
                                    {index + 1}. {cl.title_vi ?? cl.code}
                                  </span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 shrink-0 text-destructive hover:text-destructive"
                                    onPointerDown={(e) => e.stopPropagation()}
                                    onClick={() => removeClauseFromCanvas(cl.id)}
                                    data-testid={`ctr-clause-remove-${cl.id}`}
                                    aria-label="Gỡ điều khoản"
                                  >
                                    <X className="h-4 w-4 mr-1" />
                                    Gỡ
                                  </Button>
                                </div>
                                {templateCode ? (
                                  <ContractClauseOverrideEditor templateCode={templateCode} clauseId={cl.id} />
                                ) : null}
                              </div>
                            );
                          }}
                        </Draggable>
                      ))
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </div>
        </HrmDragDropContext>
      )}

      {!readOnly ? (
        <div className="flex flex-wrap gap-2 text-base shrink-0 sticky bottom-0 bg-background/95 py-1 backdrop-blur-sm border-t border-border/60 -mx-1 px-1">
          <Button type="button" variant="outline" disabled={busy} onClick={() => persistOverlay()}>
            Đồng bộ thứ tự (overlay)
          </Button>
          <Button type="button" size="sm" disabled={busy} onClick={runPreview} data-testid="ctr-create-preview-btn">
            <Eye className="h-4 w-4 mr-1" />
            Xem trước
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={busy || !preview?.can_issue}
            onClick={saveVersion}
          >
            <Save className="h-4 w-4 mr-1" />
            Lưu phiên bản in
          </Button>
          <Button type="button" size="sm" variant="outline" disabled={busy} onClick={downloadPdf}>
            <FileDown className="h-4 w-4 mr-1" />
            Tải PDF
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={handleDownloadDocx}
            data-testid="ctr-export-docx-btn"
          >
            <FileText className="h-4 w-4 mr-1 text-blue-600" />
            Xuất Word (.docx)
          </Button>
        </div>
      ) : null}

      {!readOnly ? (
        <div
          className="rounded-card border p-4 space-y-3"
          data-testid="ctr-create-preview-panel"
        >
          <p className="text-sm font-medium">Preview hợp đồng</p>
          {previewError ? <p className="text-sm text-destructive">{previewError}</p> : null}
          {preview ? (
            <>
              {previewSummaryRows.length > 0 ? (
                <ul className="text-xs space-y-1">
                  {previewSummaryRows.map((row) => (
                    <li key={row.key}>
                      <span className="text-muted-foreground">{row.label}:</span> {row.value}
                    </li>
                  ))}
                </ul>
              ) : null}
              {preview.sections && preview.sections.length > 0 ? (
                <div className="space-y-2 text-sm border rounded-md p-3 bg-white">
                  {preview.sections.map((sec, i) => (
                    <div key={i}>
                      {sec.title ? <p className="font-medium">{sec.title}</p> : null}
                      {sec.body ? <p className="text-muted-foreground whitespace-pre-wrap">{sec.body}</p> : null}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Chưa có body preview.</p>
              )}
              {missingFieldItems.length > 0 ? (
                <div data-testid="ctr-print-missing-fields">
                  <p className="text-xs font-medium">Field thiếu:</p>
                  <ul className="text-xs list-disc pl-4">
                    {missingFieldItems.map((m) => (
                      <li key={m.key}>{m.label_vi ?? m.key}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {missingClauseItems.length > 0 ? (
                <ul className="text-xs list-disc pl-4">
                  {missingClauseItems.map((label, i) => (
                    <li key={`missing-clause-${i}-${label}`}>{label}</li>
                  ))}
                </ul>
              ) : null}
              {shouldShowDriverPreviewBlock({
                packCode: preview.pack_code || packCode,
                showDriverLicenseBlock: preview.show_driver_license_block,
              }) ? (
                <p className="text-xs text-muted-foreground">Yêu cầu GPLX cho gói Lái xe.</p>
              ) : null}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Bấm «Xem trước» sau khi gán điều khoản.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
