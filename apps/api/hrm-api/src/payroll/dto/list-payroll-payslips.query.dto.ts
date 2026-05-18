import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class ListPayrollPayslipsQueryDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsOptional()
  @IsUUID()
  period_id?: string;
}
