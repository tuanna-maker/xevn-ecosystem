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
exports.PerformanceService = void 0;
const common_1 = require("@nestjs/common");
const node_crypto_1 = require("node:crypto");
const api_exception_1 = require("../common/api.exception");
const hrm_list_scope_1 = require("../common/hrm-list-scope");
const hrm_db_service_1 = require("../db/hrm-db.service");
let PerformanceService = class PerformanceService {
    db;
    constructor(db) {
        this.db = db;
    }
    async ensureSchema() {
        await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.performance_cycles (
        id UUID PRIMARY KEY,
        company_id TEXT NOT NULL,
        cycle_name TEXT NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        status TEXT NOT NULL DEFAULT 'draft',
        created_by TEXT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT chk_performance_cycle_status CHECK (status IN ('draft', 'active', 'closed')),
        CONSTRAINT chk_performance_cycle_dates CHECK (start_date <= end_date)
      );
    `);
        await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.performance_evaluations (
        id UUID PRIMARY KEY,
        company_id TEXT NOT NULL,
        employee_id UUID NOT NULL,
        cycle_id UUID NOT NULL REFERENCES public.performance_cycles(id) ON DELETE CASCADE,
        score NUMERIC(5,2) NOT NULL,
        summary TEXT NOT NULL,
        reviewer TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT chk_performance_score CHECK (score >= 0 AND score <= 100)
      );
    `);
        await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_performance_cycles_company_status
      ON public.performance_cycles (company_id, status, start_date DESC);
    `);
        await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_performance_evaluations_company_cycle
      ON public.performance_evaluations (company_id, cycle_id, created_at DESC);
    `);
    }
    async createCycle(payload, authorization) {
        await this.ensureSchema();
        if (new Date(payload.start_date).getTime() > new Date(payload.end_date).getTime()) {
            throw new api_exception_1.ApiException('HRM-PERF-001', 'start_date must be <= end_date', common_1.HttpStatus.BAD_REQUEST);
        }
        const companyId = (0, hrm_list_scope_1.resolveHrmPersistCompanyIdText)(authorization, payload.company_id);
        const res = await this.db.query(`
        INSERT INTO public.performance_cycles
          (id, company_id, cycle_name, start_date, end_date, created_by, status)
        VALUES ($1, $2, $3, $4::date, $5::date, $6, 'draft')
        RETURNING id, company_id, cycle_name, start_date, end_date, status, created_by, created_at, updated_at;
      `, [
            (0, node_crypto_1.randomUUID)(),
            companyId,
            payload.cycle_name.trim(),
            payload.start_date,
            payload.end_date,
            payload.created_by,
        ]);
        return res.rows[0];
    }
    async listCycles(query, authorization) {
        await this.ensureSchema();
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, query.company_id);
        const filters = [];
        const values = [];
        (0, hrm_list_scope_1.pushCompanyIdFilter)(filters, values, scope.companyIds);
        if (query.status) {
            filters.push(`status = $${values.length + 1}`);
            values.push(query.status);
        }
        const res = await this.db.query(`
        SELECT id, company_id, cycle_name, start_date, end_date, status, created_by, created_at, updated_at
        FROM public.performance_cycles
        WHERE ${filters.join(' AND ')}
        ORDER BY start_date DESC, created_at DESC;
      `, values);
        return { total: res.rows.length, data: res.rows };
    }
    async createEvaluation(payload, authorization) {
        await this.ensureSchema();
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, payload.company_id);
        const cycleFilters = ['id = $1::uuid'];
        const cycleValues = [payload.cycle_id];
        (0, hrm_list_scope_1.pushCompanyIdFilter)(cycleFilters, cycleValues, scope.companyIds);
        const cycleRes = await this.db.query(`SELECT id, company_id FROM public.performance_cycles WHERE ${cycleFilters.join(' AND ')} LIMIT 1;`, cycleValues);
        if (!cycleRes.rows[0]) {
            throw new api_exception_1.ApiException('HRM-PERF-404', 'Performance cycle not found', common_1.HttpStatus.NOT_FOUND);
        }
        const res = await this.db.query(`
        INSERT INTO public.performance_evaluations
          (id, company_id, employee_id, cycle_id, score, summary, reviewer)
        VALUES ($1, $2, $3::uuid, $4::uuid, $5, $6, $7)
        RETURNING id, company_id, employee_id, cycle_id, score, summary, reviewer, created_at, updated_at;
      `, [
            (0, node_crypto_1.randomUUID)(),
            cycleRes.rows[0].company_id,
            payload.employee_id,
            payload.cycle_id,
            payload.score,
            payload.summary.trim(),
            payload.reviewer.trim(),
        ]);
        return res.rows[0];
    }
    async listEvaluations(query, authorization) {
        await this.ensureSchema();
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, query.company_id);
        const filters = [];
        const values = [];
        (0, hrm_list_scope_1.pushCompanyIdFilter)(filters, values, scope.companyIds);
        if (query.employee_id) {
            filters.push(`employee_id = $${values.length + 1}::uuid`);
            values.push(query.employee_id);
        }
        if (query.cycle_id) {
            filters.push(`cycle_id = $${values.length + 1}::uuid`);
            values.push(query.cycle_id);
        }
        const res = await this.db.query(`
        SELECT id, company_id, employee_id, cycle_id, score, summary, reviewer, created_at, updated_at
        FROM public.performance_evaluations
        WHERE ${filters.join(' AND ')}
        ORDER BY created_at DESC;
      `, values);
        return { total: res.rows.length, data: res.rows };
    }
};
exports.PerformanceService = PerformanceService;
exports.PerformanceService = PerformanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [hrm_db_service_1.HrmDbService])
], PerformanceService);
//# sourceMappingURL=performance.service.js.map