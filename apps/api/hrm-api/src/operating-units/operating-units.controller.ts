import { Controller, Get, Headers, HttpStatus, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ApiException } from '../common/api.exception';
import { ok } from '../common/api-response';
import { isAuthorizedInternalRequest } from '../common/internal-auth';
import { isHrmTenantOnlyScopeEnabled } from '../common/hrm-tenant-scope';
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
    @Res({ passthrough: true }) res: Response,
  ) {
    this.assertAccess(authorization, internalApiKey);
    if (isHrmTenantOnlyScopeEnabled()) {
      res.setHeader('Deprecation', 'true');
      res.setHeader(
        'Link',
        '</api/xbos/tenant-scope/group-member-units>; rel="successor-version"',
      );
    }
    const scope = resolveScopeContext(authorization, {
      tenantId,
      companyId: headerCompanyId,
    });
    return this.service
      .listOperatingUnits(authorization, { tenantId: scope.tenantId })
      .then((data) => ok(data, 'HRM-OPU-200', 'Operating units listed'));
  }
}
