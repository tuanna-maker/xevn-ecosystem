/**
 * @CODE-MEMORY
 * Screen:     Settings > Catalog > Loai nghi (Update) -- UC-LV-02
 * UC:         UC-LV-02 · AC-LV-04
 * BR:         BR-LV-04 (LABOR_LAW code/name immutable) · BR-LV-06 (unpaid -> payRate=0)
 * SRS:        docs/program/deltas/BA_HRM_LEAVE_TYPE_SRS_01_20260815.md §4 FR-LV-03
 * TechSpec:   docs/program/deltas/BA_HRM_LEAVE_TYPE_TECHSPEC_01_20260815.md §3.4 DTOs
 * WorkItem:   BA-HRM-LEAVE-TYPE-TECHSPEC-01
 * Coded:      2026-08-15
 * Purpose:    Update Leave Type DTO with optional fields.
 * SOLID:      DTO SRP -- validation only, no business logic
 */
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class UpdateLeaveTypeDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @Transform(({ value }) => String(value).trim())
  name?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(365)
  defaultDaysPerYear?: number;

  @IsOptional()
  @IsBoolean()
  isPaid?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  payRatePercent?: number;

  @IsOptional()
  @IsIn(['LABOR_LAW', 'INTERNAL'])
  leaveCategory?: 'LABOR_LAW' | 'INTERNAL';

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: 'active' | 'inactive';
}
