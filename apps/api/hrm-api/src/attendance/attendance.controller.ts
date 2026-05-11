import { Body, Controller, Delete, Get, Headers, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { ok } from '../common/api-response';
import { isAuthorizedInternalRequest } from '../common/internal-auth';
import { resolveScopeContext } from '../common/scope-context';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceUpdateRequestDto } from './dto/create-attendance-update-request.dto';
import { DecideAttendanceUpdateRequestDto } from './dto/decide-attendance-update-request.dto';
import { CreateAttendanceRecordDto } from './dto/create-attendance-record.dto';
import { ListAttendanceRecordsQueryDto } from './dto/list-attendance-records.query.dto';
import { ListAttendanceUpdateRequestsQueryDto } from './dto/list-attendance-update-requests.query.dto';
import { UpdateAttendanceUpdateRequestDto } from './dto/update-attendance-update-request.dto';
import { UpdateAttendanceStatusDto } from './dto/update-attendance-status.dto';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

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
    return this.attendanceService.createRecord(body).then((data) => ok(data, 'HRM-ATT-201', 'Attendance record created'));
  }

  @Get('records')
  listRecords(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: ListAttendanceRecordsQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
    return this.attendanceService.listRecords(query).then((data) => ok(data, 'HRM-ATT-200', 'Attendance records listed'));
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
    return this.attendanceService.updateStatus(recordId, body).then((data) => ok(data, 'HRM-ATT-202', 'Attendance status updated'));
  }

  @Post('update-requests')
  createUpdateRequest(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Body() body: CreateAttendanceUpdateRequestDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    return this.attendanceService
      .createUpdateRequest(body)
      .then((data) => ok(data, 'HRM-ATT-REQ-201', 'Attendance update request created'));
  }

  @Get('update-requests')
  listUpdateRequests(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Query() query: ListAttendanceUpdateRequestsQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    return this.attendanceService
      .listUpdateRequests(query)
      .then((data) => ok(data, 'HRM-ATT-REQ-200', 'Attendance update requests listed'));
  }

  @Patch('update-requests/:requestId')
  updateUpdateRequest(
    @Param('requestId') requestId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Body() body: UpdateAttendanceUpdateRequestDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    return this.attendanceService
      .updateUpdateRequest(requestId, body)
      .then((data) => ok(data, 'HRM-ATT-REQ-202', 'Attendance update request updated'));
  }

  @Post('update-requests/:requestId/approve')
  approveUpdateRequest(
    @Param('requestId') requestId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Body() body: DecideAttendanceUpdateRequestDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    return this.attendanceService
      .approveUpdateRequest(requestId, body)
      .then((data) => ok(data, 'HRM-ATT-REQ-203', 'Attendance update request approved'));
  }

  @Post('update-requests/:requestId/reject')
  rejectUpdateRequest(
    @Param('requestId') requestId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Body() body: DecideAttendanceUpdateRequestDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    return this.attendanceService
      .rejectUpdateRequest(requestId, body)
      .then((data) => ok(data, 'HRM-ATT-REQ-204', 'Attendance update request rejected'));
  }

  @Delete('update-requests/:requestId')
  deleteUpdateRequest(
    @Param('requestId') requestId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    return this.attendanceService
      .deleteUpdateRequest(requestId)
      .then((data) => ok(data, 'HRM-ATT-REQ-205', 'Attendance update request deleted'));
  }
}
