/**
 * @CODE-MEMORY
 * Screen:     Command Center / Org — tab Nhiệm vụ và RACI (UF-XBOS-07)
 * UC:         UC-RACI-02 · FR-XBOS-RACI-02
 * BR:         Wire raci_letters ∈ ^[RACI]*$; empty = clear override
 * SRS:        SRS_XBOS_KHACH.md §3.13 FR-XBOS-RACI-02 Diễn biến #4–#6
 * TechSpec:   docs/xbos/TECHSPEC.md §14.14 · G-DTO-W2-RACI-01
 * db_design:  docs/xbos/DB_DESIGN_XBOS_RACI_RBAC.md — company_raci_matrix_cell
 * api_design: docs/xbos/API_DESIGN_XBOS_RACI_RBAC.md Endpoint C
 * Purpose:    Class-validator edge DTO cho PUT …/matrix/cell — whitelist snake_case;
 *             chuẩn hóa letters (trim/upper) trước Matches để khớp service.
 * WorkItem:   BE-XBOS-OA-DTO-P2-01
 * Coded:      2026-07-27
 * Callers:    RaciGovernanceController.upsertCell
 * Callees:    ValidationPipe → RaciGovernanceService.upsertMatrixCell
 * FE-Actions: | Lưu ô / xóa ô | CompanyRaciPanel | PUT matrix/cell |
 * BE-Chain:   DTO validate → scope resolver → upsert cell + audit
 * Impact:     Sai pattern/required → 400 trước service; đổi field name → FE UF-07 FAIL
 * must_keep:  UF-XBOS-07 🟢 · empty letters clear · snake_case activity_id/org_column_id
 * SOLID:      DTO = transport validation; Service = persist/merge
 * LastVerified: upsert-raci-matrix-cell.dto.spec.ts
 */
import { Transform } from 'class-transformer';
import { IsOptional, IsString, Matches, MinLength } from 'class-validator';

/** Nest edge body for PUT /raci-governance/companies/:companyId/matrix/cell (OpenAPI UpsertRaciMatrixCellRequest). */
export class UpsertRaciMatrixCellRequestDto {
  @IsString()
  @MinLength(1)
  activity_id!: string;

  @IsString()
  @MinLength(1)
  org_column_id!: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined;
    return String(value).trim().replace(/\s+/g, '').toUpperCase();
  })
  @IsString()
  @Matches(/^[RACI]*$/)
  raci_letters?: string;

  @IsOptional()
  @IsString()
  actor_id?: string;
}
