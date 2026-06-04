import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateAttendanceUpdateRequestDto {
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
  attendance_date!: string;

  @IsString()
  update_type!: string;

  @IsOptional()
  @IsString()
  current_check_in?: string;

  @IsOptional()
  @IsString()
  current_check_out?: string;

  @IsOptional()
  @IsString()
  requested_check_in?: string;

  @IsOptional()
  @IsString()
  requested_check_out?: string;

  @IsString()
  reason!: string;

  @IsOptional()
  @IsString()
  evidence_url?: string;

  @IsOptional()
  @IsString()
  approver_name?: string;
}
