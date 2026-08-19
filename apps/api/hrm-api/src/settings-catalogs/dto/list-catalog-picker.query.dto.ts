/**
 * @CODE-MEMORY
 * Screen:     HRM Settings — catalog picker query
 * UC:         FR-HRM-SC · picker list
 * Purpose:    Query DTO cho picker danh mục (company/q/active/status).
 * WorkItem:   W1-B-01-BE-DIST-RESTORE
 * Coded:      2026-08-03
 * Callers:    settings-catalogs.controller
 * must_keep:  status ∈ active|draft|all; không đổi master-keys
 * SOLID:      Pure DTO
 * LastVerified: tsc tsconfig.build.json
 *
 * @CODE-MEMORY-CHANGE 2026-08-03
 * WorkItem: W1-B-01-BE-DIST-RESTORE
 * change_mode: ADD
 * What: Restore src from dist list-catalog-picker.query.dto.js/.d.ts
 * Why: TS2307 R-HRM-DIST-MISSING
 * must_keep: R-MASTER-KEYS CLOSED — không đụng hrm-settings-master-keys.ts
 */
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class ListCatalogPickerQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  company_id?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  q?: string;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  active?: string;

  @IsOptional()
  @IsIn(['active', 'draft', 'all'])
  status?: 'active' | 'draft' | 'all';
}
