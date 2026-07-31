/**
 * @CODE-MEMORY
 * Screen:     Command Center — catalog văn bản / đo lường / giá (UF-XBOS-14)
 * UC:         UC-CC-P0-05 · FR-CC-P0-05
 * BR:         JWT main→holding partition; autosave ≠ catalog-gov publish
 * SRS:        SRS_XBOS_KHACH.md §3.15 FR-CC-P0-05 Diễn biến #1–7
 * TechSpec:   docs/xbos/TECHSPEC.md §14.16 · ref_srs FR-CC-P0-05
 * db_design:  docs/xbos/DB_DESIGN_XBOS_RACI_RBAC.md — xbos_business_master_entries CC partitions
 * api_design: docs/xbos/API_DESIGN_XBOS_RACI_RBAC.md Endpoints H–I (F.1)
 * Purpose:    List + autosave business-master domain command_center_catalogs
 *             (kinds regulations|measurements|pricing) cho FE CC catalogs.
 * WorkItem:   BE-XBOS-OA-RACI-CC-01 (OpenAPI F.1 deepen; runtime must_keep)
 * Coded:      2026-07-27
 *
 * Callers:
 *   - web-portal commandCenterCatalogApi.ts → GET/PUT /api/xbos/business-master/command_center_catalogs/items*
 *
 * Callees:
 *   - resolveXbosGroupLegal*ScopeContext → BusinessMasterService list/upsert
 *
 * FE-Actions:
 *   | Thao tác | Handler | API |
 *   |----------|---------|-----|
 *   | Mở catalog CC | list items | GET …/command_center_catalogs/items |
 *   | Sửa ô autosave | upsert partition/flat | PUT …/items/{itemId} |
 *
 * BE-Chain:
 *   list → xbos_business_master_entries domain=command_center_catalogs
 *   upsert partition/flat → payload.rows JSONB · amount số thuần
 *
 * Impact:     Đổi kind enum / scope holding → UF-XBOS-14 FAIL hoặc ghi nhầm pháp nhân
 * must_keep:  UF-XBOS-14 🟢 · empty list hợp lệ · không publishVersionChange · U65 no seed
 * SOLID:      Controller = transport/scope; Service = domain whitelist + CC merge
 * LastVerified: docs/qa/evidence/be-xbos-oa-raci-cc-20260727.md
 *
 * @CODE-MEMORY-CHANGE 2026-07-27
 * WorkItem: BE-XBOS-OA-RACI-CC-01
 * change_mode: ADD
 * What: Neo CODE-MEMORY + OpenAPI F.1 cho command_center_catalogs kinds/examples
 * Why:  U71 API_DESIGN Endpoints H–I — sync contract; cấm đổi runtime UF-14
 * SRS:  §3.15 FR-CC-P0-05
 * TechSpec: §14.16 · G-OA-W2-CC-CAT-01 CLOSED (yaml)
 * db_design: DB_DESIGN_XBOS_RACI_RBAC.md
 * api_design: API_DESIGN_XBOS_RACI_RBAC.md §8–9
 * must_keep: Partition kinds + autosave semantics không đổi
 */
import { Body, Controller, Delete, Get, Headers, HttpStatus, Param, Put, Query } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { ok } from '../common/api-response';
import { isAuthorizedInternalRequest } from '../common/internal-auth';
import { resolveScopeContext } from '../common/scope-context';
import {
  resolveXbosGroupLegalMutationScopeContext,
  resolveXbosGroupLegalReadScopeContext,
} from '../common/xbos-group-legal-scope';
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
    const scope = resolveXbosGroupLegalReadScopeContext(authorization, {
      tenantId: tenantId ?? headerTenantId,
      companyId: companyId ?? headerCompanyId,
    });
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
    const scope = resolveXbosGroupLegalReadScopeContext(authorization, { tenantId, companyId });
    const data = await this.service.list(scope.tenantId, scope.companyId, domain);
    return ok(
      { items: data, data, tenantId: scope.tenantId, companyId: scope.companyId },
      'XBOS-MASTER-200',
      'Business master items loaded',
    );
  }

  private resolveWriteScope(
    authorization: string | undefined,
    tenantId: string | undefined,
    companyId: string | undefined,
    domain: string,
  ) {
    if (domain === 'dept_system_templates' || domain === 'command_center_catalogs') {
      const resolved = resolveScopeContext(authorization, { tenantId, companyId });
      return resolveXbosGroupLegalMutationScopeContext(authorization, resolved);
    }
    // Scope parity (ADR-GROUP-CEO-MAIN-HOLDING-SCOPE): list reads holding; writes must match.
    return resolveXbosGroupLegalReadScopeContext(authorization, { tenantId, companyId });
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
    const scope = this.resolveWriteScope(authorization, tenantId, companyId, domain);
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
    const scope = this.resolveWriteScope(authorization, tenantId, companyId, domain);
    const data = await this.service.remove(scope.tenantId, scope.companyId, domain, itemId);
    return ok(data, 'XBOS-MASTER-204', 'Business master item deleted');
  }
}

