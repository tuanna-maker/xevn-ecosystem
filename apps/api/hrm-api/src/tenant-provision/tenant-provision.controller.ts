/**
 * @CODE-MEMORY WorkItem: HRM-TENANT-PROVISION-LISTENER-01
 * solid_convention_ack: true
 * be_boundary: true
 *
 * Purpose:    REST fallback for XBOS→HRM tenant provisioning event.
 *             Used when BullMQ is disabled or for direct integration testing.
 * Route:      POST /internal/tenant-provisioned
 * Auth:       x-internal-api-key or internal JWT (isAuthorizedInternalRequest)
 * must_keep:  no cross-DB query; delegate all business logic to TenantProvisionService
 */
import { Body, Controller, HttpStatus, Logger, Post, Headers } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { ok } from '../common/api-response';
import { isAuthorizedInternalRequest } from '../common/internal-auth';
import { TenantProvisionService } from './tenant-provision.service';
import type { TenantProvisionedPayload } from './tenant-provision.service';

@Controller('internal')
export class TenantProvisionController {
  private readonly logger = new Logger(TenantProvisionController.name);

  constructor(private readonly service: TenantProvisionService) {}

  /**
   * POST /internal/tenant-provisioned
   *
   * XBOS calls this after activate if BullMQ is unavailable,
   * or integration tests use it to trigger provisioning directly.
   */
  @Post('tenant-provisioned')
  async handleTenantProvisioned(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Body() payload: TenantProvisionedPayload,
  ) {
    if (!isAuthorizedInternalRequest(authorization, internalApiKey)) {
      throw new ApiException('HRM-AUTH-001', 'Unauthorized internal request', HttpStatus.UNAUTHORIZED);
    }

    this.logger.log(`[HRM] REST tenant-provisioned: tenantId=${payload.tenantId}`);
    await this.service.handleTenantProvisioned(payload);

    return ok(
      { tenantId: payload.tenantId, seeded: true },
      'HRM-TP-200',
      'Tenant provisioned — HRM defaults seeded',
    );
  }
}
