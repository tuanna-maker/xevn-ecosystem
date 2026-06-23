import { Controller, Get, Headers, HttpStatus } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { ok } from '../common/api-response';
import { isAuthorizedInternalRequest } from '../common/internal-auth';
import { resolveScopeContext } from '../common/scope-context';
import { OperatingUnitsService } from './operating-units.service';

@Controller('operating-units')
export class OperatingUnitsController {
  constructor(private readonly service: OperatingUnitsService) {}

  private assertAccess(authorization?: string, internalApiKey?: string) {
    if (!isAuthorizedInternalRequest(authorization, internalApiKey)) {
      throw new ApiException(
        'HRM-AUTH-001',
        'Unauthorized operating-units access',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @Get()
  list(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
  ) {
    this.assertAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, {
      tenantId,
      companyId: headerCompanyId,
    });
    return this.service
      .listOperatingUnits(authorization, { tenantId: scope.tenantId })
      .then((data) => ok(data, 'HRM-OPU-200', 'Operating units listed'));
  }
}
