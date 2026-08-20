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
exports.HomeService = void 0;
const common_1 = require("@nestjs/common");
const api_exception_1 = require("../common/api.exception");
const hrm_list_scope_1 = require("../common/hrm-list-scope");
const internal_auth_1 = require("../common/internal-auth");
const attendance_service_1 = require("../attendance/attendance.service");
const hrm_db_service_1 = require("../db/hrm-db.service");
const DEFAULT_INCLUDE = ['tasks', 'manager_pending'];
const HCM_TIMEZONE = 'Asia/Ho_Chi_Minh';
const PREVIEW_LIMIT = 5;
const CELEBRATION_LIMIT = 50;
const WHOS_OUT_LIMIT = 50;
function todayIsoInHoChiMinh() {
    return new Intl.DateTimeFormat('en-CA', { timeZone: HCM_TIMEZONE }).format(new Date());
}
function monthDayFromIsoDate(value) {
    if (!value?.trim())
        return null;
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim());
    if (!match)
        return null;
    return `${match[2]}-${match[3]}`;
}
function todayMonthDayInHoChiMinh() {
    const iso = todayIsoInHoChiMinh();
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
    if (!match)
        return '';
    return `${match[2]}-${match[3]}`;
}
function formatLeaveDateRange(start, end) {
    const fmt = (raw) => {
        const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(raw);
        return m ? `${m[3]}/${m[2]}` : raw;
    };
    return `${fmt(start)} – ${fmt(end)}`;
}
function formatDisplayDateFromMonthDay(monthDay) {
    const match = /^(\d{2})-(\d{2})$/.exec(monthDay.trim());
    if (!match)
        return '';
    return `${match[2]}/${match[1]}`;
}
function normalizeTimestamp(value) {
    if (value == null)
        return '';
    if (typeof value === 'string')
        return value;
    if (value instanceof Date)
        return value.toISOString();
    return String(value);
}
function compareTimestampsDesc(a, b) {
    return normalizeTimestamp(b).localeCompare(normalizeTimestamp(a));
}
function resolveEmployeeInitials(fullName) {
    const parts = (fullName?.trim() ?? '')
        .split(/\s+/)
        .filter(Boolean);
    if (parts.length === 0)
        return '?';
    if (parts.length === 1)
        return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase();
}
function parseInclude(raw) {
    if (!raw?.trim()) {
        return new Set(DEFAULT_INCLUDE);
    }
    return new Set(raw
        .split(',')
        .map((part) => part.trim())
        .filter(Boolean));
}
function readJwtRoles(authorization) {
    const payload = (0, internal_auth_1.getVerifiedInternalJwtPayload)(authorization);
    const roles = payload?.roles;
    if (Array.isArray(roles)) {
        return roles.filter((r) => typeof r === 'string');
    }
    return [];
}
function isManagerRole(roles) {
    return roles.includes('manager') || roles.includes('hr_manager');
}
function inboxTitle(eventType, payload, isManager) {
    const type = eventType ?? '';
    const envelope = payload;
    const req = envelope?.request ?? {};
    const name = String(req.employee_name ?? 'Nhân viên');
    if (type === 'leave_request.created') {
        return isManager ? `Đơn nghỉ mới — ${name}` : `Đơn nghỉ — ${name}`;
    }
    if (type === 'leave_request.approved') {
        return 'Đơn nghỉ đã duyệt';
    }
    if (type === 'leave_request.rejected') {
        return 'Đơn nghỉ đã từ chối';
    }
    if (type.startsWith('attendance_update_request.')) {
        return isManager ? `Chỉnh sửa chấm công — ${name}` : `Chỉnh sửa chấm công`;
    }
    if (type.startsWith('service_request.')) {
        return `Yêu cầu dịch vụ — ${name}`;
    }
    return 'Thông báo';
}
function inboxDeepLink(eventType, isManager) {
    const type = eventType ?? '';
    if (type === 'leave_request.created' && isManager) {
        return 'ManagerApprovals';
    }
    if (type.startsWith('attendance_update_request.') && isManager) {
        return 'ManagerApprovals';
    }
    if (type.startsWith('leave_request.')) {
        return 'LeaveRequestDetail';
    }
    if (type.startsWith('attendance_update_request.')) {
        return 'UpdateRequests';
    }
    return 'InAppNotifications';
}
let HomeService = class HomeService {
    db;
    attendance;
    constructor(db, attendance) {
        this.db = db;
        this.attendance = attendance;
    }
    async getSummary(query, authorization, tenantId) {
        const companyId = (0, hrm_list_scope_1.normalizeHomeSummaryCompanyId)(authorization, query.company_id);
        const scopedQuery = { ...query, company_id: companyId };
        (0, hrm_list_scope_1.resolveHrmListScope)(authorization, companyId, { tenantId });
        const include = parseInclude(query.include);
        const roles = readJwtRoles(authorization);
        const isManager = isManagerRole(roles);
        const viewer = await this.loadViewer(scopedQuery.employee_id, companyId, authorization, tenantId);
        let celebrations = { total_count: 0, items: [] };
        let whosOut = { total_count: 0, items: [] };
        let tasks = {
            total_count: 0,
            unread_inbox_count: 0,
            own_pending_count: 0,
            items: [],
        };
        let managerPending = {
            total_count: 0,
            leave_count: 0,
            update_count: 0,
            preview: [],
        };
        let attendanceToday = {
            checked_in: false,
            check_in_at: null,
            status: null,
        };
        if (include.has('tasks')) {
            tasks = await this.buildTasks(scopedQuery, authorization, tenantId, isManager);
        }
        if (include.has('manager_pending') && isManager) {
            managerPending = await this.buildManagerPending(scopedQuery, authorization, tenantId);
        }
        if (include.has('celebrations')) {
            celebrations = await this.buildCelebrations(scopedQuery, authorization, tenantId);
        }
        if (include.has('whos_out')) {
            whosOut = await this.buildWhosOut(scopedQuery, authorization, tenantId);
        }
        attendanceToday = await this.buildAttendanceToday(scopedQuery, authorization, tenantId);
        return {
            viewer: {
                employee_id: viewer.id,
                display_name: viewer.full_name,
                is_manager: isManager,
                is_birthday_today: this.isBirthdayToday(viewer.custom_fields),
            },
            tasks,
            manager_pending: managerPending,
            celebrations,
            whos_out: whosOut,
            attendance_today: attendanceToday,
            generated_at: new Date().toISOString(),
        };
    }
    async loadViewer(employeeId, companyId, authorization, tenantId) {
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, companyId, { tenantId });
        const filters = ['e.id = $1::uuid'];
        const values = [employeeId];
        (0, hrm_list_scope_1.pushWorkforceEmployeeScopeFilter)(filters, values, scope, 'e.id');
        const res = await this.db.query(`
        SELECT e.id, e.full_name, e.company_id, e.custom_fields
        FROM public.employees e
        WHERE ${filters.join(' AND ')}
        LIMIT 1;
      `, values);
        const row = res.rows[0];
        (0, hrm_list_scope_1.assertResourceInHrmScope)(row, scope, {
            notFoundCode: 'HRM-HOME-404',
            mismatchCode: 'HRM-ERR-SCOPE-INVALID',
        });
        if (!row) {
            throw new api_exception_1.ApiException('HRM-HOME-404', 'Viewer employee not found', common_1.HttpStatus.NOT_FOUND);
        }
        return row;
    }
    isBirthdayToday(customFields) {
        const dob = customFields?.date_of_birth;
        const dobMonthDay = monthDayFromIsoDate(dob);
        if (!dobMonthDay)
            return false;
        return dobMonthDay === todayMonthDayInHoChiMinh();
    }
    async buildCelebrations(query, authorization, tenantId) {
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, query.company_id, { tenantId });
        const todayMonthDay = todayMonthDayInHoChiMinh();
        if (!todayMonthDay) {
            return { total_count: 0, items: [] };
        }
        const filters = [
            "e.status = 'active'",
            'e.archived_at IS NULL',
            `e.custom_fields->>'date_of_birth' ~ '^\\d{4}-\\d{2}-\\d{2}'`,
        ];
        const values = [];
        (0, hrm_list_scope_1.pushWorkforceEmployeeScopeFilter)(filters, values, scope, 'e.id');
        values.push(todayMonthDay);
        filters.push(`substring(e.custom_fields->>'date_of_birth' from 6 for 5) = $${values.length}`);
        const res = await this.db.query(`
        SELECT e.id, e.full_name, e.avatar_url, e.custom_fields
        FROM public.employees e
        WHERE ${filters.join(' AND ')}
        ORDER BY e.full_name ASC
        LIMIT ${CELEBRATION_LIMIT};
      `, values);
        const items = [];
        for (const row of res.rows) {
            const monthDay = monthDayFromIsoDate(row.custom_fields?.date_of_birth);
            if (!monthDay || monthDay !== todayMonthDay)
                continue;
            const displayName = row.full_name?.trim();
            if (!displayName)
                continue;
            items.push({
                employee_id: row.id,
                display_name: displayName,
                month_day: monthDay,
                display_date: formatDisplayDateFromMonthDay(monthDay),
                avatar_url: row.avatar_url ?? null,
                avatar_initials: resolveEmployeeInitials(displayName),
            });
        }
        return { total_count: items.length, items };
    }
    async buildWhosOut(query, authorization, tenantId) {
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, query.company_id, { tenantId });
        const today = todayIsoInHoChiMinh();
        const filters = ["lr.status = 'approved'"];
        const values = [];
        values.push(today);
        filters.push(`$${values.length}::date BETWEEN lr.start_date AND lr.end_date`);
        (0, hrm_list_scope_1.pushWorkforceEmployeeScopeFilter)(filters, values, scope, 'lr.employee_id');
        const res = await this.db.query(`
        SELECT
          lr.id,
          lr.employee_id,
          lr.employee_name,
          lr.leave_type,
          e.full_name,
          e.avatar_url
        FROM public.leave_requests lr
        LEFT JOIN public.employees e ON e.id = lr.employee_id
        WHERE ${filters.join(' AND ')}
        ORDER BY COALESCE(e.full_name, lr.employee_name) ASC
        LIMIT ${WHOS_OUT_LIMIT};
      `, values);
        const items = res.rows.map((row) => ({
            employee_id: row.employee_id,
            display_name: (row.full_name ?? row.employee_name ?? 'Nhân viên').trim(),
            leave_type: row.leave_type,
            leave_request_id: row.id,
            avatar_url: row.avatar_url ?? null,
        }));
        return { total_count: items.length, items };
    }
    async queryScopedInbox(query, authorization, tenantId, limit) {
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, query.company_id, { tenantId });
        const filters = [];
        const values = [];
        const companyIds = (0, hrm_list_scope_1.expandHrmTextCompanyIds)(scope, authorization, query.company_id);
        const companyFilters = [];
        (0, hrm_list_scope_1.pushCompanyIdUuidFilter)(companyFilters, values, companyIds);
        values.push(query.employee_id);
        const viewerParam = values.length;
        filters.push(`(
      (recipient_employee_id IS NULL AND ${companyFilters.join(' AND ')})
      OR recipient_employee_id = $${viewerParam}::uuid
    )`);
        const lim = Math.min(Math.max(limit, 1), 100);
        const res = await this.db.query(`
        SELECT id, event_type, payload, read_at, created_at
        FROM public.hrm_inbox_notifications
        WHERE ${filters.join(' AND ')}
        ORDER BY created_at DESC
        LIMIT ${lim};
      `, values);
        return res.rows;
    }
    async queryScopedLeaveRequests(query, authorization, tenantId, options) {
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, query.company_id, { tenantId });
        const filters = [];
        const values = [];
        (0, hrm_list_scope_1.pushWorkforceEmployeeScopeFilter)(filters, values, scope, 'lr.employee_id');
        if (options.status?.trim()) {
            values.push(options.status.trim());
            filters.push(`lr.status = $${values.length}`);
        }
        if (options.employeeId) {
            values.push(options.employeeId);
            filters.push(`lr.employee_id = $${values.length}::uuid`);
        }
        if (options.managerEmployeeId) {
            values.push(options.managerEmployeeId);
            filters.push(`lr.employee_id IN (
        SELECT e.id FROM public.employees e
        WHERE e.manager_id = $${values.length}::uuid AND e.archived_at IS NULL
      )`);
        }
        const res = await this.db.query(`
        SELECT lr.id, lr.start_date, lr.end_date, lr.requested_at,
               lr.employee_name, lr.employee_code, lr.leave_type
        FROM public.leave_requests lr
        WHERE ${filters.join(' AND ')}
        ORDER BY lr.requested_at DESC
        LIMIT 200;
      `, values);
        return res.rows;
    }
    async buildTasks(query, authorization, tenantId, isManager) {
        const [inboxRows, ownLeaveRows, ownUpdateRes] = await Promise.all([
            this.queryScopedInbox(query, authorization, tenantId, PREVIEW_LIMIT),
            this.queryScopedLeaveRequests(query, authorization, tenantId, {
                employeeId: query.employee_id,
                status: 'pending',
            }),
            this.attendance.listUpdateRequests({
                company_id: query.company_id,
                employee_id: query.employee_id,
                status: 'pending',
            }, authorization, tenantId),
        ]);
        const unreadInboxCount = inboxRows.filter((row) => row.read_at == null).length;
        const ownPendingCount = ownLeaveRows.length + ownUpdateRes.total;
        const items = [];
        for (const row of inboxRows) {
            items.push({
                id: row.id,
                kind: 'inbox',
                title: inboxTitle(row.event_type, row.payload, isManager),
                subtitle: null,
                priority: 3,
                entity_type: 'inbox_notification',
                entity_id: row.id,
                created_at: normalizeTimestamp(row.created_at),
                deep_link: inboxDeepLink(row.event_type, isManager),
            });
        }
        for (const row of ownLeaveRows) {
            items.push({
                id: row.id,
                kind: 'own_pending_leave',
                title: 'Đơn nghỉ đang chờ duyệt',
                subtitle: formatLeaveDateRange(row.start_date, row.end_date),
                priority: 2,
                entity_type: 'leave_request',
                entity_id: row.id,
                created_at: normalizeTimestamp(row.requested_at),
                deep_link: 'LeaveRequestDetail',
            });
        }
        for (const row of ownUpdateRes.data) {
            items.push({
                id: row.id,
                kind: 'own_pending_update',
                title: 'Chỉnh sửa chấm công đang chờ',
                subtitle: row.attendance_date ?? null,
                priority: 2,
                entity_type: 'attendance_update_request',
                entity_id: row.id,
                created_at: normalizeTimestamp(row.created_at),
                deep_link: 'UpdateRequests',
            });
        }
        items.sort((a, b) => a.priority - b.priority || compareTimestampsDesc(a.created_at, b.created_at));
        return {
            total_count: unreadInboxCount + ownPendingCount,
            unread_inbox_count: unreadInboxCount,
            own_pending_count: ownPendingCount,
            items: items.slice(0, PREVIEW_LIMIT),
        };
    }
    async buildManagerPending(query, authorization, tenantId) {
        const managerFilter = { manager_employee_id: query.employee_id, status: 'pending' };
        const [leaveRows, updateRes] = await Promise.all([
            this.queryScopedLeaveRequests(query, authorization, tenantId, {
                managerEmployeeId: query.employee_id,
                status: 'pending',
            }),
            this.attendance.listUpdateRequests({ company_id: query.company_id, ...managerFilter }, authorization, tenantId),
        ]);
        const preview = [];
        for (const row of leaveRows) {
            preview.push({
                id: row.id,
                kind: 'leave_request',
                employee_name: row.employee_name ?? row.employee_code ?? 'Nhân viên',
                title: `Duyệt đơn nghỉ — ${row.employee_name ?? row.employee_code ?? 'Nhân viên'}`,
                subtitle: `${formatLeaveDateRange(row.start_date, row.end_date)} · ${row.leave_type}`,
                entity_id: row.id,
                created_at: normalizeTimestamp(row.requested_at),
            });
        }
        for (const row of updateRes.data) {
            preview.push({
                id: row.id,
                kind: 'attendance_update_request',
                employee_name: row.employee_name ?? row.employee_code ?? 'Nhân viên',
                title: `Chỉnh sửa chấm công — ${row.employee_name ?? row.employee_code ?? 'Nhân viên'}`,
                subtitle: row.attendance_date ?? null,
                entity_id: row.id,
                created_at: normalizeTimestamp(row.created_at),
            });
        }
        preview.sort((a, b) => compareTimestampsDesc(a.created_at, b.created_at));
        const leaveCount = leaveRows.length;
        const updateCount = updateRes.total;
        return {
            total_count: leaveCount + updateCount,
            leave_count: leaveCount,
            update_count: updateCount,
            preview: preview.slice(0, PREVIEW_LIMIT),
        };
    }
    async buildAttendanceToday(query, authorization, tenantId) {
        const today = todayIsoInHoChiMinh();
        const records = await this.attendance.listRecords({
            company_id: query.company_id,
            employee_id: query.employee_id,
            from_date: today,
            to_date: today,
            page: 1,
            page_size: 1,
        }, authorization, { tenantId });
        const row = records.data[0];
        if (!row) {
            return { checked_in: false, check_in_at: null, status: null };
        }
        return {
            checked_in: Boolean(row.check_in_at),
            check_in_at: row.check_in_at ?? null,
            status: row.status ?? null,
        };
    }
};
exports.HomeService = HomeService;
exports.HomeService = HomeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [hrm_db_service_1.HrmDbService,
        attendance_service_1.AttendanceService])
], HomeService);
//# sourceMappingURL=home.service.js.map