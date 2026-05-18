import { Body, Controller, Get, Headers, HttpStatus, Param, Post, Put, Query } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { ok } from '../common/api-response';
import { isAuthorizedInternalRequest } from '../common/internal-auth';
import { resolveScopeContext } from '../common/scope-context';
import { WorkflowEngineService } from './workflow-engine.service';

@Controller('workflow-engine')
export class WorkflowEngineController {
  constructor(private readonly service: WorkflowEngineService) {}

  private assertInternal(authorization?: string, internalApiKey?: string) {
    if (!isAuthorizedInternalRequest(authorization, internalApiKey)) {
      throw new ApiException('XBOS-AUTH-001', 'Unauthorized internal access', HttpStatus.UNAUTHORIZED);
    }
  }

  @Get('definitions')
  async listDefinitions(@Headers('x-tenant-id') tenantId?: string, @Headers('x-company-id') companyId?: string, @Headers('authorization') authorization?: string, @Headers('x-internal-api-key') internalApiKey?: string) {
    this.assertInternal(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, { tenantId, companyId });
    return ok({ items: await this.service.listDefinitions(scope.tenantId, scope.companyId) }, 'XBOS-WF-200', 'Definitions loaded');
  }

  @Post('definitions')
  async createDefinition(@Body() body: Record<string, unknown>, @Headers('x-tenant-id') tenantId?: string, @Headers('x-company-id') companyId?: string, @Headers('authorization') authorization?: string, @Headers('x-internal-api-key') internalApiKey?: string) {
    this.assertInternal(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, { tenantId, companyId });
    return ok(await this.service.upsertDefinition(scope.tenantId, scope.companyId, null, body), 'XBOS-WF-201', 'Definition saved');
  }

  @Put('definitions/:definitionId')
  async updateDefinition(@Param('definitionId') definitionId: string, @Body() body: Record<string, unknown>, @Headers('x-tenant-id') tenantId?: string, @Headers('x-company-id') companyId?: string, @Headers('authorization') authorization?: string, @Headers('x-internal-api-key') internalApiKey?: string) {
    this.assertInternal(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, { tenantId, companyId });
    return ok(await this.service.upsertDefinition(scope.tenantId, scope.companyId, definitionId, body), 'XBOS-WF-201', 'Definition saved');
  }

  @Post('instances')
  async startInstance(@Body() body: Record<string, unknown>, @Headers('x-tenant-id') tenantId?: string, @Headers('x-company-id') companyId?: string, @Headers('authorization') authorization?: string, @Headers('x-internal-api-key') internalApiKey?: string) {
    this.assertInternal(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, { tenantId, companyId });
    return ok(await this.service.startInstance(scope.tenantId, scope.companyId, body), 'XBOS-WF-201', 'Instance started');
  }

  @Get('instances')
  async listInstances(@Query('status') status: string | undefined, @Headers('x-tenant-id') tenantId?: string, @Headers('x-company-id') companyId?: string, @Headers('authorization') authorization?: string, @Headers('x-internal-api-key') internalApiKey?: string) {
    this.assertInternal(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, { tenantId, companyId });
    return ok({ items: await this.service.listInstances(scope.tenantId, scope.companyId, status) }, 'XBOS-WF-200', 'Instances loaded');
  }

  @Get('tasks')
  async listTasks(
    @Query('assigneeUserId') assigneeUserId: string | undefined,
    @Query('tenantId') tenantId: string | undefined,
    @Query('status') status: string | undefined,
    @Query('businessType') businessType: string | undefined,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertInternal(authorization, internalApiKey);
    return ok(
      {
        items: await this.service.listStepTasks({
          assigneeUserId,
          tenantId,
          status,
          businessType,
        }),
      },
      'XBOS-WF-203',
      'Tasks loaded',
    );
  }

  @Get('instances/:instanceId/detail')
  async instanceDetail(
    @Param('instanceId') instanceId: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertInternal(authorization, internalApiKey);
    return ok(await this.service.getInstanceWithTasks(instanceId), 'XBOS-WF-204', 'Instance detail loaded');
  }

  @Post('tasks/:taskId/complete')
  async completeTask(@Param('taskId') taskId: string, @Body() body: Record<string, unknown>, @Headers('authorization') authorization?: string, @Headers('x-internal-api-key') internalApiKey?: string) {
    this.assertInternal(authorization, internalApiKey);
    return ok(await this.service.completeStepTask(taskId, body), 'XBOS-WF-200', 'Task completed');
  }

  @Post('tasks/:taskId/reject')
  async rejectTask(@Param('taskId') taskId: string, @Body() body: Record<string, unknown>, @Headers('authorization') authorization?: string, @Headers('x-internal-api-key') internalApiKey?: string) {
    this.assertInternal(authorization, internalApiKey);
    return ok(await this.service.rejectStepTask(taskId, body), 'XBOS-WF-205', 'Task rejected');
  }

  @Get('reporting-routes')
  async listRoutes(@Headers('x-tenant-id') tenantId?: string, @Headers('x-company-id') companyId?: string, @Headers('authorization') authorization?: string, @Headers('x-internal-api-key') internalApiKey?: string) {
    this.assertInternal(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, { tenantId, companyId });
    return ok({ items: await this.service.listReportingRoutes(scope.tenantId, scope.companyId) }, 'XBOS-WF-200', 'Routes loaded');
  }

  @Post('reporting-routes')
  async createRoute(@Body() body: Record<string, unknown>, @Headers('x-tenant-id') tenantId?: string, @Headers('x-company-id') companyId?: string, @Headers('authorization') authorization?: string, @Headers('x-internal-api-key') internalApiKey?: string) {
    this.assertInternal(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, { tenantId, companyId });
    return ok(await this.service.upsertReportingRoute(scope.tenantId, scope.companyId, body), 'XBOS-WF-201', 'Route saved');
  }
}
