import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateShiftChangeRequestDto {
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
  change_date!: string;

  @IsString()
  change_type!: string;

  @IsString()
  current_shift!: string;

  @IsOptional()
  @IsString()
  current_shift_time?: string;

  @IsString()
  requested_shift!: string;

  @IsOptional()
  @IsString()
  requested_shift_time?: string;

  @IsOptional()
  @IsUUID()
  swap_with_employee_id?: string;

  @IsOptional()
  @IsString()
  swap_with_employee_name?: string;

  @IsOptional()
  @IsString()
  swap_with_employee_code?: string;

  @IsString()
  reason!: string;

  @IsOptional()
  @IsString()
  approver_name?: string;
}
