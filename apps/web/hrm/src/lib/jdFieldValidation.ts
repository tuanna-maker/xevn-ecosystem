/**
 * @CODE-MEMORY
 * Screen:     Cài đặt → trường JD (Field Dialog) · Writer canvas (consumer)
 * UC:         UC-BP-REC-00a · UC-BP-REC-00g
 * BR:         BR-BP-JD-DYN-01 · VAL-JD-21 · VAL-JD-22 · VAL-JD-23
 * SRS:        docs/program/specs/PO-HRM-JD-DYNAMIC-SPEC-01.md (UC-00a)
 * TechSpec:   docs/program/specs/PO-HRM-JD-DYNAMIC-DATA-01.md §3.2 · §12.7 select source modes
 * Purpose:    Pure helpers around `validation_json` for JD dynamic `select` fields.
 *             3 source modes: static (1-50 free options) | catalog (platform catalog allowlist)
 *             | runtime (source reference, READ-ONLY preview — BE has no runtime writer yet).
 * WorkItem:   PO-HRM-JD-DYNAMIC-FE-01
 * Coded:      2026-08-18
 * Callers:    JdDynamicSettingsPanel (Field Dialog) · JdTemplateWriterDialog (canvas editor)
 * Callees:    none (pure)
 * must_keep:  No FE join/merge/BR calc (AP-01..06) · no cross-module DB · no job_postings write
 * SOLID:      Pure lib — UI/API stay outside
 */

/** Canonical select source modes (DATA-01 §12.7). `runtime` is READ-ONLY on the FE. */
export const JD_SELECT_SOURCE_STATIC = 'static' as const;
export const JD_SELECT_SOURCE_CATALOG = 'catalog' as const;
export const JD_SELECT_SOURCE_RUNTIME = 'runtime' as const;

export type JdSelectSource =
  | typeof JD_SELECT_SOURCE_STATIC
  | typeof JD_SELECT_SOURCE_CATALOG
  | typeof JD_SELECT_SOURCE_RUNTIME;

export const JD_SELECT_SOURCES: readonly JdSelectSource[] = [
  JD_SELECT_SOURCE_STATIC,
  JD_SELECT_SOURCE_CATALOG,
  JD_SELECT_SOURCE_RUNTIME,
] as const;

/** VAL-JD-21 — catalog_key must be on the platform allowlist. */
export const JD_SELECT_CATALOG_ALLOWLIST = [
  'job_titles',
  'job_grades',
  'employment_types',
  'departments',
  'recruitment_channels',
] as const;

export type JdSelectCatalogKey = (typeof JD_SELECT_CATALOG_ALLOWLIST)[number];

/** Human label per catalog key (rendered in the Field Dialog + runtime preview). */
export const JD_SELECT_CATALOG_LABELS: Record<string, string> = {
  job_titles: 'Chức danh (job_titles)',
  job_grades: 'Cấp bậc (job_grades)',
  employment_types: 'Loại HĐ / Hình thức (employment_types)',
  departments: 'Phòng ban (departments)',
  recruitment_channels: 'Kênh tuyển dụng (recruitment_channels)',
};

export const JD_SELECT_SOURCE_LABELS: Record<JdSelectSource, string> = {
  [JD_SELECT_SOURCE_STATIC]: 'Tự định nghĩa',
  [JD_SELECT_SOURCE_CATALOG]: 'Từ danh mục hệ thống',
  [JD_SELECT_SOURCE_RUNTIME]: 'Tham chiếu nguồn (chỉ xem)',
};

/** VAL-JD-22 — static options must be a non-empty array of ≤ 50 strings. */
export const JD_SELECT_STATIC_MIN = 1;
export const JD_SELECT_STATIC_MAX = 50;

export type JdSelectValidationJson =
  | { source: typeof JD_SELECT_SOURCE_STATIC; options: string[] }
  | { source: typeof JD_SELECT_SOURCE_CATALOG; catalog_key: string }
  | { source: typeof JD_SELECT_SOURCE_RUNTIME; source_ref: string; note?: string };

export type SelectValidationShape = {
  source?: string;
  options?: unknown[];
  catalog_key?: string;
  source_ref?: string;
  note?: string;
};

/** Split a free-text options blob (newline/comma separated) into a trimmed, deduped list. */
export function normalizeStaticOptions(raw: string): string[] {
  return [
    ...new Set(
      raw
        .split(/[\n,;]+/)
        .map((s) => s.trim())
        .filter(Boolean),
    ),
  ];
}

/** Is `catalog_key` on the FE allowlist (VAL-JD-21)? */
export function isSelectCatalogKeyAllowed(catalogKey: string): boolean {
  return (JD_SELECT_CATALOG_ALLOWLIST as readonly string[]).includes(catalogKey);
}

/** Resolve the allowlist key for a catalog row's catalogKey (alias-aware, case-insensitive). */
export function resolveAllowlistCatalogKey(
  catalogKey: string | null | undefined,
): JdSelectCatalogKey | null {
  const k = String(catalogKey ?? '').trim().toLowerCase();
  if (!k) return null;
  for (const allowed of JD_SELECT_CATALOG_ALLOWLIST) {
    if (allowed === k) return allowed;
  }
  return null;
}

/** VAL-JD-21/22/23 — validate a `validation_json` payload for a `select` field.
 *  Returns `{ ok: true }` or `{ ok: false, reason }`. Does NOT throw — UI shows the reason.
 *  - static:  1..50 non-empty options
 *  - catalog: catalog_key on allowlist
 *  - runtime: source_ref non-empty (FE preview only; BE currently rejects runtime → see gap note)
 *  - null/undefined: allowed (BE `assertSelectValidation` passes silently) */
export function validateSelectValidationJson(
  validation: SelectValidationShape | null | undefined,
): { ok: true } | { ok: false; reason: string } {
  if (validation == null) return { ok: true };
  const src = String(validation.source ?? '').trim();
  if (src === JD_SELECT_SOURCE_STATIC) {
    const opts = Array.isArray(validation.options)
      ? (validation.options as unknown[])
          .map((o) => String(o ?? '').trim())
          .filter(Boolean)
      : [];
    if (opts.length === 0) {
      return { ok: false, reason: 'static select cần ít nhất 1 tùy chọn.' };
    }
    if (opts.length > JD_SELECT_STATIC_MAX) {
      return { ok: false, reason: `Tối đa ${JD_SELECT_STATIC_MAX} tùy chọn cho trường Danh sách chọn.` };
    }
    return { ok: true };
  }
  if (src === JD_SELECT_SOURCE_CATALOG) {
    const key = String(validation.catalog_key ?? '').trim();
    if (!key) {
      return { ok: false, reason: 'Chọn catalog_key cho nguồn danh mục.' };
    }
    if (!isSelectCatalogKeyAllowed(key)) {
      return { ok: false, reason: `catalog_key "${key}" không trong danh mục cho phép (VAL-JD-21).` };
    }
    return { ok: true };
  }
  if (src === JD_SELECT_SOURCE_RUNTIME) {
    const ref = String(validation.source_ref ?? '').trim();
    if (!ref) {
      return { ok: false, reason: 'runtime cần source_ref (tham chiếu nguồn).' };
    }
    return { ok: true };
  }
  return { ok: false, reason: 'validation.source phải là static | catalog | runtime.' };
}

/** Normalize a server-returned validation_json into our typed shape (lenient). */
export function normalizeSelectValidation(
  validation: Record<string, unknown> | null | undefined,
): SelectValidationShape | null {
  if (validation == null) return null;
  const src = String((validation as SelectValidationShape).source ?? '').trim();
  if (src === JD_SELECT_SOURCE_STATIC) {
    const opts = Array.isArray((validation as SelectValidationShape).options)
      ? ((validation as SelectValidationShape).options as unknown[])
          .map((o) => String(o ?? '').trim())
          .filter(Boolean)
      : [];
    return { source: JD_SELECT_SOURCE_STATIC, options: opts };
  }
  if (src === JD_SELECT_SOURCE_CATALOG) {
    return {
      source: JD_SELECT_SOURCE_CATALOG,
      catalog_key: String((validation as SelectValidationShape).catalog_key ?? '').trim(),
    };
  }
  if (src === JD_SELECT_SOURCE_RUNTIME) {
    return {
      source: JD_SELECT_SOURCE_RUNTIME,
      source_ref: String((validation as SelectValidationShape).source_ref ?? '').trim(),
      note: (validation as SelectValidationShape).note
        ? String((validation as SelectValidationShape).note)
        : undefined,
    };
  }
  return null;
}

/** Human-readable reason for why the Field Dialog form could not build a validation_json. */
export function selectValidationReason(args: {
  field_type?: string;
  validation_source?: string;
  validation_options?: string;
  validation_catalog_key?: string;
  validation_source_ref?: string;
}): string {
  if (args.field_type !== 'select') return 'Chỉ áp dụng cho trường Danh sách chọn.';
  if (args.validation_source === JD_SELECT_SOURCE_STATIC) {
    const n = normalizeStaticOptions(args.validation_options ?? '').length;
    if (n === 0) return 'static cần ít nhất 1 tùy chọn (VAL-JD-22).';
    if (n > JD_SELECT_STATIC_MAX) return `Tối đa ${JD_SELECT_STATIC_MAX} tùy chọn (VAL-JD-22).`;
  }
  if (args.validation_source === JD_SELECT_SOURCE_CATALOG) {
    const k = String(args.validation_catalog_key ?? '').trim();
    if (!k) return 'Chọn catalog_key (VAL-JD-21).';
    if (!isSelectCatalogKeyAllowed(k)) return `catalog_key "${k}" không trong danh mục cho phép (VAL-JD-21).`;
  }
  if (args.validation_source === JD_SELECT_SOURCE_RUNTIME) {
    if (!String(args.validation_source_ref ?? '').trim()) return 'runtime cần source_ref (VAL-JD-23).';
  }
  return 'validation.source phải là static | catalog | runtime.';
}

/** Build a `validation_json` payload for the Field Dialog create/update flow. */
export function buildSelectValidationJson(args: {
  source: JdSelectSource;
  options?: string;
  catalogKey?: string;
  sourceRef?: string;
  note?: string;
}): JdSelectValidationJson | undefined {
  if (args.source === JD_SELECT_SOURCE_STATIC) {
    const options = normalizeStaticOptions(args.options ?? '');
    if (options.length === 0) return undefined;
    return { source: JD_SELECT_SOURCE_STATIC, options };
  }
  if (args.source === JD_SELECT_SOURCE_CATALOG) {
    const key = String(args.catalogKey ?? '').trim();
    if (!key || !isSelectCatalogKeyAllowed(key)) return undefined;
    return { source: JD_SELECT_SOURCE_CATALOG, catalog_key: key };
  }
  if (args.source === JD_SELECT_SOURCE_RUNTIME) {
    const ref = String(args.sourceRef ?? '').trim();
    if (!ref) return undefined;
    return { source: JD_SELECT_SOURCE_RUNTIME, source_ref: ref, note: args.note };
  }
  return undefined;
}

/** Catalog item shape shared with the settings-catalogs overview (FE plane B master data). */
export type CatalogItemLike = {
  code?: string;
  id?: string;
  label?: string;
  name?: string;
  value?: string;
};

/** Merge effectiveItems for the given catalog key(s) across the overview rows. */
export function selectCatalogItems(
  catalogs: readonly { catalogKey: string; effectiveItems?: readonly CatalogItemLike[] }[],
  catalogKey: string,
): CatalogItemLike[] {
  const key = String(catalogKey ?? '').trim().toLowerCase();
  if (!key) return [];
  const out: CatalogItemLike[] = [];
  const seen = new Set<string>();
  for (const row of catalogs) {
    if (String(row.catalogKey ?? '').trim().toLowerCase() !== key) continue;
    for (const it of row.effectiveItems ?? []) {
      const code = String(it.code ?? it.id ?? it.value ?? '').trim();
      if (!code || seen.has(code)) continue;
      seen.add(code);
      out.push(it);
    }
  }
  return out;
}

/** Display label for a catalog item. */
export function selectCatalogItemLabel(it: CatalogItemLike): string {
  return String(it.label ?? it.name ?? it.code ?? it.id ?? it.value ?? '').trim();
}

/** Resolve a stored select value against the runtime catalog items (VAL-JD-21 — no free-text). */
export function resolveSelectRuntimeValue(
  value: string,
  items: readonly CatalogItemLike[],
): { found: boolean; label: string } {
  const v = String(value ?? '').trim();
  if (!v) return { found: false, label: '' };
  const byCode = items.find((it) => String(it.code ?? '').trim() === v);
  if (byCode) return { found: true, label: selectCatalogItemLabel(byCode) };
  const byLabel = items.find((it) => selectCatalogItemLabel(it) === v);
  if (byLabel) return { found: true, label: v };
  return { found: false, label: v };
}