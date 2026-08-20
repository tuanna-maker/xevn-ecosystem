/**
 * @CODE-MEMORY
 * Screen:     Settings > Catalog > Loai nghi (List/Query) -- UC-LV-01
 * UC:         UC-LV-01 · AC-LV-01, AC-LV-06
 * SRS:        docs/program/deltas/BA_HRM_LEAVE_TYPE_SRS_01_20260815.md §4 FR-LV-01, FR-LV-07
 * TechSpec:   docs/program/deltas/BA_HRM_LEAVE_TYPE_TECHSPEC_01_20260815.md §3.4 DTOs
 * WorkItem:   BA-HRM-LEAVE-TYPE-TECHSPEC-01
 * Coded:      2026-08-15
 * Purpose:    Query DTO for paginated leave type listing with search/filter.
 * SOLID:      DTO SRP -- query params only
 */
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class LeaveTypeQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  @Transform(({ value }) => String(value).trim())
  search?: string;

  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: 'active' | 'inactive';

  @IsOptional()
  @IsIn(['LABOR_LAW', 'INTERNAL'])
  category?: 'LABOR_LAW' | 'INTERNAL';
}
