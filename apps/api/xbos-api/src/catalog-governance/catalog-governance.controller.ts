import { Body, Controller, Get, Headers, HttpStatus, Param, Post, Query } from '@nestjs/common';
import { ok } from '../common/api-response';
import { ApiException } from '../common/api.exception';
import { isAuthorizedInternalRequest } from '../common/internal-auth';
import { resolveScopeContext, resolveTenantOnlyContext } from '../common/scope-context';
import { resolveXbosGroupLegalReadScopeContext } from '../common/xbos-group-legal-scope';
import {
  MASTER_COMPANY_HOLDING,
  MASTER_TENANT_XEVN,
} from '../workflow-engine/workflow-catalog.constants';
import { ConfigSyncService } from '../config-sync/config-sync.service';
import { PublishCatalogDto } from '../config-sync/dto/publish-catalog.dto';
import { CatalogGovernanceService } from './catalog-governance.service';
import { StartCatalogWorkflowDto } from './dto/start-catalog-workflow.dto';

@Controller('catalog-governance')
export class CatalogGovernanceController {
  constructor(
    private readonly governance: CatalogGovernanceService,
    private readonly configSync: ConfigSyncService,
  ) {}

  private assertAccess(authorization?: string, internalApiKey?: string) {
    if (!isAuthorizedInternalRequest(authorization, internalApiKey)) {
      throw new ApiException('XBOS-AUTH-001', 'Unauthorized catalog governance access', HttpStatus.UNAUTHORIZED);
    }
  }

  /** Group CEO reads — JWT `main` maps to legal partition `holding` (ADR C2). */
  private resolveGroupReadScope(
    authorization: string | undefined,
    tenantId?: string,
    companyId?: string,
  ) {
    return resolveXbosGroupLegalReadScopeContext(authorization, {
      tenantId: tenantId?.trim() || MASTER_TENANT_XEVN,
      companyId: companyId?.trim() || MASTER_COMPANY_HOLDING,
    });
  }

  /** Group CEO writes — strict JWT∩query match. */
  private resolveGroupWriteScope(
    authorization: string | undefined,
    tenantId?: string,
    companyId?: string,
  ) {
    return resolveScopeContext(authorization, {
      tenantId: tenantId?.trim() || MASTER_TENANT_XEVN,
      companyId: companyId?.trim() || MASTER_COMPANY_HOLDING,
    });
  }

  /** XBOS-DM-HRM-09 — SRS alias for catalog version publish (delegates to config-sync). */
  @Post('publish')
  async publishCatalogVersion(
    @Body() body: PublishCatalogDto,
    @Query('catalogKey') catalogKey = 'job_titles',
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    const scope = resolveXbosGroupLegalReadScopeContext(authorization, {
      tenantId: body.tenantId,
      companyId: body.companyId,
    });
    const data = await this.configSync.publishCatalog(catalogKey, {
      tenantId: scope.tenantId,
      companyId: scope.companyId,
      name: body.name,
      domain: body.domain,
      assignedTo: body.assignedTo,
      items: body.items,
      actor: body.actor,
    });
    return ok(data, 'XBOS-CFG-203', 'Catalog published via catalog-governance');
  }

  @Post('workflows/seed-xe-du-lich-catalog')
  async seedWorkflow(
    @Query('tenantId') tenantId?: string,
    @Query('companyId') companyId?: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    this.resolveGroupWriteScope(authorization, tenantId, companyId);
    const data = await this.governance.ensureXeDuLichCatalogWorkflow();
    return ok(data, 'XBOS-CAT-210', 'HRM catalog approval workflow seeded');
  }

  @Post('workflows/start')
  async startWorkflow(
    @Body() body: StartCatalogWorkflowDto,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    const memberScope = resolveScopeContext(authorization, {
      tenantId: body.memberTenantId,
      companyId: body.memberCompanyId,
    });
    const data = await this.governance.startCatalogApprovalWorkflow({
      batchId: body.batchId,
      memberTenantId: memberScope.tenantId,
      memberCompanyId: memberScope.companyId,
      requesterUserId: body.requesterUserId,
    });
    return ok(data, 'XBOS-CAT-211', 'Catalog approval workflow started');
  }

  @Get('inbox')
  async inbox(
    @Query('assigneeUserId') assigneeUserId: string | undefined,
    @Query('tenantId') tenantId?: string,
    @Query('companyId') companyId?: string,
    @Headers('x-user-id') headerUserId?: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    this.resolveGroupReadScope(authorization, tenantId, companyId);
    const user = assigneeUserId?.trim() || headerUserId?.trim() || 'ceo@xe.vn';
    const data = await this.governance.listApprovalInbox(user);
    return ok(data, 'XBOS-CAT-212', 'Catalog approval inbox');
  }

  @Get('instances/:instanceId')
  async instanceDetail(
    @Param('instanceId') instanceId: string,
    @Query('tenantId') tenantId?: string,
    @Query('companyId') companyId?: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    this.resolveGroupReadScope(authorization, tenantId, companyId);
    const data = await this.governance.getApprovalDetail(instanceId);
    return ok(data, 'XBOS-CAT-213', 'Catalog approval detail');
  }

  @Post('tasks/:taskId/approve')
  async approveTask(
    @Param('taskId') taskId: string,
    @Body() body: { review_note?: string },
    @Query('tenantId') tenantId?: string,
    @Query('companyId') companyId?: string,
    @Headers('x-user-id') reviewerUserId?: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    this.resolveGroupWriteScope(authorization, tenantId, companyId);
    const reviewer = reviewerUserId?.trim() || 'ceo@xe.vn';
    const data = await this.governance.actOnTask(taskId, 'approve', reviewer, body?.review_note);
    return ok(data, 'XBOS-CAT-201', 'Catalog extension approved via workflow');
  }

  @Post('tasks/:taskId/reject')
  async rejectTask(
    @Param('taskId') taskId: string,
    @Body() body: { review_note?: string },
    @Query('tenantId') tenantId?: string,
    @Query('companyId') companyId?: string,
    @Headers('x-user-id') reviewerUserId?: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    this.resolveGroupWriteScope(authorization, tenantId, companyId);
    const reviewer = reviewerUserId?.trim() || 'ceo@xe.vn';
    const data = await this.governance.actOnTask(taskId, 'reject', reviewer, body?.review_note);
    return ok(data, 'XBOS-CAT-202', 'Catalog extension rejected via workflow');
  }

  @Get('extension-requests')
  async listPending(
    @Query('tenantId') tenantId?: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    const scope = resolveTenantOnlyContext(authorization, { tenantId });
    const data = await this.governance.listPendingExtensionRequests(scope.tenantId);
    return ok(data, 'XBOS-CAT-200', 'Pending HRM catalog extension requests');
  }
}
