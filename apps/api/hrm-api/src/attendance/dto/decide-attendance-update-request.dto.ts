import { IsOptional, IsString } from 'class-validator';

export class DecideAttendanceUpdateRequestDto {
  @IsOptional()
  @IsString()
  approver_name?: string;

  @IsOptional()
  @IsString()
  rejected_reason?: string;
}
