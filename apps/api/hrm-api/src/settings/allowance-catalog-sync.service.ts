/**
 * @CODE-MEMORY
 * Screen:     HRM → Cài đặt → Danh mục phụ cấp / khấu trừ (F-ALLOW-CAT-01..05)
 * UC:         UC-SET-DEF-03 · AC-AMIS-SET-PC-CAT-01 · AC-PLT-PAY-01
 * BR:         BR-AMIS-SET-DEF-03 · BR-PLT-01/04/05 · BR-AMIS-SET-DEF-07
 * SRS:        docs/program/specs/PO-HRM-ALLOWANCE-CATALOG-SYNC-01.md §3–§5
 * TechSpec:   docs/program/specs/PO-HRM-ALLOWANCE-CATALOG-SYNC-API-01.md F-ALLOW-CAT-*
 * DB_DESIGN:  docs/program/specs/PO-HRM-ALLOWANCE-CATALOG-SYNC-01.md §3
 * API_DESIGN: docs/program/specs/PO-HRM-ALLOWANCE-CATALOG-SYNC-API-01.md §3
 * Purpose:    SoT Settings PC/KT — single TX sync mirror salary_components + MergeToken register.
 * WorkItem:   PO-HRM-ALLOWANCE-CATALOG-SYNC-BE-01
 * Coded:      2026-08-07
 * Callers:    allowance-catalog.controller · settings-catalogs overview (count)
 * Callees:    HrmDbService.withTransaction · SettingsCatalogsService.assertCodeInEffectiveCatalog
 * FE-Actions: Tạo mã → POST → F5 list; Lương picker đọc SC mirror cùng code
 * BE-Chain:   ensureSchema PC → INSERT/UPDATE/retire → UPSERT SC → UPSERT token → back-ref
 * Impact:     Dual-write half-sync → orphan SC/token; scope drift → 404 OOS
 * must_keep:  open N+1 · soft-delete · single TX · PAY-native not via PC · U65 no seed · payroll_e2e_ready=false
 * SOLID:      Sync service owns PC table + mirror/token side-effects; PAY CRUD guard stays in PayrollCatalogService
 * LastVerified: docs/qa/evidence/po-hrm-allowance-catalog-sync-be-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-ALLOWANCE-CATALOG-SYNC-BE-01
 * change_mode: ADD
 * What: ensureSchema hrm_allowance_deduction_types; F-ALLOW-CAT CRUD+retire+merge-tokens; single TX sync
 * must_keep: resolveHrmSettingsCatalogCompanyId · VAL-ALLOW-01..15 · no seed
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-ALLOWANCE-CATALOG-SYNC-BE-02
 * change_mode: FIX
 * What: countActivePolicyLines — SAVEPOINT before optional policy-line COUNT; ROLLBACK TO on fail
 *       so missing table / SQL error cannot abort outer retire TX (D-ALLOW-CAT-QA-01 / VAL-ALLOW-09)
 * must_keep: soft retire still mirrors SC inactive + token retired; warn-only policy count
 * LastVerified: docs/qa/evidence/po-hrm-allowance-catalog-sync-be-02.md
 */
import { HttpStatus, Injectable, Optional } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import {
  assertResourceInHrmScope,
  MASTER_TENANT_ID,
  pushCompanyIdFilter,
  resolveHrmListScope,
  resolveHrmSettingsCatalogCompanyId,
} from '../common/hrm-list-scope';
import { masterTenantIdFromEnv } from '../common/tenant-scope-env';
import { HrmDbQueryFn, HrmDbService } from '../db/hrm-db.service';
import { SettingsCatalogsService } from '../settings-catalogs/settings-catalogs.service';
import { HRM_PAY_TYPE_KEY } from '../payroll/payroll-catalog.service';
import {
  ALLOWANCE_CATALOG_CODE_FORMAT,
  ALLOWANCE_ENTRY_KINDS,
  ALLOWANCE_NATURES,
  defaultComponentTypeForEntryKind,
  defaultNatureForEntryKind,
  HRM_ALLOW_CAT_404,
  HRM_ALLOW_CAT_409_CODE,
  HRM_ALLOW_CAT_500_SYNC,
  HRM_ALLOW_CAT_CODE_INVALID,
  HRM_ALLOW_CAT_NATURE_MISMATCH,
  HRM_PAY_FORMULA_404_DEF,
  mergeTokenKeyForEntry,
  mergeTokenSourcePathForEntry,
  type AllowanceEntryKind,
  type AllowanceNature,
} from './allowance-catalog.constants';
import {
  CreateAllowanceDeductionTypeDto,
  ListAllowanceDeductionTypesQueryDto,
  UpdateAllowanceDeductionTypeDto,
} from './dto/allowance-deduction-type.dto';

type PcRow = {
  id: string;
  company_id: string;
  code: string;
  name_vi: string;
  entry_kind: string;
  nature: string;
  value_type: string;
  is_taxable: boolean;
  is_insurance_base: boolean;
  calc_mode: string;
  default_value: string | number;
  min_value: string | number | null;
  max_value: string | number | null;
  default_formula_definition_id: string | null;
  salary_component_id: string | null;
  component_code: string;
  description: string | null;
  sort_order: number;
  status: string;
  is_system: boolean;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
  sc_component_type?: string | null;
  sc_name?: string | null;
  formula_code?: string | null;
  formula_version?: number | null;
  formula_status?: string | null;
};

@Injectable()
export class AllowanceCatalogSyncService {
  private schemaReady = false;

  constructor(
    private readonly db: HrmDbService,
    @Optional() private readonly settingsCatalogs?: SettingsCatalogsService,
  ) {}

  private resolveCatalogTenantId(): string {
    return masterTenantIdFromEnv() || MASTER_TENANT_ID;
  }

  async ensureSchema(): Promise<void> {
    if (this.schemaReady) return;
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.hrm_allowance_deduction_types (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id text NOT NULL,
        code text NOT NULL,
        name_vi text NOT NULL,
        entry_kind text NOT NULL,
        nature text NOT NULL DEFAULT 'income',
        value_type text NOT NULL DEFAULT 'currency',
        is_taxable boolean NOT NULL DEFAULT FALSE,
        is_insurance_base boolean NOT NULL DEFAULT FALSE,
        calc_mode text NOT NULL DEFAULT 'fixed',
        default_value numeric(18,2) NOT NULL DEFAULT 0,
        min_value numeric(18,2) NULL,
        max_value numeric(18,2) NULL,
        default_formula_definition_id uuid NULL,
        salary_component_id uuid NULL,
        component_code text NOT NULL,
        description text NULL,
        sort_order int NOT NULL DEFAULT 0,
        status text NOT NULL DEFAULT 'active',
        is_system boolean NOT NULL DEFAULT FALSE,
        archived_at timestamptz NULL,
        created_at timestamptz NOT NULL DEFAULT NOW(),
        updated_at timestamptz NOT NULL DEFAULT NOW(),
        created_by text NULL,
        updated_by text NULL
      );
    `);
    await this.db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_hrm_allow_ded_company_code_active
        ON public.hrm_allowance_deduction_types (company_id, lower(code))
        WHERE archived_at IS NULL;
    `);
    await this.db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_hrm_allow_ded_sc_link_active
        ON public.hrm_allowance_deduction_types (salary_component_id)
        WHERE archived_at IS NULL AND salary_component_id IS NOT NULL;
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_hrm_allow_ded_company_kind_status
        ON public.hrm_allowance_deduction_types (company_id, entry_kind, status);
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_hrm_allow_ded_company_sort
        ON public.hrm_allowance_deduction_types (company_id, sort_order);
    `);
    await this.db.query(`
      DO $$ BEGIN
        ALTER TABLE public.hrm_allowance_deduction_types
          DROP CONSTRAINT IF EXISTS chk_allow_entry_kind;
        ALTER TABLE public.hrm_allowance_deduction_types
          ADD CONSTRAINT chk_allow_entry_kind
          CHECK (entry_kind IN ('allowance','deduction'));
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await this.db.query(`
      DO $$ BEGIN
        ALTER TABLE public.hrm_allowance_deduction_types
          DROP CONSTRAINT IF EXISTS chk_allow_nature;
        ALTER TABLE public.hrm_allowance_deduction_types
          ADD CONSTRAINT chk_allow_nature
          CHECK (nature IN ('income','deduction','other'));
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await this.db.query(`
      DO $$ BEGIN
        ALTER TABLE public.hrm_allowance_deduction_types
          DROP CONSTRAINT IF EXISTS chk_allow_calc_mode;
        ALTER TABLE public.hrm_allowance_deduction_types
          ADD CONSTRAINT chk_allow_calc_mode
          CHECK (calc_mode IN ('fixed','formula','rate'));
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await this.db.query(`
      DO $$ BEGIN
        ALTER TABLE public.hrm_allowance_deduction_types
          DROP CONSTRAINT IF EXISTS chk_allow_status;
        ALTER TABLE public.hrm_allowance_deduction_types
          ADD CONSTRAINT chk_allow_status
          CHECK (status IN ('draft','active','retired'));
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await this.db.query(`
      DO $$ BEGIN
        ALTER TABLE public.hrm_allowance_deduction_types
          DROP CONSTRAINT IF EXISTS chk_allow_code_format;
        ALTER TABLE public.hrm_allowance_deduction_types
          ADD CONSTRAINT chk_allow_code_format
          CHECK (code ~ '^[A-Za-z][A-Za-z0-9_]{1,62}$');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    // FORBIDDEN: CHECK (code IN (...)) closed N-set
    this.schemaReady = true;
  }

  /** Public for jest schema assertions. */
  async ensureSchemaPublic(): Promise<void> {
    await this.ensureSchema();
  }

  /** Overview sample — honest empty when zero rows (U65). */
  async listOverviewSample(
    companyId: string,
    limit = 8,
  ): Promise<{
    count: number;
    sample: Array<{ code: string; label: string; status: string }>;
  }> {
    await this.ensureSchema();
    const countRes = await this.db.query<{ c: string }>(
      `SELECT COUNT(*)::text AS c FROM public.hrm_allowance_deduction_types
       WHERE company_id = $1 AND archived_at IS NULL AND status <> 'retired';`,
      [companyId],
    );
    const sampleRes = await this.db.query<{
      code: string;
      name_vi: string;
      status: string;
    }>(
      `SELECT code, name_vi, status FROM public.hrm_allowance_deduction_types
       WHERE company_id = $1 AND archived_at IS NULL AND status <> 'retired'
       ORDER BY sort_order ASC, code ASC
       LIMIT $2;`,
      [companyId, limit],
    );
    return {
      count: Number(countRes.rows[0]?.c ?? 0),
      sample: sampleRes.rows.map((r) => ({
        code: r.code,
        label: r.name_vi,
        status: r.status,
      })),
    };
  }

  async findAllowanceCatalogLink(opts: {
    salaryComponentId?: string | null;
    companyId?: string;
    code?: string;
  }): Promise<{ id: string; code: string } | null> {
    await this.ensureSchema();
    if (opts.salaryComponentId) {
      const res = await this.db.query<{ id: string; code: string }>(
        `SELECT id, code FROM public.hrm_allowance_deduction_types
         WHERE salary_component_id = $1::uuid AND archived_at IS NULL
         LIMIT 1;`,
        [opts.salaryComponentId],
      );
      return res.rows[0] ?? null;
    }
    if (opts.companyId && opts.code) {
      const res = await this.db.query<{ id: string; code: string }>(
        `SELECT id, code FROM public.hrm_allowance_deduction_types
         WHERE company_id = $1 AND lower(code) = lower($2) AND archived_at IS NULL
         LIMIT 1;`,
        [opts.companyId, opts.code],
      );
      return res.rows[0] ?? null;
    }
    return null;
  }

  private resolvePartition(
    authorization: string | undefined,
    tenantId: string | undefined,
    companyId: string,
  ): {
    catalogCompanyId: string;
    scope: ReturnType<typeof resolveHrmListScope>;
  } {
    const tenant = (tenantId ?? this.resolveCatalogTenantId())
      .trim()
      .toLowerCase();
    const catalogCompanyId = resolveHrmSettingsCatalogCompanyId(
      authorization,
      tenant,
      companyId,
    );
    const scope = resolveHrmListScope(authorization, catalogCompanyId, {
      tenantId: tenant,
    });
    return { catalogCompanyId, scope };
  }

  private assertCodeFormat(code: string): string {
    const trimmed = code.trim();
    if (!ALLOWANCE_CATALOG_CODE_FORMAT.test(trimmed)) {
      throw new ApiException(
        HRM_ALLOW_CAT_CODE_INVALID,
        'Allowance/deduction code must match open slug format (letters, digits, underscore)',
        HttpStatus.BAD_REQUEST,
      );
    }
    return trimmed;
  }

  private assertEntryNature(
    entryKind: AllowanceEntryKind,
    nature: AllowanceNature,
  ): void {
    if (entryKind === 'allowance' && nature !== 'income') {
      throw new ApiException(
        HRM_ALLOW_CAT_NATURE_MISMATCH,
        'entryKind=allowance requires nature=income',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (entryKind === 'deduction' && nature !== 'deduction') {
      throw new ApiException(
        HRM_ALLOW_CAT_NATURE_MISMATCH,
        'entryKind=deduction requires nature=deduction',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private async assertPayTypeKey(
    companyId: string,
    componentType: string,
  ): Promise<string> {
    const code = componentType.trim();
    if (!code) {
      throw new ApiException(
        HRM_PAY_TYPE_KEY,
        'componentType is required',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!this.settingsCatalogs) return code;
    const hit = await this.settingsCatalogs.assertCodeInEffectiveCatalog({
      tenantId: this.resolveCatalogTenantId(),
      companyId,
      catalogKey: 'pay_types',
      code,
      errorCode: HRM_PAY_TYPE_KEY,
      errorMessage: `componentType '${code}' is not in pay_types catalog`,
    });
    return hit.code;
  }

  private async assertUniquePcCode(
    query: HrmDbQueryFn,
    companyId: string,
    code: string,
    excludeId?: string,
  ): Promise<void> {
    const values: unknown[] = [companyId, code];
    let sql = `
      SELECT id FROM public.hrm_allowance_deduction_types
      WHERE company_id = $1 AND lower(code) = lower($2) AND archived_at IS NULL
    `;
    if (excludeId) {
      values.push(excludeId);
      sql += ` AND id <> $${values.length}::uuid`;
    }
    sql += ' LIMIT 1';
    const dup = await query<{ id: string }>(sql, values);
    if (dup.rows[0]) {
      throw new ApiException(
        HRM_ALLOW_CAT_409_CODE,
        `Allowance/deduction code '${code}' already exists for company`,
        HttpStatus.CONFLICT,
      );
    }
  }

  private async assertPublishedFormula(
    query: HrmDbQueryFn,
    definitionId: string,
    companyIds: string[],
  ): Promise<{ id: string; code: string; version: number; status: string }> {
    const filters: string[] = [
      'id = $1::uuid',
      'archived_at IS NULL',
      "status = 'active'",
    ];
    const values: unknown[] = [definitionId];
    if (companyIds.length === 1) {
      values.push(companyIds[0]);
      filters.push(`company_id = $${values.length}`);
    } else {
      values.push(companyIds);
      filters.push(`company_id = ANY($${values.length}::text[])`);
    }
    try {
      const res = await query<{
        id: string;
        code: string;
        version: number;
        status: string;
      }>(
        `SELECT id, code, version, status FROM public.pay_formula_definitions
         WHERE ${filters.join(' AND ')} LIMIT 1;`,
        values,
      );
      if (!res.rows[0]) {
        throw new ApiException(
          HRM_PAY_FORMULA_404_DEF,
          'defaultFormulaDefinitionId not found in company scope',
          HttpStatus.NOT_FOUND,
        );
      }
      return res.rows[0];
    } catch (err: unknown) {
      if (err instanceof ApiException) throw err;
      const msg = err instanceof Error ? err.message : String(err);
      if (/relation .*pay_formula_definitions.* does not exist/i.test(msg)) {
        throw new ApiException(
          HRM_PAY_FORMULA_404_DEF,
          'pay_formula_definitions unavailable',
          HttpStatus.NOT_FOUND,
        );
      }
      throw err;
    }
  }

  private mapDisplayRow(
    row: PcRow,
    extras?: {
      policyOrphanWarn?: { activePolicyLineCount: number };
      mergeTokenKey?: string;
    },
  ) {
    const entryKind = row.entry_kind as AllowanceEntryKind;
    const tokenKey =
      extras?.mergeTokenKey ??
      (row.status === 'active' && !row.archived_at
        ? mergeTokenKeyForEntry(entryKind, row.code)
        : undefined);
    const componentType =
      row.sc_component_type ?? defaultComponentTypeForEntryKind(entryKind);
    return {
      id: row.id,
      companyId: row.company_id,
      code: row.code,
      nameVi: row.name_vi,
      entryKind: row.entry_kind,
      nature: row.nature,
      valueType: row.value_type,
      isTaxable: row.is_taxable,
      isInsuranceBase: row.is_insurance_base,
      calcMode: row.calc_mode,
      defaultValue: Number(row.default_value ?? 0),
      minValue: row.min_value == null ? null : Number(row.min_value),
      maxValue: row.max_value == null ? null : Number(row.max_value),
      defaultFormulaDefinitionId: row.default_formula_definition_id,
      defaultFormula: row.default_formula_definition_id
        ? {
            id: row.default_formula_definition_id,
            code: row.formula_code ?? null,
            version: row.formula_version ?? null,
            status: row.formula_status ?? null,
          }
        : null,
      salaryComponentId: row.salary_component_id,
      componentCode: row.component_code,
      componentType,
      componentTypeLabel: componentType,
      description: row.description,
      sortOrder: row.sort_order,
      status: row.status,
      isSystem: row.is_system,
      archivedAt: row.archived_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      createdBy: row.created_by,
      updatedBy: row.updated_by,
      sync: {
        salaryComponentSynced: Boolean(row.salary_component_id),
        mergeTokenKey: tokenKey,
      },
      policyOrphanWarn: extras?.policyOrphanWarn,
      payroll_e2e_ready: false,
    };
  }

  private selectPcSql(where: string): string {
    return `
      SELECT pc.*,
        sc.component_type AS sc_component_type,
        sc.name AS sc_name,
        fd.code AS formula_code,
        fd.version AS formula_version,
        fd.status AS formula_status
      FROM public.hrm_allowance_deduction_types pc
      LEFT JOIN public.salary_components sc ON sc.id = pc.salary_component_id
      LEFT JOIN public.pay_formula_definitions fd
        ON fd.id = pc.default_formula_definition_id AND fd.archived_at IS NULL
      WHERE ${where}
    `;
  }

  async listTypes(
    query: ListAllowanceDeductionTypesQueryDto,
    authorization?: string,
    tenantId?: string,
  ) {
    await this.ensureSchema();
    const { scope } = this.resolvePartition(
      authorization,
      tenantId,
      query.company_id,
    );
    const filters: string[] = [];
    const values: unknown[] = [];
    pushCompanyIdFilter(filters, values, scope.companyIds);
    const whereParts = filters.map((f) =>
      f.replace(/\bcompany_id\b/g, 'pc.company_id'),
    );
    if (!query.include_retired) {
      whereParts.push("pc.status <> 'retired'");
      whereParts.push('pc.archived_at IS NULL');
    }
    if (query.entry_kind) {
      values.push(query.entry_kind);
      whereParts.push(`pc.entry_kind = $${values.length}`);
    }
    if (query.status) {
      values.push(query.status);
      whereParts.push(`pc.status = $${values.length}`);
    }
    if (query.q?.trim()) {
      values.push(`%${query.q.trim()}%`);
      whereParts.push(
        `(pc.code ILIKE $${values.length} OR pc.name_vi ILIKE $${values.length})`,
      );
    }
    const res = await this.db.query<PcRow>(
      `${this.selectPcSql(whereParts.join(' AND '))}
       ORDER BY pc.sort_order ASC, pc.code ASC;`,
      values,
    );
    return {
      items: res.rows.map((r) => this.mapDisplayRow(r)),
      total: res.rows.length,
      payroll_e2e_ready: false,
    };
  }

  async getById(
    id: string,
    companyId: string,
    authorization?: string,
    tenantId?: string,
  ) {
    await this.ensureSchema();
    const { scope } = this.resolvePartition(authorization, tenantId, companyId);
    const filters: string[] = ['pc.id = $1::uuid'];
    const values: unknown[] = [id];
    pushCompanyIdFilter(filters, values, scope.companyIds);
    const where = filters
      .map((f) => f.replace(/\bcompany_id\b/g, 'pc.company_id'))
      .join(' AND ');
    const res = await this.db.query<PcRow>(
      `${this.selectPcSql(where)} LIMIT 1;`,
      values,
    );
    if (!res.rows[0]) {
      throw new ApiException(
        HRM_ALLOW_CAT_404,
        'Allowance/deduction type not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return this.mapDisplayRow(res.rows[0]);
  }

  private async ensureSalaryComponentSchema(
    query: HrmDbQueryFn,
  ): Promise<void> {
    await query(`
      CREATE TABLE IF NOT EXISTS public.salary_components (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL,
        code TEXT NOT NULL,
        name TEXT NOT NULL,
        category_id UUID,
        component_type TEXT NOT NULL,
        nature TEXT NOT NULL DEFAULT 'income',
        value_type TEXT NOT NULL DEFAULT 'currency',
        is_taxable BOOLEAN NOT NULL DEFAULT FALSE,
        is_insurance_base BOOLEAN NOT NULL DEFAULT FALSE,
        formula TEXT,
        default_value NUMERIC NOT NULL DEFAULT 0,
        min_value NUMERIC,
        max_value NUMERIC,
        description TEXT,
        applied_to TEXT NOT NULL DEFAULT 'all',
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        sort_order INTEGER NOT NULL DEFAULT 0,
        default_formula_definition_id UUID NULL,
        archived_at TIMESTAMPTZ NULL,
        is_system BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await query(`
      ALTER TABLE public.salary_components
      ADD COLUMN IF NOT EXISTS default_formula_definition_id UUID NULL,
      ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ NULL,
      ADD COLUMN IF NOT EXISTS is_system BOOLEAN NOT NULL DEFAULT FALSE;
    `);
    await query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_salary_components_company_code
      ON public.salary_components (company_id, lower(code))
      WHERE archived_at IS NULL;
    `);
  }

  private async ensureMergeTokenSchema(query: HrmDbQueryFn): Promise<void> {
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
          CHECK (origin IN ('builtin','keyword_map','extension_field','import','allowance_catalog','emp_catalog'));
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
  }

  private async upsertSalaryMirror(
    query: HrmDbQueryFn,
    args: {
      companyId: string;
      code: string;
      nameVi: string;
      componentType: string;
      nature: string;
      valueType: string;
      isTaxable: boolean;
      isInsuranceBase: boolean;
      defaultValue: number;
      minValue: number | null;
      maxValue: number | null;
      defaultFormulaId: string | null;
      sortOrder: number;
      isActive: boolean;
      archivedAt: string | null;
      isSystem: boolean;
      description: string | null;
      existingScId?: string | null;
    },
  ): Promise<string> {
    await this.ensureSalaryComponentSchema(query);
    if (args.existingScId) {
      const upd = await query<{ id: string }>(
        `UPDATE public.salary_components SET
          code = $2, name = $3, component_type = $4, nature = $5, value_type = $6,
          is_taxable = $7, is_insurance_base = $8, default_value = $9,
          min_value = $10, max_value = $11, default_formula_definition_id = $12::uuid,
          sort_order = $13, is_active = $14, archived_at = $15::timestamptz,
          is_system = $16, description = $17, updated_at = NOW()
         WHERE id = $1::uuid
         RETURNING id;`,
        [
          args.existingScId,
          args.code,
          args.nameVi,
          args.componentType,
          args.nature,
          args.valueType,
          args.isTaxable,
          args.isInsuranceBase,
          args.defaultValue,
          args.minValue,
          args.maxValue,
          args.defaultFormulaId,
          args.sortOrder,
          args.isActive,
          args.archivedAt,
          args.isSystem,
          args.description,
        ],
      );
      if (upd.rows[0]?.id) return upd.rows[0].id;
    }
    const existing = await query<{ id: string }>(
      `SELECT id FROM public.salary_components
       WHERE company_id = $1 AND lower(code) = lower($2) AND archived_at IS NULL
       LIMIT 1;`,
      [args.companyId, args.code],
    );
    if (existing.rows[0]) {
      const upd = await query<{ id: string }>(
        `UPDATE public.salary_components SET
          name = $3, component_type = $4, nature = $5, value_type = $6,
          is_taxable = $7, is_insurance_base = $8, default_value = $9,
          min_value = $10, max_value = $11, default_formula_definition_id = $12::uuid,
          sort_order = $13, is_active = $14, archived_at = $15::timestamptz,
          is_system = $16, description = $17, updated_at = NOW()
         WHERE id = $1::uuid
         RETURNING id;`,
        [
          existing.rows[0].id,
          args.code,
          args.nameVi,
          args.componentType,
          args.nature,
          args.valueType,
          args.isTaxable,
          args.isInsuranceBase,
          args.defaultValue,
          args.minValue,
          args.maxValue,
          args.defaultFormulaId,
          args.sortOrder,
          args.isActive,
          args.archivedAt,
          args.isSystem,
          args.description,
        ],
      );
      return upd.rows[0].id;
    }
    const id = randomUUID();
    const ins = await query<{ id: string }>(
      `INSERT INTO public.salary_components (
        id, company_id, code, name, component_type, nature, value_type,
        is_taxable, is_insurance_base, default_value, min_value, max_value,
        default_formula_definition_id, sort_order, is_active, archived_at, is_system,
        description, applied_to
      ) VALUES (
        $1::uuid, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13::uuid,
        $14, $15, $16::timestamptz, $17, $18, 'all'
      ) RETURNING id;`,
      [
        id,
        args.companyId,
        args.code,
        args.nameVi,
        args.componentType,
        args.nature,
        args.valueType,
        args.isTaxable,
        args.isInsuranceBase,
        args.defaultValue,
        args.minValue,
        args.maxValue,
        args.defaultFormulaId,
        args.sortOrder,
        args.isActive,
        args.archivedAt,
        args.isSystem,
        args.description,
      ],
    );
    return ins.rows[0].id;
  }

  private async upsertMergeToken(
    query: HrmDbQueryFn,
    args: {
      companyId: string;
      entryKind: AllowanceEntryKind;
      code: string;
      nameVi: string;
      active: boolean;
      previousTokenKey?: string | null;
      actor?: string | null;
    },
  ): Promise<string | undefined> {
    await this.ensureMergeTokenSchema(query);
    const tokenKey = mergeTokenKeyForEntry(args.entryKind, args.code);
    const sourcePath = mergeTokenSourcePathForEntry(args.entryKind, args.code);

    if (
      args.previousTokenKey &&
      args.previousTokenKey.toLowerCase() !== tokenKey.toLowerCase()
    ) {
      await query(
        `UPDATE public.hrm_merge_tokens
         SET status = 'retired', archived_at = NOW(), updated_at = NOW(), updated_by = $3
         WHERE company_id = $1 AND lower(token_key) = lower($2) AND archived_at IS NULL;`,
        [args.companyId, args.previousTokenKey, args.actor ?? null],
      );
    }

    if (!args.active) {
      await query(
        `UPDATE public.hrm_merge_tokens
         SET status = 'retired', archived_at = COALESCE(archived_at, NOW()), updated_at = NOW(), updated_by = $3
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
          source_path = $2, ring = 'cb', domain = 'SET', label_vi = $3,
          status = 'active', origin = 'allowance_catalog', version = $4,
          archived_at = NULL, updated_at = NOW(), updated_by = $5
         WHERE id = $1::uuid;`,
        [
          existing.rows[0].id,
          sourcePath,
          args.nameVi,
          Number(existing.rows[0].version) + 1,
          args.actor ?? null,
        ],
      );
      return tokenKey;
    }
    await query(
      `INSERT INTO public.hrm_merge_tokens
        (id, company_id, token_key, source_path, ring, domain, label_vi, status, origin, created_by, updated_by)
       VALUES
        ($1::uuid, $2, $3, $4, 'cb', 'SET', $5, 'active', 'allowance_catalog', $6, $6);`,
      [
        randomUUID(),
        args.companyId,
        tokenKey,
        sourcePath,
        args.nameVi,
        args.actor ?? null,
      ],
    );
    return tokenKey;
  }

  /**
   * Optional orphan warn for VAL-ALLOW-07. Must not abort the outer retire TX when the
   * policy-lines table/columns are missing (PG aborts TX on error — JS catch alone is insufficient).
   * D-ALLOW-CAT-QA-01 / VAL-ALLOW-09 class: SAVEPOINT → COUNT → RELEASE | ROLLBACK TO.
   */
  private async countActivePolicyLines(
    query: HrmDbQueryFn,
    companyId: string,
    code: string,
  ): Promise<number> {
    const sp = 'allow_cat_policy_line_count';
    await query(`SAVEPOINT ${sp};`);
    try {
      // Lines soft-archive only (no status col) — DATA-01 §4.2
      const res = await query<{ c: string }>(
        `SELECT COUNT(*)::text AS c
         FROM public.hrm_position_compensation_policy_lines
         WHERE company_id = $1 AND lower(component_code) = lower($2)
           AND archived_at IS NULL;`,
        [companyId, code],
      );
      await query(`RELEASE SAVEPOINT ${sp};`);
      return Number(res.rows[0]?.c ?? 0);
    } catch {
      try {
        await query(`ROLLBACK TO SAVEPOINT ${sp};`);
      } catch {
        // Outer TX already doomed or stub — treat as zero warn
      }
      return 0;
    }
  }

  async createType(
    payload: CreateAllowanceDeductionTypeDto,
    authorization?: string,
    tenantId?: string,
    actor?: string,
  ) {
    await this.ensureSchema();
    const { catalogCompanyId, scope } = this.resolvePartition(
      authorization,
      tenantId,
      payload.companyId,
    );
    const code = this.assertCodeFormat(payload.code);
    const nameVi = String(payload.nameVi ?? '').trim();
    if (!nameVi) {
      throw new ApiException(
        'HRM-VAL-001',
        'nameVi is required',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (
      !(ALLOWANCE_ENTRY_KINDS as readonly string[]).includes(payload.entryKind)
    ) {
      throw new ApiException(
        HRM_ALLOW_CAT_CODE_INVALID,
        'entryKind invalid',
        HttpStatus.BAD_REQUEST,
      );
    }
    const entryKind = payload.entryKind;
    const nature = payload.nature ?? defaultNatureForEntryKind(entryKind);
    if (!(ALLOWANCE_NATURES as readonly string[]).includes(nature)) {
      throw new ApiException(
        HRM_ALLOW_CAT_NATURE_MISMATCH,
        'nature invalid',
        HttpStatus.BAD_REQUEST,
      );
    }
    this.assertEntryNature(entryKind, nature);
    const componentType = await this.assertPayTypeKey(
      catalogCompanyId,
      payload.componentType ?? defaultComponentTypeForEntryKind(entryKind),
    );
    const status = payload.status ?? 'active';
    const valueType = payload.valueType ?? 'currency';
    const calcMode = payload.calcMode ?? 'fixed';
    const defaultValue = payload.defaultValue ?? 0;
    const minValue = payload.minValue ?? null;
    const maxValue = payload.maxValue ?? null;
    const isTaxable = payload.isTaxable ?? false;
    const isInsuranceBase = payload.isInsuranceBase ?? false;
    const sortOrder = payload.sortOrder ?? 0;
    const description = payload.description ?? null;

    try {
      return await this.db.withTransaction(async (query) => {
        await this.assertUniquePcCode(query, catalogCompanyId, code);
        let defaultFormulaId: string | null = null;
        if (payload.defaultFormulaDefinitionId) {
          const def = await this.assertPublishedFormula(
            query,
            payload.defaultFormulaDefinitionId,
            scope.companyIds,
          );
          defaultFormulaId = def.id;
        }
        const id = randomUUID();
        const isActive = status === 'active';
        const archivedAt =
          status === 'retired' ? new Date().toISOString() : null;
        const ins = await query<PcRow>(
          `INSERT INTO public.hrm_allowance_deduction_types (
            id, company_id, code, name_vi, entry_kind, nature, value_type,
            is_taxable, is_insurance_base, calc_mode, default_value, min_value, max_value,
            default_formula_definition_id, component_code, description, sort_order, status,
            archived_at, created_by, updated_by
          ) VALUES (
            $1::uuid, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14::uuid,
            $3, $15, $16, $17, $18::timestamptz, $19, $19
          ) RETURNING *;`,
          [
            id,
            catalogCompanyId,
            code,
            nameVi,
            entryKind,
            nature,
            valueType,
            isTaxable,
            isInsuranceBase,
            calcMode,
            defaultValue,
            minValue,
            maxValue,
            defaultFormulaId,
            description,
            sortOrder,
            status,
            archivedAt,
            actor ?? null,
          ],
        );
        const scId = await this.upsertSalaryMirror(query, {
          companyId: catalogCompanyId,
          code,
          nameVi,
          componentType,
          nature,
          valueType,
          isTaxable,
          isInsuranceBase,
          defaultValue,
          minValue,
          maxValue,
          defaultFormulaId,
          sortOrder,
          isActive,
          archivedAt,
          isSystem: false,
          description,
        });
        const tokenKey =
          isActive && !archivedAt
            ? await this.upsertMergeToken(query, {
                companyId: catalogCompanyId,
                entryKind,
                code,
                nameVi,
                active: true,
                actor,
              })
            : undefined;
        await query(
          `UPDATE public.hrm_allowance_deduction_types
           SET salary_component_id = $2::uuid, component_code = $3, updated_at = NOW()
           WHERE id = $1::uuid;`,
          [id, scId, code],
        );
        const row = {
          ...ins.rows[0],
          salary_component_id: scId,
          sc_component_type: componentType,
        };
        return this.mapDisplayRow(row, { mergeTokenKey: tokenKey });
      });
    } catch (err) {
      if (err instanceof ApiException) throw err;
      const pgCode = (err as { code?: string })?.code;
      if (pgCode === '23505') {
        throw new ApiException(
          HRM_ALLOW_CAT_409_CODE,
          `Allowance/deduction code '${code}' already exists for company`,
          HttpStatus.CONFLICT,
        );
      }
      throw new ApiException(
        HRM_ALLOW_CAT_500_SYNC,
        err instanceof Error ? err.message : 'Allowance catalog sync failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateType(
    id: string,
    companyId: string,
    payload: UpdateAllowanceDeductionTypeDto,
    authorization?: string,
    tenantId?: string,
    actor?: string,
  ) {
    await this.ensureSchema();
    const keys = Object.keys(payload).filter(
      (k) => (payload as Record<string, unknown>)[k] !== undefined,
    );
    if (keys.length === 0) {
      throw new ApiException(
        'HRM-VAL-001',
        'No fields to update',
        HttpStatus.BAD_REQUEST,
      );
    }
    const { scope } = this.resolvePartition(authorization, tenantId, companyId);

    try {
      return await this.db.withTransaction(async (query) => {
        const peek = await query<PcRow>(
          `SELECT * FROM public.hrm_allowance_deduction_types WHERE id = $1::uuid LIMIT 1;`,
          [id],
        );
        assertResourceInHrmScope(peek.rows[0], scope, {
          notFoundCode: HRM_ALLOW_CAT_404,
          mismatchCode: HRM_ALLOW_CAT_404,
        });
        const prev = peek.rows[0];
        if (prev.archived_at && payload.status !== 'active') {
          throw new ApiException(
            HRM_ALLOW_CAT_404,
            'Allowance/deduction type is archived',
            HttpStatus.NOT_FOUND,
          );
        }

        const entryKind = (payload.entryKind ??
          prev.entry_kind) as AllowanceEntryKind;
        const nature = (payload.nature ??
          (payload.entryKind
            ? defaultNatureForEntryKind(entryKind)
            : prev.nature)) as AllowanceNature;
        this.assertEntryNature(entryKind, nature);
        const code =
          payload.code !== undefined
            ? this.assertCodeFormat(payload.code)
            : prev.code;
        if (code.toLowerCase() !== prev.code.toLowerCase()) {
          await this.assertUniquePcCode(query, prev.company_id, code, id);
        }
        const nameVi =
          payload.nameVi !== undefined
            ? String(payload.nameVi).trim()
            : prev.name_vi;
        if (!nameVi) {
          throw new ApiException(
            'HRM-VAL-001',
            'nameVi is required',
            HttpStatus.BAD_REQUEST,
          );
        }
        const componentType = await this.assertPayTypeKey(
          prev.company_id,
          payload.componentType ??
            prev.sc_component_type ??
            defaultComponentTypeForEntryKind(entryKind),
        );
        let defaultFormulaId =
          payload.defaultFormulaDefinitionId !== undefined
            ? payload.defaultFormulaDefinitionId
            : prev.default_formula_definition_id;
        if (defaultFormulaId) {
          const def = await this.assertPublishedFormula(
            query,
            defaultFormulaId,
            scope.companyIds,
          );
          defaultFormulaId = def.id;
        }
        const status = payload.status ?? prev.status;
        const archivedAt =
          status === 'active'
            ? null
            : status === 'retired'
              ? (prev.archived_at ?? new Date().toISOString())
              : prev.archived_at;
        const valueType = payload.valueType ?? prev.value_type;
        const calcMode = payload.calcMode ?? prev.calc_mode;
        const isTaxable = payload.isTaxable ?? prev.is_taxable;
        const isInsuranceBase =
          payload.isInsuranceBase ?? prev.is_insurance_base;
        const defaultValue =
          payload.defaultValue !== undefined
            ? payload.defaultValue
            : Number(prev.default_value);
        const minValue =
          payload.minValue !== undefined
            ? payload.minValue
            : prev.min_value == null
              ? null
              : Number(prev.min_value);
        const maxValue =
          payload.maxValue !== undefined
            ? payload.maxValue
            : prev.max_value == null
              ? null
              : Number(prev.max_value);
        const sortOrder = payload.sortOrder ?? prev.sort_order;
        const description =
          payload.description !== undefined
            ? payload.description
            : prev.description;

        const upd = await query<PcRow>(
          `UPDATE public.hrm_allowance_deduction_types SET
            code = $2, name_vi = $3, entry_kind = $4, nature = $5, value_type = $6,
            is_taxable = $7, is_insurance_base = $8, calc_mode = $9, default_value = $10,
            min_value = $11, max_value = $12, default_formula_definition_id = $13::uuid,
            component_code = $2, description = $14, sort_order = $15, status = $16,
            archived_at = $17::timestamptz, updated_at = NOW(), updated_by = $18
           WHERE id = $1::uuid
           RETURNING *;`,
          [
            id,
            code,
            nameVi,
            entryKind,
            nature,
            valueType,
            isTaxable,
            isInsuranceBase,
            calcMode,
            defaultValue,
            minValue,
            maxValue,
            defaultFormulaId,
            description,
            sortOrder,
            status,
            archivedAt,
            actor ?? null,
          ],
        );

        const scId = await this.upsertSalaryMirror(query, {
          companyId: prev.company_id,
          code,
          nameVi,
          componentType,
          nature,
          valueType,
          isTaxable,
          isInsuranceBase,
          defaultValue,
          minValue,
          maxValue,
          defaultFormulaId,
          sortOrder,
          isActive: status === 'active' && !archivedAt,
          archivedAt,
          isSystem: prev.is_system,
          description,
          existingScId: prev.salary_component_id,
        });
        const prevTokenKey = mergeTokenKeyForEntry(
          prev.entry_kind as AllowanceEntryKind,
          prev.code,
        );
        const tokenKey = await this.upsertMergeToken(query, {
          companyId: prev.company_id,
          entryKind,
          code,
          nameVi,
          active: status === 'active' && !archivedAt,
          previousTokenKey: prevTokenKey,
          actor,
        });
        await query(
          `UPDATE public.hrm_allowance_deduction_types
           SET salary_component_id = $2::uuid, updated_at = NOW()
           WHERE id = $1::uuid;`,
          [id, scId],
        );
        const row = {
          ...upd.rows[0],
          salary_component_id: scId,
          sc_component_type: componentType,
        };
        return this.mapDisplayRow(row, { mergeTokenKey: tokenKey });
      });
    } catch (err) {
      if (err instanceof ApiException) throw err;
      throw new ApiException(
        HRM_ALLOW_CAT_500_SYNC,
        err instanceof Error ? err.message : 'Allowance catalog sync failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async retireType(
    id: string,
    companyId: string,
    authorization?: string,
    tenantId?: string,
    actor?: string,
  ) {
    await this.ensureSchema();
    const { scope } = this.resolvePartition(authorization, tenantId, companyId);
    try {
      return await this.db.withTransaction(async (query) => {
        const peek = await query<PcRow>(
          `SELECT * FROM public.hrm_allowance_deduction_types WHERE id = $1::uuid LIMIT 1;`,
          [id],
        );
        assertResourceInHrmScope(peek.rows[0], scope, {
          notFoundCode: HRM_ALLOW_CAT_404,
          mismatchCode: HRM_ALLOW_CAT_404,
        });
        const prev = peek.rows[0];
        const policyCount = await this.countActivePolicyLines(
          query,
          prev.company_id,
          prev.code,
        );
        const archivedAt = new Date().toISOString();
        const upd = await query<PcRow>(
          `UPDATE public.hrm_allowance_deduction_types
           SET status = 'retired', archived_at = $2::timestamptz, updated_at = NOW(), updated_by = $3
           WHERE id = $1::uuid
           RETURNING *;`,
          [id, archivedAt, actor ?? null],
        );
        await this.ensureSalaryComponentSchema(query);
        if (prev.salary_component_id) {
          await query(
            `UPDATE public.salary_components
             SET is_active = FALSE, archived_at = COALESCE(archived_at, $2::timestamptz), updated_at = NOW()
             WHERE id = $1::uuid;`,
            [prev.salary_component_id, archivedAt],
          );
        } else {
          await query(
            `UPDATE public.salary_components
             SET is_active = FALSE, archived_at = COALESCE(archived_at, $3::timestamptz), updated_at = NOW()
             WHERE company_id = $1 AND lower(code) = lower($2) AND archived_at IS NULL;`,
            [prev.company_id, prev.code, archivedAt],
          );
        }
        await this.upsertMergeToken(query, {
          companyId: prev.company_id,
          entryKind: prev.entry_kind as AllowanceEntryKind,
          code: prev.code,
          nameVi: prev.name_vi,
          active: false,
          actor,
        });
        return this.mapDisplayRow(upd.rows[0], {
          policyOrphanWarn:
            policyCount > 0
              ? { activePolicyLineCount: policyCount }
              : undefined,
        });
      });
    } catch (err) {
      if (err instanceof ApiException) throw err;
      throw new ApiException(
        HRM_ALLOW_CAT_500_SYNC,
        err instanceof Error
          ? err.message
          : 'Allowance catalog retire sync failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async listMergeTokensForType(
    id: string,
    companyId: string,
    authorization?: string,
    tenantId?: string,
    includeRetired = false,
  ) {
    await this.ensureSchema();
    const row = await this.getById(id, companyId, authorization, tenantId);
    await this.ensureMergeTokenSchema(this.db.query.bind(this.db));
    const tokenKey = mergeTokenKeyForEntry(
      row.entryKind as AllowanceEntryKind,
      row.code,
    );
    const filters = ['company_id = $1', 'lower(token_key) = lower($2)'];
    const values: unknown[] = [row.companyId, tokenKey];
    if (!includeRetired) {
      filters.push('archived_at IS NULL');
      filters.push("status <> 'retired'");
    }
    const res = await this.db.query<{
      id: string;
      token_key: string;
      label_vi: string;
      source_path: string;
      ring: string;
      domain: string;
      status: string;
      origin: string;
    }>(
      `SELECT id, token_key, label_vi, source_path, ring, domain, status, origin
       FROM public.hrm_merge_tokens
       WHERE ${filters.join(' AND ')}
       ORDER BY token_key ASC;`,
      values,
    );
    return {
      items: res.rows.map((t) => ({
        id: t.id,
        tokenKey: t.token_key,
        labelVi: t.label_vi,
        sourcePath: t.source_path,
        ring: t.ring,
        domain: t.domain,
        status: t.status,
        origin: t.origin,
      })),
      payroll_e2e_ready: false,
    };
  }
}
