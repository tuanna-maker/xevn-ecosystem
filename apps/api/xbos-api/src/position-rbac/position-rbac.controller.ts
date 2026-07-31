/**
 * @CODE-MEMORY
 * Screen:     Settings / Position RBAC + assignments (UF-XBOS-13)
 * UC:         UC-XBOS-11/12 · UC-CC-P0-04 · FR-CC-P0-04
 * BR:         Tenant-only permission matrix; assignment company scope; WF soft assignment_id
 * SRS:        SRS_XBOS_KHACH.md §3.14 FR-CC-P0-04 Diễn biến #1–7
 * TechSpec:   docs/xbos/TECHSPEC.md §14.15 · COMMAND_CENTER_P0_TECHSPEC.md §4
 * db_design:  docs/xbos/DB_DESIGN_XBOS_RACI_RBAC.md — xbos_cc_permission_matrix_cell · xbos_position_assignment
 * api_design: docs/xbos/API_DESIGN_XBOS_RACI_RBAC.md Endpoints E–G
 * Purpose:    Templates/assignments/grants + GET/PUT permission matrix theo roleId —
 *             FE Settings checkbox xem/ghi/xóa/duyệt + dataScope; F5 còn đúng role.
 * WorkItem:   BE-XBOS-OA-DTO-P2-01
 * Coded:      2026-07-27
 *
 * Callers:
 *   - web-portal positionRbacApi.ts → GET/PUT /api/xbos/position-rbac/matrix
 *
 * Callees:
 *   - resolveTenantOnlyContext / resolveScopeContext → PositionRbacService
 *
 * FE-Actions:
 *   | Thao tác | Handler | API |
 *   |----------|---------|-----|
 *   | Mở matrix | fetchPermissionMatrix | GET matrix?roleId= |
 *   | Lưu checkbox | savePermissionMatrix | PUT matrix |
 *
 * BE-Chain:
 *   getPermissionMatrix → xbos_cc_permission_matrix_cell
 *   savePermissionMatrix → upsert ON CONFLICT (tenant, role, row)
 *
 * Impact:     Đổi camelCase row fields / dataScope enum → UF-XBOS-13 FAIL
 * must_keep:  UF-XBOS-13 🟢 · tenant-only matrix · WF soft assignment cite · U65 no seed
 * SOLID:      Controller = transport/auth; Service = persist matrix/assignments
 * LastVerified: position-rbac.controller.spec.ts · save-permission-matrix.dto.spec.ts
 *
 * @CODE-MEMORY-CHANGE 2026-07-27
 * WorkItem: BE-XBOS-OA-DTO-P2-01
 * change_mode: UPGRADE
 * What: SavePermissionMatrixRequestDto + PermissionMatrixRowDto at PUT matrix edge; OpenAPI depth
 * Why:  Đóng G-DTO-W2-POS-01 — schema F.1 vs API_DESIGN E–F
 * SRS:  §3.14 FR-CC-P0-04
 * TechSpec: §14.15 · G-DTO-W2-POS-01 CLOSED
 * db_design: xbos_cc_permission_matrix_cell
 * api_design: API_DESIGN Endpoints E–F
 * must_keep: UF-XBOS-13 runtime flags/partition; không wipe WF/catalog-gov
 */
import { Body, Controller, Get, Headers, HttpStatus, Param, Post, Put, Query } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { ok } from '../common/api-response';
import { isAuthorizedInternalRequest } from '../common/internal-auth';
import { resolveScopeContext, resolveTenantOnlyContext } from '../common/scope-context';
import { SavePermissionMatrixRequestDto } from './dto/save-permission-matrix.dto';
import { PositionRbacService } from './position-rbac.service';

@Controller('position-rbac')
export class PositionRbacController {
  constructor(private readonly service: PositionRbacService) {}

  private assertInternal(authorization?: string, internalApiKey?: string) {
    if (!isAuthorizedInternalRequest(authorization, internalApiKey)) {
      throw new ApiException('XBOS-AUTH-001', 'Unauthorized internal access', HttpStatus.UNAUTHORIZED);
    }
  }

  @Get('templates')
  async listTemplates(@Headers('x-tenant-id') tenantId?: string, @Headers('authorization') authorization?: string, @Headers('x-internal-api-key') internalApiKey?: string) {
    this.assertInternal(authorization, internalApiKey);
    const scope = resolveTenantOnlyContext(authorization, { tenantId });
    return ok({ items: await this.service.listTemplates(scope.tenantId) }, 'XBOS-POS-200', 'Templates loaded');
  }

  @Post('templates')
  async createTemplate(@Body() body: Record<string, unknown>, @Headers('x-tenant-id') tenantId?: string, @Headers('authorization') authorization?: string, @Headers('x-internal-api-key') internalApiKey?: string) {
    this.assertInternal(authorization, internalApiKey);
    const scope = resolveTenantOnlyContext(authorization, { tenantId });
    return ok(await this.service.upsertTemplate(scope.tenantId, null, body), 'XBOS-POS-201', 'Template saved');
  }

  @Put('templates/:templateId')
  async updateTemplate(@Param('templateId') templateId: string, @Body() body: Record<string, unknown>, @Headers('x-tenant-id') tenantId?: string, @Headers('authorization') authorization?: string, @Headers('x-internal-api-key') internalApiKey?: string) {
    this.assertInternal(authorization, internalApiKey);
    const scope = resolveTenantOnlyContext(authorization, { tenantId });
    return ok(await this.service.upsertTemplate(scope.tenantId, templateId, body), 'XBOS-POS-201', 'Template saved');
  }

  @Get('assignments')
  async listAssignments(@Headers('x-tenant-id') tenantId?: string, @Headers('x-company-id') companyId?: string, @Headers('authorization') authorization?: string, @Headers('x-internal-api-key') internalApiKey?: string) {
    this.assertInternal(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, { tenantId, companyId });
    return ok({ items: await this.service.listAssignments(scope.tenantId, scope.companyId) }, 'XBOS-POS-200', 'Assignments loaded');
  }

  @Post('assignments')
  async createAssignment(@Body() body: Record<string, unknown>, @Headers('x-tenant-id') tenantId?: string, @Headers('x-company-id') companyId?: string, @Headers('authorization') authorization?: string, @Headers('x-internal-api-key') internalApiKey?: string) {
    this.assertInternal(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, { tenantId, companyId });
    return ok(await this.service.upsertAssignment(scope.tenantId, scope.companyId, null, body), 'XBOS-POS-201', 'Assignment saved');
  }

  @Get('permissions')
  async listPermissions(@Headers('x-tenant-id') tenantId?: string, @Headers('authorization') authorization?: string, @Headers('x-internal-api-key') internalApiKey?: string) {
    this.assertInternal(authorization, internalApiKey);
    const scope = resolveTenantOnlyContext(authorization, { tenantId });
    return ok({ items: await this.service.listPermissionDefinitions(scope.tenantId) }, 'XBOS-POS-200', 'Permissions loaded');
  }

  @Post('permissions')
  async createPermission(@Body() body: Record<string, unknown>, @Headers('x-tenant-id') tenantId?: string, @Headers('authorization') authorization?: string, @Headers('x-internal-api-key') internalApiKey?: string) {
    this.assertInternal(authorization, internalApiKey);
    const scope = resolveTenantOnlyContext(authorization, { tenantId });
    return ok(await this.service.upsertPermissionDefinition(scope.tenantId, null, body), 'XBOS-POS-201', 'Permission saved');
  }

  @Get('grants/conflicts')
  async conflicts(@Query('permissionId') permissionId: string, @Query('assignmentId') assignmentId: string | undefined, @Headers('x-tenant-id') tenantId?: string, @Headers('x-company-id') companyId?: string, @Headers('authorization') authorization?: string, @Headers('x-internal-api-key') internalApiKey?: string) {
    this.assertInternal(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, { tenantId, companyId });
    const rows = await this.service.checkGrantConflicts(scope.tenantId, scope.companyId, permissionId, assignmentId);
    return ok({ conflicts: rows }, 'XBOS-POS-200', 'Conflict check complete');
  }

  @Post('grants')
  async grant(@Body() body: Record<string, unknown>, @Headers('x-tenant-id') tenantId?: string, @Headers('x-company-id') companyId?: string, @Headers('authorization') authorization?: string, @Headers('x-internal-api-key') internalApiKey?: string) {
    this.assertInternal(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, { tenantId, companyId });
    return ok(await this.service.grantPermission(scope.tenantId, scope.companyId, body), 'XBOS-POS-201', 'Permission granted');
  }

  @Get('matrix')
  async getMatrix(
    @Query('roleId') roleId: string,
    @Headers('x-tenant-id') tenantId?: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertInternal(authorization, internalApiKey);
    const scope = resolveTenantOnlyContext(authorization, { tenantId });
    if (!roleId?.trim()) {
      throw new ApiException('XBOS-POS-400', 'roleId query required', HttpStatus.BAD_REQUEST);
    }
    const rows = await this.service.getPermissionMatrix(scope.tenantId, roleId);
    return ok({ roleId, rows }, 'XBOS-POS-200', 'Permission matrix loaded');
  }

  @Put('matrix')
  async saveMatrix(
    @Body() body: SavePermissionMatrixRequestDto,
    @Headers('x-tenant-id') tenantId?: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertInternal(authorization, internalApiKey);
    const scope = resolveTenantOnlyContext(authorization, { tenantId });
    const rows = (body.rows ?? []).map((r) => ({
      rowId: r.rowId,
      view: Boolean(r.view),
      write: Boolean(r.write),
      delete: Boolean(r.delete),
      approve: Boolean(r.approve),
      dataScope: r.dataScope ?? 'personal',
    }));
    const saved = await this.service.savePermissionMatrix(scope.tenantId, body.roleId, rows);
    return ok({ roleId: body.roleId, rows: saved }, 'XBOS-POS-201', 'Permission matrix saved');
  }

  @Put('job-descriptions/:templateId')
  async upsertJd(@Param('templateId') templateId: string, @Body() body: Record<string, unknown>, @Headers('authorization') authorization?: string, @Headers('x-internal-api-key') internalApiKey?: string) {
    this.assertInternal(authorization, internalApiKey);
    return ok(await this.service.upsertJobDescription(templateId, body), 'XBOS-POS-201', 'Job description saved');
  }
}
