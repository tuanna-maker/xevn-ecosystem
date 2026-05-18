import { Controller, Get, Headers, HttpStatus, Query } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { ok } from '../common/api-response';
import { isAuthorizedInternalRequest } from '../common/internal-auth';
import { resolveScopeContext } from '../common/scope-context';
import { CommandCenterService } from './command-center.service';

@Controller('command-center')
export class CommandCenterController {
  constructor(private readonly service: CommandCenterService) {}

  private assertInternal(authorization?: string, internalApiKey?: string) {
    if (!isAuthorizedInternalRequest(authorization, internalApiKey)) {
      throw new ApiException('XBOS-AUTH-001', 'Unauthorized internal access', HttpStatus.UNAUTHORIZED);
    }
  }

  @Get('workspace-meta')
  async workspaceMeta(
    @Query('tenantId') tenantIdQuery: string | undefined,
    @Query('companyId') companyIdQuery: string | undefined,
    @Headers('x-tenant-id') tenantId?: string,
    @Headers('x-company-id') companyId?: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertInternal(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, {
      tenantId: tenantIdQuery ?? tenantId,
      companyId: companyIdQuery ?? companyId,
    });
    const data = await this.service.getWorkspaceMeta(scope.tenantId, scope.companyId);
    return ok(data, 'XBOS-CC-200', 'Workspace meta loaded');
  }
}
