import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';

/**
 * F-ATT-LEAVE-BAL-UPSERT-01 — product path cấp quỹ tracked (U65 · không seed script).
 * UC-BP-ATT-09 · BR-BP-LV-06 — row PRESENT trước khi hold numeric AC.
 */
export class UpsertTrackedLeaveBalanceDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsUUID()
  employee_id!: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  leave_type?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  balance_year?: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(0)
  @Max(999)
  entitled_days!: number;
}
