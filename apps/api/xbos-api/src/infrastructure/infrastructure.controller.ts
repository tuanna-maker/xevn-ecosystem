import { Body, Controller, Get, Headers, HttpStatus, Put, Query } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { ok } from '../common/api-response';
import { isAuthorizedInternalRequest } from '../common/internal-auth';
import { resolveScopeContext } from '../common/scope-context';
import { UpsertInfrastructureSettingsDto } from './dto/upsert-infrastructure-settings.dto';
import { InfrastructureService } from './infrastructure.service';

@Controller('infrastructure')
export class InfrastructureController {
  constructor(private readonly infrastructureService: InfrastructureService) {}

  private assertInternalAccess(authorization?: string, internalApiKey?: string) {
    if (!isAuthorizedInternalRequest(authorization, internalApiKey)) {
      throw new ApiException('XBOS-AUTH-001', 'Unauthorized internal access', HttpStatus.UNAUTHORIZED);
    }
  }

  @Get('settings')
  async getSettings(
    @Query('tenantId') tenantId?: string,
    @Query('companyId') companyId?: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertInternalAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, { tenantId, companyId });
    const data = await this.infrastructureService.getSettings(scope.tenantId, scope.companyId);
    return ok(data, 'XBOS-INFRA-200', 'Infrastructure settings loaded');
  }

  @Get('summary')
  async getSummary(
    @Query('tenantId') tenantId?: string,
    @Query('companyId') companyId?: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertInternalAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, { tenantId, companyId });
    const data = await this.infrastructureService.getSummary(scope.tenantId, scope.companyId);
    return ok(data, 'XBOS-INFRA-210', 'Infrastructure summary loaded');
  }

  @Put('settings')
  async upsertSettings(
    @Body() dto: UpsertInfrastructureSettingsDto,
    @Headers('x-tenant-id') tenantId?: string,
    @Headers('x-company-id') companyId?: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertInternalAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, { tenantId, companyId });
    const data = await this.infrastructureService.upsertSettings(scope.tenantId, scope.companyId, dto);
    return ok(data, 'XBOS-INFRA-201', 'Infrastructure settings saved');
  }
}

