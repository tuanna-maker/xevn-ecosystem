/**
 * @CODE-MEMORY
 * Screen:     /hr/recruitment — Thêm/Sửa JD (pack resolve + group DnD)
 * UC:         UC-BP-REC-00g · AC-JD-GRP-02..05 · AC-JD-DYN-09..12
 * BR:         Q1 DnD @ Thư viện · Q6 snapshot v2 · G4 confirm đổi chức danh
 * SRS:        docs/program/specs/PO-HRM-JD-GROUP-SPEC-01.md UC-00g
 * TechSpec:   docs/program/specs/PO-HRM-JD-GROUP-ARCH-01.md §1 runtime · §2 FW
 * Purpose:    Resolve pack via API → always_on groups; optional group DnD; title-first; save snapshot v2.
 * WorkItem:   PO-HRM-JD-DYNAMIC-FE-01
 * Coded:      2026-08-06
 * Callers:    JobTemplatesTab
 * Callees:    resolveJdPack · listJdGroupDefs · create/update job-templates · jdDynamicSnapshot helpers
 * must_keep:  No PACK_* hardcode selection; no job_postings write; position_code catalog; U65
 * LastVerified: docs/qa/evidence/po-hrm-jd-dynamic-fe-03.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-06 PO-HRM-JD-DYNAMIC-FE-03
 * What: applyResolve uses resolveJdPack.groups after client normalize (always_on_groups → groups).
 * must_keep: No job_postings write · HDSD testids · G4 confirm when groups.length > 0
 *
 * @CODE-MEMORY-CHANGE 2026-08-06 PO-HRM-UI-HEADER-JD-DND-FE-01
 * What: DialogContent portalScope=iframe (hello-pangea findDragHandle uses iframe document);
 *       canvas/palette same-node drag bind (no nested button handle).
 * must_keep: HDSD testids · no job_postings · G4 confirm · Settings JD groups (no DnD there)
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-UAT-REC-JD-DND-FE-01
 * What: Canvas groups use sameNodeDragBind (not nested header-only handle); defer
 *       DragDropContext until dialog open settles (double rAF) so handles register in
 *       iframe document — zero Unable-to-find-drag-handle storm.
 * must_keep: portalScope=iframe · HDSD testids · soft OBS CMP/IV · U65 · honesty
 *            recruitment_uat_ready=false / jd_dynamic_done not invent
 * LastVerified: docs/qa/evidence/po-uat-rec-jd-dnd-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-REC-00-CLUSTER-FE-01
 * change_mode: UPGRADE
 * What: Submit create label «Lưu nháp» (P04 — create default draft; publish separate)
 * Why: UC-BP-REC-00 AC-REC-JD-00-P04 · BA Diễn biến 2a
 * must_keep: portalScope iframe · DnD sameNode · HDSD · position_code · no /rec · no job_postings
 *
 * @CODE-MEMORY-CHANGE 2026-08-10 PO-HRM-UI-DIALOG-FULL-VIEWPORT-FE-01
 * change_mode: UPGRADE
 * What: DialogContent parent portal ~90vw×90vh (PAT-DIALOG-FULL-VIEWPORT-CC-01); giữ sameNode + dndReady double rAF (Contract step2 pattern).
 * must_keep: DnD sameNode · dndReady rAF · HDSD testids · no job_postings · G4 confirm
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DragDropContext, Draggable, Droppable, type DropResult } from '@hello-pangea/dnd';
import { Link } from 'react-router-dom';
import { GripVertical, Loader2, Plus, Trash2 } from 'lucide-react';
import {
  listJdGroupDefs,
  resolveJdPack,
  type HrmJobDescriptionTemplate,
  type HrmJdGroupDef,
} from '@/integrations/hrmApi';
import {
  addOptionalGroup,
  bridgeLegacyValues,
  buildSnapshotV2,
  legacyFlatSnapshot,
  mergePackOntoCanvas,
  reorderGroupsByCodes,
  type JdLayoutSnapshotV2,
  type JdSnapshotGroup,
  type JdValuesMap,
} from '@/lib/jdDynamicSnapshot';
import {
  HRM_DIALOG_FULL_VIEWPORT_BODY_CLASS,
  HRM_DIALOG_FULL_VIEWPORT_CONTENT_CLASS,
} from '@/lib/hrmDialogFullViewport';
import { sameNodeDragBind } from '@/lib/jdDndSameNodeProps';
import {
  buildJobTemplatePositionFields,
  isCatalogPickerValueAllowed,
  type CatalogPickerOption,
} from '@/lib/catalogSearchPicker';
import { CatalogSearchPicker } from '@/components/common/CatalogSearchPicker';
import { toErrorMessage } from '@/lib/apiError';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { HDSD_MUTATE_TEST_IDS } from '@/lib/hdsdMutateTestIds';

function SyncTextarea({ value, onChange, ...props }: any) {
  const [val, setVal] = useState(value);
  useEffect(() => { setVal(value); }, [value]);
  return (
    <Textarea 
      {...props} 
      value={val} 
      onChange={e => setVal(e.target.value)} 
      onBlur={() => onChange(val)} 
    />
  );
}

function SyncInput({ value, onChange, ...props }: any) {
  const [val, setVal] = useState(value);
  useEffect(() => { setVal(value); }, [value]);
  return (
    <Input 
      {...props} 
      value={val} 
      onChange={e => setVal(e.target.value)} 
      onBlur={() => onChange(val)} 
    />
  );
}

function groupCodeOf(g: HrmJdGroupDef): string {
  return (g.group_code || g.code || '').trim();
}

function groupDefToSnapshot(g: HrmJdGroupDef, source: string, sort_order: number): JdSnapshotGroup {
  return {
    group_code: groupCodeOf(g),
    label: g.label,
    view_style: g.view_style || 'heading',
    source,
    sort_order,
    fields: (g.fields || []).map((f, i) => ({
      field_id: f.field_id,
      field_key: f.field_key || f.field_id,
      label: f.label || f.field_key || f.field_id,
      field_type: f.field_type || 'long_text',
      is_required: f.is_required,
      sort_order: f.sort_order ?? i,
    })),
  };
}

export type JdWriterSavePayload = {
  code: string;
  title: string;
  position_code: string;
  position_name?: string;
  job_description?: string;
  requirements?: string;
  notes?: string;
  values_json: JdValuesMap;
  layout_snapshot: JdLayoutSnapshotV2;
  layout_version: number;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  editing: HrmJobDescriptionTemplate | null;
  positionOptions: CatalogPickerOption[];
  catalogsLoading: boolean;
  catalogsError: boolean;
  submitting: boolean;
  onSubmit: (payload: JdWriterSavePayload) => Promise<void>;
  /** Override dialog test id (Settings library vs Recruitment tab). */
  dialogTestId?: string;
};

export function JdTemplateWriterDialog({
  open,
  onOpenChange,
  companyId,
  editing,
  positionOptions,
  catalogsLoading,
  catalogsError,
  submitting,
  onSubmit,
  dialogTestId,
}: Props) {
  const [code, setCode] = useState('');
  const [notes, setNotes] = useState('');
  const [positionCode, setPositionCode] = useState('');
  const [values, setValues] = useState<JdValuesMap>({});
  const [snapshot, setSnapshot] = useState<JdLayoutSnapshotV2 | null>(null);
  const [optionalCatalog, setOptionalCatalog] = useState<HrmJdGroupDef[]>([]);
  const [resolving, setResolving] = useState(false);
  const [resolveError, setResolveError] = useState<string | null>(null);
  const [packLabel, setPackLabel] = useState<string | null>(null);
  const [pendingPosition, setPendingPosition] = useState<string | null>(null);
  const [confirmPackOpen, setConfirmPackOpen] = useState(false);
  /** Defer DnD tree until Dialog portal + paint settle (parent document; double rAF). */
  const [dndReady, setDndReady] = useState(false);
  const lastResolvedPosition = useRef<string>('');

  const canSubmitPosition =
    positionOptions.length > 0 &&
    isCatalogPickerValueAllowed(positionOptions, positionCode, { allowEmpty: false });

  const resetCreate = useCallback(() => {
    setCode('');
    setNotes('');
    setPositionCode('');
    setValues({ title: '' });
    setSnapshot(null);
    setPackLabel(null);
    setResolveError(null);
    lastResolvedPosition.current = '';
  }, []);

  const hydrateFromEdit = useCallback((row: HrmJobDescriptionTemplate) => {
    setCode(row.code);
    setNotes(row.notes ?? '');
    setPositionCode(row.position_code?.trim() ?? '');
    const snap = row.layout_snapshot_json;
    if (snap?.groups?.length) {
      setSnapshot(
        buildSnapshotV2({
          pack_code: snap.pack_code,
          pack_label: snap.pack_label,
          resolved_from_rule_id: snap.resolved_from_rule_id,
          groups: snap.groups,
        }),
      );
      setValues({ ...(row.values_json || bridgeLegacyValues(row)), title: row.title });
      setPackLabel(snap.pack_label || snap.pack_code || null);
    } else {
      const flat = legacyFlatSnapshot(row);
      setSnapshot(flat);
      setValues({ ...bridgeLegacyValues(row), title: row.title });
      setPackLabel(null);
    }
    lastResolvedPosition.current = row.position_code?.trim() ?? '';
  }, []);

  useEffect(() => {
    if (!open) return;
    if (editing) hydrateFromEdit(editing);
    else resetCreate();
  }, [open, editing, hydrateFromEdit, resetCreate]);

  useEffect(() => {
    if (!open) {
      setDndReady(false);
      return;
    }
    let cancelled = false;
    let innerRaf = 0;
    // Double rAF: wait for Dialog parent portal + first paint before registering handles.
    const outerRaf = window.requestAnimationFrame(() => {
      innerRaf = window.requestAnimationFrame(() => {
        if (!cancelled) setDndReady(true);
      });
    });
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(outerRaf);
      if (innerRaf) window.cancelAnimationFrame(innerRaf);
    };
  }, [open]);

  useEffect(() => {
    if (!open || !companyId) return;
    void listJdGroupDefs({ company_id: companyId })
      .then((res) => {
        setOptionalCatalog(
          res.items.filter(
            (g) => g.is_active !== false && (g.usage === 'optional_only' || g.usage === 'default_eligible'),
          ),
        );
      })
      .catch(() => setOptionalCatalog([]));
  }, [open, companyId]);

  const applyResolve = useCallback(
    async (pos: string, mode: 'replace' | 'merge') => {
      if (!companyId || !pos) return;
      setResolving(true);
      setResolveError(null);
      try {
        const res = await resolveJdPack({ company_id: companyId, position_code: pos });
        // groups[] normalized in hrmApi from always_on_groups || groups || pack.groups
        const alwaysOn = (res.groups ?? []).map((g, i) => ({
          ...g,
          source: (g.source || 'pack_always_on') as typeof g.source,
          sort_order: g.sort_order ?? i,
        }));
        if (mode === 'merge' && snapshot) {
          const merged = mergePackOntoCanvas({
            previousGroups: snapshot.groups,
            previousValues: values,
            nextAlwaysOnGroups: alwaysOn,
            pack_code: res.pack_code,
            pack_label: res.pack_label,
            resolved_from_rule_id: res.resolved_from_rule_id,
          });
          setSnapshot(merged.snapshot);
          setValues((prev) => ({ ...merged.values, title: prev.title || merged.values.title || '' }));
        } else {
          const snap = buildSnapshotV2({
            pack_code: res.pack_code,
            pack_label: res.pack_label,
            resolved_from_rule_id: res.resolved_from_rule_id,
            groups: alwaysOn,
          });
          setSnapshot(snap);
          setValues((prev) => {
            const next: JdValuesMap = { title: prev.title || '' };
            for (const g of snap.groups) {
              for (const f of g.fields) {
                if (prev[f.field_key] !== undefined) next[f.field_key] = prev[f.field_key];
                else if (next[f.field_key] === undefined) next[f.field_key] = '';
              }
            }
            return next;
          });
        }
        setPackLabel(res.pack_label || res.pack_code);
        lastResolvedPosition.current = pos;
      } catch (err: unknown) {
        setResolveError(
          toErrorMessage(err, 'Không resolve được pack — kiểm tra F-JD-RUL-03 / fallback L1.'),
        );
        if (!snapshot) {
          const flat = legacyFlatSnapshot({ title: values.title });
          setSnapshot(flat);
          setValues((prev) => ({ ...bridgeLegacyValues({ title: prev.title }), ...prev }));
        }
      } finally {
        setResolving(false);
      }
    },
    [companyId, snapshot, values],
  );

  const onPositionChange = (next: string) => {
    const prev = positionCode;
    setPositionCode(next);
    if (!next) return;
    if (!prev || !lastResolvedPosition.current || !snapshot?.groups?.length) {
      void applyResolve(next, 'replace');
      return;
    }
    if (next === lastResolvedPosition.current) return;
    setPendingPosition(next);
    setConfirmPackOpen(true);
  };

  const confirmApplyPack = () => {
    if (pendingPosition) void applyResolve(pendingPosition, 'merge');
    setPendingPosition(null);
    setConfirmPackOpen(false);
  };

  const declineApplyPack = () => {
    setPendingPosition(null);
    setConfirmPackOpen(false);
  };

  const canvasGroups = snapshot?.groups ?? [];
  const onCanvasCodes = useMemo(
    () => new Set(canvasGroups.map((g) => g.group_code)),
    [canvasGroups],
  );
  const paletteGroups = optionalCatalog.filter((g) => {
    const code = groupCodeOf(g);
    return code && !onCanvasCodes.has(code);
  });

  const onAddGroupDirectly = (def: HrmJdGroupDef) => {
    const currentGroups = snapshot?.groups ?? [];
    const added = addOptionalGroup(
      currentGroups,
      groupDefToSnapshot(def, 'optional_button', currentGroups.length),
    );
    setSnapshot(
      buildSnapshotV2({
        pack_code: snapshot?.pack_code ?? null,
        pack_label: snapshot?.pack_label ?? null,
        resolved_from_rule_id: snapshot?.resolved_from_rule_id ?? null,
        groups: added,
      }),
    );
  };

  const onRemoveGroupDirectly = (groupCode: string) => {
    if (!snapshot) return;
    const filtered = snapshot.groups.filter((g) => g.group_code !== groupCode);
    setSnapshot(
      buildSnapshotV2({
        pack_code: snapshot.pack_code,
        pack_label: snapshot.pack_label,
        resolved_from_rule_id: snapshot.resolved_from_rule_id,
        groups: filtered,
      }),
    );
  };

  const onDragEnd = (result: DropResult) => {
    if (!snapshot || !result.destination) return;
    if (result.source.droppableId === 'palette' && result.destination.droppableId === 'canvas') {
      const def = paletteGroups[result.source.index];
      if (!def) return;
      onAddGroupDirectly(def);
      return;
    }
    if (result.source.droppableId === 'canvas' && result.destination.droppableId === 'canvas') {
      const codes = canvasGroups.map((g) => g.group_code);
      const [moved] = codes.splice(result.source.index, 1);
      codes.splice(result.destination.index, 0, moved);
      setSnapshot(
        buildSnapshotV2({
          pack_code: snapshot.pack_code,
          pack_label: snapshot.pack_label,
          resolved_from_rule_id: snapshot.resolved_from_rule_id,
          groups: reorderGroupsByCodes(snapshot.groups, codes),
        }),
      );
    }
  };

  const setFieldValue = (key: string, v: string) => {
    setValues((prev) => ({ ...prev, [key]: v }));
  };

  const handleSubmit = async () => {
    const positionFields = buildJobTemplatePositionFields(positionCode, positionOptions);
    if (!positionFields) {
      toast({
        title: 'Thiếu chức danh catalog',
        description: 'Mở Cài đặt → Danh mục nghiệp vụ / Chức danh.',
        variant: 'destructive',
      });
      return;
    }
    if (!code.trim()) {
      toast({ title: 'Nhập mã JD', variant: 'destructive' });
      return;
    }
    const title = (values.title || '').trim();
    if (!title) {
      toast({ title: 'Nhập tiêu đề (trường đầu)', variant: 'destructive' });
      return;
    }
    const snap =
      snapshot ??
      buildSnapshotV2({
        pack_code: null,
        groups: legacyFlatSnapshot({ title }).groups,
      });
    const responsibilities =
      values.responsibilities?.trim() ||
      values.job_description?.trim() ||
      '';
    const requirements = values.requirements?.trim() || '';
    await onSubmit({
      code: code.trim(),
      title,
      position_code: positionFields.position_code,
      position_name: positionFields.position_name,
      job_description: responsibilities || undefined,
      requirements: requirements || undefined,
      notes: notes.trim() || undefined,
      values_json: { ...values, title, code: code.trim() },
      layout_snapshot: snap,
      layout_version: 2,
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className={HRM_DIALOG_FULL_VIEWPORT_CONTENT_CLASS}
          data-testid={dialogTestId ?? HDSD_MUTATE_TEST_IDS.jdFormDialog}
          data-hrm-dialog-portal="parent"
        >
          <DialogHeader>
            <DialogTitle>{editing ? 'Sửa JD template' : 'Thêm JD template'}</DialogTitle>
            <DialogDescription>
              Pack resolve từ rule (API) → nhóm always_on; kéo nhóm tùy chọn; lưu snapshot v2 (Q6). Tiêu đề đứng
              đầu.
            </DialogDescription>
          </DialogHeader>

          <div className={`${HRM_DIALOG_FULL_VIEWPORT_BODY_CLASS} space-y-4`}>
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-12 space-y-1">
                <Label>Tiêu đề *</Label>
                <Input
                  value={values.title ?? ''}
                  onChange={(e) => setFieldValue('title', e.target.value)}
                  placeholder="VD: JD Chuyên viên Fullstack"
                  data-testid={HDSD_MUTATE_TEST_IDS.jdFormTitle}
                  autoFocus
                />
              </div>
              <div className="col-span-12 space-y-1 sm:col-span-4">
                <Label>Mã JD *</Label>
                <Input
                  className="xevn-field-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  data-testid={HDSD_MUTATE_TEST_IDS.jdFormCode}
                />
              </div>
              <div className="col-span-12 space-y-1 sm:col-span-8">
                <Label>Chức danh (catalog) *</Label>
                <CatalogSearchPicker
                  options={positionOptions}
                  value={positionCode}
                  onValueChange={onPositionChange}
                  placeholder="Chọn chức danh — hệ thống resolve pack"
                  loading={catalogsLoading}
                  data-testid={HDSD_MUTATE_TEST_IDS.jdFormPosition}
                  errorText={catalogsError ? 'Không tải được danh mục chức danh' : undefined}
                  emptyHint={
                    <Link to="/settings" className="text-xs font-medium text-primary underline">
                      Mở Cài đặt → Danh mục nghiệp vụ
                    </Link>
                  }
                />
              </div>
            </div>

            {resolving ? (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang resolve gói mặc định…
              </p>
            ) : null}
            {packLabel ? (
              <p className="text-sm text-xevn-textSecondary" data-testid="jd-writer-pack-label">
                Gói áp dụng: <span className="font-medium text-xevn-text">{packLabel}</span>
                {snapshot?.pack_code ? (
                  <span className="ml-1 font-mono text-xs">({snapshot.pack_code})</span>
                ) : null}
              </p>
            ) : null}
            {resolveError ? (
              <div className="rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-warning">
                {resolveError} — đang dùng bố cục tối thiểu / snapshot hiện có.
              </div>
            ) : null}

            {dndReady ? (
            <DragDropContext onDragEnd={onDragEnd}>
              <div className="grid grid-cols-12 gap-3" data-testid="jd-writer-dnd-surface">
                <div className="col-span-12 space-y-2 md:col-span-4">
                  <p className="text-sm font-medium text-xevn-text">Nhóm tùy chọn</p>
                  <Droppable droppableId="palette" isDropDisabled>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="min-h-[120px] space-y-2 rounded-lg border border-dashed border-border/70 bg-slate-50/80 p-2"
                        data-testid="jd-writer-optional-palette"
                      >
                        {paletteGroups.length === 0 ? (
                          <p className="p-2 text-xs text-muted-foreground">
                            Không còn nhóm optional — cấu hình ở Cài đặt → Nhóm thông tin JD.
                          </p>
                        ) : (
                          paletteGroups.map((g, index) => (
                            <Draggable key={groupCodeOf(g)} draggableId={`pal-${groupCodeOf(g)}`} index={index}>
                              {(drag) => {
                                const bind = sameNodeDragBind(drag);
                                return (
                                  <div
                                    ref={bind.ref}
                                    {...bind.props}
                                    className="flex cursor-grab items-center justify-between rounded-md border border-border bg-surface px-2 py-1.5 text-xs shadow-soft active:cursor-grabbing hover:border-primary/50"
                                  >
                                    <div className="flex items-center gap-2">
                                      <GripVertical className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
                                      <span className="font-medium">{g.label}</span>
                                    </div>
                                    <Button
                                      type="button"
                                      size="icon"
                                      variant="ghost"
                                      className="h-6 w-6 shrink-0 text-primary hover:bg-primary/10 hover:text-primary"
                                      title="Bấm nút + để thêm nhóm vào Canvas"
                                      data-testid={`jd-writer-add-group-${groupCodeOf(g)}`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onAddGroupDirectly(g);
                                      }}
                                    >
                                      <Plus className="h-3.5 w-3.5" />
                                    </Button>
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

                <div className="col-span-12 space-y-2 md:col-span-8">
                  <p className="text-sm font-medium text-xevn-text">Canvas nhóm</p>
                  <Droppable droppableId="canvas">
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="min-h-[200px] space-y-3 rounded-lg border border-border/60 bg-surface p-3"
                        data-testid="jd-writer-canvas"
                      >
                        {canvasGroups.length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            Chọn chức danh để hệ thống chèn nhóm always_on từ pack.
                          </p>
                        ) : (
                          canvasGroups.map((group, index) => (
                            <Draggable
                              key={group.group_code}
                              draggableId={`canvas-${group.group_code}`}
                              index={index}
                            >
                              {(drag) => {
                                const bind = sameNodeDragBind(drag);
                                return (
                                  <div
                                    ref={bind.ref}
                                    {...bind.props}
                                    className="cursor-grab rounded-md border border-border/50 bg-white p-3 shadow-soft active:cursor-grabbing"
                                    data-testid={`jd-writer-group-${group.group_code}`}
                                  >
                                    <div className="mb-2 flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <GripVertical
                                          className="h-4 w-4 shrink-0 text-muted-foreground"
                                          aria-hidden
                                        />
                                        <h4 className="font-display text-sm font-semibold text-xevn-text">
                                          {group.label}
                                        </h4>
                                        <span className="text-[10px] uppercase text-muted-foreground">
                                          {group.source}
                                        </span>
                                      </div>
                                      <Button
                                        type="button"
                                        size="icon"
                                        variant="ghost"
                                        className="h-6 w-6 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                        title="Bấm nút xóa để gỡ nhóm khỏi Canvas"
                                        data-testid={`jd-writer-remove-group-${group.group_code}`}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onRemoveGroupDirectly(group.group_code);
                                        }}
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </Button>
                                    </div>
                                    <div className="space-y-2">
                                      {[...group.fields]
                                        .sort((a, b) => a.sort_order - b.sort_order)
                                        .filter((f) => f.field_key !== 'title')
                                        .map((f) => (
                                          <div key={f.field_key} className="space-y-1">
                                            <Label className="text-xs">
                                              {f.label}
                                              {f.is_required ? ' *' : ''}
                                            </Label>
                                            {f.field_type === 'long_text' ? (
                                              <SyncTextarea
                                                rows={3}
                                                value={values[f.field_key] ?? ''}
                                                onChange={(v: string) => setFieldValue(f.field_key, v)}
                                              />
                                            ) : (
                                              <SyncInput
                                                value={values[f.field_key] ?? ''}
                                                onChange={(v: string) => setFieldValue(f.field_key, v)}
                                              />
                                            )}
                                          </div>
                                        ))}
                                    </div>
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
            </DragDropContext>
            ) : (
              <div
                className="flex min-h-[120px] items-center justify-center gap-2 rounded-lg border border-dashed border-border/60 text-sm text-muted-foreground"
                data-testid="jd-writer-dnd-pending"
              >
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang chuẩn bị bố cục kéo-thả…
              </div>
            )}

            <div className="space-y-1">
              <Label>Ghi chú</Label>
              <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Tuỳ chọn" />
            </div>
          </div>

          <DialogFooter className="shrink-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button
              type="button"
              disabled={submitting || resolving || !canSubmitPosition}
              data-testid={HDSD_MUTATE_TEST_IDS.jdFormSubmit}
              onClick={() => void handleSubmit()}
            >
              {editing ? 'Lưu thay đổi' : 'Lưu nháp'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmPackOpen} onOpenChange={setConfirmPackOpen}>
        <AlertDialogContent data-testid="jd-writer-pack-confirm">
          <AlertDialogHeader>
            <AlertDialogTitle>Áp gói mặc định mới?</AlertDialogTitle>
            <AlertDialogDescription>
              Đổi chức danh có thể đổi pack. Hệ thống sẽ thêm nhóm always_on còn thiếu, giữ nội dung trùng mã
              trường, và tách nhóm không còn trong pack (không xóa nội dung đã nhập).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={declineApplyPack}>Giữ bố cục hiện tại</AlertDialogCancel>
            <AlertDialogAction onClick={confirmApplyPack}>Áp pack mới</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
