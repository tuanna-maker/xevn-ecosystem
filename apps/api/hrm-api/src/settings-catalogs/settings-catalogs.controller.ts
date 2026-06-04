import { Body, Controller, Delete, Get, Headers, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { ok } from '../common/api-response';
import { ApiException } from '../common/api.exception';
import { isAuthorizedInternalRequest } from '../common/internal-auth';
import { resolveHrmSettingsCatalogCompanyId } from '../common/hrm-list-scope';
import { resolveScopeContext } from '../common/scope-context';
import { AppendExtensionItemsDto } from './dto/append-extension-items.dto';
import { RequestCatalogFieldRemovalDto } from './dto/request-removal.dto';
import { SettingsCatalogsService } from './settings-catalogs.service';
import { SettingsCatalogItemMutationDto } from './dto/settings-catalog-item.dto';

@Controller('settings-catalogs')
export class SettingsCatalogsController {
  constructor(private readonly settingsCatalogs: SettingsCatalogsService) {}

  private assertAccess(authorization?: string, internalApiKey?: string) {
    if (!isAuthorizedInternalRequest(authorization, internalApiKey)) {
      throw new ApiException('HRM-AUTH-001', 'Unauthorized settings-catalog access', HttpStatus.UNAUTHORIZED);
    }
  }

  @Get()
  overview(
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
    @Headers('x-tenant-id') tenantId?: string,
    @Headers('x-company-id') companyId?: string,
    @Query('company_id') queryCompanyId?: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, { tenantId, companyId: companyId ?? queryCompanyId });
    const catalogCompanyId = resolveHrmSettingsCatalogCompanyId(
      authorization,
      scope.tenantId,
      scope.companyId,
    );
    return this.settingsCatalogs
      .getOverview(scope.tenantId, catalogCompanyId)
      .then((data) => ok(data, 'HRM-SET-200', 'Settings catalogs overview'));
  }

  @Post('items')
  createCatalogItem(
    @Body() body: SettingsCatalogItemMutationDto,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
    @Headers('x-tenant-id') tenantId?: string,
    @Headers('x-company-id') companyId?: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, { tenantId, companyId: body.company_id ?? companyId });
    return this.settingsCatalogs
      .upsertCatalogItem(scope.tenantId, body)
      .then((data) => ok(data, 'HRM-SET-201', 'Settings catalog item created'));
  }

  @Patch('items')
  updateCatalogItem(
    @Body() body: SettingsCatalogItemMutationDto,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
    @Headers('x-tenant-id') tenantId?: string,
    @Headers('x-company-id') companyId?: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, { tenantId, companyId: body.company_id ?? companyId });
    return this.settingsCatalogs
      .upsertCatalogItem(scope.tenantId, body)
      .then((data) => ok(data, 'HRM-SET-202', 'Settings catalog item updated'));
  }

  @Delete('items')
  deleteCatalogItem(
    @Body() body: Pick<SettingsCatalogItemMutationDto, 'company_id' | 'category_key' | 'item_key'>,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
    @Headers('x-tenant-id') tenantId?: string,
    @Headers('x-company-id') companyId?: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, { tenantId, companyId: body.company_id ?? companyId });
    return this.settingsCatalogs
      .deleteCatalogItem(scope.tenantId, body)
      .then((data) => ok(data, 'HRM-SET-200', 'Settings catalog item deleted'));
  }

  @Post('sync-from-xbos')
  syncFromXbos(
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
    @Headers('x-tenant-id') tenantId?: string,
    @Headers('x-company-id') companyId?: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, { tenantId, companyId });
    const catalogCompanyId = resolveHrmSettingsCatalogCompanyId(
      authorization,
      scope.tenantId,
      scope.companyId,
    );
    return this.settingsCatalogs
      .syncAllFromXbos(scope.tenantId, catalogCompanyId)
      .then((data) => ok(data, 'HRM-SET-201', 'XBOS catalogs pulled into HRM'));
  }

  @Post('seed/group-employee-import-all')
  seedGroupEmployeeImportAll(
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    return this.settingsCatalogs
      .seedGroupEmployeeImportCatalogAllTenants()
      .then((data) => ok(data, 'HRM-SET-205', 'Group employee import catalogs seeded for all tenants'));
  }

  @Post('seed/group-employee-import')
  seedGroupEmployeeImport(
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
    @Headers('x-tenant-id') tenantId?: string,
    @Headers('x-company-id') companyId?: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, { tenantId, companyId });
    return this.settingsCatalogs
      .seedGroupEmployeeImportCatalog(scope.tenantId, scope.companyId)
      .then((data) => ok(data, 'HRM-SET-206', 'Group employee import catalogs seeded for tenant'));
  }

  @Post('seed/tourism-fleet')
  seedTourismFleet(
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    return this.settingsCatalogs
      .seedTourismFleetCatalog()
      .then((data) => ok(data, 'HRM-SET-207', 'Tourism fleet catalogs seeded for xe-du-lich'));
  }

  @Post('seed/tenant-position-catalog-all')
  seedTenantPositionCatalogAll(
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    return this.settingsCatalogs
      .seedTenantPositionCatalogAllTenants()
      .then((data) => ok(data, 'HRM-SET-208', 'Tenant position catalogs seeded for all member tenants'));
  }

  @Post('seed/tenant-position-catalog')
  seedTenantPositionCatalog(
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
    @Headers('x-tenant-id') tenantId?: string,
    @Headers('x-company-id') companyId?: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, { tenantId, companyId });
    return this.settingsCatalogs
      .seedTenantPositionCatalog(scope.tenantId, scope.companyId)
      .then((data) => ok(data, 'HRM-SET-209', 'Tenant position catalog seeded'));
  }

  @Get('batches/:batchId')
  getBatch(
    @Param('batchId') batchId: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    return this.settingsCatalogs
      .getExtensionBatchDetail(batchId)
      .then((data) => ok(data, 'HRM-SET-220', 'Extension batch detail'));
  }

  @Post('batches/:batchId/workflow')
  attachWorkflow(
    @Param('batchId') batchId: string,
    @Body() body: { workflowInstanceId: string },
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    return this.settingsCatalogs
      .attachWorkflowToBatch(batchId, body.workflowInstanceId)
      .then(() => ok({ batchId, workflowInstanceId: body.workflowInstanceId }, 'HRM-SET-221', 'Workflow linked'));
  }

  @Post('batches/:batchId/review')
  reviewBatch(
    @Param('batchId') batchId: string,
    @Body() body: { decision: 'approved' | 'rejected'; review_note?: string },
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
    @Headers('x-user-id') reviewerUserId?: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    const reviewer = reviewerUserId?.trim() || 'xbos-admin';
    return this.settingsCatalogs
      .reviewExtensionBatch(batchId, body.decision, reviewer, body.review_note)
      .then((data) => ok(data, 'HRM-SET-222', 'Extension batch reviewed'));
  }

  @Get('extension-requests')
  listExtensionRequests(
    @Query('status') status?: string,
    @Query('tenantId') tenantId?: string,
    @Query('companyId') companyId?: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    return this.settingsCatalogs
      .listExtensionRequests({ status, tenantId, companyId })
      .then((data) => ok(data, 'HRM-SET-210', 'Catalog extension requests listed'));
  }

  @Post('extension-requests/:requestId/approve')
  approveExtensionRequest(
    @Param('requestId') requestId: string,
    @Body() body: { review_note?: string },
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
    @Headers('x-user-id') reviewerUserId?: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    const reviewer = reviewerUserId?.trim() || 'xbos-admin';
    return this.settingsCatalogs
      .reviewExtensionRequest(requestId, 'approved', reviewer, body?.review_note)
      .then((data) => ok(data, 'HRM-SET-211', 'Catalog extension request approved'));
  }

  @Post('extension-requests/:requestId/reject')
  rejectExtensionRequest(
    @Param('requestId') requestId: string,
    @Body() body: { review_note?: string },
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
    @Headers('x-user-id') reviewerUserId?: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    const reviewer = reviewerUserId?.trim() || 'xbos-admin';
    return this.settingsCatalogs
      .reviewExtensionRequest(requestId, 'rejected', reviewer, body?.review_note)
      .then((data) => ok(data, 'HRM-SET-212', 'Catalog extension request rejected'));
  }

  @Post('seed/employee-profile-template')
  seedEmployeeProfileTemplate(
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
    @Headers('x-tenant-id') tenantId?: string,
    @Headers('x-company-id') companyId?: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, { tenantId, companyId });
    return this.settingsCatalogs
      .seedEmployeeProfileTemplate(scope.tenantId, scope.companyId)
      .then((data) => ok(data, 'HRM-SET-204', 'Employee profile catalog template seeded'));
  }

  @Post(':catalogKey/extension-items')
  appendExtension(
    @Param('catalogKey') catalogKey: string,
    @Body() body: AppendExtensionItemsDto,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
    @Headers('x-tenant-id') tenantId?: string,
    @Headers('x-company-id') companyId?: string,
    @Headers('x-catalog-write-mode') catalogWriteMode?: string,
    @Headers('x-user-id') userId?: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, { tenantId, companyId });
    const immediate = catalogWriteMode?.trim().toLowerCase() === 'immediate';
    if (immediate) {
      return this.settingsCatalogs
        .appendExtensionItems(scope.tenantId, scope.companyId, catalogKey, body.items)
        .then((data) => ok(data, 'HRM-SET-202', 'HRM catalog extensions saved'));
    }
    return this.settingsCatalogs
      .submitExtensionItemsForApproval(scope.tenantId, scope.companyId, catalogKey, body.items, {
        userId: userId ?? undefined,
        email: userId?.includes('@') ? userId : undefined,
      })
      .then((data) => ok(data, 'HRM-SET-209', data.message));
  }

  @Post(':catalogKey/removal-requests')
  requestFieldRemoval(
    @Param('catalogKey') catalogKey: string,
    @Body() body: RequestCatalogFieldRemovalDto,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
    @Headers('x-tenant-id') tenantId?: string,
    @Headers('x-company-id') companyId?: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, { tenantId, companyId });
    return this.settingsCatalogs
      .requestFieldRemoval(scope.tenantId, scope.companyId, catalogKey, body)
      .then((data) => ok(data, 'HRM-SET-203', 'Catalog field removal request submitted'));
  }
}
