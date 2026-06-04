import { IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class AddPaymentRecordDto {
  @IsString()
  @MaxLength(80)
  company_id!: string;

  @IsOptional()
  @IsUUID()
  payroll_record_id?: string;

  @IsOptional()
  @IsUUID()
  employee_id?: string;

  @IsString()
  @MaxLength(50)
  employee_code!: string;

  @IsString()
  @MaxLength(150)
  employee_name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  department?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  bank_name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  bank_account?: string;

  @IsNumber()
  @Min(0)
  amount!: number;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  notes?: string;
}
