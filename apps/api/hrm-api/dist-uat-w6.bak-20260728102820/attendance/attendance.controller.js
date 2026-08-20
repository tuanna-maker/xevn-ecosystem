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
exports.AttendanceController = void 0;
const common_1 = require("@nestjs/common");
const api_exception_1 = require("../common/api.exception");
const api_response_1 = require("../common/api-response");
const internal_auth_1 = require("../common/internal-auth");
const hrm_list_scope_context_1 = require("../common/hrm-list-scope-context");
const scope_context_1 = require("../common/scope-context");
const attendance_service_1 = require("./attendance.service");
const attendance_catalog_service_1 = require("./attendance-catalog.service");
const create_attendance_sheet_dto_1 = require("./dto/create-attendance-sheet.dto");
const update_attendance_sheet_dto_1 = require("./dto/update-attendance-sheet.dto");
const create_leave_request_dto_1 = require("./dto/create-leave-request.dto");
const decide_leave_request_dto_1 = require("./dto/decide-leave-request.dto");
const list_leave_requests_query_dto_1 = require("./dto/list-leave-requests.query.dto");
const attendance_requests_service_1 = require("./attendance-requests.service");
const leave_requests_service_1 = require("./leave-requests.service");
const leave_balance_service_1 = require("./leave-balance.service");
const attendance_overview_service_1 = require("./attendance-overview.service");
const get_leave_balance_query_dto_1 = require("./dto/get-leave-balance.query.dto");
const attendance_overview_query_dto_1 = require("./dto/attendance-overview.query.dto");
const create_business_trip_request_dto_1 = require("./dto/create-business-trip-request.dto");
const create_late_early_request_dto_1 = require("./dto/create-late-early-request.dto");
const create_overtime_request_dto_1 = require("./dto/create-overtime-request.dto");
const create_shift_change_request_dto_1 = require("./dto/create-shift-change-request.dto");
const list_attendance_requests_query_dto_1 = require("./dto/list-attendance-requests.query.dto");
const create_attendance_update_request_dto_1 = require("./dto/create-attendance-update-request.dto");
const decide_attendance_update_request_dto_1 = require("./dto/decide-attendance-update-request.dto");
const create_attendance_record_dto_1 = require("./dto/create-attendance-record.dto");
const get_attendance_record_query_dto_1 = require("./dto/get-attendance-record.query.dto");
const list_attendance_records_query_dto_1 = require("./dto/list-attendance-records.query.dto");
const list_attendance_update_requests_query_dto_1 = require("./dto/list-attendance-update-requests.query.dto");
const update_attendance_update_request_dto_1 = require("./dto/update-attendance-update-request.dto");
const update_attendance_status_dto_1 = require("./dto/update-attendance-status.dto");
let AttendanceController = class AttendanceController {
    attendanceService;
    attendanceCatalog;
    leaveRequestsService;
    leaveBalanceService;
    attendanceRequestsService;
    attendanceOverviewService;
    constructor(attendanceService, attendanceCatalog, leaveRequestsService, leaveBalanceService, attendanceRequestsService, attendanceOverviewService) {
        this.attendanceService = attendanceService;
        this.attendanceCatalog = attendanceCatalog;
        this.leaveRequestsService = leaveRequestsService;
        this.leaveBalanceService = leaveBalanceService;
        this.attendanceRequestsService = attendanceRequestsService;
        this.attendanceOverviewService = attendanceOverviewService;
    }
    assertBusinessAccess(authorization, internalApiKey) {
        if (!(0, internal_auth_1.isAuthorizedInternalRequest)(authorization, internalApiKey)) {
            throw new api_exception_1.ApiException('HRM-AUTH-001', 'Unauthorized attendance access', common_1.HttpStatus.UNAUTHORIZED);
        }
    }
    createRecord(authorization, internalApiKey, tenantId, headerCompanyId, body) {
        this.assertBusinessAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: body.company_id ?? headerCompanyId });
        return this.attendanceService
            .createRecord(body, authorization, tenantId)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-ATT-201', 'Attendance record created'));
    }
    listRecords(authorization, internalApiKey, tenantId, headerCompanyId, query, headers = {}) {
        const authHeader = (0, internal_auth_1.resolveAuthorizationHeader)(authorization, headers);
        this.assertBusinessAccess(authHeader, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authHeader, { tenantId, companyId: query.company_id ?? headerCompanyId });
        return this.attendanceService
            .listRecords(query, authHeader, (0, hrm_list_scope_context_1.toHrmListScopeContext)(tenantId))
            .then((data) => (0, api_response_1.ok)(data, 'HRM-ATT-200', 'Attendance records listed'));
    }
    getRecord(recordId, authorization, internalApiKey, tenantId, headerCompanyId, query, headers = {}) {
        const authHeader = (0, internal_auth_1.resolveAuthorizationHeader)(authorization, headers);
        this.assertBusinessAccess(authHeader, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authHeader, { tenantId, companyId: query.company_id ?? headerCompanyId });
        return this.attendanceService
            .getRecordById(recordId, query, authHeader, (0, hrm_list_scope_context_1.toHrmListScopeContext)(tenantId))
            .then((data) => (0, api_response_1.ok)(data, 'HRM-ATT-200', 'Attendance record loaded'));
    }
    updateStatus(recordId, authorization, internalApiKey, tenantId, companyId, body) {
        this.assertBusinessAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId });
        return this.attendanceService
            .updateStatus(recordId, body, companyId ?? 'main', authorization, tenantId)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-ATT-202', 'Attendance status updated'));
    }
    createUpdateRequest(authorization, internalApiKey, tenantId, headerCompanyId, body) {
        this.assertBusinessAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: body.company_id ?? headerCompanyId });
        return this.attendanceService
            .createUpdateRequest(body, authorization, tenantId)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-ATT-REQ-201', 'Attendance update request created'));
    }
    listUpdateRequests(authorization, internalApiKey, tenantId, headerCompanyId, query) {
        this.assertBusinessAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
        return this.attendanceService
            .listUpdateRequests(query, authorization, tenantId)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-ATT-REQ-200', 'Attendance update requests listed'));
    }
    updateUpdateRequest(requestId, authorization, internalApiKey, tenantId, companyId, body) {
        this.assertBusinessAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId });
        return this.attendanceService
            .updateUpdateRequest(requestId, body, companyId ?? 'main', authorization, tenantId)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-ATT-REQ-202', 'Attendance update request updated'));
    }
    approveUpdateRequest(requestId, authorization, internalApiKey, tenantId, companyId, body) {
        this.assertBusinessAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId });
        return this.attendanceService
            .approveUpdateRequest(requestId, body, companyId ?? 'main', authorization, tenantId)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-ATT-REQ-203', 'Attendance update request approved'));
    }
    rejectUpdateRequest(requestId, authorization, internalApiKey, tenantId, companyId, body) {
        this.assertBusinessAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId });
        return this.attendanceService
            .rejectUpdateRequest(requestId, body, companyId ?? 'main', authorization, tenantId)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-ATT-REQ-204', 'Attendance update request rejected'));
    }
    deleteUpdateRequest(requestId, authorization, internalApiKey, tenantId, companyId) {
        this.assertBusinessAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId });
        return this.attendanceService
            .deleteUpdateRequest(requestId, companyId ?? 'main', authorization, tenantId)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-ATT-REQ-205', 'Attendance update request deleted'));
    }
    createLeaveRequest(authorization, internalApiKey, tenantId, headerCompanyId, body) {
        this.assertBusinessAccess(authorization, internalApiKey);
        return this.leaveRequestsService
            .createLeaveRequest(body, authorization, {
            tenantId,
            companySlug: headerCompanyId,
        })
            .then((data) => (0, api_response_1.ok)(data, 'HRM-LEAVE-201', 'Leave request created'));
    }
    getAttendanceOverview(authorization, internalApiKey, tenantId, headerCompanyId, query) {
        this.assertBusinessAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
        return this.attendanceOverviewService
            .getOverview(query, authorization, tenantId)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-ATT-OVERVIEW-200', 'Attendance overview'));
    }
    getLeaveBalance(authorization, internalApiKey, tenantId, headerCompanyId, query, headers = {}) {
        const authHeader = (0, internal_auth_1.resolveAuthorizationHeader)(authorization, headers);
        this.assertBusinessAccess(authHeader, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authHeader, { tenantId, companyId: query.company_id ?? headerCompanyId });
        return this.leaveBalanceService
            .getLeaveBalance(query, authHeader, tenantId)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-LEAVE-BAL-200', 'Leave balance loaded'));
    }
    listLeaveRequests(authorization, internalApiKey, tenantId, headerCompanyId, query) {
        this.assertBusinessAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
        return this.leaveRequestsService
            .listLeaveRequests(query, authorization, tenantId)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-LEAVE-200', 'Leave requests listed'));
    }
    approveLeaveRequest(requestId, authorization, internalApiKey, tenantId, companyId, body) {
        this.assertBusinessAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId });
        return this.leaveRequestsService
            .approveLeaveRequest(requestId, body, companyId ?? 'main', authorization, tenantId)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-LEAVE-203', 'Leave request approved'));
    }
    rejectLeaveRequest(requestId, authorization, internalApiKey, tenantId, companyId, body) {
        this.assertBusinessAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId });
        return this.leaveRequestsService
            .rejectLeaveRequest(requestId, body, companyId ?? 'main', authorization, tenantId)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-LEAVE-204', 'Leave request rejected'));
    }
    listOvertimeRequests(authorization, internalApiKey, tenantId, headerCompanyId, query) {
        this.assertBusinessAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
        return this.attendanceRequestsService
            .listOvertimeRequests(query, authorization, tenantId)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-OT-200', 'Overtime requests listed'));
    }
    createOvertimeRequest(authorization, internalApiKey, body) {
        this.assertBusinessAccess(authorization, internalApiKey);
        return this.attendanceRequestsService
            .createOvertimeRequest(body, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-OT-201', 'Overtime request created'));
    }
    approveOvertimeRequest(requestId, authorization, internalApiKey, tenantId, companyId, body) {
        this.assertBusinessAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId });
        return this.attendanceRequestsService
            .approveOvertimeRequest(requestId, body, companyId ?? 'main', authorization, tenantId)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-OT-203', 'Overtime request approved'));
    }
    rejectOvertimeRequest(requestId, authorization, internalApiKey, tenantId, companyId, body) {
        this.assertBusinessAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId });
        return this.attendanceRequestsService
            .rejectOvertimeRequest(requestId, body, companyId ?? 'main', authorization, tenantId)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-OT-204', 'Overtime request rejected'));
    }
    deleteOvertimeRequest(requestId, authorization, internalApiKey, tenantId, companyId) {
        this.assertBusinessAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId });
        return this.attendanceRequestsService
            .deleteOvertimeRequest(requestId, companyId ?? 'main', authorization, tenantId)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-OT-205', 'Overtime request deleted'));
    }
    listBusinessTripRequests(authorization, internalApiKey, tenantId, headerCompanyId, query) {
        this.assertBusinessAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
        return this.attendanceRequestsService
            .listBusinessTripRequests(query, authorization, tenantId)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-BT-200', 'Business trip requests listed'));
    }
    createBusinessTripRequest(authorization, internalApiKey, body) {
        this.assertBusinessAccess(authorization, internalApiKey);
        return this.attendanceRequestsService
            .createBusinessTripRequest(body, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-BT-201', 'Business trip request created'));
    }
    approveBusinessTripRequest(requestId, authorization, internalApiKey, tenantId, companyId, body) {
        this.assertBusinessAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId });
        return this.attendanceRequestsService
            .approveBusinessTripRequest(requestId, body, companyId ?? 'main', authorization, tenantId)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-BT-203', 'Business trip request approved'));
    }
    rejectBusinessTripRequest(requestId, authorization, internalApiKey, tenantId, companyId, body) {
        this.assertBusinessAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId });
        return this.attendanceRequestsService
            .rejectBusinessTripRequest(requestId, body, companyId ?? 'main', authorization, tenantId)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-BT-204', 'Business trip request rejected'));
    }
    deleteBusinessTripRequest(requestId, authorization, internalApiKey, tenantId, companyId) {
        this.assertBusinessAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId });
        return this.attendanceRequestsService
            .deleteBusinessTripRequest(requestId, companyId ?? 'main', authorization, tenantId)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-BT-205', 'Business trip request deleted'));
    }
    listLateEarlyRequests(authorization, internalApiKey, tenantId, headerCompanyId, query) {
        this.assertBusinessAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
        return this.attendanceRequestsService
            .listLateEarlyRequests(query, authorization, tenantId)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-LE-REQ-200', 'Late/early requests listed'));
    }
    createLateEarlyRequest(authorization, internalApiKey, body) {
        this.assertBusinessAccess(authorization, internalApiKey);
        return this.attendanceRequestsService
            .createLateEarlyRequest(body, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-LE-REQ-201', 'Late/early request created'));
    }
    approveLateEarlyRequest(requestId, authorization, internalApiKey, tenantId, companyId, body) {
        this.assertBusinessAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId });
        return this.attendanceRequestsService
            .approveLateEarlyRequest(requestId, body, companyId ?? 'main', authorization, tenantId)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-LE-REQ-203', 'Late/early request approved'));
    }
    rejectLateEarlyRequest(requestId, authorization, internalApiKey, tenantId, companyId, body) {
        this.assertBusinessAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId });
        return this.attendanceRequestsService
            .rejectLateEarlyRequest(requestId, body, companyId ?? 'main', authorization, tenantId)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-LE-REQ-204', 'Late/early request rejected'));
    }
    deleteLateEarlyRequest(requestId, authorization, internalApiKey, tenantId, companyId) {
        this.assertBusinessAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId });
        return this.attendanceRequestsService
            .deleteLateEarlyRequest(requestId, companyId ?? 'main', authorization, tenantId)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-LE-REQ-205', 'Late/early request deleted'));
    }
    listShiftChangeRequests(authorization, internalApiKey, tenantId, headerCompanyId, query) {
        this.assertBusinessAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
        return this.attendanceRequestsService
            .listShiftChangeRequests(query, authorization, tenantId)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-SC-200', 'Shift change requests listed'));
    }
    createShiftChangeRequest(authorization, internalApiKey, body) {
        this.assertBusinessAccess(authorization, internalApiKey);
        return this.attendanceRequestsService
            .createShiftChangeRequest(body, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-SC-201', 'Shift change request created'));
    }
    approveShiftChangeRequest(requestId, authorization, internalApiKey, tenantId, companyId, body) {
        this.assertBusinessAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId });
        return this.attendanceRequestsService
            .approveShiftChangeRequest(requestId, body, companyId ?? 'main', authorization, tenantId)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-SC-203', 'Shift change request approved'));
    }
    rejectShiftChangeRequest(requestId, authorization, internalApiKey, tenantId, companyId, body) {
        this.assertBusinessAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId });
        return this.attendanceRequestsService
            .rejectShiftChangeRequest(requestId, body, companyId ?? 'main', authorization, tenantId)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-SC-204', 'Shift change request rejected'));
    }
    listWorkShifts(authorization, internalApiKey, tenantId, companyId) {
        this.assertBusinessAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId });
        return this.attendanceCatalog
            .listWorkShifts(companyId, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-WS-200', 'Work shifts listed'));
    }
    createWorkShift(authorization, internalApiKey, body) {
        this.assertBusinessAccess(authorization, internalApiKey);
        return this.attendanceCatalog
            .createWorkShift(body, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-WS-201', 'Work shift created'));
    }
    updateWorkShift(shiftId, authorization, internalApiKey, companyId, body) {
        this.assertBusinessAccess(authorization, internalApiKey);
        return this.attendanceCatalog
            .updateWorkShift(shiftId, body, companyId, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-WS-200', 'Work shift updated'));
    }
    deleteWorkShift(shiftId, authorization, internalApiKey, companyId) {
        this.assertBusinessAccess(authorization, internalApiKey);
        return this.attendanceCatalog
            .deleteWorkShift(shiftId, companyId, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-WS-200', 'Work shift deleted'));
    }
    listAttendanceSheets(authorization, internalApiKey, tenantId, companyId) {
        this.assertBusinessAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId });
        return this.attendanceCatalog
            .listAttendanceSheets(companyId, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-AS-200', 'Attendance sheets listed'));
    }
    createAttendanceSheet(authorization, internalApiKey, body) {
        this.assertBusinessAccess(authorization, internalApiKey);
        return this.attendanceCatalog
            .createAttendanceSheet(body, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-AS-201', 'Attendance sheet created'));
    }
    updateAttendanceSheet(sheetId, authorization, internalApiKey, companyId, body) {
        this.assertBusinessAccess(authorization, internalApiKey);
        return this.attendanceCatalog
            .updateAttendanceSheet(sheetId, body, companyId, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-AS-200', 'Attendance sheet updated'));
    }
    deleteAttendanceSheet(sheetId, authorization, internalApiKey, companyId) {
        this.assertBusinessAccess(authorization, internalApiKey);
        return this.attendanceCatalog
            .deleteAttendanceSheet(sheetId, companyId, authorization)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-AS-200', 'Attendance sheet deleted'));
    }
    deleteShiftChangeRequest(requestId, authorization, internalApiKey, tenantId, companyId) {
        this.assertBusinessAccess(authorization, internalApiKey);
        (0, scope_context_1.resolveScopeContext)(authorization, { tenantId, companyId });
        return this.attendanceRequestsService
            .deleteShiftChangeRequest(requestId, companyId ?? 'main', authorization, tenantId)
            .then((data) => (0, api_response_1.ok)(data, 'HRM-SC-205', 'Shift change request deleted'));
    }
};
exports.AttendanceController = AttendanceController;
__decorate([
    (0, common_1.Post)('records'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, create_attendance_record_dto_1.CreateAttendanceRecordDto]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "createRecord", null);
__decorate([
    (0, common_1.Get)('records'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Query)()),
    __param(5, (0, common_1.Headers)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, list_attendance_records_query_dto_1.ListAttendanceRecordsQueryDto, Object]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "listRecords", null);
__decorate([
    (0, common_1.Get)('records/:recordId'),
    __param(0, (0, common_1.Param)('recordId')),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Headers)('x-company-id')),
    __param(5, (0, common_1.Query)()),
    __param(6, (0, common_1.Headers)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object, get_attendance_record_query_dto_1.GetAttendanceRecordQueryDto, Object]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "getRecord", null);
__decorate([
    (0, common_1.Patch)('records/:recordId/status'),
    __param(0, (0, common_1.Param)('recordId')),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Headers)('x-company-id')),
    __param(5, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object, update_attendance_status_dto_1.UpdateAttendanceStatusDto]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Post)('update-requests'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, create_attendance_update_request_dto_1.CreateAttendanceUpdateRequestDto]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "createUpdateRequest", null);
__decorate([
    (0, common_1.Get)('update-requests'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, list_attendance_update_requests_query_dto_1.ListAttendanceUpdateRequestsQueryDto]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "listUpdateRequests", null);
__decorate([
    (0, common_1.Patch)('update-requests/:requestId'),
    __param(0, (0, common_1.Param)('requestId')),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Headers)('x-company-id')),
    __param(5, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object, update_attendance_update_request_dto_1.UpdateAttendanceUpdateRequestDto]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "updateUpdateRequest", null);
__decorate([
    (0, common_1.Post)('update-requests/:requestId/approve'),
    __param(0, (0, common_1.Param)('requestId')),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Headers)('x-company-id')),
    __param(5, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object, decide_attendance_update_request_dto_1.DecideAttendanceUpdateRequestDto]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "approveUpdateRequest", null);
__decorate([
    (0, common_1.Post)('update-requests/:requestId/reject'),
    __param(0, (0, common_1.Param)('requestId')),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Headers)('x-company-id')),
    __param(5, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object, decide_attendance_update_request_dto_1.DecideAttendanceUpdateRequestDto]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "rejectUpdateRequest", null);
__decorate([
    (0, common_1.Delete)('update-requests/:requestId'),
    __param(0, (0, common_1.Param)('requestId')),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Headers)('x-company-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "deleteUpdateRequest", null);
__decorate([
    (0, common_1.Post)('leave-requests'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, create_leave_request_dto_1.CreateLeaveRequestDto]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "createLeaveRequest", null);
__decorate([
    (0, common_1.Get)('overview'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, attendance_overview_query_dto_1.AttendanceOverviewQueryDto]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "getAttendanceOverview", null);
__decorate([
    (0, common_1.Get)('leave-balance'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Query)()),
    __param(5, (0, common_1.Headers)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, get_leave_balance_query_dto_1.GetLeaveBalanceQueryDto, Object]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "getLeaveBalance", null);
__decorate([
    (0, common_1.Get)('leave-requests'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, list_leave_requests_query_dto_1.ListLeaveRequestsQueryDto]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "listLeaveRequests", null);
__decorate([
    (0, common_1.Post)('leave-requests/:requestId/approve'),
    __param(0, (0, common_1.Param)('requestId')),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Headers)('x-company-id')),
    __param(5, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object, decide_leave_request_dto_1.DecideLeaveRequestDto]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "approveLeaveRequest", null);
__decorate([
    (0, common_1.Post)('leave-requests/:requestId/reject'),
    __param(0, (0, common_1.Param)('requestId')),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Headers)('x-company-id')),
    __param(5, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object, decide_leave_request_dto_1.DecideLeaveRequestDto]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "rejectLeaveRequest", null);
__decorate([
    (0, common_1.Get)('overtime-requests'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, list_attendance_requests_query_dto_1.ListAttendanceRequestsQueryDto]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "listOvertimeRequests", null);
__decorate([
    (0, common_1.Post)('overtime-requests'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, create_overtime_request_dto_1.CreateOvertimeRequestDto]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "createOvertimeRequest", null);
__decorate([
    (0, common_1.Post)('overtime-requests/:requestId/approve'),
    __param(0, (0, common_1.Param)('requestId')),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Headers)('x-company-id')),
    __param(5, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object, decide_leave_request_dto_1.DecideLeaveRequestDto]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "approveOvertimeRequest", null);
__decorate([
    (0, common_1.Post)('overtime-requests/:requestId/reject'),
    __param(0, (0, common_1.Param)('requestId')),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Headers)('x-company-id')),
    __param(5, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object, decide_leave_request_dto_1.DecideLeaveRequestDto]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "rejectOvertimeRequest", null);
__decorate([
    (0, common_1.Delete)('overtime-requests/:requestId'),
    __param(0, (0, common_1.Param)('requestId')),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Headers)('x-company-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "deleteOvertimeRequest", null);
__decorate([
    (0, common_1.Get)('business-trip-requests'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, list_attendance_requests_query_dto_1.ListAttendanceRequestsQueryDto]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "listBusinessTripRequests", null);
__decorate([
    (0, common_1.Post)('business-trip-requests'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, create_business_trip_request_dto_1.CreateBusinessTripRequestDto]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "createBusinessTripRequest", null);
__decorate([
    (0, common_1.Post)('business-trip-requests/:requestId/approve'),
    __param(0, (0, common_1.Param)('requestId')),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Headers)('x-company-id')),
    __param(5, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object, decide_leave_request_dto_1.DecideLeaveRequestDto]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "approveBusinessTripRequest", null);
__decorate([
    (0, common_1.Post)('business-trip-requests/:requestId/reject'),
    __param(0, (0, common_1.Param)('requestId')),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Headers)('x-company-id')),
    __param(5, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object, decide_leave_request_dto_1.DecideLeaveRequestDto]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "rejectBusinessTripRequest", null);
__decorate([
    (0, common_1.Delete)('business-trip-requests/:requestId'),
    __param(0, (0, common_1.Param)('requestId')),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Headers)('x-company-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "deleteBusinessTripRequest", null);
__decorate([
    (0, common_1.Get)('late-early-requests'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, list_attendance_requests_query_dto_1.ListAttendanceRequestsQueryDto]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "listLateEarlyRequests", null);
__decorate([
    (0, common_1.Post)('late-early-requests'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, create_late_early_request_dto_1.CreateLateEarlyRequestDto]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "createLateEarlyRequest", null);
__decorate([
    (0, common_1.Post)('late-early-requests/:requestId/approve'),
    __param(0, (0, common_1.Param)('requestId')),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Headers)('x-company-id')),
    __param(5, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object, decide_leave_request_dto_1.DecideLeaveRequestDto]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "approveLateEarlyRequest", null);
__decorate([
    (0, common_1.Post)('late-early-requests/:requestId/reject'),
    __param(0, (0, common_1.Param)('requestId')),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Headers)('x-company-id')),
    __param(5, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object, decide_leave_request_dto_1.DecideLeaveRequestDto]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "rejectLateEarlyRequest", null);
__decorate([
    (0, common_1.Delete)('late-early-requests/:requestId'),
    __param(0, (0, common_1.Param)('requestId')),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Headers)('x-company-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "deleteLateEarlyRequest", null);
__decorate([
    (0, common_1.Get)('shift-change-requests'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, list_attendance_requests_query_dto_1.ListAttendanceRequestsQueryDto]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "listShiftChangeRequests", null);
__decorate([
    (0, common_1.Post)('shift-change-requests'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, create_shift_change_request_dto_1.CreateShiftChangeRequestDto]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "createShiftChangeRequest", null);
__decorate([
    (0, common_1.Post)('shift-change-requests/:requestId/approve'),
    __param(0, (0, common_1.Param)('requestId')),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Headers)('x-company-id')),
    __param(5, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object, decide_leave_request_dto_1.DecideLeaveRequestDto]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "approveShiftChangeRequest", null);
__decorate([
    (0, common_1.Post)('shift-change-requests/:requestId/reject'),
    __param(0, (0, common_1.Param)('requestId')),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Headers)('x-company-id')),
    __param(5, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object, decide_leave_request_dto_1.DecideLeaveRequestDto]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "rejectShiftChangeRequest", null);
__decorate([
    (0, common_1.Get)('work-shifts'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Query)('company_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, String]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "listWorkShifts", null);
__decorate([
    (0, common_1.Post)('work-shifts'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "createWorkShift", null);
__decorate([
    (0, common_1.Patch)('work-shifts/:shiftId'),
    __param(0, (0, common_1.Param)('shiftId')),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Query)('company_id')),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, String, Object]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "updateWorkShift", null);
__decorate([
    (0, common_1.Delete)('work-shifts/:shiftId'),
    __param(0, (0, common_1.Param)('shiftId')),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Query)('company_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, String]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "deleteWorkShift", null);
__decorate([
    (0, common_1.Get)('attendance-sheets'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Query)('company_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, String]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "listAttendanceSheets", null);
__decorate([
    (0, common_1.Post)('attendance-sheets'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-internal-api-key')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, create_attendance_sheet_dto_1.CreateAttendanceSheetDto]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "createAttendanceSheet", null);
__decorate([
    (0, common_1.Patch)('attendance-sheets/:sheetId'),
    __param(0, (0, common_1.Param)('sheetId')),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Query)('company_id')),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, String, update_attendance_sheet_dto_1.UpdateAttendanceSheetDto]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "updateAttendanceSheet", null);
__decorate([
    (0, common_1.Delete)('attendance-sheets/:sheetId'),
    __param(0, (0, common_1.Param)('sheetId')),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Query)('company_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, String]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "deleteAttendanceSheet", null);
__decorate([
    (0, common_1.Delete)('shift-change-requests/:requestId'),
    __param(0, (0, common_1.Param)('requestId')),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Headers)('x-company-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "deleteShiftChangeRequest", null);
exports.AttendanceController = AttendanceController = __decorate([
    (0, common_1.Controller)('attendance'),
    __metadata("design:paramtypes", [attendance_service_1.AttendanceService,
        attendance_catalog_service_1.AttendanceCatalogService,
        leave_requests_service_1.LeaveRequestsService,
        leave_balance_service_1.LeaveBalanceService,
        attendance_requests_service_1.AttendanceRequestsService,
        attendance_overview_service_1.AttendanceOverviewService])
], AttendanceController);
//# sourceMappingURL=attendance.controller.js.map