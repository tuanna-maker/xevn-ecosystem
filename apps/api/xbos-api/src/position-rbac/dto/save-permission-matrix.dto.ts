/**
 * @CODE-MEMORY
 * Screen:     Settings / Position RBAC matrix (UF-XBOS-13)
 * UC:         UC-CC-P0-04 · FR-CC-P0-04
 * BR:         Save checkbox flags + dataScope per roleId; skip empty rowId
 * SRS:        SRS_XBOS_KHACH.md §3.14 FR-CC-P0-04 Diễn biến #4–#7
 * TechSpec:   docs/xbos/TECHSPEC.md §14.15 · G-DTO-W2-POS-01
 * db_design:  docs/xbos/DB_DESIGN_XBOS_RACI_RBAC.md — xbos_cc_permission_matrix_cell
 * api_design: docs/xbos/API_DESIGN_XBOS_RACI_RBAC.md Endpoints E–F
 * Purpose:    Class-validator edge DTO cho PUT /position-rbac/matrix — camelCase
 *             khớp FE PermissionMatrixCell; dataScope enum FE.
 * WorkItem:   BE-XBOS-OA-DTO-P2-01
 * Coded:      2026-07-27
 * Callers:    PositionRbacController.saveMatrix
 * Callees:    ValidationPipe → PositionRbacService.savePermissionMatrix
 * FE-Actions: | Lưu ma trận | Settings RBAC | PUT matrix |
 * BE-Chain:   DTO → upsert cells ON CONFLICT role partition
 * Impact:     Sai enum/required → 400; đổi camelCase → UF-13 FAIL
 * must_keep:  UF-XBOS-13 🟢 · tenant-only scope · không ghi nhầm role khác
 * SOLID:      DTO = wire shape; Service = persist
 * LastVerified: save-permission-matrix.dto.spec.ts
 */
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';

export const PERMISSION_DATA_SCOPES = ['personal', 'department', 'legal_entity', 'group'] as const;
export type PermissionDataScope = (typeof PERMISSION_DATA_SCOPES)[number];

/** OpenAPI PermissionMatrixRow — one checkbox row (empty rowId skipped in service). */
export class PermissionMatrixRowDto {
  @IsString()
  rowId!: string;

  @IsOptional()
  @IsBoolean()
  view?: boolean;

  @IsOptional()
  @IsBoolean()
  write?: boolean;

  @IsOptional()
  @IsBoolean()
  delete?: boolean;

  @IsOptional()
  @IsBoolean()
  approve?: boolean;

  @IsOptional()
  @IsString()
  @IsIn([...PERMISSION_DATA_SCOPES])
  dataScope?: PermissionDataScope;
}

/** OpenAPI SavePermissionMatrixRequest. */
export class SavePermissionMatrixRequestDto {
  @IsString()
  @MinLength(1)
  roleId!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PermissionMatrixRowDto)
  rows!: PermissionMatrixRowDto[];
}
