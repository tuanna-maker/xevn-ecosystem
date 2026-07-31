/**
 * @CODE-MEMORY
 * Screen:     Command Center / Org — tab Nhiệm vụ và RACI (UF-XBOS-07)
 * UC:         UC-RACI-02 · FR-XBOS-RACI-02
 * BR:         Scope parity list/get-mutate cùng resolveCompanyMatrixScope (G-SCOPE-W2-RACI)
 * SRS:        SRS_XBOS_KHACH.md §3.13 FR-XBOS-RACI-02 Diễn biến #1–8
 * TechSpec:   docs/xbos/TECHSPEC.md §14.14 · ref_srs FR-XBOS-RACI-02
 * db_design:  docs/xbos/DB_DESIGN_XBOS_RACI_RBAC.md — company_raci_matrix_cell · raci_activity_catalog
 * api_design: docs/xbos/API_DESIGN_XBOS_RACI_RBAC.md Endpoints A–D (F.1)
 * Purpose:    Cấp catalog RACI, ma trận theo pháp nhân, upsert/clear ô, capabilities/coverage —
 *             FE vẽ lưới và lưu ô không lan sang pháp nhân khác; F5 còn dữ liệu.
 * WorkItem:   BE-XBOS-OA-DTO-P2-01 (Nest DTO edge; OpenAPI align; runtime must_keep)
 * Coded:      2026-07-27
 *
 * Callers:
 *   - web-portal raciGovernanceApi.ts → GET/PUT /api/xbos/raci-governance/*
 *
 * Callees:
 *   - resolveCompanyMatrixScope / resolveTenantOnlyContext → RaciGovernanceService
 *   - OrgFoundationService.resolveLegalEntityPartition (UUID path)
 *
 * FE-Actions:
 *   | Thao tác | Handler | API |
 *   |----------|---------|-----|
 *   | Mở tab RACI | load catalog+matrix | GET catalog · GET …/matrix |
 *   | Lưu ô | upsert cell | PUT …/matrix/cell |
 *   | Xóa ô | clear letters | PUT …/matrix/cell raci_letters="" |
 *
 * BE-Chain:
 *   listCatalog → raci_activity_catalog / version
 *   getCompanyMatrix → merge default_matrix ⊕ company_raci_matrix_cell
 *   upsertMatrixCell → UpsertRaciMatrixCellRequestDto → upsert cell + raci_matrix_audit_log
 *
 * Impact:     Đổi scope resolver hoặc letters pattern → UF-XBOS-07 FAIL / 409 sai pháp nhân
 * must_keep:  UF-XBOS-07 🟢 · cùng resolver GET matrix ↔ PUT cell · empty letters = clear · U65 no seed
 * SOLID:      Controller = transport/auth/scope; Service = merge/persist RACI
 * LastVerified: raci-governance.controller.spec.ts · upsert-raci-matrix-cell.dto.spec.ts · be-xbos-oa-dto-p2-01-20260727.md
 *
 * @CODE-MEMORY-CHANGE 2026-07-27
 * WorkItem: BE-XBOS-OA-RACI-CC-01
 * change_mode: ADD
 * What: Neo CODE-MEMORY + OpenAPI F.1 (Mục đích/Nghiệp vụ/Bước SRS) cho raci-governance/*
 * Why:  U71 API_DESIGN pair xong — sync contract docs; cấm đổi runtime UF-07
 * SRS:  §3.13 FR-XBOS-RACI-02
 * TechSpec: §14.14 · G-OA-W2-RACI-01 CLOSED (yaml)
 * db_design: DB_DESIGN_XBOS_RACI_RBAC.md
 * api_design: API_DESIGN_XBOS_RACI_RBAC.md §1–4
 * must_keep: Hành vi matrix merge / scope / envelope codes không đổi
 *
 * @CODE-MEMORY-CHANGE 2026-07-27
 * WorkItem: BE-XBOS-OA-DTO-P2-01
 * change_mode: UPGRADE
 * What: Edge body UpsertRaciMatrixCellRequestDto (class-validator) thay Record
 * Why:  Đóng G-DTO-W2-RACI-01 — harden validate tại Nest edge + OpenAPI align
 * SRS:  §3.13 FR-XBOS-RACI-02 Diễn biến #4–#6
 * TechSpec: §14.14 · G-DTO-W2-RACI-01 CLOSED
 * db_design: DB_DESIGN_XBOS_RACI_RBAC.md company_raci_matrix_cell
 * api_design: API_DESIGN Endpoint C
 * must_keep: UF-XBOS-07 merge/scope/clear-empty letters; không đổi resolver
 */
import { Body, Controller, Get, Headers, HttpStatus, Param, Put, Query } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { ok } from '../common/api-response';
import { isAuthorizedInternalRequest } from '../common/internal-auth';
import { resolveScopeContext, resolveTenantOnlyContext } from '../common/scope-context';
import {
  assertJwtMayReadLegalEntityPartition,
  isLegalEntityUuid,
  resolveRaciMatrixJwtScope,
} from '../common/xbos-group-legal-scope';
import { OrgFoundationService } from '../org-foundation/org-foundation.service';
import { UpsertRaciMatrixCellRequestDto } from './dto/upsert-raci-matrix-cell.dto';
import { RaciGovernanceService } from './raci-governance.service';

@Controller('raci-governance')
export class RaciGovernanceController {
  constructor(
    private readonly service: RaciGovernanceService,
    private readonly orgFoundation: OrgFoundationService,
  ) {}

  private assertInternal(authorization?: string, internalApiKey?: string) {
    if (!isAuthorizedInternalRequest(authorization, internalApiKey)) {
      throw new ApiException('XBOS-AUTH-001', 'Unauthorized internal access', HttpStatus.UNAUTHORIZED);
    }
  }

  /** Path `companies/:companyId` may be `main` or legal-entity UUID (member tab). */
  private async resolveCompanyMatrixScope(
    authorization: string | undefined,
    tenantId: string | undefined,
    companyId: string | undefined,
    pathCompanyKey: string,
  ): Promise<{ tenantId: string; companyId: string }> {
    const pathKey = pathCompanyKey.trim();
    if (!isLegalEntityUuid(pathKey)) {
      return resolveScopeContext(authorization, { tenantId, companyId: pathKey });
    }

    const jwtScope = resolveRaciMatrixJwtScope(authorization, { tenantId, companyId });
    const partition = await this.orgFoundation.resolveLegalEntityPartition(pathKey);
    if (!partition) {
      throw new ApiException('XBOS-RACI-404', 'Legal entity not found', HttpStatus.NOT_FOUND);
    }
    assertJwtMayReadLegalEntityPartition(authorization, jwtScope, partition);
    return { tenantId: partition.tenantId, companyId: pathKey };
  }

  @Get('catalog')
  async catalog(
    @Query('domain') domain?: string,
    @Headers('x-tenant-id') tenantId?: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertInternal(authorization, internalApiKey);
    const scope = resolveTenantOnlyContext(authorization, { tenantId });
    return ok(await this.service.listCatalog(scope.tenantId, domain), 'XBOS-RACI-200', 'RACI catalog loaded');
  }

  @Get('companies/:companyId/matrix')
  async matrix(
    @Param('companyId') pathCompanyId: string,
    @Query('domain') domain?: string,
    @Headers('x-tenant-id') tenantId?: string,
    @Headers('x-company-id') headerCompanyId?: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertInternal(authorization, internalApiKey);
    const scope = await this.resolveCompanyMatrixScope(
      authorization,
      tenantId,
      headerCompanyId,
      pathCompanyId,
    );
    return ok(
      await this.service.getCompanyMatrix(scope.tenantId, scope.companyId, domain),
      'XBOS-RACI-200',
      'Company RACI matrix loaded',
    );
  }

  @Get('capabilities')
  async capabilities(
    @Query('activityCode') activityCode?: string,
    @Headers('x-tenant-id') tenantId?: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertInternal(authorization, internalApiKey);
    const scope = resolveTenantOnlyContext(authorization, { tenantId });
    return ok(await this.service.listCapabilities(scope.tenantId, activityCode), 'XBOS-RACI-200', 'Capabilities loaded');
  }

  @Get('companies/:companyId/coverage')
  async coverage(
    @Param('companyId') pathCompanyId: string,
    @Headers('x-tenant-id') tenantId?: string,
    @Headers('x-company-id') headerCompanyId?: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertInternal(authorization, internalApiKey);
    const scope = await this.resolveCompanyMatrixScope(
      authorization,
      tenantId,
      headerCompanyId,
      pathCompanyId,
    );
    return ok(await this.service.getCoverage(scope.tenantId, scope.companyId), 'XBOS-RACI-200', 'Coverage loaded');
  }

  @Put('companies/:companyId/matrix/cell')
  async upsertCell(
    @Param('companyId') pathCompanyId: string,
    @Body() body: UpsertRaciMatrixCellRequestDto,
    @Headers('x-tenant-id') tenantId?: string,
    @Headers('x-company-id') headerCompanyId?: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertInternal(authorization, internalApiKey);
    const scope = await this.resolveCompanyMatrixScope(
      authorization,
      tenantId,
      headerCompanyId,
      pathCompanyId,
    );
    return ok(
      await this.service.upsertMatrixCell(scope.tenantId, scope.companyId, {
        activity_id: body.activity_id,
        org_column_id: body.org_column_id,
        raci_letters: body.raci_letters ?? '',
        actor_id: body.actor_id,
      }),
      'XBOS-RACI-201',
      'Matrix cell saved',
    );
  }
}
