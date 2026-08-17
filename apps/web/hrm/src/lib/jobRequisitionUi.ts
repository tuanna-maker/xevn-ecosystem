/**
 * @CODE-MEMORY-CHANGE 2026-08-06 PO-HRM-JD-YCTD-REF-FE-01
 * change_mode: ADD
 * What: filterBindableJobTemplates · composeLocalYctdPreview · resolveRequisitionJdDisplay
 * Why: SRS REC-02 Diễn biến 1a–1d · F-YCTD-JD-01/02/05 — picker Hiệu lực + preview + F5 jd ref
 * must_keep: soft FK job_template_id · empty CTA · no job_postings SoT
 * LastVerified: docs/qa/evidence/po-hrm-jd-yctd-ref-fe-01.md
 */
import type {
  HrmJobRequisition,
  HrmJobRequisitionStatus,
  HrmYctdJdPreview,
} from '@/integrations/hrmApi';
import {
  departmentOptionsFromCatalog,
  type CatalogPickerOption,
} from '@/lib/catalogSearchPicker';

export type JobRequisitionUiStatus = 'active' | 'paused' | 'closed';

/** Legacy Select sentinel — must never submit (BM-FE-JD-REQ-ONLY-01). */
export const REQUISITION_NONE_TEMPLATE_SENTINEL = '__none__';

export const REQUISITION_JD_TEMPLATE_REQUIRED_VI =
  'Chọn JD từ thư viện trước khi lưu yêu cầu tuyển dụng.';

export const REQUISITION_EMPTY_JD_LIBRARY_HINT_VI =
  'Chưa có JD Hiệu lực trong thư viện — tạo/ kích hoạt JD trước, rồi quay lại chọn cho yêu cầu tuyển dụng.';

export const REQUISITION_OPEN_JD_LIBRARY_CTA_VI = 'Mở Thư viện JD';

/** FE surface when BE returns HRM-JD-YCTD-STATUS (Diễn biến 1d). */
export const REQUISITION_JD_STATUS_BLOCKED_VI =
  'JD đã chọn không còn Hiệu lực (Nháp/Ngừng). Chọn JD Hiệu lực khác từ thư viện.';

const NON_BINDABLE_STATUS = new Set([
  'draft',
  'nhap',
  'nháp',
  'retired',
  'archived',
  'inactive',
  'ngung',
  'ngừng',
  'paused',
  'disabled',
  'stopped',
]);

/**
 * BM-AC-05-02 / AC-CD-F6-02 / sponsor JD-only —
 * true when create form has a real job_template_id (not empty / not __none__).
 */
type CatalogRowLike = {
  catalogKey: string;
  effectiveItems?: readonly { code?: string; label?: string; status?: string }[];
};

/**
 * Department picker for YCTD create — catalog SoT first; fallback to existing requisition rows when MD empty.
 * D-HDSD-MUTATE-FE-06 — pilot hydrate when settings-catalogs has no department bucket yet.
 */
export type RequisitionCreateFormDefaults = {
  title: string;
  department: string;
  employment_type: string;
  headcount: number;
  job_template_id: string;
  job_description: string;
  requirements: string;
};

type JobTemplateLike = {
  id: string;
  title: string;
  code?: string | null;
  position_code?: string | null;
  position_name?: string | null;
  job_description?: string | null;
  requirements?: string | null;
  short_description?: string | null;
  is_active?: boolean | null;
  status?: string | null;
};

/**
 * F-YCTD-JD-01 — client defense: picker chỉ Hiệu lực (BE bindable=true authoritative).
 * Prefer status=active ∧ is_active≠false; status absent → migrate dual-assert is_active.
 */
export function isJobTemplateBindableForYctd(
  tpl: Pick<JobTemplateLike, 'is_active' | 'status'>,
): boolean {
  if (tpl.is_active === false) return false;
  const status = (tpl.status ?? '').toLowerCase().trim();
  if (status) {
    if (NON_BINDABLE_STATUS.has(status)) return false;
    if (status === 'active' || status === 'hieu_luc' || status === 'hiệu lực') {
      return tpl.is_active !== false;
    }
    return false;
  }
  // Dual-assert migrate: status null → is_active only (API-01 §6.5).
  return tpl.is_active === true || tpl.is_active === undefined;
}

export function filterBindableJobTemplates<T extends JobTemplateLike>(
  rows: readonly T[],
): readonly T[] {
  return rows.filter((row) => isJobTemplateBindableForYctd(row));
}

/** Local preview fallback when preview=yctd endpoint not ready / network blip (not STATUS). */
export function composeLocalYctdPreview(tpl: JobTemplateLike): HrmYctdJdPreview {
  const short =
    tpl.short_description?.trim() ||
    tpl.job_description?.trim() ||
    '';
  return {
    job_template_id: tpl.id,
    job_description_id: tpl.id,
    code: tpl.code?.trim() || '',
    title: tpl.title?.trim() || '',
    short_description: short,
    requirements_preview: tpl.requirements?.trim() || undefined,
    status: 'active',
  };
}

/** F-YCTD-JD-05 — list/detail display after 2xx + F5. */
export function resolveRequisitionJdDisplay(
  row: Pick<HrmJobRequisition, 'jd_code' | 'jd_title' | 'job_template_id' | 'job_description_id'>,
  templates: readonly JobTemplateLike[] = [],
): string {
  const code = row.jd_code?.trim() ?? '';
  const title = row.jd_title?.trim() ?? '';
  if (code && title) return `${code} · ${title}`;
  if (title) return title;
  if (code) return code;
  const tplId = (row.job_template_id || row.job_description_id || '').trim();
  if (tplId) {
    const tpl = templates.find((t) => t.id === tplId);
    if (tpl) {
      const tCode = tpl.code?.trim() ?? '';
      const tTitle = tpl.title?.trim() ?? '';
      if (tCode && tTitle) return `${tCode} · ${tTitle}`;
      if (tTitle) return tTitle;
      if (tCode) return tCode;
    }
  }
  return '—';
}

function templateRowId(row: JobTemplateLike): string {
  const raw = row.id;
  if (typeof raw === 'string') return raw.trim();
  if (raw != null) return String(raw).trim();
  return '';
}

/**
 * Normalize listJobDescriptionTemplates payload → row array (FE-15 envelope parity).
 * Handles requestHrm `{ total, data: rows[] }`, bare array, or accidental double-wrap.
 */
export function unwrapJobDescriptionTemplateRows<T extends JobTemplateLike>(
  payload: unknown,
): readonly T[] {
  if (Array.isArray(payload)) {
    return payload.filter((row): row is T => Boolean(templateRowId(row as JobTemplateLike)));
  }
  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    const inner = record.data;
    if (Array.isArray(inner)) {
      return inner.filter((row): row is T => Boolean(templateRowId(row as JobTemplateLike)));
    }
    if (inner && typeof inner === 'object') {
      const nested = inner as Record<string, unknown>;
      if (Array.isArray(nested.data)) {
        return nested.data.filter((row): row is T =>
          Boolean(templateRowId(row as JobTemplateLike)),
        );
      }
    }
  }
  return [];
}

/**
 * Merge hook templates with dialog prefetch — union by id (FE-14 jd-library row ↔ requisitions picker desync).
 */
export function resolveEffectiveJobTemplates<T extends JobTemplateLike>(
  hookTemplates: readonly T[],
  dialogHydratedTemplates: readonly T[],
): readonly T[] {
  if (hookTemplates.length === 0 && dialogHydratedTemplates.length === 0) {
    return hookTemplates;
  }
  if (hookTemplates.length === 0) return dialogHydratedTemplates;
  if (dialogHydratedTemplates.length === 0) return hookTemplates;

  const merged = new Map<string, T>();
  for (const row of hookTemplates) {
    const id = templateRowId(row);
    if (id) merged.set(id, row);
  }
  for (const row of dialogHydratedTemplates) {
    const id = templateRowId(row);
    if (id) merged.set(id, row);
  }
  return Array.from(merged.values());
}

/**
 * Department default for YCTD create — catalog → JD position/label → title/code → OU.
 * D-HDSD-MUTATE-FE-08 — pilot JD rows may lack departments catalog + position_name.
 */
export function resolveRequisitionDepartmentDefault(input: {
  template?: JobTemplateLike | null;
  departmentOptions: readonly CatalogPickerOption[];
  ouLabels?: readonly string[];
  jobTitleOptions?: readonly CatalogPickerOption[];
}): string {
  const deptFromCatalog = input.departmentOptions[0]?.value?.trim() ?? '';
  if (deptFromCatalog) return deptFromCatalog;

  const ouFallback =
    input.ouLabels?.map((l) => l.trim()).find((l) => l.length > 0) ?? '';
  if (ouFallback) return ouFallback;

  const tpl = input.template;
  if (tpl) {
    const posName = tpl.position_name?.trim();
    if (posName) return posName;

    const posCode = tpl.position_code?.trim();
    if (posCode) {
      const fromJobTitle = input.jobTitleOptions?.find((o) => o.value === posCode);
      if (fromJobTitle?.label?.trim()) return fromJobTitle.label.trim();
      return posCode;
    }

    const title = tpl.title?.trim();
    if (title) return title;

    const code = tpl.code?.trim();
    if (code) return code;
  }

  return '';
}

/**
 * Form-ready gate — fallback template/dept khi RHF watch chưa sync (FE-09/FE-10).
 * D-HDSD-MUTATE-FE-07 — form-ready sentinel within QA wait window.
 */
export function isRequisitionCreateFormReady(input: {
  watched: {
    title?: string;
    department?: string;
    employmentType?: string;
    headcount?: unknown;
    jobTemplateId?: string;
  };
  templates: readonly JobTemplateLike[];
  departmentOptions: readonly CatalogPickerOption[];
  ouLabels?: readonly string[];
  jobTitleOptions?: readonly CatalogPickerOption[];
}): boolean {
  const { title, department, employmentType, headcount, jobTemplateId } = input.watched;
  const effectiveTemplateId = isRequisitionJobTemplateSelected(jobTemplateId)
    ? jobTemplateId!.trim()
    : input.templates[0]?.id ?? '';
  if (!isRequisitionJobTemplateSelected(effectiveTemplateId)) return false;

  const tpl =
    input.templates.find((t) => t.id === effectiveTemplateId) ?? input.templates[0];
  const effectiveTitle =
    title?.trim() ||
    tpl?.title?.trim() ||
    tpl?.code?.trim() ||
    tpl?.position_name?.trim() ||
    '';
  let effectiveDept =
    department?.trim() ||
    resolveRequisitionDepartmentDefault({
      template: tpl,
      departmentOptions: input.departmentOptions,
      ouLabels: input.ouLabels,
      jobTitleOptions: input.jobTitleOptions,
    });
  // D-HDSD-MUTATE-FE-12 — pilot JD may lack dept catalog; title-only rows still POST-ready
  if (!effectiveDept && effectiveTitle) {
    effectiveDept = effectiveTitle;
  }
  const effectiveEmploymentType = employmentType?.trim() || 'full_time';
  const effectiveHeadcount = normalizeRequisitionHeadcount(headcount) ?? 1;

  return (
    Boolean(effectiveTitle) &&
    Boolean(effectiveDept) &&
    Boolean(effectiveEmploymentType) &&
    effectiveHeadcount >= 1
  );
}

export function buildRequisitionCreateFormDefaults(input: {
  templates: readonly JobTemplateLike[];
  departmentOptions: readonly CatalogPickerOption[];
  ouLabels?: readonly string[];
  jobTitleOptions?: readonly CatalogPickerOption[];
}): RequisitionCreateFormDefaults | null {
  const tpl = input.templates[0];
  if (!tpl || !isRequisitionJobTemplateSelected(tpl.id)) return null;

  const department = resolveRequisitionDepartmentDefault({
    template: tpl,
    departmentOptions: input.departmentOptions,
    ouLabels: input.ouLabels,
    jobTitleOptions: input.jobTitleOptions,
  });
  const resolvedTitle = tpl.title?.trim() ?? '';

  return {
    title: resolvedTitle,
    department: department || resolvedTitle,
    employment_type: 'full_time',
    headcount: 1,
    job_template_id: tpl.id,
    job_description: tpl.job_description ?? '',
    requirements: tpl.requirements ?? '',
  };
}

export function requisitionDepartmentPickerOptions(
  catalogs: readonly CatalogRowLike[],
  existingDepartments: readonly string[],
  extraLabels: readonly string[] = [],
  templateDeptHints: readonly string[] = [],
): CatalogPickerOption[] {
  const fromCatalog = departmentOptionsFromCatalog(catalogs);
  if (fromCatalog.length > 0) return fromCatalog;
  const seen = new Set<string>();
  const fallback: CatalogPickerOption[] = [];
  for (const raw of [...existingDepartments, ...extraLabels, ...templateDeptHints]) {
    const dept = raw?.trim() ?? '';
    if (!dept || seen.has(dept)) continue;
    seen.add(dept);
    fallback.push({ value: dept, label: dept, code: dept });
  }
  return fallback;
}

export function isRequisitionJobTemplateSelected(
  jobTemplateId: string | undefined | null,
): boolean {
  const id = typeof jobTemplateId === 'string' ? jobTemplateId.trim() : '';
  if (!id || id === REQUISITION_NONE_TEMPLATE_SENTINEL) return false;
  return true;
}

/** FR-HRM-RC-01 — coerce UI value to integer ≥1; null when empty/≤0/NaN. */
export function normalizeRequisitionHeadcount(value: unknown): number | null {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return null;
  const truncated = Math.trunc(n);
  if (truncated < 1) return null;
  return truncated;
}

export function mapRequisitionStatus(status: HrmJobRequisition['status']): JobRequisitionUiStatus {
  if (
    status === 'open' ||
    status === 'approved' ||
    status === 'pending_approval' ||
    status === 'open_for_hire'
  ) {
    return 'active';
  }
  if (status === 'on_hold' || status === 'draft') return 'paused';
  return 'closed';
}

export function nestStatusMatchesFilter(
  nestStatus: HrmJobRequisition['status'],
  filter: JobRequisitionUiStatus,
): boolean {
  return mapRequisitionStatus(nestStatus) === filter;
}

/** Local PATCH statuses (UF-HRM-12) — exclude pending_approval / open_for_hire (WF/transitions). */
export const REQUISITION_LOCAL_STATUSES = ['open', 'closed', 'on_hold'] as const satisfies readonly HrmJobRequisitionStatus[];

export const REQUISITION_STATUS_LABEL_VI: Record<HrmJobRequisitionStatus, string> = {
  open: 'Đang tuyển',
  on_hold: 'Tạm dừng',
  closed: 'Đã đóng',
  draft: 'Nháp',
  pending_approval: 'Chờ duyệt QT',
  approved: 'Đã duyệt',
  rejected: 'Từ chối',
  open_for_hire: 'Mở nhận hồ sơ',
  cancelled: 'Đã hủy',
};

export const EMPLOYMENT_TYPE_OPTIONS = [
  { value: 'full_time', label: 'Toàn thời gian' },
  { value: 'part_time', label: 'Bán thời gian' },
  { value: 'contract', label: 'Hợp đồng' },
  { value: 'intern', label: 'Thực tập' },
] as const;
