/**
 * @CODE-MEMORY
 * Screen:     Catalog extensions — insurance / bonus / tax participants + sales / face
 * UC:         UC-HRM-25 · UF-HRM-04 · AC-E3-INS-PART
 * BR:         BR-INS-01 · BR-LINK-07
 * SRS:        docs/hrm/SRS.md §UC-HRM-25
 * TechSpec:   docs/hrm/API_DESIGN_HRM_ERP_E3.md §13 · docs/hrm/API_DESIGN_HRM_ERP_E2.md §8
 * Purpose:    Nest catalog-extension tables + insurance policy participant enroll
 *             (policy_id + employee_id soft FK). List/create/PATCH/DELETE participants
 *             share resolveHrmListScope / pushCompanyIdFilter.
 * WorkItem:   D-HDSD-BF-03-BH-400-01
 * Coded:      2026-08-01
 * Callers:    catalog-extensions.controller → POST/GET/PATCH/DELETE insurance-policy-participants
 * Callees:    HrmDbService · hrm_insurance_policies · hrm_insurance_policy_participants · employees
 * FEActions:  Thêm BH dialog → POST /api/hrm/insurance-policy-participants → 201 HRM-INS-P-201
 * BEChain:    resolve policy_id (explicit | insurer_key | single active) → assert employee → INSERT
 * Impact:     Sai resolve → enroll sai chính sách / 400 TC-049; orphan policy_id=NULL vi phạm E3.
 * must_keep:  Explicit policy_id path; active-only enroll; HRM-INS-P-DUP; insurance list GET 200;
 *             không nới orphan (policy_id NULL) khi không resolve được.
 * SOLID:      Resolve helper tách khỏi INSERT; controller mỏng.
 * LastVerified: catalog-extensions.service.spec.ts · d-hdsd-bf-03-bh-400-01.spec.ts
 *
 * @CODE-MEMORY-CHANGE 2026-08-01 D-HDSD-BF-03-BH-400-01
 * change_mode: FIX
 * What: Khi thiếu policy_id — resolve 1 active policy (ưu tiên insurer_key) trong scope;
 *       0 → HRM-INS-POL-404; >1 → HRM-INS-POL-AMBIG. Cấm insert orphan.
 * Why: TC-049 FE dialog gửi employee+insurer không gửi policy_id → 400 cứng.
 * must_keep: Explicit UUID path; status=active; employee scope assert; no false orphan widen.
 */
import { HttpStatus, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, join, sep } from 'node:path';
import { ApiException } from '../common/api.exception';
import {
  assertResourceInHrmScope,
  pushCompanyIdFilter,
  resolveHrmListScope,
  resolveHrmPersistCompanyIdText,
} from '../common/hrm-list-scope';
import { getVerifiedInternalJwtPayload } from '../common/internal-auth';
import { HrmDbService } from '../db/hrm-db.service';
import { CreateBonusPolicyDto } from './dto/bonus-policy.dto';

/** Stable enroll codes — API_DESIGN_HRM_ERP_E3 §13 + D-HDSD-BF-03-BH-400-01. */
export const HRM_INS_POL_404 = 'HRM-INS-POL-404';
export const HRM_INS_POL_STATUS = 'HRM-INS-POL-STATUS';
export const HRM_INS_POL_AMBIG = 'HRM-INS-POL-AMBIG';
export const HRM_INS_EMP_404 = 'HRM-INS-EMP-404';
export const HRM_INS_P_DUP = 'HRM-INS-P-DUP';

@Injectable()
export class CatalogExtensionsService {
  constructor(private readonly db: HrmDbService) {}

  private async ensureSchema() {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.hrm_sales_data (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL,
        employee_id UUID,
        employee_code TEXT NOT NULL,
        employee_name TEXT NOT NULL,
        department TEXT,
        position TEXT,
        period_month INT NOT NULL,
        period_year INT NOT NULL,
        sales_target NUMERIC NOT NULL DEFAULT 0,
        actual_sales NUMERIC NOT NULL DEFAULT 0,
        achievement_rate NUMERIC NOT NULL DEFAULT 0,
        commission_rate NUMERIC NOT NULL DEFAULT 0,
        commission_amount NUMERIC NOT NULL DEFAULT 0,
        bonus_amount NUMERIC NOT NULL DEFAULT 0,
        total_earnings NUMERIC NOT NULL DEFAULT 0,
        order_count INT NOT NULL DEFAULT 0,
        customer_count INT NOT NULL DEFAULT 0,
        new_customer_count INT NOT NULL DEFAULT 0,
        sync_source TEXT,
        synced_at TIMESTAMPTZ,
        external_id TEXT,
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.hrm_bonus_policies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL,
        code TEXT NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'other',
        description TEXT,
        calculation_method TEXT NOT NULL DEFAULT 'fixed',
        base_value NUMERIC NOT NULL DEFAULT 0,
        percentage_base TEXT,
        formula TEXT,
        tiers JSONB,
        conditions JSONB,
        effective_date DATE NOT NULL,
        expiry_date DATE,
        status TEXT NOT NULL DEFAULT 'draft',
        applied_departments JSONB,
        applied_positions JSONB,
        participant_count INT NOT NULL DEFAULT 0,
        total_paid_amount NUMERIC NOT NULL DEFAULT 0,
        last_paid_date DATE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await this.db.query(`
      ALTER TABLE public.hrm_bonus_policies ADD COLUMN IF NOT EXISTS component_type TEXT;
      ALTER TABLE public.hrm_bonus_policies ADD COLUMN IF NOT EXISTS extra_data JSONB;
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.hrm_bonus_policy_participants (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL,
        policy_id UUID NOT NULL REFERENCES public.hrm_bonus_policies (id) ON DELETE CASCADE,
        employee_id UUID,
        employee_code TEXT NOT NULL,
        employee_name TEXT NOT NULL,
        department TEXT,
        position TEXT,
        join_date DATE,
        last_bonus_amount NUMERIC,
        last_bonus_date DATE,
        status TEXT NOT NULL DEFAULT 'active',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.hrm_insurance_policy_participants (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL,
        employee_id UUID,
        employee_code TEXT NOT NULL,
        employee_name TEXT NOT NULL,
        employee_avatar TEXT,
        position TEXT,
        department TEXT,
        insurance_type TEXT NOT NULL DEFAULT 'all',
        social_insurance_number TEXT,
        health_insurance_number TEXT,
        unemployment_insurance_number TEXT,
        social_insurance_rate NUMERIC,
        health_insurance_rate NUMERIC,
        unemployment_insurance_rate NUMERIC,
        base_salary NUMERIC NOT NULL DEFAULT 0,
        effective_date DATE,
        expiry_date DATE,
        status TEXT NOT NULL DEFAULT 'active',
        notes TEXT,
        created_by TEXT,
        created_by_position TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    // E3 — soft policy_id / insurer_key on participants
    await this.db.query(
      `ALTER TABLE public.hrm_insurance_policy_participants ADD COLUMN IF NOT EXISTS policy_id UUID NULL;`,
    );
    await this.db.query(
      `ALTER TABLE public.hrm_insurance_policy_participants ADD COLUMN IF NOT EXISTS insurer_key TEXT NULL;`,
    );
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_hrm_ins_participants_policy
      ON public.hrm_insurance_policy_participants (policy_id);
    `);
    await this.db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_hrm_ins_participants_policy_employee
      ON public.hrm_insurance_policy_participants (policy_id, employee_id)
      WHERE policy_id IS NOT NULL AND employee_id IS NOT NULL;
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.hrm_tax_policy_participants (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL,
        employee_id UUID,
        employee_code TEXT NOT NULL,
        employee_name TEXT NOT NULL,
        department TEXT,
        position TEXT,
        tax_code TEXT,
        dependent_count INT NOT NULL DEFAULT 0,
        effective_date DATE,
        status TEXT NOT NULL DEFAULT 'active',
        notes TEXT,
        policy_type TEXT NOT NULL DEFAULT 'progressive',
        policy_name TEXT,
        flat_rate NUMERIC,
        personal_deduction NUMERIC NOT NULL DEFAULT 0,
        dependent_deduction NUMERIC NOT NULL DEFAULT 0,
        created_by TEXT,
        created_by_position TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await this.db.query(`
      ALTER TABLE public.hrm_tax_policy_participants ADD COLUMN IF NOT EXISTS policy_type TEXT NOT NULL DEFAULT 'progressive';
      ALTER TABLE public.hrm_tax_policy_participants ADD COLUMN IF NOT EXISTS policy_name TEXT;
      ALTER TABLE public.hrm_tax_policy_participants ADD COLUMN IF NOT EXISTS flat_rate NUMERIC;
      ALTER TABLE public.hrm_tax_policy_participants ADD COLUMN IF NOT EXISTS personal_deduction NUMERIC NOT NULL DEFAULT 0;
      ALTER TABLE public.hrm_tax_policy_participants ADD COLUMN IF NOT EXISTS dependent_deduction NUMERIC NOT NULL DEFAULT 0;
      ALTER TABLE public.hrm_tax_policy_participants ADD COLUMN IF NOT EXISTS created_by TEXT;
      ALTER TABLE public.hrm_tax_policy_participants ADD COLUMN IF NOT EXISTS created_by_position TEXT;
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.hrm_face_data (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL,
        employee_id UUID NOT NULL,
        face_descriptor JSONB NOT NULL,
        face_image_url TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (company_id, employee_id)
      );
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.hrm_company_subscriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL UNIQUE,
        plan_code TEXT NOT NULL DEFAULT 'trial',
        status TEXT NOT NULL DEFAULT 'trial',
        trial_start_date DATE NOT NULL DEFAULT CURRENT_DATE,
        trial_end_date DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '30 days'),
        subscription_start_date DATE,
        subscription_end_date DATE,
        max_employees INT NOT NULL DEFAULT 50,
        plan_name_vi TEXT,
        plan_name_en TEXT,
        plan_price_monthly NUMERIC,
        plan_price_yearly NUMERIC,
        plan_features_vi JSONB,
        plan_features_en JSONB,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.hrm_guide_content (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT,
        section_id TEXT NOT NULL,
        step_index INT,
        custom_title TEXT,
        custom_content TEXT,
        image_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
        updated_by TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (company_id, section_id, step_index)
      );
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.hrm_salary_template_components (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        template_id UUID NOT NULL,
        company_id TEXT NOT NULL,
        component_id UUID NOT NULL,
        default_value NUMERIC NOT NULL DEFAULT 0,
        is_required BOOLEAN NOT NULL DEFAULT FALSE,
        sort_order INT NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
  }

  private scopedList(companyId: string, authorization?: string) {
    const scope = resolveHrmListScope(authorization, companyId);
    const filters: string[] = [];
    const values: unknown[] = [];
    pushCompanyIdFilter(filters, values, scope.companyIds);
    return { scope, filters, values };
  }

  async listSalesData(
    companyId: string,
    month?: number,
    year?: number,
    authorization?: string,
  ) {
    await this.ensureSchema();
    const { filters, values } = this.scopedList(companyId, authorization);
    if (month) {
      values.push(month);
      filters.push(`period_month = $${values.length}`);
    }
    if (year) {
      values.push(year);
      filters.push(`period_year = $${values.length}`);
    }
    const res = await this.db.query(
      `SELECT * FROM public.hrm_sales_data WHERE ${filters.join(' AND ')} ORDER BY employee_code ASC;`,
      values,
    );
    return { total: res.rows.length, data: res.rows };
  }

  async createSalesData(
    payload: Record<string, unknown>,
    authorization?: string,
  ) {
    await this.ensureSchema();
    const companyId = resolveHrmPersistCompanyIdText(
      authorization,
      String(payload.company_id ?? ''),
    );
    const id = randomUUID();
    const res = await this.db.query(
      `INSERT INTO public.hrm_sales_data (
        id, company_id, employee_id, employee_code, employee_name, department, position,
        period_month, period_year, sales_target, actual_sales, achievement_rate,
        commission_rate, commission_amount, bonus_amount, total_earnings,
        order_count, customer_count, new_customer_count, sync_source, synced_at, external_id, notes
      ) VALUES (
        $1, $2, $3::uuid, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23
      ) RETURNING *;`,
      [
        id,
        companyId,
        payload.employee_id ?? null,
        payload.employee_code,
        payload.employee_name,
        payload.department ?? null,
        payload.position ?? null,
        payload.period_month ?? 1,
        payload.period_year ?? new Date().getFullYear(),
        payload.sales_target ?? 0,
        payload.actual_sales ?? 0,
        payload.achievement_rate ?? 0,
        payload.commission_rate ?? 0,
        payload.commission_amount ?? 0,
        payload.bonus_amount ?? 0,
        payload.total_earnings ?? 0,
        payload.order_count ?? 0,
        payload.customer_count ?? 0,
        payload.new_customer_count ?? 0,
        payload.sync_source ?? null,
        payload.synced_at ?? null,
        payload.external_id ?? null,
        payload.notes ?? null,
      ],
    );
    return res.rows[0];
  }

  async updateSalesData(
    id: string,
    companyId: string,
    payload: Record<string, unknown>,
    authorization?: string,
  ) {
    await this.ensureSchema();
    const { scope } = this.scopedList(companyId, authorization);
    const peek = await this.db.query(
      `SELECT company_id FROM public.hrm_sales_data WHERE id = $1::uuid LIMIT 1;`,
      [id],
    );
    assertResourceInHrmScope(peek.rows[0], scope, {
      notFoundCode: 'HRM-SALES-404',
      mismatchCode: 'HRM-SALES-409',
    });
    const allowed = [
      'employee_id',
      'employee_code',
      'employee_name',
      'department',
      'position',
      'period_month',
      'period_year',
      'sales_target',
      'actual_sales',
      'achievement_rate',
      'commission_rate',
      'commission_amount',
      'bonus_amount',
      'total_earnings',
      'order_count',
      'customer_count',
      'new_customer_count',
      'sync_source',
      'synced_at',
      'external_id',
      'notes',
    ];
    const fields: string[] = [];
    const values: unknown[] = [];
    for (const key of allowed) {
      if (payload[key] !== undefined) {
        values.push(payload[key]);
        const col =
          key === 'employee_id'
            ? `${key} = $${values.length}::uuid`
            : `${key} = $${values.length}`;
        fields.push(col);
      }
    }
    if (!fields.length) {
      throw new ApiException(
        'HRM-VAL-001',
        'No fields to update',
        HttpStatus.BAD_REQUEST,
      );
    }
    values.push(id);
    const res = await this.db.query(
      `UPDATE public.hrm_sales_data SET ${fields.join(', ')}, updated_at = NOW()
       WHERE id = $${values.length}::uuid RETURNING *;`,
      values,
    );
    return res.rows[0];
  }

  async deleteSalesData(id: string, companyId: string, authorization?: string) {
    await this.ensureSchema();
    const { scope } = this.scopedList(companyId, authorization);
    const peek = await this.db.query(
      `SELECT company_id FROM public.hrm_sales_data WHERE id = $1::uuid LIMIT 1;`,
      [id],
    );
    assertResourceInHrmScope(peek.rows[0], scope, {
      notFoundCode: 'HRM-SALES-404',
      mismatchCode: 'HRM-SALES-409',
    });
    await this.db.query(
      `DELETE FROM public.hrm_sales_data WHERE id = $1::uuid;`,
      [id],
    );
    return { id };
  }

  async syncSalesData(companyId: string, authorization?: string) {
    await this.ensureSchema();
    const { scope, filters, values } = this.scopedList(
      companyId,
      authorization,
    );
    const res = await this.db.query(
      `UPDATE public.hrm_sales_data SET sync_source = 'api', synced_at = NOW(), updated_at = NOW()
       WHERE ${filters.join(' AND ')} RETURNING id;`,
      values,
    );
    return {
      synced: res.rows.length,
      company_id: companyId,
      company_ids: scope.companyIds,
    };
  }

  async listBonusPolicies(companyId: string, authorization?: string) {
    await this.ensureSchema();
    const { filters, values } = this.scopedList(companyId, authorization);
    const res = await this.db.query(
      `SELECT * FROM public.hrm_bonus_policies WHERE ${filters.join(' AND ')} ORDER BY created_at DESC;`,
      values,
    );
    return { total: res.rows.length, data: res.rows };
  }

  async createBonusPolicy(
    payload: CreateBonusPolicyDto & { company_id?: string },
    authorization?: string,
  ) {
    await this.ensureSchema();
    const companyId = resolveHrmPersistCompanyIdText(
      authorization,
      String(payload.company_id ?? ''),
    );
    const id = randomUUID();
    const res = await this.db.query(
      `INSERT INTO public.hrm_bonus_policies (
        id, company_id, code, name, type, component_type, description, calculation_method, base_value,
        percentage_base, formula, tiers, extra_data, conditions, effective_date, expiry_date, status,
        applied_departments, applied_positions
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::jsonb,$13::jsonb,$14::jsonb,$15::date,$16::date,$17,$18::jsonb,$19::jsonb)
      RETURNING *;`,
      [
        id,
        companyId,
        payload.code,
        payload.name,
        payload.type ?? 'other',
        payload.component_type ?? null,
        payload.description ?? null,
        payload.calculation_method ?? 'fixed',
        payload.base_value ?? 0,
        payload.percentage_base ?? null,
        payload.formula ?? null,
        JSON.stringify(payload.tiers ?? null),
        JSON.stringify(payload.extra_data ?? null),
        JSON.stringify(payload.conditions ?? null),
        payload.effective_date,
        payload.expiry_date ?? null,
        payload.status ?? 'draft',
        JSON.stringify(payload.applied_departments ?? null),
        JSON.stringify(payload.applied_positions ?? null),
      ],
    );
    return res.rows[0];
  }

  async updateBonusPolicy(
    id: string,
    companyId: string,
    payload: CreateBonusPolicyDto,
    authorization?: string,
  ) {
    await this.ensureSchema();
    const { scope } = this.scopedList(companyId, authorization);
    const peek = await this.db.query(
      `SELECT company_id FROM public.hrm_bonus_policies WHERE id = $1::uuid LIMIT 1;`,
      [id],
    );
    assertResourceInHrmScope(peek.rows[0], scope, {
      notFoundCode: 'HRM-BONUS-404',
      mismatchCode: 'HRM-BONUS-409',
    });
    const allowed = [
      'code',
      'name',
      'type',
      'description',
      'calculation_method',
      'base_value',
      'percentage_base',
      'formula',
      'effective_date',
      'expiry_date',
      'status',
    ];
    const fields: string[] = [];
    const values: unknown[] = [];
    for (const key of allowed) {
      if ((payload as Record<string, any>)[key] !== undefined) {
        values.push((payload as Record<string, any>)[key]);
        fields.push(
          `${key} = $${values.length}${key.includes('date') ? '::date' : ''}`,
        );
      }
    }
    if (payload.tiers !== undefined) {
      values.push(JSON.stringify(payload.tiers));
      fields.push(`tiers = $${values.length}::jsonb`);
    }
    if (payload.conditions !== undefined) {
      values.push(JSON.stringify(payload.conditions));
      fields.push(`conditions = $${values.length}::jsonb`);
    }
    values.push(id);
    const res = await this.db.query(
      `UPDATE public.hrm_bonus_policies SET ${fields.join(', ')}, updated_at = NOW()
       WHERE id = $${values.length}::uuid RETURNING *;`,
      values,
    );
    return res.rows[0];
  }

  async deleteBonusPolicy(
    id: string,
    companyId: string,
    authorization?: string,
  ) {
    await this.ensureSchema();
    const { scope } = this.scopedList(companyId, authorization);
    const peek = await this.db.query(
      `SELECT company_id FROM public.hrm_bonus_policies WHERE id = $1::uuid LIMIT 1;`,
      [id],
    );
    assertResourceInHrmScope(peek.rows[0], scope, {
      notFoundCode: 'HRM-BONUS-404',
      mismatchCode: 'HRM-BONUS-409',
    });
    await this.db.query(
      `DELETE FROM public.hrm_bonus_policies WHERE id = $1::uuid;`,
      [id],
    );
    return { id };
  }

  async listBonusPolicyParticipants(
    policyId: string,
    companyId: string,
    authorization?: string,
  ) {
    await this.ensureSchema();
    const { filters, values } = this.scopedList(companyId, authorization);
    values.push(policyId);
    filters.push(`policy_id = $${values.length}::uuid`);
    const res = await this.db.query(
      `SELECT * FROM public.hrm_bonus_policy_participants WHERE ${filters.join(' AND ')} ORDER BY employee_code ASC;`,
      values,
    );
    return { total: res.rows.length, data: res.rows };
  }

  async createBonusPolicyParticipant(
    payload: Record<string, unknown>,
    authorization?: string,
  ) {
    await this.ensureSchema();
    const requestedCompanyId = String(payload.company_id ?? '');
    const { scope } = this.scopedList(requestedCompanyId, authorization);
    const policyPeek = await this.db.query(
      `SELECT company_id FROM public.hrm_bonus_policies WHERE id = $1::uuid LIMIT 1;`,
      [payload.policy_id],
    );
    assertResourceInHrmScope(policyPeek.rows[0], scope, {
      notFoundCode: 'HRM-BONUS-404',
      mismatchCode: 'HRM-BONUS-409',
    });
    const companyId = String(policyPeek.rows[0].company_id);
    const id = randomUUID();
    const res = await this.db.query(
      `INSERT INTO public.hrm_bonus_policy_participants (
        id, company_id, policy_id, employee_id, employee_code, employee_name, department, position,
        join_date, last_bonus_amount, last_bonus_date, status
      ) VALUES ($1,$2,$3::uuid,$4::uuid,$5,$6,$7,$8,$9::date,$10,$11::date,$12) RETURNING *;`,
      [
        id,
        companyId,
        payload.policy_id,
        payload.employee_id ?? null,
        payload.employee_code,
        payload.employee_name,
        payload.department ?? null,
        payload.position ?? null,
        payload.join_date ?? null,
        payload.last_bonus_amount ?? null,
        payload.last_bonus_date ?? null,
        payload.status ?? 'active',
      ],
    );
    return res.rows[0];
  }

  async listInsurancePolicyParticipants(
    companyId: string,
    authorization?: string,
  ) {
    await this.ensureSchema();
    const { filters, values } = this.scopedList(companyId, authorization);
    const res = await this.db.query(
      `SELECT * FROM public.hrm_insurance_policy_participants WHERE ${filters.join(' AND ')} ORDER BY employee_code ASC;`,
      values,
    );
    return { total: res.rows.length, data: res.rows };
  }

  /**
   * AC-E3-INS-PART + D-HDSD-BF-03-BH-400-01:
   * explicit policy_id → scope peek;
   * else resolve exactly one active policy (prefer insurer_key match).
   * Never enroll with policy_id NULL (orphan widen forbidden).
   */
  private async resolvePolicyForParticipantEnroll(
    payload: Record<string, unknown>,
    companyId: string,
    authorization: string | undefined,
  ): Promise<{ id: string; insurer_key: string | null }> {
    const scope = resolveHrmListScope(authorization, companyId);
    const explicitId = payload.policy_id
      ? String(payload.policy_id).trim()
      : '';
    const insurerKeyHint = payload.insurer_key
      ? String(payload.insurer_key).trim()
      : '';

    if (explicitId) {
      const policyFilters: string[] = ['id = $1::uuid'];
      const policyValues: unknown[] = [explicitId];
      pushCompanyIdFilter(policyFilters, policyValues, scope.companyIds);
      const policyPeek = await this.db.query<{
        id: string;
        company_id: string;
        status: string;
        insurer_key: string | null;
      }>(
        `SELECT id, company_id, status, insurer_key FROM public.hrm_insurance_policies
         WHERE ${policyFilters.join(' AND ')} LIMIT 1;`,
        policyValues,
      );
      if (!policyPeek.rows[0]) {
        throw new ApiException(
          HRM_INS_POL_404,
          'Insurance policy not found',
          HttpStatus.NOT_FOUND,
        );
      }
      if (policyPeek.rows[0].status !== 'active') {
        throw new ApiException(
          HRM_INS_POL_STATUS,
          'Policy must be active to enroll participants',
          HttpStatus.BAD_REQUEST,
        );
      }
      return {
        id: policyPeek.rows[0].id,
        insurer_key: policyPeek.rows[0].insurer_key,
      };
    }

    // Soft resolve — FE dialog (ACT-HRM-INS-LINK) historically omitted policy_id.
    const filters: string[] = [`status = 'active'`];
    const values: unknown[] = [];
    pushCompanyIdFilter(filters, values, scope.companyIds);
    if (insurerKeyHint) {
      values.push(insurerKeyHint);
      filters.push(`insurer_key = $${values.length}`);
    }
    const candidates = await this.db.query<{
      id: string;
      insurer_key: string | null;
    }>(
      `SELECT id, insurer_key FROM public.hrm_insurance_policies
       WHERE ${filters.join(' AND ')}
       ORDER BY updated_at DESC NULLS LAST, created_at DESC
       LIMIT 2;`,
      values,
    );
    if (candidates.rows.length === 1) {
      return {
        id: candidates.rows[0].id,
        insurer_key: candidates.rows[0].insurer_key,
      };
    }
    if (candidates.rows.length === 0) {
      throw new ApiException(
        HRM_INS_POL_404,
        insurerKeyHint
          ? 'No active insurance policy for insurer_key; create a policy or send policy_id'
          : 'policy_id is required for participant enroll (no active policy in scope)',
        HttpStatus.BAD_REQUEST,
      );
    }
    throw new ApiException(
      HRM_INS_POL_AMBIG,
      'policy_id is required when multiple active policies match',
      HttpStatus.BAD_REQUEST,
    );
  }

  async createInsurancePolicyParticipant(
    payload: Record<string, unknown>,
    authorization?: string,
  ) {
    await this.ensureSchema();
    const companyId = resolveHrmPersistCompanyIdText(
      authorization,
      String(payload.company_id ?? ''),
    );
    const employeeId = payload.employee_id
      ? String(payload.employee_id).trim()
      : '';
    // E3 — soft FK policy + employee (AC-E3-INS-PART); BH-400 soft-resolve when policy_id omitted
    const policy = await this.resolvePolicyForParticipantEnroll(
      payload,
      companyId,
      authorization,
    );
    const policyId = policy.id;
    const scope = resolveHrmListScope(authorization, companyId);
    if (!employeeId) {
      throw new ApiException(
        HRM_INS_EMP_404,
        'employee_id is required',
        HttpStatus.BAD_REQUEST,
      );
    }
    const empFilters: string[] = ['id = $1::uuid', 'archived_at IS NULL'];
    const empValues: unknown[] = [employeeId];
    pushCompanyIdFilter(empFilters, empValues, scope.companyIds);
    const empPeek = await this.db.query<{ id: string }>(
      `SELECT id FROM public.employees WHERE ${empFilters.join(' AND ')} LIMIT 1;`,
      empValues,
    );
    if (!empPeek.rows[0]) {
      throw new ApiException(
        HRM_INS_EMP_404,
        'Employee not found in scope',
        HttpStatus.NOT_FOUND,
      );
    }
    const insurerKey =
      (payload.insurer_key ? String(payload.insurer_key).trim() : '') ||
      policy.insurer_key ||
      null;
    const id = randomUUID();
    try {
      const res = await this.db.query(
        `INSERT INTO public.hrm_insurance_policy_participants (
          id, company_id, policy_id, insurer_key, employee_id, employee_code, employee_name, employee_avatar, position, department,
          insurance_type, social_insurance_number, health_insurance_number, unemployment_insurance_number,
          social_insurance_rate, health_insurance_rate, unemployment_insurance_rate, base_salary,
          effective_date, expiry_date, status, notes, created_by, created_by_position
        ) VALUES (
          $1,$2,$3::uuid,$4,$5::uuid,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19::date,$20::date,$21,$22,$23,$24
        ) RETURNING *;`,
        [
          id,
          companyId,
          policyId,
          insurerKey || null,
          employeeId,
          payload.employee_code,
          payload.employee_name,
          payload.employee_avatar ?? null,
          payload.position ?? null,
          payload.department ?? null,
          payload.insurance_type ?? 'all',
          payload.social_insurance_number ?? null,
          payload.health_insurance_number ?? null,
          payload.unemployment_insurance_number ?? null,
          payload.social_insurance_rate ?? null,
          payload.health_insurance_rate ?? null,
          payload.unemployment_insurance_rate ?? null,
          payload.base_salary ?? 0,
          payload.effective_date ?? null,
          payload.expiry_date ?? null,
          payload.status ?? 'active',
          payload.notes ?? null,
          payload.created_by ?? null,
          payload.created_by_position ?? null,
        ],
      );
      return res.rows[0];
    } catch (err: unknown) {
      if ((err as { code?: string })?.code === '23505') {
        throw new ApiException(
          HRM_INS_P_DUP,
          'Employee already enrolled on this policy',
          HttpStatus.CONFLICT,
        );
      }
      throw err;
    }
  }

  async updateInsurancePolicyParticipant(
    id: string,
    companyId: string,
    payload: Record<string, unknown>,
    authorization?: string,
  ) {
    await this.ensureSchema();
    const { scope } = this.scopedList(companyId, authorization);
    const peek = await this.db.query(
      `SELECT company_id FROM public.hrm_insurance_policy_participants WHERE id = $1::uuid LIMIT 1;`,
      [id],
    );
    assertResourceInHrmScope(peek.rows[0], scope, {
      notFoundCode: 'HRM-INS-P-404',
      mismatchCode: 'HRM-INS-P-409',
    });
    const allowed = [
      'employee_id',
      'employee_code',
      'employee_name',
      'employee_avatar',
      'position',
      'department',
      'insurance_type',
      'social_insurance_number',
      'health_insurance_number',
      'unemployment_insurance_number',
      'social_insurance_rate',
      'health_insurance_rate',
      'unemployment_insurance_rate',
      'base_salary',
      'effective_date',
      'expiry_date',
      'status',
      'notes',
      'policy_id',
      'insurer_key',
    ];
    const fields: string[] = [];
    const values: unknown[] = [];
    for (const key of allowed) {
      if (payload[key] !== undefined) {
        values.push(payload[key]);
        const suffix =
          key === 'employee_id'
            ? '::uuid'
            : key.includes('date')
              ? '::date'
              : '';
        fields.push(`${key} = $${values.length}${suffix}`);
      }
    }
    values.push(id);
    const res = await this.db.query(
      `UPDATE public.hrm_insurance_policy_participants SET ${fields.join(', ')}, updated_at = NOW()
       WHERE id = $${values.length}::uuid RETURNING *;`,
      values,
    );
    return res.rows[0];
  }

  async deleteInsurancePolicyParticipant(
    id: string,
    companyId: string,
    authorization?: string,
  ) {
    await this.ensureSchema();
    const { scope } = this.scopedList(companyId, authorization);
    const peek = await this.db.query(
      `SELECT company_id FROM public.hrm_insurance_policy_participants WHERE id = $1::uuid LIMIT 1;`,
      [id],
    );
    assertResourceInHrmScope(peek.rows[0], scope, {
      notFoundCode: 'HRM-INS-P-404',
      mismatchCode: 'HRM-INS-P-409',
    });
    await this.db.query(
      `DELETE FROM public.hrm_insurance_policy_participants WHERE id = $1::uuid;`,
      [id],
    );
    return { id };
  }

  async listTaxPolicyParticipants(companyId: string, authorization?: string) {
    await this.ensureSchema();
    const { filters, values } = this.scopedList(companyId, authorization);
    const res = await this.db.query(
      `SELECT * FROM public.hrm_tax_policy_participants WHERE ${filters.join(' AND ')} ORDER BY employee_code ASC;`,
      values,
    );
    return { total: res.rows.length, data: res.rows };
  }

  async createTaxPolicyParticipant(
    payload: Record<string, unknown>,
    authorization?: string,
  ) {
    await this.ensureSchema();
    const companyId = resolveHrmPersistCompanyIdText(
      authorization,
      String(payload.company_id ?? ''),
    );
    const id = randomUUID();
    const res = await this.db.query(
      `INSERT INTO public.hrm_tax_policy_participants (
        id, company_id, employee_id, employee_code, employee_name, department, position,
        tax_code, dependent_count, effective_date, status, notes,
        policy_type, policy_name, flat_rate, personal_deduction, dependent_deduction, created_by, created_by_position
      ) VALUES ($1,$2,$3::uuid,$4,$5,$6,$7,$8,$9,$10::date,$11,$12,$13,$14,$15,$16,$17,$18,$19) RETURNING *;`,
      [
        id,
        companyId,
        payload.employee_id ?? null,
        payload.employee_code,
        payload.employee_name,
        payload.department ?? null,
        payload.position ?? null,
        payload.tax_code ?? null,
        payload.dependent_count ?? payload.dependents ?? 0,
        payload.effective_date ?? null,
        payload.status ?? 'active',
        payload.notes ?? null,
        payload.policy_type ?? 'progressive',
        payload.policy_name ?? null,
        payload.flat_rate ?? null,
        payload.personal_deduction ?? 0,
        payload.dependent_deduction ?? 0,
        payload.created_by ?? null,
        payload.created_by_position ?? null,
      ],
    );
    return res.rows[0];
  }

  async updateTaxPolicyParticipant(
    id: string,
    companyId: string,
    payload: Record<string, unknown>,
    authorization?: string,
  ) {
    await this.ensureSchema();
    const { scope } = this.scopedList(companyId, authorization);
    const peek = await this.db.query(
      `SELECT company_id FROM public.hrm_tax_policy_participants WHERE id = $1::uuid LIMIT 1;`,
      [id],
    );
    assertResourceInHrmScope(peek.rows[0], scope, {
      notFoundCode: 'HRM-TAX-404',
      mismatchCode: 'HRM-TAX-409',
    });
    const allowed = [
      'employee_id',
      'employee_code',
      'employee_name',
      'department',
      'position',
      'tax_code',
      'dependent_count',
      'effective_date',
      'status',
      'notes',
      'policy_type',
      'policy_name',
      'flat_rate',
      'personal_deduction',
      'dependent_deduction',
      'created_by',
      'created_by_position',
    ];
    const fields: string[] = [];
    const values: unknown[] = [];
    for (const key of allowed) {
      if (payload[key] !== undefined) {
        values.push(payload[key]);
        const suffix =
          key === 'employee_id'
            ? '::uuid'
            : key.includes('date')
              ? '::date'
              : '';
        fields.push(`${key} = $${values.length}${suffix}`);
      }
    }
    values.push(id);
    const res = await this.db.query(
      `UPDATE public.hrm_tax_policy_participants SET ${fields.join(', ')}, updated_at = NOW()
       WHERE id = $${values.length}::uuid RETURNING *;`,
      values,
    );
    return res.rows[0];
  }

  async deleteTaxPolicyParticipant(
    id: string,
    companyId: string,
    authorization?: string,
  ) {
    await this.ensureSchema();
    const { scope } = this.scopedList(companyId, authorization);
    const peek = await this.db.query(
      `SELECT company_id FROM public.hrm_tax_policy_participants WHERE id = $1::uuid LIMIT 1;`,
      [id],
    );
    assertResourceInHrmScope(peek.rows[0], scope, {
      notFoundCode: 'HRM-TAX-404',
      mismatchCode: 'HRM-TAX-409',
    });
    await this.db.query(
      `DELETE FROM public.hrm_tax_policy_participants WHERE id = $1::uuid;`,
      [id],
    );
    return { id };
  }

  async listFaceData(companyId: string, authorization?: string) {
    await this.ensureSchema();
    const { filters, values } = this.scopedList(companyId, authorization);
    const res = await this.db.query(
      `SELECT id, company_id, employee_id, face_descriptor, face_image_url, created_at, updated_at
       FROM public.hrm_face_data WHERE ${filters.join(' AND ')};`,
      values,
    );
    return {
      total: res.rows.length,
      data: res.rows.map((row) => ({
        ...row,
        face_descriptor: Array.isArray(row.face_descriptor)
          ? row.face_descriptor
          : typeof row.face_descriptor === 'string'
            ? JSON.parse(row.face_descriptor)
            : row.face_descriptor,
      })),
    };
  }

  async upsertFaceData(
    payload: Record<string, unknown>,
    authorization?: string,
  ) {
    await this.ensureSchema();
    const companyId = resolveHrmPersistCompanyIdText(
      authorization,
      String(payload.company_id ?? ''),
    );
    const descriptor = JSON.stringify(payload.face_descriptor ?? []);
    const res = await this.db.query(
      `INSERT INTO public.hrm_face_data (id, company_id, employee_id, face_descriptor, face_image_url)
       VALUES ($1, $2, $3::uuid, $4::jsonb, $5)
       ON CONFLICT (company_id, employee_id) DO UPDATE SET
         face_descriptor = EXCLUDED.face_descriptor,
         face_image_url = EXCLUDED.face_image_url,
         updated_at = NOW()
       RETURNING id, company_id, employee_id, face_descriptor, face_image_url, created_at, updated_at;`,
      [
        randomUUID(),
        companyId,
        payload.employee_id,
        descriptor,
        payload.face_image_url ?? null,
      ],
    );
    const row = res.rows[0];
    return {
      ...row,
      face_descriptor: Array.isArray(row.face_descriptor)
        ? row.face_descriptor
        : JSON.parse(String(row.face_descriptor)),
    };
  }

  async deleteFaceData(
    employeeId: string,
    companyId: string,
    authorization?: string,
  ) {
    await this.ensureSchema();
    const { scope } = this.scopedList(companyId, authorization);
    const peek = await this.db.query(
      `SELECT company_id FROM public.hrm_face_data WHERE employee_id = $1::uuid LIMIT 1;`,
      [employeeId],
    );
    assertResourceInHrmScope(peek.rows[0], scope, {
      notFoundCode: 'HRM-FACE-404',
      mismatchCode: 'HRM-FACE-409',
    });
    const rowCompanyId = String(peek.rows[0].company_id);
    await this.db.query(
      `DELETE FROM public.hrm_face_data WHERE company_id = $1::text AND employee_id = $2::uuid;`,
      [rowCompanyId, employeeId],
    );
    return { employee_id: employeeId };
  }

  async getCompanySubscription(companyId: string, authorization?: string) {
    await this.ensureSchema();
    const company = resolveHrmPersistCompanyIdText(authorization, companyId);
    let res = await this.db.query(
      `SELECT * FROM public.hrm_company_subscriptions WHERE company_id = $1 LIMIT 1;`,
      [company],
    );
    if (!res.rows[0]) {
      res = await this.db.query(
        `INSERT INTO public.hrm_company_subscriptions (company_id, plan_code, status, max_employees, plan_name_vi, plan_name_en)
         VALUES ($1, 'trial', 'trial', 50, 'Dùng thử', 'Trial')
         RETURNING *;`,
        [company],
      );
    }
    const row = res.rows[0];
    const trialEnd = row.trial_end_date
      ? new Date(row.trial_end_date)
      : new Date();
    const days = Math.max(
      0,
      Math.ceil((trialEnd.getTime() - Date.now()) / 86400000),
    );
    return { ...row, trial_days_remaining: days };
  }

  async upgradeCompanySubscription(
    companyId: string,
    payload: Record<string, unknown>,
    authorization?: string,
  ) {
    await this.ensureSchema();
    const company = resolveHrmPersistCompanyIdText(authorization, companyId);
    const res = await this.db.query(
      `UPDATE public.hrm_company_subscriptions SET
        plan_code = COALESCE($2, plan_code),
        status = 'active',
        max_employees = COALESCE($3, max_employees),
        subscription_start_date = CURRENT_DATE,
        subscription_end_date = CURRENT_DATE + INTERVAL '365 days',
        is_active = TRUE,
        updated_at = NOW()
       WHERE company_id = $1 RETURNING *;`,
      [company, payload.plan_code ?? null, payload.max_employees ?? null],
    );
    if (!res.rows[0]) {
      throw new ApiException(
        'HRM-SUB-404',
        'Subscription not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return res.rows[0];
  }

  async listGuideContent(companyId?: string | null) {
    await this.ensureSchema();
    const filters: string[] = [];
    const values: unknown[] = [];
    if (companyId) {
      values.push(companyId);
      filters.push(`(company_id = $${values.length} OR company_id IS NULL)`);
    }
    const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
    const res = await this.db.query(
      `SELECT * FROM public.hrm_guide_content ${where} ORDER BY section_id, step_index;`,
      values,
    );
    return { total: res.rows.length, data: res.rows };
  }

  async upsertGuideContent(
    payload: Record<string, unknown>,
    authorization?: string,
  ) {
    await this.ensureSchema();
    const companyId = payload.company_id
      ? resolveHrmPersistCompanyIdText(
          authorization,
          String(payload.company_id),
        )
      : null;
    const id = randomUUID();
    const res = await this.db.query(
      `INSERT INTO public.hrm_guide_content (
        id, company_id, section_id, step_index, custom_title, custom_content, image_urls, updated_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8)
      ON CONFLICT (company_id, section_id, step_index) DO UPDATE SET
        custom_title = EXCLUDED.custom_title,
        custom_content = EXCLUDED.custom_content,
        image_urls = EXCLUDED.image_urls,
        updated_by = EXCLUDED.updated_by,
        updated_at = NOW()
      RETURNING *;`,
      [
        id,
        companyId,
        payload.section_id,
        payload.step_index ?? null,
        payload.custom_title ?? null,
        payload.custom_content ?? null,
        JSON.stringify(payload.image_urls ?? []),
        payload.updated_by ?? null,
      ],
    );
    return res.rows[0];
  }

  async deleteGuideContent(payload: {
    section_id: string;
    step_index: number | null;
    company_id?: string;
  }) {
    await this.ensureSchema();
    await this.db.query(
      `DELETE FROM public.hrm_guide_content
       WHERE section_id = $1 AND step_index IS NOT DISTINCT FROM $2
         AND ($3::text IS NULL OR company_id = $3);`,
      [payload.section_id, payload.step_index, payload.company_id ?? null],
    );
    return { ok: true };
  }

  async storeUploadedFile(
    companyId: string,
    authorization: string | undefined,
    feature: string,
    file: { buffer: Buffer; originalname: string; mimetype: string },
  ) {
    const scopedCompanyId = resolveHrmPersistCompanyIdText(
      authorization,
      companyId,
    );
    const jwtPayload = getVerifiedInternalJwtPayload(authorization);
    if (jwtPayload) {
      const claimCompany =
        (typeof jwtPayload.companyId === 'string' &&
          jwtPayload.companyId.trim()) ||
        (typeof jwtPayload.company_id === 'string' &&
          jwtPayload.company_id.trim()) ||
        companyId;
      const tokenScope = resolveHrmListScope(authorization, claimCompany);
      assertResourceInHrmScope({ company_id: scopedCompanyId }, tokenScope, {
        notFoundCode: 'HRM-FILE-404',
        mismatchCode: 'HRM-FILE-409',
      });
    }
    const baseDir =
      process.env.HRM_FILE_UPLOAD_DIR?.trim() ||
      join(process.cwd(), 'uploads', 'hrm-files');
    const companyDir = join(baseDir, scopedCompanyId);
    await mkdir(companyDir, { recursive: true });
    const safeFeature = feature.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40);
    const safeName = file.originalname
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .slice(0, 120);
    const storedName = `${safeFeature}-${Date.now()}-${safeName}`;
    const absolutePath = join(companyDir, storedName);
    await writeFile(absolutePath, file.buffer);
    const publicUrl = `/api/hrm/files/${scopedCompanyId}/${storedName}`;
    return {
      url: publicUrl,
      path: absolutePath,
      filename: storedName,
      mimetype: file.mimetype,
      company_id: scopedCompanyId,
    };
  }

  private resolveFileUploadBaseDir(): string {
    return (
      process.env.HRM_FILE_UPLOAD_DIR?.trim() ||
      join(process.cwd(), 'uploads', 'hrm-files')
    );
  }

  private guessUploadedFileMime(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    const map: Record<string, string> = {
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      gif: 'image/gif',
      webp: 'image/webp',
      pdf: 'application/pdf',
    };
    return (ext && map[ext]) || 'application/octet-stream';
  }

  /** Static serve for pilot opaque URLs — optional JWT scope when Authorization present. */
  async readUploadedFile(
    companyId: string,
    filename: string,
    authorization: string | undefined,
  ): Promise<{ buffer: Buffer; mimetype: string; filename: string }> {
    const safeFilename = basename(filename.trim());
    if (
      !safeFilename ||
      safeFilename !== filename.trim() ||
      filename.includes('..')
    ) {
      throw new ApiException(
        'HRM-FILE-404',
        'File not found',
        HttpStatus.NOT_FOUND,
      );
    }

    let scopedCompanyId = companyId.trim();
    if (!scopedCompanyId) {
      throw new ApiException(
        'HRM-FILE-404',
        'File not found',
        HttpStatus.NOT_FOUND,
      );
    }

    const jwtPayload = getVerifiedInternalJwtPayload(authorization);
    if (jwtPayload) {
      scopedCompanyId = resolveHrmPersistCompanyIdText(
        authorization,
        companyId,
      );
      const claimCompany =
        (typeof jwtPayload.companyId === 'string' &&
          jwtPayload.companyId.trim()) ||
        (typeof jwtPayload.company_id === 'string' &&
          jwtPayload.company_id.trim()) ||
        companyId;
      const tokenScope = resolveHrmListScope(authorization, claimCompany);
      assertResourceInHrmScope({ company_id: scopedCompanyId }, tokenScope, {
        notFoundCode: 'HRM-FILE-404',
        mismatchCode: 'HRM-FILE-409',
      });
    }

    const baseDir = this.resolveFileUploadBaseDir();
    const companyDir = join(baseDir, scopedCompanyId);
    const absolutePath = join(companyDir, safeFilename);
    const companyDirWithSep = companyDir.endsWith(sep)
      ? companyDir
      : `${companyDir}${sep}`;
    if (!absolutePath.startsWith(companyDirWithSep)) {
      throw new ApiException(
        'HRM-FILE-404',
        'File not found',
        HttpStatus.NOT_FOUND,
      );
    }

    try {
      await access(absolutePath);
    } catch {
      throw new ApiException(
        'HRM-FILE-404',
        'File not found',
        HttpStatus.NOT_FOUND,
      );
    }

    const buffer = await readFile(absolutePath);
    return {
      buffer,
      mimetype: this.guessUploadedFileMime(safeFilename),
      filename: safeFilename,
    };
  }
}
