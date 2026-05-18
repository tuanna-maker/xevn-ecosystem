import { Body, Controller, Delete, Get, Headers, HttpStatus, Param, Post, Put } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { ok } from '../common/api-response';
import { isAuthorizedInternalRequest } from '../common/internal-auth';
import { resolveScopeContext } from '../common/scope-context';
import { OrgFoundationService } from './org-foundation.service';
import type { LegalEntityInput, OrgUnitInput } from './org-foundation.service';

@Controller('org-foundation')
export class OrgFoundationController {
  constructor(private readonly service: OrgFoundationService) {}

  private assertInternal(authorization?: string, internalApiKey?: string) {
    if (!isAuthorizedInternalRequest(authorization, internalApiKey)) {
      throw new ApiException('XBOS-AUTH-001', 'Unauthorized internal access', HttpStatus.UNAUTHORIZED);
    }
  }

  private scope(headers: { tenantId?: string; companyId?: string; authorization?: string }) {
    return resolveScopeContext(headers.authorization, {
      tenantId: headers.tenantId,
      companyId: headers.companyId,
    });
  }

  @Get('legal-entities')
  async listLegalEntities(
    @Headers('x-tenant-id') tenantId?: string,
    @Headers('x-company-id') companyId?: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertInternal(authorization, internalApiKey);
    const scope = this.scope({ tenantId, companyId, authorization });
    const data = await this.service.listLegalEntities(scope.tenantId, scope.companyId);
    return ok({ items: data }, 'XBOS-ORG-200', 'Legal entities loaded');
  }

  @Post('legal-entities')
  async createLegalEntity(
    @Body() body: LegalEntityInput,
    @Headers('x-tenant-id') tenantId?: string,
    @Headers('x-company-id') companyId?: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertInternal(authorization, internalApiKey);
    const scope = this.scope({ tenantId, companyId, authorization });
    const data = await this.service.upsertLegalEntity(scope.tenantId, scope.companyId, null, body);
    return ok(data, 'XBOS-ORG-201', 'Legal entity saved');
  }

  @Put('legal-entities/:entityId')
  async upsertLegalEntity(
    @Param('entityId') entityId: string,
    @Body() body: LegalEntityInput,
    @Headers('x-tenant-id') tenantId?: string,
    @Headers('x-company-id') companyId?: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertInternal(authorization, internalApiKey);
    const scope = this.scope({ tenantId, companyId, authorization });
    const data = await this.service.upsertLegalEntity(scope.tenantId, scope.companyId, entityId, body);
    return ok(data, 'XBOS-ORG-201', 'Legal entity saved');
  }

  @Get('org-units/tree')
  async orgTree(
    @Headers('x-tenant-id') tenantId?: string,
    @Headers('x-company-id') companyId?: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertInternal(authorization, internalApiKey);
    const scope = this.scope({ tenantId, companyId, authorization });
    const data = await this.service.listOrgTree(scope.tenantId, scope.companyId);
    return ok({ tree: data }, 'XBOS-ORG-200', 'Org tree loaded');
  }

  @Post('org-units')
  async createOrgUnit(
    @Body() body: OrgUnitInput,
    @Headers('x-tenant-id') tenantId?: string,
    @Headers('x-company-id') companyId?: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertInternal(authorization, internalApiKey);
    const scope = this.scope({ tenantId, companyId, authorization });
    const data = await this.service.upsertOrgUnit(scope.tenantId, scope.companyId, null, body);
    return ok(data, 'XBOS-ORG-201', 'Org unit saved');
  }

  @Put('org-units/:unitId')
  async upsertOrgUnit(
    @Param('unitId') unitId: string,
    @Body() body: OrgUnitInput,
    @Headers('x-tenant-id') tenantId?: string,
    @Headers('x-company-id') companyId?: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertInternal(authorization, internalApiKey);
    const scope = this.scope({ tenantId, companyId, authorization });
    const data = await this.service.upsertOrgUnit(scope.tenantId, scope.companyId, unitId, body);
    return ok(data, 'XBOS-ORG-201', 'Org unit saved');
  }

  @Delete('org-units/:unitId')
  async deleteOrgUnit(
    @Param('unitId') unitId: string,
    @Headers('x-tenant-id') tenantId?: string,
    @Headers('x-company-id') companyId?: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertInternal(authorization, internalApiKey);
    const scope = this.scope({ tenantId, companyId, authorization });
    const data = await this.service.deleteOrgUnit(scope.tenantId, scope.companyId, unitId);
    return ok(data, 'XBOS-ORG-204', 'Org unit deleted');
  }

  @Post('segments/:segmentId/promote')
  async promoteSegment(
    @Param('segmentId') segmentId: string,
    @Body() body: LegalEntityInput,
    @Headers('x-tenant-id') tenantId?: string,
    @Headers('x-company-id') companyId?: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertInternal(authorization, internalApiKey);
    const scope = this.scope({ tenantId, companyId, authorization });
    const data = await this.service.promoteSegment(scope.tenantId, scope.companyId, segmentId, body);
    return ok(data, 'XBOS-ORG-202', 'Segment promoted to subsidiary');
  }

}
