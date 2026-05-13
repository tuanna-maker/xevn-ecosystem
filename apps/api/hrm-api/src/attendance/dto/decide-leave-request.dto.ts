import { IsOptional, IsString, IsUUID } from 'class-validator';

export class DecideLeaveRequestDto {
  @IsOptional()
  @IsUUID()
  reviewer_employee_id?: string;

  @IsString()
  reviewer_name!: string;

  @IsOptional()
  @IsString()
  rejected_reason?: string;
}
