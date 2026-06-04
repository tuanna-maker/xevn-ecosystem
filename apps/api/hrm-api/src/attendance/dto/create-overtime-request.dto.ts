import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class CreateOvertimeRequestDto {
  @IsString()
  @MaxLength(64)
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
  overtime_date!: string;

  @IsString()
  start_time!: string;

  @IsString()
  end_time!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  total_hours!: number;

  @IsString()
  overtime_type!: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  coefficient?: number;

  @IsString()
  reason!: string;

  @IsOptional()
  @IsString()
  compensation_type?: string;

  @IsOptional()
  @IsString()
  approver_name?: string;
}
