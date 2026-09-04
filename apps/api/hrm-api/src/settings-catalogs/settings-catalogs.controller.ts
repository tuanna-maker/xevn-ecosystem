/**
 * @CODE-MEMORY
 * Screen: HRM Settings catalogs (`/hr/settings-catalogs`) — overview + item C/U/D
 * UC: HRM-SC-01..03 · UF-HRM-10
 * BR: Group CEO `company_id=main` catalogs partition under `holding` (ADR-GROUP-CEO-MAIN-HOLDING-SCOPE)
 * SRS: docs/client-delivery/hrm/SRS_HRM_KHACH.md §3.8 · FR-HRM-SC-01
 * SRS bước: Diễn biến #1 auth · #2 Mở tổng quan · #3 Chưa đồng bộ empty · #4 Có nhóm
 * TechSpec: docs/hrm/TECHSPEC.md §14.8 (ref_srs: FR-HRM-SC-01) · §11.4 Catalog → form
 * Purpose: Expose tổng quan danh mục (XBOS snapshot + HRM extension); mutate extension items.
 *   Mọi read/write dùng resolveHrmSettingsCatalogCompanyId (main→holding).
 * WorkItem: BE-HRM-CODE-MEMORY-SRS-STEP-01
 * Coded: 2026-07-21
 * Callers: apps/web/hrm settings-catalogs FE · portal groupHrCatalogApi
 * Callees: SettingsCatalogsService · resolveHrmSettingsCatalogCompanyId → hrm_catalog_extension_items
 * FEActions: Mở tổng quan → GET /; Thêm/cập nhật mục → POST/PATCH items → GET overview F5
 * BEChain: resolveScopeContext → resolveHrmSettingsCatalogCompanyId → upsert/delete → same company_id on GET
 * Impact: Write/read company_id mismatch → 201 với empty hrmExtensionItems sau F5
 * must_keep: XBOS sync-from-xbos vẫn map main→holding; empty «chưa đồng bộ» trung thực; seed endpoints không dùng U65
 * SOLID: Controller owns auth+scope; service owns SQL upsert/merge
 * LastVerified: settings-catalogs.controller.spec.ts · d-hrm-set-item-persist-01.spec.ts
 *
 * @CODE-MEMORY-CHANGE 2026-07-21
 * WorkItem: BE-HRM-CODE-MEMORY-SRS-STEP-01
 * change_mode: ADD
 * What: Map Diễn biến FR-HRM-SC-01 + TechSpec §14.8 (không đổi logic)
 * Why: Sponsor lock W1 spine
 * must_keep: D-HRM-SET-ITEM-PERSIST-01 main→holding
 *
 * @CODE-MEMORY-CHANGE 2026-07-17
 * WorkItem: D-HRM-SET-ITEM-PERSIST-01
 * What: Document main→holding catalog partition on overview/items
 *
 * @CODE-MEMORY-CHANGE 2026-07-23
 * WorkItem: D-HRM-SETTINGS-MD-CRUD-BE-01
 * change_mode: ADD
 * What: GET :catalogKey/items picker (q/active/company_id) for AC-SET-FS / AC-HRM-PICKER-01
 * SRS: FR-HRM-SC-POS/JT/LEAVE/DEC/PAY · ADR S1/S3 · TechSpec §18.1
 * must_keep: main→holding partition; empty honesty; no seed in UAT evidence
 *
 * @CODE-MEMORY-CHANGE 2026-07-25
 * WorkItem: D-HRM-SETTINGS-MD-POS-SEED-BE-01
 * change_mode: UPGRADE
 * What: seed/tenant-position-catalog* gated bootstrap-only (G-ORPH-BE-03); SoT = XBOS/Settings
 *
 * @CODE-MEMORY-CHANGE 2026-08-04
 * WorkItem: PO-UC-TC-W4-BE-SYNC-XBOSS-500
 * change_mode: FIX
 * What: sync-from-xbos path hardened in service (parallel + HRM-SYNC-001); controller
 *   still main→holding via resolveHrmSettingsCatalogCompanyId only (pull ≠ apply ≠ clone).
 * must_keep: Leave L2 untouched; no apply-to-members / clone wiring
 */
import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ok } from '../common/api-response';
import { ApiException } from '../common/api.exception';
import { isAuthorizedInternalRequest } from '../common/internal-auth';
import { resolveHrmSettingsCatalogCompanyId } from '../common/hrm-list-scope';
import { resolveScopeContext } from '../common/scope-context';
import { AppendExtensionItemsDto } from './dto/append-extension-items.dto';
import { ListCatalogPickerQueryDto } from './dto/list-catalog-picker.query.dto';
import { RequestCatalogFieldRemovalDto } from './dto/request-removal.dto';
import { SettingsCatalogsService } from './settings-catalogs.service';
import { SettingsCatalogItemMutationDto } from './dto/settings-catalog-item.dto';

@Controller('settings-catalogs')
export class SettingsCatalogsController {
  constructor(private readonly settingsCatalogs: SettingsCatalogsService) {}

  private assertAccess(authorization?: string, internalApiKey?: string) {
    if (!isAuthorizedInternalRequest(authorization, internalApiKey)) {
      throw new ApiException(
        'HRM-AUTH-001',
        'Unauthorized settings-catalog access',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  /** Portal JWT `main` → catalog DB partition (`holding` on master); keep FE body company_id as-is for clients. */
  private resolveCatalogMutationCompanyId(
    authorization: string | undefined,
    tenantId: string | undefined,
    companyIdHeader: string | undefined,
    bodyCompanyId?: string,
  ): { tenantId: string; catalogCompanyId: string } {
    const scope = resolveScopeContext(authorization, {
      tenantId,
      companyId: bodyCompanyId || companyIdHeader,
    });
    const catalogCompanyId = resolveHrmSettingsCatalogCompanyId(
      authorization,
      scope.tenantId,
      scope.companyId,
    );
    return { tenantId: scope.tenantId, catalogCompanyId };
  }

  /**
   * @CODE-MEMORY method · FR-HRM-SC-01
   * SRS bước: Diễn biến #1 auth · #2 Mở tổng quan · #3 empty chưa đồng bộ · #4 Có nhóm
   * TechSpec: §14.8 ref_srs FR-HRM-SC-01 · GET /settings-catalogs → HRM-SET-200
   */
  @Get()
  overview(
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
    @Headers('x-tenant-id') tenantId?: string,
    @Headers('x-company-id') companyId?: string,
    @Query('company_id') queryCompanyId?: string,
  ) {
    // Xử lý: Diễn biến #1 — auth; partition main→holding trước overview.
    this.assertAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, {
      tenantId,
      companyId: companyId ?? queryCompanyId,
    });
    const catalogCompanyId = resolveHrmSettingsCatalogCompanyId(
      authorization,
      scope.tenantId,
      scope.companyId,
    );
    return (
      this.settingsCatalogs
        .getOverview(scope.tenantId, catalogCompanyId)
        // Thành công: Diễn biến #2/#3/#4 — nhóm hoặc empty «chưa đồng bộ» trung thực.
        .then((data) => ok(data, 'HRM-SET-200', 'Settings catalogs overview'))
    );
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
    const { tenantId: resolvedTenantId, catalogCompanyId } =
      this.resolveCatalogMutationCompanyId(
        authorization,
        tenantId,
        companyId,
        body.company_id || body.companyId,
      );
    return this.settingsCatalogs
      .upsertCatalogItem(resolvedTenantId, {
        ...body,
        company_id: catalogCompanyId,
      })
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
    const { tenantId: resolvedTenantId, catalogCompanyId } =
      this.resolveCatalogMutationCompanyId(
        authorization,
        tenantId,
        companyId,
        body.company_id || body.companyId,
      );
    return this.settingsCatalogs
      .upsertCatalogItem(resolvedTenantId, {
        ...body,
        company_id: catalogCompanyId,
      })
      .then((data) => ok(data, 'HRM-SET-202', 'Settings catalog item updated'));
  }

  @Delete('items')
  deleteCatalogItem(
    @Body()
    body: SettingsCatalogItemMutationDto,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
    @Headers('x-tenant-id') tenantId?: string,
    @Headers('x-company-id') companyId?: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    const { tenantId: resolvedTenantId, catalogCompanyId } =
      this.resolveCatalogMutationCompanyId(
        authorization,
        tenantId,
        companyId,
        body.company_id || body.companyId,
      );
    return this.settingsCatalogs
      .deleteCatalogItem(resolvedTenantId, {
        ...body,
        company_id: catalogCompanyId,
      })
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
      .syncAllFromXbos(scope.tenantId, catalogCompanyId, authorization)
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
      .then((data) =>
        ok(
          data,
          'HRM-SET-205',
          'Group employee import catalogs seeded for all tenants',
        ),
      );
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
      .then((data) =>
        ok(
          data,
          'HRM-SET-206',
          'Group employee import catalogs seeded for tenant',
        ),
      );
  }

  @Post('seed/tourism-fleet')
  seedTourismFleet(
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    return this.settingsCatalogs
      .seedTourismFleetCatalog()
      .then((data) =>
        ok(data, 'HRM-SET-207', 'Tourism fleet catalogs seeded for xe-du-lich'),
      );
  }

  @Post('seed/tenant-position-catalog-all')
  seedTenantPositionCatalogAll(
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    return this.settingsCatalogs
      .seedTenantPositionCatalogAllTenants()
      .then((data) =>
        ok(
          data,
          'HRM-SET-208',
          'Tenant position catalogs seeded for all member tenants',
        ),
      );
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
      .then((data) =>
        ok(data, 'HRM-SET-209', 'Tenant position catalog seeded'),
      );
  }

  @Get('batches/:batchId')
  getBatch(
    @Param('batchId') batchId: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
    @Headers('x-tenant-id') tenantId?: string,
    @Headers('x-company-id') companyId?: string,
    @Query('company_id') queryCompanyId?: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, {
      tenantId,
      companyId: companyId ?? queryCompanyId,
    });
    const catalogCompanyId = resolveHrmSettingsCatalogCompanyId(
      authorization,
      scope.tenantId,
      scope.companyId,
    );
    return this.settingsCatalogs
      .getExtensionBatchDetail(
        batchId,
        scope.tenantId,
        catalogCompanyId,
        authorization,
      )
      .then((data) => ok(data, 'HRM-SET-220', 'Extension batch detail'));
  }

  @Post('batches/:batchId/workflow')
  attachWorkflow(
    @Param('batchId') batchId: string,
    @Body() body: { workflowInstanceId: string },
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
    @Headers('x-tenant-id') tenantId?: string,
    @Headers('x-company-id') companyId?: string,
    @Query('company_id') queryCompanyId?: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, {
      tenantId,
      companyId: companyId ?? queryCompanyId,
    });
    const catalogCompanyId = resolveHrmSettingsCatalogCompanyId(
      authorization,
      scope.tenantId,
      scope.companyId,
    );
    return this.settingsCatalogs
      .attachWorkflowToBatch(
        batchId,
        body.workflowInstanceId,
        scope.tenantId,
        catalogCompanyId,
        authorization,
      )
      .then(() =>
        ok(
          { batchId, workflowInstanceId: body.workflowInstanceId },
          'HRM-SET-221',
          'Workflow linked',
        ),
      );
  }

  @Post('batches/:batchId/review')
  reviewBatch(
    @Param('batchId') batchId: string,
    @Body() body: { decision: 'approved' | 'rejected'; review_note?: string },
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
    @Headers('x-tenant-id') tenantId?: string,
    @Headers('x-company-id') companyId?: string,
    @Query('company_id') queryCompanyId?: string,
    @Headers('x-user-id') reviewerUserId?: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, {
      tenantId,
      companyId: companyId ?? queryCompanyId,
    });
    const catalogCompanyId = resolveHrmSettingsCatalogCompanyId(
      authorization,
      scope.tenantId,
      scope.companyId,
    );
    const reviewer = reviewerUserId?.trim() || 'xbos-admin';
    return this.settingsCatalogs
      .reviewExtensionBatch(
        batchId,
        body.decision,
        reviewer,
        body.review_note,
        scope.tenantId,
        catalogCompanyId,
        authorization,
      )
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
      .then((data) =>
        ok(data, 'HRM-SET-210', 'Catalog extension requests listed'),
      );
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
      .reviewExtensionRequest(
        requestId,
        'approved',
        reviewer,
        body?.review_note,
      )
      .then((data) =>
        ok(data, 'HRM-SET-211', 'Catalog extension request approved'),
      );
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
      .reviewExtensionRequest(
        requestId,
        'rejected',
        reviewer,
        body?.review_note,
      )
      .then((data) =>
        ok(data, 'HRM-SET-212', 'Catalog extension request rejected'),
      );
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
      .then((data) =>
        ok(data, 'HRM-SET-204', 'Employee profile catalog template seeded'),
      );
  }

  /**
   * Picker list — AC-SET-FS-01..05 / AC-HRM-PICKER-01.
   * @CODE-MEMORY method · FR-HRM-SC-POS/LEAVE/DEC/PAY
   * TechSpec: §18.1 Settings CRUD + filter/search
   */
  @Get(':catalogKey/items')
  listCatalogPickerItems(
    @Param('catalogKey') catalogKey: string,
    @Query() query: ListCatalogPickerQueryDto,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
    @Headers('x-tenant-id') tenantId?: string,
    @Headers('x-company-id') companyId?: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, {
      tenantId,
      companyId: companyId ?? query.company_id,
    });
    const catalogCompanyId = resolveHrmSettingsCatalogCompanyId(
      authorization,
      scope.tenantId,
      scope.companyId,
    );
    return this.settingsCatalogs
      .listPickerItems(scope.tenantId, catalogCompanyId, catalogKey, {
        q: query.q,
        active: query.active,
        status: query.status,
      })
      .then((data) => ok(data, 'HRM-SET-200', 'Settings catalog picker items'));
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
    const catalogCompanyId = resolveHrmSettingsCatalogCompanyId(
      authorization,
      scope.tenantId,
      scope.companyId,
    );
    // U64/U65: portal browser UF-09/15 must use approval path; immediate only for explicit bulk sync.
    const immediateRequested =
      catalogWriteMode?.trim().toLowerCase() === 'immediate';
    const immediate = immediateRequested && body.bulkSync === true;
    if (immediate) {
      return this.settingsCatalogs
        .appendExtensionItems(
          scope.tenantId,
          catalogCompanyId,
          catalogKey,
          body.items,
        )
        .then((data) =>
          ok(data, 'HRM-SET-202', 'HRM catalog extensions saved'),
        );
    }
    return this.settingsCatalogs
      .submitExtensionItemsForApproval(
        scope.tenantId,
        catalogCompanyId,
        catalogKey,
        body.items,
        {
          userId: userId ?? undefined,
          email: userId?.includes('@') ? userId : undefined,
        },
      )
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
    const catalogCompanyId = resolveHrmSettingsCatalogCompanyId(
      authorization,
      scope.tenantId,
      scope.companyId,
    );
    return this.settingsCatalogs
      .requestFieldRemoval(scope.tenantId, catalogCompanyId, catalogKey, body)
      .then((data) =>
        ok(data, 'HRM-SET-203', 'Catalog field removal request submitted'),
      );
  }
}
