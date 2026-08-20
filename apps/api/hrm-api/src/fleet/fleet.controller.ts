/**
 * @CODE-MEMORY
 * Screen:     HRM → Hồ sơ xe (Fleet) — du lịch / ĐV được cấp
 * UC:         FR-HRM-FL-01
 * BR:         BR-FLEET-LIST-SCOPE · Plane B TEXT company_id · U65 empty trung thực · G-FL-02
 * SRS:        docs/client-delivery/hrm/SRS_HRM_KHACH.md §3.49 · FR-HRM-FL-01
 * TechSpec:   docs/hrm/TECHSPEC.md §16.5 · envelope HRM-FLEET-200 (ref_srs: FR-HRM-FL-01)
 * Purpose:    GET danh sách hồ sơ xe theo scope; lọc keyword biển/tên; empty hợp lệ; không public mutate.
 * WorkItem:   BE-HRM-FLEET-KEYWORD-01
 * Coded:      2026-07-27
 *
 * Callers:
 *   - Nest route GET /api/hrm/fleet/vehicles
 *
 * Callees:
 *   - resolveScopeContext → resolveHrmListScope → FleetService.listVehicles → hrm_fleet_vehicles
 *
 * FE-Actions:
 *   | Thao tác        | Handler      | Lib / RPC                                      |
 *   |-----------------|--------------|------------------------------------------------|
 *   | Mở Hồ sơ xe     | listVehicles | GET /fleet/vehicles → HRM-FLEET-200             |
 *   | Tìm biển số/tên | listVehicles | GET …?keyword|q=… (FR-HRM-FL-01 #4)            |
 *
 * BE-Chain:
 *   listVehicles → SELECT hrm_fleet_vehicles WHERE tenant + companyIds IN scope [+ keyword]
 *
 * Impact:     Scope lệch → lộ/che sai xe ĐV; seed để PASS → phá U65
 * must_keep:  FL-01 GET list only · TEXT slug · không mở HTTP upsert · empty 200
 * SOLID:      Controller transport; upsert chỉ service (G-FL-UPSERT residual)
 * LastVerified: fleet.controller.spec.ts · fleet.service.spec.ts · verify-openapi-hrm-p1-s3b
 *
 * @CODE-MEMORY-CHANGE 2026-07-27
 * WorkItem: BE-HRM-OA-IMPORT-FLEET-01
 * change_mode: ADD
 * What: Gắn CODE-MEMORY + OpenAPI F.1 GET /fleet/vehicles (schemas FleetVehicleList)
 * Why: SA residual OpenAPI deepen vs API_DESIGN_HRM_FLEET — list only
 * SRS: §3.49 · FR-HRM-FL-01 Diễn biến #1/#2/#3/#6/#8
 * TechSpec: §16.5 (ref_srs: FR-HRM-FL-01)
 * must_keep: không public write · không invent detail/search DONE
 *
 * @CODE-MEMORY-CHANGE 2026-07-27
 * WorkItem: BE-HRM-FLEET-KEYWORD-01
 * change_mode: ADD
 * What: Query keyword|q → FleetService list filter plate/name (đóng G-FL-02)
 * Why: SRS Diễn biến #4 tìm biển số / tên trong ĐV — API_DESIGN residual P2
 * SRS: §3.49 · FR-HRM-FL-01 #4
 * TechSpec: §16.5 · API_DESIGN_HRM_FLEET §A
 * must_keep: FL-01 list only · no public upsert · U65 · HOLD_DEPLOY
 */
import { Controller, Get, Headers, HttpStatus, Query } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { ok } from '../common/api-response';
import { isAuthorizedInternalRequest } from '../common/internal-auth';
import { resolveHrmListScope } from '../common/hrm-list-scope';
import { resolveScopeContext } from '../common/scope-context';
import { FleetService } from './fleet.service';

@Controller('fleet')
export class FleetController {
  constructor(private readonly fleet: FleetService) {}

  private assertAccess(authorization?: string, internalApiKey?: string) {
    if (!isAuthorizedInternalRequest(authorization, internalApiKey)) {
      throw new ApiException(
        'HRM-AUTH-001',
        'Unauthorized fleet access',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @Get('vehicles')
  listVehicles(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') companyId: string | undefined,
    @Query('company_id') queryCompanyId?: string,
    @Query('status') status?: string,
    @Query('limit') limitRaw?: string,
    @Query('keyword') keyword?: string,
    @Query('q') q?: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, { tenantId, companyId });
    const requestedCompany = (
      queryCompanyId ??
      companyId ??
      scope.companyId
    ).trim();
    const listScope = resolveHrmListScope(authorization, requestedCompany, {
      tenantId: scope.tenantId,
    });
    const limit = limitRaw ? Number(limitRaw) : undefined;
    return this.fleet
      .listVehicles(scope.tenantId, listScope.companyIds, {
        status,
        limit,
        keyword,
        q,
      })
      .then((data) => ok(data, 'HRM-FLEET-200', 'Fleet vehicles listed'));
  }
}
