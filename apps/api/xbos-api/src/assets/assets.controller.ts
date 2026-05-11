import { Body, Controller, Get, Headers, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { ok } from '../common/api-response';
import { getVerifiedInternalJwtPayload, isAuthorizedInternalRequest } from '../common/internal-auth';
import { resolveScopeContext } from '../common/scope-context';
import { AssetsService } from './assets.service';
import { AssetOwnerModule, assetOwnerModules } from './dto/asset-common.dto';
import { CreateAssetDto } from './dto/create-asset.dto';
import { ListAssetsQueryDto } from './dto/list-assets.query.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';

@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  private readonly canonicalModuleMap: Record<string, AssetOwnerModule> = {
    hrm: 'hrm-admin',
    'hrm-admin': 'hrm-admin',
    fleet: 'operations',
    operations: 'operations',
    accounting: 'finance-tax',
    'finance-tax': 'finance-tax',
  };

  private assertInternalAccess(authorization?: string, internalApiKey?: string) {
    if (!isAuthorizedInternalRequest(authorization, internalApiKey)) {
      throw new ApiException('XBOS-AUTH-001', 'Unauthorized internal access', HttpStatus.UNAUTHORIZED);
    }
  }

  private parseCanonicalModule(rawModuleCode: string | undefined): AssetOwnerModule | null {
    if (!rawModuleCode) return null;
    const normalized = rawModuleCode.trim().toLowerCase();
    return this.canonicalModuleMap[normalized] ?? null;
  }

  private resolveAuthoritativeModule(authorization?: string, moduleCodeHeaderRaw?: string): AssetOwnerModule {
    const jwtPayload = getVerifiedInternalJwtPayload(authorization);
    const claimValue =
      typeof jwtPayload?.mod === 'string'
        ? jwtPayload.mod
        : typeof jwtPayload?.module_code === 'string'
          ? jwtPayload.module_code
          : undefined;
    const claimModule = this.parseCanonicalModule(claimValue);
    if (!claimModule) {
      throw new ApiException(
        'ASSET-OWN-002',
        `Missing or invalid token module claim. Use one of: ${assetOwnerModules.join(', ')}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const headerModule = this.parseCanonicalModule(moduleCodeHeaderRaw);
    if (moduleCodeHeaderRaw && !headerModule) {
      throw new ApiException(
        'ASSET-OWN-002',
        `Invalid x-module-code header. Use one of: ${assetOwnerModules.join(', ')}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    if (headerModule && headerModule !== claimModule) {
      throw new ApiException(
        'ASSET-MOD-409',
        `Module mismatch between token claim '${claimModule}' and x-module-code '${headerModule}'`,
        HttpStatus.CONFLICT,
      );
    }
    return claimModule;
  }

  @Post()
  async createAsset(
    @Body() dto: CreateAssetDto,
    @Headers('x-module-code') moduleCodeRaw?: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertInternalAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, { tenantId: dto.tenantId, companyId: dto.companyId });
    const moduleCode = this.resolveAuthoritativeModule(authorization, moduleCodeRaw);
    const data = await this.assetsService.createAsset(
      { ...dto, tenantId: scope.tenantId, companyId: scope.companyId },
      moduleCode,
    );
    return ok(data, 'ASSET-REG-201', 'Asset created');
  }

  @Get()
  async listAssets(
    @Query() query: ListAssetsQueryDto,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertInternalAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, { tenantId: query.tenantId, companyId: query.companyId });
    const data = await this.assetsService.listAssets({
      ...query,
      tenantId: scope.tenantId,
      companyId: scope.companyId,
    });
    return ok(data, 'ASSET-REG-200', 'Assets listed');
  }

  @Get(':assetId')
  async getAssetById(
    @Param('assetId') assetId: string,
    @Query('tenantId') tenantId?: string,
    @Query('companyId') companyId?: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertInternalAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, { tenantId, companyId });
    const data = await this.assetsService.getAssetById(assetId, scope.tenantId, scope.companyId);
    return ok(data, 'ASSET-REG-200', 'Asset fetched');
  }

  @Patch(':assetId')
  async updateAsset(
    @Param('assetId') assetId: string,
    @Query('tenantId') tenantId: string,
    @Query('companyId') companyId: string,
    @Body() dto: UpdateAssetDto,
    @Headers('x-module-code') moduleCodeRaw?: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertInternalAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, { tenantId, companyId });
    const moduleCode = this.resolveAuthoritativeModule(authorization, moduleCodeRaw);
    const data = await this.assetsService.updateAsset(assetId, scope.tenantId, scope.companyId, dto, moduleCode);
    return ok(data, 'ASSET-REG-200', 'Asset updated');
  }
}
