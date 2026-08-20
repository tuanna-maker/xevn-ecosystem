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
exports.EmployeeKpisService = void 0;
const common_1 = require("@nestjs/common");
const node_crypto_1 = require("node:crypto");
const api_exception_1 = require("../common/api.exception");
const hrm_list_scope_1 = require("../common/hrm-list-scope");
const hrm_db_service_1 = require("../db/hrm-db.service");
let EmployeeKpisService = class EmployeeKpisService {
    db;
    constructor(db) {
        this.db = db;
    }
    async ensureSchema() {
        await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.employee_kpis (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_id UUID NOT NULL,
        company_id TEXT NOT NULL,
        kpi_name TEXT NOT NULL,
        kpi_type TEXT,
        target_value NUMERIC,
        actual_value NUMERIC,
        unit TEXT,
        weight NUMERIC,
        period_start DATE,
        period_end DATE,
        status TEXT NOT NULL DEFAULT 'active',
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
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
        const res = await this.db.query(`SELECT * FROM public.employee_kpis
       WHERE ${filters.join(' AND ')}
       ORDER BY period_end DESC NULLS LAST, created_at DESC;`, values);
        return { total: res.rows.length, data: res.rows };
    }
    async create(payload, authorization) {
        await this.ensureSchema();
        const companyId = (0, hrm_list_scope_1.resolveHrmPersistCompanyIdText)(authorization, payload.company_id);
        const id = (0, node_crypto_1.randomUUID)();
        const res = await this.db.query(`INSERT INTO public.employee_kpis (
        id, employee_id, company_id, kpi_name, kpi_type, target_value, actual_value,
        unit, weight, period_start, period_end, status, notes
      ) VALUES (
        $1, $2::uuid, $3, $4, $5, $6, $7, $8, $9, $10::date, $11::date, $12, $13
      ) RETURNING *;`, [
            id,
            payload.employee_id,
            companyId,
            payload.kpi_name.trim(),
            payload.kpi_type ?? null,
            payload.target_value ?? null,
            payload.actual_value ?? null,
            payload.unit ?? null,
            payload.weight ?? null,
            payload.period_start ?? null,
            payload.period_end ?? null,
            payload.status ?? 'active',
            payload.notes ?? null,
        ]);
        return res.rows[0];
    }
    async remove(id, companyId, authorization) {
        await this.ensureSchema();
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, companyId);
        const filters = ['id = $1::uuid'];
        const values = [id];
        (0, hrm_list_scope_1.pushCompanyIdFilter)(filters, values, scope.companyIds);
        const res = await this.db.query(`DELETE FROM public.employee_kpis WHERE ${filters.join(' AND ')} RETURNING id;`, values);
        if (!res.rows[0]) {
            throw new api_exception_1.ApiException('HRM-KPI-404', 'Employee KPI not found', common_1.HttpStatus.NOT_FOUND);
        }
        return { id };
    }
};
exports.EmployeeKpisService = EmployeeKpisService;
exports.EmployeeKpisService = EmployeeKpisService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [hrm_db_service_1.HrmDbService])
], EmployeeKpisService);
//# sourceMappingURL=employee-kpis.service.js.map