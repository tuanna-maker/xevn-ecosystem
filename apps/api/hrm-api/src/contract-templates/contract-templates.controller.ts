/**
 * @CODE-MEMORY WorkItem: BA-CTR-TPL-8-CLAUSE-MAP-01-S7-BE-01
 * Plane A/B: HRM DB only. No cross-plane FK. tenant_id = TEXT DEFAULT.
 * Soft-delete only (deleted_at). Hard-delete forbidden.
 * HrmDbService: only query/queryOne/execute/withTransaction.
 * Auth: isAuthorizedInternalRequest (JWT or internal-key) for all endpoints.
 * Spec: docs/program/specs/BA-CTR-TPL-8-CLAUSE-MAP-01-S7-IMPL-01.md §2
 */

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Put,
  Headers,
  Query,
} from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { ok } from '../common/api-response';
import { isAuthorizedInternalRequest } from '../common/internal-auth';
import { UpsertClauseOverrideDto } from './dto/clause-override.dto';
import { ContractTemplatesService } from './contract-templates.service';

@Controller('contract-templates')
export class ContractTemplatesController {
  constructor(private readonly svc: ContractTemplatesService) {}

  private assertAccess(authorization?: string, internalApiKey?: string): void {
    if (!isAuthorizedInternalRequest(authorization, internalApiKey)) {
      throw new ApiException(
        'HRM-AUTH-001',
        'Unauthorized',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  /** GET /contract-templates/bound-codes */
  @Get('bound-codes')
  getBoundCodes(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
  ) {
    this.assertAccess(authorization, internalApiKey);
    return ok(
      this.svc.getBoundCodes(),
      'HRM-CTR-TPL-200',
      'Bound template codes',
    );
  }

  /** GET /contract-templates/:template_code/clauses */
  @Get(':template_code/clauses')
  async listClauses(
    @Param('template_code') templateCode: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Query('tenantId') queryTenantId: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
  ) {
    this.assertAccess(authorization, internalApiKey);
    const result = await this.svc.listClauses(
      templateCode,
      queryTenantId ?? tenantId ?? '',
    );
    return ok(result, 'HRM-CTR-TPL-200', 'Clause overrides listed');
  }

  /** GET /contract-templates/:template_code/clauses/:clause_id */
  @Get(':template_code/clauses/:clause_id')
  async getClause(
    @Param('template_code') templateCode: string,
    @Param('clause_id') clauseId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Query('tenantId') queryTenantId: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
  ) {
    this.assertAccess(authorization, internalApiKey);
    const result = await this.svc.getClause(
      templateCode,
      clauseId,
      queryTenantId ?? tenantId ?? '',
    );
    return ok(result, 'HRM-CTR-TPL-200', 'Clause override found');
  }

  /** PUT /contract-templates/:template_code/clauses/:clause_id (admin, upsert) */
  @Put(':template_code/clauses/:clause_id')
  async upsertClause(
    @Param('template_code') templateCode: string,
    @Param('clause_id') clauseId: string,
    @Body() body: UpsertClauseOverrideDto,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Query('tenantId') queryTenantId: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-user-id') userId: string | undefined,
  ) {
    this.assertAccess(authorization, internalApiKey);
    const dto: UpsertClauseOverrideDto = {
      ...body,
      updated_by: userId ?? body.updated_by,
    };
    const result = await this.svc.upsertClause(
      templateCode,
      clauseId,
      queryTenantId ?? tenantId ?? '',
      dto,
    );
    return ok(result, 'HRM-CTR-TPL-200', 'Clause override upserted');
  }

  /** DELETE /contract-templates/:template_code/clauses/:clause_id (admin, soft-delete) */
  @Delete(':template_code/clauses/:clause_id')
  async softDeleteClause(
    @Param('template_code') templateCode: string,
    @Param('clause_id') clauseId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Query('tenantId') queryTenantId: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
  ) {
    this.assertAccess(authorization, internalApiKey);
    const result = await this.svc.softDeleteClause(
      templateCode,
      clauseId,
      queryTenantId ?? tenantId ?? '',
    );
    return ok(result, 'HRM-CTR-TPL-200', 'Clause override soft-deleted');
  }
}
