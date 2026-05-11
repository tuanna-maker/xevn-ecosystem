import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateAttendanceStatusDto {
  @IsIn(['pending', 'present', 'absent', 'leave'])
  status!: 'pending' | 'present' | 'absent' | 'leave';

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  updated_by?: string;
}
