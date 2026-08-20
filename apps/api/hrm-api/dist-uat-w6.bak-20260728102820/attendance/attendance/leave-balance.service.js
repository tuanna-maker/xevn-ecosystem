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
exports.LeaveBalanceService = void 0;
const common_1 = require("@nestjs/common");
const api_exception_1 = require("../common/api.exception");
const hrm_list_scope_1 = require("../common/hrm-list-scope");
const hrm_db_service_1 = require("../db/hrm-db.service");
const employee_update_policy_1 = require("../employees/employee-update-policy");
const HCM_TIMEZONE = 'Asia/Ho_Chi_Minh';
function calendarYearInHoChiMinh() {
    const iso = new Intl.DateTimeFormat('en-CA', { timeZone: HCM_TIMEZONE }).format(new Date());
    const match = /^(\d{4})-/.exec(iso);
    return match ? Number(match[1]) : new Date().getUTCFullYear();
}
function toDayNumber(value) {
    const parsed = Number(value ?? 0);
    return Number.isFinite(parsed) ? parsed : 0;
}
function mapBalancePayload(row, source) {
    const entitled = toDayNumber(row.entitled_days);
    const used = toDayNumber(row.used_days);
    const pending = toDayNumber(row.pending_days);
    const remaining = Math.max(0, entitled - used - pending);
    const asOf = row.updated_at != null ? new Date(row.updated_at).toISOString() : new Date().toISOString();
    return {
        company_id: row.company_id,
        employee_id: row.employee_id,
        leave_type: row.leave_type,
        balance_year: row.balance_year,
        year: row.balance_year,
        period: row.balance_year,
        entitled_days: entitled,
        used_days: used,
        pending_days: pending,
        remaining_days: remaining,
        available_days: remaining,
        as_of: asOf,
        source,
    };
}
let LeaveBalanceService = class LeaveBalanceService {
    db;
    constructor(db) {
        this.db = db;
    }
    async ensureSchema() {
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
        await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_employee_leave_balances_employee_year
      ON public.employee_leave_balances (employee_id, balance_year DESC);
    `);
    }
    assertSelfOrHrAccess(targetEmployeeId, authorization) {
        const jwtEmployeeId = (0, employee_update_policy_1.readJwtEmployeeId)(authorization);
        if (!jwtEmployeeId || (0, employee_update_policy_1.canFullEmployeeUpdate)(authorization)) {
            return;
        }
        if (jwtEmployeeId !== targetEmployeeId) {
            throw new api_exception_1.ApiException('HRM-LEAVE-403', 'Leave balance may only be read for the authenticated employee', common_1.HttpStatus.FORBIDDEN);
        }
    }
    async loadEmployeeInScope(employeeId, companyId, authorization, tenantId) {
        const scopeCompanyId = (0, hrm_list_scope_1.normalizePayrollListCompanyId)(authorization, companyId);
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, scopeCompanyId, { tenantId });
        const filters = ['e.id = $1::uuid', 'e.archived_at IS NULL'];
        const values = [employeeId];
        (0, hrm_list_scope_1.pushWorkforceEmployeeScopeFilter)(filters, values, scope, 'e.id');
        const res = await this.db.query(`
        SELECT e.id, e.company_id, e.custom_fields
        FROM public.employees e
        WHERE ${filters.join(' AND ')}
        LIMIT 1;
      `, values);
        const row = res.rows[0];
        (0, hrm_list_scope_1.assertResourceInHrmScope)(row, scope, {
            notFoundCode: 'HRM-LEAVE-BAL-404',
            mismatchCode: 'HRM-ERR-SCOPE-INVALID',
        });
        if (!row) {
            throw new api_exception_1.ApiException('HRM-LEAVE-BAL-404', 'Employee not found in scope', common_1.HttpStatus.NOT_FOUND);
        }
        return row;
    }
    readCustomFieldsFallback(employee, leaveType, balanceYear) {
        const custom = employee.custom_fields ?? {};
        const key = `leave_balance_${leaveType}`;
        const raw = custom[key];
        if (raw == null || raw === '') {
            return null;
        }
        const entitled = toDayNumber(String(raw));
        return mapBalancePayload({
            company_id: employee.company_id,
            employee_id: employee.id,
            leave_type: leaveType,
            balance_year: balanceYear,
            entitled_days: entitled,
            used_days: 0,
            pending_days: 0,
        }, 'custom_fields');
    }
    async getLeaveBalance(query, authorization, tenantId) {
        await this.ensureSchema();
        this.assertSelfOrHrAccess(query.employee_id, authorization);
        const employee = await this.loadEmployeeInScope(query.employee_id, query.company_id, authorization, tenantId);
        const leaveType = query.leave_type?.trim() || 'annual';
        const balanceYear = query.year ?? calendarYearInHoChiMinh();
        const res = await this.db.query(`
        SELECT id, company_id, employee_id, leave_type, balance_year,
               entitled_days::text, used_days::text, pending_days::text, updated_at
        FROM public.employee_leave_balances
        WHERE company_id = $1
          AND employee_id = $2::uuid
          AND leave_type = $3
          AND balance_year = $4
        LIMIT 1;
      `, [employee.company_id, employee.id, leaveType, balanceYear]);
        const row = res.rows[0];
        if (row) {
            return mapBalancePayload({
                company_id: row.company_id,
                employee_id: row.employee_id,
                leave_type: row.leave_type,
                balance_year: row.balance_year,
                entitled_days: row.entitled_days,
                used_days: row.used_days,
                pending_days: row.pending_days,
                updated_at: row.updated_at,
            }, 'employee_leave_balances');
        }
        const fallback = this.readCustomFieldsFallback(employee, leaveType, balanceYear);
        if (fallback) {
            return fallback;
        }
        return mapBalancePayload({
            company_id: employee.company_id,
            employee_id: employee.id,
            leave_type: leaveType,
            balance_year: balanceYear,
            entitled_days: 0,
            used_days: 0,
            pending_days: 0,
        }, 'default');
    }
};
exports.LeaveBalanceService = LeaveBalanceService;
exports.LeaveBalanceService = LeaveBalanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [hrm_db_service_1.HrmDbService])
], LeaveBalanceService);
//# sourceMappingURL=leave-balance.service.js.map