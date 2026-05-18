import { Body, Controller, Get, Headers, HttpStatus, Post, Query } from '@nestjs/common';
import { resolveScopeContext, resolveTenantOnlyContext } from '../common/scope-context';
import { ApiException } from '../common/api.exception';
import { ok } from '../common/api-response';
import { isAuthorizedInternalRequest } from '../common/internal-auth';
import { KpiEngineService } from './kpi-engine.service';

@Controller('kpi-engine')
export class KpiEngineController {
  constructor(private readonly service: KpiEngineService) {}

  private assertInternalAccess(authorization?: string, internalApiKey?: string) {
    if (!isAuthorizedInternalRequest(authorization, internalApiKey)) {
      throw new ApiException('XBOS-AUTH-001', 'Unauthorized internal access', HttpStatus.UNAUTHORIZED);
    }
  }

  @Post('evaluate')
  evaluate(
    @Body() body: { target: number; actual: number; weight?: number; warningThreshold?: number; criticalThreshold?: number },
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertInternalAccess(authorization, internalApiKey);
    return ok(this.service.evaluate(body), 'XBOS-KPI-200', 'KPI evaluated');
  }

  @Post('evaluate-batch')
  evaluateBatch(
    @Body() body: { items?: Array<{ target: number; actual: number; weight?: number; warningThreshold?: number; criticalThreshold?: number }> },
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertInternalAccess(authorization, internalApiKey);
    return ok(this.service.evaluateBatch(body.items ?? []), 'XBOS-KPI-201', 'KPI batch evaluated');
  }

  @Get('rollup')
  async rollup(
    @Query('tenantId') tenantId?: string,
    @Query('companyId') companyId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
    @Headers('x-tenant-id') headerTenantId?: string,
    @Headers('x-company-id') headerCompanyId?: string,
  ) {
    this.assertInternalAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, {
      tenantId: tenantId ?? headerTenantId,
      companyId: companyId ?? headerCompanyId,
    });
    const data = await this.service.rollup(scope.tenantId, scope.companyId, from, to);
    return ok(data, 'XBOS-KPI-202', 'KPI rollup loaded');
  }

  @Get('portal-alerts')
  async portalAlerts(
    @Query('tenantId') tenantId?: string,
    @Query('companyId') companyId?: string,
    @Query('limit') limit?: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
    @Headers('x-tenant-id') headerTenantId?: string,
    @Headers('x-company-id') headerCompanyId?: string,
  ) {
    this.assertInternalAccess(authorization, internalApiKey);
    const scope = resolveTenantOnlyContext(authorization, {
      tenantId: tenantId ?? headerTenantId,
      companyId: companyId ?? headerCompanyId,
    });
    const items = await this.service.listPortalAlerts(scope.tenantId, limit ? Number(limit) : 50);
    return ok({ items }, 'XBOS-KPI-203', 'Portal alerts loaded');
  }
}

