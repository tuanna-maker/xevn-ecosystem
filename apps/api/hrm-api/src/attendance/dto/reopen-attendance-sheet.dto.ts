import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ReopenAttendanceSheetDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  reopen_reason?: string;
}
