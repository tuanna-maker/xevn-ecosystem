import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { LegalEntityBodyInterceptor } from './interceptors/legal-entity-body.interceptor';
import { ApiException } from '../common/api.exception';
import { ok } from '../common/api-response';
import { getVerifiedInternalJwtPayload, isAuthorizedInternalRequest } from '../common/internal-auth';
import {
  assertJwtMayReadLegalEntityPartition,
  resolveRaciMatrixJwtScope,
  resolveXbosGroupLegalMutationScopeContext,
  resolveXbosGroupLegalReadScopeContext,
} from '../common/xbos-group-legal-scope';
import { OrgFoundationService } from './org-foundation.service';
import { UpsertLegalEntityDto } from './dto/upsert-legal-entity.dto';
import type { LegalEntityInput, OrgUnitInput } from './org-foundation.service';

@Controller('org-foundation')
@UseInterceptors(LegalEntityBodyInterceptor)
export class OrgFoundationController {
  constructor(private readonly service: OrgFoundationService) {}

  private assertInternal(authorization?: string, internalApiKey?: string) {
    if (!isAuthorizedInternalRequest(authorization, internalApiKey)) {
      throw new ApiException('XBOS-AUTH-001', 'Unauthorized internal access', HttpStatus.UNAUTHORIZED);
    }
  }

  private readScope(headers: { tenantId?: string; companyId?: string; authorization?: string }) {
    return resolveXbosGroupLegalReadScopeContext(headers.authorization, {
      tenantId: headers.tenantId,
      companyId: headers.companyId,
    });
  }

  private mutationScope(headers: { tenantId?: string; companyId?: string; authorization?: string }) {
    return resolveXbosGroupLegalMutationScopeContext(headers.authorization, {
      tenantId: headers.tenantId,
      companyId: headers.companyId,
    });
  }

  private resolveUserId(authorization?: string): string | undefined {
    const jwt = getVerifiedInternalJwtPayload(authorization);
    const fromJwt =
      (typeof jwt?.sub === 'string' && jwt.sub.trim()) ||
      (typeof jwt?.email === 'string' && jwt.email.trim()) ||
      undefined;
    return fromJwt;
  }

  @Get('legal-entities/:entityId')
  async getLegalEntity(
    @Param('entityId') entityId: string,
    @Headers('x-tenant-id') tenantId?: string,
    @Headers('x-company-id') companyId?: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertInternal(authorization, internalApiKey);
    this.readScope({ tenantId, companyId, authorization });
    const jwtScope = resolveRaciMatrixJwtScope(authorization, { tenantId, companyId });
    const partition = await this.service.resolveLegalEntityPartition(entityId);
    if (!partition) {
      throw new ApiException('XBOS-ORG-404', 'Legal entity not found', HttpStatus.NOT_FOUND);
    }
    assertJwtMayReadLegalEntityPartition(authorization, jwtScope, partition);
    const data = await this.service.getLegalEntityById(entityId);
    return ok(data, 'XBOS-ORG-200', 'Legal entity loaded');
  }

  @Get('legal-entities')
  async listLegalEntities(
    @Headers('x-tenant-id') tenantId?: string,
    @Headers('x-company-id') companyId?: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertInternal(authorization, internalApiKey);
    const scope = this.readScope({ tenantId, companyId, authorization });
    const data = await this.service.listLegalEntities(scope.tenantId, scope.companyId);
    return ok({ items: data }, 'XBOS-ORG-200', 'Legal entities loaded');
  }

  @Post('legal-entities')
  async createLegalEntity(
    @Body() body: UpsertLegalEntityDto,
    @Headers('x-tenant-id') tenantId?: string,
    @Headers('x-company-id') companyId?: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertInternal(authorization, internalApiKey);
    const scope = this.mutationScope({ tenantId, companyId, authorization });
    const data = await this.service.upsertLegalEntity(scope.tenantId, scope.companyId, null, body);
    return ok(data, 'XBOS-ORG-201', 'Legal entity saved');
  }

  @Put('legal-entities/:entityId')
  async upsertLegalEntity(
    @Param('entityId') entityId: string,
    @Body() body: UpsertLegalEntityDto,
    @Headers('x-tenant-id') tenantId?: string,
    @Headers('x-company-id') companyId?: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertInternal(authorization, internalApiKey);
    const scope = this.mutationScope({ tenantId, companyId, authorization });
    const data = await this.service.upsertLegalEntity(scope.tenantId, scope.companyId, entityId, body);
    return ok(data, 'XBOS-ORG-201', 'Legal entity saved');
  }

  @Get('org-units/tree')
  async orgTree(
    @Query('legal_entity_id') legalEntityId?: string,
    @Headers('x-tenant-id') tenantId?: string,
    @Headers('x-company-id') companyId?: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertInternal(authorization, internalApiKey);
    const entityId = legalEntityId?.trim();
    if (entityId) {
      this.readScope({ tenantId, companyId, authorization });
      const tree = await this.service.listOrgTreeForLegalEntity(entityId);
      return ok(
        { mode: 'single', tree, legalEntityId: entityId },
        'XBOS-ORG-200',
        'Org tree loaded for legal entity',
      );
    }
    const scope = this.readScope({ tenantId, companyId, authorization });
    const data = await this.service.listOrgTree(scope.tenantId, scope.companyId, this.resolveUserId(authorization));
    const isGroup = Array.isArray(data) && data.length > 0 && 'tenantId' in (data[0] as object);
    if (isGroup) {
      const groups = data as Array<{ tenantId?: string; name?: string; tree?: unknown[] }>;
      const flatTree = groups.flatMap((entry) => (Array.isArray(entry.tree) ? entry.tree : []));
      return ok(
        { mode: 'group', groups, tree: flatTree },
        'XBOS-ORG-200',
        'Group org trees loaded',
      );
    }
    return ok(
      { mode: 'single', tree: data },
      'XBOS-ORG-200',
      'Org tree loaded',
    );
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
    const scope = this.mutationScope({ tenantId, companyId, authorization });
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
    const scope = this.mutationScope({ tenantId, companyId, authorization });
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
    const scope = this.mutationScope({ tenantId, companyId, authorization });
    const data = await this.service.deleteOrgUnit(scope.tenantId, scope.companyId, unitId);
    return ok(data, 'XBOS-ORG-204', 'Org unit deleted');
  }

  /** UC-XBOS-10 — alias for portal probes expecting business-lines path (SRS: segments/:id/promote). */
  @Post('business-lines/promote')
  async promoteBusinessLine(
    @Body() body: LegalEntityInput & { segmentId?: string },
    @Headers('x-tenant-id') tenantId?: string,
    @Headers('x-company-id') companyId?: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    const segmentId = (body.segmentId ?? (body.payload as { segmentId?: string } | undefined)?.segmentId)?.trim();
    if (!segmentId) {
      throw new ApiException('XBOS-ORG-400', 'segmentId is required', HttpStatus.BAD_REQUEST);
    }
    const { segmentId: _segmentId, ...legalBody } = body;
    return this.promoteSegment(segmentId, legalBody, tenantId, companyId, authorization, internalApiKey);
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
    const scope = this.readScope({ tenantId, companyId, authorization });
    const data = await this.service.promoteSegment(scope.tenantId, scope.companyId, segmentId, body);
    return ok(data, 'XBOS-ORG-202', 'Segment promoted to subsidiary');
  }

}
