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
exports.EmployeeInsurancesService = void 0;
const common_1 = require("@nestjs/common");
const node_crypto_1 = require("node:crypto");
const api_exception_1 = require("../common/api.exception");
const hrm_list_scope_1 = require("../common/hrm-list-scope");
const hrm_db_service_1 = require("../db/hrm-db.service");
let EmployeeInsurancesService = class EmployeeInsurancesService {
    db;
    constructor(db) {
        this.db = db;
    }
    selectColumns = `
    id, employee_id, company_id, type, provider, policy_number, start_date, end_date,
    contribution, employer_contribution, status, notes, created_at, updated_at
  `;
    async ensureSchema() {
        await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.employee_insurances (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_id UUID NOT NULL,
        company_id TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'social',
        provider TEXT NOT NULL,
        policy_number TEXT,
        start_date DATE,
        end_date DATE,
        contribution NUMERIC NOT NULL DEFAULT 0,
        employer_contribution NUMERIC NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'active',
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
        await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_employee_insurances_company_employee
      ON public.employee_insurances (company_id, employee_id);
    `);
    }
    mapRow(row) {
        return {
            ...row,
            contribution: Number(row.contribution ?? 0),
            employer_contribution: Number(row.employer_contribution ?? 0),
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
       FROM public.employee_insurances
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
       FROM public.employee_insurances
       WHERE ${filters.join(' AND ')}
       LIMIT 1;`, values);
        const row = res.rows[0];
        if (!row) {
            throw new api_exception_1.ApiException('HRM-EINS-404', 'Employee insurance not found', common_1.HttpStatus.NOT_FOUND);
        }
        return this.mapRow(row);
    }
    async create(payload, authorization) {
        await this.ensureSchema();
        const companyId = (0, hrm_list_scope_1.resolveHrmPersistCompanyIdText)(authorization, payload.company_id);
        const id = (0, node_crypto_1.randomUUID)();
        const res = await this.db.query(`INSERT INTO public.employee_insurances (
        id, employee_id, company_id, type, provider, policy_number, start_date, end_date,
        contribution, employer_contribution, status, notes
      ) VALUES (
        $1, $2::uuid, $3, $4, $5, $6, $7::date, $8::date, $9, $10, $11, $12
      )
      RETURNING ${this.selectColumns};`, [
            id,
            payload.employee_id,
            companyId,
            payload.type ?? 'social',
            payload.provider.trim(),
            payload.policy_number?.trim() ?? null,
            payload.start_date ?? null,
            payload.end_date ?? null,
            payload.contribution ?? 0,
            payload.employer_contribution ?? 0,
            payload.status ?? 'active',
            payload.notes ?? null,
        ]);
        return this.mapRow(res.rows[0]);
    }
    async update(id, payload, authorization) {
        await this.ensureSchema();
        const existing = await this.getById(id, payload.company_id, authorization);
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, payload.company_id);
        (0, hrm_list_scope_1.assertResourceInHrmScope)(existing, scope, {
            notFoundCode: 'HRM-EINS-404',
            mismatchCode: 'HRM-EINS-409',
        });
        const fields = [];
        const values = [];
        const set = (column, value) => {
            values.push(value);
            fields.push(`${column} = $${values.length}`);
        };
        if (payload.type != null)
            set('type', payload.type);
        if (payload.provider != null)
            set('provider', payload.provider.trim());
        if (payload.policy_number !== undefined)
            set('policy_number', payload.policy_number?.trim() ?? null);
        if (payload.start_date !== undefined)
            set('start_date', payload.start_date);
        if (payload.end_date !== undefined)
            set('end_date', payload.end_date);
        if (payload.contribution != null)
            set('contribution', payload.contribution);
        if (payload.employer_contribution != null)
            set('employer_contribution', payload.employer_contribution);
        if (payload.status != null)
            set('status', payload.status);
        if (payload.notes !== undefined)
            set('notes', payload.notes ?? null);
        if (fields.length === 0)
            return existing;
        fields.push('updated_at = NOW()');
        values.push(id);
        const res = await this.db.query(`UPDATE public.employee_insurances SET ${fields.join(', ')}
       WHERE id = $${values.length}::uuid
       RETURNING ${this.selectColumns};`, values);
        return this.mapRow(res.rows[0]);
    }
    async remove(id, companyId, authorization) {
        await this.ensureSchema();
        const existing = await this.getById(id, companyId, authorization);
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, companyId);
        (0, hrm_list_scope_1.assertResourceInHrmScope)(existing, scope, {
            notFoundCode: 'HRM-EINS-404',
            mismatchCode: 'HRM-EINS-409',
        });
        await this.db.query(`DELETE FROM public.employee_insurances WHERE id = $1::uuid;`, [id]);
        return { id };
    }
};
exports.EmployeeInsurancesService = EmployeeInsurancesService;
exports.EmployeeInsurancesService = EmployeeInsurancesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [hrm_db_service_1.HrmDbService])
], EmployeeInsurancesService);
//# sourceMappingURL=employee-insurances.service.js.map