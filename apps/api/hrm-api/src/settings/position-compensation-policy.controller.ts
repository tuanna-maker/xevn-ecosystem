/**
 * @CODE-MEMORY
 * Screen:     HTTP `/api/hrm/settings/position-compensation-policies` — F-SET-POS-01..05
 * UC:         UC-SET-DEF-04/05 · AC-AMIS-SET-POS-01/02
 * WorkItem:   PO-HRM-SETTINGS-DEFAULTS-BE-01
 * Purpose:    Position PC policy CRUD + resolve prefill (SRC-02 read-only).
 * Coded:      2026-08-07
 * must_keep:  resolve before :id · no emp write · U65 no seed
 */
import {
  Body,
  Controller,
  Get,
  Headers,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { ok } from '../common/api-response';
import { isAuthorizedInternalRequest } from '../common/internal-auth';
import { resolveScopeContext } from '../common/scope-context';
import { HRM_SET_POS_200, HRM_SET_POS_201 } from './settings-defaults.constants';
import { PositionCompensationPolicyService } from './position-compensation-policy.service';
import {
  CreatePositionCompensationPolicyDto,
  ListPositionCompensationPoliciesQueryDto,
  PatchPositionCompensationPolicyDto,
  ResolvePositionCompensationQueryDto,
} from './dto/settings-defaults.dto';

@Controller('settings/position-compensation-policies')
export class PositionCompensationPolicyController {
  constructor(private readonly service: PositionCompensationPolicyService) {}

  private assertAccess(authorization?: string, internalApiKey?: string) {
    if (!isAuthorizedInternalRequest(authorization, internalApiKey)) {
      throw new ApiException('HRM-AUTH-001', 'Unauthorized settings access', HttpStatus.UNAUTHORIZED);
    }
  }

  @Get()
  list(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query() query: ListPositionCompensationPoliciesQueryDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: query.company_id });
    return this.service
      .list(query, authorization, tenantId)
      .then((data) => ok(data, HRM_SET_POS_200, 'Position compensation policies'));
  }

  /** F-SET-POS-05 — must register before :id */
  @Get('resolve')
  resolve(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query() query: ResolvePositionCompensationQueryDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: query.company_id });
    return this.service
      .resolve(query, authorization, tenantId)
      .then((data) => ok(data, HRM_SET_POS_200, 'Position compensation prefill draft'));
  }

  @Get(':id')
  getById(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('company_id') companyId: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    if (!companyId?.trim()) {
      throw new ApiException('HRM-VAL-001', 'company_id is required', HttpStatus.BAD_REQUEST);
    }
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.service
      .getById(id, companyId, authorization, tenantId)
      .then((data) => ok(data, HRM_SET_POS_200, 'Position compensation policy'));
  }

  @Post()
  create(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Body() body: CreatePositionCompensationPolicyDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: body.companyId });
    return this.service
      .create(body, authorization, tenantId)
      .then((data) => ok(data, HRM_SET_POS_201, 'Position compensation policy created'));
  }

  @Patch(':id')
  patch(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('company_id') companyId: string,
    @Body() body: PatchPositionCompensationPolicyDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    if (!companyId?.trim()) {
      throw new ApiException('HRM-VAL-001', 'company_id is required', HttpStatus.BAD_REQUEST);
    }
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.service
      .patch(id, companyId, body, authorization, tenantId)
      .then((data) => ok(data, HRM_SET_POS_200, 'Position compensation policy updated'));
  }

  @Post(':id/retire')
  retire(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('company_id') companyId: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    if (!companyId?.trim()) {
      throw new ApiException('HRM-VAL-001', 'company_id is required', HttpStatus.BAD_REQUEST);
    }
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.service
      .retire(id, companyId, authorization, tenantId)
      .then((data) => ok(data, HRM_SET_POS_200, 'Position compensation policy retired'));
  }
}
