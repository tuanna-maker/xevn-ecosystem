/**
 * @deprecated PO-HRM-CTR-WORKSPACE-WAVE-G3 — orphan panel; use `useContractPrintSpine` +
 * `ContractWorkspaceViewBody` / `ContractCreateStep2ClausePreview` instead.
 */
/**
 * @CODE-MEMORY
 * Screen:     /contracts — spine in/preview HĐLĐ (sau registry CRUD)
 * UC:         FR-UC-BP-CORE-09b · 09c · AC-CTR-PRINT-01..08
 * BR:         BR-CD-F5-01 salary off body; BR-CTR-CL-03/04; honesty printable=false
 * SRS:        docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-SPEC-01.md §D
 * TechSpec:   docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-TECHSPEC-01.md
 * Data:       DATA-01 §5.8–5.12 pack-resolve · preview · print-versions · pdf
 * Purpose:    Chọn pack/mẫu + clause order; preview/lưu phiên bản/PDF khi BE ready —
 *             honest empty/error khi API chưa live; không fake seed.
 * WorkItem:   PO-HRM-CONTRACT-LEGAL-PRINT-FE-01
 * Coded:      2026-08-06
 * Callers:    pages/Contracts.tsx (edit/create print section)
 * Callees:    hrmApi preview/print · contractClauseOrder · sameNodeDragBind
 * must_keep:  UF-HRM-02 registry CRUD; no salary free-type; DnD same-node handle
 * solid_convention_ack: FE binds BE display-ready preview/clauses — no FE merge invent
 * LastVerified: docs/qa/evidence/po-hrm-contract-legal-print-fe-03.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-06 PO-HRM-CONTRACT-LEGAL-PRINT-FE-02
 * What: Callers unchanged (pass company_id to hrmApi); client strips body company_id → query
 * Why: R-CTR-PREVIEW-COMPANY-ID-BODY P0 — preview POST 400 HRM-VAL-001
 * must_keep: Settings DnD FE-01 · UF-HRM-02 · honesty printable=false
 *
 * @CODE-MEMORY-CHANGE 2026-08-06 PO-HRM-CONTRACT-LEGAL-PRINT-FE-03
 * What: field_overrides UI (Nơi làm việc + Đ.21 blockers from missing_fields) → preview/save-version
 * Why: R-CTR-PRINT-CAN-ISSUE — can_issue=false missing work_location; save-version disabled
 * must_keep: FE-02 body no company_id; UF-HRM-02; Settings CL/TPL; honesty false
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-FE-01
 * change_mode: EXPAND
 * What: Picker = all active API templates (open catalog #9+); echo template_code to parent; preview sends code
 * Why: DYNAMIC LOCK AC-11 — cấm hardcode 8-only; bind any active template_code
 * must_keep: print-spine · UF-HRM-02 · Q-CTR · honesty printable=false · field_overrides FE-03
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CL-SNAPSHOT-BIND-FE-01
 * change_mode: FIX
 * What: Trước preview/lưu bản in — syncContractTemplateClauseBind(canvasIds) cho template đang chọn
 * Why: Issue POST dùng BE resolveClausesForPack từ junction; canvas DnD phải persist clause_ids + code snapshot
 * must_keep: FE-02 query-only company_id · CLQA2 PATCH · printable=false
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-ctr-clause-snapshot-bind-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-CORE-09B-CLUSTER-FE-01
 * change_mode: UPGRADE · preserve_default
 * What: LIVE pack-resolve suggest banner + MVP pack VI; ephemeral preview fidelity
 *       (sections/clauses/merged summary/missing/can_issue/cb_masked/DRIVER block);
 *       surface TPL-NONE / PACK-INVALID / TPL-PACK-MISMATCH / DRIVER; VER/PDF = peer 09c OUT
 * Why: API-01 CONFIRMED RETAIN · UC-BP-CORE-09b · AC-CORE-09B-01..09 · J-HRM-CORE-09B-01..04
 * must_keep: UF-HRM-02 registry F5 · CORE-09a CL consume · Nest /core DENY · printable=false
 *            · no FE hardcode long legal · preview MUST NOT INSERT VER · CORE-08/02/01 seals
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-core-09b-cluster-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-CORE-09C-CLUSTER-FE-01
 * change_mode: UPGRADE · preserve_default
 * What: Bind Lưu phiên bản + PDF to LIVE print-versions* / pdf; list pack_code+version_no
 *       +status+issued_at after 201; ISSUE-BLOCKED/DRIVER/TERM/TPL-NONE + missing lists;
 *       PDF Blob %PDF from issued snapshot only · VERSION-NOT-ISSUED; PREV ephemeral must_keep
 * Why: API-01 CONFIRMED RETAIN · UC-BP-CORE-09c · AC-CORE-09C-* · AC-CTR-PRINT-01/04/05/06/08
 * must_keep: CORE-09b PACK+PREV · CORE-09a CL · CORE-08/02/01 · Nest /core DENY
 *            · printable=false · no invent 09d TPL DONE · no FE live-library PDF remerge
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-core-09c-cluster-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-CORE-09D-CLUSTER-FE-01
 * change_mode: UPGRADE · preserve_default
 * What: Picker open catalog display-ready · canvas from clauses[] · sync = PUT /clauses SoT
 * Why: UC-BP-CORE-09d · OBS clause FP empty · CORR open catalog · matrix family only
 * must_keep: CORE-09c VER/PDF ≠ printable · CORE-09b PREV ephemeral · Nest /core DENY
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-core-09d-cluster-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-CORE-09-CLUSTER-FE-01
 * change_mode: ADD · preserve_default
 * What: Parent CORE-09 — ZERO-TPL CTA · mandatory block surfaces · honesty footer
 *       09a–d≠DONE · printable false · CORE-07 GATE/ACT RETAIN · PREV merged_fields/
 *       missing/can_issue/cb_masked bind RETAIN · Nest /core CTR=0 · no Word invent
 * Why: API-01 CONFIRMED RETAIN · UC-BP-CORE-09 · AC-CORE-09-* · J-HRM-CORE-09-01..06
 * must_keep: 09b PACK+PREV · 09c VER/PDF ≠ printable · 09d TPL · 09a CL · CORE-07/06 seals
 *            · registry without template (AC-CTR-XEVN-08) · U65 zero-seed
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-core-09-cluster-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-11 PO-HRM-CTR-WORKSPACE-WAVE-G3
 * What: Re-export useContractPrintSpine — shared preview/PDF hook for workspace view mode
 * Why: Wire orphan panel; view mode uses hook directly via ContractWorkspaceViewBody
 */
export { useContractPrintSpine } from '@/hooks/useContractPrintSpine';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DragDropContext, Draggable, Droppable, type DropResult } from '@hello-pangea/dnd';
import { Eye, FileDown, GripVertical, Loader2, Save } from 'lucide-react';
import {
  createContractPrintVersion,
  fetchContractPrintPdf,
  getContractPrintVersion,
  listContractClauses,
  listContractPrintVersions,
  listContractTemplates,
  previewContractPrint,
  resolveContractPack,
  syncContractTemplateClauseBind,
  type HrmContractClauseRecord,
  type HrmContractPackResolveResult,
  type HrmContractPreviewResult,
  type HrmContractPrintVersionRecord,
  type HrmContractTemplateRecord,
} from '@/integrations/hrmApi';
import {
  clauseIdsFromTemplate,
  filterClausesForPack,
  placeClauseOnCanvas,
  removeClauseFromCanvas,
  reorderByIndex,
} from '@/lib/contractClauseOrder';
import {
  buildContractPrintFieldOverrides,
  labelForPrintOverrideField,
  normalizePreviewMissingFields,
  resolvePrintOverrideInputKeys,
} from '@/lib/contractPrintFieldOverrides';
import {
  formatPackSuggestReason,
  missingClauseLabels,
  packLabelVi,
  packsForPicker,
  previewMergedSummaryRows,
  shouldShowDriverPreviewBlock,
} from '@/lib/contractPackPreviewUx';
import {
  contractPrintPdfFilename,
  extractIssueBlockedDetails,
  formatIssueBlockedMissingSummary,
  formatPrintVersionIssuedAt,
  formatPrintVersionListLine,
  isIssueGateErrorCode,
  isIssuedPrintVersion,
  printVersionStatusLabel,
  type IssueBlockedDetails,
} from '@/lib/contractPrintVersionUx';
import {
  CONTRACT_PACK_LABELS,
  CONTRACTS_PRINTABLE_READY,
} from '@/lib/contractLegalPrintConstants';
import {
  CORE_09_ZERO_TPL_CTA,
  core09HonestyBannerText,
  isPreviewMandatoryBlocked,
} from '@/lib/contractCore09Ring';
import { activeTemplatesForPicker, formatTemplatePickerLabel } from '@/lib/contractTemplateCatalog';
import { sameNodeDragBind } from '@/lib/jdDndSameNodeProps';
import { ApiClientError, toErrorMessage } from '@/lib/apiError';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

export type ContractPrintSpinePanelProps = {
  companyId: string;
  /** Null on create — spine mutate only after registry row exists. */
  contractId: string | null;
  employeeId?: string | null;
  packCode: string;
  templateId: string;
  onPackCodeChange: (pack: string) => void;
  onTemplateIdChange: (templateId: string) => void;
  /** Open catalog — any active code from API (not starter-8 enum). */
  onTemplateCodeChange?: (templateCode: string) => void;
  /** Prefill from registry form (path A) when opening edit. */
  initialWorkLocation?: string | null;
};

export function ContractPrintSpinePanel({
  companyId,
  contractId,
  employeeId,
  packCode,
  templateId,
  onPackCodeChange,
  onTemplateIdChange,
  onTemplateCodeChange,
  initialWorkLocation,
}: ContractPrintSpinePanelProps) {
  const [templates, setTemplates] = useState<HrmContractTemplateRecord[]>([]);
  const [clauses, setClauses] = useState<HrmContractClauseRecord[]>([]);
  const [canvasIds, setCanvasIds] = useState<string[]>([]);
  const [libraryReady, setLibraryReady] = useState(false);
  const [libraryError, setLibraryError] = useState<string | null>(null);
  const [preview, setPreview] = useState<HrmContractPreviewResult | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [packSuggest, setPackSuggest] = useState<HrmContractPackResolveResult | null>(null);
  const [packSuggestError, setPackSuggestError] = useState<string | null>(null);
  const [versions, setVersions] = useState<HrmContractPrintVersionRecord[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [versionDetail, setVersionDetail] = useState<HrmContractPrintVersionRecord | null>(
    null,
  );
  const [issueBlocked, setIssueBlocked] = useState<{
    code: string;
    details: IssueBlockedDetails;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [fieldOverrides, setFieldOverrides] = useState<Record<string, string>>({
    work_location: '',
  });

  useEffect(() => {
    const wl = (initialWorkLocation ?? '').trim();
    if (!wl) return;
    setFieldOverrides((prev) =>
      prev.work_location?.trim() ? prev : { ...prev, work_location: wl },
    );
  }, [initialWorkLocation, contractId]);

  const loadLibrary = useCallback(async () => {
    if (!companyId) return;
    setLibraryError(null);
    try {
      const [t, c] = await Promise.all([
        listContractTemplates({ company_id: companyId, status: 'active' }),
        listContractClauses({ company_id: companyId, status: 'active' }),
      ]);
      setTemplates(t.items);
      setClauses(c.items);
      setLibraryReady(true);
      if (t.items.length === 0) {
        setLibraryError(null);
      }
    } catch (err: unknown) {
      setLibraryReady(false);
      setTemplates([]);
      setClauses([]);
      setLibraryError(
        toErrorMessage(
          err,
          'Thư viện mẫu/điều khoản chưa sẵn sàng. Vào Cài đặt → Điều khoản HĐ hoặc chờ BE.',
        ),
      );
    }
  }, [companyId]);

  useEffect(() => {
    void loadLibrary();
  }, [loadLibrary]);

  useEffect(() => {
    if (!employeeId || !companyId) {
      setPackSuggest(null);
      setPackSuggestError(null);
      return;
    }
    let cancelled = false;
    void (async () => {
      setPackSuggestError(null);
      try {
        const res = await resolveContractPack({
          company_id: companyId,
          employee_id: employeeId,
        });
        if (cancelled) return;
        setPackSuggest(res);
        // One-shot suggest when employee chosen — HCNS may override afterward (O2).
        if (res?.suggested_pack && (packCode === 'GENERAL' || !packCode)) {
          onPackCodeChange(res.suggested_pack);
        }
      } catch (err: unknown) {
        if (cancelled) return;
        setPackSuggest(null);
        setPackSuggestError(
          toErrorMessage(err, 'Không gợi ý được gói nghề (pack-resolve). Chọn gói thủ công.'),
        );
      }
    })();
    return () => {
      cancelled = true;
    };
    // One-shot suggest when employee chosen; parent owns pack state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId, companyId]);

  useEffect(() => {
    const tpl = templates.find((t) => t.id === templateId);
    if (tpl) {
      setCanvasIds(clauseIdsFromTemplate(tpl));
      if (tpl.pack_code && tpl.pack_code !== packCode) {
        onPackCodeChange(tpl.pack_code);
      }
      onTemplateCodeChange?.(tpl.template_code || tpl.code);
    } else if (!templateId) {
      onTemplateCodeChange?.('');
    }
    // Sync canvas + code from selected template only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId, templates]);

  useEffect(() => {
    if (!contractId || !companyId) {
      setVersions([]);
      setSelectedVersionId(null);
      setVersionDetail(null);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const res = await listContractPrintVersions({
          contract_id: contractId,
          company_id: companyId,
        });
        if (!cancelled) {
          setVersions(res.items);
          const issued = res.items.find((v) => isIssuedPrintVersion(v.status));
          setSelectedVersionId((prev) => {
            if (prev && res.items.some((v) => v.id === prev)) return prev;
            return issued?.id ?? res.items[0]?.id ?? null;
          });
        }
      } catch {
        if (!cancelled) {
          setVersions([]);
          setSelectedVersionId(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [contractId, companyId]);

  useEffect(() => {
    if (!contractId || !companyId || !selectedVersionId) {
      setVersionDetail(null);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const detail = await getContractPrintVersion({
          contract_id: contractId,
          version_id: selectedVersionId,
          company_id: companyId,
        });
        if (!cancelled) setVersionDetail(detail);
      } catch {
        // Fall back to list row if get-by-id flaky — still show list line.
        if (!cancelled) {
          setVersionDetail(versions.find((v) => v.id === selectedVersionId) ?? null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // versions used only as soft fallback when get fails
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractId, companyId, selectedVersionId]);

  /** AC-CTR-XEVN-11 — any active API row (incl. #9+); optional pack hint sort, no hardcode 8. */
  const templatesForPicker = useMemo(() => {
    const active = activeTemplatesForPicker(templates);
    const preferred = packCode
      ? [
          ...active.filter((t) => t.pack_code === packCode),
          ...active.filter((t) => t.pack_code !== packCode),
        ]
      : active;
    return preferred;
  }, [templates, packCode]);

  const packOptions = useMemo(
    () => packsForPicker(packSuggest?.allowed_packs),
    [packSuggest?.allowed_packs],
  );

  const showDriverBlock = useMemo(
    () =>
      shouldShowDriverPreviewBlock({
        packCode,
        showDriverLicenseBlock: preview?.show_driver_license_block,
      }),
    [packCode, preview?.show_driver_license_block],
  );

  const selectedTemplateCode = useMemo(() => {
    const tpl = templates.find((t) => t.id === templateId);
    return tpl?.code ?? '';
  }, [templates, templateId]);

  const clauseById = useMemo(() => {
    const m = new Map<string, HrmContractClauseRecord>();
    for (const c of clauses) m.set(c.id, c);
    return m;
  }, [clauses]);

  const palette = useMemo(
    () =>
      filterClausesForPack(clauses, packCode, { activeOnly: true }).filter(
        (c) => !canvasIds.includes(c.id),
      ),
    [clauses, packCode, canvasIds],
  );

  const missingFieldItems = useMemo(
    () => normalizePreviewMissingFields(preview?.missing_fields),
    [preview?.missing_fields],
  );

  const overrideInputKeys = useMemo(
    () =>
      resolvePrintOverrideInputKeys(missingFieldItems, {
        forceDriverBlock: showDriverBlock,
      }),
    [missingFieldItems, showDriverBlock],
  );

  const previewSummaryRows = useMemo(
    () => previewMergedSummaryRows(preview?.merged_fields),
    [preview?.merged_fields],
  );

  const missingClauseItems = useMemo(
    () => missingClauseLabels(preview?.missing_clauses),
    [preview?.missing_clauses],
  );

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === 'print-canvas' && destination.droppableId === 'print-canvas') {
      setCanvasIds((prev) => reorderByIndex(prev, source.index, destination.index));
      return;
    }
    if (source.droppableId === 'print-palette' && destination.droppableId === 'print-canvas') {
      const id = draggableId.startsWith('ppal-') ? draggableId.slice(5) : draggableId;
      setCanvasIds((prev) => placeClauseOnCanvas(prev, id, destination.index));
    }
  };

  const persistTemplateClauseBindForIssue = useCallback(async () => {
    if (!templateId || !companyId || canvasIds.length === 0) return;
    await syncContractTemplateClauseBind(templateId, companyId, canvasIds);
  }, [templateId, companyId, canvasIds]);

  const runPreview = async () => {
    if (!contractId) {
      toast({
        title: 'Lưu hợp đồng trước',
        description: 'Sổ đăng ký HĐ phải có id trước khi xem trước / in (UF-HRM-02 rồi spine).',
        variant: 'destructive',
      });
      return;
    }
    if (templates.length === 0) {
      setPreviewError(
        'Chưa có mẫu active — mở Cài đặt → Điều khoản HĐ / Mẫu theo loại (AC-CTR-PRINT-01 / HRM-CTR-TPL-NONE).',
      );
      setPreview(null);
      return;
    }
    setBusy(true);
    setPreviewError(null);
    try {
      await persistTemplateClauseBindForIssue();
      const overrides = buildContractPrintFieldOverrides(fieldOverrides);
      // Ephemeral only — POST …/preview MUST NOT INSERT issued print-version (O3).
      const res = await previewContractPrint(contractId, {
        company_id: companyId,
        pack_code: packCode,
        template_id: templateId || undefined,
        template_code: selectedTemplateCode || undefined,
        ...(overrides ? { field_overrides: overrides } : {}),
      });
      setPreview(res);
      const merged = res.merged_fields ?? {};
      setFieldOverrides((prev) => {
        const next = { ...prev };
        for (const key of resolvePrintOverrideInputKeys(
          normalizePreviewMissingFields(res.missing_fields),
          {
            forceDriverBlock: shouldShowDriverPreviewBlock({
              packCode: res.pack_code || packCode,
              showDriverLicenseBlock: res.show_driver_license_block,
            }),
          },
        )) {
          if (next[key]?.trim()) continue;
          const fromMerged = merged[key];
          if (typeof fromMerged === 'string' && fromMerged.trim()) {
            next[key] = fromMerged.trim();
          }
        }
        return next;
      });
      toast({
        title: 'Đã tải bản xem trước (ephemeral)',
        description: res.can_issue
          ? 'Đủ điều kiện ban hành — bấm «Lưu phiên bản in» để POST print-versions (CORE-09c). Preview không INSERT VER.'
          : 'Chưa đủ điều kiện ban hành — bổ sung field/điều khoản thiếu bên dưới.',
      });
      setIssueBlocked(null);
    } catch (err: unknown) {
      setPreview(null);
      const code = err instanceof ApiClientError ? err.code : undefined;
      const fallback =
        code === 'HRM-CTR-TPL-NONE'
          ? 'Chưa có mẫu HĐ hiệu lực (HRM-CTR-TPL-NONE).'
          : code === 'HRM-CTR-PACK-INVALID'
            ? 'Gói nghề không hợp lệ (HRM-CTR-PACK-INVALID).'
            : code === 'HRM-CTR-TPL-PACK-MISMATCH'
              ? 'Gói nghề không khớp mẫu (HRM-CTR-TPL-PACK-MISMATCH).'
              : code === 'HRM-CTR-DRIVER-REQUIRED'
                ? 'Thiếu GPLX/biển số gói Lái xe (HRM-CTR-DRIVER-REQUIRED).'
                : 'Preview chưa khả dụng (BE song song hoặc thiếu mẫu/điều khoản bắt buộc).';
      setPreviewError(toErrorMessage(err, fallback));
    } finally {
      setBusy(false);
    }
  };

  const saveVersion = async () => {
    if (!contractId) return;
    setBusy(true);
    setIssueBlocked(null);
    try {
      await persistTemplateClauseBindForIssue();
      const overrides = buildContractPrintFieldOverrides(fieldOverrides);
      // Server re-runs preview + can_issue gate — FE soft-disable is UX only (O2).
      const ver = await createContractPrintVersion(contractId, {
        company_id: companyId,
        pack_code: packCode,
        template_id: templateId || undefined,
        template_code: selectedTemplateCode || undefined,
        ...(overrides ? { field_overrides: overrides } : {}),
      });
      toast({
        title: 'Đã lưu phiên bản in (HRM-CTR-VER-201)',
        description: `${formatPrintVersionListLine(ver)} · F5 để xác nhận còn (AC-CTR-PRINT-04).`,
      });
      const list = await listContractPrintVersions({
        contract_id: contractId,
        company_id: companyId,
      });
      setVersions(list.items);
      setSelectedVersionId(ver.id);
      setVersionDetail(ver);
    } catch (err: unknown) {
      const code = err instanceof ApiClientError ? err.code : undefined;
      if (code && isIssueGateErrorCode(code)) {
        const details = extractIssueBlockedDetails(err);
        setIssueBlocked({ code, details });
        const missingSummary = formatIssueBlockedMissingSummary(details);
        toast({
          title: 'Không ban hành phiên bản in',
          description: missingSummary
            ? `${toErrorMessage(err)} · ${missingSummary}`
            : toErrorMessage(err),
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Không lưu phiên bản in',
          description: toErrorMessage(err),
          variant: 'destructive',
        });
      }
    } finally {
      setBusy(false);
    }
  };

  const downloadPdf = async (version: HrmContractPrintVersionRecord) => {
    setBusy(true);
    try {
      if (!isIssuedPrintVersion(version.status)) {
        toast({
          title: 'PDF chỉ từ bản đã phát hành',
          description: toErrorMessage(
            new ApiClientError({
              code: 'HRM-CTR-VERSION-NOT-ISSUED',
              message: '',
              status: 400,
            }),
          ),
          variant: 'destructive',
        });
        return;
      }
      // Snapshot-only GET — DENY FE invent PDF by re-merging live library.
      const blob = await fetchContractPrintPdf({
        version_id: version.id,
        company_id: companyId,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = contractPrintPdfFilename({
        contract_id: version.contract_id || contractId,
        version_id: version.id,
        version_no: version.version_no,
      });
      a.click();
      URL.revokeObjectURL(url);
      toast({
        title: 'Đã tải PDF (snapshot)',
        description: `v${version.version_no} · pack ${version.pack_code} · từ phiên bản issued (không ghép thư viện live).`,
      });
    } catch (err: unknown) {
      const code = err instanceof ApiClientError ? err.code : undefined;
      toast({
        title:
          code === 'HRM-CTR-VERSION-NOT-ISSUED'
            ? 'Phiên bản chưa phát hành'
            : code === 'HRM-CTR-PV-404'
              ? 'Không tìm thấy phiên bản in'
              : 'PDF chưa sẵn sàng',
        description: toErrorMessage(err),
        variant: 'destructive',
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="mt-4 space-y-3 rounded-lg border border-border/60 bg-slate-50/50 p-3"
      data-testid="ctr-print-spine"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-xevn-text">Bản in / điều khoản HĐLĐ</p>
          <p className="text-xs text-muted-foreground">
            Chọn gói nghề + mẫu đã cấu hình; kéo-thả clause — nội dung điều khoản từ thư viện
            (CORE-09a), không soạn lại toàn văn. Lương qua C&amp;B (F5), không nhập free-type trên
            form này. Xem trước = ephemeral (không INSERT phiên bản in).
          </p>
          {!CONTRACTS_PRINTABLE_READY ? (
            
          ) : null}
          <p
            className="mt-1 text-[11px] text-amber-800/90"
            data-testid="ctr-core09-honesty"
          >
            {core09HonestyBannerText()} · 09a–d ADD ≠ CORE-09 DONE · CORE-07 GATE/ACT RETAIN
            (≠ DONE) · soft ≠ CORE-06 DONE · Word/DOCX OUT · Nest /core CTR = 0
          </p>
        </div>
        {busy ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : null}
      </div>

      {libraryError ? (
        <p className="text-sm text-destructive" data-testid="ctr-print-library-error">
          {libraryError}
        </p>
      ) : null}

      {libraryReady && templates.length === 0 ? (
        <div
          className="rounded border border-amber-300 bg-amber-50/80 px-2.5 py-2 text-sm text-amber-950"
          data-testid="ctr-core09-zero-tpl-cta"
          role="status"
        >
          <p className="font-semibold" data-testid="ctr-print-no-template">
            {CORE_09_ZERO_TPL_CTA.title} ({CORE_09_ZERO_TPL_CTA.code})
          </p>
          <p className="mt-0.5 text-xs text-amber-900/90">{CORE_09_ZERO_TPL_CTA.body}</p>
          <p className="mt-1.5 text-xs">
            <a href={CORE_09_ZERO_TPL_CTA.settingsHref} className="font-medium underline">
              {CORE_09_ZERO_TPL_CTA.settingsLabel}
            </a>
            {' · '}
            AC-CTR-TPL-01 / R-CORE-09-ZERO-TPL — sổ đăng ký vẫn Lưu được không mẫu (AC-CTR-XEVN-08).
          </p>
        </div>
      ) : null}

      {packSuggestError ? (
        <p className="text-sm text-amber-800" data-testid="ctr-print-pack-suggest-error">
          {packSuggestError}
        </p>
      ) : null}

      {packSuggest?.suggested_pack ? (
        <div
          className="rounded border border-sky-200 bg-sky-50/70 px-2.5 py-2 text-xs text-sky-950"
          data-testid="ctr-print-pack-suggest"
        >
          <p>
            Gợi ý gói nghề:{' '}
            <span className="font-semibold" data-testid="ctr-print-suggested-pack">
              {packLabelVi(packSuggest.suggested_pack)}
            </span>{' '}
            <span className="text-sky-800">({packSuggest.suggested_pack})</span>
            {packSuggest.job_family ? (
              <span className="text-sky-800"> · họ nghề {packSuggest.job_family}</span>
            ) : null}
          </p>
          <p className="mt-0.5 text-sky-900/90" data-testid="ctr-print-pack-suggest-reason">
            {formatPackSuggestReason(packSuggest.reason)}
          </p>
          <p className="mt-0.5 text-sky-800">
            HCNS có thể đổi gói trước khi ban hành (O2). MVP: Chung · IT/văn phòng · Lái xe.
          </p>
        </div>
      ) : null}

      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 space-y-1 sm:col-span-4">
          <Label>Gói nghề</Label>
          <Select value={packCode} onValueChange={onPackCodeChange}>
            <SelectTrigger data-testid="ctr-print-pack">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {packOptions.map((p) => (
                <SelectItem key={p} value={p}>
                  {CONTRACT_PACK_LABELS[p]}
                  {p === 'LOGISTICS' ? ' (tuỳ chọn)' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-12 space-y-1 sm:col-span-8">
          <Label>Mẫu HĐ (open catalog)</Label>
          <Select
            value={templateId || '__none__'}
            onValueChange={(v) => {
              if (v === '__none__') {
                onTemplateIdChange('');
                onTemplateCodeChange?.('');
                return;
              }
              onTemplateIdChange(v);
              const tpl = templates.find((t) => t.id === v);
              onTemplateCodeChange?.(tpl?.template_code || tpl?.code || '');
              if (tpl?.pack_code) onPackCodeChange(tpl.pack_code);
            }}
          >
            <SelectTrigger data-testid="ctr-print-template">
              <SelectValue placeholder="Chọn mẫu active từ API" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">— Chưa chọn —</SelectItem>
              {templatesForPicker.map((t) => (
                <SelectItem key={t.id} value={t.id} data-testid={`ctr-print-tpl-option-${t.code}`}>
                  {formatTemplatePickerLabel({
                    ...t,
                    pack_label_vi:
                      CONTRACT_PACK_LABELS[t.pack_code as keyof typeof CONTRACT_PACK_LABELS] ??
                      t.pack_code,
                  })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div
        className="grid grid-cols-12 gap-3 rounded border border-dashed border-amber-300/80 bg-amber-50/40 p-2"
        data-testid="ctr-print-field-overrides"
      >
        <p className="col-span-12 text-xs text-amber-900">
          Bổ sung field Đ.21 trước khi xem trước (không rời spine). Nơi làm việc cũng lưu được trên
          form đăng ký HĐ phía trên. Preview ephemeral — không ghi phiên bản in.
        </p>
        {overrideInputKeys.map((key) => (
          <div key={key} className="col-span-12 space-y-1 sm:col-span-6">
            <Label htmlFor={`ctr-override-${key}`}>{labelForPrintOverrideField(key)}</Label>
            <Input
              id={`ctr-override-${key}`}
              data-testid={`ctr-print-override-${key}`}
              value={fieldOverrides[key] ?? ''}
              onChange={(e) =>
                setFieldOverrides((prev) => ({ ...prev, [key]: e.target.value }))
              }
              placeholder={key === 'work_location' ? 'Ví dụ: Hà Nội — trụ sở chính' : undefined}
            />
          </div>
        ))}
      </div>

      {showDriverBlock ? (
        <div
          className="rounded border border-violet-200 bg-violet-50/50 px-2.5 py-2 text-xs text-violet-950"
          data-testid="ctr-print-driver-block"
        >
          <p className="font-semibold">Khối Lái xe (DRIVER)</p>
          <p className="mt-0.5 text-violet-900/90">
            Gói Lái xe yêu cầu GPLX (số, hạng, ngày cấp, nơi cấp) và biển số — thiếu →{' '}
            <code className="text-[10px]">can_issue=false</code> / HRM-CTR-DRIVER-REQUIRED. Điền
            vào ô bổ sung phía trên rồi xem trước lại.
          </p>
        </div>
      ) : null}

      {clauses.length > 0 ? (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-12 space-y-1 md:col-span-4">
              <p className="text-xs font-medium">Thư viện clause</p>
              <Droppable droppableId="print-palette" isDropDisabled>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="min-h-[80px] space-y-1 rounded border border-dashed p-1.5"
                    data-testid="ctr-print-palette"
                  >
                    {palette.map((c, index) => (
                      <Draggable key={c.id} draggableId={`ppal-${c.id}`} index={index}>
                        {(drag) => {
                          const bind = sameNodeDragBind(drag);
                          return (
                            <div
                              ref={bind.ref}
                              {...bind.props}
                              className="flex cursor-grab items-center gap-1 rounded border bg-white px-1.5 py-1 text-[11px] active:cursor-grabbing"
                            >
                              <GripVertical className="h-3 w-3 shrink-0 text-muted-foreground" aria-hidden />
                              <span className="truncate">{c.title_vi}</span>
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
            <div className="col-span-12 space-y-1 md:col-span-8">
              <p className="text-xs font-medium">Thứ tự trên HĐ ({canvasIds.length})</p>
              <Droppable droppableId="print-canvas">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="min-h-[80px] space-y-1 rounded border bg-white p-1.5"
                    data-testid="ctr-print-canvas"
                  >
                    {canvasIds.map((id, index) => {
                      const c = clauseById.get(id);
                      return (
                        <Draggable key={id} draggableId={`pcan-${id}`} index={index}>
                          {(drag) => {
                            const bind = sameNodeDragBind(drag);
                            return (
                              <div
                                ref={bind.ref}
                                {...bind.props}
                                className="flex cursor-grab items-center gap-1 rounded border px-1.5 py-1 text-[11px] active:cursor-grabbing"
                              >
                                <GripVertical className="h-3 w-3 shrink-0" aria-hidden />
                                <span className="min-w-0 flex-1 truncate">
                                  {c?.title_vi ?? id}
                                </span>
                                <button
                                  type="button"
                                  className="text-[10px] text-destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setCanvasIds((prev) => removeClauseFromCanvas(prev, id));
                                  }}
                                >
                                  Gỡ
                                </button>
                              </div>
                            );
                          }}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </div>
        </DragDropContext>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={busy || !contractId}
          onClick={() => void runPreview()}
          data-testid="ctr-print-preview-btn"
        >
          <Eye className="mr-1.5 h-3.5 w-3.5" />
          Xem trước
        </Button>
        <Button
          type="button"
          size="sm"
          disabled={
            busy ||
            !contractId ||
            templates.length === 0 ||
            !preview?.can_issue ||
            isPreviewMandatoryBlocked(preview)
          }
          onClick={() => void saveVersion()}
          data-testid="ctr-print-save-version"
          title={
            templates.length === 0
              ? '0 mẫu — chặn VER giả (R-CORE-09-ZERO-TPL)'
              : 'POST …/print-versions — server re-preview + can_issue (F-CORE-CTR-VER-01)'
          }
        >
          <Save className="mr-1.5 h-3.5 w-3.5" />
          Lưu phiên bản in
        </Button>
      </div>

      {issueBlocked ? (
        <div
          className="rounded border border-destructive/40 bg-destructive/5 p-2 text-xs text-destructive"
          data-testid="ctr-print-issue-blocked"
        >
          <p className="font-semibold" data-testid="ctr-print-issue-blocked-code">
            {issueBlocked.code}
          </p>
          <p className="mt-0.5">
            {toErrorMessage(
              new ApiClientError({ code: issueBlocked.code, message: '', status: 400 }),
            )}
          </p>
          {issueBlocked.details.missing_fields.length ? (
            <p className="mt-1" data-testid="ctr-print-issue-missing-fields">
              Thiếu field:{' '}
              {issueBlocked.details.missing_fields
                .map((m) =>
                  m.message
                    ? `${labelForPrintOverrideField(m.field)} (${m.message})`
                    : labelForPrintOverrideField(m.field),
                )
                .join(', ')}
            </p>
          ) : null}
          {issueBlocked.details.missing_clauses.length ? (
            <p className="mt-1" data-testid="ctr-print-issue-missing-clauses">
              Thiếu clause: {issueBlocked.details.missing_clauses.join(', ')}
            </p>
          ) : null}
        </div>
      ) : null}

      {previewError ? (
        <p className="text-sm text-destructive" data-testid="ctr-print-preview-error">
          {previewError}
        </p>
      ) : null}

      {preview ? (
        <div
          className="max-h-80 space-y-2 overflow-y-auto rounded border bg-white p-3 text-sm"
          data-testid="ctr-print-preview-body"
        >
          <p className="text-xs text-muted-foreground" data-testid="ctr-print-preview-meta">
            Pack: {packLabelVi(preview.pack_code)} ({preview.pack_code})
            {preview.template_code
              ? ` · mẫu ${preview.template_code}`
              : preview.template_id
                ? ` · template_id ${preview.template_id}`
                : ''}
            {preview.cb_masked ? ' · khối lương đã che (cb_masked)' : ''}
            {preview.can_issue === false ? ' · can_issue=false' : ''}
            {preview.can_issue === true ? ' · can_issue=true' : ''}
            {isPreviewMandatoryBlocked(preview) ? ' · mandatory block' : ''}
            {preview.show_driver_license_block ? ' · DRIVER block' : ''}
            {' · ephemeral (không INSERT VER)'}
          </p>
          {preview.cb_masked ? (
            <p
              className="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] text-slate-700"
              data-testid="ctr-core09-cb-masked"
            >
              C&amp;B mask (cb_masked=true) — lương/MST đã che theo ACL CORE-02 · không lộ · ≠
              invent C&amp;B engine DONE.
            </p>
          ) : null}
          {previewSummaryRows.length > 0 ? (
            <dl
              className="grid grid-cols-12 gap-x-2 gap-y-1 rounded border border-border/50 bg-slate-50/80 p-2 text-xs"
              data-testid="ctr-print-preview-summary"
            >
              {previewSummaryRows.map((row) => (
                <div key={row.key} className="col-span-12 sm:col-span-6">
                  <dt className="font-medium text-xevn-text">{row.label}</dt>
                  <dd className="text-muted-foreground">{row.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          {missingFieldItems.length || missingClauseItems.length ? (
            <div className="rounded border border-amber-300 bg-amber-50 p-2 text-xs text-amber-900">
              {missingFieldItems.length ? (
                <p data-testid="ctr-print-missing-fields">
                  Thiếu field:{' '}
                  {missingFieldItems
                    .map((m) =>
                      m.message
                        ? `${labelForPrintOverrideField(m.field)} (${m.message})`
                        : labelForPrintOverrideField(m.field),
                    )
                    .join(', ')}
                </p>
              ) : null}
              {missingClauseItems.length ? (
                <p data-testid="ctr-print-missing-clauses">
                  Thiếu clause bắt buộc: {missingClauseItems.join(', ')}
                </p>
              ) : null}
            </div>
          ) : null}
          {(preview.clauses ?? []).map((cl, i) => (
            <div
              key={`${cl.code}-${i}`}
              className="border-b border-border/40 pb-2 last:border-0"
              data-testid={`ctr-print-preview-clause-${cl.code}`}
            >
              <p className="font-medium">{cl.title_vi}</p>
              <p className="whitespace-pre-wrap text-xs text-muted-foreground">{cl.body_vi}</p>
            </div>
          ))}
          {(preview.sections ?? []).map((sec, i) => (
            <div key={`sec-${i}`} className="border-b border-border/40 pb-2 last:border-0">
              {sec.title ? <p className="font-medium">{sec.title}</p> : null}
              {sec.body ? (
                <p className="whitespace-pre-wrap text-xs text-muted-foreground">{sec.body}</p>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      {versions.length > 0 ? (
        <div className="space-y-2" data-testid="ctr-print-versions">
          <p className="text-xs font-medium">
            Phiên bản in đã lưu (pack_code · version_no · status · issued_at) — F5 còn
          </p>
          <ul className="space-y-1 text-xs">
            {versions.map((v) => {
              const active = selectedVersionId === v.id;
              return (
                <li
                  key={v.id}
                  className={`flex flex-wrap items-center justify-between gap-2 rounded border bg-white px-2 py-1.5 ${
                    active ? 'border-primary/50 ring-1 ring-primary/20' : ''
                  }`}
                  data-testid={`ctr-print-version-row-${v.id}`}
                >
                  <button
                    type="button"
                    className="min-w-0 flex-1 text-left"
                    onClick={() => setSelectedVersionId(v.id)}
                    data-testid={`ctr-print-version-select-${v.id}`}
                  >
                    <span data-testid={`ctr-print-version-line-${v.id}`}>
                      {formatPrintVersionListLine(v)}
                    </span>
                    <span className="mt-0.5 block text-[10px] text-muted-foreground">
                      {printVersionStatusLabel(v.status)}
                      {isIssuedPrintVersion(v.status) ? ' · có thể PDF' : ' · PDF chỉ khi issued'}
                    </span>
                  </button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-7"
                    disabled={busy || !isIssuedPrintVersion(v.status)}
                    onClick={() => void downloadPdf(v)}
                    data-testid={`ctr-print-pdf-${v.id}`}
                    title={
                      isIssuedPrintVersion(v.status)
                        ? 'GET …/print-versions/:id/pdf — snapshot only'
                        : 'HRM-CTR-VERSION-NOT-ISSUED'
                    }
                  >
                    <FileDown className="mr-1 h-3 w-3" />
                    PDF
                  </Button>
                </li>
              );
            })}
          </ul>
          {versionDetail ? (
            <div
              className="rounded border border-border/60 bg-white p-2 text-xs"
              data-testid="ctr-print-version-detail"
            >
              <p className="font-medium text-xevn-text">Chi tiết phiên bản đã chọn</p>
              <dl className="mt-1 grid grid-cols-12 gap-x-2 gap-y-1">
                <div className="col-span-6 sm:col-span-3">
                  <dt className="text-muted-foreground">version_no</dt>
                  <dd data-testid="ctr-print-detail-version-no">{versionDetail.version_no}</dd>
                </div>
                <div className="col-span-6 sm:col-span-3">
                  <dt className="text-muted-foreground">pack_code</dt>
                  <dd data-testid="ctr-print-detail-pack-code">{versionDetail.pack_code}</dd>
                </div>
                <div className="col-span-6 sm:col-span-3">
                  <dt className="text-muted-foreground">status</dt>
                  <dd data-testid="ctr-print-detail-status">
                    {printVersionStatusLabel(versionDetail.status)}
                  </dd>
                </div>
                <div className="col-span-6 sm:col-span-3">
                  <dt className="text-muted-foreground">issued_at</dt>
                  <dd data-testid="ctr-print-detail-issued-at">
                    {formatPrintVersionIssuedAt(versionDetail.issued_at)}
                  </dd>
                </div>
              </dl>
              <p className="mt-1 text-[10px] text-muted-foreground">
                Snapshot khóa tại issue — PDF không ghép lại thư viện live (BR-CTR-CL-01). Amend
                → Lưu lại tạo version_no mới; bản issued trước chuyển superseded.
              </p>
            </div>
          ) : null}
        </div>
      ) : null}

      {!contractId ? (
        <p className="text-xs text-muted-foreground" data-testid="ctr-print-need-save">
          Sau khi Lưu hợp đồng (CRUD registry), mở lại để xem trước. Registry create/edit/F5
          must_keep (AC-CTR-PRINT-08).
        </p>
      ) : null}
    </div>
  );
}
