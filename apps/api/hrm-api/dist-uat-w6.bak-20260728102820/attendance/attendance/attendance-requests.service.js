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
exports.AttendanceRequestsService = void 0;
const common_1 = require("@nestjs/common");
const node_crypto_1 = require("node:crypto");
const api_exception_1 = require("../common/api.exception");
const hrm_list_scope_1 = require("../common/hrm-list-scope");
const hrm_db_service_1 = require("../db/hrm-db.service");
let AttendanceRequestsService = class AttendanceRequestsService {
    db;
    constructor(db) {
        this.db = db;
    }
    async ensureSchema() {
        await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.overtime_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL,
        employee_id UUID NOT NULL,
        employee_code TEXT NOT NULL,
        employee_name TEXT NOT NULL,
        department TEXT,
        position TEXT,
        overtime_date DATE NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        total_hours NUMERIC NOT NULL DEFAULT 0,
        overtime_type TEXT NOT NULL DEFAULT 'weekday',
        coefficient NUMERIC DEFAULT 1.5,
        reason TEXT NOT NULL,
        compensation_type TEXT DEFAULT 'salary',
        approver_id UUID,
        approver_name TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        approved_at TIMESTAMPTZ,
        rejected_reason TEXT,
        actual_hours NUMERIC,
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
        await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.business_trip_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL,
        employee_id UUID NOT NULL,
        employee_code TEXT NOT NULL,
        employee_name TEXT NOT NULL,
        department TEXT,
        position TEXT,
        destination TEXT NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        total_days NUMERIC NOT NULL DEFAULT 1,
        purpose TEXT NOT NULL,
        transportation TEXT DEFAULT 'company_car',
        accommodation TEXT,
        estimated_cost NUMERIC DEFAULT 0,
        advance_amount NUMERIC DEFAULT 0,
        companions TEXT,
        contact_info TEXT,
        approver_id UUID,
        approver_name TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        approved_at TIMESTAMPTZ,
        rejected_reason TEXT,
        actual_cost NUMERIC,
        expense_report_url TEXT,
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
        await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.late_early_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL,
        employee_id UUID NOT NULL,
        employee_code TEXT NOT NULL,
        employee_name TEXT NOT NULL,
        department TEXT,
        position TEXT,
        request_date DATE NOT NULL,
        request_type TEXT NOT NULL DEFAULT 'late',
        late_time TIME,
        late_minutes INTEGER DEFAULT 0,
        early_time TIME,
        early_minutes INTEGER DEFAULT 0,
        reason TEXT NOT NULL,
        approver_id UUID,
        approver_name TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        approved_at TIMESTAMPTZ,
        rejected_reason TEXT,
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
        await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.shift_change_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL,
        employee_id UUID NOT NULL,
        employee_code TEXT NOT NULL,
        employee_name TEXT NOT NULL,
        department TEXT,
        position TEXT,
        change_date DATE NOT NULL,
        change_type TEXT NOT NULL DEFAULT 'change',
        current_shift TEXT NOT NULL,
        current_shift_time TEXT,
        requested_shift TEXT NOT NULL,
        requested_shift_time TEXT,
        swap_with_employee_id UUID,
        swap_with_employee_name TEXT,
        swap_with_employee_code TEXT,
        reason TEXT NOT NULL,
        approver_id UUID,
        approver_name TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        approved_at TIMESTAMPTZ,
        rejected_reason TEXT,
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    }
    buildListSql(table, alias, scope, query) {
        const params = [];
        const filters = [];
        if (scope.masterTenantPartition || scope.memberTenantId) {
            (0, hrm_list_scope_1.pushWorkforceEmployeeScopeFilter)(filters, params, scope, `${alias}.employee_id`);
        }
        else {
            (0, hrm_list_scope_1.pushCompanyIdFilter)(filters, params, scope.companyIds);
        }
        let sql = `SELECT ${alias}.* FROM public.${table} ${alias} WHERE ${filters.join(' AND ')}`;
        if (query.status?.trim()) {
            params.push(query.status.trim());
            sql += ` AND ${alias}.status = $${params.length}`;
        }
        if (query.employee_id) {
            params.push(query.employee_id);
            sql += ` AND ${alias}.employee_id = $${params.length}::uuid`;
        }
        sql += ` ORDER BY ${alias}.created_at DESC LIMIT 200`;
        return { sql, params };
    }
    async loadCompanyId(table, requestId) {
        const res = await this.db.query(`SELECT company_id FROM public.${table} WHERE id = $1::uuid LIMIT 1;`, [requestId]);
        return res.rows[0] ?? null;
    }
    async decideRequest(table, requestId, decision, body, requestedCompanyId, authorization, tenantId) {
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, requestedCompanyId, { tenantId });
        const existing = await this.loadCompanyId(table, requestId);
        (0, hrm_list_scope_1.assertResourceInHrmScope)(existing, scope, {
            notFoundCode: 'HRM-ATT-REQ-404',
            mismatchCode: 'HRM-ATT-REQ-409',
        });
        const res = await this.db.query(`
        UPDATE public.${table}
        SET status = $2,
            approved_at = CASE WHEN $2 = 'approved' THEN NOW() ELSE approved_at END,
            rejected_reason = $3,
            approver_name = COALESCE($4, approver_name),
            updated_at = NOW()
        WHERE id = $1::uuid AND status = 'pending'
        RETURNING *;
      `, [
            requestId,
            decision,
            decision === 'rejected' ? body.rejected_reason?.trim() ?? null : null,
            body.reviewer_name.trim(),
        ]);
        const row = res.rows[0];
        if (!row) {
            throw new api_exception_1.ApiException('HRM-ATT-REQ-404', 'Attendance request not found or not pending', common_1.HttpStatus.NOT_FOUND);
        }
        return row;
    }
    async deleteRequest(table, requestId, requestedCompanyId, authorization, tenantId) {
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, requestedCompanyId, { tenantId });
        const existing = await this.loadCompanyId(table, requestId);
        (0, hrm_list_scope_1.assertResourceInHrmScope)(existing, scope, {
            notFoundCode: 'HRM-ATT-REQ-404',
            mismatchCode: 'HRM-ATT-REQ-409',
        });
        const res = await this.db.query(`DELETE FROM public.${table} WHERE id = $1::uuid RETURNING id;`, [requestId]);
        if (!res.rows[0]) {
            throw new api_exception_1.ApiException('HRM-ATT-REQ-404', 'Attendance request not found', common_1.HttpStatus.NOT_FOUND);
        }
        return { id: requestId, deleted: true };
    }
    async listOvertimeRequests(query, authorization, tenantId) {
        await this.ensureSchema();
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, query.company_id, { tenantId });
        const { sql, params } = this.buildListSql('overtime_requests', 'ot', scope, query);
        const res = await this.db.query(sql, params);
        return { total: res.rows.length, data: res.rows };
    }
    async createOvertimeRequest(body, authorization) {
        await this.ensureSchema();
        const companyId = (0, hrm_list_scope_1.resolveHrmPersistCompanyIdText)(authorization, body.company_id);
        const id = (0, node_crypto_1.randomUUID)();
        const res = await this.db.query(`
        INSERT INTO public.overtime_requests (
          id, company_id, employee_id, employee_code, employee_name, department, position,
          overtime_date, start_time, end_time, total_hours, overtime_type, coefficient,
          reason, compensation_type, approver_name, status
        ) VALUES (
          $1::uuid, $2, $3::uuid, $4, $5, $6, $7,
          $8::date, $9::time, $10::time, $11, $12, $13,
          $14, $15, $16, 'pending'
        )
        RETURNING *;
      `, [
            id,
            companyId,
            body.employee_id,
            body.employee_code.trim(),
            body.employee_name.trim(),
            body.department?.trim() ?? null,
            body.position?.trim() ?? null,
            body.overtime_date,
            body.start_time,
            body.end_time,
            body.total_hours,
            body.overtime_type.trim(),
            body.coefficient ?? 1.5,
            body.reason.trim(),
            body.compensation_type?.trim() ?? 'salary',
            body.approver_name?.trim() ?? null,
        ]);
        const row = res.rows[0];
        if (!row) {
            throw new api_exception_1.ApiException('HRM-OT-500', 'Failed to create overtime request', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return row;
    }
    approveOvertimeRequest(requestId, body, companyId, authorization, tenantId) {
        return this.decideRequest('overtime_requests', requestId, 'approved', body, companyId, authorization, tenantId);
    }
    rejectOvertimeRequest(requestId, body, companyId, authorization, tenantId) {
        return this.decideRequest('overtime_requests', requestId, 'rejected', body, companyId, authorization, tenantId);
    }
    deleteOvertimeRequest(requestId, companyId, authorization, tenantId) {
        return this.deleteRequest('overtime_requests', requestId, companyId, authorization, tenantId);
    }
    async listBusinessTripRequests(query, authorization, tenantId) {
        await this.ensureSchema();
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, query.company_id, { tenantId });
        const { sql, params } = this.buildListSql('business_trip_requests', 'bt', scope, query);
        const res = await this.db.query(sql, params);
        return { total: res.rows.length, data: res.rows };
    }
    async createBusinessTripRequest(body, authorization) {
        await this.ensureSchema();
        if (body.start_date > body.end_date) {
            throw new api_exception_1.ApiException('HRM-BT-VAL-DATES', 'start_date must be on or before end_date', common_1.HttpStatus.BAD_REQUEST);
        }
        const companyId = (0, hrm_list_scope_1.resolveHrmPersistCompanyIdText)(authorization, body.company_id);
        const id = (0, node_crypto_1.randomUUID)();
        const res = await this.db.query(`
        INSERT INTO public.business_trip_requests (
          id, company_id, employee_id, employee_code, employee_name, department, position,
          destination, start_date, end_date, total_days, purpose, transportation, accommodation,
          estimated_cost, advance_amount, companions, contact_info, approver_name, status
        ) VALUES (
          $1::uuid, $2, $3::uuid, $4, $5, $6, $7,
          $8, $9::date, $10::date, $11, $12, $13, $14,
          $15, $16, $17, $18, $19, 'pending'
        )
        RETURNING *;
      `, [
            id,
            companyId,
            body.employee_id,
            body.employee_code.trim(),
            body.employee_name.trim(),
            body.department?.trim() ?? null,
            body.position?.trim() ?? null,
            body.destination.trim(),
            body.start_date,
            body.end_date,
            body.total_days,
            body.purpose.trim(),
            body.transportation?.trim() ?? 'company_car',
            body.accommodation?.trim() ?? null,
            body.estimated_cost ?? 0,
            body.advance_amount ?? 0,
            body.companions?.trim() ?? null,
            body.contact_info?.trim() ?? null,
            body.approver_name?.trim() ?? null,
        ]);
        const row = res.rows[0];
        if (!row) {
            throw new api_exception_1.ApiException('HRM-BT-500', 'Failed to create business trip request', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return row;
    }
    approveBusinessTripRequest(requestId, body, companyId, authorization, tenantId) {
        return this.decideRequest('business_trip_requests', requestId, 'approved', body, companyId, authorization, tenantId);
    }
    rejectBusinessTripRequest(requestId, body, companyId, authorization, tenantId) {
        return this.decideRequest('business_trip_requests', requestId, 'rejected', body, companyId, authorization, tenantId);
    }
    deleteBusinessTripRequest(requestId, companyId, authorization, tenantId) {
        return this.deleteRequest('business_trip_requests', requestId, companyId, authorization, tenantId);
    }
    async listLateEarlyRequests(query, authorization, tenantId) {
        await this.ensureSchema();
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, query.company_id, { tenantId });
        const { sql, params } = this.buildListSql('late_early_requests', 'le', scope, query);
        const res = await this.db.query(sql, params);
        return { total: res.rows.length, data: res.rows };
    }
    async createLateEarlyRequest(body, authorization) {
        await this.ensureSchema();
        const companyId = (0, hrm_list_scope_1.resolveHrmPersistCompanyIdText)(authorization, body.company_id);
        const id = (0, node_crypto_1.randomUUID)();
        const res = await this.db.query(`
        INSERT INTO public.late_early_requests (
          id, company_id, employee_id, employee_code, employee_name, department, position,
          request_date, request_type, late_time, late_minutes, early_time, early_minutes,
          reason, approver_name, status
        ) VALUES (
          $1::uuid, $2, $3::uuid, $4, $5, $6, $7,
          $8::date, $9, $10::time, $11, $12::time, $13,
          $14, $15, 'pending'
        )
        RETURNING *;
      `, [
            id,
            companyId,
            body.employee_id,
            body.employee_code.trim(),
            body.employee_name.trim(),
            body.department?.trim() ?? null,
            body.position?.trim() ?? null,
            body.request_date,
            body.request_type.trim(),
            body.late_time ?? null,
            body.late_minutes ?? 0,
            body.early_time ?? null,
            body.early_minutes ?? 0,
            body.reason.trim(),
            body.approver_name?.trim() ?? null,
        ]);
        const row = res.rows[0];
        if (!row) {
            throw new api_exception_1.ApiException('HRM-LE-500', 'Failed to create late/early request', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return row;
    }
    approveLateEarlyRequest(requestId, body, companyId, authorization, tenantId) {
        return this.decideRequest('late_early_requests', requestId, 'approved', body, companyId, authorization, tenantId);
    }
    rejectLateEarlyRequest(requestId, body, companyId, authorization, tenantId) {
        return this.decideRequest('late_early_requests', requestId, 'rejected', body, companyId, authorization, tenantId);
    }
    deleteLateEarlyRequest(requestId, companyId, authorization, tenantId) {
        return this.deleteRequest('late_early_requests', requestId, companyId, authorization, tenantId);
    }
    async listShiftChangeRequests(query, authorization, tenantId) {
        await this.ensureSchema();
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, query.company_id, { tenantId });
        const { sql, params } = this.buildListSql('shift_change_requests', 'sc', scope, query);
        const res = await this.db.query(sql, params);
        return { total: res.rows.length, data: res.rows };
    }
    async createShiftChangeRequest(body, authorization) {
        await this.ensureSchema();
        const companyId = (0, hrm_list_scope_1.resolveHrmPersistCompanyIdText)(authorization, body.company_id);
        const id = (0, node_crypto_1.randomUUID)();
        const res = await this.db.query(`
        INSERT INTO public.shift_change_requests (
          id, company_id, employee_id, employee_code, employee_name, department, position,
          change_date, change_type, current_shift, current_shift_time, requested_shift,
          requested_shift_time, swap_with_employee_id, swap_with_employee_name,
          swap_with_employee_code, reason, approver_name, status
        ) VALUES (
          $1::uuid, $2, $3::uuid, $4, $5, $6, $7,
          $8::date, $9, $10, $11, $12,
          $13, $14::uuid, $15, $16,
          $17, $18, 'pending'
        )
        RETURNING *;
      `, [
            id,
            companyId,
            body.employee_id,
            body.employee_code.trim(),
            body.employee_name.trim(),
            body.department?.trim() ?? null,
            body.position?.trim() ?? null,
            body.change_date,
            body.change_type.trim(),
            body.current_shift.trim(),
            body.current_shift_time?.trim() ?? null,
            body.requested_shift.trim(),
            body.requested_shift_time?.trim() ?? null,
            body.swap_with_employee_id ?? null,
            body.swap_with_employee_name?.trim() ?? null,
            body.swap_with_employee_code?.trim() ?? null,
            body.reason.trim(),
            body.approver_name?.trim() ?? null,
        ]);
        const row = res.rows[0];
        if (!row) {
            throw new api_exception_1.ApiException('HRM-SC-500', 'Failed to create shift change request', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return row;
    }
    approveShiftChangeRequest(requestId, body, companyId, authorization, tenantId) {
        return this.decideRequest('shift_change_requests', requestId, 'approved', body, companyId, authorization, tenantId);
    }
    rejectShiftChangeRequest(requestId, body, companyId, authorization, tenantId) {
        return this.decideRequest('shift_change_requests', requestId, 'rejected', body, companyId, authorization, tenantId);
    }
    deleteShiftChangeRequest(requestId, companyId, authorization, tenantId) {
        return this.deleteRequest('shift_change_requests', requestId, companyId, authorization, tenantId);
    }
};
exports.AttendanceRequestsService = AttendanceRequestsService;
exports.AttendanceRequestsService = AttendanceRequestsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [hrm_db_service_1.HrmDbService])
], AttendanceRequestsService);
//# sourceMappingURL=attendance-requests.service.js.map