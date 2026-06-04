import { Body, Controller, Get, Headers, HttpStatus, Param, Post, Query } from '@nestjs/common';
import { ConfigSyncService } from './config-sync.service';
import type { PublishCatalogPayload } from './config-sync.service';
import { ApiException } from '../common/api.exception';
import { ok } from '../common/api-response';
import { isAuthorizedInternalRequest } from '../common/internal-auth';
import { resolveScopeContext } from '../common/scope-context';
import { resolveXbosGroupLegalReadScopeContext } from '../common/xbos-group-legal-scope';
import { PublishCatalogDto } from './dto/publish-catalog.dto';

@Controller('config-sync')
export class ConfigSyncController {
  constructor(private readonly configSyncService: ConfigSyncService) {}

  private assertInternalAccess(authorization?: string, internalApiKey?: string) {
    if (!isAuthorizedInternalRequest(authorization, internalApiKey)) {
      throw new ApiException(
        'XBOS-AUTH-001',
        'Unauthorized bootstrap access',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @Post('bootstrap-xevn')
  async bootstrapXevn(
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertInternalAccess(authorization, internalApiKey);
    return ok(
      await this.configSyncService.bootstrapXevnGroupConfig(),
      'XBOS-CFG-200',
      'XeVN catalogs bootstrapped',
    );
  }

  @Post('catalog/:catalogKey/publish')
  async publishCatalog(
    @Param('catalogKey') catalogKey: string,
    @Body() payload: PublishCatalogDto,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertInternalAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, {
      tenantId: payload.tenantId,
      companyId: payload.companyId,
    });
    const data = await this.configSyncService.publishCatalog(catalogKey, {
      ...(payload as PublishCatalogPayload),
      tenantId: scope.tenantId,
      companyId: scope.companyId,
    });
    return ok(data, 'XBOS-CFG-203', 'Catalog published');
  }

  @Get('catalog/:catalogKey')
  async getCatalogForSystem(
    @Param('catalogKey') catalogKey: string,
    @Query('target') target = 'hrm',
    @Query('tenantId') tenantId?: string,
    @Query('companyId') companyId?: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertInternalAccess(authorization, internalApiKey);
    if (target !== 'hrm' && target !== 'xbos' && target !== 'web-portal') {
      throw new ApiException(
        'XBOS-VAL-001',
        'Invalid target. Use hrm, xbos, or web-portal',
        HttpStatus.BAD_REQUEST,
      );
    }
    const scope = resolveXbosGroupLegalReadScopeContext(authorization, { tenantId, companyId });
    const data = await this.configSyncService.getCatalogForTarget(catalogKey, target, scope.tenantId, scope.companyId);
    return ok(data, 'XBOS-CFG-201', 'Catalog fetched');
  }

  @Get('catalogs')
  async listCatalogsForSystem(
    @Query('target') target = 'hrm',
    @Query('tenantId') tenantId?: string,
    @Query('companyId') companyId?: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertInternalAccess(authorization, internalApiKey);
    if (target !== 'hrm' && target !== 'xbos' && target !== 'web-portal') {
      throw new ApiException(
        'XBOS-VAL-001',
        'Invalid target. Use hrm, xbos, or web-portal',
        HttpStatus.BAD_REQUEST,
      );
    }
    const scope = resolveXbosGroupLegalReadScopeContext(authorization, { tenantId, companyId });
    const data = await this.configSyncService.listCatalogsForTarget(target, scope.tenantId, scope.companyId);
    return ok(data, 'XBOS-CFG-202', 'Catalogs listed');
  }
}
