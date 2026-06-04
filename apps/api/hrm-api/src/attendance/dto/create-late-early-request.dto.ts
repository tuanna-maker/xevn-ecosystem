import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class CreateLateEarlyRequestDto {
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
  request_date!: string;

  @IsString()
  request_type!: string;

  @IsOptional()
  @IsString()
  late_time?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  late_minutes?: number;

  @IsOptional()
  @IsString()
  early_time?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  early_minutes?: number;

  @IsString()
  reason!: string;

  @IsOptional()
  @IsString()
  approver_name?: string;
}
