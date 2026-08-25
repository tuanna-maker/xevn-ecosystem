/**
 * @CODE-MEMORY
 * Screen:     HRM → Lương → Thành phần lương / Payment batches
 * UC:         UC-HRM-28 · UC-HRM-31 · FR-HRM-SC-PAY-01
 * BR:         BR-HRM-PAY-E2-02 · BR-HRM-PAY-E2-03
 * SRS:        docs/program/deltas/BA_ERP_E2_SRS_01_20260728.md · FR-HRM-PAY-CLEAN-E2-01
 * TechSpec:   docs/hrm/TECHSPEC.md §14.6 · DB_DESIGN_HRM_ERP_E2 · API_DESIGN_HRM_ERP_E2
 * Purpose:    CRUD thành phần lương + payment batch; E2 soft-assert pay_types cho component_type.
 * WorkItem:   D-BE-ERP-E2-01
 * Coded:      2026-07-28
 * Callers:    payroll.controller.ts
 * Callees:    SettingsCatalogsService.assertCodeInEffectiveCatalog · public.salary_components
 * FE-Actions: Lưu TP → POST/PATCH component_type=code; list → bind label VI
 * BE-Chain:   ensureSchema → assert pay_types → unique (company_id, lower(code)) → INSERT/UPDATE
 * Impact:     Sai nature SoT → HARDCODE VI lọt DB; unique mỏng → trùng mã
 * must_keep:  Plane B slug; E1-A/E1-B untouched; no tax-settlement invent; U65 no seed
 * SOLID:      Catalog service owns salary_components + payment_batches SQL
 * LastVerified: payroll-catalog.service.spec.ts
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-BE-01
 * change_mode: ADD
 * What: default_formula_definition_id FK → published pay_formula_definitions; soft-delete archived_at;
 *       get-by-id scope_parity; starter system rows; formula TEXT legacy read-only hint
 * must_keep: open catalog N+1 · scope list↔get↔mutate · payroll_e2e_ready=false · U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-07-28 D-BE-ERP-E2-01
 * change_mode: ADD
 * What: assertCodeInEffectiveCatalog(pay_types) → HRM-PAY-TYPE-KEY; unique → HRM-SC-002;
 *       stop DEFAULT/fallback VI 'Lương'; unique index + DROP DEFAULT; no tax endpoints
 * Why: SA-ERP-E2-ACK-01 · AC-E2-BE-01 · VAL-E2-01/04 · FR-HRM-PAY-CLEAN-E2-01 #3/#5
 * must_keep: payment_batches paths; list/get scope parity; HOLD_DEPLOY; U65
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-AMIS-PARITY-PAY-PAYMENT-WIRE-BE-01
 * change_mode: ADD
 * What: wirePaymentBatchFromPeriod — batch+records from processed payslips; process sync payslip paid; close gate HRM-PAY-005
 * must_keep: scope_parity period↔batch · idempotent payroll_record_id · payroll_e2e_ready=false · U65
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-AMIS-PARITY-PAY-PAYMENT-WIRE-BE-02
 * change_mode: FIX
 * What: wire SELECT dept via e.custom_fields->>'department' (readDepartment pattern) — no e.department column
 * must_keep: HRM-PAY-005 close gate · payroll_e2e_ready=false · U65 no seed · null-safe dept
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-ALLOWANCE-CATALOG-SYNC-BE-01
 * change_mode: ADD
 * What: EXPAND POST/PATCH/DELETE salary-components — reject PC/KT class via HRM-ALLOW-CAT-409-DUAL-WRITE / LINKED
 * must_keep: PAY-native LUONG_CO_BAN create OK · Settings F-ALLOW-CAT write path · U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-BE-02
 * change_mode: ADD
 * What: ensureStarterPayTypes — empty pay_types → appendExtensionItems starter REF codes (luong/thue/cham_cong);
 *       unlocks FE CatalogSearchPicker + Zod without seed scripts (U65 open-catalog bootstrap)
 * must_keep: payroll_e2e_ready=false · Settings POST items still N+1 path · no flip e2e
 */
import { HttpStatus, Injectable, Optional } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import {
  assertResourceInHrmScope,
  expandPayrollPeriodCompanyIds,
  MASTER_TENANT_ID,
  normalizePayrollListCompanyId,
  pushCompanyIdFilter,
  resolveHrmListScope,
  resolveHrmPersistCompanyIdText,
  resolveHrmSettingsCatalogCompanyId,
} from '../common/hrm-list-scope';
import { masterTenantIdFromEnv } from '../common/tenant-scope-env';
import { HrmDbService } from '../db/hrm-db.service';
import { SettingsCatalogsService } from '../settings-catalogs/settings-catalogs.service';
import {
  ALLOWANCE_CATALOG_DUAL_WRITE_VI,
  ALLOWANCE_CATALOG_LINKED_VI,
  HRM_ALLOW_CAT_409_DUAL_WRITE,
  HRM_ALLOW_CAT_409_LINKED,
  isAllowanceDeductionComponentType,
} from '../settings/allowance-catalog.constants';
import {
  CreateSalaryComponentDto,
  ListSalaryComponentsQueryDto,
  UpdateSalaryComponentDto,
} from './dto/salary-component.dto';
import {
  HRM_PAY_COMP_404,
  HRM_PAY_COMP_409,
  HRM_PAY_COMP_CODE_INVALID,
  HRM_PAY_COMP_FORMULA_412,
  PAY_SALARY_COMPONENT_STARTER_ROWS,
  PAY_TYPES_STARTER_ROWS,
  SALARY_COMPONENT_CODE_FORMAT,
} from './payroll-catalog.constants';
import { WirePaymentBatchDto } from './dto/wire-payment-batch.dto';

export const HRM_PAY_TYPE_KEY = 'HRM-PAY-TYPE-KEY';
export const HRM_SC_002 = 'HRM-SC-002';
export const HRM_PAY_WIRE_412 = 'HRM-PAY-WIRE-412';

type SalaryComponentRow = Record<string, unknown> & {
  id: string;
  company_id: string;
  code: string;
  name: string;
  default_formula_definition_id?: string | null;
  formula?: string | null;
  archived_at?: string | null;
  is_system?: boolean;
};

@Injectable()
export class PayrollCatalogService {
  constructor(
    private readonly db: HrmDbService,
    @Optional() private readonly settingsCatalogs?: SettingsCatalogsService,
  ) {}

  private resolveCatalogTenantId(): string {
    return masterTenantIdFromEnv() || MASTER_TENANT_ID;
  }

  private async ensureSalaryComponentSchema() {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.salary_component_categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL,
        code TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        sort_order INTEGER NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    // E2: component_type = pay_types.code — no VI DEFAULT 'Lương' on new DDL.
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.salary_components (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL,
        code TEXT NOT NULL,
        name TEXT NOT NULL,
        category_id UUID REFERENCES public.salary_component_categories (id) ON DELETE SET NULL,
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
    // Existing DBs may still carry DEFAULT 'Lương' from pre-E2 CREATE — drop invent default.
    await this.db.query(`
      ALTER TABLE public.salary_components
      ALTER COLUMN component_type DROP DEFAULT;
    `);
    await this.db.query(`
      ALTER TABLE public.salary_components
      ADD COLUMN IF NOT EXISTS default_formula_definition_id UUID NULL,
      ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ NULL,
      ADD COLUMN IF NOT EXISTS is_system BOOLEAN NOT NULL DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS include_in_gross BOOLEAN NOT NULL DEFAULT TRUE;
    `);
    await this.db.query(`
      UPDATE public.salary_components
      SET include_in_gross = FALSE,
          updated_at = NOW()
      WHERE lower(code) IN ('luong_co_ban', 'tong_thu_nhap', 'thuc_linh')
        AND include_in_gross = TRUE;
    `);
    await this.db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_salary_components_company_code
      ON public.salary_components (company_id, lower(code))
      WHERE archived_at IS NULL;
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_salary_components_company_component_type
      ON public.salary_components (company_id, component_type)
      WHERE archived_at IS NULL;
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_salary_components_default_formula
      ON public.salary_components (default_formula_definition_id)
      WHERE default_formula_definition_id IS NOT NULL AND archived_at IS NULL;
    `);
  }

  /** Public for jest schema assertions. */
  async ensureSalaryComponentSchemaPublic(): Promise<void> {
    await this.ensureSalaryComponentSchema();
  }

  private assertComponentCodeFormat(code: string): string {
    const trimmed = code.trim();
    if (!SALARY_COMPONENT_CODE_FORMAT.test(trimmed)) {
      throw new ApiException(
        HRM_PAY_COMP_CODE_INVALID,
        'Salary component code must match open slug format (letters, digits, underscore)',
        HttpStatus.BAD_REQUEST,
      );
    }
    return trimmed;
  }

  private mapSalaryComponentRow(row: SalaryComponentRow) {
    const formulaLegacy = row.formula ?? null;
    return {
      ...row,
      formula: formulaLegacy,
      formula_legacy_hint: formulaLegacy,
      formula_sot: 'deprecated' as const,
      payroll_e2e_ready: false,
      default_formula_definition_id: row.default_formula_definition_id ?? null,
    };
  }

  private async assertPublishedFormulaDefinition(
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
      const res = await this.db.query<{
        id: string;
        code: string;
        version: number;
        status: string;
      }>(
        `
          SELECT id, code, version, status
          FROM public.pay_formula_definitions
          WHERE ${filters.join(' AND ')}
          LIMIT 1;
        `,
        values,
      );
      const row = res.rows[0];
      if (!row) {
        throw new ApiException(
          HRM_PAY_COMP_FORMULA_412,
          'default_formula_definition_id must reference a published active pay_formula_definition in company scope',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
      return row;
    } catch (err: unknown) {
      if (err instanceof ApiException) throw err;
      const msg = err instanceof Error ? err.message : String(err);
      if (/relation .*pay_formula_definitions.* does not exist/i.test(msg)) {
        throw new ApiException(
          HRM_PAY_COMP_FORMULA_412,
          'pay_formula_definitions unavailable — publish formula wave first',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
      throw err;
    }
  }

  /** Starter rows = bootstrap examples only — not a closed enum ceiling (Platform L1). */
  async ensureStarterSalaryComponents(companyId: string): Promise<void> {
    await this.ensureSalaryComponentSchema();
    for (const starter of PAY_SALARY_COMPONENT_STARTER_ROWS) {
      const includeInGross =
        'include_in_gross' in starter && starter.include_in_gross === false
          ? false
          : true;
      await this.db.query(
        `
          INSERT INTO public.salary_components (
            id, company_id, code, name, component_type, nature, value_type,
            is_taxable, is_insurance_base, applied_to, is_active, sort_order, is_system,
            include_in_gross
          )
          SELECT gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, 'all', TRUE, $9, $10, $11
          WHERE NOT EXISTS (
            SELECT 1 FROM public.salary_components
            WHERE company_id = $1 AND lower(code) = lower($2) AND archived_at IS NULL
          );
        `,
        [
          companyId,
          starter.code,
          starter.name,
          starter.component_type,
          starter.nature,
          starter.value_type,
          starter.is_taxable,
          starter.is_insurance_base,
          starter.sort_order,
          starter.is_system,
          includeInGross,
        ],
      );
    }
  }

  /**
   * Open-catalog bootstrap for `pay_types` when picker is empty (XBOS sync total=0).
   * Aligns REF codes with PAY_SALARY_COMPONENT_STARTER_ROWS.component_type.
   * Alternate UF path (documented): Settings → POST /settings-catalogs/items category_key=pay_types.
   */
  async ensureStarterPayTypes(
    companyId: string,
    authorization?: string,
  ): Promise<void> {
    if (!this.settingsCatalogs) return;
    const tenantId = this.resolveCatalogTenantId();
    const catalogCompanyId = resolveHrmSettingsCatalogCompanyId(
      authorization,
      tenantId,
      companyId,
    );
    const picker = await this.settingsCatalogs.listPickerItems(
      tenantId,
      catalogCompanyId,
      'pay_types',
      {
        status: 'active',
      },
    );
    if (picker.total > 0) return;
    await this.settingsCatalogs.appendExtensionItems(
      tenantId,
      catalogCompanyId,
      'pay_types',
      PAY_TYPES_STARTER_ROWS.map((row) => ({
        code: row.code,
        label: row.label,
        status: 'active' as const,
      })),
    );
  }

  private async ensurePaymentBatchSchema() {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.payment_batches (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL,
        payroll_batch_id UUID,
        name TEXT NOT NULL,
        salary_period TEXT NOT NULL,
        department TEXT,
        position TEXT,
        payment_method TEXT NOT NULL DEFAULT 'bank_transfer',
        bank_name TEXT,
        employee_count INTEGER NOT NULL DEFAULT 0,
        total_amount NUMERIC NOT NULL DEFAULT 0,
        paid_count INTEGER NOT NULL DEFAULT 0,
        paid_amount NUMERIC NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'pending',
        payment_date DATE,
        processed_by TEXT,
        processed_at TIMESTAMPTZ,
        created_by TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.payment_records (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL,
        payment_batch_id UUID NOT NULL REFERENCES public.payment_batches (id) ON DELETE CASCADE,
        payroll_record_id UUID,
        employee_id UUID,
        employee_code TEXT NOT NULL,
        employee_name TEXT NOT NULL,
        department TEXT,
        bank_name TEXT,
        bank_account TEXT,
        amount NUMERIC NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'pending',
        paid_at TIMESTAMPTZ,
        transaction_ref TEXT,
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await this.db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_payment_batches_payroll_period
      ON public.payment_batches (payroll_batch_id)
      WHERE payroll_batch_id IS NOT NULL;
    `);
    await this.db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_payment_records_payroll_record
      ON public.payment_records (payroll_record_id)
      WHERE payroll_record_id IS NOT NULL;
    `);
  }

  /** FR-HRM-PAY-CLEAN-E2-01 #3/#5 — nature ∈ effective pay_types. */
  private async assertPayTypeKey(
    companyId: string,
    componentType: string | null | undefined,
  ): Promise<string> {
    const code = componentType?.trim() ?? '';
    if (!code) {
      throw new ApiException(
        HRM_PAY_TYPE_KEY,
        'component_type is required (pay_types catalog code; VI label invent forbidden)',
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
      errorMessage: `component_type '${code}' is not in pay_types catalog (free-text/HARDCODE SoT forbidden)`,
    });
    return hit.code;
  }

  private async assertUniqueComponentCode(
    companyId: string,
    code: string,
    excludeId?: string,
  ): Promise<void> {
    const values: unknown[] = [companyId, code];
    let sql = `
      SELECT id FROM public.salary_components
      WHERE company_id = $1 AND lower(code) = lower($2) AND archived_at IS NULL
    `;
    if (excludeId) {
      values.push(excludeId);
      sql += ` AND id <> $${values.length}::uuid`;
    }
    sql += ' LIMIT 1';
    const dup = await this.db.query<{ id: string }>(sql, values);
    if (dup.rows[0]) {
      throw new ApiException(
        HRM_SC_002,
        `Salary component code '${code}' already exists for company`,
        HttpStatus.CONFLICT,
      );
    }
  }

  async listSalaryComponents(
    companyId: string,
    authorization?: string,
    query?: ListSalaryComponentsQueryDto,
  ) {
    await this.ensureSalaryComponentSchema();
    const scopeCompanyId = normalizePayrollListCompanyId(
      authorization,
      companyId,
    );
    const scope = resolveHrmListScope(authorization, scopeCompanyId);
    const persistCompanyId = resolveHrmPersistCompanyIdText(
      authorization,
      companyId,
    );
    await this.ensureStarterPayTypes(persistCompanyId, authorization);
    await this.ensureStarterSalaryComponents(persistCompanyId);
    const filters: string[] = [];
    const values: unknown[] = [];
    pushCompanyIdFilter(filters, values, expandPayrollPeriodCompanyIds(scope));
    if (!query?.include_archived) {
      filters.push('sc.archived_at IS NULL');
    }
    if (query?.active_only) {
      filters.push('sc.is_active = TRUE');
    }
    const where = filters
      .map((f) => f.replace(/\bcompany_id\b/g, 'sc.company_id'))
      .join(' AND ');
    const res = await this.db.query(
      `SELECT sc.*,
        CASE WHEN c.id IS NOT NULL THEN json_build_object(
          'id', c.id, 'company_id', c.company_id, 'code', c.code, 'name', c.name,
          'description', c.description, 'sort_order', c.sort_order, 'is_active', c.is_active,
          'created_at', c.created_at, 'updated_at', c.updated_at
        ) ELSE NULL END AS category,
        CASE WHEN fd.id IS NOT NULL THEN json_build_object(
          'id', fd.id, 'code', fd.code, 'version', fd.version, 'status', fd.status
        ) ELSE NULL END AS default_formula_definition
       FROM public.salary_components sc
       LEFT JOIN public.salary_component_categories c ON c.id = sc.category_id
       LEFT JOIN public.pay_formula_definitions fd ON fd.id = sc.default_formula_definition_id
         AND fd.archived_at IS NULL
       WHERE ${where}
       ORDER BY sc.sort_order ASC, sc.code ASC;`,
      values,
    );
    return {
      total: res.rows.length,
      data: res.rows.map((row) =>
        this.mapSalaryComponentRow(row as SalaryComponentRow),
      ),
      payroll_e2e_ready: false,
    };
  }

  async getSalaryComponentById(
    id: string,
    companyId: string,
    authorization?: string,
  ) {
    await this.ensureSalaryComponentSchema();
    const scopeCompanyId = normalizePayrollListCompanyId(
      authorization,
      companyId,
    );
    const scope = resolveHrmListScope(authorization, scopeCompanyId);
    const filters: string[] = ['sc.id = $1::uuid'];
    const values: unknown[] = [id];
    pushCompanyIdFilter(filters, values, expandPayrollPeriodCompanyIds(scope));
    const where = filters
      .map((f) => f.replace(/\bcompany_id\b/g, 'sc.company_id'))
      .join(' AND ');
    const res = await this.db.query(
      `SELECT sc.*,
        CASE WHEN c.id IS NOT NULL THEN json_build_object(
          'id', c.id, 'company_id', c.company_id, 'code', c.code, 'name', c.name,
          'description', c.description, 'sort_order', c.sort_order, 'is_active', c.is_active,
          'created_at', c.created_at, 'updated_at', c.updated_at
        ) ELSE NULL END AS category,
        CASE WHEN fd.id IS NOT NULL THEN json_build_object(
          'id', fd.id, 'code', fd.code, 'version', fd.version, 'status', fd.status
        ) ELSE NULL END AS default_formula_definition
       FROM public.salary_components sc
       LEFT JOIN public.salary_component_categories c ON c.id = sc.category_id
       LEFT JOIN public.pay_formula_definitions fd ON fd.id = sc.default_formula_definition_id
         AND fd.archived_at IS NULL
       WHERE ${where}
       LIMIT 1;`,
      values,
    );
    const row = res.rows[0] as SalaryComponentRow | undefined;
    if (!row) {
      throw new ApiException(
        HRM_PAY_COMP_404,
        'Salary component not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return this.mapSalaryComponentRow(row);
  }

  async listSalaryComponentCategories(
    companyId: string,
    authorization?: string,
  ) {
    await this.ensureSalaryComponentSchema();
    const scope = resolveHrmListScope(authorization, companyId);
    const filters: string[] = [];
    const values: unknown[] = [];
    pushCompanyIdFilter(filters, values, scope.companyIds);
    const res = await this.db.query(
      `SELECT * FROM public.salary_component_categories WHERE ${filters.join(' AND ')} ORDER BY sort_order ASC;`,
      values,
    );
    return { total: res.rows.length, data: res.rows };
  }

  private assertNotPcKtDualWrite(componentType: string): void {
    if (isAllowanceDeductionComponentType(componentType)) {
      throw new ApiException(
        HRM_ALLOW_CAT_409_DUAL_WRITE,
        ALLOWANCE_CATALOG_DUAL_WRITE_VI,
        HttpStatus.CONFLICT,
      );
    }
  }

  private async assertNotLinkedAllowanceCatalog(
    salaryComponentId: string,
    linkedCode = HRM_ALLOW_CAT_409_LINKED,
  ): Promise<void> {
    try {
      const res = await this.db.query<{ id: string }>(
        `SELECT id FROM public.hrm_allowance_deduction_types
         WHERE salary_component_id = $1::uuid AND archived_at IS NULL
         LIMIT 1;`,
        [salaryComponentId],
      );
      if (res.rows[0]) {
        throw new ApiException(
          linkedCode,
          ALLOWANCE_CATALOG_LINKED_VI,
          HttpStatus.CONFLICT,
        );
      }
    } catch (err) {
      if (err instanceof ApiException) throw err;
      // Table may not exist yet on older DBs — ignore; guard still covers component_type.
    }
  }

  async createSalaryComponent(
    payload: CreateSalaryComponentDto,
    authorization?: string,
  ) {
    await this.ensureSalaryComponentSchema();
    const companyId = resolveHrmPersistCompanyIdText(
      authorization,
      String(payload.company_id ?? ''),
    );
    const code = this.assertComponentCodeFormat(String(payload.code ?? ''));
    const name = String(payload.name ?? '').trim();
    if (!name) {
      throw new ApiException(
        'HRM-SC-001',
        'code and name are required',
        HttpStatus.BAD_REQUEST,
      );
    }
    const componentType = await this.assertPayTypeKey(
      companyId,
      payload.component_type,
    );
    this.assertNotPcKtDualWrite(componentType);
    await this.assertUniqueComponentCode(companyId, code);
    const scope = resolveHrmListScope(authorization, companyId);
    const companyIds = expandPayrollPeriodCompanyIds(scope);
    let defaultFormulaId: string | null = null;
    if (payload.default_formula_definition_id) {
      const def = await this.assertPublishedFormulaDefinition(
        payload.default_formula_definition_id,
        companyIds,
      );
      defaultFormulaId = def.id;
    }
    const id = randomUUID();
    try {
      const res = await this.db.query(
        `INSERT INTO public.salary_components (
          id, company_id, code, name, category_id, component_type, nature, value_type,
          is_taxable, is_insurance_base, formula, default_value, min_value, max_value,
          description, applied_to, is_active, sort_order, default_formula_definition_id
        ) VALUES (
          $1, $2, $3, $4, $5::uuid, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19::uuid
        ) RETURNING *;`,
        [
          id,
          companyId,
          code,
          name,
          payload.category_id ?? null,
          componentType,
          payload.nature ?? 'income',
          payload.value_type ?? 'currency',
          payload.is_taxable ?? false,
          payload.is_insurance_base ?? false,
          payload.formula ?? null,
          payload.default_value ?? 0,
          payload.min_value ?? null,
          payload.max_value ?? null,
          payload.description ?? null,
          payload.applied_to ?? 'all',
          payload.is_active ?? true,
          payload.sort_order ?? 0,
          defaultFormulaId,
        ],
      );
      return this.mapSalaryComponentRow(res.rows[0] as SalaryComponentRow);
    } catch (err) {
      const pgCode = (err as { code?: string })?.code;
      if (pgCode === '23505') {
        throw new ApiException(
          HRM_SC_002,
          `Salary component code '${code}' already exists for company`,
          HttpStatus.CONFLICT,
        );
      }
      throw err;
    }
  }

  async updateSalaryComponent(
    id: string,
    payload: UpdateSalaryComponentDto,
    companyId: string,
    authorization?: string,
  ) {
    await this.ensureSalaryComponentSchema();
    const scopeCompanyId = normalizePayrollListCompanyId(
      authorization,
      companyId,
    );
    const scope = resolveHrmListScope(authorization, scopeCompanyId);
    const peek = await this.db.query<{
      company_id: string;
      archived_at: string | null;
      component_type: string;
      is_system: boolean;
    }>(
      `SELECT company_id, archived_at, component_type, COALESCE(is_system, FALSE) AS is_system
       FROM public.salary_components WHERE id = $1::uuid LIMIT 1;`,
      [id],
    );
    assertResourceInHrmScope(peek.rows[0], scope, {
      notFoundCode: HRM_PAY_COMP_404,
      mismatchCode: HRM_PAY_COMP_409,
    });
    if (peek.rows[0]?.archived_at) {
      throw new ApiException(
        HRM_PAY_COMP_404,
        'Salary component is archived',
        HttpStatus.NOT_FOUND,
      );
    }
    const persistCompanyId = String(peek.rows[0].company_id);
    const companyIds = expandPayrollPeriodCompanyIds(scope);
    await this.assertNotLinkedAllowanceCatalog(
      id,
      HRM_ALLOW_CAT_409_DUAL_WRITE,
    );
    const patch: Record<string, unknown> = { ...payload };
    if (payload.component_type !== undefined) {
      patch.component_type = await this.assertPayTypeKey(
        persistCompanyId,
        payload.component_type,
      );
      const prevType = String(peek.rows[0].component_type ?? '');
      if (
        isAllowanceDeductionComponentType(String(patch.component_type)) &&
        !isAllowanceDeductionComponentType(prevType)
      ) {
        this.assertNotPcKtDualWrite(String(patch.component_type));
      }
      if (isAllowanceDeductionComponentType(String(patch.component_type))) {
        this.assertNotPcKtDualWrite(String(patch.component_type));
      }
    }
    if (payload.code !== undefined) {
      patch.code = this.assertComponentCodeFormat(String(payload.code ?? ''));
      await this.assertUniqueComponentCode(
        persistCompanyId,
        patch.code as string,
        id,
      );
    }
    if (payload.default_formula_definition_id !== undefined) {
      if (payload.default_formula_definition_id === null) {
        patch.default_formula_definition_id = null;
      } else {
        const def = await this.assertPublishedFormulaDefinition(
          payload.default_formula_definition_id,
          companyIds,
        );
        patch.default_formula_definition_id = def.id;
      }
    }
    const fields: string[] = [];
    const values: unknown[] = [];
    const allowed = [
      'code',
      'name',
      'category_id',
      'component_type',
      'nature',
      'value_type',
      'is_taxable',
      'is_insurance_base',
      'formula',
      'default_value',
      'min_value',
      'max_value',
      'description',
      'applied_to',
      'is_active',
      'sort_order',
      'default_formula_definition_id',
    ];
    for (const key of allowed) {
      if (patch[key] !== undefined) {
        values.push(patch[key]);
        const col =
          key === 'category_id' || key === 'default_formula_definition_id'
            ? `${key} = $${values.length}::uuid`
            : `${key} = $${values.length}`;
        fields.push(col);
      }
    }
    if (fields.length === 0) {
      throw new ApiException(
        'HRM-VAL-001',
        'No fields to update',
        HttpStatus.BAD_REQUEST,
      );
    }
    values.push(id);
    try {
      const res = await this.db.query(
        `UPDATE public.salary_components SET ${fields.join(', ')}, updated_at = NOW()
         WHERE id = $${values.length}::uuid AND archived_at IS NULL RETURNING *;`,
        values,
      );
      if (!res.rows[0]) {
        throw new ApiException(
          HRM_PAY_COMP_404,
          'Salary component not found',
          HttpStatus.NOT_FOUND,
        );
      }
      return this.mapSalaryComponentRow(res.rows[0] as SalaryComponentRow);
    } catch (err) {
      if (err instanceof ApiException) throw err;
      const pgCode = (err as { code?: string })?.code;
      if (pgCode === '23505') {
        throw new ApiException(
          HRM_SC_002,
          'Salary component code already exists for company',
          HttpStatus.CONFLICT,
        );
      }
      throw err;
    }
  }

  async deleteSalaryComponent(
    id: string,
    companyId: string,
    authorization?: string,
  ) {
    await this.ensureSalaryComponentSchema();
    const scopeCompanyId = normalizePayrollListCompanyId(
      authorization,
      companyId,
    );
    const scope = resolveHrmListScope(authorization, scopeCompanyId);
    await this.assertNotLinkedAllowanceCatalog(id, HRM_ALLOW_CAT_409_LINKED);
    const peekType = await this.db.query<{ component_type: string }>(
      `SELECT component_type FROM public.salary_components WHERE id = $1::uuid AND archived_at IS NULL LIMIT 1;`,
      [id],
    );
    if (
      peekType.rows[0] &&
      isAllowanceDeductionComponentType(peekType.rows[0].component_type)
    ) {
      throw new ApiException(
        HRM_ALLOW_CAT_409_LINKED,
        ALLOWANCE_CATALOG_LINKED_VI,
        HttpStatus.CONFLICT,
      );
    }
    const filters = ['id = $1::uuid', 'archived_at IS NULL'];
    const values: unknown[] = [id];
    pushCompanyIdFilter(filters, values, expandPayrollPeriodCompanyIds(scope));
    const res = await this.db.query(
      `UPDATE public.salary_components
       SET archived_at = NOW(), is_active = FALSE, updated_at = NOW()
       WHERE ${filters.join(' AND ')}
       RETURNING id;`,
      values,
    );
    if (!res.rows[0]) {
      throw new ApiException(
        HRM_PAY_COMP_404,
        'Salary component not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return { id: res.rows[0].id, archived: true, payroll_e2e_ready: false };
  }

  async createSalaryComponentCategory(
    payload: Record<string, unknown>,
    authorization?: string,
  ) {
    await this.ensureSalaryComponentSchema();
    const companyId = resolveHrmPersistCompanyIdText(
      authorization,
      String(payload.company_id ?? ''),
    );
    const res = await this.db.query(
      `INSERT INTO public.salary_component_categories (id, company_id, code, name, description, sort_order, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;`,
      [
        randomUUID(),
        companyId,
        String(payload.code ?? '').trim(),
        String(payload.name ?? '').trim(),
        payload.description ?? null,
        payload.sort_order ?? 0,
        payload.is_active ?? true,
      ],
    );
    return res.rows[0];
  }

  async deleteSalaryComponentCategory(
    id: string,
    companyId: string,
    authorization?: string,
  ) {
    await this.ensureSalaryComponentSchema();
    const scope = resolveHrmListScope(authorization, companyId);
    const filters = ['id = $1::uuid'];
    const values: unknown[] = [id];
    pushCompanyIdFilter(filters, values, scope.companyIds);
    const res = await this.db.query(
      `DELETE FROM public.salary_component_categories WHERE ${filters.join(' AND ')} RETURNING id;`,
      values,
    );
    if (!res.rows[0])
      throw new ApiException(
        'HRM-SC-404',
        'Category not found',
        HttpStatus.NOT_FOUND,
      );
    return { id };
  }

  async listPaymentBatches(companyId: string, authorization?: string) {
    await this.ensurePaymentBatchSchema();
    const scope = resolveHrmListScope(authorization, companyId);
    const filters: string[] = [];
    const values: unknown[] = [];
    pushCompanyIdFilter(filters, values, scope.companyIds);
    const res = await this.db.query(
      `SELECT * FROM public.payment_batches WHERE ${filters.join(' AND ')} ORDER BY created_at DESC;`,
      values,
    );
    return { total: res.rows.length, data: res.rows };
  }

  async listPaymentBatchRecords(
    batchId: string,
    companyId: string,
    authorization?: string,
  ) {
    await this.ensurePaymentBatchSchema();
    const scope = resolveHrmListScope(authorization, companyId);
    const batchPeek = await this.db.query(
      `SELECT company_id FROM public.payment_batches WHERE id = $1::uuid LIMIT 1;`,
      [batchId],
    );
    assertResourceInHrmScope(batchPeek.rows[0], scope, {
      notFoundCode: 'HRM-PB-404',
      mismatchCode: 'HRM-PB-409',
    });
    const res = await this.db.query(
      `SELECT * FROM public.payment_records WHERE payment_batch_id = $1::uuid ORDER BY created_at;`,
      [batchId],
    );
    return { total: res.rows.length, data: res.rows };
  }

  async createPaymentBatch(
    payload: Record<string, unknown>,
    authorization?: string,
  ) {
    await this.ensurePaymentBatchSchema();
    const companyId = resolveHrmPersistCompanyIdText(
      authorization,
      String(payload.company_id ?? ''),
    );
    const res = await this.db.query(
      `INSERT INTO public.payment_batches (
        id, company_id, payroll_batch_id, name, salary_period, department, position,
        payment_method, bank_name, payment_date, status
      ) VALUES ($1, $2, $3::uuid, $4, $5, $6, $7, $8, $9, $10::date, $11) RETURNING *;`,
      [
        randomUUID(),
        companyId,
        payload.payroll_batch_id ?? null,
        String(payload.name ?? '').trim(),
        String(payload.salary_period ?? '').trim(),
        payload.department ?? null,
        payload.position ?? null,
        payload.payment_method ?? 'bank_transfer',
        payload.bank_name ?? null,
        payload.payment_date ?? null,
        'pending',
      ],
    );
    return res.rows[0];
  }

  async updatePaymentBatch(
    id: string,
    payload: Record<string, unknown>,
    companyId: string,
    authorization?: string,
  ) {
    await this.ensurePaymentBatchSchema();
    const scope = resolveHrmListScope(authorization, companyId);
    const peek = await this.db.query(
      `SELECT company_id FROM public.payment_batches WHERE id = $1::uuid LIMIT 1;`,
      [id],
    );
    assertResourceInHrmScope(peek.rows[0], scope, {
      notFoundCode: 'HRM-PB-404',
      mismatchCode: 'HRM-PB-409',
    });
    const res = await this.db.query(
      `UPDATE public.payment_batches SET
        name = COALESCE($2, name),
        salary_period = COALESCE($3, salary_period),
        department = COALESCE($4, department),
        position = COALESCE($5, position),
        payment_method = COALESCE($6, payment_method),
        bank_name = COALESCE($7, bank_name),
        payment_date = COALESCE($8::date, payment_date),
        status = COALESCE($9, status),
        updated_at = NOW()
       WHERE id = $1::uuid RETURNING *;`,
      [
        id,
        payload.name ?? null,
        payload.salary_period ?? null,
        payload.department ?? null,
        payload.position ?? null,
        payload.payment_method ?? null,
        payload.bank_name ?? null,
        payload.payment_date ?? null,
        payload.status ?? null,
      ],
    );
    if (!res.rows[0])
      throw new ApiException(
        'HRM-PB-404',
        'Payment batch not found',
        HttpStatus.NOT_FOUND,
      );
    return res.rows[0];
  }

  async deletePaymentBatch(
    id: string,
    companyId: string,
    authorization?: string,
  ) {
    await this.ensurePaymentBatchSchema();
    const scope = resolveHrmListScope(authorization, companyId);
    const filters = ['id = $1::uuid'];
    const values: unknown[] = [id];
    pushCompanyIdFilter(filters, values, scope.companyIds);
    const res = await this.db.query(
      `DELETE FROM public.payment_batches WHERE ${filters.join(' AND ')} RETURNING id;`,
      values,
    );
    if (!res.rows[0])
      throw new ApiException(
        'HRM-PB-404',
        'Payment batch not found',
        HttpStatus.NOT_FOUND,
      );
    return { id };
  }

  private async syncPayslipsPaidFromBatch(batchId: string) {
    await this.db.query(
      `
        UPDATE public.payroll_payslips ps
        SET status = 'paid', updated_at = NOW()
        FROM public.payment_records pr
        WHERE pr.payment_batch_id = $1::uuid
          AND pr.payroll_record_id = ps.id
          AND pr.status = 'paid'
          AND ps.status = 'processed';
      `,
      [batchId],
    );
  }

  private async syncPayslipPaidFromRecord(recordId: string) {
    await this.db.query(
      `
        UPDATE public.payroll_payslips ps
        SET status = 'paid', updated_at = NOW()
        FROM public.payment_records pr
        WHERE pr.id = $1::uuid
          AND pr.payroll_record_id = ps.id
          AND pr.status = 'paid'
          AND ps.status = 'processed';
      `,
      [recordId],
    );
  }

  /**
   * AMIS step7 — wire payment batch from processed payslips for period close-out spine.
   */
  async wirePaymentBatchFromPeriod(
    periodId: string,
    payload: WirePaymentBatchDto,
    authorization?: string,
  ) {
    await this.ensurePaymentBatchSchema();
    const scopeCompanyId = normalizePayrollListCompanyId(
      authorization,
      payload.company_id,
    );
    const scope = resolveHrmListScope(authorization, scopeCompanyId);
    const periodFilters = ['pp.id = $1::uuid'];
    const periodValues: unknown[] = [periodId];
    pushCompanyIdFilter(
      periodFilters,
      periodValues,
      expandPayrollPeriodCompanyIds(scope),
    );
    const periodRes = await this.db.query<{
      id: string;
      company_id: string;
      period_label: string;
      start_date: string;
      end_date: string;
      status: string;
    }>(
      `
        SELECT id::text AS id, company_id, period_label, start_date::text AS start_date,
               end_date::text AS end_date, status
        FROM public.payroll_periods pp
        WHERE ${periodFilters.join(' AND ')}
        LIMIT 1;
      `,
      periodValues,
    );
    const period = periodRes.rows[0];
    if (!period) {
      throw new ApiException(
        'HRM-PAY-404',
        'Payroll period not found',
        HttpStatus.NOT_FOUND,
      );
    }
    assertResourceInHrmScope(period, scope, {
      notFoundCode: 'HRM-PAY-404',
      mismatchCode: 'HRM-PAY-409',
    });
    if (period.status !== 'processed') {
      throw new ApiException(
        'HRM-PAY-WIRE-409',
        'Chỉ kỳ lương đã xử lý (processed) mới được tạo lô chi trả',
        HttpStatus.CONFLICT,
      );
    }

    const payslipFilters = [
      'ps.period_id = $1::uuid',
      "ps.status = 'processed'",
    ];
    const payslipValues: unknown[] = [periodId];
    if (payload.require_ess_confirm) {
      payslipFilters.push('ps.employee_confirmed_at IS NOT NULL');
    }
    const payslipRes = await this.db.query<{
      id: string;
      employee_id: string;
      employee_code: string;
      employee_name: string;
      net_amount: string;
      department: string | null;
    }>(
      `
        SELECT
          ps.id::text AS id,
          ps.employee_id::text AS employee_id,
          ps.employee_code,
          ps.employee_name,
          ps.net_amount::text AS net_amount,
          NULLIF(TRIM(e.custom_fields->>'department'), '') AS department
        FROM public.payroll_payslips ps
        LEFT JOIN public.employees e ON e.id = ps.employee_id
        WHERE ${payslipFilters.join(' AND ')}
        ORDER BY ps.employee_code ASC;
      `,
      payslipValues,
    );
    if (payslipRes.rows.length === 0) {
      throw new ApiException(
        HRM_PAY_WIRE_412,
        payload.require_ess_confirm
          ? 'Không có phiếu lương đã xử lý và đã xác nhận ESS để tạo lô chi trả'
          : 'Không có phiếu lương đã xử lý để tạo lô chi trả',
        HttpStatus.PRECONDITION_FAILED,
      );
    }

    let batchRow = (
      await this.db.query(
        `SELECT * FROM public.payment_batches WHERE payroll_batch_id = $1::uuid LIMIT 1;`,
        [periodId],
      )
    ).rows[0] as Record<string, unknown> | undefined;

    if (!batchRow) {
      const batchId = randomUUID();
      const salaryPeriod = `${period.start_date} — ${period.end_date}`;
      const batchName =
        payload.name?.trim() || `Chi trả ${period.period_label}`.trim();
      batchRow = (
        await this.db.query(
          `INSERT INTO public.payment_batches (
            id, company_id, payroll_batch_id, name, salary_period,
            payment_method, bank_name, status
          ) VALUES ($1, $2, $3::uuid, $4, $5, $6, $7, 'pending')
          RETURNING *;`,
          [
            batchId,
            period.company_id,
            periodId,
            batchName,
            salaryPeriod,
            payload.payment_method ?? 'bank_transfer',
            payload.bank_name ?? null,
          ],
        )
      ).rows[0];
    }

    const batchId = String(batchRow.id);
    const existingRes = await this.db.query<{ payroll_record_id: string }>(
      `
        SELECT payroll_record_id::text AS payroll_record_id
        FROM public.payment_records
        WHERE payment_batch_id = $1::uuid
          AND payroll_record_id IS NOT NULL;
      `,
      [batchId],
    );
    const existingPayslipIds = new Set(
      existingRes.rows.map((row) => row.payroll_record_id).filter(Boolean),
    );

    const recordsAdded: Array<Record<string, unknown>> = [];
    let recordsSkipped = 0;
    for (const payslip of payslipRes.rows) {
      if (existingPayslipIds.has(payslip.id)) {
        recordsSkipped += 1;
        continue;
      }
      const recordRes = await this.db.query(
        `INSERT INTO public.payment_records (
          id, company_id, payment_batch_id, payroll_record_id, employee_id,
          employee_code, employee_name, department, amount, status, notes
        ) VALUES ($1, $2, $3::uuid, $4::uuid, $5::uuid, $6, $7, $8, $9, 'pending', $10)
        RETURNING *;`,
        [
          randomUUID(),
          period.company_id,
          batchId,
          payslip.id,
          payslip.employee_id,
          payslip.employee_code,
          payslip.employee_name,
          payslip.department,
          Number(payslip.net_amount),
          `Wired from payslip ${payslip.id}`,
        ],
      );
      recordsAdded.push(recordRes.rows[0]);
      existingPayslipIds.add(payslip.id);
    }

    const batch = await this.refreshPaymentBatchSummary(batchId);
    return {
      period_id: period.id,
      batch: batch ?? batchRow,
      records_added: recordsAdded.length,
      records_skipped: recordsSkipped,
      payslip_count: payslipRes.rows.length,
      records: recordsAdded,
      payroll_e2e_ready: false,
    };
  }

  private async refreshPaymentBatchSummary(
    batchId: string,
    processedBy?: string,
  ) {
    const res = await this.db.query(
      `UPDATE public.payment_batches pb SET
        employee_count = stats.employee_count,
        total_amount = stats.total_amount,
        paid_count = stats.paid_count,
        paid_amount = stats.paid_amount,
        status = CASE
          WHEN stats.employee_count > 0 AND stats.paid_count = stats.employee_count THEN 'completed'
          WHEN stats.paid_count > 0 THEN 'processing'
          ELSE COALESCE(pb.status, 'pending')
        END,
        processed_by = COALESCE($2, pb.processed_by),
        processed_at = CASE WHEN stats.paid_count > 0 THEN NOW() ELSE pb.processed_at END,
        updated_at = NOW()
      FROM (
        SELECT
          payment_batch_id,
          COUNT(*)::int AS employee_count,
          COALESCE(SUM(amount), 0)::numeric AS total_amount,
          COUNT(*) FILTER (WHERE status = 'paid')::int AS paid_count,
          COALESCE(SUM(amount) FILTER (WHERE status = 'paid'), 0)::numeric AS paid_amount
        FROM public.payment_records
        WHERE payment_batch_id = $1::uuid
        GROUP BY payment_batch_id
      ) stats
      WHERE pb.id = stats.payment_batch_id
      RETURNING pb.*;`,
      [batchId, processedBy ?? null],
    );
    return res.rows[0];
  }

  async addPaymentRecord(
    batchId: string,
    payload: {
      company_id: string;
      payroll_record_id?: string;
      employee_id?: string;
      employee_code: string;
      employee_name: string;
      department?: string;
      bank_name?: string;
      bank_account?: string;
      amount: number;
      notes?: string;
    },
    authorization?: string,
  ) {
    await this.ensurePaymentBatchSchema();
    const scope = resolveHrmListScope(authorization, payload.company_id);
    const batchPeek = await this.db.query(
      `SELECT company_id FROM public.payment_batches WHERE id = $1::uuid LIMIT 1;`,
      [batchId],
    );
    assertResourceInHrmScope(batchPeek.rows[0], scope, {
      notFoundCode: 'HRM-PB-404',
      mismatchCode: 'HRM-PB-409',
    });
    const recordRes = await this.db.query(
      `INSERT INTO public.payment_records (
        id, company_id, payment_batch_id, payroll_record_id, employee_id, employee_code, employee_name,
        department, bank_name, bank_account, amount, status, notes
      ) VALUES ($1, $2, $3::uuid, $4::uuid, $5::uuid, $6, $7, $8, $9, $10, $11, 'pending', $12)
      RETURNING *;`,
      [
        randomUUID(),
        batchPeek.rows[0].company_id,
        batchId,
        payload.payroll_record_id ?? null,
        payload.employee_id ?? null,
        payload.employee_code.trim(),
        payload.employee_name.trim(),
        payload.department ?? null,
        payload.bank_name ?? null,
        payload.bank_account ?? null,
        payload.amount,
        payload.notes ?? null,
      ],
    );
    await this.refreshPaymentBatchSummary(batchId);
    return recordRes.rows[0];
  }

  async processPaymentRecord(
    batchId: string,
    recordId: string,
    companyId: string,
    payload: { transaction_ref?: string; notes?: string },
    authorization?: string,
  ) {
    await this.ensurePaymentBatchSchema();
    const scope = resolveHrmListScope(authorization, companyId);
    const batchPeek = await this.db.query(
      `SELECT company_id FROM public.payment_batches WHERE id = $1::uuid LIMIT 1;`,
      [batchId],
    );
    assertResourceInHrmScope(batchPeek.rows[0], scope, {
      notFoundCode: 'HRM-PB-404',
      mismatchCode: 'HRM-PB-409',
    });
    const recordRes = await this.db.query(
      `UPDATE public.payment_records
       SET status = 'paid',
           paid_at = NOW(),
           transaction_ref = COALESCE($3, transaction_ref),
           notes = COALESCE($4, notes),
           updated_at = NOW()
       WHERE id = $1::uuid
         AND payment_batch_id = $2::uuid
       RETURNING *;`,
      [
        recordId,
        batchId,
        payload.transaction_ref ?? null,
        payload.notes ?? null,
      ],
    );
    if (!recordRes.rows[0]) {
      throw new ApiException(
        'HRM-PB-REC-404',
        'Payment record not found',
        HttpStatus.NOT_FOUND,
      );
    }
    await this.syncPayslipPaidFromRecord(recordId);
    await this.refreshPaymentBatchSummary(batchId);
    return recordRes.rows[0];
  }

  async processAllPaymentsInBatch(
    batchId: string,
    companyId: string,
    payload: { transaction_ref?: string; notes?: string },
    authorization?: string,
  ) {
    await this.ensurePaymentBatchSchema();
    const scope = resolveHrmListScope(authorization, companyId);
    const batchPeek = await this.db.query(
      `SELECT company_id FROM public.payment_batches WHERE id = $1::uuid LIMIT 1;`,
      [batchId],
    );
    assertResourceInHrmScope(batchPeek.rows[0], scope, {
      notFoundCode: 'HRM-PB-404',
      mismatchCode: 'HRM-PB-409',
    });
    const updateRes = await this.db.query(
      `UPDATE public.payment_records
       SET status = 'paid',
           paid_at = COALESCE(paid_at, NOW()),
           transaction_ref = COALESCE($2, transaction_ref),
           notes = COALESCE($3, notes),
           updated_at = NOW()
       WHERE payment_batch_id = $1::uuid
         AND status <> 'paid'
       RETURNING id;`,
      [batchId, payload.transaction_ref ?? null, payload.notes ?? null],
    );
    await this.syncPayslipsPaidFromBatch(batchId);
    const batchRes = await this.refreshPaymentBatchSummary(batchId);
    return {
      batch: batchRes ?? { id: batchId },
      processed_records: updateRes.rows.length,
      payroll_e2e_ready: false,
    };
  }
}
