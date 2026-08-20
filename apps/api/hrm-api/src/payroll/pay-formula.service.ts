/**
 * @CODE-MEMORY
 * Screen:     HRM → Công thức lương `/api/hrm/payroll/formulas`
 * UC:         FR-UC-BP-PAY-02 · AC-PAY-FORMULA-01..05 · VAL-PAY-F-01..03
 * BR:         Option A dual-control authored_by ≠ published_by · soft-delete retire
 * SRS:        docs/program/specs/PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-01.md §3–§4
 * TechSpec:   ADR-HRM-4-PILLAR-API-BOUNDARY.md §10 · R-PAY-DD-01 Form GĐ1 (cấm DnD)
 * DB_DESIGN:  docs/qa/evidence/po-hrm-payroll-formula-run-gap-data-01.md §2.1
 * API_DESIGN: F-PAY-FORMULA-AUTHOR-01 · PUBLISH-01 · LIST-01 · PREVIEW stub
 * Purpose:    ensureSchema pay_formula_definitions + draft upsert / version / dual publish / list-get scope_parity.
 * WorkItem:   PO-HRM-PAYROLL-FORMULA-RUN-GAP-BE-01
 * Coded:      2026-08-07
 * Callers:    PayrollController formulas*
 * Callees:    HrmDbService · resolveHrmListScope · expandPayrollPeriodCompanyIds · resolveHrmPersistCompanyIdText
 * FE-Actions: Soạn draft → submit-publish → publisher publish → list/bind kỳ
 * BE-Chain:   AUTHOR draft → pending_publish → active; retire soft; PREVIEW staged stub
 * Impact:     Sai dual-control → self-publish; sai scope → lộ CT pháp nhân khác
 * must_keep:  opaque expression_json · không hard-delete · không salary_components.formula SoT · payroll_e2e_ready=false
 * SOLID:      Service owns formula SM; catalog TEXT ≠ engine
 * LastVerified: pay-formula.service.spec.ts · docs/qa/evidence/po-hrm-payroll-formula-run-gap-be-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-07
 * WorkItem: PO-HRM-PAYROLL-FORMULA-RUN-GAP-BE-01
 * change_mode: ADD
 * What: ADD bảng + CRUD AUTHOR/PUBLISH/LIST/retire + nullable formula_definition_id trên periods/payslips; PREVIEW stub honest
 * must_keep: dual-control · scope_parity list↔get · cấm invent template HTTP / LIVE evaluator
 *
 * @CODE-MEMORY-CHANGE 2026-08-07
 * WorkItem: PO-HRM-PAYROLL-FORMULA-RUN-GAP-BE-EVAL-01
 * change_mode: ADD
 * What: Staged evaluator gd1_eval_v1 · PREVIEW real khi var bag đủ · else PREVIEW-STUB · resolve published cho PROCESS · payslip_lines DDL
 * must_keep: opaque GĐ1 ≠ LIVE · ATT hours blocked until att_timesheet_line · payroll_e2e_ready=false · cấm salary_components.formula engine
 *
 * @CODE-MEMORY-CHANGE 2026-08-07
 * WorkItem: PO-HRM-PAYROLL-FORMULA-RUN-GAP-BE-CB-BAG-01
 * change_mode: ADD
 * What: evaluateBoundFormula dùng CORE C&B soft-read (không bắt buộc variableOverrides) → PROCESS ghi payslip_lines
 * must_keep: FORMULA-412-VARS khi C&B thiếu · ATT-412 / FORMULA-412 · payroll_e2e_ready=false
 * LastVerified: docs/qa/evidence/po-hrm-payroll-formula-run-gap-be-cb-bag-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-07
 * WorkItem: PO-HRM-PAYROLL-FORMULA-RUN-GAP-BE-ATT-LINE-01
 * change_mode: ADD
 * What: PREVIEW/PROCESS bind hours từ loadAttHoursFromClosedLine; taxonomy ATT-412 vs PREVIEW-STUB
 * must_keep: cấm silent 0 · opaque stub · payroll_e2e_ready=false
 *
 * @CODE-MEMORY-CHANGE 2026-08-07
 * WorkItem: PO-HRM-AMIS-PARITY-PAY-SRC-BE-01
 * change_mode: ADD
 * What: PROCESS per-component SRC resolver Emp→Period→Template→Catalog; payslip_lines source_tier; cấm Nest % fallback
 * must_keep: ATT-412 upstream · OV-C published only · payroll_e2e_ready=false · cấm salary_components.formula TEXT
 *
 * @CODE-MEMORY-CHANGE 2026-08-07
 * WorkItem: PO-HRM-AMIS-PARITY-PAY-SRC-BE-02
 * change_mode: FIX
 * What: D-PAY-SRC-01 — BASE↔LUONG_CO_BAN emp_cb; bound formula as formula_default (override_applied strict); asOfDate coerce
 * must_keep: emp_cb short-circuit · ATT-412 · payroll_e2e_ready=false · cấm silent 0
 *
 * @CODE-MEMORY-CHANGE 2026-08-07
 * WorkItem: PO-HRM-PAYROLL-FORMULA-RUN-GAP-W3-BE-PROCESS-FORMULA-412-01
 * change_mode: FIX
 * What: evaluateBoundFormula hard-gate chỉ var keys expression tham chiếu — required_vars stale (const + keys base_salary) không 412 khi C&B absent
 * must_keep: var:base_salary + CB_PACKAGE_ABSENT → FORMULA-412-VARS · emp_cb short-circuit · payroll_e2e_ready=false
 *
 * @CODE-MEMORY-CHANGE 2026-08-10
 * WorkItem: HRM-MVP-GD1-PAY-09-CLUSTER-01
 * change_mode: FIX
 * What: PROCESS GTCG-412 chỉ khi expression tham chiếu dependents_count/gtgc_amount* — const-only không block thiếu CFG
 * solid_convention_ack: Công thức + GTCG inject ở Service; FE không aggregate bag; scope parity list↔get giữ nguyên PAY-09
 * must_keep: F-PAY-GTCG-01 khi formula cần gtgc vars · PAY01..08 · payroll_e2e_ready=false
 *
 * @CODE-MEMORY-CHANGE 2026-08-07
 * WorkItem: PO-HRM-AMIS-PARITY-EMP-SALARY-HISTORY-BE-TIER-01
 * change_mode: FIX
 * What: replacePayslipLines backfill source_tier via resolvePayslipLineSourceTier when caller omits
 * must_keep: GET expose tier · payroll_e2e_ready=false · cấm silent 0
 */
import { HttpStatus, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import { getVerifiedInternalJwtPayload } from '../common/internal-auth';
import {
  assertResourceInHrmScope,
  expandPayrollPeriodCompanyIds,
  normalizePayrollListCompanyId,
  pushCompanyIdFilter,
  resolveHrmListScope,
  resolveHrmPersistCompanyIdText,
} from '../common/hrm-list-scope';
import { HrmDbService } from '../db/hrm-db.service';
import {
  HRM_PAY_FORMULA_403_DUAL,
  HRM_PAY_FORMULA_404,
  HRM_PAY_FORMULA_409_IMMUTABLE,
  HRM_PAY_FORMULA_409_STATE,
  HRM_PAY_FORMULA_412,
  HRM_PAY_FORMULA_412_NOT_EVALUABLE,
  HRM_PAY_FORMULA_412_PREVIEW_STUB,
  HRM_PAY_FORMULA_412_VARS,
  HRM_PAY_ATT_412,
  HRM_PAY_FORMULA_CODE_CONFLICT,
  HRM_PAY_FORMULA_CODE_INVALID,
  PAY_FORMULA_CODE_FORMAT,
  PAY_FORMULA_STATUSES,
  type PayFormulaStatus,
  isAllowedRequiredVarKey,
  isPayFormulaDualControlEnabled,
} from './pay-formula.constants';
import {
  classifyPayFormulaExpression,
  collectExpressionVarKeys,
  evaluatePayFormulaExpression,
  missingVarKeys,
  type PayFormulaEvalOk,
} from './pay-formula-evaluator';
import { buildPayFormulaVariableBag } from './pay-formula-variable-bag';
import { HRM_PAY_GTCG_412 } from './pay-gtgc.constants';
import {
  aggregateSrcPayslipTotals,
  componentCodesMatch,
  ensurePeriodInputSchema,
  loadEmployeeFixedAmountForComponent,
  loadPeriodInputAmount,
  loadSalaryComponentMeta,
  natureToSign,
  normalizePayrollAsOfDate,
  parsePeriodSnapshotColumns,
  resolveCatalogDefaultFormulaId,
  resolvePayslipLineSourceTier,
  type PaySrcColumnDef,
  type PaySrcResolvedLine,
  type PaySrcTier,
} from './pay-src-resolver';
import {
  CreatePayFormulaDto,
  CreatePayFormulaVersionDto,
  ListPayFormulasQueryDto,
  PreviewPayFormulaDto,
  UpdatePayFormulaDto,
} from './dto/pay-formula.dto';

function roundMoney(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export type PublishedFormulaBind = {
  id: string;
  company_id: string;
  code: string;
  version: number;
  status: PayFormulaStatus;
  expression_json: unknown;
  required_vars_json: unknown;
  source: 'period' | 'company_active';
};

type PayFormulaRow = {
  id: string;
  company_id: string;
  code: string;
  version: number;
  status: PayFormulaStatus;
  expression_json: unknown;
  required_vars_json: unknown;
  meta_json: unknown;
  authored_by: string | null;
  authored_at: string | null;
  published_by: string | null;
  published_at: string | null;
  effective_from: string | null;
  effective_to: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

@Injectable()
export class PayFormulaService {
  constructor(private readonly db: HrmDbService) {}

  /** Public for jest schema assertions. */
  async ensureSchema(): Promise<void> {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.pay_formula_definitions (
        id UUID PRIMARY KEY,
        company_id TEXT NOT NULL,
        code TEXT NOT NULL,
        version INTEGER NOT NULL DEFAULT 1,
        status TEXT NOT NULL DEFAULT 'draft',
        expression_json JSONB NULL,
        required_vars_json JSONB NULL,
        meta_json JSONB NULL,
        authored_by TEXT NULL,
        authored_at TIMESTAMPTZ NULL,
        published_by TEXT NULL,
        published_at TIMESTAMPTZ NULL,
        effective_from DATE NULL,
        effective_to DATE NULL,
        archived_at TIMESTAMPTZ NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT chk_pay_formula_status CHECK (
          status IN ('draft', 'pending_publish', 'active', 'retired')
        ),
        CONSTRAINT chk_pay_formula_version_positive CHECK (version >= 1)
      );
    `);
    await this.db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_pay_formula_definitions_company_code_version
      ON public.pay_formula_definitions (company_id, code, version);
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_pay_formula_definitions_company_code_status
      ON public.pay_formula_definitions (company_id, code, status)
      WHERE archived_at IS NULL;
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_pay_formula_definitions_company_effective_from
      ON public.pay_formula_definitions (company_id, effective_from);
    `);

    // Optional bind columns — soft FK (app assert active); low blast.
    await this.db.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.tables
          WHERE table_schema = 'public' AND table_name = 'payroll_periods'
        ) AND NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'payroll_periods'
            AND column_name = 'formula_definition_id'
        ) THEN
          ALTER TABLE public.payroll_periods
            ADD COLUMN formula_definition_id UUID NULL;
        END IF;
        IF EXISTS (
          SELECT 1 FROM information_schema.tables
          WHERE table_schema = 'public' AND table_name = 'payroll_payslips'
        ) AND NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'payroll_payslips'
            AND column_name = 'formula_definition_id'
        ) THEN
          ALTER TABLE public.payroll_payslips
            ADD COLUMN formula_definition_id UUID NULL;
        END IF;
      END $$;
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.payroll_payslip_lines (
        id UUID PRIMARY KEY,
        payslip_id UUID NOT NULL REFERENCES public.payroll_payslips(id) ON DELETE CASCADE,
        company_id TEXT NOT NULL,
        component_code TEXT NOT NULL,
        amount NUMERIC(15,2) NOT NULL DEFAULT 0,
        sign TEXT NOT NULL DEFAULT 'earning',
        source_ref TEXT NULL,
        formula_definition_id UUID NULL,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT chk_payroll_payslip_lines_sign CHECK (sign IN ('earning', 'deduction'))
      );
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_payroll_payslip_lines_payslip_component
      ON public.payroll_payslip_lines (payslip_id, component_code);
    `);
    await this.db.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'payroll_payslip_lines'
            AND column_name = 'source_tier'
        ) THEN
          ALTER TABLE public.payroll_payslip_lines
            ADD COLUMN source_tier TEXT NULL;
        END IF;
      END $$;
    `);
    await ensurePeriodInputSchema(this.db);
  }

  private resolveActorSub(authorization?: string): string {
    const payload = getVerifiedInternalJwtPayload(authorization);
    const sub = String(payload?.sub ?? '').trim();
    if (!sub) {
      throw new ApiException(
        'HRM-AUTH-001',
        'Unauthorized formula access',
        HttpStatus.UNAUTHORIZED,
      );
    }
    return sub;
  }

  private assertCode(code: string): string {
    const normalized = code.trim().toLowerCase();
    if (!PAY_FORMULA_CODE_FORMAT.test(normalized)) {
      throw new ApiException(
        HRM_PAY_FORMULA_CODE_INVALID,
        'Formula code format invalid (slug a-z0-9_)',
        HttpStatus.BAD_REQUEST,
      );
    }
    return normalized;
  }

  private assertStatus(status: string): PayFormulaStatus {
    const s = status.trim().toLowerCase() as PayFormulaStatus;
    if (!(PAY_FORMULA_STATUSES as readonly string[]).includes(s)) {
      throw new ApiException(
        HRM_PAY_FORMULA_409_STATE,
        'Invalid formula status',
        HttpStatus.CONFLICT,
      );
    }
    return s;
  }

  private pickExpression(
    body: {
      expressionJson?: Record<string, unknown>;
      expression?: Record<string, unknown>;
    },
    required: boolean,
  ): Record<string, unknown> | undefined {
    const value = body.expressionJson ?? body.expression;
    if (value == null) {
      if (required) {
        throw new ApiException(
          'HRM-VAL-400',
          'expression / expressionJson required',
          HttpStatus.BAD_REQUEST,
        );
      }
      return undefined;
    }
    if (typeof value !== 'object' || Array.isArray(value)) {
      throw new ApiException(
        'HRM-VAL-400',
        'expression_json must be an object',
        HttpStatus.BAD_REQUEST,
      );
    }
    return value;
  }

  private pickRequiredVars(body: {
    requiredVarsJson?: Record<string, unknown> | string[];
    requiredVars?: Record<string, unknown> | string[];
  }): unknown | undefined {
    return body.requiredVarsJson ?? body.requiredVars;
  }

  private pickEffective(body: {
    effectiveFrom?: string;
    effective_from?: string;
    effectiveTo?: string;
    effective_to?: string;
  }): { from: string | null; to: string | null } {
    return {
      from: body.effectiveFrom ?? body.effective_from ?? null,
      to: body.effectiveTo ?? body.effective_to ?? null,
    };
  }

  /** Normalize required_vars to { keys: string[] } storage shape. */
  private normalizeRequiredVarsJson(raw: unknown): { keys: string[] } | null {
    if (raw == null) return null;
    let keys: string[] = [];
    if (Array.isArray(raw)) {
      keys = raw.map((k) => String(k).trim()).filter(Boolean);
    } else if (typeof raw === 'object') {
      const obj = raw as Record<string, unknown>;
      if (Array.isArray(obj.keys)) {
        keys = obj.keys.map((k) => String(k).trim()).filter(Boolean);
      } else {
        keys = Object.keys(obj)
          .filter((k) => k !== 'keys')
          .map((k) => k.trim())
          .filter(Boolean);
        if (keys.length === 0 && typeof obj.key === 'string') {
          keys = [obj.key.trim()];
        }
      }
    } else {
      throw new ApiException(
        HRM_PAY_FORMULA_412_VARS,
        'required_vars_json must be object or string[]',
        HttpStatus.PRECONDITION_FAILED,
      );
    }
    return { keys: [...new Set(keys)] };
  }

  private assertRequiredVarsForPublish(raw: unknown): { keys: string[] } {
    const normalized = this.normalizeRequiredVarsJson(raw);
    if (!normalized || normalized.keys.length === 0) {
      throw new ApiException(
        HRM_PAY_FORMULA_412_VARS,
        'required_vars_json keys required before publish (DV-18)',
        HttpStatus.PRECONDITION_FAILED,
      );
    }
    const invalid = normalized.keys.filter((k) => !isAllowedRequiredVarKey(k));
    if (invalid.length > 0) {
      throw new ApiException(
        HRM_PAY_FORMULA_412_VARS,
        `required_vars keys outside ATT/C&B allow-list: ${invalid.join(', ')}`,
        HttpStatus.PRECONDITION_FAILED,
        { invalid },
      );
    }
    return normalized;
  }

  private mapRow(row: PayFormulaRow) {
    const meta =
      row.meta_json &&
      typeof row.meta_json === 'object' &&
      !Array.isArray(row.meta_json)
        ? (row.meta_json as Record<string, unknown>)
        : null;
    return {
      id: row.id,
      companyId: row.company_id,
      code: row.code,
      version: Number(row.version),
      status: row.status,
      expressionJson: row.expression_json,
      requiredVarsJson: row.required_vars_json,
      label: meta && typeof meta.label === 'string' ? meta.label : null,
      authoredBy: row.authored_by,
      authoredAt: row.authored_at,
      publishedBy: row.published_by,
      publishedAt: row.published_at,
      effectiveFrom: row.effective_from,
      effectiveTo: row.effective_to,
      archivedAt: row.archived_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private async loadByIdInScope(
    id: string,
    requestedCompanyId: string,
    authorization?: string,
  ): Promise<PayFormulaRow> {
    const scopeCompanyId = normalizePayrollListCompanyId(
      authorization,
      requestedCompanyId,
    );
    const scope = resolveHrmListScope(authorization, scopeCompanyId);
    const filters: string[] = ['id = $1::uuid'];
    const values: unknown[] = [id];
    pushCompanyIdFilter(filters, values, expandPayrollPeriodCompanyIds(scope));
    const res = await this.db.query<PayFormulaRow>(
      `
        SELECT
          id, company_id, code, version, status,
          expression_json, required_vars_json, meta_json,
          authored_by, authored_at::text, published_by, published_at::text,
          effective_from::text, effective_to::text, archived_at::text,
          created_at::text, updated_at::text
        FROM public.pay_formula_definitions
        WHERE ${filters.join(' AND ')}
        LIMIT 1;
      `,
      values,
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException(
        HRM_PAY_FORMULA_404,
        'Pay formula definition not found',
        HttpStatus.NOT_FOUND,
      );
    }
    assertResourceInHrmScope(row, scope, {
      notFoundCode: HRM_PAY_FORMULA_404,
      mismatchCode: 'HRM-SCOPE-409',
    });
    return row;
  }

  async listFormulas(query: ListPayFormulasQueryDto, authorization?: string) {
    await this.ensureSchema();
    const scopeCompanyId = normalizePayrollListCompanyId(
      authorization,
      query.company_id,
    );
    const scope = resolveHrmListScope(authorization, scopeCompanyId);
    const filters: string[] = [];
    const values: unknown[] = [];
    pushCompanyIdFilter(filters, values, expandPayrollPeriodCompanyIds(scope));

    const includeArchived =
      String(query.include_archived ?? '').toLowerCase() === 'true';
    if (!includeArchived) {
      filters.push('archived_at IS NULL');
    }

    if (query.code?.trim()) {
      values.push(this.assertCode(query.code));
      filters.push(`code = $${values.length}`);
    }

    const activeOnly = String(query.active_only ?? '').toLowerCase() === 'true';
    if (activeOnly) {
      filters.push(`status = 'active'`);
    } else if (query.status) {
      values.push(this.assertStatus(query.status));
      filters.push(`status = $${values.length}`);
    }

    if (query.q?.trim()) {
      values.push(`%${query.q.trim().toLowerCase()}%`);
      filters.push(
        `(lower(code) LIKE $${values.length} OR lower(coalesce(meta_json->>'label','')) LIKE $${values.length})`,
      );
    }

    const where = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';
    const res = await this.db.query<PayFormulaRow>(
      `
        SELECT
          id, company_id, code, version, status,
          expression_json, required_vars_json, meta_json,
          authored_by, authored_at::text, published_by, published_at::text,
          effective_from::text, effective_to::text, archived_at::text,
          created_at::text, updated_at::text
        FROM public.pay_formula_definitions
        ${where}
        ORDER BY code ASC, version DESC, created_at DESC;
      `,
      values,
    );
    return { items: res.rows.map((r) => this.mapRow(r)) };
  }

  async getFormulaById(id: string, companyId: string, authorization?: string) {
    await this.ensureSchema();
    const row = await this.loadByIdInScope(id, companyId, authorization);
    return this.mapRow(row);
  }

  async createFormula(payload: CreatePayFormulaDto, authorization?: string) {
    await this.ensureSchema();
    const actor = this.resolveActorSub(authorization);
    const persistCompanyId = resolveHrmPersistCompanyIdText(
      authorization,
      payload.company_id,
    );
    const code = this.assertCode(payload.code);
    const expression = this.pickExpression(payload, true)!;
    const requiredVars = this.normalizeRequiredVarsJson(
      this.pickRequiredVars(payload),
    );
    const effective = this.pickEffective(payload);
    const meta = payload.label?.trim() ? { label: payload.label.trim() } : null;
    const id = randomUUID();

    try {
      const res = await this.db.query<PayFormulaRow>(
        `
          INSERT INTO public.pay_formula_definitions (
            id, company_id, code, version, status,
            expression_json, required_vars_json, meta_json,
            authored_by, authored_at, effective_from, effective_to
          ) VALUES (
            $1::uuid, $2, $3, 1, 'draft',
            $4::jsonb, $5::jsonb, $6::jsonb,
            $7, NOW(), $8::date, $9::date
          )
          RETURNING
            id, company_id, code, version, status,
            expression_json, required_vars_json, meta_json,
            authored_by, authored_at::text, published_by, published_at::text,
            effective_from::text, effective_to::text, archived_at::text,
            created_at::text, updated_at::text;
        `,
        [
          id,
          persistCompanyId,
          code,
          JSON.stringify(expression),
          requiredVars ? JSON.stringify(requiredVars) : null,
          meta ? JSON.stringify(meta) : null,
          actor,
          effective.from,
          effective.to,
        ],
      );
      return this.mapRow(res.rows[0]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (/uq_pay_formula_definitions_company_code_version|unique/i.test(msg)) {
        throw new ApiException(
          HRM_PAY_FORMULA_CODE_CONFLICT,
          'Formula code+version already exists',
          HttpStatus.CONFLICT,
        );
      }
      throw err;
    }
  }

  async updateFormula(
    id: string,
    payload: UpdatePayFormulaDto,
    authorization?: string,
  ) {
    await this.ensureSchema();
    const actor = this.resolveActorSub(authorization);
    const companyId = payload.company_id;
    if (!companyId?.trim()) {
      throw new ApiException(
        'HRM-VAL-400',
        'company_id required',
        HttpStatus.BAD_REQUEST,
      );
    }
    const row = await this.loadByIdInScope(id, companyId, authorization);
    if (row.status !== 'draft') {
      throw new ApiException(
        HRM_PAY_FORMULA_409_IMMUTABLE,
        'Only draft formulas may be updated in place; create a new version',
        HttpStatus.CONFLICT,
      );
    }

    const expression = this.pickExpression(payload, false);
    const requiredRaw = this.pickRequiredVars(payload);
    const requiredVars =
      requiredRaw === undefined
        ? undefined
        : this.normalizeRequiredVarsJson(requiredRaw);
    const effective = this.pickEffective(payload);
    const nextMeta =
      payload.label !== undefined
        ? {
            ...((row.meta_json &&
            typeof row.meta_json === 'object' &&
            !Array.isArray(row.meta_json)
              ? row.meta_json
              : {}) as Record<string, unknown>),
            label: payload.label?.trim() || null,
          }
        : undefined;

    const res = await this.db.query<PayFormulaRow>(
      `
        UPDATE public.pay_formula_definitions
        SET
          expression_json = COALESCE($2::jsonb, expression_json),
          required_vars_json = CASE WHEN $3::boolean THEN $4::jsonb ELSE required_vars_json END,
          meta_json = COALESCE($5::jsonb, meta_json),
          effective_from = COALESCE($6::date, effective_from),
          effective_to = COALESCE($7::date, effective_to),
          authored_by = $8,
          authored_at = NOW(),
          updated_at = NOW()
        WHERE id = $1::uuid AND status = 'draft'
        RETURNING
          id, company_id, code, version, status,
          expression_json, required_vars_json, meta_json,
          authored_by, authored_at::text, published_by, published_at::text,
          effective_from::text, effective_to::text, archived_at::text,
          created_at::text, updated_at::text;
      `,
      [
        id,
        expression ? JSON.stringify(expression) : null,
        requiredRaw !== undefined,
        requiredVars ? JSON.stringify(requiredVars) : null,
        nextMeta ? JSON.stringify(nextMeta) : null,
        effective.from,
        effective.to,
        actor,
      ],
    );
    if (!res.rows[0]) {
      throw new ApiException(
        HRM_PAY_FORMULA_409_IMMUTABLE,
        'Formula is no longer draft',
        HttpStatus.CONFLICT,
      );
    }
    return this.mapRow(res.rows[0]);
  }

  async createNewVersion(
    codeParam: string,
    payload: CreatePayFormulaVersionDto,
    authorization?: string,
  ) {
    await this.ensureSchema();
    const actor = this.resolveActorSub(authorization);
    const persistCompanyId = resolveHrmPersistCompanyIdText(
      authorization,
      payload.company_id,
    );
    const code = this.assertCode(codeParam);
    const scopeCompanyId = normalizePayrollListCompanyId(
      authorization,
      payload.company_id,
    );
    const scope = resolveHrmListScope(authorization, scopeCompanyId);
    const filters: string[] = ['code = $1', 'archived_at IS NULL'];
    const values: unknown[] = [code];
    pushCompanyIdFilter(filters, values, expandPayrollPeriodCompanyIds(scope));

    const latest = await this.db.query<PayFormulaRow>(
      `
        SELECT
          id, company_id, code, version, status,
          expression_json, required_vars_json, meta_json,
          authored_by, authored_at::text, published_by, published_at::text,
          effective_from::text, effective_to::text, archived_at::text,
          created_at::text, updated_at::text
        FROM public.pay_formula_definitions
        WHERE ${filters.join(' AND ')}
        ORDER BY version DESC
        LIMIT 1;
      `,
      values,
    );
    const prior = latest.rows[0];
    if (!prior) {
      throw new ApiException(
        HRM_PAY_FORMULA_404,
        'Prior formula version not found',
        HttpStatus.NOT_FOUND,
      );
    }
    assertResourceInHrmScope(prior, scope, {
      notFoundCode: HRM_PAY_FORMULA_404,
      mismatchCode: 'HRM-SCOPE-409',
    });

    const expression =
      this.pickExpression(payload, false) ??
      (prior.expression_json as Record<string, unknown>);
    if (!expression || typeof expression !== 'object') {
      throw new ApiException(
        'HRM-VAL-400',
        'expression_json required',
        HttpStatus.BAD_REQUEST,
      );
    }
    const requiredRaw = this.pickRequiredVars(payload);
    const requiredVars =
      requiredRaw !== undefined
        ? this.normalizeRequiredVarsJson(requiredRaw)
        : this.normalizeRequiredVarsJson(prior.required_vars_json);
    const effective = this.pickEffective(payload);
    const meta =
      payload.label !== undefined
        ? { label: payload.label.trim() }
        : prior.meta_json;
    const id = randomUUID();
    const nextVersion = Number(prior.version) + 1;

    try {
      const res = await this.db.query<PayFormulaRow>(
        `
          INSERT INTO public.pay_formula_definitions (
            id, company_id, code, version, status,
            expression_json, required_vars_json, meta_json,
            authored_by, authored_at, effective_from, effective_to
          ) VALUES (
            $1::uuid, $2, $3, $4, 'draft',
            $5::jsonb, $6::jsonb, $7::jsonb,
            $8, NOW(), COALESCE($9::date, $10::date), COALESCE($11::date, $12::date)
          )
          RETURNING
            id, company_id, code, version, status,
            expression_json, required_vars_json, meta_json,
            authored_by, authored_at::text, published_by, published_at::text,
            effective_from::text, effective_to::text, archived_at::text,
            created_at::text, updated_at::text;
        `,
        [
          id,
          persistCompanyId,
          code,
          nextVersion,
          JSON.stringify(expression),
          requiredVars ? JSON.stringify(requiredVars) : null,
          meta ? JSON.stringify(meta) : null,
          actor,
          effective.from,
          prior.effective_from,
          effective.to,
          prior.effective_to,
        ],
      );
      return this.mapRow(res.rows[0]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (/uq_pay_formula_definitions_company_code_version|unique/i.test(msg)) {
        throw new ApiException(
          HRM_PAY_FORMULA_CODE_CONFLICT,
          'Formula code+version already exists',
          HttpStatus.CONFLICT,
        );
      }
      throw err;
    }
  }

  async submitPublish(id: string, companyId: string, authorization?: string) {
    await this.ensureSchema();
    this.resolveActorSub(authorization);
    const row = await this.loadByIdInScope(id, companyId, authorization);
    if (row.status !== 'draft') {
      throw new ApiException(
        HRM_PAY_FORMULA_409_STATE,
        'submit-publish requires status=draft',
        HttpStatus.CONFLICT,
      );
    }
    const vars = this.assertRequiredVarsForPublish(row.required_vars_json);
    const res = await this.db.query<PayFormulaRow>(
      `
        UPDATE public.pay_formula_definitions
        SET
          status = 'pending_publish',
          required_vars_json = $2::jsonb,
          updated_at = NOW()
        WHERE id = $1::uuid AND status = 'draft'
        RETURNING
          id, company_id, code, version, status,
          expression_json, required_vars_json, meta_json,
          authored_by, authored_at::text, published_by, published_at::text,
          effective_from::text, effective_to::text, archived_at::text,
          created_at::text, updated_at::text;
      `,
      [id, JSON.stringify(vars)],
    );
    if (!res.rows[0]) {
      throw new ApiException(
        HRM_PAY_FORMULA_409_STATE,
        'submit-publish race — no longer draft',
        HttpStatus.CONFLICT,
      );
    }
    return this.mapRow(res.rows[0]);
  }

  async withdrawPublish(id: string, companyId: string, authorization?: string) {
    await this.ensureSchema();
    const actor = this.resolveActorSub(authorization);
    const row = await this.loadByIdInScope(id, companyId, authorization);
    if (row.status !== 'pending_publish') {
      throw new ApiException(
        HRM_PAY_FORMULA_409_STATE,
        'withdraw requires status=pending_publish',
        HttpStatus.CONFLICT,
      );
    }
    if (row.authored_by && row.authored_by !== actor) {
      throw new ApiException(
        'HRM-AUTH-403',
        'Only author may withdraw pending_publish',
        HttpStatus.FORBIDDEN,
      );
    }
    const res = await this.db.query<PayFormulaRow>(
      `
        UPDATE public.pay_formula_definitions
        SET status = 'draft', updated_at = NOW()
        WHERE id = $1::uuid AND status = 'pending_publish'
        RETURNING
          id, company_id, code, version, status,
          expression_json, required_vars_json, meta_json,
          authored_by, authored_at::text, published_by, published_at::text,
          effective_from::text, effective_to::text, archived_at::text,
          created_at::text, updated_at::text;
      `,
      [id],
    );
    return this.mapRow(res.rows[0]);
  }

  async publish(id: string, companyId: string, authorization?: string) {
    await this.ensureSchema();
    const publisher = this.resolveActorSub(authorization);
    const row = await this.loadByIdInScope(id, companyId, authorization);
    if (row.status !== 'pending_publish') {
      throw new ApiException(
        HRM_PAY_FORMULA_409_STATE,
        'publish requires status=pending_publish',
        HttpStatus.CONFLICT,
      );
    }
    this.assertRequiredVarsForPublish(row.required_vars_json);

    if (isPayFormulaDualControlEnabled()) {
      const author = String(row.authored_by ?? '').trim();
      if (!author || author === publisher) {
        throw new ApiException(
          HRM_PAY_FORMULA_403_DUAL,
          'Dual-control: publisher must differ from authored_by',
          HttpStatus.FORBIDDEN,
        );
      }
    }

    // Retire prior overlapping active for same (company_id, code).
    await this.db.query(
      `
        UPDATE public.pay_formula_definitions
        SET status = 'retired', updated_at = NOW()
        WHERE company_id = $1
          AND code = $2
          AND status = 'active'
          AND archived_at IS NULL
          AND id <> $3::uuid;
      `,
      [row.company_id, row.code, id],
    );

    const res = await this.db.query<PayFormulaRow>(
      `
        UPDATE public.pay_formula_definitions
        SET
          status = 'active',
          published_by = $2,
          published_at = NOW(),
          updated_at = NOW()
        WHERE id = $1::uuid AND status = 'pending_publish'
        RETURNING
          id, company_id, code, version, status,
          expression_json, required_vars_json, meta_json,
          authored_by, authored_at::text, published_by, published_at::text,
          effective_from::text, effective_to::text, archived_at::text,
          created_at::text, updated_at::text;
      `,
      [id, publisher],
    );
    if (!res.rows[0]) {
      throw new ApiException(
        HRM_PAY_FORMULA_409_STATE,
        'publish race — no longer pending_publish',
        HttpStatus.CONFLICT,
      );
    }
    return this.mapRow(res.rows[0]);
  }

  async retireFormula(id: string, companyId: string, authorization?: string) {
    await this.ensureSchema();
    this.resolveActorSub(authorization);
    const row = await this.loadByIdInScope(id, companyId, authorization);
    if (row.archived_at) {
      return this.mapRow(row);
    }
    const res = await this.db.query<PayFormulaRow>(
      `
        UPDATE public.pay_formula_definitions
        SET
          status = 'retired',
          archived_at = NOW(),
          updated_at = NOW()
        WHERE id = $1::uuid
        RETURNING
          id, company_id, code, version, status,
          expression_json, required_vars_json, meta_json,
          authored_by, authored_at::text, published_by, published_at::text,
          effective_from::text, effective_to::text, archived_at::text,
          created_at::text, updated_at::text;
      `,
      [id],
    );
    return this.mapRow(res.rows[0]);
  }

  /**
   * Resolve published formula for PROCESS bind.
   * Precedence (AMIS cite Emp→Period→Template→Catalog — GĐ1 layers implemented):
   * 1) Emp override — not shipped
   * 2) Period.formula_definition_id (must status=active)
   * 3) Template override — FORBIDDEN invent merge this wave
   * 4) Company default active (latest published_at)
   * Catalog salary_components.formula — FORBIDDEN as engine
   */
  async resolvePublishedFormulaForProcess(input: {
    companyId: string;
    periodFormulaDefinitionId?: string | null;
    authorization?: string;
  }): Promise<PublishedFormulaBind> {
    await this.ensureSchema();
    const scopeCompanyId = normalizePayrollListCompanyId(
      input.authorization,
      input.companyId,
    );
    const scope = resolveHrmListScope(input.authorization, scopeCompanyId);
    const companyIds = expandPayrollPeriodCompanyIds(scope);

    const periodFormulaId = String(
      input.periodFormulaDefinitionId ?? '',
    ).trim();
    if (periodFormulaId) {
      const filters: string[] = [
        'id = $1::uuid',
        `status = 'active'`,
        'archived_at IS NULL',
      ];
      const values: unknown[] = [periodFormulaId];
      pushCompanyIdFilter(filters, values, companyIds);
      const res = await this.db.query<PayFormulaRow>(
        `
          SELECT
            id, company_id, code, version, status,
            expression_json, required_vars_json, meta_json,
            authored_by, authored_at::text, published_by, published_at::text,
            effective_from::text, effective_to::text, archived_at::text,
            created_at::text, updated_at::text
          FROM public.pay_formula_definitions
          WHERE ${filters.join(' AND ')}
          LIMIT 1;
        `,
        values,
      );
      const row = res.rows[0];
      if (!row) {
        throw new ApiException(
          HRM_PAY_FORMULA_412,
          'Period formula_definition_id is missing, not active, or out of scope',
          HttpStatus.PRECONDITION_FAILED,
          { formulaDefinitionId: periodFormulaId, payroll_e2e_ready: false },
        );
      }
      return {
        id: row.id,
        company_id: row.company_id,
        code: row.code,
        version: Number(row.version),
        status: row.status,
        expression_json: row.expression_json,
        required_vars_json: row.required_vars_json,
        source: 'period',
      };
    }

    const filters: string[] = [`status = 'active'`, 'archived_at IS NULL'];
    const values: unknown[] = [];
    pushCompanyIdFilter(filters, values, companyIds);
    const res = await this.db.query<PayFormulaRow>(
      `
        SELECT
          id, company_id, code, version, status,
          expression_json, required_vars_json, meta_json,
          authored_by, authored_at::text, published_by, published_at::text,
          effective_from::text, effective_to::text, archived_at::text,
          created_at::text, updated_at::text
        FROM public.pay_formula_definitions
        WHERE ${filters.join(' AND ')}
        ORDER BY published_at DESC NULLS LAST, version DESC
        LIMIT 1;
      `,
      values,
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException(
        HRM_PAY_FORMULA_412,
        'No active published formula bound for period/company — refuse silent zero process',
        HttpStatus.PRECONDITION_FAILED,
        {
          warnings: [
            'NO_ACTIVE_FORMULA',
            'CATALOG_FORMULA_TEXT_FORBIDDEN',
            'TEMPLATE_OVERRIDE_NOT_MERGED',
          ],
          payroll_e2e_ready: false,
        },
      );
    }
    return {
      id: row.id,
      company_id: row.company_id,
      code: row.code,
      version: Number(row.version),
      status: row.status,
      expression_json: row.expression_json,
      required_vars_json: row.required_vars_json,
      source: 'company_active',
    };
  }

  /**
   * Evaluate bound published expression against var bag.
   * Opaque GĐ1 / incomplete ATT hours → honest fail (caller maps codes).
   * Taxonomy (API-ATT-LINE §4): PREVIEW → PREVIEW-STUB; PROCESS ATT fidelity → ATT-412.
   */
  async evaluateBoundFormula(input: {
    formula: PublishedFormulaBind | PayFormulaRow;
    companyId: string;
    employeeId?: string;
    asOfDate?: string;
    periodFrom?: string;
    periodTo?: string;
    periodId?: string;
    variableOverrides?: Record<string, unknown> | null;
    /** Default preview — PROCESS must pass surface:'process' for ATT-412. */
    surface?: 'preview' | 'process';
    systemParams?: Record<string, number>;
  }): Promise<
    | {
        mode: 'computed';
        result: PayFormulaEvalOk;
        bagWarnings: string[];
        sourcePrecedence: string[];
      }
    | {
        mode: 'blocked';
        code:
          | typeof HRM_PAY_FORMULA_412_PREVIEW_STUB
          | typeof HRM_PAY_FORMULA_412_NOT_EVALUABLE
          | typeof HRM_PAY_FORMULA_412_VARS
          | typeof HRM_PAY_ATT_412
          | typeof HRM_PAY_GTCG_412;
        message: string;
        details: Record<string, unknown>;
      }
  > {
    const surface = input.surface ?? 'preview';
    const expressionJson = input.formula.expression_json;
    const requiredVarsJson = input.formula.required_vars_json;
    const classified = classifyPayFormulaExpression(expressionJson);
    if (classified.kind === 'opaque_gd1' || classified.kind === 'unknown') {
      return {
        mode: 'blocked',
        code: HRM_PAY_FORMULA_412_PREVIEW_STUB,
        message:
          classified.kind === 'opaque_gd1'
            ? 'Formula preview staged — GĐ1 opaque expression not LIVE-evaluable (need gd1_eval_v1); ATT line fidelity separate'
            : 'expression_json form unsupported by staged evaluator — honest stub',
        details: {
          formulaDefinitionId: input.formula.id,
          version: Number(input.formula.version),
          warnings: [
            ...classified.warnings,
            'PREVIEW_STAGED',
            'EVALUATOR_SUBSET_NOT_MATCHED',
            'ATT_TIMESHEET_LINE_MAY_BE_ABSENT',
          ],
          payroll_e2e_ready: false,
        },
      };
    }

    /**
     * Hard gate = keys expression actually references (var/expr operands).
     * required_vars_json is publish metadata (DV-18 allow-list) — stale keys
     * (e.g. const BASE + declared base_salary) must NOT 412 when C&B absent
     * (R-PAY-W3-PROCESS-FORMULA-412-VARS / stamp PAYW3PROC-MSISALZ0).
     */
    const needed = collectExpressionVarKeys(expressionJson);
    const declaredKeys = collectExpressionVarKeys(undefined, requiredVarsJson);
    const staleDeclared = declaredKeys.filter((k) => !needed.includes(k));
    const bag = await buildPayFormulaVariableBag(this.db, {
      companyId: input.companyId,
      employeeId: input.employeeId,
      asOfDate: input.asOfDate,
      periodFrom: input.periodFrom,
      periodTo: input.periodTo,
      periodId: input.periodId,
      requiredKeys: needed,
      variableOverrides: input.variableOverrides,
    });
    if (staleDeclared.length > 0) {
      bag.warnings.push(
        `REQUIRED_VARS_DECLARED_UNUSED:${staleDeclared.sort().join(',')}`,
      );
    }

    const needsGtgcVars = needed.some((k) =>
      ['dependents_count', 'gtgc_amount_vnd', 'gtgc_amount'].includes(k),
    );
    if (surface === 'process' && bag.gtgcBlocked && needsGtgcVars) {
      return {
        mode: 'blocked',
        code: HRM_PAY_GTCG_412,
        message: bag.gtgcBlocked.message,
        details: {
          formulaDefinitionId: input.formula.id,
          version: Number(input.formula.version),
          as_of: bag.gtgcBlocked.as_of,
          company_id: bag.gtgcBlocked.company_id,
          warnings: [...bag.warnings, 'F-PAY-GTCG-01:CFG_MISSING'],
          payroll_e2e_ready: false,
        },
      };
    }

    if (input.systemParams) {
      for (const [k, v] of Object.entries(input.systemParams)) {
        if (typeof v === 'number' && Number.isFinite(v)) {
          bag.vars[k] = v;
        }
      }
    }

    const missing = missingVarKeys(needed, bag.vars);
    if (missing.length > 0) {
      const attMissing = missing.filter((k) =>
        [
          'payable_hours',
          'standard_hours',
          'ot_hours_weighted',
          'paid_leave_hours',
          'unpaid_leave_hours',
        ].includes(k),
      );
      if (attMissing.length > 0) {
        const reason =
          bag.attHoursReason === 'ATT_TIMESHEET_LINE_ABSENT'
            ? 'ATT_TIMESHEET_LINE_ABSENT'
            : bag.attHoursReason === 'NO_CLOSED_SHEET'
              ? 'NO_CLOSED_SHEET'
              : bag.attHoursReason === 'ATT_LINE_MISSING'
                ? 'ATT_LINE_MISSING'
                : bag.attHoursReason === 'ATT_LINE_INCOMPLETE'
                  ? 'ATT_LINE_INCOMPLETE'
                  : !bag.attTimesheetLinePresent
                    ? 'ATT_TIMESHEET_LINE_ABSENT'
                    : 'ATT_HOURS_VAR_BAG_INCOMPLETE';

        if (surface === 'process') {
          return {
            mode: 'blocked',
            code: HRM_PAY_ATT_412,
            message:
              'Attendance timesheet hours incomplete for payroll process — closed+locked line required (no silent 0)',
            details: {
              formulaDefinitionId: input.formula.id,
              version: Number(input.formula.version),
              missingVars: missing,
              reason,
              sheetId: bag.sheetId ?? null,
              lineId: bag.lineId ?? null,
              warnings: [...bag.warnings, 'PROCESS_ATT_HOURS_BLOCKED'],
              payroll_e2e_ready: false,
            },
          };
        }

        return {
          mode: 'blocked',
          code: HRM_PAY_FORMULA_412_PREVIEW_STUB,
          message:
            reason === 'ATT_TIMESHEET_LINE_ABSENT'
              ? 'Formula compute staged — ATT hours vars blocked until att_timesheet_line + closed-sheet bag'
              : 'Formula compute staged — ATT hours var bag incomplete (honest PREVIEW stub; not LIVE)',
          details: {
            formulaDefinitionId: input.formula.id,
            version: Number(input.formula.version),
            missingVars: missing,
            reason,
            sheetId: bag.sheetId ?? null,
            lineId: bag.lineId ?? null,
            warnings: [
              ...bag.warnings,
              'PREVIEW_STAGED',
              'EVALUATOR_SUBSET_READY_BUT_VAR_BAG_INCOMPLETE',
            ],
            payroll_e2e_ready: false,
          },
        };
      }
      return {
        mode: 'blocked',
        code: HRM_PAY_FORMULA_412_VARS,
        message: `Required formula variables missing: ${missing.join(', ')}`,
        details: {
          formulaDefinitionId: input.formula.id,
          missingVars: missing,
          warnings: bag.warnings,
          payroll_e2e_ready: false,
        },
      };
    }

    const evaluated = evaluatePayFormulaExpression(expressionJson, bag.vars);
    if (!evaluated.ok) {
      return {
        mode: 'blocked',
        code: HRM_PAY_FORMULA_412_NOT_EVALUABLE,
        message: evaluated.message,
        details: {
          formulaDefinitionId: input.formula.id,
          reason: evaluated.reason,
          warnings: [...evaluated.warnings, ...bag.warnings],
          payroll_e2e_ready: false,
        },
      };
    }

    return {
      mode: 'computed',
      result: evaluated,
      bagWarnings: bag.warnings,
      sourcePrecedence: bag.sourcePrecedence,
    };
  }

  /**
   * PREVIEW: real compute when gd1_eval_v1 + var bag complete; else honest stub/412 codes.
   * Does NOT persist payslip; does NOT claim LIVE / payroll_e2e_ready.
   */
  async previewFormula(
    id: string,
    companyId: string,
    body: PreviewPayFormulaDto,
    authorization?: string,
  ) {
    await this.ensureSchema();
    const row = await this.loadByIdInScope(id, companyId, authorization);
    const asOfDate = new Date().toISOString().slice(0, 10);
    const evaluated = await this.evaluateBoundFormula({
      formula: row,
      companyId: row.company_id,
      employeeId: body.employeeId,
      asOfDate,
      variableOverrides: body.variableOverrides,
      surface: 'preview',
    });

    if (evaluated.mode === 'blocked') {
      throw new ApiException(
        evaluated.code,
        evaluated.message,
        HttpStatus.PRECONDITION_FAILED,
        {
          ...evaluated.details,
          status: row.status,
        },
      );
    }

    return {
      formulaDefinitionId: row.id,
      version: Number(row.version),
      status: row.status,
      lines: evaluated.result.lines,
      gross: evaluated.result.gross,
      deduction: evaluated.result.deduction,
      net: evaluated.result.net,
      warnings: [
        ...evaluated.result.warnings,
        ...evaluated.bagWarnings,
        'PREVIEW_DRY_RUN',
        'NOT_CUSTOMER_UAT',
      ],
      sourcePrecedence: evaluated.sourcePrecedence,
      payroll_e2e_ready: false,
    };
  }

  /**
   * Load active published formula by id under company scope (OV-C / SRC tier 3–4).
   */
  async loadPublishedFormulaById(input: {
    formulaDefinitionId: string;
    companyId: string;
    authorization?: string;
  }): Promise<PublishedFormulaBind | null> {
    await this.ensureSchema();
    const scopeCompanyId = normalizePayrollListCompanyId(
      input.authorization,
      input.companyId,
    );
    const scope = resolveHrmListScope(input.authorization, scopeCompanyId);
    const companyIds = expandPayrollPeriodCompanyIds(scope);
    const filters: string[] = [
      'id = $1::uuid',
      `status = 'active'`,
      'archived_at IS NULL',
    ];
    const values: unknown[] = [input.formulaDefinitionId];
    pushCompanyIdFilter(filters, values, companyIds);
    const res = await this.db.query<PayFormulaRow>(
      `
        SELECT
          id, company_id, code, version, status,
          expression_json, required_vars_json, meta_json,
          authored_by, authored_at::text, published_by, published_at::text,
          effective_from::text, effective_to::text, archived_at::text,
          created_at::text, updated_at::text
        FROM public.pay_formula_definitions
        WHERE ${filters.join(' AND ')}
        LIMIT 1;
      `,
      values,
    );
    const row = res.rows[0];
    if (!row) return null;
    return {
      id: row.id,
      company_id: row.company_id,
      code: row.code,
      version: Number(row.version),
      status: row.status,
      expression_json: row.expression_json,
      required_vars_json: row.required_vars_json,
      source: 'period',
    };
  }

  /**
   * Evaluate published formula and extract amount for one component_code (SRC tier 3/4).
   */
  private async evaluateFormulaAmountForComponent(input: {
    formula: PublishedFormulaBind;
    companyId: string;
    employeeId: string;
    componentCode: string;
    asOfDate: string;
    periodFrom: string;
    periodTo: string;
    periodId?: string;
  }): Promise<
    | {
        ok: true;
        amount: number;
        sign: 'earning' | 'deduction';
        source_ref: string;
      }
    | {
        ok: false;
        code: string;
        message: string;
        details?: Record<string, unknown>;
      }
  > {
    const evaluated = await this.evaluateBoundFormula({
      formula: input.formula,
      companyId: input.companyId,
      employeeId: input.employeeId,
      asOfDate: input.asOfDate,
      periodFrom: input.periodFrom,
      periodTo: input.periodTo,
      periodId: input.periodId,
      surface: 'process',
    });
    if (evaluated.mode === 'blocked') {
      return {
        ok: false,
        code: evaluated.code,
        message: evaluated.message,
        details: evaluated.details,
      };
    }
    const target = input.componentCode.trim();
    const line =
      evaluated.result.lines.find((l) =>
        componentCodesMatch(target, l.component_code),
      ) ?? evaluated.result.lines[0];
    if (!line) {
      return {
        ok: false,
        code: HRM_PAY_FORMULA_412,
        message: `Formula has no line for component ${input.componentCode}`,
        details: { payroll_e2e_ready: false },
      };
    }
    return {
      ok: true,
      amount: line.amount,
      sign: line.sign,
      source_ref: line.source_ref,
    };
  }

  /**
   * Resolve one template/catalog column via BR-AMIS-PAY-SRC-02..05.
   */
  private async resolveSrcComponentAmount(input: {
    companyId: string;
    periodId: string;
    employeeId: string;
    asOfDate: string;
    periodFrom: string;
    periodTo: string;
    column: PaySrcColumnDef;
    authorization?: string;
  }): Promise<
    | { ok: true; line: PaySrcResolvedLine }
    | {
        ok: false;
        code: string;
        message: string;
        details?: Record<string, unknown>;
      }
  > {
    const componentCode = input.column.component_code.trim();
    const meta = await loadSalaryComponentMeta(this.db, {
      companyId: input.companyId,
      componentCode,
    });
    const sign = input.column.sign ?? natureToSign(meta?.nature);

    const empFixed = await loadEmployeeFixedAmountForComponent(this.db, {
      companyId: input.companyId,
      employeeId: input.employeeId,
      asOfDate: input.asOfDate,
      componentCode,
    });
    if (empFixed) {
      return {
        ok: true,
        line: {
          component_code: componentCode,
          sign,
          amount: roundMoney(empFixed.amount),
          source_tier: 'emp_cb',
          source_ref: empFixed.source_ref,
          formula_definition_id: null,
          sort_order: input.column.sort_order,
        },
      };
    }

    const periodInput = await loadPeriodInputAmount(this.db, {
      periodId: input.periodId,
      employeeId: input.employeeId,
      componentCode,
    });
    if (periodInput) {
      return {
        ok: true,
        line: {
          component_code: componentCode,
          sign,
          amount: roundMoney(periodInput.amount),
          source_tier: 'period_input',
          source_ref: `period_input:${periodInput.id}`,
          formula_definition_id: null,
          sort_order: input.column.sort_order,
        },
      };
    }

    const overrideId = String(input.column.formula_definition_id ?? '').trim();
    /** OV-C only when snapshot/template explicitly marks override_applied (strict). */
    if (overrideId && input.column.override_applied === true) {
      const overrideFormula = await this.loadPublishedFormulaById({
        formulaDefinitionId: overrideId,
        companyId: input.companyId,
        authorization: input.authorization,
      });
      if (!overrideFormula) {
        return {
          ok: false,
          code: HRM_PAY_FORMULA_412,
          message: 'Template override formula is not published/active (OV-C)',
          details: {
            componentCode,
            formulaDefinitionId: overrideId,
            payroll_e2e_ready: false,
          },
        };
      }
      const evalOverride = await this.evaluateFormulaAmountForComponent({
        formula: overrideFormula,
        companyId: input.companyId,
        employeeId: input.employeeId,
        componentCode,
        asOfDate: input.asOfDate,
        periodFrom: input.periodFrom,
        periodTo: input.periodTo,
        periodId: input.periodId,
      });
      if (!evalOverride.ok) {
        return evalOverride;
      }
      return {
        ok: true,
        line: {
          component_code: componentCode,
          sign: evalOverride.sign,
          amount: roundMoney(evalOverride.amount),
          source_tier: 'template_override',
          source_ref: evalOverride.source_ref,
          formula_definition_id: overrideFormula.id,
          sort_order: input.column.sort_order,
        },
      };
    }

    /**
     * SRC-05 bound / column formula_default — when columns came from company_active formula
     * (override_applied=false) attach formula_definition_id so const/var lines evaluate after emp_cb miss.
     */
    if (overrideId && input.column.override_applied !== true) {
      const defaultFormula = await this.loadPublishedFormulaById({
        formulaDefinitionId: overrideId,
        companyId: input.companyId,
        authorization: input.authorization,
      });
      if (defaultFormula) {
        const evalDefault = await this.evaluateFormulaAmountForComponent({
          formula: defaultFormula,
          companyId: input.companyId,
          employeeId: input.employeeId,
          componentCode,
          asOfDate: input.asOfDate,
          periodFrom: input.periodFrom,
          periodTo: input.periodTo,
          periodId: input.periodId,
        });
        if (evalDefault.ok) {
          return {
            ok: true,
            line: {
              component_code: componentCode,
              sign: evalDefault.sign,
              amount: roundMoney(evalDefault.amount),
              source_tier: 'formula_default',
              source_ref: evalDefault.source_ref,
              formula_definition_id: defaultFormula.id,
              sort_order: input.column.sort_order,
            },
          };
        }
      }
    }

    const catalogFormulaId = await resolveCatalogDefaultFormulaId(this.db, {
      companyId: input.companyId,
      componentCode,
    });
    if (catalogFormulaId) {
      const catalogFormula = await this.loadPublishedFormulaById({
        formulaDefinitionId: catalogFormulaId,
        companyId: input.companyId,
        authorization: input.authorization,
      });
      if (catalogFormula) {
        const evalCatalog = await this.evaluateFormulaAmountForComponent({
          formula: catalogFormula,
          companyId: input.companyId,
          employeeId: input.employeeId,
          componentCode,
          asOfDate: input.asOfDate,
          periodFrom: input.periodFrom,
          periodTo: input.periodTo,
          periodId: input.periodId,
        });
        if (!evalCatalog.ok) {
          return evalCatalog;
        }
        return {
          ok: true,
          line: {
            component_code: componentCode,
            sign: evalCatalog.sign,
            amount: roundMoney(evalCatalog.amount),
            source_tier: 'formula_default',
            source_ref: evalCatalog.source_ref,
            formula_definition_id: catalogFormula.id,
            sort_order: input.column.sort_order,
          },
        };
      }
    }

    if (meta && meta.default_value > 0) {
      return {
        ok: true,
        line: {
          component_code: componentCode,
          sign,
          amount: roundMoney(meta.default_value),
          source_tier: 'formula_default',
          source_ref: 'catalog:default_value',
          formula_definition_id: null,
          sort_order: input.column.sort_order,
        },
      };
    }

    return {
      ok: false,
      code: HRM_PAY_FORMULA_412,
      message: `No SRC amount for component ${componentCode} — refuse silent zero (BR-AMIS-PAY-SRC-05)`,
      details: {
        componentCode,
        warnings: [
          'NO_EMP_CB',
          'NO_PERIOD_INPUT',
          'NO_TEMPLATE_OVERRIDE',
          'NO_CATALOG_FORMULA',
          'CATALOG_FORMULA_TEXT_FORBIDDEN',
        ],
        payroll_e2e_ready: false,
      },
    };
  }

  /**
   * PROCESS evaluate via SRC resolver (F-PAY-PROCESS-01 EXPAND).
   * Uses period snapshot columns when present; else falls back to bound formula lines.
   */
  async processEmployeePayslipViaSrc(input: {
    companyId: string;
    periodId: string;
    employeeId: string;
    asOfDate: string | Date;
    periodFrom: string | Date;
    periodTo: string | Date;
    sheetTemplateSnapshotJson?: unknown;
    boundFormula: PublishedFormulaBind;
    authorization?: string;
    systemParams?: Record<string, number>;
  }): Promise<
    | {
        mode: 'computed';
        lines: PaySrcResolvedLine[];
        gross: number;
        deduction: number;
        net: number;
        primaryFormulaDefinitionId: string;
        sourceTiers: PaySrcTier[];
        warnings: string[];
      }
    | {
        mode: 'blocked';
        code: string;
        message: string;
        details: Record<string, unknown>;
      }
  > {
    await this.ensureSchema();

    const asOfDate = normalizePayrollAsOfDate(input.asOfDate);
    const periodFrom = normalizePayrollAsOfDate(input.periodFrom) || asOfDate;
    const periodTo = normalizePayrollAsOfDate(input.periodTo) || asOfDate;

    let columns = parsePeriodSnapshotColumns(input.sheetTemplateSnapshotJson);
    if (columns.length === 0) {
      const classified = classifyPayFormulaExpression(
        input.boundFormula.expression_json,
      );
      if (classified.kind === 'gd1_eval_v1' && classified.lines.length > 0) {
        columns = classified.lines.map((l, idx) => ({
          component_code: l.component_code,
          sort_order: idx,
          /** Bound company/period formula → SRC-05 formula_default (not OV-C). */
          formula_definition_id: input.boundFormula.id,
          override_applied: false,
          sign: l.sign,
        }));
      }
    }

    if (columns.length === 0) {
      return {
        mode: 'blocked',
        code: HRM_PAY_FORMULA_412,
        message:
          'No pay sheet template snapshot or evaluable formula lines for SRC process',
        details: { payroll_e2e_ready: false },
      };
    }

    const resolved: PaySrcResolvedLine[] = [];
    const warnings: string[] = [];
    const sourceTiers = new Set<PaySrcTier>();

    for (const column of columns) {
      const outcome = await this.resolveSrcComponentAmount({
        companyId: input.companyId,
        periodId: input.periodId,
        employeeId: input.employeeId,
        asOfDate,
        periodFrom,
        periodTo,
        column,
        authorization: input.authorization,
      });
      if (!outcome.ok) {
        return {
          mode: 'blocked',
          code: outcome.code,
          message: outcome.message,
          details: {
            ...(outcome.details ?? {}),
            componentCode: column.component_code,
            payroll_e2e_ready: false,
          },
        };
      }
      resolved.push(outcome.line);
      sourceTiers.add(outcome.line.source_tier);
    }

    if (resolved.length === 0) {
      return {
        mode: 'blocked',
        code: HRM_PAY_FORMULA_412,
        message:
          'SRC resolver produced no payslip lines — refuse silent zero process',
        details: { payroll_e2e_ready: false },
      };
    }

    const totals = aggregateSrcPayslipTotals(resolved);
    warnings.push('SRC_RESOLVER_GD1', 'PAYROLL_E2E_READY_FALSE');

    return {
      mode: 'computed',
      lines: resolved,
      gross: totals.gross,
      deduction: totals.deduction,
      net: totals.net,
      primaryFormulaDefinitionId: input.boundFormula.id,
      sourceTiers: [...sourceTiers],
      warnings,
    };
  }

  async replacePayslipLines(input: {
    payslipId: string;
    companyId: string;
    formulaDefinitionId: string | null;
    lines: Array<{
      component_code: string;
      amount: number;
      sign: PayFormulaEvalOk['lines'][number]['sign'];
      source_ref: string;
      sort_order: number;
      source_tier?: PaySrcTier | null;
      formula_definition_id?: string | null;
    }>;
  }): Promise<void> {
    await this.ensureSchema();
    await this.db.query(
      `DELETE FROM public.payroll_payslip_lines WHERE payslip_id = $1::uuid`,
      [input.payslipId],
    );
    for (const line of input.lines) {
      const sourceTier =
        resolvePayslipLineSourceTier(line.source_tier, line.source_ref) ??
        line.source_tier ??
        null;
      await this.db.query(
        `
          INSERT INTO public.payroll_payslip_lines (
            id, payslip_id, company_id, component_code, amount, sign, source_ref,
            formula_definition_id, sort_order, source_tier
          ) VALUES (
            $1::uuid, $2::uuid, $3::text, $4::text, $5, $6::text, $7::text, $8::uuid, $9, $10::text
          );
        `,
        [
          randomUUID(),
          input.payslipId,
          input.companyId,
          line.component_code,
          line.amount,
          line.sign,
          line.source_ref,
          line.formula_definition_id ?? input.formulaDefinitionId,
          line.sort_order,
          sourceTier,
        ],
      );
    }
  }
}
