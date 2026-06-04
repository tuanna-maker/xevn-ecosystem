import { IsDateString, IsNumber, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateContractDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsOptional()
  @IsUUID()
  employee_id?: string;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  employee_name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  contract_code?: string;

  @IsString()
  @MaxLength(40)
  contract_type!: string;

  @IsDateString()
  start_date!: string;

  @IsDateString()
  end_date!: string;

  @IsOptional()
  @IsNumber()
  salary?: number;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  notes?: string;
}
