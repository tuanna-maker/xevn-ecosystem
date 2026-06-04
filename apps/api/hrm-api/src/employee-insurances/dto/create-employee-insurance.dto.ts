import { IsIn, IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class CreateEmployeeInsuranceDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsUUID()
  employee_id!: string;

  @IsOptional()
  @IsIn(['social', 'health', 'unemployment', 'accident', 'life'])
  type?: string;

  @IsString()
  @MaxLength(256)
  provider!: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  policy_number?: string;

  @IsOptional()
  @IsString()
  start_date?: string;

  @IsOptional()
  @IsString()
  end_date?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  contribution?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  employer_contribution?: number;

  @IsOptional()
  @IsIn(['active', 'expired', 'pending'])
  status?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
