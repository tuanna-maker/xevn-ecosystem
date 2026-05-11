import { Body, Controller, Get, Headers, HttpStatus, Param, Post } from '@nestjs/common';
import { ok } from '../common/api-response';
import { ApiException } from '../common/api.exception';
import { isAuthorizedInternalRequest } from '../common/internal-auth';
import { resolveScopeContext } from '../common/scope-context';
import { AppendExtensionItemsDto } from './dto/append-extension-items.dto';
import { RequestCatalogFieldRemovalDto } from './dto/request-removal.dto';
import { SettingsCatalogsService } from './settings-catalogs.service';

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
  ) {
    this.assertAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, { tenantId, companyId });
    return this.settingsCatalogs
      .getOverview(scope.tenantId, scope.companyId)
      .then((data) => ok(data, 'HRM-SET-200', 'Settings catalogs overview'));
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
    return this.settingsCatalogs
      .syncAllFromXbos(scope.tenantId, scope.companyId)
      .then((data) => ok(data, 'HRM-SET-201', 'XBOS catalogs pulled into HRM'));
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
  ) {
    this.assertAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, { tenantId, companyId });
    return this.settingsCatalogs
      .appendExtensionItems(scope.tenantId, scope.companyId, catalogKey, body.items)
      .then((data) => ok(data, 'HRM-SET-202', 'HRM catalog extensions saved'));
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
