import { Body, Controller, Delete, Get, Headers, HttpStatus, Param, Put, Query } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { ok } from '../common/api-response';
import { isAuthorizedInternalRequest } from '../common/internal-auth';
import { resolveScopeContext } from '../common/scope-context';
import { BusinessMasterService } from './business-master.service';

@Controller('business-master')
export class BusinessMasterController {
  constructor(private readonly service: BusinessMasterService) {}

  private assertInternalAccess(authorization?: string, internalApiKey?: string) {
    if (!isAuthorizedInternalRequest(authorization, internalApiKey)) {
      throw new ApiException('XBOS-AUTH-001', 'Unauthorized internal access', HttpStatus.UNAUTHORIZED);
    }
  }

  @Get(':domain/items')
  async list(
    @Param('domain') domain: string,
    @Query('tenantId') tenantId?: string,
    @Query('companyId') companyId?: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertInternalAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, { tenantId, companyId });
    const data = await this.service.list(scope.tenantId, scope.companyId, domain);
    return ok({ items: data }, 'XBOS-MASTER-200', 'Business master items loaded');
  }

  @Put(':domain/items/:itemId')
  async upsert(
    @Param('domain') domain: string,
    @Param('itemId') itemId: string,
    @Body() body: unknown,
    @Headers('x-tenant-id') tenantId?: string,
    @Headers('x-company-id') companyId?: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertInternalAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, { tenantId, companyId });
    const data = await this.service.upsert(scope.tenantId, scope.companyId, domain, itemId, body);
    return ok(data, 'XBOS-MASTER-201', 'Business master item saved');
  }

  @Delete(':domain/items/:itemId')
  async remove(
    @Param('domain') domain: string,
    @Param('itemId') itemId: string,
    @Headers('x-tenant-id') tenantId?: string,
    @Headers('x-company-id') companyId?: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertInternalAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, { tenantId, companyId });
    const data = await this.service.remove(scope.tenantId, scope.companyId, domain, itemId);
    return ok(data, 'XBOS-MASTER-204', 'Business master item deleted');
  }
}

