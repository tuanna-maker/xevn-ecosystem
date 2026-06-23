import { Body, Controller, Delete, Get, Headers, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { ok } from '../common/api-response';
import { isAuthorizedInternalRequest, resolveAuthorizationHeader } from '../common/internal-auth';
import { toHrmListScopeContext } from '../common/hrm-list-scope-context';
import { resolveScopeContext } from '../common/scope-context';
import { AttendanceService } from './attendance.service';
import { AttendanceCatalogService } from './attendance-catalog.service';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { DecideLeaveRequestDto } from './dto/decide-leave-request.dto';
import { ListLeaveRequestsQueryDto } from './dto/list-leave-requests.query.dto';
import { AttendanceRequestsService } from './attendance-requests.service';
import { LeaveRequestsService } from './leave-requests.service';
import { LeaveBalanceService } from './leave-balance.service';
import { AttendanceOverviewService } from './attendance-overview.service';
import { GetLeaveBalanceQueryDto } from './dto/get-leave-balance.query.dto';
import { AttendanceOverviewQueryDto } from './dto/attendance-overview.query.dto';
import { CreateBusinessTripRequestDto } from './dto/create-business-trip-request.dto';
import { CreateLateEarlyRequestDto } from './dto/create-late-early-request.dto';
import { CreateOvertimeRequestDto } from './dto/create-overtime-request.dto';
import { CreateShiftChangeRequestDto } from './dto/create-shift-change-request.dto';
import { ListAttendanceRequestsQueryDto } from './dto/list-attendance-requests.query.dto';
import { CreateAttendanceUpdateRequestDto } from './dto/create-attendance-update-request.dto';
import { DecideAttendanceUpdateRequestDto } from './dto/decide-attendance-update-request.dto';
import { CreateAttendanceRecordDto } from './dto/create-attendance-record.dto';
import { GetAttendanceRecordQueryDto } from './dto/get-attendance-record.query.dto';
import { ListAttendanceRecordsQueryDto } from './dto/list-attendance-records.query.dto';
import { ListAttendanceUpdateRequestsQueryDto } from './dto/list-attendance-update-requests.query.dto';
import { UpdateAttendanceUpdateRequestDto } from './dto/update-attendance-update-request.dto';
import { UpdateAttendanceStatusDto } from './dto/update-attendance-status.dto';

@Controller('attendance')
export class AttendanceController {
  constructor(
    private readonly attendanceService: AttendanceService,
    private readonly attendanceCatalog: AttendanceCatalogService,
    private readonly leaveRequestsService: LeaveRequestsService,
    private readonly leaveBalanceService: LeaveBalanceService,
    private readonly attendanceRequestsService: AttendanceRequestsService,
    private readonly attendanceOverviewService: AttendanceOverviewService,
  ) {}

  private assertBusinessAccess(authorization?: string, internalApiKey?: string) {
    if (!isAuthorizedInternalRequest(authorization, internalApiKey)) {
      throw new ApiException('HRM-AUTH-001', 'Unauthorized attendance access', HttpStatus.UNAUTHORIZED);
    }
  }

  @Post('records')
  createRecord(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Body() body: CreateAttendanceRecordDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: body.company_id ?? headerCompanyId });
    return this.attendanceService
      .createRecord(body, authorization, tenantId)
      .then((data) => ok(data, 'HRM-ATT-201', 'Attendance record created'));
  }

  @Get('records')
  listRecords(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: ListAttendanceRecordsQueryDto,
    @Headers() headers: Record<string, unknown> = {},
  ) {
    const authHeader = resolveAuthorizationHeader(authorization, headers);
    this.assertBusinessAccess(authHeader, internalApiKey);
    resolveScopeContext(authHeader, { tenantId, companyId: query.company_id ?? headerCompanyId });
    return this.attendanceService
      .listRecords(query, authHeader, toHrmListScopeContext(tenantId))
      .then((data) => ok(data, 'HRM-ATT-200', 'Attendance records listed'));
  }

  @Get('records/:recordId')
  getRecord(
    @Param('recordId') recordId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: GetAttendanceRecordQueryDto,
    @Headers() headers: Record<string, unknown> = {},
  ) {
    const authHeader = resolveAuthorizationHeader(authorization, headers);
    this.assertBusinessAccess(authHeader, internalApiKey);
    resolveScopeContext(authHeader, { tenantId, companyId: query.company_id ?? headerCompanyId });
    return this.attendanceService
      .getRecordById(recordId, query, authHeader, toHrmListScopeContext(tenantId))
      .then((data) => ok(data, 'HRM-ATT-200', 'Attendance record loaded'));
  }

  @Patch('records/:recordId/status')
  updateStatus(
    @Param('recordId') recordId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') companyId: string | undefined,
    @Body() body: UpdateAttendanceStatusDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.attendanceService
      .updateStatus(recordId, body, companyId ?? 'main', authorization, tenantId)
      .then((data) => ok(data, 'HRM-ATT-202', 'Attendance status updated'));
  }

  @Post('update-requests')
  createUpdateRequest(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Body() body: CreateAttendanceUpdateRequestDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: body.company_id ?? headerCompanyId });
    return this.attendanceService
      .createUpdateRequest(body, authorization, tenantId)
      .then((data) => ok(data, 'HRM-ATT-REQ-201', 'Attendance update request created'));
  }

  @Get('update-requests')
  listUpdateRequests(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: ListAttendanceUpdateRequestsQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
    return this.attendanceService
      .listUpdateRequests(query, authorization, tenantId)
      .then((data) => ok(data, 'HRM-ATT-REQ-200', 'Attendance update requests listed'));
  }

  @Patch('update-requests/:requestId')
  updateUpdateRequest(
    @Param('requestId') requestId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') companyId: string | undefined,
    @Body() body: UpdateAttendanceUpdateRequestDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.attendanceService
      .updateUpdateRequest(requestId, body, companyId ?? 'main', authorization, tenantId)
      .then((data) => ok(data, 'HRM-ATT-REQ-202', 'Attendance update request updated'));
  }

  @Post('update-requests/:requestId/approve')
  approveUpdateRequest(
    @Param('requestId') requestId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') companyId: string | undefined,
    @Body() body: DecideAttendanceUpdateRequestDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.attendanceService
      .approveUpdateRequest(requestId, body, companyId ?? 'main', authorization, tenantId)
      .then((data) => ok(data, 'HRM-ATT-REQ-203', 'Attendance update request approved'));
  }

  @Post('update-requests/:requestId/reject')
  rejectUpdateRequest(
    @Param('requestId') requestId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') companyId: string | undefined,
    @Body() body: DecideAttendanceUpdateRequestDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.attendanceService
      .rejectUpdateRequest(requestId, body, companyId ?? 'main', authorization, tenantId)
      .then((data) => ok(data, 'HRM-ATT-REQ-204', 'Attendance update request rejected'));
  }

  @Delete('update-requests/:requestId')
  deleteUpdateRequest(
    @Param('requestId') requestId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') companyId: string | undefined,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.attendanceService
      .deleteUpdateRequest(requestId, companyId ?? 'main', authorization, tenantId)
      .then((data) => ok(data, 'HRM-ATT-REQ-205', 'Attendance update request deleted'));
  }

  @Post('leave-requests')
  createLeaveRequest(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Body() body: CreateLeaveRequestDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    return this.leaveRequestsService
      .createLeaveRequest(body)
      .then((data) => ok(data, 'HRM-LEAVE-201', 'Leave request created'));
  }

  @Get('overview')
  getAttendanceOverview(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: AttendanceOverviewQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
    return this.attendanceOverviewService
      .getOverview(query, authorization, tenantId)
      .then((data) => ok(data, 'HRM-ATT-OVERVIEW-200', 'Attendance overview'));
  }

  @Get('leave-balance')
  getLeaveBalance(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: GetLeaveBalanceQueryDto,
    @Headers() headers: Record<string, unknown> = {},
  ) {
    const authHeader = resolveAuthorizationHeader(authorization, headers);
    this.assertBusinessAccess(authHeader, internalApiKey);
    resolveScopeContext(authHeader, { tenantId, companyId: query.company_id ?? headerCompanyId });
    return this.leaveBalanceService
      .getLeaveBalance(query, authHeader, tenantId)
      .then((data) => ok(data, 'HRM-LEAVE-BAL-200', 'Leave balance loaded'));
  }

  @Get('leave-requests')
  listLeaveRequests(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: ListLeaveRequestsQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
    return this.leaveRequestsService
      .listLeaveRequests(query, authorization, tenantId)
      .then((data) => ok(data, 'HRM-LEAVE-200', 'Leave requests listed'));
  }

  @Post('leave-requests/:requestId/approve')
  approveLeaveRequest(
    @Param('requestId') requestId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') companyId: string | undefined,
    @Body() body: DecideLeaveRequestDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.leaveRequestsService
      .approveLeaveRequest(requestId, body, companyId ?? 'main', authorization, tenantId)
      .then((data) => ok(data, 'HRM-LEAVE-203', 'Leave request approved'));
  }

  @Post('leave-requests/:requestId/reject')
  rejectLeaveRequest(
    @Param('requestId') requestId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') companyId: string | undefined,
    @Body() body: DecideLeaveRequestDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.leaveRequestsService
      .rejectLeaveRequest(requestId, body, companyId ?? 'main', authorization, tenantId)
      .then((data) => ok(data, 'HRM-LEAVE-204', 'Leave request rejected'));
  }

  @Get('overtime-requests')
  listOvertimeRequests(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: ListAttendanceRequestsQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
    return this.attendanceRequestsService
      .listOvertimeRequests(query, authorization, tenantId)
      .then((data) => ok(data, 'HRM-OT-200', 'Overtime requests listed'));
  }

  @Post('overtime-requests')
  createOvertimeRequest(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Body() body: CreateOvertimeRequestDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    return this.attendanceRequestsService
      .createOvertimeRequest(body, authorization)
      .then((data) => ok(data, 'HRM-OT-201', 'Overtime request created'));
  }

  @Post('overtime-requests/:requestId/approve')
  approveOvertimeRequest(
    @Param('requestId') requestId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') companyId: string | undefined,
    @Body() body: DecideLeaveRequestDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.attendanceRequestsService
      .approveOvertimeRequest(requestId, body, companyId ?? 'main', authorization, tenantId)
      .then((data) => ok(data, 'HRM-OT-203', 'Overtime request approved'));
  }

  @Post('overtime-requests/:requestId/reject')
  rejectOvertimeRequest(
    @Param('requestId') requestId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') companyId: string | undefined,
    @Body() body: DecideLeaveRequestDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.attendanceRequestsService
      .rejectOvertimeRequest(requestId, body, companyId ?? 'main', authorization, tenantId)
      .then((data) => ok(data, 'HRM-OT-204', 'Overtime request rejected'));
  }

  @Delete('overtime-requests/:requestId')
  deleteOvertimeRequest(
    @Param('requestId') requestId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') companyId: string | undefined,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.attendanceRequestsService
      .deleteOvertimeRequest(requestId, companyId ?? 'main', authorization, tenantId)
      .then((data) => ok(data, 'HRM-OT-205', 'Overtime request deleted'));
  }

  @Get('business-trip-requests')
  listBusinessTripRequests(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: ListAttendanceRequestsQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
    return this.attendanceRequestsService
      .listBusinessTripRequests(query, authorization, tenantId)
      .then((data) => ok(data, 'HRM-BT-200', 'Business trip requests listed'));
  }

  @Post('business-trip-requests')
  createBusinessTripRequest(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Body() body: CreateBusinessTripRequestDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    return this.attendanceRequestsService
      .createBusinessTripRequest(body, authorization)
      .then((data) => ok(data, 'HRM-BT-201', 'Business trip request created'));
  }

  @Post('business-trip-requests/:requestId/approve')
  approveBusinessTripRequest(
    @Param('requestId') requestId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') companyId: string | undefined,
    @Body() body: DecideLeaveRequestDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.attendanceRequestsService
      .approveBusinessTripRequest(requestId, body, companyId ?? 'main', authorization, tenantId)
      .then((data) => ok(data, 'HRM-BT-203', 'Business trip request approved'));
  }

  @Post('business-trip-requests/:requestId/reject')
  rejectBusinessTripRequest(
    @Param('requestId') requestId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') companyId: string | undefined,
    @Body() body: DecideLeaveRequestDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.attendanceRequestsService
      .rejectBusinessTripRequest(requestId, body, companyId ?? 'main', authorization, tenantId)
      .then((data) => ok(data, 'HRM-BT-204', 'Business trip request rejected'));
  }

  @Delete('business-trip-requests/:requestId')
  deleteBusinessTripRequest(
    @Param('requestId') requestId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') companyId: string | undefined,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.attendanceRequestsService
      .deleteBusinessTripRequest(requestId, companyId ?? 'main', authorization, tenantId)
      .then((data) => ok(data, 'HRM-BT-205', 'Business trip request deleted'));
  }

  @Get('late-early-requests')
  listLateEarlyRequests(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: ListAttendanceRequestsQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
    return this.attendanceRequestsService
      .listLateEarlyRequests(query, authorization, tenantId)
      .then((data) => ok(data, 'HRM-LE-REQ-200', 'Late/early requests listed'));
  }

  @Post('late-early-requests')
  createLateEarlyRequest(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Body() body: CreateLateEarlyRequestDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    return this.attendanceRequestsService
      .createLateEarlyRequest(body, authorization)
      .then((data) => ok(data, 'HRM-LE-REQ-201', 'Late/early request created'));
  }

  @Post('late-early-requests/:requestId/approve')
  approveLateEarlyRequest(
    @Param('requestId') requestId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') companyId: string | undefined,
    @Body() body: DecideLeaveRequestDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.attendanceRequestsService
      .approveLateEarlyRequest(requestId, body, companyId ?? 'main', authorization, tenantId)
      .then((data) => ok(data, 'HRM-LE-REQ-203', 'Late/early request approved'));
  }

  @Post('late-early-requests/:requestId/reject')
  rejectLateEarlyRequest(
    @Param('requestId') requestId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') companyId: string | undefined,
    @Body() body: DecideLeaveRequestDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.attendanceRequestsService
      .rejectLateEarlyRequest(requestId, body, companyId ?? 'main', authorization, tenantId)
      .then((data) => ok(data, 'HRM-LE-REQ-204', 'Late/early request rejected'));
  }

  @Delete('late-early-requests/:requestId')
  deleteLateEarlyRequest(
    @Param('requestId') requestId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') companyId: string | undefined,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.attendanceRequestsService
      .deleteLateEarlyRequest(requestId, companyId ?? 'main', authorization, tenantId)
      .then((data) => ok(data, 'HRM-LE-REQ-205', 'Late/early request deleted'));
  }

  @Get('shift-change-requests')
  listShiftChangeRequests(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: ListAttendanceRequestsQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
    return this.attendanceRequestsService
      .listShiftChangeRequests(query, authorization, tenantId)
      .then((data) => ok(data, 'HRM-SC-200', 'Shift change requests listed'));
  }

  @Post('shift-change-requests')
  createShiftChangeRequest(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Body() body: CreateShiftChangeRequestDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    return this.attendanceRequestsService
      .createShiftChangeRequest(body, authorization)
      .then((data) => ok(data, 'HRM-SC-201', 'Shift change request created'));
  }

  @Post('shift-change-requests/:requestId/approve')
  approveShiftChangeRequest(
    @Param('requestId') requestId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') companyId: string | undefined,
    @Body() body: DecideLeaveRequestDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.attendanceRequestsService
      .approveShiftChangeRequest(requestId, body, companyId ?? 'main', authorization, tenantId)
      .then((data) => ok(data, 'HRM-SC-203', 'Shift change request approved'));
  }

  @Post('shift-change-requests/:requestId/reject')
  rejectShiftChangeRequest(
    @Param('requestId') requestId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') companyId: string | undefined,
    @Body() body: DecideLeaveRequestDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.attendanceRequestsService
      .rejectShiftChangeRequest(requestId, body, companyId ?? 'main', authorization, tenantId)
      .then((data) => ok(data, 'HRM-SC-204', 'Shift change request rejected'));
  }

  @Get('work-shifts')
  listWorkShifts(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.attendanceCatalog
      .listWorkShifts(companyId, authorization)
      .then((data) => ok(data, 'HRM-WS-200', 'Work shifts listed'));
  }

  @Post('work-shifts')
  createWorkShift(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Body() body: Record<string, unknown>,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    return this.attendanceCatalog
      .createWorkShift(body, authorization)
      .then((data) => ok(data, 'HRM-WS-201', 'Work shift created'));
  }

  @Patch('work-shifts/:shiftId')
  updateWorkShift(
    @Param('shiftId') shiftId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Query('company_id') companyId: string,
    @Body() body: Record<string, unknown>,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    return this.attendanceCatalog
      .updateWorkShift(shiftId, body, companyId, authorization)
      .then((data) => ok(data, 'HRM-WS-200', 'Work shift updated'));
  }

  @Delete('work-shifts/:shiftId')
  deleteWorkShift(
    @Param('shiftId') shiftId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    return this.attendanceCatalog
      .deleteWorkShift(shiftId, companyId, authorization)
      .then((data) => ok(data, 'HRM-WS-200', 'Work shift deleted'));
  }

  @Get('attendance-sheets')
  listAttendanceSheets(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.attendanceCatalog
      .listAttendanceSheets(companyId, authorization)
      .then((data) => ok(data, 'HRM-AS-200', 'Attendance sheets listed'));
  }

  @Post('attendance-sheets')
  createAttendanceSheet(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Body() body: Record<string, unknown>,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    return this.attendanceCatalog
      .createAttendanceSheet(body, authorization)
      .then((data) => ok(data, 'HRM-AS-201', 'Attendance sheet created'));
  }

  @Patch('attendance-sheets/:sheetId')
  updateAttendanceSheet(
    @Param('sheetId') sheetId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Query('company_id') companyId: string,
    @Body() body: Record<string, unknown>,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    return this.attendanceCatalog
      .updateAttendanceSheet(sheetId, body, companyId, authorization)
      .then((data) => ok(data, 'HRM-AS-200', 'Attendance sheet updated'));
  }

  @Delete('attendance-sheets/:sheetId')
  deleteAttendanceSheet(
    @Param('sheetId') sheetId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    return this.attendanceCatalog
      .deleteAttendanceSheet(sheetId, companyId, authorization)
      .then((data) => ok(data, 'HRM-AS-200', 'Attendance sheet deleted'));
  }

  @Delete('shift-change-requests/:requestId')
  deleteShiftChangeRequest(
    @Param('requestId') requestId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') companyId: string | undefined,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.attendanceRequestsService
      .deleteShiftChangeRequest(requestId, companyId ?? 'main', authorization, tenantId)
      .then((data) => ok(data, 'HRM-SC-205', 'Shift change request deleted'));
  }
}
