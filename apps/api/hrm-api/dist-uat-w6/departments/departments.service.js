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
exports.DepartmentsService = void 0;
const common_1 = require("@nestjs/common");
const node_crypto_1 = require("node:crypto");
const api_exception_1 = require("../common/api.exception");
const hrm_list_scope_1 = require("../common/hrm-list-scope");
const hrm_db_service_1 = require("../db/hrm-db.service");
let DepartmentsService = class DepartmentsService {
    db;
    constructor(db) {
        this.db = db;
    }
    async ensureSchema() {
        await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.departments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL,
        parent_id UUID REFERENCES public.departments (id) ON DELETE SET NULL,
        name TEXT NOT NULL,
        code TEXT,
        description TEXT,
        manager_name TEXT,
        manager_email TEXT,
        employee_count INTEGER NOT NULL DEFAULT 0,
        level INTEGER NOT NULL DEFAULT 1,
        sort_order INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'active',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
        await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_departments_company_status
      ON public.departments (company_id, status, sort_order);
    `);
    }
    mapRow(row) {
        return {
            ...row,
            employee_count: Number(row.employee_count ?? 0),
            level: Number(row.level ?? 1),
            sort_order: Number(row.sort_order ?? 0),
        };
    }
    selectColumns = `
    id, company_id, parent_id, name, code, description, manager_name, manager_email,
    employee_count, level, sort_order, status, created_at, updated_at
  `;
    async listDepartments(query, authorization) {
        await this.ensureSchema();
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, query.company_id);
        const filters = [];
        const values = [];
        (0, hrm_list_scope_1.pushCompanyIdFilter)(filters, values, scope.companyIds);
        if (query.status) {
            values.push(query.status);
            filters.push(`status = $${values.length}`);
        }
        else {
            filters.push(`status = 'active'`);
        }
        const res = await this.db.query(`SELECT ${this.selectColumns}
       FROM public.departments
       WHERE ${filters.join(' AND ')}
       ORDER BY sort_order ASC, name ASC;`, values);
        const data = res.rows.map((row) => this.mapRow(row));
        return { total: data.length, data };
    }
    async getDepartmentById(departmentId, companyId, authorization) {
        await this.ensureSchema();
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, companyId);
        const filters = ['id = $1::uuid'];
        const values = [departmentId];
        (0, hrm_list_scope_1.pushCompanyIdFilter)(filters, values, scope.companyIds);
        const res = await this.db.query(`SELECT ${this.selectColumns}
       FROM public.departments
       WHERE ${filters.join(' AND ')}
       LIMIT 1;`, values);
        const row = res.rows[0];
        if (!row) {
            throw new api_exception_1.ApiException('HRM-DEPT-404', 'Department not found', common_1.HttpStatus.NOT_FOUND);
        }
        return this.mapRow(row);
    }
    async createDepartment(payload, authorization) {
        await this.ensureSchema();
        const companyId = (0, hrm_list_scope_1.resolveHrmPersistCompanyIdText)(authorization, payload.company_id);
        const id = (0, node_crypto_1.randomUUID)();
        const res = await this.db.query(`INSERT INTO public.departments (
        id, company_id, parent_id, name, code, description, manager_name, manager_email,
        level, sort_order, status
      ) VALUES (
        $1, $2, $3::uuid, $4, $5, $6, $7, $8, $9, $10, 'active'
      )
      RETURNING ${this.selectColumns};`, [
            id,
            companyId,
            payload.parent_id ?? null,
            payload.name.trim(),
            payload.code?.trim() ?? null,
            payload.description ?? null,
            payload.manager_name?.trim() ?? null,
            payload.manager_email?.trim() ?? null,
            payload.level ?? 1,
            payload.sort_order ?? 0,
        ]);
        return this.mapRow(res.rows[0]);
    }
    async updateDepartment(departmentId, payload, authorization) {
        await this.ensureSchema();
        const existing = await this.getDepartmentById(departmentId, payload.company_id, authorization);
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, payload.company_id);
        (0, hrm_list_scope_1.assertResourceInHrmScope)(existing, scope, {
            notFoundCode: 'HRM-DEPT-404',
            mismatchCode: 'HRM-DEPT-409',
        });
        const fields = [];
        const values = [];
        const set = (column, value) => {
            values.push(value);
            fields.push(`${column} = $${values.length}`);
        };
        if (payload.name != null)
            set('name', payload.name.trim());
        if (payload.code !== undefined)
            set('code', payload.code?.trim() ?? null);
        if (payload.description !== undefined)
            set('description', payload.description ?? null);
        if (payload.manager_name !== undefined)
            set('manager_name', payload.manager_name?.trim() ?? null);
        if (payload.manager_email !== undefined)
            set('manager_email', payload.manager_email?.trim() ?? null);
        if (payload.parent_id !== undefined)
            set('parent_id', payload.parent_id);
        if (payload.level != null)
            set('level', payload.level);
        if (payload.sort_order != null)
            set('sort_order', payload.sort_order);
        if (payload.status != null)
            set('status', payload.status);
        if (fields.length === 0)
            return existing;
        fields.push('updated_at = NOW()');
        values.push(departmentId);
        const res = await this.db.query(`UPDATE public.departments SET ${fields.join(', ')}
       WHERE id = $${values.length}::uuid
       RETURNING ${this.selectColumns};`, values);
        return this.mapRow(res.rows[0]);
    }
    async deleteDepartment(departmentId, companyId, authorization) {
        await this.ensureSchema();
        const existing = await this.getDepartmentById(departmentId, companyId, authorization);
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, companyId);
        (0, hrm_list_scope_1.assertResourceInHrmScope)(existing, scope, {
            notFoundCode: 'HRM-DEPT-404',
            mismatchCode: 'HRM-DEPT-409',
        });
        await this.db.query(`DELETE FROM public.departments WHERE id = $1::uuid;`, [departmentId]);
        return { id: departmentId };
    }
};
exports.DepartmentsService = DepartmentsService;
exports.DepartmentsService = DepartmentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [hrm_db_service_1.HrmDbService])
], DepartmentsService);
//# sourceMappingURL=departments.service.js.map