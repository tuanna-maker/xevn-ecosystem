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
exports.EmployeeBenefitsService = void 0;
const common_1 = require("@nestjs/common");
const node_crypto_1 = require("node:crypto");
const api_exception_1 = require("../common/api.exception");
const hrm_list_scope_1 = require("../common/hrm-list-scope");
const hrm_db_service_1 = require("../db/hrm-db.service");
let EmployeeBenefitsService = class EmployeeBenefitsService {
    db;
    constructor(db) {
        this.db = db;
    }
    selectColumns = `
    id, employee_id, company_id, name, category, value, unit, frequency,
    start_date, end_date, status, description, created_at, updated_at
  `;
    async ensureSchema() {
        await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.employee_benefits (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_id UUID NOT NULL,
        company_id TEXT NOT NULL,
        name TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'allowance',
        value NUMERIC NOT NULL DEFAULT 0,
        unit TEXT NOT NULL DEFAULT 'VNĐ',
        frequency TEXT NOT NULL DEFAULT 'monthly',
        start_date DATE,
        end_date DATE,
        status TEXT NOT NULL DEFAULT 'active',
        description TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    }
    mapRow(row) {
        return {
            ...row,
            value: Number(row.value ?? 0),
        };
    }
    async list(query, authorization) {
        await this.ensureSchema();
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, query.company_id);
        const filters = [];
        const values = [];
        (0, hrm_list_scope_1.pushCompanyIdFilter)(filters, values, scope.companyIds);
        if (query.employee_id) {
            values.push(query.employee_id);
            filters.push(`employee_id = $${values.length}::uuid`);
        }
        const res = await this.db.query(`SELECT ${this.selectColumns}
       FROM public.employee_benefits
       WHERE ${filters.join(' AND ')}
       ORDER BY created_at DESC;`, values);
        const data = res.rows.map((row) => this.mapRow(row));
        return { total: data.length, data };
    }
    async getById(id, companyId, authorization) {
        await this.ensureSchema();
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, companyId);
        const filters = ['id = $1::uuid'];
        const values = [id];
        (0, hrm_list_scope_1.pushCompanyIdFilter)(filters, values, scope.companyIds);
        const res = await this.db.query(`SELECT ${this.selectColumns}
       FROM public.employee_benefits
       WHERE ${filters.join(' AND ')}
       LIMIT 1;`, values);
        const row = res.rows[0];
        if (!row) {
            throw new api_exception_1.ApiException('HRM-EBEN-404', 'Employee benefit not found', common_1.HttpStatus.NOT_FOUND);
        }
        return this.mapRow(row);
    }
    async create(payload, authorization) {
        await this.ensureSchema();
        const companyId = (0, hrm_list_scope_1.resolveHrmPersistCompanyIdText)(authorization, payload.company_id);
        const id = (0, node_crypto_1.randomUUID)();
        const res = await this.db.query(`INSERT INTO public.employee_benefits (
        id, employee_id, company_id, name, category, value, unit, frequency,
        start_date, end_date, status, description
      ) VALUES (
        $1, $2::uuid, $3, $4, $5, $6, $7, $8, $9::date, $10::date, $11, $12
      )
      RETURNING ${this.selectColumns};`, [
            id,
            payload.employee_id,
            companyId,
            payload.name.trim(),
            payload.category ?? 'allowance',
            payload.value,
            payload.unit ?? 'VNĐ',
            payload.frequency ?? 'monthly',
            payload.start_date ?? null,
            payload.end_date ?? null,
            payload.status ?? 'active',
            payload.description ?? null,
        ]);
        return this.mapRow(res.rows[0]);
    }
    async update(id, payload, authorization) {
        await this.ensureSchema();
        const existing = await this.getById(id, payload.company_id, authorization);
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, payload.company_id);
        (0, hrm_list_scope_1.assertResourceInHrmScope)(existing, scope, {
            notFoundCode: 'HRM-EBEN-404',
            mismatchCode: 'HRM-EBEN-409',
        });
        const fields = [];
        const values = [];
        const set = (column, value) => {
            values.push(value);
            fields.push(`${column} = $${values.length}`);
        };
        if (payload.name != null)
            set('name', payload.name.trim());
        if (payload.category != null)
            set('category', payload.category);
        if (payload.value != null)
            set('value', payload.value);
        if (payload.unit != null)
            set('unit', payload.unit);
        if (payload.frequency != null)
            set('frequency', payload.frequency);
        if (payload.start_date !== undefined)
            set('start_date', payload.start_date);
        if (payload.end_date !== undefined)
            set('end_date', payload.end_date);
        if (payload.status != null)
            set('status', payload.status);
        if (payload.description !== undefined)
            set('description', payload.description ?? null);
        if (fields.length === 0)
            return existing;
        fields.push('updated_at = NOW()');
        values.push(id);
        const res = await this.db.query(`UPDATE public.employee_benefits SET ${fields.join(', ')}
       WHERE id = $${values.length}::uuid
       RETURNING ${this.selectColumns};`, values);
        return this.mapRow(res.rows[0]);
    }
    async remove(id, companyId, authorization) {
        await this.ensureSchema();
        const existing = await this.getById(id, companyId, authorization);
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, companyId);
        (0, hrm_list_scope_1.assertResourceInHrmScope)(existing, scope, {
            notFoundCode: 'HRM-EBEN-404',
            mismatchCode: 'HRM-EBEN-409',
        });
        await this.db.query(`DELETE FROM public.employee_benefits WHERE id = $1::uuid;`, [id]);
        return { id };
    }
};
exports.EmployeeBenefitsService = EmployeeBenefitsService;
exports.EmployeeBenefitsService = EmployeeBenefitsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [hrm_db_service_1.HrmDbService])
], EmployeeBenefitsService);
//# sourceMappingURL=employee-benefits.service.js.map