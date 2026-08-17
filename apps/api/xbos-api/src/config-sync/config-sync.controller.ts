import { Body, Controller, Get, Headers, HttpStatus, Param, Post, Query } from '@nestjs/common';
import { ConfigSyncService } from './config-sync.service';
import type { PublishCatalogPayload } from './config-sync.service';
import { ApiException } from '../common/api.exception';
import { ok } from '../common/api-response';
import { getVerifiedInternalJwtPayload, isAuthorizedInternalRequest } from '../common/internal-auth';
import { resolveScopeContext } from '../common/scope-context';
import {
  isGroupCeoOnMasterTenant,
  resolveXbosGroupLegalReadScopeContext,
} from '../common/xbos-group-legal-scope';
import { ApplyCatalogToMembersDto } from './dto/apply-catalog-to-members.dto';
import { CloneCatalogDto } from './dto/clone-catalog.dto';
import { CloneCatalogBundleDto } from './dto/clone-catalog-bundle.dto';
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

  /**
   * XBOS-DM-LOG-09 AU — member JWT cannot clone cross-company catalog bundles.
   * Internal API key without JWT remains DevOps bootstrap path (TECHSPEC_M03 §2).
   */
  private assertCatalogCloneActor(authorization?: string) {
    const jwt = getVerifiedInternalJwtPayload(authorization) as Record<string, unknown> | null;
    if (!jwt) {
      return;
    }
    const roleCode = String(jwt.roleCode ?? jwt.role_code ?? jwt.role ?? '')
      .trim()
      .toLowerCase();
    const tenantId = String(jwt.tenantId ?? jwt.tenant_id ?? jwt.tid ?? '')
      .trim()
      .toLowerCase();
    if (!isGroupCeoOnMasterTenant(tenantId, roleCode)) {
      throw new ApiException(
        'XBOS-AUTH-003',
        'Catalog bundle clone requires group catalog admin on master tenant',
        HttpStatus.FORBIDDEN,
        { tenantId, roleCode },
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

  /**
   * XBOS-DM-HRM-07 / G-BM-REC-01 — Option B fan-out to member partitions.
   * Source scope uses group legal read (JWT `main` → `holding`) so group CEO can apply.
   */
  @Post('catalog/:catalogKey/apply-to-members')
  async applyCatalogToMembers(
    @Param('catalogKey') catalogKey: string,
    @Body() payload: ApplyCatalogToMembersDto,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertInternalAccess(authorization, internalApiKey);
    const scope = resolveXbosGroupLegalReadScopeContext(authorization, {
      tenantId: payload.tenantId,
      companyId: payload.companyId,
    });
    const data = await this.configSyncService.applyCatalogToMembers(catalogKey, {
      tenantId: scope.tenantId,
      companyId: scope.companyId,
      targets: payload.targets,
      memberCompanyIds: payload.memberCompanyIds,
      actor: payload.actor,
    });
    return ok(data, 'XBOS-CFG-204', 'Catalog applied to members');
  }

  /**
   * XBOS-DM-09 — Sao chép một bộ danh mục (single catalog_key) partition→partition.
   * Default onConflict=reject → XBOS-CFG-409 when dest has overlapping item codes.
   * Distinct from apply-to-members (DM-HRM-07) and catalogs/clone-bundle (LOG-09).
   */
  @Post('catalog/:catalogKey/clone')
  async cloneCatalog(
    @Param('catalogKey') catalogKey: string,
    @Body() payload: CloneCatalogDto,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertInternalAccess(authorization, internalApiKey);
    this.assertCatalogCloneActor(authorization);
    const sourceScope = resolveXbosGroupLegalReadScopeContext(authorization, {
      tenantId: payload.tenantId,
      companyId: payload.companyId,
    });
    const data = await this.configSyncService.cloneCatalog(catalogKey, {
      tenantId: sourceScope.tenantId,
      companyId: sourceScope.companyId,
      destTenantId: payload.destTenantId,
      destCompanyId: payload.destCompanyId,
      onConflict: payload.onConflict,
      actor: payload.actor,
    });
    return ok(data, 'XBOS-CFG-206', 'Catalog cloned');
  }

  /**
   * XBOS-DM-LOG-09 / XBOS-DM-09 — clone catalog bundle CT→CT with domain filter.
   * LOG-09: body.domains = ['logistics']. Shared with DM-09 (other domains).
   */
  @Post('catalogs/clone-bundle')
  async cloneCatalogBundle(
    @Body() payload: CloneCatalogBundleDto,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertInternalAccess(authorization, internalApiKey);
    this.assertCatalogCloneActor(authorization);
    const sourceScope = resolveXbosGroupLegalReadScopeContext(authorization, {
      tenantId: payload.sourceTenantId,
      companyId: payload.sourceCompanyId,
    });
    const data = await this.configSyncService.cloneCatalogBundle({
      sourceTenantId: sourceScope.tenantId,
      sourceCompanyId: sourceScope.companyId,
      destTenantId: payload.destTenantId,
      destCompanyId: payload.destCompanyId,
      domains: payload.domains,
      keyPrefix: payload.keyPrefix,
      onConflict: payload.onConflict,
      actor: payload.actor,
    });
    return ok(data, 'XBOS-CFG-205', 'Catalog bundle cloned');
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
