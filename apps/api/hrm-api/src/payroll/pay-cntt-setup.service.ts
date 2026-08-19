/**
 * @CODE-MEMORY
 * Screen:     HRM → Lương → Thiết lập CNTT `/api/hrm/payroll/pay-policy-packs` · `pay-input-pack-profiles` · `pay-setup/resolve`
 * UC:         UC-BP-PAY-STP-01..12 · AC-CNTT-SETUP-01..04
 * SRS:        docs/program/specs/PO-HRM-PAY-CNTT-API-01.md
 * TechSpec:   docs/hrm/DB_DESIGN_HRM_PAYROLL.md §8 CNTT APPEND
 * API_DESIGN: F-PAY-POLICY-PACK-* · F-PAY-INPUT-PROFILE-* · F-PAY-SETUP-RESOLVE-01
 * Purpose:    ensureSchema policy pack + input profile; CRUD; read-only setup resolve helper.
 * WorkItem:   PO-HRM-PAY-CNTT-BE-01
 * Coded:      2026-08-11
 * Callers:    PayrollController
 * Callees:    HrmDbService · resolveHrmListScope · salary_components assert on profile active
 * BE-Chain:   ensureSchema → LIST/GET scope_parity → UPSERT → archive soft-delete
 * Impact:     Sai scope → lộ gói chính sách pháp nhân khác; profile sai → input-lines 422
 * must_keep:  open catalog · soft-delete · payroll_e2e_ready=false · formula eval HOLD · U65
 * SOLID:      Tách L4/L5 khỏi pay-sheet-template; helpers shared cho snapshot + validation
 * LastVerified: pay-cntt-setup.service.spec.ts
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
  CreatePayInputPackProfileDto,
  CreatePayPolicyPackDto,
  ListPayInputPackProfilesQueryDto,
  ListPayPolicyPacksQueryDto,
  ResolvePaySetupQueryDto,
  UpdatePayInputPackProfileDto,
  UpdatePayPolicyPackDto,
} from './dto/pay-cntt-setup.dto';
import {
  HRM_PAY_INP_PROF_409_CODE,
  HRM_PAY_POL_400_DATE,
  HRM_PAY_POL_409_CODE,
  HRM_PAY_SETUP_404_PACK,
  PAY_CNTT_CODE_FORMAT,
  PAY_INPUT_PROFILE_STATUSES,
  PAY_POLICY_PACK_SCOPES,
  PAY_POLICY_PACK_STATUSES,
  type PayInputProfileStatus,
  type PayPolicyPackScope,
  type PayPolicyPackStatus,
} from './pay-cntt-setup.constants';
import {
  assertPolicyDocRefsShape,
  assertRateParamsShape,
  buildSetupContextFromPackRows,
} from './pay-cntt-setup.helpers';
import { assertComponentCodeInEffectiveCatalog } from './salary-component-consumer-assert';

type PolicyPackRow = {
  id: string;
  company_id: string;
  code: string;
  name_vi: string;
  status: string;
  scope: string;
  business_line_tag: string | null;
  effective_from: string;
  effective_to: string | null;
  policy_doc_refs_json: unknown;
  rate_params_json: unknown;
  archived_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

type InputProfileRow = {
  id: string;
  company_id: string;
  code: string;
  name_vi: string;
  status: string;
  allowed_source_kinds_json: unknown;
  required_component_codes_json: unknown;
  column_hints_json: unknown;
  archived_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

type TemplateResolveRow = {
  id: string;
  company_id: string;
  code: string;
  name: string;
  status: string;
  is_default: boolean;
  applicability_scope: string;
  ou_id: string | null;
  position_key: string | null;
  employee_id: string | null;
  business_line_tag: string | null;
  policy_pack_id: string | null;
  input_pack_profile_id: string | null;
  updated_at: string;
};

/** Public for pay-sheet-template ensureSchema ordering. */
export async function ensurePayCnttSetupSchema(db: HrmDbService): Promise<void> {
  await db.query(`
    CREATE TABLE IF NOT EXISTS public.pay_policy_pack (
      id UUID PRIMARY KEY,
      company_id TEXT NOT NULL,
      code TEXT NOT NULL,
      name_vi TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      scope TEXT NOT NULL DEFAULT 'RIENG',
      business_line_tag TEXT NULL,
      effective_from DATE NOT NULL,
      effective_to DATE NULL,
      policy_doc_refs_json JSONB NULL,
      rate_params_json JSONB NULL,
      archived_at TIMESTAMPTZ NULL,
      created_by TEXT NULL,
      updated_by TEXT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await db.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_pay_policy_pack_scope') THEN
        ALTER TABLE public.pay_policy_pack
          ADD CONSTRAINT chk_pay_policy_pack_scope CHECK (scope IN ('CHUNG', 'RIENG'));
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_pay_policy_pack_status') THEN
        ALTER TABLE public.pay_policy_pack
          ADD CONSTRAINT chk_pay_policy_pack_status CHECK (status IN ('draft', 'active', 'retired'));
      END IF;
    END $$;
  `);
  await db.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS uq_pay_policy_pack_company_code_active
    ON public.pay_policy_pack (company_id, lower(code))
    WHERE archived_at IS NULL;
  `);
  await db.query(`
    CREATE INDEX IF NOT EXISTS ix_pay_policy_pack_company_status
    ON public.pay_policy_pack (company_id, status) WHERE archived_at IS NULL;
  `);
  await db.query(`
    CREATE INDEX IF NOT EXISTS ix_pay_policy_pack_company_business_line
    ON public.pay_policy_pack (company_id, business_line_tag) WHERE archived_at IS NULL;
  `);
  await db.query(`
    CREATE INDEX IF NOT EXISTS ix_pay_policy_pack_company_effective_from
    ON public.pay_policy_pack (company_id, effective_from DESC) WHERE archived_at IS NULL;
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS public.pay_input_pack_profile (
      id UUID PRIMARY KEY,
      company_id TEXT NOT NULL,
      code TEXT NOT NULL,
      name_vi TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      allowed_source_kinds_json JSONB NOT NULL DEFAULT '[]'::jsonb,
      required_component_codes_json JSONB NULL,
      column_hints_json JSONB NULL,
      archived_at TIMESTAMPTZ NULL,
      created_by TEXT NULL,
      updated_by TEXT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await db.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_pay_input_pack_profile_status') THEN
        ALTER TABLE public.pay_input_pack_profile
          ADD CONSTRAINT chk_pay_input_pack_profile_status CHECK (status IN ('draft', 'active', 'retired'));
      END IF;
    END $$;
  `);
  await db.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS uq_pay_input_pack_profile_company_code_active
    ON public.pay_input_pack_profile (company_id, lower(code))
    WHERE archived_at IS NULL;
  `);
  await db.query(`
    CREATE INDEX IF NOT EXISTS ix_pay_input_pack_profile_company_status
    ON public.pay_input_pack_profile (company_id, status) WHERE archived_at IS NULL;
  `);

  await db.query(`
    ALTER TABLE public.pay_sheet_templates
      ADD COLUMN IF NOT EXISTS business_line_tag TEXT NULL,
      ADD COLUMN IF NOT EXISTS policy_pack_id UUID NULL,
      ADD COLUMN IF NOT EXISTS input_pack_profile_id UUID NULL;
  `);
  await db.query(`
    CREATE INDEX IF NOT EXISTS ix_pay_sheet_templates_company_business_line
    ON public.pay_sheet_templates (company_id, business_line_tag) WHERE archived_at IS NULL;
  `);
  await db.query(`
    CREATE INDEX IF NOT EXISTS ix_pay_sheet_templates_policy_pack
    ON public.pay_sheet_templates (policy_pack_id) WHERE policy_pack_id IS NOT NULL;
  `);
  await db.query(`
    CREATE INDEX IF NOT EXISTS ix_pay_sheet_templates_input_pack_profile
    ON public.pay_sheet_templates (input_pack_profile_id) WHERE input_pack_profile_id IS NOT NULL;
  `);
}

@Injectable()
export class PayCnttSetupService {
  constructor(private readonly db: HrmDbService) {}

  async ensureSchema(): Promise<void> {
    await ensurePayCnttSetupSchema(this.db);
  }

  private resolveActorSub(authorization?: string): string | null {
    try {
      const payload = getVerifiedInternalJwtPayload(authorization);
      const sub = payload?.sub;
      return typeof sub === 'string' ? sub : null;
    } catch {
      return null;
    }
  }

  private assertCode(code: string): string {
    const normalized = code.trim().toLowerCase();
    if (!PAY_CNTT_CODE_FORMAT.test(normalized)) {
      throw new ApiException('HRM-VAL-400', 'code format invalid (open slug)', HttpStatus.BAD_REQUEST);
    }
    return normalized;
  }

  private assertPolicyStatus(status: string): PayPolicyPackStatus {
    const s = status.trim().toLowerCase() as PayPolicyPackStatus;
    if (!(PAY_POLICY_PACK_STATUSES as readonly string[]).includes(s)) {
      throw new ApiException('HRM-VAL-400', 'Invalid policy pack status', HttpStatus.BAD_REQUEST);
    }
    return s;
  }

  private assertProfileStatus(status: string): PayInputProfileStatus {
    const s = status.trim().toLowerCase() as PayInputProfileStatus;
    if (!(PAY_INPUT_PROFILE_STATUSES as readonly string[]).includes(s)) {
      throw new ApiException('HRM-VAL-400', 'Invalid input profile status', HttpStatus.BAD_REQUEST);
    }
    return s;
  }

  private assertScope(scope: string): PayPolicyPackScope {
    const s = scope.trim().toUpperCase() as PayPolicyPackScope;
    if (!(PAY_POLICY_PACK_SCOPES as readonly string[]).includes(s)) {
      throw new ApiException('HRM-VAL-400', 'scope must be CHUNG or RIENG', HttpStatus.BAD_REQUEST);
    }
    return s;
  }

  private policySelectSql(alias = ''): string {
    const p = alias ? `${alias}.` : '';
    return `
      ${p}id::text AS id, ${p}company_id, ${p}code, ${p}name_vi,
      ${p}status, ${p}scope, ${p}business_line_tag,
      ${p}effective_from::text AS effective_from, ${p}effective_to::text AS effective_to,
      ${p}policy_doc_refs_json, ${p}rate_params_json,
      ${p}archived_at::text AS archived_at,
      ${p}created_by, ${p}updated_by,
      ${p}created_at::text AS created_at, ${p}updated_at::text AS updated_at
    `;
  }

  private profileSelectSql(alias = ''): string {
    const p = alias ? `${alias}.` : '';
    return `
      ${p}id::text AS id, ${p}company_id, ${p}code, ${p}name_vi, ${p}status,
      ${p}allowed_source_kinds_json, ${p}required_component_codes_json, ${p}column_hints_json,
      ${p}archived_at::text AS archived_at,
      ${p}created_by, ${p}updated_by,
      ${p}created_at::text AS created_at, ${p}updated_at::text AS updated_at
    `;
  }

  private mapPolicyPack(row: PolicyPackRow, usageCount?: number) {
    return {
      id: row.id,
      companyId: row.company_id,
      code: row.code,
      nameVi: row.name_vi,
      status: row.status,
      scope: row.scope,
      businessLineTag: row.business_line_tag,
      effectiveFrom: row.effective_from,
      effectiveTo: row.effective_to,
      policyDocRefs: row.policy_doc_refs_json ?? [],
      rateParams: row.rate_params_json ?? {},
      archivedAt: row.archived_at,
      createdBy: row.created_by,
      updatedBy: row.updated_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      ...(usageCount != null ? { usageCount } : {}),
    };
  }

  private mapInputProfile(row: InputProfileRow) {
    const allowed = Array.isArray(row.allowed_source_kinds_json)
      ? row.allowed_source_kinds_json
      : [];
    const required = Array.isArray(row.required_component_codes_json)
      ? row.required_component_codes_json
      : [];
    return {
      id: row.id,
      companyId: row.company_id,
      code: row.code,
      nameVi: row.name_vi,
      status: row.status,
      allowedSourceKinds: allowed,
      requiredComponentCodes: required,
      columnHints: row.column_hints_json ?? {},
      archivedAt: row.archived_at,
      createdBy: row.created_by,
      updatedBy: row.updated_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private async loadPolicyInScope(
    id: string,
    requestedCompanyId: string,
    authorization?: string,
  ): Promise<PolicyPackRow> {
    const scopeCompanyId = normalizePayrollListCompanyId(authorization, requestedCompanyId);
    const scope = resolveHrmListScope(authorization, scopeCompanyId);
    const filters: string[] = ['id = $1::uuid'];
    const values: unknown[] = [id];
    pushCompanyIdFilter(filters, values, expandPayrollPeriodCompanyIds(scope));
    const res = await this.db.query<PolicyPackRow>(
      `SELECT ${this.policySelectSql()} FROM public.pay_policy_pack WHERE ${filters.join(' AND ')} LIMIT 1;`,
      values,
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException('HRM-PAY-POL-404', 'Policy pack not found', HttpStatus.NOT_FOUND);
    }
    assertResourceInHrmScope(row, scope, {
      notFoundCode: 'HRM-PAY-POL-404',
      mismatchCode: 'HRM-SCOPE-409',
    });
    return row;
  }

  private async loadProfileInScope(
    id: string,
    requestedCompanyId: string,
    authorization?: string,
  ): Promise<InputProfileRow> {
    const scopeCompanyId = normalizePayrollListCompanyId(authorization, requestedCompanyId);
    const scope = resolveHrmListScope(authorization, scopeCompanyId);
    const filters: string[] = ['id = $1::uuid'];
    const values: unknown[] = [id];
    pushCompanyIdFilter(filters, values, expandPayrollPeriodCompanyIds(scope));
    const res = await this.db.query<InputProfileRow>(
      `SELECT ${this.profileSelectSql()} FROM public.pay_input_pack_profile WHERE ${filters.join(' AND ')} LIMIT 1;`,
      values,
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException('HRM-PAY-INP-PROF-404', 'Input pack profile not found', HttpStatus.NOT_FOUND);
    }
    assertResourceInHrmScope(row, scope, {
      notFoundCode: 'HRM-PAY-INP-PROF-404',
      mismatchCode: 'HRM-SCOPE-409',
    });
    return row;
  }

  /** Assert FK pack/profile for template bind — exported for PaySheetTemplateService. */
  async assertPolicyPackFk(
    packId: string,
    companyId: string,
    authorization?: string,
  ): Promise<PolicyPackRow> {
    await this.ensureSchema();
    const row = await this.loadPolicyInScope(packId, companyId, authorization);
    if (row.archived_at) {
      throw new ApiException(
        HRM_PAY_SETUP_404_PACK,
        'Policy pack archived — cannot bind',
        HttpStatus.NOT_FOUND,
      );
    }
    return row;
  }

  async assertInputProfileFk(
    profileId: string,
    companyId: string,
    authorization?: string,
  ): Promise<InputProfileRow> {
    await this.ensureSchema();
    const row = await this.loadProfileInScope(profileId, companyId, authorization);
    if (row.archived_at) {
      throw new ApiException(
        HRM_PAY_SETUP_404_PACK,
        'Input pack profile archived — cannot bind',
        HttpStatus.NOT_FOUND,
      );
    }
    return row;
  }

  async buildSetupContextForTemplate(
    policyPackId: string | null | undefined,
    inputPackProfileId: string | null | undefined,
    companyId: string,
    authorization?: string,
  ) {
    let policy: PolicyPackRow | null = null;
    let profile: InputProfileRow | null = null;
    if (policyPackId) {
      policy = await this.assertPolicyPackFk(policyPackId, companyId, authorization);
    }
    if (inputPackProfileId) {
      profile = await this.assertInputProfileFk(inputPackProfileId, companyId, authorization);
    }
    return buildSetupContextFromPackRows(policy, profile);
  }

  private async assertRequiredComponentsOnActive(
    companyId: string,
    codes: string[],
    authorization?: string,
  ): Promise<void> {
    for (const code of codes) {
      await assertComponentCodeInEffectiveCatalog({
        query: this.db.query.bind(this.db),
        companyId,
        componentCode: code,
        authorization,
      });
    }
  }

  // --- Policy pack CRUD ---

  async listPolicyPacks(query: ListPayPolicyPacksQueryDto, authorization?: string) {
    await this.ensureSchema();
    const scopeCompanyId = normalizePayrollListCompanyId(authorization, query.company_id);
    const scope = resolveHrmListScope(authorization, scopeCompanyId);
    const filters: string[] = [];
    const values: unknown[] = [];
    pushCompanyIdFilter(filters, values, expandPayrollPeriodCompanyIds(scope));

    if (String(query.include_archived ?? '').toLowerCase() !== 'true') {
      filters.push('archived_at IS NULL');
    }
    if (query.status) {
      values.push(this.assertPolicyStatus(query.status));
      filters.push(`status = $${values.length}`);
    }
    if (query.scope) {
      values.push(this.assertScope(query.scope));
      filters.push(`scope = $${values.length}`);
    }
    if (query.business_line_tag?.trim()) {
      values.push(query.business_line_tag.trim());
      filters.push(`business_line_tag = $${values.length}`);
    }
    if (query.effective_on) {
      values.push(query.effective_on);
      filters.push(`effective_from <= $${values.length}::date`);
      filters.push(`(effective_to IS NULL OR effective_to >= $${values.length}::date)`);
    }
    if (query.q?.trim()) {
      values.push(`%${query.q.trim().toLowerCase()}%`);
      filters.push(`(lower(code) LIKE $${values.length} OR lower(name_vi) LIKE $${values.length})`);
    }

    const where = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';
    const res = await this.db.query<PolicyPackRow>(
      `SELECT ${this.policySelectSql()} FROM public.pay_policy_pack ${where} ORDER BY effective_from DESC, name_vi ASC;`,
      values,
    );

    const includeUsage = String(query.include_usage_count ?? '').toLowerCase() === 'true';
    const items = [];
    for (const row of res.rows) {
      let usageCount: number | undefined;
      if (includeUsage) {
        const countRes = await this.db.query<{ c: string }>(
          `SELECT COUNT(*)::text AS c FROM public.pay_sheet_templates
           WHERE policy_pack_id = $1::uuid AND archived_at IS NULL;`,
          [row.id],
        );
        usageCount = Number(countRes.rows[0]?.c ?? 0);
      }
      items.push(this.mapPolicyPack(row, usageCount));
    }
    return { items };
  }

  async getPolicyPackById(id: string, companyId: string, authorization?: string) {
    await this.ensureSchema();
    const row = await this.loadPolicyInScope(id, companyId, authorization);
    return this.mapPolicyPack(row);
  }

  async createPolicyPack(payload: CreatePayPolicyPackDto, authorization?: string) {
    await this.ensureSchema();
    const actor = this.resolveActorSub(authorization);
    const persistCompanyId = resolveHrmPersistCompanyIdText(authorization, payload.company_id);
    const code = this.assertCode(payload.code);
    const nameVi = (payload.nameVi ?? payload.name_vi ?? '').trim();
    if (!nameVi) {
      throw new ApiException('HRM-VAL-400', 'nameVi required', HttpStatus.BAD_REQUEST);
    }
    const effectiveFrom = payload.effectiveFrom ?? payload.effective_from;
    if (!effectiveFrom) {
      throw new ApiException('HRM-VAL-400', 'effectiveFrom required', HttpStatus.BAD_REQUEST);
    }
    const effectiveTo = payload.effectiveTo ?? payload.effective_to ?? null;
    if (effectiveTo && effectiveTo < effectiveFrom) {
      throw new ApiException(
        HRM_PAY_POL_400_DATE,
        'effective_to must be >= effective_from',
        HttpStatus.BAD_REQUEST,
      );
    }
    assertPolicyDocRefsShape(payload.policyDocRefs);
    assertRateParamsShape(payload.rateParams);

    const id = randomUUID();
    try {
      const res = await this.db.query<PolicyPackRow>(
        `
          INSERT INTO public.pay_policy_pack (
            id, company_id, code, name_vi, status, scope, business_line_tag,
            effective_from, effective_to, policy_doc_refs_json, rate_params_json,
            created_by, updated_by
          ) VALUES (
            $1::uuid, $2, $3, $4, $5, $6, $7,
            $8::date, $9::date, $10::jsonb, $11::jsonb, $12, $12
          )
          RETURNING ${this.policySelectSql()};
        `,
        [
          id,
          persistCompanyId,
          code,
          nameVi,
          this.assertPolicyStatus(payload.status ?? 'draft'),
          this.assertScope(payload.scope ?? 'RIENG'),
          payload.businessLineTag ?? payload.business_line_tag ?? null,
          effectiveFrom,
          effectiveTo,
          payload.policyDocRefs == null ? null : JSON.stringify(payload.policyDocRefs),
          payload.rateParams == null ? null : JSON.stringify(payload.rateParams),
          actor,
        ],
      );
      return this.mapPolicyPack(res.rows[0]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (/uq_pay_policy_pack_company_code_active|unique/i.test(msg)) {
        throw new ApiException(
          HRM_PAY_POL_409_CODE,
          'Active policy pack code already exists for company',
          HttpStatus.CONFLICT,
        );
      }
      throw err;
    }
  }

  async updatePolicyPack(id: string, payload: UpdatePayPolicyPackDto, authorization?: string) {
    await this.ensureSchema();
    const existing = await this.loadPolicyInScope(id, payload.company_id, authorization);
    if (existing.archived_at) {
      throw new ApiException('HRM-PAY-POL-404', 'Archived policy pack cannot be patched', HttpStatus.NOT_FOUND);
    }
    const actor = this.resolveActorSub(authorization);
    const fields: string[] = [];
    const values: unknown[] = [];
    const set = (col: string, val: unknown) => {
      values.push(val);
      fields.push(`${col} = $${values.length}`);
    };

    if (payload.code != null) set('code', this.assertCode(payload.code));
    const nameVi = payload.nameVi ?? payload.name_vi;
    if (nameVi != null) {
      const trimmed = nameVi.trim();
      if (!trimmed) throw new ApiException('HRM-VAL-400', 'nameVi required', HttpStatus.BAD_REQUEST);
      set('name_vi', trimmed);
    }
    if (payload.status != null) set('status', this.assertPolicyStatus(payload.status));
    if (payload.scope != null) set('scope', this.assertScope(payload.scope));
    if (payload.businessLineTag !== undefined) set('business_line_tag', payload.businessLineTag);
    if (payload.business_line_tag !== undefined) set('business_line_tag', payload.business_line_tag);
    const effFrom = payload.effectiveFrom ?? payload.effective_from;
    const effTo = payload.effectiveTo !== undefined ? payload.effectiveTo : payload.effective_to;
    if (effFrom != null) set('effective_from', effFrom);
    if (effTo !== undefined) set('effective_to', effTo);
    if (payload.policyDocRefs !== undefined) {
      assertPolicyDocRefsShape(payload.policyDocRefs);
      set('policy_doc_refs_json', JSON.stringify(payload.policyDocRefs));
    }
    if (payload.rateParams !== undefined) {
      assertRateParamsShape(payload.rateParams);
      set('rate_params_json', JSON.stringify(payload.rateParams));
    }

    const nextFrom = effFrom ?? existing.effective_from;
    const nextTo = effTo !== undefined ? effTo : existing.effective_to;
    if (nextTo && nextTo < nextFrom) {
      throw new ApiException(HRM_PAY_POL_400_DATE, 'effective_to must be >= effective_from', HttpStatus.BAD_REQUEST);
    }

    if (fields.length === 0) return this.mapPolicyPack(existing);
    set('updated_by', actor);
    fields.push('updated_at = NOW()');
    values.push(id);

    try {
      const res = await this.db.query<PolicyPackRow>(
        `UPDATE public.pay_policy_pack SET ${fields.join(', ')} WHERE id = $${values.length}::uuid RETURNING ${this.policySelectSql()};`,
        values,
      );
      return this.mapPolicyPack(res.rows[0]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (/uq_pay_policy_pack_company_code_active|unique/i.test(msg)) {
        throw new ApiException(HRM_PAY_POL_409_CODE, 'Duplicate policy pack code', HttpStatus.CONFLICT);
      }
      throw err;
    }
  }

  async archivePolicyPack(id: string, companyId: string, authorization?: string) {
    await this.ensureSchema();
    const existing = await this.loadPolicyInScope(id, companyId, authorization);
    if (existing.archived_at) return this.mapPolicyPack(existing);
    const actor = this.resolveActorSub(authorization);
    const res = await this.db.query<PolicyPackRow>(
      `
        UPDATE public.pay_policy_pack
        SET archived_at = NOW(), status = 'retired', updated_by = $2, updated_at = NOW()
        WHERE id = $1::uuid
        RETURNING ${this.policySelectSql()};
      `,
      [id, actor],
    );
    return this.mapPolicyPack(res.rows[0]);
  }

  // --- Input profile CRUD ---

  async listInputProfiles(query: ListPayInputPackProfilesQueryDto, authorization?: string) {
    await this.ensureSchema();
    const scopeCompanyId = normalizePayrollListCompanyId(authorization, query.company_id);
    const scope = resolveHrmListScope(authorization, scopeCompanyId);
    const filters: string[] = [];
    const values: unknown[] = [];
    pushCompanyIdFilter(filters, values, expandPayrollPeriodCompanyIds(scope));

    if (String(query.include_archived ?? '').toLowerCase() !== 'true') {
      filters.push('archived_at IS NULL');
    }
    if (query.status) {
      values.push(this.assertProfileStatus(query.status));
      filters.push(`status = $${values.length}`);
    }
    if (query.q?.trim()) {
      values.push(`%${query.q.trim().toLowerCase()}%`);
      filters.push(`(lower(code) LIKE $${values.length} OR lower(name_vi) LIKE $${values.length})`);
    }

    const where = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';
    const res = await this.db.query<InputProfileRow>(
      `SELECT ${this.profileSelectSql()} FROM public.pay_input_pack_profile ${where} ORDER BY name_vi ASC;`,
      values,
    );
    return { items: res.rows.map((r) => this.mapInputProfile(r)) };
  }

  async getInputProfileById(id: string, companyId: string, authorization?: string) {
    await this.ensureSchema();
    const row = await this.loadProfileInScope(id, companyId, authorization);
    return this.mapInputProfile(row);
  }

  async createInputProfile(payload: CreatePayInputPackProfileDto, authorization?: string) {
    await this.ensureSchema();
    const actor = this.resolveActorSub(authorization);
    const persistCompanyId = resolveHrmPersistCompanyIdText(authorization, payload.company_id);
    const code = this.assertCode(payload.code);
    const nameVi = (payload.nameVi ?? payload.name_vi ?? '').trim();
    if (!nameVi) {
      throw new ApiException('HRM-VAL-400', 'nameVi required', HttpStatus.BAD_REQUEST);
    }
    const allowed = payload.allowedSourceKinds ?? [];
    if (!Array.isArray(allowed) || allowed.length === 0) {
      throw new ApiException('HRM-VAL-400', 'allowedSourceKinds required (non-empty)', HttpStatus.BAD_REQUEST);
    }
    const status = this.assertProfileStatus(payload.status ?? 'draft');
    const required = payload.requiredComponentCodes ?? [];
    if (status === 'active' && required.length > 0) {
      await this.assertRequiredComponentsOnActive(persistCompanyId, required, authorization);
    }

    const id = randomUUID();
    try {
      const res = await this.db.query<InputProfileRow>(
        `
          INSERT INTO public.pay_input_pack_profile (
            id, company_id, code, name_vi, status,
            allowed_source_kinds_json, required_component_codes_json, column_hints_json,
            created_by, updated_by
          ) VALUES (
            $1::uuid, $2, $3, $4, $5,
            $6::jsonb, $7::jsonb, $8::jsonb, $9, $9
          )
          RETURNING ${this.profileSelectSql()};
        `,
        [
          id,
          persistCompanyId,
          code,
          nameVi,
          status,
          JSON.stringify(allowed),
          required.length > 0 ? JSON.stringify(required) : null,
          payload.columnHints == null ? null : JSON.stringify(payload.columnHints),
          actor,
        ],
      );
      return this.mapInputProfile(res.rows[0]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (/uq_pay_input_pack_profile_company_code_active|unique/i.test(msg)) {
        throw new ApiException(
          HRM_PAY_INP_PROF_409_CODE,
          'Active input profile code already exists for company',
          HttpStatus.CONFLICT,
        );
      }
      throw err;
    }
  }

  async updateInputProfile(id: string, payload: UpdatePayInputPackProfileDto, authorization?: string) {
    await this.ensureSchema();
    const existing = await this.loadProfileInScope(id, payload.company_id, authorization);
    if (existing.archived_at) {
      throw new ApiException(
        'HRM-PAY-INP-PROF-404',
        'Archived input profile cannot be patched',
        HttpStatus.NOT_FOUND,
      );
    }
    const actor = this.resolveActorSub(authorization);
    const fields: string[] = [];
    const values: unknown[] = [];
    const set = (col: string, val: unknown) => {
      values.push(val);
      fields.push(`${col} = $${values.length}`);
    };

    if (payload.code != null) set('code', this.assertCode(payload.code));
    const nameVi = payload.nameVi ?? payload.name_vi;
    if (nameVi != null) {
      const trimmed = nameVi.trim();
      if (!trimmed) throw new ApiException('HRM-VAL-400', 'nameVi required', HttpStatus.BAD_REQUEST);
      set('name_vi', trimmed);
    }
    let nextStatus = existing.status;
    if (payload.status != null) {
      nextStatus = this.assertProfileStatus(payload.status);
      set('status', nextStatus);
    }
    if (payload.allowedSourceKinds != null) {
      if (payload.allowedSourceKinds.length === 0) {
        throw new ApiException('HRM-VAL-400', 'allowedSourceKinds cannot be empty', HttpStatus.BAD_REQUEST);
      }
      set('allowed_source_kinds_json', JSON.stringify(payload.allowedSourceKinds));
    }
    if (payload.requiredComponentCodes !== undefined) {
      set(
        'required_component_codes_json',
        payload.requiredComponentCodes.length > 0
          ? JSON.stringify(payload.requiredComponentCodes)
          : null,
      );
    }
    if (payload.columnHints !== undefined) {
      set('column_hints_json', payload.columnHints == null ? null : JSON.stringify(payload.columnHints));
    }

    const required =
      payload.requiredComponentCodes ??
      (Array.isArray(existing.required_component_codes_json)
        ? (existing.required_component_codes_json as string[])
        : []);
    if (nextStatus === 'active' && required.length > 0) {
      await this.assertRequiredComponentsOnActive(existing.company_id, required, authorization);
    }

    if (fields.length === 0) return this.mapInputProfile(existing);
    set('updated_by', actor);
    fields.push('updated_at = NOW()');
    values.push(id);

    try {
      const res = await this.db.query<InputProfileRow>(
        `UPDATE public.pay_input_pack_profile SET ${fields.join(', ')} WHERE id = $${values.length}::uuid RETURNING ${this.profileSelectSql()};`,
        values,
      );
      return this.mapInputProfile(res.rows[0]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (/uq_pay_input_pack_profile_company_code_active|unique/i.test(msg)) {
        throw new ApiException(HRM_PAY_INP_PROF_409_CODE, 'Duplicate input profile code', HttpStatus.CONFLICT);
      }
      throw err;
    }
  }

  async archiveInputProfile(id: string, companyId: string, authorization?: string) {
    await this.ensureSchema();
    const existing = await this.loadProfileInScope(id, companyId, authorization);
    if (existing.archived_at) return this.mapInputProfile(existing);
    const actor = this.resolveActorSub(authorization);
    const res = await this.db.query<InputProfileRow>(
      `
        UPDATE public.pay_input_pack_profile
        SET archived_at = NOW(), status = 'retired', updated_by = $2, updated_at = NOW()
        WHERE id = $1::uuid
        RETURNING ${this.profileSelectSql()};
      `,
      [id, actor],
    );
    return this.mapInputProfile(res.rows[0]);
  }

  // --- F-PAY-SETUP-RESOLVE-01 ---

  private applicabilityRank(row: TemplateResolveRow): number {
    switch (row.applicability_scope) {
      case 'employee':
        return 4;
      case 'position':
        return 3;
      case 'ou':
        return 2;
      default:
        return 1;
    }
  }

  private templateMatchesQuery(row: TemplateResolveRow, query: ResolvePaySetupQueryDto): boolean {
    if (row.status !== 'active') return false;
    if (query.ou_id?.trim() && row.applicability_scope === 'ou' && row.ou_id !== query.ou_id.trim()) {
      return false;
    }
    if (
      query.position_key?.trim() &&
      row.applicability_scope === 'position' &&
      row.position_key !== query.position_key.trim()
    ) {
      return false;
    }
    if (
      query.employee_id?.trim() &&
      row.applicability_scope === 'employee' &&
      row.employee_id !== query.employee_id.trim()
    ) {
      return false;
    }
    if (query.business_line_tag?.trim()) {
      const tag = row.business_line_tag?.trim();
      if (tag && tag !== query.business_line_tag.trim()) return false;
    }
    return true;
  }

  async resolveSetup(query: ResolvePaySetupQueryDto, authorization?: string) {
    await this.ensureSchema();
    const scopeCompanyId = normalizePayrollListCompanyId(authorization, query.company_id);
    const scope = resolveHrmListScope(authorization, scopeCompanyId);
    const filters: string[] = ["status = 'active'", 'archived_at IS NULL'];
    const values: unknown[] = [];
    pushCompanyIdFilter(filters, values, expandPayrollPeriodCompanyIds(scope));

    const res = await this.db.query<TemplateResolveRow & { archived_at: string | null }>(
      `
        SELECT
          id::text AS id, company_id, code, name, status, is_default,
          applicability_scope, ou_id, position_key, employee_id::text AS employee_id,
          business_line_tag, policy_pack_id::text AS policy_pack_id,
          input_pack_profile_id::text AS input_pack_profile_id,
          updated_at::text AS updated_at, archived_at::text AS archived_at
        FROM public.pay_sheet_templates
        WHERE ${filters.join(' AND ')}
        ORDER BY is_default DESC, updated_at DESC;
      `,
      values,
    );

    const ranked = res.rows
      .filter((row) => this.templateMatchesQuery(row, query))
      .sort((a, b) => {
        const rankDiff = this.applicabilityRank(b) - this.applicabilityRank(a);
        if (rankDiff !== 0) return rankDiff;
        if (a.is_default !== b.is_default) return a.is_default ? -1 : 1;
        return b.updated_at.localeCompare(a.updated_at);
      });

    if (ranked.length === 0) {
      return {
        recommended: null,
        candidates: [],
        reasonVi: 'Không tìm thấy mẫu bảng lương active phù hợp bộ lọc',
      };
    }

    const buildCandidate = async (tpl: TemplateResolveRow) => {
      let policySummary = null;
      let profileSummary = null;
      if (tpl.policy_pack_id) {
        try {
          const p = await this.loadPolicyInScope(tpl.policy_pack_id, query.company_id, authorization);
          policySummary = { id: p.id, code: p.code, nameVi: p.name_vi, scope: p.scope };
        } catch {
          policySummary = null;
        }
      }
      if (tpl.input_pack_profile_id) {
        try {
          const pr = await this.loadProfileInScope(tpl.input_pack_profile_id, query.company_id, authorization);
          profileSummary = { id: pr.id, code: pr.code, nameVi: pr.name_vi };
        } catch {
          profileSummary = null;
        }
      }
      return {
        template: {
          id: tpl.id,
          code: tpl.code,
          name: tpl.name,
          businessLineTag: tpl.business_line_tag,
          policyPackId: tpl.policy_pack_id,
          inputPackProfileId: tpl.input_pack_profile_id,
        },
        policyPack: policySummary,
        inputProfile: profileSummary,
      };
    };

    const candidates = await Promise.all(ranked.map((row) => buildCandidate(row)));
    return {
      recommended: candidates[0],
      candidates,
      reasonVi: null,
    };
  }
}
