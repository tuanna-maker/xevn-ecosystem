import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateLeaveRequestDto {
  @IsUUID()
  company_id!: string;

  @IsUUID()
  employee_id!: string;

  @IsString()
  employee_code!: string;

  @IsString()
  employee_name!: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  position?: string;

  @IsString()
  leave_type!: string;

  @IsString()
  start_date!: string;

  @IsString()
  end_date!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0.5)
  total_days!: number;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  handover_to?: string;

  @IsOptional()
  @IsString()
  handover_tasks?: string;
}
