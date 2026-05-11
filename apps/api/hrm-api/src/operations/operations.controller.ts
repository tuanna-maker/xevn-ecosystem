import { Body, Controller, Delete, Get, Headers, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { ok } from '../common/api-response';
import { isAuthorizedInternalRequest } from '../common/internal-auth';
import { resolveScopeContext } from '../common/scope-context';
import { CreateServiceRequestDto } from './dto/create-service-request.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { DecideServiceRequestDto } from './dto/decide-service-request.dto';
import { ListServiceRequestsQueryDto } from './dto/list-service-requests.query.dto';
import { ListTasksQueryDto } from './dto/list-tasks.query.dto';
import { UpdateServiceRequestDto } from './dto/update-service-request.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { OperationsService } from './operations.service';

@Controller('operations')
export class OperationsController {
  constructor(private readonly service: OperationsService) {}

  private assertAccess(authorization?: string, internalApiKey?: string) {
    if (!isAuthorizedInternalRequest(authorization, internalApiKey)) {
      throw new ApiException('HRM-AUTH-001', 'Unauthorized operations access', HttpStatus.UNAUTHORIZED);
    }
  }

  @Post('tasks')
  createTask(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Body() body: CreateTaskDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: body.company_id ?? headerCompanyId });
    return this.service.createTask(body).then((data) => ok(data, 'HRM-OPS-201', 'Task created'));
  }

  @Get('tasks')
  listTasks(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: ListTasksQueryDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
    return this.service.listTasks(query).then((data) => ok(data, 'HRM-OPS-200', 'Tasks listed'));
  }

  @Patch('tasks/:taskId/status')
  updateTaskStatus(
    @Param('taskId', new ParseUUIDPipe()) taskId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') companyId: string | undefined,
    @Body() body: UpdateTaskStatusDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.service.updateTaskStatus(taskId, body).then((data) => ok(data, 'HRM-OPS-202', 'Task updated'));
  }

  @Get('reports/summary')
  getSummary(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Query('tenant_id') tenantId: string,
    @Query('company_id') companyId: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.service.getSummary(companyId).then((data) => ok(data, 'HRM-OPS-200', 'Summary generated'));
  }

  @Post('service-requests')
  createServiceRequest(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Body() body: CreateServiceRequestDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: body.company_id ?? headerCompanyId });
    return this.service
      .createServiceRequest(body)
      .then((data) => ok(data, 'HRM-SVC-201', 'Service request created'));
  }

  @Get('service-requests')
  listServiceRequests(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: ListServiceRequestsQueryDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
    return this.service
      .listServiceRequests(query)
      .then((data) => ok(data, 'HRM-SVC-200', 'Service requests listed'));
  }

  @Patch('service-requests/:requestId')
  updateServiceRequest(
    @Param('requestId', new ParseUUIDPipe()) requestId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') companyId: string | undefined,
    @Body() body: UpdateServiceRequestDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.service
      .updateServiceRequest(requestId, body)
      .then((data) => ok(data, 'HRM-SVC-202', 'Service request updated'));
  }

  @Delete('service-requests/:requestId')
  deleteServiceRequest(
    @Param('requestId', new ParseUUIDPipe()) requestId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') companyId: string | undefined,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.service
      .deleteServiceRequest(requestId)
      .then((data) => ok(data, 'HRM-SVC-205', 'Service request deleted'));
  }

  @Post('service-requests/:requestId/approve')
  approveServiceRequest(
    @Param('requestId', new ParseUUIDPipe()) requestId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') companyId: string | undefined,
    @Body() body: DecideServiceRequestDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.service
      .approveServiceRequest(requestId, body)
      .then((data) => ok(data, 'HRM-SVC-203', 'Service request approved'));
  }

  @Post('service-requests/:requestId/reject')
  rejectServiceRequest(
    @Param('requestId', new ParseUUIDPipe()) requestId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') companyId: string | undefined,
    @Body() body: DecideServiceRequestDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.service
      .rejectServiceRequest(requestId, body)
      .then((data) => ok(data, 'HRM-SVC-204', 'Service request rejected'));
  }
}
