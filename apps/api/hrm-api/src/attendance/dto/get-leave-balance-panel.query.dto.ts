import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';

/**
 * UC-BP-ATT-05b — panel quỹ phép (một request / NV, tránh spinner storm 5× GET).
 */
export class GetLeaveBalancePanelQueryDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsUUID()
  employee_id!: string;

  /** Năm lịch (Asia/Ho_Chi_Minh) — không hardcode tháng FY (ATT-04 CRUD tenant). */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  year?: number;
}
