import {
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateInsurancePolicyDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsString()
  @MaxLength(64)
  policy_code!: string;

  @IsString()
  @MaxLength(255)
  policy_name!: string;

  @IsString()
  @MaxLength(64)
  insurer_key!: string;

  @IsString()
  @MaxLength(64)
  insurance_type!: string;

  @IsDateString()
  effective_date!: string;

  @IsOptional()
  @IsDateString()
  expiry_date?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  @IsOptional()
  @IsIn(['draft', 'active', 'expired', 'cancelled'])
  status?: 'draft' | 'active' | 'expired' | 'cancelled';

  @IsOptional()
  @IsString()
  @MaxLength(255)
  created_by?: string;
}
