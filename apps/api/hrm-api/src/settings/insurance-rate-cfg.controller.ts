/**
 * @CODE-MEMORY
 * Screen:     HTTP `/api/hrm/settings/insurance-rate-cfg` — F-SET-SI-01..03
 * UC:         UC-SET-DEF-02/06
 * WorkItem:   PO-HRM-SETTINGS-DEFAULTS-BE-01
 * Purpose:    Company SI rate CFG CRUD + soft retire (no hard DELETE).
 * Coded:      2026-08-07
 * must_keep:  soft-delete · SI-412 helper on service · U65 no seed
 */
import {
  Body,
  Controller,
  Delete,
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
import { HRM_SET_SI_200, HRM_SET_SI_201 } from './settings-defaults.constants';
import { InsuranceRateCfgService } from './insurance-rate-cfg.service';
import {
  CreateInsuranceRateCfgDto,
  ListInsuranceRateCfgQueryDto,
  PatchInsuranceRateCfgDto,
} from './dto/settings-defaults.dto';

@Controller('settings/insurance-rate-cfg')
export class InsuranceRateCfgController {
  constructor(private readonly service: InsuranceRateCfgService) {}

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
    @Query() query: ListInsuranceRateCfgQueryDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: query.company_id });
    return this.service
      .list(query, authorization, tenantId)
      .then((data) => ok(data, HRM_SET_SI_200, 'Insurance rate cfg list'));
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
      .then((data) => ok(data, HRM_SET_SI_200, 'Insurance rate cfg'));
  }

  @Post()
  create(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Body() body: CreateInsuranceRateCfgDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: body.companyId });
    return this.service
      .create(body, authorization, tenantId)
      .then((data) => ok(data, HRM_SET_SI_201, 'Insurance rate cfg created'));
  }

  @Patch(':id')
  patch(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('company_id') companyId: string,
    @Body() body: PatchInsuranceRateCfgDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    if (!companyId?.trim()) {
      throw new ApiException('HRM-VAL-001', 'company_id is required', HttpStatus.BAD_REQUEST);
    }
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.service
      .patch(id, companyId, body, authorization, tenantId)
      .then((data) => ok(data, HRM_SET_SI_200, 'Insurance rate cfg updated'));
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
      .then((data) => ok(data, HRM_SET_SI_200, 'Insurance rate cfg retired'));
  }

  @Delete(':id')
  hardDeleteBlocked() {
    this.service.rejectHardDelete();
  }
}
