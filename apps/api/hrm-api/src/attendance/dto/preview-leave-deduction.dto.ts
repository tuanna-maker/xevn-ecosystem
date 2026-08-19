/**
 * @CODE-MEMORY
 * Screen:     DTO — F-ATT-LEAVE-01 preview-deduction · F-ATT-HOL-01 thin PUT
 * UC:         UC-BP-ATT-08
 * WorkItem:   PO-HRM-MVP-GD1-ATT-08-CLUSTER-BE-01
 * Coded:      2026-08-09
 * must_keep:  Nest /core DENY · ≠ ATT-09/03b DONE · U65
 *
 * @CODE-MEMORY-CHANGE 2026-08-09
 * WorkItem: PO-HRM-MVP-GD1-ATT-03B-CLUSTER-BE-01
 * change_mode: ADD
 * What: HolidayDayInput + PutHoliday residual lunarFlag/calendarType/isPaid/dayType/status
 * must_keep: Nest /core DENY · ≠ ATT-03b DONE · PAY OUT · DENY att_leave_hold
 */
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class PreviewLeaveDeductionDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  company_id?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  companyId?: string;

  @IsUUID()
  employeeId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  leaveType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  leave_type?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  leaveTypeId?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  start_date?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsString()
  end_date?: string;

  @IsOptional()
  @IsBoolean()
  halfDay?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  hours?: number;
}

export class HolidayDayInputDto {
  @IsString()
  date!: string;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  nameVi?: string;

  /** Residual R-ATT-03B-LUNAR — BR-BP-HOL-01 · ≠ solar-hardcode-only DONE. */
  @IsOptional()
  @IsBoolean()
  lunarFlag?: boolean;

  @IsOptional()
  @IsString()
  @IsIn(['solar', 'lunar', 'duong', 'am', 'dương', 'âm'])
  calendarType?: string;

  /** Residual R-ATT-03B-TYPE — ≠ invent PAY DONE from is_paid alone. */
  @IsOptional()
  @IsBoolean()
  isPaid?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  dayType?: string;
}

export class PutHolidayCalendarDto {
  @IsString()
  @MaxLength(64)
  companyId!: string;

  /** Residual R-ATT-03B-PUB — draft|effective XOR replace-in-place GĐ1. */
  @IsOptional()
  @IsString()
  @IsIn(['draft', 'effective', 'published', 'nhap', 'nháp', 'phat_hanh'])
  status?: string;

  @IsOptional()
  @IsString()
  @IsIn(['solar', 'lunar', 'duong', 'am', 'dương', 'âm'])
  calendarType?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HolidayDayInputDto)
  days?: HolidayDayInputDto[];
}

export class GetHolidayCalendarQueryDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;
}
