import { Body, Controller, Get, Headers, HttpStatus, Param, Post, Query } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { ok } from '../common/api-response';
import { isAuthorizedInternalRequest } from '../common/internal-auth';
import { resolveScopeContext } from '../common/scope-context';
import { DecideEmployeeMetadataChangeDto } from './dto/decide-employee-metadata-change.dto';
import { ListEmployeeMetadataChangeRequestsQueryDto } from './dto/list-employee-metadata-change-requests.query.dto';
import { SubmitEmployeeMetadataChangeDto } from './dto/submit-employee-metadata-change.dto';
import { EmployeeMetadataService } from './employee-metadata.service';

@Controller('employee-metadata')
export class EmployeeMetadataController {
  constructor(private readonly employeeMetadataService: EmployeeMetadataService) {}

  private assertBusinessAccess(authorization?: string, internalApiKey?: string) {
    if (!isAuthorizedInternalRequest(authorization, internalApiKey)) {
      throw new ApiException('HRM-AUTH-001', 'Unauthorized employee metadata access', HttpStatus.UNAUTHORIZED);
    }
  }

  @Post('change-requests')
  submitChangeRequest(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Body() body: SubmitEmployeeMetadataChangeDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: body.company_id ?? headerCompanyId });
    return this.employeeMetadataService
      .submitChangeRequest(body)
      .then((data) => ok(data, 'HRM-META-201', 'Metadata change request submitted'));
  }

  @Get('change-requests')
  listChangeRequests(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: ListEmployeeMetadataChangeRequestsQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
    return this.employeeMetadataService
      .listChangeRequests(query)
      .then((data) => ok(data, 'HRM-META-200', 'Metadata change requests listed'));
  }

  @Post('change-requests/:changeRequestId/approve')
  approveChangeRequest(
    @Param('changeRequestId') changeRequestId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') companyId: string | undefined,
    @Body() body: DecideEmployeeMetadataChangeDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.employeeMetadataService
      .approveChangeRequest(changeRequestId, body)
      .then((data) => ok(data, 'HRM-META-202', 'Metadata change request approved'));
  }

  @Post('change-requests/:changeRequestId/reject')
  rejectChangeRequest(
    @Param('changeRequestId') changeRequestId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') companyId: string | undefined,
    @Body() body: DecideEmployeeMetadataChangeDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.employeeMetadataService
      .rejectChangeRequest(changeRequestId, body)
      .then((data) => ok(data, 'HRM-META-203', 'Metadata change request rejected'));
  }

  @Get('audit-logs')
  listAuditLogs(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
    @Query('employee_id') employeeId?: string,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.employeeMetadataService
      .listAuditLogs(companyId, employeeId)
      .then((data) => ok(data, 'HRM-META-204', 'Metadata audit logs listed'));
  }
}
