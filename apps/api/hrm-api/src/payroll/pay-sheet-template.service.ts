/**
 * @CODE-MEMORY
 * Screen:     HRM → Mẫu bảng lương `/api/hrm/payroll/pay-sheet-templates`
 * UC:         FR-UC-BP-PAY-02 · FR-UC-BP-PAY-06 · AC-PAY-TPL-01..06
 * BR:         OV-C definition_id preferred · jsonb preview-only · pack≠mẫu · SRC resolver (PROCESS cite)
 * SRS:        docs/program/specs/PO-HRM-AMIS-PARITY-PAY-TPL-API-01.md §5
 * TechSpec:   ADR-HRM-DYNAMIC-CONFIG-PLATFORM Option B · soft-delete archived_at · open catalog
 * DB_DESIGN:  docs/qa/evidence/po-hrm-amis-parity-pay-data-01.md §2–§3
 * API_DESIGN: F-PAY-SHEET-TPL-LIST/UPSERT/LINES/ARCHIVE-01 · PERIOD bind snapshot
 * Purpose:    ensureSchema mẫu bảng lương + CRUD cột/OV-C; tách khỏi salary_templates enroll pack.
 * WorkItem:   PO-HRM-AMIS-PARITY-PAY-TPL-BE-01
 * Coded:      2026-08-07
 * Callers:    PayrollController pay-sheet-templates*
 * Callees:    HrmDbService · resolveHrmListScope · expandPayrollPeriodCompanyIds · salary_components · pay_formula_definitions
 * FE-Actions: Settings mẫu → UPSERT header → PUT lines → ARCHIVE; lập kỳ bind snapshot
 * BE-Chain:   ensureSchema → LIST/GET scope_parity → UPSERT → replace-set lines → soft archive; bind period snapshot
 * Impact:     Sai scope → lộ mẫu pháp nhân khác; merge pack → hỏng hire enroll
 * must_keep:  pack salary-templates enroll ≠ mẫu · OV-C FK · soft-delete · scope_parity · payroll_e2e_ready=false
 * SOLID:      Service owns mẫu SoT; catalog TEXT ≠ engine; formula EVAL stays peer wave
 * LastVerified: pay-sheet-template.service.spec.ts · docs/qa/evidence/po-hrm-amis-parity-pay-tpl-be-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-07
 * WorkItem: PO-HRM-AMIS-PARITY-PAY-TPL-BE-01
 * change_mode: ADD
 * What: ADD pay_sheet_templates/_lines + period snapshot cols + Nest CRUD; cấm hard DELETE; cấm deepen pack
 * must_keep: OV-C · open catalog no CHK IN (N) codes · soft-delete archived_at
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-CNS-BE-01
 * change_mode: ADD
 * What: S-PAY-CNS-01 replaceLines — assertComponentIdInEffectiveCatalog → HRM-SC-COMP-KEY (VAL-PAY-CNS-01/05)
 * must_keep: admin F-PLT-PAY-COMP-02 open · payroll_e2e_ready=false · U65 · scope_parity list↔assert
 *
 * @CODE-MEMORY-CHANGE 2026-08-11 PO-HRM-PAY-CNTT-BE-01
 * change_mode: ADD
 * What: EXPAND template header business_line_tag + policy_pack_id + input_pack_profile_id; bind period setupContext snapshot
 * must_keep: OV-C · soft-delete · payroll_e2e_ready=false · formula HOLD
 *
 * @CODE-MEMORY-CHANGE 2026-08-12 PO-HRM-PAY-TPL-RESOLVE-PROVINCE-BE-01
 * change_mode: ADD
 * What: EXPAND applicability_scope=province + cột applicability_province_code (open, cấm CHECK enum đóng);
 *   ADD resolveForEmployee(employee, periodContext) — ranking employee>position>province>ou>company,
 *   tie-break is_default rồi updated_at DESC; BR-TPL-PROV-01/02 publish-time guard (400-PROVINCE-SCOPE / 409-PROVINCE-DUP).
 * SOLID: resolver CHỈ chọn đúng template + trả matchStatus/warnings — KHÔNG tính lương, KHÔNG tự bind/auto-pick,
 *   KHÔNG gọi tại bind kỳ hay tại mỗi dòng process (wiring là Task khác, dependency mở). Trả kết quả có cấu trúc
 *   (matchStatus/errorCode) thay vì throw cho NO_CANDIDATE/AMBIGUOUS — nhất quán với style non-throw của
 *   pay-payroll-group-resolver.ts resolvePayrollGroupWinner (PAY-09), caller sau quyết định throw khi wiring.
 * must_keep: OV-C · soft-delete · payroll_e2e_ready=false · formula HOLD · cấm CHECK (applicability_scope IN (...))
 *
 * @CODE-MEMORY-CHANGE 2026-08-13 PO-HRM-PAY-TPL-RESOLVE-PROCESS-GUARD-BE-01
 * change_mode: ADD
 * What: bindToPeriod() snapshot ADD field applicabilityProvinceCode (mirror template.applicability_province_code
 *   tại bind-time) — trước đây snapshot KHÔNG mang field này (gap chặn điểm gọi (c) PROCESS province guard).
 *   PaySheetTemplateService không tự đối chiếu/mismatch — guard so khớp thật nằm ở payroll.service.ts
 *   processPayrollPeriod (đọc snapshot đã đóng băng, KHÔNG re-query template sống).
 * Why:  spec §4.2 liệt kê field này "MISSING — spec này yêu cầu" cho chính PROCESS province guard.
 * must_keep: snapshot vẫn immutable sau processed (AC-PAY-TPL-05/06) · KHÔNG đổi cột DB · KHÔNG đổi resolveForEmployee
 */
import { HttpStatus, Injectable, Optional } from '@nestjs/common';
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
  HRM_PAY_TPL_400_PROVINCE_SCOPE,
  HRM_PAY_TPL_404,
  HRM_PAY_TPL_409_CODE,
  HRM_PAY_TPL_409_IMMUTABLE,
  HRM_PAY_TPL_409_LINE,
  HRM_PAY_TPL_409_PROVINCE_DUP,
  HRM_PAY_TPL_412_NO_PROVINCE_MATCH,
  HRM_PAY_TPL_412_TEMPLATE,
  HRM_PAY_TPL_CODE_INVALID,
  PAY_SHEET_TPL_APPLICABILITY,
  PAY_SHEET_TPL_CODE_FORMAT,
  PAY_SHEET_TPL_STATUSES,
  type PaySheetApplicabilityScope,
  type PaySheetTemplateStatus,
} from './pay-sheet-template.constants';
import {
  BindPaySheetTemplateDto,
  CreatePaySheetTemplateDto,
  ListPaySheetTemplatesQueryDto,
  PaySheetTemplateLineInputDto,
  PutPaySheetTemplateLinesDto,
  UpdatePaySheetTemplateDto,
} from './dto/pay-sheet-template.dto';
import { assertComponentIdInEffectiveCatalog } from './salary-component-consumer-assert';
import { HRM_PAY_SETUP_404_PACK } from './pay-cntt-setup.constants';
import { ensurePayCnttSetupSchema, PayCnttSetupService } from './pay-cntt-setup.service';

type PaySheetTemplateRow = {
  id: string;
  company_id: string;
  code: string;
  name: string;
  description: string | null;
  status: string;
  is_default: boolean;
  applicability_scope: string;
  ou_id: string | null;
  position_key: string | null;
  employee_id: string | null;
  applicability_province_code: string | null;
  business_line_tag: string | null;
  policy_pack_id: string | null;
  input_pack_profile_id: string | null;
  policy_pack_display_label?: string | null;
  input_pack_profile_display_label?: string | null;
  archived_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

type PaySheetTemplateLineRow = {
  id: string;
  template_id: string;
  company_id: string;
  component_id: string;
  component_code: string;
  display_label: string | null;
  sort_order: number;
  group_key: string | null;
  is_visible: boolean;
  is_identity_or_total: boolean;
  formula_override_definition_id: string | null;
  formula_override_json: unknown;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
  formula_override_code?: string | null;
  formula_override_version?: number | null;
};

export type SheetTemplateSnapshotColumn = {
  component_code: string;
  display_label: string | null;
  sort_order: number;
  formula_definition_id: string | null;
  override_applied: boolean;
};

/** Mapped header DTO — SoT type cho resolveForEmployee() candidates/recommended. */
export type PaySheetTemplateHeaderView = {
  id: string;
  companyId: string;
  code: string;
  name: string;
  description: string | null;
  status: string;
  isDefault: boolean;
  applicabilityScope: string;
  ouId: string | null;
  positionKey: string | null;
  employeeId: string | null;
  applicabilityProvinceCode: string | null;
  businessLineTag: string | null;
  policyPackId: string | null;
  policyPackDisplayLabel: string | null;
  inputPackProfileId: string | null;
  inputPackProfileDisplayLabel: string | null;
  archivedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
};

/** PO-HRM-PAY-SHEET-TEMPLATE-SPEC-01 §3.2 — resolveForEmployee() input/output nghiệp vụ. */
export type ResolveForEmployeeInput = {
  id: string;
  ouId?: string | null;
  positionKey?: string | null;
  /** province_code đã đọc AS-IS từ employees.custom_fields.work_location — KHÔNG tự chuẩn hoá domain (dependency mở ba-data). */
  provinceCode?: string | null;
};

export type ResolveForEmployeePeriodContext = {
  companyId: string;
  businessLineTag?: string | null;
};

export type PaySheetTemplateResolveMatchStatus =
  | 'MATCHED'
  | 'NO_PROVINCE_MATCH'
  | 'AMBIGUOUS'
  | 'NO_CANDIDATE';

export type PaySheetTemplateResolveResult = {
  candidates: PaySheetTemplateHeaderView[];
  recommended: PaySheetTemplateHeaderView | null;
  matchStatus: PaySheetTemplateResolveMatchStatus;
  warnings: string[];
  errorCode?: string;
  /** Chỉ set khi matchStatus=AMBIGUOUS — id các template cùng tier cao nhất, không tự chọn 1. */
  tiedTemplateIds?: string[];
};

@Injectable()
export class PaySheetTemplateService {
  constructor(
    private readonly db: HrmDbService,
    @Optional() private readonly cnttSetup?: PayCnttSetupService,
  ) {}

  /** Public for jest schema assertions. */
  async ensureSchema(): Promise<void> {
    await ensurePayCnttSetupSchema(this.db);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.pay_sheet_templates (
        id UUID PRIMARY KEY,
        company_id TEXT NOT NULL,
        code TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT NULL,
        status TEXT NOT NULL DEFAULT 'draft',
        is_default BOOLEAN NOT NULL DEFAULT FALSE,
        applicability_scope TEXT NOT NULL DEFAULT 'company',
        ou_id TEXT NULL,
        position_key TEXT NULL,
        employee_id UUID NULL,
        archived_at TIMESTAMPTZ NULL,
        created_by TEXT NULL,
        updated_by TEXT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    // Soft SM statuses only — FORBIDDEN CHECK (code IN (...)) business catalog.
    await this.db.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'chk_pay_sheet_tpl_status'
        ) THEN
          ALTER TABLE public.pay_sheet_templates
            ADD CONSTRAINT chk_pay_sheet_tpl_status
            CHECK (status IN ('draft', 'active', 'retired'));
        END IF;
      END $$;
    `);
    // PO-HRM-PAY-SHEET-TEMPLATE-SPEC-01 §2 — ADD applicability_province_code (open TEXT, cấm CHECK enum đóng).
    await this.db.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'pay_sheet_templates'
            AND column_name = 'applicability_province_code'
        ) THEN
          ALTER TABLE public.pay_sheet_templates
            ADD COLUMN applicability_province_code TEXT NULL;
        END IF;
      END $$;
    `);
    // BR-TPL-PROV-02 — defense-in-depth: unique (company, business_line_tag, province) khi có province set.
    await this.db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_pay_sheet_templates_company_line_province_active
      ON public.pay_sheet_templates (company_id, business_line_tag, applicability_province_code)
      WHERE archived_at IS NULL AND applicability_province_code IS NOT NULL;
    `);
    await this.db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_pay_sheet_templates_company_code_active
      ON public.pay_sheet_templates (company_id, lower(code))
      WHERE archived_at IS NULL;
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_pay_sheet_templates_company_status
      ON public.pay_sheet_templates (company_id, status)
      WHERE archived_at IS NULL;
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_pay_sheet_templates_company_default
      ON public.pay_sheet_templates (company_id, is_default)
      WHERE archived_at IS NULL;
    `);

    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.pay_sheet_template_lines (
        id UUID PRIMARY KEY,
        template_id UUID NOT NULL,
        company_id TEXT NOT NULL,
        component_id UUID NOT NULL,
        component_code TEXT NOT NULL,
        display_label TEXT NULL,
        sort_order INTEGER NOT NULL DEFAULT 0,
        group_key TEXT NULL,
        is_visible BOOLEAN NOT NULL DEFAULT TRUE,
        is_identity_or_total BOOLEAN NOT NULL DEFAULT FALSE,
        formula_override_definition_id UUID NULL,
        formula_override_json JSONB NULL,
        archived_at TIMESTAMPTZ NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await this.db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_pay_sheet_template_lines_tpl_component_active
      ON public.pay_sheet_template_lines (template_id, component_id)
      WHERE archived_at IS NULL;
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_pay_sheet_template_lines_tpl_sort
      ON public.pay_sheet_template_lines (template_id, sort_order);
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_pay_sheet_template_lines_company_component_code
      ON public.pay_sheet_template_lines (company_id, component_code);
    `);

    await this.db.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.tables
          WHERE table_schema = 'public' AND table_name = 'payroll_periods'
        ) THEN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'payroll_periods'
              AND column_name = 'pay_sheet_template_id'
          ) THEN
            ALTER TABLE public.payroll_periods
              ADD COLUMN pay_sheet_template_id UUID NULL;
          END IF;
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'payroll_periods'
              AND column_name = 'sheet_template_snapshot_json'
          ) THEN
            ALTER TABLE public.payroll_periods
              ADD COLUMN sheet_template_snapshot_json JSONB NULL;
          END IF;
        END IF;
      END $$;
    `);
  }

  private resolveActorSub(authorization?: string): string | null {
    const payload = getVerifiedInternalJwtPayload(authorization);
    const sub = String(payload?.sub ?? '').trim();
    return sub || null;
  }

  private assertCode(code: string): string {
    const normalized = code.trim().toLowerCase();
    if (!PAY_SHEET_TPL_CODE_FORMAT.test(normalized)) {
      throw new ApiException(
        HRM_PAY_TPL_CODE_INVALID,
        'Template code format invalid (slug a-z0-9_-)',
        HttpStatus.BAD_REQUEST,
      );
    }
    return normalized;
  }

  private assertStatus(status: string): PaySheetTemplateStatus {
    const s = status.trim().toLowerCase() as PaySheetTemplateStatus;
    if (!(PAY_SHEET_TPL_STATUSES as readonly string[]).includes(s)) {
      throw new ApiException('HRM-VAL-400', 'Invalid pay sheet template status', HttpStatus.BAD_REQUEST);
    }
    return s;
  }

  private assertApplicability(scope: string): PaySheetApplicabilityScope {
    const s = scope.trim().toLowerCase() as PaySheetApplicabilityScope;
    if (!(PAY_SHEET_TPL_APPLICABILITY as readonly string[]).includes(s)) {
      throw new ApiException('HRM-VAL-400', 'Invalid applicability_scope', HttpStatus.BAD_REQUEST);
    }
    return s;
  }

  private softAssertApplicabilityFields(
    scope: PaySheetApplicabilityScope,
    fields: { ouId?: string | null; positionKey?: string | null; employeeId?: string | null },
  ): void {
    if (scope === 'ou' && !String(fields.ouId ?? '').trim()) {
      throw new ApiException('HRM-VAL-400', 'ouId required when applicability_scope=ou', HttpStatus.BAD_REQUEST);
    }
    if (scope === 'position' && !String(fields.positionKey ?? '').trim()) {
      throw new ApiException(
        'HRM-VAL-400',
        'positionKey required when applicability_scope=position',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (scope === 'employee' && !String(fields.employeeId ?? '').trim()) {
      throw new ApiException(
        'HRM-VAL-400',
        'employeeId required when applicability_scope=employee',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /** BR-TPL-PROV-01 — applicability_province_code chỉ có ý nghĩa khi đi kèm business_line_tag. */
  private assertProvinceScope(
    provinceCode: string | null,
    businessLineTag: string | null | undefined,
  ): void {
    if (provinceCode && !String(businessLineTag ?? '').trim()) {
      throw new ApiException(
        HRM_PAY_TPL_400_PROVINCE_SCOPE,
        'applicability_province_code requires business_line_tag (BR-TPL-PROV-01)',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /** BR-TPL-PROV-02 — cấm 2 template active cùng (company, business_line_tag, applicability_province_code). */
  private async assertNoProvinceDuplicate(
    companyId: string,
    businessLineTag: string | null | undefined,
    provinceCode: string | null,
    excludeId?: string,
  ): Promise<void> {
    if (!provinceCode) return;
    const filters: string[] = ['company_id = $1', 'archived_at IS NULL', 'applicability_province_code = $2'];
    const values: unknown[] = [companyId, provinceCode];
    const tag = String(businessLineTag ?? '').trim();
    if (tag) {
      values.push(tag);
      filters.push(`business_line_tag = $${values.length}`);
    } else {
      filters.push('business_line_tag IS NULL');
    }
    if (excludeId) {
      values.push(excludeId);
      filters.push(`id <> $${values.length}::uuid`);
    }
    const res = await this.db.query<{ id: string }>(
      `SELECT id FROM public.pay_sheet_templates WHERE ${filters.join(' AND ')} LIMIT 1;`,
      values,
    );
    if (res.rows[0]) {
      throw new ApiException(
        HRM_PAY_TPL_409_PROVINCE_DUP,
        'Active pay sheet template already exists for (business_line_tag, applicability_province_code)',
        HttpStatus.CONFLICT,
      );
    }
  }

  private mapHeader(row: PaySheetTemplateRow): PaySheetTemplateHeaderView {
    return {
      id: row.id,
      companyId: row.company_id,
      code: row.code,
      name: row.name,
      description: row.description,
      status: row.status,
      isDefault: Boolean(row.is_default),
      applicabilityScope: row.applicability_scope,
      ouId: row.ou_id,
      positionKey: row.position_key,
      employeeId: row.employee_id,
      applicabilityProvinceCode: row.applicability_province_code ?? null,
      businessLineTag: row.business_line_tag,
      policyPackId: row.policy_pack_id,
      policyPackDisplayLabel: row.policy_pack_display_label ?? null,
      inputPackProfileId: row.input_pack_profile_id,
      inputPackProfileDisplayLabel: row.input_pack_profile_display_label ?? null,
      archivedAt: row.archived_at,
      createdBy: row.created_by,
      updatedBy: row.updated_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private mapLine(row: PaySheetTemplateLineRow) {
    return {
      id: row.id,
      templateId: row.template_id,
      companyId: row.company_id,
      componentId: row.component_id,
      componentCode: row.component_code,
      displayLabel: row.display_label,
      sortOrder: Number(row.sort_order ?? 0),
      groupKey: row.group_key,
      isVisible: row.is_visible !== false,
      isIdentityOrTotal: Boolean(row.is_identity_or_total),
      formulaOverrideDefinitionId: row.formula_override_definition_id,
      formulaOverrideJson: row.formula_override_json,
      formulaOverrideCode: row.formula_override_code ?? null,
      formulaOverrideVersion:
        row.formula_override_version != null ? Number(row.formula_override_version) : null,
      archivedAt: row.archived_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private headerSelectSql(alias = 't'): string {
    const p = alias ? `${alias}.` : '';
    return `
      ${p}id, ${p}company_id, ${p}code, ${p}name, ${p}description, ${p}status, ${p}is_default,
      ${p}applicability_scope, ${p}ou_id, ${p}position_key, ${p}employee_id,
      ${p}applicability_province_code,
      ${p}business_line_tag, ${p}policy_pack_id::text AS policy_pack_id,
      ${p}input_pack_profile_id::text AS input_pack_profile_id,
      pol.code AS policy_pack_display_label,
      prof.code AS input_pack_profile_display_label,
      ${p}archived_at::text AS archived_at, ${p}created_by, ${p}updated_by,
      ${p}created_at::text AS created_at, ${p}updated_at::text AS updated_at
    `;
  }

  private headerFromJoin(alias = 't'): string {
    return `
      FROM public.pay_sheet_templates ${alias}
      LEFT JOIN public.pay_policy_pack pol ON pol.id = ${alias}.policy_pack_id AND pol.archived_at IS NULL
      LEFT JOIN public.pay_input_pack_profile prof ON prof.id = ${alias}.input_pack_profile_id AND prof.archived_at IS NULL
    `;
  }

  private async assertCnttPackFks(
    companyId: string,
    policyPackId: string | null | undefined,
    inputPackProfileId: string | null | undefined,
    authorization?: string,
  ): Promise<void> {
    if (!policyPackId && !inputPackProfileId) return;
    if (!this.cnttSetup) {
      throw new ApiException(
        HRM_PAY_SETUP_404_PACK,
        'CNTT setup service unavailable',
        HttpStatus.NOT_FOUND,
      );
    }
    if (policyPackId) {
      await this.cnttSetup.assertPolicyPackFk(policyPackId, companyId, authorization);
    }
    if (inputPackProfileId) {
      await this.cnttSetup.assertInputProfileFk(inputPackProfileId, companyId, authorization);
    }
  }

  private async loadHeaderInScope(
    id: string,
    requestedCompanyId: string,
    authorization?: string,
  ): Promise<PaySheetTemplateRow> {
    const scopeCompanyId = normalizePayrollListCompanyId(authorization, requestedCompanyId);
    const scope = resolveHrmListScope(authorization, scopeCompanyId);
    const filters: string[] = ['t.id = $1::uuid'];
    const values: unknown[] = [id];
    const companyIds = expandPayrollPeriodCompanyIds(scope);
    if (companyIds.length === 1) {
      values.push(companyIds[0]);
      filters.push(`t.company_id = $${values.length}::text`);
    } else {
      values.push(companyIds);
      filters.push(`t.company_id = ANY($${values.length}::text[])`);
    }
    const res = await this.db.query<PaySheetTemplateRow>(
      `
        SELECT ${this.headerSelectSql('t')}
        ${this.headerFromJoin('t')}
        WHERE ${filters.join(' AND ')}
        LIMIT 1;
      `,
      values,
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException(HRM_PAY_TPL_404, 'Pay sheet template not found', HttpStatus.NOT_FOUND);
    }
    assertResourceInHrmScope(row, scope, {
      notFoundCode: HRM_PAY_TPL_404,
      mismatchCode: 'HRM-SCOPE-409',
    });
    return row;
  }

  private async listLinesForTemplate(
    templateId: string,
    companyIds: string[],
    includeArchived = false,
  ): Promise<PaySheetTemplateLineRow[]> {
    const filters: string[] = ['l.template_id = $1::uuid'];
    const values: unknown[] = [templateId];
    if (companyIds.length === 1) {
      values.push(companyIds[0]);
      filters.push(`l.company_id = $${values.length}`);
    } else {
      values.push(companyIds);
      filters.push(`l.company_id = ANY($${values.length}::text[])`);
    }
    if (!includeArchived) {
      filters.push('l.archived_at IS NULL');
    }
    const res = await this.db.query<PaySheetTemplateLineRow>(
      `
        SELECT
          l.id, l.template_id, l.company_id, l.component_id, l.component_code,
          l.display_label, l.sort_order, l.group_key, l.is_visible, l.is_identity_or_total,
          l.formula_override_definition_id, l.formula_override_json,
          l.archived_at::text, l.created_at::text, l.updated_at::text
        FROM public.pay_sheet_template_lines l
        WHERE ${filters.join(' AND ')}
        ORDER BY l.sort_order ASC, l.created_at ASC;
      `,
      values,
    );
    return res.rows;
  }

  async listTemplates(query: ListPaySheetTemplatesQueryDto, authorization?: string) {
    await this.ensureSchema();
    const scopeCompanyId = normalizePayrollListCompanyId(authorization, query.company_id);
    const scope = resolveHrmListScope(authorization, scopeCompanyId);
    const filters: string[] = [];
    const values: unknown[] = [];
    const companyIds = expandPayrollPeriodCompanyIds(scope);
    if (companyIds.length === 1) {
      values.push(companyIds[0]);
      filters.push(`t.company_id = $${values.length}::text`);
    } else {
      values.push(companyIds);
      filters.push(`t.company_id = ANY($${values.length}::text[])`);
    }

    const includeArchived = String(query.include_archived ?? '').toLowerCase() === 'true';
    if (!includeArchived) {
      filters.push('t.archived_at IS NULL');
    }

    const activeOnly = String(query.active_only ?? '').toLowerCase() === 'true';
    if (activeOnly) {
      filters.push(`t.status = 'active'`);
    } else if (query.status) {
      values.push(this.assertStatus(query.status));
      filters.push(`t.status = $${values.length}`);
    }

    if (query.is_default != null) {
      values.push(String(query.is_default).toLowerCase() === 'true');
      filters.push(`t.is_default = $${values.length}`);
    }

    if (query.applicability_scope) {
      values.push(this.assertApplicability(query.applicability_scope));
      filters.push(`t.applicability_scope = $${values.length}`);
    }

    if (query.business_line_tag?.trim()) {
      values.push(query.business_line_tag.trim());
      filters.push(`t.business_line_tag = $${values.length}`);
    }

    if (query.policy_pack_id?.trim()) {
      values.push(query.policy_pack_id.trim());
      filters.push(`t.policy_pack_id = $${values.length}::uuid`);
    }

    if (query.input_pack_profile_id?.trim()) {
      values.push(query.input_pack_profile_id.trim());
      filters.push(`t.input_pack_profile_id = $${values.length}::uuid`);
    }

    if (query.q?.trim()) {
      values.push(`%${query.q.trim().toLowerCase()}%`);
      filters.push(`(lower(t.code) LIKE $${values.length} OR lower(t.name) LIKE $${values.length})`);
    }

    const where = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';
    const res = await this.db.query<PaySheetTemplateRow>(
      `
        SELECT ${this.headerSelectSql('t')}
        ${this.headerFromJoin('t')}
        ${where}
        ORDER BY t.is_default DESC, t.name ASC, t.created_at DESC;
      `,
      values,
    );

    const includeLines = String(query.include_lines ?? '').toLowerCase() === 'true';
    const items = [];
    for (const row of res.rows) {
      const mapped = this.mapHeader(row);
      if (includeLines) {
        const lines = await this.listLinesForTemplate(row.id, expandPayrollPeriodCompanyIds(scope));
        items.push({ ...mapped, lines: lines.map((l) => this.mapLine(l)) });
      } else {
        items.push(mapped);
      }
    }
    return { items };
  }

  async getTemplateById(
    id: string,
    companyId: string,
    authorization?: string,
    opts?: { includeLines?: boolean },
  ) {
    await this.ensureSchema();
    const row = await this.loadHeaderInScope(id, companyId, authorization);
    const mapped = this.mapHeader(row);
    if (opts?.includeLines) {
      const scopeCompanyId = normalizePayrollListCompanyId(authorization, companyId);
      const scope = resolveHrmListScope(authorization, scopeCompanyId);
      const lines = await this.listLinesForTemplate(row.id, expandPayrollPeriodCompanyIds(scope));
      return { ...mapped, lines: lines.map((l) => this.mapLine(l)) };
    }
    return mapped;
  }

  async createTemplate(payload: CreatePaySheetTemplateDto, authorization?: string) {
    await this.ensureSchema();
    const actor = this.resolveActorSub(authorization);
    const persistCompanyId = resolveHrmPersistCompanyIdText(authorization, payload.company_id);
    const code = this.assertCode(payload.code);
    const name = payload.name?.trim();
    if (!name) {
      throw new ApiException('HRM-VAL-400', 'name required', HttpStatus.BAD_REQUEST);
    }
    const status = this.assertStatus(payload.status ?? 'draft');
    const applicability = this.assertApplicability(
      payload.applicabilityScope ?? payload.applicability_scope ?? 'company',
    );
    const ouId = payload.ouId ?? payload.ou_id ?? null;
    const positionKey = payload.positionKey ?? payload.position_key ?? null;
    const employeeId = payload.employeeId ?? payload.employee_id ?? null;
    this.softAssertApplicabilityFields(applicability, { ouId, positionKey, employeeId });
    const isDefault = Boolean(payload.isDefault ?? payload.is_default ?? false);
    const businessLineTag = payload.businessLineTag ?? payload.business_line_tag ?? null;
    const applicabilityProvinceCode =
      (payload.applicabilityProvinceCode ?? payload.applicability_province_code ?? null)?.trim() ||
      null;
    this.assertProvinceScope(applicabilityProvinceCode, businessLineTag);
    const policyPackId = payload.policyPackId ?? payload.policy_pack_id ?? null;
    const inputPackProfileId = payload.inputPackProfileId ?? payload.input_pack_profile_id ?? null;
    await this.assertCnttPackFks(persistCompanyId, policyPackId, inputPackProfileId, authorization);
    await this.assertNoProvinceDuplicate(persistCompanyId, businessLineTag, applicabilityProvinceCode);

    if (isDefault) {
      await this.db.query(
        `UPDATE public.pay_sheet_templates SET is_default = FALSE, updated_at = NOW()
         WHERE company_id = $1 AND archived_at IS NULL;`,
        [persistCompanyId],
      );
    }

    const id = randomUUID();
    try {
      const res = await this.db.query<PaySheetTemplateRow>(
        `
          INSERT INTO public.pay_sheet_templates (
            id, company_id, code, name, description, status, is_default,
            applicability_scope, ou_id, position_key, employee_id,
            applicability_province_code,
            business_line_tag, policy_pack_id, input_pack_profile_id,
            created_by, updated_by
          ) VALUES (
            $1::uuid, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::uuid,
            $12,
            $13, $14::uuid, $15::uuid, $16, $16
          )
          RETURNING id, company_id, code, name, description, status, is_default,
            applicability_scope, ou_id, position_key, employee_id,
            applicability_province_code,
            business_line_tag, policy_pack_id::text, input_pack_profile_id::text,
            archived_at::text, created_by, updated_by, created_at::text, updated_at::text;
        `,
        [
          id,
          persistCompanyId,
          code,
          name,
          payload.description?.trim() ?? null,
          status,
          isDefault,
          applicability,
          ouId,
          positionKey,
          employeeId,
          applicabilityProvinceCode,
          businessLineTag,
          policyPackId,
          inputPackProfileId,
          actor,
        ],
      );
      return this.mapHeader({
        ...res.rows[0],
        policy_pack_display_label: null,
        input_pack_profile_display_label: null,
      } as PaySheetTemplateRow);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (/uq_pay_sheet_templates_company_line_province_active/i.test(msg)) {
        throw new ApiException(
          HRM_PAY_TPL_409_PROVINCE_DUP,
          'Active pay sheet template already exists for (business_line_tag, applicability_province_code)',
          HttpStatus.CONFLICT,
        );
      }
      if (/uq_pay_sheet_templates_company_code_active|unique/i.test(msg)) {
        throw new ApiException(
          HRM_PAY_TPL_409_CODE,
          'Active pay sheet template code already exists for company',
          HttpStatus.CONFLICT,
        );
      }
      throw err;
    }
  }

  async updateTemplate(id: string, payload: UpdatePaySheetTemplateDto, authorization?: string) {
    await this.ensureSchema();
    const actor = this.resolveActorSub(authorization);
    const existing = await this.loadHeaderInScope(id, payload.company_id, authorization);
    if (existing.archived_at) {
      throw new ApiException(
        HRM_PAY_TPL_404,
        'Archived template cannot be patched — restore via separate flow',
        HttpStatus.NOT_FOUND,
      );
    }

    const fields: string[] = [];
    const values: unknown[] = [];
    const set = (column: string, value: unknown) => {
      values.push(value);
      fields.push(`${column} = $${values.length}`);
    };

    if (payload.code != null) set('code', this.assertCode(payload.code));
    if (payload.name != null) {
      const name = payload.name.trim();
      if (!name) throw new ApiException('HRM-VAL-400', 'name required', HttpStatus.BAD_REQUEST);
      set('name', name);
    }
    if (payload.description !== undefined) set('description', payload.description?.trim() ?? null);
    if (payload.status != null) set('status', this.assertStatus(payload.status));

    const applicabilityRaw = payload.applicabilityScope ?? payload.applicability_scope;
    const ouId =
      payload.ouId !== undefined
        ? payload.ouId
        : payload.ou_id !== undefined
          ? payload.ou_id
          : undefined;
    const positionKey =
      payload.positionKey !== undefined
        ? payload.positionKey
        : payload.position_key !== undefined
          ? payload.position_key
          : undefined;
    const employeeId =
      payload.employeeId !== undefined
        ? payload.employeeId
        : payload.employee_id !== undefined
          ? payload.employee_id
          : undefined;

    const nextApplicability = applicabilityRaw
      ? this.assertApplicability(applicabilityRaw)
      : (existing.applicability_scope as PaySheetApplicabilityScope);
    if (applicabilityRaw != null) set('applicability_scope', nextApplicability);
    if (ouId !== undefined) set('ou_id', ouId);
    if (positionKey !== undefined) set('position_key', positionKey);
    if (employeeId !== undefined) set('employee_id', employeeId);

    this.softAssertApplicabilityFields(nextApplicability, {
      ouId: ouId !== undefined ? ouId : existing.ou_id,
      positionKey: positionKey !== undefined ? positionKey : existing.position_key,
      employeeId: employeeId !== undefined ? employeeId : existing.employee_id,
    });

    const businessLineTag =
      payload.businessLineTag !== undefined
        ? payload.businessLineTag
        : payload.business_line_tag !== undefined
          ? payload.business_line_tag
          : undefined;
    const applicabilityProvinceCode =
      payload.applicabilityProvinceCode !== undefined
        ? payload.applicabilityProvinceCode
        : payload.applicability_province_code !== undefined
          ? payload.applicability_province_code
          : undefined;
    const policyPackId =
      payload.policyPackId !== undefined
        ? payload.policyPackId
        : payload.policy_pack_id !== undefined
          ? payload.policy_pack_id
          : undefined;
    const inputPackProfileId =
      payload.inputPackProfileId !== undefined
        ? payload.inputPackProfileId
        : payload.input_pack_profile_id !== undefined
          ? payload.input_pack_profile_id
          : undefined;
    if (policyPackId !== undefined || inputPackProfileId !== undefined) {
      await this.assertCnttPackFks(
        existing.company_id,
        policyPackId ?? existing.policy_pack_id,
        inputPackProfileId ?? existing.input_pack_profile_id,
        authorization,
      );
    }
    if (businessLineTag !== undefined || applicabilityProvinceCode !== undefined) {
      const finalBusinessLineTag =
        businessLineTag !== undefined ? businessLineTag : existing.business_line_tag;
      const finalProvinceCode =
        (applicabilityProvinceCode !== undefined
          ? applicabilityProvinceCode
          : existing.applicability_province_code
        )?.trim() || null;
      this.assertProvinceScope(finalProvinceCode, finalBusinessLineTag);
      await this.assertNoProvinceDuplicate(
        existing.company_id,
        finalBusinessLineTag,
        finalProvinceCode,
        existing.id,
      );
    }
    if (businessLineTag !== undefined) set('business_line_tag', businessLineTag);
    if (applicabilityProvinceCode !== undefined) {
      set('applicability_province_code', applicabilityProvinceCode?.trim() || null);
    }
    if (policyPackId !== undefined) set('policy_pack_id', policyPackId);
    if (inputPackProfileId !== undefined) set('input_pack_profile_id', inputPackProfileId);

    const isDefault = payload.isDefault ?? payload.is_default;
    if (isDefault === true) {
      await this.db.query(
        `UPDATE public.pay_sheet_templates SET is_default = FALSE, updated_at = NOW()
         WHERE company_id = $1 AND archived_at IS NULL AND id <> $2::uuid;`,
        [existing.company_id, id],
      );
      set('is_default', true);
    } else if (isDefault === false) {
      set('is_default', false);
    }

    if (fields.length === 0) {
      return this.mapHeader(existing);
    }
    set('updated_by', actor);
    fields.push('updated_at = NOW()');
    values.push(id);

    try {
      const res = await this.db.query<PaySheetTemplateRow>(
        `
          UPDATE public.pay_sheet_templates
          SET ${fields.join(', ')}
          WHERE id = $${values.length}::uuid
          RETURNING ${this.headerSelectSql()};
        `,
        values,
      );
      return this.mapHeader({
        ...res.rows[0],
        policy_pack_display_label: null,
        input_pack_profile_display_label: null,
      } as PaySheetTemplateRow);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (/uq_pay_sheet_templates_company_line_province_active/i.test(msg)) {
        throw new ApiException(
          HRM_PAY_TPL_409_PROVINCE_DUP,
          'Active pay sheet template already exists for (business_line_tag, applicability_province_code)',
          HttpStatus.CONFLICT,
        );
      }
      if (/uq_pay_sheet_templates_company_code_active|unique/i.test(msg)) {
        throw new ApiException(
          HRM_PAY_TPL_409_CODE,
          'Active pay sheet template code already exists for company',
          HttpStatus.CONFLICT,
        );
      }
      throw err;
    }
  }

  async getLines(templateId: string, companyId: string, authorization?: string) {
    await this.ensureSchema();
    const header = await this.loadHeaderInScope(templateId, companyId, authorization);
    const scopeCompanyId = normalizePayrollListCompanyId(authorization, companyId);
    const scope = resolveHrmListScope(authorization, scopeCompanyId);
    const lines = await this.listLinesForTemplate(header.id, expandPayrollPeriodCompanyIds(scope));
    return { templateId: header.id, lines: lines.map((l) => this.mapLine(l)) };
  }

  /** S-PAY-CNS-01 — Nest SC membership when effective active >0 (HRM-SC-COMP-KEY). */
  private async assertComponentInCompany(
    componentId: string,
    companyId: string,
    authorization?: string,
  ): Promise<{ id: string; code: string }> {
    const hit = await assertComponentIdInEffectiveCatalog({
      query: this.db.query.bind(this.db),
      companyId,
      componentId,
      authorization,
    });
    return { id: hit.id, code: hit.code };
  }

  /** Soft assert OV-C definition under same company/rollup — draft OK on save (process gate later). */
  private async assertFormulaDefinitionInScope(
    definitionId: string,
    companyIds: string[],
  ): Promise<void> {
    try {
      const filters: string[] = ['id = $1::uuid', 'archived_at IS NULL'];
      const values: unknown[] = [definitionId];
      if (companyIds.length === 1) {
        values.push(companyIds[0]);
        filters.push(`company_id = $${values.length}`);
      } else {
        values.push(companyIds);
        filters.push(`company_id = ANY($${values.length}::text[])`);
      }
      const res = await this.db.query<{ id: string }>(
        `
          SELECT id
          FROM public.pay_formula_definitions
          WHERE ${filters.join(' AND ')}
          LIMIT 1;
        `,
        values,
      );
      if (!res.rows[0]) {
        throw new ApiException(
          'HRM-SCOPE-409',
          'formula_override_definition_id out of company/rollup scope',
          HttpStatus.NOT_FOUND,
        );
      }
    } catch (err: unknown) {
      if (err instanceof ApiException) throw err;
      const msg = err instanceof Error ? err.message : String(err);
      if (/relation .*pay_formula_definitions.* does not exist/i.test(msg)) {
        throw new ApiException(
          'HRM-SCOPE-409',
          'pay_formula_definitions unavailable — publish formula wave first',
          HttpStatus.NOT_FOUND,
        );
      }
      throw err;
    }
  }

  async replaceLines(
    templateId: string,
    payload: PutPaySheetTemplateLinesDto,
    authorization?: string,
  ) {
    await this.ensureSchema();
    const header = await this.loadHeaderInScope(templateId, payload.company_id, authorization);
    if (header.archived_at) {
      throw new ApiException(HRM_PAY_TPL_404, 'Cannot mutate lines on archived template', HttpStatus.NOT_FOUND);
    }
    const scopeCompanyId = normalizePayrollListCompanyId(authorization, payload.company_id);
    const scope = resolveHrmListScope(authorization, scopeCompanyId);
    const companyIds = expandPayrollPeriodCompanyIds(scope);
    const lines = payload.lines ?? [];

    const seen = new Set<string>();
    for (const line of lines) {
      const cid = String(line.componentId ?? '').trim().toLowerCase();
      if (seen.has(cid)) {
        throw new ApiException(
          HRM_PAY_TPL_409_LINE,
          'Duplicate component_id in pay sheet template lines',
          HttpStatus.CONFLICT,
        );
      }
      seen.add(cid);
    }

    const resolved: Array<{
      input: PaySheetTemplateLineInputDto;
      componentCode: string;
    }> = [];
    for (const line of lines) {
      const component = await this.assertComponentInCompany(
        line.componentId,
        payload.company_id,
        authorization,
      );
      if (line.formulaOverrideDefinitionId) {
        await this.assertFormulaDefinitionInScope(line.formulaOverrideDefinitionId, companyIds);
      }
      resolved.push({ input: line, componentCode: component.code });
    }

    const keepComponentIds = resolved.map((r) => r.input.componentId);
    if (keepComponentIds.length === 0) {
      await this.db.query(
        `
          UPDATE public.pay_sheet_template_lines
          SET archived_at = NOW(), updated_at = NOW()
          WHERE template_id = $1::uuid AND archived_at IS NULL;
        `,
        [templateId],
      );
    } else {
      await this.db.query(
        `
          UPDATE public.pay_sheet_template_lines
          SET archived_at = NOW(), updated_at = NOW()
          WHERE template_id = $1::uuid
            AND archived_at IS NULL
            AND NOT (component_id = ANY($2::uuid[]));
        `,
        [templateId, keepComponentIds],
      );
    }

    for (const item of resolved) {
      const line = item.input;
      const existingRes = await this.db.query<{ id: string }>(
        `
          SELECT id FROM public.pay_sheet_template_lines
          WHERE template_id = $1::uuid AND component_id = $2::uuid
          ORDER BY archived_at NULLS FIRST, updated_at DESC
          LIMIT 1;
        `,
        [templateId, line.componentId],
      );
      const existingId = existingRes.rows[0]?.id;
      const overrideJson =
        line.formulaOverrideJson == null ? null : JSON.stringify(line.formulaOverrideJson);
      if (existingId) {
        await this.db.query(
          `
            UPDATE public.pay_sheet_template_lines
            SET
              component_code = $2,
              display_label = $3,
              sort_order = $4,
              group_key = $5,
              is_visible = $6,
              is_identity_or_total = $7,
              formula_override_definition_id = $8::uuid,
              formula_override_json = $9::jsonb,
              archived_at = NULL,
              updated_at = NOW()
            WHERE id = $1::uuid;
          `,
          [
            existingId,
            item.componentCode,
            line.displayLabel?.trim() || null,
            line.sortOrder,
            line.groupKey?.trim() || null,
            line.isVisible !== false,
            Boolean(line.isIdentityOrTotal),
            line.formulaOverrideDefinitionId ?? null,
            overrideJson,
          ],
        );
      } else {
        await this.db.query(
          `
            INSERT INTO public.pay_sheet_template_lines (
              id, template_id, company_id, component_id, component_code,
              display_label, sort_order, group_key, is_visible, is_identity_or_total,
              formula_override_definition_id, formula_override_json
            ) VALUES (
              $1::uuid, $2::uuid, $3, $4::uuid, $5,
              $6, $7, $8, $9, $10,
              $11::uuid, $12::jsonb
            );
          `,
          [
            randomUUID(),
            templateId,
            header.company_id,
            line.componentId,
            item.componentCode,
            line.displayLabel?.trim() || null,
            line.sortOrder,
            line.groupKey?.trim() || null,
            line.isVisible !== false,
            Boolean(line.isIdentityOrTotal),
            line.formulaOverrideDefinitionId ?? null,
            overrideJson,
          ],
        );
      }
    }

    return this.getLines(templateId, payload.company_id, authorization);
  }

  async archiveTemplate(id: string, companyId: string, authorization?: string) {
    await this.ensureSchema();
    const existing = await this.loadHeaderInScope(id, companyId, authorization);
    if (existing.archived_at) {
      return this.mapHeader(existing);
    }
    const actor = this.resolveActorSub(authorization);
    const res = await this.db.query<PaySheetTemplateRow>(
      `
        UPDATE public.pay_sheet_templates
        SET archived_at = NOW(), status = 'retired', updated_by = $2, updated_at = NOW()
        WHERE id = $1::uuid
        RETURNING ${this.headerSelectSql()};
      `,
      [id, actor],
    );
    return this.mapHeader(res.rows[0]);
  }

  async archiveLine(templateId: string, lineId: string, companyId: string, authorization?: string) {
    await this.ensureSchema();
    await this.loadHeaderInScope(templateId, companyId, authorization);
    const scopeCompanyId = normalizePayrollListCompanyId(authorization, companyId);
    const scope = resolveHrmListScope(authorization, scopeCompanyId);
    const filters: string[] = ['id = $1::uuid', 'template_id = $2::uuid'];
    const values: unknown[] = [lineId, templateId];
    pushCompanyIdFilter(filters, values, expandPayrollPeriodCompanyIds(scope));
    const res = await this.db.query<PaySheetTemplateLineRow>(
      `
        UPDATE public.pay_sheet_template_lines
        SET archived_at = NOW(), updated_at = NOW()
        WHERE ${filters.join(' AND ')} AND archived_at IS NULL
        RETURNING
          id, template_id, company_id, component_id, component_code,
          display_label, sort_order, group_key, is_visible, is_identity_or_total,
          formula_override_definition_id, formula_override_json,
          archived_at::text, created_at::text, updated_at::text;
      `,
      values,
    );
    if (!res.rows[0]) {
      throw new ApiException(HRM_PAY_TPL_404, 'Pay sheet template line not found', HttpStatus.NOT_FOUND);
    }
    return this.mapLine(res.rows[0]);
  }

  async buildSnapshotColumns(
    templateId: string,
    companyId: string,
    authorization?: string,
  ): Promise<SheetTemplateSnapshotColumn[]> {
    const header = await this.loadHeaderInScope(templateId, companyId, authorization);
    const scopeCompanyId = normalizePayrollListCompanyId(authorization, companyId);
    const scope = resolveHrmListScope(authorization, scopeCompanyId);
    const lines = await this.listLinesForTemplate(header.id, expandPayrollPeriodCompanyIds(scope));
    return lines.map((l) => ({
      component_code: l.component_code,
      display_label: l.display_label,
      sort_order: Number(l.sort_order ?? 0),
      formula_definition_id: l.formula_override_definition_id,
      override_applied: Boolean(l.formula_override_definition_id),
    }));
  }

  /**
   * Bind active mẫu → period.pay_sheet_template_id + immutable snapshot.
   * FORBIDDEN: use salary_templates id as mẫu.
   */
  async bindToPeriod(
    periodId: string,
    payload: BindPaySheetTemplateDto,
    authorization?: string,
  ) {
    await this.ensureSchema();
    const scopeCompanyId = normalizePayrollListCompanyId(authorization, payload.company_id);
    const scope = resolveHrmListScope(authorization, scopeCompanyId);
    const filters: string[] = ['id = $1::uuid'];
    const values: unknown[] = [periodId];
    pushCompanyIdFilter(filters, values, expandPayrollPeriodCompanyIds(scope));
    const periodRes = await this.db.query<{
      id: string;
      company_id: string;
      status: string;
      processed_at: string | null;
      pay_sheet_template_id: string | null;
    }>(
      `
        SELECT id, company_id, status, processed_at::text, pay_sheet_template_id::text
        FROM public.payroll_periods
        WHERE ${filters.join(' AND ')}
        LIMIT 1;
      `,
      values,
    );
    const period = periodRes.rows[0];
    if (!period) {
      throw new ApiException('HRM-PAY-404', 'Payroll period not found', HttpStatus.NOT_FOUND);
    }
    assertResourceInHrmScope(period, scope, {
      notFoundCode: 'HRM-PAY-404',
      mismatchCode: 'HRM-PAY-409',
    });
    if (period.status !== 'draft' || period.processed_at) {
      throw new ApiException(
        HRM_PAY_TPL_409_IMMUTABLE,
        'Cannot hot-swap pay sheet template after process start',
        HttpStatus.CONFLICT,
      );
    }

    const template = await this.loadHeaderInScope(
      payload.paySheetTemplateId,
      payload.company_id,
      authorization,
    );
    if (template.archived_at || template.status !== 'active') {
      throw new ApiException(
        HRM_PAY_TPL_412_TEMPLATE,
        'Pay sheet template must be active and not archived',
        HttpStatus.PRECONDITION_FAILED,
      );
    }

    const columns = await this.buildSnapshotColumns(
      template.id,
      payload.company_id,
      authorization,
    );
    let setupContext: Record<string, unknown> = {};
    if (this.cnttSetup) {
      const ctx = await this.cnttSetup.buildSetupContextForTemplate(
        template.policy_pack_id,
        template.input_pack_profile_id,
        payload.company_id,
        authorization,
      );
      if (Object.keys(ctx).length > 0) {
        setupContext = ctx;
      }
    }
    const snapshot = {
      template_id: template.id,
      template_code: template.code,
      template_name: template.name,
      // PO-HRM-PAY-TPL-RESOLVE-PROCESS-GUARD-BE-01 — mirror applicability_province_code tại bind-time
      // (spec §4.2 "MISSING — spec này yêu cầu") để PROCESS province guard đối chiếu KHÔNG cần re-query
      // template sống (giữ đúng nguyên tắc immutable snapshot AC-PAY-TPL-05 — đổi tỉnh trên template sau
      // khi bind không ảnh hưởng dòng kỳ đã bind/đã chạy).
      applicabilityProvinceCode: template.applicability_province_code ?? null,
      columns,
      bound_at: new Date().toISOString(),
      ...(Object.keys(setupContext).length > 0 ? { setupContext } : {}),
    };

    const updated = await this.db.query(
      `
        UPDATE public.payroll_periods
        SET
          pay_sheet_template_id = $2::uuid,
          sheet_template_snapshot_json = $3::jsonb,
          updated_at = NOW()
        WHERE id = $1::uuid
        RETURNING
          id, company_id, period_label, start_date::text, end_date::text, status,
          pay_sheet_template_id::text, sheet_template_snapshot_json,
          processed_at::text, closed_at::text, created_at::text, updated_at::text;
      `,
      [periodId, template.id, JSON.stringify(snapshot)],
    );
    return updated.rows[0];
  }

  /**
   * PO-HRM-PAY-SHEET-TEMPLATE-SPEC-01 §3 — resolveForEmployee(employee, period_context).
   * Ranking: employee(1) > position(2) > province(3, business_line_tag+applicability_province_code)
   *   > ou(4) > company(5). Tie-break mọi tier: is_default=true trước, rồi updated_at DESC.
   * CHỈ resolve — KHÔNG mutate, KHÔNG tự bind. Caller (bind kỳ / mỗi dòng process — Task khác,
   * dependency mở) quyết định hành động dựa trên matchStatus/errorCode trả về.
   */
  async resolveForEmployee(
    employee: ResolveForEmployeeInput,
    periodContext: ResolveForEmployeePeriodContext,
    authorization?: string,
  ): Promise<PaySheetTemplateResolveResult> {
    await this.ensureSchema();
    const scopeCompanyId = normalizePayrollListCompanyId(authorization, periodContext.companyId);
    const scope = resolveHrmListScope(authorization, scopeCompanyId);
    const companyIds = expandPayrollPeriodCompanyIds(scope);

    const filters: string[] = ["t.status = 'active'", 't.archived_at IS NULL'];
    const values: unknown[] = [];
    if (companyIds.length === 1) {
      values.push(companyIds[0]);
      filters.push(`t.company_id = $${values.length}::text`);
    } else {
      values.push(companyIds);
      filters.push(`t.company_id = ANY($${values.length}::text[])`);
    }
    const businessLineTag = periodContext.businessLineTag?.trim() || null;
    if (businessLineTag) {
      values.push(businessLineTag);
      filters.push(`t.business_line_tag = $${values.length}`);
    }

    const res = await this.db.query<PaySheetTemplateRow>(
      `
        SELECT ${this.headerSelectSql('t')}
        ${this.headerFromJoin('t')}
        WHERE ${filters.join(' AND ')}
        ORDER BY t.is_default DESC, t.updated_at DESC;
      `,
      values,
    );
    const candidates = res.rows.map((row) =>
      this.mapHeader({
        ...row,
        policy_pack_display_label: null,
        input_pack_profile_display_label: null,
      } as PaySheetTemplateRow),
    );

    const provinceCode = employee.provinceCode?.trim() || null;
    const ouId = employee.ouId?.trim() || null;
    const positionKey = employee.positionKey?.trim() || null;

    const tiered: Array<{ row: PaySheetTemplateHeaderView; tier: number }> = [];
    let hasProvinceCandidate = false;
    for (const row of candidates) {
      if (row.applicabilityScope === 'province' && businessLineTag && row.businessLineTag === businessLineTag) {
        hasProvinceCandidate = true;
      }
      let tier: number | null = null;
      if (row.applicabilityScope === 'employee' && row.employeeId && row.employeeId === employee.id) {
        tier = 1;
      } else if (
        row.applicabilityScope === 'position' &&
        row.positionKey &&
        positionKey &&
        row.positionKey === positionKey
      ) {
        tier = 2;
      } else if (
        row.applicabilityScope === 'province' &&
        businessLineTag &&
        row.businessLineTag === businessLineTag &&
        provinceCode &&
        row.applicabilityProvinceCode === provinceCode
      ) {
        tier = 3;
      } else if (row.applicabilityScope === 'ou' && row.ouId && ouId && row.ouId === ouId) {
        tier = 4;
      } else if (row.applicabilityScope === 'company') {
        tier = 5;
      }
      if (tier != null) tiered.push({ row, tier });
    }

    // Ranking rỗng — không 1 template nào khớp employee/period (kể cả company default).
    if (tiered.length === 0) {
      return {
        candidates,
        recommended: null,
        matchStatus: 'NO_CANDIDATE',
        warnings: [],
        errorCode: HRM_PAY_TPL_404,
      };
    }

    const minTier = Math.min(...tiered.map((t) => t.tier));
    const top = tiered.filter((t) => t.tier === minTier);

    const warnings: string[] = [];
    // BR-TPL-RESOLVE-01 — tier 3 bị bỏ qua (employee.provinceCode null hoặc không khớp catalog) → cảnh báo, không silent.
    if (hasProvinceCandidate && minTier > 3) {
      warnings.push(HRM_PAY_TPL_412_NO_PROVINCE_MATCH);
    }

    if (top.length > 1) {
      // Tie-break mọi tier: is_default=true trước, rồi updated_at DESC.
      const sorted = [...top].sort((a, b) => {
        if (a.row.isDefault !== b.row.isDefault) return a.row.isDefault ? -1 : 1;
        return new Date(b.row.updatedAt).getTime() - new Date(a.row.updatedAt).getTime();
      });
      const [first, second] = sorted;
      const stillTied =
        first.row.isDefault === second.row.isDefault &&
        new Date(first.row.updatedAt).getTime() === new Date(second.row.updatedAt).getTime();
      // BR-TPL-RESOLVE-02 — ≥2 template cùng tier cao nhất VÀ cùng tie-break → AMBIGUOUS, không tự chọn 1.
      if (stillTied) {
        return {
          candidates,
          recommended: null,
          matchStatus: 'AMBIGUOUS',
          warnings,
          errorCode: HRM_PAY_TPL_409_PROVINCE_DUP,
          tiedTemplateIds: sorted.map((t) => t.row.id),
        };
      }
      return {
        candidates,
        recommended: first.row,
        matchStatus: warnings.length > 0 ? 'NO_PROVINCE_MATCH' : 'MATCHED',
        warnings,
      };
    }

    return {
      candidates,
      recommended: top[0].row,
      matchStatus: warnings.length > 0 ? 'NO_PROVINCE_MATCH' : 'MATCHED',
      warnings,
    };
  }
}
