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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaveRequestsService = exports.HRM_LEAVE_VAL_BALANCE = exports.HRM_LEAVE_VAL_OVERLAP = void 0;
const common_1 = require("@nestjs/common");
const node_crypto_1 = require("node:crypto");
const api_exception_1 = require("../common/api.exception");
const hrm_list_scope_1 = require("../common/hrm-list-scope");
const tenant_scope_env_1 = require("../common/tenant-scope-env");
const hrm_db_service_1 = require("../db/hrm-db.service");
const attendance_event_fanout_service_1 = require("../notifications/attendance-event-fanout.service");
const hrm_settings_master_keys_1 = require("../settings-catalogs/hrm-settings-master-keys");
const settings_catalogs_service_1 = require("../settings-catalogs/settings-catalogs.service");
const leave_workflow_bridge_1 = require("./leave-workflow.bridge");
const LEAVE_ATTACHMENT_URL_PATTERN = /^\/api\/hrm\/files\/[a-zA-Z0-9_-]+\/.+$/;
exports.HRM_LEAVE_VAL_OVERLAP = 'HRM-LEAVE-VAL-OVERLAP';
exports.HRM_LEAVE_VAL_BALANCE = 'HRM-LEAVE-VAL-BALANCE';
function assertValidLeaveAttachmentUrl(url) {
    const trimmed = url?.trim();
    if (!trimmed) {
        return null;
    }
    if (!LEAVE_ATTACHMENT_URL_PATTERN.test(trimmed)) {
        throw new api_exception_1.ApiException('HRM-LEAVE-VAL-ATT', 'attachment_url must be a relative path under /api/hrm/files/{company_scope}/', common_1.HttpStatus.BAD_REQUEST);
    }
    return trimmed;
}
function toDayNumber(value) {
    const parsed = Number(value ?? 0);
    return Number.isFinite(parsed) ? parsed : 0;
}
function balanceYearFromStartDate(startDate) {
    const match = /^(\d{4})-/.exec(startDate.trim());
    if (match) {
        return Number(match[1]);
    }
    return new Date().getUTCFullYear();
}
let LeaveRequestsService = class LeaveRequestsService {
    db;
    fanout;
    leaveWorkflowBridge;
    settingsCatalogs;
    constructor(db, fanout, leaveWorkflowBridge, settingsCatalogs) {
        this.db = db;
        this.fanout = fanout;
        this.leaveWorkflowBridge = leaveWorkflowBridge;
        this.settingsCatalogs = settingsCatalogs;
    }
    async ensureSchema() {
        await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.leave_requests (
        id UUID PRIMARY KEY,
        company_id TEXT NOT NULL,
        employee_id UUID NOT NULL,
        leave_type TEXT NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        reason TEXT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        reviewed_at TIMESTAMPTZ NULL,
        reviewed_by TEXT NULL,
        employee_code TEXT NULL,
        employee_name TEXT NULL,
        department TEXT NULL,
        position TEXT NULL,
        total_days NUMERIC NOT NULL DEFAULT 1,
        handover_to TEXT NULL,
        handover_tasks TEXT NULL,
        approver_employee_id UUID NULL,
        rejected_reason TEXT NULL,
        attachment_url TEXT NULL,
        workflow_instance_id UUID NULL,
        CONSTRAINT chk_leave_date_range CHECK (start_date <= end_date),
        CONSTRAINT chk_leave_status CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled'))
      );
    `);
        await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_leave_requests_company_status
      ON public.leave_requests (company_id, status, requested_at DESC);
    `);
        const additiveColumns = [
            'employee_code TEXT NULL',
            'employee_name TEXT NULL',
            'department TEXT NULL',
            'position TEXT NULL',
            'total_days NUMERIC NULL',
            'handover_to TEXT NULL',
            'handover_tasks TEXT NULL',
            'approver_employee_id UUID NULL',
            'rejected_reason TEXT NULL',
            'attachment_url TEXT NULL',
            'workflow_instance_id UUID NULL',
        ];
        for (const col of additiveColumns) {
            await this.db.query(`
        ALTER TABLE public.leave_requests
        ADD COLUMN IF NOT EXISTS ${col};
      `);
        }
        await this.db.query(`
      ALTER TABLE public.leave_requests
      ALTER COLUMN company_id TYPE TEXT USING company_id::text;
    `);
    }
    toPayload(row) {
        return {
            id: row.id,
            company_id: row.company_id,
            employee_id: row.employee_id,
            employee_code: row.employee_code ?? '',
            employee_name: row.employee_name ?? '',
            leave_type: row.leave_type,
            start_date: row.start_date,
            end_date: row.end_date,
            total_days: Number(row.total_days ?? 1),
            reason: row.reason,
            status: row.status,
            requested_at: row.requested_at,
            reviewed_at: row.reviewed_at,
            reviewed_by: row.reviewed_by,
            rejected_reason: row.rejected_reason,
        };
    }
    async ensureLeaveBalanceSchema() {
        await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.employee_leave_balances (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL,
        employee_id UUID NOT NULL,
        leave_type TEXT NOT NULL DEFAULT 'annual',
        balance_year INT NOT NULL,
        entitled_days NUMERIC(5,1) NOT NULL DEFAULT 0,
        used_days NUMERIC(5,1) NOT NULL DEFAULT 0,
        pending_days NUMERIC(5,1) NOT NULL DEFAULT 0,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT uq_employee_leave_balances UNIQUE (company_id, employee_id, leave_type, balance_year)
      );
    `);
    }
    async assertNoLeaveOverlap(employeeId, startDate, endDate) {
        const res = await this.db.query(`
        SELECT id::text AS id, status
        FROM public.leave_requests
        WHERE employee_id = $1::uuid
          AND status IN ('pending', 'approved')
          AND daterange(start_date, end_date, '[]') && daterange($2::date, $3::date, '[]')
        LIMIT 1;
      `, [employeeId, startDate, endDate]);
        const hit = res.rows[0];
        if (hit) {
            throw new api_exception_1.ApiException(exports.HRM_LEAVE_VAL_OVERLAP, 'Leave request overlaps an existing pending or approved leave', common_1.HttpStatus.CONFLICT, { conflicting_id: hit.id, conflicting_status: hit.status });
        }
    }
    async assertSufficientLeaveBalance(input) {
        await this.ensureLeaveBalanceSchema();
        const leaveType = input.leaveType.trim() || 'annual';
        const balanceYear = balanceYearFromStartDate(input.startDate);
        const balRes = await this.db.query(`
        SELECT entitled_days::text, used_days::text, pending_days::text
        FROM public.employee_leave_balances
        WHERE company_id = $1
          AND employee_id = $2::uuid
          AND leave_type = $3
          AND balance_year = $4
        LIMIT 1;
      `, [input.companyId, input.employeeId, leaveType, balanceYear]);
        let availableDays = null;
        let source = null;
        const bal = balRes.rows[0];
        if (bal) {
            availableDays = Math.max(0, toDayNumber(bal.entitled_days) - toDayNumber(bal.used_days) - toDayNumber(bal.pending_days));
            source = 'employee_leave_balances';
        }
        else {
            const empRes = await this.db.query(`
          SELECT custom_fields
          FROM public.employees
          WHERE id = $1::uuid AND archived_at IS NULL
          LIMIT 1;
        `, [input.employeeId]);
            const custom = empRes.rows[0]?.custom_fields ?? null;
            const raw = custom?.[`leave_balance_${leaveType}`];
            if (raw != null && raw !== '') {
                availableDays = Math.max(0, toDayNumber(String(raw)));
                source = 'custom_fields';
            }
        }
        if (availableDays == null || source == null) {
            return;
        }
        if (input.totalDays > availableDays) {
            throw new api_exception_1.ApiException(exports.HRM_LEAVE_VAL_BALANCE, 'Insufficient leave balance for requested total_days', common_1.HttpStatus.BAD_REQUEST, {
                leave_type: leaveType,
                balance_year: balanceYear,
                available_days: availableDays,
                requested_days: input.totalDays,
                source,
            });
        }
    }
    async createLeaveRequest(body, authorization, options) {
        await this.ensureSchema();
        if (body.start_date > body.end_date) {
            throw new api_exception_1.ApiException('HRM-LEAVE-VAL-DATES', 'start_date must be on or before end_date', common_1.HttpStatus.BAD_REQUEST);
        }
        const companyId = (0, hrm_list_scope_1.resolveHrmPersistCompanyIdText)(authorization, body.company_id, {
            tenantId: options?.tenantId,
        });
        const attachmentUrl = assertValidLeaveAttachmentUrl(body.attachment_url);
        const leaveType = body.leave_type.trim();
        if (this.settingsCatalogs) {
            const tenantForCatalog = options?.tenantId?.trim() || (0, tenant_scope_env_1.masterTenantIdFromEnv)() || 'xevn';
            const catalogCompanyId = (0, hrm_list_scope_1.resolveHrmSettingsCatalogCompanyId)(authorization, tenantForCatalog, body.company_id);
            await this.settingsCatalogs.assertCodeInEffectiveCatalog({
                tenantId: tenantForCatalog,
                companyId: catalogCompanyId,
                catalogKey: hrm_settings_master_keys_1.HRM_SC_LEAVE_KEY,
                code: leaveType,
                errorCode: 'HRM-ATT-LEAVE-TYPE',
                errorMessage: `leave_type '${leaveType}' is not in leave_types catalog (free-text SoT forbidden)`,
            });
        }
        await this.assertNoLeaveOverlap(body.employee_id, body.start_date, body.end_date);
        await this.assertSufficientLeaveBalance({
            companyId,
            employeeId: body.employee_id,
            leaveType,
            startDate: body.start_date,
            totalDays: body.total_days,
        });
        const id = (0, node_crypto_1.randomUUID)();
        const res = await this.db.query(`
        INSERT INTO public.leave_requests (
          id, company_id, employee_id, leave_type, start_date, end_date, reason, status,
          employee_code, employee_name, department, position, total_days, handover_to, handover_tasks,
          attachment_url, requested_at
        ) VALUES (
          $1::uuid, $2::text, $3::uuid, $4, $5::date, $6::date, $7, 'pending',
          $8, $9, $10, $11, $12, $13, $14, $15, NOW()
        )
        RETURNING *;
      `, [
            id,
            companyId,
            body.employee_id,
            leaveType,
            body.start_date,
            body.end_date,
            body.reason?.trim() ?? null,
            body.employee_code.trim(),
            body.employee_name.trim(),
            body.department?.trim() ?? null,
            body.position?.trim() ?? null,
            body.total_days,
            body.handover_to?.trim() ?? null,
            body.handover_tasks?.trim() ?? null,
            attachmentUrl,
        ]);
        const row = res.rows[0];
        if (!row) {
            throw new api_exception_1.ApiException('HRM-LEAVE-500', 'Failed to create leave request', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        const payload = this.toPayload(row);
        await this.fanout.onLeaveRequestCreated(payload);
        await this.leaveWorkflowBridge.startLeaveWorkflowIfConfigured({
            leaveRequestId: row.id,
            companyId: row.company_id,
            employeeId: row.employee_id,
            submitterUserId: options?.submitterUserId,
            tenantId: options?.tenantId,
            companySlug: options?.companySlug ?? companyId,
        });
        return row;
    }
    async approveLeaveRequestInternal(requestId, body) {
        const res = await this.db.query(`
        UPDATE public.leave_requests
        SET status = 'approved',
            reviewed_at = NOW(),
            reviewed_by = $2,
            approver_employee_id = COALESCE($3::uuid, approver_employee_id)
        WHERE id = $1::uuid AND status = 'pending'
        RETURNING *;
      `, [requestId, body.reviewer_name.trim(), body.reviewer_employee_id ?? null]);
        const row = res.rows[0];
        if (!row) {
            throw new api_exception_1.ApiException('HRM-LEAVE-404', 'Leave request not found or not pending', common_1.HttpStatus.NOT_FOUND);
        }
        await this.fanout.onLeaveRequestDecided('approved', this.toPayload(row));
        return row;
    }
    async rejectLeaveRequestInternal(requestId, body) {
        const res = await this.db.query(`
        UPDATE public.leave_requests
        SET status = 'rejected',
            reviewed_at = NOW(),
            reviewed_by = $2,
            rejected_reason = $3,
            approver_employee_id = COALESCE($4::uuid, approver_employee_id)
        WHERE id = $1::uuid AND status = 'pending'
        RETURNING *;
      `, [
            requestId,
            body.reviewer_name.trim(),
            body.rejected_reason?.trim() ?? null,
            body.reviewer_employee_id ?? null,
        ]);
        const row = res.rows[0];
        if (!row) {
            throw new api_exception_1.ApiException('HRM-LEAVE-404', 'Leave request not found or not pending', common_1.HttpStatus.NOT_FOUND);
        }
        await this.fanout.onLeaveRequestDecided('rejected', this.toPayload(row));
        return row;
    }
    async listLeaveRequests(query, authorization, tenantId) {
        await this.ensureSchema();
        const scopeCompanyId = (0, hrm_list_scope_1.normalizePayrollListCompanyId)(authorization, query.company_id);
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, scopeCompanyId, { tenantId });
        const params = [];
        const filters = [];
        (0, hrm_list_scope_1.pushWorkforceEmployeeScopeFilter)(filters, params, scope, 'lr.employee_id');
        let sql = `SELECT lr.* FROM public.leave_requests lr WHERE ${filters.join(' AND ')}`;
        if (query.status?.trim()) {
            params.push(query.status.trim());
            sql += ` AND lr.status = $${params.length}`;
        }
        if (query.employee_id) {
            params.push(query.employee_id);
            sql += ` AND lr.employee_id = $${params.length}::uuid`;
        }
        if (query.manager_employee_id) {
            params.push(query.manager_employee_id);
            sql += ` AND lr.employee_id IN (
        SELECT e.id FROM public.employees e
        WHERE e.manager_id = $${params.length}::uuid AND e.archived_at IS NULL
      )`;
        }
        sql += ` ORDER BY lr.requested_at DESC LIMIT 200`;
        const res = await this.db.query(sql, params);
        return { total: res.rows.length, data: res.rows };
    }
    async loadLeaveRequestCompany(requestId) {
        const res = await this.db.query(`SELECT company_id::text AS company_id FROM public.leave_requests WHERE id = $1::uuid LIMIT 1;`, [requestId]);
        return res.rows[0] ?? null;
    }
    async approveLeaveRequest(requestId, body, requestedCompanyId, authorization, tenantId) {
        const scopeCompanyId = (0, hrm_list_scope_1.normalizePayrollListCompanyId)(authorization, requestedCompanyId);
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, scopeCompanyId, { tenantId });
        const existing = await this.loadLeaveRequestCompany(requestId);
        (0, hrm_list_scope_1.assertResourceInHrmScope)(existing, scope, {
            notFoundCode: 'HRM-LEAVE-404',
            mismatchCode: 'HRM-LEAVE-409',
        });
        const res = await this.db.query(`
        UPDATE public.leave_requests
        SET status = 'approved',
            reviewed_at = NOW(),
            reviewed_by = $2,
            approver_employee_id = COALESCE($3::uuid, approver_employee_id)
        WHERE id = $1::uuid AND status = 'pending'
        RETURNING *;
      `, [requestId, body.reviewer_name.trim(), body.reviewer_employee_id ?? null]);
        const row = res.rows[0];
        if (!row) {
            throw new api_exception_1.ApiException('HRM-LEAVE-404', 'Leave request not found or not pending', common_1.HttpStatus.NOT_FOUND);
        }
        await this.fanout.onLeaveRequestDecided('approved', this.toPayload(row));
        return row;
    }
    async rejectLeaveRequest(requestId, body, requestedCompanyId, authorization, tenantId) {
        const scopeCompanyId = (0, hrm_list_scope_1.normalizePayrollListCompanyId)(authorization, requestedCompanyId);
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, scopeCompanyId, { tenantId });
        const existing = await this.loadLeaveRequestCompany(requestId);
        (0, hrm_list_scope_1.assertResourceInHrmScope)(existing, scope, {
            notFoundCode: 'HRM-LEAVE-404',
            mismatchCode: 'HRM-LEAVE-409',
        });
        const res = await this.db.query(`
        UPDATE public.leave_requests
        SET status = 'rejected',
            reviewed_at = NOW(),
            reviewed_by = $2,
            rejected_reason = $3,
            approver_employee_id = COALESCE($4::uuid, approver_employee_id)
        WHERE id = $1::uuid AND status = 'pending'
        RETURNING *;
      `, [
            requestId,
            body.reviewer_name.trim(),
            body.rejected_reason?.trim() ?? null,
            body.reviewer_employee_id ?? null,
        ]);
        const row = res.rows[0];
        if (!row) {
            throw new api_exception_1.ApiException('HRM-LEAVE-404', 'Leave request not found or not pending', common_1.HttpStatus.NOT_FOUND);
        }
        await this.fanout.onLeaveRequestDecided('rejected', this.toPayload(row));
        return row;
    }
};
exports.LeaveRequestsService = LeaveRequestsService;
exports.LeaveRequestsService = LeaveRequestsService = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [hrm_db_service_1.HrmDbService,
        attendance_event_fanout_service_1.AttendanceEventFanoutService,
        leave_workflow_bridge_1.LeaveWorkflowBridge,
        settings_catalogs_service_1.SettingsCatalogsService])
], LeaveRequestsService);
//# sourceMappingURL=leave-requests.service.js.map