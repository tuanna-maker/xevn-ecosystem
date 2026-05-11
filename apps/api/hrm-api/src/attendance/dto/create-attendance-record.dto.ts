import { IsDateString, IsIn, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateAttendanceRecordDto {
  @IsUUID()
  company_id!: string;

  @IsUUID()
  employee_id!: string;

  @IsDateString()
  attendance_date!: string;

  @IsOptional()
  @IsDateString()
  check_in_at?: string;

  @IsOptional()
  @IsDateString()
  check_out_at?: string;

  @IsOptional()
  @IsIn(['pending', 'present', 'absent', 'leave'])
  status?: 'pending' | 'present' | 'absent' | 'leave';

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  created_by?: string;
}
