import { Transform } from 'class-transformer';
import { IsDateString, IsIn, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class ListAttendanceRecordsQueryDto {
  @IsUUID()
  company_id!: string;

  @IsOptional()
  @IsUUID()
  employee_id?: string;

  @IsOptional()
  @IsIn(['pending', 'present', 'absent', 'leave'])
  status?: 'pending' | 'present' | 'absent' | 'leave';

  @IsOptional()
  @IsDateString()
  from_date?: string;

  @IsOptional()
  @IsDateString()
  to_date?: string;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(100)
  page_size?: number = 20;
}
