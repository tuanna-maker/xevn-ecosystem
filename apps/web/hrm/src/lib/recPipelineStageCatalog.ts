/**
 * @CODE-MEMORY
 * Screen:     /settings · REC CFG — catalog giai đoạn pipeline (F-REC-CAT-STG/EFF)
 * UC:         AC-PLT-REC-02..05 · BR-PLT-02/04/05/06
 * BR:         DYNAMIC-LOCK — format-only stageKey · open catalog #7+ · soft-delete retire
 * SRS:        docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-VERTICAL-SA-01.md §5
 * API_DESIGN: F-REC-CAT-STG-01/02 · F-REC-CAT-EFF-01
 * Purpose:    Helper mở catalog REC pipeline stages — nhãn vi-VN + validate slug (không enum 6 starter).
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-FE-01
 * Coded:      2026-08-07
 * Callers:    RecPipelineStageSettingsPanel · useRecPipelineStagesEffective · CandidatesTab · JobCandidatesDialog
 * Callees:    (pure) — không gọi API
 * must_keep:  starter ≠ trần · cấm FE hardcode six SoT · JD/IV/YCTD · U65 · recruitment_uat_ready=false
 * SOLID:      Constants/helpers SRP — UI bind display-ready từ BE
 * solid_convention_ack: FE chỉ format + nhãn; không invent stage enum đóng
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-rec-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-08 PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-CNS-FE-01
 * change_mode: ADD
 * What: Kanban column builder từ EFF · IV soft-gate allowsInterviewSchedule (≠ one-active reopen)
 * Why: BA-01 VAL-REC-CNS-04/05 · AC-PLT-REC-STAGE-05k/06a — cấm starter-six SoT khi EFF>0
 * must_keep: CandidatesTab/Form EFF picker · Settings CREATE N+1 · IV one-active · JD DnD · recruitment_uat_ready=false
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-rec-stage-catalog-cns-fe-01.md
 */

import type { CatalogPickerOption } from '@/lib/catalogSearchPicker';

/** Format-only — khớp BE REC_PIPELINE_STAGE_KEY_FORMAT; KHÔNG phải danh sách đóng. */
export const REC_PIPELINE_STAGE_KEY_FORMAT = /^[a-z][a-z0-9_]*$/;

export const REC_PIPELINE_STAGE_SOURCE_LABELS: Record<string, string> = {
  rec_native: 'REC (đơn vị)',
  group_ref: 'Danh mục tập đoàn',
  rec_override: 'REC ghi đè REF',
};

/**
 * Docs-only starter examples — NOT a product ceiling (must_keep display fallback khi catalog trống).
 * NEVER treat as closed enum SoT when effective catalog > 0.
 */
export const REC_PIPELINE_STAGE_STARTER_KEYS = [
  'screening',
  'interview',
  'offer',
  'hired',
  'rejected',
  'withdrawn',
] as const;

/** Honesty — FE không flip UAT recruitment. */
export const REC_PIPELINE_STAGE_UAT_HONESTY = false;

export function isValidRecPipelineStageKeyFormat(raw: string): boolean {
  const key = normalizeRecPipelineStageKey(raw);
  return Boolean(key) && REC_PIPELINE_STAGE_KEY_FORMAT.test(key);
}

/** Normalize for compare / upsert body — BE stores lower slug after format pass. */
export function normalizeRecPipelineStageKey(raw: string): string {
  return raw.trim().toLowerCase();
}

export function recPipelineStageSourceLabel(source: string | null | undefined): string {
  const s = (source ?? '').trim();
  return REC_PIPELINE_STAGE_SOURCE_LABELS[s] ?? (s || '—');
}

export function formatRecPipelineStageDisplay(
  stageKey: string,
  nameVi: string | null | undefined,
): string {
  const key = stageKey.trim();
  const label = (nameVi ?? '').trim();
  if (label) return `${label} (${key})`;
  return key || '—';
}

/** Map effective/list row → CatalogSearchPicker / Select option (value = stageKey). */
export function recPipelineStageToPickerOption(row: {
  stageKey: string;
  nameVi: string;
}): CatalogPickerOption {
  const value = row.stageKey.trim();
  const label = (row.nameVi ?? '').trim() || value;
  return { value, label, code: value };
}

export function recPipelineStagesToPickerOptions(
  rows: readonly { stageKey: string; nameVi: string }[],
): CatalogPickerOption[] {
  return rows.map(recPipelineStageToPickerOption);
}

/**
 * Resolve display label for list/history — prefer catalog nameVi; retired/unknown → raw key.
 * AC-PLT-REC-03: historical stage key remains visible after retire.
 */
export function resolveRecPipelineStageLabel(
  options: readonly CatalogPickerOption[],
  stageKey: string | null | undefined,
  fallbackLabel?: string | null,
): string {
  const key = (stageKey ?? '').trim();
  if (!key) return '—';
  const hit = options.find((o) => o.value === key || o.value.toLowerCase() === key.toLowerCase());
  if (hit?.label?.trim()) return hit.label.trim();
  const fb = (fallbackLabel ?? '').trim();
  if (fb) return fb;
  return key;
}

/** Kanban column color tokens — display only; never invent stage keys. */
const REC_KANBAN_COLOR_FALLBACKS = [
  'bg-muted',
  'bg-primary/20',
  'bg-accent/20',
  'bg-warning/20',
  'bg-success/20',
  'bg-destructive/20',
  'bg-xevn-accent/20',
  'bg-primary/10',
] as const;

export type RecPipelineKanbanColumn = {
  id: string;
  label: string;
  color: string;
};

export type RecPipelineStageKanbanRow = {
  stageKey: string;
  nameVi: string;
  sortOrder?: number | null;
  colorToken?: string | null;
};

/**
 * VAL-REC-CNS-04 / AC-PLT-REC-STAGE-05k — when EFF >0, kanban columns = Nest effective keys (incl. N+1).
 * Empty EFF → [] (caller shows soft-empty + CTA admin); cấm hardcode starter-six as SoT.
 */
export function buildRecPipelineKanbanColumns(
  items: readonly RecPipelineStageKanbanRow[],
): RecPipelineKanbanColumn[] {
  if (!items.length) return [];
  const sorted = [...items].sort((a, b) => {
    const ao = typeof a.sortOrder === 'number' ? a.sortOrder : 0;
    const bo = typeof b.sortOrder === 'number' ? b.sortOrder : 0;
    if (ao !== bo) return ao - bo;
    return a.stageKey.localeCompare(b.stageKey);
  });
  return sorted.map((row, index) => {
    const id = row.stageKey.trim();
    const label = (row.nameVi ?? '').trim() || id;
    const token = (row.colorToken ?? '').trim();
    const color =
      token && !token.includes(' ')
        ? token.startsWith('bg-')
          ? token
          : `bg-${token}`
        : REC_KANBAN_COLOR_FALLBACKS[index % REC_KANBAN_COLOR_FALLBACKS.length]!;
    return { id, label, color };
  });
}

/**
 * VAL-REC-CNS-05 / AC-PLT-REC-STAGE-06a — soft-gate IV schedule by stage flag.
 * Empty catalog → allow (compat). Explicit allowsInterviewSchedule=false → block.
 * Does NOT reopen IV one-active lifecycle (HRM-REC-IV-409-ACTIVE remains separate).
 */
export function isRecPipelineStageInterviewScheduleAllowed(
  items: readonly { stageKey: string; allowsInterviewSchedule?: boolean | null }[],
  stageKey: string | null | undefined,
  catalogCount: number,
): boolean {
  if (catalogCount <= 0 || items.length === 0) return true;
  const key = (stageKey ?? '').trim();
  if (!key) return true;
  const row = items.find(
    (i) => i.stageKey === key || i.stageKey.toLowerCase() === key.toLowerCase(),
  );
  if (!row) return true;
  return row.allowsInterviewSchedule !== false;
}

/** VI copy — soft-empty kanban / picker when EFF=0 (U65 · no invent density). */
export const REC_PIPELINE_STAGE_EMPTY_CTA_VI =
  'Chưa có giai đoạn pipeline hiệu lực. Tạo giai đoạn tại Cài đặt → Giai đoạn REC (không seed).';

/** VI copy — IV soft-gate when allows_interview_schedule=false. */
export const REC_PIPELINE_STAGE_IV_SOFT_GATE_VI =
  'Giai đoạn hiện tại không cho phép lên lịch phỏng vấn. Bật cờ «Cho phép lịch PV» trên Cài đặt → Giai đoạn REC, hoặc chuyển ứng viên sang giai đoạn cho phép.';
