import { Body, Controller, Get, Headers, HttpStatus, Param, Post, Query } from '@nestjs/common';
import { ok } from '../common/api-response';
import { ApiException } from '../common/api.exception';
import { isAuthorizedInternalRequest } from '../common/internal-auth';
import { CatalogGovernanceService } from './catalog-governance.service';

@Controller('catalog-governance')
export class CatalogGovernanceController {
  constructor(private readonly governance: CatalogGovernanceService) {}

  private assertAccess(authorization?: string, internalApiKey?: string) {
    if (!isAuthorizedInternalRequest(authorization, internalApiKey)) {
      throw new ApiException('XBOS-AUTH-001', 'Unauthorized catalog governance access', HttpStatus.UNAUTHORIZED);
    }
  }

  @Post('workflows/seed-xe-du-lich-catalog')
  seedWorkflow(
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    return this.governance
      .ensureXeDuLichCatalogWorkflow()
      .then((data) => ok(data, 'XBOS-CAT-210', 'HRM catalog approval workflow seeded'));
  }

  @Post('workflows/start')
  startWorkflow(
    @Body() body: { batchId: string; memberTenantId: string; memberCompanyId: string; requesterUserId?: string },
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    return this.governance
      .startCatalogApprovalWorkflow(body)
      .then((data) => ok(data, 'XBOS-CAT-211', 'Catalog approval workflow started'));
  }

  @Get('inbox')
  inbox(
    @Query('assigneeUserId') assigneeUserId: string | undefined,
    @Headers('x-user-id') headerUserId?: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    const user = assigneeUserId?.trim() || headerUserId?.trim() || 'ceo@xevn.vn';
    return this.governance
      .listApprovalInbox(user)
      .then((data) => ok(data, 'XBOS-CAT-212', 'Catalog approval inbox'));
  }

  @Get('instances/:instanceId')
  instanceDetail(
    @Param('instanceId') instanceId: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    return this.governance
      .getApprovalDetail(instanceId)
      .then((data) => ok(data, 'XBOS-CAT-213', 'Catalog approval detail'));
  }

  @Post('tasks/:taskId/approve')
  approveTask(
    @Param('taskId') taskId: string,
    @Body() body: { review_note?: string },
    @Headers('x-user-id') reviewerUserId?: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    const reviewer = reviewerUserId?.trim() || 'ceo@xevn.vn';
    return this.governance
      .actOnTask(taskId, 'approve', reviewer, body?.review_note)
      .then((data) => ok(data, 'XBOS-CAT-201', 'Catalog extension approved via workflow'));
  }

  @Post('tasks/:taskId/reject')
  rejectTask(
    @Param('taskId') taskId: string,
    @Body() body: { review_note?: string },
    @Headers('x-user-id') reviewerUserId?: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    const reviewer = reviewerUserId?.trim() || 'ceo@xevn.vn';
    return this.governance
      .actOnTask(taskId, 'reject', reviewer, body?.review_note)
      .then((data) => ok(data, 'XBOS-CAT-202', 'Catalog extension rejected via workflow'));
  }

  @Get('extension-requests')
  listPending(
    @Query('tenantId') tenantId?: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    return this.governance
      .listPendingExtensionRequests(tenantId)
      .then((data) => ok(data, 'XBOS-CAT-200', 'Pending HRM catalog extension requests'));
  }
}
