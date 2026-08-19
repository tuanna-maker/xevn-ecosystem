/**
 * @CODE-MEMORY
 * Screen:     EMP MergeToken register helpers (F-EMP-TOK-01/02/03 · same TX)
 * UC:         AC-PLT-EMP-TOK-01/02/04 · BR-PLT-01/04/05 · VAL-EMP-TOK-*
 * BR:         BR-PLT-01 register matrix · BR-PLT-03 issued immutable · BR-PLT-04 soft retire
 * SRS:        docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-DATA-01.md §2–§5
 * TechSpec:   docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-SA-01.md §5 · §7
 * DB_DESIGN:  DATA-01 EXPAND chk_hrm_merge_tok_origin + emp_catalog · single hrm_merge_tokens
 * API_DESIGN: F-EMP-TOK-01/02/03 side-effect · F-PLT-TOK-02 upsert · F-EMP-TOK-05 bag
 * Purpose:    DOC/ET writer → upsert/retire emp.doc.* / emp.et.* origin=emp_catalog (peer Allowance).
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-BE-01
 * Coded:      2026-08-07
 * Callers:    EmpDocumentTypeService · EmpEmploymentTypeService · MergeTokensService.resolvePreview
 * Callees:    HrmDbQueryFn · MERGE_TOKEN_KEY_FORMAT
 * Impact:     Token upsert fail must rollback DOC/ET TX; invent CCCD/FULL_TIME labels forbidden
 * must_keep:  soft-delete · no second EMP token table · U65 no seed · keyword_map fallback
 * SOLID:      Pure register helpers — no Nest DI; writers own TX boundary
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-merge-token-emp-be-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-EXT-BE-01
 * change_mode: ADD
 * What: F-EMP-TOK-03 — custom.emp.<code> origin=extension_field ring=custom for EMP field
 *   catalog allow-list (Settings extension-items); skip employees core columns; no ba-data EXPAND
 * SRS/SA: EXT-BA-01 AC-04 · EXT-SA-01 Option B′ §5
 * Callers: SettingsCatalogsService.appendExtensionItems / deleteCatalogItem
 * must_keep: DOC/ET emp_catalog SEAL · single hrm_merge_tokens · U65 · ready=false
 */
import { randomUUID } from 'node:crypto';
import type { HrmDbQueryFn } from '../db/hrm-db.service';
import { MERGE_TOKEN_KEY_FORMAT } from './merge-token.constants';

export const EMP_MERGE_TOKEN_ORIGIN = 'emp_catalog' as const;
export const EMP_EXTENSION_MERGE_TOKEN_ORIGIN = 'extension_field' as const;
export const EMP_MERGE_TOKEN_DOMAIN = 'EMP' as const;
export const EMP_EXTENSION_MERGE_TOKEN_RING = 'custom' as const;

/**
 * EXT-SA §5.1 — EMP field-definition catalogs that produce custom.emp.* tokens.
 * Aliases without `hrm_` prefix accepted.
 */
export const EMP_EXTENSION_FIELD_CATALOG_KEYS: ReadonlySet<string> = new Set([
  'hrm_employee_basic_fields',
  'employee_basic_fields',
  'hrm_employee_personal_fields',
  'employee_personal_fields',
  'hrm_employee_work_fields',
  'employee_work_fields',
  'hrm_employee_finance_fields',
  'employee_finance_fields',
]);

/**
 * Core `employees` columns (+ status aliases) — FORBIDDEN as custom.emp.* (builtin/column paths).
 * Codes living only in custom_fields JSON remain eligible for register.
 */
export const EMP_EXTENSION_CORE_COLUMN_CODES: ReadonlySet<string> = new Set([
  'id',
  'company_id',
  'employee_id',
  'employee_code',
  'email',
  'full_name',
  'job_title_key',
  'status',
  'employment_status',
  'hired_at',
  'manager_id',
  'avatar_url',
  'archived_at',
  'created_at',
  'updated_at',
]);

export function isEmpExtensionFieldCatalogKey(catalogKey: string): boolean {
  const key = String(catalogKey ?? '')
    .trim()
    .toLowerCase();
  return EMP_EXTENSION_FIELD_CATALOG_KEYS.has(key);
}

export function normalizeEmpExtensionFieldCode(code: string): string {
  return String(code ?? '')
    .trim()
    .toLowerCase()
    .replace(/-/g, '_');
}

export function shouldSkipEmpExtensionCoreColumn(code: string): boolean {
  return EMP_EXTENSION_CORE_COLUMN_CODES.has(normalizeEmpExtensionFieldCode(code));
}

/** Format DOC key into merge token — `emp.doc.<document_type_key>`. */
export function mergeTokenKeyForEmpDoc(documentTypeKey: string): string {
  const key = String(documentTypeKey ?? '')
    .trim()
    .toLowerCase();
  return `emp.doc.${key}`;
}

/** Format ET key into merge token — hyphen→underscore then `emp.et.<employment_type_key>`. */
export function mergeTokenKeyForEmpEt(employmentTypeKey: string): string {
  const key = String(employmentTypeKey ?? '')
    .trim()
    .toLowerCase()
    .replace(/-/g, '_');
  return `emp.et.${key}`;
}

export function mergeTokenSourcePathForEmpDoc(documentTypeKey: string): string {
  const key = String(documentTypeKey ?? '')
    .trim()
    .toLowerCase();
  return `emp.document_types.${key}`;
}

export function mergeTokenSourcePathForEmpEt(employmentTypeKey: string): string {
  const key = String(employmentTypeKey ?? '')
    .trim()
    .toLowerCase()
    .replace(/-/g, '_');
  return `emp.employment_types.${key}`;
}

/** Format EMP extension field into merge token — `custom.emp.<code>` (F-EMP-TOK-03). */
export function mergeTokenKeyForEmpExtension(code: string): string {
  return `custom.emp.${normalizeEmpExtensionFieldCode(code)}`;
}

export function mergeTokenSourcePathForEmpExtension(code: string): string {
  return `custom.emp.${normalizeEmpExtensionFieldCode(code)}`;
}

/**
 * EXPAND origin CHK to include emp_catalog (retain allowance_catalog).
 * Idempotent — safe inside DOC/ET TX before first upsert.
 */
export async function ensureMergeTokenOriginIncludesEmpCatalog(
  query: HrmDbQueryFn,
): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS public.hrm_merge_tokens (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      company_id text NOT NULL,
      token_key text NOT NULL,
      source_path text NOT NULL,
      ring text NOT NULL,
      domain text NOT NULL,
      label_vi text NOT NULL,
      status text NOT NULL DEFAULT 'active',
      origin text NOT NULL DEFAULT 'builtin',
      extension_field_ref text NULL,
      meta_json jsonb NULL,
      version int NOT NULL DEFAULT 1,
      archived_at timestamptz NULL,
      created_at timestamptz NOT NULL DEFAULT NOW(),
      updated_at timestamptz NOT NULL DEFAULT NOW(),
      created_by text NULL,
      updated_by text NULL
    );
  `);
  await query(`
    CREATE UNIQUE INDEX IF NOT EXISTS uq_hrm_merge_tok_company_key_active
      ON public.hrm_merge_tokens (company_id, lower(token_key))
      WHERE archived_at IS NULL;
  `);
  await query(`
    DO $$ BEGIN
      ALTER TABLE public.hrm_merge_tokens
        DROP CONSTRAINT IF EXISTS chk_hrm_merge_tok_origin;
      ALTER TABLE public.hrm_merge_tokens
        ADD CONSTRAINT chk_hrm_merge_tok_origin
        CHECK (origin IN (
          'builtin',
          'keyword_map',
          'extension_field',
          'import',
          'allowance_catalog',
          'emp_catalog'
        ));
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);
}

export type UpsertEmpCatalogMergeTokenArgs = {
  companyId: string;
  tokenKey: string;
  sourcePath: string;
  labelVi: string;
  extensionFieldRef?: string | null;
  active: boolean;
  actor?: string | null;
};

/**
 * F-PLT-TOK-02 class upsert for EMP catalog tokens (origin=emp_catalog).
 * active=false → soft retire (BR-PLT-04). Format fail → throw Error with code.
 */
export async function upsertEmpCatalogMergeToken(
  query: HrmDbQueryFn,
  args: UpsertEmpCatalogMergeTokenArgs,
): Promise<string> {
  await ensureMergeTokenOriginIncludesEmpCatalog(query);
  const tokenKey = String(args.tokenKey ?? '')
    .trim()
    .toLowerCase();
  if (!tokenKey || !MERGE_TOKEN_KEY_FORMAT.test(tokenKey)) {
    const err = new Error('HRM-PLT-CAT-CODE-INVALID: tokenKey format invalid for EMP catalog register');
    (err as { code?: string }).code = 'HRM-PLT-CAT-CODE-INVALID';
    throw err;
  }
  const sourcePath = String(args.sourcePath ?? '').trim() || tokenKey;
  const labelVi = String(args.labelVi ?? '').trim() || tokenKey;
  const extRef =
    args.extensionFieldRef != null
      ? String(args.extensionFieldRef).trim() || null
      : null;

  if (!args.active) {
    await query(
      `UPDATE public.hrm_merge_tokens
       SET status = 'retired',
           archived_at = COALESCE(archived_at, NOW()),
           updated_at = NOW(),
           updated_by = $3
       WHERE company_id = $1 AND lower(token_key) = lower($2) AND archived_at IS NULL;`,
      [args.companyId, tokenKey, args.actor ?? null],
    );
    return tokenKey;
  }

  const existing = await query<{ id: string; version: number }>(
    `SELECT id, version FROM public.hrm_merge_tokens
     WHERE company_id = $1 AND lower(token_key) = lower($2) AND archived_at IS NULL
     LIMIT 1;`,
    [args.companyId, tokenKey],
  );
  if (existing.rows[0]) {
    await query(
      `UPDATE public.hrm_merge_tokens SET
        source_path = $2,
        ring = 'public',
        domain = $3,
        label_vi = $4,
        status = 'active',
        origin = $5,
        extension_field_ref = $6,
        version = $7,
        archived_at = NULL,
        updated_at = NOW(),
        updated_by = $8
       WHERE id = $1::uuid;`,
      [
        existing.rows[0].id,
        sourcePath,
        EMP_MERGE_TOKEN_DOMAIN,
        labelVi,
        EMP_MERGE_TOKEN_ORIGIN,
        extRef,
        Number(existing.rows[0].version) + 1,
        args.actor ?? null,
      ],
    );
    return tokenKey;
  }

  await query(
    `INSERT INTO public.hrm_merge_tokens
      (id, company_id, token_key, source_path, ring, domain, label_vi, status, origin,
       extension_field_ref, created_by, updated_by)
     VALUES
      ($1::uuid, $2, $3, $4, 'public', $5, $6, 'active', $7, $8, $9, $9);`,
    [
      randomUUID(),
      args.companyId,
      tokenKey,
      sourcePath,
      EMP_MERGE_TOKEN_DOMAIN,
      labelVi,
      EMP_MERGE_TOKEN_ORIGIN,
      extRef,
      args.actor ?? null,
    ],
  );
  return tokenKey;
}

export type UpsertEmpExtensionFieldMergeTokenArgs = {
  companyId: string;
  /** Extension item code (normalized to custom.emp.<code>). */
  code: string;
  labelVi: string;
  active: boolean;
  actor?: string | null;
};

/**
 * F-EMP-TOK-03 / F-PLT-TOK-02 class upsert for EMP extension fields (origin=extension_field).
 * active=false → soft retire (BR-PLT-04 / BR-PLT-EMP-TOK-02).
 * Core employee columns → no-op skip (do not invent custom.emp for builtin paths).
 */
export async function upsertEmpExtensionFieldMergeToken(
  query: HrmDbQueryFn,
  args: UpsertEmpExtensionFieldMergeTokenArgs,
): Promise<string | null> {
  const code = normalizeEmpExtensionFieldCode(args.code);
  if (!code || shouldSkipEmpExtensionCoreColumn(code)) {
    return null;
  }

  await ensureMergeTokenOriginIncludesEmpCatalog(query);
  const tokenKey = mergeTokenKeyForEmpExtension(code);
  if (!MERGE_TOKEN_KEY_FORMAT.test(tokenKey)) {
    const err = new Error(
      'HRM-PLT-CAT-CODE-INVALID: tokenKey format invalid for EMP extension register',
    );
    (err as { code?: string }).code = 'HRM-PLT-CAT-CODE-INVALID';
    throw err;
  }
  const sourcePath = mergeTokenSourcePathForEmpExtension(code);
  const labelVi = String(args.labelVi ?? '').trim() || code;
  const extRef = code;

  if (!args.active) {
    await query(
      `UPDATE public.hrm_merge_tokens
       SET status = 'retired',
           archived_at = COALESCE(archived_at, NOW()),
           updated_at = NOW(),
           updated_by = $3
       WHERE company_id = $1 AND lower(token_key) = lower($2) AND archived_at IS NULL;`,
      [args.companyId, tokenKey, args.actor ?? null],
    );
    return tokenKey;
  }

  const existing = await query<{ id: string; version: number }>(
    `SELECT id, version FROM public.hrm_merge_tokens
     WHERE company_id = $1 AND lower(token_key) = lower($2) AND archived_at IS NULL
     LIMIT 1;`,
    [args.companyId, tokenKey],
  );
  if (existing.rows[0]) {
    await query(
      `UPDATE public.hrm_merge_tokens SET
        source_path = $2,
        ring = $3,
        domain = $4,
        label_vi = $5,
        status = 'active',
        origin = $6,
        extension_field_ref = $7,
        version = $8,
        archived_at = NULL,
        updated_at = NOW(),
        updated_by = $9
       WHERE id = $1::uuid;`,
      [
        existing.rows[0].id,
        sourcePath,
        EMP_EXTENSION_MERGE_TOKEN_RING,
        EMP_MERGE_TOKEN_DOMAIN,
        labelVi,
        EMP_EXTENSION_MERGE_TOKEN_ORIGIN,
        extRef,
        Number(existing.rows[0].version) + 1,
        args.actor ?? null,
      ],
    );
    return tokenKey;
  }

  await query(
    `INSERT INTO public.hrm_merge_tokens
      (id, company_id, token_key, source_path, ring, domain, label_vi, status, origin,
       extension_field_ref, created_by, updated_by)
     VALUES
      ($1::uuid, $2, $3, $4, $5, $6, $7, 'active', $8, $9, $10, $10);`,
    [
      randomUUID(),
      args.companyId,
      tokenKey,
      sourcePath,
      EMP_EXTENSION_MERGE_TOKEN_RING,
      EMP_MERGE_TOKEN_DOMAIN,
      labelVi,
      EMP_EXTENSION_MERGE_TOKEN_ORIGIN,
      extRef,
      args.actor ?? null,
    ],
  );
  return tokenKey;
}

/**
 * F-EMP-TOK-05 — bind effective DOC/ET name_vi into resolve bag (DATA §5.2 step 2 values).
 * FORBIDDEN invent CCCD/FULL_TIME when catalog missing.
 */
export function enrichEmpCatalogLabelsIntoBag(input: {
  valueBag: Record<string, unknown>;
  /** document_type_key → name_vi (active or retired-for-history) */
  documentTypeLabels?: ReadonlyMap<string, string> | Record<string, string> | null;
  /** employment_type_key → name_vi */
  employmentTypeLabels?: ReadonlyMap<string, string> | Record<string, string> | null;
  /** Employee denorm employment_type key for alias employee.employment_type_label */
  employeeEmploymentTypeKey?: string | null;
}): Record<string, unknown> {
  const bag: Record<string, unknown> = { ...input.valueBag };

  const asMap = (
    src: ReadonlyMap<string, string> | Record<string, string> | null | undefined,
  ): Map<string, string> => {
    if (!src) return new Map();
    if (src instanceof Map) return src;
    return new Map(
      Object.entries(src).map(([k, v]) => [k.toLowerCase().replace(/-/g, '_'), v]),
    );
  };

  const docs = asMap(input.documentTypeLabels);
  for (const [key, nameVi] of docs) {
    const tokenKey = mergeTokenKeyForEmpDoc(key);
    bag[tokenKey] = nameVi;
    bag[mergeTokenSourcePathForEmpDoc(key)] = nameVi;
    bag[tokenKey.replace(/\./g, '_')] = nameVi;
  }

  const ets = asMap(input.employmentTypeLabels);
  for (const [key, nameVi] of ets) {
    const norm = key.toLowerCase().replace(/-/g, '_');
    const tokenKey = mergeTokenKeyForEmpEt(norm);
    bag[tokenKey] = nameVi;
    bag[mergeTokenSourcePathForEmpEt(norm)] = nameVi;
    bag[tokenKey.replace(/\./g, '_')] = nameVi;
  }

  const etKey = input.employeeEmploymentTypeKey
    ? String(input.employeeEmploymentTypeKey).trim().toLowerCase().replace(/-/g, '_')
    : '';
  if (etKey) {
    const label = ets.get(etKey);
    if (label != null && label !== '') {
      bag['employee.employment_type_label'] = label;
      bag.employee_employment_type_label = label;
    }
  }

  return bag;
}
