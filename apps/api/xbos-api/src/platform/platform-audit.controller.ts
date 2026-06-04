import { Controller, Get, Headers, HttpStatus, Query } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { ok } from '../common/api-response';
import { isAuthorizedInternalRequest } from '../common/internal-auth';
import { resolveXbosGroupLegalReadScopeContext } from '../common/xbos-group-legal-scope';
import { PlatformAuditService } from './platform-audit.service';

/** UC-XBOS-06 — query platform audit trail (scoped). */
@Controller('platform-audit')
export class PlatformAuditController {
  constructor(private readonly platformAudit: PlatformAuditService) {}

  @Get('events')
  async listEvents(
    @Query('tenantId') tenantId?: string,
    @Query('companyId') companyId?: string,
    @Query('action') action?: string,
    @Query('entityType') entityType?: string,
    @Query('limit') limitRaw?: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    if (!isAuthorizedInternalRequest(authorization, internalApiKey)) {
      throw new ApiException('XBOS-AUTH-001', 'Unauthorized audit access', HttpStatus.UNAUTHORIZED);
    }
    const scope = resolveXbosGroupLegalReadScopeContext(authorization, { tenantId, companyId });
    const limit = Math.min(Math.max(Number.parseInt(limitRaw ?? '50', 10) || 50, 1), 200);
    const data = await this.platformAudit.listEvents({
      tenantId: scope.tenantId,
      companyId: scope.companyId,
      action: action?.trim() || undefined,
      entityType: entityType?.trim() || undefined,
      limit,
    });
    return ok(data, 'XBOS-AUDIT-200', 'Audit events loaded');
  }
}
