import { Body, Controller, Delete, Get, Headers, HttpStatus, Param, Put, Query } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { ok } from '../common/api-response';
import { isAuthorizedInternalRequest } from '../common/internal-auth';
import { resolveScopeContext } from '../common/scope-context';
import { resolveXbosGroupLegalReadScopeContext } from '../common/xbos-group-legal-scope';
import { BusinessMasterService } from './business-master.service';

@Controller('business-master')
export class BusinessMasterController {
  constructor(private readonly service: BusinessMasterService) {}

  private assertInternalAccess(authorization?: string, internalApiKey?: string) {
    if (!isAuthorizedInternalRequest(authorization, internalApiKey)) {
      throw new ApiException('XBOS-AUTH-001', 'Unauthorized internal access', HttpStatus.UNAUTHORIZED);
    }
  }

  /** UC-ECO-MASTER-01 — minimal read path: domain catalog + scope (SRS §8.1). */
  @Get('domains')
  listDomains(
    @Query('tenantId') tenantId?: string,
    @Query('companyId') companyId?: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
    @Headers('x-tenant-id') headerTenantId?: string,
    @Headers('x-company-id') headerCompanyId?: string,
  ) {
    this.assertInternalAccess(authorization, internalApiKey);
    const resolved = resolveScopeContext(authorization, {
      tenantId: tenantId ?? headerTenantId,
      companyId: companyId ?? headerCompanyId,
    });
    const scope = resolveXbosGroupLegalReadScopeContext(authorization, resolved);
    const domains = this.service.listDomainCatalog();
    return ok(
      {
        tenantId: scope.tenantId,
        companyId: scope.companyId,
        domains,
        total: domains.length,
      },
      'XBOS-MASTER-200',
      'Business master domains listed',
    );
  }

  @Get(':domain/items')
  async list(
    @Param('domain') domain: string,
    @Query('tenantId') tenantId?: string,
    @Query('companyId') companyId?: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
    @Headers('x-tenant-id') headerTenantId?: string,
    @Headers('x-company-id') headerCompanyId?: string,
  ) {
    return this.listDomainItems(
      domain,
      tenantId ?? headerTenantId,
      companyId ?? headerCompanyId,
      authorization,
      internalApiKey,
    );
  }

  /** Alias for view-completeness / portal probes (`/business-master/:domain`). */
  @Get(':domain')
  async listDomainShortcut(
    @Param('domain') domain: string,
    @Query('tenantId') tenantId?: string,
    @Query('companyId') companyId?: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
    @Headers('x-tenant-id') headerTenantId?: string,
    @Headers('x-company-id') headerCompanyId?: string,
  ) {
    if (domain === 'domains') {
      return this.listDomains(
        tenantId,
        companyId,
        authorization,
        internalApiKey,
        headerTenantId,
        headerCompanyId,
      );
    }
    return this.listDomainItems(
      domain,
      tenantId ?? headerTenantId,
      companyId ?? headerCompanyId,
      authorization,
      internalApiKey,
    );
  }

  private async listDomainItems(
    domain: string,
    tenantId: string | undefined,
    companyId: string | undefined,
    authorization?: string,
    internalApiKey?: string,
  ) {
    this.assertInternalAccess(authorization, internalApiKey);
    const resolved = resolveScopeContext(authorization, { tenantId, companyId });
    const scope = resolveXbosGroupLegalReadScopeContext(authorization, resolved);
    const data = await this.service.list(scope.tenantId, scope.companyId, domain);
    return ok(
      { items: data, data, tenantId: scope.tenantId, companyId: scope.companyId },
      'XBOS-MASTER-200',
      'Business master items loaded',
    );
  }

  @Put(':domain/items/:itemId')
  async upsert(
    @Param('domain') domain: string,
    @Param('itemId') itemId: string,
    @Body() body: unknown,
    @Headers('x-tenant-id') tenantId?: string,
    @Headers('x-company-id') companyId?: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertInternalAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, { tenantId, companyId });
    const data = await this.service.upsert(scope.tenantId, scope.companyId, domain, itemId, body);
    return ok(data, 'XBOS-MASTER-201', 'Business master item saved');
  }

  @Delete(':domain/items/:itemId')
  async remove(
    @Param('domain') domain: string,
    @Param('itemId') itemId: string,
    @Headers('x-tenant-id') tenantId?: string,
    @Headers('x-company-id') companyId?: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertInternalAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, { tenantId, companyId });
    const data = await this.service.remove(scope.tenantId, scope.companyId, domain, itemId);
    return ok(data, 'XBOS-MASTER-204', 'Business master item deleted');
  }
}

