import { Controller, Get, Headers, Param, Post, Query } from '@nestjs/common';
import { CatalogSyncService } from './catalog-sync.service';
import { ok } from '../common/api-response';
import { ApiException } from '../common/api.exception';
import { HttpStatus } from '@nestjs/common';
import { isAuthorizedInternalRequest } from '../common/internal-auth';
import { resolveHrmCatalogSyncScope } from '../common/hrm-catalog-sync-scope';

@Controller('catalog-sync')
export class CatalogSyncController {
  constructor(private readonly catalogSyncService: CatalogSyncService) {}

  private assertSyncAccess(authorization?: string, internalKey?: string) {
    if (!isAuthorizedInternalRequest(authorization, internalKey)) {
      throw new ApiException(
        'HRM-AUTH-001',
        'Unauthorized sync access',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @Post('pull/:catalogKey')
  pullFromXbos(
    @Param('catalogKey') catalogKey: string,
    @Headers('x-tenant-id') tenantId?: string,
    @Headers('x-company-id') companyId?: string,
    @Query('tenantId') queryTenantId?: string,
    @Query('companyId') queryCompanyId?: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertSyncAccess(authorization, internalApiKey);
    const scope = resolveHrmCatalogSyncScope(authorization, {
      tenantId: tenantId ?? queryTenantId,
      companyId: companyId ?? queryCompanyId,
    });
    return this.catalogSyncService
      .pullCatalogFromXbos(
        catalogKey,
        scope.tenantId,
        scope.catalogCompanyId,
        authorization,
      )
      .then((data) => ok(data, 'HRM-SYNC-200', 'Catalog pulled from XBOS'));
  }

  @Get('status')
  async getCatalogSyncStatus(
    @Headers('x-tenant-id') tenantId?: string,
    @Headers('x-company-id') companyId?: string,
    @Query('tenantId') queryTenantId?: string,
    @Query('companyId') queryCompanyId?: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertSyncAccess(authorization, internalApiKey);
    const scope = resolveHrmCatalogSyncScope(authorization, {
      tenantId: tenantId ?? queryTenantId,
      companyId: companyId ?? queryCompanyId,
    });
    const data = await this.catalogSyncService.getCatalogSyncStatus(
      scope.tenantId,
      scope.catalogCompanyId,
    );
    return ok(data, 'HRM-SYNC-203', 'Catalog sync status fetched');
  }

  @Get(':catalogKey')
  async getLocalCatalog(
    @Param('catalogKey') catalogKey: string,
    @Headers('x-tenant-id') tenantId?: string,
    @Headers('x-company-id') companyId?: string,
    @Query('tenantId') queryTenantId?: string,
    @Query('companyId') queryCompanyId?: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertSyncAccess(authorization, internalApiKey);
    const scope = resolveHrmCatalogSyncScope(authorization, {
      tenantId: tenantId ?? queryTenantId,
      companyId: companyId ?? queryCompanyId,
    });
    const data = await this.catalogSyncService.getSyncedCatalog(
      catalogKey,
      scope.tenantId,
      scope.catalogCompanyId,
    );
    return ok(data, 'HRM-SYNC-201', 'Synced catalog fetched');
  }

  @Get()
  async listLocalCatalogs(
    @Headers('x-tenant-id') tenantId?: string,
    @Headers('x-company-id') companyId?: string,
    @Query('tenantId') queryTenantId?: string,
    @Query('companyId') queryCompanyId?: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertSyncAccess(authorization, internalApiKey);
    const scope = resolveHrmCatalogSyncScope(authorization, {
      tenantId: tenantId ?? queryTenantId,
      companyId: companyId ?? queryCompanyId,
    });
    const data = await this.catalogSyncService.listSyncedCatalogs(
      scope.tenantId,
      scope.catalogCompanyId,
    );
    return ok(data, 'HRM-SYNC-202', 'Synced catalogs listed');
  }
}
