/**
 * @CODE-MEMORY
 * Screen:     HTTP `/api/hrm/merge-tokens` — F-PLT-TOK-01..03
 * UC:         BR-PLT-01 · AC-PLT-CTR-05
 * BR:         soft-delete · U19 scope_parity · DYNAMIC-LOCK
 * SRS:        docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md
 * TechSpec:   docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-TECHSPEC-01.md §6
 * API_DESIGN: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-API-01.md F-PLT-TOK-*
 * Purpose:    Surface list/get/upsert/retire/resolve-preview MergeToken registry.
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-BE-01
 * Coded:      2026-08-07
 * Callers:    Settings FE token picker / custom-field register
 * Callees:    MergeTokensService
 * must_keep:  UF evidence zero-seed · printable=false · soft-delete only
 * SOLID:      Controller auth+scope; service persist/resolve
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-be-01.md
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
  Put,
  Query,
} from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { ok } from '../common/api-response';
import { isAuthorizedInternalRequest } from '../common/internal-auth';
import { toHrmListScopeContext } from '../common/hrm-list-scope-context';
import { resolveScopeContext } from '../common/scope-context';
import {
  ListMergeTokensQueryDto,
  PatchMergeTokenDto,
  ResolveMergePreviewDto,
  UpsertMergeTokenDto,
} from './dto/merge-tokens.dto';
import { MergeTokensService } from './merge-tokens.service';

@Controller('merge-tokens')
export class MergeTokensController {
  constructor(private readonly service: MergeTokensService) {}

  private assertAccess(authorization?: string, internalApiKey?: string) {
    if (!isAuthorizedInternalRequest(authorization, internalApiKey)) {
      throw new ApiException(
        'HRM-AUTH-001',
        'Unauthorized merge-token access',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  /** Static path before :tokenId */
  @Post('resolve-preview')
  resolvePreview(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Body() body: ResolveMergePreviewDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: body.companyId });
    return this.service
      .resolvePreview(body, authorization, toHrmListScopeContext(tenantId))
      .then((data) => ok(data, 'HRM-PLT-TOK-200', 'Merge resolve preview'));
  }

  @Get()
  list(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query() query: ListMergeTokensQueryDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id,
    });
    return this.service
      .listTokens(query, authorization, toHrmListScopeContext(tenantId))
      .then((data) => ok(data, 'HRM-PLT-TOK-200', 'Merge tokens listed'));
  }

  @Post()
  create(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Body() body: UpsertMergeTokenDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: body.companyId });
    return this.service
      .upsertToken(body, authorization, toHrmListScopeContext(tenantId))
      .then((data) => ok(data, 'HRM-PLT-TOK-201', 'Merge token created'));
  }

  @Put()
  upsert(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Body() body: UpsertMergeTokenDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: body.companyId });
    return this.service
      .upsertToken(body, authorization, toHrmListScopeContext(tenantId))
      .then((data) => ok(data, 'HRM-PLT-TOK-200', 'Merge token upserted'));
  }

  @Get(':tokenId')
  getById(
    @Param('tokenId', new ParseUUIDPipe()) tokenId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    if (!companyId?.trim()) {
      throw new ApiException(
        'HRM-VAL-400',
        'company_id is required',
        HttpStatus.BAD_REQUEST,
      );
    }
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.service
      .getTokenById(
        tokenId,
        companyId,
        authorization,
        toHrmListScopeContext(tenantId),
      )
      .then((data) => ok(data, 'HRM-PLT-TOK-200', 'Merge token loaded'));
  }

  @Patch(':tokenId')
  patch(
    @Param('tokenId', new ParseUUIDPipe()) tokenId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
    @Body() body: PatchMergeTokenDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    if (!companyId?.trim()) {
      throw new ApiException(
        'HRM-VAL-400',
        'company_id is required',
        HttpStatus.BAD_REQUEST,
      );
    }
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.service
      .patchToken(
        tokenId,
        companyId,
        body,
        authorization,
        toHrmListScopeContext(tenantId),
      )
      .then((data) => ok(data, 'HRM-PLT-TOK-200', 'Merge token patched'));
  }

  @Post(':tokenId/retire')
  retire(
    @Param('tokenId', new ParseUUIDPipe()) tokenId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    if (!companyId?.trim()) {
      throw new ApiException(
        'HRM-VAL-400',
        'company_id is required',
        HttpStatus.BAD_REQUEST,
      );
    }
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.service
      .retireToken(
        tokenId,
        companyId,
        authorization,
        toHrmListScopeContext(tenantId),
      )
      .then((data) => ok(data, 'HRM-PLT-TOK-200', 'Merge token retired'));
  }
}
