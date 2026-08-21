/**
 * @CODE-MEMORY
 * Screen:     Settings > Catalog > Loai nghi (Create) -- UC-LV-02
 * UC:         UC-LV-02 · AC-LV-01..03
 * BR:         BR-LV-02 (unique code) · BR-LV-03 (validation) · BR-LV-06 (unpaid -> payRate=0)
 * SRS:        docs/program/deltas/BA_HRM_LEAVE_TYPE_SRS_01_20260815.md §4 FR-LV-03 · §5 Data Model
 * TechSpec:   docs/program/deltas/BA_HRM_LEAVE_TYPE_TECHSPEC_01_20260815.md §3.4 DTOs
 * WorkItem:   BA-HRM-LEAVE-TYPE-TECHSPEC-01
 * Coded:      2026-08-15
 * Purpose:    Create Leave Type DTO with validation per BLĐ 2019 constraints.
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

export class CreateLeaveTypeDto {
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  @Transform(({ value }) => String(value).trim().toUpperCase())
  code!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @Transform(({ value }) => String(value).trim())
  name!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(365)
  defaultDaysPerYear?: number = 0;

  @IsBoolean()
  isPaid!: boolean;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  payRatePercent!: number;

  @IsIn(['LABOR_LAW', 'INTERNAL'])
  leaveCategory!: 'LABOR_LAW' | 'INTERNAL';

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;
}
