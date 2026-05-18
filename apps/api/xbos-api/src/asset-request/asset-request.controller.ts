import { Body, Controller, Get, Headers, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { ok } from '../common/api-response';
import { isAuthorizedInternalRequest } from '../common/internal-auth';
import { resolveScopeContext } from '../common/scope-context';
import { AssetRequestService } from './asset-request.service';

@Controller('asset-requests')
export class AssetRequestController {
  constructor(private readonly service: AssetRequestService) {}

  private assertInternal(authorization?: string, internalApiKey?: string) {
    if (!isAuthorizedInternalRequest(authorization, internalApiKey)) {
      throw new ApiException('XBOS-AUTH-001', 'Unauthorized internal access', HttpStatus.UNAUTHORIZED);
    }
  }

  @Get()
  async list(@Headers('x-tenant-id') tenantId?: string, @Headers('x-company-id') companyId?: string, @Headers('authorization') authorization?: string, @Headers('x-internal-api-key') internalApiKey?: string) {
    this.assertInternal(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, { tenantId, companyId });
    return ok({ items: await this.service.list(scope.tenantId, scope.companyId) }, 'XBOS-AST-200', 'Asset requests loaded');
  }

  @Post()
  async create(@Body() body: Record<string, unknown>, @Headers('x-tenant-id') tenantId?: string, @Headers('x-company-id') companyId?: string, @Headers('authorization') authorization?: string, @Headers('x-internal-api-key') internalApiKey?: string) {
    this.assertInternal(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, { tenantId, companyId });
    return ok(await this.service.create(scope.tenantId, scope.companyId, body), 'XBOS-AST-201', 'Asset request created');
  }

  @Post(':requestId/transition')
  async transition(@Param('requestId') requestId: string, @Body() body: { status: string; actor?: string }, @Headers('x-tenant-id') tenantId?: string, @Headers('x-company-id') companyId?: string, @Headers('authorization') authorization?: string, @Headers('x-internal-api-key') internalApiKey?: string) {
    this.assertInternal(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, { tenantId, companyId });
    return ok(await this.service.transition(scope.tenantId, scope.companyId, requestId, body.status, body.actor ?? 'system'), 'XBOS-AST-200', 'Status updated');
  }
}
