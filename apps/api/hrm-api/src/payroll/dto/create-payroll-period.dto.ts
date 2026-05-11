import { IsDateString, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreatePayrollPeriodDto {
  @IsUUID()
  company_id!: string;

  @IsString()
  @MaxLength(100)
  period_label!: string;

  @IsDateString()
  start_date!: string;

  @IsDateString()
  end_date!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  created_by?: string;
}
