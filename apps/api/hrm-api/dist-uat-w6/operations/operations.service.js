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
exports.OperationsService = void 0;
exports.mapServiceRequestRow = mapServiceRequestRow;
const common_1 = require("@nestjs/common");
const node_crypto_1 = require("node:crypto");
const api_exception_1 = require("../common/api.exception");
const hrm_list_scope_1 = require("../common/hrm-list-scope");
const hrm_db_service_1 = require("../db/hrm-db.service");
const attendance_event_fanout_service_1 = require("../notifications/attendance-event-fanout.service");
function mapServiceRequestRow(row) {
    return { ...row, request_type: row.service_type };
}
let OperationsService = class OperationsService {
    db;
    fanout;
    constructor(db, fanout) {
        this.db = db;
        this.fanout = fanout;
    }
    assertOperationsCompanyWire(requestedCompanyId) {
        const trimmed = requestedCompanyId.trim();
        if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(trimmed)) {
            if (!(0, hrm_list_scope_1.isHrmMappedCompanyUuid)(trimmed)) {
                (0, hrm_list_scope_1.assertHrmMappedCompanyUuidOrThrow)(trimmed);
            }
        }
    }
    toServiceRequestRealtimePayload(row) {
        return {
            id: row.id,
            company_id: row.company_id,
            employee_id: row.employee_id,
            employee_name: row.employee_name,
            employee_code: row.employee_code,
            service_type: row.service_type,
            request_date: row.request_date,
            status: row.status,
            notes: row.notes,
            created_at: row.created_at,
            updated_at: row.updated_at,
            approved_by: row.approved_by,
            approved_at: row.approved_at,
            rejected_reason: row.rejected_reason,
        };
    }
    async ensureSchema() {
        await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.hrm_tasks (
        id UUID PRIMARY KEY,
        company_id UUID NOT NULL,
        title TEXT NOT NULL,
        description TEXT NULL,
        priority TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'todo',
        due_date DATE NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT chk_hrm_task_priority CHECK (priority IN ('low', 'medium', 'high')),
        CONSTRAINT chk_hrm_task_status CHECK (status IN ('todo', 'in_progress', 'done', 'blocked'))
      );
    `);
        await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.service_requests (
        id UUID PRIMARY KEY,
        company_id UUID NOT NULL,
        service_type TEXT NOT NULL,
        employee_id UUID NULL,
        employee_name TEXT NOT NULL,
        employee_code TEXT NULL,
        department TEXT NULL,
        request_date DATE NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        notes TEXT NULL,
        meal_type TEXT NULL,
        meal_date DATE NULL,
        meal_quantity INT NULL,
        vehicle_purpose TEXT NULL,
        vehicle_destination TEXT NULL,
        vehicle_date DATE NULL,
        vehicle_time_start TEXT NULL,
        vehicle_time_end TEXT NULL,
        vehicle_passengers INT NULL,
        supply_items JSONB NULL,
        supply_urgency TEXT NULL,
        approved_by TEXT NULL,
        approved_at TIMESTAMPTZ NULL,
        rejected_reason TEXT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
        await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_service_requests_company_status
      ON public.service_requests (company_id, status, created_at DESC);
    `);
    }
    async createTask(payload, authorization, tenantId) {
        await this.ensureSchema();
        const companyId = (0, hrm_list_scope_1.resolveHrmOperationsPersistCompanyId)(authorization, payload.company_id, { tenantId });
        const res = await this.db.query(`INSERT INTO public.hrm_tasks
        (id, company_id, title, description, priority, status, due_date)
       VALUES ($1, $2::uuid, $3, $4, $5, 'todo', $6::date)
       RETURNING id, company_id, title, description, priority, status, due_date, created_at, updated_at;`, [(0, node_crypto_1.randomUUID)(), companyId, payload.title.trim(), payload.description?.trim() ?? null, payload.priority, payload.due_date ?? null]);
        return res.rows[0];
    }
    async listTasks(query, authorization, tenantId) {
        await this.ensureSchema();
        this.assertOperationsCompanyWire(query.company_id);
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, query.company_id, { tenantId });
        const filters = [];
        const values = [];
        (0, hrm_list_scope_1.pushCompanyIdUuidFilter)(filters, values, scope.companyIds);
        const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';
        const page = query.page ?? 1;
        const pageSize = query.page_size ?? 20;
        const offset = (page - 1) * pageSize;
        const countRes = await this.db.query(`SELECT COUNT(*)::text AS total FROM public.hrm_tasks ${whereClause};`, values);
        const listValues = [...values, pageSize, offset];
        const res = await this.db.query(`SELECT id, company_id, title, description, priority, status, due_date, created_at, updated_at
       FROM public.hrm_tasks
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${listValues.length - 1} OFFSET $${listValues.length};`, listValues);
        return { total: Number(countRes.rows[0]?.total ?? 0), page, page_size: pageSize, data: res.rows };
    }
    guardUuidResourceMutate(resource, authorization, requestedCompanyId, tenantId, codes) {
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, requestedCompanyId, { tenantId });
        (0, hrm_list_scope_1.assertResourceInHrmScope)(resource, scope, {
            notFoundCode: codes.notFound,
            mismatchCode: codes.mismatch,
        });
    }
    async loadTaskCompanyRow(taskId) {
        const res = await this.db.query(`SELECT company_id::text AS company_id FROM public.hrm_tasks WHERE id = $1::uuid LIMIT 1;`, [taskId]);
        return res.rows[0] ?? null;
    }
    async loadServiceRequestCompanyRow(requestId) {
        const res = await this.db.query(`SELECT company_id::text AS company_id FROM public.service_requests WHERE id = $1::uuid LIMIT 1;`, [requestId]);
        return res.rows[0] ?? null;
    }
    async updateTaskStatus(taskId, payload, requestedCompanyId, authorization, tenantId) {
        await this.ensureSchema();
        const existing = await this.loadTaskCompanyRow(taskId);
        this.guardUuidResourceMutate(existing, authorization, requestedCompanyId, tenantId, {
            notFound: 'HRM-OPS-404',
            mismatch: 'HRM-OPS-409',
        });
        const res = await this.db.query(`UPDATE public.hrm_tasks
       SET status = $1, updated_at = NOW()
       WHERE id = $2::uuid
       RETURNING id, company_id, title, description, priority, status, due_date, created_at, updated_at;`, [payload.status, taskId]);
        if (!res.rows[0]) {
            throw new api_exception_1.ApiException('HRM-OPS-404', 'Task not found', common_1.HttpStatus.NOT_FOUND);
        }
        return res.rows[0];
    }
    async createServiceRequest(payload, authorization, tenantId) {
        await this.ensureSchema();
        const companyId = (0, hrm_list_scope_1.resolveHrmOperationsPersistCompanyId)(authorization, payload.company_id, { tenantId });
        const res = await this.db.query(`
        INSERT INTO public.service_requests (
          id, company_id, service_type, employee_id, employee_name, employee_code, department,
          request_date, status, notes, meal_type, meal_date, meal_quantity,
          vehicle_purpose, vehicle_destination, vehicle_date, vehicle_time_start, vehicle_time_end,
          vehicle_passengers, supply_items, supply_urgency
        ) VALUES (
          $1, $2::uuid, $3, $4::uuid, $5, $6, $7,
          $8::date, 'pending', $9, $10, $11::date, $12,
          $13, $14, $15::date, $16, $17,
          $18, $19::jsonb, $20
        )
        RETURNING *;
      `, [
            (0, node_crypto_1.randomUUID)(),
            companyId,
            payload.service_type.trim(),
            payload.employee_id ?? null,
            payload.employee_name.trim(),
            payload.employee_code?.trim() ?? null,
            payload.department?.trim() ?? null,
            payload.request_date,
            payload.notes?.trim() ?? null,
            payload.meal_type?.trim() ?? null,
            payload.meal_date ?? null,
            payload.meal_quantity ? Number(payload.meal_quantity) : null,
            payload.vehicle_purpose?.trim() ?? null,
            payload.vehicle_destination?.trim() ?? null,
            payload.vehicle_date ?? null,
            payload.vehicle_time_start?.trim() ?? null,
            payload.vehicle_time_end?.trim() ?? null,
            payload.vehicle_passengers ? Number(payload.vehicle_passengers) : null,
            payload.supply_items ?? null,
            payload.supply_urgency?.trim() ?? null,
        ]);
        const row = res.rows[0];
        if (!row) {
            throw new api_exception_1.ApiException('HRM-OPS-500', 'Failed to create service request', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        await this.fanout.onServiceRequestCreated(this.toServiceRequestRealtimePayload(row));
        return mapServiceRequestRow(row);
    }
    async listServiceRequests(query, authorization, tenantId) {
        await this.ensureSchema();
        this.assertOperationsCompanyWire(query.company_id);
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, query.company_id, { tenantId });
        const clauses = [];
        const values = [];
        (0, hrm_list_scope_1.pushCompanyIdUuidFilter)(clauses, values, scope.companyIds);
        if (query.service_type) {
            values.push(query.service_type);
            clauses.push(`service_type = $${values.length}`);
        }
        const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
        const res = await this.db.query(`
        SELECT * FROM public.service_requests
        ${whereClause}
        ORDER BY created_at DESC;
      `, values);
        return res.rows.map(mapServiceRequestRow);
    }
    async updateServiceRequest(requestId, payload, requestedCompanyId, authorization, tenantId) {
        await this.ensureSchema();
        const existing = await this.loadServiceRequestCompanyRow(requestId);
        this.guardUuidResourceMutate(existing, authorization, requestedCompanyId, tenantId, {
            notFound: 'HRM-SVC-404',
            mismatch: 'HRM-SVC-409',
        });
        const res = await this.db.query(`
        UPDATE public.service_requests
        SET
          status = COALESCE($1, status),
          notes = COALESCE($2, notes),
          meal_type = COALESCE($3, meal_type),
          meal_date = COALESCE($4::date, meal_date),
          meal_quantity = COALESCE($5, meal_quantity),
          vehicle_purpose = COALESCE($6, vehicle_purpose),
          vehicle_destination = COALESCE($7, vehicle_destination),
          vehicle_date = COALESCE($8::date, vehicle_date),
          vehicle_time_start = COALESCE($9, vehicle_time_start),
          vehicle_time_end = COALESCE($10, vehicle_time_end),
          vehicle_passengers = COALESCE($11, vehicle_passengers),
          supply_items = COALESCE($12::jsonb, supply_items),
          supply_urgency = COALESCE($13, supply_urgency),
          updated_at = NOW()
        WHERE id = $14::uuid
        RETURNING *;
      `, [
            payload.status?.trim() ?? null,
            payload.notes?.trim() ?? null,
            payload.meal_type?.trim() ?? null,
            payload.meal_date ?? null,
            payload.meal_quantity ? Number(payload.meal_quantity) : null,
            payload.vehicle_purpose?.trim() ?? null,
            payload.vehicle_destination?.trim() ?? null,
            payload.vehicle_date ?? null,
            payload.vehicle_time_start?.trim() ?? null,
            payload.vehicle_time_end?.trim() ?? null,
            payload.vehicle_passengers ? Number(payload.vehicle_passengers) : null,
            payload.supply_items ?? null,
            payload.supply_urgency?.trim() ?? null,
            requestId,
        ]);
        if (!res.rows[0]) {
            throw new api_exception_1.ApiException('HRM-SVC-404', 'Service request not found', common_1.HttpStatus.NOT_FOUND);
        }
        return mapServiceRequestRow(res.rows[0]);
    }
    async deleteServiceRequest(requestId, requestedCompanyId, authorization, tenantId) {
        await this.ensureSchema();
        const existing = await this.loadServiceRequestCompanyRow(requestId);
        this.guardUuidResourceMutate(existing, authorization, requestedCompanyId, tenantId, {
            notFound: 'HRM-SVC-404',
            mismatch: 'HRM-SVC-409',
        });
        const res = await this.db.query(`DELETE FROM public.service_requests WHERE id = $1::uuid RETURNING id;`, [requestId]);
        if (!res.rows[0]) {
            throw new api_exception_1.ApiException('HRM-SVC-404', 'Service request not found', common_1.HttpStatus.NOT_FOUND);
        }
        return { id: requestId };
    }
    async approveServiceRequest(requestId, payload, requestedCompanyId, authorization, tenantId) {
        await this.ensureSchema();
        const existing = await this.loadServiceRequestCompanyRow(requestId);
        this.guardUuidResourceMutate(existing, authorization, requestedCompanyId, tenantId, {
            notFound: 'HRM-SVC-404',
            mismatch: 'HRM-SVC-409',
        });
        const res = await this.db.query(`
        UPDATE public.service_requests
        SET status = 'approved',
            approved_by = COALESCE($1, approved_by),
            approved_at = NOW(),
            rejected_reason = NULL,
            updated_at = NOW()
        WHERE id = $2::uuid
        RETURNING *;
      `, [payload.approved_by?.trim() ?? null, requestId]);
        if (!res.rows[0]) {
            throw new api_exception_1.ApiException('HRM-SVC-404', 'Service request not found', common_1.HttpStatus.NOT_FOUND);
        }
        const row = res.rows[0];
        await this.fanout.onServiceRequestDecided('approved', this.toServiceRequestRealtimePayload(row));
        return mapServiceRequestRow(row);
    }
    async rejectServiceRequest(requestId, payload, requestedCompanyId, authorization, tenantId) {
        await this.ensureSchema();
        const existing = await this.loadServiceRequestCompanyRow(requestId);
        this.guardUuidResourceMutate(existing, authorization, requestedCompanyId, tenantId, {
            notFound: 'HRM-SVC-404',
            mismatch: 'HRM-SVC-409',
        });
        const res = await this.db.query(`
        UPDATE public.service_requests
        SET status = 'rejected',
            rejected_reason = $1,
            approved_by = COALESCE($2, approved_by),
            approved_at = NULL,
            updated_at = NOW()
        WHERE id = $3::uuid
        RETURNING *;
      `, [payload.rejected_reason?.trim() ?? null, payload.approved_by?.trim() ?? null, requestId]);
        if (!res.rows[0]) {
            throw new api_exception_1.ApiException('HRM-SVC-404', 'Service request not found', common_1.HttpStatus.NOT_FOUND);
        }
        const row = res.rows[0];
        await this.fanout.onServiceRequestDecided('rejected', this.toServiceRequestRealtimePayload(row));
        return mapServiceRequestRow(row);
    }
    async countByScope(table, scope, mode) {
        const filters = [];
        const values = [];
        if (mode === 'workforce') {
            (0, hrm_list_scope_1.pushWorkforceEmployeeScopeFilter)(filters, values, scope);
        }
        else if (mode === 'company_uuid') {
            (0, hrm_list_scope_1.pushCompanyIdUuidFilter)(filters, values, scope.companyIds);
        }
        else {
            (0, hrm_list_scope_1.pushCompanyIdFilter)(filters, values, scope.companyIds);
        }
        const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';
        const res = await this.db.query(`SELECT COUNT(*)::text AS total FROM public.${table} ${whereClause};`, values);
        return Number(res.rows[0]?.total ?? 0);
    }
    async getSummary(requestedCompanyId, authorization, tenantId) {
        await this.ensureSchema();
        this.assertOperationsCompanyWire(requestedCompanyId);
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, requestedCompanyId, { tenantId });
        const [attendance, payroll, recruitment, tasks, serviceRequests] = await Promise.all([
            this.countByScope('attendance_records', scope, 'workforce'),
            this.countByScope('payroll_periods', scope, 'company_text'),
            this.countByScope('job_requisitions', scope, 'company_text'),
            this.countByScope('hrm_tasks', scope, 'company_uuid'),
            this.countByScope('service_requests', scope, 'company_uuid'),
        ]);
        return {
            attendance_records: attendance,
            payroll_periods: payroll,
            job_requisitions: recruitment,
            tasks,
            service_requests: serviceRequests,
        };
    }
};
exports.OperationsService = OperationsService;
exports.OperationsService = OperationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [hrm_db_service_1.HrmDbService,
        attendance_event_fanout_service_1.AttendanceEventFanoutService])
], OperationsService);
//# sourceMappingURL=operations.service.js.map