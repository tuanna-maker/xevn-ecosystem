import { Controller, Get, Headers, Param, Post } from '@nestjs/common';
import { CatalogSyncService } from './catalog-sync.service';
import { ok } from '../common/api-response';
import { ApiException } from '../common/api.exception';
import { HttpStatus } from '@nestjs/common';
import { isAuthorizedInternalRequest } from '../common/internal-auth';
import { resolveScopeContext } from '../common/scope-context';

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
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertSyncAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, { tenantId, companyId });
    return this.catalogSyncService
      .pullCatalogFromXbos(catalogKey, scope.tenantId, scope.companyId)
      .then((data) => ok(data, 'HRM-SYNC-200', 'Catalog pulled from XBOS'));
  }

  @Get('status')
  async getCatalogSyncStatus(
    @Headers('x-tenant-id') tenantId?: string,
    @Headers('x-company-id') companyId?: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertSyncAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, { tenantId, companyId });
    const data = await this.catalogSyncService.getCatalogSyncStatus(scope.tenantId, scope.companyId);
    return ok(data, 'HRM-SYNC-203', 'Catalog sync status fetched');
  }

  @Get(':catalogKey')
  async getLocalCatalog(
    @Param('catalogKey') catalogKey: string,
    @Headers('x-tenant-id') tenantId?: string,
    @Headers('x-company-id') companyId?: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertSyncAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, { tenantId, companyId });
    const data = await this.catalogSyncService.getSyncedCatalog(catalogKey, scope.tenantId, scope.companyId);
    return ok(data, 'HRM-SYNC-201', 'Synced catalog fetched');
  }

  @Get()
  async listLocalCatalogs(
    @Headers('x-tenant-id') tenantId?: string,
    @Headers('x-company-id') companyId?: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertSyncAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, { tenantId, companyId });
    const data = await this.catalogSyncService.listSyncedCatalogs(scope.tenantId, scope.companyId);
    return ok(data, 'HRM-SYNC-202', 'Synced catalogs listed');
  }
}
