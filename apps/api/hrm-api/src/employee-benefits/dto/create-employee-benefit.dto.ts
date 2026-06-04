import { IsIn, IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class CreateEmployeeBenefitDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsUUID()
  employee_id!: string;

  @IsString()
  @MaxLength(256)
  name!: string;

  @IsOptional()
  @IsIn(['allowance', 'bonus', 'leave', 'health', 'education', 'other'])
  category?: string;

  @IsNumber()
  @Min(0)
  value!: number;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  unit?: string;

  @IsOptional()
  @IsIn(['monthly', 'quarterly', 'yearly', 'one-time'])
  frequency?: string;

  @IsOptional()
  @IsString()
  start_date?: string;

  @IsOptional()
  @IsString()
  end_date?: string;

  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
