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
 * LastVerified: be-erp-e2-01.spec.ts
 *
 * @CODE-MEMORY-CHANGE 2026-07-28 D-BE-ERP-E2-01
 * change_mode: ADD
 * What: assertCodeInEffectiveCatalog(pay_types) → HRM-PAY-TYPE-KEY; unique → HRM-SC-002;
 *       stop DEFAULT/fallback VI 'Lương'; unique index + DROP DEFAULT; no tax endpoints
 * Why: SA-ERP-E2-ACK-01 · AC-E2-BE-01 · VAL-E2-01/04 · FR-HRM-PAY-CLEAN-E2-01 #3/#5
 * must_keep: payment_batches paths; list/get scope parity; HOLD_DEPLOY; U65
 */
import { HttpStatus, Injectable, Optional } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import {
  assertResourceInHrmScope,
  MASTER_TENANT_ID,
  pushCompanyIdFilter,
  resolveHrmListScope,
  resolveHrmPersistCompanyIdText,
} from '../common/hrm-list-scope';
import { masterTenantIdFromEnv } from '../common/tenant-scope-env';
import { HrmDbService } from '../db/hrm-db.service';
import { SettingsCatalogsService } from '../settings-catalogs/settings-catalogs.service';

export const HRM_PAY_TYPE_KEY = 'HRM-PAY-TYPE-KEY';
export const HRM_SC_002 = 'HRM-SC-002';

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
      CREATE UNIQUE INDEX IF NOT EXISTS uq_salary_components_company_code
      ON public.salary_components (company_id, lower(code));
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_salary_components_company_component_type
      ON public.salary_components (company_id, component_type);
    `);
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
  }

  /** FR-HRM-PAY-CLEAN-E2-01 #3/#5 — nature ∈ effective pay_types. */
  private async assertPayTypeKey(companyId: string, componentType: string | null | undefined): Promise<string> {
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
      WHERE company_id = $1 AND lower(code) = lower($2)
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

  async listSalaryComponents(companyId: string, authorization?: string) {
    await this.ensureSalaryComponentSchema();
    const scope = resolveHrmListScope(authorization, companyId);
    const filters: string[] = [];
    const values: unknown[] = [];
    pushCompanyIdFilter(filters, values, scope.companyIds);
    const where = filters.map((f) => f.replace(/\bcompany_id\b/g, 'sc.company_id')).join(' AND ');
    const res = await this.db.query(
      `SELECT sc.*,
        CASE WHEN c.id IS NOT NULL THEN json_build_object(
          'id', c.id, 'company_id', c.company_id, 'code', c.code, 'name', c.name,
          'description', c.description, 'sort_order', c.sort_order, 'is_active', c.is_active,
          'created_at', c.created_at, 'updated_at', c.updated_at
        ) ELSE NULL END AS category
       FROM public.salary_components sc
       LEFT JOIN public.salary_component_categories c ON c.id = sc.category_id
       WHERE ${where}
       ORDER BY sc.sort_order ASC, sc.code ASC;`,
      values,
    );
    return { total: res.rows.length, data: res.rows };
  }

  async listSalaryComponentCategories(companyId: string, authorization?: string) {
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

  async createSalaryComponent(payload: Record<string, unknown>, authorization?: string) {
    await this.ensureSalaryComponentSchema();
    const companyId = resolveHrmPersistCompanyIdText(authorization, String(payload.company_id ?? ''));
    const code = String(payload.code ?? '').trim();
    const name = String(payload.name ?? '').trim();
    if (!code || !name) {
      throw new ApiException('HRM-SC-001', 'code and name are required', HttpStatus.BAD_REQUEST);
    }
    // E2 — cấm fallback VI 'Lương'; require explicit pay_types code.
    const componentType = await this.assertPayTypeKey(companyId, payload.component_type as string | undefined);
    await this.assertUniqueComponentCode(companyId, code);
    const id = randomUUID();
    try {
      const res = await this.db.query(
        `INSERT INTO public.salary_components (
          id, company_id, code, name, category_id, component_type, nature, value_type,
          is_taxable, is_insurance_base, formula, default_value, min_value, max_value,
          description, applied_to, is_active, sort_order
        ) VALUES (
          $1, $2, $3, $4, $5::uuid, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
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
        ],
      );
      return res.rows[0];
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

  async updateSalaryComponent(id: string, payload: Record<string, unknown>, companyId: string, authorization?: string) {
    await this.ensureSalaryComponentSchema();
    const scope = resolveHrmListScope(authorization, companyId);
    const peek = await this.db.query(`SELECT company_id FROM public.salary_components WHERE id = $1::uuid LIMIT 1;`, [id]);
    assertResourceInHrmScope(peek.rows[0], scope, { notFoundCode: 'HRM-SC-404', mismatchCode: 'HRM-SC-409' });
    const persistCompanyId = String(peek.rows[0].company_id);
    if (payload.component_type !== undefined) {
      payload = {
        ...payload,
        component_type: await this.assertPayTypeKey(persistCompanyId, payload.component_type as string),
      };
    }
    if (payload.code !== undefined) {
      const nextCode = String(payload.code ?? '').trim();
      if (!nextCode) {
        throw new ApiException('HRM-SC-001', 'code cannot be empty', HttpStatus.BAD_REQUEST);
      }
      await this.assertUniqueComponentCode(persistCompanyId, nextCode, id);
      payload = { ...payload, code: nextCode };
    }
    const fields: string[] = [];
    const values: unknown[] = [];
    const allowed = [
      'code', 'name', 'category_id', 'component_type', 'nature', 'value_type', 'is_taxable',
      'is_insurance_base', 'formula', 'default_value', 'min_value', 'max_value', 'description',
      'applied_to', 'is_active', 'sort_order',
    ];
    for (const key of allowed) {
      if (payload[key] !== undefined) {
        values.push(payload[key]);
        const col = key === 'category_id' ? `${key} = $${values.length}::uuid` : `${key} = $${values.length}`;
        fields.push(col);
      }
    }
    if (fields.length === 0) {
      throw new ApiException('HRM-VAL-001', 'No fields to update', HttpStatus.BAD_REQUEST);
    }
    values.push(id);
    try {
      const res = await this.db.query(
        `UPDATE public.salary_components SET ${fields.join(', ')}, updated_at = NOW()
         WHERE id = $${values.length}::uuid RETURNING *;`,
        values,
      );
      if (!res.rows[0]) throw new ApiException('HRM-SC-404', 'Salary component not found', HttpStatus.NOT_FOUND);
      return res.rows[0];
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

  async deleteSalaryComponent(id: string, companyId: string, authorization?: string) {
    await this.ensureSalaryComponentSchema();
    const scope = resolveHrmListScope(authorization, companyId);
    const filters = ['id = $1::uuid'];
    const values: unknown[] = [id];
    pushCompanyIdFilter(filters, values, scope.companyIds);
    const res = await this.db.query(
      `DELETE FROM public.salary_components WHERE ${filters.join(' AND ')} RETURNING id;`,
      values,
    );
    if (!res.rows[0]) throw new ApiException('HRM-SC-404', 'Salary component not found', HttpStatus.NOT_FOUND);
    return { id };
  }

  async createSalaryComponentCategory(payload: Record<string, unknown>, authorization?: string) {
    await this.ensureSalaryComponentSchema();
    const companyId = resolveHrmPersistCompanyIdText(authorization, String(payload.company_id ?? ''));
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

  async deleteSalaryComponentCategory(id: string, companyId: string, authorization?: string) {
    await this.ensureSalaryComponentSchema();
    const scope = resolveHrmListScope(authorization, companyId);
    const filters = ['id = $1::uuid'];
    const values: unknown[] = [id];
    pushCompanyIdFilter(filters, values, scope.companyIds);
    const res = await this.db.query(
      `DELETE FROM public.salary_component_categories WHERE ${filters.join(' AND ')} RETURNING id;`,
      values,
    );
    if (!res.rows[0]) throw new ApiException('HRM-SC-404', 'Category not found', HttpStatus.NOT_FOUND);
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

  async listPaymentBatchRecords(batchId: string, companyId: string, authorization?: string) {
    await this.ensurePaymentBatchSchema();
    const scope = resolveHrmListScope(authorization, companyId);
    const batchPeek = await this.db.query(`SELECT company_id FROM public.payment_batches WHERE id = $1::uuid LIMIT 1;`, [batchId]);
    assertResourceInHrmScope(batchPeek.rows[0], scope, { notFoundCode: 'HRM-PB-404', mismatchCode: 'HRM-PB-409' });
    const res = await this.db.query(
      `SELECT * FROM public.payment_records WHERE payment_batch_id = $1::uuid ORDER BY created_at;`,
      [batchId],
    );
    return { total: res.rows.length, data: res.rows };
  }

  async createPaymentBatch(payload: Record<string, unknown>, authorization?: string) {
    await this.ensurePaymentBatchSchema();
    const companyId = resolveHrmPersistCompanyIdText(authorization, String(payload.company_id ?? ''));
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

  async updatePaymentBatch(id: string, payload: Record<string, unknown>, companyId: string, authorization?: string) {
    await this.ensurePaymentBatchSchema();
    const scope = resolveHrmListScope(authorization, companyId);
    const peek = await this.db.query(`SELECT company_id FROM public.payment_batches WHERE id = $1::uuid LIMIT 1;`, [id]);
    assertResourceInHrmScope(peek.rows[0], scope, { notFoundCode: 'HRM-PB-404', mismatchCode: 'HRM-PB-409' });
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
    if (!res.rows[0]) throw new ApiException('HRM-PB-404', 'Payment batch not found', HttpStatus.NOT_FOUND);
    return res.rows[0];
  }

  async deletePaymentBatch(id: string, companyId: string, authorization?: string) {
    await this.ensurePaymentBatchSchema();
    const scope = resolveHrmListScope(authorization, companyId);
    const filters = ['id = $1::uuid'];
    const values: unknown[] = [id];
    pushCompanyIdFilter(filters, values, scope.companyIds);
    const res = await this.db.query(`DELETE FROM public.payment_batches WHERE ${filters.join(' AND ')} RETURNING id;`, values);
    if (!res.rows[0]) throw new ApiException('HRM-PB-404', 'Payment batch not found', HttpStatus.NOT_FOUND);
    return { id };
  }

  private async refreshPaymentBatchSummary(batchId: string, processedBy?: string) {
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
    const batchPeek = await this.db.query(`SELECT company_id FROM public.payment_batches WHERE id = $1::uuid LIMIT 1;`, [batchId]);
    assertResourceInHrmScope(batchPeek.rows[0], scope, { notFoundCode: 'HRM-PB-404', mismatchCode: 'HRM-PB-409' });
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
    const batchPeek = await this.db.query(`SELECT company_id FROM public.payment_batches WHERE id = $1::uuid LIMIT 1;`, [batchId]);
    assertResourceInHrmScope(batchPeek.rows[0], scope, { notFoundCode: 'HRM-PB-404', mismatchCode: 'HRM-PB-409' });
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
      [recordId, batchId, payload.transaction_ref ?? null, payload.notes ?? null],
    );
    if (!recordRes.rows[0]) {
      throw new ApiException('HRM-PB-REC-404', 'Payment record not found', HttpStatus.NOT_FOUND);
    }
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
    const batchPeek = await this.db.query(`SELECT company_id FROM public.payment_batches WHERE id = $1::uuid LIMIT 1;`, [batchId]);
    assertResourceInHrmScope(batchPeek.rows[0], scope, { notFoundCode: 'HRM-PB-404', mismatchCode: 'HRM-PB-409' });
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
    const batchRes = await this.refreshPaymentBatchSummary(batchId);
    return {
      batch: batchRes ?? { id: batchId },
      processed_records: updateRes.rows.length,
    };
  }
}
