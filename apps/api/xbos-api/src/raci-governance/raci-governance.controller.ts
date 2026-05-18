import { Body, Controller, Get, Headers, HttpStatus, Param, Put, Query } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { ok } from '../common/api-response';
import { isAuthorizedInternalRequest } from '../common/internal-auth';
import { resolveScopeContext, resolveTenantOnlyContext } from '../common/scope-context';
import { RaciGovernanceService } from './raci-governance.service';

@Controller('raci-governance')
export class RaciGovernanceController {
  constructor(private readonly service: RaciGovernanceService) {}

  private assertInternal(authorization?: string, internalApiKey?: string) {
    if (!isAuthorizedInternalRequest(authorization, internalApiKey)) {
      throw new ApiException('XBOS-AUTH-001', 'Unauthorized internal access', HttpStatus.UNAUTHORIZED);
    }
  }

  @Get('catalog')
  async catalog(
    @Query('domain') domain?: string,
    @Headers('x-tenant-id') tenantId?: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertInternal(authorization, internalApiKey);
    const scope = resolveTenantOnlyContext(authorization, { tenantId });
    return ok(await this.service.listCatalog(scope.tenantId, domain), 'XBOS-RACI-200', 'RACI catalog loaded');
  }

  @Get('companies/:companyId/matrix')
  async matrix(
    @Param('companyId') companyId: string,
    @Query('domain') domain?: string,
    @Headers('x-tenant-id') tenantId?: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertInternal(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, { tenantId, companyId });
    return ok(
      await this.service.getCompanyMatrix(scope.tenantId, scope.companyId, domain),
      'XBOS-RACI-200',
      'Company RACI matrix loaded',
    );
  }

  @Get('capabilities')
  async capabilities(
    @Query('activityCode') activityCode?: string,
    @Headers('x-tenant-id') tenantId?: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertInternal(authorization, internalApiKey);
    const scope = resolveTenantOnlyContext(authorization, { tenantId });
    return ok(await this.service.listCapabilities(scope.tenantId, activityCode), 'XBOS-RACI-200', 'Capabilities loaded');
  }

  @Get('companies/:companyId/coverage')
  async coverage(
    @Param('companyId') companyId: string,
    @Headers('x-tenant-id') tenantId?: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertInternal(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, { tenantId, companyId });
    return ok(await this.service.getCoverage(scope.tenantId, scope.companyId), 'XBOS-RACI-200', 'Coverage loaded');
  }

  @Put('companies/:companyId/matrix/cell')
  async upsertCell(
    @Param('companyId') companyId: string,
    @Body() body: Record<string, unknown>,
    @Headers('x-tenant-id') tenantId?: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertInternal(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, { tenantId, companyId });
    const activityId = String(body.activity_id ?? '');
    const orgColumnId = String(body.org_column_id ?? '');
    if (!activityId || !orgColumnId) {
      throw new ApiException('XBOS-RACI-400', 'activity_id and org_column_id required', HttpStatus.BAD_REQUEST);
    }
    return ok(
      await this.service.upsertMatrixCell(scope.tenantId, scope.companyId, {
        activity_id: activityId,
        org_column_id: orgColumnId,
        raci_letters: String(body.raci_letters ?? ''),
        actor_id: body.actor_id ? String(body.actor_id) : undefined,
      }),
      'XBOS-RACI-201',
      'Matrix cell saved',
    );
  }
}
