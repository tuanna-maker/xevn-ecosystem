import { Controller, Get, Headers, HttpStatus, Query } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { ok } from '../common/api-response';
import { isAuthorizedInternalRequest } from '../common/internal-auth';
import { resolveScopeContext } from '../common/scope-context';
import { FleetService } from './fleet.service';

@Controller('fleet')
export class FleetController {
  constructor(private readonly fleet: FleetService) {}

  private assertAccess(authorization?: string, internalApiKey?: string) {
    if (!isAuthorizedInternalRequest(authorization, internalApiKey)) {
      throw new ApiException('HRM-AUTH-001', 'Unauthorized fleet access', HttpStatus.UNAUTHORIZED);
    }
  }

  @Get('vehicles')
  listVehicles(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') companyId: string | undefined,
    @Query('status') status?: string,
    @Query('limit') limitRaw?: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, { tenantId, companyId });
    const limit = limitRaw ? Number(limitRaw) : undefined;
    return this.fleet
      .listVehicles(scope.tenantId, scope.companyId, { status, limit })
      .then((data) => ok(data, 'HRM-FLEET-200', 'Fleet vehicles listed'));
  }
}
