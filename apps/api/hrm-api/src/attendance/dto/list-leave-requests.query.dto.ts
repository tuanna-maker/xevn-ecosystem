import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class ListLeaveRequestsQueryDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  /** Ignored by service (fixed LIMIT 200); accepted for portal/view-completeness probes. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  page_size?: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsUUID()
  employee_id?: string;

  /** Chỉ đơn của cấp dưới trực tiếp (MOB-BE-02). */
  @IsOptional()
  @IsUUID()
  manager_employee_id?: string;
}
