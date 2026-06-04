import { Body, Controller, Headers, HttpStatus, Post } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { ok } from '../common/api-response';
import { isAuthorizedInternalRequest } from '../common/internal-auth';
import { resolveTenantOnlyContext } from '../common/scope-context';
import { AlertsService } from './alerts.service';
import { ViolationIngestDto } from './dto/violation-ingest.dto';

@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  private assertInternalAccess(authorization?: string, internalApiKey?: string) {
    if (!isAuthorizedInternalRequest(authorization, internalApiKey)) {
      throw new ApiException('XBOS-AUTH-001', 'Unauthorized internal access', HttpStatus.UNAUTHORIZED);
    }
  }

  /** UC-XBOS-07 — satellite violation ingest (Hot Point Alert pipeline). */
  @Post('violation-ingest')
  async violationIngest(
    @Body() body: ViolationIngestDto,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertInternalAccess(authorization, internalApiKey);
    const scope = resolveTenantOnlyContext(authorization, { tenantId: body.tenantId });
    const result = await this.alertsService.ingestViolation({
      ...body,
      tenantId: scope.tenantId,
    });
    return ok(result, 'XBOS-ALERT-202', 'Violation event accepted');
  }
}
