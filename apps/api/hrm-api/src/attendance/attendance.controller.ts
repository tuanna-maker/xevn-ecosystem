/**
 * @CODE-MEMORY
 * Screen:     HRM → Chấm công (HTTP /attendance)
 * UC:         HRM-AT-14 · HRM-AT-10 · HRM-AT-01..03
 * BR:         BR-ATT-SHEET-01..07 · AC-ATT-SHEET-01..06
 * SRS:        docs/client-delivery/hrm/SRS_HRM_KHACH.md §3.4 FR-HRM-AT-14 · §3.5 FR-HRM-AT-10 · §3.9 FR-HRM-AT-01
 * SRS bước:   AT-14 #1/#3/#8 list/create sheet · AT-10 #1/#7 leave · AT-01 #7 record
 * TechSpec:   docs/hrm/TECHSPEC.md §14.4 · §14.5 · §12.1/§13 (ref_srs: FR-HRM-AT-14 · FR-HRM-AT-10)
 * Purpose:    Surface bảng công / điểm danh / đơn nghỉ — empty trung thực, không storm.
 * WorkItem:   BE-HRM-CODE-MEMORY-SRS-STEP-01
 * Coded:      2026-07-21
 * Callers:    apps/web/hrm attendance tabs · mobile leave
 * Callees:    AttendanceCatalogService (sheets) · AttendanceService (records) · LeaveRequestsService
 * FE-Actions: Tạo bảng → POST attendance-sheets; Ghi công → POST records; Đơn nghỉ → POST leave-requests
 * BE-Chain:   controller → catalog/service → attendance_sheets / attendance_records / leave_requests
 * Impact:     Phá AC-ATT-SHEET → empty giả / storm reload
 * must_keep:  AC-ATT-SHEET-01..06 · leave-workflow bridge · empty honesty
 * SOLID:      Catalog sheets tách records/leave
 * LastVerified: attendance leave/sheet jest suites
 *
 * @CODE-MEMORY-CHANGE 2026-07-21
 * WorkItem: BE-HRM-CODE-MEMORY-SRS-STEP-01
 * change_mode: ADD
 * What: Map Diễn biến AT-14/AT-10/AT-01 lên handlers (không đổi nghiệp vụ)
 * Why: Sponsor lock CODE-MEMORY ↔ SRS
 * must_keep: AC-ATT-SHEET · G-RC-01 không đụng
 *
 * @CODE-MEMORY-CHANGE 2026-07-21
 * WorkItem: BE-HRM-C-CONV-AS-01
 * change_mode: ADD
 * What: Wire CreateAttendanceSheetDto / UpdateAttendanceSheetDto on POST/PATCH sheets
 * Why: TechSpec §15.1 DTO at edge — ValidationPipe whitelist (C-CONV-AS-01)
 * must_keep: AC-ATT-SHEET-01..06 empty honesty / no auto-seed roster
 */
import { Body, Controller, Delete, Get, Headers, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { ok } from '../common/api-response';
import { isAuthorizedInternalRequest, resolveAuthorizationHeader, getVerifiedInternalJwtPayload } from '../common/internal-auth';
import { toHrmListScopeContext } from '../common/hrm-list-scope-context';
import { resolveScopeContext } from '../common/scope-context';
import { AttendanceService } from './attendance.service';
import { AttendanceCatalogService } from './attendance-catalog.service';
import { CreateAttendanceSheetDto } from './dto/create-attendance-sheet.dto';
import { UpdateAttendanceSheetDto } from './dto/update-attendance-sheet.dto';
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

  /**
   * @CODE-MEMORY method · FR-HRM-AT-01
   * SRS bước: Diễn biến #1 auth · #7 Lưu thành công — ghi bản ghi chấm công
   * TechSpec: §14.4 liên kết lưới · FR-HRM-AT-01 · POST records → HRM-ATT-201
   */
  @Post('records')
  createRecord(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Body() body: CreateAttendanceRecordDto,
  ) {
    // Xử lý: Diễn biến #1 — auth trước ghi điểm danh.
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: body.company_id ?? headerCompanyId });
    return this.attendanceService
      .createRecord(body, authorization, tenantId)
      // Thành công: Diễn biến #7 — bản ghi trên danh sách/lưới kỳ.
      .then((data) => ok(data, 'HRM-ATT-201', 'Attendance record created'));
  }

  /**
   * @CODE-MEMORY method · FR-HRM-AT-02 / AT-14 #9–#10
   * SRS bước: Diễn biến list records — empty lưới trung thực khi chưa điểm danh
   * TechSpec: §14.4 · AC-ATT-SHEET-06 · GET records → HRM-ATT-200
   */
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

  /**
   * @CODE-MEMORY method · FR-HRM-AT-10
   * SRS bước: Diễn biến #1 auth · #7 Gửi thành công — tạo đơn nghỉ phép
   * TechSpec: §14.5 ref_srs FR-HRM-AT-10 · POST leave-requests → HRM-LEAVE-201
   *
   * @CODE-MEMORY-CHANGE 2026-07-27 · D-HRM-LEAVE-REQ-CREATE-BE-01
   * What: Pass x-tenant-id into createLeaveRequest for catalog partition + persist scope
   */
  @Post('leave-requests')
  createLeaveRequest(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Body() body: CreateLeaveRequestDto,
  ) {
    // Xử lý: Diễn biến #1 — auth; validate ngày/số dư ở service (#3–#6).
    this.assertBusinessAccess(authorization, internalApiKey);
    const jwtPayload = getVerifiedInternalJwtPayload(authorization);
    const submitterUserId =
      typeof jwtPayload?.sub === 'string' && jwtPayload.sub.trim()
        ? jwtPayload.sub.trim().toLowerCase()
        : undefined;
    const scope = resolveScopeContext(authorization, {
      tenantId,
      companyId: body.company_id ?? headerCompanyId,
    });
    return this.leaveRequestsService
      .createLeaveRequest(body, authorization, {
        tenantId: scope.tenantId,
        companySlug: headerCompanyId ?? scope.companyId,
        submitterUserId,
      })
      // Thành công: Diễn biến #7 — đơn chờ duyệt trên list (+ workflow_instance_id khi spawn OK).
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

  /**
   * @CODE-MEMORY method · FR-HRM-AT-10
   * SRS bước: Diễn biến #7 sau gửi — list đơn nghỉ trong phạm vi
   * TechSpec: §14.5 ref_srs FR-HRM-AT-10 · GET leave-requests → HRM-LEAVE-200
   */
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

  /**
   * @CODE-MEMORY method · FR-HRM-AT-14
   * SRS bước: Diễn biến #1 Mở danh sách · #3 Tải danh sách · #4 Empty trung thực
   * TechSpec: §14.4 · §12.1/§13 ref_srs FR-HRM-AT-14 · AC-ATT-SHEET-01..06
   * must_keep: không storm reload; empty 200 OK
   */
  @Get('attendance-sheets')
  listAttendanceSheets(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    // Xử lý: Diễn biến #1/#3 — list một lần ổn định; empty = #4.
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.attendanceCatalog
      .listAttendanceSheets(companyId, authorization)
      .then((data) => ok(data, 'HRM-AS-200', 'Attendance sheets listed'));
  }

  /**
   * @CODE-MEMORY method · FR-HRM-AT-14
   * SRS bước: Diễn biến #5 Nhập tạo · #6/#7 kỳ sai/trùng · #8 Lưu thành công · #11 F5
   * TechSpec: §14.4 ref_srs FR-HRM-AT-14 · POST attendance-sheets → HRM-AS-201
   * must_keep: AC-ATT-SHEET — không tự bịa bản ghi ngày
   */
  @Post('attendance-sheets')
  createAttendanceSheet(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Body() body: CreateAttendanceSheetDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    return this.attendanceCatalog
      .createAttendanceSheet(body, authorization)
      // Thành công: Diễn biến #8 — dòng bảng mới ngay (F5 = #11).
      .then((data) => ok(data, 'HRM-AS-201', 'Attendance sheet created'));
  }

  @Patch('attendance-sheets/:sheetId')
  updateAttendanceSheet(
    @Param('sheetId') sheetId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Query('company_id') companyId: string,
    @Body() body: UpdateAttendanceSheetDto,
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
