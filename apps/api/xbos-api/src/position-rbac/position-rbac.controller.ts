import { Body, Controller, Get, Headers, HttpStatus, Param, Post, Put, Query } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { ok } from '../common/api-response';
import { isAuthorizedInternalRequest } from '../common/internal-auth';
import { resolveScopeContext, resolveTenantOnlyContext } from '../common/scope-context';
import { PositionRbacService } from './position-rbac.service';

@Controller('position-rbac')
export class PositionRbacController {
  constructor(private readonly service: PositionRbacService) {}

  private assertInternal(authorization?: string, internalApiKey?: string) {
    if (!isAuthorizedInternalRequest(authorization, internalApiKey)) {
      throw new ApiException('XBOS-AUTH-001', 'Unauthorized internal access', HttpStatus.UNAUTHORIZED);
    }
  }

  @Get('templates')
  async listTemplates(@Headers('x-tenant-id') tenantId?: string, @Headers('authorization') authorization?: string, @Headers('x-internal-api-key') internalApiKey?: string) {
    this.assertInternal(authorization, internalApiKey);
    const scope = resolveTenantOnlyContext(authorization, { tenantId });
    return ok({ items: await this.service.listTemplates(scope.tenantId) }, 'XBOS-POS-200', 'Templates loaded');
  }

  @Post('templates')
  async createTemplate(@Body() body: Record<string, unknown>, @Headers('x-tenant-id') tenantId?: string, @Headers('authorization') authorization?: string, @Headers('x-internal-api-key') internalApiKey?: string) {
    this.assertInternal(authorization, internalApiKey);
    const scope = resolveTenantOnlyContext(authorization, { tenantId });
    return ok(await this.service.upsertTemplate(scope.tenantId, null, body), 'XBOS-POS-201', 'Template saved');
  }

  @Put('templates/:templateId')
  async updateTemplate(@Param('templateId') templateId: string, @Body() body: Record<string, unknown>, @Headers('x-tenant-id') tenantId?: string, @Headers('authorization') authorization?: string, @Headers('x-internal-api-key') internalApiKey?: string) {
    this.assertInternal(authorization, internalApiKey);
    const scope = resolveTenantOnlyContext(authorization, { tenantId });
    return ok(await this.service.upsertTemplate(scope.tenantId, templateId, body), 'XBOS-POS-201', 'Template saved');
  }

  @Get('assignments')
  async listAssignments(@Headers('x-tenant-id') tenantId?: string, @Headers('x-company-id') companyId?: string, @Headers('authorization') authorization?: string, @Headers('x-internal-api-key') internalApiKey?: string) {
    this.assertInternal(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, { tenantId, companyId });
    return ok({ items: await this.service.listAssignments(scope.tenantId, scope.companyId) }, 'XBOS-POS-200', 'Assignments loaded');
  }

  @Post('assignments')
  async createAssignment(@Body() body: Record<string, unknown>, @Headers('x-tenant-id') tenantId?: string, @Headers('x-company-id') companyId?: string, @Headers('authorization') authorization?: string, @Headers('x-internal-api-key') internalApiKey?: string) {
    this.assertInternal(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, { tenantId, companyId });
    return ok(await this.service.upsertAssignment(scope.tenantId, scope.companyId, null, body), 'XBOS-POS-201', 'Assignment saved');
  }

  @Get('permissions')
  async listPermissions(@Headers('x-tenant-id') tenantId?: string, @Headers('authorization') authorization?: string, @Headers('x-internal-api-key') internalApiKey?: string) {
    this.assertInternal(authorization, internalApiKey);
    const scope = resolveTenantOnlyContext(authorization, { tenantId });
    return ok({ items: await this.service.listPermissionDefinitions(scope.tenantId) }, 'XBOS-POS-200', 'Permissions loaded');
  }

  @Post('permissions')
  async createPermission(@Body() body: Record<string, unknown>, @Headers('x-tenant-id') tenantId?: string, @Headers('authorization') authorization?: string, @Headers('x-internal-api-key') internalApiKey?: string) {
    this.assertInternal(authorization, internalApiKey);
    const scope = resolveTenantOnlyContext(authorization, { tenantId });
    return ok(await this.service.upsertPermissionDefinition(scope.tenantId, null, body), 'XBOS-POS-201', 'Permission saved');
  }

  @Get('grants/conflicts')
  async conflicts(@Query('permissionId') permissionId: string, @Query('assignmentId') assignmentId: string | undefined, @Headers('x-tenant-id') tenantId?: string, @Headers('x-company-id') companyId?: string, @Headers('authorization') authorization?: string, @Headers('x-internal-api-key') internalApiKey?: string) {
    this.assertInternal(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, { tenantId, companyId });
    const rows = await this.service.checkGrantConflicts(scope.tenantId, scope.companyId, permissionId, assignmentId);
    return ok({ conflicts: rows }, 'XBOS-POS-200', 'Conflict check complete');
  }

  @Post('grants')
  async grant(@Body() body: Record<string, unknown>, @Headers('x-tenant-id') tenantId?: string, @Headers('x-company-id') companyId?: string, @Headers('authorization') authorization?: string, @Headers('x-internal-api-key') internalApiKey?: string) {
    this.assertInternal(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, { tenantId, companyId });
    return ok(await this.service.grantPermission(scope.tenantId, scope.companyId, body), 'XBOS-POS-201', 'Permission granted');
  }

  @Get('matrix')
  async getMatrix(
    @Query('roleId') roleId: string,
    @Headers('x-tenant-id') tenantId?: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertInternal(authorization, internalApiKey);
    const scope = resolveTenantOnlyContext(authorization, { tenantId });
    if (!roleId?.trim()) {
      throw new ApiException('XBOS-POS-400', 'roleId query required', HttpStatus.BAD_REQUEST);
    }
    const rows = await this.service.getPermissionMatrix(scope.tenantId, roleId);
    return ok({ roleId, rows }, 'XBOS-POS-200', 'Permission matrix loaded');
  }

  @Put('matrix')
  async saveMatrix(
    @Body() body: { roleId?: string; rows?: Array<Record<string, unknown>> },
    @Headers('x-tenant-id') tenantId?: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertInternal(authorization, internalApiKey);
    const scope = resolveTenantOnlyContext(authorization, { tenantId });
    const roleId = String(body.roleId ?? '');
    const rows = (body.rows ?? []).map((r) => ({
      rowId: String(r.rowId ?? r.id ?? ''),
      view: Boolean(r.view),
      write: Boolean(r.write),
      delete: Boolean(r.delete),
      approve: Boolean(r.approve),
      dataScope: String(r.dataScope ?? 'personal'),
    }));
    const saved = await this.service.savePermissionMatrix(scope.tenantId, roleId, rows);
    return ok({ roleId, rows: saved }, 'XBOS-POS-201', 'Permission matrix saved');
  }

  @Put('job-descriptions/:templateId')
  async upsertJd(@Param('templateId') templateId: string, @Body() body: Record<string, unknown>, @Headers('authorization') authorization?: string, @Headers('x-internal-api-key') internalApiKey?: string) {
    this.assertInternal(authorization, internalApiKey);
    return ok(await this.service.upsertJobDescription(templateId, body), 'XBOS-POS-201', 'Job description saved');
  }
}
