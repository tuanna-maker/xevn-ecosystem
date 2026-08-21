/**
 * @CODE-MEMORY
 * Screen:     HTTP `/api/hrm/settings/allowance-deduction-types` — F-ALLOW-CAT-01..05
 * UC:         UC-SET-DEF-03 · AC-AMIS-SET-PC-CAT-01
 * BR:         BR-AMIS-SET-DEF-03 · BR-PLT-01/04
 * SRS:        docs/program/specs/PO-HRM-ALLOWANCE-CATALOG-SYNC-01.md
 * API_DESIGN: docs/program/specs/PO-HRM-ALLOWANCE-CATALOG-SYNC-API-01.md F-ALLOW-CAT-*
 * Purpose:    Settings vertical PC/KT CRUD + merge-token preview; scope via resolveHrmSettingsCatalogCompanyId.
 * WorkItem:   PO-HRM-ALLOWANCE-CATALOG-SYNC-BE-01
 * Coded:      2026-08-07
 * Callers:    Settings FE PC/KT screen (after BE)
 * Callees:    AllowanceCatalogSyncService
 * must_keep:  U65 zero-seed · soft-delete · payroll_e2e_ready=false
 * SOLID:      Controller auth+scope; sync service owns TX
 * LastVerified: docs/qa/evidence/po-hrm-allowance-catalog-sync-be-01.md
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
import { AllowanceCatalogSyncService } from './allowance-catalog-sync.service';
import {
  HRM_ALLOW_CAT_200,
  HRM_ALLOW_CAT_201,
} from './allowance-catalog.constants';
import {
  CreateAllowanceDeductionTypeDto,
  ListAllowanceDeductionTypesQueryDto,
  RetireAllowanceDeductionTypeDto,
  UpdateAllowanceDeductionTypeDto,
} from './dto/allowance-deduction-type.dto';

@Controller('settings/allowance-deduction-types')
export class AllowanceCatalogController {
  constructor(private readonly service: AllowanceCatalogSyncService) {}

  private assertAccess(authorization?: string, internalApiKey?: string) {
    if (!isAuthorizedInternalRequest(authorization, internalApiKey)) {
      throw new ApiException(
        'HRM-AUTH-001',
        'Unauthorized allowance catalog access',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @Get()
  list(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query() query: ListAllowanceDeductionTypesQueryDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id,
    });
    return this.service
      .listTypes(query, authorization, tenantId)
      .then((data) => ok(data, HRM_ALLOW_CAT_200, 'Allowance/deduction types'));
  }

  @Get(':id/merge-tokens')
  listMergeTokens(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('company_id') companyId: string,
    @Query('include_retired') includeRetired?: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    if (!companyId?.trim()) {
      throw new ApiException(
        'HRM-VAL-001',
        'company_id is required',
        HttpStatus.BAD_REQUEST,
      );
    }
    resolveScopeContext(authorization, { tenantId, companyId });
    const retired =
      includeRetired === 'true' ||
      includeRetired === '1' ||
      includeRetired === 'TRUE';
    return this.service
      .listMergeTokensForType(id, companyId, authorization, tenantId, retired)
      .then((data) => ok(data, HRM_ALLOW_CAT_200, 'Allowance merge tokens'));
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
      throw new ApiException(
        'HRM-VAL-001',
        'company_id is required',
        HttpStatus.BAD_REQUEST,
      );
    }
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.service
      .getById(id, companyId, authorization, tenantId)
      .then((data) => ok(data, HRM_ALLOW_CAT_200, 'Allowance/deduction type'));
  }

  @Post()
  create(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Body() body: CreateAllowanceDeductionTypeDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: body.companyId });
    return this.service
      .createType(body, authorization, tenantId)
      .then((data) =>
        ok(data, HRM_ALLOW_CAT_201, 'Allowance/deduction type created'),
      );
  }

  @Patch(':id')
  update(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('company_id') companyId: string,
    @Body() body: UpdateAllowanceDeductionTypeDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    if (!companyId?.trim()) {
      throw new ApiException(
        'HRM-VAL-001',
        'company_id is required',
        HttpStatus.BAD_REQUEST,
      );
    }
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.service
      .updateType(id, companyId, body, authorization, tenantId)
      .then((data) =>
        ok(data, HRM_ALLOW_CAT_200, 'Allowance/deduction type updated'),
      );
  }

  @Post(':id/retire')
  retire(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('company_id') companyId: string,
    @Body() _body: RetireAllowanceDeductionTypeDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    if (!companyId?.trim()) {
      throw new ApiException(
        'HRM-VAL-001',
        'company_id is required',
        HttpStatus.BAD_REQUEST,
      );
    }
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.service
      .retireType(id, companyId, authorization, tenantId)
      .then((data) =>
        ok(data, HRM_ALLOW_CAT_200, 'Allowance/deduction type retired'),
      );
  }
}
