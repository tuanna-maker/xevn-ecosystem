"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayrollCatalogService = void 0;
const common_1 = require("@nestjs/common");
const node_crypto_1 = require("node:crypto");
const api_exception_1 = require("../common/api.exception");
const hrm_list_scope_1 = require("../common/hrm-list-scope");
const hrm_db_service_1 = require("../db/hrm-db.service");
let PayrollCatalogService = class PayrollCatalogService {
    db;
    constructor(db) {
        this.db = db;
    }
    async ensureSalaryComponentSchema() {
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
        await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.salary_components (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL,
        code TEXT NOT NULL,
        name TEXT NOT NULL,
        category_id UUID REFERENCES public.salary_component_categories (id) ON DELETE SET NULL,
        component_type TEXT NOT NULL DEFAULT 'Lương',
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
    }
    async ensurePaymentBatchSchema() {
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
    async listSalaryComponents(companyId, authorization) {
        await this.ensureSalaryComponentSchema();
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, companyId);
        const filters = [];
        const values = [];
        (0, hrm_list_scope_1.pushCompanyIdFilter)(filters, values, scope.companyIds);
        const where = filters.map((f) => f.replace(/\bcompany_id\b/g, 'sc.company_id')).join(' AND ');
        const res = await this.db.query(`SELECT sc.*,
        CASE WHEN c.id IS NOT NULL THEN json_build_object(
          'id', c.id, 'company_id', c.company_id, 'code', c.code, 'name', c.name,
          'description', c.description, 'sort_order', c.sort_order, 'is_active', c.is_active,
          'created_at', c.created_at, 'updated_at', c.updated_at
        ) ELSE NULL END AS category
       FROM public.salary_components sc
       LEFT JOIN public.salary_component_categories c ON c.id = sc.category_id
       WHERE ${where}
       ORDER BY sc.sort_order ASC, sc.code ASC;`, values);
        return { total: res.rows.length, data: res.rows };
    }
    async listSalaryComponentCategories(companyId, authorization) {
        await this.ensureSalaryComponentSchema();
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, companyId);
        const filters = [];
        const values = [];
        (0, hrm_list_scope_1.pushCompanyIdFilter)(filters, values, scope.companyIds);
        const res = await this.db.query(`SELECT * FROM public.salary_component_categories WHERE ${filters.join(' AND ')} ORDER BY sort_order ASC;`, values);
        return { total: res.rows.length, data: res.rows };
    }
    async createSalaryComponent(payload, authorization) {
        await this.ensureSalaryComponentSchema();
        const companyId = (0, hrm_list_scope_1.resolveHrmPersistCompanyIdText)(authorization, String(payload.company_id ?? ''));
        const id = (0, node_crypto_1.randomUUID)();
        const res = await this.db.query(`INSERT INTO public.salary_components (
        id, company_id, code, name, category_id, component_type, nature, value_type,
        is_taxable, is_insurance_base, formula, default_value, min_value, max_value,
        description, applied_to, is_active, sort_order
      ) VALUES (
        $1, $2, $3, $4, $5::uuid, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
      ) RETURNING *;`, [
            id,
            companyId,
            String(payload.code ?? '').trim(),
            String(payload.name ?? '').trim(),
            payload.category_id ?? null,
            payload.component_type ?? 'Lương',
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
        ]);
        return res.rows[0];
    }
    async updateSalaryComponent(id, payload, companyId, authorization) {
        await this.ensureSalaryComponentSchema();
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, companyId);
        const peek = await this.db.query(`SELECT company_id FROM public.salary_components WHERE id = $1::uuid LIMIT 1;`, [id]);
        (0, hrm_list_scope_1.assertResourceInHrmScope)(peek.rows[0], scope, { notFoundCode: 'HRM-SC-404', mismatchCode: 'HRM-SC-409' });
        const fields = [];
        const values = [];
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
            throw new api_exception_1.ApiException('HRM-VAL-001', 'No fields to update', common_1.HttpStatus.BAD_REQUEST);
        }
        values.push(id);
        const res = await this.db.query(`UPDATE public.salary_components SET ${fields.join(', ')}, updated_at = NOW()
       WHERE id = $${values.length}::uuid RETURNING *;`, values);
        if (!res.rows[0])
            throw new api_exception_1.ApiException('HRM-SC-404', 'Salary component not found', common_1.HttpStatus.NOT_FOUND);
        return res.rows[0];
    }
    async deleteSalaryComponent(id, companyId, authorization) {
        await this.ensureSalaryComponentSchema();
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, companyId);
        const filters = ['id = $1::uuid'];
        const values = [id];
        (0, hrm_list_scope_1.pushCompanyIdFilter)(filters, values, scope.companyIds);
        const res = await this.db.query(`DELETE FROM public.salary_components WHERE ${filters.join(' AND ')} RETURNING id;`, values);
        if (!res.rows[0])
            throw new api_exception_1.ApiException('HRM-SC-404', 'Salary component not found', common_1.HttpStatus.NOT_FOUND);
        return { id };
    }
    async createSalaryComponentCategory(payload, authorization) {
        await this.ensureSalaryComponentSchema();
        const companyId = (0, hrm_list_scope_1.resolveHrmPersistCompanyIdText)(authorization, String(payload.company_id ?? ''));
        const res = await this.db.query(`INSERT INTO public.salary_component_categories (id, company_id, code, name, description, sort_order, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;`, [
            (0, node_crypto_1.randomUUID)(),
            companyId,
            String(payload.code ?? '').trim(),
            String(payload.name ?? '').trim(),
            payload.description ?? null,
            payload.sort_order ?? 0,
            payload.is_active ?? true,
        ]);
        return res.rows[0];
    }
    async deleteSalaryComponentCategory(id, companyId, authorization) {
        await this.ensureSalaryComponentSchema();
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, companyId);
        const filters = ['id = $1::uuid'];
        const values = [id];
        (0, hrm_list_scope_1.pushCompanyIdFilter)(filters, values, scope.companyIds);
        const res = await this.db.query(`DELETE FROM public.salary_component_categories WHERE ${filters.join(' AND ')} RETURNING id;`, values);
        if (!res.rows[0])
            throw new api_exception_1.ApiException('HRM-SC-404', 'Category not found', common_1.HttpStatus.NOT_FOUND);
        return { id };
    }
    async listPaymentBatches(companyId, authorization) {
        await this.ensurePaymentBatchSchema();
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, companyId);
        const filters = [];
        const values = [];
        (0, hrm_list_scope_1.pushCompanyIdFilter)(filters, values, scope.companyIds);
        const res = await this.db.query(`SELECT * FROM public.payment_batches WHERE ${filters.join(' AND ')} ORDER BY created_at DESC;`, values);
        return { total: res.rows.length, data: res.rows };
    }
    async listPaymentBatchRecords(batchId, companyId, authorization) {
        await this.ensurePaymentBatchSchema();
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, companyId);
        const batchPeek = await this.db.query(`SELECT company_id FROM public.payment_batches WHERE id = $1::uuid LIMIT 1;`, [batchId]);
        (0, hrm_list_scope_1.assertResourceInHrmScope)(batchPeek.rows[0], scope, { notFoundCode: 'HRM-PB-404', mismatchCode: 'HRM-PB-409' });
        const res = await this.db.query(`SELECT * FROM public.payment_records WHERE payment_batch_id = $1::uuid ORDER BY created_at;`, [batchId]);
        return { total: res.rows.length, data: res.rows };
    }
    async createPaymentBatch(payload, authorization) {
        await this.ensurePaymentBatchSchema();
        const companyId = (0, hrm_list_scope_1.resolveHrmPersistCompanyIdText)(authorization, String(payload.company_id ?? ''));
        const res = await this.db.query(`INSERT INTO public.payment_batches (
        id, company_id, payroll_batch_id, name, salary_period, department, position,
        payment_method, bank_name, payment_date, status
      ) VALUES ($1, $2, $3::uuid, $4, $5, $6, $7, $8, $9, $10::date, $11) RETURNING *;`, [
            (0, node_crypto_1.randomUUID)(),
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
        ]);
        return res.rows[0];
    }
    async updatePaymentBatch(id, payload, companyId, authorization) {
        await this.ensurePaymentBatchSchema();
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, companyId);
        const peek = await this.db.query(`SELECT company_id FROM public.payment_batches WHERE id = $1::uuid LIMIT 1;`, [id]);
        (0, hrm_list_scope_1.assertResourceInHrmScope)(peek.rows[0], scope, { notFoundCode: 'HRM-PB-404', mismatchCode: 'HRM-PB-409' });
        const res = await this.db.query(`UPDATE public.payment_batches SET
        name = COALESCE($2, name),
        salary_period = COALESCE($3, salary_period),
        department = COALESCE($4, department),
        position = COALESCE($5, position),
        payment_method = COALESCE($6, payment_method),
        bank_name = COALESCE($7, bank_name),
        payment_date = COALESCE($8::date, payment_date),
        status = COALESCE($9, status),
        updated_at = NOW()
       WHERE id = $1::uuid RETURNING *;`, [
            id,
            payload.name ?? null,
            payload.salary_period ?? null,
            payload.department ?? null,
            payload.position ?? null,
            payload.payment_method ?? null,
            payload.bank_name ?? null,
            payload.payment_date ?? null,
            payload.status ?? null,
        ]);
        if (!res.rows[0])
            throw new api_exception_1.ApiException('HRM-PB-404', 'Payment batch not found', common_1.HttpStatus.NOT_FOUND);
        return res.rows[0];
    }
    async deletePaymentBatch(id, companyId, authorization) {
        await this.ensurePaymentBatchSchema();
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, companyId);
        const filters = ['id = $1::uuid'];
        const values = [id];
        (0, hrm_list_scope_1.pushCompanyIdFilter)(filters, values, scope.companyIds);
        const res = await this.db.query(`DELETE FROM public.payment_batches WHERE ${filters.join(' AND ')} RETURNING id;`, values);
        if (!res.rows[0])
            throw new api_exception_1.ApiException('HRM-PB-404', 'Payment batch not found', common_1.HttpStatus.NOT_FOUND);
        return { id };
    }
    async refreshPaymentBatchSummary(batchId, processedBy) {
        const res = await this.db.query(`UPDATE public.payment_batches pb SET
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
      RETURNING pb.*;`, [batchId, processedBy ?? null]);
        return res.rows[0];
    }
    async addPaymentRecord(batchId, payload, authorization) {
        await this.ensurePaymentBatchSchema();
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, payload.company_id);
        const batchPeek = await this.db.query(`SELECT company_id FROM public.payment_batches WHERE id = $1::uuid LIMIT 1;`, [batchId]);
        (0, hrm_list_scope_1.assertResourceInHrmScope)(batchPeek.rows[0], scope, { notFoundCode: 'HRM-PB-404', mismatchCode: 'HRM-PB-409' });
        const recordRes = await this.db.query(`INSERT INTO public.payment_records (
        id, company_id, payment_batch_id, payroll_record_id, employee_id, employee_code, employee_name,
        department, bank_name, bank_account, amount, status, notes
      ) VALUES ($1, $2, $3::uuid, $4::uuid, $5::uuid, $6, $7, $8, $9, $10, $11, 'pending', $12)
      RETURNING *;`, [
            (0, node_crypto_1.randomUUID)(),
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
        ]);
        await this.refreshPaymentBatchSummary(batchId);
        return recordRes.rows[0];
    }
    async processPaymentRecord(batchId, recordId, companyId, payload, authorization) {
        await this.ensurePaymentBatchSchema();
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, companyId);
        const batchPeek = await this.db.query(`SELECT company_id FROM public.payment_batches WHERE id = $1::uuid LIMIT 1;`, [batchId]);
        (0, hrm_list_scope_1.assertResourceInHrmScope)(batchPeek.rows[0], scope, { notFoundCode: 'HRM-PB-404', mismatchCode: 'HRM-PB-409' });
        const recordRes = await this.db.query(`UPDATE public.payment_records
       SET status = 'paid',
           paid_at = NOW(),
           transaction_ref = COALESCE($3, transaction_ref),
           notes = COALESCE($4, notes),
           updated_at = NOW()
       WHERE id = $1::uuid
         AND payment_batch_id = $2::uuid
       RETURNING *;`, [recordId, batchId, payload.transaction_ref ?? null, payload.notes ?? null]);
        if (!recordRes.rows[0]) {
            throw new api_exception_1.ApiException('HRM-PB-REC-404', 'Payment record not found', common_1.HttpStatus.NOT_FOUND);
        }
        await this.refreshPaymentBatchSummary(batchId);
        return recordRes.rows[0];
    }
    async processAllPaymentsInBatch(batchId, companyId, payload, authorization) {
        await this.ensurePaymentBatchSchema();
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, companyId);
        const batchPeek = await this.db.query(`SELECT company_id FROM public.payment_batches WHERE id = $1::uuid LIMIT 1;`, [batchId]);
        (0, hrm_list_scope_1.assertResourceInHrmScope)(batchPeek.rows[0], scope, { notFoundCode: 'HRM-PB-404', mismatchCode: 'HRM-PB-409' });
        const updateRes = await this.db.query(`UPDATE public.payment_records
       SET status = 'paid',
           paid_at = COALESCE(paid_at, NOW()),
           transaction_ref = COALESCE($2, transaction_ref),
           notes = COALESCE($3, notes),
           updated_at = NOW()
       WHERE payment_batch_id = $1::uuid
         AND status <> 'paid'
       RETURNING id;`, [batchId, payload.transaction_ref ?? null, payload.notes ?? null]);
        const batchRes = await this.refreshPaymentBatchSummary(batchId);
        return {
            batch: batchRes ?? { id: batchId },
            processed_records: updateRes.rows.length,
        };
    }
};
exports.PayrollCatalogService = PayrollCatalogService;
exports.PayrollCatalogService = PayrollCatalogService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [hrm_db_service_1.HrmDbService])
], PayrollCatalogService);
//# sourceMappingURL=payroll-catalog.service.js.map