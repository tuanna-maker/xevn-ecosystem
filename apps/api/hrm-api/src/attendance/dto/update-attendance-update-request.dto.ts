import { IsOptional, IsString } from 'class-validator';

export class UpdateAttendanceUpdateRequestDto {
  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @IsString()
  attendance_date?: string;

  @IsOptional()
  @IsString()
  update_type?: string;

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

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  evidence_url?: string;

  @IsOptional()
  @IsString()
  approver_name?: string;
}
